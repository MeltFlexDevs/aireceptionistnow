import { getDictionary } from "@/lib/i18n/server";
import { isOAuthConfigured } from "@/lib/dashboard/oauth";
import type { Integration } from "@/lib/dashboard/db";
import { CALENDAR_PROVIDERS } from "@/lib/calendar/providers";
import { ProviderIcon } from "@/app/(main)/dashboard/components/ProviderIcon";
import { Check } from "@/app/(main)/dashboard/icons";
import { AiAvatar } from "../AiAvatar";
import { CalendarArt } from "../CalendarArt";
import { FinalizeButton } from "./FinalizeButton";

const RETURN_TO = encodeURIComponent("/onboarding?step=3");

// Onboarding order: the mainstream calendars first, Cal.com last.
const PROVIDER_ORDER = ["google", "outlook", "calcom"];

// Step 3, in its own shape: a calendar-styled hero (a stylized month with a
// pulsing "today" and booked-slot dots, the receptionist pinned to its corner)
// over a compact list of calendar providers to connect.
export async function CalendarStep({
  calendars,
  connected,
  assistantName = "",
}: {
  calendars: Integration[];
  connected: boolean;
  assistantName?: string;
}) {
  const t = await getDictionary();
  const o = t.onboarding;
  const providers = CALENDAR_PROVIDERS.filter((p) => p.oauth && isOAuthConfigured(p.id)).sort(
    (a, b) => PROVIDER_ORDER.indexOf(a.id) - PROVIDER_ORDER.indexOf(b.id),
  );
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="shape-card glass relative flex flex-col px-5 pb-6 pt-7 sm:h-[min(37rem,calc(100dvh_-_11.5rem))] sm:px-7 sm:pb-7">
        {/* Calendar hero + the receptionist on duty. */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <CalendarArt />
            <div className="ava-ring onb-cal-badge">
              <span>
                <AiAvatar mood="friendly" className="h-[82%] w-[82%]" label={o.role} />
              </span>
            </div>
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900">
            {o.step3Title}
          </h1>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">
            {o.step3Sub}
          </p>
        </div>

        {connected && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            {o.calendarDone}
          </div>
        )}

        {/* Providers to connect - all visible, no inner scroll. */}
        <div className="mt-4">
          {providers.length === 0 ? (
            <p className="text-sm leading-relaxed text-neutral-400">{o.noProviders}</p>
          ) : (
            <ul className="space-y-2">
              {providers.map((p) => {
                const isConnected = calendars.some((c) => c.provider === p.id);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200/70 bg-white px-3 py-2"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                      <ProviderIcon id={p.id} />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
                      {p.name}
                    </p>
                    {isConnected ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        {o.connectedBadge}
                      </span>
                    ) : (
                      <a
                        href={`/api/integrations/${p.id}/connect?next=${RETURN_TO}`}
                        className="press inline-flex h-8 shrink-0 items-center rounded-lg border border-neutral-300 bg-white px-3.5 text-sm font-medium text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        {o.connect}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex-1" />

        <div className="mt-4">
          <FinalizeButton assistantName={assistantName} />
        </div>
      </div>
    </div>
  );
}
