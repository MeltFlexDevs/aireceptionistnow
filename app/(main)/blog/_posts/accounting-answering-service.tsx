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
  slug: "accounting-answering-service",
  title: "Accounting & Financial Answering Service: What to Check",
  description:
    "For CPA firms, tax preparers and advisers: the deadline-week call peak in IRS data, what §7216, the Safeguards Rule and FINRA mean for a message-taker, and what to put in the contract.",
  date: "2026-10-05",
  updated: "2026-10-05",
  readingTime: "17 min read",
  tag: "Guides",
  hero: "/blog/accounting-firm-tax-season-evening.webp",
  heroAlt:
    "A small accounting office on an April evening, with stacks of manila folders and file boxes, a desk phone, a calculator and desk lamps, and one accountant working alone in the background",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "accounting answering service",
    "financial answering service",
    "answering service for accountants",
    "cpa answering service",
    "tax preparer answering service",
    "answering service for financial advisors",
    "bookkeeping answering service",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "peak", title: "The call peak, in IRS numbers" },
    { id: "confidentiality", title: "A phone message is tax return information" },
    { id: "safeguards", title: "The Safeguards Rule and your answering service" },
    { id: "script", title: "What the script must never do" },
    { id: "advisers", title: "Financial advisers: orders and records" },
    { id: "vendors", title: "What providers offer accounting firms" },
    { id: "seasonal", title: "Paying for a seasonal business" },
    { id: "contract", title: "Six clauses for the contract" },
    { id: "not-verified", title: "What we could not verify" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is an accounting answering service?",
      a: "It is an answering service, live or AI, set up for CPA firms, tax preparers and bookkeepers: it answers in your firm's name, books appointments, takes messages about documents and notices, and routes urgent matters to the right person. What makes it different from a general answering service is the handling of client information. Under Treasury regulations, even a client's name given in connection with a return is tax return information, so the service has to be contracted and scripted with that in mind.",
    },
    {
      q: "Is it legal for a tax preparer to use an answering service?",
      a: "Yes, with care. 26 CFR 301.7216-2(d) lets a preparer disclose tax return information without the client's consent to another preparer providing auxiliary services in connection with return preparation, but only if the recipient is located in the United States and does not make substantive determinations or give advice. The regulation does not mention answering services by name, so whether yours fits is an interpretation to confirm with counsel. Disclosures to anyone outside the US need the client's consent under 301.7216-3. AICPA members must also have a confidentiality contract with the provider or the client's specific consent.",
    },
    {
      q: "Do I need a contract with my answering service under the FTC Safeguards Rule?",
      a: "If your firm is covered, yes. The FTC lists tax preparation firms among the financial institutions covered by the Safeguards Rule, and 16 CFR 314.4(f) requires you to select service providers able to safeguard customer information, require those safeguards by contract, and periodically assess them. An answering service that hears client names, notice details and callback numbers is handling customer information.",
    },
    {
      q: "When is the busiest time for an accounting firm's phones?",
      a: "Public IRS data shows the shape of the season. In 2026, the IRS received 9.0 to 9.8 million individual returns a week from mid-February through late March, 11.4 million in the week ending April 3, 14.5 million the next week and 25.9 million in the deadline week ending April 17 - about 2.2 times the average week. The week after the deadline it fell to 2.0 million. October 15, the extension deadline, is a second, smaller peak for firms with many extensions.",
    },
    {
      q: "Can an answering service take trade orders for a financial adviser?",
      a: "No. FINRA Regulatory Notice 17-30 states that only appropriately registered persons can accept an order from a customer. An unregistered person may transcribe the order details, but a registered person must then contact the customer to confirm them before the order is accepted. FINRA Rule 1230 says accepting customer orders is not a clerical or ministerial function. The script should take a callback request, never an order.",
    },
    {
      q: "How much does an answering service cost for an accounting firm?",
      a: "Published live plans run from about $149 to $395 a month for 100 minutes. Because the work is seasonal, the cheaper approach is a month-to-month plan sized for each season: on published rate cards, 100 minutes a month for nine months and 500 minutes for the three peak months costs about $3,400 to $4,000 a year at Specialty Answering Service and PATLive, against $7,800 to $9,100 for a 500-minute plan all year. AI plans are cheaper again but have their own limits.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "IRS: IRS announces first day of 2026 filing season",
    url: "https://www.irs.gov/newsroom/irs-announces-first-day-of-2026-filing-season-online-tools-and-resources-help-with-tax-filing",
  },
  {
    title: "IRS: filing season statistics by year (weekly releases, 2026)",
    url: "https://www.irs.gov/newsroom/filing-season-statistics-by-year",
  },
  {
    title: "IRS: filing season statistics for week ending April 17, 2026",
    url: "https://www.irs.gov/newsroom/filing-season-statistics-for-week-ending-april-17-2026",
  },
  {
    title: "IRS: if you need more time to file, request an extension (October 15, 2026)",
    url: "https://www.irs.gov/newsroom/if-you-need-more-time-to-file-request-an-extension",
  },
  {
    title: "26 U.S.C. 7216 - disclosure or use of information by preparers of returns (govinfo)",
    url: "https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleF-chap75-subchapA-partI-sec7216.htm",
  },
  {
    title: "26 U.S.C. 6713 - civil penalty for disclosure or use of information by preparers (govinfo)",
    url: "https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleF-chap68-subchapB-partI-sec6713.htm",
  },
  {
    title: "26 CFR 301.7216-1 - definitions, including tax return information and auxiliary services (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-1",
  },
  {
    title: "26 CFR 301.7216-2 - permissible disclosures without consent (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-2",
  },
  {
    title: "FTC: Safeguards Rule - what your business needs to know",
    url: "https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know",
  },
  {
    title: "16 CFR 314.4 - elements of an information security program (eCFR)",
    url: "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314/section-314.4",
  },
  {
    title: "FTC: Safeguards Rule notification requirement now in effect (May 13, 2024)",
    url: "https://www.ftc.gov/business-guidance/blog/2024/05/safeguards-rule-notification-requirement-now-effect",
  },
  { title: "IRS Publication 4557: Safeguarding Taxpayer Data", url: "https://www.irs.gov/pub/irs-pdf/p4557.pdf" },
  { title: "IRS Publication 5708: Creating a Written Information Security Plan", url: "https://www.irs.gov/pub/irs-pdf/p5708.pdf" },
  {
    title: "IRS: taxpayers beware, tax season is prime time for phone scams (Tax Tip 2022-15)",
    url: "https://www.irs.gov/newsroom/taxpayers-beware-tax-season-is-prime-time-for-phone-scams",
  },
  { title: "IRS Tax Topic 652: notice of underreported income - CP2000", url: "https://www.irs.gov/taxtopics/tc652" },
  {
    title: "AICPA Code of Professional Conduct: 1.700.001 and 1.700.040 (third-party service providers)",
    url: "https://pub.aicpa.org/codeofconduct/ethicsresources/et-cod.pdf",
  },
  { title: "FINRA Regulatory Notice 17-30: accepting customer orders", url: "https://www.finra.org/rules-guidance/notices/17-30" },
  { title: "FINRA Rule 1230: associated persons exempt from registration", url: "https://www.finra.org/rules-guidance/rulebooks/finra-rules/1230" },
  {
    title: "SEC: Regulation S-P amendments, small entity compliance guide",
    url: "https://www.sec.gov/files/rules/final/2024/regulation-s-p-small-entity-compliance-guide.pdf",
  },
  { title: "17 CFR 275.204-2 - books and records to be maintained by investment advisers (eCFR)", url: "https://www.ecfr.gov/current/title-17/chapter-II/part-275/section-275.204-2" },
  {
    title: "SEC: remarks of the Director of Enforcement, November 2024 (off-channel communications initiative)",
    url: "https://www.sec.gov/newsroom/speeches-statements/wadhwa-remarks-securities-enforcement-forum-110624",
  },
  { title: "Smith.ai: accounting and bookkeeping answering service", url: "https://smith.ai/industries/accounting-and-bookkeeping-answering-service" },
  { title: "PATLive: financial services answering", url: "https://www.patlive.com/industries/financial-answering-service/" },
  { title: "PATLive: FAQ (upgrade, downgrade or cancel anytime)", url: "https://www.patlive.com/faq/" },
  { title: "Abby Connect: accounting answering service", url: "https://www.abby.com/industries/accounting/" },
  { title: "Specialty Answering Service: tax preparers", url: "https://www.specialtyansweringservice.net/industries/accounting/tax-preparers/" },
  { title: "Specialty Answering Service: pricing", url: "https://www.specialtyansweringservice.net/pricing/" },
  { title: "MAP Communications: tax preparers and accountants", url: "https://www.mapcommunications.com/industries/financial/tax-preparers-accountants/" },
  { title: "Ruby: financial services", url: "https://www.ruby.com/industries/financial-services/" },
  { title: "Karbon: API terms of use (eligible subscription tiers)", url: "https://karbonhq.com/karbon-api-terms-of-use/" },
  { title: "Canopy: API", url: "https://www.getcanopy.com/api/" },
  { title: "U.S. Bureau of Labor Statistics: accountants and auditors, Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
];

