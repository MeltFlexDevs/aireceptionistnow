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
  Callout,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "best-ai-receptionist",
  title: "The Best AI Receptionist Services, Honestly Compared (2026)",
  description:
    "An honest comparison of AI receptionist services: the vendor categories, how costs compare, the questions to ask any vendor, and a scorecard to pick one.",
  date: "2026-07-23",
  updated: "2026-10-04",
  readingTime: "16 min read",
  tag: "Guides",
  hero: "/blog/best-ai-receptionist-hero.webp",
  heroAlt:
    "A row of matte-black desk phones lined up on a pale studio surface, one gently spotlit and set forward as if chosen from the lineup - comparing AI receptionist and phone answering options",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "best ai receptionist",
    "ai receptionist comparison",
    "virtual receptionist comparison",
    "compare ai receptionist pricing plans",
    "best ai receptionist service",
    "how do the costs of virtual receptionist services compare",
    "ai receptionist services compared",
    "top ai receptionist",
    "how to choose an ai receptionist",
    "questions to ask an ai receptionist vendor",
    "how to choose an answering service",
    "ai receptionist buyer's guide",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "there-is-no-best", title: "Why there is no single 'best'" },
    { id: "categories", title: "The four categories of vendor" },
    { id: "what-to-compare", title: "The seven things that actually matter" },
    { id: "pricing", title: "How the pricing really compares" },
    {
      id: "how-to-choose",
      title: "How to choose: the questions to ask any vendor",
    },
    { id: "scorecard", title: "A scorecard you can run in ten minutes" },
    { id: "where-we-fit", title: "Where we fit - and where we don't" },
    { id: "bottom-line", title: "The bottom line" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is the best AI receptionist service?",
      a: "There is no single best AI receptionist for every business - the right one depends on your call volume, whether you need appointment booking or just message-taking, the integrations you rely on, and your budget. The honest way to choose is to score two or three vendors against a fixed checklist: does it book directly on your calendar, can it transfer live calls to a human, does it handle simultaneous calls, is the pricing flat or per-minute, and is there a contract. The vendor that wins your scorecard - not a generic ranking - is the best one for you.",
    },
    {
      q: "How much does an AI receptionist cost?",
      a: "Most AI receptionists fall into two pricing models. Flat monthly plans typically run somewhere between $30 and $300 a month for a set allowance of calls or minutes, with everything included. Per-minute or per-call plans look cheaper on paper but scale with your volume, so a busy month can cost far more than the headline rate. When you compare, always translate a per-minute quote into your real monthly minutes, and check what counts as a billable minute - some vendors bill for hold time, transfers, and spam calls.",
    },
    {
      q: "How is an AI receptionist different from a virtual receptionist or answering service?",
      a: "A traditional answering service or virtual receptionist uses human agents to take messages, usually charged per minute and limited to staffed hours. An AI receptionist is software that answers every call instantly, 24/7, in parallel, and can book appointments, answer questions from your knowledge base, and text you a summary - for a flat fee that doesn't spike when you get busy. The trade-off is that a human handles nuanced, emotional, or highly unusual calls more naturally, which is why many businesses use AI for overflow and after-hours and keep a human for daytime.",
    },
    {
      q: "What should I look for when comparing AI receptionists?",
      a: "Seven things: whether it books directly on your calendar, whether it can warm-transfer or escalate to a human, whether it handles multiple calls at once, how natural the voice sounds, which tools it integrates with, whether pricing is flat or per-minute, and whether you're locked into a contract. Score each vendor on all seven rather than trusting a star rating - the details are where AI receptionists differ most, and where the marketing pages are quietest.",
    },
    {
      q: "Can I test an AI receptionist before I buy?",
      a: "Yes, and you should never buy one you haven't heard. The fastest test is to call the vendor's own demo line and listen: does it sound human, does it interrupt naturally when you talk over it, does it actually answer a question specific to a business rather than reading a script? Then set up a short trial with your own business details and call it yourself from a real phone. Ten minutes of listening tells you more than any comparison table, including this one.",
    },
    {
      q: "What questions should I ask an AI receptionist vendor?",
      a: "Ask what triggers a handoff to a human and where that call goes; what the caller hears during a transfer; whether it books directly on your calendar with two-way sync; whether you can keep your existing number; what your all-in monthly cost is at your real call volume, including the integrations you need; what happens when you exceed your allowance; whether there's a contract or setup fee; how it discloses that it's an AI; and how call recordings and data are stored, consented and deleted. A vendor that can't answer these plainly is telling you something.",
    },
    {
      q: "How do I choose an answering service?",
      a: "Start with the calls you're losing today - after-hours, overflow, or repetitive FAQs - and decide what 'handled' means: a booked appointment, a message texted to you within a minute, or a live transfer. Then put every candidate, human or AI, through the same tests: call it yourself off-script and as a difficult caller, ask for a human, check the all-in price at your real volume, and confirm you can leave month to month. The same checklist works whether you're comparing live answering services or AI receptionists.",
    },
    {
      q: "Should I pick a general AI receptionist or one built for my industry?",
      a: "For routine answering and booking, a general-purpose AI receptionist is usually enough and cheaper. Industry-specific tools earn their premium when you need deep integration with sector software (a legal practice-management system, a dental PMS, a home-services dispatch tool) or specialised intake. If your needs are standard, paying for a vertical product mostly buys you marketing copy.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "U.S. Bureau of Labor Statistics: Receptionists, Occupational Outlook Handbook (median pay)",
    url: "https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm",
  },
  {
    title:
      "Harvard Business Review: The Short Life of Online Sales Leads (lead response-time research)",
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
        Search &quot;best AI receptionist&quot; and every result claims the top
        spot, usually its own. That&apos;s not a comparison, it&apos;s a
        billboard. We build an AI receptionist, so treat us as an interested
        party too - but the useful thing we can give you isn&apos;t a ranking
        with us at number one. It&apos;s the checklist we&apos;d use if we were
        buying, the categories the market really splits into, and an honest map
        of where a tool like ours fits and where it doesn&apos;t.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            There is no single <Strong>best AI receptionist</Strong> - the right
            pick depends on your call volume, whether you need booking or just
            messages, and your integrations. Score vendors, don&apos;t trust
            rankings.
          </>,
          <>
            The market splits into <Strong>four categories</Strong>: human
            answering services, self-serve AI, agency-built AI, and
            all-in-one platforms. They aren&apos;t priced or built the same way.
          </>,
          <>
            <Strong>Flat pricing beats per-minute</Strong> for most local
            businesses, because per-minute plans punish you in exactly the busy
            months when answering matters most.
          </>,
          <>
            The single best test is free: <Strong>call the demo line</Strong>{" "}
            and listen. Ten minutes of hearing it answer beats any table,
            including ours.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        The best AI receptionist is the one that wins <em>your</em> scorecard,
        not a generic league table. For most small and local businesses that
        means: it answers every call 24/7, books straight onto your calendar,
        can hand a live call to a human when it matters, handles two calls at
        once without dropping one, and charges a flat monthly fee with no
        contract. If you match two or three vendors against those criteria with
        your own numbers, the winner is obvious - and it&apos;s often not the one
        with the biggest ad budget. The rest of this guide is how to run that
        comparison properly.
      </P>

      <H2 id="there-is-no-best">Why there is no single &quot;best&quot;</H2>
      <P>
        A dental practice that needs new-patient bookings on its calendar, a law
        firm that needs careful intake and a conflict-check disclaimer, and a
        plumber who just needs someone to catch the after-hours emergency call
        want three genuinely different things. A tool that&apos;s perfect for one
        is mediocre for another. &quot;Best&quot; only means something once you
        fix the question to <em>best for what</em>, and any page that ranks
        vendors without asking about your business is optimising for its own
        affiliate links, not your outcome.
      </P>
      <P>
        So the honest move is to replace the ranking with a method. Below is the
        map of what&apos;s actually out there, the seven attributes that separate
        good from bad, and a scorecard you can run yourself. Where our own
        service is a genuine fit, we&apos;ll say so; where it isn&apos;t, we&apos;ll
        say that too.
      </P>

      <H2 id="categories">The four categories of vendor</H2>
      <P>
        Almost every option you&apos;ll find is one of four types. Knowing which
        you&apos;re looking at tells you more than any star rating, because it
        predicts how the tool is priced, how fast you can launch, and who fixes
        it when something breaks.
      </P>
      <Table
        caption="The four kinds of 'receptionist' you can buy"
        head={["Category", "What it is", "Best for", "The catch"]}
        rows={[
          [
            "Human answering service",
            "Live agents take messages in your name, usually per-minute",
            "Calls that need real human judgement or empathy",
            "Staffed hours only, per-minute bills, rarely books your calendar",
          ],
          [
            "Self-serve AI receptionist",
            "Software you set up yourself in an afternoon, flat monthly fee",
            "Local businesses that want 24/7 coverage fast and cheap",
            "You own the setup; quality varies a lot between vendors",
          ],
          [
            "Agency-built AI voice agent",
            "A custom voice bot an agency builds and charges to configure",
            "Complex, high-volume, or unusual call flows",
            "Setup fees, longer timelines, and ongoing dependency",
          ],
          [
            "All-in-one platform add-on",
            "A receptionist feature bolted onto a CRM or phone system",
            "Teams already living inside that platform",
            "Often shallow; the receptionist isn't the product's focus",
          ],
        ]}
      />
      <P>
        Most people searching for an AI receptionist for a clinic, firm, or
        trade business are best served by the self-serve category - it&apos;s the
        fastest to launch and the only one with predictable pricing. That&apos;s
        the category we&apos;re in, alongside names you&apos;ll have seen in your
        research. We&apos;ve written head-to-head breakdowns of the main ones so
        you don&apos;t have to reverse-engineer their pricing pages:
      </P>
      <UL>
        <LI>
          <Internal href="/compare/ruby-alternative">
            Ruby Receptionist alternative
          </Internal>{" "}
          - the best-known human/virtual receptionist, and how AI compares on
          cost and coverage.
        </LI>
        <LI>
          <Internal href="/compare/smith-ai-alternative">
            Smith.ai alternative
          </Internal>{" "}
          - a hybrid human-plus-AI service, and where the per-call maths lands.
        </LI>
        <LI>
          <Internal href="/compare/goodcall-alternative">
            Goodcall alternative
          </Internal>{" "}
          and{" "}
          <Internal href="/compare/rosie-alternative">
            Rosie alternative
          </Internal>{" "}
          - two self-serve AI receptionists compared feature for feature.
        </LI>
        <LI>
          <Internal href="/compare/my-ai-front-desk-alternative">
            My AI Front Desk alternative
          </Internal>{" "}
          - another self-serve tool, and how the setup and integrations differ.
        </LI>
      </UL>

      <H2 id="what-to-compare">The seven things that actually matter</H2>
      <P>
        Vendors compete loudly on the things that photograph well and go quiet on
        the things that decide whether the tool works. These are the seven
        attributes worth more than any headline - and the questions that pull the
        real answer out of a sales page.
      </P>
      <OL>
        <LI>
          <Strong>Appointment booking.</Strong> Does it write directly to your
          actual calendar (Google, Outlook, or your booking tool), or just take a
          message for you to key in later? Live booking is the difference between
          a receptionist and a fancy voicemail.
        </LI>
        <LI>
          <Strong>Human escalation.</Strong> Can it warm-transfer a live caller
          to you or a teammate, and what happens to the ones it can&apos;t
          handle? Read our take on{" "}
          <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
            transferring calls to a human
          </Internal>{" "}
          before you assume every vendor does this well.
        </LI>
        <LI>
          <Strong>Simultaneous calls.</Strong> A human answers one line at a
          time; good AI answers ten. If two customers call during your Monday
          rush, does the second one get through, or ring out? See{" "}
          <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
            handling multiple calls at once
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Voice quality.</Strong> Does it sound like a person or a
          hold-music robot, and does it handle interruptions naturally? This is
          the one thing you can only judge by ear - we cover what to listen for
          in{" "}
          <Internal href="/blog/do-ai-voices-sound-human-on-the-phone">
            do AI voices sound human on the phone
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Integrations.</Strong> Your calendar, CRM, and the phone
          number you already advertise. A receptionist that can&apos;t{" "}
          <Internal href="/answers/use-existing-phone-number-with-ai-receptionist">
            use your existing number
          </Internal>{" "}
          creates more work than it removes.
        </LI>
        <LI>
          <Strong>Pricing model.</Strong> Flat monthly or per-minute? This one
          decides your bill more than any feature - see the next section.
        </LI>
        <LI>
          <Strong>Contract.</Strong> Month-to-month or locked in? A vendor
          confident in the product doesn&apos;t need to trap you. We keep ours{" "}
          <Internal href="/answers/does-an-ai-receptionist-require-a-contract">
            contract-free
          </Internal>{" "}
          on purpose.
        </LI>
      </OL>

      <H2 id="pricing">How the pricing really compares</H2>
      <P>
        Pricing is where comparisons quietly mislead, because two vendors can
        quote the same-looking number for completely different things. There are
        really only two models, and the gap between them widens exactly when your
        phone gets busy.
      </P>
      <Table
        caption="The two pricing models, and who each one favours"
        head={["Model", "Typical range", "Cheapest when...", "Expensive when..."]}
        rows={[
          [
            "Flat monthly",
            "~$30-$300 / month, all-in",
            "Your volume is steady or growing - the price doesn't move",
            "You barely use it - you pay the same for a quiet month",
          ],
          [
            "Per-minute / per-call",
            "~$1-$2 / minute or per call",
            "You get a handful of calls a month",
            "You get busy - a good month becomes an expensive bill",
          ],
        ]}
      />
      <P>
        The trap with per-minute pricing is that it charges you most in the
        months you succeed. Land a marketing campaign, hit your busy season, or
        go a little viral, and the plan that looked cheap becomes a variable cost
        you can&apos;t forecast. For most local businesses, a{" "}
        <Strong>flat fee is the safer default</Strong> - you know the number, and
        answering the hundredth call costs the same as the first. When you get a
        per-minute quote, always convert it: take your real monthly call minutes
        and do the multiplication before you compare. Our own{" "}
        <Internal href="/blog/virtual-receptionist-pricing#ai-receptionist-pricing">
          guide to AI receptionist pricing
        </Internal>{" "}
        breaks down what should and shouldn&apos;t be a billable minute, and
        if a live answering service is also on your list, its published
        per-minute rates are in our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          answering service pricing comparison
        </Internal>
        .
      </P>
      <Callout>
        Always price the comparison against the alternative you&apos;re really
        weighing: a full-time receptionist. Per the{" "}
        <Ext href="https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm">
          Bureau of Labor Statistics
        </Ext>
        , that&apos;s roughly $37,000 a year before benefits, and it only covers
        staffed hours. Any AI plan is competing with that number, not with zero.
      </Callout>

      <H2 id="how-to-choose">How to choose: the questions to ask any vendor</H2>
      <P>
        The seven attributes tell you <em>what</em> to compare. This is how to
        actually run the evaluation - and it works just as well for choosing a
        human answering service as an AI one. The most common buying mistake
        isn&apos;t picking the wrong vendor; it&apos;s shopping for features
        before you&apos;ve defined the job. So spend ten minutes on three
        things before you talk to anyone:
      </P>
      <OL>
        <LI>
          <Strong>Name the call you keep losing.</Strong> After-hours
          bookings? Overflow during the rush? The same five FAQs eating your
          day? That sentence is your buying criteria.
        </LI>
        <LI>
          <Strong>Map what happens to a call today.</Strong> Where it rings,
          who picks up, what happens when nobody does, and where the
          information ends up afterwards.
        </LI>
        <LI>
          <Strong>Decide what &quot;handled&quot; means.</Strong> Booked on the
          calendar, a text summary within a minute, or a warm transfer. Be
          concrete - it&apos;s exactly what you&apos;ll test.
        </LI>
      </OL>
      <H3>Questions to ask an AI receptionist vendor</H3>
      <P>
        These are the questions sales pages are quietest about. Ask them
        plainly and listen for a specific answer, not &quot;our AI handles
        everything&quot;:
      </P>
      <UL>
        <LI>
          <Strong>What triggers a handoff, and where does the call go?</Strong>{" "}
          Caller asks for a human, repeated misunderstanding, an emotional or
          out-of-scope call - then a warm transfer, your cell, or a detailed
          message texted to you within a minute. A capable AI that doesn&apos;t
          know its limits is worse than a modest one that escalates cleanly.
        </LI>
        <LI>
          <Strong>What does the caller hear while that happens?</Strong> Dead
          air and loops are how a recoverable call becomes a one-star review.
        </LI>
        <LI>
          <Strong>How does it handle latency, interruptions and mistakes?</Strong>{" "}
          A second&apos;s pause is fine; several seconds of silence makes
          people say &quot;hello?&quot; and hang up. You should be able to cut
          it off mid-sentence, and it should recover when it mishears instead
          of repeating the same wrong thing.
        </LI>
        <LI>
          <Strong>Does booking mean booking?</Strong> Writing to your real
          calendar with two-way sync, including reschedules and
          cancellations - not emailing you a request to key in later.
        </LI>
        <LI>
          <Strong>What&apos;s my all-in monthly cost at my real volume?</Strong>{" "}
          Bring your actual call count and the integrations you need. Then ask
          what happens when you go over: an overage rate, a hard cap, or the
          line simply stops answering.
        </LI>
        <LI>
          <Strong>What&apos;s the commitment?</Strong> Free trial,
          month-to-month, or an annual lock-in with a setup fee.
        </LI>
        <LI>
          <Strong>How does it disclose that it&apos;s an AI?</Strong> A brief,
          natural disclosure is the safe default - see the{" "}
          <Ext href="https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising">
            FTC&apos;s guidance on clear and conspicuous disclosure
          </Ext>{" "}
          - and regulators are watching AI voices, as the{" "}
          <Ext href="https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal">
            FCC&apos;s 2024 ruling on AI-generated voices in robocalls
          </Ext>{" "}
          signalled.
        </LI>
        <LI>
          <Strong>How are recordings and data handled?</Strong> Some
          jurisdictions require all-party consent to record. Ask where call
          data lives, who can see it, how long it&apos;s kept and whether you
          can delete it. In healthcare, ask for a signed business associate
          agreement before any patient information touches the system. (None
          of this is legal advice; check your local rules.)
        </LI>
      </UL>
      <H3>Run a demo designed to find the edges</H3>
      <P>
        The vendor&apos;s demo is built to succeed. Yours should be built to
        break it - ideally on a trial using your own number:
      </P>
      <OL>
        <LI>
          <Strong>Do the core job</Strong> end to end and confirm the booking
          lands on the calendar and the summary reaches you.
        </LI>
        <LI>
          <Strong>Go off-script</Strong> with a question it wasn&apos;t
          prepared for, and listen to how it recovers.
        </LI>
        <LI>
          <Strong>Be the hard caller:</Strong> annoyed, rambling, changing
          your mind mid-sentence.
        </LI>
        <LI>
          <Strong>Make the audio messy:</Strong> call from a car or a noisy
          room, talk fast.
        </LI>
        <LI>
          <Strong>Ask for a human</Strong> and watch the whole escalation
          path play out. This one test tells you more than the rest combined.
        </LI>
      </OL>
      <P>
        Make at least one of those calls outside business hours - a 24/7
        claim is checkable at midnight, and our{" "}
        <Internal href="/blog/24-7-ai-receptionist">
          24/7 AI receptionist guide
        </Internal>{" "}
        lists what to probe.
      </P>
      <Callout>
        Red flags that should end the conversation with any vendor, us
        included: &quot;our AI handles everything&quot;; no clean way for a
        caller to reach a human; pricing that only appears after a sales call;
        no trial on your own number; and &quot;it&apos;s all secure&quot; as
        the whole answer on data and recording.
      </Callout>

      <H2 id="scorecard">A scorecard you can run in ten minutes</H2>
      <P>
        Here&apos;s the whole method in one table. Pick two or three vendors,
        score each attribute out of the weight shown, and add it up. Give the
        heavier weights to the things your business actually needs - a
        message-only shop can zero out &quot;booking&quot;; a busy clinic should
        make it decisive.
      </P>
      <Table
        caption="The AI receptionist scorecard - weight each row to your needs"
        head={["Attribute", "Weight", "The question to ask"]}
        rows={[
          ["Answers 24/7 in parallel", "3", "Does the second simultaneous call get answered?"],
          ["Books on my calendar", "3", "Does it write to my real calendar, or just message me?"],
          ["Transfers to a human", "2", "Can it warm-transfer a live, urgent call?"],
          ["Sounds human", "2", "Did the demo line sound like a person to me?"],
          ["Uses my existing number", "2", "Can I keep the number on my van and website?"],
          ["Flat, forecastable price", "3", "Is my busiest month the same price as my quietest?"],
          ["No contract", "1", "Can I leave next month if it's not working?"],
        ]}
      />
      <P>
        The point of weighting is honesty: it forces you to admit what you
        actually need before a sales call talks you into what they&apos;re best
        at. Run the same sheet on us and on whoever else you&apos;re considering.
        If we lose on the attributes that matter to you, buy the one that wins.
      </P>

      <H2 id="where-we-fit">Where we fit - and where we don&apos;t</H2>
      <P>
        In the interest of the honesty this whole guide is built on: an AI
        receptionist like ours is a strong fit if you&apos;re a local or
        appointment-based business that&apos;s missing calls after hours, during
        rushes, or on second lines, and you want flat, contract-free pricing and
        a setup you can finish yourself in an afternoon. It books, it answers 24/7
        in parallel, it uses your existing number, and it hands off the calls it
        shouldn&apos;t handle alone.
      </P>
      <P>
        It&apos;s <em>not</em> the right first choice if the bulk of your calls
        are emotionally delicate, highly unusual, or need a licensed human to
        speak (some legal or medical situations), or if you genuinely get only a
        handful of calls a month and a pure per-minute human service would cost
        less than any flat plan. In those cases a human answering service, or a
        human-plus-AI hybrid, may beat us - and we&apos;d rather you knew that
        now than churned in month two. The healthiest setup for many businesses
        isn&apos;t either/or: it&apos;s a human for daytime relationship calls and
        AI catching everything the human can&apos;t.
      </P>

      <H2 id="bottom-line">The bottom line</H2>
      <P>
        Don&apos;t buy the &quot;best AI receptionist.&quot; Buy the one that
        wins the scorecard you weighted for your own business, after you&apos;ve
        called its demo line and heard it answer. The market has more good
        options than it did a year ago, which is exactly why a fixed method beats
        a moving ranking: the method still works when the leaderboard changes.
      </P>
      <P>
        When you&apos;re ready to score us, the fairest test costs nothing -{" "}
        <Internal href="/">hear our AI receptionist answer a call</Internal>,
        then check the{" "}
        <Internal href="/pricing">flat monthly pricing</Internal> against your
        own missed-call maths - and put us through every{" "}
        <Internal href="#how-to-choose">question on the vendor list</Internal>{" "}
        above.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
