import {
  Lead,
  P,
  H2,
  H3,
  UL,
  OL,
  LI,
  Strong,
  Ext,
  Internal,
  Figure,
  AudioClip,
  Callout,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "professional-voicemail-greeting",
  title: "Professional Voicemail Greeting: 25 Scripts, 8 Recorded and Timed",
  description:
    "25 business voicemail greeting scripts you can copy, eight of them recorded and timed so you can hear them. What to say, how long it should run, and how to set it on an iPhone or Google Voice.",
  date: "2026-10-29",
  updated: "2026-10-29",
  readingTime: "9 min read",
  tag: "Guides",
  hero: "/blog/voicemail-greeting-desk-phone.webp",
  heroAlt:
    "A small office reception desk after closing time, lit by a desk lamp and blue evening light from the window, with a desk phone in its cradle and a small red message light glowing next to a closed notebook, a pen and a coffee mug",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "professional voicemail greeting",
    "business voicemail greeting",
    "voicemail greeting examples",
    "professional voicemail greeting examples",
    "voicemail greeting script",
    "what to say in a voicemail greeting",
    "ai voicemail greeting",
    "custom voicemail greeting",
    "work voicemail greeting",
  ],
  sections: [
    { id: "four-parts", title: "The four parts of a good greeting" },
    { id: "length", title: "How long it should be (we timed it)" },
    { id: "recorded", title: "8 recorded examples" },
    { id: "scripts", title: "17 more scripts by situation" },
    { id: "mistakes", title: "What to cut" },
    { id: "set-up", title: "How to set it on iPhone and Google Voice" },
    { id: "ai-voice", title: "Record it yourself or use an AI voice?" },
    { id: "when-not", title: "When a greeting is not enough" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What should a professional voicemail greeting say?",
      a: "Four things: who the caller reached (business and, for a direct line, your name), what to leave (name, number and one detail you need), when you will call back, and what to do if it cannot wait. Everything else - 'your call is important to us', 'we are unavailable', 'after the tone' - can usually go.",
    },
    {
      q: "How long should a voicemail greeting be?",
      a: "Aim for about 15 seconds and keep it under 20. In our recordings, 28 to 48 words took 7.8 to 18.5 seconds; a 100-word 'classic' greeting took 32 seconds. Phone numbers, dates and times slow a greeting down more than ordinary words, so time yours instead of counting words.",
    },
    {
      q: "Should a voicemail greeting say 'leave a message after the beep'?",
      a: "Usually not. The caller hears the tone anyway, so the phrase costs about a second and tells them nothing. Spend the time on what you need from them instead, for example 'leave your name, number and address'.",
    },
    {
      q: "Is it OK to use an AI voice for a business voicemail greeting?",
      a: "Yes, as long as the script is yours and says who the caller reached. An AI voice is consistent and easy to update when your hours change; a recording in your own voice is more personal on a direct line. If you use a generated voice, use one you have the rights to, not an imitation of a real person.",
    },
    {
      q: "What is a good voicemail greeting for after hours?",
      a: "Say you are closed, give your opening hours, ask for the details you need to call back, and give the emergency route if you have one. For example: 'You've reached Ridgeline Plumbing. Our office is closed. We're open Monday to Friday, 7 a.m. to 5 p.m. Leave your name, number and address, and we'll call you back first thing in the morning. For a burst pipe or no water, call our emergency line at 555-0147.'",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Apple: Set up Voicemail on iPhone (iPhone User Guide)",
    url: "https://support.apple.com/guide/iphone/check-voicemail-iph3c99490e/ios",
  },
  {
    title: "Google Voice Help: Set up or change a voicemail greeting",
    url: "https://support.google.com/voice/answer/115069?hl=en",
  },
  {
    title: "Moneypenny: small business call report (November 21, 2016)",
    url: "https://moneypenny.com/us/resources/news/small-business-call-report/",
  },
  {
    title: "CRM magazine (destinationCRM): Business Voicemail Goes Unanswered (2014)",
    url: "https://www.destinationcrm.com/Articles/CRM-Insights/Insight/Business-Voicemail-Goes-Unanswered-100080.aspx",
  },
  { title: "988 Suicide & Crisis Lifeline", url: "https://988lifeline.org/" },
  {
    title: "ElevenLabs: text to speech API (the voices used for our recordings)",
    url: "https://elevenlabs.io/docs/api-reference/text-to-speech/convert",
  },
];

