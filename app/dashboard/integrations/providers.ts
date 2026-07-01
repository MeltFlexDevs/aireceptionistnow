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

export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  {
    id: "google",
    name: "Google Calendar",
    blurb: "Book appointments straight into a Google Calendar via OAuth.",
    live: true,
    oauth: true,
    fields: [
      { name: "client_id", label: "Client ID" },
      { name: "client_secret", label: "Client secret", secret: true },
      { name: "refresh_token", label: "Refresh token", secret: true },
      { name: "calendar_id", label: "Calendar ID", placeholder: "primary", optional: true },
    ],
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    blurb: "Microsoft 365 / Outlook calendar via Microsoft Graph.",
    live: true,
    oauth: true,
    fields: [
      { name: "client_id", label: "Application (client) ID" },
      { name: "client_secret", label: "Client secret", secret: true },
      { name: "tenant", label: "Tenant", placeholder: "common", optional: true },
      { name: "refresh_token", label: "Refresh token", secret: true },
      { name: "calendar_id", label: "Calendar ID", optional: true },
    ],
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
  {
    id: "webhook",
    name: "Custom / Webhook",
    blurb: "Send bookings to any URL. Zapier, Make, n8n, or your own endpoint.",
    live: true,
    fields: [
      { name: "url", label: "Webhook URL", placeholder: "https://..." },
      { name: "secret", label: "Shared secret", secret: true, optional: true },
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    blurb: "Connect your Calendly account with one click.",
    live: false,
    oauth: true,
    fields: [],
  },
  {
    id: "apple",
    name: "Apple iCloud (CalDAV)",
    blurb: "iCloud calendar over CalDAV. Native adapter coming soon.",
    live: false,
    fields: [],
  },
];
