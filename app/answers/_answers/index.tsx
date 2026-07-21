import type { ComponentType } from "react";
import Link from "next/link";
import { type AuthorKey } from "@/lib/site";

export type FaqItem = { q: string; a: string };

export type Answer = {
  slug: string;
  question: string;
  shortAnswer: string;
  description: string;
  keywords: string[];
  category: string;
  date: string;
  updated: string;
  author: AuthorKey;
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
      "what-happens-if-an-ai-receptionist-cant-answer",
      "can-an-ai-receptionist-handle-emergency-calls",
      "ai-receptionist-vs-ivr",
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
      "train-ai-receptionist-on-my-business",
      "use-existing-phone-number-with-ai-receptionist",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
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
    updated: "2026-07-04",
    author: "brano",
    related: [
      "virtual-receptionist-vs-answering-service",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
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
      "can-an-ai-receptionist-handle-multiple-locations",
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
      "Modern AI receptionists handle multiple languages and dialects - typically 25 or more languages, including English, Spanish, French, and German - and can detect or switch language mid-call. Regional accents and dialects are handled well in major languages, so one setup serves a multilingual customer base without hiring separate staff for each language.",
    description:
      "AI receptionists handle multiple languages and dialects - 25+ languages including English, Spanish, French and German - and switch mid-call, so one setup serves everyone.",
    keywords: [
      "what languages can an AI receptionist speak",
      "can AI receptionists handle multiple languages and dialects",
      "multilingual AI receptionist",
      "AI receptionist Spanish",
      "AI receptionist languages",
      "AI receptionist dialects",
      "bilingual AI receptionist",
    ],
    category: "Features",
    date: "2026-06-29",
    updated: "2026-07-21",
    author: "brano",
    related: [
      "do-callers-know-its-an-ai-receptionist",
      "can-an-ai-receptionist-book-appointments",
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

  {
    slug: "what-happens-if-an-ai-receptionist-cant-answer",
    question: "What happens when an AI receptionist can't answer a question?",
    shortAnswer:
      "When an AI receptionist hits a question it cannot answer, a good one does not bluff. It says so plainly, then captures the caller's details, books a callback, or transfers to a person, depending on the rules you set. The worst thing it can do is invent an answer, so test that it does not.",
    description:
      "When an AI receptionist can't answer, a good one admits it and captures details, books a callback, or transfers, instead of bluffing. How fallback really works.",
    keywords: [
      "what happens when an AI receptionist can't answer a question",
      "AI receptionist fallback",
      "does an AI receptionist make things up",
      "AI receptionist hallucination phone",
      "AI receptionist unknown question",
    ],
    category: "Reliability",
    date: "2026-06-30",
    updated: "2026-06-30",
    author: "matus",
    related: [
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "train-ai-receptionist-on-my-business",
      "do-callers-know-its-an-ai-receptionist",
    ],
    faqs: [
      {
        q: "Does an AI receptionist make up answers?",
        a: "A well-built one should not. It is configured to stay inside what you have told it and to admit when it does not know, then capture the request or hand off. Bluffing, or hallucinating, is a red flag you should test for before you buy.",
      },
      {
        q: "What does it do when it can't help?",
        a: "It follows your fallback rules: take a detailed message, book a callback at a specific time, or transfer to a person. The goal is that the caller still leaves with a clear next step, not a dead end.",
      },
      {
        q: "How do I stop it from giving wrong information?",
        a: "Give it accurate, specific instructions, mark off-limits topics, and test edge cases on real calls. The more clearly you define what it knows and what to escalate, the less room there is for a wrong answer.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            The honest answer is that a good{" "}
            <Link href="/">AI receptionist</Link> handles the vast majority of
            calls, but not every one, and what it does on the calls it{" "}
            <em>cannot</em> finish is the real test. A well-built assistant does
            not bluff. It admits it does not know, then captures the caller and
            hands the request to you cleanly. A cheap one guesses, and a wrong
            answer on the phone can cost you the customer.
          </p>

          <blockquote>
            <p>
              &ldquo;The question to ask any vendor is not &lsquo;can it answer
              everything?&rsquo; Nothing can. Ask &lsquo;what does it do when it
              does not know?&rsquo; That single behaviour separates a trustworthy
              assistant from a liability.&rdquo;
            </p>
            <cite>Matúš Koleják, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="does-it-bluff-or-admit-it-doesnt-know">
            Does it bluff, or admit it doesn&apos;t know?
          </h2>
          <p>
            This is the line that matters. A good AI receptionist is configured
            to stay inside what you have actually told it and to say so when a
            question falls outside that, rather than inventing a plausible
            sounding answer. An assistant that confidently makes things up, what
            people call &ldquo;hallucinating,&rdquo; is worse than one that
            simply takes a message, because the caller leaves believing something
            untrue.
          </p>

          <h2 id="what-a-good-fallback-looks-like">
            What a good fallback looks like
          </h2>
          <p>
            When it reaches the edge of what it knows, it should still leave the
            caller with a next step. The usual options, in order of preference:
          </p>
          <ul>
            <li>
              <strong>Transfer to a person</strong> if someone is available and
              the question warrants it.
            </li>
            <li>
              <strong>Book a callback</strong> at a specific time so the caller
              is not left chasing you.
            </li>
            <li>
              <strong>Take a detailed message</strong> with the context you need
              to follow up, not just a name and number.
            </li>
          </ul>
          <p>
            The difference between this and old voicemail is that the caller is
            heard, captured, and given a commitment, instead of dropped into a
            mailbox. For how the handoff itself works, see{" "}
            <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
              can an AI receptionist transfer calls to a human
            </Link>
            .
          </p>

          <h2 id="how-to-test-for-hallucination-before-you-buy">
            How to test for hallucination before you buy
          </h2>
          <p>
            Do not take a polished demo on faith. On a live call, ask it
            something you deliberately never told it, an obscure policy, a price
            on a service you do not offer, a detail it cannot know. A trustworthy
            assistant will admit it does not have that information and offer to
            get you an answer. If it confidently invents one, walk away. Five
            minutes of trying to trip it up tells you more than any feature list.
          </p>
          <p>
            Most of these gaps are avoidable in the first place: the more
            accurately you{" "}
            <Link href="/answers/train-ai-receptionist-on-my-business">
              set up what the AI knows about your business
            </Link>
            , the less often it reaches an answer it does not have. For the full
            buyer&apos;s framework, see{" "}
            <Link href="/blog/how-to-choose-an-ai-receptionist">
              how to choose an AI receptionist
            </Link>
            , or hear ours handle an edge case on the{" "}
            <Link href="/">homepage demo</Link>.
          </p>
        </>
      );
    },
  },

  {
    slug: "train-ai-receptionist-on-my-business",
    question: "Can I train an AI receptionist on my own business information?",
    shortAnswer:
      "Yes. You give it your business details, hours, services, prices, policies, and the questions customers ask most, and it answers callers from that, in your own words. You do not write code or train a model; you fill in instructions and a knowledge base, then refine them as you listen to real calls.",
    description:
      "Yes, you give an AI receptionist your hours, services, prices and FAQs and it answers from that, no coding or model training. How to set up its knowledge.",
    keywords: [
      "can I train an AI receptionist on my business",
      "AI receptionist knowledge base",
      "how does an AI receptionist know my business",
      "customize AI receptionist answers",
      "AI receptionist FAQ answers",
    ],
    category: "Setup",
    date: "2026-06-30",
    updated: "2026-07-04",
    author: "brano",
    related: [
      "can-an-ai-receptionist-book-appointments",
      "use-existing-phone-number-with-ai-receptionist",
      "what-happens-if-an-ai-receptionist-cant-answer",
    ],
    faqs: [
      {
        q: "How does an AI receptionist know about my business?",
        a: "You give it the facts: your hours, locations, services, prices, policies, and the questions customers ask most. It answers callers from that, so the more complete and accurate your information, the better it performs.",
      },
      {
        q: "Do I need technical skills to set it up?",
        a: "No. You are not training a model or writing code. You fill in plain-language instructions and a knowledge base, the same way you would brief a new front-desk hire, and you can update it any time.",
      },
      {
        q: "Can I update what it knows later?",
        a: "Yes, and you should. Change a price, add a service, or close for a holiday, and you update the instructions in minutes. Listening to real call transcripts is the fastest way to spot gaps to fill.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, and this is what turns a generic voice into{" "}
            <em>your</em> receptionist. You give an{" "}
            <Link href="/">AI receptionist</Link> the facts about your business,
            your hours, services, prices, policies, and the questions customers
            ask all day, and it answers callers from that, in your own words. The
            important part to understand up front: you are not training a model
            or writing code. You are briefing an assistant.
          </p>

          <blockquote>
            <p>
              &ldquo;Think of it exactly like onboarding a new front-desk hire.
              You would not hand them the phone with no information. You tell them
              how the business works, and a good setup lets you do that in plain
              language, in an afternoon.&rdquo;
            </p>
            <cite>Branislav Hrivnák, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="what-you-teach-it">What you teach it</h2>
          <p>
            The more specific you are, the better it sounds and the fewer
            questions it has to dodge. The essentials:
          </p>
          <ul>
            <li>
              <strong>The basics:</strong> your hours, locations, and how you
              want callers greeted.
            </li>
            <li>
              <strong>Services and prices:</strong> what you offer, what it
              costs, and what is out of scope.
            </li>
            <li>
              <strong>Policies:</strong> cancellations, deposits, service areas,
              anything a caller commonly asks about.
            </li>
            <li>
              <strong>Your FAQs:</strong> the dozen questions you answer every
              week, in the answers you would actually give.
            </li>
            <li>
              <strong>Escalation rules:</strong> what it should handle itself and
              what it should hand to a person.
            </li>
          </ul>
          <p>
            If you want the actual wording rather than a checklist, our{" "}
            <Link href="/blog/ai-receptionist-prompts">
              AI receptionist prompt templates
            </Link>{" "}
            are the full brief, free to copy and adapt.
          </p>

          <h2 id="youre-briefing-an-assistant-not-training-a-model">
            You&apos;re briefing an assistant, not training a model
          </h2>
          <p>
            This is the point that confuses people. &ldquo;Training&rdquo; here
            does not mean machine learning, datasets, or anything technical. You
            fill in instructions and a knowledge base through a simple form, the
            same way you would write a one-page brief for a new hire. No code, no
            data science, and you can do it yourself the same day. That is also
            why you can connect it to{" "}
            <Link href="/answers/use-existing-phone-number-with-ai-receptionist">
              your existing business number
            </Link>{" "}
            and be live quickly.
          </p>

          <h2 id="keep-it-accurate-as-your-business-changes">
            Keep it accurate as your business changes
          </h2>
          <p>
            A knowledge base is only as good as how current it is. When a price
            changes, you add a service, or you close for a holiday, update the
            instructions, it takes minutes. The fastest way to find what is
            missing is to read real call transcripts: every time the AI had to
            dodge a question is a gap you can fill in one edit.
          </p>
          <p>
            One honest limit: it only knows what you tell it. Vague instructions
            produce vague answers, and for anything genuinely outside its
            knowledge it should admit it and hand off rather than guess, see{" "}
            <Link href="/answers/what-happens-if-an-ai-receptionist-cant-answer">
              what happens when an AI receptionist can&apos;t answer a question
            </Link>
            . Once it knows your business, the next step most owners want is
            scheduling, see{" "}
            <Link href="/answers/can-an-ai-receptionist-book-appointments">
              whether it can book appointments into your calendar
            </Link>
            , or just try our <Link href="/">AI receptionist</Link> on a live
            call.
          </p>
        </>
      );
    },
  },

  {
    slug: "do-callers-know-its-an-ai-receptionist",
    question: "Do callers know they're talking to an AI receptionist?",
    shortAnswer:
      "Often not, because modern voices sound natural, but whether you tell them is your choice. You can have the AI disclose that it's a virtual assistant, or have it answer naturally. Some regions and professions now require disclosure, so check your local rules and your industry's before you decide.",
    description:
      "Modern AI voices sound natural, so many callers can't tell, but disclosure is your choice and sometimes legally required. How to handle telling callers it's AI.",
    keywords: [
      "do callers know they're talking to an AI",
      "should an AI receptionist tell callers it's AI",
      "AI receptionist disclosure",
      "can you tell an AI receptionist is not human",
      "AI phone call disclosure law",
    ],
    category: "Trust & disclosure",
    date: "2026-06-30",
    updated: "2026-06-30",
    author: "matus",
    related: [
      "what-happens-if-an-ai-receptionist-cant-answer",
      "what-languages-can-an-ai-receptionist-speak",
      "ai-receptionist-vs-ivr",
    ],
    faqs: [
      {
        q: "Can callers tell it's an AI?",
        a: "With modern voices, often not, especially on short, routine calls. Quality is strongest on clear lines and can slip on long or unusual calls, which is one reason many businesses choose to disclose anyway.",
      },
      {
        q: "Should I tell callers they're speaking to an AI?",
        a: "It is your call, and increasingly a legal one. Some regions and professions require disclosure. Being upfront also tends to build trust, and most callers care more about getting helped fast than about who picks up.",
      },
      {
        q: "Is it legal to use an AI receptionist without disclosing it?",
        a: "It depends on where you operate and your industry. Several places have introduced AI-disclosure rules, so check your local law and any professional ethics rules rather than assuming. When in doubt, disclose.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Often they cannot tell, and that is exactly why this question is
            worth taking seriously. Modern voices on a good{" "}
            <Link href="/">AI receptionist</Link> sound natural enough that many
            callers assume they are talking to a person, especially on short,
            routine calls. Whether you leave it that way or tell them is a choice
            you control, and in a growing number of places it is also a legal
            one.
          </p>

          <blockquote>
            <p>
              &ldquo;We get asked &lsquo;will people know?&rsquo; a lot. The more
              useful question is &lsquo;do I want them to know?&rsquo; Being
              upfront rarely costs you a call, and it protects you. Pretending
              can backfire the moment a caller realises.&rdquo;
            </p>
            <cite>Matúš Koleják, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="can-callers-actually-tell">Can callers actually tell?</h2>
          <p>
            On clear lines and ordinary calls, frequently not. The voices are
            conversational, they handle interruptions, and they answer instantly.
            Where the illusion can slip is on long, unusual, or emotional calls,
            or with a poor connection. We break down exactly where AI voices hold
            up and where they give themselves away in{" "}
            <Link href="/blog/do-ai-voices-sound-human-on-the-phone">
              do AI voices sound human on the phone
            </Link>
            .
          </p>

          <h2 id="should-you-disclose-and-where-you-must">
            Should you disclose, and where you must?
          </h2>
          <p>
            This is partly preference and partly law. Several regions and certain
            professions have introduced rules that require telling people they
            are interacting with an AI, and those rules are expanding. We cannot
            give you legal advice, so the safe move is simple: check your local
            regulations and any professional or ethics rules for your industry
            before you decide. When in doubt, disclose, it is the low-risk
            default.
          </p>

          <h2 id="why-disclosure-can-work-in-your-favour">
            Why disclosure can work in your favour
          </h2>
          <p>
            Telling callers up front is not just defensive. Most people care far
            more about being helped quickly than about who, or what, picks up. A
            clear &ldquo;you are speaking with our virtual assistant, I can book
            you in right now&rdquo; sets expectations, builds trust, and avoids
            the one bad outcome: a caller feeling deceived after the fact. It
            also pairs naturally with handling the call well, answering in the
            caller&apos;s own{" "}
            <Link href="/answers/what-languages-can-an-ai-receptionist-speak">
              language
            </Link>{" "}
            and being honest when it{" "}
            <Link href="/answers/what-happens-if-an-ai-receptionist-cant-answer">
              does not know an answer
            </Link>
            .
          </p>
          <p>
            Either way, you stay in control of whether and how the AI introduces
            itself. Hear how natural it sounds, and decide for yourself, on our{" "}
            <Link href="/">AI receptionist</Link> demo.
          </p>
        </>
      );
    },
  },
  {
    slug: "virtual-receptionist-vs-answering-service",
    question:
      "What's the difference between a virtual receptionist and an answering service?",
    shortAnswer:
      "An answering service takes messages: a shared call-center agent picks up in your business name, notes who called and why, and relays it to you. A virtual receptionist is a remote human who works like your front desk: booking appointments, answering questions about your business, and transferring calls. The receptionist completes more per call and costs more per minute.",
    description:
      "An answering service takes and relays messages; a virtual receptionist is a remote human front desk that books and transfers. The real difference, and costs.",
    keywords: [
      "difference between virtual receptionist and answering service",
      "virtual receptionist vs answering service",
      "answering service vs virtual receptionist",
      "is a virtual receptionist an answering service",
      "what does a virtual receptionist do",
    ],
    category: "Comparison",
    date: "2026-07-04",
    updated: "2026-07-04",
    author: "brano",
    related: [
      "ai-receptionist-vs-ivr",
      "can-an-ai-receptionist-book-appointments",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
    ],
    faqs: [
      {
        q: "Is a virtual receptionist just a more expensive answering service?",
        a: "They come from the same industry, but the product is different. An answering service agent works a thin script across many clients and relays messages. A virtual receptionist is trained on your specific business and completes work on the call: booking your calendar, answering your FAQs, screening and transferring. You pay more per minute because more gets finished.",
      },
      {
        q: "Which one costs less?",
        a: "Answering services are cheaper per interaction, roughly $1 to $2 a minute with monthly bills from about $150 at low volume. Virtual receptionist plans commonly start around $200 to $300 a month for a small bundle of minutes and climb with volume. Both bill per human minute, so both get expensive exactly when your phone gets busy.",
      },
      {
        q: "Does AI change this comparison?",
        a: "Yes, it adds a third option. An AI receptionist does the virtual receptionist's core jobs, answering, booking, taking messages, 24/7 and in parallel for a flat monthly fee, and hands the genuinely human calls to a person. Many businesses now layer AI in front and keep humans for the calls that earn them.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            The difference is <strong>what gets finished on the call</strong>.
            An answering service makes sure a human voice picks up and a message
            reaches you: who called, what about, best number. A virtual
            receptionist goes further and acts like your actual front desk from
            a remote office: they learn your services and policies, book
            appointments on your real calendar, answer common questions, and
            warm-transfer the calls that need you. Same industry, different
            depth, and a real price gap between them.
          </p>

          <blockquote>
            <p>
              &ldquo;The test I give owners is one sentence: after the call,
              is the work done, or is it now on your to-do list? A message on
              your phone at 7&nbsp;a.m. is a to-do. A booked slot in your
              calendar is done.&rdquo;
            </p>
            <cite>Branislav Hrivnák, Co-Founder, AI Receptionist Now</cite>
          </blockquote>

          <h2 id="what-each-one-does-on-a-call">
            What each one does on a call
          </h2>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Answering service</th>
                <th>Virtual receptionist</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Who picks up</td>
                <td>Shared call-center agent, thin script</td>
                <td>Remote human trained on your business</td>
              </tr>
              <tr>
                <td>Books your calendar</td>
                <td>Rarely</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Answers real questions</td>
                <td>Only what&apos;s in the script</td>
                <td>Yes, after onboarding</td>
              </tr>
              <tr>
                <td>Typical cost</td>
                <td>~$1&ndash;$2/min; from ~$150/mo</td>
                <td>Bundles from ~$200&ndash;$300/mo, climbing with volume</td>
              </tr>
            </tbody>
          </table>

          <h2 id="which-one-should-you-pick">Which one should you pick?</h2>
          <p>
            Pick an <strong>answering service</strong> if the only job is
            &ldquo;a human must pick up and the message must not get
            lost&rdquo;, overnight coverage for a policy requirement, or very
            low call volume where per-minute billing barely registers. Pick a{" "}
            <strong>virtual receptionist</strong> if your calls genuinely need
            a person who can act: high-stakes, emotional, or complex calls
            where empathy closes the deal and a relayed message would lose it.
          </p>

          <h2 id="the-third-option-most-comparisons-skip">
            The third option most comparisons skip
          </h2>
          <p>
            Both options bill per human minute, which is why both get expensive
            exactly when your phone gets busy. The third option is an{" "}
            <Link href="/">AI receptionist</Link>: software that does the
            virtual receptionist&apos;s routine jobs, answering, booking
            appointments, taking structured messages, around the clock and in
            parallel for a flat monthly fee, then hands the genuinely human
            calls to a person. We&apos;ve compared all three head to head, with
            honest costs and the cases where the human options win, in{" "}
            <Link href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
              AI receptionist vs. virtual receptionist vs. answering service
            </Link>
            . And since vendors now sell AI under the &ldquo;virtual
            receptionist&rdquo; label too, always ask one question before you
            sign: <em>is a person or a program answering my phone?</em>
          </p>
        </>
      );
    },
  },

  {
    slug: "does-an-ai-receptionist-require-a-contract",
    question: "Does an AI receptionist require a contract?",
    shortAnswer:
      "It shouldn't. Most reputable AI receptionist services - ours included - run month-to-month with no long-term contract: you subscribe, test it on real calls, and cancel any month it stops earning its fee. Some vendors do push annual terms for a discount; treat that as a red flag until the product has proven itself on your own phone line.",
    description:
      "Most good AI receptionists need no contract - month-to-month, cancel anytime. Why no-contract matters, what annual discounts really trade away, what to check.",
    keywords: [
      "AI receptionist no contract",
      "does an AI receptionist require a contract",
      "AI receptionist month-to-month",
      "AI receptionist cancel anytime",
      "AI answering service without contract",
    ],
    category: "Pricing",
    date: "2026-07-21",
    updated: "2026-07-21",
    author: "matus",
    related: [
      "use-existing-phone-number-with-ai-receptionist",
      "what-happens-if-an-ai-receptionist-cant-answer",
      "virtual-receptionist-vs-answering-service",
    ],
    faqs: [
      {
        q: "Why does month-to-month matter for an AI receptionist?",
        a: "Because the only evaluation that counts is the AI on your own number with your own callers. Month-to-month means a bad pick costs you one month, not a year - and it keeps the vendor motivated to stay good after the sale, since you can leave whenever quality slips.",
      },
      {
        q: "Should I take an annual discount on an AI receptionist?",
        a: "Only after it has handled your real calls for a month or two and earned the commitment. An annual discount offered before you've heard a single live transcript trades your leverage for 10-20% off - a bad deal if the product disappoints in week three.",
      },
      {
        q: "What should I check before subscribing, even month-to-month?",
        a: "Three things: whether cancellation is self-serve or requires a sales call, whether any setup fee is refundable, and whether you can export your call data and keep your phone number when you leave. All three should have easy answers.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            It shouldn&apos;t, and with most reputable vendors it doesn&apos;t.
            The standard model for an{" "}
            <Link href="/">AI receptionist</Link> is a monthly subscription you
            can cancel any time - the same shape as any other software tool.
            When you see a mandatory 12-month term on a voice AI product,
            you&apos;re usually looking at either an old-school answering
            service wearing an AI label, or a vendor who would rather lock you
            in than keep earning you.
          </p>

          <h2 id="why-no-contract-matters">
            Why no-contract matters more here than for most software
          </h2>
          <p>
            You cannot evaluate an AI receptionist from a demo. The scripted
            walkthrough always succeeds; the real test is your own callers,
            your own accents, your own weird requests, on your own number.
            That test takes a couple of weeks of live calls - which is exactly
            what month-to-month terms let you run without risk. A vendor
            confident in their product has no reason to need a year of your
            money up front.
          </p>
          <ul>
            <li>
              <strong>A bad pick costs one month.</strong> At typical{" "}
              <Link href="/blog/ai-receptionist-pricing">
                AI receptionist prices
              </Link>{" "}
              that&apos;s $30-$300 of tuition, not a year-long regret.
            </li>
            <li>
              <strong>The vendor stays motivated.</strong> When you can leave
              next month, support and quality tend to stay sharp after the
              sale, not just before it.
            </li>
            <li>
              <strong>You keep negotiating power.</strong> Discounts for
              commitment are worth considering only after the product has
              proven itself on your calls.
            </li>
          </ul>

          <h2 id="what-to-check-before-you-subscribe">
            What to check before you subscribe, even month-to-month
          </h2>
          <p>
            &ldquo;No contract&rdquo; can still hide friction. Three questions
            settle it: Is cancellation self-serve, or does it require a
            retention call? Is any setup or onboarding fee refundable if you
            leave in the first month? And can you export your call history and
            keep your{" "}
            <Link href="/answers/use-existing-phone-number-with-ai-receptionist">
              existing phone number
            </Link>{" "}
            on the way out? A vendor that answers all three plainly is safe to
            trial; one that dodges any of them has told you something useful.
          </p>

          <h2 id="our-stance">Where we stand</h2>
          <p>
            AI Receptionist Now is month-to-month with no long-term contract -
            you can see the terms on our{" "}
            <Link href="/pricing">pricing page</Link>. We&apos;d rather earn
            the renewal every month than collect it in advance, and we think
            that should be the default you demand from any vendor in this
            market.
          </p>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-handle-emergency-calls",
    question: "Can an AI receptionist handle emergency calls?",
    shortAnswer:
      "Yes - by routing them, not by resolving them. A well-configured AI receptionist recognises urgent calls against rules you define and immediately escalates: transferring to your on-call person, paging them, or - for genuine life-safety emergencies - telling the caller to hang up and dial 911. Everything routine still gets answered and booked without waking anyone.",
    description:
      "Yes - an AI receptionist routes urgent calls to your on-call person by rules you set and directs true emergencies to 911. How emergency escalation works.",
    keywords: [
      "AI receptionist for emergency calls",
      "AI phone receptionist that routes urgent calls",
      "AI receptionist emergency escalation",
      "AI receptionist urgent call routing",
      "after-hours emergency answering",
    ],
    category: "Call handling",
    date: "2026-07-21",
    updated: "2026-07-21",
    author: "brano",
    related: [
      "can-an-ai-receptionist-transfer-calls-to-a-human",
      "what-happens-if-an-ai-receptionist-cant-answer",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
    ],
    faqs: [
      {
        q: "How does the AI know a call is an emergency?",
        a: "You define the triggers in plain language - phrases and situations like 'burst pipe', 'no heat', 'locked out', or 'chest pain' - and the AI applies those rules identically on every call. When a trigger fires, it escalates instead of continuing the normal flow.",
      },
      {
        q: "What does the AI do with a life-threatening emergency?",
        a: "It should not attempt to help. The correct configured behaviour is instant redirection: the caller is told to hang up and dial 911 (or the local emergency number) immediately. An AI's job in a true emergency is speed of routing, never advice.",
      },
      {
        q: "Will it wake me for every after-hours call?",
        a: "No - that's the point of rules. Only calls matching your emergency definition ring the on-call phone; routine calls get answered, booked, or logged for the morning. A good setup fails toward escalation on ambiguous calls, so a false alarm costs minutes rather than a missed emergency.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, with an important distinction: an{" "}
            <Link href="/">AI receptionist</Link> handles emergency calls the
            way a great dispatcher does - by recognising urgency fast and
            routing the caller to the right human immediately - not by trying
            to solve the emergency itself. Configured well, it&apos;s arguably
            more reliable at this than a tired human at 3&nbsp;a.m., because it
            applies your escalation rules identically on every single call.
          </p>

          <h2 id="how-urgent-call-routing-works">
            How urgent call routing works
          </h2>
          <p>
            You define what counts as urgent for your business in plain
            language: a burst pipe or active leak for a plumber, no heat in
            winter for HVAC, a lockout for property management, an arrest for
            a law firm. When a caller&apos;s description matches, the AI stops
            the normal booking flow and escalates on the spot:
          </p>
          <ul>
            <li>
              <strong>Warm transfer</strong> - the call is passed live to your
              on-call phone with context, so the caller doesn&apos;t repeat
              themselves. (More on{" "}
              <Link href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
                how transfers work
              </Link>
              .)
            </li>
            <li>
              <strong>Priority page</strong> - if nobody can take a live
              transfer, the on-call person gets an immediate text or call with
              the details while the AI keeps the caller informed.
            </li>
            <li>
              <strong>911 redirection</strong> - for genuine life-safety
              language, the only correct behaviour: the caller is told to hang
              up and dial 911 immediately, with no triage conversation.
            </li>
          </ul>

          <h2 id="the-part-that-protects-your-sleep">
            The part that protects your sleep
          </h2>
          <p>
            Emergency handling is really a filtering problem: the failure modes
            are waking you for everything and sleeping through the one call
            that mattered. Rules solve both. Calls that don&apos;t match your
            emergency definition get fully handled - answered, booked, logged -
            without disturbing anyone, and ambiguous calls should fail toward
            escalation, because a false alarm costs minutes while the opposite
            mistake costs far more. We&apos;ve written up the full after-hours
            playbook, including testing your own line at night, in our{" "}
            <Link href="/blog/after-hours-answering-service">
              after-hours answering service guide
            </Link>
            .
          </p>

          <h2 id="who-this-matters-most-for">Who this matters most for</h2>
          <p>
            Home services, property management, law, and healthcare - the
            industries where the after-hours call is often the most valuable
            or the most critical one of the week. For medical practices
            specifically, where routing rules should be clinician-approved and
            HIPAA applies, see our{" "}
            <Link href="/blog/medical-answering-service">
              medical answering service guide
            </Link>
            .
          </p>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-block-spam-calls",
    question: "Can an AI receptionist block spam calls?",
    shortAnswer:
      "Yes, and it's one of the quietest benefits. Because the AI answers and qualifies every call, robocalls and cold pitches get screened out before they ever reach you - the AI simply doesn't forward them or book them. You stop paying attention (or per-minute fees) to junk calls while real customers still get through instantly.",
    description:
      "Yes - an AI receptionist screens every call, so spam, robocalls and cold pitches never reach you while real customers get through. How spam filtering works.",
    keywords: [
      "AI receptionist spam call blocking",
      "can an AI receptionist block spam calls",
      "AI receptionist call screening",
      "block robocalls business phone",
      "AI answering service spam filter",
    ],
    category: "Features",
    date: "2026-07-21",
    updated: "2026-07-21",
    author: "matus",
    related: [
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
      "do-callers-know-its-an-ai-receptionist",
      "can-an-ai-receptionist-transfer-calls-to-a-human",
    ],
    faqs: [
      {
        q: "How does an AI receptionist tell spam from a real customer?",
        a: "The same way a good human screener does: it answers, asks why the caller is calling, and routes based on the answer. Robocallers hang up or fail the interaction; cold pitches get politely declined or logged separately; real customers get served. Some services add number-reputation checks on top.",
      },
      {
        q: "Will spam filtering ever block a real customer?",
        a: "It shouldn't, because good screening blocks by behaviour, not by suspicion: every caller gets answered and a chance to state their business. A real customer who states a real need gets served normally - the filter only stops calls that never turn into a legitimate request.",
      },
      {
        q: "Do I pay for the spam calls the AI handles?",
        a: "Check the plan - it's a fair comparison point between vendors. Some bill every answered minute including junk; better plans don't count obvious spam and sub-30-second hangups against your bundle. Either way it beats per-minute human services, where a chatty robocall literally costs you money.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes. Spam blocking isn&apos;t usually why people buy an{" "}
            <Link href="/">AI receptionist</Link>, but it&apos;s one of the
            first benefits owners mention after a month: the junk simply
            stops reaching them. Because the AI answers and qualifies{" "}
            <em>every</em> call, a robocall or cold pitch dies at the front
            door - unforwarded, unbooked, and summarised at most as a line in
            a log you never need to read.
          </p>

          <h2 id="how-screening-works">How the screening actually works</h2>
          <p>
            The mechanism is qualification, not a blocklist. Every caller gets
            answered instantly and asked what they need. From there, three
            paths:
          </p>
          <ul>
            <li>
              <strong>Real customers</strong> state a real need and get the
              normal experience - questions answered, appointment booked,
              message taken.
            </li>
            <li>
              <strong>Robocalls</strong> mostly fail on contact: they
              can&apos;t navigate a genuine conversation, so they hang up or
              stall out without ever touching your phone or calendar.
            </li>
            <li>
              <strong>Cold pitches</strong> get a polite, consistent decline
              or are logged to a separate list you can skim monthly - useful
              on the rare occasion a vendor call is actually relevant.
            </li>
          </ul>
          <p>
            Because behaviour does the filtering, there&apos;s no blocklist to
            maintain and no risk of a real customer being silently rejected -
            everyone gets answered, and only the calls that never become a
            legitimate request get stopped.
          </p>

          <h2 id="why-this-beats-your-current-setup">
            Why this beats how you handle spam today
          </h2>
          <p>
            Today, spam costs you attention: every junk ring interrupts a job,
            a patient, or a meal, because you can&apos;t know it&apos;s junk
            until you answer. With an AI in front, interruptions only happen
            for calls that deserve them. And unlike per-minute answering
            services - where a persistent robocaller literally shows up on
            your invoice - a flat-rate AI makes junk calls a non-event. When
            you compare vendors, do ask whether spam and instant hangups count
            against your minute bundle; we cover that and the other fine print
            in our{" "}
            <Link href="/blog/ai-receptionist-pricing">
              AI receptionist pricing guide
            </Link>
            .
          </p>
        </>
      );
    },
  },

  {
    slug: "can-an-ai-receptionist-handle-multiple-locations",
    question: "Can an AI receptionist handle multiple locations?",
    shortAnswer:
      "Yes - multi-location coverage is where AI reception gets structurally easier than staffing. One setup answers for every branch with location-aware answers (hours, address, parking), books into each location's own calendar, and routes callers to the right office - with consistent quality everywhere and no per-desk hiring.",
    description:
      "Yes - one AI receptionist covers every branch: location-aware answers, per-location calendars and routing, consistent quality. How multi-location setups work.",
    keywords: [
      "AI receptionist for multi-location",
      "AI receptionist multiple locations",
      "multi-location answering service",
      "AI receptionist for franchises",
      "multi-office phone answering",
    ],
    category: "Capabilities",
    date: "2026-07-21",
    updated: "2026-07-21",
    author: "brano",
    related: [
      "can-an-ai-receptionist-book-appointments",
      "can-an-ai-receptionist-handle-multiple-calls-at-once",
      "use-existing-phone-number-with-ai-receptionist",
    ],
    faqs: [
      {
        q: "Does each location need its own AI receptionist?",
        a: "No - one service covers all of them. Each location keeps its own number (or you use one main line with routing), and the AI answers with the right location's details: its hours, address, staff, and calendar. You manage one knowledge base with per-location facts instead of training a separate setup per branch.",
      },
      {
        q: "Can it book into different calendars for different offices?",
        a: "Yes. The AI works out which location the caller needs - from the number they dialled or by asking - and books into that location's calendar, with that office's hours, providers, and services. Cross-location rebooking ('the downtown office has a slot sooner') is a bonus a human front desk rarely offers.",
      },
      {
        q: "Is AI or hiring better for multi-location phone coverage?",
        a: "The economics diverge fast: human coverage scales linearly (every branch needs its own receptionist, or a shared team that bottlenecks), while one AI answers every branch simultaneously for a flat fee. Most multi-location operators keep humans for in-person service and put AI on the phones across all sites.",
      },
    ],
    Body: function Body() {
      return (
        <>
          <p>
            Yes, and this is honestly the setup where an{" "}
            <Link href="/">AI receptionist</Link> makes the strongest case for
            itself. A single location can debate AI versus a good front-desk
            hire; at three, five, or twenty locations the maths stops being
            close, because phone coverage with humans scales linearly - every
            branch needs its own person or share of a team - while software
            answers every branch at once.
          </p>

          <h2 id="how-a-multi-location-setup-works">
            How a multi-location setup works
          </h2>
          <ul>
            <li>
              <strong>Every branch keeps its identity.</strong> Each location
              keeps its own number and greeting, or a single main line asks
              which office the caller needs. Either way callers hear the right
              hours, address, and directions for their branch.
            </li>
            <li>
              <strong>Bookings land in the right calendar.</strong> The AI
              books into the specific location&apos;s calendar with its own
              providers, services, and availability - and can offer the
              nearest alternative when the caller&apos;s first choice is full.
              (See{" "}
              <Link href="/answers/can-an-ai-receptionist-book-appointments">
                how AI appointment booking works
              </Link>
              .)
            </li>
            <li>
              <strong>Routing follows your org chart.</strong> Urgent calls
              reach the right branch manager or regional on-call, not a
              central voicemail.
            </li>
            <li>
              <strong>One knowledge base, per-location facts.</strong> You
              update prices or policies once; location-specific details stay
              per-branch. No re-training five separate setups.
            </li>
          </ul>

          <h2 id="the-consistency-dividend">The consistency dividend</h2>
          <p>
            Ask any multi-location operator where customer experience varies
            most and the phone is usually near the top: branch A answers
            brilliantly, branch B lets it ring. An AI answers identically at
            every site - same greeting, same accuracy, same speed - and every
            call across all locations lands in one log you can actually
            review. During a rush it also answers all branches&apos; calls{" "}
            <Link href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
              simultaneously
            </Link>
            , which no shared human team can structurally do.
          </p>

          <h2 id="who-this-fits">Who this fits</h2>
          <p>
            Dental and medical groups, franchise home-services brands,
            multi-office law firms, property managers with distributed
            portfolios - anywhere the phone rings in more places than people
            can sit. If that&apos;s you, the practical next step is the same
            as for a single site: put the AI on one branch&apos;s overflow for
            two weeks, read the transcripts, then roll it across the rest.
            Our <Link href="/pricing">pricing</Link> doesn&apos;t charge per
            location, which tells you which side of this trade we&apos;re on.
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
