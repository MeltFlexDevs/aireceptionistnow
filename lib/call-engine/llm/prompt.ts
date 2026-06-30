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

// Spells out, in plain language, what the AI may do with each connected
// calendar. Two capabilities: READ (availability only — check if a time is free,
// never reveal what's on the calendar) and WRITE (also book). Read is the
// privacy rule: the assistant may say a time is taken and offer free times, but
// must never reveal who/what/why. Legacy "busy" entries map to read.
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

  const write = access.filter((a) => a.level === "write").map((a) => nameOf(a.integrationId));
  // read + legacy "busy" both mean availability-only.
  const read = access
    .filter((a) => a.level === "read" || a.level === "busy")
    .map((a) => nameOf(a.integrationId));

  const out: string[] = ["", "CALENDAR ACCESS:"];
  if (write.length) {
    out.push(
      `- Book appointments on: ${write.join(", ")} with book_appointment.`,
      "  Always call check_availability first and only book a time you've confirmed is free.",
    );
  }
  if (read.length) {
    out.push(`- Check availability on (read-only, no booking): ${read.join(", ")}.`);
  }
  out.push(
    "- AVAILABILITY IS PRIVATE. Use check_availability to see if a time is free, but",
    "  NEVER say what is scheduled, who it's with, or why a time is taken — even if asked.",
    "- If a time is unavailable, say only that it's unavailable and offer the nearest free",
    '  times instead, e.g. "That time isn\'t available — I could do 2pm or 4pm." Never explain why.',
  );
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
