// Shared site chrome: header nav and footer. This is the "ui" pageId that the
// publish gate already treats as a hard dependency of every localized page -
// a perfectly translated article inside an English header is exactly the
// half-translated leak the gate exists to prevent.
//
// SCOPE: labels only. Hrefs stay in the components; they are structural, and a
// localized href is produced by localizedHref(), not by a translator.

export interface UiCopy {
  nav: {
    industries: string;
    pricing: string;
    signIn: string;
    startNow: string;
    dashboard: string;
    logout: string;
  };
  footer: {
    resources: string;
    industries: string;
    compare: string;
    aiInformation: string;
    dataProtection: string;
    /** Accessible name for the language menu. */
    language: string;
  };
}
