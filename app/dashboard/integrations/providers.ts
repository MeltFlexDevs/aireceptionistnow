
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
  recommended?: boolean;
  fields: ProviderField[];
}

export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  {
    id: "calcom",
    name: "Cal.com",
    blurb: "Open-source scheduling. Connect with your Cal.com account.",
    live: true,
    oauth: true,
    fields: [],
  },
  {
    id: "google",
    name: "Google Calendar",
    blurb: "Check availability and book appointments straight into your Google Calendar.",
    live: true,
    oauth: true,
    recommended: true,
    fields: [],
  },
  {
    id: "outlook",
    name: "Microsoft Calendar",
    blurb: "Check availability and book into your Outlook / Microsoft 365 calendar.",
    live: true,
    oauth: true,
    recommended: true,
    fields: [],
  },
];
