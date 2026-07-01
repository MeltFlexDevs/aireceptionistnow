import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";
import { getAccountSettings, type AccountSettings } from "@/lib/dashboard/account";
import { getPlanContext } from "@/lib/dashboard/plan";
import { SectionCard } from "../components/SectionCard";
import { PageHeader } from "../components/PageHeader";
import { SubmitButton } from "../components/SubmitButton";
import { Hint } from "../components/Hint";
import { PlanUsage } from "../components/PlanUsage";
import { BillingPortalButton } from "./BillingPortalButton";
import { saveAccountAction, saveNotificationsAction } from "./actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  const userId = await currentUserId();

  let email = "";
  if (authConfigured()) {
    try {
      const supabase = await createClient();
      const claims = (await supabase.auth.getClaims()).data?.claims;
      email = typeof claims?.email === "string" ? claims.email : "";
    } catch {
      email = "";
    }
  }

  let account: AccountSettings | null = null;
  if (userId) {
    account = await getAccountSettings(userId).catch(() => null);
  }
  const planCtx = await getPlanContext(userId).catch(() => null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your account details, what your assistants know about you, notifications, and billing."
      />

      {saved && (
        <div className="shape-pill border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Saved.
        </div>
      )}
      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
      )}

      {!userId && (
        <Hint title="Sign in to edit your account">
          You can view your plan below. Signing in unlocks saving your profile and notification
          settings.
        </Hint>
      )}

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <form action={saveAccountAction}>
        <SectionCard
          title="Account"
          subtitle="Who you are. The details you choose to share are read by your assistants on calls."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className={labelCls}>Full name</label>
                <input id="full_name" name="full_name" defaultValue={account?.full_name ?? ""} placeholder="Jane Doe" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="email_display" className={labelCls}>Email</label>
                <input id="email_display" value={email} disabled readOnly className={`${field} bg-neutral-50 text-neutral-500`} />
              </div>
              <div>
                <label htmlFor="company" className={labelCls}>Company</label>
                <input id="company" name="company" defaultValue={account?.company ?? ""} placeholder="Acme Corp" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="role" className={labelCls}>Your role</label>
                <input id="role" name="role" defaultValue={account?.role ?? ""} placeholder="Owner" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="phone" className={labelCls}>Phone</label>
                <input id="phone" name="phone" defaultValue={account?.phone ?? ""} placeholder="+1 415 555 0142" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="timezone" className={labelCls}>Time zone</label>
                <input id="timezone" name="timezone" defaultValue={account?.timezone ?? ""} placeholder="America/New_York" className={field} disabled={!userId} />
              </div>
            </div>

            <div>
              <label htmlFor="about" className={labelCls}>About you</label>
              <textarea
                id="about"
                name="about"
                defaultValue={account?.about ?? ""}
                rows={4}
                placeholder="A short note about you that assistants can mention, e.g. owner and lead dentist, 15 years in practice, speaks English and Spanish."
                className={`${field} resize-y`}
                disabled={!userId}
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
              <span>
                <span className="block text-sm font-medium text-neutral-800">Share with my assistants</span>
                <span className="block text-xs text-neutral-400">
                  When on, your name, role, company, and the note above are added to what your
                  assistants know about you.
                </span>
              </span>
              <input type="checkbox" name="share_with_assistants" defaultChecked={account?.share_with_assistants ?? true} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <SubmitButton pendingText="Saving…" disabled={!userId}>
              Save account
            </SubmitButton>
          </div>
        </SectionCard>
      </form>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <form action={saveNotificationsAction}>
        <SectionCard
          title="Notifications"
          subtitle="What your AI assistants send you after calls. They use your account email and phone above."
        >
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
              <span>
                <span className="block text-sm font-medium text-neutral-800">Receive email notifications</span>
                <span className="block text-xs text-neutral-400">Call summaries from your AI assistants, by email.</span>
              </span>
              <input type="checkbox" name="notify_email" defaultChecked={account?.notify_email ?? true} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
              <span>
                <span className="block text-sm font-medium text-neutral-800">Receive SMS notifications</span>
                <span className="block text-xs text-neutral-400">Urgent message alerts from your AI assistants, by text.</span>
              </span>
              <input type="checkbox" name="notify_sms" defaultChecked={account?.notify_sms ?? false} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <SubmitButton pendingText="Saving…" disabled={!userId}>
              Save notifications
            </SubmitButton>
          </div>
        </SectionCard>
      </form>

      {/* ── Billing ─────────────────────────────────────────────────────── */}
      <SectionCard
        title="Billing"
        subtitle="Your plan and usage."
        action={planCtx?.active ? <BillingPortalButton /> : undefined}
      >
        <div className="space-y-4">
          {planCtx && <PlanUsage ctx={planCtx} />}
          {!planCtx?.active && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <span>No active subscription. Pick a plan to lift your limits.</span>
              <Link href="/pricing" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700">
                View plans
              </Link>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
