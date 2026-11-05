"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { getBilling } from "@/lib/billing";
import { isServedCountry } from "@/lib/call-engine/test-call-limit";
import {
  getOnboardingProfile,
  saveOnboardingConfig,
  updateOnboardingConfig,
} from "@/lib/dashboard/onboarding-profile";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import { parsePdfMarkdown } from "@/lib/knowledge/pdf";
import { MAX_SOURCE_CHARS, MAX_SOURCES, noteTitle, type KnowledgeSource } from "@/lib/knowledge/sources";
import { summarizeSourceMarkdown } from "@/lib/dashboard/ai-knowledge";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { loginHomePath } from "@/lib/i18n/marketing/login-redirect";
import { normalizePhone } from "@/lib/phone";
import { normalizeWebsite } from "@/lib/onboarding/website";
import { createClient } from "@/lib/supabase/server";
import { ONB_STEP_COOKIE } from "./progress";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v.trim() : "");

// A session whose user no longer exists in auth.users (deleted/recreated, or a
// project reset) fails every onboarding write with the user_id foreign key.
// Postgres reports SQLSTATE 23503 on the ...user_id_fkey constraint.
function isStaleSessionError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  return !!e && (e.code === "23503" || !!e.message?.includes("user_id_fkey"));
}

// Clear the dead session and bounce to sign-in; a fresh login mints a valid
// user id so the funnel can persist. redirect() throws, so this never returns.
async function reauth(): Promise<never> {
  try {
    await (await createClient()).auth.signOut({ scope: "local" });
  } catch {
    // Best effort - the login page still lets them re-authenticate.
  }
  redirect(`${loginHomePath({ cookieLocale: await getLocale() })}?auth=login&next=${encodeURIComponent("/onboarding")}`);
}

function toStep(step: number | string, error?: string): never {
  const query = error ? `?step=${step}&error=${encodeURIComponent(error)}` : `?step=${step}`;
  // next.config.ts keeps dynamic pages in the client Router Cache for 30s, so a
  // redirect to the same URL (Knowledge add/remove) would show the old step.
  revalidatePath("/onboarding");
  redirect(`/onboarding${query}`);
}

