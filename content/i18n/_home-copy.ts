// Visible prose of the home page, extracted so it can be translated.
//
// This lives next to _types.ts (which owns review state) rather than inside it,
// because the two change for different reasons: _types.ts describes the publish
// gate, this describes page content. A locale file is a plain object literal of
// this shape, so a translator never has to touch TSX.
//
// SCOPE: user-visible prose ONLY. Anything structural stays in the component:
// className strings, inline style values, image `src` paths, `href` targets,
// icon names, schema.org "@type" values, data-* attributes, and the step
// numerals ("01"/"02"/"03"), which are the same in every language.

export interface HomeUseCaseCopy {
  title: string;
  desc: string;
}

export interface HomeTestimonialCopy {
  quote: string;
  /** A person's name is never translated; it is here so the card stays one unit. */
  name: string;
  role: string;
}

export interface HomeFaqCopy {
  q: string;
  a: string;
}

export interface HomeStepCopy {
  title: string;
  desc: string;
  imageAlt: string;
}

export interface HomeCopy {
  /**
   * Meta description for the localized page's <title> snippet and OG/Twitter
   * cards. NOT rendered in the page body - it feeds generateMetadata in
   * app/[locale]/page.tsx. Keep it <=160 characters. The English entry (enHome)
   * is the translation reference; the live English home uses the site-wide
   * siteDescription instead, so enHome.metaDescription is reference-only.
   */
  metaDescription: string;
  hero: {
    h1: string;
    phonePlaceholder: string;
    /** Idle label of the test-call button. */
    ctaCall: string;
    /** Label while a test call is being placed. */
    ctaCalling: string;
    /** Status lines shown under the button. */
    invalidPhone: string;
    callPlaced: string;
    callFailed: string;
    callFailedRetry: string;
    /**
     * The consent line is split around two inline links. Rendered as:
     *   before <contactLink> between <privacyLink> after
     * The link targets themselves are structural and stay in the component.
     */
    consent: {
      before: string;
      contactLink: string;
      between: string;
      privacyLink: string;
      after: string;
    };
    /** Alt text for the four social-proof avatars, in render order. */
    avatarAlts: string[];
    usersCount: string;
    usersTagline: string;
    ratingHeadline: string;
    ratingCount: string;
    ratingScore: string;
  };
  testimonials: {
    heading: string;
    sub: string;
    /** Same order and length as the photo list in the component. */
    items: HomeTestimonialCopy[];
  };
  howItWorks: {
    heading: string;
    sub: string;
    /** Exactly three steps, in render order. */
    steps: HomeStepCopy[];
  };
  useCases: {
    heading: string;
    sub: string;
    cta: string;
    /** Same order and length as the icon/href list in the component. */
    items: HomeUseCaseCopy[];
  };
  faq: {
    heading: string;
    /** Drives both the visible accordion and the FAQPage JSON-LD. */
    items: HomeFaqCopy[];
  };
  footerCta: {
    heading: string;
    body: string;
    cta: string;
  };
}
