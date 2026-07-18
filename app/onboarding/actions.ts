"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { getBilling } from "@/lib/billing";
import {
  getOnboardingProfile,
  saveOnboardingConfig,
} from "@/lib/dashboard/onboarding-profile";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import { fetchWebsiteMarkdown } from "@/lib/knowledge/website";
import { parsePdfMarkdown } from "@/lib/knowledge/pdf";
import { MAX_SOURCE_CHARS, MAX_SOURCES, type KnowledgeSource } from "@/lib/knowledge/sources";
import { summarizeSourceMarkdown } from "@/lib/dashboard/ai-knowledge";
import { getDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { ONB_STEP_COOKIE } from "./progress";

const PHONE_RE = /^\+[1-9]\d{6,15}$/;
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
  redirect(`/?auth=login&next=${encodeURIComponent("/onboarding")}`);
}

function toStep(step: number | string, error?: string): never {
  const query = error ? `?step=${step}&error=${encodeURIComponent(error)}` : `?step=${step}`;
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
  const assistantName = str(formData.get("assistant_name"));
  const voiceId = str(formData.get("voice_id"));
  const voiceGender: "f" | "m" = str(formData.get("voice_gender")) === "m" ? "m" : "f";
  const country = str(formData.get("country")).toUpperCase();
  const alertsEmail = str(formData.get("alerts_email"));
  const alertPhone = str(formData.get("alert_phone")).replace(/[\s().-]/g, "");

  const phoneOk = !alertPhone || PHONE_RE.test(alertPhone);
  const emailOk = !alertsEmail || EMAIL_RE.test(alertsEmail);

  // Persist BEFORE validating so a validation error never wipes the form -
  // the step re-renders every field from the saved config. The provisioner
  // re-validates and ignores an invalid phone/email, so a draft with a bad
  // value can never drive transfers or alerts.
  const userId = await currentUserId();
  if (userId) {
    try {
      await saveOnboardingConfig(
        userId,
        {
          companyName: companyName || "My company",
          assistantName: assistantName || "Receptionist",
          voiceId,
          voiceGender,
          country,
          alertsEmail,
          alertPhone,
        },
        1,
      );
    } catch (err) {
      if (isStaleSessionError(err)) await reauth();
      toStep(1, (err as Error).message);
    }
  }

  if (!phoneOk || !emailOk) {
    const dict = await t();
    toStep(1, !phoneOk ? dict.invalidPhone : dict.invalidEmail);
  }
  await unlockStep(2);
  toStep(2);
}

async function appendSource(userId: string, source: KnowledgeSource): Promise<void> {
  const profile = await getOnboardingProfile(userId);
  const sources = [...(profile?.config.sources ?? []), source].slice(-MAX_SOURCES);
  await saveOnboardingConfig(userId, { sources }, 2);
}

export async function importUrlAction(formData: FormData): Promise<void> {
  const url = str(formData.get("url"));
  if (!url) toStep(2);
  const userId = await currentUserId();
  if (!userId) toStep(2);

  try {
    const site = await fetchWebsiteMarkdown(url);
    const summary = await summarizeSourceMarkdown(site.title, site.markdown).catch(() => null);
    await appendSource(userId, {
      id: randomUUID(),
      kind: "website",
      title: site.title,
      url,
      markdown: site.markdown,
      charCount: site.charCount,
      addedAt: new Date().toISOString(),
      ...(summary ? { summary } : {}),
    });
  } catch (err) {
    toStep(2, (err as Error).message);
  }
  toStep(2);
}

export async function importPdfAction(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) toStep(2);
  if (file.type && file.type !== "application/pdf") toStep(2, "Please upload a PDF file.");
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
  } catch (err) {
    toStep(2, (err as Error).message);
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
    const firstLine = markdown.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
    const title = firstLine ? firstLine.slice(0, 50) : (await t()).ownKnowledgeTitle;
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
  } catch (err) {
    toStep(2, (err as Error).message);
  }
  toStep(2);
}

export async function removeSourceAction(formData: FormData): Promise<void> {
  const id = str(formData.get("id"));
  const userId = await currentUserId();
  if (userId && id) {
    const profile = await getOnboardingProfile(userId);
    const sources = (profile?.config.sources ?? []).filter((s) => s.id !== id);
    await saveOnboardingConfig(userId, { sources }).catch(() => {});
  }
  toStep(2);
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
  error?: string;
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
  return { status: outcome.status, e164: outcome.e164, error: outcome.error };
}
