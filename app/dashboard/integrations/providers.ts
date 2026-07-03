// Calendar providers shown in the integrations catalog. `live` providers have a
// working booking adapter in the call engine; others are listed but not yet
// connectable. Field names map 1:1 to the engine adapter's config keys.

export interface ProviderField {
  name: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  optional?: boolean;
}

export interface CalendarProviderDef {
  id: string;
  name: string;
  blurb: string;
  live: boolean;
  oauth?: boolean; // supports "Login with…" when its OAuth env is configured
  fields: ProviderField[];
}

// Cal.com only — it mirrors the ElevenLabs Conversational AI agents' native
// Cal.com booking integration, so the calendar the agent books into on a call is
// the same one connected here. (Google, Microsoft/Outlook and custom-webhook
// providers were removed from the catalog.)
export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  {
    id: "calcom",
    name: "Cal.com",
    blurb: "Open-source scheduling. Books against a Cal.com event type.",
    live: true,
    fields: [
      { name: "api_key", label: "API key", secret: true },
      { name: "event_type_id", label: "Event type ID" },
      { name: "time_zone", label: "Time zone", placeholder: "UTC", optional: true },
    ],
  },
];
