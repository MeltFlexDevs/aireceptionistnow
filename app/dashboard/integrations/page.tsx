import { listIntegrations, type Integration } from "@/lib/dashboard/db";
import { SectionCard } from "../components/SectionCard";
import { CALENDAR_PROVIDERS, type CalendarProviderDef } from "./providers";
import { connectCalendarAction, disconnectCalendarAction } from "./actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

const LOGIN_NAMES: Record<string, string> = {
  google: "Google",
  outlook: "Microsoft",
  calendly: "Calendly",
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
  return null;
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
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Connect {def.name}
      </button>
    </form>
  );
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;

  let integrations: Integration[] = [];
  let loadError = "";
  try {
    integrations = await listIntegrations();
  } catch (err) {
    loadError = (err as Error).message;
  }

  const calendars = integrations.filter((i) => i.type === "calendar");
  const byProvider = new Map(calendars.map((i) => [i.provider, i]));
  const primaryId = calendars.find((i) => i.enabled)?.id;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Integrations</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Connect a calendar so the AI can book appointments during calls.
        </p>
      </header>

      {connected && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Calendar connected.
        </div>
      )}
      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      <p className="text-xs text-neutral-400">
        Bookings use your first connected calendar (marked Primary). Per-number booking targets are set on each number&apos;s settings.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {CALENDAR_PROVIDERS.map((def) => {
          const conn = byProvider.get(def.id);
          const isPrimary = conn?.id === primaryId;
          const summary = def.fields
            .filter((f) => !f.secret && conn?.config?.[f.name])
            .map((f) => `${f.label}: ${String(conn?.config?.[f.name])}`);

          return (
            <SectionCard key={def.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-neutral-900">{def.name}</h2>
                    {conn ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    ) : !def.live && !def.oauth ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                        Coming soon
                      </span>
                    ) : null}
                    {isPrimary && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-900">
                        Primary
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
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Disconnect
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {def.oauth && (
                    <a
                      href={`/api/integrations/${def.id}/connect`}
                      className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
                    >
                      <ProviderIcon id={def.id} />
                      Continue with {LOGIN_NAMES[def.id] ?? def.name}
                    </a>
                  )}

                  {def.fields.length > 0 && !def.oauth && <CredentialForm def={def} />}

                  {!def.oauth && def.fields.length === 0 && (
                    <p className="text-xs text-neutral-400">Not available to connect yet.</p>
                  )}
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
