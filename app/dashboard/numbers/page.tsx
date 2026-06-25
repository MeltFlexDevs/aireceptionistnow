import { Placeholder } from "../components/Placeholder";
import { Hash } from "../icons";

export default function NumbersPage() {
  return (
    <Placeholder
      title="Phone numbers"
      description="Register and label the numbers your AI answers — Home, Work, Organization, Personal."
      icon={<Hash className="h-6 w-6" />}
      bullets={[
        "Provision a new Twilio number",
        "Connect or forward an existing line",
        "Per-number routing and business hours",
        "Enable or disable without deleting",
      ]}
    />
  );
}
