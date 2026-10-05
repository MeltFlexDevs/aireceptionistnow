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
  slug: "accounting-answering-service",
  title: "Accounting & Financial Answering Service: What to Check",
  description:
    "For CPA firms, tax preparers and advisers: the deadline-week peak in IRS data, what §7216, the Safeguards Rule and FINRA mean for a message-taker, and what to put in the contract.",
  date: "2026-10-05",
  updated: "2026-10-05",
  readingTime: "6 min read",
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
    { id: "peak", title: "Size it for one week in April" },
    { id: "confidentiality", title: "A phone message is tax return information" },
    { id: "script", title: "Five things the script must never do" },
    { id: "advisers", title: "Financial advisers: orders and records" },
    { id: "seasonal", title: "Paying for a seasonal business" },
    { id: "contract", title: "Six clauses for the contract" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "Is it legal for a tax preparer to use an answering service?",
      a: "Yes, with care. 26 CFR 301.7216-2(d) allows disclosure without client consent to another preparer providing auxiliary services, only if the recipient is located in the United States and gives no substantive advice. The rule does not name answering services, so confirm the fit with counsel. Recipients outside the US need client consent. AICPA members also need a confidentiality contract with the provider or the client's specific consent.",
    },
    {
      q: "When is an accounting firm's busiest week?",
      a: "The deadline week. In 2026 the IRS received 25.9 million individual returns in the week ending April 17, about 2.2 times the average week of the season and about as many as the two previous weeks combined. The week after, it fell to 2.0 million.",
    },
    {
      q: "Can an answering service take trade orders for a financial adviser?",
      a: "No. FINRA Regulatory Notice 17-30 says only appropriately registered persons can accept a customer order; an unregistered person may only transcribe it for a registered person to confirm with the customer before it is accepted. The script should take a callback request and tell the caller no instruction has been accepted.",
    },
    {
      q: "How much does an answering service cost for an accounting firm?",
      a: "Sized by season on month-to-month plans - 100 minutes for nine months, 500 for the three peak months - published rate cards come to about $3,400 (Specialty Answering Service) to $4,000 (PATLive) a year, against $7,800 to $9,100 for a 500-minute plan all year.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "IRS: filing season statistics by year (weekly releases, 2026)",
    url: "https://www.irs.gov/newsroom/filing-season-statistics-by-year",
  },
  {
    title: "IRS: filing season statistics for week ending April 17, 2026",
    url: "https://www.irs.gov/newsroom/filing-season-statistics-for-week-ending-april-17-2026",
  },
  {
    title: "IRS: request an extension (October 15, 2026)",
    url: "https://www.irs.gov/newsroom/if-you-need-more-time-to-file-request-an-extension",
  },
  {
    title: "26 U.S.C. 6713 - civil penalty for disclosure by preparers (govinfo)",
    url: "https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleF-chap68-subchapB-partI-sec6713.htm",
  },
  {
    title: "26 CFR 301.7216-1 - definitions, tax return information (eCFR)",
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
    title: "16 CFR 314.4 - service provider oversight and FTC notification (eCFR)",
    url: "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314/section-314.4",
  },
  { title: "IRS Publication 5708: Written Information Security Plan", url: "https://www.irs.gov/pub/irs-pdf/p5708.pdf" },
  {
    title: "IRS: tax season is prime time for phone scams (Tax Tip 2022-15)",
    url: "https://www.irs.gov/newsroom/taxpayers-beware-tax-season-is-prime-time-for-phone-scams",
  },
  { title: "IRS Tax Topic 652: CP2000 response time", url: "https://www.irs.gov/taxtopics/tc652" },
  {
    title: "AICPA Code of Professional Conduct: 1.700.040, third-party service providers",
    url: "https://pub.aicpa.org/codeofconduct/ethicsresources/et-cod.pdf",
  },
  { title: "FINRA Regulatory Notice 17-30: accepting customer orders", url: "https://www.finra.org/rules-guidance/notices/17-30" },
  {
    title: "SEC: Regulation S-P amendments, small entity compliance guide",
    url: "https://www.sec.gov/files/rules/final/2024/regulation-s-p-small-entity-compliance-guide.pdf",
  },
  { title: "17 CFR 275.204-2 - investment adviser books and records (eCFR)", url: "https://www.ecfr.gov/current/title-17/chapter-II/part-275/section-275.204-2" },
  {
    title: "SEC: Director of Enforcement remarks, November 2024 (off-channel communications)",
    url: "https://www.sec.gov/newsroom/speeches-statements/wadhwa-remarks-securities-enforcement-forum-110624",
  },
  { title: "Specialty Answering Service: pricing", url: "https://www.specialtyansweringservice.net/pricing/" },
  { title: "PATLive: pricing", url: "https://www.patlive.com/pricing/" },
  { title: "PATLive: FAQ (upgrade, downgrade or cancel anytime)", url: "https://www.patlive.com/faq/" },
  { title: "Smith.ai: accounting and bookkeeping answering service", url: "https://smith.ai/industries/accounting-and-bookkeeping-answering-service" },
  { title: "Karbon: API terms of use", url: "https://karbonhq.com/karbon-api-terms-of-use/" },
  { title: "Canopy: API", url: "https://www.getcanopy.com/api/" },
];