/** One recorded example: heading, player, the script to copy, why it works. */
function Recorded({
  id,
  title,
  seconds,
  words,
  script,
  why,
}: {
  id: string;
  title: string;
  seconds: string;
  words: number;
  script: string;
  why: string;
}) {
  return (
    <>
      <H3>{title}</H3>
      <AudioClip
        src={`/blog/audio/voicemail-greeting-${id}.mp3`}
        title={title}
        caption={`${seconds} seconds, ${words} words. AI voice, recorded for this article.`}
      />
      <Callout>{script}</Callout>
      <P>
        <Strong>Why it works:</Strong>{" "}{why}
      </P>
    </>
  );
}

export default function Body() {
  return (
    <>
      <Lead>
        Most voicemail greeting lists give you fifty scripts and no idea how
        any of them sound. We wrote 25, recorded eight with an AI voice and
        measured how long each one runs, so you can listen before you copy.
        We sell an AI receptionist, which is the thing that replaces
        voicemail; we say where a greeting is the right tool and where it is
        not.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            A good greeting does four things: <Strong>who</Strong>{" "}they
            reached, <Strong>what to leave</Strong>,{" "}
            <Strong>when you&apos;ll call back</Strong>, and{" "}
            <Strong>what to do if it can&apos;t wait</Strong>.
          </>,
          <>
            Our recordings ran <Strong>7.8 to 18.5 seconds</Strong>{" "}for 28 to
            48 words. The 100-word &quot;classic&quot; ran{" "}
            <Strong>32 seconds</Strong>.
          </>,
          <>
            Phone numbers and dates slow a greeting down. Time yours rather
            than counting words.
          </>,
          <>
            The &quot;80% of callers never leave a voicemail&quot; figure has
            no traceable study behind it. The best sourced number we found is
            69%, from a 2016 vendor survey.
          </>,
        ]}
      />

      <H2 id="four-parts">The four parts of a good greeting</H2>
      <P>
        Every script in this article is built from the same four parts, in
        this order. If a sentence does not do one of these jobs, cut it.
      </P>
      <Table
        caption="What each part does, with an example line"
        head={["Part", "Its job", "Example"]}
        rows={[
          [
            "1. Who",
            "Confirms they dialled the right number",
            "“You've reached Harbor Dental.”",
          ],
          [
            "2. What to leave",
            "Gets you the details you need to call back once",
            "“Leave your name, number and address.”",
          ],
          [
            "3. When",
            "Tells them how long they will wait, so they don't call a competitor",
            "“We'll call you back first thing in the morning.”",
          ],
          [
            "4. If it can't wait",
            "Gives urgent callers a route other than voicemail",
            "“For a burst pipe, call our emergency line at 555-0147.”",
          ],
        ]}
      />
      <P>
        Part 3 is the one most greetings leave out. &quot;As soon as
        possible&quot; promises nothing; &quot;today&quot;, &quot;within the
        hour&quot; or &quot;by Monday at noon&quot; is something the caller
        can plan around - and something you have to keep. Part 4 only applies
        if you have an urgent route; if you don&apos;t, leave it out rather
        than invent one.
      </P>

      <H2 id="length">How long it should be (we timed it)</H2>
      <P>
        We generated the eight greetings below plus one deliberately bad one
        with two stock voices from ElevenLabs, at 0.9 speed so they would not
        sound rushed, and measured each audio file.
      </P>
      <Figure
        src="/blog/voicemail-greeting-lengths-v2.svg"
        alt="Bar chart of the measured length of nine voicemail greetings. Plumber, general, 28 words: 7.8 seconds. Salon, 30 words: 9.5 seconds. Law office, 42 words: 13.3 seconds. Insurance agent, 41 words: 14.9 seconds. Out of office, 39 words: 15.7 seconds. Plumber after hours, 47 words: 15.9 seconds. Dental holiday closure, 39 words: 17.3 seconds. Family medicine, 48 words: 18.5 seconds. The 100-word classic: 32.0 seconds. A dashed line marks 20 seconds."
        width={1200}
        height={630}
        caption="Eight of the nine fit under 20 seconds. The one that does not is the greeting most businesses still use."
        credit="Measured and drawn by AI Receptionist Now"
      />
      <P>Three things we did not expect:</P>
      <UL>
        <LI>
          <Strong>Word count predicts length badly.</Strong>{" "}Two 39-word
          greetings ran 15.7 and 17.3 seconds. Across all eight good ones the
          voice averaged about 2.8 words a second, but the per-greeting rate
          ranged from 135 to 217 words a minute.
        </LI>
        <LI>
          <Strong>Numbers are slow.</Strong>{" "}The greetings with a phone number,
          a date or opening hours were the slowest per word. &quot;555-0147&quot;
          is one word on paper and well over a second out loud. That is a
          reason to keep it, slowly - a number nobody can catch is useless.
        </LI>
        <LI>
          <Strong>The classic takes twice as long.</Strong>{" "}At 32 seconds the
          100-word version runs about double the 40-word ones and adds nothing
          a caller needs; it just makes them wait longer for the tone.
        </LI>
      </UL>
      <P>
        Our rule from this: aim for about 15 seconds, stay under 20, and time
        your own recording with a stopwatch. Your pace is not an AI
        voice&apos;s pace.
      </P>

      <H2 id="recorded">8 recorded examples</H2>
      <P>
        The businesses are invented. Phone numbers use 555-01xx, a range
        reserved for fiction, so swap in your own.
      </P>

      <Recorded
        id="general"
        title="1. General business greeting"
        seconds="7.8"
        words={28}
        script="“Thanks for calling Ridgeline Plumbing. We can't get to the phone right now. Leave your name, your number, and what's going on, and we'll call you back today.”"
        why="It is the shortest of the eight and still does three of the four jobs. 'What's going on' gets you the reason for the call, so your callback starts with an answer instead of a question."
      />
      <Recorded
        id="after-hours"
        title="2. After-hours greeting with an emergency line"
        seconds="15.9"
        words={47}
        script="“You've reached Ridgeline Plumbing. Our office is closed. We're open Monday to Friday, 7 a.m. to 5 p.m. Leave your name, number and address, and we'll call you back first thing in the morning. For a burst pipe or no water, call our emergency line at 555-0147.”"
        why="It names what counts as an emergency. 'For emergencies, call…' invites every caller to decide their leaky tap is one; 'burst pipe or no water' does not."
      />
      <Recorded
        id="holiday"
        title="3. Holiday closure"
        seconds="17.3"
        words={39}
        script="“Thanks for calling Harbor Dental. We're closed Thursday and Friday for Thanksgiving, and we'll be back Monday at 8 a.m. Leave a message and we'll return it on Monday. For a dental emergency, call our on-call line at 555-0123.”"
        why="It gives the return day, not just 'closed for the holiday'. Set a reminder to switch it back: a Thanksgiving greeting in December tells callers nobody is minding the phone."
      />
      <Recorded
        id="medical"
        title="4. Medical office"
        seconds="18.5"
        words={48}
        script="“You've reached Harbor Family Medicine. If this is a medical emergency, hang up and call 911. For prescription refills, leave your name, date of birth and pharmacy, and we'll take care of it within one business day. For anything else, leave a message and we'll call you back.”"
        why="The 911 line comes first, before anything a caller might wait through. Refills are the most common reason to call, so they get their own instructions and their own deadline."
      />
      <Recorded
        id="law-firm"
        title="5. Law office"
        seconds="13.3"
        words={42}
        script="“You've reached the Law Office of Maria Chen. Please leave your name, your phone number, and a sentence about your matter, and we'll call you back by the end of the next business day. Please don't leave confidential details in this message.”"
        why="'A sentence about your matter' gets enough to run a conflict check without inviting a ten-minute story, and the last line keeps sensitive details out of a voicemail box several people may hear."
      />
      <Recorded
        id="personal-work"
        title="6. Your own direct line at work"
        seconds="14.9"
        words={41}
        script="“Hi, you've reached Daniel Brooks at Northfield Insurance. I'm away from my desk. Leave your name, number and the best time to reach you, and I'll call you back today. If it's about a claim, our claims team is at 555-0182.”"
        why="'The best time to reach you' saves a round of phone tag, and the claims number routes the most urgent callers away from a person who is not there."
      />
      <Recorded
        id="out-of-office"
        title="7. Out of office"
        seconds="15.7"
        words={39}
        script="“Hi, this is Sarah Kim. I'm out of the office until Monday, November 3rd, and I won't be checking messages. For anything urgent, call James Ortiz at 555-0165. Otherwise, leave a message and I'll call you when I'm back.”"
        why="'I won't be checking messages' is honest, and it is what makes the caller use the backup number instead of waiting a week."
      />
      <Recorded
        id="short"
        title="8. Short greeting for a busy front desk"
        seconds="9.5"
        words={30}
        script="“You've reached Bloom Salon. We're with clients right now. Leave your name and number and we'll call you back within the hour, or book online at bloomsalon.com.”"
        why="It gives the caller a way to finish the job without you. If most calls are bookings, the website is a faster answer than a callback."
      />

      <H3>And the one not to use</H3>
      <AudioClip
        src="/blog/audio/voicemail-greeting-too-long.mp3"
        title="The 100-word classic voicemail greeting"
        caption="32.0 seconds, 100 words. Every sentence is one you have heard before."
      />
      <Callout>
        “Hello, and thank you for calling ABC Company, where your satisfaction
        is our number one priority. Your call is very important to us. We&apos;re
        sorry, but we are currently unavailable to take your call, either
        because we are on another line, assisting other customers, or away from
        the office. Please leave your name, your phone number, the date and
        time of your call, and a brief message after the tone, and a member of
        our team will get back to you as soon as possible. Thank you for
        calling ABC Company, and have a wonderful day.”
      </Callout>
      <P>
        It asks for the date and time, which the voicemail system already
        records, names the company twice, explains why nobody answered (the
        caller does not care), and ends on &quot;as soon as possible&quot;.
      </P>

      <H2 id="scripts">17 more scripts by situation</H2>
      <P>Not recorded, same four-part structure. Read them aloud and time them.</P>

      <H3>Lunch break</H3>
      <Callout>
        “You&apos;ve reached Lakeside Accounting. We&apos;re at lunch until 1
        p.m. Leave your name and number and we&apos;ll call you back this
        afternoon.”
      </Callout>
      <H3>Weekend</H3>
      <Callout>
        “Thanks for calling Northside Auto Glass. We&apos;re closed for the
        weekend and open again Monday at 8. Leave your name, number and your
        vehicle, and we&apos;ll call you Monday morning. You can also request a
        quote any time at northsideglass.com.”
      </Callout>
      <H3>Sales team</H3>
      <Callout>
        “You&apos;ve reached the sales team at Brightline Software. Leave your
        name, company and the best number to reach you, and someone from our
        team will call you back within two business hours.”
      </Callout>
      <H3>Real estate agent</H3>
      <Callout>
        “Hi, you&apos;ve reached Priya Shah with Coastal Realty. I&apos;m
        probably showing a home. Leave your name, number and the address
        you&apos;re calling about, and I&apos;ll call you back today. If
        you&apos;re calling about a listing, the details are on my website,
        priyashahhomes.com.”
      </Callout>
      <H3>Contractor on a job site</H3>
      <Callout>
        “You&apos;ve reached Hartley Renovations. I&apos;m on a job site and
        can&apos;t pick up. Leave your name, number, the address and a quick
        description of the project, and I&apos;ll call you back by the end of
        the day.”
      </Callout>
      <H3>Property management</H3>
      <Callout>
        “You&apos;ve reached Oakwood Property Management. For a maintenance
        emergency - flooding, no heat, or a lockout - call 555-0139 now. For
        anything else, leave your name, unit number and the issue, and
        we&apos;ll respond within one business day.”
      </Callout>
      <H3>Restaurant</H3>
      <Callout>
        “Thanks for calling Marlow&apos;s. We&apos;re open Tuesday to Sunday
        from 5 to 10 p.m. The fastest way to book a table is online at
        marlows.com. For catering or large groups, leave your name, number and
        date, and we&apos;ll call you back tomorrow.”
      </Callout>
      <H3>Therapist or counselling practice</H3>
      <Callout>
        “You&apos;ve reached the office of Dr. Elena Ruiz. If you are in crisis,
        call or text 988, or call 911. Otherwise, leave your name and the best
        number to reach you - no other details are needed - and I&apos;ll
        return your call within one business day.”
      </Callout>
      <P>
        988 is the US Suicide &amp; Crisis Lifeline, reachable by call, text or
        chat (<Ext href="https://988lifeline.org/">988lifeline.org</Ext>).
        &quot;No other details are needed&quot; spares callers from describing
        why they are calling on a recording.
      </P>
      <H3>Dental office, new patients</H3>
      <Callout>
        “Thanks for calling Harbor Dental. If you&apos;re a new patient, leave
        your name, number and your insurance provider, and we&apos;ll call you
        back today to book your first visit. Current patients can also request
        an appointment at harbordental.com.”
      </Callout>
      <H3>Several departments</H3>
      <Callout>
        “You&apos;ve reached Granite Supply. For orders and delivery times,
        press 1. For billing, press 2. To leave a general message, stay on the
        line, and we&apos;ll call you back today.”
      </Callout>
      <P>
        Only use this if your phone system really routes the keys. Three
        options is plenty on a voicemail; any more and callers forget the
        first one.
      </P>
      <H3>Bilingual, English and Spanish</H3>
      <Callout>
        “You&apos;ve reached Familia Dental. Leave your name and number and
        we&apos;ll call you back today. Ha llamado a Familia Dental. Deje su
        nombre y número y le llamaremos hoy.”
      </Callout>
      <P>
        Keep both halves short; the second-language caller waits through the
        first. Only promise a callback in Spanish if someone can make it.
      </P>
      <H3>IT support or managed services</H3>
      <Callout>
        “You&apos;ve reached the help desk at Clearpath IT. If your whole office
        is down, press 1 for the on-call engineer. For everything else, open a
        ticket at help.clearpathit.com - it&apos;s faster than a voicemail - or
        leave your name, company and the problem, and we&apos;ll call you back
        within two hours.”
      </Callout>
      <H3>Accounting firm in tax season</H3>
      <Callout>
        “Thanks for calling Lakeside Accounting. Between now and April 15,
        we&apos;re returning calls within one business day. Leave your name,
        number, and whether you&apos;re a current client, and we&apos;ll call
        you back. To upload documents, use the client portal on our website.”
      </Callout>
      <H3>Nonprofit</H3>
      <Callout>
        “You&apos;ve reached Riverbend Food Bank. Our pantry is open Tuesday and
        Thursday from 10 to 2. If you&apos;d like to volunteer or donate, leave
        your name and number and our volunteer coordinator will call you back
        this week.”
      </Callout>
      <H3>First week in a new job</H3>
      <Callout>
        “Hi, this is Marcus Lee. I&apos;ve just joined the accounts team at
        Westfield Logistics. Leave your name, number and what you need, and
        I&apos;ll call you back today - or if you were looking for Anna Patel,
        she&apos;s now at 555-0174.”
      </Callout>
      <H3>Unexpected closure (weather, power)</H3>
      <Callout>
        “You&apos;ve reached Pinecrest Veterinary. We&apos;re closed today
        because of the storm. If your pet needs urgent care, call the
        emergency animal hospital at 555-0156. Otherwise, leave a message and
        we&apos;ll call you back when we reopen.”
      </Callout>
      <H3>Callback by text</H3>
      <Callout>
        “You&apos;ve reached Ridgeline Plumbing. Leave your name and address,
        and we&apos;ll text you back at this number within the hour with a time
        we can come out.”
      </Callout>
      <P>
        Only promise a text if you send from a number customers can reply to.
        If you want this to happen automatically, see our guide to{" "}
        <Internal href="/blog/missed-call-text-back">missed-call text back</Internal>.
      </P>

      <H2 id="mistakes">What to cut</H2>
      <UL>
        <LI>
          <Strong>&quot;Your call is important to us.&quot;</Strong>{" "}Callers
          have heard it on every hold line; it signals the opposite.
        </LI>
        <LI>
          <Strong>&quot;We are currently unavailable.&quot;</Strong>{" "}They
          already know - they are listening to a voicemail.
        </LI>
        <LI>
          <Strong>&quot;…the date and time of your call.&quot;</Strong>{" "}The
          system records both.
        </LI>
        <LI>
          <Strong>&quot;As soon as possible.&quot;</Strong>{" "}Replace with a real
          time you will keep.
        </LI>
        <LI>
          <Strong>Your company name twice.</Strong>{" "}Once, at the start.
        </LI>
        <LI>
          <Strong>Hold music, a slogan or a promotion.</Strong>{" "}Every second
          before the tone is a second the caller can hang up in.
        </LI>
        <LI>
          <Strong>Out-of-date details.</Strong>{" "}Last month&apos;s holiday,
          a colleague who has left, last year&apos;s hours. Put a quarterly
          reminder in your calendar to call your own number.
        </LI>
      </UL>

      <H2 id="set-up">How to set it on iPhone and Google Voice</H2>
      <P>
        We only list the two we could check on the vendor&apos;s own help pages
        on October 29, 2026. For a desk phone or a business phone system, look
        in your provider&apos;s help center - menus vary by plan and admin
        settings.
      </P>
      <H3>iPhone</H3>
      <OL>
        <LI>Open the Phone app.</LI>
        <LI>
          New (unified) layout: tap the menu, tap <Strong>Voicemails</Strong>,
          tap <Strong>Edit</Strong>, then{" "}
          <Strong>Edit Voicemail Greeting</Strong>. Classic layout: tap{" "}
          <Strong>Voicemail</Strong>, then <Strong>Greeting</Strong>.
        </LI>
        <LI>
          Choose <Strong>Custom</Strong>{" "}and record your greeting.
        </LI>
      </OL>
      <P>
        Apple notes that voicemail and Visual Voicemail are available from
        select carriers in select countries (
        <Ext href="https://support.apple.com/guide/iphone/check-voicemail-iph3c99490e/ios">
          Apple iPhone User Guide
        </Ext>
        ). If the Greeting option is missing, the greeting lives with your
        carrier, and you set it by calling your own voicemail.
      </P>
      <H3>Google Voice</H3>
      <OL>
        <LI>
          In the Google Voice app, open the menu, then{" "}
          <Strong>Settings</Strong>.
        </LI>
        <LI>
          Under Voicemail, tap <Strong>Voicemail greeting</Strong>, then{" "}
          <Strong>Record a greeting</Strong>.
        </LI>
        <LI>Tap Record, speak, tap Stop, then save it with a name.</LI>
      </OL>
      <P>
        Google allows up to 10 saved greetings, so you can record your
        holiday and out-of-office versions once and switch between them. A
        greeting can be up to 3 minutes in the app but only one minute when
        recorded in Safari (
        <Ext href="https://support.google.com/voice/answer/115069?hl=en">
          Google Voice Help
        </Ext>
        ). Nobody needs either limit. If the number is your business line,
        check what each plan allows first: the free plan is for personal use,
        as we explain in{" "}
        <Internal href="/blog/google-voice-for-business">
          Google Voice for business
        </Internal>
        .
      </P>

      <H2 id="ai-voice">Record it yourself or use an AI voice?</H2>
      <Table
        caption="Our view after recording the examples above"
        head={["", "Your own voice", "AI voice"]}
        rows={[
          ["Best for", "A direct line where callers know you", "A main business line"],
          ["Changing hours or a holiday", "Re-record each time", "Edit the text and regenerate"],
          ["Sound", "Depends on the room and the take", "Consistent; can sound flat on names and numbers"],
          ["Cost", "Free", "Free tools exist; paid ones offer better voices"],
          ["Watch out for", "Background noise, rushing", "Voice rights; mispronounced names and addresses"],
        ]}
      />
      <P>
        How we made ours: the two stock voices &quot;Sarah&quot; and
        &quot;Eric&quot; from ElevenLabs (we are an ElevenLabs voice partner),
        their multilingual v2 model, speed 0.9, one take each, no editing. Two
        things we had to fix in the script rather than in the audio: we wrote
        &quot;seven a.m.&quot; in words, and spelled out the web address, so
        the voice would read them the way a person would. Listen to every
        generated greeting before you publish it; a mispronounced street name
        is the fastest way to sound automated. If the question behind the
        question is whether callers can tell, we cover where AI voices still
        slip in{" "}
        <Internal href="/blog/do-ai-voices-sound-human-on-the-phone">
          do AI voices sound human on the phone
        </Internal>
        .
      </P>

      <H2 id="when-not">When a greeting is not enough</H2>
      <P>
        You will read everywhere that 80% of callers never leave a voicemail.
        We tried to find the study and could not. The earliest trade article
        we found, from 2014, credits &quot;Forbes&quot; without naming a study
        and quotes another vendor at 50 to 75% (
        <Ext href="https://www.destinationcrm.com/Articles/CRM-Insights/Insight/Business-Voicemail-Goes-Unanswered-100080.aspx">
          CRM magazine
        </Ext>
        ). The best-sourced figure is Moneypenny&apos;s: in a 2016 report
        combining a survey of 300 micro businesses with call data from 10,000
        businesses, 69% of callers who reached voicemail hung up (
        <Ext href="https://moneypenny.com/us/resources/news/small-business-call-report/">
          Moneypenny
        </Ext>
        ). Moneypenny sells call answering, the survey firm is not named and
        the data is ten years old, so treat it as a rough order of magnitude,
        not a fact about your callers.
      </P>
      <P>
        What it does suggest is that a better greeting fixes how you sound to
        the callers who stay, not the ones who hang up. If your phone mostly
        rings with routine questions and bookings, and the people calling are
        likely to try the next business on the list, a greeting is the wrong
        tool. That is what an answering service or an AI receptionist is for -
        we compare the options in{" "}
        <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
          AI receptionist vs virtual receptionist vs answering service
        </Internal>{" "}
        and put a number on it in{" "}
        <Internal href="/blog/cost-of-a-missed-call">the cost of a missed call</Internal>
        . Ours answers in a voice like the ones above, books into your
        calendar and texts you the summary, from 99 euros a month (
        <Internal href="/pricing">pricing</Internal>); you can{" "}
        <Internal href="/ai-receptionist-demo">call the demo</Internal> first.
        If your calls are rare and can wait a day, a 15-second greeting from
        this page is all you need.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
