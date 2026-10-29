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
  Callout,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "outsourced-receptionist",
  title: "Outsourced Receptionist vs Hiring: The Cost and Break-Even Math",
  description:
    "A US receptionist costs about $4,611 a month with benefits. We priced outsourced receptionist plans from 8 rate cards and found where each costs as much as a hire.",
  date: "2026-10-29",
  updated: "2026-10-29",
  readingTime: "9 min read",
  tag: "Guides",
  hero: "/blog/outsourced-receptionist-empty-desk.webp",
  heroAlt:
    "The front desk of a small professional office in daylight, with an empty receptionist chair pushed in, a desk phone, a pen cup, a visitor sign-in clipboard and a service bell on the counter, and empty waiting-room chairs behind",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "outsourced receptionist",
    "outsourced reception",
    "outsource receptionist",
    "outsourced receptionist services",
    "outsourcing receptionist",
    "outsourced receptionist cost",
    "hire a receptionist or outsource",
  ],
  sections: [
    { id: "what-it-is", title: "What an outsourced receptionist is (and is not)" },
    { id: "hire-cost", title: "What a hire really costs" },
    { id: "outsource-cost", title: "What outsourcing costs at 100, 300 and 600 calls" },
    { id: "break-even", title: "Where they break even" },
    { id: "trade-offs", title: "What you give up, what you gain" },
    { id: "contract", title: "Eight things to check in the contract" },
    { id: "hybrid", title: "The setup most small offices end up with" },
    { id: "ai", title: "Where an AI receptionist fits" },
    { id: "method", title: "How we calculated this" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is an outsourced receptionist?",
      a: "An outsourced receptionist is a person or service outside your company that answers your business phone calls in your company's name, usually through call forwarding. They greet callers, take messages, book appointments or transfer calls, and bill by the minute, by the call or by the month. They do not work at your front desk, so they cannot greet visitors or handle mail.",
    },
    {
      q: "How much does an outsourced receptionist cost?",
      a: "On plans published on October 29, 2026, 100 calls a month of 2 minutes 10 seconds each cost about $389 (PATLive), $542 (Moneypenny US) or $915 (Smith.ai) with live people, and $199 on Moneypenny's AI plan. Entry plans start at $25 to $300 a month, but overage rates, rounding and wrap-up time decide the real bill.",
    },
    {
      q: "Is it cheaper to outsource a receptionist or hire one?",
      a: "For phone answering alone, outsourcing is cheaper at most small-business volumes. A full-time receptionist at the US median wage costs about $4,611 a month including benefits. In our model, Smith.ai's per-call plans reach that cost at about 596 calls a month, Moneypenny US at about 894 and PATLive at about 1,453. A hire who also does admin or greets visitors is a different comparison.",
    },
    {
      q: "Can an outsourced receptionist work at my front desk?",
      a: "No. Outsourced receptionist services answer phones, chats and sometimes email remotely. If you need someone physically at the desk, the options are a hire, a part-time hire or a temp from a staffing agency; many offices keep one person on site and outsource the overflow, lunch hour and after-hours calls.",
    },
    {
      q: "What should I check before signing with an outsourced receptionist service?",
      a: "How each call is rounded, whether wrap-up or hold time is billed, the overage rate once your plan runs out, whether spam calls are charged, the notice period, the refund terms, where the agents are based, and whether some calls are answered by AI. Moneypenny US, for example, bills up to 180 seconds of wrap-up per call and rounds to 30 seconds.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "BLS Occupational Outlook Handbook: Receptionists (median pay, May 2025)",
    url: "https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm",
  },
  {
    title: "BLS: Employer Costs for Employee Compensation, June 2026 (released September 9, 2026)",
    url: "https://www.bls.gov/news.release/ecec.nr0.htm",
  },
  {
    title: "BLS: ECEC Table 4 - private industry by occupational group, June 2026",
    url: "https://www.bls.gov/news.release/ecec.t04.htm",
  },
  { title: "PATLive: pricing", url: "https://www.patlive.com/pricing/" },
  { title: "PATLive: FAQ (billing increments, US-based)", url: "https://www.patlive.com/faq/" },
  { title: "Moneypenny US: pricing (receptionist and AI plans)", url: "https://www.moneypenny.com/us/pricing/" },
  {
    title: "Moneypenny US: terms and conditions (wrap-up time, 30-second rounding)",
    url: "https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf",
  },
  { title: "Smith.ai: receptionist pricing", url: "https://smith.ai/pricing/receptionists" },
  { title: "Smith.ai: AI receptionist pricing", url: "https://smith.ai/pricing/ai-receptionist" },
  { title: "Ruby: pricing", url: "https://www.ruby.com/pricing/" },
  { title: "Abby Connect: pricing", url: "https://www.abby.com/pricing/" },
  { title: "Davinci Virtual: live receptionist plans", url: "https://www.davincivirtual.com/live-receptionist" },
  { title: "ReceptionHQ (US): pricing", url: "https://www.receptionhq.com/pricing/" },
];

