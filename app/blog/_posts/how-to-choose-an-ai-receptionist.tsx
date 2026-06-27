import {
  Lead,
  P,
  H2,
  UL,
  OL,
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
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "how-to-choose-an-ai-receptionist",
  title: "How to Choose an AI Receptionist: A Buyer's Guide (2026)",
  description:
    "A vendor-neutral framework for choosing an AI receptionist: the features that matter, the pricing traps, how to run a real demo, and the red flags that should end the call.",
  date: "2026-06-27",
  updated: "2026-06-27",
  readingTime: "12 min read",
  tag: "Guides",
  hero: "/blog/choose-ai-receptionist-checklist.jpg",
  heroAlt:
    "A hand ticking boxes on a handwritten project checklist by lamplight, representing a structured framework for evaluating AI receptionist vendors",
  heroWidth: 1600,
  heroHeight: 900,
  heroCredit: "Photo by Jakub Żerdzicki on Unsplash",
  heroCreditUrl:
    "https://unsplash.com/photos/hand-checking-off-items-on-a-to-do-list-fXlL5I0IvK0",
  keywords: [
    "how to choose an AI receptionist",
    "AI receptionist buyer's guide",
    "best AI receptionist for small business",
    "AI receptionist features",
    "AI receptionist pricing",
    "AI receptionist comparison",
    "AI phone answering service",
  ],
  sections: [
    { id: "before-features", title: "Start before the feature list" },
    { id: "what-matters", title: "What actually matters" },
    { id: "capabilities", title: "1. Capabilities" },
    { id: "caller-experience", title: "2. Caller experience" },
    { id: "escalation", title: "3. Escalation & failure" },
    { id: "integrations", title: "4. Integrations" },
    { id: "compliance", title: "5. Compliance" },
    { id: "pricing", title: "6. Pricing, honestly" },
    { id: "demo", title: "How to run a real demo" },
    { id: "scorecard", title: "The scorecard" },
    { id: "red-flags", title: "Red flags" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What's the single most important feature in an AI receptionist?",
      a: "A reliable escalation path. Capabilities like booking and FAQs are table stakes, and most vendors do them passably. What separates a good AI receptionist from a brand-damaging one is what happens on the call it can't handle: does it warm-transfer to a human, or take a detailed message and text you a summary immediately, or does it loop and trap the caller? Evaluate the failure mode first, not the happy path.",
    },
    {
      q: "How much should an AI receptionist cost?",
      a: "Most small-business plans land somewhere between roughly $30 and $300 a month, depending on call volume, integrations, and whether you pay flat-rate or per-minute. The number itself matters less than the pricing model: per-minute billing punishes you in your busy season, while overage charges and per-integration fees can quietly double a 'cheap' plan. Ask for the all-in monthly cost at your real call volume, not the headline price.",
    },
    {
      q: "Should I pick a general AI receptionist or one built for my industry?",
      a: "For routine answering and booking, a general-purpose AI receptionist is usually enough and cheaper. Industry-specific tools earn their premium when you need deep integration with sector software (a legal practice-management system, a dental PMS, a home-services dispatch tool) or specialized intake. If your needs are standard, paying for a vertical product mostly buys you marketing copy.",
    },
    {
      q: "How long does it take to set up an AI receptionist?",
      a: "Basic answering, FAQs, and message-taking can often be live the same day, sometimes in under an hour. The longer work is integrations (calendar, CRM, your phone system) and tuning the script against real calls. Treat the first two weeks as training: read the transcripts, find where it stumbles, and tighten it. Any vendor promising zero-effort perfection on day one is overselling.",
    },
    {
      q: "How do I test an AI receptionist before committing?",
      a: "Call it yourself, several times, and try to break it. Book an appointment, then ask something off-script, then act like an upset customer, then mumble or call from a noisy place. Ask to speak to a human and see what happens. A free trial on your own number with your real call mix tells you far more than a polished sales demo on the vendor's script.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "Harvard Business Review: The Short Life of Online Sales Leads (speed-to-lead research)",
    url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  },
  {
    title:
      "FTC .com Disclosures: how to make effective disclosures in digital advertising",
    url: "https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising",
  },
  {
    title:
      "FCC: AI-generated voices in robocalls are illegal under the TCPA (Feb 2024 ruling)",
    url: "https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        We build AI receptionists, so the responsible thing is to hand you the
        framework we&apos;d use to evaluate <em>any</em> vendor, including the
        questions that are inconvenient for us to answer. Most buying guides for
        this category are thinly disguised ads. This one is a checklist: the
        features that actually matter, the pricing traps that hide in plain
        sight, how to run a demo that tells you something real, and the red flags
        that should end the conversation.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Decide <Strong>what call you&apos;re trying to stop losing</Strong>{" "}
            before you read a single feature list. The job defines the tool, not
            the other way around.
          </>,
          <>
            Judge an AI receptionist on its <Strong>failure mode</Strong>, not
            its happy path. Escalation is the feature that separates good from
            brand-damaging.
          </>,
          <>
            Read pricing for the <Strong>model, not the headline number</Strong>.
            Per-minute billing, overage fees, and per-integration charges decide
            your real bill.
          </>,
          <>
            <Strong>Test it yourself on your own calls.</Strong> A free trial on
            your real call mix beats any scripted sales demo.
          </>,
        ]}
      />

      <H2 id="before-features">Start before the feature list</H2>
      <P>
        The most common buying mistake isn&apos;t picking the wrong vendor.
        It&apos;s shopping for features before you&apos;ve defined the job. An AI
        receptionist is not one product; it&apos;s a set of jobs (answering,
        booking, qualifying, message-taking, transferring) and you only need the
        ones that map to calls you&apos;re currently mishandling.
      </P>
      <P>
        So spend ten minutes on this before you compare anyone:
      </P>
      <OL>
        <LI>
          <Strong>Name the call you keep losing.</Strong> After-hours bookings?
          Overflow during the rush? The same five FAQs eating your day? Leads
          that go to voicemail and never call back? Write it down. That sentence
          is your buying criteria.
        </LI>
        <LI>
          <Strong>Map what happens to a call today.</Strong> Where does it ring,
          who picks up, what happens when nobody does, and where does the
          information end up afterward. You can&apos;t evaluate a replacement for
          a process you haven&apos;t described.
        </LI>
        <LI>
          <Strong>Decide what &quot;handled&quot; means.</Strong> Booked on the
          calendar? A text summary in your pocket within a minute? A warm
          transfer? Be concrete, because this is exactly what you&apos;ll test in
          the demo.
        </LI>
      </OL>
      <Callout>
        If you can&apos;t finish the sentence &quot;right now we lose ___ calls
        because ___,&quot; you&apos;re not ready to buy yet. You&apos;re ready to
        spend a week looking at your own missed-call log, which is free and more
        useful than any demo.
      </Callout>

      <Figure
        src="/blog/ai-receptionist-tradesperson-call.png"
        alt="A tradesperson on a job site glancing at an incoming call in warm afternoon light"
        width={1376}
        height={768}
        caption="The honest baseline for most small businesses isn't a perfectly staffed desk. It's this: hands full, phone ringing, lead gone. That's the call you're shopping to recover."
      />

      <H2 id="what-matters">What actually matters (and what&apos;s noise)</H2>
      <P>
        Vendor pages compete on long feature lists, most of which are either
        table stakes or marketing. Strip it down and there are six things worth
        scoring, roughly in order of how often they decide whether you&apos;ll be
        happy in six months: <Strong>capabilities, caller experience,
        escalation, integrations, compliance, and pricing</Strong>. The rest is
        detail hanging off those six. We&apos;ll take them one at a time, then
        turn them into a scorecard you can fill in during a demo.
      </P>

      <H2 id="capabilities">1. Capabilities: can it do your specific job?</H2>
      <P>
        Almost every AI receptionist now answers calls, reads from an FAQ, and
        takes a message. That&apos;s the floor, not a differentiator. The
        questions worth asking are narrower and tied to <em>your</em> sentence
        from the section above:
      </P>
      <UL>
        <LI>
          <Strong>Can it actually book, not just promise to?</Strong> Taking a
          request and emailing you to book it manually is not booking. Confirm it
          writes to your real calendar, checks availability, and handles
          reschedules and cancellations, if that&apos;s the job you hired it for.
        </LI>
        <LI>
          <Strong>Can it qualify and route?</Strong> If a call&apos;s value
          depends on a few questions (new vs. existing patient, emergency vs.
          routine, service area), the AI should ask them and branch, not treat
          every caller identically.
        </LI>
        <LI>
          <Strong>What does it do with what it heard?</Strong> A captured call is
          only useful if the summary, contact details, and reason for calling
          land somewhere you&apos;ll see them fast. Texted summary, CRM entry,
          email: pick what fits your day and confirm it works.
        </LI>
        <LI>
          <Strong>Languages, hours, multiple numbers.</Strong> Boring, but if you
          need Spanish, 24/7, or three locations on one account, find out before
          you sign, not after.
        </LI>
      </UL>

      <H2 id="caller-experience">2. Caller experience: does it feel like a phone call?</H2>
      <P>
        This is the hardest thing to judge from a feature list and the easiest to
        judge by ear, which is why you have to call it yourself. The technology is
        good now, but &quot;good&quot; varies a lot between vendors on the things
        callers actually feel:
      </P>
      <UL>
        <LI>
          <Strong>Latency.</Strong> The gap between when you stop talking and when
          it responds. A second is fine; three seconds of silence makes people
          say &quot;hello? hello?&quot; and hang up. This is the number-one
          giveaway of a cheap stack.
        </LI>
        <LI>
          <Strong>Interruptions.</Strong> Can you cut it off mid-sentence the way
          you would a person, and does it stop and listen? Systems that talk over
          you or can&apos;t be interrupted feel robotic no matter how good the
          voice is.
        </LI>
        <LI>
          <Strong>Recovery.</Strong> When it mishears, does it recover gracefully
          or repeat the same wrong thing? Ask it something slightly off-script and
          listen to how it fails.
        </LI>
        <LI>
          <Strong>Voice and disclosure.</Strong> Natural voice matters, but so
          does honesty. A brief, natural &quot;I&apos;m an AI assistant&quot; up
          front costs you almost nothing and prevents the worst caller reaction,
          which is feeling deceived.
        </LI>
      </UL>

      <H2 id="escalation">3. Escalation and failure: the part nobody demos</H2>
      <P>
        If you read only one section, read this one. Every AI receptionist looks
        great on the call it was built to handle. The product reveals itself on
        the call it <em>can&apos;t</em> handle, and that&apos;s exactly the moment
        vendors don&apos;t show you. A more capable AI that doesn&apos;t know its
        limits is worse than a modest one that escalates cleanly, because the
        former traps your callers and the latter just hands them off.
      </P>

      <Figure
        src="/blog/ai-receptionist-call-flow.svg"
        alt="Diagram: an incoming call is answered by the AI, which then books the appointment, qualifies the lead, or escalates to a human"
        width={1200}
        height={630}
        caption="The whole game is the branch on the right. Booking and qualifying are easy; what matters is that the AI recognizes when to hand off and actually does it."
      />

      <P>Ask every vendor, plainly:</P>
      <UL>
        <LI>
          <Strong>What triggers a handoff?</Strong> Caller asks for a human,
          repeated misunderstanding, an emotional or out-of-scope call. There
          should be a real answer, not &quot;our AI handles everything.&quot;
        </LI>
        <LI>
          <Strong>Where does the call go?</Strong> Warm transfer to whoever&apos;s
          on, a number that rings your cell, or a detailed message texted to you
          within a minute. &quot;It takes a message&quot; is fine only if you
          actually get the message fast.
        </LI>
        <LI>
          <Strong>What does the caller hear during all this?</Strong> Dead air and
          loops are how you turn a recoverable call into a one-star review.
        </LI>
      </UL>

      <H2 id="integrations">4. Integrations: will it fit your stack?</H2>
      <P>
        An AI receptionist that can&apos;t reach your calendar or CRM is just a
        fancier voicemail. Match integrations to the job, and be honest that more
        integration means more setup and more that can break:
      </P>
      <UL>
        <LI>
          <Strong>Calendar.</Strong> Google, Outlook, or whatever you book in.
          Two-way sync (it sees your availability and writes to it) is the
          difference between booking and double-booking.
        </LI>
        <LI>
          <Strong>CRM or practice software.</Strong> If lead and patient data
          lives in a specific system, confirm a native integration exists. A
          &quot;Zapier workaround&quot; is a yellow flag for anything you rely on.
        </LI>
        <LI>
          <Strong>Your phone system.</Strong> Can you forward your existing
          number, keep it, and route only overflow or after-hours to the AI? You
          shouldn&apos;t have to change your number to try a product.
        </LI>
      </UL>
      <P>
        Resist the urge to integrate everything on day one. Start with the one
        connection that serves your core job (usually the calendar), prove it
        works, then add the rest.
      </P>

      <H2 id="compliance">5. Compliance and disclosure: don&apos;t skip this</H2>
      <P>
        This is unglamorous and genuinely matters, especially if you record
        calls or operate in a regulated field. None of the below is legal advice,
        and the specifics depend on where you are, but a serious vendor should
        have clear answers:
      </P>
      <UL>
        <LI>
          <Strong>Disclosure that it&apos;s an AI.</Strong> Beyond being decent,
          clear disclosure is the safe default. See the{" "}
          <Ext href="https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising">
            FTC&apos;s guidance on clear and conspicuous disclosure
          </Ext>{" "}
          for the spirit, and note that regulators are paying increasing
          attention to AI voices, as the{" "}
          <Ext href="https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal">
            FCC&apos;s 2024 ruling on AI-generated voices
          </Ext>{" "}
          signaled.
        </LI>
        <LI>
          <Strong>Call recording and consent.</Strong> If calls are recorded,
          some jurisdictions require all-party consent. Ask how the vendor handles
          recording, storage, and the consent prompt, and check your local rules.
        </LI>
        <LI>
          <Strong>Data handling.</Strong> Where does call data live, who can see
          it, how long is it kept, and can you delete it? If you&apos;re in
          healthcare, ask specifically about a signed business-associate
          agreement before any patient information touches the system.
        </LI>
      </UL>

      <H2 id="pricing">6. Pricing, read honestly</H2>
      <P>
        Here&apos;s the section we have the most incentive to muddy, so let&apos;s
        be blunt. The headline price tells you almost nothing. The{" "}
        <Strong>pricing model</Strong> tells you what you&apos;ll actually pay,
        and the difference shows up exactly when you&apos;re busiest.
      </P>
      <Table
        caption="Pricing models and where they bite"
        head={["Model", "Good when", "Watch out for"]}
        rows={[
          [
            "Flat monthly fee",
            "Steady or growing call volume; you want a predictable bill",
            "Caps and overage rates once you exceed included usage",
          ],
          [
            "Per-minute",
            "Very low, occasional volume",
            "Costs spike in your busy season, exactly when calls matter most",
          ],
          [
            "Per-call",
            "Short, simple calls",
            "Wrong numbers and spam can still count as billable calls",
          ],
          [
            "Per-integration / add-ons",
            "You need only one or two connections",
            "A 'cheap' base plan that doubles once you add what you need",
          ],
        ]}
      />
      <P>The questions that surface the real number:</P>
      <UL>
        <LI>
          <Strong>What&apos;s the all-in monthly cost at my actual volume?</Strong>{" "}
          Bring your real call count. Ask them to price <em>that</em>, including
          the integrations you need, not the demo tier.
        </LI>
        <LI>
          <Strong>What happens when I go over?</Strong> Overage rate, hard cap, or
          the line just stops answering. All three exist; you want to know which.
        </LI>
        <LI>
          <Strong>What&apos;s the real commitment?</Strong> Free trial, monthly,
          or an annual lock-in with a setup fee. A confident vendor lets you leave
          easily.
        </LI>
      </UL>
      <Callout>
        Frame the comparison correctly. The fair benchmark usually isn&apos;t
        &quot;AI vs. a great receptionist.&quot; It&apos;s &quot;AI vs. the calls
        you&apos;re currently missing entirely.&quot; Against voicemail, even a
        modest plan pays for itself on one recovered job. We dig into that
        trade-off in{" "}
        <Internal href="/blog/can-an-ai-receptionist-replace-a-human-receptionist">
          can an AI receptionist replace a human
        </Internal>
        .
      </Callout>

      <H2 id="demo">How to run a demo that tells you something</H2>
      <P>
        The vendor&apos;s demo is designed to succeed. Yours should be designed to
        find the edges. Don&apos;t evaluate on the scripted walkthrough; get the
        AI on a real number and try to break it:
      </P>
      <OL>
        <LI>
          <Strong>Do the core job.</Strong> Book an appointment end to end and
          confirm it actually lands on the calendar and texts you the summary.
        </LI>
        <LI>
          <Strong>Go off-script.</Strong> Ask something it wasn&apos;t prepped
          for and listen to how it recovers, or doesn&apos;t.
        </LI>
        <LI>
          <Strong>Be the hard caller.</Strong> Act annoyed, ramble, change your
          mind mid-sentence. This is the call that decides your reviews.
        </LI>
        <LI>
          <Strong>Make the audio messy.</Strong> Call from a car or a noisy room,
          talk fast, test an accent if it&apos;s relevant to your customers.
        </LI>
        <LI>
          <Strong>Ask for a human.</Strong> Then watch the entire escalation path
          play out. This single test tells you more than the rest combined.
        </LI>
      </OL>
      <P>
        If a vendor won&apos;t let you trial it on your own number with your own
        calls, that&apos;s information too.
      </P>

      <H2 id="scorecard">The scorecard</H2>
      <P>
        Run each shortlisted vendor through the same grid and score 1 to 5. The
        weights reflect what actually predicts regret: a perfect voice with a
        broken escalation path is a bad buy.
      </P>
      <Table
        caption="AI receptionist evaluation scorecard"
        head={["Criterion", "What a 5 looks like", "Weight"]}
        rows={[
          [
            "Capabilities",
            "Does your exact job: real booking, qualifying, summaries where you'll see them",
            "High",
          ],
          [
            "Caller experience",
            "Low latency, interruptible, recovers from mistakes, discloses it's AI",
            "High",
          ],
          [
            "Escalation & failure",
            "Clear triggers, real handoff, no dead air or loops",
            "Critical",
          ],
          [
            "Integrations",
            "Native, two-way connection to your calendar/CRM and your phone number",
            "Medium-High",
          ],
          [
            "Compliance",
            "Clear answers on disclosure, recording/consent, data, BAA if needed",
            "Medium (high if regulated)",
          ],
          [
            "Pricing",
            "Predictable all-in cost at your real volume, easy to leave",
            "Medium-High",
          ],
        ]}
      />

      <H2 id="red-flags">Red flags that should end the call</H2>
      <P>
        Against our own commercial interest, here&apos;s when to walk away from{" "}
        <em>any</em> vendor, us included:
      </P>
      <UL>
        <LI>
          <Strong>&quot;Our AI handles everything.&quot;</Strong> No it
          doesn&apos;t. A vendor who won&apos;t name the calls their product is
          bad at either doesn&apos;t understand it or is hoping you won&apos;t ask.
        </LI>
        <LI>
          <Strong>No clean way to reach a human.</Strong> An AI that traps callers
          with no escape hatch does more brand damage than a missed call ever
          would.
        </LI>
        <LI>
          <Strong>Pricing that only appears after a sales call.</Strong> Opacity
          early is opacity later.
        </LI>
        <LI>
          <Strong>No trial on your own number.</Strong> If you can only hear it on
          their script, you haven&apos;t heard it.
        </LI>
        <LI>
          <Strong>Vague answers on data and recording.</Strong> &quot;It&apos;s
          all secure&quot; is not an answer.
        </LI>
      </UL>
      <P>
        If you&apos;ve got your one-sentence job, a scorecard, and a willingness
        to actually test the failure path, you&apos;re better equipped than most
        buyers in this category. When you&apos;re ready to put a candidate through
        its paces, the simplest test is to point a real call at it and listen.
        See how our{" "}
        <Internal href="/pricing">setup and pricing</Internal> work, then judge it
        on your own calls, the same way you should judge everyone else&apos;s.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
