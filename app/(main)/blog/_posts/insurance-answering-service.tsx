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
  slug: "insurance-answering-service",
  title: "Insurance Answering Service: The Licence Line and the Script",
  description:
    "What an unlicensed answerer may say to your clients, per state regulators; how to route claims after hours; Medicare season rules; data-security duties; and what providers really offer.",
  date: "2026-10-05",
  updated: "2026-10-05",
  readingTime: "6 min read",
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
    { id: "licence-line", title: "The licence line" },
    { id: "claims", title: "Claims after hours" },
    { id: "script", title: "The script, in seven rules" },
    { id: "seasons", title: "Medicare and ACA season" },
    { id: "data", title: "Data security duties" },
    { id: "vendors", title: "What providers offer" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What can an answering service say to my insurance clients?",
      a: "Only clerical things: schedule an appointment with a licensed agent, take a request for coverage to pass on, take factual details of a claim or application. Explaining coverage, advising and saying coverage is or will be bound are for licensed producers. Oklahoma Bulletin 2013-09: if an insured asks an unlicensed employee for advice, the response must come from a licensed producer.",
    },
    {
      q: "Can an answering service bind coverage?",
      a: "No. Tennessee's bulletin on unlicensed agency personnel lists binding coverage, accepting premium before coverage is bound, and indicating that coverage is or will be bound among the things an unlicensed person may not do. None of the providers we checked says its receptionists are licensed producers.",
    },
    {
      q: "Should my answering service take insurance claims?",
      a: "It should log the facts and give the caller the carrier's claims number. State Farm and Travelers publish claims reporting around the clock and Nationwide lists its claims line as answered anytime, so the claim can be opened that night.",
    },
    {
      q: "Do Medicare marketing rules affect my answering service?",
      a: "They govern sales calls: a required disclaimer before any benefits are discussed (42 CFR 422.2267(e)(41)) and recording kept for at least six years (42 CFR 422.2274(g)). The simplest design is for the answering service never to discuss benefits and to book the caller with a licensed agent, especially from October 15 to December 7.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "NAIC Producer Licensing Model Act (#218)",
    url: "https://content.naic.org/sites/default/files/model-law-218.pdf",
  },
  {
    title: "Oklahoma Insurance Department: Bulletin 2013-09, unlicensed employees",
    url: "https://www.oid.ok.gov/wp-content/uploads/2019/11/081513_Producer-Licensing-Bulletin-2013-09.pdf",
  },
  {
    title: "Tennessee Department of Commerce and Insurance: insurance activities of unlicensed agency personnel",
    url: "https://www.tennessee.gov/content/dam/tn/commerce/documents/insurance/bulletins/8-5-85.pdf",
  },
  {
    title: "New York DFS general counsel opinion 01-03-03: unlicensed employees outside the office",
    url: "https://www.dfs.ny.gov/insurance/ogco2001/rg103051.htm",
  },
  {
    title: "Texas Department of Insurance: consent order, unlicensed employees quoting by phone",
    url: "https://www.tdi.texas.gov/commissioner/disciplinary-orders/documents/20227341.pdf",
  },
  { title: "State Farm: home and property claims", url: "https://www.statefarm.com/claims/home-and-property" },
  { title: "Travelers: report a claim", url: "https://piaffinity.travelers.com/affinity/contact/ct" },
  { title: "Nationwide: call us", url: "https://www.nationwide.com/personal/contact/call-us/" },
  { title: "Progressive: how to report a claim", url: "https://www.progressive.com/claims/faq/how-to-report-a-claim/" },
  { title: "Florida Office of Insurance Regulation: Hurricane Ian claims data", url: "https://floir.gov/home/ian" },
  { title: "42 CFR 422.2267 - TPMO disclaimer (eCFR)", url: "https://www.ecfr.gov/current/title-42/section-422.2267" },
  { title: "42 CFR 422.2274 - call recording (eCFR)", url: "https://www.ecfr.gov/current/title-42/section-422.2274" },
  { title: "Medicare.gov: Open Enrollment dates", url: "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan" },
  { title: "HealthCare.gov: dates and deadlines for 2027 coverage", url: "https://www.healthcare.gov/quick-guide/dates-and-deadlines/" },
  { title: "NAIC Insurance Data Security Model Law (#668)", url: "https://content.naic.org/sites/default/files/model-law-668.pdf" },
  { title: "NAIC: adoption map for model #668", url: "https://content.naic.org/sites/default/files/legal-adoption-map-668-idsm.pdf" },
  { title: "23 NYCRR 500.11 - third-party service providers (Cornell LII)", url: "https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.11" },
  { title: "Smith.ai: answering service for independent insurance agents", url: "https://smith.ai/industries/independent-insurance-agents-answering-service" },
  { title: "PATLive: enterprise (FNOL and claim surges)", url: "https://www.patlive.com/enterprise/" },
  {
    title: "Vertafore: Orange Partner Program",
    url: "https://vertafore.com/resources/press-releases/vertafore-announces-orange-partner-program-propel-customer-innovation",
  },
  { title: "HawkSoft: Partner API 3.0", url: "https://blog.hawksoft.com/partner-api-3.0" },
];

