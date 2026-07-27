// English source copy for the home page.
//
// This is the reference every translation is made from, and it is also what the
// live English page renders (HomeClient defaults to it), so the two can never
// drift. Strings are copied verbatim from the original JSX - typos, casing and
// punctuation included. Do not "improve" them here; fix the English page and
// this file together, deliberately.

import type { HomeCopy } from "../../_home-copy";

export const enHome: HomeCopy = {
  // Reference-only, like metaDescription below: the live English home builds its
  // own title. Kept here so translators can see the intended shape - head
  // keyword first, benefit second, no brand name, under 60 characters.
  metaTitle: "AI Receptionist: Every Business Call Answered 24/7",
  metaDescription:
    "AI Receptionist Now answers your business calls 24/7, books appointments, and captures every lead. No code, live in minutes.",
  hero: {
    h1: "AI Receptionist That Answers Every Call 24/7",
    phonePlaceholder: "Enter phone number",
    ctaCall: "Talk to our AI now",
    ctaCalling: "Calling...",
    invalidPhone: "Enter a valid phone number.",
    callPlaced: "Calling you now, pick up your phone!",
    callFailed: "Couldn't place the call.",
    callFailedRetry: "Couldn't place the call. Try again.",
    consent: {
      before: "By making this call, you consent to being",
      contactLink: "contacted by us",
      between: "and confirm to have read our",
      privacyLink: "privacy policy",
      after: ".",
    },
    avatarAlts: [
      "Illustrative avatar",
      "Illustrative avatar",
      "Illustrative avatar",
      "Illustrative avatar",
    ],
    usersCount: "Built for small businesses",
    usersTagline: "Every call answered 24/7.",
    ratingHeadline: "Official ElevenLabs",
    ratingCount: "Voice Partner",
    ratingScore: "Natural voices in 25+ languages",
  },

  testimonials: {
    heading: "Built for businesses like yours",
    sub: "Illustrative scenarios from the industries we serve.",
    items: [
      { quote: "Our front desk used to miss calls constantly during patient hours. Now every single call gets answered 24/7 and appointments just book themselves. Staff can finally focus on patients.", name: "Amanda", role: "Family Medicine" },
      { quote: "couldn't pick up on a job site so I was losing clients every week. This thing answers every call, qualifies the lead and texts me a summary. closed 3 jobs this month I would've missed.", name: "Mike", role: "Plumbing & Drain" },
      { quote: "Set it up in like 20 minutes during my lunch break. Now it handles all the booking calls while my team works on clients. honestly wish I'd done this a year ago.", name: "Jasmine", role: "Day Spa" },
      { quote: "One person agency here, I can't always answer. It qualifies every caller, grabs their details and books showings straight into my calendar. like a full time receptionist for nothing.", name: "Brian", role: "Realtor" },
      { quote: "We were paying two people just to answer phones. Now the AI takes the overflow and after hours calls. Cut our front desk costs almost in half.", name: "Priya", role: "Dental Clinic" },
      { quote: "the voice is shockingly natural. Half my customers have no idea theyre talking to an AI. Books the appointment, confirms it, done.", name: "Carlos", role: "Auto Repair Shop" },
      { quote: "missed calls were killing us at night. now every after hours call gets answered and I get a text recap in the morning. game changer for a small firm.", name: "Rachel", role: "Law Office" },
      { quote: "Setup was way easier than I expected. Described my business, picked a few options and it was taking calls same day. No tech skills needed at all.", name: "Tom", role: "HVAC Services" },
      { quote: "It pushes every booking right into my calendar and never double books. Friday nights used to be chaos answering the phone, not anymore.", name: "Nina", role: "Hair Salon" },
      { quote: "honestly skeptical at first but it handles weird questions better than my old answering service did. and it's a fraction of the price.", name: "Derek", role: "Roofing Contractor" },
      { quote: "We get a lot of Spanish speaking callers and it switches languages no problem. captures everything and emails me the lead instantly.", name: "Sofia", role: "Insurance Agency" },
      { quote: "phones ring nonstop during dinner rush. now the AI takes reservations and to-go orders while we cook. saved us so many lost tables.", name: "Marco", role: "Restaurant" },
      { quote: "It books consults, answers pricing questions and sends me a summary of every call. feels like I hired a receptionist without the payroll.", name: "Hannah", role: "Med Spa" },
      { quote: "I run the shop alone and can't stop mid job to grab the phone. it answers, qualifies, and texts me whats urgent. closed more work this month than ever.", name: "Wes", role: "Electrician" },
      { quote: "switched from a call center that kept messing up bookings. this never gets the appointment wrong and it actually sounds friendly.", name: "Linda", role: "Chiropractic Clinic" },
      { quote: "the after hours coverage alone paid for itself. people call at 9pm and still get booked. no more voicemail tag.", name: "Greg", role: "Pest Control" },
      { quote: "tried it on the free plan first and it already booked 4 appointments the first week. upgraded the same day. easy decision.", name: "Aisha", role: "Nail Studio" },
      { quote: "integrates straight into our calendar and CRM so nothing gets lost. setup took one evening and it's been running flawless since.", name: "Daniel", role: "Real Estate Team" },
    ],
  },

  howItWorks: {
    heading: "Ready to go in under 10 minutes.",
    sub: "Anyone can get AI Receptionist up and running-no coding skills required.",
    steps: [
      {
        title: "Create AI phone assistants",
        desc: "Select voice, language, and a welcome message.",
        imageAlt: "Create your AI receptionist on iPhone",
      },
      {
        title: "Define in-call behavior and post-processing",
        desc: "Set up different call handling and choose how you want to receive the transcripts.",
        imageAlt: "Define in-call behavior on iPhone",
      },
      {
        title: "Let the AI take your phone calls",
        desc: "The AI will be linked to an AI Receptionist phone number or your own phone system.",
        imageAlt: "The AI taking a phone call on iPhone",
      },
    ],
  },

  useCases: {
    heading: "Use cases",
    sub: "Our AI phone assistant adapts flexibly to your needs and integrates with your calendar and CRM. Automated calls that make sense.",
    cta: "Start Now",
    items: [
      { title: "Reception & Routing", desc: "Takes incoming calls and forwards them to the appropriate contact person." },
      { title: "Call Transcription", desc: "Collects inquiries, transcribes them, and sends you a summary by email." },
      { title: "Customer Service", desc: "Handles customer inquiries around the clock with precisely defined behavior." },
      { title: "Appointment Booking", desc: "Schedules appointments during the conversation with instant confirmation." },
      { title: "Order Processing", desc: "Fast 24/7 automated request handling - no waiting, no missed orders." },
      { title: "50+ More Options", desc: "Every business is different. Configure the AI to match your exact workflow." },
    ],
  },

  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        q: "What is an AI receptionist?",
        a: "An AI receptionist is a virtual phone assistant that answers your business calls automatically, 24/7. It greets callers in a natural voice, answers questions, qualifies leads, books appointments, and sends you a summary of every call - so you never miss a customer, even after hours or during busy periods.",
      },
      {
        q: "How does an AI phone answering service work?",
        a: "AI Receptionist connects to a dedicated phone number or your existing business line. When someone calls, the AI picks up instantly, holds a natural conversation, and follows the instructions you set up - answering FAQs, capturing caller details, routing the call, or scheduling appointments directly into your calendar. You get a transcript and summary by email or text after each call.",
      },
      {
        q: "Can the AI receptionist answer calls 24/7?",
        a: "Yes. AI Receptionist answers every call around the clock - nights, weekends, holidays, and during call overflow - with no hold times and no voicemail. Businesses that switch typically stop losing leads to missed and after-hours calls within the first week.",
      },
      {
        q: "How quickly can I set up AI Receptionist?",
        a: "Setup takes under 10 minutes. Describe your business, choose a voice and language, set how calls should be handled, and the AI is ready to take calls the same day. No coding or technical skills required.",
      },
      {
        q: "Will callers know they're talking to an AI?",
        a: "The AI sounds natural and conversational, and many callers can't tell the difference. You stay in control: you can have the AI introduce itself as a virtual assistant or keep the experience seamless - whatever fits your brand.",
      },
      {
        q: "Can it book appointments and integrate with my calendar and CRM?",
        a: "Yes. AI Receptionist books appointments during the call and integrates natively with Google Calendar, Outlook, HubSpot, Salesforce, and Calendly, plus thousands of apps through Zapier. Custom integrations are available via our open API, so caller data flows straight into the tools you already use.",
      },
      {
        q: "What languages does the AI receptionist support?",
        a: "The AI handles calls in 25+ languages and can switch languages mid-conversation based on the caller - ideal for businesses that serve multilingual customers and want every caller to feel understood.",
      },
      {
        q: "What happens if the AI can't handle a call?",
        a: "The AI makes decisions from the context you provide, which resolves the vast majority of calls on its own. If a request falls outside its scope, it can capture the details, schedule a callback, or transfer the call to you or a team member in real time.",
      },
      {
        q: "How much does an AI receptionist cost?",
        a: "You can start for free and only upgrade when you need more calls or features. An AI receptionist costs a fraction of hiring front-desk staff or an answering service, while answering every call 24/7 - most businesses recover the cost from the extra booked jobs and recovered missed calls.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. All call data is encrypted in transit and at rest. We comply with GDPR and HIPAA requirements, and your data is never sold, shared with third parties, or used to train external AI models.",
      },
    ],
  },

  footerCta: {
    heading: "Scalable call management with AI Receptionist.",
    body: "Try AI Receptionist and see how our AI phone assistant automates your calls to reduce strain on your team. It's simple, efficient, and around the clock.",
    cta: "Create your own AI now",
  },
};
