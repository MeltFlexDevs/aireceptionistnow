import { randomUUID } from "node:crypto";

import { getBilling } from "@/lib/billing";
import { listIntegrations } from "@/lib/dashboard/db";
import {
  getOnboardingProfile,
  saveOnboardingConfig,
} from "@/lib/dashboard/onboarding-profile";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import { summarizeSourceMarkdown } from "@/lib/dashboard/ai-knowledge";
import { MAX_SOURCE_CHARS, MAX_SOURCES } from "@/lib/knowledge/sources";
import { DEFAULT_COUNTRY, NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { PLANS } from "@/lib/plans";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_RE = /^\+[1-9]\d{6,15}$/;
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
 * Payment is not taken here either - it opens Stripe in a browser through
 * /api/mobile/web-link, because in-binary payment would fall under App Store
 * in-app purchase rules.
 */

function firstIncompleteStep(cfg: Record<string, unknown>): number {
  if (!((cfg.companyName || cfg.companyWebsite) && cfg.assistantName)) return 1;
  if (!cfg.knowledgeDone) return 2;
  if (!cfg.calendarDone) return 3;
  return 4;
}

export async function GET(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const [profile, billing, integrations] = await Promise.all([
    getOnboardingProfile(userId),
    getBilling(userId).catch(() => null),
    listIntegrations(userId).catch(() => []),
  ]);

  const cfg = (profile?.config ?? {}) as Record<string, unknown>;
  const paid = billing?.status === "active" || billing?.status === "trialing";
  const step = firstIncompleteStep(cfg);

  return Response.json({
    status: profile?.status ?? "draft",
    // The app opens this step and no later one - the native equivalent of the
    // funnel's URL gate.
    step,
    paid,
    done: profile?.status === "done",
    result: profile?.result ?? null,
    config: {
      companyName: (cfg.companyName as string) ?? "",
      companyWebsite: (cfg.companyWebsite as string) ?? "",
      assistantName: (cfg.assistantName as string) ?? "",
      voiceId: (cfg.voiceId as string) ?? "",
      voiceGender: cfg.voiceGender === "m" ? "m" : "f",
      country: (cfg.country as string) ?? DEFAULT_COUNTRY,
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
    plans: PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      monthlyAmountCents: p.monthlyAmountCents,
      currency: p.currency,
      highlight: p.highlight,
      included: p.included,
      features: p.features,
      minutesIncluded: p.limits.minutesIncluded,
    })),
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
  const userId = await mobileUserId(req);
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
          companyWebsite: str(body.companyWebsite),
        },
        1,
      );

      if (alertPhone && !PHONE_RE.test(alertPhone)) {
        return Response.json(
          { error: "Enter the alert number with its country code, like +1 555 123 4567." },
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
      const firstLine = markdown.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
      const title = firstLine ? firstLine.slice(0, 50) : "What I told it";
      const summary = await summarizeSourceMarkdown(title, markdown).catch(() => null);
      const profile = await getOnboardingProfile(userId);
      const sources = [
        ...(profile?.config.sources ?? []),
        {
          id: randomUUID(),
          kind: "text" as const,
          title,
          markdown,
          charCount: markdown.length,
          addedAt: new Date().toISOString(),
          ...(summary ? { summary } : {}),
        },
      ].slice(-MAX_SOURCES);
      await saveOnboardingConfig(userId, { sources }, 2);
      return Response.json({ ok: true });
    }

    if (action === "remove-source") {
      const id = str(body.id);
      if (id) {
        const profile = await getOnboardingProfile(userId);
        const sources = (profile?.config.sources ?? []).filter((s) => s.id !== id);
        await saveOnboardingConfig(userId, { sources });
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
      // The Stripe webhook normally starts the provisioner; this is the same
      // fallback + poll target the web screen uses, and it only runs once
      // payment has landed.
      const profile = await getOnboardingProfile(userId);
      if (!profile) return Response.json({ status: "nothing" });
      if (profile.status === "done") {
        return Response.json({ status: "done", e164: profile.result?.e164 });
      }
      if (profile.status === "provisioning") return Response.json({ status: "provisioning" });

      const billing = await getBilling(userId).catch(() => null);
      const paid = billing?.status === "active" || billing?.status === "trialing";
      if (!paid) return Response.json({ status: "waiting-payment" });

      const outcome = await provisionOnboarding(userId);
      return Response.json({
        status: outcome.status,
        e164: outcome.e164,
        error: outcome.error,
      });
    }
  } catch (err) {
    console.error("[mobile:onboarding]", err);
    return Response.json({ error: "Could not save. Try again." }, { status: 500 });
  }

  return Response.json({ error: "Bad request." }, { status: 400 });
}
