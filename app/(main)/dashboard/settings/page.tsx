import Link from "next/link";
import { currentUserId, getAuthClaims } from "@/lib/auth";
import { getAccountSettings, type AccountSettings } from "@/lib/dashboard/account";
import { billingPanelMode, STORE_SUBSCRIPTIONS_URL } from "@/lib/dashboard/billing-panel";
import { displayTimezone } from "@/lib/dashboard/display-timezone";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { listOrganizations } from "@/lib/dashboard/organizations";
import { supportedTimezones } from "@/lib/dashboard/timezones";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/marketing/href";
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
  const [t, claims, userId, locale] = await Promise.all([
    getDictionary(),
    getAuthClaims(),
    currentUserId(),
    getLocale(),
  ]);
  const s = t.settings;
  const email = typeof claims?.email === "string" ? claims.email : "";

  const [account, planCtx, orgs, tz] = await Promise.all([
    userId
      ? getAccountSettings(userId).catch(() => null as AccountSettings | null)
      : Promise.resolve(null as AccountSettings | null),
    getPlanContextCached(userId).catch(() => null),
    userId ? listOrganizations(userId).catch(() => []) : Promise.resolve([]),
    displayTimezone(userId).catch(() => "UTC"),
  ]);
  const zones = supportedTimezones();
  const mode = planCtx ? billingPanelMode(planCtx) : "none";

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
        <div className="space-y-6">
          <BusinessForm
            account={account}
            email={email}
            zones={zones}
            canEdit={Boolean(userId)}
            businessCount={orgs.length}
          />
          {/* Account deletion lives on its own public page (it is also the
              Play Console "Delete account URL"), so this is only a way there. */}
          {userId && (
            <p className="text-xs text-neutral-500">
              <Link
                href="/account/delete"
                className="underline underline-offset-2 hover:text-neutral-800"
              >
                {s.deleteAccount}
              </Link>
            </p>
          )}
        </div>

        <AlertsForm account={account} canEdit={Boolean(userId)} />

        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-neutral-500">{s.billingSub}</p>
          {planCtx && <PlanUsage ctx={planCtx} tz={tz} />}
          {mode === "stripe" ? (
            <div className="flex justify-end">
              <BillingPortalButton />
            </div>
          ) : mode === "store-apple" || mode === "store-google" ? (
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {mode === "store-apple" ? s.billedByAppStore : s.billedByGooglePlay}{" "}
              <a
                href={STORE_SUBSCRIPTIONS_URL[mode]}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700"
              >
                {s.storeSubscriptionsLink}
              </a>
            </p>
          ) : mode === "comp" ? (
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {s.compPlanNote}
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <span>{s.noSubscription}</span>
              <Link
                href={localizedHref(locale, "pricing")}
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
