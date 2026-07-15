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
// Connects via OAuth only ("Continue with…") once the app's OAuth env creds are
// set - no manual credential entry. Legacy Cal.com API-key rows in the DB still
// work (the adapter sends api_key as a Bearer token).
//
// This catalog is the connect surface, not the whole story: the google/outlook
// adapters, OAuth defs, and icons stay in the codebase, so an existing row for
// a provider that is not listed here keeps booking. Nothing off-catalog can be
// connected, and (as with `calendly`) nothing off-catalog renders here either -
// so re-adding an entry is all it takes to bring one back.
export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  {
    id: "calcom",
    name: "Cal.com",
    blurb: "Open-source scheduling. Connect with your Cal.com account.",
    live: true,
    oauth: true,
    fields: [],
  },
];