export default function Body() {
  return (
    <>
      <Lead>
        Any answering service can pick up a CPA firm&apos;s phone. The
        difference is whether it can survive the second week of April, and
        whether sharing your clients&apos; messages with it is allowed under the
        rules your firm is bound by. This guide covers both from the primary
        sources: IRS data, the section 7216 regulations, the FTC Safeguards
        Rule, the AICPA code, FINRA and the SEC. We sell an AI receptionist and
        say where our own product falls short.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            The 2026 deadline week brought <Strong>2.2 times</Strong> an average
            week&apos;s returns. Ask about capacity in that week, not
            &quot;24/7&quot;.
          </>,
          <>
            Even a client&apos;s <Strong>name</Strong> is tax return information.
            The no-consent route requires the provider to be{" "}
            <Strong>in the US</Strong>.
          </>,
          <>
            An answering service <Strong>cannot accept a trade order</Strong>.
          </>,
        ]}
      />

      <H2 id="peak">Size it for one week in April</H2>
      <Figure
        src="/blog/accounting-tax-season-call-peak.svg"
        alt="Bar chart of individual returns the IRS received each week of the 2026 filing season: 9.0 to 9.8 million a week from February 13 to March 27, 11.4 million in the week ending April 3, 14.5 million in the week ending April 10, 25.9 million in the deadline week ending April 17, then 2.0, 1.4 and 1.3 million. The average week from February 13 to April 17 was 11.8 million"
        width={1200}
        height={630}
        caption="Weekly returns, calculated from the IRS's cumulative 2026 filing statistics. Returns are not calls, but no public source counts accountants' calls; this is the nearest proxy."
        credit="Chart by AI Receptionist Now from IRS data"
      />
      <P>
        Seven flat weeks, then three steep ones, then a cliff. The deadline week
        alone brought about as many returns as the two weeks before it combined, and
        every accounting firm on an answering service&apos;s books peaks in the
        same week. So the question for a provider is how many of your calls it
        can take at the same moment in that week, and what the next caller
        hears. The{" "}
        <Ext href="https://www.irs.gov/newsroom/if-you-need-more-time-to-file-request-an-extension">
          October 15 extension deadline
        </Ext>{" "}
        is a second, smaller peak.
      </P>

      <H2 id="confidentiality">A phone message is tax return information</H2>
      <P>
        Under{" "}
        <Ext href="https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-1">
          26 CFR 301.7216-1(b)(3)
        </Ext>
        , tax return information is &quot;any information, including, but not
        limited to, a taxpayer&apos;s name, address, or identifying number&quot;
        furnished in connection with a return. &quot;Maria Lopez called about
        her 2025 return, call her back on this number&quot; is all protected.
        Unauthorised disclosure is a crime under section 7216 and carries a{" "}
        <Ext href="https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleF-chap68-subchapB-partI-sec6713.htm">
          civil penalty of $250 per disclosure
        </Ext>
        , up to $10,000 a year, under section 6713.
      </P>
      <P>
        The lawful basis most firms will rely on is{" "}
        <Ext href="https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ZZ/section-301.7216-2">
          301.7216-2(d)(1)
        </Ext>
        : disclosure without consent to a preparer providing &quot;auxiliary
        services in connection with the preparation of any tax return&quot;.
        It has two conditions, and both decide what you buy:
      </P>
      <UL>
        <LI>
          <Strong>The recipient must be located in the United States.</Strong>{" "}
          Agents - or software processing - abroad means you need client
          consent under 301.7216-3. Our{" "}
          <Internal href="/blog/live-answering-service#promises">
            live answering service comparison
          </Internal>{" "}
          shows which providers state agent location and which do not.
        </LI>
        <LI>
          <Strong>No substantive advice.</Strong> An agent who explains a
          notice is outside the exception.
        </LI>
      </UL>
      <P>
        The regulation does not name answering services, so treat the fit as
        an interpretation to confirm with counsel. Two further duties apply
        regardless:
      </P>
      <UL>
        <LI>
          <Strong>AICPA members</Strong> must have a confidentiality contract
          with the provider or the client&apos;s specific consent (
          <Ext href="https://pub.aicpa.org/codeofconduct/ethicsresources/et-cod.pdf">
            interpretation 1.700.040
          </Ext>
          ).
        </LI>
        <LI>
          <Strong>The FTC Safeguards Rule</Strong>{" "}
          <Ext href="https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know">
            covers tax preparation firms
          </Ext>{" "}
          and requires you to choose providers able to safeguard customer
          information, require it by contract and periodically assess them (
          <Ext href="https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314/section-314.4">
            16 CFR 314.4(f)
          </Ext>
          ). IRS{" "}
          <Ext href="https://www.irs.gov/pub/irs-pdf/p5708.pdf">
            Publication 5708
          </Ext>{" "}
          puts &quot;Receptionist / Phones/Scheduling&quot; in its sample access
          list: your answering service belongs in your written security plan,
          with minimal access.
        </LI>
      </UL>
      <Figure
        src="/blog/cpa-office-phone-call.webp"
        alt="An accountant in his fifties at a wooden desk in a warm private office, holding a desk-phone handset to his ear and a pen above a blank notepad"
        width={1376}
        height={768}
        caption="A message needs a name, a number and a reason to call back. Nothing else."
      />

      <H2 id="script">Five things the script must never do</H2>
      <OL>
        <LI>
          <Strong>Take or read back an SSN, bank details or a password.</Strong>
        </LI>
        <LI>
          <Strong>Send documents or confirm what is in a file.</Strong> A
          &quot;client&quot; asking for last year&apos;s return gets a callback
          to the number on file. Publication 5708 lists &quot;phone call
          grooming by a bad actor&quot; as a training topic.
        </LI>
        <LI>
          <Strong>Interpret an IRS notice.</Strong> Take the notice number and
          the date printed on it and flag it: a CP2000 needs a response{" "}
          <Ext href="https://www.irs.gov/taxtopics/tc652">within 30 days</Ext>{" "}
          of that date.
        </LI>
        <LI>
          <Strong>Let a frightened caller pay anyone.</Strong> The IRS says it
          will not{" "}
          <Ext href="https://www.irs.gov/newsroom/taxpayers-beware-tax-season-is-prime-time-for-phone-scams">
            call to demand immediate payment
          </Ext>{" "}
          by gift card or wire. Line: &quot;Please don&apos;t pay anything until
          [name] has called you back.&quot;
        </LI>
        <LI>
          <Strong>Give any opinion.</Strong> &quot;I&apos;ll make sure [name]
          calls you about that.&quot;
        </LI>
      </OL>

      <H2 id="advisers">Financial advisers: orders and records</H2>
      <UL>
        <LI>
          <Strong>No orders.</Strong>{" "}
          <Ext href="https://www.finra.org/rules-guidance/notices/17-30">
            FINRA Regulatory Notice 17-30
          </Ext>
          : &quot;only appropriately registered persons can accept an order
          from a customer&quot;. The script takes a callback request and tells
          the caller no instruction has been accepted.
        </LI>
        <LI>
          <Strong>Messages can be records.</Strong> Advisers must keep written
          communications about recommendations and orders (
          <Ext href="https://www.ecfr.gov/current/title-17/chapter-II/part-275/section-275.204-2">
            Rule 204-2(a)(7)
          </Ext>
          ). Route answering-service messages into your archived channel, not
          to a personal phone by text: the SEC&apos;s{" "}
          <Ext href="https://www.sec.gov/newsroom/speeches-statements/wadhwa-remarks-securities-enforcement-forum-110624">
            off-channel communications sweep
          </Ext>{" "}
          had charged more than 100 firms with over $2 billion in penalties by
          November 2024.
        </LI>
        <LI>
          <Strong>72-hour breach notice.</Strong> The{" "}
          <Ext href="https://www.sec.gov/files/rules/final/2024/regulation-s-p-small-entity-compliance-guide.pdf">
            Regulation S-P amendments
          </Ext>
          , in force for smaller firms since June 3, 2026, require service
          providers to notify you within 72 hours of a breach. Put it in the
          contract.
        </LI>
      </UL>

      <H2 id="seasonal">Paying for a seasonal business</H2>
      <P>
        Month-to-month plans let you resize by season (PATLive: &quot;upgrade,
        downgrade, or cancel anytime&quot;). Assumed firm: 100 minutes a month
        for nine months, 500 in each of three peak months.
      </P>
      <Table
        caption="Seasonal versus year-round sizing on published plans (our calculation, October 5, 2026)"
        head={["Provider", "Sized by season", "500 minutes all year", "Saved"]}
        rows={[
          [
            <Ext key="sas" href="https://www.specialtyansweringservice.net/pricing/">Specialty Answering Service</Ext>,
            "$3,378",
            "$7,788",
            "$4,410",
          ],
          [
            <Ext key="pat" href="https://www.patlive.com/pricing/">PATLive</Ext>,
            "$3,978",
            "$9,108",
            "$5,130",
          ],
        ]}
      />
      <P>
        With AI the limit is concurrency, not minutes: our Solo plan (99 euros,
        1,000 minutes) answers one call at a time, so a firm whose lines ring
        together in April needs Team (299 euros, three at a time) -{" "}
        <Internal href="/pricing">pricing</Internal>. On integrations: no
        provider page we read names Karbon, Canopy, TaxDome or CCH Axcess.{" "}
        <Ext href="https://www.getcanopy.com/api/">Canopy</Ext> has a public
        API;{" "}
        <Ext href="https://karbonhq.com/karbon-api-terms-of-use/">Karbon</Ext>{" "}
        limits its API to Business and Enterprise tiers. We do not integrate
        with any of them either; we book into Google Calendar, Outlook and
        Cal.com and send messages by webhook.
      </P>

      <H2 id="contract">Six clauses for the contract</H2>
      <OL>
        <LI>Confidentiality and safeguards in writing (AICPA 1.700.040; 16 CFR 314.4(f)).</LI>
        <LI>Every person and system handling your calls is in the US, or you are told so you can get consent.</LI>
        <LI>Breach notice to you within 72 hours.</LI>
        <LI>What is recorded, how long it is kept, how you get it deleted.</LI>
        <LI>No advice, no notice interpretation, no financial instructions accepted.</LI>
        <LI>Simultaneous-call capacity on your account in April, and what overflow callers hear.</LI>
      </OL>
      <P>
        <Strong>Not verified:</Strong> TaxDome blocked our requests; CCH Axcess
        was not researched; the IRS had not announced the 2027 season opening.
        None of this is legal advice.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
