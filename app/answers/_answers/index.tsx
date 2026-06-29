import type { ComponentType } from "react";
import Link from "next/link";
import { type AuthorKey } from "@/lib/site";

export type FaqItem = { q: string; a: string };

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
      "Yes. A good AI receptionist can transfer a live call to a person the moment a caller asks for one or hits a rule you set, such as an upset customer, a high-value lead, or a topic it isn't allowed to handle. It can warm-transfer with context, or take a message if no one is free.",
    description:
      "Yes, a good AI receptionist transfers live calls to a human on request or by your rules, with context. How call transfer and escalation actually work.",
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
        a: "It follows rules you set: a caller explicitly asking for a person, an emergency or upset caller, a high-value or VIP lead, or any topic you've marked off-limits. When a trigger fires, it routes the call instead of improvising.",
      },
      {
        q: "What is a warm transfer?",
        a: "A warm transfer passes the call to a person along with context, who is calling and why, so the human doesn't make the caller repeat everything. A cold transfer just forwards the call with no information.",
      },
      {
        q: "What happens if no human is available?",
        a: "A good setup falls back gracefully: it offers to take a detailed message, book a callback at a specific time, or page an on-call person, rather than dropping the caller into voicemail.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes. Call transfer is one of the features that separates a real{" "}
            <Link href="/">AI receptionist</Link> from a glorified voicemail. The
            AI handles the routine majority of calls, and the instant a call needs
            a person, it hands it off cleanly instead of trying to fake its way
            through. The quality of that handoff is what you should test before
            you trust any vendor.
          </p>

          <blockquote>
            <p>
              &ldquo;The single most important rule we set up is the simplest one:
              if a caller asks for a human, route them to a human. An assistant
              that argues with that request is worse than no assistant at
              all.&rdquo;
            </p>
            <cite>Matúš Koleják, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="how-does-an-ai-receptionist-decide-when-to-transfer">
            How does an AI receptionist decide when to transfer?
          </h2>
          <p>It follows escalation rules you define up front. Common triggers:</p>
          <ul>
            <li>
              <strong>The caller asks for a human.</strong> The simplest and most
              important rule. If someone says &ldquo;let me talk to a
              person,&rdquo; it should route immediately.
            </li>
            <li>
              <strong>An emotional or emergency call.</strong> An upset customer
              or a genuine emergency wants a person, and the AI should recognize
              that and hand off early.
            </li>
            <li>
              <strong>A high-value or VIP caller.</strong> A big lead or a key
              account can be routed straight to you or a specific rep.
            </li>
            <li>
              <strong>An off-limits topic.</strong> Anything you have told it not
              to handle, like legal, medical, or pricing on a custom job, triggers
              a handoff rather than a guess.
            </li>
          </ul>

          <h2 id="warm-transfer-vs-cold-transfer">
            Warm transfer vs cold transfer
          </h2>
          <p>
            A <strong>warm transfer</strong>{" "}passes the call to a person
            together with context, who is calling and what they need, so the
            customer does not have to repeat themselves. A cold transfer just
            forwards the call blind. Prefer a service that does warm transfers and
            logs a summary at the same time, so whoever picks up is already up to
            speed.
          </p>

          <h2 id="what-if-no-human-is-available">
            What happens if no one is free?
          </h2>
          <p>
            This is where cheap setups fall down, so be honest about it. A good AI
            receptionist degrades gracefully: it offers to take a detailed
            message, book a specific callback time, or page an on-call person. A
            weak one drops the caller into voicemail, the exact outcome you were
            trying to avoid. Ask any vendor what happens at 2&nbsp;a.m. when no
            human is on the line.
          </p>
          <p>
            For how this compares to an old phone tree, see{" "}
            <Link href="/answers/ai-receptionist-vs-ivr">
              AI receptionist vs IVR
            </Link>
            , and for the bigger picture, our guide on{" "}
            <Link href="/blog/can-an-ai-receptionist-replace-a-human-receptionist">
              whether an AI receptionist can replace a human
            </Link>
            . When you want to hear the handoff yourself, try our{" "}
            <Link href="/">AI receptionist</Link> on a live call.
          </p>
        </>
      );
    },
  },

  {
    slug: "use-existing-phone-number-with-ai-receptionist",
    question: "Can I use my existing business phone number with an AI receptionist?",
    shortAnswer:
      "Yes. You keep your existing number and forward calls to the AI receptionist: either all calls, or only the ones you would otherwise miss (after hours, when you are busy, or unanswered after a few rings). You do not have to port your number or print new cards.",
    description:
      "Yes, keep your existing business number and forward calls to an AI receptionist, all of them or just the ones you'd miss. How call forwarding setup works.",
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
        a: "Yes. Conditional forwarding lets you send only unanswered, after-hours, or busy-line calls to the AI while you keep answering the rest yourself. It is the safest way to start because those calls were heading to voicemail anyway.",
      },
      {
        q: "How long does setup take?",
        a: "Forwarding is a setting on your phone or carrier account and takes a few minutes. The longer part is configuring how the AI should handle calls, which is typically done the same day.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, and you do not have to give up the number your customers already
            know. The standard way to connect an{" "}
            <Link href="/">AI receptionist</Link> is{" "}
            <strong>call forwarding</strong>: your existing business line stays
            exactly where it is, and you forward calls to the AI. No reprinting
            cards, no telling customers a new number, no porting unless you
            actually want to.
          </p>

          <blockquote>
            <p>
              &ldquo;Most owners assume switching means a new number and a week of
              disruption. It is the opposite. You turn on forwarding in a few
              minutes and your number, your listings, your business cards all keep
              working.&rdquo;
            </p>
            <cite>Branislav Hrivnák, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="forwarding-vs-porting">Forwarding vs porting your number</h2>
          <p>
            There are two ways to connect a number, and forwarding is almost
            always the right one to start with.
          </p>
          <table>
            <thead>
              <tr>
                <th>Approach</th>
                <th>What it means</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Call forwarding</td>
                <td>Keep your number with your current carrier; route calls to the AI</td>
                <td>Almost everyone: fast, reversible, no risk to your number</td>
              </tr>
              <tr>
                <td>Porting</td>
                <td>Move the number itself to the new provider</td>
                <td>Only if you want to drop your old carrier entirely</td>
              </tr>
            </tbody>
          </table>

          <h2 id="can-i-forward-only-some-calls">
            Can I forward only the calls I would otherwise miss?
          </h2>
          <p>
            Yes, and this is the smartest way to begin. With{" "}
            <strong>conditional forwarding</strong>{" "}you send only the calls
            that were already going to be missed (after hours, on weekends, when
            you are on another line, or when no one picks up after a few rings) to
            the AI, and keep answering the rest yourself. It is pure upside,
            because those calls were heading to voicemail anyway, and it lets you
            judge the AI on real calls before handing it more.
          </p>

          <h2 id="how-fast-is-setup">How fast is the setup?</h2>
          <p>
            The forwarding itself is a setting in your phone or carrier account
            and takes a few minutes. The part that takes a little longer is
            telling the AI how your business works: your hours, your services, how
            to handle bookings, and when to{" "}
            <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a human
            </Link>
            . Most businesses are live the same day.
          </p>
          <p>
            One honest caveat: forwarding behaviour depends on your carrier. Most
            support conditional (busy, no-answer, unreachable) forwarding, but a
            few only offer all-or-nothing, so check yours before you assume you
            can split calls. Once the number is connected, the next question is
            usually scheduling, see{" "}
            <Link href="/answers/can-an-ai-receptionist-book-appointments">
              whether an AI receptionist can book appointments into your calendar
            </Link>
            , or try our <Link href="/">AI receptionist</Link> on a live call
            first.
          </p>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-book-appointments",
    question: "Can an AI receptionist book appointments into my calendar?",
    shortAnswer:
      "Yes. A good AI receptionist checks your real availability during the call, offers open slots, books the appointment straight into your calendar, and texts a confirmation, all before the caller hangs up. Confirm it does two-way calendar sync, not just message-taking, before you buy.",
    description:
      "Yes, a good AI receptionist books appointments into your calendar live on the call with two-way sync, not message-taking. What to confirm before you buy.",
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
        a: "The common ones are Google Calendar, Outlook and Microsoft 365, and scheduling tools like Calendly, plus field-service and CRM systems. Many also connect to thousands of apps through Zapier.",
      },
      {
        q: "What's the difference between booking and message-taking?",
        a: "Real booking reads your live availability and writes the appointment into your calendar on the call. Message-taking just records a request you then have to schedule yourself, which is barely better than voicemail.",
      },
      {
        q: "Will it double-book me?",
        a: "Not if it has two-way sync. It reads your real calendar before offering a slot and writes the booking back immediately, so a slot can't be offered twice. Always test this with a live booking before you rely on it.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, and for most businesses this is the single most valuable thing an{" "}
            <Link href="/">AI receptionist</Link> does. A good one checks your real
            availability during the call, offers genuine open slots, writes the
            appointment straight into your calendar, and texts the caller a
            confirmation, all before they hang up. The caller gets booked on the
            first call instead of waiting for someone to ring them back.
          </p>

          <blockquote>
            <p>
              &ldquo;A booked appointment on the call is the whole point. The
              moment a service only takes a message and asks you to schedule it
              later, you have rebuilt voicemail with extra steps.&rdquo;
            </p>
            <cite>Matúš Koleják, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="real-booking-vs-message-taking">
            Real booking vs message-taking
          </h2>
          <p>
            This is the distinction that decides whether you will be happy.{" "}
            <strong>Real booking</strong>{" "}reads your live calendar and writes
            the appointment into it on the call.{" "}
            <strong>Message-taking</strong>{" "}just records &ldquo;please call them
            back to schedule,&rdquo; which creates work instead of removing it. If
            a vendor says &ldquo;we will pass along the request,&rdquo; that is not
            booking.
          </p>

          <h2 id="which-calendars-does-it-work-with">
            Which calendars and tools does it connect to?
          </h2>
          <p>
            The usual ones are Google Calendar, Outlook and Microsoft&nbsp;365,
            and scheduling tools like Calendly, plus CRMs and field-service
            software. Many services also reach thousands of apps through Zapier.
            The thing to confirm is <strong>two-way sync</strong>: it should both
            read your availability and write the booking back, so you can never be
            double-booked.
          </p>

          <h2 id="how-to-test-it-before-you-trust-it">
            How to test it before you trust it
          </h2>
          <p>
            Do not take the demo&apos;s word for it. Call the AI yourself, book a
            slot, and check three things: the appointment actually appears in your
            calendar, the slot it offered was really free, and you got a
            confirmation. Then try to book a slot you know is taken and confirm it
            refuses. Five minutes of testing tells you more than any feature list.
          </p>
          <p>
            One honest limit: an AI receptionist books and reschedules, but it
            will not untangle a genuinely messy calendar conflict or make a
            judgment call about bumping an important client. Those still want a
            human, which is why clean{" "}
            <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a person
            </Link>{" "}
            matters. For a full buyer&apos;s framework, see{" "}
            <Link href="/blog/how-to-choose-an-ai-receptionist">
              how to choose an AI receptionist
            </Link>
            , or hear ours book a slot live on the{" "}
            <Link href="/">homepage demo</Link>.
          </p>
        </>
      );
    },
  },

  {
    slug: "ai-receptionist-vs-ivr",
    question: "AI receptionist vs IVR: what's the difference?",
    shortAnswer:
      "An IVR is a menu (\"press 1 for sales\") that routes callers down fixed paths. An AI receptionist actually talks: it understands what a caller says in plain language, answers questions, books appointments, and transfers when needed. An IVR sorts calls; an AI receptionist handles them.",
    description:
      "An IVR is a press-1 menu that routes calls; an AI receptionist understands speech and handles the call: answering, booking, and transferring. The real difference.",
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
        a: "No. An IVR routes callers through a fixed menu of keypad or single-word options. An AI receptionist holds an open conversation, understands intent in natural language, and completes tasks like booking. It handles the call rather than just directing it.",
      },
      {
        q: "Why do people dislike IVR menus?",
        a: "Because rigid menus rarely match why someone actually called, force callers to listen to every option, and loop back when no choice fits. That friction is why so many callers press 0 to reach a person.",
      },
      {
        q: "Is an AI receptionist more expensive than an IVR?",
        a: "Not necessarily. Modern AI receptionists start around the price of a basic phone system, and because they finish tasks like booking on the call, they often replace work an IVR would just hand off to staff.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            The short version: an IVR is a <strong>menu</strong>, an{" "}
            <Link href="/">AI receptionist</Link> is a{" "}
            <strong>conversation</strong>. An IVR (&ldquo;press 1 for sales, press
            2 for support&rdquo;) routes callers down fixed paths and cannot do
            anything you did not pre-build into the tree. An AI receptionist
            understands what a caller says in plain language and actually handles
            the call: answering questions, booking, taking details, and
            transferring when a person is needed.
          </p>

          <blockquote>
            <p>
              &ldquo;The tell is what happens when a caller goes off-script. An
              IVR hits a dead end or loops. A real assistant just understands the
              sentence and keeps going, the way a person would.&rdquo;
            </p>
            <cite>Branislav Hrivnák, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="how-they-differ-in-practice">How they differ in practice</h2>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>IVR (phone tree)</th>
                <th>AI receptionist</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>How it works</td>
                <td>Fixed menu of keypad or single-word options</td>
                <td>Open conversation in natural language</td>
              </tr>
              <tr>
                <td>What it can do</td>
                <td>Route the call to a department or mailbox</td>
                <td>Answer, qualify, book, take messages, transfer</td>
              </tr>
              <tr>
                <td>Caller experience</td>
                <td>Often frustrating; callers press 0 to escape</td>
                <td>Feels like talking to a helpful person</td>
              </tr>
              <tr>
                <td>Off-script questions</td>
                <td>No path means a dead end or a loop</td>
                <td>Understands and responds, or hands off cleanly</td>
              </tr>
            </tbody>
          </table>

          <h2 id="when-is-an-ivr-still-fine">When is an IVR still fine?</h2>
          <p>
            To be fair to the older technology: if all you need is to point
            callers at the right department in a large organisation and you have
            staff to answer each one, a simple IVR is cheap and predictable. The
            problem is that it only sorts calls. Someone, or something, still has
            to handle them. For a small business that is losing leads to
            voicemail, an IVR just adds a menu in front of the same missed call.
          </p>

          <h2 id="which-should-you-choose">Which should you choose?</h2>
          <p>
            If your goal is to stop missing calls and to actually complete things
            like bookings without adding staff, an AI receptionist does the job an
            IVR cannot. If you genuinely only need call routing and already have
            people to answer, an IVR is enough. See how the handoff works in{" "}
            <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              can an AI receptionist transfer calls to a human
            </Link>
            , or just call our <Link href="/">AI receptionist</Link> and compare
            it to the last phone menu you fought with.
          </p>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-handle-multiple-calls-at-once",
    question: "Can an AI receptionist handle multiple calls at once?",
    shortAnswer:
      "Yes. Unlike a human receptionist or a single phone line, an AI receptionist answers many calls simultaneously, so no caller gets a busy signal or a hold queue, even during a sudden spike. This is one of its biggest advantages over both staff and voicemail.",
    description:
      "Yes, an AI receptionist answers many calls at the same time, so no caller hits a busy signal or hold queue, even during a spike. Why concurrency matters.",
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
        a: "Effectively as many as come in. Because each call runs as its own software session in the cloud, an AI receptionist is not limited like a single human or one phone line; ten or fifty simultaneous callers all get answered instantly.",
      },
      {
        q: "Does call quality drop when many people call at once?",
        a: "No. Each conversation is handled independently, so the tenth caller gets the same instant, full-attention answer as the first. There is no shared hold queue to back up.",
      },
      {
        q: "Why does handling concurrent calls matter?",
        a: "Because missed calls cluster. Marketing, a busy season, or one viral moment can spike your volume in minutes, exactly when a single line gives a busy signal and you lose the overflow. Concurrency captures all of it.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, and it is one of the clearest advantages an{" "}
            <Link href="/">AI receptionist</Link> has over both a human front desk
            and a basic phone line. A person can hold one conversation at a time; a
            single line gives the second caller a busy signal. An AI receptionist
            answers <strong>every call at once</strong>, so nobody waits on hold
            and nobody gets voicemail during a rush.
          </p>

          <blockquote>
            <p>
              &ldquo;The eleventh caller in a spike is worth exactly as much as the
              first. A human front desk loses that caller; software does not even
              notice the load.&rdquo;
            </p>
            <cite>Matúš Koleják, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="how-concurrency-works">How does it answer so many at once?</h2>
          <p>
            Each call runs as its own independent session in the cloud, so there
            is not a single &ldquo;line&rdquo; to tie up. Whether one person calls
            or fifty do in the same minute, each gets answered instantly and gets
            the AI&apos;s full attention. There is no shared queue backing up
            behind a busy agent.
          </p>

          <h2 id="why-it-matters">Why does this matter for your business?</h2>
          <p>Because missed calls do not arrive evenly. They cluster.</p>
          <ul>
            <li>
              <strong>Marketing spikes:</strong> an ad, a post, or a promotion can
              triple your call volume in an afternoon.
            </li>
            <li>
              <strong>Seasonal rushes:</strong> the first heat wave or holiday
              week buries a small office in minutes.
            </li>
            <li>
              <strong>Overflow:</strong> the calls that arrive while you are
              already on the phone are the ones you lose today.
            </li>
          </ul>
          <p>
            In every one of those cases, the eleventh caller is just as valuable as
            the first, and concurrency is what stops you from losing them to a busy
            signal.
          </p>

          <h2 id="is-it-magic">Is concurrency the whole story?</h2>
          <p>
            No, and it is worth being clear. Handling many calls at once is a
            capacity win, not a magic one. Each of those calls still needs to be
            handled well, and the hard ones should still{" "}
            <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              transfer to a human
            </Link>
            . Concurrency just means none of them go unanswered while that
            happens. This is also a big reason an AI beats an old phone menu, see{" "}
            <Link href="/answers/ai-receptionist-vs-ivr">
              AI receptionist vs IVR
            </Link>
            , or test ours by calling the <Link href="/">live demo</Link>.
          </p>
        </>
      );
    },
  },

  {
    slug: "what-languages-can-an-ai-receptionist-speak",
    question: "What languages can an AI receptionist speak?",
    shortAnswer:
      "Modern AI receptionists handle dozens of languages, typically 25 or more, including English, Spanish, French, and German, and can detect or switch language on the call. That lets one setup serve a multilingual customer base without hiring separate staff for each language.",
    description:
      "Modern AI receptionists speak 25+ languages including English, Spanish, French and German, and can switch mid-call, so one setup serves a multilingual base.",
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
        a: "Yes. A good one can detect the language a caller is speaking and respond in it, or switch on request, so a Spanish-speaking caller and an English-speaking caller both get served by the same setup.",
      },
      {
        q: "Does it sound natural in other languages?",
        a: "Largely yes for major languages, because the underlying voices are trained on each language rather than translated word for word. Quality is strongest in widely spoken languages and can be more uneven in rarer ones or strong regional dialects.",
      },
      {
        q: "Is a multilingual AI receptionist cheaper than bilingual staff?",
        a: "Almost always. One AI setup covers many languages around the clock for a flat fee, versus hiring and scheduling separate bilingual staff for each language and shift.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Modern AI receptionists are multilingual out of the box, typically{" "}
            <strong>25 or more languages</strong>, including English, Spanish,
            French, German, Italian, and Portuguese among others. A good{" "}
            <Link href="/">AI receptionist</Link> can detect the language a caller
            is using and respond in it, so a single setup serves a multilingual
            customer base without you hiring separate staff for each language or
            shift.
          </p>

          <blockquote>
            <p>
              &ldquo;One number that answers a caller in their own language, day or
              night, used to mean a payroll problem. Now it is a setting. That is a
              genuine shift for small businesses serving mixed communities.&rdquo;
            </p>
            <cite>Branislav Hrivnák, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="can-it-switch-language-mid-call">
            Can it switch language during the call?
          </h2>
          <p>
            Yes. The better systems detect the caller&apos;s language from the
            first few words and answer in it, or switch when a caller asks. That
            means the Spanish-speaking customer and the English-speaking customer
            both get a natural conversation from the same phone number, with no
            &ldquo;press 2 for Spanish&rdquo; menu and no separate line.
          </p>

          <h2 id="does-it-sound-natural">
            Does it actually sound natural in other languages?
          </h2>
          <p>
            For widely spoken languages, yes. The voices are trained per language
            rather than translated word for word, so phrasing and intonation hold
            up. Being honest about the limits: quality is strongest in major
            languages and can be more uneven in rarer ones, in strong regional
            dialects, or with heavy slang. If a specific language is critical to
            your business, test it on a real call first. We dig into voice quality
            in{" "}
            <Link href="/blog/do-ai-voices-sound-human-on-the-phone">
              do AI voices sound human on the phone
            </Link>
            .
          </p>

          <h2 id="why-multilingual-matters">Why multilingual answering matters</h2>
          <p>
            A caller who reaches someone who speaks their language is far more
            likely to stay on the line, trust the business, and book. For a small
            company, covering even two or three languages used to mean expensive
            bilingual hires across every shift. One AI setup does it around the
            clock for a flat fee, and still{" "}
            <Link href="/answers/can-an-ai-receptionist-book-appointments">
              books appointments
            </Link>{" "}
            in each of them. Hear it for yourself on our{" "}
            <Link href="/">AI receptionist</Link> demo, or see the full picture in{" "}
            <Link href="/blog/how-to-choose-an-ai-receptionist">
              how to choose an AI receptionist
            </Link>
            .
          </p>
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
