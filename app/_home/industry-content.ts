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

/**
 * The block of prose that exists ONLY on this industry's page, rendered under
 * the hero by IndustryBrief.
 *
 * Why it is required rather than optional: the override slots above only swap an
 * H1, a subtitle, an FAQ, and a closing CTA, which measured out at 79% of each
 * industry page's text being identical to the home page and roughly 70% to every
 * other industry page. A required field makes it a compile error to add a ninth
 * industry that is just the home page with a new H1.
 *
 * Ground every sentence in behaviour the product actually has (answering,
 * booking into the connected calendar, transfer rules, languages, EU hosting).
 * Do not invent statistics - no "X% of callers hang up" figures.
 */
export type IndustryBrief = {
  /** H2. Name the vertical explicitly, do not reuse the home page's phrasing. */
  heading: string;
  /** 2-3 sentences on how the phone actually behaves in this business. */
  intro: string;
  /** The call types this vertical really gets, and what happens on each. */
  callTypes: { name: string; detail: string }[];
  /** What it costs this specific business when those calls go unanswered. */
  stakes: { heading: string; body: string };
  /**
   * How it attaches to the phone this business already runs - forward, second
   * number, or (Team) their own SIP. The SXO pass found the only mention of
   * this anywhere on the site was a four-word step in a graphic, while it is a
   * top-3 objection for every persona.
   */
  phoneSetup: { heading: string; body: string };
  /**
   * The named software this vertical runs, and honestly which of it we write
   * into. Only CALENDAR_PROVIDERS (Google, Microsoft, Cal.com) and the signed
   * webhook in call-engine/integrations/crm.ts exist - never claim a connector
   * into practice-management, dispatch or agency software.
   */
  stack: { heading: string; intro: string; notes: string[] };
  /** The confidentiality or regulatory frame this vertical actually works under. */
  compliance: { heading: string; body: string };
};

export type IndustryContent = {
  /** <title> (absolute, brand suffix added here so it fits ~60 chars). */
  title: string;
  description: string;
  keywords: string[];
  brief: IndustryBrief;
  overrides: IndustryOverrides;
};

