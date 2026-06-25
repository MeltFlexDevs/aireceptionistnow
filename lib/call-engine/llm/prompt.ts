import { renderKnowledgeMarkdown } from "../../knowledge/sources";
import type { IntegrationConfig, NumberConfig } from "../types";

// Builds the system prompt for a call from the number's configuration. The
// shape is deliberately spoken-first: short turns, one question at a time, no
// markdown — everything here ends up as synthesized speech.

interface AccessEntry {
  integrationId: string;
  level: string; // write | read | busy
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google Calendar",
  outlook: "Microsoft Outlook",
  calcom: "Cal.com",
  webhook: "the custom calendar",
  calendly: "Calendly",
  apple: "Apple iCloud",
};

// Spells out, in plain language, what the AI may say about each connected
// calendar. The busy-only tier is the privacy rule: it can tell a slot is taken
// but must not reveal what's on it.
function calendarSection(
  routing: Record<string, unknown>,
  integrations: IntegrationConfig[],
): string[] {
  const access = (routing.calendar as { access?: AccessEntry[] })?.access ?? [];
  if (access.length === 0) return [];

  const nameOf = (id: string): string => {
    const found = integrations.find((i) => i.id === id);
    return found ? PROVIDER_LABELS[found.provider] ?? found.provider : "a calendar";
  };
  const names = (level: string) =>
    access.filter((a) => a.level === level).map((a) => nameOf(a.integrationId));

  const write = names("write");
  const read = names("read");
  const busy = names("busy");
  const out: string[] = ["", "CALENDAR ACCESS:"];
  if (write.length) {
    out.push(`- Book appointments on: ${write.join(", ")}. You may read and discuss these events.`);
  }
  if (read.length) {
    out.push(`- You may read full event details from: ${read.join(", ")}.`);
  }
  if (busy.length) {
    out.push(
      `- PRIVATE (conflict-check only): ${busy.join(", ")}.`,
      "  Treat their busy times as simply unavailable. Never reveal who or what is scheduled on them — if a caller asks, say only that the time isn't available.",
    );
  }
  return out;
}

export function buildSystemPrompt(config: NumberConfig): string {
  const knowledge = renderKnowledgeMarkdown(config.knowledge);
  const routing = JSON.stringify(config.routing ?? {}, null, 0);
  const hasCalendar = config.integrations.some((i) => i.type === "calendar");

  const lines = [
    `You are the AI receptionist for ${config.businessName}, answering the "${config.label}" phone line.`,
    "You are on a live phone call. The caller hears your words as speech.",
    "",
    "LANGUAGE:",
    "- Detect the caller's language from their words and reply only in that language for the rest of the call.",
    "- Default to English until the caller's language is clear. If the caller switches languages, follow them.",
    "",
    "STYLE:",
    "- Speak naturally and warmly, like a capable human receptionist.",
    "- Keep each turn to one or two short sentences. Never monologue.",
    "- Ask one question at a time, then wait for the answer.",
    "- No markdown, lists, emoji, or symbols — this is spoken aloud.",
    "- Read back names, phone numbers, and appointment times to confirm them.",
    "- If you don't know something, say so and take a message or offer a callback. Never invent details.",
    "",
    "WHAT YOU CAN DO:",
    "- Answer questions about the business using the knowledge below.",
    hasCalendar
      ? "- Book appointments with the book_appointment tool after confirming the time and the caller's name."
      : "- Collect appointment requests as a message (no calendar is connected yet).",
    "- Take a message with take_message when you can't fully help.",
    "- Transfer to a human with transfer_call when the routing rules require it or the caller insists.",
    "- End the call with end_call once everything is handled and goodbyes are said.",
    "",
    "",
    "BUSINESS KNOWLEDGE:",
    knowledge.trim() ? knowledge : "(none provided yet)",
    "",
    `ROUTING RULES (JSON): ${routing}`,
  ];

  lines.push(...calendarSection(config.routing, config.integrations));

  if (config.systemPrompt.trim()) {
    lines.push("", "ADDITIONAL INSTRUCTIONS:", config.systemPrompt.trim());
  }

  return lines.join("\n");
}
