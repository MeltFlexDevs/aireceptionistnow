import { currentUserId } from "@/lib/auth";
import { listAssistants, listIntegrations, type Integration } from "@/lib/dashboard/db";
import { isOAuthConfigured } from "@/lib/dashboard/oauth";
import { ChevronDown, Plug } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusDot } from "../components/StatusBadge";
import { SubmitButton } from "../components/SubmitButton";
import { CALENDAR_PROVIDERS, type CalendarProviderDef } from "./providers";
import { connectCalendarAction, createCrmAction, deleteCrmAction, disconnectCalendarAction } from "./actions";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

const LOGIN_NAMES: Record<string, string> = {
  google: "Google",
  outlook: "Microsoft",
  calendly: "Calendly",
  calcom: "Cal.com",
};

function ProviderIcon({ id }: { id: string }) {
  if (id === "google") {
    return (
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    );
  }
  if (id === "outlook") {
    return (
      <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden>
        <path fill="#f25022" d="M0 0h11v11H0z" />
        <path fill="#7fba00" d="M12 0h11v11H12z" />
        <path fill="#00a4ef" d="M0 12h11v11H0z" />
        <path fill="#ffb900" d="M12 12h11v11H12z" />
      </svg>
    );
  }
  if (id === "calendly") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    );
  }
  if (id === "calcom") {
    // Cal.com's black "Cal" wordmark pill.
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <rect x="1" y="5" width="22" height="14" rx="4" fill="#292929" />
        <text
          x="12"
          y="15.5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="ui-sans-serif, system-ui"
        >
          Cal
        </text>
      </svg>
    );
  }
  // Generic calendar glyph for providers without a brand mark.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}

function CredentialForm({ def }: { def: CalendarProviderDef }) {
  return (
    <form action={connectCalendarAction} className="space-y-3">
      <input type="hidden" name="provider" value={def.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        {def.fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={`${def.id}-${f.name}`} className="mb-1 block text-xs font-medium text-neutral-600">
              {f.label}
              {f.optional ? <span className="text-neutral-400"> (optional)</span> : null}
            </label>
            <input
              id={`${def.id}-${f.name}`}
              name={f.name}
              type={f.secret ? "password" : "text"}
              required={!f.optional}
              placeholder={f.placeholder}
              autoComplete="off"
              className={field}
            />
          </div>
        ))}
      </div>
      <SubmitButton pendingText="Connecting…" className="press w-full sm:w-auto">Connect {def.name}</SubmitButton>
    </form>
  );
}