export default function Body() {
  return (
    <>
      <Lead>
        An outsourced receptionist is a service outside your company that
        answers your phone in your company&apos;s name, usually through call
        forwarding, and bills by the minute, the call or the month. The
        question behind most searches for one is simpler: is it cheaper than
        hiring? We worked it out from US government wage data and eight
        published rate cards, read on October 29, 2026. We sell an AI
        receptionist, so we compete with every service below; each price links
        to the provider&apos;s own page so you can check it.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            A full-time receptionist at the US median wage costs about{" "}
            <Strong>$4,611 a month</Strong>{" "}once benefits are added, and covers
            40 of the week&apos;s 168 hours.
          </>,
          <>
            At 100 calls a month, live outsourcing costs{" "}
            <Strong>$389 to $915</Strong>{" "}on published plans; Moneypenny&apos;s
            AI plan costs $199.
          </>,
          <>
            Per-call plans reach the cost of a hire at about{" "}
            <Strong>600 calls a month</Strong>, per-minute plans at about{" "}
            <Strong>900 to 1,450</Strong>.
          </>,
          <>
            No outsourced service can greet a visitor. If the job includes the
            front desk, compare only the phone half.
          </>,
        ]}
      />

      <H2 id="what-it-is">What an outsourced receptionist is (and is not)</H2>
      <P>
        You forward your business number to the service. Its receptionists, or
        its software, answer with your greeting, follow a script you agree on,
        and send you the message, book the appointment or transfer the call.
        There are three ways to buy it:
      </P>
      <Table
        caption="Three outsourced receptionist models"
        head={["Model", "How it bills", "Examples (prices below)", "Best for"]}
        rows={[
          [
            "Shared live receptionists",
            "Per minute or per call, in monthly bundles",
            "PATLive, Moneypenny US, Smith.ai, Ruby, Abby Connect, Davinci, ReceptionHQ",
            "Calls that need a person's judgement",
          ],
          [
            "AI receptionist",
            "Per call or a monthly minute allowance",
            "Moneypenny AI, Smith.ai AI, ours",
            "Routine bookings, messages, after hours",
          ],
          [
            "Dedicated remote assistant",
            "Hourly, through a staffing or VA agency",
            "Not priced here: we found no rate card we could verify",
            "One person who learns your business",
          ],
        ]}
      />
      <P>
        What none of them do is sit at your desk. Visitors, deliveries, mail,
        the coffee machine and the printer stay with you. If those are a real
        part of the job, the honest comparison is not &quot;hire versus
        outsource&quot; but &quot;one hire versus one hire plus a service for
        the calls they miss&quot;. We come back to that{" "}
        <Internal href="#hybrid">below</Internal>.
      </P>

      <H2 id="hire-cost">What a hire really costs</H2>
      <P>
        The median US receptionist earned{" "}
        <Strong>$18.27 an hour, or $38,010 a year</Strong>, in May 2025 (
        <Ext href="https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm">
          Bureau of Labor Statistics
        </Ext>
        ). Wages are not the whole cost. In June 2026, wages were 68.7% of what
        private employers spent per hour on office and administrative support
        staff; the other 31.3% was paid leave, insurance, retirement and
        legally required payments such as Social Security and unemployment
        insurance (
        <Ext href="https://www.bls.gov/news.release/ecec.t04.htm">BLS ECEC, table 4</Ext>
        ).
      </P>
      <Table
        caption="A full-time receptionist at the US median, with benefits (our calculation from BLS data)"
        head={["Item", "Per year", "Per month"]}
        rows={[
          ["Median wage (2,080 hours)", "$38,010", "$3,168"],
          ["Benefits and legally required costs (31.3% of total)", "$17,318", "$1,443"],
          [<Strong key="t">Total employer cost</Strong>, <Strong key="y">$55,328</Strong>, <Strong key="m">$4,611</Strong>],
        ]}
      />
      <P>Three things this number does not show:</P>
      <UL>
        <LI>
          <Strong>It may be a little high.</Strong>{" "}The 31.3% is an average for
          all office and administrative support staff. A receptionist at a
          small business may get fewer benefits; the legally required part
          alone was 7.0% of compensation.
        </LI>
        <LI>
          <Strong>It leaves out real costs.</Strong>{" "}Recruiting, training,
          a desk, a phone line and cover for holidays and sick days are not in
          it.
        </LI>
        <LI>
          <Strong>It buys 40 hours a week.</Strong>{" "}That is 24% of the week. The
          other 128 hours, plus lunch, go to voicemail unless someone else
          picks up. And one receptionist answers one call at a time; the second
          caller waits or hangs up.
        </LI>
      </UL>

      <H2 id="outsource-cost">What outsourcing costs at 100, 300 and 600 calls</H2>
      <P>
        We modelled three small businesses: 100, 300 and 600 calls a month,
        roughly 5, 14 and 28 calls each weekday. Each call is 2 minutes 10
        seconds of talk. For every provider we picked the cheapest published
        plan for that volume, added its published overage rate and applied its
        own rounding rule. Prices are monthly, in US dollars, before tax.
      </P>
      <Table
        caption="Monthly cost on published plans, October 29, 2026 (our calculation)"
        head={["Provider", "Bills by", "100 calls", "300 calls", "600 calls"]}
        rows={[
          [
            <Ext key="pat" href="https://www.patlive.com/pricing/">PATLive</Ext>,
            "Minute: first minute in full, then 6 s",
            "$388.80",
            "$1,045.40",
            "$2,039.80",
          ],
          [
            <Ext key="mp" href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>,
            "Minute: 30 s, plus wrap-up",
            "$541.50+",
            "$1,507.50+",
            "$3,075.00+",
          ],
          [
            <Ext key="smith" href="https://smith.ai/pricing/receptionists">Smith.ai</Ext>,
            "Call (spam not charged)",
            "$915.00",
            "$2,100.00",
            "$4,650.00",
          ],
          [
            <Ext key="mpai" href="https://www.moneypenny.com/us/pricing/">Moneypenny US, AI plan</Ext>,
            "Call",
            "$199.00",
            "$529.50",
            "$944.00",
          ],
          [
            <Strong key="hire">Full-time hire (median)</Strong>,
            "Salary + benefits",
            "$4,611",
            "$4,611",
            "$4,611",
          ],
        ]}
      />
      <P>
        The &quot;+&quot; on Moneypenny is wrap-up time: its terms bill the
        time an operator spends finishing your message after the caller hangs
        up, capped at 180 seconds a call, and round the total up to 30 seconds (
        <Ext href="https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf">
          Moneypenny US terms
        </Ext>
        ). We could not know how much wrap-up your calls would carry, so we
        left it out. PATLive bills &quot;the first minute in full, and then
        each 10th of a minute thereafter&quot; (
        <Ext href="https://www.patlive.com/faq/">PATLive FAQ</Ext>), which
        makes our 2 minute 10 second call 2.2 billed minutes.
      </P>

      <H3>Four more services we could not model fully</H3>
      <P>
        These publish a monthly price but not everything needed to price a
        real month, so they are not in the table. We would rather leave them
        out than guess.
      </P>
      <UL>
        <LI>
          <Ext href="https://www.ruby.com/pricing/">Ruby</Ext>: $250 for 50
          minutes, $395 for 100, $720 for 200, $1,725 for 500. No overage rate
          or rounding rule on the page.
        </LI>
        <LI>
          <Ext href="https://www.abby.com/pricing/">Abby Connect</Ext>: $164
          for 50 minutes, $329 for 100, $599 for 200, $1,380 for 500. Overage
          is &quot;billed at your plan&apos;s Abby Minute rate&quot; with no
          dollar figure; AI minutes count half.
        </LI>
        <LI>
          <Ext href="https://www.davincivirtual.com/live-receptionist">Davinci Virtual</Ext>:
          $129 for 50 minutes up to $319 for 100 on its Premium plan. No
          overage rate or billing increment published.
        </LI>
        <LI>
          <Ext href="https://www.receptionhq.com/pricing/">ReceptionHQ</Ext>{" "}
          (US): plans &quot;from $25&quot; a month, plus $1.99 per call on its
          message-taking plan; included calls per tier are not stated.
        </LI>
      </UL>

      <H2 id="break-even">Where they break even</H2>
      <Figure
        src="/blog/outsourced-receptionist-cost-vs-hire.svg"
        alt="Line chart of monthly cost against calls per month, from 0 to 1,500. A full-time receptionist at the US median wage plus benefits is a flat line at about $4,611. Smith.ai's per-call human plans cross it at about 596 calls a month, Moneypenny US per-minute plans at about 894, PATLive per-minute plans at about 1,453. Moneypenny's AI plan stays under $2,500 across the range"
        width={1200}
        height={630}
        caption="Same assumptions as the table: 2 min 10 s per call, each provider's rounding, wrap-up left out."
        credit="Chart by AI Receptionist Now from published prices and BLS data"
      />
      <P>
        Raising the call count until each outsourced plan costs as much as the
        $4,611 hire gives three break-even points:
      </P>
      <UL>
        <LI>
          <Strong>Smith.ai (per call): about 596 calls a month</Strong>, or 27
          per weekday.
        </LI>
        <LI>
          <Strong>Moneypenny US (per minute): about 894 calls</Strong>, or 41
          per weekday, before wrap-up time, which pulls it earlier.
        </LI>
        <LI>
          <Strong>PATLive (per minute): about 1,453 calls</Strong>, or 67 per
          weekday.
        </LI>
      </UL>
      <P>
        Two things move these points a lot. <Strong>Call length:</Strong>{" "}
        per-minute plans get more expensive as calls get longer, per-call plans
        do not, so for long calls Smith.ai&apos;s model catches up.{" "}
        <Strong>What else the hire does:</Strong>{" "}if the receptionist spends
        half the day on admin, only half the $4,611 is the cost of answering
        the phone, and the break-even points halve too.
      </P>
      <Callout>
        At 100 calls a month, the calls themselves are about 3.6 hours of talk.
        A full-time hire is paid for about 173 hours. Below a few hundred calls
        a month, you are not paying a receptionist to talk; you are paying for
        someone to be available, and availability is what outsourcing sells
        more cheaply.
      </Callout>

      <H2 id="trade-offs">What you give up, what you gain</H2>
      <Table
        caption="Hire versus outsourced receptionist, beyond the price"
        head={["", "Your own hire", "Outsourced service"]}
        rows={[
          ["Hours covered", "40 a week, minus lunch, leave and sick days", "Up to 24/7, depending on plan"],
          ["Two calls at once", "Second caller waits or hits voicemail", "Handled by the next free agent or line"],
          ["Knows your business", "Learns it in weeks; remembers regulars", "Only what is in the script and notes"],
          ["Visitors, mail, admin", "Yes", "No"],
          ["Fixing a wrong answer", "A conversation", "A script change, applied by the provider"],
          ["Leaving", "Notice period, then rehiring", "Cancel: 30 days' notice at Moneypenny, end of cycle at Smith.ai"],
        ]}
      />
      <P>
        The biggest risk in outsourcing is not cost but fit: a receptionist
        who answers for dozens of companies knows only what you wrote down. The
        first month will show every gap in your script. Read the messages
        daily during that month and fix the script weekly.
      </P>

      <H2 id="contract">Eight things to check in the contract</H2>
      <OL>
        <LI>
          <Strong>Rounding.</Strong>{" "}Per second, per 6 seconds, per 30 seconds
          or per minute? On a 2 minute 10 second call that is the difference
          between 130 and 180 billed seconds.
        </LI>
        <LI>
          <Strong>Wrap-up and hold.</Strong>{" "}Is time after the caller hangs up
          billed? Moneypenny US says yes, up to 180 seconds.
        </LI>
        <LI>
          <Strong>Overage rate.</Strong>{" "}Ruby, Abby and Davinci do not publish
          one; ask before you need it.
        </LI>
        <LI>
          <Strong>Spam and wrong numbers.</Strong>{" "}Smith.ai does not charge for
          them if your caller ID passes through; ask everyone else.
        </LI>
        <LI>
          <Strong>Notice and refunds.</Strong>{" "}Smith.ai offers a 30-day refund
          on its human plans up to $1,000, overage excluded.
        </LI>
        <LI>
          <Strong>Where the agents sit.</Strong>{" "}PATLive says all its
          receptionists are in the US. If it matters, put it in writing.
        </LI>
        <LI>
          <Strong>Is any call answered by AI?</Strong>{" "}Several live services
          now sell AI as well. If you are paying for a person, say so in the
          contract.
        </LI>
        <LI>
          <Strong>Who owns recordings and messages</Strong>{" "}when you leave, and
          how you export them.
        </LI>
      </OL>
      <P>
        For a longer list of how live services differ on answer speed and
        hold, see{" "}
        <Internal href="/blog/live-answering-service">
          what 13 live answering services promise
        </Internal>
        ; for every rate card side by side, our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost comparison
        </Internal>
        .
      </P>

      <H2 id="hybrid">The setup most small offices end up with</H2>
      <P>
        Outright replacement is rarer than people expect. What works for most
        small offices that already have a receptionist is to keep them and
        outsource the calls they cannot take:
      </P>
      <UL>
        <LI>
          <Strong>Overflow:</Strong>{" "}if the desk does not pick up in 3 or 4
          rings, the call forwards to the service.
        </LI>
        <LI>
          <Strong>Lunch and breaks:</Strong>{" "}the receptionist turns on
          forwarding when they step away.
        </LI>
        <LI>
          <Strong>After hours and weekends:</Strong>{" "}forwarding on a schedule.
        </LI>
      </UL>
      <P>
        All three use the call forwarding your phone system already has (
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          how to set it up
        </Internal>
        ). At low overflow volume this costs a fraction of the table above,
        because you only pay for the calls that would otherwise have been
        missed.
      </P>

      <H2 id="ai">Where an AI receptionist fits</H2>
      <P>
        We sell one, so weigh this accordingly. An AI receptionist is the
        cheapest way to cover availability: it answers every call at once,
        around the clock, and costs the same whether a call comes at 2 p.m. or
        2 a.m. Moneypenny&apos;s AI plan is $199 for 100 calls; Smith.ai has a
        free AI tier of 25 calls and a $150 paid plan (
        <Ext href="https://smith.ai/pricing/ai-receptionist">Smith.ai AI pricing</Ext>
        ). Ours is 99 euros a month for 1,000 minutes on one line, or 299
        euros for 3,000 minutes and three calls at once (
        <Internal href="/pricing">pricing</Internal>). We bill in euros, so
        we left ourselves out of the dollar table rather than pick an exchange
        rate.
      </P>
      <P>
        Where it is the wrong choice: calls that need judgement or comfort
        that a script cannot hold, callers who expect a person, and calls you
        want patched through live while the caller waits, which our product
        does not do; it takes the message, texts it to you and can ring you
        for an urgent one. If most of your calls are bookings, hours, prices
        and messages, it covers them. For the detail, see{" "}
        <Internal href="/blog/can-an-ai-receptionist-replace-a-human-receptionist">
          can an AI receptionist replace a human one
        </Internal>{" "}
        and{" "}
        <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
          AI vs virtual receptionist vs answering service
        </Internal>
        .
      </P>

      <H2 id="method">How we calculated this</H2>
      <UL>
        <LI>
          <Strong>Hire:</Strong>{" "}BLS median annual wage for occupation 43-4171
          (May 2025) divided by 0.687, the wage share of employer costs for
          private-industry office and administrative support workers in June
          2026.
        </LI>
        <LI>
          <Strong>Outsourcing:</Strong>{" "}plans read on each provider&apos;s own
          pricing page on October 29, 2026. For each volume, the cheapest
          published plan plus published overage. Taxes, setup fees and add-ons
          left out.
        </LI>
        <LI>
          <Strong>Calls:</Strong>{" "}2 minutes 10 seconds of talk each, an
          assumption. Your call log will give you your own number; rerun the
          table with it.
        </LI>
        <LI>
          <Strong>Not verified:</Strong>{" "}we did not place test calls, and we
          did not negotiate. Larger plans are often quoted privately, and
          prices change; check the linked pages before you decide.
        </LI>
      </UL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
