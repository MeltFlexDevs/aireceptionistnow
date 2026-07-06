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

// Calendars the assistant can book into during a call. Each `id` maps to a
// booking adapter in the call engine (lib/call-engine/integrations/registry.ts)
// and, for `oauth` providers, to an OAuth definition in lib/dashboard/oauth.ts.
// Google/Outlook connect via OAuth ("Continue with…") when the app's OAuth env
// creds are set; Cal.com connects with an API key + event type.
export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  {
    id: "google",
    name: "Google Calendar",
    blurb: "Books straight into your Google Calendar. Connect with your Google account.",
    live: true,
    oauth: true,
    fields: [],
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    blurb: "Books into Outlook / Microsoft 365. Connect with your Microsoft account.",
    live: true,
    oauth: true,
    fields: [],
  },
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