export default function Body() {
  return (
    <>
      <Lead>
        On an insurance agency&apos;s phone, the risky answer is the helpful
        one. &quot;Don&apos;t worry, you&apos;re covered&quot; is a sentence
        only a licensed producer with binding authority may say, and an
        answering service is neither. This guide is the line regulators draw,
        the after-hours claims routing that keeps you on the right side of it,
        and the script that follows. We sell an AI receptionist and compete
        with the providers mentioned.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            An answering service may <Strong>schedule, pass on requests and log
            facts</Strong>. It may not explain coverage, advise or say a policy
            is bound.
          </>,
          <>
            <Strong>None of the providers we checked</Strong> says its
            receptionists are licensed producers.
          </>,
          <>
            At night, the fastest route for a claim is usually the{" "}
            <Strong>carrier&apos;s own claims line</Strong>.
          </>,
        ]}
      />

      <H2 id="licence-line">The licence line</H2>
      <P>
        The NAIC&apos;s{" "}
        <Ext href="https://content.naic.org/sites/default/files/model-law-218.pdf">
          Producer Licensing Model Act
        </Ext>{" "}
        bars anyone without a licence from selling, soliciting or negotiating
        insurance - &quot;negotiate&quot; includes offering advice on
        &quot;any of the substantive benefits, terms or conditions&quot; - and
        exempts staff whose work is clerical. State regulators have turned that
        into lists.
      </P>
      <Figure
        src="/blog/insurance-answering-licence-line.svg"
        alt="Two columns. Clerical, anyone may: schedule an appointment with a licensed agent, take a request for coverage to pass on, take factual details of a claim, take factual details for an application, and say what policy records show. Licensed producer only: discuss or explain coverages and terms, advise which coverage, limit or deductible, say coverage is or will be bound, bind coverage or sign a binder, and answer any request for advice"
        width={1200}
        height={630}
        caption="Adapted from Oklahoma Bulletin 2013-09 and Tennessee's bulletin on unlicensed agency personnel. Details vary by state; the shape does not."
        credit="Illustration by AI Receptionist Now"
      />
      <UL>
        <LI>
          <Ext href="https://www.oid.ok.gov/wp-content/uploads/2019/11/081513_Producer-Licensing-Bulletin-2013-09.pdf">
            Oklahoma
          </Ext>
          : &quot;If an insured or prospective insured requests advice in any
          communication with an unlicensed employee, the response must be made
          by a licensed producer.&quot;
        </LI>
        <LI>
          <Ext href="https://www.tennessee.gov/content/dam/tn/commerce/documents/insurance/bulletins/8-5-85.pdf">
            Tennessee
          </Ext>{" "}
          forbids unlicensed staff to &quot;indicate that requested coverage is
          or will be bound or issued&quot;, or to accept premium before a
          licensed agent has bound it.
        </LI>
        <LI>
          <Ext href="https://www.dfs.ny.gov/insurance/ogco2001/rg103051.htm">
            New York
          </Ext>
          : outside the office, an unlicensed employee &quot;may not engage in
          any activity that is not clerical or administrative&quot;. An
          answering service is outside your office by definition.
        </LI>
      </UL>
      <P>
        It is enforced by test call. Texas Department of Insurance
        investigators phoned an agency&apos;s locations asking for quotes;
        the agency had let unlicensed staff do insurance business and{" "}
        <Ext href="https://www.tdi.texas.gov/commissioner/disciplinary-orders/documents/20227341.pdf">
          paid an $80,000 penalty
        </Ext>
        . That case involved the agency&apos;s own staff, but anyone can make
        the same call to your answering service.
      </P>

      <H2 id="claims">Claims after hours</H2>
      <P>
        Logging &quot;factual information relative to a claim&quot; is
        clerical. Opening the claim is the carrier&apos;s job, and many
        carriers take claims all night:
      </P>
      <Table
        caption="After-hours claims reporting on carriers' own pages (checked October 5, 2026)"
        head={["Carrier", "What the page says"]}
        rows={[
          [
            <Ext key="sf" href="https://www.statefarm.com/claims/home-and-property">State Farm</Ext>,
            "800-SF-CLAIM (800-732-5246), 24/7",
          ],
          [
            <Ext key="tr" href="https://piaffinity.travelers.com/affinity/contact/ct">Travelers</Ext>,
            "By phone or online, “24 hours a day, 365 days a year”",
          ],
          [
            <Ext key="nw" href="https://www.nationwide.com/personal/contact/call-us/">Nationwide</Ext>,
            "1-800-421-3535, “Anytime”",
          ],
          [
            <Ext key="pg" href="https://www.progressive.com/claims/faq/how-to-report-a-claim/">Progressive</Ext>,
            "Online tool 24/7; the auto claims number on that page lists weekdays 8 a.m.-8 p.m. ET",
          ],
        ]}
      />
      <P>
        Give your provider this table for every carrier you write with. After
        a storm the calls arrive together: Hurricane Ian produced{" "}
        <Ext href="https://floir.gov/home/ian">789,066 claims</Ext> in Florida.
        Ask the provider what happened on its lines in the last regional storm.
      </P>
      <Figure
        src="/blog/insurance-agent-desk-after-storm.webp"
        alt="An insurance agent's desk at the end of a stormy day, with rain on the window, a desk phone with a small glowing light, folders, a notepad and a wet umbrella"
        width={1376}
        height={768}
        caption="Every agency on the same answering service gets the same storm at the same time."
      />

      <H2 id="script">The script, in seven rules</H2>
      <OL>
        <LI><Strong>Loss call: is anyone hurt?</Strong> If so, 911 first.</LI>
        <LI>
          <Strong>Claims:</Strong> give the carrier&apos;s claims number; log
          name, policy number if known, callback number and what happened.
        </LI>
        <LI>
          <Strong>Never say covered, not covered or bound.</Strong> The line:
          &quot;A licensed agent will call you about your coverage.&quot;
        </LI>
        <LI><Strong>New business:</Strong> name, number, line of business, best time. No quotes.</LI>
        <LI><Strong>Payments:</Strong> do not take them; send to your portal or a callback.</LI>
        <LI><Strong>Medicare and health:</Strong> book with a licensed agent, never discuss plans.</LI>
        <LI>
          <Strong>Urgent:</Strong> decide in writing what wakes an agent - say,
          a commercial client shut down, or a certificate of insurance needed
          for a job tomorrow. See our{" "}
          <Internal href="/blog/24-hour-answering-service#emergency-escalation">
            escalation guide
          </Internal>
          .
        </LI>
      </OL>
      <Callout>
        Then call your own line after hours and ask &quot;am I covered if a
        tree falls on my car?&quot; The only acceptable answer is a callback
        from a licensed agent.
      </Callout>

      <H2 id="seasons">Medicare and ACA season</H2>
      <UL>
        <LI>
          <Ext href="https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan">
            Medicare Open Enrollment
          </Ext>
          : October 15 to December 7. Marketplace coverage for 2027 (
          <Ext href="https://www.healthcare.gov/quick-guide/dates-and-deadlines/">
            HealthCare.gov
          </Ext>
          ): opens November 1, December 15 for a January 1 start, ends January
          15.
        </LI>
        <LI>
          On Medicare sales calls, third-party marketing organizations must
          give a standard disclaimer &quot;prior to the discussion of any
          benefits&quot; (
          <Ext href="https://www.ecfr.gov/current/title-42/section-422.2267">
            42 CFR 422.2267(e)(41)
          </Ext>
          ) and record the call, keeping it at least six years (
          <Ext href="https://www.ecfr.gov/current/title-42/section-422.2274">
            42 CFR 422.2274(g)
          </Ext>
          ).
        </LI>
      </UL>
      <P>
        Keep the answering service out of that conversation entirely. Whether a
        call it takes counts as a sales call is your compliance adviser&apos;s
        question; never discussing benefits makes it an easy one.
      </P>

      <H2 id="data">Data security duties</H2>
      <P>
        In the{" "}
        <Ext href="https://content.naic.org/sites/default/files/legal-adoption-map-668-idsm.pdf">
          28 jurisdictions
        </Ext>{" "}
        that have adopted the NAIC{" "}
        <Ext href="https://content.naic.org/sites/default/files/model-law-668.pdf">
          Insurance Data Security Model Law
        </Ext>
        , you must exercise due diligence in selecting service providers and
        require them to protect nonpublic information - unless you have fewer
        than ten employees and contractors, which exempts you from that
        section. New York&apos;s{" "}
        <Ext href="https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.11">
          23 NYCRR 500.11
        </Ext>{" "}
        requires written third-party provider policies, and even small
        agencies with a limited exemption must assess providers. In practice:
        a written agreement on confidentiality, where recordings are stored,
        for how long, and how fast you hear about a breach.
      </P>

      <H2 id="vendors">What providers offer</H2>
      <P>
        Of the insurance pages we read on October 5, 2026, only{" "}
        <Ext href="https://smith.ai/industries/independent-insurance-agents-answering-service">
          Smith.ai
        </Ext>{" "}
        addresses licensing, and correctly: its staff do not &quot;provide
        policy advice or make coverage decisions&quot;. It is also the only
        one naming agency software (Applied Epic, AMS360, EZLynx).{" "}
        <Ext href="https://www.patlive.com/enterprise/">PATLive</Ext> mentions
        first notice of loss and claim surges. AnswerConnect, Specialty
        Answering Service, MAP, Abby Connect and Ruby say nothing on licensing
        or agency software. Integrations are possible - Vertafore runs an{" "}
        <Ext href="https://vertafore.com/resources/press-releases/vertafore-announces-orange-partner-program-propel-customer-innovation">
          API partner program
        </Ext>{" "}
        and HawkSoft reported{" "}
        <Ext href="https://blog.hawksoft.com/partner-api-3.0">22 API partners</Ext>{" "}
        in 2023 - so ask to see one work during the trial.
      </P>
      <P>
        Our own limits: we do not integrate with any agency management system
        (we book into Google Calendar, Outlook and Cal.com and send messages by
        webhook), and we do not patch callers through live. AI never
        improvises reassurance it was not given, which suits an insurance line;
        it handles unusual calls worse than a good person. Solo answers one
        call at a time, Team three (<Internal href="/pricing">pricing</Internal>
        ). Speed, location and price for live providers are compared in our{" "}
        <Internal href="/blog/live-answering-service">
          live answering service guide
        </Internal>
        .
      </P>
      <P>
        <Strong>Not verified:</Strong> we found no published unlicensed-staff
        lists for California, Florida or Washington; Allstate&apos;s and
        Applied Systems&apos; sites were down. The Tennessee bulletin dates from
        1985 and remains on the regulator&apos;s site. Not legal advice.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
