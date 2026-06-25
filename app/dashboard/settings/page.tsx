import { Placeholder } from "../components/Placeholder";
import { Gear } from "../icons";

export default function SettingsPage() {
  return (
    <Placeholder
      title="Settings"
      description="Workspace, team, notifications, billing, and API keys."
      icon={<Gear className="h-6 w-6" />}
      bullets={[
        "Team members and roles",
        "Email and SMS notifications",
        "Billing and plan limits",
        "API keys and webhooks",
      ]}
    />
  );
}
