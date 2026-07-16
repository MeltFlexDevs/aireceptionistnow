import type { AuthorKey } from "@/lib/site";

export type CallTurn = { speaker: "caller" | "ai"; text: string };

export type Industry = {
  slug: string;
  industry: string;
  niche: string;
  accent: string;
  accentSoft: string;

  // Hero
  eyebrow: string;
  h1: string;
  heroSub: string;

  // Metadata
  title: string;
  description: string;
  keywords: string[];

  capabilities: string[];
  painPoints: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  callExample: { scenario: string; turns: CallTurn[]; outcome: string };
  useCases: { title: string; body: string }[];

  // Results / proof
  resultsIntro: string;
  beforeAfter: { metric: string; before: string; after: string }[];
  roi: {
    jobValueLabel: string;
    defaultJobValue: number;
    defaultMissedCalls: number;
    note: string;
  };

  faqs: { q: string; a: string }[];
  verdict: string;

  // Assigned in-repo (kept out of content generation for image/link safety).
  testimonials: { quote: string; name: string; role: string; photo: string }[];
  integrations: string[];
  relatedBlog: { label: string; href: string }[];
  author: AuthorKey;
};

export const INTEGRATION_LOGOS: Record<string, string> = {
  "Google Calendar": "/compare/logos/googlecalendar.svg",
  Outlook: "/compare/logos/outlook.svg",
  HubSpot: "/compare/logos/hubspot.svg",
  Salesforce: "/compare/logos/salesforce.svg",
  Calendly: "/compare/logos/calendly.svg",
  Zapier: "/compare/logos/zapier.svg",
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "dentists",
    industry: "Dentists",
    niche: "dental practice",
    accent: "#0e9aa7",
    accentSoft: "#e6f6f6",
    eyebrow: "For dental practices",
    h1: "AI Receptionist for Dentists",
    heroSub:
      "When your front desk is chairside, on another line, or closed, calls go unanswered and new patients call the next practice. AI Receptionist Now answers every call 24/7 in a natural voice, books new patients straight into your calendar, and triages after-hours emergencies to your on-call rules.",
    title: "AI Receptionist for Dentists | 24/7 Call Answering",
    description:
      "A 24/7 AI phone receptionist for dental practices. It books new patients into your calendar and triages after-hours toothache calls to your on-call rules.",
    keywords: [
      "AI receptionist for dentists",
      "dental answering service",
      "dental appointment scheduling",
      "after-hours dental emergency line",
      "new patient booking",
      "dental front desk automation",
      "24/7 dental call answering",
      "HIPAA-ready dental phone AI",
      "multilingual dental receptionist",
      "reduce dental no-shows",
    ],
    capabilities: [
      "Answers every call 24/7 while your team is chairside or the office is closed",
      "Books new-patient exams and cleanings straight into your practice calendar",
      "Triages after-hours toothache and knocked-out-tooth calls to your on-call rules",
      "Answers hours, location, insurance, and pricing questions from your brief",
      "Sends confirmations and reminders to cut no-shows",
      "Takes messages or transfers to a human based on the rules you set",
      "Handles patients in 25+ languages and switches language mid-call",
      "Texts and emails you a transcript and summary after every call",
    ],
    painPoints: [
      {
        title: "The front desk is chairside",
        body: "Your team is placing a crown or turning over an operatory, so the phone rings out. The caller who wanted a new-patient exam hangs up and dials the practice down the road.",
      },
      {
        title: "Two callers, one line",
        body: "A patient is rescheduling while a new caller tries to get through. One of them hits a busy signal or voicemail, and most people will not leave a message for a dentist they have never met.",
      },
      {
        title: "Emergencies after hours",
        body: "A toothache or a knocked-out tooth does not wait for 9am. When the office is closed the call goes to voicemail, and by morning that patient has found emergency care elsewhere.",
      },
      {
        title: "No-shows and empty chairs",
        body: "Appointments booked weeks out get forgotten, and a missed hygiene slot is revenue you cannot recover. Manual confirmation calls take time your front desk does not have.",
      },
    ],
    stats: [
      { value: "24/7", label: "coverage, including nights and weekends" },
      { value: "Every call", label: "answered, no busy signal or voicemail" },
      { value: "25+", label: "languages, switched mid-call" },
      { value: "~10 min", label: "typical setup time" },
    ],
    callExample: {
      scenario: "After-hours toothache",
      turns: [
        { speaker: "caller", text: "Hi, I think I cracked a tooth and it's really throbbing. Are you open?" },
        { speaker: "ai", text: "I'm sorry you're in pain. The office is closed right now, but I can help. Is the tooth bleeding heavily, or do you have any swelling or trouble breathing or swallowing?" },
        { speaker: "caller", text: "No, no swelling. It just hurts a lot when I bite down." },
        { speaker: "ai", text: "Okay. That sounds like something the dentist will want to see quickly, but it isn't an emergency-room situation. Are you an existing patient with us?" },
        { speaker: "caller", text: "Yes, I've been coming for a couple of years. Name's Daniel Reyes." },
        { speaker: "ai", text: "Thank you, Daniel. I have an emergency slot at 8:10am tomorrow. In the meantime the office note says over-the-counter ibuprofen can help and to avoid chewing on that side. Shall I book the 8:10?" },
        { speaker: "caller", text: "Yes please, that would be great." },
        { speaker: "ai", text: "Booked. You'll get a text confirmation at this number, and the on-call notes are flagged for the morning team. Feel better, Daniel." },
      ],
      outcome: "Emergency exam booked for 8:10am, patient sent a text confirmation, and the practice got a transcript flagged for the morning team.",
    },
    useCases: [
      { title: "New-patient booking", body: "Captures the caller's name, reason for the visit, and insurance, then books a new-patient exam or cleaning into an open slot on your calendar during the call." },
      { title: "After-hours emergency triage", body: "Asks the screening questions you define, directs true emergencies to care per your rules, and books urgent same-day or next-morning slots for everything else." },
      { title: "Insurance and pricing questions", body: "Answers whether you take a plan, what a hygiene visit or whitening costs, and where you are located, straight from the FAQs and prices you brief it on." },
      { title: "Reschedules and cancellations", body: "Handles patients moving or canceling appointments, updates the calendar with two-way sync, and frees the slot so another patient can take it." },
      { title: "No-show reduction", body: "Sends appointment confirmations and reminders by text and email so fewer chairs sit empty and your hygiene schedule stays full." },
      { title: "Multilingual patients", body: "Greets and books patients in 25+ languages and switches language mid-call, so a Spanish- or Mandarin-speaking caller is understood without a staff scramble." },
    ],
    resultsIntro:
      "The figures below are illustrative of what practices typically aim for when every call gets answered. They are not audited results from a specific customer.",
    beforeAfter: [
      { metric: "After-hours calls", before: "Straight to voicemail", after: "Answered and triaged" },
      { metric: "Two callers at once", before: "Busy signal", after: "Both answered" },
      { metric: "New-patient inquiry", before: "Callback next day", after: "Booked on the call" },
      { metric: "Appointment reminders", before: "Manual, if time allows", after: "Sent automatically" },
    ],
    roi: {
      jobValueLabel: "Average value of a new patient",
      defaultJobValue: 600,
      defaultMissedCalls: 12,
      note: "This is an illustrative estimate based on the numbers you enter, not a guarantee of results.",
    },
    faqs: [
      { q: "Is it HIPAA-ready and are patient calls kept confidential?", a: "Yes. The service is HIPAA-ready and GDPR-first, hosted in the EU. All call data is encrypted, and it is never sold or used to train external models. You set the escalation and confidentiality rules the AI follows on every call." },
      { q: "Can it handle a real dental emergency?", a: "The AI is not a clinician and does not diagnose. It asks the screening questions you define, directs true emergencies to appropriate care per your rules, and books urgent slots for cases that can wait. You decide exactly how it triages and when it escalates to a human." },
      { q: "Will it book directly into the software my front desk uses?", a: "It books into your calendar during the call with two-way sync for Google Calendar, Outlook or Microsoft 365, and Calendly. It also connects to HubSpot, Salesforce, and thousands of apps through Zapier, so bookings and lead details flow where your team already works." },
      { q: "What happens when it does not know the answer?", a: "It admits when it does not know rather than guessing, then follows your rules: take a message or transfer to a human. You brief it on your hours, services, prices, and FAQs up front, so it answers the common questions accurately and hands off the rest." },
      { q: "Can it answer more than one patient at a time?", a: "Yes. It answers unlimited calls at once, so there is no busy signal and no hold queue. That covers overflow when the front desk is chairside and every call that comes in after hours or on weekends." },
      { q: "How long does setup take and what does it cost?", a: "It is self-serve with no code and goes live in about 10 minutes after you brief it on your practice. It is free to start with no card. The Solo plan is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number, and Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
    ],
    verdict:
      "A 24/7 receptionist that answers every call, books new patients on the spot, and triages after-hours emergencies to your rules, so no caller reaches a busy signal or a voicemail again.",
    testimonials: [
      { quote: "We were paying two people just to answer phones. Now the AI takes the overflow and after hours calls. Cut our front desk costs almost in half.", name: "Priya Sharma", role: "Dental Clinic", photo: "/testimonials/priya.jpg" },
      { quote: "switched from a call center that kept messing up bookings. this never gets the appointment wrong and it actually sounds friendly.", name: "Linda Park", role: "Chiropractic Clinic", photo: "/testimonials/lisa.jpg" },
    ],
    integrations: ["Google Calendar", "Outlook", "Calendly", "Zapier"],
    relatedBlog: [
      { label: "Dental answering service: the complete guide", href: "/blog/dental-answering-service" },
      { label: "How to choose an AI receptionist", href: "/blog/how-to-choose-an-ai-receptionist" },
    ],
    author: "matus",
  },
  {
    slug: "restaurants",
    industry: "Restaurants",
    niche: "restaurant",
    accent: "#d9663a",
    accentSoft: "#fbeee7",
    eyebrow: "For restaurants and hospitality",
    h1: "AI Receptionist for Restaurants",
    heroSub:
      "Your phone rings hardest at 7pm, when every server is running food and no one can pick up. AI Receptionist Now answers each call in a natural voice, takes reservations and to-go orders, and sends the details to your host stand. It runs 24/7 and never puts a guest on hold.",
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
      "catering lead capture",
      "after-hours restaurant calls",
      "restaurant answering service",
    ],
    capabilities: [
      "Takes table reservations and books them into your calendar during the call",
      "Captures to-go and takeout order details and sends them to the host stand",
      "Answers hours, menu, allergen, and parking questions from your brief",
      "Handles large-party and private-event requests and flags them for a manager",
      "Sends a booking confirmation by text or email after the call",
      "Captures catering and private-event leads when the manager is busy",
      "Greets and serves guests in 25+ languages, switching mid-call",
      "Texts or emails you a transcript and summary after every call",
    ],
    painPoints: [
      { title: "Nobody can answer during the rush", body: "When the dining room is full and every server is on the floor, the phone rings out. Each missed call is a table you did not seat or a takeout order that went to the place down the street." },
      { title: "No-shows leave tables empty", body: "Reservations booked days ago go cold without a confirmation. An empty four-top on a Friday night is revenue you cannot get back, and manual confirmation calls rarely happen during service." },
      { title: "After-hours and closed-day calls vanish", body: "Guests call to book for the weekend after you have locked up. Catering and private-event inquiries land in a voicemail box that no one checks until the next shift, if at all." },
      { title: "Language barriers turn callers away", body: "A guest who is more comfortable in Spanish, Mandarin, or French often hangs up rather than struggle through a booking. That is a lost reservation and a guest who may not come back." },
    ],
    stats: [
      { value: "24/7", label: "reservations and orders answered, day or night" },
      { value: "25+", label: "languages spoken, switched mid-call" },
      { value: "~10 min", label: "typical setup time" },
      { value: "0", label: "callers stuck on hold or in a queue" },
    ],
    callExample: {
      scenario: "Friday dinner rush reservation",
      turns: [
        { speaker: "ai", text: "Thanks for calling Bella Cucina, this is the reception line. How can I help?" },
        { speaker: "caller", text: "Hi, do you have a table for four tonight around 7:30?" },
        { speaker: "ai", text: "Let me check. We have 7:30 open for a party of four. Can I get a name and a mobile number for the booking?" },
        { speaker: "caller", text: "Sure, it's Dana Ruiz, 555 0142. One of us is gluten free, is that okay?" },
        { speaker: "ai", text: "Yes, the kitchen marks gluten-free options on the menu and can adjust several dishes. I have noted gluten free on the reservation so the host and server see it. You are booked for four at 7:30 tonight, Dana. I will text you a confirmation shortly." },
        { speaker: "caller", text: "Perfect, thank you." },
        { speaker: "ai", text: "See you at 7:30. Have a good evening." },
      ],
      outcome: "A party of four is booked for 7:30 with a gluten-free note, and the host stand gets the reservation summary and guest number by text.",
    },
    useCases: [
      { title: "Peak-hour reservations", body: "Takes bookings during the dinner rush when the host stand is slammed, and drops the party size, time, and name straight into your calendar." },
      { title: "Takeout and to-go orders", body: "Captures pickup order details over the phone and routes them to the host stand or kitchen via the call summary, so nothing is missed during service." },
      { title: "Large parties and events", body: "Handles requests for big tables and private events, gathers date, headcount, and contact, and flags them for a manager to follow up." },
      { title: "Menu, allergen, and parking questions", body: "Answers common guest questions from the brief you provide, including hours, dietary options, and where to park, without pulling a server off the floor." },
      { title: "No-show reduction", body: "Sends a confirmation after the booking call by text or email so guests have the time and details. On the Team plan, outbound campaigns can send reminders before the shift." },
      { title: "Catering and private-event leads", body: "Captures catering inquiries after hours and on closed days, records the details, and emails you a summary so no lead sits in voicemail." },
    ],
    resultsIntro:
      "These figures are illustrative of what restaurants typically aim for when the phone is always answered. Your numbers depend on call volume, seasonality, and how you brief the agent.",
    beforeAfter: [
      { metric: "Rush-hour calls", before: "Ring out while servers run food", after: "Answered and booked on the spot" },
      { metric: "After-hours reservations", before: "Land in an unchecked voicemail", after: "Captured and confirmed 24/7" },
      { metric: "No-show reservations", before: "Booked with no confirmation sent", after: "Confirmed by text after the call" },
      { metric: "Non-English callers", before: "Often hang up mid-call", after: "Served in their own language" },
    ],
    roi: {
      jobValueLabel: "Average value of one reservation or order",
      defaultJobValue: 60,
      defaultMissedCalls: 15,
      note: "This is an illustrative estimate, not a guarantee. Actual results depend on your call volume, average check, and how many missed calls would have become bookings.",
    },
    faqs: [
      { q: "Can it actually take reservations and put them on our calendar?", a: "Yes. It books reservations during the call with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly. After each call it also texts and emails you a transcript and summary so the host stand has the party size, time, and any notes like allergies." },
      { q: "Does it replace our POS or online ordering system?", a: "No. It is not a full POS. It captures takeout and to-go order details over the phone and routes them to your host stand or team through the call summary. For live menu availability and payment you still use your existing systems." },
      { q: "What happens when it does not know an answer?", a: "It admits when it does not know rather than guessing. Based on the rules you set, it can transfer the call to a person or take a message and send you the details, so a guest is never given wrong information about the menu or a booking." },
      { q: "Can it handle guests who do not speak English?", a: "Yes. It speaks more than 25 languages and switches language mid-call based on the caller. A guest who starts in Spanish or Mandarin can book a table without switching to English." },
      { q: "How does it help with no-shows?", a: "After the booking call it texts or emails a confirmation with the time and party size, so guests have the details in hand. On the Team plan, outbound calls and campaigns let you send reminders before the shift. It captures and routes bookings; it does not charge cards or hold deposits itself." },
      { q: "How fast can we set it up and what does it cost?", a: "It is self-serve with no code and usually live in about 10 minutes. You brief it on your hours, menu, prices, FAQs, and escalation rules. It is free to start with no card. Solo is EUR 99 per month for 1,000 talk minutes then EUR 0.09 per extra minute with one phone number. Team is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
    ],
    verdict:
      "If your phone goes unanswered during the rush, an AI receptionist turns missed calls into booked tables, captured orders, and catering leads, in any language, around the clock.",
    testimonials: [
      { quote: "phones ring nonstop during dinner rush. now the AI takes reservations and to-go orders while we cook. saved us so many lost tables.", name: "Marco Bianchi", role: "Restaurant", photo: "/testimonials/marco.jpg" },
      { quote: "Set it up in like 20 minutes during my lunch break. Now it handles all the booking calls while my team works on clients. honestly wish I'd done this a year ago.", name: "Jasmine Torres", role: "Day Spa", photo: "/testimonials/emma.jpg" },
    ],
    integrations: ["Google Calendar", "Outlook", "Calendly", "Zapier"],
    relatedBlog: [
      { label: "How to choose an AI receptionist", href: "/blog/how-to-choose-an-ai-receptionist" },
      { label: "AI receptionist vs virtual receptionist vs answering service", href: "/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service" },
    ],
    author: "brano",
  },
  {
    slug: "law-firms",
    industry: "Law Firms",
    niche: "law firm",
    accent: "#41508a",
    accentSoft: "#ecedf7",
    eyebrow: "For law firms and solo attorneys",
    h1: "AI Receptionist for Law Firms",
    heroSub:
      "People call a lawyer at the worst moment, often after hours, and retain whoever answers first. AI Receptionist Now answers every call in a natural voice 24/7, screens by practice area, takes detailed intake, and books the consultation into your calendar while the caller is still on the line.",
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
      "new client intake software",
      "law firm appointment booking",
      "lawyer call answering ai",
      "legal lead capture",
    ],
    capabilities: [
      "Answers new-client calls 24/7 and captures the matter before they call the next firm",
      "Screens callers by practice area and routes matters you do not take",
      "Takes structured intake: names, dates, opposing party, incident details, and deadlines",
      "Books consultations straight into your calendar with two-way sync",
      "Texts and emails you a full transcript and summary after every call",
      "Escalates urgent matters to an on-call attorney on your rules",
      "Speaks 25+ languages and switches language mid-call for the caller",
      "Captures conflict-check details and hands them to a human before intake proceeds",
    ],
    painPoints: [
      { title: "Callers retain whoever answers first", body: "A prospective client with a legal problem calls three firms and hires the one that picks up. If your line rings out or hits voicemail, that fee walks to the firm across town." },
      { title: "The urgent calls come after hours", body: "Arrests, injuries, evictions, and custody emergencies rarely happen at 10am on a Tuesday. Nights and weekends are when intake matters most and when your office is dark." },
      { title: "Voicemail loses the motivated client", body: "People in a legal crisis will not leave a message and wait. The moment they hang up on voicemail, the intent is gone and so is the case." },
      { title: "Staff cannot take intake and cover the desk", body: "When paralegals are in court prep or on another line, new-client calls go unanswered. One receptionist cannot hold for a hearing date and screen a fresh caller at the same time." },
    ],
    stats: [
      { value: "24/7", label: "call coverage, nights and weekends included" },
      { value: "~90%", label: "of calls answered, typical for always-on coverage" },
      { value: "25+", label: "languages spoken, switched mid-call" },
      { value: "~10 min", label: "typical setup time" },
    ],
    callExample: {
      scenario: "After-hours car accident inquiry",
      turns: [
        { speaker: "caller", text: "Hi, I was in a car accident this afternoon and I think I need a lawyer. Is anyone there?" },
        { speaker: "ai", text: "Yes, thanks for calling Harlow Legal. I am sorry to hear about the accident. I can take your details and get you booked with one of our personal injury attorneys. First, is anyone injured and are you safe right now?" },
        { speaker: "caller", text: "I am okay, a bit of whiplash. The other driver ran a red light and hit me." },
        { speaker: "ai", text: "Understood. I should be clear that I cannot give legal advice, but I can gather your information and schedule a consultation. Can I get your full name and the date and location of the accident?" },
        { speaker: "caller", text: "Sure, it's Daniel Okafor. It happened today around 3pm at Fifth and Main. A police report was filed." },
        { speaker: "ai", text: "Thank you, Daniel. I have your name, today's date, Fifth and Main, and a police report on file. We have a consultation slot tomorrow at 9:30am or 2pm. Which works better?" },
        { speaker: "caller", text: "Let's do 9:30." },
        { speaker: "ai", text: "Booked for 9:30am tomorrow with our personal injury team. You will get a text and email confirmation now, and the attorney will have your intake before you arrive." },
      ],
      outcome: "Consultation booked for 9:30am the next morning with full accident intake captured and a transcript sent to the firm.",
    },
    useCases: [
      { title: "24/7 new-client intake", body: "Answer every prospective client the moment they call, day or night, and capture the matter before they dial the next firm on their list." },
      { title: "Practice-area screening", body: "Qualify callers by matter type and jurisdiction, take the ones you handle, and politely decline or refer the ones outside your practice areas." },
      { title: "Consultation booking", body: "Offer real open slots and book the consultation into your calendar during the call, with two-way sync so double-bookings do not happen." },
      { title: "Detailed intake while motivated", body: "Collect names, dates, opposing parties, deadlines, and incident details while the caller is engaged, so the attorney walks in prepared." },
      { title: "Urgent escalation", body: "Route time-sensitive matters like arrests or filing deadlines to an on-call attorney, or take a priority message on your escalation rules." },
      { title: "Overflow and after-hours cover", body: "Pick up when your line is busy, staff are in court, or the office is closed, so no call rolls to voicemail." },
    ],
    resultsIntro:
      "These figures illustrate what always-on call coverage typically looks like for a firm, not audited results from a specific client. Your numbers depend on your call volume and case values.",
    beforeAfter: [
      { metric: "After-hours calls", before: "Straight to voicemail", after: "Answered and intake taken" },
      { metric: "Simultaneous callers", before: "Busy signal or hold", after: "Every call answered at once" },
      { metric: "New-client intake", before: "Captured next business day", after: "Captured on the first call" },
      { metric: "Consultation booking", before: "Phone tag over days", after: "Booked during the call" },
    ],
    roi: {
      jobValueLabel: "Average value of one signed case",
      defaultJobValue: 2500,
      defaultMissedCalls: 12,
      note: "This is an illustrative estimate based on the numbers you enter, not a guarantee of results.",
    },
    faqs: [
      { q: "Does the AI give legal advice to callers?", a: "No. The AI does not give legal advice and does not create an attorney-client relationship. It captures intake, screens by practice area, and schedules consultations. It is briefed to say so clearly on the call and to hand anything requiring judgment to your attorneys." },
      { q: "How does it handle confidentiality and client data?", a: "All call data is encrypted and is never sold or used to train external models. The service is EU-hosted, GDPR-first, and HIPAA-ready. Transcripts and summaries go only to the people you designate at your firm." },
      { q: "Can it help with conflict-of-interest checks?", a: "It captures the caller's name, the opposing party, and matter details, and can flag a potential conflict to a human before intake proceeds based on rules you set. The final conflict check stays with your firm. The AI gathers the information and routes it." },
      { q: "What happens with an urgent matter after hours?", a: "You define the escalation rules. The AI can transfer an urgent caller to an on-call attorney, or take a detailed priority message and text and email it to you immediately, so time-sensitive matters like arrests or filing deadlines are not missed." },
      { q: "Will it book straight into our calendar?", a: "Yes. It books consultations during the call with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly, so it only offers slots that are actually open and updates your calendar in real time." },
      { q: "How long does setup take and what does it cost?", a: "You can be live in about 10 minutes with no code. You brief it on your hours, practice areas, intake questions, and escalation rules. It is free to start with no card. Solo is EUR 99 per month for 1,000 talk minutes and one number. Team is EUR 299 per month for 3,000 minutes, three numbers, and outbound calls." },
    ],
    verdict:
      "Answer every prospective client the moment they call, take clean intake, and book the consultation before they reach the next firm.",
    testimonials: [
      { quote: "missed calls were killing us at night. now every after hours call gets answered and I get a text recap in the morning. game changer for a small firm.", name: "Rachel Goodwin", role: "Law Office", photo: "/testimonials/rachel.jpg" },
      { quote: "We get a lot of Spanish speaking callers and it switches languages no problem. captures everything and emails me the lead instantly.", name: "Sofia Ramirez", role: "Insurance Agency", photo: "/testimonials/maria.jpg" },
    ],
    integrations: ["Google Calendar", "Outlook", "HubSpot", "Salesforce", "Calendly", "Zapier"],
    relatedBlog: [
      { label: "Law firm answering service: the complete guide", href: "/blog/law-firm-answering-service" },
      { label: "Can an AI receptionist replace a human receptionist?", href: "/blog/can-an-ai-receptionist-replace-a-human-receptionist" },
    ],
    author: "matus",
  },
  {
    slug: "home-services",
    industry: "Home Services",
    niche: "home services business",
    accent: "#2f6fb0",
    accentSoft: "#e9f1fa",
    eyebrow: "For plumbers, HVAC, electricians, and trades",
    h1: "AI Receptionist for Home Services",
    heroSub:
      "You cannot answer the phone with your hands under a sink or up a ladder, so the caller rings the next company. AI Receptionist Now answers every call 24/7 in a natural voice, qualifies the job, books it into your calendar, and texts you the details so you can dispatch.",
    title: "AI Receptionist for Home Services | 24/7 Call Answering",
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
    capabilities: [
      "Answers every call while you are on the tools, on a ladder, or under a sink",
      "Takes after-hours and weekend emergency calls: burst pipe, no heat, no power",
      "Qualifies the job: name, address, problem, and urgency",
      "Books appointments straight into your calendar during the call",
      "Texts and emails you a job summary and transcript after every call",
      "Escalates true emergencies to your on-call tech per your rules",
      "Handles seasonal call spikes with unlimited calls at once",
      "Captures quote requests and new leads that would otherwise go to voicemail",
    ],
    painPoints: [
      { title: "You cannot answer with your hands full", body: "Under a sink, on a roof, or wiring a panel, you cannot stop to take a call. The caller does not leave a message, they just dial the next company on the list." },
      { title: "Emergencies come in after hours", body: "Burst pipes, dead furnaces, and no power do not wait for business hours. If nobody answers the 9pm call, that emergency job and the customer go to a competitor who picked up." },
      { title: "Voicemail loses the job", body: "Most people calling a trade will not leave a voicemail. They want a human who can tell them when someone can come out. A missed ring is usually a lost booking, not a callback." },
      { title: "Seasonal spikes overwhelm one phone", body: "The first cold snap or heat wave floods your line. One person cannot take ten calls at once, so busy signals and hold time push callers straight to the next number." },
    ],
    stats: [
      { value: "24/7", label: "coverage, including nights and weekends" },
      { value: "~10 min", label: "typical setup time" },
      { value: "25+", label: "languages spoken" },
      { value: "0", label: "busy signals, unlimited calls at once" },
    ],
    callExample: {
      scenario: "After-hours burst pipe",
      turns: [
        { speaker: "ai", text: "Thanks for calling Ridgeline Plumbing, this is the front desk. How can I help?" },
        { speaker: "caller", text: "Yeah, I've got water coming out from under my kitchen sink, it's going everywhere." },
        { speaker: "ai", text: "Let's get that handled. First, if you can reach the shutoff valve under the sink or the main, turning it off will stop the flow. Do you need someone out tonight?" },
        { speaker: "caller", text: "Yes, tonight if you can. It's still leaking even with the valve turned." },
        { speaker: "ai", text: "Understood, I'll flag this as an emergency for the on-call tech. Can I get your name and the service address?" },
        { speaker: "caller", text: "Dave Harmon, 42 Willow Court." },
        { speaker: "ai", text: "Got it, Dave. I'm booking an emergency visit and notifying the on-call tech now. You'll get a text confirmation, and the tech will call you back shortly with an arrival time. Is this the best number to reach you?" },
        { speaker: "caller", text: "Yeah, this number is fine. Thank you." },
      ],
      outcome: "Emergency visit captured for Dave Harmon at 42 Willow Court, on-call tech notified, and both the customer and the owner texted the job details.",
    },
    useCases: [
      { title: "Answer while you are on the job", body: "Every call gets picked up in a natural voice even when the whole crew is on the tools. No ring goes to voicemail and no caller hits a busy signal." },
      { title: "After-hours emergency intake", body: "Nights, weekends, and holidays, it takes burst pipe, no heat, and no power calls, tags them as emergencies, and escalates to your on-call tech per your rules." },
      { title: "Qualify and capture the job", body: "It collects the name, service address, the problem, and how urgent it is, so you have a complete job ticket before you ever call back." },
      { title: "Book or dispatch on the spot", body: "It books the visit straight into your calendar during the call with two-way sync, so your schedule stays accurate without double-entry." },
      { title: "Handle quote requests", body: "Callers asking for a quote get their details captured and questions answered from your brief, then land in your pipeline as a lead instead of a lost voicemail." },
      { title: "Absorb seasonal spikes", body: "When the first cold snap or heat wave hits, it answers unlimited calls at once, so a rush of callers all get through in parallel." },
    ],
    resultsIntro:
      "These figures are illustrative of what home services businesses typically aim for when every call gets answered. Your numbers depend on your call volume and your trade.",
    beforeAfter: [
      { metric: "After-hours calls", before: "Straight to voicemail", after: "Answered and triaged 24/7" },
      { metric: "Calls during a job", before: "Missed while on the tools", after: "Picked up in a natural voice" },
      { metric: "Emergency callers", before: "Ring the next company", after: "Escalated to your on-call tech" },
      { metric: "Seasonal spike", before: "Busy signals and hold time", after: "Unlimited calls at once" },
    ],
    roi: {
      jobValueLabel: "Average value of one booked job",
      defaultJobValue: 350,
      defaultMissedCalls: 15,
      note: "This is an illustrative estimate, not a guarantee. Actual results depend on your call volume, close rate, and average job value.",
    },
    faqs: [
      { q: "Can it handle emergency calls like a burst pipe or no heat?", a: "Yes. You set the escalation rules, and it flags urgent calls as emergencies, captures the address and problem, and either transfers to a human or notifies your on-call tech per those rules. It also texts you the job summary right away so you can dispatch. It routes and escalates the call, it does not send a truck itself." },
      { q: "How does it book jobs into my schedule?", a: "It books appointments straight into your calendar during the call, with two-way sync to Google Calendar, Outlook or Microsoft 365, and Calendly. Your schedule stays accurate with no double-entry, and you get a transcript and summary after every call." },
      { q: "What happens when several people call during a busy spell?", a: "It answers unlimited calls at once, so a seasonal rush all gets through in parallel. There is no busy signal and no hold queue, whether it is overflow during the day or the first cold snap of the season." },
      { q: "What if a caller asks something it does not know?", a: "It admits when it does not know rather than bluffing. You brief it on your hours, services, prices, and FAQs, and you set the rules for when it transfers to a human or takes a message." },
      { q: "How long does it take to set up?", a: "It is self-serve with no code and goes live in about 10 minutes. You brief it on your business: hours, services, prices, common questions, and your escalation rules for emergencies and after-hours." },
      { q: "What does it cost?", a: "You can start free with no card. The Solo plan is EUR 99 per month for 1,000 talk minutes, then EUR 0.09 per extra minute, with one phone number. The Team plan is EUR 299 per month for 3,000 minutes, three numbers, plus outbound calls and campaigns." },
    ],
    verdict:
      "If you lose jobs because you cannot answer the phone on the tools or after hours, this catches those calls and turns them into booked work.",
    testimonials: [
      { quote: "couldn't pick up on a job site so I was losing clients every week. This thing answers every call, qualifies the lead and texts me a summary. closed 3 jobs this month I would've missed.", name: "Mike Donovan", role: "Plumbing & Drain", photo: "/testimonials/james.jpg" },
      { quote: "honestly skeptical at first but it handles weird questions better than my old answering service did. and it's a fraction of the price.", name: "Derek Olsen", role: "Roofing Contractor", photo: "/testimonials/henrik.jpg" },
      { quote: "the after hours coverage alone paid for itself. people call at 9pm and still get booked. no more voicemail tag.", name: "Greg Sullivan", role: "Pest Control", photo: "/testimonials/david.jpg" },
    ],
    integrations: ["Google Calendar", "Outlook", "HubSpot", "Calendly", "Zapier"],
    relatedBlog: [
      { label: "AI receptionist for home services", href: "/blog/ai-receptionist-for-home-services" },
      { label: "HVAC answering service: the complete guide", href: "/blog/hvac-answering-service" },
    ],
    author: "brano",
  },
  {
    slug: "property-management",
    industry: "Property Management",
    niche: "property management company",
    accent: "#2f9e6f",
    accentSoft: "#e7f5ee",
    eyebrow: "For property management companies",
    h1: "AI Receptionist for Property Management",
    heroSub:
      "Your phone rings all day with maintenance tickets, leasing inquiries, and after-hours emergencies across every unit you manage. AI Receptionist Now answers every call in a natural voice, triages the urgent ones, logs the routine ones, and books showings straight into your calendar.",
    title: "AI Receptionist for Property Management | 24/7 Calls",
    description:
      "An AI phone agent for property managers that answers tenant maintenance calls 24/7, triages emergencies, books showings, and captures leasing leads.",
    keywords: [
      "AI receptionist for property management",
      "property management answering service",
      "tenant maintenance call answering",
      "after-hours property management calls",
      "leasing inquiry answering service",
      "24/7 property manager phone answering",
      "AI phone agent property management",
      "maintenance emergency triage line",
      "showing scheduling automation",
      "multilingual tenant support",
    ],
    capabilities: [
      "Takes 24/7 tenant maintenance calls and logs a ticket with unit, issue, and contact details",
      "Triages urgency so leaks, no heat, and lockouts escalate while routine requests are logged",
      "Answers leasing inquiries and books showings into Google Calendar, Outlook, or Calendly",
      "Captures prospect name, budget, move-in date, and unit interest into HubSpot or Salesforce",
      "Answers rent, office-hours, pet, and application-policy questions from your brief",
      "Handles many calls at once across your whole portfolio with no busy signal",
      "Speaks 25+ languages and switches mid-call for multilingual residents",
      "Texts and emails you a transcript and summary after every call",
    ],
    painPoints: [
      { title: "After-hours emergencies hit voicemail", body: "A tenant with a burst pipe at 2am gets your answering machine. By morning the damage is done, and you are dealing with an angry resident and a bigger repair bill than the leak itself." },
      { title: "Leasing prospects call once and move on", body: "Renters shopping for a unit call several listings in an afternoon. If line one is busy or nobody picks up, they book a showing with the next property manager and you never hear from them again." },
      { title: "Maintenance calls swamp the office", body: "One leaking water heater in a large building can generate a dozen calls in an hour. Your team cannot answer leasing lines and route repairs at the same time, so something always slips." },
      { title: "Multilingual residents cannot get through", body: "Tenants who are more comfortable in another language give up or wait for someone bilingual to be free. Requests get garbled, mistranslated, or never logged at all." },
    ],
    stats: [
      { value: "24/7", label: "coverage for maintenance and emergencies" },
      { value: "25+", label: "languages spoken" },
      { value: "~10 min", label: "typical setup time" },
      { value: "0", label: "busy signals across the portfolio" },
    ],
    callExample: {
      scenario: "After-hours no-heat call",
      turns: [
        { speaker: "ai", text: "Thank you for calling Oakline Property Management, this is the after-hours line. How can I help?" },
        { speaker: "caller", text: "Hi, I'm at 214 Maple, apartment 3B, and the heat is completely out. It's freezing in here." },
        { speaker: "ai", text: "I'm sorry to hear that. No heat overnight counts as an emergency, so I'll get this to on-call maintenance right away. Can I confirm the best number to reach you, and is anyone in the unit at higher risk from the cold, like an infant or an elderly resident?" },
        { speaker: "caller", text: "Yes, my number is on file. My mother is here, she's 78." },
        { speaker: "ai", text: "Understood, I'm flagging this as priority. I have unit 3B at 214 Maple, no heat, an elderly resident on site. On-call maintenance will be paged now and should call you back shortly." },
        { speaker: "caller", text: "Thank you, that's a relief." },
        { speaker: "ai", text: "You're welcome. I've logged the ticket and sent it to the on-call tech. You'll get a text with the reference number in a moment." },
      ],
      outcome: "Emergency triaged and escalated to on-call maintenance with a logged ticket and text confirmation to the tenant.",
    },
    useCases: [
      { title: "Emergency triage", body: "Leaks, no heat, gas smell, and lockouts are recognized as urgent and escalated to on-call maintenance or a human on your rules, with the unit and details captured." },
      { title: "Routine maintenance intake", body: "A dripping faucet or a squeaky door gets logged as a routine ticket with unit number and description, ready to feed into your property management system." },
      { title: "Showing scheduling", body: "Prospects book an available showing slot straight into your calendar during the call, with two-way sync so your team never double-books a unit." },
      { title: "Leasing lead capture", body: "Name, budget, desired move-in date, and unit interest go into HubSpot or Salesforce so no renter inquiry sits in a voicemail overnight." },
      { title: "Policy and rent FAQs", body: "Office hours, rent due dates, pet policy, application fees, and parking rules are answered from your brief, so simple questions never tie up staff." },
      { title: "Overflow across the portfolio", body: "When one building floods your lines, the AI answers every call at once so leasing and routine requests keep flowing instead of hitting a busy signal." },
    ],
    resultsIntro:
      "Illustrative of what property managers typically see once every call is answered and triaged instead of going to voicemail. Your numbers depend on your portfolio and call mix.",
    beforeAfter: [
      { metric: "After-hours emergency calls", before: "Straight to voicemail until morning", after: "Triaged and escalated to on-call in real time" },
      { metric: "Leasing inquiries", before: "Lost when the line is busy", after: "Answered and booked into the calendar" },
      { metric: "Maintenance ticket logging", before: "Scribbled notes, some missed", after: "Every call logged with unit and details" },
      { metric: "Non-English callers", before: "Wait or give up", after: "Served in their language on the call" },
    ],
    roi: {
      jobValueLabel: "Average annual value of a signed lease",
      defaultJobValue: 1800,
      defaultMissedCalls: 15,
      note: "This is an illustrative estimate, not a guarantee. Actual results depend on your portfolio, call volume, and how many inquiries convert to leases.",
    },
    faqs: [
      { q: "Can it tell an emergency from a routine maintenance request?", a: "Yes. You brief it on which situations are urgent, such as leaks, no heat, gas smells, or lockouts, and how to handle them. Urgent calls are escalated to on-call maintenance or a human on your rules, while routine requests are logged as tickets with the unit and details. If it is ever unsure, it can transfer or take a message rather than guess." },
      { q: "Does it book showings into our calendar?", a: "Yes. It books appointments directly into Google Calendar, Outlook, or Calendly during the call, with two-way sync so an already-taken slot never gets double-booked. Prospect details can also flow into HubSpot or Salesforce." },
      { q: "What happens to the caller's information and is it secure?", a: "All call data is encrypted, hosted in the EU, and handled GDPR-first. It is never sold or used to train external models. The product is also HIPAA-ready if you handle sensitive resident information." },
      { q: "Can it handle tenants who speak another language?", a: "Yes. It speaks 25+ languages and switches language mid-call based on the caller, so a resident more comfortable in Spanish, Polish, or another language is understood and their request is logged correctly." },
      { q: "What if a call is too complex for the AI?", a: "It admits when it does not know rather than bluffing, and follows your rules to transfer to a human or take a message. After every call you get a transcript and summary by text and email, so nothing is lost." },
      { q: "How long does setup take and do I need a developer?", a: "It is self-serve with no code and is usually live in about 10 minutes. You brief it on your hours, services, policies, FAQs, and escalation rules. You can start free with no card. The Solo plan is EUR 99 per month and Team is EUR 299 per month." },
    ],
    verdict:
      "A calm, always-on front desk for your portfolio that triages emergencies, logs routine tickets, and books showings so no tenant or prospect hits voicemail.",
    testimonials: [
      { quote: "One person agency here, I can't always answer. It qualifies every caller, grabs their details and books showings straight into my calendar. like a full time receptionist for nothing.", name: "Brian Callahan", role: "Realtor", photo: "/testimonials/michael.jpg" },
      { quote: "integrates straight into our calendar and CRM so nothing gets lost. setup took one evening and it's been running flawless since.", name: "Daniel Wright", role: "Real Estate Team", photo: "/testimonials/oliver.jpg" },
    ],
    integrations: ["Google Calendar", "Outlook", "HubSpot", "Salesforce", "Calendly", "Zapier"],
    relatedBlog: [
      { label: "Real estate answering service: the complete guide", href: "/blog/real-estate-answering-service" },
      { label: "Can an AI receptionist book appointments?", href: "/answers/can-an-ai-receptionist-book-appointments" },
    ],
    author: "matus",
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
