import {
  Lead,
  P,
  H2,
  UL,
  LI,
  Strong,
  Ext,
  Internal,
  Callout,
  Figure,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  Mono,
  type Source,
  type FaqItem,
} from "../_components/prose";
import { PromptBlock } from "../_components/prompt-block";

export const meta = {
  slug: "ai-receptionist-prompts",
  title: "AI Receptionist Prompts: 10 Copy-Paste Templates (2026)",
  description:
    "The exact prompts we run in production — greeting, booking, escalation, after-hours — free to copy, plus the mistakes that quietly ruin most AI receptionists.",
  date: "2026-07-04",
  updated: "2026-07-04",
  readingTime: "14 min read",
  tag: "Guides",
  hero: "/blog/ai-receptionist-prompts-hero.webp",
  heroAlt:
    "A laptop and an open notebook with a pen on a wooden desk, representing the work of writing and refining an AI receptionist prompt",
  heroWidth: 1600,
  heroHeight: 900,
  heroCredit: "Photo by Nick Morrison on Unsplash",
  heroCreditUrl:
    "https://unsplash.com/photos/macbook-pro-near-white-open-book-FHnnjk1Yj7Y",
  keywords: [
    "AI receptionist prompts",
    "AI receptionist script",
    "AI receptionist prompt template",
    "system prompt for AI receptionist",
    "AI phone agent prompt",
    "AI receptionist greeting script",
    "AI answering service script",
    "prompt engineering for voice AI",
  ],
  sections: [
    { id: "why-prompts", title: "Why the prompt decides so much" },
    { id: "anatomy", title: "Anatomy of a working prompt" },
    { id: "master-template", title: "The master template" },
    { id: "greeting", title: "Greeting & AI disclosure" },
    { id: "booking", title: "Appointment booking" },
    { id: "faqs-pricing", title: "FAQs & pricing questions" },
    { id: "messages", title: "Message-taking" },
    { id: "escalation", title: "Escalation & transfer" },
    { id: "after-hours", title: "After-hours & emergencies" },
    { id: "spam", title: "Robocalls & sales calls" },
    { id: "industries", title: "Industry adjustments" },
    { id: "mistakes", title: "Five prompts that backfire" },
    { id: "testing", title: "Test it like a caller" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "Do I need to be a prompt engineer to set up an AI receptionist?",
      a: "No. A working AI receptionist prompt is closer to a good employee handbook than to code: who you are, what you offer, what to say, when to hand off. If you can write a one-page brief for a new front-desk hire, you can write the prompt. The templates in this guide give you the structure; your job is filling in accurate business facts and deciding your escalation rules. Most vendors, including us, will also write or tune it for you during onboarding.",
    },
    {
      q: "How long should an AI receptionist prompt be?",
      a: "Long enough to contain your facts and rules, short enough that every line earns its place — for most small businesses that's roughly 300 to 700 words. Prompts fail at both extremes: a two-line prompt forces the AI to improvise facts you never gave it, and a 3,000-word prompt buries the rules that matter under trivia. If you can't say why a line exists, cut it and test the difference on a real call.",
    },
    {
      q: "Should my AI receptionist pretend to be human?",
      a: "No. Instructing an AI to deny being an AI is the single most damaging line you can put in a prompt. Callers who catch it — and many do — feel deceived, which is worse for your brand than any robotic voice. Regulators are also moving in one direction on this: the FCC has already ruled AI-generated voices in robocalls illegal, and disclosure expectations keep tightening. A confident one-line disclosure costs you almost nothing and defuses the question immediately.",
    },
    {
      q: "How often should I update the prompt?",
      a: "Treat the first two weeks as tuning: read call transcripts every few days, find where the AI stumbled or guessed, and fix that specific line. After that, revisit the prompt whenever facts change — hours, prices, services, staff — and once a month as a habit. A prompt with last year's prices is worse than no answer at all, because the AI will state it confidently.",
    },
    {
      q: "Will these prompt templates work with any AI receptionist platform?",
      a: "The structure and rules transfer to any modern platform — they're plain-language instructions, not vendor syntax. What varies is how each platform handles variables, calendar access, and transfers: replace the {{PLACEHOLDERS}} with your platform's variable format, and confirm that instructions like 'warm transfer' map to a feature the platform actually has. A prompt can only promise what the underlying system can do.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Anthropic: Prompt engineering overview (Claude documentation)",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
  },
  {
    title: "OpenAI: Prompt engineering guide",
    url: "https://platform.openai.com/docs/guides/prompt-engineering",
  },
  {
    title:
      "FCC: AI-generated voices in robocalls are illegal under the TCPA (Feb 2024 ruling)",
    url: "https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal",
  },
  {
    title:
      "FTC .com Disclosures: how to make effective disclosures in digital advertising",
    url: "https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Full disclosure: we sell an AI receptionist, and part of what you pay us
        for is writing these prompts so you don&apos;t have to. Publishing our
        templates is, strictly speaking, against our interest. We&apos;re doing
        it anyway, because most of the &quot;AI receptionist prompt&quot; advice
        online is written by people who have never listened to a hundred real
        calls fail in a row — and because a prompt is only one layer of the
        product. Below: the exact structure we deploy, ten copy-paste templates,
        the five mistakes that quietly ruin most setups (we made several of them
        ourselves), and how to test what you built.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            A good prompt is an <Strong>employee handbook, not code</Strong>:
            identity, allowed facts, call flow, voice rules, escalation. Write
            those five sections and you&apos;re ahead of most paid setups.
          </>,
          <>
            The most valuable line in any prompt is the one that says{" "}
            <Strong>&quot;if you don&apos;t know, say so and take a
            message&quot;</Strong>. Improvised facts are how AI receptionists
            destroy trust.
          </>,
          <>
            <Strong>Never tell the AI to deny being an AI.</Strong> It&apos;s the
            most damaging instruction you can write, and regulators are moving
            against it anyway.
          </>,
          <>
            A prompt can&apos;t fix latency, a bad voice, or a missing calendar
            integration. <Strong>Prompts shape behavior; the platform sets the
            ceiling.</Strong>
          </>,
        ]}
      />

      <H2 id="why-prompts">Why the prompt decides so much (and what it can&apos;t fix)</H2>
      <P>
        Two businesses can run the same AI receptionist platform and get
        opposite results. One books jobs at 2 a.m.; the other collects one-star
        reviews about &quot;the robot that wouldn&apos;t shut up.&quot; The
        difference is almost never the underlying model. It&apos;s the prompt:
        the written instructions that tell the AI who it is, what it knows, and
        what to do when a call goes sideways.
      </P>
      <P>
        Let&apos;s also be honest about the limits, because prompt guides love
        to oversell. A prompt cannot fix a platform with three seconds of
        latency, a voice that grates, or no real calendar access — if the
        system can&apos;t see your availability, no instruction will make
        bookings real. Those are buying decisions, and we cover them in{" "}
        <Internal href="/blog/how-to-choose-an-ai-receptionist">
          how to choose an AI receptionist
        </Internal>
        . But within what your platform can do, the prompt is the highest-leverage
        thing you control, and it&apos;s the part most people either neglect
        (two vague lines) or overdo (a 3,000-word novel the AI recites at
        callers).
      </P>
      <Callout>
        We learned the &quot;novel&quot; lesson on our own product. An early
        prompt of ours included the full service list, and the agent dutifully
        read it to callers — all of it. People hung up mid-list. The fix
        wasn&apos;t a smarter model; it was deleting 40 lines and adding one:
        &quot;two sentences maximum, then let the caller talk.&quot;
      </Callout>

      <H2 id="anatomy">Anatomy of a prompt that survives real calls</H2>
      <P>
        Every template in this guide is a variation of the same five-part
        skeleton. The order matters less than the coverage: most broken prompts
        we&apos;re asked to rescue are missing sections four and five entirely.
      </P>

      <Figure
        src="/blog/ai-receptionist-prompt-anatomy.svg"
        alt="Diagram of an AI receptionist system prompt with five sections: identity and role, facts it may state, call flow, voice rules and boundaries, and escalation rules"
        width={1200}
        height={630}
        caption="The five sections of a working AI receptionist prompt. Escalation is highlighted because it's the section most prompts skip — and the one that decides your worst call, not your best one."
      />

      <UL>
        <LI>
          <Strong>Identity &amp; role.</Strong> Who the AI is, which business it
          answers for, and how it handles &quot;are you a robot?&quot; One
          honest sentence, decided in advance.
        </LI>
        <LI>
          <Strong>Facts it may state.</Strong> Hours, services, prices, service
          area — an explicit whitelist. Everything outside the list gets a
          callback, not a guess.
        </LI>
        <LI>
          <Strong>Call flow.</Strong> The job, in order: greet, find the reason
          for the call, then book, answer, or take a message. This is a script
          skeleton, not a word-for-word script.
        </LI>
        <LI>
          <Strong>Voice rules &amp; boundaries.</Strong> Written for the ear:
          short turns, one question at a time, plain numbers, stop when
          interrupted. This section is why two prompts with identical facts can
          sound like a person versus a phone tree.
        </LI>
        <LI>
          <Strong>Escalation rules.</Strong> Exactly when to stop being helpful
          and hand off — and what the caller hears while it happens. The
          general principles are the same ones in{" "}
          <Ext href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview">
            Anthropic&apos;s
          </Ext>{" "}
          and{" "}
          <Ext href="https://platform.openai.com/docs/guides/prompt-engineering">
            OpenAI&apos;s
          </Ext>{" "}
          prompt-engineering guides — be specific, give the model an out — but
          on a phone call the &quot;out&quot; is a human being, and it needs a
          phone number.
        </LI>
      </UL>

      <H2 id="master-template">The master template (copy this first)</H2>
      <P>
        This is the full skeleton with every section in place. Replace the{" "}
        <Mono>{"{{PLACEHOLDERS}}"}</Mono> with your real details, delete what
        doesn&apos;t apply, and resist the urge to add — every line you append
        competes for the AI&apos;s attention with the lines that matter.
      </P>

      <PromptBlock
        label="Template 1 · Master system prompt"
        text={`You are {{AI_NAME}}, the phone receptionist for {{BUSINESS_NAME}}, a {{BUSINESS_TYPE}} in {{CITY}}.

IDENTITY
- You answer the phone for {{BUSINESS_NAME}}. You are warm, competent, and brief.
- You are an AI. If a caller asks, confirm it plainly and move on: "Yes — I'm {{BUSINESS_NAME}}'s AI assistant. I can still book you in or take a message."
- Never claim to be a person. Never invent names, staff, or details you weren't given.

WHAT YOU KNOW (the only facts you may state)
- Hours: {{HOURS}}
- Location: {{ADDRESS}}
- Services: {{TOP_SERVICES}}
- Pricing: {{PRICES_YOU_MAY_QUOTE — or "Do not quote prices; offer to have the team confirm."}}
- Service area: {{SERVICE_AREA}}
If the answer is not listed above, do NOT guess. Say: "Good question — I don't want to give you a wrong answer. I'll have {{OWNER_FIRST_NAME}} get back to you today with the exact details."

YOUR JOB, IN ORDER
1. Answer with: "Thanks for calling {{BUSINESS_NAME}}, this is {{AI_NAME}}. How can I help?"
2. Find out why they're calling: new booking, reschedule, question, urgent problem, or something else.
3. New booking → follow the BOOKING flow. Question → answer only from WHAT YOU KNOW. Urgent → follow ESCALATION.
4. Before ending any call, confirm: the caller's name, their phone number (read it back digit by digit), and what happens next.

HOW TO SPEAK
- One question at a time.
- Two sentences maximum per turn, then let the caller talk.
- Plain words and plain numbers: "nine thirty tomorrow morning," not "09:30 AM."
- If the caller interrupts, stop immediately and listen.
- If you didn't catch something, ask again once. The second time, offer to take their number instead of asking a third time.

WHAT YOU MUST NEVER DO
- Never diagnose a problem, quote an unlisted price, or promise an arrival time you can't see in the calendar.
- Never argue. If a caller is upset, acknowledge once ("I hear you — let's get this sorted") and move to ESCALATION.
- Never keep a caller going in circles. If the call passes three minutes without progress: book, take a message, or transfer.

ESCALATION
- Transfer immediately if: the caller asks for a human in any form, describes an emergency ({{EMERGENCY_EXAMPLES}}), or you have misunderstood twice in a row.
- Transfer to {{TRANSFER_NUMBER}}. Say: "Let me get someone on the line for you — one moment."
- If no one answers: take a message (name, number, one-sentence summary), tell the caller exactly when to expect a callback, and send the summary to {{NOTIFY_DESTINATION}}.`}
      />

      <P>
        Everything below is a zoomed-in module of this skeleton: drop-in
        replacements for a single section when the default isn&apos;t enough for
        your business.
      </P>

      <H2 id="greeting">Greeting &amp; AI disclosure</H2>
      <P>
        The greeting has one job: tell the caller they reached the right place
        and that something competent picked up. Keep it under four seconds of
        speech — callers decide whether to hang up in roughly that window, and a
        slow, over-written greeting is the fastest way to lose them.
      </P>

      <PromptBlock
        label="Template 2 · Greetings for three situations"
        text={`DEFAULT (business hours):
"Thanks for calling {{BUSINESS_NAME}}, this is {{AI_NAME}}. How can I help you today?"

AFTER-HOURS:
"Thanks for calling {{BUSINESS_NAME}}. We're closed right now, but I can book you an appointment or take a message — which would you like?"

OVERFLOW (everyone's busy):
"Thanks for calling {{BUSINESS_NAME}} — the whole team is helping other customers, so you've got me, {{AI_NAME}}. I can book you in, answer questions, or take a message."`}
      />

      <P>
        Then there&apos;s the question every AI receptionist gets:{" "}
        <em>&quot;am I talking to a robot?&quot;</em> Decide the answer in the
        prompt, not on the call. The honest answer is also the practical one —
        callers who feel deceived are the ones who leave reviews about it, and
        the regulatory direction is unambiguous after the{" "}
        <Ext href="https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal">
          FCC&apos;s ruling on AI voices
        </Ext>
        . We wrote more on why honesty also happens to sound better in{" "}
        <Internal href="/blog/do-ai-voices-sound-human-on-the-phone">
          do AI voices sound human on the phone
        </Internal>
        .
      </P>

      <PromptBlock
        label="Template 3 · The disclosure answer"
        text={`If the caller asks "am I talking to a robot?", "is this AI?", "are you real?", or anything similar:
"You are — I'm {{BUSINESS_NAME}}'s AI assistant. I can book appointments and answer most questions, and if you'd rather talk to a person I'll connect you or have someone call you back. What works best?"

Rules:
- Answer the question directly in the first three words. Never dodge, never say "I'm a virtual assistant" as a way to avoid saying "AI."
- Say it once, confidently, and return to the caller's actual need. Do not apologize for being an AI.`}
      />

      <H2 id="booking">Appointment booking</H2>
      <P>
        Booking is where vague prompts fall apart, because it&apos;s a
        multi-step exchange with real consequences: a wrong phone number or a
        promised slot that doesn&apos;t exist costs you the exact job the AI was
        supposed to save. The fix is to specify the order of questions and the
        confirmation step explicitly.
      </P>

      <PromptBlock
        label="Template 4 · Booking flow"
        text={`BOOKING — collect in this order, one question at a time:
1. The service needed: "What can we help you with?"
2. Name — confirm the spelling if it's unusual.
3. Phone number — always read it back digit by digit.
4. Preferred day or time — then offer the two nearest open slots from the calendar. Two options, not a list.
5. {{INDUSTRY_FIELD — e.g., the property address for home visits; new or returning patient; insurance carrier}}

Then confirm everything in one sentence:
"So that's {{SERVICE}} on {{DAY}} at {{TIME}} for {{NAME}} — you'll get a text confirmation in a minute."

Rules:
- Never offer a time you cannot see as available in the calendar.
- If nothing fits, offer a callback or the waitlist. Do not negotiate times you can't verify.
- For reschedules or cancellations, confirm the caller's name AND phone number against the existing appointment before changing anything.`}
      />

      <Callout>
        Notice what this template assumes: real calendar access. If your
        platform only <em>pretends</em> to book — taking a request and emailing
        it to you — no prompt fixes that, and you should say &quot;request an
        appointment&quot; in the greeting instead. Honesty in the prompt beats
        an apology after the double-booking.
      </Callout>

      <H2 id="faqs-pricing">FAQs &amp; pricing questions</H2>
      <P>
        The failure mode here isn&apos;t ignorance — it&apos;s confidence.
        Large language models answer fluently whether or not they know, so the
        prompt&apos;s job is to draw a hard line between the facts you supplied
        and everything else. Pricing deserves its own rules because it&apos;s
        the question callers ask most and the one where a made-up answer hurts
        most.
      </P>

      <PromptBlock
        label="Template 5 · FAQ and pricing rules"
        text={`ANSWERING QUESTIONS
- If the answer is in WHAT YOU KNOW: give it in one or two sentences, then ask if they'd like to book.
- If asked about price and a price is listed: state it plainly, no hedging.
- If asked about price and no price is listed:
  "It genuinely depends on the job, and I don't want to guess and be wrong. Can I take your number and have {{OWNER_FIRST_NAME}} text you an exact quote today?"
- If asked anything about {{REGULATED_TOPICS — e.g., medical advice, legal outcomes, insurance coverage, warranties}}:
  do not answer even partially. Say the team will call back, and mark the message {{PRIORITY_TAG}}.
- Never say "I don't have access to that information" — it sounds like a system error. Say what you WILL do instead: "I'll have the team confirm that for you today."`}
      />

      <H2 id="messages">Message-taking</H2>
      <P>
        A message is a contract with the caller: you promised someone will call
        back. The template makes the AI collect exactly what a callback needs
        and — the part everyone forgets — commit to a time window, because
        &quot;someone will get back to you&quot; is what voicemail says, and
        callers treat it accordingly.
      </P>

      <PromptBlock
        label="Template 6 · Message-taking"
        text={`When taking a message, collect exactly four things:
1. Name — confirm the spelling.
2. Callback number — read it back digit by digit.
3. What it's about, in one sentence. Don't interrogate; one sentence is enough.
4. Urgency: "Does this need a call back today, or is tomorrow okay?"

Close with a commitment, not a brush-off:
"Got it — {{OWNER_FIRST_NAME}} will call you back {{CALLBACK_WINDOW — e.g., 'within two hours' / 'by 9 tomorrow morning'}}. Anything else I can note down?"

Send the summary to {{NOTIFY_DESTINATION}} immediately. Prefix it [URGENT] whenever the caller said it can't wait.`}
      />

      <H2 id="escalation">Escalation &amp; transfer</H2>
      <P>
        If you copy only one module from this page, make it this one. Every AI
        receptionist demos beautifully on the happy path; the product reveals
        itself on the call it can&apos;t handle. An AI that recognizes that
        moment and hands off cleanly protects your brand. One that keeps
        trying — politely, fluently, endlessly — is how you end up in a
        one-star review titled &quot;trapped by a robot.&quot; We&apos;d rather
        our AI transfer one call too many than one too few, and we&apos;ve
        tuned our defaults that direction even though it makes our usage
        numbers look worse.
      </P>

      <PromptBlock
        label="Template 7 · Escalation rules"
        text={`ESCALATION TRIGGERS — hand off, don't keep handling:
- The caller asks for a human in ANY form: "real person," "someone there," "let me talk to the owner," or plain frustration with you.
- The caller mentions {{EMERGENCY_WORDS — e.g., "flooding," "no heat," "severe pain," "court date tomorrow"}}.
- The caller is still upset after one acknowledgment from you.
- You have misunderstood, or been corrected, twice in a row.

HOW TO HAND OFF
- During business hours: "Of course — let me get someone on the line. One moment." Then warm-transfer to {{TRANSFER_NUMBER}} and stay on the line until a human picks up.
- If nobody answers within 25 seconds: "No one's free right this second — I'm sorry. I'll take your details and have someone call you within {{CALLBACK_SLA}}. Is that okay?"
- Never transfer a caller into voicemail without telling them that's where they're going.
- Never resist the handoff. Not even once. "Are you sure? I can help with most things" is forbidden.`}
      />

      <H2 id="after-hours">After-hours &amp; emergencies</H2>
      <P>
        After-hours is where an AI receptionist earns its keep — it&apos;s the
        shift no human wants — but it needs different instructions, because the
        safety net of &quot;transfer to the front desk&quot; is gone. The
        prompt has to define what counts as a true emergency for{" "}
        <em>your</em> business and what the AI does about it at 2 a.m.
      </P>

      <PromptBlock
        label="Template 8 · After-hours mode"
        text={`AFTER-HOURS MODE ({{CLOSED_HOURS}}):
- Use the after-hours greeting. Never pretend the office is open or that a human is available right now.
- You can still: book appointments for the next open day, answer questions from WHAT YOU KNOW, and take messages.

EMERGENCY TRIAGE
- If the caller describes {{TRUE_EMERGENCY — e.g., burst pipe, no heat in winter, lockout, severe tooth pain}}:
  "That sounds urgent — I'm going to notify our on-call {{ROLE}} right now. Stay near your phone."
  Then page {{ONCALL_NUMBER}} and send an [URGENT] summary to {{NOTIFY_DESTINATION}}.
- If the situation could be life-threatening, say this before anything else:
  "If this is a medical emergency or anyone is in danger, please hang up and call 911 first."
- Everything that is not an emergency gets tomorrow's first callback window, stated plainly: "The team opens at {{OPEN_TIME}} and you'll be their first call."`}
      />

      <H2 id="spam">Robocalls &amp; sales calls</H2>
      <P>
        Nobody puts this in prompt guides, but a real business line gets a
        steady diet of robocalls, &quot;quick questions about your Google
        listing,&quot; and pitches. Without instructions, your AI will politely
        chat with a robot for four minutes on your dime — ours did, in the
        early days, and the transcripts were as funny as they were expensive.
      </P>

      <PromptBlock
        label="Template 9 · Spam and solicitation filter"
        text={`If the caller is a robocall, telemarketer, or opens with a pitch ("your Google listing," "business loans," "we buy houses"):
- Verify once: "Just to check — are you calling about {{BUSINESS_TYPE}} services for yourself?"
- If it's a pitch: "Thanks, but we're not interested — please remove this number from your list." Then end the call politely. Do not stay on to be persuaded.
- Never book meetings for salespeople. Never confirm the owner's name, direct number, or email to an unsolicited caller.
- Log the call as spam. Do NOT send a notification — the owner should not be woken up by a robocall summary.`}
      />

      <H2 id="industries">Industry adjustments</H2>
      <P>
        The skeleton stays the same across industries; what changes is the
        intake fields, the emergency definitions, and the compliance lines. The
        table below shows the deltas, and the linked guides go deep on each
        vertical.
      </P>

      <Table
        caption="What to change per industry"
        head={["Industry", "Add to the prompt", "Deep dive"]}
        rows={[
          [
            "Dental / medical",
            "New vs. returning patient, insurance carrier, pain triage (severe pain = same-day). No clinical advice, ever — and mind HIPAA before patient data touches any system.",
            <Internal
              key="dental"
              href="/blog/dental-answering-service"
            >
              Dental answering service
            </Internal>,
          ],
          [
            "HVAC / plumbing / trades",
            "Property address and access notes, no-heat/no-cooling and water-leak triage, service-area check before booking, on-call dispatch rules.",
            <Internal
              key="home-services"
              href="/blog/ai-receptionist-for-home-services"
            >
              AI receptionist for home services
            </Internal>,
          ],
          [
            "Law firms",
            "Practice-area screening, conflict-check questions, absolutely no legal advice or outcome predictions, urgent flags for court dates and custody.",
            <Internal key="law" href="/blog/law-firm-answering-service">
              Law firm answering service
            </Internal>,
          ],
          [
            "Real estate",
            "Buying vs. selling vs. renting, property of interest, pre-qualification questions, showing scheduling tied to the agent's calendar.",
            <Internal
              key="realestate"
              href="/blog/real-estate-answering-service"
            >
              Real estate answering service
            </Internal>,
          ],
        ]}
      />

      <P>
        As one worked example, here&apos;s the dental intake module that
        replaces step 5 of the booking flow:
      </P>

      <PromptBlock
        label="Template 10 · Dental intake module (booking step 5)"
        text={`5. Ask: "Have you been to {{PRACTICE_NAME}} before?"
   - NEW patient → collect: date of birth, insurance carrier (name only, no policy numbers over the phone), and how they heard about the practice. Book only into slots marked {{NEW_PATIENT_SLOT_TYPE}}.
   - RETURNING patient → confirm name + phone against the file. Do not read any personal or treatment details back to the caller beyond confirming the appointment time.
   - PAIN: if the caller mentions severe pain, swelling, or a knocked-out tooth, treat it as urgent — offer today's emergency slot or page {{ONCALL_NUMBER}} after hours.
   - Never discuss diagnoses, treatment plans, or costs of treatment; the clinical team confirms those.`}
      />

      <H2 id="mistakes">Five prompts that backfire (we&apos;ve written some of them)</H2>
      <P>
        Every one of these comes from a real prompt we&apos;ve written,
        reviewed, or been asked to rescue. They fail quietly: the demo looks
        fine, and the damage shows up weeks later in transcripts and reviews.
      </P>
      <UL>
        <LI>
          <Strong>The novel.</Strong> Two thousand words covering company
          history, brand values, and every service tier. The AI can&apos;t tell
          which lines matter, so it performs all of them — and callers hang up
          mid-recital. Our own first prompt had this bug. If a line
          doesn&apos;t change what the AI <em>does</em>, cut it.
        </LI>
        <LI>
          <Strong>The human cosplay.</Strong> &quot;Never reveal you are an
          AI.&quot; The single worst instruction in circulation. Callers catch
          it, feel played, and tell the internet; regulators are tightening
          disclosure expectations in exactly this direction (the{" "}
          <Ext href="https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising">
            FTC&apos;s disclosure guidance
          </Ext>{" "}
          is a good read on the spirit of it). Disclose once, confidently, and
          move on.
        </LI>
        <LI>
          <Strong>The over-promiser.</Strong> &quot;Tell callers we&apos;ll fix
          it same-day!&quot; The AI will promise it at 4:55 p.m. on a Friday to
          a caller three towns outside your service area. Every promise in the
          prompt must be one the business keeps on its worst day, not its best.
        </LI>
        <LI>
          <Strong>The personality kit.</Strong> &quot;Be witty, charming, and
          fun!&quot; Charm is a fine seasoning and a terrible instruction — you
          get jokes delivered to someone calling about a flooded kitchen.
          Specify tone with boundaries (&quot;warm, brief, plain-spoken&quot;)
          and let competence be the personality.
        </LI>
        <LI>
          <Strong>The happy path.</Strong> A prompt that describes booking
          perfectly and says nothing about failure. No &quot;if you don&apos;t
          know,&quot; no &quot;if they&apos;re angry,&quot; no &quot;if
          you&apos;ve misheard twice.&quot; The AI improvises exactly where
          improvisation is most expensive. Sections four and five of the master
          template exist because of this one.
        </LI>
      </UL>

      <H2 id="testing">Test it like a caller, not like an owner</H2>
      <P>
        A prompt isn&apos;t done when it reads well — it&apos;s done when it
        survives calls from people who didn&apos;t read it. You are the worst
        possible tester of your own prompt, because you know what it&apos;s
        supposed to do and you unconsciously stay on the path. Test it the way
        callers actually behave.
      </P>

      <Figure
        src="/blog/ai-receptionist-prompt-testing.webp"
        alt="A business owner on a phone call taking notes in a notebook, testing how an AI receptionist handles a real conversation"
        width={1376}
        height={768}
        caption="The only test that counts: call your own number, go off script, and take notes on where it bends. Ten minutes of adversarial calling beats an hour of prompt polishing."
        credit="Photo by Vitaly Gariev on Unsplash"
        creditUrl="https://unsplash.com/photos/man-on-phone-taking-notes-at-desk-P08ADyMEr18"
      />

      <UL>
        <LI>
          <Strong>Book something end to end</Strong> — then check the calendar
          and your phone. Did the confirmation actually arrive, with the right
          details?
        </LI>
        <LI>
          <Strong>Ask a question you didn&apos;t put in the prompt.</Strong>{" "}
          The right answer is a graceful &quot;I&apos;ll have the team
          confirm&quot; — anything invented means your facts whitelist has a
          hole.
        </LI>
        <LI>
          <Strong>Get annoyed, mumble, interrupt, change your mind.</Strong>{" "}
          This is the median caller, not the edge case.
        </LI>
        <LI>
          <Strong>Ask for a human</Strong> and let the whole escalation path
          play out, including the nobody-answers branch. Time it.
        </LI>
        <LI>
          <Strong>Read the transcripts weekly</Strong> for the first month.
          Every stumble maps to one fixable line in the prompt. Fix that line,
          not the vibes.
        </LI>
      </UL>
      <P>
        And a final honest note: if you run these tests against a platform and
        the prompt isn&apos;t the thing failing — the latency is, or the voice,
        or the fake &quot;booking&quot; — no template on this page will save
        it. That&apos;s a vendor problem, and our{" "}
        <Internal href="/blog/how-to-choose-an-ai-receptionist">
          buyer&apos;s guide
        </Internal>{" "}
        covers how to spot it before you pay. If you want to hear these
        templates running in production, call our{" "}
        <Internal href="/">AI receptionist</Internal> and try to break it — the
        escalation rules above are the ones it&apos;s running. Setup and{" "}
        <Internal href="/pricing">pricing</Internal> take about ten minutes,
        prompts included.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