export const INDUSTRY_CONTENT: Record<IndustrySlug, IndustryContent> = {
  dentists: {
    title: "AI Receptionist for Dentists | 24/7 Call Answering",
    description:
      "A 24/7 AI phone receptionist for dental practices. It books new patients into your calendar and triages after-hours toothache calls to your on-call rules.",
    keywords: [
      "AI receptionist for dentists",
      "AI receptionist for dental practices",
      "dental appointment scheduling",
      "after-hours dental emergency line",
      "new patient booking",
      "24/7 dental call answering",
      "HIPAA-ready dental phone AI",
      "multilingual dental receptionist",
    ],
    brief: {
      heading: "The calls a dental practice actually gets",
      intro:
        "A dental phone does not ring evenly. It spikes at opening, goes quiet while the front desk is chairside, and then fills with the calls nobody is there to take: the 9 p.m. toothache, the Saturday broken crown, the new patient who found you on a map and will call the next practice if nobody picks up. The AI answers all of them on the first ring, at any hour, without the front desk leaving a patient.",
      callTypes: [
        {
          name: "New patient enquiries",
          detail:
            "It takes the name, the reason for the visit, and the insurance situation, then offers real openings from your connected calendar and books the exam during the call. Google Calendar, Microsoft 365 or Outlook, and Cal.com sync both ways, so the slot is gone the moment it is taken and you do not double-book.",
        },
        {
          name: "After-hours pain calls",
          detail:
            "It asks the screening questions you wrote, not clinical ones of its own. True emergencies go where your on-call rules say they go; the rest get an urgent slot the next working morning and a text confirming it. The AI does not diagnose and will say so.",
        },
        {
          name: "Reschedules and cancellations",
          detail:
            "It moves or releases the appointment in the calendar during the call, which is the difference between a gap you can refill and a chair sitting empty because the voicemail was not checked until Monday.",
        },
        {
          name: "Insurance and price questions",
          detail:
            "It answers from the brief you gave it about your plans, fees, and payment options. When a question falls outside what you briefed it on, it says it does not know and follows your rule: take a message or transfer to a human.",
        },
        {
          name: "Calls in another language",
          detail:
            "It speaks 25+ languages and switches to the caller's without being asked, which matters for practices whose patient list does not all share one first language.",
        },
      ],
      stakes: {
        heading: "Why an unanswered dental call is expensive",
        body: "A missed new-patient call is not a lost appointment, it is a lost patient relationship, and a dental patient is a recurring one: exams, hygiene visits, and whatever treatment follows over years. The caller who reaches voicemail at 9 p.m. rarely calls back in the morning, because by then they have already reached a practice that answered. Every call is transcribed, summarised, and sent to you afterwards, so you can see exactly which enquiries came in overnight and what was promised.",
      },
      phoneSetup: {
        heading: "Connecting it to the practice line",
        body: "You keep the number on your cards, your map listing and the sign outside. In the practice phone system you set a forward: either everything, or only the calls you would otherwise lose - after hours, at weekends, and when reception has not picked up in four or five rings because the nurse is chairside. Nothing is ported, nothing is disconnected, and the handsets at the front desk ring exactly as they do now; the AI only ever answers what the forward hands it. Most practices start with after-hours and unanswered-overflow, read a fortnight of transcripts, then widen it. If you would rather keep the streams apart, take a second number for the out-of-hours line and leave the main one untouched. Turning it off again is one setting in your phone system, not a migration.",
      },
      stack: {
        heading: "What it writes into, and what it does not",
        intro: "Treat any AI receptionist that claims to write into your practice-management software with suspicion. Here is exactly what this one touches.",
        notes: [
          "Appointments go into Google Calendar, Microsoft 365 or Outlook, or Cal.com. You connect them with OAuth and they sync both ways, so a slot taken on the phone at 9 p.m. is already gone when the front desk opens the diary.",
          "It does not write into Dentrix, Eaglesoft, Open Dental or SOE Exact, and neither does any other AI receptionist without a bridge somebody has to build first. Saying otherwise just moves the double entry somewhere you will not notice it.",
          "The pattern that works is a dedicated bookings calendar reception clears each morning. Every call arrives as a summarised transcript by email, so the confirmed ones get moved into the chart software as part of the day-start routine, with the caller's own words in front of you.",
          "If a system on your side can accept an HTTPS webhook, every call summary and transcript can be posted to it with a signature, which is how practices feed new-patient details into their own intake tooling.",
        ],
      },
      compliance: {
        heading: "Patient calls, recorded and written down",
        body: "Calls are transcribed and summarised, so what a patient says about a symptom or a medication becomes text. That text is encrypted in transit and at rest, hosted in the EU, never sold, and never used to train external models. Two decisions are worth making before you route a live patient line: how much clinical detail you actually want collected - most practices restrict it to the problem in the patient's own words plus how urgent it is - and who on the team can open transcripts. The AI does not diagnose, does not give clinical advice, and will say so and follow your escalation rule instead of improvising. If you are a covered entity in the US, treat that as a conversation to have with us before go-live rather than a checkbox. The full data terms are in our privacy policy.",
      },
    },
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
          { q: "Will it book directly into the software my front desk uses?", a: "It books into your calendar during the call, with two-way sync for Google Calendar, Microsoft 365 or Outlook, and Cal.com. It does not write into Dentrix, Eaglesoft or Open Dental, and no AI receptionist does without a bridge somebody builds first. The pattern that works is that calendar plus the summary and full transcript emailed after every call, and a signed HTTPS webhook into your own intake tooling if you have one." },
          { q: "What happens when it does not know the answer?", a: "It admits when it does not know rather than guessing, then follows your rules: take a message or transfer to a human. You brief it on your hours, services, prices, and FAQs up front, so it answers the common questions accurately and hands off the rest." },
          { q: "Can it answer more than one patient at a time?", a: "On the Team plan it handles three calls at the same time; Solo answers one at a time. Either way there is no hold queue and no front desk to interrupt, so overflow while a nurse is chairside and every call that arrives after hours or at the weekend gets picked up rather than going to voicemail." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and goes live in about 10 minutes after you brief it on your practice. Both plans are month-to-month with a 30-day money-back guarantee. The Solo plan is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number, and Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Never miss another new-patient call.",
        body: "Answer every call 24/7, book new patients into your calendar, and triage after-hours emergencies to your on-call rules. EU-hosted, live in about 10 minutes, with a 30-day money-back guarantee.",
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
    brief: {
      heading: "What the phone does to a restaurant service",
      intro:
        "The phone rings hardest exactly when nobody can answer it. Seven to nine, every table turning, and the handset is behind the pass with a queue of people waiting to be seated. So the calls stack up, ring out, and the table that wanted a booking for Friday goes to whoever picked up instead. The AI answers on the first ring through all of it, and on Team it handles three calls at the same time, so the rush does not push callers to voicemail.",
      callTypes: [
        {
          name: "Reservations during service",
          detail:
            "It takes the party size, the date, the time, and the name, checks the connected calendar, and confirms in the same call. On the Team plan three of those conversations can run at once, which covers the overlapping calls that arrive in the same few minutes of a service.",
        },
        {
          name: "To-go and collection orders",
          detail:
            "It takes the order, repeats it back, and sends it to you as a written summary the moment the call ends. No mishearing over kitchen noise and no order pad that walked off.",
        },
        {
          name: "Opening hours and the same four questions",
          detail:
            "Do you do gluten free, is there parking, are dogs allowed, are you open on the bank holiday. It answers from what you briefed it on, in the caller's language, and stops those calls from interrupting service at all.",
        },
        {
          name: "Catering and private hire",
          detail:
            "These are your highest-value calls and the easiest to lose to a voicemail. It qualifies the enquiry, captures the date, headcount, and budget, and sends it to you as a summary and full transcript the moment the call ends - and to any system of yours that accepts a signed HTTPS webhook - so someone follows up while the caller is still interested.",
        },
        {
          name: "Calls after you close",
          detail:
            "Someone who calls at 11 p.m. to book next weekend is a booking, not a nuisance. The AI answers at that hour exactly as it does at noon.",
        },
      ],
      stakes: {
        heading: "The cost is a table, not a call",
        body: "A restaurant's missed call has an obvious price: a cover that stays empty on your busiest night. Diners do not leave voicemails and they do not call twice - they call the next place on the list, and if that one answers, you have lost the booking and possibly the repeat customer behind it. Because the calls you miss are concentrated in the hours you are fullest, the ones going unanswered are disproportionately the valuable ones.",
      },
      phoneSetup: {
        heading: "Connecting it to the line on the pass",
        body: "The phone behind the pass keeps its number. You forward it - all day, or only from the moment nobody has picked up in three rings, which in practice means the whole of service. Regulars who have had that number in their phone for ten years notice nothing; the difference is that at 7:40 p.m. the call gets answered instead of ringing out next to the grill. Nothing is ported and there is no gap in service. A second number is the other common shape here: keep the old line for suppliers and the local council, and put a bookings number on the website and your map listing so the two never collide. On Solo the AI answers one call at a time; on Team it takes three at once, which is the plan that matters if your phone stacks up between 6 and 8.",
      },
      stack: {
        heading: "Bookings, and where they land",
        intro: "Restaurants ask about this first and get vague answers. The honest version:",
        notes: [
          "It books into Google Calendar, Microsoft 365 or Outlook, or Cal.com, over OAuth and in both directions, so a table taken by phone blocks the slot immediately.",
          "It does not write into OpenTable, TheFork, SevenRooms or Resy. If your covers live in one of those, run the AI on a calendar you keep alongside it, or point its webhook at whatever you already use to reconcile the book.",
          "Every call - reservation, to-go order, catering enquiry, the supplier who rang during service - arrives as a summary and full transcript by email, so the party size, the allergy and the callback number are written down rather than remembered.",
          "Orders and enquiries can be posted to any HTTPS endpoint you control, signed, if you want them dropped into your own system rather than read from an inbox.",
        ],
      },
      compliance: {
        heading: "Allergies, deposits and what the AI is allowed to promise",
        body: "An allergy stated on the phone is the one detail you cannot afford to lose, and it is exactly the detail a scribbled note loses. It goes in the transcript verbatim and in the summary, attached to the booking, every time. Set the boundaries before you go live: whether the AI may quote menu prices, whether it may take a card or a deposit (it does not process payments, so the answer is a callback or a link you send), and what it says about substitutions and set menus. Anything you have not briefed it on, it says it does not know and follows your rule - message or transfer - rather than inventing a policy that lands on your staff. Call data is EU-hosted, encrypted, never sold and never used to train external models.",
      },
    },
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
          { q: "Can it actually take reservations and put them on our calendar?", a: "Yes. It books reservations during the call with two-way sync to Google Calendar, Microsoft 365 or Outlook, and Cal.com. After each call it also texts and emails you a transcript and summary so the host stand has the party size, time, and any notes like allergies." },
          { q: "Does it replace our POS or online ordering system?", a: "No. It is not a full POS. It captures takeout and to-go order details over the phone and routes them to your host stand or team through the call summary. For live menu availability and payment you still use your existing systems." },
          { q: "What happens when it does not know an answer?", a: "It admits when it does not know rather than guessing. Based on the rules you set, it can transfer the call to a person or take a message and send you the details, so a guest is never given wrong information about the menu or a booking." },
          { q: "Can it handle guests who do not speak English?", a: "Yes. It speaks more than 25 languages and switches language mid-call based on the caller. A guest who starts in Spanish or Mandarin can book a table without switching to English." },
          { q: "How does it help with no-shows?", a: "After the booking call it texts or emails a confirmation with the time and party size, so guests have the details in hand. On the Team plan, outbound calls and campaigns let you send reminders before the shift. It captures and routes bookings; it does not charge cards or hold deposits itself." },
          { q: "How fast can we set it up and what does it cost?", a: "It is self-serve with no code and usually live in about 10 minutes. You brief it on your hours, menu, prices, FAQs, and escalation rules. Both plans are month-to-month with a 30-day money-back guarantee. Solo is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number. Team is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
        ],
      },
      footerCta: {
        heading: "Turn missed calls into booked tables.",
        body: "Answer every call during the rush and after you close, take reservations and to-go orders, and capture catering leads in 25+ languages. Live in about 10 minutes, with a 30-day money-back guarantee.",
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
    brief: {
      heading: "Phone support for a shop that never closes",
      intro:
        "An online store trades around the clock but staffs a helpdesk during office hours, and the phone number on the contact page is the gap between the two. The calls that arrive outside those hours are rarely browsing questions. They are people who have already paid and want to know where their parcel is, or people about to pay who have one question first.",
      callTypes: [
        {
          name: "Where is my order",
          detail:
            "The single highest-volume call in e-commerce and the one that least needs a human. It takes the order number and the details you briefed it on, gives the caller a straight answer, and logs the contact so your helpdesk sees it.",
        },
        {
          name: "Returns, refunds, and exchanges",
          detail:
            "It walks the caller through your actual returns policy rather than a generic one, because you brief it on your windows, conditions, and who pays return postage. Anything outside the policy gets escalated to a human on your rules instead of being improvised.",
        },
        {
          name: "Pre-sale questions",
          detail:
            "Sizing, stock, compatibility, delivery dates. These calls come from people holding a full basket, so answering them at 10 p.m. is the difference between a completed checkout and an abandoned one.",
        },
        {
          name: "Peak and promotion spikes",
          detail:
            "Black Friday, a launch, a piece of press coverage: volume multiplies without warning. The AI answers around the clock without extra seats to hire, and on Team it takes three calls concurrently, so a good day does not turn into an unreachable one.",
        },
        {
          name: "Cross-border customers",
          detail:
            "If you ship internationally, your callers do not all speak your language. It handles 25+ of them, and the service is EU-hosted and GDPR-first, which matters when the caller is giving out an order number and an address.",
        },
      ],
      stakes: {
        heading: "Every unanswered call is a support ticket you still pay for",
        body: "The call you miss does not disappear. It becomes an email, a live-chat session, a chargeback dispute, or a one-star review about being unreachable - each of which costs more to resolve than the ninety seconds the phone call would have taken. Worse, an unanswered phone number on a checkout page is a trust signal in the wrong direction: shoppers use it to judge whether you are a real business before they hand over a card.",
      },
      phoneSetup: {
        heading: "Putting a phone number back on the site",
        body: "Most shops either bury the number or do not publish one, because a published number means somebody has to answer it. This is the setup that changes that calculation: take a new number, put it on the contact page and in the order-confirmation email, and let the AI answer it. Nobody has to staff a line. If you already publish a number, keep it and forward instead - all of it, or only what rings out after hours and at weekends, when a shopper in another timezone is looking at a delivery estimate and deciding whether to trust you. Nothing is ported and the existing line keeps working. Solo covers one number and one call at a time; Team covers three numbers, which is the shape for a shop running separate consumer and trade lines.",
      },
      stack: {
        heading: "Order status, and what it can actually see",
        intro: "The limit here is worth stating plainly, because it is where AI phone support usually oversells.",
        notes: [
          "It does not have a live connection into Shopify, WooCommerce, Magento or your 3PL, so it cannot read a specific order's tracking state mid-call unless you give it a way to.",
          "What it does well is everything around that: shipping windows, returns and refund policy, sizing, stock questions and pre-sale objections, all answered from the brief you write, in 25+ languages, at 2 a.m.",
          "For the calls that genuinely need the order record, it captures the order number, the email on the account and the exact problem, then follows your rule - callback slot, message, or transfer to a person - and sends the whole thing to your helpdesk as a signed webhook or an email summary.",
          "Callbacks and appointments go into Google Calendar, Microsoft 365 or Outlook, or Cal.com, both ways.",
        ],
      },
      compliance: {
        heading: "Customer data on a support call",
        body: "A support call collects an email address, an order number, sometimes an address - personal data under GDPR, from a caller who may be anywhere in the EU. It is encrypted in transit and at rest and hosted in the EU, never sold and never used to train external models, which is the part your DPO will ask about first. Two things to brief explicitly: that the AI must never read back full card details or take a payment over the phone (it cannot process one anyway), and what it is allowed to confirm about an account to someone who has not been verified. Left unbriefed it says it does not know and hands off, which is the safe failure. Your retention and access terms are in the privacy policy.",
      },
    },
    overrides: {
      metaDescription:
        "AI Receptionist Now answers your online store's calls 24/7, handles order status, returns, and shipping questions, and captures every buyer.",
      hero: {
        h1: "AI Receptionist for E-commerce That Answers Every Call 24/7",
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
          { q: "Can it capture leads and pre-sale questions?", a: "Yes. When a shopper calls with a pre-sale question, it answers from your product brief, captures their name and interest, and sends you the lead as a summary and transcript - and posts it to any system of yours that accepts a signed HTTPS webhook - so a phone call never becomes a lost sale." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and goes live in about 10 minutes once you brief it on your policies and FAQs. Both plans are month-to-month with a 30-day money-back guarantee. Solo is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one number, and Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Support every buyer, day and night.",
        body: "Answer order-status, returns, and shipping calls 24/7, capture pre-sale leads, and push every detail to your helpdesk in 25+ languages. Live in about 10 minutes, with a 30-day money-back guarantee.",
      },
    },
  },

  "law-firms": {
    title: "AI Receptionist for Law Firms | 24/7 Intake",
    description:
      "AI phone receptionist for law firms. Answers calls 24/7, screens by practice area, takes client intake, and books consultations into your calendar.",
    keywords: [
      "ai receptionist for law firms",
      "AI receptionist for attorneys",
      "AI legal intake receptionist",
      "law firm virtual receptionist",
      "legal client intake automation",
      "after hours legal answering service",
      "law firm appointment booking",
      "legal lead capture",
    ],
    brief: {
      heading: "Why legal intake calls do not wait",
      intro:
        "People do not ring a solicitor casually. They ring after the accident, after the letter arrives, after they are dismissed - and they ring several firms in one sitting until somebody picks up. In legal work the firm that answers first is very often the firm that gets instructed, which makes the phone an intake channel rather than a convenience.",
      callTypes: [
        {
          name: "First-time enquiries",
          detail:
            "It captures the caller's name, contact details, the matter type, and the timeline in a structured form, then books the consultation into your connected calendar during the call. The intake arrives as a written summary rather than three lines on a message pad.",
        },
        {
          name: "Conflict-safe screening",
          detail:
            "It asks the qualifying questions you define and nothing more. It gives no legal advice, no view on the merits, and no estimate of what a claim is worth - it says that a solicitor will cover that, and books the time for it.",
        },
        {
          name: "Urgent matters out of hours",
          detail:
            "Custody, arrest, an injunction, a deadline tomorrow. Your escalation rules decide what constitutes urgent and who gets woken up; everything else is captured properly and waiting when the office opens.",
        },
        {
          name: "Existing client calls",
          detail:
            "Callers chasing a case update are routed by your rules to the right person or taken as a message with the matter reference, so fee earners are not interrupted mid-drafting by calls a message would have covered.",
        },
        {
          name: "Confidentiality",
          detail:
            "Calls are encrypted, EU-hosted, and never sold or used to train external models. You set what the AI may and may not discuss on the phone.",
        },
      ],
      stakes: {
        heading: "The cost of a missed call is a whole matter",
        body: "A missed enquiry in most businesses costs one transaction. In a law firm it costs the entire matter, and the fee that would have come with it - which is why an unanswered intake call is among the most expensive things a phone can do. Callers with a legal problem are usually distressed, usually shopping several firms in an afternoon, and almost never leave a voicemail. Every call the AI takes is transcribed and summarised, so you can see precisely what the enquiry was and how quickly it was picked up.",
      },
      phoneSetup: {
        heading: "Connecting it to the firm's line",
        body: "The number on your letterhead does not change. You forward it from your existing system - everything, or only what rings out after six, at weekends, and while everyone is in court or in a meeting, which is when intake calls actually arrive. No porting, no downtime, no new cards. Many firms prefer a second number for a specific matter type - a new-enquiry line advertised on a practice-area page - and leave the main switchboard alone. Solo answers one call at a time on one number; Team gives you three numbers and three simultaneous calls, and can connect your own SIP if the firm runs a PBX it does not want to move off. Reverting is a change in the phone system, nothing more.",
      },
      stack: {
        heading: "Intake, and where the file starts",
        intro: "Legal intake is a data-capture job, and the useful question is where that data lands.",
        notes: [
          "Consultations are booked into Google Calendar, Microsoft 365 or Outlook, or Cal.com, connected over OAuth and synced both ways, so a slot taken at 10 p.m. is not double-booked at nine the next morning.",
          "It does not write into Clio, Actionstep, LEAP or Smokeball. What it does is hand you a complete, structured intake - name, contact, matter type, the facts in the caller's own words, the dates that matter, and how they found you - as a summary and full transcript.",
          "That intake can be posted to any HTTPS endpoint the firm controls, signed, so it lands in the practice-management system through your own connector rather than a promised one.",
          "Conflict checking stays with the firm. The AI collects the names it is told to collect and flags them for you; it does not run a check it cannot run.",
        ],
      },
      compliance: {
        heading: "Confidentiality and what the AI must not say",
        body: "A first call from a prospective client can carry privileged information whether or not you are retained, and it is now a transcript. Those transcripts are encrypted in transit and at rest, EU-hosted, never sold and never used to train external models, and access is limited to your account. The briefing matters more here than in any other vertical: the AI must not give legal advice, must not assess the merits of a matter, must not quote a fee it has not been given, and must not confirm to a caller that a named person is a client. Brief all four explicitly and it declines and follows your escalation rule instead. Anything it was not briefed on, it says it does not know rather than guessing. The retention terms are in the privacy policy, and are worth reading before a live intake line is pointed at it.",
      },
    },
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
          { q: "Will it book straight into our calendar?", a: "Yes. It books consultations during the call with two-way sync to Google Calendar, Microsoft 365 or Outlook, and Cal.com, so it only offers slots that are actually open and updates your calendar in real time." },
          { q: "How long does setup take and what does it cost?", a: "You can be live in about 10 minutes with no code. You brief it on your hours, practice areas, intake questions, and escalation rules. Both plans are month-to-month with a 30-day money-back guarantee. Solo is EUR 99 per month for 1,000 talk minutes and one number. Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
        ],
      },
      footerCta: {
        heading: "Answer every prospective client first.",
        body: "Take clean intake and book the consultation before they reach the next firm, 24/7 and in 25+ languages. EU-hosted, live in about 10 minutes, with a 30-day money-back guarantee.",
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
      "AI receptionist for HVAC companies",
      "electrician call answering",
      "after-hours emergency intake",
      "trades appointment booking",
      "roofer lead capture",
      "AI phone agent for contractors",
    ],
    brief: {
      heading: "You cannot answer the phone with both hands in a boiler",
      intro:
        "Home services has a structural problem no amount of discipline fixes: the work and the phone need the same person at the same time. You are under a sink, on a roof, or driving between jobs, and that is exactly when the calls come. Voicemail does not solve it either, because a homeowner with water coming through a ceiling does not leave a message - they ring the next van on the list.",
      callTypes: [
        {
          name: "Emergency call-outs",
          detail:
            "Burst pipe, no heating, dead consumer unit. It asks your triage questions, works out whether this is a today job or a next-week job, and follows your escalation rule - straight through to your mobile for genuine emergencies, booked in for everything else.",
        },
        {
          name: "Quote requests",
          detail:
            "It captures the job type, the address, the access details, and the timeline, then either books the survey into your calendar or hands you a qualified lead with enough detail to price it without a second call.",
        },
        {
          name: "Calls while you are on a job",
          detail:
            "Every call is answered on the first ring while your hands are full, so the third caller of the afternoon gets the same treatment as the first instead of ringing out while you are mid-repair. On Team, three can be handled at the same time.",
        },
        {
          name: "Time-wasters and cold sales calls",
          detail:
            "It screens on your criteria - outside your service area, a job you do not take, an obvious sales call - so what reaches your phone is work rather than noise.",
        },
        {
          name: "Evenings and weekends",
          detail:
            "Most home emergencies happen outside working hours, which is when most of your competitors are on voicemail. Answering at 8 p.m. on a Sunday is the whole advantage.",
        },
      ],
      stakes: {
        heading: "One missed call is often one whole job",
        body: "For a trade, the arithmetic is brutally simple: a missed call is usually a missed job, and a job is worth hundreds or thousands rather than a few pounds. Miss two a week and the lost revenue dwarfs anything the phone system costs. Emergency callers in particular are ringing down a list and stop at the first person who answers, so the value of picking up is highest exactly when you are least able to. After each call you get a text and an email with who rang, what they need, and what was promised.",
      },
      phoneSetup: {
        heading: "Connecting it to the mobile you actually answer",
        body: "The number on the van stays the number on the van. You set conditional forwarding on your mobile - divert on busy, on no answer, and out of hours - so the calls that today go to voicemail while you are under a sink or up a ladder go to the AI instead, and everything else still rings in your pocket. There is no porting, no new number to reprint, and no day where the phone does not work. If you would rather split it, take a second number for the emergency line and route it to different rules. Solo answers one caller at a time; on a storm day, when six people ring in ten minutes, Team's three simultaneous calls is the difference between six booked jobs and one. Turning it off is one setting on the handset.",
      },
      stack: {
        heading: "Jobs, calendars and the software you already pay for",
        intro: "Trades software is a crowded market and nobody's AI receptionist writes into all of it. What this one does:",
        notes: [
          "Jobs and callbacks go into Google Calendar, Microsoft 365 or Outlook, or Cal.com, connected with OAuth and synced both ways, so the 8 a.m. slot booked at midnight is really gone.",
          "It does not write into ServiceTitan, Jobber, Housecall Pro, Tradify or SimPRO. If you run one of those, the working pattern is the calendar it syncs to plus the emailed summary, and you dispatch from the same place you do now.",
          "Every call arrives as a summary and a full transcript: the address, the fault as the customer described it, whether there is water on the floor, and the callback number - which is most of what you would have written on the back of a job sheet anyway.",
          "If your system takes an HTTPS webhook, each call can be posted to it signed, which is how one-van shops get leads into their own spreadsheet or dispatch tool without touching an integration marketplace.",
        ],
      },
      compliance: {
        heading: "Emergencies, quotes and the two things it must never do",
        body: "Two rules decide whether this works on a trade line. First, it does not quote. Give it a price and it repeats your price; give it nothing and it says a quote needs eyes on the job and books the visit, rather than inventing a number you have to walk back on the doorstep. Second, it does not decide what is an emergency - you write the test, in your words (water you cannot stop, no heat with a baby in the house, gas smell, a lock-out at midnight), and it applies that test and escalates the way you told it to, including calling or texting you directly. Everything else gets the next real slot and a confirmation. Calls are EU-hosted and encrypted, never sold and never used to train external models.",
      },
    },
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
          { q: "How does it book jobs into my schedule?", a: "It books appointments straight into your calendar during the call, with two-way sync to Google Calendar, Microsoft 365 or Outlook, and Cal.com. Your schedule stays accurate with no double-entry, and you get a transcript and summary after every call." },
          { q: "What happens when several people call during a busy spell?", a: "The Team plan answers three calls concurrently and Solo answers one at a time, so a cold snap that lights up the phone is handled without anyone sitting in a hold queue. Calls are answered around the clock, which is when most of that overflow actually arrives." },
          { q: "What if a caller asks something it does not know?", a: "It admits when it does not know rather than bluffing. You brief it on your hours, services, prices, and FAQs, and you set the rules for when it transfers to a human or takes a message." },
          { q: "How long does it take to set up?", a: "It is self-serve with no code and goes live in about 10 minutes. You brief it on your business: hours, services, prices, common questions, and your escalation rules for emergencies and after-hours." },
          { q: "What does it cost?", a: "Both plans are month-to-month with a 30-day money-back guarantee. The Solo plan is EUR 99 per month for 1,000 talk minutes, then EUR 0.09 per extra minute, with one phone number. The Team plan is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
        ],
      },
      footerCta: {
        heading: "Catch every job you cannot answer.",
        body: "Answer every call while you are on the tools or after hours, qualify the job, and book it into your calendar in 25+ languages. Live in about 10 minutes, with a 30-day money-back guarantee.",
      },
    },
  },

  "property-management": {
    title: "AI Receptionist for Property Management | 24/7",
    description:
      "An AI phone agent for property managers that answers tenant maintenance calls 24/7, triages emergencies, books showings, and captures leasing leads.",
    keywords: [
      "AI receptionist for property management",
      "AI receptionist for landlords",
      "AI leasing office receptionist",
      "after-hours property management calls",
      "leasing inquiry answering service",
      "maintenance emergency triage line",
      "showing scheduling automation",
      "multilingual tenant support",
    ],
    brief: {
      heading: "Two phone lines in one: tenants and prospects",
      intro:
        "Property management is unusual in that the same number carries two completely different jobs. One is maintenance - inbound, unpredictable, occasionally urgent at three in the morning. The other is leasing - time-sensitive enquiries about a listing where the first agent to respond usually gets the viewing. Handled by the same overloaded office phone, both suffer.",
      callTypes: [
        {
          name: "Emergency maintenance",
          detail:
            "Flooding, no heat, no power, a lock-out, anything with a safety dimension. It runs your triage script, decides against your definitions rather than its own, and escalates to the on-call contractor or manager the way you specified. It never tells a tenant to wait when your rules say otherwise.",
        },
        {
          name: "Routine repair reports",
          detail:
            "A dripping tap at 9 p.m. does not need waking anyone. It logs the unit, the issue, and the access arrangements, and the ticket is on the desk in the morning as a written summary rather than a half-audible voicemail.",
        },
        {
          name: "Leasing enquiries and viewings",
          detail:
            "It answers questions about the listing you briefed it on - rent, availability, deposit, pets, parking - qualifies the prospect, and books the viewing into your connected calendar during the call, while they are still interested.",
        },
        {
          name: "Rent and account questions",
          detail:
            "Payment dates, how to pay, where a statement went. Routine questions get answered; anything account-specific or sensitive follows your rule to transfer or take a message.",
        },
        {
          name: "Tenants who do not share your first language",
          detail:
            "It handles 25+ languages, which in mixed residential blocks is often the difference between a clear repair report and a confused one that costs a wasted contractor visit.",
        },
      ],
      stakes: {
        heading: "Voids and emergencies are the two expensive failures",
        body: "The leasing call you miss becomes a longer void, and a void is measured in whole months of rent - by far the most expensive outcome in the business. The maintenance call you miss is worse in a different way: a small leak that waited until Monday is a ceiling repair, and a genuine emergency that sat in a voicemail box is a liability problem as much as a maintenance one. Answering both reliably at 3 a.m. is not a convenience, it is risk management.",
      },
      phoneSetup: {
        heading: "Connecting it to the office and the out-of-hours line",
        body: "Most portfolios already run two numbers: an office line and an emergency line that rings somebody's personal mobile at 2 a.m. Both keep their numbers. You forward the office line on no-answer and after hours, and point the emergency line at the AI outright, with your triage rules attached. Nothing is ported and neither line goes dark during the change. Solo covers one number and one call at a time; Team covers three numbers and three simultaneous calls, which is what a burst pipe in a block of forty flats looks like on the phone - and can connect your own SIP if the office runs a PBX. Tenants keep dialling exactly what is on their tenancy agreement and the fridge magnet.",
      },
      stack: {
        heading: "Tickets, showings and what it can reach",
        intro: "Property software is where the honest answer matters, because the promise is usually bigger than the connector.",
        notes: [
          "Showings and contractor slots go into Google Calendar, Microsoft 365 or Outlook, or Cal.com, over OAuth and both ways.",
          "It does not write into AppFolio, Buildium, Yardi, Propertyware or Arthur, and it cannot read a tenant's ledger or a work-order status. It will not pretend to know whether rent posted.",
          "What it produces is a complete, timestamped maintenance report per call: unit, caller, the fault in their words, access arrangements and whether it is escalating - as a summary and full transcript, and as a signed HTTPS webhook if you have somewhere to put it.",
          "For prospects it captures the enquiry, answers what you briefed it on about the listing, and books the viewing, in 25+ languages, which in a mixed block is not a nice-to-have.",
        ],
      },
      compliance: {
        heading: "Emergency triage, and the log that proves it happened",
        body: "The out-of-hours call you most need to get right is also the one with nobody awake to take it. You write the triage test - what counts as an emergency, who it pages, what the tenant is told meanwhile - and the AI applies it consistently at 3 a.m., which is more than a tired human on a rota reliably does. Just as important, every call leaves a record: what the tenant reported, when, and what was promised. That is the evidence trail a landlord, an insurer or a first-tier tribunal will ask for, and it beats a note in a WhatsApp thread. Transcripts are encrypted in transit and at rest, EU-hosted, never sold and never used to train external models. Decide up front who in the office can read them.",
      },
    },
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
          { q: "Does it book showings into our calendar?", a: "Yes. It books appointments directly into Google Calendar, Microsoft 365 or Outlook, or Cal.com during the call, with two-way sync so an already-taken slot never gets double-booked. Prospect details come back as a summary and full transcript, and can be posted to any system of yours that accepts a signed HTTPS webhook." },
          { q: "What happens to the caller's information and is it secure?", a: "All call data is encrypted, hosted in the EU, and handled GDPR-first. It is never sold or used to train external models. The product is also HIPAA-ready if you handle sensitive resident information." },
          { q: "Can it handle tenants who speak another language?", a: "Yes. It speaks 25+ languages and switches language mid-call based on the caller, so a resident more comfortable in Spanish, Polish, or another language is understood and their request is logged correctly." },
          { q: "What if a call is too complex for the AI?", a: "It admits when it does not know rather than bluffing, and follows your rules to transfer to a human or take a message. After every call you get a transcript and summary by text and email, so nothing is lost." },
          { q: "How long does setup take and do I need a developer?", a: "It is self-serve with no code and is usually live in about 10 minutes. You brief it on your hours, services, policies, FAQs, and escalation rules. Both plans are month-to-month with a 30-day money-back guarantee. The Solo plan is EUR 99 per month and Team is EUR 299 per month." },
        ],
      },
      footerCta: {
        heading: "A calm front desk for your whole portfolio.",
        body: "Triage emergencies, log routine tickets, and book showings 24/7 so no tenant or prospect hits voicemail, in 25+ languages. Live in about 10 minutes, with a 30-day money-back guarantee.",
      },
    },
  },

  medical: {
    title: "AI Receptionist for Medical Practices | 24/7 Answering",
    description:
      "A 24/7 AI medical answering service for clinics and private practices. It schedules patients, covers after-hours calls, and escalates urgent cases to your rules.",
    keywords: [
      "AI receptionist for medical practices",
      "AI receptionist for medical office",
      "AI receptionist for doctors",
      "after-hours answering service medical",
      "AI receptionist for clinics",
      "patient appointment scheduling AI",
      "HIPAA-ready medical phone AI",
      "24/7 medical call answering",
    ],
    brief: {
      heading: "A clinic phone line that never sends a patient to voicemail",
      intro:
        "Patients ring a practice when something is wrong, and they ring at the times that suit their symptoms rather than your opening hours. Meanwhile reception is with a patient at the desk, and the line backs up. The result is the familiar one: an engaged tone in the morning, voicemail in the evening, and a queue of callbacks nobody has time to make.",
      callTypes: [
        {
          name: "Appointment booking and rescheduling",
          detail:
            "It offers genuine openings from your connected calendar and confirms during the call, with two-way sync to Google Calendar, Microsoft 365 or Outlook, and Cal.com. Cancellations release the slot immediately, which is the only reliable way to refill it.",
        },
        {
          name: "Out-of-hours calls",
          detail:
            "It follows your protocol exactly: which symptoms mean call emergency services now, which mean the on-call clinician, which mean an urgent slot tomorrow. The AI is not a clinician, does not triage on its own judgement, and does not diagnose - it applies the rules you wrote and says so plainly.",
        },
        {
          name: "Repeat prescriptions and admin",
          detail:
            "The high-volume, low-complexity calls that consume most of reception's day. It captures the request and routes it, so the desk is free for patients who are physically present.",
        },
        {
          name: "Results and records enquiries",
          detail:
            "It does not read results out. It confirms identity to your rules and either books the call with a clinician or takes a message, because this is precisely the category where an AI should hand off.",
        },
        {
          name: "Confidentiality and hosting",
          detail:
            "HIPAA-ready and GDPR-first, EU-hosted, encrypted, and never used to train external models. You define what may be discussed on the phone at all.",
        },
      ],
      stakes: {
        heading: "Unreachable is a clinical problem, not just an admin one",
        body: "When a practice is hard to reach, patients do not simply try later. They delay care, they present at A&E instead, or they move to a practice whose phone is answered - and the ones most affected are usually those who most need continuity. On the operational side, an unfilled cancellation is a clinician sitting idle in a slot somebody else was waiting weeks for. Every call is transcribed and summarised so you can audit what was said and what was promised.",
      },
      phoneSetup: {
        heading: "Connecting it to the clinic line",
        body: "The clinic keeps its number. You forward from the existing system - everything, or only the calls that would otherwise reach voicemail: after hours, weekends, lunch cover, and the overflow when reception is with a patient at the desk and the line has rung five times. No porting, no downtime, no reprinting anything. A second number is the other common shape: a dedicated after-hours line with its own triage rules, leaving the daytime switchboard exactly as it is. Solo answers one call at a time on one number; Team gives three numbers and three concurrent calls, and can connect the clinic's own SIP if you run a PBX you are not moving off. Backing it out is a phone-system setting.",
      },
      stack: {
        heading: "Scheduling, and the boundary of what it touches",
        intro: "A clinic's records live somewhere the AI does not reach, and that boundary should be explicit before go-live.",
        notes: [
          "Appointments go into Google Calendar, Microsoft 365 or Outlook, or Cal.com, connected over OAuth and synced both ways, so an evening booking is not double-sold in the morning.",
          "It does not write into EMIS, SystmOne, Epic, Cerner or your practice-management system, and it cannot read a patient record, a result or a repeat prescription. It says so rather than guessing.",
          "Each call comes back as a summary and transcript - who called, what they need, how urgent by your own test - which reception works through at the start of the day and enters where it belongs.",
          "If a system on your side accepts a signed HTTPS webhook, the same summaries can be pushed to it automatically.",
        ],
      },
      compliance: {
        heading: "Clinical safety and patient data",
        body: "The AI is not a clinician. It does not diagnose, does not advise on medication, and does not decide urgency on its own judgement - it applies the screening questions and thresholds you wrote, in your words, and escalates exactly as instructed, including out-of-hours paging. Anything outside that, it declines and hands off. On the data side: calls are transcribed, so patient-identifiable information ends up in text. It is encrypted in transit and at rest, hosted in the EU, never sold, and never used to train external models, and access is limited to your account - decide who on the team gets it. If you operate as a covered entity in the US, raise that with us before you route a live patient line rather than assuming it is covered. The full terms are in the privacy policy.",
      },
    },
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
          { q: "Can it schedule patients into the system we already use?", a: "It books into your calendar during the call with two-way sync for Google Calendar, Microsoft 365 or Outlook, and Cal.com, so slots never double-book. Patient details and messages can also be posted to any system of yours that accepts a signed HTTPS webhook." },
          { q: "Can it handle refill requests and results calls?", a: "It takes structured messages for refills, results, and callback requests and routes them to the right inbox or staff member by your rules. It does not access medical records or give clinical information - it captures the request accurately so your team can act on it." },
          { q: "Can it answer several patients at once, even at lunch or after hours?", a: "The Team plan takes three calls at the same time and Solo takes one, and both cover lunch hours, evenings, weekends, and holidays identically. Patients who would have reached voicemail get answered and scheduled instead, which is where most of the benefit comes from." },
          { q: "How long does setup take and what does it cost?", a: "Setup is self-serve with no code and typically live in about 10 minutes after you brief it on your practice, hours, and protocols. Both plans are month-to-month with a 30-day money-back guarantee. The Solo plan is EUR 99 per month for 1,000 talk minutes, and Team is EUR 299 per month for 3,000 minutes and three numbers." },
        ],
      },
      footerCta: {
        heading: "Stop losing patients to voicemail.",
        body: "Answer every patient call 24/7, schedule into your calendar, and route urgent calls to your protocols. EU-hosted, live in about 10 minutes, with a 30-day money-back guarantee.",
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
    brief: {
      heading: "The buyer who calls about your listing is calling three agents",
      intro:
        "Property enquiries arrive at the worst possible moment - while you are mid-viewing, driving between appointments, or sitting in a valuation you cannot walk out of. They also arrive in the evening and at the weekend, because that is when people browse listings. The caller who cannot reach you has the next agent's number open in another tab, and the enquiry is not exclusively yours until somebody answers it.",
      callTypes: [
        {
          name: "Listing enquiries",
          detail:
            "It answers on the details you briefed it on - asking price, square footage, chain position, service charge, EPC, what is included - rather than reciting the portal blurb back at the caller, and captures who is asking.",
        },
        {
          name: "Viewing bookings",
          detail:
            "It books the viewing into your connected calendar during the call. A viewing booked while the caller is still enthusiastic converts very differently from one arranged two days later after a callback.",
        },
        {
          name: "Buyer qualification",
          detail:
            "It asks the questions you would: budget, mortgage in principle, cash or chain, timescale, whether they have a property to sell. That arrives as a written summary, so you know before you get in the car whether the viewing is worth the trip.",
        },
        {
          name: "Vendor and valuation enquiries",
          detail:
            "Your highest-value inbound call. It captures the address, the reason for moving, and the timeline, books the valuation, and sends you the lead as a summary and transcript within seconds - and posts it to any system of yours that accepts a signed HTTPS webhook - so nothing dies in a notebook.",
        },
        {
          name: "Evenings and weekends",
          detail:
            "Most property browsing happens outside office hours, and so do most enquiries. The AI answers at 9 p.m. on a Sunday exactly as it does on a Tuesday morning.",
        },
      ],
      stakes: {
        heading: "One instruction pays for years of answered calls",
        body: "The economics here are lopsided in an unusual way: a single missed vendor call can cost an entire instruction and the commission attached to it, which is worth more than a phone system costs over years. Buyers are equally unforgiving - they are ringing several agents about several properties in one evening and they stop at whoever picks up. Because your competitors are largely on voicemail after six, the hours you currently miss are the ones with the least competition for attention.",
      },
      phoneSetup: {
        heading: "Connecting it to the number on the board",
        body: "The number on the For Sale board, the portal listing and your business card does not change. You forward your mobile on busy and on no-answer, which is the state it is in for most of a viewing, plus evenings and weekends, when buyers who work office hours actually ring. Nothing is ported and there is no dead window. The alternative that suits listing-heavy agents is a second number used only on portals and boards, so campaign calls are separated from your day-to-day and you can see exactly what a listing generated. Solo answers one call at a time; Team gives three numbers and three at once, which is what an open-house weekend does to a phone. Turning it off is one handset setting.",
      },
      stack: {
        heading: "Leads, viewings and your CRM",
        intro: "Agency CRMs are a fragmented market, so here is precisely where a lead lands.",
        notes: [
          "Viewings are booked into Google Calendar, Microsoft 365 or Outlook, or Cal.com, connected with OAuth and synced both ways, so the Saturday 11 a.m. slot cannot be sold twice.",
          "It does not write into Reapit, Alto, Dezrez, Follow Up Boss or kvCORE. What it hands you instead is a qualified lead: the property they are calling about, budget and chain position if you brief it to ask, timescale, and whether they are already with an agent.",
          "Every call comes back as a summary and full transcript by email, and can be posted to any HTTPS endpoint you control with a signature, which is how agencies get calls into their own CRM without waiting for a connector.",
          "It answers listing questions only from the brief you give it - price, tenure, service charge, availability - and says it does not know rather than inventing a detail you then have to correct on a viewing.",
        ],
      },
      compliance: {
        heading: "What it must not say about a property",
        body: "Property is a regulated sales conversation and a misdescription on the phone is a real problem, which is why the briefing is the work here. Give it the facts you are willing to stand behind - asking price, tenure, EPC, service charge, chain status - and it repeats those. Leave a field out and it says it does not have that detail and offers to have you call back, which is the outcome you want. It does not negotiate, does not accept an offer, and does not comment on what a vendor might take. Caller details captured on the phone are personal data: encrypted in transit and at rest, EU-hosted, never sold, never used to train external models, and covered by the terms in our privacy policy. If you run outbound campaigns on Team, marketing-consent rules are yours to honour, and the transcripts are the record of what was said.",
      },
    },
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
          { q: "Can it book showings directly into my calendar?", a: "Yes. It checks your real availability, offers open slots, and books the showing during the call with two-way sync for Google Calendar, Microsoft 365 or Outlook, and Cal.com, so you are never double-booked. You get a text summary with the caller's details right after." },
          { q: "Will callers know they are talking to an AI?", a: "You decide how it introduces itself, and a brief disclosure up front is the honest default. Voices are natural enough that short inquiry calls flow normally, and callers who want a human can be transferred to you or your team on your rules." },
          { q: "How does it qualify a buyer or seller lead?", a: "You define the intake questions - timeline, financing readiness, area, price range for buyers; address and timeline for sellers - and it asks them conversationally, then texts and emails you the structured answers. Leads can also be posted to any system of yours that accepts a signed HTTPS webhook." },
          { q: "Is it safe to use under fair housing rules?", a: "You control the script, and the safe configuration is factual intake only: availability, timing, financing readiness, and contact details. It does not steer callers toward or away from neighborhoods or answer questions your compliance rules exclude, and you can review every transcript." },
          { q: "What happens when I am with a client and two calls come in?", a: "On the Team plan both are answered at once, since it handles three concurrent calls; Solo takes them one at a time. Neither sends the caller to voicemail while you are in a viewing. Urgent calls can be transferred to you live per your rules, and everything else arrives as a transcript and summary you can act on between appointments." },
          { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and usually live in about 10 minutes: brief it on your listings focus, service area, and intake questions, and forward your existing number. Both plans are month-to-month with a 30-day money-back guarantee. The Solo plan is EUR 99 per month, and Team is EUR 299 per month." },
        ],
      },
      footerCta: {
        heading: "The deal goes to whoever answers first.",
        body: "Capture every buyer and seller call 24/7, qualify the lead, and book the showing before they dial the next agent. Live in about 10 minutes, with a 30-day money-back guarantee.",
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
