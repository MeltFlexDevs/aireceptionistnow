import { Placeholder } from "../components/Placeholder";
import { Phone } from "../icons";

export default function CallsPage() {
  return (
    <Placeholder
      title="Calls"
      description="Every inbound and outbound call, searchable with full transcripts and recordings."
      icon={<Phone className="h-6 w-6" />}
      bullets={[
        "Searchable call log with filters",
        "Real-time transcript per call",
        "Audio playback and download",
        "AI summary and action items",
      ]}
    />
  );
}
