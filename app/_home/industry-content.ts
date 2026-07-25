import type { Metadata } from "next";

import { siteUrl, siteName } from "@/lib/site";
import type { HomeCopy } from "@/content/i18n/_home-copy";
import { enHome } from "@/content/i18n/en/pages/home";
import type { IndustrySlug } from "@/lib/marketing/industries";

// Per-industry landing pages reuse the home page layout verbatim (HomeClient)
// and only swap prose. Each entry supplies page metadata plus a partial
// HomeCopy override that industryHomeCopy() merges over enHome, so a field left
// out simply keeps the home page's wording.
//
// The overrides are intentionally substantial (a tailored H1, a full industry
// FAQ set, a tailored closing CTA, and use-case framing) so each page carries
// genuinely unique content rather than being a thin duplicate of the home page.
// The five original industries reuse the FAQ copy from the retired bespoke
// registry so no reviewed content is lost.

type IndustryOverrides = {
  metaDescription?: string;
  hero?: Partial<HomeCopy["hero"]>;
  testimonials?: Partial<HomeCopy["testimonials"]>;
  howItWorks?: Partial<HomeCopy["howItWorks"]>;
  useCases?: Partial<HomeCopy["useCases"]>;
  faq?: Partial<HomeCopy["faq"]>;
  footerCta?: Partial<HomeCopy["footerCta"]>;
};

export type IndustryContent = {
  /** <title> (absolute, brand suffix added here so it fits ~60 chars). */
  title: string;
  description: string;
  keywords: string[];
  overrides: IndustryOverrides;
};

