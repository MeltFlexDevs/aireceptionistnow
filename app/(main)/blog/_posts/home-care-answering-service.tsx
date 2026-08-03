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
  slug: "home-care-answering-service",
  title: "Home Care Answering Service: The 4 a.m. Call-Off Nobody Plans For",
  description:
    "A home care answering service has two jobs on one line - families and caregivers. Here is how call-off and shift-fill handling works, where HIPAA bites, and the clinical line a script must never cross.",
  date: "2026-08-03",
  updated: "2026-08-03",
  readingTime: "15 min read",
  tag: "Industries",
  hero: "/blog/home-care-answering-service-hero.webp",
  heroAlt:
    "A small home care agency office in the early morning before staff arrive - desk phone, closed laptop, a notepad and a coffee cup by a window looking onto a quiet residential street",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "home care answering service",
    "home health answering service",
    "answering service for home care agencies",
    "after hours answering service home care",
    "caregiver call off line",
    "senior care answering service",
    "hospice answering service",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "two-jobs", title: "One line, two completely different callers" },
    { id: "callout-math", title: "The call-off is the volume, and the money" },
    { id: "hipaa", title: "HIPAA: your answering service is a business associate" },
    { id: "clinical-line", title: "The clinical line a script must never cross" },
    { id: "what-it-does", title: "What it does, call by call" },
    { id: "models", title: "Live agents vs AI vs hybrid" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "limits", title: "Where AI loses" },
    { id: "setup", title: "Setting it up" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a home care answering service?",
      a: "It covers a home care, home health or hospice agency's phone line outside office hours and handles two unrelated jobs. On the client side it takes calls from patients, families, discharge planners and referral sources, and escalates anything clinical to the on-call nurse. On the staffing side it takes caregiver calls - shift call-offs, no-shows, running late, clock-in failures, questions about an assignment - and starts the process of filling the shift before it becomes a missed visit. Live bureaus, AI receptionists and hybrids all do it; the staffing half is where they differ most.",
    },
    {
      q: "Why do home care agencies get so many after-hours calls?",
      a: "Because the workforce and the clients are both awake at hours the office is not. Shifts start at 6 a.m. and 7 p.m., caregivers call off the night before or the morning of, and clients live at home where things happen at 3 a.m. Caregiver turnover in the industry has run near 80% - the 2024 Activated Insights benchmarking report put median turnover at 79.2% for 2023 - so a large share of your roster is always new, and new caregivers generate the most questions, the most wrong-address calls and the most no-shows.",
    },
    {
      q: "Can an answering service fill an open shift?",
      a: "It can start the fill, and that is usually the win. It captures the call-off with the fields a scheduler needs - client, shift time, reason, how much notice - notifies the on-call scheduler immediately rather than in the morning, and in a well-configured setup begins calling down your pre-approved backup list for that client. What it should not do is commit a caregiver to a shift they are not cleared for. Assignment rules, competencies, client preferences and overtime exposure belong to your scheduler.",
    },
    {
      q: "Is an answering service HIPAA compliant?",
      a: "It has to be a business associate, with a signed business associate agreement, before it touches a single patient call. Under 45 CFR 160.103 anyone who creates, receives, maintains or transmits protected health information on a covered entity's behalf is a business associate, and an answering service taking patient calls plainly does. Ask any vendor for the BAA, and ask specifically where recordings and transcripts are stored, who at the vendor can read them, and how long they are kept.",
    },
    {
      q: "Can an answering service do nurse triage?",
      a: "No, and a service that offers to is a liability, not a feature. Clinical assessment is for a licensed clinician. The correct behaviour is to recognise a clinical call, capture the facts, and get the on-call nurse on the line - fast, with a written escalation chain behind it. Hospices in particular are required under the Medicare conditions of participation to make nursing and physician services routinely available 24 hours a day, seven days a week, so the escalation path is not optional infrastructure.",
    },
    {
      q: "How much does a home care answering service cost?",
      a: "Live bureaus that specialise in healthcare typically bill per minute - roughly $1 to $3 - or per call, and an agency with a real overnight call-off line usually lands somewhere between $400 and $1,500 a month, more if a flu week doubles the call-offs. AI answering is generally flat, in the $30 to $300 a month range per line, with no meter and no hold queue when six caregivers call off at 5:40 a.m. Against one unfilled shift's worth of billable hours plus the referral relationship it damages, either is cheap - so choose on escalation quality and the BAA, not price.",
    },
    {
      q: "What should happen when a caregiver just does not show up?",
      a: "The service should find out before the client's family does. That means a no-show is detected from your scheduling or EVV system rather than reported by an upset daughter at 8:30 a.m., and it triggers the same path as a call-off: try the caregiver, notify the on-call scheduler, start the backup list, and if the visit will genuinely be missed, call the client and say so honestly. The call nobody wants to make is the one that keeps the account.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "45 CFR 160.103 - Definition of “business associate” (Cornell Legal Information Institute)",
    url: "https://www.law.cornell.edu/cfr/text/45/160.103",
  },
  {
    title:
      "42 CFR 418.100(c)(2) - Hospice condition of participation: services available on a 24-hour basis (Cornell LII)",
    url: "https://www.law.cornell.edu/cfr/text/42/418.100",
  },
  {
    title:
      "Home Care Association of America: median caregiver turnover 79.2% in 2023 (2024 Activated Insights Benchmarking Report)",
    url: "https://www.hcaoa.org/newsletters/home-care-turnover-rate-jumps-to-80hcaoa-is-here-to-help-members",
  },
  {
    title:
      "Medicaid.gov: Electronic Visit Verification (Section 12006 of the 21st Century Cures Act)",
    url: "https://www.medicaid.gov/medicaid/home-community-based-services/home-community-based-services-guidance-additional-resources/electronic-visit-verification",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every guide to home care answering services describes the same imaginary
        caller: a worried family member phoning at night. That caller exists, but
        they are not the volume. The volume is a caregiver at 4:40 a.m. saying
        they cannot make the 6 o&apos;clock shift - and unless someone does
        something in the next eighty minutes, a client with dementia wakes up
        alone and a hospital discharge planner quietly stops sending you
        referrals. We build the AI kind of answering service, so treat this
        critically: here is how the staffing half of the line actually works,
        where HIPAA bites, and the clinical line no script should ever cross.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Two callers, one number:{" "}
            <Strong>clients and families on one path, caregivers on the
            other</Strong>. The second one is where the money leaks.
          </>,
          <>
            A call-off is not a message. It is a{" "}
            <Strong>shift-fill process</Strong> that has to start at 4 a.m., not
            at 9.
          </>,
          <>
            No BAA, no deal. An answering service handling patient calls is a{" "}
            <Strong>business associate under HIPAA</Strong>, full stop.
          </>,
          <>
            <Strong>No script does clinical triage.</Strong> It recognises,
            captures, and gets the on-call nurse on the line.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>home care answering service</Strong> answers an agency&apos;s
        line when the office is closed - evenings, nights, weekends, holidays -
        and during the day when the schedulers are all on other calls. It does
        two things that have nothing to do with each other: it handles client
        and family calls, escalating anything clinical to the on-call nurse; and
        it handles caregiver calls, above all the shift call-off, which it
        captures and pushes into a fill process instead of parking it in a
        voicemail box.
      </P>
      <P>
        Three kinds of agency use the same phrase and have different constraints,
        so it is worth being precise:
      </P>
      <UL>
        <LI>
          <Strong>Non-medical home care</Strong> (private duty, companion care,
          personal care). State-licensed, not Medicare-certified. Highest call-off
          volume, hourly shifts, family is often the payer and the decision
          maker.
        </LI>
        <LI>
          <Strong>Home health</Strong> (skilled nursing and therapy, typically
          Medicare-certified). Visit-based rather than shift-based, clinical
          calls are a much larger share, and the on-call nurse is central.
        </LI>
        <LI>
          <Strong>Hospice.</Strong> Same clinical intensity plus a regulatory
          floor: the Medicare conditions of participation require that{" "}
          <Ext href="https://www.law.cornell.edu/cfr/text/42/418.100">
            nursing services, physician services and drugs and biologicals
            &quot;must be made routinely available on a 24-hour basis 7 days a
            week&quot;
          </Ext>
          . Your after-hours line is part of how you demonstrate that.
        </LI>
      </UL>
      <P>
        If you run a clinic or physician practice rather than an in-home agency,
        our{" "}
        <Internal href="/blog/medical-answering-service">
          medical answering service guide
        </Internal>{" "}
        is the closer fit. This one is about the agency whose staff are in
        somebody&apos;s house at 6 a.m.
      </P>

      <H2 id="two-jobs">One line, two completely different callers</H2>
      <Table
        caption="The two call paths on a home care agency's after-hours line"
        head={["", "Client / family path", "Caregiver / staffing path"]}
        rows={[
          [
            "Peak time",
            "Evenings, and any time something changes at home",
            "4 a.m. to 6 a.m., early evening before night shifts, and all of Sunday",
          ],
          [
            "Typical call",
            "A fall, a medication question, a schedule change, a complaint, a new inquiry",
            "Call-off, running late, wrong address, clock-in failed, pay question",
          ],
          [
            "Cost of a miss",
            "A clinical event handled badly, or a family that calls the competitor next",
            "An unfilled shift: lost billable hours, a client left alone, a referral source lost",
          ],
          [
            "Right outcome",
            "Facts captured, on-call nurse on the line for anything clinical",
            "Call-off logged with the fields a scheduler needs, fill process started immediately",
          ],
          [
            "Script risk",
            "Giving clinical advice, or disclosing more than the caller is entitled to hear",
            "Committing a caregiver to a shift they are not cleared or available for",
          ],
        ]}
      />
      <P>
        Almost every answering service on the market is built for the first
        column. The second column is what an agency actually buys the service
        for, and it is the question to ask in the demo: <em>show me what happens
        when a caregiver calls off ninety minutes before a shift.</em>
      </P>

      <H2 id="callout-math">The call-off is the volume, and the money</H2>
      <P>
        Home care runs on a workforce that turns over constantly. The Home Care
        Association of America, citing the 2024 Activated Insights benchmarking
        report, put{" "}
        <Ext href="https://www.hcaoa.org/newsletters/home-care-turnover-rate-jumps-to-80hcaoa-is-here-to-help-members">
          median caregiver turnover at 79.2% for 2023
        </Ext>
        , up from 77.1% the year before. Whatever this year&apos;s number is in
        your market, the structural fact holds: a large fraction of your roster
        is always in its first months, and that is the population that calls off,
        gets lost, and misreads a schedule.
      </P>
      <P>
        Follow one 4:40 a.m. call-off through to its consequences:
      </P>
      <UL>
        <LI>
          <Strong>The billable hours.</Strong> An unfilled eight-hour shift is
          eight hours you do not bill and cannot bill later. Multiply by the
          number of call-offs in a normal week, then by a flu week.
        </LI>
        <LI>
          <Strong>The client.</Strong> Someone who needs help getting out of bed
          does not simply have a quiet morning. Depending on the care plan, a
          missed visit is a safety event.
        </LI>
        <LI>
          <Strong>The referral source.</Strong> This is the expensive one.
          Discharge planners, case managers and placement agencies send business
          to agencies that do not create problems for them. One
          &quot;nobody showed up&quot; phone call from a family to a case manager
          can end a referral stream that took two years to build.
        </LI>
        <LI>
          <Strong>The overtime.</Strong> Fills found at 5:30 a.m. are expensive
          fills. Fills found at 8:30 a.m. are not fills at all.
        </LI>
      </UL>
      <Callout>
        The difference between a good and a bad after-hours setup is not whether
        the call-off gets recorded. It is whether anybody starts working on it
        before the office opens. A voicemail read at 9 a.m. is an incident
        report, not a solution.
      </Callout>
      <P>
        The general arithmetic of unanswered calls is in{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the cost of a missed call
        </Internal>{" "}
        and{" "}
        <Internal href="/missed-call-calculator">the calculator</Internal> - but
        home care is the unusual case where the missed call is not a lost lead.
        It is a service failure you have already been paid to prevent.
      </P>
      <H3>The category everyone forgets: clock-in failures</H3>
      <P>
        Since{" "}
        <Ext href="https://www.medicaid.gov/medicaid/home-community-based-services/home-community-based-services-guidance-additional-resources/electronic-visit-verification">
          Section 12006 of the 21st Century Cures Act
        </Ext>{" "}
        required states to use electronic visit verification for Medicaid
        personal care and home health services, a steady trickle of after-hours
        calls has nothing to do with care at all: the app will not load, the
        client&apos;s landline is disconnected, the caregiver clocked in at the
        wrong client, GPS put them across the street. These are billing-integrity
        calls disguised as tech support. They should be captured with the visit
        details and routed to whoever fixes EVV exceptions - never escalated to
        the on-call nurse, and never left for the caregiver to sort out alone at
        7 a.m.
      </P>

      <H2 id="hipaa">HIPAA: your answering service is a business associate</H2>
      <P>
        This is not a grey area.{" "}
        <Ext href="https://www.law.cornell.edu/cfr/text/45/160.103">
          45 CFR 160.103
        </Ext>{" "}
        defines a business associate as a person or entity that, on behalf of a
        covered entity, &quot;creates, receives, maintains, or transmits
        protected health information&quot; for a covered function. An answering
        service that takes a call about a named patient&apos;s fall is doing
        exactly that. Consequences worth being concrete about:
      </P>
      <UL>
        <LI>
          <Strong>A signed BAA before the first call.</Strong> Not on the
          roadmap, not &quot;we&apos;re HIPAA compliant&quot; on a marketing
          page. A document.
        </LI>
        <LI>
          <Strong>Recordings and transcripts are PHI too.</Strong> Ask where they
          live, who at the vendor can read them, whether they are used to train
          anything, and what the retention period is. If a vendor cannot answer
          that in one email, that is your answer.
        </LI>
        <LI>
          <Strong>Minimum necessary, on every call.</Strong> The script confirms
          who it is speaking to before it says anything about a client. A
          daughter who is not on the authorised contact list does not get the
          care plan, however reasonable she sounds - she gets a callback from
          someone who can check.
        </LI>
        <LI>
          <Strong>Messages go somewhere controlled.</Strong> Client details
          landing in a personal text thread or an unsecured inbox is the most
          common quiet HIPAA failure in after-hours coverage, and it usually
          starts as a convenience.
        </LI>
      </UL>
      <P>
        None of this is legal advice; your compliance officer and counsel decide
        what is adequate. It is the list of questions that separates a vendor
        who has thought about healthcare from one who has a healthcare landing
        page.
      </P>

      <H2 id="clinical-line">The clinical line a script must never cross</H2>
      <P>
        An answering service - human or AI - is not a clinician and must never
        behave like one. The rule is simple to state and easy to violate under
        pressure: <Strong>recognise, capture, escalate. Never assess, never
        advise.</Strong>
      </P>
      <Table
        caption="Where each call goes"
        head={["Caller says", "Correct handling"]}
        rows={[
          [
            "Chest pain, trouble breathing, stroke signs, uncontrolled bleeding, unresponsive",
            "911 first, in plain language, before anything else - then notify the on-call nurse and the agency",
          ],
          [
            "A fall - client is up and talking",
            "Capture what happened, whether there is pain or a head injury, whether anyone helped them up; on-call nurse now",
          ],
          [
            "“Should she take this pill twice today?”",
            "No answer from the script under any circumstances. On-call nurse, with the medication name and question captured verbatim",
          ],
          [
            "Equipment failure - oxygen, lift, hospital bed",
            "Vendor path plus the on-call nurse; for oxygen, treat as urgent",
          ],
          [
            "Caregiver reports a client change - confusion, refusing care, skin issue",
            "Capture in the caregiver's own words, route to the on-call nurse; this is a clinical report, not a staffing call",
          ],
          [
            "Complaint about a caregiver, or an allegation of harm",
            "Never handled by a script. Straight to a human on-call manager, and into your incident process",
          ],
        ]}
      />
      <P>
        The last row deserves emphasis. Suspected abuse, neglect or exploitation
        is a mandatory reporting matter in every state and belongs to a trained
        human being immediately - no queue, no message, no morning callback. Build
        that as a hard branch, and test it. The mechanics of building any of
        these chains are in our{" "}
        <Internal href="/blog/how-to-set-up-emergency-call-escalation">
          guide to emergency call escalation
        </Internal>
        .
      </P>

      <H2 id="what-it-does">What it does, call by call</H2>
      <UL>
        <LI>
          <Strong>Answers instantly, in parallel.</Strong> At 5:40 a.m. the
          call-offs do not arrive politely one at a time (
          <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
            how parallel answering works
          </Internal>
          ).
        </LI>
        <LI>
          <Strong>Branches immediately</Strong> on caregiver, client or family,
          referral source, or vendor - and verifies identity before any client
          detail is discussed.
        </LI>
        <LI>
          <Strong>Call-off path</Strong>: caregiver name, client and shift,
          start time, reason category, how much notice, whether they can do a
          later shift - then notifies the on-call scheduler and, where you have
          configured it, works your pre-approved backup list for that client.
        </LI>
        <LI>
          <Strong>Client path</Strong>: identity check, nature of the call,
          clinical or not; clinical goes to the on-call nurse, scheduling changes
          get logged, complaints go to a human.
        </LI>
        <LI>
          <Strong>Intake path</Strong>: a discharge planner calling at 6 p.m. on
          a Friday with a Monday start is a referral, and it is time-sensitive.
          Capture hours needed, start date, location, payer, and get a real
          callback commitment on the record.
        </LI>
        <LI>
          <Strong>Logs everything</Strong> - recording, transcript, timestamps -
          into a controlled system, which is also how you show a surveyor or a
          family what was said and when.
        </LI>
        <LI>
          <Strong>Handles the language mix.</Strong> A large share of the
          caregiver workforce is more comfortable in Spanish or another language
          at 4 a.m., and a call-off in the caller&apos;s own language is a
          call-off you actually understand (
          <Internal href="/blog/bilingual-ai-receptionist">
            how bilingual answering works
          </Internal>
          ).
        </LI>
      </UL>

      <H2 id="models">Live agents vs AI vs hybrid</H2>
      <Table
        caption="Answering models for home care, home health and hospice agencies"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Healthcare answering bureau",
            "Agencies wanting a human voice on every family call, with existing HIPAA processes",
            "Per-minute billing that spikes in flu season; hold queues at 5:40 a.m.; operators who take a message but do not start a fill",
          ],
          [
            "AI receptionist",
            "Agencies drowning in call-offs and EVV questions, and anyone whose on-call scheduler is burning out",
            "BAA and data handling must be confirmed in writing; the clinical branch must be a hard stop, not a judgement call",
          ],
          [
            "Hybrid (AI first, human escalation)",
            "Most agencies past a handful of clients - AI takes staffing and routine calls, humans take clinical and complaints",
            "Write the always-human list first: clinical, complaints, abuse allegations, deaths, distressed families",
          ],
          [
            "On-call scheduler with a cell phone",
            "Very small agencies, briefly",
            "It is the single largest cause of on-call burnout in this industry, and the person doing it is usually also working days",
          ],
        ]}
      />
      <P>
        Market pricing is in our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost guide
        </Internal>
        , and our own flat plans are on the{" "}
        <Internal href="/pricing">pricing page</Internal>. You keep your existing
        number either way -{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          forwarding takes about eight minutes
        </Internal>
        .
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <H3>4:42 a.m., caregiver call-off</H3>
      <Callout>
        &quot;Thanks for calling in - are you calling about a shift today? ...
        Yes, the 6 o&apos;clock with Mrs. Alvarez, I&apos;ve been up all night
        sick. I&apos;m sorry to hear that. Just so I get this to the scheduler
        correctly: that&apos;s the 6 a.m. to 2 p.m. today, and you&apos;re not
        able to work any part of it? ... No. Understood. Do you expect to be back
        for your Wednesday shift? ... Probably. I&apos;ve logged it and
        I&apos;m notifying the on-call scheduler right now - they&apos;ll start
        covering it immediately, and someone will confirm with you about
        Wednesday. You don&apos;t need to call anyone else.&quot;
      </Callout>
      <H3>1:15 a.m., daughter calling about a fall</H3>
      <Callout>
        &quot;Before we go further - is your mother conscious and breathing
        normally? ... Yes, she&apos;s sitting up talking. Is she in pain
        anywhere, and did she hit her head? ... Her hip hurts, no head. Okay. If
        that pain gets worse or she can&apos;t bear weight, call 911 - don&apos;t
        wait for us. I&apos;m getting our on-call nurse on the line with you
        now; they can assess this and I can&apos;t. Can I confirm your name and
        your relationship to her while I connect you?&quot;
      </Callout>
      <H3>The sentence that stops the script</H3>
      <Callout>
        &quot;... I think the aide has been taking her money.&quot;{" "}
        <em>
          [No triage, no questions beyond what is needed to reach someone. The
          call goes to a human on-call manager immediately and enters the
          agency&apos;s incident and mandatory-reporting process.]
        </em>
      </Callout>

      <H2 id="limits">Where AI loses (keep a human here)</H2>
      <UL>
        <LI>
          <Strong>Anything clinical.</Strong> The script&apos;s only clinical
          skill is recognising that a call is clinical and moving fast. That is
          a feature, not a limitation - but it means the on-call nurse chain has
          to actually work.
        </LI>
        <LI>
          <Strong>Abuse, neglect or exploitation allegations.</Strong> Human,
          immediately, always.
        </LI>
        <LI>
          <Strong>A death at home.</Strong> Expected or not, this is a person
          call - for the family, and for the caregiver who found them.
        </LI>
        <LI>
          <Strong>Firing, discipline and pay disputes.</Strong> A caregiver
          calling angry about hours or a paycheck is a management conversation.
          Capture and route.
        </LI>
        <LI>
          <Strong>Committing coverage.</Strong> The script may offer a shift from
          a list you pre-approved. It should not promise a family that
          &quot;someone will be there at six&quot; until a named caregiver has
          confirmed. Anyone who asks for a human gets one (
          <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
            how transfers work
          </Internal>
          ).
        </LI>
      </UL>

      <H2 id="setup">Setting it up</H2>
      <OL>
        <LI>
          <Strong>Get the BAA signed first.</Strong> Before configuration,
          before the pilot. If a vendor cannot produce one, the evaluation is
          over and you have saved yourself two weeks.
        </LI>
        <LI>
          <Strong>Write the clinical branch as a hard stop.</Strong> A list of
          what is always 911, what is always the on-call nurse, and the explicit
          instruction that the script never answers a clinical question. This is
          the one page your Director of Nursing should sign off.
        </LI>
        <LI>
          <Strong>Design the call-off flow end to end.</Strong> Fields captured,
          who is notified and how fast, which backup list applies to which
          client, what the caller is told. Decide now whether the service may
          offer shifts or only report them.
        </LI>
        <LI>
          <Strong>Give EVV and pay questions their own bucket.</Strong> They are
          neither clinical nor staffing emergencies, and letting them page the
          on-call nurse is how the nurse learns to ignore pages.
        </LI>
        <LI>
          <Strong>Wire the escalation chain, then test it at 3 a.m.</Strong>{" "}
          Nurse, backup nurse, clinical manager. Deliberately, once, before a
          real call does it for you.
        </LI>
        <LI>
          <Strong>Read a week of transcripts.</Strong> Two things always show up:
          a caller type nobody anticipated, and a place where the script is too
          slow to hand over. Fix both, then extend from nights to daytime
          overflow.
        </LI>
      </OL>
      <P>
        A useful way to size the problem before you buy anything: pull the last
        month of after-hours calls and sort them into four buckets - clinical,
        staffing, EVV and admin, new inquiries. Most agencies are surprised by
        how small the first bucket is and how large the second is, and that
        single count tells you what to buy. Our{" "}
        <Internal href="/blog/after-hours-answering-service">
          after-hours guide
        </Internal>{" "}
        covers the general coverage patterns, and if you want to hear the
        call-off script yourself, the{" "}
        <Internal href="/pricing">plans are month-to-month</Internal>.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
