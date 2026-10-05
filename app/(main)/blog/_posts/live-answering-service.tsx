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
  readingTime: "7 min read",
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
    { id: "promises", title: "What 13 providers put in writing" },
    { id: "speed", title: "Answer speed and hold" },
    { id: "price", title: "What 60 calls a month cost" },
    { id: "ai", title: "Is any of it AI?" },
    { id: "trial", title: "Test it in the free trial" },
    { id: "questions", title: "Seven questions before you sign" },
    { id: "live-or-ai", title: "When live is worth it" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "How much does a live answering service cost?",
      a: "On pricing pages read on October 5, 2026, pay-as-you-go plans start at $44 to $49 a month plus $1.35 to $2.99 a minute, and bundles run $149 to $395 for about 100 minutes. For 60 calls a month of 2 minutes 10 seconds each, the cheapest published fit ranged from about $176 (Signius) to $720 (Ruby), partly because providers round each call differently.",
    },
    {
      q: "How fast does a live answering service pick up?",
      a: "Most do not say. Of 13 providers we checked, only Ruby (average under 10 seconds), AnswerConnect (99% within one to four rings) and AMBS Call Center (80% or more in three rings) publish a speed claim, and only AMBS publishes a hold target (an average under 60 seconds). Measure the rest during a free trial.",
    },
    {
      q: "Are live answering service agents based in the US?",
      a: "Ruby, PATLive, Abby Connect, Signius, MAP Communications and Moneypenny US say so in writing, and Smith.ai says it uses no overseas agents. AnswerConnect, Specialty Answering Service, Nexa and Davinci do not state where agents sit. If it matters, put it in the contract.",
    },
    {
      q: "Do live answering services use AI?",
      a: "Some do. Ruby says a human always picks up and AI assists in the background; Abby Connect lets you choose human, AI or a mix per call type; AMBS and Moneypenny sell AI as separate plans; AnswerConnect pledges to keep every interaction human. Ask for the answer in writing.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  { title: "Ruby: pricing", url: "https://www.ruby.com/pricing/" },
  { title: "Ruby: FAQ (answer time, AI, bilingual)", url: "https://www.ruby.com/faq/" },
  { title: "Ruby: FAQs (money-back guarantee, month-to-month)", url: "https://www.ruby.com/faqs/" },
  { title: "PATLive: pricing (trial, pay-as-you-go, Spanish)", url: "https://www.patlive.com/pricing/" },
  { title: "PATLive: FAQ (US-based, cancellation)", url: "https://www.patlive.com/faq/" },
  { title: "AnswerConnect: homepage (answer speed, human-only pledge)", url: "https://www.answerconnect.com/" },
  { title: "AnswerConnect: plans (price, setup fee, rounding)", url: "https://www.answerconnect.com/plans-direct" },
  { title: "Abby Connect: pricing (plans, human/AI mix, trial)", url: "https://www.abby.com/pricing/" },
  { title: "Smith.ai: receptionist pricing", url: "https://smith.ai/pricing/receptionists" },
  { title: "Specialty Answering Service: pricing", url: "https://www.specialtyansweringservice.net/pricing/" },
  { title: "AMBS Call Center: pricing (answer speed, hold target, rounding)", url: "https://www.ambscallcenter.com/pricing" },
  { title: "Signius: pricing", url: "https://signius.com/pricing/" },
  { title: "MAP Communications: pricing", url: "https://www.mapcommunications.com/pricing/" },
  { title: "Nexa: pricing", url: "https://www.nexa.com/pricing" },
  { title: "Moneypenny US: pricing", url: "https://www.moneypenny.com/us/pricing/" },
  {
    title: "Moneypenny US terms and conditions (wrap-up time, 30-second rounding)",
    url: "https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf",
  },
  { title: "Davinci Virtual: live receptionist plans", url: "https://www.davincivirtual.com/live-receptionist" },
  {
    title: "42 CFR 423.128 - call center standards for Medicare Part D plan sponsors (eCFR)",
    url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-423/subpart-C/section-423.128",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every live answering service promises real people, around the clock,
        fast. We read what thirteen of them actually commit to on their pricing
        pages, FAQs and terms on October 5, 2026. We sell an AI receptionist,
        so we compete with all of them; every claim below links to the
        provider&apos;s own page so you can check it.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Only <Strong>3 of 13</Strong> publish an answer speed, and only{" "}
            <Strong>1</Strong> says what happens to a caller on hold.
          </>,
          <>
            The same 60 calls cost <Strong>$176 to $720 a month</Strong> on
            published plans. Rounding explains much of the gap.
          </>,
          <>
            &quot;Live&quot; no longer means &quot;no software&quot;. Get the
            answer in writing.
          </>,
        ]}
      />

      <H2 id="promises">What 13 providers put in writing</H2>
      <P>
        &quot;Not published&quot; means we looked and it is not on the page.
        Answering Service Care blocked our requests, so it is missing. Every
        provider claims 24/7 coverage, so that column is left out.
      </P>
      <Table
        caption="Commitments on each provider's own pages (checked October 5, 2026)"
        head={["Provider", "Where agents are", "Answer speed", "Spanish", "Contract / trial"]}
        rows={[
          [
            <Ext key="ruby" href="https://www.ruby.com/faq/">Ruby</Ext>,
            "US-based",
            "Average under 10 seconds",
            "Bilingual, 24/7",
            "Month-to-month; refund within 21 days or 500 minutes",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/faq/">PATLive</Ext>,
            "All in the US (Florida)",
            "Not published",
            "Included",
            "Cancel anytime; 14-day trial",
          ],
          [
            <Ext key="ac" href="https://www.answerconnect.com/">AnswerConnect</Ext>,
            "Home-based; country not stated",
            "99% within 1 to 4 rings",
            "Not published",
            "Change anytime; no trial published",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/pricing/">Abby Connect</Ext>,
            "US team, Las Vegas",
            "Not published",
            "Included",
            "Month-to-month; free trial",
          ],
          [
            <Ext key="smith" href="https://smith.ai/pricing/receptionists">Smith.ai</Ext>,
            "“No overseas agents”",
            "Not published",
            "Spanish line, $1.00",
            "Month-to-month; 30-day refund, overage excluded",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/pricing/">Specialty Answering Service</Ext>,
            "US company; operators not stated",
            "Not published",
            "Available",
            "Month-to-month; 14-day trial",
          ],
          [
            <Ext key="ambs" href="https://www.ambscallcenter.com/pricing">AMBS Call Center</Ext>,
            "“100% U.S.-based” and “vast majority” on the same page",
            "80%+ in 3 rings",
            "Bilingual",
            "Not on the pricing page",
          ],
          [
            <Ext key="sig" href="https://signius.com/pricing/">Signius</Ext>,
            "100% US-based",
            "Not published",
            "Medical service only",
            "Month-to-month; 7-day trial",
          ],
          [
            <Ext key="map" href="https://www.mapcommunications.com/pricing/">MAP Communications</Ext>,
            "US-based",
            "Not published",
            "Included",
            "No long-term contract",
          ],
          [
            <Ext key="nexa" href="https://www.nexa.com/pricing">Nexa</Ext>,
            "Not published",
            "Not published",
            "Bilingual",
            "Not published; no prices",
          ],
          [
            <Ext key="mp" href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>,
            "“Based in America”",
            "Not published",
            "Bilingual",
            "No contract; 30 days' notice",
          ],
          [
            <Ext key="dv" href="https://www.davincivirtual.com/live-receptionist">Davinci Virtual</Ext>,
            "Not stated",
            "Not published",
            "Not published",
            "No long-term commitment",
          ],
        ]}
      />

      <H2 id="speed">Answer speed and hold</H2>
      <P>
        The three speed claims are measured three ways - an average, a ring
        count for 99% of calls, a ring count for 80% - so they cannot be
        compared with each other, and none is a guarantee. AMBS is the only
        provider that says what happens to queued calls: an average hold under
        60 seconds. The rest are silent on the moment a live service is most
        likely to fail you: two callers at once.
      </P>
      <P>
        If you want a concrete number to put in a contract, borrow one. Medicare
        requires the call centers of its Part D plans to answer 80% of calls
        within 30 seconds, keep average hold to 2 minutes and keep the
        disconnect rate to 5% (
        <Ext href="https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-423/subpart-C/section-423.128">
          42 CFR 423.128
        </Ext>
        ). It does not apply to answering services; it is simply the most
        specific public standard we found.
      </P>
      <Figure
        src="/blog/live-answering-floor-night.webp"
        alt="An answering-service floor in the middle of the night, with long rows of empty desks and headsets resting on them, and two operators working far away at the back"
        width={1376}
        height={768}
        caption="Nobody publishes overnight staffing levels, and the night is when a queue is most likely."
      />

      <H2 id="price">What 60 calls a month cost</H2>
      <P>
        One assumed small business: 60 calls a month, 2 minutes 10 seconds of
        talk each. Each provider&apos;s own rounding rule is applied, talk time
        only. Full rate cards are in our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          cost comparison
        </Internal>
        .
      </P>
      <Table
        caption="60 calls of 2 min 10 s on published plans (our calculation, October 5, 2026)"
        head={["Provider", "Rounding", "Billed minutes", "Cheapest fit", "Monthly"]}
        rows={[
          ["Signius", "Not published", "130-180", "125 min for $170 + $1.25/min", "$176.25-$238.75"],
          ["MAP Communications", "Not published", "130-180", "125 min for $179 + $1.30/min", "$185.50-$250.50"],
          ["Specialty Answering Service", "Per second", "130", "100 min for $159 + $1.44/min", "$202.20"],
          ["AMBS Call Center", "Up to 30 s", "150", "100 min for $149 + $1.29/min", "$213.50 + $85 once"],
          ["PATLive", "First minute, then 6 s", "132", "100 min for $189 + $2.09/min", "$255.88"],
          ["AnswerConnect", "Up to a whole minute", "180", "200 min for $350", "$350 + $49.99 once"],
          ["Moneypenny US", "Up to 30 s, after wrap-up", "150+", "100 min for $265 + $2.12/min", "$371+"],
          ["Abby Connect", "Not published", "130-180", "100 min for $329 + $3.29/min", "$427.70-$592.20"],
          ["Smith.ai", "Per call", "60 calls", "30 calls for $300 + $11.50/call", "$645"],
          ["Ruby", "Not published", "130-180", "200 min (smaller plan's overage not published)", "$720"],
        ]}
      />
      <UL>
        <LI>
          <Strong>Rounding is a pricing decision.</Strong> The same call is 130
          billed seconds at Specialty Answering Service and 180 at
          AnswerConnect.
        </LI>
        <LI>
          <Strong>An unpublished increment is worth an email.</Strong> It is the
          only reason the Signius, MAP and Abby ranges are $60 to $165 wide.
        </LI>
        <LI>
          <Strong>Pay-as-you-go stops being cheap fast.</Strong> PATLive&apos;s
          $49 plan would cost $443.68 here, against $255.88 on its 100-minute
          plan.
        </LI>
      </UL>

      <H2 id="ai">Is any of it AI?</H2>
      <P>
        Most of these companies now sell AI too, and they draw the line
        differently.{" "}
        <Ext href="https://www.ruby.com/faq/">Ruby</Ext>: a human always picks
        up, AI assists in the background.{" "}
        <Ext href="https://www.abby.com/pricing/">Abby Connect</Ext>: you choose
        human, AI or a mix per call type.{" "}
        <Ext href="https://www.ambscallcenter.com/pricing">AMBS</Ext> and{" "}
        <Ext href="https://www.moneypenny.com/us/pricing/">Moneypenny</Ext>: AI
        is a separate plan.{" "}
        <Ext href="https://www.answerconnect.com/">AnswerConnect</Ext>:
        &quot;we pledge to keep every customer interaction human&quot;. If a
        human voice is what you are paying for, put it in the contract.
      </P>

      <H2 id="trial">Test it in the free trial</H2>
      <P>
        PATLive and Specialty Answering Service publish 14-day trials, Signius
        7 days, Abby Connect a trial on every plan. Set up forwarding (
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          how-to
        </Internal>
        ), then place these ten calls from a number the agents will not
        recognise.
      </P>
      <Figure
        src="/blog/live-answering-trial-test-calls.svg"
        alt="A test plan of ten calls in three groups. Timing: 8:58 a.m., 12:15 p.m., 2:10 a.m., Saturday afternoon, and two calls at the same second. Script: a price the script does not contain, an urgent situation, and a request for Spanish. Delivery: one routine message timed from hang-up to arrival. For each call, record seconds to a human, seconds on hold, whether the name and number were captured correctly, and billed minutes"
        width={1200}
        height={630}
        caption="One slow call is noise. A pattern across ten is information."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        At the end, compare the billed minutes on the invoice with your own
        call log for those ten calls. It takes twenty minutes and shows how the
        provider really rounds.
      </P>

      <H2 id="questions">Seven questions before you sign</H2>
      <OL>
        <LI>Where are the agents who will answer my calls, including overnight?</LI>
        <LI>Can any of my calls be answered by software, and can I switch it off?</LI>
        <LI>What is your answer-time target, and will you report my actual figure monthly?</LI>
        <LI>What does a caller hear when every agent is busy, and for how long on average?</LI>
        <LI>How is a call rounded, and are wrap-up, hold or dialling billed?</LI>
        <LI>What are the setup fee, notice period and billing cycle?</LI>
        <LI>Can I hear recordings of my own calls during the trial?</LI>
      </OL>

      <H2 id="live-or-ai">When live is worth it</H2>
      <P>
        We sell the alternative, so weigh this accordingly. A live service is
        the better buy when calls need judgement or empathy that cannot be
        scripted, when your callers expect a person, or when you need a caller
        patched through to you while they wait - which our product does not do
        (it takes the message, texts you, and can ring you for urgent calls).
        AI is the better buy when most calls are routine bookings and messages
        and per-minute billing is getting expensive: our Solo plan is 99 euros
        a month for 1,000 minutes, one call at a time; Team is 299 euros, three
        at a time (<Internal href="/pricing">pricing</Internal>). Many
        businesses use software for routine calls and a person for anything
        flagged.
      </P>
      <P>
        <Strong>Not verified:</Strong> we did not place test calls to these
        providers; speed figures are their own claims. Prices change - check
        the linked pages.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
