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
  slug: "insurance-answering-service",
  title: "Insurance Answering Service: The Licence Line and the Script",
  description:
    "What an unlicensed answerer may say to your clients, per state regulators; how to route claims after hours; Medicare season rules; data-security duties; and what providers really offer.",
  date: "2026-10-05",
  updated: "2026-10-05",
  readingTime: "16 min read",
  tag: "Guides",
  hero: "/blog/insurance-agency-front-desk.webp",
  heroAlt:
    "The front desk of a small independent insurance agency in the morning, with a desk phone, an appointment book, a potted plant, two client chairs and sunlight through window blinds",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "insurance answering service",
    "answering service for insurance agents",
    "insurance agency answering service",
    "answering service for insurance agencies",
    "after hours answering service for insurance agency",
    "insurance claims answering service",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "licence-line", title: "The licence line" },
    { id: "claims", title: "Claims after hours" },
    { id: "seasons", title: "Medicare and ACA season" },
    { id: "data", title: "Data security duties" },
    { id: "vendors", title: "What providers offer agencies" },
    { id: "script", title: "A script that stays on the right side" },
    { id: "live-or-ai", title: "Live, AI or both" },
    { id: "not-verified", title: "What we could not verify" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What can an answering service say to my insurance clients?",
      a: "Only clerical things, unless its staff hold the right licence. State regulators describe the clerical side as scheduling appointments with a licensed producer, taking requests for coverage to pass on, and taking factual information about a claim or an application. Discussing or explaining coverages, advising what to buy, and saying that coverage is or will be bound are reserved for licensed producers. Oklahoma's Bulletin 2013-09 adds that if an insured asks an unlicensed employee for advice, the response must come from a licensed producer.",
    },
    {
      q: "Can an answering service bind coverage?",
      a: "No. Binding is reserved for licensed producers acting with authority from the insurer. Tennessee's bulletin on unlicensed agency personnel lists binding coverage - including accepting premium payments before a licensed agent has bound it - and indicating that coverage is or will be bound among the things an unlicensed person may not do. None of the answering services we checked says its receptionists are licensed producers, so the script must never say a caller is covered.",
    },
    {
      q: "Should my answering service take insurance claims?",
      a: "It can take the facts and make sure the claim is reported, but the fastest route for most personal-lines claims is the carrier's own claims line. State Farm and Travelers publish claims reporting around the clock, and Nationwide lists its claims number as answered anytime. A good script takes the caller's details for your agency and gives them the right carrier number, so the claim is opened tonight rather than tomorrow morning.",
    },
    {
      q: "Do Medicare marketing rules apply to my answering service?",
      a: "They apply to sales calls about Medicare Advantage and Part D plans. Under 42 CFR 422.2267(e)(41), third-party marketing organizations must give a standard disclaimer verbally on sales calls before discussing any benefits, and 42 CFR 422.2274(g) requires marketing and sales calls to be recorded and kept for at least six years. An answering service should not discuss Medicare benefits at all; its job during the October 15 to December 7 enrollment period is to book the caller with a licensed agent.",
    },
    {
      q: "Does an answering service need to meet insurance data-security laws?",
      a: "Your agency's obligations reach your vendors. In the 28 jurisdictions that have adopted the NAIC Insurance Data Security Model Law, a licensee must exercise due diligence in selecting third-party service providers and require them to protect nonpublic information, although licensees with fewer than ten employees are exempt from that section. In New York, 23 NYCRR 500.11 requires policies for third-party service providers, and even small entities with a limited exemption must assess them.",
    },
    {
      q: "How much does an insurance answering service cost?",
      a: "Published live answering plans run about $149 to $395 a month for 100 minutes, with pay-as-you-go plans from $44 to $49 a month plus a per-minute rate. The insurance pages of most providers do not publish prices; Abby Connect lists $165 to $1,380 a month on its financial-services page. AI services are cheaper per call. Budget for the autumn enrollment season and for storm surges, when call volume is least predictable.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "NAIC Producer Licensing Model Act (#218): definitions and exemptions",
    url: "https://content.naic.org/sites/default/files/model-law-218.pdf",
  },
  {
    title: "Oklahoma Insurance Department: Bulletin 2013-09, producer licensing and unlicensed employees",
    url: "https://www.oid.ok.gov/wp-content/uploads/2019/11/081513_Producer-Licensing-Bulletin-2013-09.pdf",
  },
  {
    title: "Tennessee Department of Commerce and Insurance: insurance activities of unlicensed agency personnel",
    url: "https://www.tennessee.gov/content/dam/tn/commerce/documents/insurance/bulletins/8-5-85.pdf",
  },
  {
    title: "Delaware Department of Insurance: Agents' Bulletin No. 3, unlicensed assistants",
    url: "https://Insurance.Delaware.gov/wp-content/uploads/sites/15/2016/11/agentbull3.pdf",
  },
  {
    title: "New York DFS Office of General Counsel opinion 01-03-03: unlicensed employees outside the office",
    url: "https://www.dfs.ny.gov/insurance/ogco2001/rg103051.htm",
  },
  {
    title: "Texas Department of Insurance: consent order, unlicensed employees quoting by phone",
    url: "https://www.tdi.texas.gov/commissioner/disciplinary-orders/documents/20227341.pdf",
  },
  { title: "Washington RCW 48.18.230: binders", url: "https://app.leg.wa.gov/RCW/default.aspx?cite=48.18.230" },
  { title: "State Farm: home and property claims", url: "https://www.statefarm.com/claims/home-and-property" },
  { title: "Travelers: report a claim (affinity programs contact page)", url: "https://piaffinity.travelers.com/affinity/contact/ct" },
  { title: "Nationwide: call us", url: "https://www.nationwide.com/personal/contact/call-us/" },
  { title: "Progressive: how to report a claim", url: "https://www.progressive.com/claims/faq/how-to-report-a-claim/" },
  { title: "Florida Office of Insurance Regulation: Hurricane Ian claims data", url: "https://floir.gov/home/ian" },
  { title: "42 CFR 422.2267 - required materials and content, TPMO disclaimer (eCFR)", url: "https://www.ecfr.gov/current/title-42/section-422.2267" },
  { title: "42 CFR 422.2274 - agent, broker and TPMO requirements, call recording (eCFR)", url: "https://www.ecfr.gov/current/title-42/section-422.2274" },
  { title: "Medicare.gov: joining a plan, Open Enrollment dates", url: "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan" },
  { title: "HealthCare.gov: dates and deadlines for 2027 coverage", url: "https://www.healthcare.gov/quick-guide/dates-and-deadlines/" },
  { title: "NAIC Insurance Data Security Model Law (#668)", url: "https://content.naic.org/sites/default/files/model-law-668.pdf" },
  { title: "NAIC: adoption map for model #668", url: "https://content.naic.org/sites/default/files/legal-adoption-map-668-idsm.pdf" },
  { title: "23 NYCRR 500.11 - third-party service provider security policy (Cornell LII)", url: "https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.11" },
  {
    title: "New York DFS: Part 500 requirements checklist for entities with limited exemptions",
    url: "https://dfs.ny.gov/industry_guidance/cybersecurity/pt500_require_checklist_regulated_entities_limited_exemptions",
  },
  {
    title: "Vertafore: Orange Partner Program announcement",
    url: "https://vertafore.com/resources/press-releases/vertafore-announces-orange-partner-program-propel-customer-innovation",
  },
  { title: "HawkSoft: Partner API 3.0", url: "https://blog.hawksoft.com/partner-api-3.0" },
  { title: "Smith.ai: answering service for independent insurance agents", url: "https://smith.ai/industries/independent-insurance-agents-answering-service" },
  { title: "PATLive: enterprise (FNOL and claim surges)", url: "https://www.patlive.com/enterprise/" },
  { title: "AnswerConnect: insurance brokers", url: "https://www.answerconnect.com/industries/finance-and-insurance/insurance-brokers" },
  { title: "Specialty Answering Service: insurance call center", url: "https://www.specialtyansweringservice.net/industries/financial/insurance-call-center/" },
  { title: "MAP Communications: insurance agencies and claim adjusters", url: "https://www.mapcommunications.com/industries/financial/insurance-agencies-claim-adjusters/" },
  { title: "Abby Connect: financial services", url: "https://www.abby.com/industries/financial-services/" },
  { title: "U.S. Bureau of Labor Statistics: insurance sales agents, Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/sales/insurance-sales-agents.htm" },
];

