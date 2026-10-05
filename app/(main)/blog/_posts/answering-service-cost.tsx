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
  slug: "answering-service-cost",
  title: "How Much Does an Answering Service Cost? 12 Services Compared",
  description:
    "We read 12 answering services' published rate cards: live plans run $149-$395 for 100 minutes, AI plans from about $20/mo. Fees, rounding, and the math.",
  date: "2026-07-25",
  updated: "2026-10-04",
  readingTime: "13 min read",
  tag: "Guides",
  hero: "/blog/answering-service-cost-hero.webp",
  heroAlt:
    "A piggy bank and scattered coins next to a modern desk phone on an office desk - weighing what an answering service costs each month",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "answering service cost",
    "answering service pricing",
    "how much does an answering service cost",
    "answering service rates",
    "cheap answering service",
    "affordable answering service",
    "answering service cost per call",
    "AI answering service cost",
    "answering service pricing comparison",
    "live answering service pricing",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "price-comparison", title: "12 services' published prices" },
    { id: "pricing-models", title: "The pricing models, explained" },
    { id: "hidden-fees", title: "Hidden fees to watch for" },
    { id: "live-vs-ai", title: "Live vs AI, at three volumes" },
    { id: "cost-drivers", title: "What drives the cost up" },
    { id: "roi", title: "ROI vs the cost of a missed call" },
    { id: "too-cheap", title: "When cheap is too cheap" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "How much does an answering service cost per month?",
      a: "Based on the rate cards seven US live answering services publish (checked October 2026), a live service costs $149 to $395 a month for 100 minutes of calls and $600 to $1,725 for 500 minutes - about $1.20 to $5 per minute depending on plan size. AI answering services list plans from about $20 to $300 a month, usually as minute or caller bundles with no after-hours premium. The biggest variable in either case is your monthly call volume, so estimate that before comparing quotes.",
    },
    {
      q: "How much does an answering service cost per call?",
      a: "On per-minute live plans, a typical 3-minute call works out to roughly $3.60 to $15, since published plans cost $1.20 to $5 a minute. Per-call pricing depends on who answers: Smith.ai's human-first receptionists cost $10 a call on the entry plan ($300 for 30 calls) with $8.50 to $11.50 per extra call, while per-call AI plans from Moneypenny and Smith.ai run about $1.90 to $3 a call. AI services sold as minute bundles often land under $1 per call at realistic volumes.",
    },
    {
      q: "Are AI answering services cheaper than live ones?",
      a: "At almost any volume, yes, and the gap widens as volume grows. At around 200 three-minute calls a month, published live per-minute plans come to roughly $720 to $1,725, while published AI plans handle the same calls for about $100 to $420. The reason is structural: a live service pays an operator for every minute, while software answers additional calls at near-zero marginal cost.",
    },
    {
      q: "What hidden fees do answering services charge?",
      a: "The ones vendors actually state in writing: setup fees (AMBS Call Center charges $85; Nexa charges an unpublished amount), call-patching fees ($0.06 to $0.10 a minute at AMBS and Specialty Answering Service), holiday fees (Nexa, on eight named holidays), per-call add-ons such as booking ($1.50 a call at Smith.ai), and billing rules that round each call up to 30 seconds or a whole minute or add wrap-up time. Always ask for the all-in monthly cost at your real volume.",
    },
    {
      q: "Is an answering service worth it for a small business?",
      a: "If you miss calls, usually yes. Run the math: missed calls per month, times a conservative conversion rate, times your average customer value, compared against the monthly fee. For most service businesses, recovering one or two otherwise-missed jobs a month covers the cost several times over. If you already answer essentially every call, the case is much weaker and you shouldn't buy one.",
    },
    {
      q: "What is the cheapest way to answer business calls?",
      a: "Voicemail is free but converts terribly - a large share of callers hang up rather than leave a message and simply call the next business. Among real coverage options, entry-level AI plans are the cheapest: Smith.ai has a free AI tier for 25 calls a month, AMBS Call Center an AI tier from $19, and Rosie $49 for 250 minutes. A cheap live plan with a tiny minute bundle is often the most expensive option once overage kicks in.",
    },
    {
      q: "Which answering service is the cheapest?",
      a: "Among live services that publish prices, AMBS Call Center has the lowest 100-minute plan ($149, plus an $85 setup fee) and the lowest effective rate at 500 minutes ($1.20 a minute). Specialty Answering Service is close behind at $159 for 100 minutes, with per-second billing and no setup fee. For AI, the cheapest entry tiers are Smith.ai's free 25-call plan and AMBS's $19 tier; at a few hundred minutes a month, bundles such as Rosie's $149 for 1,000 minutes or our 99 euros for 1,000 minutes cost far less per minute than any live plan.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "U.S. Bureau of Labor Statistics: Occupational Employment and Wage Statistics - Receptionists and Information Clerks",
    url: "https://www.bls.gov/oes/current/oes434171.htm",
  },
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
    title: "Specialty Answering Service: pricing (checked October 4, 2026)",
    url: "https://www.specialtyansweringservice.net/pricing/",
  },
  {
    title: "AMBS Call Center: answering service and AI receptionist pricing (checked October 4, 2026)",
    url: "https://www.ambscallcenter.com/answering-service-pricing",
  },
  {
    title: "Signius: pricing (checked October 4, 2026)",
    url: "https://www.signius.com/pricing/",
  },
  {
    title: "PATLive: pricing (checked October 4, 2026)",
    url: "https://www.patlive.com/pricing",
  },
  {
    title: "Moneypenny US: people and AI answering pricing (checked October 4, 2026)",
    url: "https://www.moneypenny.com/us/pricing/",
  },
  {
    title: "Abby Connect: pricing (checked October 4, 2026)",
    url: "https://www.abby.com/pricing",
  },
  {
    title: "Ruby: plans and pricing (checked October 4, 2026)",
    url: "https://www.ruby.com/plans-and-pricing/",
  },
  {
    title: "Smith.ai: receptionist pricing, human-first and AI-first (checked October 4, 2026)",
    url: "https://smith.ai/pricing/receptionists",
  },
  {
    title: "Smith.ai: AI receptionist pricing (checked October 4, 2026)",
    url: "https://smith.ai/pricing/ai-receptionist",
  },
  {
    title: "Rosie: pricing (checked October 4, 2026)",
    url: "https://heyrosie.com/pricing",
  },
  {
    title: "Goodcall: pricing (checked October 4, 2026)",
    url: "https://www.goodcall.com/pricing",
  },
  {
    title: "My AI Front Desk: pricing (checked October 4, 2026)",
    url: "https://www.myaifrontdesk.com/pricing",
  },
  {
    title:
      "Moneypenny US terms and conditions (billable operator minutes, wrap-up time, 30-second rounding)",
    url: "https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf",
  },
  {
    title: "Nexa: terms and conditions (whole-minute rounding, set-up and holiday fees)",
    url: "https://www.nexa.com/legal/terms-conditions/",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Full disclosure up front: we sell the AI kind of answering service, so
        we have an obvious rooting interest in how this comparison ends. What
        we can offer instead of neutrality is specificity - the published
        rate cards of 12 answering services, read on their own pricing pages
        on October 4, 2026, the fee structures that decide what you actually
        pay, and the charges that turn a $150 quote into a much larger
        invoice. Use the numbers against any provider, including us.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Published live plans cost <Strong>$149 to $395 for 100
            minutes</Strong> and <Strong>$600 to $1,725 for 500</Strong> -
            the priciest 100-minute plan is 2.65 times the cheapest.
          </>,
          <>
            AI answering services list plans from{" "}
            <Strong>about $20 to $300 a month</Strong>; per-call pricing runs{" "}
            <Strong>$1.90 to $3 a call for AI</Strong> and $8.50 to $11.50 for
            human receptionists.
          </>,
          <>
            The quote is not the bill. <Strong>Rounding, wrap-up time,
            setup and patching fees</Strong> sit in the terms, not on the
            pricing page - one vendor&apos;s own example bills a 62-second
            call as 90 seconds.
          </>,
          <>
            Judge any service against the revenue in your missed calls, not
            against zero - <Strong>one recovered job a month</Strong> usually
            pays for the whole thing.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        <Strong>
          A live answering service costs $149 to $395 a month for 100 minutes
          of calls and $600 to $1,725 for 500 minutes, based on the rate cards
          seven US services publish - about $1.20 to $5 per minute, with the
          smallest plans costing the most per minute. AI answering services
          list plans from about $20 to $300 a month, and per-call plans run
          $1.90 to $3 a call for AI and $8.50 to $11.50 for human
          receptionists.
        </Strong>{" "}
        Where you land inside those ranges depends almost entirely on call
        volume, and secondarily on hours of coverage and how much each call
        involves (message-taking is cheap; intake questions and live transfers
        cost more). For reference against a real number, our own AI plans
        start at{" "}
        <Internal href="/pricing">€99/month for ~1,000 minutes</Internal>. The
        rest of this guide is the rate cards behind those ranges and how they
        are built, because the pricing model you pick matters more than the
        sticker price you see.
      </P>

      <H2 id="price-comparison">
        Answering service pricing comparison: 12 services&apos; published rates
      </H2>
      <P>
        Every number below was read on the vendor&apos;s own pricing page on
        October 4, 2026. We left out anyone who only offers a quote form,
        rather than repeat third-party figures. We compete with all of these
        companies; the links go straight to their pages, and prices change, so
        check before you buy.
      </P>
      <H3>Live answering services (per minute)</H3>
      <Table
        caption="Live answering service plans as published, checked October 4, 2026"
        head={[
          "Service",
          "100-minute plan",
          "500-minute plan",
          "Overage per minute",
          "Billing increment",
          "Setup fee",
        ]}
        rows={[
          [
            <Ext key="ambs" href="https://www.ambscallcenter.com/answering-service-pricing" nofollow>AMBS Call Center</Ext>,
            "$149 ($1.49/min)",
            "$600 ($1.20/min)",
            "$1.29 / $1.22",
            "30 seconds, rounded up",
            "$85",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/pricing/" nofollow>Specialty Answering Service</Ext>,
            "$159 ($1.59/min)",
            "$649 ($1.30/min)",
            "$1.44 / $1.34",
            "By the second",
            "$0",
          ],
          [
            <Ext key="sig" href="https://www.signius.com/pricing/" nofollow>Signius</Ext>,
            "$170 for 125 min ($1.36/min)",
            "None published; $280 for 225 min",
            "$1.25",
            "Not published",
            "Not published",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/pricing" nofollow>PATLive</Ext>,
            "$189 ($1.89/min)",
            "$759 ($1.52/min)",
            "$2.09 / $1.79",
            "First minute, then 6 seconds",
            "Not published",
          ],
          [
            <Ext key="mp" href="https://www.moneypenny.com/us/pricing/" nofollow>Moneypenny US</Ext>,
            "$265 ($2.65/min)",
            "$985 ($1.97/min)",
            "$2.12 / $1.67",
            "30 seconds, after adding wrap-up time (per its terms)",
            "None listed",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/pricing" nofollow>Abby Connect</Ext>,
            "$329 ($3.29/min)",
            "$1,380 ($2.76/min)",
            "At the plan's own rate",
            "Not published",
            "None",
          ],
          [
            <Ext key="ruby" href="https://www.ruby.com/plans-and-pricing/" nofollow>Ruby</Ext>,
            "$395 ($3.95/min)",
            "$1,725 ($3.45/min)",
            "Not published",
            "Not published",
            "None",
          ],
        ]}
      />
      <P>
        Three things the table shows that a range can&apos;t. First, the
        spread is real: the priciest 100-minute plan costs 2.65 times the
        cheapest. They are not identical products - the receptionist brands
        sell a more polished front-desk experience - but anyone buying
        message-taking should know the lower number exists. Second, small
        plans are the expensive ones per minute: Ruby&apos;s $250 starter
        buys 50 minutes, which is $5.00 a minute. Third, the increment column
        changes the bill as much as the rate. A 70-second call is billed as 70
        seconds by the second, 90 seconds at 30-second rounding and 120 at
        whole-minute rounding; across hundreds of short calls that is a
        different invoice. We go through who bills what, from the vendors&apos;
        own terms, in our{" "}
        <Internal href="/blog/medical-answering-service-pricing#billable-time">
          breakdown of billable minutes and increments
        </Internal>
        . What these providers commit to beyond price - answer speed, where
        the agents are, what happens on hold - is in our{" "}
        <Internal href="/blog/live-answering-service#promises">
          live answering service guide
        </Internal>
        .
      </P>
      <H3>Per-call and AI answering services</H3>
      <Table
        caption="Per-call and AI answering plans as published, checked October 4, 2026"
        head={["Service", "Billing unit", "Entry plan", "Next plan", "Beyond the plan"]}
        rows={[
          [
            <Ext key="smh" href="https://smith.ai/pricing/receptionists" nofollow>Smith.ai (human-first)</Ext>,
            "Per call",
            "$300 for 30 calls",
            "$810 for 90 calls",
            "$11.50 / $10.50 per call; spam not billed when caller ID is passed",
          ],
          [
            <Ext key="sma" href="https://smith.ai/pricing/ai-receptionist" nofollow>Smith.ai AI Receptionist</Ext>,
            "Per call",
            "Free for 25 calls",
            "$150 for 75 calls",
            "$3.00 per call on the free plan",
          ],
          [
            <Ext key="mpa" href="https://www.moneypenny.com/us/pricing/" nofollow>Moneypenny US AI</Ext>,
            "Per call",
            "$69 for 25 calls",
            "$99 for 50 calls",
            "$2.49 down to $1.89 per call",
          ],
          [
            <Ext key="ambsai" href="https://www.ambscallcenter.com/answering-service-pricing" nofollow>AMBS Call Center AI</Ext>,
            "Per minute",
            "$19 plus $0.79 a minute",
            "$75 for 100 minutes",
            "$0.79 down to $0.70 per minute",
          ],
          [
            <Ext key="rosie" href="https://heyrosie.com/pricing" nofollow>Rosie</Ext>,
            "Minute bundle",
            "$49 for 250 minutes",
            "$149 for 1,000 minutes (first tier with in-call booking)",
            "Not published",
          ],
          [
            <Ext key="gc" href="https://www.goodcall.com/pricing" nofollow>Goodcall</Ext>,
            "Per agent, capped unique callers",
            "$79 for 100 callers",
            "$129 for 250 callers",
            "$0.50 per extra caller; minutes unlimited",
          ],
          [
            <Ext key="mafd" href="https://www.myaifrontdesk.com/pricing" nofollow>My AI Front Desk</Ext>,
            "Minute bundle",
            "$99 for 200 voice minutes",
            "Custom",
            "About $0.25 per minute",
          ],
          [
            <Internal key="us" href="/pricing">AI Receptionist Now (us)</Internal>,
            "Minute bundle",
            "€99 for 1,000 minutes",
            "€299 for 3,000 minutes",
            "€0.09 per minute; booking on both plans",
          ],
        ]}
      />
      <P>
        The per-minute gap between the two tables is the whole story of this
        market. The cheapest live minute above costs $1.20; AI bundles work
        out to roughly 10 to 50 cents a minute (Rosie&apos;s $149 for 1,000
        minutes is about 15 cents, a $99 plan with 200 minutes is about 50).
        Per-call AI pricing sits in between, at roughly $1.90 to $3 a call,
        and suits short calls badly or well depending on your mix. Two
        caveats in fairness to the live side: a human operator is a different
        product, and per-call human pricing like Smith.ai&apos;s is built for
        long intake conversations, not 70-second messages.
      </P>
      <Callout>
        Not in the tables: AnswerConnect, AnswerForce and Nexa show a quote
        form or plan sizes without a US price list, so any figure you see for
        them comes from a third party. We bill in euros, and a euro has been
        worth a little more than a dollar, so our €99 lands somewhat above
        $100 on a US card.
      </Callout>

      <H2 id="pricing-models">Answering service pricing models, explained</H2>
      <P>
        Nearly every quote you&apos;ll get uses one of four structures. Each
        one is the cheap option in one scenario and the expensive option in
        another, which is exactly why vendors pick the one they pick.
      </P>
      <H3>Per-minute</H3>
      <P>
        The classic live-operator model: you pay for every minute an operator
        spends on your calls. Bundled plans work out to{" "}
        <Strong>$1.20 to $5 a minute</Strong> depending on size, and
        pay-as-you-go tiers charge a $44 to $49 base plus $1.35 to $2.99 a
        minute (Specialty, Signius, PATLive). It looks affordable at low volume
        and gets punishing fast - a modest 200 three-minute calls is 600
        billable minutes. Watch the rounding: Specialty bills by the second,
        PATLive bills the first minute then 6-second steps, AMBS and
        Moneypenny round up to 30 seconds, and Nexa&apos;s terms round up to
        the whole minute.
      </P>
      <H3>Per-call</H3>
      <P>
        A fee per answered call. For human receptionists the published
        example is Smith.ai at <Strong>$10 a call</Strong> on its entry plan,
        with $8.50 to $11.50 per extra call; per-call AI plans run{" "}
        <Strong>about $1.90 to $3 a call</Strong>. It&apos;s the easiest
        model to forecast, but ask two questions: do spam calls and wrong
        numbers count as billable (Smith.ai says not, if caller ID is passed),
        and which add-ons - booking, recording, a Spanish line - are charged
        per call on top.
      </P>
      <H3>Flat monthly subscription</H3>
      <P>
        A fixed monthly fee with a bundle of included minutes or calls and an
        overage rate beyond it. This is how most AI answering services price -{" "}
        <Strong>roughly $20 to $300 a month</Strong> depending on volume - and
        some live services offer tiered versions. It&apos;s the most
        predictable model; the number to scrutinize is the overage rate,
        because that&apos;s what you pay in your busy season.
      </P>
      <H3>Custom / enterprise</H3>
      <P>
        Negotiated pricing for high volume or multi-location operations.
        Reasonable at genuine scale; a warning sign when it&apos;s the only
        option for a small-business plan. If you&apos;re comparing this
        category against human virtual receptionists specifically, we&apos;ve
        broken those rates out in our{" "}
        <Internal href="/blog/virtual-receptionist-pricing">
          virtual receptionist pricing guide
        </Internal>
        .
      </P>
      <Table
        caption="Answering service pricing models compared"
        head={["Model", "Typical rate", "Cheap when", "Expensive when"]}
        rows={[
          [
            "Per-minute (live)",
            "$1.20-$5/min on bundles; PAYG $44-$49 base + $1.35-$2.99/min",
            "Very low, short calls",
            "Any real volume; long or complex calls",
          ],
          [
            "Per-call",
            "AI ~$1.90-$3/call; human ~$8.50-$11.50/call",
            "Long calls that would rack up minutes",
            "Many short calls; per-call add-ons",
          ],
          [
            "Flat monthly (mostly AI)",
            "$20-$300/mo + overage",
            "Steady or growing volume",
            "Volume far below the bundle you bought",
          ],
          [
            "Custom / enterprise",
            "Negotiated",
            "High volume, multi-location",
            "You're small and can't benchmark the quote",
          ],
        ]}
      />

      <H2 id="hidden-fees">
        The hidden fees that inflate answering service rates
      </H2>
      <P>
        This is where the gap between the quote and the invoice lives. Before
        signing anything, get written answers on each of these:
      </P>
      <UL>
        <LI>
          <Strong>Setup and onboarding fees.</Strong> A one-time charge for
          scripting and account setup. AMBS publishes{" "}
          <Strong>$85</Strong>; Nexa&apos;s terms mention one without an
          amount; Specialty, Abby Connect, Smith.ai and Ruby say they charge
          none. Ask, and get the answer in writing.
        </LI>
        <LI>
          <Strong>Overage rates.</Strong> The per-minute price after your
          bundle runs out - frequently higher than the in-bundle rate. A cheap
          base plan with a brutal overage is priced to be exceeded.
        </LI>
        <LI>
          <Strong>Holiday and after-hours premiums.</Strong> Nexa&apos;s terms
          include a fee on eight named holidays; Specialty, AMBS and Ruby state
          they charge none. These surcharges land precisely when you need
          coverage most. AI services generally bill midnight the same as noon;
          confirm it anyway.
        </LI>
        <LI>
          <Strong>Per-transfer and call-patching fees.</Strong> A charge for
          connecting a caller through to you or your cell and keeping the line
          up: $0.06 a minute at AMBS, $0.10 at Specialty. Small per minute, but
          transfer-heavy businesses pay it on every live handoff.
        </LI>
        <LI>
          <Strong>Billing increments and wrap-up time.</Strong> Rounding every
          call up to the next 30 or 60 seconds turns a 65-second call into 90
          or 120 billable seconds, and some terms add after-call work first:
          Moneypenny&apos;s own example bills a 62-second call with 8 seconds
          of wrap-up as 90 seconds. Per-second billing is fairer; ask which one
          you&apos;re getting.
        </LI>
        <LI>
          <Strong>Billable junk.</Strong> Spam, robocalls, and wrong numbers
          can all count as answered calls on per-call and per-minute plans.
        </LI>
      </UL>
      <Callout>
        The one question that collapses all of this:{" "}
        <Strong>
          &quot;What is my total monthly invoice at my real call volume,
          including setup, transfers, and after-hours calls?&quot;
        </Strong>{" "}
        Make every vendor - us included - answer with a number, not a tier
        name.
      </Callout>

      <H2 id="live-vs-ai">
        Live vs AI answering service cost, at three volumes
      </H2>
      <P>
        Here&apos;s the comparison at three realistic volumes, assuming an
        average call of about three minutes, computed from the published
        plans above: for each service, the cheapest plan that fits plus
        overage, from the least to the most expensive service. The point
        isn&apos;t any single cell - it&apos;s how differently the two models
        scale.
      </P>
      <Table
        caption="Monthly cost by call volume from published plans (3-minute average call, checked October 2026)"
        head={[
          "Monthly volume",
          "Live per-minute services",
          "AI answering services",
          "Effective cost per call (AI)",
        ]}
        rows={[
          [
            "50 calls (~150 min)",
            "~$215-$720",
            "~$50-$150",
            "~$1-$3",
          ],
          [
            "200 calls (~600 min)",
            "~$720-$1,725+",
            "~$110-$420",
            "~$0.50-$2.10",
          ],
          [
            "500 calls (~1,500 min)",
            "~$1,800-$4,100+",
            "~$160-$1,000",
            "~$0.30-$2.00",
          ],
        ]}
      />
      <P>
        A plus sign means at least one service (Ruby) publishes no plan or
        overage rate at that volume. The wide AI ranges are real too: per-call
        and per-minute AI plans from live-answering companies scale more like
        the live side than flat minute bundles do. The divergence is
        structural, not a promotion. A live service pays a
        human for every minute, so its costs scale linearly with your calls
        and spike at nights and holidays when labor costs more. Software
        answers the 500th call at nearly the same marginal cost as the first,
        in parallel, at 2&nbsp;a.m. That&apos;s also why live services still
        win specific jobs - genuinely complex, high-empathy calls - and why
        the honest comparison depends on your call mix. We&apos;ve unpacked
        the AI side of these numbers, model by model, in our{" "}
        <Internal href="/blog/virtual-receptionist-pricing#ai-receptionist-pricing">
          AI receptionist pricing breakdown
        </Internal>
        .
      </P>

      <H2 id="cost-drivers">What drives answering service cost up</H2>
      <UL>
        <LI>
          <Strong>Call volume.</Strong> The dominant factor in every model.
          Estimate yours from phone logs before you shop, because every quote
          is meaningless without it.
        </LI>
        <LI>
          <Strong>Call length and complexity.</Strong> Message-taking is the
          cheapest tier. Scripted intake, appointment scheduling, and order
          processing take more minutes per call and often a higher rate.
        </LI>
        <LI>
          <Strong>Hours of coverage.</Strong> 24/7 live coverage costs
          meaningfully more than business hours; for AI it&apos;s typically
          the same flat fee, which is much of the appeal.
        </LI>
        <LI>
          <Strong>Industry requirements.</Strong> Medical answering (HIPAA,
          on-call escalation) and legal intake command premium rates over
          general message-taking.
        </LI>
        <LI>
          <Strong>Bilingual answering.</Strong> Spanish-English live coverage
          often carries a surcharge; with AI it&apos;s usually included, and
          paying per-language for the same call is a pricing choice, not a
          necessity.
        </LI>
        <LI>
          <Strong>Integrations and delivery.</Strong> Calendar booking, CRM
          logging, and SMS delivery of messages can be included or billed as
          add-ons that quietly double a cheap base plan.
        </LI>
      </UL>
      <P>
        Industry requirements are the driver most people underestimate, because
        they show up as a rate premium and as a boundary the script has to
        respect. A{" "}
        <Internal href="/blog/funeral-home-answering-service">
          funeral home
        </Internal>{" "}
        is legally required to answer price questions by telephone; an{" "}
        <Internal href="/blog/medical-answering-service">
          answering service for therapists
        </Internal>{" "}
        needs a signed business associate agreement before it takes a single
        call; a{" "}
        <Internal href="/blog/home-services-answering-service#pest-control">
          pest control company
        </Internal>{" "}
        needs a script that never answers a pesticide safety question; a{" "}
        <Internal href="/blog/veterinary-answering-service#vet-techs">
          veterinary practice
        </Internal>{" "}
        decides whether it is paying for routing or for a vet tech&apos;s
        triage; a{" "}
        <Internal href="/blog/towing-answering-service">
          towing company
        </Internal>{" "}
        needs every night call answered in parallel; and a clinic pays for on-call dispatch time most businesses never see (
        <Internal href="/blog/medical-answering-service-pricing">
          medical answering service pricing, line by line
        </Internal>
        ). If your
        trade has one of these, price the vendors that can actually meet it, not
        the cheapest per-minute rate on the market.
      </P>

      <H2 id="roi">How to calculate ROI: the fee vs the missed call</H2>
      <P>
        An answering service isn&apos;t competing against $0 - it&apos;s
        competing against the calls you currently miss and the staff time you
        currently spend. Two anchors for the math:
      </P>
      <OL>
        <LI>
          <Strong>What answering costs you in wages today.</Strong> Per the{" "}
          <Ext href="https://www.bls.gov/oes/current/oes434171.htm">
            Bureau of Labor Statistics
          </Ext>
          , the mean receptionist wage is around $18-$19 an hour - roughly
          $37,000 a year before benefits. Even a part-time human dedicated to
          phones costs more per month than any plan in this guide.
        </LI>
        <LI>
          <Strong>What a missed call costs you in revenue.</Strong> Count
          missed and after-hours calls from last month&apos;s phone log. Apply
          a conservative conversion rate - even 10-20% is realistic for
          ready-to-buy callers, and{" "}
          <Ext href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads">
            Harvard Business Review&apos;s lead-response research
          </Ext>{" "}
          shows intent decays within minutes, so callers who reach voicemail
          largely don&apos;t call back. Multiply by your average customer
          value.
        </LI>
      </OL>
      <P>
        If that recovered-revenue number exceeds the monthly fee - and for
        most service businesses a single recovered job clears a $50-$300 plan
        several times over - the service pays for itself. We&apos;ve published
        the full missed-call arithmetic, with worked examples by industry, in{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the cost of a missed call
        </Internal>
        . And run it honestly in reverse: if you already answer virtually
        every call, the recovered revenue is small and you likely
        shouldn&apos;t buy anything.
      </P>

      <H2 id="too-cheap">When a cheap answering service is too cheap</H2>
      <P>
        We&apos;d love to tell you the affordable answering service always
        wins, since we&apos;re usually it. The truth is more specific. Cheap
        is fine when it&apos;s cheap for a structural reason - software
        economics, a bundle sized to your actual volume. Cheap is a trap when
        it&apos;s one of these:
      </P>
      <UL>
        <LI>
          <Strong>A tiny bundle priced to be exceeded.</Strong> A $39 live
          plan with 30 included minutes isn&apos;t a $39 plan for anyone with
          real call volume; it&apos;s an overage plan with a teaser rate.
        </LI>
        <LI>
          <Strong>Rates that assume perfect calls.</Strong> Bargain per-call
          pricing that bills spam, rounds up aggressively, and charges for
          every transfer often invoices higher than the &quot;expensive&quot;
          quote.
        </LI>
        <LI>
          <Strong>Quality that costs you the caller.</Strong> An operator
          reading a script badly, or a clunky bot that traps callers in menus,
          converts worse than no service. The cheapest option that loses the
          job is the most expensive option on the list.
        </LI>
        <LI>
          <Strong>No way out.</Strong> Deep discounts tied to annual contracts
          mean a bad pick costs you a year instead of a month. Prefer
          month-to-month until the service has earned the commitment.
        </LI>
      </UL>
      <P>
        The test isn&apos;t the price - it&apos;s whether the service actually
        books the caller. A $30-$50 AI plan that answers instantly, 24/7, and
        schedules the appointment is genuinely cheap. A $150 plan that takes a
        message a human then has to chase is expensive at any price. For how
        this plays out at small-business scale specifically - which calls to
        hand off first and what to keep - see our guide to{" "}
        <Internal href="/blog/answering-service-for-small-business">
          answering services for small businesses
        </Internal>
        , and if you want to benchmark the flat-rate end of the market, our{" "}
        <Internal href="/pricing">pricing is public</Internal>.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
