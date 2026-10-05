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
  Figure,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "live-answering-service",
  title: "Live Answering Service: What 13 Providers Actually Promise",
  description:
    "We read the pricing pages, FAQs and terms of 13 live answering services. Few publish an answer speed, one publishes a hold policy, and rounding moves the bill more than the rate.",
  date: "2026-10-05",
  updated: "2026-10-05",
  readingTime: "16 min read",
  tag: "Guides",
  hero: "/blog/live-answering-operator-evening.webp",
  heroAlt:
    "An answering-service operator in a headset typing a message at her workstation in the evening, with rows of mostly empty desks and dimmed lights behind her",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "live answering service",
    "live phone answering service",
    "live answering service for small business",
    "24/7 live answering service",
    "live call answering service",
    "best live answering service",
    "us based live answering service",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "what-live-means", title: "What “live” means in 2026" },
    { id: "promises", title: "What 13 providers put in writing" },
    { id: "speed", title: "Answer speed: the number nobody publishes" },
    { id: "price", title: "What it costs at 60 calls a month" },
    { id: "economics", title: "Why a human minute costs what it does" },
    { id: "trial", title: "How to test one in a free trial" },
    { id: "live-or-ai", title: "When live is worth it, and when it is not" },
    { id: "questions", title: "Seven questions to send before you sign" },
    { id: "not-verified", title: "What we could not verify" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a live answering service?",
      a: "A live answering service is a company whose human agents answer your business calls when you forward your line to them, either all day, after hours, or only when you are busy. The agent greets callers in your business name, follows a script you agree, takes a message or books an appointment, and sends you the details by text, email or app. You pay per minute of agent time or per call, usually on a monthly plan.",
    },
    {
      q: "How much does a live answering service cost?",
      a: "On the pricing pages we read on October 5, 2026, the cheapest way in is a pay-as-you-go plan at $44 to $49 a month plus $1.35 to $2.99 per minute (Specialty Answering Service, Signius, MAP Communications, PATLive). Bundled plans run $149 to $395 for about 100 minutes. For a small business taking 60 two-minute calls a month, our worked example lands between about $176 and $720 depending on the provider and how it rounds each call.",
    },
    {
      q: "How fast does a live answering service pick up?",
      a: "Most providers do not say. Of the 13 we checked, only three publish a speed claim: Ruby states an average answer time under 10 seconds, AnswerConnect says it answers 99% of calls within one to four rings, and AMBS Call Center says it answers 80% or more of calls in three rings or less. AMBS is also the only one that publishes a hold-time target, under 60 seconds on average for calls that are queued. For everyone else, measure it during the free trial.",
    },
    {
      q: "Are live answering service agents based in the US?",
      a: "Several providers say so in writing: Ruby, PATLive (based in Florida), Abby Connect (Las Vegas headquarters), Signius, MAP Communications and Moneypenny US. Smith.ai says it uses no overseas agents. AnswerConnect describes agents working from home without naming a country, and Specialty Answering Service describes itself as a USA-based company without stating where operators sit. If location matters to you, ask for it in the contract.",
    },
    {
      q: "Do live answering services use AI now?",
      a: "Some mix it in, and they describe it differently. Ruby says a human always picks up and AI works in the background. Abby Connect lets you choose human, AI, or a mix per call type. AMBS Call Center and Moneypenny sell AI as separate plans. AnswerConnect pledges to keep every customer interaction human. If you are paying for a human, ask the provider to state in writing whether any of your calls can be answered by software.",
    },
    {
      q: "Is a live answering service better than an AI receptionist?",
      a: "It depends on the calls. A live service is the better fit when calls need judgement, empathy or a conversation that cannot be scripted, and when volume is modest enough that per-minute pricing stays affordable. An AI receptionist is usually far cheaper per call, can answer more than one call at a time on a multi-line plan, and is better for routine scheduling and message-taking. Many businesses use AI for routine calls and a person for anything flagged.",
    },
    {
      q: "Can I try a live answering service for free?",
      a: "Several providers publish a free trial: PATLive (14 days), Specialty Answering Service (14 days), Signius (7 days) and Abby Connect (a trial on every plan). Ruby publishes a money-back guarantee within 21 days or before 500 minutes are used, and Smith.ai a 30-day money-back guarantee that excludes overage. Use the trial to place test calls at your busiest and quietest hours.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  { title: "Ruby: pricing (checked October 5, 2026)", url: "https://www.ruby.com/pricing/" },
  { title: "Ruby: FAQ (answer time, AI, bilingual)", url: "https://www.ruby.com/faq/" },
  { title: "PATLive: pricing (trial, pay-as-you-go plan, Spanish)", url: "https://www.patlive.com/pricing/" },
  { title: "PATLive: FAQ (US-based receptionists, 24/365, cancellation)", url: "https://www.patlive.com/faq/" },
  { title: "AnswerConnect: homepage (answer-speed claim, human-only pledge)", url: "https://www.answerconnect.com/" },
  { title: "AnswerConnect: plans (price, setup fee, rounding to the minute)", url: "https://www.answerconnect.com/plans-direct" },
  { title: "Abby Connect: pricing (Las Vegas team, human/AI mix, trial)", url: "https://www.abby.com/pricing/" },
  { title: "Smith.ai: receptionist pricing (per-call plans, no overseas agents)", url: "https://smith.ai/pricing/receptionists" },
  { title: "Specialty Answering Service: pricing (plans, per-second billing, no contract)", url: "https://www.specialtyansweringservice.net/pricing/" },
  { title: "AMBS Call Center: pricing (answer speed, hold target, 30-second rounding, setup fee)", url: "https://www.ambscallcenter.com/pricing" },
  { title: "Signius: pricing (plans, no long-term contracts)", url: "https://signius.com/pricing/" },
  { title: "MAP Communications: pricing", url: "https://www.mapcommunications.com/pricing/" },
  { title: "Nexa: pricing (plan sizes without prices)", url: "https://www.nexa.com/pricing" },
  { title: "Moneypenny US: pricing (people plans, AI plans, 30 days' notice)", url: "https://www.moneypenny.com/us/pricing/" },
  {
    title: "Moneypenny US terms and conditions (wrap-up time, 30-second rounding)",
    url: "https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf",
  },
  { title: "Davinci Virtual: live receptionist plans", url: "https://www.davincivirtual.com/live-receptionist" },
  {
    title: "42 CFR 423.128 - call center standards for Medicare Part D plan sponsors (eCFR)",
    url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-423/subpart-C/section-423.128",
  },
  {
    title:
      "Zohar, Mandelbaum and Shimkin, Adaptive behavior of impatient customers in tele-queues: theory and empirical support, Management Science 48(4), 2002",
    url: "https://aviman.technion.ac.il/files/References/zohar.pdf",
  },
  {
    title:
      "U.S. Bureau of Labor Statistics: OEWS May 2025, NAICS 561400 Business Support Services (customer service representatives)",
    url: "https://www.bls.gov/oes/current/naics4_561400.htm",
  },
  {
    title: "U.S. Census Bureau Service Annual Survey via FRED: revenue of telephone answering services (NAICS 561421)",
    url: "https://fred.stlouisfed.org/series/REVEF561421ALLEST",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every live answering service says the same three things: real people,
        around the clock, fast. So we stopped reading the headlines and read
        what thirteen providers commit to on their pricing pages, FAQs and
        terms. The useful findings are in the gaps. Only three publish any
        answer-speed figure, one publishes a hold-time target, and the way a
        call is rounded moves a small business&apos;s bill more than the
        headline rate does. We sell an AI receptionist, so we are a competitor
        of everyone below - which is why every claim links to the
        provider&apos;s own page.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>3 of 13</Strong> providers publish an answer-speed claim;{" "}
            <Strong>1 of 13</Strong> (AMBS Call Center) publishes what happens
            to a caller who is put on hold.
          </>,
          <>
            For the same 60 two-minute calls, published plans range from{" "}
            <Strong>about $176 to $720 a month</Strong>. Rounding rules explain
            a large part of the gap.
          </>,
          <>
            &quot;Live&quot; no longer guarantees no software: some providers
            blend AI into the call, some sell it separately, one pledges never
            to. Ask for it in writing.
          </>,
          <>
            The only way to learn a provider&apos;s real speed is to measure
            it. We give a ten-call test plan for the free trial.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>live answering service</Strong> is a team of human agents who
        answer your business line when you forward it to them - all day, after
        hours, or only when you are busy. They greet callers in your business
        name, follow a script you agree, take a message or book an appointment,
        and send you the details. You pay per minute of agent time or per call.
        It is a different purchase from a{" "}
        <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
          virtual receptionist or an AI receptionist
        </Internal>
        , though the lines between the three are blurring.
      </P>
      <P>
        Picking one comes down to four things the marketing does not tell you:
        who actually answers, how fast, what happens when every agent is busy,
        and how each call is turned into billed minutes. The rest of this guide
        is what the providers say about those four things in writing, and how
        to check the parts they do not say.
      </P>

      <H2 id="what-live-means">What &quot;live&quot; means in 2026</H2>
      <P>
        Until recently &quot;live&quot; simply meant &quot;not voicemail&quot;.
        Now that most of these companies also sell AI, the word needs reading
        more carefully. Their own pages describe four different positions:
      </P>
      <UL>
        <LI>
          <Strong>A human always picks up, software assists.</Strong>{" "}
          <Ext href="https://www.ruby.com/faq/">Ruby</Ext> states that &quot;an
          AI virtual receptionist that independently picks up and conducts the
          call isn&apos;t how Ruby works&quot;, and lists optional AI
          enhancements on all plans at no extra cost.
        </LI>
        <LI>
          <Strong>You choose per call type.</Strong>{" "}
          <Ext href="https://www.abby.com/pricing/">Abby Connect</Ext> describes
          itself as &quot;one service, and you choose how each call is
          handled&quot; - just human, just AI, or a mix - with one AI minute
          using half an &quot;Abby Minute&quot;.
        </LI>
        <LI>
          <Strong>AI sold as a separate plan.</Strong>{" "}
          <Ext href="https://www.ambscallcenter.com/pricing">AMBS Call Center</Ext>{" "}
          splits its plans into real people, AI, and both;{" "}
          <Ext href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>{" "}
          lists AI plans from $69 a month next to its people plans.
        </LI>
        <LI>
          <Strong>Human only, as a pledge.</Strong>{" "}
          <Ext href="https://www.answerconnect.com/">AnswerConnect</Ext> says
          &quot;we pledge to keep every customer interaction human&quot;.
        </LI>
      </UL>
      <P>
        None of these is wrong. But if a human voice on every call is the reason
        you are paying a per-minute premium over software, it belongs in
        the contract, not on a marketing page that can change next quarter.
      </P>

      <H2 id="promises">What 13 providers put in writing</H2>
      <P>
        We read each provider&apos;s pricing page, FAQ and, where published,
        terms on October 5, 2026. &quot;Not published&quot; means we looked and
        it is not there - not that the provider does not do it. Answering
        Service Care blocked our requests entirely, so it is not in the table.
      </P>
      <Table
        caption="Commitments in each provider's own published pages (checked October 5, 2026)"
        head={["Provider", "Where agents are", "Answer speed", "Spanish", "Contract / trial"]}
        rows={[
          [
            <Ext key="ruby" href="https://www.ruby.com/pricing/">Ruby</Ext>,
            "US-based receptionists",
            "Average under 10 seconds",
            "Bilingual, 24/7",
            "Month-to-month; money-back within 21 days or 500 minutes",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/faq/">PATLive</Ext>,
            "All in the US; based in Florida",
            "Not published",
            "Included at no extra cost",
            "Cancel anytime; 14-day free trial",
          ],
          [
            <Ext key="ac" href="https://www.answerconnect.com/">AnswerConnect</Ext>,
            "Home-based agents; country not stated",
            "99% within 1 to 4 rings",
            "Not published",
            "Change at any time; trial not published",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/pricing/">Abby Connect</Ext>,
            "US team at its Las Vegas HQ",
            "Not published for humans",
            "Included on all plans",
            "Month-to-month; free trial on every plan",
          ],
          [
            <Ext key="smith" href="https://smith.ai/pricing/receptionists">Smith.ai</Ext>,
            "“No overseas agents”",
            "Not published",
            "Dedicated Spanish line, listed as a $1.00 add-on",
            "Month-to-month; 30-day money-back, overage excluded",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/pricing/">Specialty Answering Service</Ext>,
            "US company; operator location not stated",
            "Not published",
            "Available; hours not stated",
            "Month-to-month; 14-day free trial",
          ],
          [
            <Ext key="ambs" href="https://www.ambscallcenter.com/pricing">AMBS Call Center</Ext>,
            "“100% U.S.-based” in the plan list; “vast majority” in the FAQ",
            "80%+ in 3 rings or less",
            "Bilingual",
            "Not on the pricing page",
          ],
          [
            <Ext key="sig" href="https://signius.com/pricing/">Signius</Ext>,
            "100% US-based",
            "Not published",
            "Stated for its medical service",
            "Month-to-month; 7-day free trial",
          ],
          [
            <Ext key="map" href="https://www.mapcommunications.com/pricing/">MAP Communications</Ext>,
            "US-based agents",
            "Not published",
            "English and Spanish",
            "No long-term contracts; trial length not stated",
          ],
          [
            <Ext key="nexa" href="https://www.nexa.com/pricing">Nexa</Ext>,
            "Not published",
            "Not published",
            "Bilingual",
            "Not published; plan prices not published",
          ],
          [
            <Ext key="mp" href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>,
            "“Based in America”",
            "Not published",
            "Bilingual answering",
            "No contract; 30 days' notice to cancel",
          ],
          [
            <Ext key="dv" href="https://www.davincivirtual.com/live-receptionist">Davinci Virtual</Ext>,
            "Not stated in its FAQ answer",
            "Not published",
            "Not published",
            "No long-term commitment",
          ],
        ]}
      />
      <P>
        Two details are worth pausing on. AMBS Call Center says &quot;100%
        U.S.-based agents&quot; in one place and &quot;the vast majority of our
        agents are located in the US&quot; in another, on the same pricing
        page. That is probably a copy inconsistency rather than anything
        sinister, but it is exactly the kind of thing to settle in writing. And
        &quot;24/7&quot; is universal - every provider in the table claims it -
        so it no longer separates anyone. What happens at 2 a.m. does, and
        that is not something a pricing page can tell you.
      </P>
      <Figure
        src="/blog/live-answering-floor-night.webp"
        alt="A wide view of an answering-service floor in the middle of the night, with long rows of empty desks and headsets resting on them, and two operators working far away at the back"
        width={1376}
        height={768}
        caption="Every provider claims 24/7 coverage. None publishes how many agents are on shift overnight, which is when a queue is most likely."
      />

      <H2 id="speed">Answer speed: the number nobody publishes</H2>
      <P>
        Three of the thirteen commit to a figure, and they measure it three
        different ways:{" "}
        <Ext href="https://www.ruby.com/faq/">Ruby</Ext> publishes an average
        (&quot;&lt;10 seconds average answer time&quot;),{" "}
        <Ext href="https://www.answerconnect.com/">AnswerConnect</Ext> a ring
        count for 99% of calls (&quot;within one to four rings&quot;), and{" "}
        <Ext href="https://www.ambscallcenter.com/pricing">AMBS Call Center</Ext>{" "}
        a ring count for most calls (&quot;80%+ of calls in 3 rings or
        less&quot;). An average can hide a long tail, and a ring count depends
        on how long your phone system rings before forwarding. They are not
        comparable with each other, and they are not guarantees.
      </P>
      <P>
        AMBS is also the only provider that writes down what happens to the
        calls that do not get through quickly: for the small share that are put
        on hold, it aims for an average wait under 60 seconds. Everyone else is
        silent on queueing, which is the moment a live service is most likely
        to fail you - two callers at once, a lunch rush, a storm.
      </P>
      <H3>A yardstick you can borrow</H3>
      <P>
        There is no published industry standard for answering services that we
        could read at the source. The nearest government benchmark is the one
        Medicare sets for the call centers of its Part D drug plans. Under{" "}
        <Ext href="https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-423/subpart-C/section-423.128">
          42 CFR 423.128
        </Ext>{" "}
        those call centers must answer 80 percent of incoming calls within 30
        seconds, keep the average hold time to 2 minutes, and keep the
        disconnect rate to 5 percent. It does not apply to answering services.
        It is useful because it is concrete: if a provider will not commit to
        something at least that specific, you are buying on trust.
      </P>
      <P>
        Why seconds matter is well documented. In a study of a year of call
        center data, Zohar, Mandelbaum and Shimkin found that callers{" "}
        <Ext href="https://aviman.technion.ac.il/files/References/zohar.pdf">
          adapt their patience to the wait they expect
        </Ext>
        , and that abandonment rose roughly in step with waiting time. A
        prospect calling three businesses from a search page expects to be
        answered, so their patience is short.
      </P>

      <H2 id="price">What it costs at 60 calls a month</H2>
      <P>
        For the full rate cards, see our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          answering service cost comparison
        </Internal>
        . Here we take one assumed small business - 60 calls a month, each with
        2 minutes 10 seconds of talk time - and price it on each published
        plan, applying each provider&apos;s own rounding rule. The assumption
        is ours, not a benchmark. We count talk time only, which flatters the
        providers that also bill wrap-up time.
      </P>
      <Table
        caption="60 calls of 2 minutes 10 seconds, priced from published plans (our calculation, October 5, 2026)"
        head={["Provider", "How a call is rounded", "Billed minutes", "Cheapest published fit", "Monthly"]}
        rows={[
          ["Signius", "Not published", "130 to 180", "125-minute plan at $170 + overage at $1.25", "$176.25 to $238.75"],
          ["MAP Communications", "Not published", "130 to 180", "125-minute plan at $179 + overage at $1.30", "$185.50 to $250.50"],
          ["Specialty Answering Service", "By the second", "130", "100-minute plan at $159 + 30 min at $1.44", "$202.20"],
          ["AMBS Call Center", "Up to 30 seconds", "150", "100-minute plan at $149 + 50 min at $1.29", "$213.50, plus $85 once"],
          ["PATLive", "First minute, then 6 seconds", "132", "100-minute plan at $189 + 32 min at $2.09", "$255.88"],
          ["AnswerConnect", "Up to the whole minute", "180", "200-minute plan at $350", "$350, plus $49.99 once"],
          ["Moneypenny US", "Up to 30 seconds, after wrap-up", "150 or more", "100-minute plan at $265 + 50 min at $2.12", "$371 or more"],
          ["Abby Connect", "Not published", "130 to 180", "100-minute plan at $329 + overage at the plan rate", "$427.70 to $592.20"],
          ["Smith.ai", "Per call, not per minute", "60 calls", "30-call plan at $300 + 30 calls at $11.50", "$645"],
          ["Ruby", "Not published", "130 to 180", "200-minute plan (100-minute overage not published)", "$720"],
        ]}
      />
      <P>What falls out of it:</P>
      <UL>
        <LI>
          <Strong>Rounding is a pricing decision.</Strong> A 2-minute 10-second
          call is 130 billed seconds at Specialty Answering Service and 180 at
          AnswerConnect. Across a month that is 50 extra minutes for the same
          calls.
        </LI>
        <LI>
          <Strong>An unpublished increment is a $60 to $165 question.</Strong>{" "}
          The Signius, MAP and Abby ranges are as wide as they are only because
          their pricing pages do not say how a call is rounded. One email
          settles it.
        </LI>
        <LI>
          <Strong>Pay-as-you-go is a trap above a few calls.</Strong> The $44
          to $49 entry plans look cheapest, but at $1.35 to $2.99 a minute they
          overtake a bundle quickly: PATLive&apos;s $49 plan would cost $443.68
          for these calls, against $255.88 on its 100-minute plan.
        </LI>
        <LI>
          <Strong>The totals are a floor.</Strong> Add wrap-up time where it is
          billed, patching fees, taxes and any one-time setup fee.
        </LI>
      </UL>

      <H2 id="economics">Why a human minute costs what it does</H2>
      <P>
        At the published rates, a live agent&apos;s time costs a client
        between about $1.20 and $3.95 a minute, or $72 to $237 an hour. The
        people doing the work earn a fraction of that. The Bureau of Labor
        Statistics&apos; May 2025 data puts the{" "}
        <Ext href="https://www.bls.gov/oes/current/naics4_561400.htm">
          median wage of customer service representatives in business support
          services
        </Ext>{" "}
        - the industry group that includes telephone answering services - at
        $17.68 an hour.
      </P>
      <P>
        That gap is not profit, and reading it as such would be unfair. A
        provider pays agents for every minute they are logged in, including
        the minutes between calls, and it has to staff for peaks it cannot
        bill for, plus benefits, training, telephony, software and overnight
        shifts. The gap is the cost of having a person ready when your phone
        rings, which is precisely what you are buying. It also explains two
        things you will notice when shopping: why every provider bills by the
        minute or the call rather than a flat fee, and why the cheapest plans
        are the ones that round each call upward.
      </P>
      <P>
        For scale, the Census Bureau&apos;s Service Annual Survey puts{" "}
        <Ext href="https://fred.stlouisfed.org/series/REVEF561421ALLEST">
          revenue of telephone answering services at $2.56 billion in 2022
        </Ext>
        , the latest year published. It is an industry of many small and
        mid-sized operators, which is why quality varies as much as it does.
      </P>

      <H2 id="trial">How to test one in a free trial</H2>
      <P>
        Since most providers do not publish answer speed or queue behaviour,
        the trial is where you find them out. PATLive and Specialty Answering
        Service publish 14-day trials, Signius 7 days, and Abby Connect a trial
        on every plan. Set it up properly first - forwarding your line is a
        five-minute job described in our{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          call forwarding guide
        </Internal>{" "}
        - then place ten calls from a phone the agents will not recognise.
      </P>
      <Figure
        src="/blog/live-answering-trial-test-calls.svg"
        alt="A test plan of ten calls in three groups. Timing: 8:58 a.m., 12:15 p.m., 2:10 a.m., Saturday afternoon, and two calls at the same second. Script: a price the script does not contain, an urgent situation, and a request for Spanish. Delivery: one routine message timed from hang-up to arrival. For each call, record seconds to a human, seconds on hold, whether the name and number were captured correctly, and billed minutes"
        width={1200}
        height={630}
        caption="Ten calls, spread across the trial, tell you more than any sales demo. Keep the four numbers for each one in a spreadsheet."
        credit="Illustration by AI Receptionist Now"
      />
      <OL>
        <LI>
          <Strong>Time the pickup on the busy and the dead hours.</Strong> Just
          before opening, over lunch, at 2 a.m. and on a Saturday. Use a
          stopwatch from the first ring.
        </LI>
        <LI>
          <Strong>Call from two phones at the same second.</Strong> This is the
          queue test. Note whether the second caller holds, rings out or hears a
          recording, and for how long.
        </LI>
        <LI>
          <Strong>Ask for something the script does not cover</Strong>, such as
          a price. A good agent takes a message; a weak one improvises an
          answer you will later have to honour or correct.
        </LI>
        <LI>
          <Strong>Describe something urgent</Strong> by your own definition - a
          burst pipe, a client in custody, a patient who feels worse - and see
          whether your escalation actually fires. Our{" "}
          <Internal href="/blog/24-hour-answering-service#emergency-escalation">
            emergency escalation guide
          </Internal>{" "}
          covers how to write that rule.
        </LI>
        <LI>
          <Strong>Ask for Spanish</Strong> if you serve Spanish speakers, at an
          off-peak hour as well as a peak one. Several providers include it, but
          few publish the hours. Our{" "}
          <Internal href="/blog/bilingual-answering-service">
            bilingual answering service guide
          </Internal>{" "}
          has the details.
        </LI>
        <LI>
          <Strong>Audit the invoice.</Strong> Compare billed minutes against
          your own call log for the ten calls. It takes twenty minutes and it
          tells you how the provider really rounds.
        </LI>
      </OL>
      <Callout>
        Be fair to the provider: one slow call is noise. A pattern across ten
        calls - slow every evening, a second caller always sent to voicemail,
        names spelled wrong - is information.
      </Callout>

      <H2 id="live-or-ai">When live is worth it, and when it is not</H2>
      <P>
        We sell the alternative, so take this section with that in mind. We
        think a live service is the right choice when:
      </P>
      <UL>
        <LI>
          <Strong>Calls need judgement or empathy</Strong> that cannot be
          written down in advance: distressed callers, sensitive intake, a
          caller who needs talking down rather than a message taken.
        </LI>
        <LI>
          <Strong>Your callers expect a person</Strong> and would judge the
          business by it, and your volume is modest enough that per-minute
          billing stays affordable.
        </LI>
        <LI>
          <Strong>You need a call patched through</Strong> to you live while
          the caller waits. Many live services do this; our product does not.
          We save the message, text it to you, and can ring your phone for a
          call marked urgent, but we do not connect the caller to you
          mid-conversation.
        </LI>
      </UL>
      <P>
        An AI receptionist is usually the better buy when most calls are
        routine - booking, rescheduling, hours, directions, a message for the
        owner - and when volume or after-hours share makes per-minute pricing
        expensive. Our Solo plan is 99 euros a month for 1,000 minutes and
        answers one call at a time; the Team plan answers three at once (
        <Internal href="/pricing">pricing</Internal>). Software does not
        improvise kindly, though: it only knows what you have written down, and
        it is worse than a good human at an unusual call. The common
        compromise is both - software for routine calls, a person for anything
        flagged - and our{" "}
        <Internal href="/blog/answering-service-for-small-business">
          small business answering service guide
        </Internal>{" "}
        compares the three set-ups side by side.
      </P>

      <H2 id="questions">Seven questions to send before you sign</H2>
      <P>
        Copy them into an email. A provider that answers all seven in writing
        has told you what you are buying.
      </P>
      <OL>
        <LI>
          <Strong>Where are the agents who will answer my calls</Strong>,
          including overnight and on weekends?
        </LI>
        <LI>
          <Strong>Can any of my calls be answered by software?</Strong> If yes,
          which, and can I switch it off?
        </LI>
        <LI>
          <Strong>What is your answer-time target</Strong>, how is it measured,
          and will you report my account&apos;s actual figure monthly?
        </LI>
        <LI>
          <Strong>What happens when every agent is busy</Strong> - hold,
          recording, overflow to another center - and what is the average wait?
        </LI>
        <LI>
          <Strong>How is a call rounded</Strong>, and is wrap-up, hold or
          dialling time billed?
        </LI>
        <LI>
          <Strong>What are the setup fee, the notice period and the billing
          cycle?</Strong>
        </LI>
        <LI>
          <Strong>Can I listen to recordings of my own calls</Strong> during the
          trial?
        </LI>
      </OL>

      <H2 id="not-verified">What we could not verify</H2>
      <UL>
        <LI>
          <Strong>Blocked sites.</Strong> Answering Service Care returned a
          security challenge to every request, and the Association of
          TeleServices International&apos;s site did too, so we could not read
          the criteria of its Award of Excellence at the source. Vendors that
          have won it describe judged test calls; we have not relied on that.
        </LI>
        <LI>
          <Strong>Real answer speeds.</Strong> We did not place test calls to
          these thirteen providers for this article. The speed figures above
          are the providers&apos; own claims, not our measurements.
        </LI>
        <LI>
          <Strong>Voicemail statistics.</Strong> We found no government or
          peer-reviewed figure for the share of callers who refuse to leave a
          voicemail. The numbers that circulate trace back to vendor surveys,
          so we have not used them.
        </LI>
        <LI>
          <Strong>Prices change.</Strong> Everything here was read on October
          5, 2026. Nexa publishes no prices at all.
        </LI>
      </UL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
