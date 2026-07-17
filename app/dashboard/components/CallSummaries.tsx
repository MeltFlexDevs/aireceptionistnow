import type { Summary } from "@/lib/dashboard/analytics";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { CallSummariesList, type SummaryItemView } from "./CallSummariesList";

// Originals render instantly; CallSummariesList translates client-side into
// the current dashboard locale, so this never blocks a server render.
export function CallSummaries({ items }: { items: Summary[] }) {
  const view: SummaryItemView[] = items.map((s) => ({
    id: s.id,
    name: formatPhone(s.name),
    time: s.time,
    at: s.at,
    text: s.text,
    tags: s.tags,
  }));
  return <CallSummariesList items={view} />;
}
