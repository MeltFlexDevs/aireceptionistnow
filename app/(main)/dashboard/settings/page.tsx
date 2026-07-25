import Link from "next/link";
import { currentUserId, getAuthClaims } from "@/lib/auth";
import { getAccountSettings, type AccountSettings } from "@/lib/dashboard/account";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { listOrganizations } from "@/lib/dashboard/organizations";
import { supportedTimezones } from "@/lib/dashboard/timezones";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "../components/PageHeader";
import { Tabs } from "../components/Tabs";
import { Hint } from "../components/Hint";
import { PlanUsage } from "../components/PlanUsage";
import { BillingPortalButton } from "./BillingPortalButton";
import { BusinessForm } from "./BusinessForm";
import { AlertsForm } from "./AlertsForm";

export const dynamic = "force-dynamic";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

export default async function SettingsPage() {
  // getAuthClaims is the same request-memoized read currentUserId derives from,
  // so both resolve off one auth round trip. Building a second Supabase client
  // here to call getClaims() again duplicated it, and awaiting the dictionary
  // first put it behind a round trip it does not depend on.
  const [t, claims, userId] = await Promise.all([
    getDictionary(),
    getAuthClaims(),
    currentUserId(),
  ]);
  const s = t.settings;
  const email = typeof claims?.email === "string" ? claims.email : "";

  const [account, planCtx, orgs] = await Promise.all([
    userId
      ? getAccountSettings(userId).catch(() => null as AccountSettings | null)
      : Promise.resolve(null as AccountSettings | null),
    getPlanContextCached(userId).catch(() => null),
    userId ? listOrganizations(userId).catch(() => []) : Promise.resolve([]),
  ]);
  const zones = supportedTimezones();

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      <div className="shrink-0">
        <PageHeader title={s.title} />
      </div>

      {!userId && (
        <div className="shrink-0">
          <Hint title={s.signInTitle}>{s.signInBody}</Hint>
        </div>
      )}

      {/* Tabs renders every panel (inactive ones hidden), so a half-filled form
          survives a tab switch. Only the active panel scrolls. */}
      <Tabs
        className="shape-card glass flex min-h-0 flex-1 flex-col px-5 pb-5 pt-1"
        panelClassName="min-h-0 flex-1 overflow-y-auto"
        labels={[s.tabBusiness, s.tabAlerts, s.tabBilling]}
      >
        <BusinessForm
          account={account}
          email={email}
          zones={zones}
          canEdit={Boolean(userId)}
          businessCount={orgs.length}
        />

        <AlertsForm account={account} canEdit={Boolean(userId)} />

        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-neutral-500">{s.billingSub}</p>
          {planCtx && <PlanUsage ctx={planCtx} />}
          {planCtx?.active ? (
            <div className="flex justify-end">
              <BillingPortalButton />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <span>{s.noSubscription}</span>
              <Link
                href="/pricing"
                className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700"
              >
                {t.common.viewPlans}
              </Link>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