function crmUsageCounts(assistants: Array<{ routing: Record<string, unknown> }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of assistants) {
    const targets = (a.routing?.crm as { targets?: Array<{ integrationId?: string }> } | undefined)?.targets;
    if (!Array.isArray(targets)) continue;
    for (const t of targets) {
      if (t?.integrationId) counts.set(t.integrationId, (counts.get(t.integrationId) ?? 0) + 1);
    }
  }
  return counts;
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const [{ connected, error }, t] = await Promise.all([searchParams, getDictionary()]);
  const ownerId = (await currentUserId()) ?? undefined;

  let integrations: Integration[] = [];
  let loadError = "";
  try {
    integrations = await listIntegrations(ownerId);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const calendars = integrations.filter((i) => i.type === "calendar");
  const byProvider = new Map(calendars.map((i) => [i.provider, i]));
  const primaryId = calendars.find((i) => i.enabled)?.id;

  const crms = integrations.filter((i) => i.type === "crm");
  const crmUsage = crmUsageCounts(await listAssistants(ownerId).catch(() => []));

  return (
    <div className="space-y-6 rise">
      <PageHeader title={t.integrations.title} description={t.integrations.description} />

      {connected && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t.integrations.calendarConnected}
        </div>
      )}
      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {CALENDAR_PROVIDERS.map((def) => {
          const conn = byProvider.get(def.id);
          const oauthReady = def.oauth ? isOAuthConfigured(def.id) : false;
          const needsSetup = Boolean(def.oauth && !oauthReady && !conn);
          const isPrimary = Boolean(conn && primaryId && conn.id === primaryId);
          const summary = def.fields
            .filter((f) => !f.secret && conn?.config?.[f.name])
            .map((f) => `${f.label}: ${String(conn?.config?.[f.name])}`);

          return (
            <SectionCard key={def.id}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
                  <ProviderIcon id={def.id} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium text-neutral-900">{def.name}</h2>
                    {def.recommended && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                        Recommended
                      </span>
                    )}
                    {conn ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        <StatusDot tone="ok" />
                        {t.common.connected}
                      </span>
                    ) : needsSetup || (!def.live && !def.oauth) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {t.common.comingSoon}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                        <StatusDot tone="warn" />
                        {t.common.notConnected}
                      </span>
                    )}
                    {isPrimary && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-900">
                        {t.common.primary}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{def.blurb}</p>
                </div>
              </div>

              {conn ? (
                <div className="mt-4 space-y-3">
                  {summary.length > 0 && (
                    <ul className="space-y-1 text-xs text-neutral-500">
                      {summary.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  )}
                  <form action={disconnectCalendarAction}>
                    <input type="hidden" name="id" value={conn.id} />
                    <SubmitButton variant="danger" pendingText={`${t.common.disconnect}…`} className="press w-full sm:w-auto">
                      {t.common.disconnect}
                    </SubmitButton>
                  </form>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {def.oauth && oauthReady && (
                    <a
                      href={`/api/integrations/${def.id}/connect`}
                      className="press inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 sm:w-auto sm:justify-start"
                    >
                      <ProviderIcon id={def.id} />
                      {t.integrations.continueWith} {LOGIN_NAMES[def.id] ?? def.name}
                    </a>
                  )}

                  {def.fields.length > 0 && !def.oauth && <CredentialForm def={def} />}

                  {!def.oauth && def.fields.length === 0 && (
                    <p className="text-xs text-neutral-400">{t.integrations.notAvailableYet}</p>
                  )}
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>

      <details className="group shape-card glass overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60 [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
              <Plug className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-neutral-900">Developer</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Send call data to your own systems.</p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-500">
            <span className="group-open:hidden">Load more</span>
            <span className="hidden group-open:inline">Hide</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </span>
        </summary>

        <div className="border-t border-neutral-200/70 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-900">CRM push</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {t.common.comingSoon}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            POST each completed call to your own system. Assign one to as many assistants as you like.
          </p>

          <div inert className="mt-4 select-none blur-[3px] saturate-50">
        {crms.length > 0 && (
          <ul className="mb-5 space-y-2">
            {crms.map((c) => {
              const name = String(c.config?.name ?? "CRM push");
              const url = String(c.config?.url ?? "");
              const signed = Boolean(c.config?.secret);
              const used = crmUsage.get(c.id) ?? 0;
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusDot tone="ok" />
                      <span className="truncate text-sm font-medium text-neutral-800">{name}</span>
                      {signed && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                          Signed
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-xs text-neutral-500">{url}</div>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {used === 0
                        ? "Not used by any assistant yet"
                        : `Used by ${used} assistant${used === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  <form action={deleteCrmAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <SubmitButton variant="danger" pendingText="Removing…" className="press shrink-0">
                      Remove
                    </SubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <form action={createCrmAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="crm_name" className="mb-1 block text-xs font-medium text-neutral-600">
                Name
              </label>
              <input
                id="crm_name"
                name="crm_name"
                required
                placeholder="Sales Zapier hook"
                autoComplete="off"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="crm_url" className="mb-1 block text-xs font-medium text-neutral-600">
                {t.assistants.endpointUrl}
              </label>
              <input
                id="crm_url"
                name="crm_url"
                type="url"
                required
                pattern="https://.+"
                title="CRM URL must be a public https:// address."
                aria-describedby="crm_url_hint"
                placeholder="https://hooks.zapier.com/..."
                autoComplete="off"
                className={field}
              />
              <p id="crm_url_hint" className="mt-1 text-xs text-neutral-400">
                CRM URL must be a public https:// address.
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="crm_secret" className="mb-1 block text-xs font-medium text-neutral-600">
              Signing secret <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="crm_secret"
              name="crm_secret"
              type="password"
              placeholder="Used to HMAC-sign the payload"
              autoComplete="off"
              className={field}
            />
          </div>
          <SubmitButton pendingText="Adding…" className="press w-full sm:w-auto">
            Add CRM push
          </SubmitButton>
        </form>
          </div>
        </div>
      </details>
    </div>
  );
}
