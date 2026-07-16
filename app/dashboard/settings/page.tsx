import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";
import { getAccountSettings, type AccountSettings } from "@/lib/dashboard/account";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { SectionCard } from "../components/SectionCard";
import { PageHeader } from "../components/PageHeader";
import { SubmitButton } from "../components/SubmitButton";
import { Hint } from "../components/Hint";
import { PlanUsage } from "../components/PlanUsage";
import { BillingPortalButton } from "./BillingPortalButton";
import { TimezoneSelect } from "./TimezoneSelect";
import { supportedTimezones } from "@/lib/dashboard/timezones";
import { saveAccountAction, saveNotificationsAction } from "./actions";
import { getDictionary } from "@/lib/i18n/server";

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
  const [{ saved, error }, t] = await Promise.all([searchParams, getDictionary()]);
  const s = t.settings;

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

  const [account, planCtx] = await Promise.all([
    userId
      ? getAccountSettings(userId).catch(() => null as AccountSettings | null)
      : Promise.resolve(null as AccountSettings | null),
    getPlanContextCached(userId).catch(() => null),
  ]);
  const zones = supportedTimezones();

  return (
    <div className="space-y-6 rise">
      <PageHeader title={s.title} />

      {saved && (
        <div className="shape-pill border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {t.common.saved}
        </div>
      )}
      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
      )}

      {!userId && (
        <Hint title={s.signInTitle}>{s.signInBody}</Hint>
      )}

      <form action={saveAccountAction}>
        <SectionCard title={s.account} subtitle={s.accountSub}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className={labelCls}>{s.fullName}</label>
                <input id="full_name" name="full_name" defaultValue={account?.full_name ?? ""} placeholder="Jane Doe" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="email_display" className={labelCls}>{s.email}</label>
                <input id="email_display" value={email} disabled readOnly className={`${field} bg-neutral-50 text-neutral-500`} />
              </div>
              <div>
                <label htmlFor="company" className={labelCls}>{s.company}</label>
                <input id="company" name="company" defaultValue={account?.company ?? ""} placeholder="Acme Corp" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="role" className={labelCls}>{s.role}</label>
                <input id="role" name="role" defaultValue={account?.role ?? ""} placeholder="Owner" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="phone" className={labelCls}>{s.phone}</label>
                <input id="phone" name="phone" defaultValue={account?.phone ?? ""} placeholder="+1 415 555 0142" className={field} disabled={!userId} />
              </div>
              <div>
                <label htmlFor="timezone" className={labelCls}>{s.timezone}</label>
                <TimezoneSelect
                  value={account?.timezone ?? ""}
                  zones={zones}
                  className={field}
                  disabled={!userId}
                />
              </div>
            </div>

            <div>
              <label htmlFor="about" className={labelCls}>{s.aboutYou}</label>
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
                <span className="block text-sm font-medium text-neutral-800">{s.shareTitle}</span>
                <span className="block text-xs text-neutral-400">{s.shareBody}</span>
              </span>
              <input type="checkbox" name="share_with_assistants" defaultChecked={account?.share_with_assistants ?? true} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <SubmitButton pendingText={t.common.saving} disabled={!userId} className="press w-full sm:w-auto">
              {s.saveAccount}
            </SubmitButton>
          </div>
        </SectionCard>
      </form>

      <form action={saveNotificationsAction}>
        <SectionCard title={s.notifications} subtitle={s.notificationsSub}>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
              <span>
                <span className="block text-sm font-medium text-neutral-800">{s.emailNotif}</span>
                <span className="block text-xs text-neutral-400">{s.emailNotifSub}</span>
              </span>
              <input type="checkbox" name="notify_email" defaultChecked={account?.notify_email ?? true} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
              <span>
                <span className="block text-sm font-medium text-neutral-800">{s.smsNotif}</span>
                <span className="block text-xs text-neutral-400">{s.smsNotifSub}</span>
              </span>
              <input type="checkbox" name="notify_sms" defaultChecked={account?.notify_sms ?? false} className="peer sr-only" disabled={!userId} />
              <span className={toggle} />
            </label>

            <SubmitButton pendingText={t.common.saving} disabled={!userId} className="press w-full sm:w-auto">
              {s.saveNotifications}
            </SubmitButton>
          </div>
        </SectionCard>
      </form>

      <SectionCard
        title={s.billing}
        subtitle={s.billingSub}
        action={planCtx?.active ? <BillingPortalButton /> : undefined}
      >
        <div className="space-y-4">
          {planCtx && <PlanUsage ctx={planCtx} />}
          {!planCtx?.active && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <span>{s.noSubscription}</span>
              <Link href="/pricing" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700">
                {t.common.viewPlans}
              </Link>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
