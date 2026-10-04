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
  slug: "medical-answering-service-pricing",
  title: "Medical Answering Service Pricing: What Clinics Pay in 2026",
  description:
    "Published rate cards read line by line: what 100 and 500 minutes cost, how rounding changes the invoice, which fees are real, and whether a BAA costs extra.",
  date: "2026-10-01",
  updated: "2026-10-01",
  readingTime: "17 min read",
  tag: "Guides",
  hero: "/blog/medical-answering-pricing-desk.webp",
  heroAlt:
    "A practice manager's desk seen from above: a desk phone, a calculator, a fan of blank printed sheets, a stethoscope, a pen and a mug of coffee in morning light",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "medical answering service pricing",
    "medical answering service cost",
    "how much does a medical answering service cost",
    "physician answering service cost",
    "doctors answering service pricing",
    "HIPAA compliant answering service cost",
    "after hours medical answering service cost",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "rate-cards", title: "The published rate cards" },
    { id: "billable-time", title: "What counts as a billable minute" },
    { id: "increments", title: "The increment decides the invoice" },
    { id: "fees", title: "Fees: which are real" },
    { id: "hipaa", title: "Does a BAA cost extra?" },
    { id: "worked-example", title: "One practice, five invoices" },
    { id: "per-call-and-ai", title: "Per-call and AI pricing" },
    { id: "in-house", title: "Against an in-house hire" },
    { id: "questions", title: "Eight questions to send before you sign" },
    { id: "not-verified", title: "What we could not verify" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "How much does a medical answering service cost per month?",
      a: "On the rate cards we could read in October 2026, a 100-minute live-agent plan costs between $149 and $395 a month and a 500-minute plan between $600 and $1,725. Budget bureaus such as AMBS Call Center and Specialty Answering Service sit at the low end; receptionist-style brands such as Abby Connect and Ruby sit at the high end. An after-hours line for a small practice typically uses a few hundred minutes, which on the cheaper cards works out to roughly $450 to $600 a month once billing increments are accounted for.",
    },
    {
      q: "What is the per-minute rate for a medical answering service?",
      a: "Published overage rates for live agents run from about $1.20 to $2.99 per minute. AMBS Call Center lists $1.21 to $1.29, Specialty Answering Service $1.09 to $1.54, Signius $1.25 to $1.35, PATLive $1.49 to $2.99 and Moneypenny $1.67 to $2.28, depending on plan size. The effective rate inside a plan is often higher than the overage rate - Ruby's 100-minute plan at $395 is $3.95 a minute - so compare the total for your expected usage, not the headline rate.",
    },
    {
      q: "Does HIPAA compliance or a BAA cost extra?",
      a: "We did not find a single answering service that publishes a separate fee for a business associate agreement. Specialty Answering Service states it offers a BAA and lists HIPAA compliance as a plan feature, and Signius and Ruby list HIPAA-compliant service on their pricing pages at the published prices. The cost shows up elsewhere: Nexa's terms allow compliance fees and encrypted SMS messaging fees, and secure message delivery can change how your staff receive messages. Ask for the BAA and the fee schedule in writing.",
    },
    {
      q: "What is the difference between talk time and work time?",
      a: "Talk time is the time an agent is on the line with your caller. Work time adds everything else done on your account. AMBS Call Center defines it to include taking messages, calling your staff, sending emails and texts, paging and entering on-call information. Nexa's terms count hold time, outbound ringing and the time a receptionist spends completing information after the caller hangs up. Moneypenny's terms bill wrap-up time up to a cap of 180 seconds per call. Two services at the same per-minute rate can produce very different invoices.",
    },
    {
      q: "Are there holiday or after-hours surcharges?",
      a: "Sometimes, and it is stated in writing when it applies. Nexa's terms list a holiday-related fee for eight named holidays. Specialty Answering Service shows no holiday or weekend fees on its pricing table, AMBS Call Center states no holiday charges, and Ruby states there are no additional fees for coverage during certain periods. For a medical practice, whose heaviest answering-service use is nights, weekends and holidays, this line matters more than it does for most businesses.",
    },
    {
      q: "Is an AI medical answering service cheaper?",
      a: "On price alone, yes. Published AI rates include $0.79 per AI minute at AMBS Call Center on a $19 monthly plan, and per-call AI plans from $69 a month at Moneypenny. Our own plans are flat: 99 euros a month including 1,000 minutes. The savings are real but they are not the decision for a medical practice. The decision is whether the vendor will sign a BAA, where recordings are stored, and whether clinical calls reach your on-call clinician reliably. Price a human escalation path into any AI setup.",
    },
    {
      q: "How many minutes does a medical practice need?",
      a: "Count calls, not guesses. Pull one month of after-hours and overflow calls from your phone system, multiply by your average call length, and then apply the vendor's billing increment - a 70-second call is 70 billed seconds at one service and 120 at another. Published research from one academic primary care practice found that 63% of its after-hours calls came on weekends or holidays and 14% between 5 and 7 p.m. on weekdays, so a weekday-only sample will understate your volume.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Specialty Answering Service: pricing (rate card, billing by the second, fees)",
    url: "https://www.specialtyansweringservice.net/pricing/",
  },
  {
    title:
      "Specialty Answering Service: HIPAA compliant answering service (BAA and secure message delivery)",
    url: "https://www.specialtyansweringservice.net/industries/healthcare/hipaa-compliant-answering-service/",
  },
  {
    title:
      "AMBS Call Center: answering service pricing (rate card, set-up fee, work time, 30-second increments)",
    url: "https://www.ambscallcenter.com/answering-service-pricing",
  },
  {
    title: "Signius: pricing",
    url: "https://www.signius.com/pricing/",
  },
  {
    title: "PATLive: pricing",
    url: "https://www.patlive.com/pricing",
  },
  {
    title: "PATLive: FAQs (billing increment)",
    url: "https://www.patlive.com/faqs/",
  },
  {
    title: "PATLive help center: billing (what time is billed)",
    url: "https://help.patlive.com/patlive-billing",
  },
  {
    title: "Moneypenny US (VoiceNation LLC): pricing",
    url: "https://www.moneypenny.com/us/pricing/",
  },
  {
    title:
      "Moneypenny US terms and conditions (billable operator minutes, wrap-up cap, rounding)",
    url: "https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf",
  },
  {
    title: "Abby Connect: pricing",
    url: "https://www.abby.com/pricing",
  },
  {
    title: "Ruby: plans and pricing",
    url: "https://www.ruby.com/plans-and-pricing/",
  },
  {
    title: "Smith.ai: receptionist pricing (per-call billing and add-ons)",
    url: "https://smith.ai/pricing/receptionists",
  },
  {
    title:
      "Nexa: terms and conditions (billing increments, billable time, holiday and other fees)",
    url: "https://www.nexa.com/legal/terms-conditions/",
  },
  {
    title:
      "45 CFR 160.103 - definitions of covered entity and business associate (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-160.103",
  },
  {
    title:
      "45 CFR 164.502(e) - disclosures to business associates and the written contract requirement (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-164.502",
  },
  {
    title:
      "45 CFR 102.3 - civil monetary penalty amounts as adjusted for inflation, including HIPAA tiers (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-102.3",
  },
  {
    title:
      "HHS Office for Civil Rights: Business Associates guidance",
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html",
  },
  {
    title:
      "After-hours telephone calls in an adult primary care practice, Journal of General Internal Medicine 2024 (PMC12119426)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12119426/",
  },
  {
    title:
      "MGMA Stat: patient access priorities for 2026 (December 9, 2025 poll)",
    url: "https://www.mgma.com/mgma-stat/patient-access-priorities-for-2026",
  },
  {
    title:
      "U.S. Bureau of Labor Statistics: Occupational Employment and Wages, 43-6013 Medical Secretaries and Administrative Assistants",
    url: "https://www.bls.gov/oes/current/oes436013.htm",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Search for what a medical answering service costs and you get the same
        three ranges repeated from one article to the next, none of them linked
        to a price list. So we did the dull version: opened the pricing pages
        and terms of service of the answering services that publish them, and
        wrote down what they say. The per-minute rate turns out to be the least
        informative number on the page. What decides a clinic&apos;s bill is how
        a minute is defined and how it is rounded. We sell a flat-rate AI
        alternative, which is a reason to check our arithmetic - every figure
        below links to the vendor&apos;s own page.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Published live-agent plans run{" "}
            <Strong>$149 to $395 for 100 minutes</Strong> and{" "}
            <Strong>$600 to $1,725 for 500</Strong>. The spread between vendors
            is larger than most guides admit.
          </>,
          <>
            The same 300 calls can be <Strong>350 or 600 billed minutes</Strong>{" "}
            depending on whether the service bills by the second or rounds up to
            the minute.
          </>,
          <>
            We found <Strong>no vendor that publishes a BAA fee</Strong>. The
            claim that HIPAA compliance adds 10 to 30 percent has no source we
            could locate.
          </>,
          <>
            Read the definition of billable time before the rate. Wrap-up,
            hold, and the minutes spent reaching your on-call physician are
            billed by several services.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>medical answering service</Strong> for a small practice costs
        somewhere between $150 and $1,700 a month on published rate cards, and
        that range is not a hedge - it is the real gap between the cheapest and
        most expensive vendor for the same number of minutes. A realistic
        after-hours line for a small practice, a few hundred billed minutes,
        lands at roughly $450 to $600 a month on the lower-priced cards and
        around $900 on the higher-priced ones. Per-call services and AI services
        price differently and are covered{" "}
        <Internal href="#per-call-and-ai">further down</Internal>
        .
      </P>
      <P>
        If you want the general picture for any kind of business, our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          answering service cost guide
        </Internal>{" "}
        covers the pricing models and sets these live rate cards next to
        per-call and AI plans. This article is narrower: the lines on the
        invoice that are specific to a clinic - on-call dispatch, HIPAA,
        holidays - and what vendors put in writing about each.
      </P>

      <H2 id="rate-cards">The published rate cards</H2>
      <P>
        These are the live-agent prices each company showed on its own pricing
        page on October 1, 2026. We have included only vendors whose page we
        could read directly. The effective rate column is our arithmetic: plan
        price divided by included minutes.
      </P>
      <Table
        caption="Live-agent plans as published by each vendor (checked October 1, 2026)"
        head={[
          "Service",
          "About 100 minutes",
          "About 500 minutes",
          "Overage per minute",
          "Effective rate, 100 / 500 min",
        ]}
        rows={[
          [
            <Ext key="ambs" href="https://www.ambscallcenter.com/answering-service-pricing">AMBS Call Center</Ext>,
            "$149",
            "$600",
            "$1.29 / $1.22",
            "$1.49 / $1.20",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/pricing/">Specialty Answering Service</Ext>,
            "$159",
            "$649",
            "$1.44 / $1.34",
            "$1.59 / $1.30",
          ],
          [
            <Ext key="sig" href="https://www.signius.com/pricing/">Signius</Ext>,
            "$170 (125 minutes)",
            "No 500-minute plan published; $280 for 225 minutes",
            "$1.25",
            "$1.36 at 125 min",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/pricing">PATLive</Ext>,
            "$189",
            "$759",
            "$2.09 / $1.79",
            "$1.89 / $1.52",
          ],
          [
            <Ext key="mp" href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>,
            "$265",
            "$985",
            "$2.12 / $1.67",
            "$2.65 / $1.97",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/pricing">Abby Connect</Ext>,
            "$329",
            "$1,380",
            "Billed at the plan's per-minute rate; no dollar figure published",
            "$3.29 / $2.76",
          ],
          [
            <Ext key="ruby" href="https://www.ruby.com/plans-and-pricing/">Ruby</Ext>,
            "$395",
            "$1,725",
            "Not published on the pricing page",
            "$3.95 / $3.45",
          ],
        ]}
      />
      <P>
        VoiceNation, which appears in many older comparisons, now redirects to
        Moneypenny&apos;s US pricing page, so the two are one row. Smith.ai
        bills per call rather than per minute and is in its own section below.
        Nexa publishes plan sizes but no prices. AnswerConnect and AnswerForce
        show a quote form instead of a US price list, so they are not in the
        table - any figure you see for them elsewhere comes from a third party.
      </P>
      <Callout>
        The cheapest and the most expensive 100-minute plan differ by a factor
        of 2.6. They are not the same product - the receptionist brands sell a
        more polished front-desk experience - but a clinic buying after-hours
        message-taking and on-call paging should know the lower number exists.
      </Callout>

      <H2 id="billable-time">What counts as a billable minute</H2>
      <P>
        A per-minute rate means nothing until you know what a minute contains.
        The services that define it in writing do not agree with each other.
      </P>
      <Table
        caption="How vendors define billable time, in their own documents"
        head={["Service", "What is billed", "Source"]}
        rows={[
          [
            "PATLive",
            "Only the time receptionists are on the phone with your callers",
            <Ext key="p" href="https://help.patlive.com/patlive-billing">Billing help page</Ext>,
          ],
          [
            "AMBS Call Center",
            "“Work time”: answering and taking messages, calling your staff or customers, sending email and text messages, paging, entering on-call information, transferring calls, account changes",
            <Ext key="a" href="https://www.ambscallcenter.com/answering-service-pricing">Pricing page</Ext>,
          ],
          [
            "Moneypenny US",
            "Operator time from connection, outbound dialling, wrap-up time capped at 180 seconds per call, and the entire time agents spend attempting to dispatch a call to you or your staff",
            <Ext key="m" href="https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf">Terms</Ext>,
          ],
          [
            "Nexa",
            "From the moment a receptionist receives the call, including hold time and outbound ringing, plus time spent “completing information about the call after the caller has hung up”",
            <Ext key="n" href="https://www.nexa.com/legal/terms-conditions/">Terms</Ext>,
          ],
        ]}
      />
      <P>
        The row to read twice, if you run a medical practice, is dispatch. An
        ordinary business gets a message by email. A clinic gets a message, and
        then the service tries to reach the on-call physician, waits, tries
        again, and tries the backup. Under a work-time definition all of that is
        billable. A two-minute patient call can become a five-minute line item
        without anyone doing anything wrong.
      </P>
      <Figure
        src="/blog/medical-clinic-reception-night.webp"
        alt="A clinic reception at night after closing, lit by a single desk lamp, with a desk phone on the marble counter and an empty row of waiting chairs along the window"
        width={1376}
        height={768}
        caption="Where the minutes actually accrue. In one published study of an academic primary care practice, 63% of after-hours calls arrived on weekends or holidays and 14% between 5 and 7 p.m. on weekdays."
      />
      <P>
        That timing comes from a{" "}
        <Ext href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12119426/">
          research letter in the Journal of General Internal Medicine
        </Ext>{" "}
        covering 2,208 after-hours calls over 15 months at a single practice. It
        is one practice, not a national benchmark - we could not find a
        national one that is not a vendor&apos;s own number - but it is a useful
        warning against sizing a plan from a quiet weekday.
      </P>

      <H2 id="increments">The increment decides the invoice</H2>
      <P>
        Every service rounds call time to some unit. The published units range
        from one second to one minute.
      </P>
      <Table
        caption="Billing increments as published"
        head={["Service", "Increment", "Source"]}
        rows={[
          [
            "Specialty Answering Service",
            "By the second",
            <Ext key="s" href="https://www.specialtyansweringservice.net/pricing/">Pricing page</Ext>,
          ],
          [
            "PATLive",
            "First minute in full, then 6-second increments",
            <Ext key="p" href="https://www.patlive.com/faqs/">FAQ</Ext>,
          ],
          [
            "AMBS Call Center",
            "30 seconds, rounded up",
            <Ext key="a" href="https://www.ambscallcenter.com/answering-service-pricing">Pricing page</Ext>,
          ],
          [
            "Moneypenny US",
            "30 seconds, rounded up, after adding wrap-up and dispatch time",
            <Ext key="m" href="https://res.cloudinary.com/moneyp/image/upload/files/us-terms-and-conditions.pdf">Terms</Ext>,
          ],
          [
            "Nexa",
            "Whole minutes; partial minutes rounded up",
            <Ext key="n" href="https://www.nexa.com/legal/terms-conditions/">Terms</Ext>,
          ],
          [
            "Smith.ai",
            "Per call, not per minute",
            <Ext key="sm" href="https://smith.ai/pricing/receptionists">Pricing page</Ext>,
          ],
          ["Signius, Abby Connect", "Not published on the pricing page", "-"],
        ]}
      />
      <Figure
        src="/blog/medical-answering-billing-increments.svg"
        alt="A bar diagram of one 70-second call billed three ways: 70 seconds when billed by the second, 90 seconds when rounded up to 30 seconds, and 120 seconds when rounded up to a whole minute. Across 300 such calls a month that is 350, 450 and 600 billed minutes"
        width={1200}
        height={630}
        caption="Short calls are where rounding bites, and medical after-hours calls are mostly short: a refill request, a question about tomorrow's appointment, a message for the nurse."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        Moneypenny&apos;s terms give their own example, which is worth quoting
        because it is unusually candid: a call that lasts 62 seconds with 8
        seconds of wrap-up time &quot;will be billed at 90 seconds&quot;. That
        is a 45% uplift on the talk time, disclosed in the contract and
        invisible on the pricing page.
      </P>

      <H2 id="fees">Fees: which are real</H2>
      <P>
        Guides in this space list a dozen &quot;hidden fees&quot; without saying
        who charges them. Here is what we found in writing.
      </P>
      <Table
        caption="Fees and surcharges as published"
        head={["Fee", "Who states it", "Who states they do not charge it"]}
        rows={[
          [
            <Strong key="f1">Set-up</Strong>,
            "AMBS Call Center: a flat $85 one-time set-up fee, plus $85 per added location. Nexa: a non-refundable set-up fee, amount not published",
            "Specialty Answering Service ($0), Abby Connect, Smith.ai, Ruby",
          ],
          [
            <Strong key="f2">Holidays</Strong>,
            "Nexa: a holiday-related fee on eight named holidays, from New Year's Day to Christmas",
            "Specialty Answering Service (no holiday or weekend fees), AMBS Call Center, Ruby",
          ],
          [
            <Strong key="f3">Call patching</Strong>,
            "Specialty Answering Service: $0.10 per minute, from connect to disconnect. AMBS Call Center: 6 cents per minute",
            "-",
          ],
          [
            <Strong key="f4">Per-call add-ons</Strong>,
            "Smith.ai: appointment booking $1.50 per call, call recording and transcription $0.25, SMS or Slack notifications $0.50",
            "-",
          ],
          [
            <Strong key="f5">Compliance and messaging</Strong>,
            "Nexa's terms allow compliance fees and encrypted SMS messaging fees, with no amounts published",
            "No vendor we read publishes a BAA fee",
          ],
          [
            <Strong key="f6">Taxes and telecom</Strong>,
            "PATLive: prices do not include taxes and fees",
            "-",
          ],
        ]}
      />
      <P>
        Patching deserves a note. It is the fee for connecting a caller straight
        through to your on-call clinician and keeping the line up while they
        talk. Pennies per minute, but for a practice that takes its urgent calls
        live it is a recurring cost that a retailer or a law firm never sees.
      </P>

      <H2 id="hipaa">Does a BAA cost extra?</H2>
      <P>
        First the legal position, stated carefully.{" "}
        <Ext href="https://www.ecfr.gov/current/title-45/section-160.103">
          45 CFR 160.103
        </Ext>{" "}
        defines a business associate as a person who, on behalf of a covered
        entity, &quot;creates, receives, maintains, or transmits protected
        health information&quot; for a regulated function. HHS does not name
        answering services in that definition or in its{" "}
        <Ext href="https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html">
          business associates guidance
        </Ext>
        . That an answering service taking patient calls falls within it is an
        inference - a safe one, and one the vendors make about themselves:
        Specialty Answering Service writes that it{" "}
        <Ext href="https://www.specialtyansweringservice.net/industries/healthcare/hipaa-compliant-answering-service/">
          &quot;falls under the category of a Business Associate&quot;
        </Ext>{" "}
        and offers a BAA that both parties sign. Under{" "}
        <Ext href="https://www.ecfr.gov/current/title-45/section-164.502">
          45 CFR 164.502(e)
        </Ext>
        , the assurances you obtain from a business associate must be documented
        in a written contract.
      </P>
      <P>
        Now the money. Several articles state that a BAA &quot;typically adds 10
        to 30 percent&quot; to an answering service bill. We could not find a
        source for that figure, and we could not find a vendor that publishes
        any BAA fee at all. Specialty Answering Service, Signius and Ruby list
        HIPAA-compliant service on their pricing pages at the published prices.
        That is not proof that nobody charges for it - quote-only vendors can
        price however they like - but it means you should treat a compliance
        surcharge as something to negotiate, not as an industry norm.
      </P>
      <P>
        Where HIPAA does change the cost is in the workflow:
      </P>
      <UL>
        <LI>
          <Strong>Message delivery.</Strong> Specialty Answering Service states
          that email, voicemail and SMS are not treated as secure, so its
          messages tell you to log in to a secure portal. That is a behaviour
          change for an on-call physician, and some services charge for the
          secure channel.
        </LI>
        <LI>
          <Strong>Human-only compliance.</Strong> Abby Connect&apos;s pricing
          page lists HIPAA compliance options as &quot;human only&quot;, which
          matters if you were counting on its cheaper AI minutes.
        </LI>
        <LI>
          <Strong>The price of getting it wrong.</Strong> HIPAA civil penalties
          are adjusted for inflation each year. The current table at{" "}
          <Ext href="https://www.ecfr.gov/current/title-45/section-102.3">
            45 CFR 102.3
          </Ext>{" "}
          runs from $145 per violation at the lowest tier to $73,011, with a
          calendar-year maximum of $2,190,294 for identical violations. Against
          that, the difference between two rate cards is small.
        </LI>
      </UL>
      <P>
        None of this is legal advice. Your compliance officer or counsel decides
        what is adequate; the{" "}
        <Internal href="/blog/medical-answering-service">
          medical answering service guide
        </Internal>{" "}
        lists the data-handling questions to put to any vendor, ours included.
      </P>

      <H2 id="worked-example">One practice, five invoices</H2>
      <P>
        To show how the pieces interact, take one assumed practice and run it
        through the cards that publish everything needed. The assumption is
        ours, not a benchmark: 300 answered calls a month, each with 70 seconds
        of talk time. We count talk time only, which flatters the services that
        also bill wrap-up and dispatch.
      </P>
      <Table
        caption="300 calls of 70 seconds each, priced from published rate cards (our calculation)"
        head={["Service", "Increment applied", "Billed minutes", "Cheapest plan plus overage", "Monthly total"]}
        rows={[
          [
            "Specialty Answering Service",
            "Per second",
            "350",
            "220-minute plan at $269 + 130 minutes at $1.44",
            "$456.20",
          ],
          [
            "AMBS Call Center",
            "30 seconds, rounded up (70 s becomes 90 s)",
            "450",
            "250-minute plan at $330 + 200 minutes at $1.23",
            "$576.00, plus $85 once",
          ],
          [
            "PATLive",
            "First minute, then 6 seconds (70 s becomes 72 s)",
            "360",
            "300-minute plan at $479 + 60 minutes at $1.89",
            "$592.40",
          ],
          [
            "Moneypenny US",
            "30 seconds, rounded up",
            "450",
            "200-minute plan at $422 + 250 minutes at $1.91",
            "$899.50",
          ],
          [
            "Signius",
            "Not published",
            "350 to 600",
            "225-minute plan at $280 + overage at $1.25",
            "$436.25 to $748.75",
          ],
        ]}
      />
      <P>Three things fall out of that table.</P>
      <UL>
        <LI>
          <Strong>The headline rate misleads.</Strong> AMBS has the lowest
          per-minute rate in the set and a higher total than Specialty Answering
          Service, because 30-second rounding turns 350 minutes into 450.
        </LI>
        <LI>
          <Strong>An unpublished increment is a $300 question.</Strong> The
          Signius range is that wide purely because we do not know how it
          rounds. One email answers it.
        </LI>
        <LI>
          <Strong>The totals are a floor.</Strong> Add wrap-up at the services
          that bill it, dispatch time for calls that go to the on-call
          clinician, patching, and tax, and expect the real invoice to be
          higher. By how much depends on your escalation rate, which only your
          own call log can tell you.
        </LI>
      </UL>

      <H2 id="per-call-and-ai">Per-call and AI pricing</H2>
      <H3>Per call</H3>
      <P>
        <Ext href="https://smith.ai/pricing/receptionists">Smith.ai</Ext> prices
        by the call: 30 calls for $300 a month, 90 for $810, 300 for $2,100,
        with overage of $11.50, $10.50 and $8.50 per call. It states that spam
        and unsolicited sales calls are not charged when caller ID is passed.
        For the 300-call practice above that is $2,100 before add-ons - far
        above the per-minute cards, because per-call pricing is built for long
        intake conversations, not 70-second messages. Its pricing page says
        nothing about HIPAA or a BAA, so ask before sending patient calls.
      </P>
      <H3>AI</H3>
      <P>Published AI rates, for scale:</P>
      <UL>
        <LI>
          <Ext href="https://www.ambscallcenter.com/answering-service-pricing">
            AMBS Call Center
          </Ext>{" "}
          lists an AI tier at $19 a month with AI minutes at $0.79 each.
        </LI>
        <LI>
          <Ext href="https://www.moneypenny.com/us/pricing/">Moneypenny US</Ext>{" "}
          lists AI answering per call, from $69 a month.
        </LI>
        <LI>
          <Ext href="https://www.abby.com/pricing">Abby Connect</Ext> counts one
          plan minute as two AI minutes, and lists its HIPAA options as human
          only.
        </LI>
        <LI>
          Ours is flat: the Solo plan is 99 euros a month including 1,000
          minutes, with extra minutes at 9 cents (
          <Internal href="/pricing">pricing page</Internal>). We bill in euros.
        </LI>
      </UL>
      <P>
        The 300-call practice would use 350 minutes with us and stay inside the
        flat fee. That is a large saving, and we would be doing you a disservice
        to stop there. A medical practice should not choose an AI service on
        price. Ask us, and any other AI vendor, the same three things before a
        single patient call is routed: will you sign a BAA, where are recordings
        and transcripts stored and for how long, and what exactly happens when a
        caller describes a symptom. If the answers are not in writing, the price
        is irrelevant. And keep a human path for clinical calls - how to build
        one is in our{" "}
        <Internal href="/blog/24-hour-answering-service#emergency-escalation">
          emergency call escalation guide
        </Internal>
        .
      </P>

      <H2 id="in-house">Against an in-house hire</H2>
      <P>
        The usual comparison is misleading in both directions, so here are the
        primary numbers. The Bureau of Labor Statistics&apos; May 2025
        occupational wage data puts the{" "}
        <Ext href="https://www.bls.gov/oes/current/oes436013.htm">
          median wage for medical secretaries and administrative assistants
        </Ext>{" "}
        at $22.08 an hour, or $45,930 a year, before benefits and payroll taxes.
        That buys roughly 2,000 hours of one person during the day.
      </P>
      <P>
        An answering service does not replace that person. It covers the roughly
        6,700 hours a year the office is closed, plus the minutes during the day
        when every line is busy. Those are different purchases. The honest
        comparison for an after-hours line is not against a salary but against
        the alternative you would actually use: the physicians&apos; own cell
        phones, a voicemail box, or nothing. Phone access is not a niche
        concern - in an{" "}
        <Ext href="https://www.mgma.com/mgma-stat/patient-access-priorities-for-2026">
          MGMA poll of 236 practice leaders in December 2025
        </Ext>
        , 22% named it their top patient-access priority for 2026, close behind
        no-shows and online scheduling.
      </P>

      <H2 id="questions">Eight questions to send before you sign</H2>
      <P>
        Copy these into an email. A vendor that answers all eight in writing has
        told you what your invoice will be. A vendor that will not has also told
        you something.
      </P>
      <OL>
        <LI>
          <Strong>What is your billing increment</Strong>, and is the first
          minute billed in full?
        </LI>
        <LI>
          <Strong>What is included in billable time?</Strong> Specifically:
          hold, after-call wrap-up, outbound dialling, and time spent reaching
          our on-call clinician.
        </LI>
        <LI>
          <Strong>Is there a cap on wrap-up time per call?</Strong>
        </LI>
        <LI>
          <Strong>Which holidays carry a surcharge</Strong>, and how much?
        </LI>
        <LI>
          <Strong>Will you sign our BAA or provide yours</Strong>, and is there
          any fee attached to HIPAA-compliant service or secure messaging?
        </LI>
        <LI>
          <Strong>How are messages delivered</Strong> - secure portal, encrypted
          text, app - and what does each cost?
        </LI>
        <LI>
          <Strong>What is the set-up fee, the notice period and the billing
          cycle?</Strong> A 28-day cycle is thirteen invoices a year.
        </LI>
        <LI>
          <Strong>Can we see a sample invoice</Strong> with call-level detail,
          so we can audit billed time against call duration?
        </LI>
      </OL>
      <P>
        Then run a trial and audit it. Specialty Answering Service offers two
        weeks or 200 minutes without a credit card, and PATLive offers a 14-day
        trial. Compare ten billed calls against the recordings. It takes twenty
        minutes and it is the only test that matters.
      </P>

      <H2 id="not-verified">What we could not verify</H2>
      <P>
        A pricing article should say where its evidence ends.
      </P>
      <UL>
        <LI>
          <Strong>Quote-only vendors.</Strong> AnswerConnect, AnswerForce, Always
          Answer and Call 4 Health show no US price list. We have not repeated
          third-party figures for them.
        </LI>
        <LI>
          <Strong>Pages that blocked us.</Strong> We could not read the current
          pricing pages of MAP Communications, Answering Service Care or
          MedConnectUSA directly, so they are left out rather than quoted
          second-hand.
        </LI>
        <LI>
          <Strong>National call statistics.</Strong> We found no non-vendor
          national figure for how many calls a medical practice misses or what
          share arrive after hours. The numbers that circulate trace back to
          vendor blogs, so we have not used them.
        </LI>
        <LI>
          <Strong>Prices change.</Strong> Everything here was read on October 1,
          2026. Moneypenny&apos;s page labels its figures as original prices,
          which suggests promotions run on top. Follow the links.
        </LI>
      </UL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