// Funnel gating: a caller must not URL-jump past a step they haven't finished.
// Signed-in users are gated by their saved config; guests (nothing persists)
// are gated by this cookie, which records the furthest step unlocked by
// actually completing the one before it. page.tsx never opens a step above it.
async function unlockStep(step: number): Promise<void> {
  const store = await cookies();
  const current = Number(store.get(ONB_STEP_COOKIE)?.value) || 1;
  if (step > current) {
    store.set(ONB_STEP_COOKIE, String(step), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

async function t() {
  return (await getDictionary()).onboarding;
}

export async function saveBasicsAction(formData: FormData): Promise<void> {
  const companyName = str(formData.get("company_name"));
  const companyWebsite = str(formData.get("company_website"));
  const assistantName = str(formData.get("assistant_name"));
  const voiceId = str(formData.get("voice_id"));
  const voiceGender: "f" | "m" = str(formData.get("voice_gender")) === "m" ? "m" : "f";
  const country = str(formData.get("country")).toUpperCase();
  const alertsEmail = str(formData.get("alerts_email"));
  const alertPhone = str(formData.get("alert_phone")).replace(/[\s().-]/g, "");

  const phoneOk = !alertPhone || normalizePhone(alertPhone) !== null;
  const emailOk = !alertsEmail || EMAIL_RE.test(alertsEmail);
  const websiteOk = normalizeWebsite(companyWebsite) !== null;

  // Persist BEFORE validating so a validation error never wipes the form -
  // the step re-renders every field from the saved config. The provisioner
  // re-validates and ignores an invalid phone, email or website, so a draft with a bad
  // value can never drive transfers or alerts.
  const userId = await currentUserId();
  if (userId) {
    try {
      await saveOnboardingConfig(
        userId,
        {
          // May be empty when the caller gave only a website - the provisioner
          // derives a company name from the site's domain in that case.
          companyName,
          assistantName: assistantName || "Receptionist",
          voiceId,
          voiceGender,
          // An unserved code is dropped (the key stays unset), as a bad format is.
          ...(isServedCountry(country) ? { country } : {}),
          alertsEmail,
          alertPhone,
          companyWebsite,
        },
        1,
      );
    } catch (err) {
      if (isStaleSessionError(err)) await reauth();
      console.error("[onboarding] save failed", err);
      toStep(1, "save_failed");
    }
    // The website is intentionally NOT scraped here. It's read after payment,
    // inside the provisioning loading screen (lib/dashboard/provision.ts), so
    // the funnel stays instant and the whole setup happens in one place.
  }

  if (!websiteOk || !phoneOk || !emailOk) {
    // Codes, not text: the page maps them to the visitor's language.
    toStep(1, !websiteOk ? "website" : !phoneOk ? "phone" : "email");
  }
  await unlockStep(2);
  toStep(2);
}

async function appendSource(userId: string, source: KnowledgeSource): Promise<void> {
  // Compare-and-swap, so a PDF and a note added at once (or two tabs) both stay.
  await updateOnboardingConfig(
    userId,
    (config) => ({ ...config, sources: [...(config.sources ?? []), source].slice(-MAX_SOURCES) }),
    2,
  );
}

export async function importPdfAction(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) toStep(2);
  if (file.type && file.type !== "application/pdf") toStep(2, "not_pdf");
  const userId = await currentUserId();
  if (!userId) toStep(2);

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await parsePdfMarkdown(bytes);
    const title = file.name.replace(/\.pdf$/i, "") || "Document";
    const summary = await summarizeSourceMarkdown(title, pdf.markdown).catch(() => null);
    await appendSource(userId, {
      id: randomUUID(),
      kind: "pdf",
      title,
      markdown: pdf.markdown,
      charCount: pdf.charCount,
      addedAt: new Date().toISOString(),
      ...(summary ? { summary } : {}),
    });
  } catch {
    toStep(2, "pdf_failed");
  }
  toStep(2);
}

export async function importTextAction(formData: FormData): Promise<void> {
  const text = str(formData.get("text"));
  if (!text) toStep(2);
  const userId = await currentUserId();
  if (!userId) toStep(2);

  try {
    const markdown = text.slice(0, MAX_SOURCE_CHARS);
    const title = noteTitle(markdown, (await t()).ownKnowledgeTitle);
    const summary = await summarizeSourceMarkdown(title, markdown).catch(() => null);
    await appendSource(userId, {
      id: randomUUID(),
      kind: "text",
      title,
      markdown,
      charCount: markdown.length,
      addedAt: new Date().toISOString(),
      ...(summary ? { summary } : {}),
    });
  } catch {
    toStep(2, "save_failed");
  }
  toStep(2);
}

export async function removeSourceAction(formData: FormData): Promise<void> {
  const id = str(formData.get("id"));
  const userId = await currentUserId();
  if (userId && id) {
    await updateOnboardingConfig(userId, (config) => ({
      ...config,
      sources: (config.sources ?? []).filter((s) => s.id !== id),
    })).catch(() => {});
  }
  toStep(2);
}

// Persist the number country chosen on the plan step. Called from the client on
// change so the choice sticks across a return trip (or a webhook that fires
// before checkout re-persists it). Best-effort, no redirect - checkout writes
// the authoritative value right before payment.
export async function setNumberCountryAction(country: string): Promise<void> {
  const userId = await currentUserId();
  const c = country.trim().toUpperCase();
  if (userId && isServedCountry(c)) {
    await saveOnboardingConfig(userId, { country: c }).catch(() => {});
  }
}

export async function knowledgeContinueAction(): Promise<void> {
  const userId = await currentUserId();
  if (userId) await saveOnboardingConfig(userId, { knowledgeDone: true }, 2).catch(() => {});
  await unlockStep(3);
  toStep(3);
}

export async function calendarContinueAction(): Promise<void> {
  const userId = await currentUserId();
  if (userId) await saveOnboardingConfig(userId, { calendarDone: true }, 3).catch(() => {});
  await unlockStep(4);
  toStep("plan");
}

export interface ProvisionPoll {
  status:
    | "guest"
    | "nothing"
    | "waiting-payment"
    | "provisioning"
    | "done"
    | "error";
  e164?: string;
}

// Called by the provisioning screen. The Stripe webhook normally starts the
// provisioner; this is the fallback (local dev, webhook lag, error retry) and
// doubles as the poll target. It only provisions once payment has landed.
export async function ensureProvisioningAction(): Promise<ProvisionPoll> {
  const userId = await currentUserId();
  if (!userId) return { status: "guest" };

  const profile = await getOnboardingProfile(userId);
  if (!profile) return { status: "nothing" };
  if (profile.status === "done") return { status: "done", e164: profile.result.e164 };
  if (profile.status === "provisioning") return { status: "provisioning" };

  const billing = await getBilling(userId).catch(() => null);
  const paid = billing?.status === "active" || billing?.status === "trialing";
  if (!paid) return { status: "waiting-payment" };

  const outcome = await provisionOnboarding(userId);
  if (outcome.status === "nothing") return { status: "nothing" };
  return { status: outcome.status, e164: outcome.e164 };
}
