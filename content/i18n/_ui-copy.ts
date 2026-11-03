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
  /** The branded 404 page. */
  notFound: {
    /** Tab title; the layout template adds " | AI Receptionist Now". */
    metaTitle: string;
    title: string;
    body: string;
    /** Button back to the home page. */
    home: string;
    /** Lead-in of the did-you-mean line, without the trailing space. */
    didYouMean: string;
    /** Joins the last two suggestions. */
    or: string;
    /** Label of the pricing suggestion (nav.pricing is upper case). */
    pricing: string;
  };
  footer: {
    resources: string;
    industries: string;
    compare: string;
    aiInformation: string;
    dataProtection: string;
    terms: string;
    support: string;
    blog: string;
    answers: string;
    /** Footer link to the 24/7 article. */
    receptionist247: string;
    /** Heading over the Ask-AI buttons. */
    askAi: string;
    /** Accessible name of each Ask-AI button. Must contain "{name}" (ChatGPT, Claude...). */
    askAiProvider: string;
    /** Label of the ElevenLabs badge. */
    voicePartner: string;
    /** Short name of the regulation, shown bold inside gdprCompliant. */
    gdprMark: string;
    /** Must contain gdprMark exactly once. */
    gdprCompliant: string;
    /** Accessible name for the language menu. */
    language: string;
  };
  /** The sign-in dialog (app/components/AuthDialogBody.tsx). */
  auth: {
    /** Accessible name of the close button. */
    close: string;
    welcome: string;
    /** Subtitle when the opener passes no description. */
    defaultDescription: string;
    /** Subtitle when the dialog opens in sign-up mode and the opener passes no description. */
    signupDescription: string;
    continueGoogle: string;
    continueApple: string;
    /** Shown on the Google and Apple buttons while the redirect starts. */
    redirecting: string;
    /** Divider between the social buttons and the email form. */
    or: string;
    emailLabel: string;
    /** Validation text for an empty required field (email and code). */
    required: string;
    /** Validation text for a malformed email address. */
    emailInvalid: string;
    continueEmail: string;
    sendingCode: string;
    privacy: string;
    codeTitle: string;
    /** Must contain "{email}" exactly once. */
    codeSent: string;
    /** Validation text for a code that is not 6 digits. */
    codePattern: string;
    verify: string;
    verifying: string;
    differentEmail: string;
    /** One text per key of AuthErrorKey (lib/auth-error-key.ts). Raw GoTrue text is never shown. */
    errors: {
      invalidCode: string;
      rateLimited: string;
      invalidEmail: string;
      notConfigured: string;
      generic: string;
    };
  };
}
