import { randomUUID } from "node:crypto";

import { getBilling } from "@/lib/billing";
import { listAssistants, listIntegrations } from "@/lib/dashboard/db";
import {
  getOnboardingProfile,
  provisionLeaseExpired,
  saveOnboardingConfig,
  updateOnboardingConfig,
} from "@/lib/dashboard/onboarding-profile";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import { summarizeSourceMarkdown } from "@/lib/dashboard/ai-knowledge";
import { MAX_SOURCE_CHARS, MAX_SOURCES, noteTitle } from "@/lib/knowledge/sources";
import { NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { mobilePlans, planTerms } from "@/lib/mobile/plans";
import { mobileAuth } from "@/lib/mobile/auth";
import { normalizePhone } from "@/lib/phone";
import { normalizeWebsite } from "@/lib/onboarding/website";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The setup funnel, for the app.
 *
 * The web funnel is four pages plus a cookie that gates URL-jumping. None of
 * that carries over: a native stack cannot be deep-linked past a step, so the
 * gate is simply which step the app is allowed to render, computed here from
 * the saved config exactly the way `page.tsx` computes `firstIncomplete`.
 *
 * PDF import is not offered (see the knowledge route for why); typed notes are.
 *
 * Payment is an in-app purchase (App Store on iOS, Google Play via RevenueCat
 * on Android), verified server-side by /api/mobile/billing/apple/verify and
 * /api/mobile/billing/google/sync, which write user_billing and start
 * provisioning. `paid` here is the same active/trialing read the web uses, so
 * the funnel treats a store subscription exactly like a Stripe one.
 *
 * `done` mirrors the web dashboard's rule (app/(main)/dashboard/page.tsx): a
 * user is sent to onboarding only when they own no assistants and the profile
 * is not done. A web customer with assistants and an abandoned draft must not
 * be pushed through the funnel again - that path once created a second
 * organization, assistant and number.
 */

function firstIncompleteStep(cfg: Record<string, unknown>): number {
  const website = typeof cfg.companyWebsite === "string" ? normalizeWebsite(cfg.companyWebsite) : null;
  if (!((cfg.companyName || website) && cfg.assistantName)) return 1;
  if (!cfg.knowledgeDone) return 2;
  if (!cfg.calendarDone) return 3;
  return 4;
}

export async function GET(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "onboarding");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  // Assistants are read strictly: an empty list on a failed read would tell an
  // existing customer's app to run the setup funnel again.
  let profile, billing, integrations, assistants;
  try {
    [profile, billing, integrations, assistants] = await Promise.all([
      getOnboardingProfile(userId),
      getBilling(userId).catch(() => null),
      listIntegrations(userId).catch(() => []),
      listAssistants(userId),
    ]);
  } catch (err) {
    console.error("[mobile:onboarding]", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }

  const cfg = (profile?.config ?? {}) as Record<string, unknown>;
  const paid = billing?.status === "active" || billing?.status === "trialing";
  const step = firstIncompleteStep(cfg);
  const status = profile?.status ?? "draft";
  const hasAssistants = assistants.length > 0;

  return Response.json({
    status,
    // The app opens this step and no later one - the native equivalent of the
    // funnel's URL gate.
    step,
    paid,
    // A run in flight is still shown as provisioning even for an account with
    // assistants (it may be this very run's).
    done: status === "done" || (hasAssistants && status !== "provisioning"),
    hasAssistants,
    // Includes `sandbox: true` when the assistant was deployed on a store
    // sandbox purchase and therefore has no live number.
    result: profile?.result ?? null,
    config: {
      companyName: (cfg.companyName as string) ?? "",
      companyWebsite: (cfg.companyWebsite as string) ?? "",
      assistantName: (cfg.assistantName as string) ?? "",
      voiceId: (cfg.voiceId as string) ?? "",
      voiceGender: cfg.voiceGender === "m" ? "m" : "f",
      // Empty until the user picks one: the app must be able to tell "not
      // chosen yet" from "US", which a default here would hide.
      country: (cfg.country as string) ?? "",
      alertsEmail: (cfg.alertsEmail as string) ?? "",
      alertPhone: (cfg.alertPhone as string) ?? "",
      knowledgeDone: Boolean(cfg.knowledgeDone),
      calendarDone: Boolean(cfg.calendarDone),
      sources: (Array.isArray(cfg.sources) ? cfg.sources : []).map((s) => {
        const src = s as Record<string, unknown>;
        return {
          id: String(src.id ?? ""),
          kind: String(src.kind ?? "text"),
          title: String(src.title ?? ""),
          summary: String(src.summary ?? ""),
        };
      }),
    },
    calendarsConnected: integrations.filter((i) => i.type === "calendar" && i.enabled).length,
    countries: NUMBER_COUNTRIES.map((c) => ({ code: c.code, name: c.name, flag: c.flag })),
    // Same shape the public /api/mobile/catalog route serves, so the funnel's
    // plan step and the standalone pricing screen cannot disagree on a price.
    plans: mobilePlans(),
    planTerms: planTerms(),
  });
}

interface PostBody {
  action?: unknown;
  companyName?: unknown;
  companyWebsite?: unknown;
  assistantName?: unknown;
  voiceId?: unknown;
  voiceGender?: unknown;
  country?: unknown;
  alertsEmail?: unknown;
  alertPhone?: unknown;
  text?: unknown;
  id?: unknown;
}

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "onboarding-submit");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const action = str(body.action);

  try {
    if (action === "basics") {
      const alertPhone = str(body.alertPhone).replace(/[\s().-]/g, "");
      const alertsEmail = str(body.alertsEmail);

      // The website is checked BEFORE the write, unlike the phone and email
      // below: the app runs the same rule first (lib/website.ts there) and
      // keeps its own form, so this 400 wipes nothing. Words saved as a
      // website would pass step 1 and name the business after them.
      const companyWebsite = normalizeWebsite(str(body.companyWebsite));
      if (companyWebsite === null) {
        return Response.json(
          { error: "Enter a website like example.com, or leave it empty.", code: "invalid_website" },
          { status: 400 },
        );
      }

      // Persist BEFORE validating, exactly like the web action: a validation
      // error must never wipe what the user already typed. The provisioner
      // re-validates and ignores a bad phone/email, so a draft holding one can
      // never drive transfers or alerts.
      await saveOnboardingConfig(
        userId,
        {
          // May be blank when only a website was given - the provisioner derives
          // a company name from the site's domain in that case.
          companyName: str(body.companyName),
          assistantName: str(body.assistantName) || "Receptionist",
          voiceId: str(body.voiceId),
          voiceGender: str(body.voiceGender) === "m" ? "m" : "f",
          country: str(body.country).toUpperCase(),
          alertsEmail,
          alertPhone,
          companyWebsite,
        },
        1,
      );

      if (alertPhone && !normalizePhone(alertPhone)) {
        return Response.json(
          { error: "Enter the alert number with its country code, starting with +.", code: "invalid_phone" },
          { status: 400 },
        );
      }
      if (alertsEmail && !EMAIL_RE.test(alertsEmail)) {
        return Response.json({ error: "That email does not look right." }, { status: 400 });
      }
      return Response.json({ ok: true, step: 2 });
    }

    if (action === "add-text") {
      const markdown = str(body.text).slice(0, MAX_SOURCE_CHARS);
      if (!markdown) return Response.json({ error: "Type something first." }, { status: 400 });
      const title = noteTitle(markdown, "What I told it");
      const summary = await summarizeSourceMarkdown(title, markdown).catch(() => null);
      const source = {
        id: randomUUID(),
        kind: "text" as const,
        title,
        markdown,
        charCount: markdown.length,
        addedAt: new Date().toISOString(),
        ...(summary ? { summary } : {}),
      };
      // Compare-and-swap, so an add from the app and one from a web tab both stay.
      await updateOnboardingConfig(
        userId,
        (config) => ({ ...config, sources: [...(config.sources ?? []), source].slice(-MAX_SOURCES) }),
        2,
      );
      return Response.json({ ok: true });
    }

    if (action === "remove-source") {
      const id = str(body.id);
      if (id) {
        await updateOnboardingConfig(userId, (config) => ({
          ...config,
          sources: (config.sources ?? []).filter((s) => s.id !== id),
        }));
      }
      return Response.json({ ok: true });
    }

    if (action === "knowledge-done") {
      await saveOnboardingConfig(userId, { knowledgeDone: true }, 2);
      return Response.json({ ok: true, step: 3 });
    }

    if (action === "calendar-done") {
      await saveOnboardingConfig(userId, { calendarDone: true }, 3);
      return Response.json({ ok: true, step: 4 });
    }

    if (action === "country") {
      const c = str(body.country).toUpperCase();
      if (/^[A-Z]{2}$/.test(c)) await saveOnboardingConfig(userId, { country: c });
      return Response.json({ ok: true });
    }

    if (action === "provision") {
      // The purchase (Stripe webhook, store verify/sync) normally starts the
      // provisioner; this is the same fallback + poll target the web screen
      // uses, and it only runs once payment has landed. provisionOnboarding's
      // own guard answers 'done' without provisioning for an account that
      // already owns assistants - not duplicated here on purpose.
      const profile = await getOnboardingProfile(userId);
      if (!profile) return Response.json({ status: "nothing" });
      if (profile.status === "done") {
        return Response.json({
          status: "done",
          e164: profile.result?.e164,
          sandbox: profile.result?.sandbox,
        });
      }
      // A live runner holds the lease. An expired one (the background run
      // died) falls through, so provisionOnboarding re-claims it - the same
      // recovery the web screen's poll gets.
      if (profile.status === "provisioning" && !provisionLeaseExpired(profile)) {
        return Response.json({ status: "provisioning" });
      }

      const billing = await getBilling(userId).catch(() => null);
      const paid = billing?.status === "active" || billing?.status === "trialing";
      if (!paid) return Response.json({ status: "waiting-payment" });

      const outcome = await provisionOnboarding(userId);
      return Response.json({
        status: outcome.status,
        e164: outcome.e164,
        error: outcome.error,
        sandbox: outcome.sandbox,
      });
    }
  } catch (err) {
    console.error("[mobile:onboarding]", err);
    return Response.json({ error: "Could not save. Try again." }, { status: 500 });
  }

  return Response.json({ error: "Bad request." }, { status: 400 });
}