export const INDUSTRY_CONTENT: Record<IndustrySlug, IndustryContent> = {
  dentists: {
    title: "AI Receptionist for Dentists | 24/7 Call Answering",
    description:
      "A 24/7 AI phone receptionist for dental practices. It books new patients into your calendar and triages after-hours toothache calls to your on-call rules.",
    keywords: [
      "AI receptionist for dentists",
      "dental answering service",
      "dental appointment scheduling",
      "after-hours dental emergency line",
      "new patient booking",
      "24/7 dental call answering",
      "HIPAA-ready dental phone AI",
      "multilingual dental receptionist",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your dental practice's calls 24/7, books new patients, and triages after-hours emergencies to your rules.",
      hero: {
        h1: "AI Receptionist for Dentists That Answers Every Call 24/7",
        usersTagline: "Every dental call answered 24/7.",
      },
      useCases: {
        sub: "Booked new-patient exams, after-hours emergency triage, and insurance questions - handled on every call, in 25+ languages, and synced to your calendar and CRM.",
      },
      faq: {
        heading: "Dental practice questions, answered",
        items: [
          { q: "Is it HIPAA-ready and are patient calls kept confidential?", a: "Yes. The service is HIPAA-ready and GDPR-first, hosted in the EU. All call data is encrypted, and it is never sold or used to train external models. You set the escalation and confidentiality rules the AI follows on every call." },
          { q: "Can it handle a real dental emergency?", a: "The AI is not a clinician and does not diagnose. It asks the screening questions you define, directs true emergencies to appropriate care per your rules, and books urgent slots for cases that can wait. You decide exactly how it triages and when it escalates to a human." },
          { q: "Will it book directly into the software my front desk uses?", a: "It books into your calendar during the call with two-way sync for Google Calendar, Outlook or Microsoft 365, and Calendly. It also connects to HubSpot, Salesforce, and thousands of apps through Zapier, so bookings and lead details flow where your team already works." },
          { q: "What happens when it does not know the answer?", a: "It admits when it does not know rather than guessing, then follows your rules: take a message or transfer to a human. You brief it on your hours, services, prices, and FAQs up front, so it answers the common questions accurately and hands off the rest." },
          { q: "Can it answer more than one patient at a time?", a: "Yes. It answers unlimited calls at once, so there is no busy signal and no hold queue. That covers overflow when the front desk is chairside and every call that comes in after hours or on weekends." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and goes live in about 10 minutes after you brief it on your practice. It is free to start with no card. The Solo plan is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number, and Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Never miss another new-patient call.",
        body: "Answer every call 24/7, book new patients into your calendar, and triage after-hours emergencies to your on-call rules. Free to start, EU-hosted, live in about 10 minutes.",
      },
    },
  },

  restaurants: {
    title: "AI Receptionist for Restaurants | 24/7 Call Answering",
    description:
      "AI phone agent for restaurants: answers 24/7, books reservations and takeout orders, handles menu questions, and texts a summary after each call.",
    keywords: [
      "AI receptionist for restaurants",
      "restaurant phone answering service",
      "restaurant reservation call handling",
      "takeout order phone AI",
      "restaurant virtual receptionist",
      "reduce no-show reservations",
      "multilingual restaurant phone",
      "after-hours restaurant calls",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your restaurant's calls 24/7, books reservations and to-go orders, and sends the details to your host stand.",
      hero: {
        h1: "AI Receptionist for Restaurants That Never Misses a Booking",
        usersTagline: "Every reservation call answered 24/7.",
      },
      useCases: {
        sub: "Peak-hour reservations, to-go orders, and large-party requests captured on every call, in 25+ languages, and sent straight to your host stand.",
      },
      faq: {
        heading: "Restaurant questions, answered",
        items: [
          { q: "Can it actually take reservations and put them on our calendar?", a: "Yes. It books reservations during the call with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly. After each call it also texts and emails you a transcript and summary so the host stand has the party size, time, and any notes like allergies." },
          { q: "Does it replace our POS or online ordering system?", a: "No. It is not a full POS. It captures takeout and to-go order details over the phone and routes them to your host stand or team through the call summary. For live menu availability and payment you still use your existing systems." },
          { q: "What happens when it does not know an answer?", a: "It admits when it does not know rather than guessing. Based on the rules you set, it can transfer the call to a person or take a message and send you the details, so a guest is never given wrong information about the menu or a booking." },
          { q: "Can it handle guests who do not speak English?", a: "Yes. It speaks more than 25 languages and switches language mid-call based on the caller. A guest who starts in Spanish or Mandarin can book a table without switching to English." },
          { q: "How does it help with no-shows?", a: "After the booking call it texts or emails a confirmation with the time and party size, so guests have the details in hand. On the Team plan, outbound calls and campaigns let you send reminders before the shift. It captures and routes bookings; it does not charge cards or hold deposits itself." },
          { q: "How fast can we set it up and what does it cost?", a: "It is self-serve with no code and usually live in about 10 minutes. You brief it on your hours, menu, prices, FAQs, and escalation rules. It is free to start with no card. Solo is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number. Team is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
        ],
      },
      footerCta: {
        heading: "Turn missed calls into booked tables.",
        body: "Answer every call during the rush and after you close, take reservations and to-go orders, and capture catering leads in 25+ languages. Free to start, live in about 10 minutes.",
      },
    },
  },

  ecommerce: {
    title: "AI Receptionist for E-commerce | 24/7 Buyer Support",
    description:
      "AI phone support for online stores. Answers buyer calls 24/7, handles order status, returns, and shipping questions, and captures leads while you sleep.",
    keywords: [
      "AI receptionist for e-commerce",
      "online store phone support",
      "order status phone AI",
      "ecommerce customer service automation",
      "returns and refunds phone support",
      "shopify store answering service",
      "24/7 buyer support line",
      "multilingual ecommerce support",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your online store's calls 24/7, handles order status, returns, and shipping questions, and captures every buyer.",
      hero: {
        h1: "AI Support Line That Answers Every Store Call 24/7",
        usersTagline: "Every buyer call answered 24/7.",
      },
      useCases: {
        sub: "Order status, returns and shipping questions, and pre-sale help handled on every call, in 25+ languages, with the details pushed to your helpdesk and CRM.",
      },
      faq: {
        heading: "Online store questions, answered",
        items: [
          { q: "Can it look up a customer's order status?", a: "It collects the order number and details the caller gives, answers from the policies and FAQs you brief it on, and can route the request to your team or helpdesk with a full summary. For live order lookups it hands the details to the people and tools that already have that data, so buyers are never given a wrong status." },
          { q: "Does it handle returns, refunds, and shipping questions?", a: "Yes. You brief it on your returns window, refund policy, and shipping timelines, and it answers those questions the same way every time. When a case needs a human decision, it captures the order and reason and routes it to your team by text and email." },
          { q: "Will it work for buyers who do not speak English?", a: "Yes. It speaks 25+ languages and switches language mid-call based on the caller, so international buyers get help in their own language instead of hanging up or emailing and waiting." },
          { q: "What happens when a question is outside its scope?", a: "It admits when it does not know rather than guessing, then follows your rules: take a message, capture the order details, or transfer to a person. You get a transcript and summary after every call, so nothing about an order is lost." },
          { q: "Can it capture leads and pre-sale questions?", a: "Yes. When a shopper calls with a pre-sale question, it answers from your product brief, captures their name and interest, and drops the lead into HubSpot, Salesforce, or your CRM through Zapier, so a phone call never becomes a lost sale." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and goes live in about 10 minutes once you brief it on your policies and FAQs. It is free to start with no card. Solo is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one number, and Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Support every buyer, day and night.",
        body: "Answer order-status, returns, and shipping calls 24/7, capture pre-sale leads, and push every detail to your helpdesk in 25+ languages. Free to start, live in about 10 minutes.",
      },
    },
  },

  "law-firms": {
    title: "AI Receptionist for Law Firms | 24/7 Intake",
    description:
      "AI phone receptionist for law firms. Answers calls 24/7, screens by practice area, takes client intake, and books consultations into your calendar.",
    keywords: [
      "ai receptionist for law firms",
      "legal intake answering service",
      "24/7 attorney answering service",
      "law firm virtual receptionist",
      "legal client intake automation",
      "after hours legal answering service",
      "law firm appointment booking",
      "legal lead capture",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your law firm's calls 24/7, screens by practice area, takes client intake, and books consultations into your calendar.",
      hero: {
        h1: "AI Receptionist for Law Firms That Answers Every Call 24/7",
        usersTagline: "Every new-client call answered 24/7.",
      },
      useCases: {
        sub: "24/7 new-client intake, practice-area screening, and consultation booking on every call, in 25+ languages, with the matter captured before they call the next firm.",
      },
      faq: {
        heading: "Law firm questions, answered",
        items: [
          { q: "Does the AI give legal advice to callers?", a: "No. The AI does not give legal advice and does not create an attorney-client relationship. It captures intake, screens by practice area, and schedules consultations. It is briefed to say so clearly on the call and to hand anything requiring judgment to your attorneys." },
          { q: "How does it handle confidentiality and client data?", a: "All call data is encrypted and is never sold or used to train external models. The service is EU-hosted, GDPR-first, and HIPAA-ready. Transcripts and summaries go only to the people you designate at your firm." },
          { q: "Can it help with conflict-of-interest checks?", a: "It captures the caller's name, the opposing party, and matter details, and can flag a potential conflict to a human before intake proceeds based on rules you set. The final conflict check stays with your firm. The AI gathers the information and routes it." },
          { q: "What happens with an urgent matter after hours?", a: "You define the escalation rules. The AI can transfer an urgent caller to an on-call attorney, or take a detailed priority message and text and email it to you immediately, so time-sensitive matters like arrests or filing deadlines are not missed." },
          { q: "Will it book straight into our calendar?", a: "Yes. It books consultations during the call with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly, so it only offers slots that are actually open and updates your calendar in real time." },
          { q: "How long does setup take and what does it cost?", a: "You can be live in about 10 minutes with no code. You brief it on your hours, practice areas, intake questions, and escalation rules. It is free to start with no card. Solo is EUR 99 per month for 1,000 talk minutes and one number. Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Answer every prospective client first.",
        body: "Take clean intake and book the consultation before they reach the next firm, 24/7 and in 25+ languages. Free to start, EU-hosted, live in about 10 minutes.",
      },
    },
  },

  "home-services": {
    title: "AI Receptionist for Home Services | 24/7 Answering",
    description:
      "An AI phone agent for plumbers, HVAC, electricians, and trades. Answers every call 24/7, qualifies the job, books into your calendar, and texts you the details.",
    keywords: [
      "AI receptionist for home services",
      "24/7 call answering for plumbers",
      "HVAC answering service",
      "electrician call answering",
      "after-hours emergency intake",
      "trades appointment booking",
      "roofer lead capture",
      "AI phone agent for contractors",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your calls 24/7 while you are on the tools, qualifies the job, books it into your calendar, and texts you the details.",
      hero: {
        h1: "AI Receptionist for Home Services That Answers Every Call 24/7",
        usersTagline: "Every job call answered 24/7.",
      },
      useCases: {
        sub: "Answered while you are on the tools, after-hours emergency intake, and jobs qualified and booked on every call, in 25+ languages, and texted to you to dispatch.",
      },
      faq: {
        heading: "Home services questions, answered",
        items: [
          { q: "Can it handle emergency calls like a burst pipe or no heat?", a: "Yes. You set the escalation rules, and it flags urgent calls as emergencies, captures the address and problem, and either transfers to a human or notifies your on-call tech per those rules. It also texts you the job summary right away so you can dispatch. It routes and escalates the call, it does not send a truck itself." },
          { q: "How does it book jobs into my schedule?", a: "It books appointments straight into your calendar during the call, with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly. Your schedule stays accurate with no double-entry, and you get a transcript and summary after every call." },
          { q: "What happens when several people call during a busy spell?", a: "It answers unlimited calls at once, so a seasonal rush all gets through in parallel. There is no busy signal and no hold queue, whether it is overflow during the day or the first cold snap of the season." },
          { q: "What if a caller asks something it does not know?", a: "It admits when it does not know rather than bluffing. You brief it on your hours, services, prices, and FAQs, and you set the rules for when it transfers to a human or takes a message." },
          { q: "How long does it take to set up?", a: "It is self-serve with no code and goes live in about 10 minutes. You brief it on your business: hours, services, prices, common questions, and your escalation rules for emergencies and after-hours." },
          { q: "What does it cost?", a: "You can start free with no card. The Solo plan is EUR 99 per month for 1,000 talk minutes, then EUR 0.09 per extra minute, with one phone number. The Team plan is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
        ],
      },
      footerCta: {
        heading: "Catch every job you cannot answer.",
        body: "Answer every call while you are on the tools or after hours, qualify the job, and book it into your calendar in 25+ languages. Free to start, live in about 10 minutes.",
      },
    },
  },

  "property-management": {
    title: "AI Receptionist for Property Management | 24/7",
    description:
      "An AI phone agent for property managers that answers tenant maintenance calls 24/7, triages emergencies, books showings, and captures leasing leads.",
    keywords: [
      "AI receptionist for property management",
      "property management answering service",
      "tenant maintenance call answering",
      "after-hours property management calls",
      "leasing inquiry answering service",
      "maintenance emergency triage line",
      "showing scheduling automation",
      "multilingual tenant support",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers tenant maintenance calls 24/7, triages emergencies, books showings, and captures leasing leads across your portfolio.",
      hero: {
        h1: "AI Receptionist for Property Management, Every Call Answered 24/7",
        usersTagline: "Every tenant and prospect answered 24/7.",
      },
      useCases: {
        sub: "Emergency triage, routine maintenance tickets, and booked showings on every call, in 25+ languages, logged with unit and details across your whole portfolio.",
      },
      faq: {
        heading: "Property management questions, answered",
        items: [
          { q: "Can it tell an emergency from a routine maintenance request?", a: "Yes. You brief it on which situations are urgent, such as leaks, no heat, gas smells, or lockouts, and how to handle them. Urgent calls are escalated to on-call maintenance or a human on your rules, while routine requests are logged as tickets with the unit and details. If it is ever unsure, it can transfer or take a message rather than guess." },
          { q: "Does it book showings into our calendar?", a: "Yes. It books appointments directly into Google Calendar, Outlook, or Calendly during the call, with two-way sync so an already-taken slot never gets double-booked. Prospect details can also flow into HubSpot or Salesforce." },
          { q: "What happens to the caller's information and is it secure?", a: "All call data is encrypted, hosted in the EU, and handled GDPR-first. It is never sold or used to train external models. The product is also HIPAA-ready if you handle sensitive resident information." },
          { q: "Can it handle tenants who speak another language?", a: "Yes. It speaks 25+ languages and switches language mid-call based on the caller, so a resident more comfortable in Spanish, Polish, or another language is understood and their request is logged correctly." },
          { q: "What if a call is too complex for the AI?", a: "It admits when it does not know rather than bluffing, and follows your rules to transfer to a human or take a message. After every call you get a transcript and summary by text and email, so nothing is lost." },
          { q: "How long does setup take and do I need a developer?", a: "It is self-serve with no code and is usually live in about 10 minutes. You brief it on your hours, services, policies, FAQs, and escalation rules. You can start free with no card. The Solo plan is EUR 99 per month and Team is EUR 299 per month." },
        ],
      },
      footerCta: {
        heading: "A calm front desk for your whole portfolio.",
        body: "Triage emergencies, log routine tickets, and book showings 24/7 so no tenant or prospect hits voicemail, in 25+ languages. Free to start, live in about 10 minutes.",
      },
    },
  },

  medical: {
    title: "AI Receptionist for Medical Practices | 24/7 Answering",
    description:
      "A 24/7 AI medical answering service for clinics and private practices. It schedules patients, covers after-hours calls, and escalates urgent cases to your rules.",
    keywords: [
      "medical answering service",
      "AI receptionist for medical office",
      "answering service for doctors",
      "after-hours answering service medical",
      "clinic answering service",
      "patient appointment scheduling AI",
      "HIPAA-ready medical phone AI",
      "24/7 medical call answering",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your practice's calls 24/7, schedules patients into your calendar, and routes after-hours and urgent calls to your protocols.",
      hero: {
        h1: "AI Receptionist for Medical Practices, Answering 24/7",
        usersTagline: "Every patient call answered 24/7.",
      },
      useCases: {
        sub: "Appointment scheduling, refill and callback messages routed to your rules, and after-hours coverage per your protocols - on every call, in 25+ languages.",
      },
      faq: {
        heading: "Medical practice questions, answered",
        items: [
          { q: "Is it HIPAA-ready and how is patient data handled?", a: "The service is HIPAA-ready and GDPR-first, hosted in the EU. Call data is encrypted, never sold, and never used to train external models. You control the confidentiality and escalation rules the AI follows on every patient call." },
          { q: "What does it do with a medical emergency?", a: "It is not a clinician and never gives medical advice. You define the protocol: callers describing an emergency are told to hang up and call 911, or are routed to your on-call line - exactly as your practice specifies. Everything else follows your triage rules, with a message or transfer when it is unsure." },
          { q: "Can it schedule patients into the system we already use?", a: "It books into your calendar during the call with two-way sync for Google Calendar, Outlook or Microsoft 365, and Calendly, so slots never double-book. Patient details and messages can also flow to your CRM or thousands of apps through Zapier." },
          { q: "Can it handle refill requests and results calls?", a: "It takes structured messages for refills, results, and callback requests and routes them to the right inbox or staff member by your rules. It does not access medical records or give clinical information - it captures the request accurately so your team can act on it." },
          { q: "Can it answer several patients at once, even at lunch or after hours?", a: "Yes. It answers unlimited simultaneous calls, so there is no busy signal at peak times, and it covers lunch hours, evenings, weekends, and holidays identically. Patients who would have hit voicemail get answered and scheduled instead." },
          { q: "How long does setup take and what does it cost?", a: "Setup is self-serve with no code and typically live in about 10 minutes after you brief it on your practice, hours, and protocols. You can start free with no card. The Solo plan is EUR 99 per month for 1,000 talk minutes, and Team is EUR 299 per month for 3,000 minutes and three numbers." },
        ],
      },
      footerCta: {
        heading: "Stop losing patients to voicemail.",
        body: "Answer every patient call 24/7, schedule into your calendar, and route urgent calls to your protocols. Free to start, EU-hosted, live in about 10 minutes.",
      },
    },
  },

  "real-estate": {
    title: "AI Receptionist for Real Estate | 24/7 Lead Capture",
    description:
      "A 24/7 AI answering service for real estate agents and brokerages. It captures every buyer and seller call, qualifies the lead, and books showings into your calendar.",
    keywords: [
      "real estate answering service",
      "AI receptionist for real estate",
      "answering service for realtors",
      "real estate lead capture",
      "virtual receptionist for real estate agents",
      "showing scheduling automation",
      "after-hours real estate calls",
      "24/7 answering service real estate",
    ],
    overrides: {
      metaDescription:
        "AI Receptionist Now answers buyer and seller calls 24/7, qualifies every lead, books showings into your calendar, and texts you a summary after each call.",
      hero: {
        h1: "AI Receptionist for Real Estate That Never Misses a Lead",
        usersTagline: "Every buyer and seller answered 24/7.",
      },
      useCases: {
        sub: "Listing inquiries answered, buyers and sellers qualified, and showings booked straight into your calendar - on every call, day or night, in 25+ languages.",
      },
      faq: {
        heading: "Real estate questions, answered",
        items: [
          { q: "Can it book showings directly into my calendar?", a: "Yes. It checks your real availability, offers open slots, and books the showing during the call with two-way sync for Google Calendar, Outlook, and Calendly, so you are never double-booked. You get a text summary with the caller's details right after." },
          { q: "Will callers know they are talking to an AI?", a: "You decide how it introduces itself, and a brief disclosure up front is the honest default. Voices are natural enough that short inquiry calls flow normally, and callers who want a human can be transferred to you or your team on your rules." },
          { q: "How does it qualify a buyer or seller lead?", a: "You define the intake questions - timeline, financing readiness, area, price range for buyers; address and timeline for sellers - and it asks them conversationally, then texts and emails you the structured answers. Leads can flow into HubSpot, Salesforce, or your CRM via Zapier." },
          { q: "Is it safe to use under fair housing rules?", a: "You control the script, and the safe configuration is factual intake only: availability, timing, financing readiness, and contact details. It does not steer callers toward or away from neighborhoods or answer questions your compliance rules exclude, and you can review every transcript." },
          { q: "What happens when I am with a client and two calls come in?", a: "It answers unlimited calls at once, so both callers get through - no voicemail, no busy signal. Urgent calls can be transferred to you live per your rules, and everything else arrives as a transcript and summary you can act on between appointments." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and usually live in about 10 minutes: brief it on your listings focus, service area, and intake questions, and forward your existing number. You can start free with no card. The Solo plan is EUR 99 per month, and Team is EUR 299 per month." },
        ],
      },
      footerCta: {
        heading: "The deal goes to whoever answers first.",
        body: "Capture every buyer and seller call 24/7, qualify the lead, and book the showing before they dial the next agent. Free to start, live in about 10 minutes.",
      },
    },
  },
};

/** Merge an industry's partial overrides over the English home copy. */
export function industryHomeCopy(slug: IndustrySlug): HomeCopy {
  const o = INDUSTRY_CONTENT[slug].overrides;
  return {
    ...enHome,
    metaDescription: o.metaDescription ?? enHome.metaDescription,
    hero: { ...enHome.hero, ...(o.hero ?? {}) },
    testimonials: { ...enHome.testimonials, ...(o.testimonials ?? {}) },
    howItWorks: { ...enHome.howItWorks, ...(o.howItWorks ?? {}) },
    useCases: { ...enHome.useCases, ...(o.useCases ?? {}) },
    faq: { ...enHome.faq, ...(o.faq ?? {}) },
    footerCta: { ...enHome.footerCta, ...(o.footerCta ?? {}) },
  };
}

/** Metadata for an industry landing page. Canonical is the top-level /slug. */
export function industryMetadata(slug: IndustrySlug): Metadata {
  const c = INDUSTRY_CONTENT[slug];
  const url = `${siteUrl}/${slug}`;
  return {
    // absolute: keep the brand suffix off so the title fits Google's ~60 chars.
    title: { absolute: c.title },
    description: c.description,
    keywords: c.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: c.title,
      description: c.description,
      type: "website",
      url,
      siteName,
      images: [{ url: `${siteUrl}/opengraph-image.png`, width: 1200, height: 630, alt: c.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: [`${siteUrl}/opengraph-image.png`],
    },
  };
}
