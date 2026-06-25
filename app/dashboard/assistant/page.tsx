import { Placeholder } from "../components/Placeholder";
import { Bot } from "../icons";

export default function AssistantPage() {
  return (
    <Placeholder
      title="AI assistant"
      description="Shape the receptionist's voice, behavior, and knowledge per phone number."
      icon={<Bot className="h-6 w-6" />}
      bullets={[
        "Pick an ElevenLabs voice and language",
        "Greeting and behavior prompt",
        "Business knowledge and FAQs",
        "Escalation and guardrails",
      ]}
    />
  );
}
