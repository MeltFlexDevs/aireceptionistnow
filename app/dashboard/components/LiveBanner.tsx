import { getAssistantNumber, listAssistants } from "@/lib/dashboard/db";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";
import { SectionCard } from "./SectionCard";

// B2C "you're live" banner for the day-zero dashboard: shows the provisioned
// number front and center while there are no calls yet. Renders nothing until
// an assistant has a number.
export async function LiveBanner({ ownerId }: { ownerId: string | null }) {
  const assistants = await listAssistants(ownerId ?? undefined).catch(() => []);
  let e164: string | null = null;
  for (const a of assistants) {
    const number = await getAssistantNumber(a.id).catch(() => null);
    if (number) {
      e164 = number.e164;
      break;
    }
  }
  if (!e164) return null;

  const t = await getDictionary();
  return (
    <SectionCard>
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t.overview.liveAt}
        </span>
        <p className="text-3xl font-medium tracking-tight text-neutral-900 tabular-nums">
          {formatPhone(e164)}
        </p>
        <p className="max-w-md text-sm text-neutral-500">{t.overview.liveTry}</p>
      </div>
    </SectionCard>
  );
}