export default function Body() {
  return (
    <>
      <Lead>
        Most guides to answering services for accountants say the same two
        things: tax season is busy, and confidentiality matters. Both are true
        and neither helps you choose. So we went to the sources that actually
        constrain a CPA firm&apos;s phone line - IRS filing data, the Treasury
        regulations under section 7216, the FTC Safeguards Rule, the AICPA code
        and, for advisers, FINRA and the SEC - and worked out what each one
        means for the person or software taking your messages. We sell an AI
        receptionist and compete with the providers named here; our own limits
        are stated where they matter.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            In 2026 the IRS received <Strong>25.9 million returns</Strong> in
            the deadline week, about <Strong>2.2 times</Strong> the average week
            of the season. Size coverage for that week, not for March.
          </>,
          <>
            Under Treasury regulations, even a client&apos;s{" "}
            <Strong>name</Strong> given in connection with a return is tax
            return information. A phone message is not exempt.
          </>,
          <>
            The no-consent route for auxiliary services requires the recipient
            to be <Strong>located in the United States</Strong>. Where the
            agents sit is a legal question, not a preference.
          </>,
          <>
            For advisers: an answering service <Strong>cannot accept a trade
            order</Strong>, and a message about one may be a record you must
            keep.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        An <Strong>accounting answering service</Strong> answers your firm&apos;s
        calls when you cannot - during client meetings, after hours and through
        the deadline weeks - books appointments and takes messages. The
        financial-services version does the same for advisers and planners. Any
        competent provider can answer the phone. What separates a good choice
        from a risky one is three things: capacity in the weeks that matter,
        a contract that satisfies the confidentiality rules your firm is under,
        and a script that stops the agent from saying things only you may say.
      </P>
      <P>
        If you are still deciding whether you need a service at all, our{" "}
        <Internal href="/blog/answering-service-for-small-business">
          small business answering service guide
        </Internal>{" "}
        covers that question. This article assumes you have decided and want to
        do it properly.
      </P>

      <H2 id="peak">The call peak, in IRS numbers</H2>
      <P>
        Nobody publishes how many calls accounting firms receive by week. The
        IRS does publish how many returns it receives, every week of the
        season, as cumulative totals. Subtracting one week from the next gives
        the shape of the season - and since clients call their preparer in the
        weeks they are trying to file, it is the best public proxy for when
        your phones are under pressure.
      </P>
      <Figure
        src="/blog/accounting-tax-season-call-peak.svg"
        alt="Bar chart of individual returns the IRS received each week of the 2026 filing season: 9.0 to 9.8 million a week from February 13 to March 27, 11.4 million in the week ending April 3, 14.5 million in the week ending April 10, 25.9 million in the deadline week ending April 17, then 2.0, 1.4 and 1.3 million in the following weeks. The average week from February 13 to April 17 was 11.8 million"
        width={1200}
        height={630}
        caption="Weekly returns received, calculated from the IRS's cumulative 2026 filing season statistics. The deadline week alone brought 18% of all returns received by April 17."
        credit="Chart by AI Receptionist Now from IRS data"
      />
      <P>
        Three things in that chart are useful for planning coverage. The season
        is flat for six weeks - 9.0 to 9.8 million returns a week from
        mid-February to late March - so a modest plan covers it. The last three
        weeks are not: 11.4, 14.5 and then 25.9 million in the week ending
        April 17, which is about 2.2 times the average week. And the drop
        afterwards is abrupt: 2.0 million the following week. Then there is a
        second, smaller deadline - the{" "}
        <Ext href="https://www.irs.gov/newsroom/if-you-need-more-time-to-file-request-an-extension">
          October 15 extension date
        </Ext>{" "}
        - which matters most to firms that file many extensions.
      </P>
      <Callout>
        The capacity question to ask a provider is not &quot;are you available
        24/7&quot; but &quot;how many of my calls can you take at the same
        moment in the second week of April&quot;. Every accounting firm on
        every answering service&apos;s books has the same peak.
      </Callout>

      <H2 id="confidentiality">A phone message is tax return information</H2>
      <P>
        This is the part most guides skip. Section 7216 of the Internal Revenue
        Code makes it a crime for a return preparer to disclose or use tax
        return information without authorisation, and section 6713 adds a civil
        penalty of $250 per disclosure, up to $10,000 a year (higher where
        identity theft is involved). The Treasury regulations define the
        protected information broadly.{" "}
        <Ext href="https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-1">
          26 CFR 301.7216-1(b)(3)
        </Ext>{" "}
        says it means &quot;any information, including, but not limited to, a
        taxpayer&apos;s name, address, or identifying number&quot; furnished in
        connection with the preparation of a return.
      </P>
      <P>
        Read that against a typical message: &quot;Maria Lopez called about her
        2025 return, she got a letter from the IRS, call her back on this
        number.&quot; Every element is protected. So the question is not
        whether your answering service handles tax return information - it
        does - but on what basis you are allowed to share it with them.
      </P>
      <H3>The auxiliary-services route, and its limits</H3>
      <P>
        The regulations allow some disclosures without the client&apos;s
        consent. Under{" "}
        <Ext href="https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-2">
          301.7216-2(d)(1)
        </Ext>
        , a preparer may disclose to another preparer &quot;located in the
        United States&quot; for the purpose of &quot;obtaining or providing
        auxiliary services in connection with the preparation of any tax
        return&quot;, as long as the services are not substantive
        determinations or advice. And 301.7216-1 counts as a preparer anyone
        &quot;engaged in the business of providing auxiliary services in
        connection with the preparation of tax returns&quot;.
      </P>
      <P>
        An answering service that books appointments and passes on messages for
        a tax practice plausibly fits that description. We want to be precise,
        though: the regulation does not mention answering services, so that is
        an interpretation, and your counsel should confirm it for your firm.
        Two consequences follow either way:
      </P>
      <UL>
        <LI>
          <Strong>Location is a legal condition.</Strong> The no-consent route
          requires the recipient to be in the United States. A provider whose
          agents - or whose software&apos;s processing - sit abroad needs the
          client&apos;s consent under 301.7216-3. That is why &quot;where are
          your agents?&quot; matters more for a tax practice than for a
          plumber. Our{" "}
          <Internal href="/blog/live-answering-service#promises">
            live answering service guide
          </Internal>{" "}
          lists what thirteen providers say about agent location.
        </LI>
        <LI>
          <Strong>No advice, ever.</Strong> The moment an agent tells a caller
          what a notice means or whether a deduction is allowed, the service is
          outside the auxiliary-services description.
        </LI>
      </UL>
      <H3>If you are an AICPA member</H3>
      <P>
        The{" "}
        <Ext href="https://pub.aicpa.org/codeofconduct/ethicsresources/et-cod.pdf">
          AICPA Code of Professional Conduct
        </Ext>{" "}
        adds its own requirement. Under interpretation 1.700.040, before
        disclosing confidential client information to a third-party service
        provider, a member should either enter into a contract with the
        provider to maintain confidentiality and provide reasonable assurance of
        appropriate procedures, or obtain specific consent from the client. For
        an answering service, the contract route is the practical one - and it
        means the provider&apos;s standard terms need to say it.
      </P>
      <Figure
        src="/blog/cpa-office-phone-call.webp"
        alt="An accountant in his fifties at a wooden desk in a warm private office, holding a desk-phone handset to his ear and a pen above a blank notepad, listening carefully"
        width={1376}
        height={768}
        caption="The call that matters is the callback. A message should give you enough to call the client back, and nothing that has to be protected for no reason."
      />

      <H2 id="safeguards">The Safeguards Rule and your answering service</H2>
      <P>
        The FTC&apos;s{" "}
        <Ext href="https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know">
          guidance on the Safeguards Rule
        </Ext>{" "}
        lists &quot;tax preparation firms&quot; among the financial
        institutions it covers. The rule&apos;s service-provider section,{" "}
        <Ext href="https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314/section-314.4">
          16 CFR 314.4(f)
        </Ext>
        , requires three things: take reasonable steps to select providers
        capable of maintaining appropriate safeguards, require those safeguards
        by contract, and periodically assess the provider. Since{" "}
        <Ext href="https://www.ftc.gov/business-guidance/blog/2024/05/safeguards-rule-notification-requirement-now-effect">
          May 13, 2024
        </Ext>
        , a security event involving the information of at least 500 consumers
        must also be reported to the FTC within 30 days of discovery.
      </P>
      <P>
        The IRS says the same in practical terms.{" "}
        <Ext href="https://www.irs.gov/pub/irs-pdf/p5708.pdf">
          Publication 5708
        </Ext>
        , its template for a written information security plan, says any
        third-party provider that needs access to client information must meet
        the plan&apos;s standards, and that access should be &quot;the minimum
        required to conduct business&quot;. It even includes
        &quot;Receptionist / Phones/Scheduling&quot; in its sample access list.
        So your answering service belongs in your WISP, with a defined, minimal
        access level. If it is not there today, that is the first thing to fix.
      </P>

      <H2 id="script">What the script must never do</H2>
      <P>
        Most risk on an accounting firm&apos;s phone line is not hackers but a
        friendly agent being helpful. Write these as hard rules:
      </P>
      <OL>
        <LI>
          <Strong>Never take a Social Security number, bank details or a
          password</Strong> over the phone, and never read any back. A callback
          needs a name and a number, nothing else.
        </LI>
        <LI>
          <Strong>Never send documents or confirm what is in a file.</Strong>{" "}
          Publication 5708 warns against responding to unsolicited calls that
          ask for sensitive information, and lists &quot;phone call grooming
          by a bad actor&quot; as a training topic. A caller claiming to be a
          client who needs a copy of last year&apos;s return gets a callback
          from your staff, to the number already on file.
        </LI>
        <LI>
          <Strong>Never interpret a notice.</Strong> Take the notice number (a
          CP2000, a CP14) and the date printed on it, and flag it. Deadlines are
          real: the IRS says to{" "}
          <Ext href="https://www.irs.gov/taxtopics/tc652">
            respond to a CP2000 within 30 days
          </Ext>{" "}
          of the notice date. The agent&apos;s job is to make sure the right
          person sees it the next business day.
        </LI>
        <LI>
          <Strong>Never tell a frightened caller to pay anyone.</Strong> Clients
          ring their accountant after a scam call. The IRS says it will not{" "}
          <Ext href="https://www.irs.gov/newsroom/taxpayers-beware-tax-season-is-prime-time-for-phone-scams">
            call to demand immediate payment
          </Ext>{" "}
          by gift card, prepaid card or wire transfer, or threaten to have
          police arrest you. A safe script line: &quot;Please don&apos;t pay
          anything until [name] has called you back.&quot;
        </LI>
        <LI>
          <Strong>Never give an opinion</Strong> on deductions, refunds, timing
          or what the firm can do. &quot;I&apos;ll make sure [name] calls you
          about that&quot; is always the answer.
        </LI>
      </OL>

      <H2 id="advisers">Financial advisers: orders and records</H2>
      <P>
        For a broker-dealer or registered investment adviser the line is
        sharper.{" "}
        <Ext href="https://www.finra.org/rules-guidance/notices/17-30">
          FINRA Regulatory Notice 17-30
        </Ext>{" "}
        states that &quot;only appropriately registered persons can accept an
        order from a customer&quot;. An unregistered person may transcribe the
        order details, but a registered person must contact the customer to
        confirm them before the order is accepted, and{" "}
        <Ext href="https://www.finra.org/rules-guidance/rulebooks/finra-rules/1230">
          FINRA Rule 1230
        </Ext>{" "}
        says accepting customer orders is not a clerical function. The script
        has one move for anything that sounds like an instruction to buy, sell
        or move money: take a callback request, tell the caller no instruction
        has been accepted, and flag it as urgent.
      </P>
      <P>
        Two further points for advisers:
      </P>
      <UL>
        <LI>
          <Strong>Messages can be records.</Strong> Investment advisers must
          keep written communications relating to recommendations and to the
          placing or execution of orders under{" "}
          <Ext href="https://www.ecfr.gov/current/title-17/chapter-II/part-275/section-275.204-2">
            Rule 204-2(a)(7)
          </Ext>
          . An emailed message from an answering service about a trade is
          worth capturing in your archive like any other. The SEC&apos;s
          enforcement director said in November 2024 that its{" "}
          <Ext href="https://www.sec.gov/newsroom/speeches-statements/wadhwa-remarks-securities-enforcement-forum-110624">
            off-channel communications initiative
          </Ext>{" "}
          had charged more than 100 firms with over $2 billion in penalties.
          Text-message delivery from an answering service to an adviser&apos;s
          personal phone deserves thought for that reason.
        </LI>
        <LI>
          <Strong>The Regulation S-P amendments are now in force.</Strong> The 2024
          amendments require covered institutions to oversee service providers
          and require those providers to give notice of a breach within 72
          hours. The{" "}
          <Ext href="https://www.sec.gov/files/rules/final/2024/regulation-s-p-small-entity-compliance-guide.pdf">
            compliance dates
          </Ext>{" "}
          were December 3, 2025 for larger entities and June 3, 2026 for
          smaller ones, so both have passed. The 72-hour clause belongs in the
          answering-service contract.
        </LI>
      </UL>

      <H2 id="vendors">What providers offer accounting firms</H2>
      <P>
        We read the accounting or financial-services pages of seven providers
        on October 5, 2026. Most acknowledge tax season; none publishes a
        tax-season plan with a price, and none names the practice-management
        software most firms run on.
      </P>
      <Table
        caption="Accounting and financial pages of answering services (checked October 5, 2026)"
        head={["Provider", "Tax season, in their words", "Integrations named", "Price on the page"]}
        rows={[
          [
            <Ext key="sm" href="https://smith.ai/industries/accounting-and-bookkeeping-answering-service">Smith.ai</Ext>,
            "Adds live-agent coverage “during tax season, when call volumes surge”",
            "QuickBooks, Xero and unnamed practice management platforms",
            "No",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/industries/financial-answering-service/">PATLive</Ext>,
            "“Tax season and filing deadlines bring unpredictable call spikes”",
            "Wealth-management CRMs such as Redtail, Wealthbox and Orion",
            "No; month-to-month stated",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/industries/accounting/">Abby Connect</Ext>,
            "Usage stats to forecast “seasonal spikes (like tax season)”",
            "Generic (“CRMs, calendars, and more”)",
            "From $165 for 50 minutes",
          ],
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/industries/accounting/tax-preparers/">Specialty Answering Service</Ext>,
            "Not specific",
            "None named",
            "“About $2.50 a day”",
          ],
          [
            <Ext key="map" href="https://www.mapcommunications.com/industries/financial/tax-preparers-accountants/">MAP Communications</Ext>,
            "Notes availability “isn't always practical” in tax season",
            "Google Calendar, Calendly, Setmore",
            "No",
          ],
          [
            <Ext key="ruby" href="https://www.ruby.com/industries/financial-services/">Ruby</Ext>,
            "Not specific; “strict confidentiality protocols”",
            "None named",
            "No",
          ],
          [
            "AnswerConnect",
            "Not specific",
            "Generic “CRM Integration”",
            "No",
          ],
        ]}
      />
      <P>
        On integrations, the practice-management platforms themselves set the
        terms.{" "}
        <Ext href="https://karbonhq.com/karbon-api-terms-of-use/">Karbon</Ext>{" "}
        limits its API to customers on its Business or Enterprise tiers, and
        excludes Team and trial accounts.{" "}
        <Ext href="https://www.getcanopy.com/api/">Canopy</Ext> publishes an
        API that can read and write clients, contacts, tasks and documents. So
        a provider claiming to &quot;integrate with your practice
        software&quot; should be asked which one, through which API, and to
        show a test message appearing in it during the trial. For the record,
        we do not integrate with Karbon, Canopy, TaxDome or CCH Axcess either:
        we book into Google Calendar, Outlook and Cal.com and can pass a
        message on by webhook.
      </P>

      <H2 id="seasonal">Paying for a seasonal business</H2>
      <P>
        An accounting firm&apos;s call volume is lopsided, and annual contracts
        sized for April waste money in July. Month-to-month plans let you
        change size: PATLive&apos;s FAQ says you can &quot;upgrade, downgrade,
        or cancel anytime&quot;, and Specialty Answering Service is
        month-to-month. Here is what that is worth on their published rate
        cards, for an assumed firm needing about 100 minutes a month for nine
        months and 500 minutes in each of the three peak months.
      </P>
      <Table
        caption="Seasonal versus year-round sizing on published plans (our calculation, October 5, 2026)"
        head={["Provider", "9 months at 100 min + 3 months at 500 min", "500-minute plan all year", "Difference"]}
        rows={[
          ["Specialty Answering Service", "9 x $159 + 3 x $649 = $3,378", "12 x $649 = $7,788", "$4,410"],
          ["PATLive", "9 x $189 + 3 x $759 = $3,978", "12 x $759 = $9,108", "$5,130"],
        ]}
      />
      <P>
        The assumption is ours; use your own phone records from last April.
        Per-minute rates, rounding and fees are compared in our{" "}
        <Internal href="/blog/answering-service-cost#price-comparison">
          answering service cost guide
        </Internal>
        . For an AI service the arithmetic is different: our Solo plan is 99
        euros a month for 1,000 minutes, which would cover both seasons in this
        example - but it answers one call at a time, so a firm whose phones
        ring in parallel in April needs the Team plan at 299 euros, which
        answers three at once (<Internal href="/pricing">pricing</Internal>).
        Concurrency, not minutes, is the number that fails first in the
        deadline week, whoever you buy from.
      </P>

      <H2 id="contract">Six clauses for the contract</H2>
      <P>
        Put these to any provider, us included. They map to the rules above.
      </P>
      <OL>
        <LI>
          <Strong>Confidentiality and safeguards</Strong> in writing, with the
          provider agreeing to maintain them (AICPA 1.700.040; 16 CFR
          314.4(f)).
        </LI>
        <LI>
          <Strong>Location</Strong>: every person and system that hears or
          stores your calls is in the United States, or the provider tells you
          otherwise so you can obtain client consent (301.7216-2(d) and
          301.7216-3).
        </LI>
        <LI>
          <Strong>Breach notice</Strong> to you within 72 hours (Regulation S-P
          for advisers; good practice for everyone, since you have your own
          30-day FTC clock).
        </LI>
        <LI>
          <Strong>Data minimisation</Strong>: what the agents may record, how
          long messages and recordings are kept, and how you get them deleted.
        </LI>
        <LI>
          <Strong>No advice and no orders</Strong>: the provider&apos;s staff
          will not interpret notices, give tax opinions or accept financial
          instructions.
        </LI>
        <LI>
          <Strong>Peak capacity</Strong>: how many simultaneous calls on your
          account in April, and what a caller hears when that is exceeded.
        </LI>
      </OL>

      <H2 id="not-verified">What we could not verify</H2>
      <UL>
        <LI>
          <Strong>Call volumes.</Strong> No public source gives accounting
          firms&apos; call volumes by week. The IRS return counts are a proxy,
          and we have labelled them as one.
        </LI>
        <LI>
          <Strong>TaxDome.</Strong> Its site blocked our requests, so we cannot
          tell you whether it offers a public API. CCH Axcess we did not
          research.
        </LI>
        <LI>
          <Strong>Seasonal plan terms.</Strong> AnswerConnect, Ruby and MAP
          publish no seasonal or month-to-month terms on their accounting
          pages; ask.
        </LI>
        <LI>
          <Strong>The 2027 season.</Strong> The IRS had not announced the
          opening date of the 2027 filing season when we checked.
        </LI>
        <LI>
          <Strong>Not legal advice.</Strong> Whether a given answering service
          is a permitted recipient under section 7216 depends on facts only you
          and your counsel know.
        </LI>
      </UL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
