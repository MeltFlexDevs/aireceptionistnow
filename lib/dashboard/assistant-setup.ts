/**
 * What is configured on a receptionist, and what is still missing.
 *
 * The settings page used to render five identical cards whose only difference
 * was a `summary` line that was null for two of them - so a fully configured
 * assistant and a brand new one looked the same. This module is the single
 * answer to "is this set up?", used by both the cards and the progress bar so
 * the two can never disagree.
 *
 * Deliberately free of I/O and of the dictionary: it decides state from raw
 * values, and the page supplies the words. That keeps it testable and stops
 * eight locales from having to agree on a boolean.
 */

import { ENGLISH_AMERICA_VOICES, FALLBACK_VOICES } from "@/app/(main)/dashboard/numbers/voices";

export type SetupKey = "voice" | "greeting" | "transfer" | "calendar" | "behaviour";

export interface SetupItem {
  key: SetupKey;
  /** Configured enough to work. Drives the badge and the progress bar. */
  done: boolean;
}

export interface SetupInputs {
  voiceId: string;
  greeting: string;
  transferTo: string;
  /** Calendars connected on the account, whether or not this assistant uses them. */
  calendarsConnected: number;
  /** Calendars this assistant may read or write. */
  calendarAccessCount: number;
  systemPrompt: string;
}

export function buildSetupItems(input: SetupInputs): SetupItem[] {
  return [
    { key: "voice", done: input.voiceId.trim().length > 0 },
    { key: "greeting", done: input.greeting.trim().length > 0 },
    { key: "transfer", done: input.transferTo.trim().length > 0 },
    // Connecting a calendar is not enough - an assistant with no access to it
    // still cannot book, which is the thing the card claims to do.
    { key: "calendar", done: input.calendarAccessCount > 0 },
    { key: "behaviour", done: input.systemPrompt.trim().length > 0 },
  ];
}

export interface SetupProgress {
  done: number;
  total: number;
  /** 0-100, rounded. */
  percent: number;
}

export function setupProgress(items: SetupItem[]): SetupProgress {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  // An empty list is 0%, not NaN% - the bar renders this number directly.
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/**
 * Words in the greeting, for the card's "34 words" line.
 *
 * Counts whitespace-separated runs, so punctuation attached to a word does not
 * inflate it and a greeting of only spaces counts as zero.
 */
export function greetingWordCount(greeting: string): number {
  const trimmed = greeting.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Every premade voice the picker can offer, flattened once at module load.
const VOICE_NAMES = new Map<string, string>(
  [...ENGLISH_AMERICA_VOICES, ...FALLBACK_VOICES].map((v) => [v.voiceId, v.name]),
);

/**
 * Display name for a stored voice id, or "" when it is not one of the premade
 * voices (a library or cloned voice pasted in by id). The caller shows its own
 * wording for that case rather than printing a raw ElevenLabs id at the user.
 */
export function voiceName(voiceId: string): string {
  return VOICE_NAMES.get(voiceId.trim()) ?? "";
}
