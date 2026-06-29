import type { ComponentType } from "react";
import {
  P,
  H2,
  UL,
  LI,
  Strong,
  Internal,
  Callout,
  Table,
  type FaqItem,
} from "../../blog/_components/prose";
import { type AuthorKey } from "@/lib/site";

export type Answer = {
  slug: string;
  /** The long-tail question — used as the H1, page title, and schema Question. */
  question: string;
  /** Direct 40–60 word answer shown in the Quick Answer box and used as the schema acceptedAnswer. */
  shortAnswer: string;
  /** Meta description (~150 chars). */
  description: string;
  keywords: string[];
  category: string;
  date: string;
  updated: string;
  /** Which site author is credited (see lib/site authors). */
  author: AuthorKey;
  /** Sub-questions answered in the body — mirrored into FAQPage schema. */
  faqs: FaqItem[];
  related: string[];
  Body: ComponentType;
};

const defs: Answer[] = [
  {
    slug: "can-an-ai-receptionist-transfer-calls-to-a-human",
    question: "Can an AI receptionist transfer calls to a human?",
    shortAnswer:
      "Yes. A good AI receptionist can transfer a live call to a person the moment a caller asks for one or hits a rule you set — like an upset customer, a high-value lead, or a topic it isn't allowed to handle. It can warm-transfer with context or take a message if no one's free.",
    description:
      "Yes — a good AI receptionist transfers live calls to a human on request or by your rules, with context. How call transfer and escalation actually work.",
    keywords: [
      "can an AI receptionist transfer calls to a human",
      "AI receptionist call transfer",
      "AI receptionist escalation",
      "AI receptionist warm transfer",
      "transfer call to human AI receptionist",
    ],
    category: "Call handling",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "matus",
    related: [
      "ai-receptionist-vs-ivr",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
      "use-existing-phone-number-with-ai-receptionist",
    ],
    faqs: [
      {
        q: "How does an AI receptionist decide when to transfer?",
        a: "It follows rules you set: a caller explicitly asking for a person, an emergency or upset caller, a high-value or VIP lead, or any topic you've marked off-limits. When a trigger fires, it stops and routes the call instead of improvising.",
      },
      {
        q: "What is a warm transfer?",
        a: "A warm transfer passes the call to a person along with context — who's calling and why — so the human doesn't make the caller repeat everything. The alternative is a cold transfer, which just forwards the call with no information.",
      },
      {
        q: "What happens if no human is available?",
        a: "A good setup falls back gracefully: it offers to take a detailed message, book a callback at a specific time, or page an on-call person, rather than dumping the caller into voicemail.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            Yes — call transfer is one of the features that separates a real{" "}
            <Internal href="/">AI receptionist</Internal> from a glorified
            voicemail. The AI handles the routine majority of calls, and the
            instant a call needs a person, it hands it off cleanly instead of
            trying to fake its way through. The quality of that handoff is what
            you should test before you trust any vendor.
          </P>

          <H2 id="how-does-an-ai-receptionist-decide-when-to-transfer">
            How does an AI receptionist decide when to transfer?
          </H2>
          <P>
            It follows escalation rules you define up front. Common triggers:
          </P>
          <UL>
            <LI>
              <Strong>The caller asks for a human.</Strong> The simplest and most
              important rule — if someone says &quot;let me talk to a person,&quot;
              it should route immediately, not argue.
            </LI>
            <LI>
              <Strong>An emotional or emergency call.</Strong> An upset customer or
              a genuine emergency wants a person, and the AI should recognize that
              and hand off early.
            </LI>
            <LI>
              <Strong>A high-value or VIP caller.</Strong> A big lead or an
              existing key account can be routed straight to you or a specific
              rep.
            </LI>
            <LI>
              <Strong>An off-limits topic.</Strong> Anything you&apos;ve told it
              not to handle — legal, medical, pricing on a custom job — triggers a
              handoff rather than a guess.
            </LI>
          </UL>

          <H2 id="warm-transfer-vs-cold-transfer">
            Warm transfer vs cold transfer
          </H2>
          <P>
            A <Strong>warm transfer</Strong>{" "}passes the call to a person together
            with context — who&apos;s calling and what they need — so the customer
            doesn&apos;t have to repeat themselves. A cold transfer just forwards
            the call blind. Prefer a service that does warm transfers and texts or
            logs a summary at the same time, so whoever picks up is already up to
            speed.
          </P>

          <H2 id="what-if-no-human-is-available">
            What happens if no one is free?
          </H2>
          <P>
            This is where cheap setups fall down, so be honest about it. A good AI
            receptionist degrades gracefully: it offers to take a detailed
            message, book a specific callback time, or page an on-call person. A
            weak one drops the caller into voicemail — the exact outcome you were
            trying to avoid. Ask any vendor what happens at 2&nbsp;a.m. when no
            human is on the line.
          </P>
          <Callout>
            The honest limit: an AI receptionist can&apos;t <em>be</em> the human
            it transfers to. Its job is to recognize the moment a person is needed
            and make that handoff fast and clean — not to keep a caller who wants a
            human trapped in a loop.
          </Callout>
          <P>
            For how this compares to an old phone tree, see{" "}
            <Internal href="/answers/ai-receptionist-vs-ivr">
              AI receptionist vs IVR
            </Internal>
            , and for the bigger picture, our guide on{" "}
            <Internal href="/blog/can-an-ai-receptionist-replace-a-human-receptionist">
              whether an AI receptionist can replace a human
            </Internal>
            . When you want to hear the handoff yourself, try our{" "}
            <Internal href="/">AI receptionist</Internal> on a live call.
          </P>
        </>
      );
    },
  },

  {
    slug: "use-existing-phone-number-with-ai-receptionist",
    question: "Can I use my existing business phone number with an AI receptionist?",
    shortAnswer:
      "Yes. You keep your existing number and simply forward calls to the AI receptionist — either all calls, or only the ones you'd otherwise miss (after hours, when you're busy, or unanswered after a few rings). You don't have to port your number or print new cards.",
    description:
      "Yes — keep your existing business number and forward calls to an AI receptionist, all of them or just the ones you'd miss. How call forwarding setup works.",
    keywords: [
      "use existing phone number with AI receptionist",
      "AI receptionist with my own number",
      "AI receptionist call forwarding",
      "do I need a new number for an AI receptionist",
      "AI receptionist existing business line",
    ],
    category: "Setup",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "brano",
    related: [
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "can-an-ai-receptionist-book-appointments",
      "ai-receptionist-vs-ivr",
    ],
    faqs: [
      {
        q: "Do I have to port my number to use an AI receptionist?",
        a: "No. The usual setup is call forwarding from your existing number, so you keep your number where it is and just point calls at the AI. Porting is optional and only worth it if you want to drop your old carrier entirely.",
      },
      {
        q: "Can I send only some calls to the AI?",
        a: "Yes. Conditional forwarding lets you send only unanswered, after-hours, or busy-line calls to the AI while you keep answering the rest yourself. It's the safest way to start because those calls were heading to voicemail anyway.",
      },
      {
        q: "How long does setup take?",
        a: "Forwarding is a setting on your phone or carrier account and takes a few minutes. The longer part is configuring how the AI should handle calls, which is typically done the same day.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            Yes, and you don&apos;t have to give up the number your customers
            already know. The standard way to connect an{" "}
            <Internal href="/">AI receptionist</Internal> is{" "}
            <Strong>call forwarding</Strong>: your existing business line stays
            exactly where it is, and you forward calls to the AI. No reprinting
            cards, no telling customers a new number, no porting unless you
            actually want to.
          </P>

          <H2 id="forwarding-vs-porting">Forwarding vs porting your number</H2>
          <P>
            There are two ways to connect a number, and forwarding is almost
            always the right one to start with.
          </P>
          <Table
            caption="Two ways to connect your number"
            head={["Approach", "What it means", "Best for"]}
            rows={[
              [
                "Call forwarding",
                "Keep your number with your current carrier; route calls to the AI",
                "Almost everyone — fast, reversible, no risk to your number",
              ],
              [
                "Porting",
                "Move the number itself to the new provider",
                "Only if you want to drop your old carrier entirely",
              ],
            ]}
          />

          <H2 id="can-i-forward-only-some-calls">
            Can I forward only the calls I&apos;d otherwise miss?
          </H2>
          <P>
            Yes, and this is the smartest way to begin. With{" "}
            <Strong>conditional forwarding</Strong>{" "}you send only the calls that
            were already going to be missed — after hours, on weekends, when
            you&apos;re on another line, or when no one picks up after a few
            rings — to the AI, and keep answering the rest yourself. It&apos;s pure
            upside, because those calls were heading to voicemail anyway, and it
            lets you judge the AI on real calls before handing it more.
          </P>

          <H2 id="how-fast-is-setup">How fast is the setup?</H2>
          <P>
            The forwarding itself is a setting in your phone or carrier account
            and takes a few minutes. The part that takes a little longer is
            telling the AI how your business works — your hours, your services,
            how to handle bookings, and when to{" "}
            <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a human
            </Internal>
            . Most businesses are live the same day.
          </P>
          <Callout>
            One honest caveat: forwarding behaviour depends on your carrier. Most
            support conditional (busy / no-answer / unreachable) forwarding, but a
            few only offer all-or-nothing. Check yours before you assume you can
            split calls.
          </Callout>
          <P>
            Once the number is connected, the next question is usually scheduling —
            see{" "}
            <Internal href="/answers/can-an-ai-receptionist-book-appointments">
              whether an AI receptionist can book appointments into your calendar
            </Internal>
            , or try our <Internal href="/">AI receptionist</Internal> on a live
            call first.
          </P>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-book-appointments",
    question: "Can an AI receptionist book appointments into my calendar?",
    shortAnswer:
      "Yes. A good AI receptionist checks your real availability during the call, offers open slots, books the appointment straight into your calendar, and texts a confirmation — all before the caller hangs up. Confirm it does two-way calendar sync, not just message-taking, before you buy.",
    description:
      "Yes — a good AI receptionist books appointments into your calendar live on the call with two-way sync, not message-taking. What to confirm before you buy.",
    keywords: [
      "can an AI receptionist book appointments",
      "AI receptionist appointment booking",
      "AI receptionist Google Calendar",
      "AI receptionist scheduling",
      "AI receptionist calendar integration",
    ],
    category: "Features",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "matus",
    related: [
      "use-existing-phone-number-with-ai-receptionist",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "what-languages-can-an-ai-receptionist-speak",
    ],
    faqs: [
      {
        q: "Which calendars do AI receptionists work with?",
        a: "The common ones are Google Calendar, Outlook/Microsoft 365, and scheduling tools like Calendly, plus field-service and CRM systems. Many also connect to thousands of apps through Zapier.",
      },
      {
        q: "What's the difference between booking and message-taking?",
        a: "Real booking reads your live availability and writes the appointment into your calendar on the call. Message-taking just records a request you then have to schedule yourself — which is barely better than voicemail.",
      },
      {
        q: "Will it double-book me?",
        a: "Not if it has two-way sync. It reads your real calendar before offering a slot and writes the booking back immediately, so a slot can't be offered twice. Always test this with a live booking before you rely on it.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            Yes — and for most businesses this is the single most valuable thing an{" "}
            <Internal href="/">AI receptionist</Internal> does. A good one checks
            your real availability during the call, offers genuine open slots,
            writes the appointment straight into your calendar, and texts the
            caller a confirmation, all before they hang up. The caller gets booked
            on the first call instead of waiting for someone to ring them back.
          </P>

          <H2 id="real-booking-vs-message-taking">
            Real booking vs message-taking
          </H2>
          <P>
            This is the distinction that decides whether you&apos;ll be happy.{" "}
            <Strong>Real booking</Strong>{" "}reads your live calendar and writes the
            appointment into it on the call. <Strong>Message-taking</Strong>{" "}
            just records &quot;please call them back to schedule&quot; — which creates
            work instead of removing it, and is barely better than voicemail. If a
            vendor says &quot;we&apos;ll pass along the request,&quot; that&apos;s
            not booking.
          </P>

          <H2 id="which-calendars-does-it-work-with">
            Which calendars and tools does it connect to?
          </H2>
          <P>
            The usual suspects are Google Calendar, Outlook and Microsoft&nbsp;365,
            and scheduling tools like Calendly, plus CRMs and field-service
            software. Many services also reach thousands of apps through Zapier.
            The thing to confirm is <Strong>two-way sync</Strong>: it should both
            read your availability and write the booking back, so you can never be
            double-booked.
          </P>

          <H2 id="how-to-test-it-before-you-trust-it">
            How to test it before you trust it
          </H2>
          <P>
            Don&apos;t take the demo&apos;s word for it. Call the AI yourself, book
            a slot, and check three things: the appointment actually appears in
            your calendar, the slot it offered was really free, and you got a
            confirmation. Then try to book a slot you know is taken and confirm it
            refuses. Five minutes of testing tells you more than any feature list.
          </P>
          <Callout>
            Honest limit: an AI receptionist books and reschedules, but it
            won&apos;t untangle a genuinely messy calendar conflict or make a
            judgment call about bumping an important client. Those still want a
            human — which is why clean{" "}
            <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a person
            </Internal>{" "}
            matters.
          </Callout>
          <P>
            For a full buyer&apos;s framework, see{" "}
            <Internal href="/blog/how-to-choose-an-ai-receptionist">
              how to choose an AI receptionist
            </Internal>
            , or hear ours book a slot live on the{" "}
            <Internal href="/">homepage demo</Internal>.
          </P>
        </>
      );
    },
  },

  {
    slug: "ai-receptionist-vs-ivr",
    question: "AI receptionist vs IVR: what's the difference?",
    shortAnswer:
      "An IVR is a menu — \"press 1 for sales\" — that routes callers down fixed paths. An AI receptionist actually talks: it understands what a caller says in plain language, answers questions, books appointments, and transfers when needed. IVR sorts calls; an AI receptionist handles them.",
    description:
      "An IVR is a press-1 menu that routes calls; an AI receptionist understands speech and handles the call — answering, booking, and transferring. The real difference.",
    keywords: [
      "AI receptionist vs IVR",
      "difference between AI receptionist and IVR",
      "AI receptionist vs phone tree",
      "is an AI receptionist better than IVR",
      "AI phone menu vs AI receptionist",
    ],
    category: "Comparison",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "brano",
    related: [
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
      "can-an-ai-receptionist-book-appointments",
    ],
    faqs: [
      {
        q: "Is an AI receptionist just a smarter IVR?",
        a: "No. An IVR routes callers through a fixed menu of keypad or single-word options. An AI receptionist holds an open conversation, understands intent in natural language, and completes tasks like booking — it handles the call rather than just directing it.",
      },
      {
        q: "Why do people dislike IVR menus?",
        a: "Because rigid menus rarely match why someone actually called, force callers to listen to every option, and loop back when no choice fits. The friction is the reason so many callers mash 0 to reach a person.",
      },
      {
        q: "Is an AI receptionist more expensive than an IVR?",
        a: "Not necessarily. Modern AI receptionists start around the price of a basic phone system, and because they finish tasks like booking on the call, they often replace work an IVR would just hand off to staff.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            The short version: an IVR is a <Strong>menu</Strong>, an{" "}
            <Internal href="/">AI receptionist</Internal> is a{" "}
            <Strong>conversation</Strong>. An IVR (&quot;press 1 for sales, press
            2 for support&quot;) routes callers down fixed paths and can&apos;t do
            anything you didn&apos;t pre-build into the tree. An AI receptionist
            understands what a caller says in plain language and actually handles
            the call — answering questions, booking, taking details, and
            transferring when a person is needed.
          </P>

          <H2 id="how-they-differ-in-practice">How they differ in practice</H2>
          <Table
            caption="IVR vs AI receptionist"
            head={["", "IVR (phone tree)", "AI receptionist"]}
            rows={[
              [
                "How it works",
                "Fixed menu of keypad / single-word options",
                "Open conversation in natural language",
              ],
              [
                "What it can do",
                "Route the call to a department or mailbox",
                "Answer, qualify, book, take messages, transfer",
              ],
              [
                "Caller experience",
                "Often frustrating; callers hit 0 to escape",
                "Feels like talking to a helpful person",
              ],
              [
                "Off-script questions",
                "No path = dead end or loop",
                "Understands and responds, or hands off cleanly",
              ],
            ]}
          />

          <H2 id="when-is-an-ivr-still-fine">When is an IVR still fine?</H2>
          <P>
            To be fair to the old technology: if all you need is to point callers
            at the right department in a large org and you have staff to answer
            each one, a simple IVR is cheap and predictable. The problem is that it
            only <em>sorts</em> calls — someone (or something) still has to handle
            them. For a small business that&apos;s losing leads to voicemail, an
            IVR just adds a menu in front of the same missed call.
          </P>

          <H2 id="which-should-you-choose">Which should you choose?</H2>
          <P>
            If your goal is to stop missing calls and to actually complete things
            like bookings without adding staff, an AI receptionist does the job an
            IVR can&apos;t. If you genuinely only need call routing and already
            have people to answer, an IVR is enough. Many businesses end up
            replacing a frustrating phone tree precisely because callers were
            bailing out of it.
          </P>
          <P>
            See how the handoff works in{" "}
            <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              can an AI receptionist transfer calls to a human
            </Internal>
            , or just call our{" "}
            <Internal href="/">AI receptionist</Internal> and compare it to the
            last phone menu you fought with.
          </P>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-handle-multiple-calls-at-once",
    question: "Can an AI receptionist handle multiple calls at once?",
    shortAnswer:
      "Yes. Unlike a human receptionist or a single phone line, an AI receptionist answers many calls simultaneously, so no caller gets a busy signal or a hold queue — even during a sudden spike. This is one of its biggest advantages over both staff and voicemail.",
    description:
      "Yes — an AI receptionist answers many calls at the same time, so no caller hits a busy signal or hold queue, even during a spike. Why concurrency matters.",
    keywords: [
      "can an AI receptionist handle multiple calls at once",
      "AI receptionist concurrent calls",
      "AI receptionist multiple calls",
      "AI receptionist call volume",
      "AI receptionist busy signal",
    ],
    category: "Capabilities",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "matus",
    related: [
      "ai-receptionist-vs-ivr",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "use-existing-phone-number-with-ai-receptionist",
    ],
    faqs: [
      {
        q: "How many calls can an AI receptionist take at the same time?",
        a: "Effectively as many as come in. Because each call runs as its own software session in the cloud, an AI receptionist isn't limited like a single human or one phone line — ten or fifty simultaneous callers all get answered instantly.",
      },
      {
        q: "Does call quality drop when many people call at once?",
        a: "No. Each conversation is handled independently, so the tenth caller gets the same instant, full-attention answer as the first. There's no shared hold queue to back up.",
      },
      {
        q: "Why does handling concurrent calls matter?",
        a: "Because missed calls cluster. Marketing, a busy season, or one viral moment can spike your volume in minutes — exactly when a single line gives a busy signal and you lose the overflow. Concurrency captures all of it.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            Yes, and it&apos;s one of the clearest advantages an{" "}
            <Internal href="/">AI receptionist</Internal> has over both a human
            front desk and a basic phone line. A person can hold one conversation
            at a time; a single line gives the second caller a busy signal. An AI
            receptionist answers <Strong>every call at once</Strong>, so nobody
            waits on hold and nobody gets voicemail during a rush.
          </P>

          <H2 id="how-concurrency-works">How does it answer so many at once?</H2>
          <P>
            Each call runs as its own independent session in the cloud, so there
            isn&apos;t a single &quot;line&quot; to tie up. Whether one person
            calls or fifty do in the same minute, each gets answered instantly and
            gets the AI&apos;s full attention — there&apos;s no shared queue
            backing up behind a busy agent.
          </P>

          <H2 id="why-it-matters">Why does this matter for your business?</H2>
          <P>
            Because missed calls don&apos;t arrive evenly — they cluster.
          </P>
          <UL>
            <LI>
              <Strong>Marketing spikes:</Strong> an ad, a post, or a promotion can
              triple your call volume in an afternoon.
            </LI>
            <LI>
              <Strong>Seasonal rushes:</Strong> the first heat wave or holiday week
              buries a small office in minutes.
            </LI>
            <LI>
              <Strong>Overflow:</Strong> the calls that arrive while you&apos;re
              already on the phone are the ones you lose today.
            </LI>
          </UL>
          <P>
            In every one of those cases, the eleventh caller is just as valuable as
            the first — and concurrency is what stops you from losing them to a
            busy signal.
          </P>
          <Callout>
            Worth being clear: handling many calls at once is a capacity win, not a
            magic one. Each of those calls still needs to be handled <em>well</em>,
            and the hard ones should still{" "}
            <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a human
            </Internal>
            . Concurrency means none of them go unanswered while that happens.
          </Callout>
          <P>
            This is also a big reason an AI beats an old phone menu — see{" "}
            <Internal href="/answers/ai-receptionist-vs-ivr">
              AI receptionist vs IVR
            </Internal>
            , or test ours by calling the{" "}
            <Internal href="/">live demo</Internal>.
          </P>
        </>
      );
    },
  },

  {
    slug: "what-languages-can-an-ai-receptionist-speak",
    question: "What languages can an AI receptionist speak?",
    shortAnswer:
      "Modern AI receptionists handle dozens of languages — typically 25+, including English, Spanish, French, German, and more — and can detect or switch language on the call. That lets one setup answer a multilingual customer base without hiring separate staff for each language.",
    description:
      "Modern AI receptionists speak 25+ languages — English, Spanish, French, German and more — and can switch mid-call, so one setup serves a multilingual customer base.",
    keywords: [
      "what languages can an AI receptionist speak",
      "multilingual AI receptionist",
      "AI receptionist Spanish",
      "AI receptionist languages",
      "bilingual AI receptionist",
    ],
    category: "Features",
    date: "2026-06-29",
    updated: "2026-06-29",
    author: "brano",
    related: [
      "can-an-ai-receptionist-book-appointments",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
      "ai-receptionist-vs-ivr",
    ],
    faqs: [
      {
        q: "Can an AI receptionist switch languages during a call?",
        a: "Yes. A good one can detect the language a caller is speaking and respond in it, or switch on request — so a Spanish-speaking caller and an English-speaking caller both get served by the same setup.",
      },
      {
        q: "Does it sound natural in other languages?",
        a: "Largely, yes, for major languages, because the underlying voices are trained on each language rather than translated word-for-word. Quality is strongest in widely spoken languages and can be more uneven in rarer ones or strong regional dialects.",
      },
      {
        q: "Is a multilingual AI receptionist cheaper than bilingual staff?",
        a: "Almost always. One AI setup covers many languages around the clock for a flat fee, versus hiring and scheduling separate bilingual staff for each language and shift.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <P>
            Modern AI receptionists are multilingual out of the box — typically{" "}
            <Strong>25 or more languages</Strong>, including English, Spanish,
            French, German, Italian, Portuguese, and many others. A good{" "}
            <Internal href="/">AI receptionist</Internal> can detect the language a
            caller is using and respond in it, so a single setup serves a
            multilingual customer base without you hiring separate staff for each
            language or shift.
          </P>

          <H2 id="can-it-switch-language-mid-call">
            Can it switch language during the call?
          </H2>
          <P>
            Yes. The better systems detect the caller&apos;s language from the
            first few words and answer in it, or switch when a caller asks. That
            means the Spanish-speaking customer and the English-speaking customer
            both get a natural conversation from the same phone number — no
            &quot;press 2 for Spanish&quot; menu, no separate line.
          </P>

          <H2 id="does-it-sound-natural">
            Does it actually sound natural in other languages?
          </H2>
          <P>
            For widely spoken languages, yes — the voices are trained per language
            rather than translated word-for-word, so prosody and phrasing hold up.
            Being honest about the limits: quality is strongest in major languages
            and can be more uneven in rarer ones, in strong regional dialects, or
            with heavy slang. If a specific language is critical to your business,
            test it on a real call first. We dig into voice quality in{" "}
            <Internal href="/blog/do-ai-voices-sound-human-on-the-phone">
              do AI voices sound human on the phone
            </Internal>
            .
          </P>

          <H2 id="why-multilingual-matters">
            Why multilingual answering matters
          </H2>
          <P>
            A caller who reaches someone who speaks their language is far more
            likely to stay on the line, trust the business, and book. For a small
            company, covering even two or three languages used to mean expensive
            bilingual hires across every shift. One AI setup does it 24/7 for a
            flat fee — and still{" "}
            <Internal href="/answers/can-an-ai-receptionist-book-appointments">
              books appointments
            </Internal>{" "}
            in each of them.
          </P>
          <P>
            Hear it for yourself on our{" "}
            <Internal href="/">AI receptionist</Internal> demo, or see the full
            picture in{" "}
            <Internal href="/blog/how-to-choose-an-ai-receptionist">
              how to choose an AI receptionist
            </Internal>
            .
          </P>
        </>
      );
    },
  },
];

export const answers: Answer[] = [...defs].sort((a, b) =>
  a.date < b.date ? 1 : -1,
);

export function getAnswer(slug: string): Answer | undefined {
  return answers.find((a) => a.slug === slug);
}

export function answerCategories(): string[] {
  return [...new Set(answers.map((a) => a.category))];
}
