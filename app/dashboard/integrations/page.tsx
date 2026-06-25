import { Placeholder } from "../components/Placeholder";
import { Plug } from "../icons";

export default function IntegrationsPage() {
  return (
    <Placeholder
      title="Integrations"
      description="Connect the calendars, CRMs, and tools your AI reads from and writes to."
      icon={<Plug className="h-6 w-6" />}
      bullets={[
        "Google Calendar, Outlook, Calendly",
        "HubSpot and Salesforce",
        "Zapier and webhooks",
        "Open REST API access",
      ]}
    />
  );
}