export default function Body() {
  return (
    <>
      <Lead>
        An insurance agency&apos;s phone carries a risk most businesses do not
        have: the person answering can break the law by being helpful.
        &quot;Yes, you&apos;re covered from today&quot; is a sentence only a
        licensed producer with binding authority may say, and an answering
        service is neither. So before comparing providers we read what state
        regulators say unlicensed staff may do, how the big carriers take
        claims after hours, the Medicare rules that apply in the autumn, and
        the data-security laws that reach your vendors. Then we read what the
        providers themselves promise agencies. We sell an AI receptionist and
        compete with them; our own limits are stated below.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Regulators put <Strong>scheduling, taking requests and taking
            factual claim details</Strong> on the clerical side. Explaining
            coverage, advising and binding are for licensed producers.
          </>,
          <>
            <Strong>None of the providers we checked</Strong> says its
            receptionists are licensed producers. Script accordingly.
          </>,
          <>
            For claims at night, the fastest route is often the{" "}
            <Strong>carrier&apos;s own claims line</Strong>; the answering
            service should give the number and log the call for you.
          </>,
          <>
            During Medicare enrollment, sales calls carry a{" "}
            <Strong>required disclaimer and six-year recording rule</Strong>.
            An answering service should book, not discuss benefits.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        An <Strong>insurance answering service</Strong> answers your
        agency&apos;s calls when your staff cannot - after hours, at lunch, in
        a storm, through enrollment season - and books appointments, takes
        messages and logs claims for a licensed agent to follow up. Choosing
        one is less about the provider than about the script. The service can
        do everything on the clerical side of the licence line, and nothing on
        the other side, and most of the work in setting one up is drawing that
        line clearly enough that a tired agent at 11 p.m. does not cross it.
      </P>

      <H2 id="licence-line">The licence line</H2>
      <P>
        The NAIC&apos;s{" "}
        <Ext href="https://content.naic.org/sites/default/files/model-law-218.pdf">
          Producer Licensing Model Act
        </Ext>
        , which most states follow in some form, says a person may not
        &quot;sell, solicit or negotiate&quot; insurance without a licence. It
        defines &quot;negotiate&quot; as conferring directly with or offering
        advice to a purchaser about &quot;any of the substantive benefits,
        terms or conditions&quot; of a contract. It exempts employees who
        receive no commission and whose activities are clerical or
        administrative and &quot;only indirectly related&quot; to sales.
      </P>
      <P>
        State regulators have turned that into practical lists. The clearest
        we found is the Oklahoma Insurance Department&apos;s{" "}
        <Ext href="https://www.oid.ok.gov/wp-content/uploads/2019/11/081513_Producer-Licensing-Bulletin-2013-09.pdf">
          Bulletin 2013-09
        </Ext>
        , with an older{" "}
        <Ext href="https://www.tennessee.gov/content/dam/tn/commerce/documents/insurance/bulletins/8-5-85.pdf">
          Tennessee bulletin
        </Ext>{" "}
        making the same distinctions.
      </P>
      <Figure
        src="/blog/insurance-answering-licence-line.svg"
        alt="Two columns. Clerical, anyone may: schedule an appointment with a licensed agent, take a request for coverage to pass on, take factual details of a claim, take factual details for an application, and say what policy records show. Licensed producer only: discuss or explain coverages and terms, advise which coverage, limit or deductible, say coverage is or will be bound, bind coverage or sign a binder, and answer any request for advice"
        width={1200}
        height={630}
        caption="Adapted from Oklahoma Bulletin 2013-09 and Tennessee's bulletin on unlicensed agency personnel. Your state's rules may differ in the details; the shape is the same."
        credit="Illustration by AI Receptionist Now"
      />
      <P>Three details from the regulators are worth quoting:</P>
      <UL>
        <LI>
          Oklahoma: &quot;If an insured or prospective insured requests advice
          in any communication with an unlicensed employee, the response must
          be made by a licensed producer.&quot; That is the script&apos;s
          central rule, written by a regulator.
        </LI>
        <LI>
          Tennessee lists among the things an unlicensed person may not do:
          &quot;Indicate that requested coverage is or will be bound or
          issued&quot;. A reassuring &quot;don&apos;t worry, you&apos;re
          covered&quot; is exactly that.
        </LI>
        <LI>
          New York&apos;s Department of Financial Services, in a{" "}
          <Ext href="https://www.dfs.ny.gov/insurance/ogco2001/rg103051.htm">
            2001 general counsel opinion
          </Ext>
          , said that outside the office an unlicensed employee &quot;may not
          engage in any activity that is not clerical or administrative.&quot;
          An answering service is, by definition, outside your office.
        </LI>
      </UL>
      <P>
        This is enforced. In a{" "}
        <Ext href="https://www.tdi.texas.gov/commissioner/disciplinary-orders/documents/20227341.pdf">
          Texas consent order
        </Ext>
        , investigators from the Department of Insurance called an
        agency&apos;s locations asking for quotes over the phone; the agency
        had allowed unlicensed employees to engage in the business of insurance
        and agreed to an $80,000 administrative penalty. That case was about
        the agency&apos;s own staff, not an answering service, but the test
        call that caught it is the same one anyone can make to yours.
      </P>
      <H3>Quotes are the grey zone</H3>
      <P>
        Rules on quoting vary. Oklahoma allows unlicensed staff to give rate
        quotes from a rate manual but not to advise on &quot;the benefits or
        drawbacks of a particular coverage, deductible, limit&quot;, and
        Tennessee allows quoting rates &quot;as general information&quot;.
        Delaware&apos;s{" "}
        <Ext href="https://Insurance.Delaware.gov/wp-content/uploads/sites/15/2016/11/agentbull3.pdf">
          Agents&apos; Bulletin No. 3
        </Ext>{" "}
        warns about unlicensed telemarketers who go beyond saying a product is
        available and describe its specific benefits or costs. An answering
        service has no rate manual and no reason to quote. The simple rule is
        none: take the request, book the callback.
      </P>

      <H2 id="claims">Claims after hours</H2>
      <P>
        Most night and weekend calls to an agency are about a loss - a car
        accident, a burst pipe, a tree through a roof. The clerical rules allow
        an unlicensed person to take &quot;factual information relative to a
        claim&quot;, so the answering service can log it. But the claim is
        opened by the carrier, and for many carriers that can happen tonight:
      </P>
      <Table
        caption="After-hours claims reporting, as stated on each carrier's own page (checked October 5, 2026)"
        head={["Carrier", "What the page says"]}
        rows={[
          [
            <Ext key="sf" href="https://www.statefarm.com/claims/home-and-property">State Farm</Ext>,
            "Call 800-SF-CLAIM (800-732-5246) 24/7",
          ],
          [
            <Ext key="tr" href="https://piaffinity.travelers.com/affinity/contact/ct">Travelers</Ext>,
            "Report by telephone or online “24 hours a day, 365 days a year”",
          ],
          [
            <Ext key="nw" href="https://www.nationwide.com/personal/contact/call-us/">Nationwide</Ext>,
            "Auto and property claims, 1-800-421-3535, “Anytime”",
          ],
          [
            <Ext key="pg" href="https://www.progressive.com/claims/faq/how-to-report-a-claim/">Progressive</Ext>,
            "A “24/7 reporting tool” online; the auto claims number on that page lists Monday to Friday, 8 a.m. to 8 p.m. ET",
          ],
        ]}
      />
      <P>
        So give the answering service a table of every carrier you write with,
        each one&apos;s claims number and hours, and one instruction: after
        any immediate safety question (is anyone hurt; if so, 911), give the
        caller the carrier&apos;s number, take their details for your file, and
        never say whether the loss is covered. &quot;Is my roof covered?&quot;
        is a request for advice, and it goes to a licensed agent in the
        morning.
      </P>
      <Figure
        src="/blog/insurance-agent-desk-after-storm.webp"
        alt="An insurance agent's desk at the end of a stormy day, with rain on the window, a desk phone with a small glowing light, folders, a notepad and a wet umbrella leaning against the desk"
        width={1376}
        height={768}
        caption="After a storm, the calls come all at once. Hurricane Ian produced 789,066 claims in Florida alone, according to the state's Office of Insurance Regulation."
      />
      <P>
        Catastrophes are where capacity matters. Florida&apos;s Office of
        Insurance Regulation counts{" "}
        <Ext href="https://floir.gov/home/ian">789,066 claims</Ext> and about
        $22.2 billion in estimated insured losses from Hurricane Ian. A small
        agency will not see a fraction of that, but it will see all of its own
        share in the same few days, at the same time as every other agency on
        the same answering service. Ask a provider what happened on its lines
        in the last regional storm, and what a caller hears when every agent
        is busy.
      </P>

      <H2 id="seasons">Medicare and ACA season</H2>
      <P>
        For agencies that sell health and Medicare products, autumn is the
        peak, and the rules are specific.
      </P>
      <UL>
        <LI>
          <Strong>Dates.</Strong> Medicare&apos;s{" "}
          <Ext href="https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan">
            Open Enrollment runs October 15 to December 7
          </Ext>
          . For 2027 Marketplace coverage,{" "}
          <Ext href="https://www.healthcare.gov/quick-guide/dates-and-deadlines/">
            HealthCare.gov
          </Ext>{" "}
          shows applications opening November 1, December 15 as the last day
          to enrol for coverage from January 1, and Open Enrollment ending
          January 15.
        </LI>
        <LI>
          <Strong>The disclaimer.</Strong> Third-party marketing organizations
          must say a standard disclaimer - &quot;We do not offer every plan
          available in your area...&quot; - on sales calls &quot;prior to the
          discussion of any benefits&quot;, under{" "}
          <Ext href="https://www.ecfr.gov/current/title-42/section-422.2267">
            42 CFR 422.2267(e)(41)
          </Ext>
          .
        </LI>
        <LI>
          <Strong>Recording.</Strong> Under{" "}
          <Ext href="https://www.ecfr.gov/current/title-42/section-422.2274">
            42 CFR 422.2274(g)
          </Ext>
          , marketing and sales calls must be recorded in their entirety and
          kept for at least six years.
        </LI>
      </UL>
      <P>
        The safe design is for the answering service to stay out of the sales
        conversation entirely: no benefits, no plan comparisons, no &quot;which
        plan covers my doctor&quot;. It books the caller with a licensed agent
        whose own call is recorded and disclaimed. Whether a call your
        answering service takes counts as a sales call is a question for your
        compliance adviser, not for us; keeping benefits out of it makes the
        question much easier.
      </P>

      <H2 id="data">Data security duties</H2>
      <P>
        An answering service hears names, policy numbers, addresses, claim
        details and sometimes health information. Your agency&apos;s security
        obligations reach it.
      </P>
      <UL>
        <LI>
          <Strong>The NAIC model law.</Strong> The{" "}
          <Ext href="https://content.naic.org/sites/default/files/model-law-668.pdf">
            Insurance Data Security Model Law
          </Ext>{" "}
          requires a licensee to &quot;exercise due diligence in selecting its
          Third-Party Service Provider&quot; and to require the provider to
          protect nonpublic information. The NAIC&apos;s{" "}
          <Ext href="https://content.naic.org/sites/default/files/legal-adoption-map-668-idsm.pdf">
            adoption map
          </Ext>{" "}
          counts 28 adopting jurisdictions. There is a small-agency exemption:
          licensees with fewer than ten employees, including independent
          contractors, are exempt from that section.
        </LI>
        <LI>
          <Strong>New York.</Strong>{" "}
          <Ext href="https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.11">
            23 NYCRR 500.11
          </Ext>{" "}
          requires written policies for the security of information held by
          third-party service providers. The{" "}
          <Ext href="https://dfs.ny.gov/industry_guidance/cybersecurity/pt500_require_checklist_regulated_entities_limited_exemptions">
            limited exemption
          </Ext>{" "}
          for small entities (fewer than 20 employees and contractors, under
          $7.5 million in revenue, or under $15 million in assets) still
          requires assessing third-party providers.
        </LI>
      </UL>
      <P>
        In practice: a written agreement covering confidentiality, where calls
        and recordings are stored and for how long, who can access them, and
        how quickly the provider tells you about a breach. Ask us for the same.
      </P>

      <H2 id="vendors">What providers offer agencies</H2>
      <P>
        We read the insurance or financial-services pages of seven answering
        services on October 5, 2026.
      </P>
      <Table
        caption="Insurance-related claims on providers' own pages (checked October 5, 2026)"
        head={["Provider", "What they say", "Agency software named", "Licensed staff?"]}
        rows={[
          [
            <Ext key="sm" href="https://smith.ai/industries/independent-insurance-agents-answering-service">Smith.ai</Ext>,
            "Captures claim details; does not “provide policy advice or make coverage decisions”",
            "Applied Epic, AMS360, EZLynx",
            "No - advice stays with your licensed agents",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/enterprise/">PATLive</Ext>,
            "Supports First Notice of Loss and claim surges; agents “trained in insurance workflows”",
            "None named",
            "Not stated",
          ],
          [
            <Ext key="ac" href="https://www.answerconnect.com/industries/finance-and-insurance/insurance-brokers">AnswerConnect</Ext>,
            "24/7/365 phone, email and chat",
            "Generic “CRM Integration”",
            "Not stated",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/industries/financial/insurance-call-center/">Specialty Answering Service</Ext>,
            "Over 300 representatives; PCI DSS compliant call center; from $44 a month",
            "None named",
            "Not stated",
          ],
          [
            <Ext key="map" href="https://www.mapcommunications.com/industries/financial/insurance-agencies-claim-adjusters/">MAP Communications</Ext>,
            "24-hour live answering for insurance agents",
            "None named",
            "Not stated",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/industries/financial-services/">Abby Connect</Ext>,
            "Plans from $165 to $1,380 a month",
            "General CRMs (Salesforce, HubSpot)",
            "Not stated",
          ],
          ["Ruby", "No insurance-specific page", "-", "Not stated"],
        ]}
      />
      <P>
        Two observations. First, the only explicit statement on licensing is
        Smith.ai&apos;s, and it is the right one: advice stays with you.
        Second, integrations. Agency management systems do run partner
        programs - Vertafore describes its{" "}
        <Ext href="https://vertafore.com/resources/press-releases/vertafore-announces-orange-partner-program-propel-customer-innovation">
          Orange Partner Program
        </Ext>{" "}
        as open access to its APIs, and HawkSoft reported{" "}
        <Ext href="https://blog.hawksoft.com/partner-api-3.0">
          22 API partners
        </Ext>{" "}
        in 2023 - so an integration is possible. Whether a given provider has
        one, and whether it writes a note or a claim into your system or only
        emails you, is something to see working in the trial. For our part, we
        do not integrate with Applied Epic, AMS360, HawkSoft or EZLynx; we
        book into Google Calendar, Outlook and Cal.com and can send each
        message by webhook.
      </P>
      <P>
        For prices, the published rate cards are in our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          answering service cost comparison
        </Internal>
        , and what thirteen live providers commit to on speed, location and
        contracts is in our{" "}
        <Internal href="/blog/live-answering-service">
          live answering service guide
        </Internal>
        .
      </P>

      <H2 id="script">A script that stays on the right side</H2>
      <P>
        Give your provider these as rules, not suggestions.
      </P>
      <OL>
        <LI>
          <Strong>Safety first on any loss call.</Strong> Is anyone hurt or in
          danger? If so, 911 before anything else.
        </LI>
        <LI>
          <Strong>Claims: carrier number plus your log.</Strong> Give the
          carrier&apos;s claims number from your table; take name, policy
          number if they have it, callback number and a factual description.
        </LI>
        <LI>
          <Strong>Never say covered, not covered, or bound.</Strong> Not
          &quot;you should be fine&quot;, not &quot;that&apos;s usually
          covered&quot;. The line is: &quot;A licensed agent will call you about
          your coverage.&quot;
        </LI>
        <LI>
          <Strong>New business: take the request, book the agent.</Strong>{" "}
          Name, number, line of business, best time. No quotes, no comparisons.
        </LI>
        <LI>
          <Strong>Payments: do not take them.</Strong> Tennessee lists
          accepting premium before coverage is bound among the things an
          unlicensed person may not do. Send payment callers to your portal or
          a callback.
        </LI>
        <LI>
          <Strong>Medicare and health: book, never discuss.</Strong> Especially
          between October 15 and December 7.
        </LI>
        <LI>
          <Strong>Urgent flag.</Strong> Decide what wakes a licensed agent -
          for many agencies, a commercial client whose operation is down, or a
          certificate of insurance needed for a job starting tomorrow - and
          write it down. Our{" "}
          <Internal href="/blog/24-hour-answering-service#emergency-escalation">
            escalation guide
          </Internal>{" "}
          covers how.
        </LI>
      </OL>
      <Callout>
        Then test it. Call your own line after hours and ask &quot;am I covered
        if a tree falls on my car?&quot; The only acceptable answer is a
        callback from a licensed agent. It is the same test a regulator&apos;s
        investigator might make.
      </Callout>

      <H2 id="live-or-ai">Live, AI or both</H2>
      <P>
        A live agent is better at a distressed caller after an accident, and
        many live services can patch a caller through to you, which we cannot:
        our AI takes the message, texts it to you, and can ring your phone for
        a call marked urgent, but it does not connect the caller to you
        mid-call. An AI receptionist is cheaper per call and takes as many calls at once
        as its plan allows - with us, three on the Team plan, which helps a
        small office but will not absorb twenty policyholders calling in the
        same minute after a hailstorm - and it never improvises reassurance
        it was not given, which on an insurance line is a real advantage. Its
        weakness is the unusual call, which it can only route, not handle. Our
        Solo plan is 99 euros a month for 1,000 minutes and answers one call at
        a time; Team is 299 euros and answers three at once (
        <Internal href="/pricing">pricing</Internal>). Many agencies end up
        with software for after-hours logging and appointment booking, and a
        person for anything flagged.
      </P>

      <H2 id="not-verified">What we could not verify</H2>
      <UL>
        <LI>
          <Strong>Your state.</Strong> We read bulletins from Oklahoma,
          Tennessee, Delaware and New York and an enforcement order from Texas.
          We did not find equivalent published lists for California, Florida or
          Washington. The Tennessee bulletin dates from 1985 and the Oklahoma
          one from 2013; both remain on the regulators&apos; sites.
        </LI>
        <LI>
          <Strong>Allstate and Applied.</Strong> Allstate&apos;s claims pages
          and Applied Systems&apos; site were down when we checked, so neither
          is in the tables.
        </LI>
        <LI>
          <Strong>Prices on insurance pages.</Strong> Smith.ai, AnswerConnect,
          MAP and Ruby publish no price on their insurance pages.
        </LI>
        <LI>
          <Strong>Not legal advice.</Strong> Licensing and Medicare marketing
          rules depend on your state, your lines and your contracts with
          carriers. Your compliance adviser decides.
        </LI>
      </UL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
