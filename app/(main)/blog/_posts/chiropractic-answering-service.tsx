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
  slug: "chiropractic-answering-service",
  title: "Chiropractic Answering Service: What It Must Never Say",
  description:
    "What a chiropractic answering service should handle, seven sentences it must never say about symptoms, Medicare and price, and red flags that are not a booking.",
  date: "2026-10-01",
  updated: "2026-10-01",
  readingTime: "17 min read",
  tag: "Industries",
  hero: "/blog/chiropractic-answering-service-hero.webp",
  heroAlt:
    "An empty chiropractic clinic front desk in morning light, with a desk phone, a closed appointment book and a small spine model on the counter, an adjusting table visible through the open doorway behind",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "chiropractic answering service",
    "chiropractor answering service",
    "answering service for chiropractors",
    "chiropractic virtual receptionist",
    "after hours answering service chiropractor",
    "chiropractic phone answering service",
    "AI receptionist for chiropractors",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "the-phone", title: "Why the phone goes unanswered" },
    { id: "what-it-handles", title: "What it should handle" },
    { id: "never-say", title: "Seven sentences it must never say" },
    { id: "red-flags", title: "Red flags are not a booking" },
    { id: "money-questions", title: "Medicare, insurance and price questions" },
    { id: "hipaa", title: "HIPAA, messages and reminders" },
    { id: "integrations", title: "The integration claim to check" },
    { id: "models", title: "Live agents vs AI vs hybrid" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "setup", title: "Setting it up" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a chiropractic answering service?",
      a: "It answers a chiropractic office's phone when the front desk cannot - during adjustments, at lunch, in the evening and at weekends. It books and reschedules appointments, takes messages, answers factual questions about hours, location and intake, and passes anything clinical to the chiropractor. It can be a live answering bureau, an AI receptionist, or a combination. What separates a good one from a generic one is a written list of what the service may not say, and a tested route for calls that are not routine.",
    },
    {
      q: "Can an answering service give advice about back or neck pain?",
      a: "No. State rules reserve diagnosis and treatment decisions for the licensed chiropractor. California's regulation states that unlicensed individuals are not permitted to diagnose or analyze and may not render a conclusion about a patient's physical condition. Texas rules say a licensee may not delegate responsibility to render a diagnosis or prescribe a treatment plan. A phone script, human or AI, records what the caller says in the caller's own words and routes it. It does not suggest ice, heat, stretches, or that something can wait.",
    },
    {
      q: "What should happen when a caller describes an emergency symptom?",
      a: "The script should stop booking. Sudden numbness or weakness on one side, trouble speaking or seeing, loss of bladder or bowel control, numbness in the groin or saddle area, weakness in both legs, or chest pain are emergency signs, and the caller should be told to call 911. Other warning signs, such as a recent accident, pain getting rapidly worse, or a new severe headache with neck pain, should be flagged to the chiropractor before any routine appointment is offered. The chiropractor writes and signs this list; the service follows it.",
    },
    {
      q: "Can it tell a caller whether Medicare covers chiropractic?",
      a: "Only by reading what you have written down, and only the facts. Medicare Part B covers manual manipulation of the spine by a chiropractor to correct a subluxation, and Medicare's own page states it does not cover other services or tests a chiropractor orders, including X-rays, massage therapy and acupuncture. Maintenance therapy is not payable. A script should state that much, never say that a particular visit will be covered, and offer a callback from whoever handles billing.",
    },
    {
      q: "Does a chiropractor need a BAA with an answering service?",
      a: "If the practice is a HIPAA covered entity, yes. A chiropractor who transmits health information electronically in connection with a standard transaction, such as billing an insurer, is a covered entity, and a service that receives patient information on the practice's behalf fits the regulatory definition of a business associate. That relationship has to be documented in a written agreement. Ask for the BAA before the first call is forwarded, and ask where recordings and transcripts are stored and for how long.",
    },
    {
      q: "Can an answering service book straight into ChiroTouch or Jane?",
      a: "Check before you believe it. As of October 2026 Jane states that it does not have an open API and runs an approval-based partner program instead, and ChiroTouch's own marketplace page lists its Scheduling and Intake category as coming soon. Some answering services advertise integrations with both. Ask the vendor to show a live appointment being written into your system during the demo. If it cannot, the realistic options are a shared calendar, a booking link, or a message your front desk enters in the morning.",
    },
    {
      q: "How much does a chiropractic answering service cost?",
      a: "Live answering services publish plans from about $149 to $395 a month for 100 minutes, with overage from roughly $1.20 to $3 a minute, and the bill depends heavily on how each service rounds call time. AI receptionists are usually flat-rate; ours is 99 euros a month including 1,000 minutes. A solo office mostly needs lunch, adjustment-time and evening coverage, which is a few hundred minutes a month. Our medical answering service pricing guide walks through the published rate cards line by line.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "National Board of Chiropractic Examiners: Practice Analysis of Chiropractic 2025",
    url: "https://www.nbce.org/wp-content/uploads/Practice-Analysis-of-Chiropractic-2025.pdf",
  },
  {
    title:
      "Chiropractic Economics: 28th Annual Salary and Expense Survey (2025, 107 respondents)",
    url: "https://www.chiroeco.com/ce-annual-salary-and-expense-survey/",
  },
  {
    title: "American Chiropractic Association: Key Facts",
    url: "https://www.acatoday.org/news-publications/newsroom/key-facts/",
  },
  {
    title:
      "American Association of Neurological Surgeons: Cauda Equina Syndrome (red flag symptoms)",
    url: "https://www.aans.org/patients/conditions-treatments/cauda-equina-syndrome/",
  },
  {
    title: "NHS: Back pain - when to call emergency services",
    url: "https://www.nhs.uk/conditions/back-pain/",
  },
  {
    title: "CDC: Signs and Symptoms of Stroke",
    url: "https://www.cdc.gov/stroke/signs-symptoms/index.html",
  },
  {
    title:
      "Biller et al., Cervical Arterial Dissections and Association With Cervical Manipulative Therapy: AHA/ASA scientific statement, Stroke 2014;45(10):3155-74",
    url: "https://pubmed.ncbi.nlm.nih.gov/25104849/",
  },
  {
    title:
      "California Code of Regulations, title 16, section 312 - Illegal Practice (Cornell Legal Information Institute)",
    url: "https://www.law.cornell.edu/regulations/california/16-CCR-312",
  },
  {
    title:
      "Texas Administrative Code, title 22, section 78.3 - General Delegation of Responsibility (Cornell LII)",
    url: "https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-78-3",
  },
  {
    title:
      "New York State Education Department, Office of the Professions: Chiropractic practice alert - Use of Unlicensed Individuals",
    url: "https://www.op.nysed.gov/professions/chiropractic/practice-alerts/use-of-unlicensed-individuals",
  },
  {
    title: "Medicare.gov: Chiropractic services coverage",
    url: "https://www.medicare.gov/coverage/chiropractic-services",
  },
  {
    title:
      "CMS Medicare Benefit Policy Manual, Chapter 15 (sections 30.5 and 240 - chiropractic coverage, AT modifier, maintenance therapy)",
    url: "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c15.pdf",
  },
  {
    title:
      "CMS: Medicare documentation checklist and guidelines for chiropractic doctors (MLN1232664, April 2025)",
    url: "https://www.cms.gov/files/document/mln1232664-medicare-documentation-checklist-guidelines-chiropractic-doctors.pdf",
  },
  {
    title:
      "45 CFR 149.610 - Good faith estimates for uninsured (or self-pay) individuals (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-149.610",
  },
  {
    title: "CMS: What is a good faith estimate? (timing rules)",
    url: "https://www.cms.gov/medical-bill-rights/help/guides/good-faith-estimate",
  },
  {
    title:
      "45 CFR 160.103 - definitions of covered entity and business associate (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-160.103",
  },
  {
    title:
      "45 CFR 164.502 - minimum necessary and business associate contracts (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-164.502",
  },
  {
    title:
      "HHS: May health care providers leave messages for patients? (HIPAA FAQ 198)",
    url: "https://www.hhs.gov/hipaa/for-professionals/faq/198/may-health-care-providers-leave-messages/index.html",
  },
  {
    title:
      "47 CFR 64.1200(a)(9)(iv) - conditions for exempt healthcare calls and texts under the TCPA (eCFR)",
    url: "https://www.ecfr.gov/current/title-47/section-64.1200",
  },
  {
    title: "Jane: Integrations Hub FAQ (no open API)",
    url: "https://jane.app/guide/integrations-hub-faq",
  },
  {
    title: "ChiroTouch: Marketplace (integration categories)",
    url: "https://www.chirotouch.com/marketplace",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        The pages that sell chiropractic answering services all promise the
        same thing: no more missed new patients. That part is easy. The part
        nobody writes about is the caller who says her foot has gone numb, or
        asks whether Medicare will pay, or wants to know if it is safe to wait
        until Monday - and gets an answer from someone who is not a
        chiropractor. This guide is built around those calls. We make an AI
        receptionist, so we have a stake in the outcome; the rules and clinical
        sources below are linked so you can read them without us.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            The value of the service is in routine calls. The risk is in{" "}
            <Strong>seven sentences</Strong> that sound helpful and are not the
            script&apos;s to say.
          </>,
          <>
            <Strong>Red flags are not a booking.</Strong> Stroke signs and loss
            of bladder or bowel control are a 911 call; other warning signs go
            to the chiropractor before any slot is offered.
          </>,
          <>
            Coverage and price questions get <Strong>facts from a written
            sheet</Strong>, never a promise. Medicare covers spinal manipulation
            to correct a subluxation and little else a chiropractor orders.
          </>,
          <>
            Before you believe &quot;integrates with ChiroTouch and Jane&quot;,{" "}
            <Strong>ask to watch an appointment being written</Strong>.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>chiropractic answering service</Strong> answers your line when
        your front desk cannot, books and moves appointments, takes messages and
        answers factual questions. It should do nothing clinical: no opinion on
        what a symptom is, no advice on what to do about it, no reassurance that
        it can wait. For most calls that boundary never comes up. For the few
        where it does, the service needs a written list from you of what counts
        as an emergency, what must reach you before a routine visit is booked,
        and what it may say about insurance and price.
      </P>
      <P>
        A general medical practice has the same problem on a larger scale; our{" "}
        <Internal href="/blog/medical-answering-service">
          medical answering service guide
        </Internal>{" "}
        covers that. Chiropractic has its own shape - a very small team, a large
        self-pay share, and a set of musculoskeletal symptoms where the
        dangerous version and the routine version sound alike on the phone.
      </P>

      <H2 id="the-phone">Why the phone goes unanswered</H2>
      <P>
        Because there is usually nobody free to answer it. In the National Board
        of Chiropractic Examiners&apos;{" "}
        <Ext href="https://www.nbce.org/wp-content/uploads/Practice-Analysis-of-Chiropractic-2025.pdf">
          2025 Practice Analysis
        </Ext>
        , a survey of 3,876 chiropractors, 49% worked in a single-doctor office,
        and the average was 100 patient visits per chiropractor per week. The
        smaller{" "}
        <Ext href="https://www.chiroeco.com/ce-annual-salary-and-expense-survey/">
          Chiropractic Economics salary and expense survey
        </Ext>{" "}
        (107 self-selected respondents, so treat it as indicative) describes the
        typical practice as seeing 138 patients a week and attracting seven new
        patients a week, with solo practices reporting two employees.
      </P>
      <P>
        Put those together and the arithmetic is plain. One or two people run
        the desk, the therapy bay, check-in and check-out for a hundred-plus
        visits a week, and the phone rings while both of them have their hands
        full. Those seven new patients a week mostly start as a phone call or a
        web form. We are not going to quote a statistic for how many
        chiropractic calls go unanswered, because we could not find one that
        does not come from a company selling the cure. Your phone system&apos;s
        call log will give you your own number in five minutes, and it is the
        only one that matters.
      </P>
      <Figure
        src="/blog/chiropractic-adjusting-room.webp"
        alt="A chiropractor in dark scrubs standing beside a patient who sits on the edge of an adjusting table, one hand near the patient's shoulder as they talk before treatment, a spine model on a shelf behind"
        width={1376}
        height={768}
        caption="The reason the phone rings out. In a one-doctor office the person a caller wants is in a treatment room, and the person at the desk is often in the next one."
      />

      <H2 id="what-it-handles">What it should handle</H2>
      <UL>
        <LI>
          <Strong>New patient calls.</Strong> Name, phone number, what brings
          them in <em>in their own words</em>, how they heard of you, whether
          they plan to use insurance, and a booked first visit or a firm
          callback time.
        </LI>
        <LI>
          <Strong>Reschedules and cancellations.</Strong> The bulk of call
          volume in a practice built on repeat visits. Offer the next opening
          rather than just deleting the slot.
        </LI>
        <LI>
          <Strong>Factual questions.</Strong> Hours, address, parking, what to
          bring, whether you see children, whether you take a named insurance
          plan - from a sheet you wrote, not from inference.
        </LI>
        <LI>
          <Strong>Messages for the doctor.</Strong> Existing patients with a
          question about their care. Captured verbatim, not answered.
        </LI>
        <LI>
          <Strong>Accident and injury intake.</Strong> A caller after a car
          accident or a work injury is both a higher-value case and a clinical
          flag. Capture the date, what happened and who is paying, and route it
          to the doctor rather than into the next free slot.
        </LI>
        <LI>
          <Strong>After-hours coverage.</Strong> Evenings and Saturdays are when
          working patients call. See our{" "}
          <Internal href="/blog/after-hours-answering-service">
            after-hours answering guide
          </Internal>{" "}
          for the coverage patterns.
        </LI>
        <LI>
          <Strong>Calls in Spanish.</Strong> If your community needs it, check
          how the service actually delivers it (
          <Internal href="/blog/bilingual-answering-service">
            what &quot;bilingual&quot; means in practice
          </Internal>
          ).
        </LI>
      </UL>

      <H2 id="never-say">Seven sentences it must never say</H2>
      <P>
        Each of these is something a friendly, well-meaning person on the phone
        says naturally. Each has a rule or a primary source behind why it does
        not belong in the script.
      </P>
      <Table
        caption="What the script must not say, and what it says instead"
        head={["Never", "Why", "Instead"]}
        rows={[
          [
            <Strong key="1">&quot;That sounds like sciatica.&quot;</Strong>,
            <>
              Naming a condition is diagnosis.{" "}
              <Ext href="https://www.law.cornell.edu/regulations/california/16-CCR-312">
                California&apos;s rule
              </Ext>{" "}
              says unlicensed individuals &quot;are not permitted to diagnose,
              analyze, or perform a chiropractic adjustment&quot;
            </>,
            "“I'll note exactly what you've described so the doctor sees it before your visit.”",
          ],
          [
            <Strong key="2">&quot;Try ice and some gentle stretching until then.&quot;</Strong>,
            <>
              That is a treatment recommendation.{" "}
              <Ext href="https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-78-3">
                Texas rules
              </Ext>{" "}
              say a licensee &quot;may not delegate responsibility to render a
              diagnosis, prescribe a treatment plan, or perform
              adjustments&quot;
            </>,
            "“I'm not able to advise on that, but I can get your question to the doctor today.”",
          ],
          [
            <Strong key="3">&quot;You should be fine to wait until Monday.&quot;</Strong>,
            "The most dangerous of the seven. It is a triage decision made without an examination, by someone not licensed to make it",
            "Follow the red-flag list in the next section. If nothing on it applies, book the earliest slot and say nothing about safety",
          ],
          [
            <Strong key="4">&quot;Yes, Medicare covers that.&quot;</Strong>,
            <>
              <Ext href="https://www.medicare.gov/coverage/chiropractic-services">
                Medicare
              </Ext>{" "}
              covers only spinal manipulation to correct a subluxation, and
              states it does not cover other services or tests a chiropractor
              orders
            </>,
            "State the facts from your sheet; offer a billing callback for anything specific",
          ],
          [
            <Strong key="5">&quot;Your first visit will be $75.&quot; - and nothing else</Strong>,
            <>
              For an uninsured or self-pay caller, federal rules require telling
              them a good faith estimate is available,{" "}
              <Ext href="https://www.ecfr.gov/current/title-45/section-149.610">
                orally, when scheduling or when cost comes up
              </Ext>
            </>,
            "Quote your written fee if you publish one, and add the good faith estimate sentence",
          ],
          [
            <Strong key="6">&quot;The doctor can definitely fix that.&quot;</Strong>,
            "An outcome promise made on your behalf by someone who has not examined the patient. It is also the sentence a complaint quotes back",
            "“The doctor will examine you and go through the options at your first visit.”",
          ],
          [
            <span key="7">
              <Strong>&quot;Hi, this is Dr. Lee&apos;s office about your adjustment for your lower back...&quot;</Strong>{" "}
              on a voicemail
            </span>,
            <>
              <Ext href="https://www.hhs.gov/hipaa/for-professionals/faq/198/may-health-care-providers-leave-messages/index.html">
                HHS guidance
              </Ext>{" "}
              allows messages but advises limiting what is disclosed - for
              example the practice name, number and what is needed to confirm an
              appointment
            </>,
            "Practice name, callback number, appointment time. No condition, no treatment",
          ],
        ]}
      />
      <P>
        New York&apos;s Office of the Professions puts the general principle in
        one sentence in its{" "}
        <Ext href="https://www.op.nysed.gov/professions/chiropractic/practice-alerts/use-of-unlicensed-individuals">
          practice alert on unlicensed individuals
        </Ext>
        : they may do general office work and collect and record patient data,
        but may not perform &quot;tasks that require professional or clinical
        judgment&quot;. Rules differ by state and the three quoted here are
        examples, not a survey - your own board&apos;s rules are the ones that
        apply. The point for a phone script is the same everywhere: it records,
        it books, it routes. Whoever answers is, for this purpose, the least
        clinically qualified member of your team, whether that is a call-centre
        agent in another state or a language model.
      </P>

      <H2 id="red-flags">Red flags are not a booking</H2>
      <P>
        Back and neck pain are almost always what they appear to be. A small
        number of callers describing the same pain have something that should
        not wait for an appointment, and a script that cheerfully offers them
        Thursday at 2:30 has failed. The service does not need clinical skill to
        avoid that. It needs a list, and an instruction to stop.
      </P>
      <Figure
        src="/blog/chiropractic-call-three-doors.svg"
        alt="A three-column diagram of how a chiropractic office call is routed. Column one, book it: new patient requests, reschedules, hours, forms and insurance questions answered from a written sheet. Column two, flag for the doctor: recent accident or fall, numbness or weakness, pain getting rapidly worse, new severe headache with neck pain, fever with back pain, feeling worse after an adjustment. Column three, 911 now: stroke signs, loss of bladder or bowel control, numbness in the groin or saddle area, weakness in both legs, chest pain"
        width={1200}
        height={630}
        caption="An illustration of the structure, not a clinical protocol. The lists behind doors two and three are yours to write and sign."
        credit="Illustration by AI Receptionist Now"
      />
      <H3>Emergency: tell the caller to call 911</H3>
      <UL>
        <LI>
          <Strong>Stroke signs.</Strong> The CDC&apos;s{" "}
          <Ext href="https://www.cdc.gov/stroke/signs-symptoms/index.html">
            list
          </Ext>{" "}
          is sudden numbness or weakness in the face, arm or leg, especially on
          one side; sudden confusion or trouble speaking; sudden trouble seeing;
          sudden trouble walking, dizziness or loss of balance; and sudden
          severe headache with no known cause. Its instruction is to call 911
          right away.
        </LI>
        <LI>
          <Strong>Signs of cauda equina syndrome.</Strong> The American
          Association of Neurological Surgeons lists{" "}
          <Ext href="https://www.aans.org/patients/conditions-treatments/cauda-equina-syndrome/">
            red flag symptoms
          </Ext>{" "}
          including urinary retention, urinary or fecal incontinence, saddle
          numbness and weakness in the legs, and states that &quot;immediate
          medical attention is required&quot; for any of them. It adds that
          treatment within 48 hours of onset gives a significant advantage in
          recovery - which is exactly the window a Friday-evening &quot;see you
          Monday&quot; uses up.
        </LI>
        <LI>
          <Strong>Back pain with chest pain, or after a serious accident.</Strong>{" "}
          Both are on the NHS&apos;s{" "}
          <Ext href="https://www.nhs.uk/conditions/back-pain/">
            call-emergency-services list for back pain
          </Ext>
          , alongside numbness or weakness in both legs and loss of feeling
          around the genitals. The NHS is a UK source; the equivalent in the US
          is 911 or the emergency department.
        </LI>
      </UL>
      <H3>Not routine: the chiropractor decides before anything is booked</H3>
      <UL>
        <LI>
          <Strong>A recent accident, fall or other trauma.</Strong>
        </LI>
        <LI>
          <Strong>New numbness, tingling or weakness in an arm or leg.</Strong>
        </LI>
        <LI>
          <Strong>Pain that is getting rapidly worse, or with fever.</Strong>
        </LI>
        <LI>
          <Strong>A new, severe or unusual headache with neck pain.</Strong> The
          2014{" "}
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/25104849/">
            American Heart Association and American Stroke Association
            scientific statement
          </Ext>{" "}
          on cervical artery dissection notes that patients with a dissection
          may present with one-sided headache or pain at the back of the neck,
          and concludes that &quot;practitioners should strongly consider the
          possibility of CD as a presenting symptom&quot;. The same statement is
          careful about causation: it says the evidence is insufficient to
          establish that manipulation causes dissection, while reporting a
          statistical association. For a phone script the implication is narrow
          and practical - this caller is the doctor&apos;s to assess, not the
          scheduler&apos;s to slot in.
        </LI>
        <LI>
          <Strong>A patient who feels markedly worse after a visit.</Strong>{" "}
          Always to the doctor, the same day.
        </LI>
      </UL>
      <Callout>
        One rule keeps this safe: the script never asks clinical follow-up
        questions to decide which list a caller belongs on. If the caller&apos;s
        own words match either list, it takes the more cautious route. A false
        alarm costs you a phone call. The other mistake is the one you cannot
        take back.
      </Callout>
      <P>
        Chiropractors already do this screening in person - in the NBCE survey
        82% reported assessing risk factors and possible contraindications to
        care daily. The answering service&apos;s job is simply not to get in the
        way of it. The mechanics of wiring a call to reach you, then a backup,
        are in our{" "}
        <Internal href="/blog/how-to-set-up-emergency-call-escalation">
          emergency call escalation guide
        </Internal>
        .
      </P>

      <H2 id="money-questions">Medicare, insurance and price questions</H2>
      <P>
        After &quot;can I get in today&quot;, the most common question a new
        caller asks is some version of &quot;what will it cost me&quot;. This is
        where an untrained answer creates a billing dispute three weeks later.
      </P>
      <H3>Medicare</H3>
      <P>
        Medicare&apos;s coverage is narrower than most patients assume, and the
        script should be able to say so accurately.{" "}
        <Ext href="https://www.medicare.gov/coverage/chiropractic-services">
          Medicare.gov
        </Ext>{" "}
        states that Part B covers adjustments of the spine by a chiropractor
        &quot;to correct a subluxation&quot;, that it &quot;doesn&apos;t cover
        other services or tests a chiropractor orders, including X-rays, massage
        therapy, and acupuncture&quot;, and that after the Part B deductible the
        patient pays 20% of the Medicare-approved amount. The{" "}
        <Ext href="https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c15.pdf">
          Medicare Benefit Policy Manual
        </Ext>{" "}
        adds that chiropractic maintenance therapy &quot;is not considered to be
        medically reasonable or necessary, and is therefore not payable&quot;.
      </P>
      <P>
        That last line is why a script must never tell a Medicare patient that a
        visit &quot;is covered&quot;. Whether a given visit is active treatment
        or maintenance is a clinical and documentation question, and it is one
        Medicare audits: a{" "}
        <Ext href="https://www.cms.gov/files/document/mln1232664-medicare-documentation-checklist-guidelines-chiropractic-doctors.pdf">
          CMS guidance document for chiropractors
        </Ext>{" "}
        reports that a 2024 review found errors in 33.6% of chiropractic
        claims. The phone is not the place to add to that.
      </P>
      <H3>Self-pay and the good faith estimate</H3>
      <P>
        Chiropractic has an unusually large cash side - in the NBCE survey,
        private pay and cash accounted for 41% of reimbursements. That makes one
        federal rule more relevant here than in most specialties. Under{" "}
        <Ext href="https://www.ecfr.gov/current/title-45/section-149.610">
          45 CFR 149.610
        </Ext>
        , providers must inform uninsured or self-pay individuals that a good
        faith estimate of expected charges is available, and the regulation
        says that information must be &quot;orally provided when scheduling an
        item or service or when questions about the cost of items or services
        occur&quot;. Scheduling by phone is exactly that moment, and it is
        usually your answering service&apos;s moment rather than yours.
      </P>
      <P>
        The timing rules, as{" "}
        <Ext href="https://www.cms.gov/medical-bill-rights/help/guides/good-faith-estimate">
          CMS summarises them
        </Ext>
        : care scheduled three to nine business days ahead gets an estimate
        within one business day; care scheduled ten or more business days ahead
        gets one within three business days; and a patient can ask for one
        before scheduling. The script does not produce the estimate. It asks
        whether the caller will be using insurance, says the sentence, and flags
        the booking so your office sends the document on time.
      </P>
      <Callout>
        A workable line for self-pay callers: &quot;Since you&apos;ll be paying
        directly, you&apos;re entitled to a written good faith estimate of the
        expected charges. I&apos;ll note that on your booking so the office
        sends it to you.&quot; Have your own counsel approve the wording - this
        is general information, not legal advice.
      </Callout>

      <H2 id="hipaa">HIPAA, messages and reminders</H2>
      <UL>
        <LI>
          <Strong>Are you a covered entity?</Strong> Under{" "}
          <Ext href="https://www.ecfr.gov/current/title-45/section-160.103">
            45 CFR 160.103
          </Ext>
          , a health care provider is a covered entity if it &quot;transmits any
          health information in electronic form in connection with a
          transaction covered by this subchapter&quot; - in practice, electronic
          insurance billing. Most chiropractic offices do. A purely cash
          practice that never bills electronically should ask counsel rather
          than assume either way.
        </LI>
        <LI>
          <Strong>The BAA.</Strong> If you are covered, a service that receives
          patient names, numbers and reasons for visiting on your behalf fits
          the definition of a business associate, and{" "}
          <Ext href="https://www.ecfr.gov/current/title-45/section-164.502">
            45 CFR 164.502(e)
          </Ext>{" "}
          requires the arrangement to be documented in a written contract. Get
          it before the first forwarded call, and read what it says about
          recordings and transcripts. Many answering-service pages say
          &quot;HIPAA compliant&quot; and stop there; the agreement is the
          thing to ask for.
        </LI>
        <LI>
          <Strong>Minimum necessary.</Strong> The same section requires
          reasonable efforts to limit information to the minimum needed. For a
          message that means &quot;new patient, low back pain since Saturday,
          wants this week&quot; - not a medical history.
        </LI>
        <LI>
          <Strong>Reminder calls and texts.</Strong> If the service sends
          reminders for you, the FCC&apos;s healthcare exemption at{" "}
          <Ext href="https://www.ecfr.gov/current/title-47/section-64.1200">
            47 CFR 64.1200(a)(9)(iv)
          </Ext>{" "}
          comes with conditions: sent only to the number the patient provided,
          limited to purposes such as &quot;appointment and exam confirmations
          and reminders&quot;, no telemarketing or billing content, 160
          characters or less for a text, at most one message a day and three a
          week, and an opt-out in every message. A &quot;we miss you - 20% off
          your next adjustment&quot; text is marketing, and is outside it.
        </LI>
      </UL>

      <H2 id="integrations">The integration claim to check</H2>
      <P>
        Several answering services list ChiroTouch and Jane among their
        integrations. The software vendors&apos; own pages are more cautious,
        and where the two disagree the software vendor is the one that controls
        access.
      </P>
      <UL>
        <LI>
          <Strong>Jane.</Strong> Its{" "}
          <Ext href="https://jane.app/guide/integrations-hub-faq">
            integrations FAQ
          </Ext>{" "}
          answers the question directly: &quot;No, Jane doesn&apos;t currently
          have an open API or provide API keys.&quot; Jane describes an
          approval-based partner program instead, so an integration is possible
          only for vendors it has admitted.
        </LI>
        <LI>
          <Strong>ChiroTouch.</Strong> Its{" "}
          <Ext href="https://www.chirotouch.com/marketplace">
            marketplace page
          </Ext>{" "}
          listed the &quot;Scheduling &amp; Intake&quot; category as
          &quot;Coming Soon!&quot; when we read it on October 1, 2026.
        </LI>
      </UL>
      <P>
        That does not mean every integration claim is false - a vendor may have
        a private arrangement, or may mean something looser, such as emailing a
        message that your staff type in. It means the claim needs a
        demonstration. Ask to watch an appointment appear in your own schedule
        during the trial. For transparency about our own product: we book into
        Google Calendar, Outlook and Cal.com, and can send the booking to
        another system by webhook. We do not write into ChiroTouch, Jane or any
        other chiropractic practice management system, so with us the
        appointment reaches your schedule through a synced calendar or through
        your front desk. If direct write-back is essential, that rules us out
        and you should know it before the demo. How calendar booking works is in{" "}
        <Internal href="/blog/ai-receptionist-appointment-booking">
          our appointment booking guide
        </Internal>
        .
      </P>

      <H2 id="models">Live agents vs AI vs hybrid</H2>
      <Table
        caption="Answering models for a chiropractic office"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Live answering service",
            "Offices that want a human voice on every call and have modest, predictable volume",
            "Per-minute billing and rounding; agents covering many industries who improvise helpfully on clinical questions unless the script forbids it",
          ],
          [
            "AI receptionist",
            "Offices losing calls during adjustments and after hours, with mostly routine scheduling calls",
            "The BAA and data handling in writing; the red-flag lists configured as hard stops and tested; calendar-level booking rather than write-back to your practice software",
          ],
          [
            "Hybrid",
            "Most multi-doctor offices: software takes routine scheduling, a person takes anything flagged",
            "Decide who the person is at 7 p.m. on a Friday. If it is you, the escalation has to reach you reliably",
          ],
          [
            "Voicemail",
            "Nobody, for new patients",
            "A new patient in pain calls the next office on the list. An existing patient with a red-flag symptom leaves a message that is heard on Monday",
          ],
        ]}
      />
      <P>
        On cost, live services publish plans from about $149 to $395 a month for
        100 minutes, and the invoice depends on how they round call time - we
        went through the published rate cards in the{" "}
        <Internal href="/blog/medical-answering-service-pricing">
          medical answering service pricing guide
        </Internal>
        . Our own plans are flat and listed on the{" "}
        <Internal href="/pricing">pricing page</Internal>. You keep your
        existing number either way (
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          how call forwarding works
        </Internal>
        ).
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <H3>A new patient at 12:40, while the desk is at lunch</H3>
      <Callout>
        &quot;Thanks for calling - are you a current patient, or would this be
        your first visit? ... First visit. My lower back&apos;s been bad since I
        moved a couch on Saturday. I&apos;ll note that exactly as you&apos;ve
        said it so the doctor sees it. Will you be using insurance, or paying
        directly? ... Paying myself. Then you&apos;re entitled to a written good
        faith estimate of the expected charges, and I&apos;ll flag that for the
        office to send. The first opening for a new patient visit is tomorrow at
        9:15 - does that work?&quot;
      </Callout>
      <H3>The Medicare question</H3>
      <Callout>
        &quot;Does Medicare pay for this? ... What I can tell you is that
        Medicare Part B covers spinal adjustments by a chiropractor to correct a
        subluxation, and doesn&apos;t cover other services such as X-rays or
        massage. I can&apos;t tell you what your own visit will come to - our
        billing coordinator can, and I&apos;ll have her call you before your
        appointment. What&apos;s the best number?&quot;
      </Callout>
      <H3>The call that is not a booking</H3>
      <Callout>
        &quot;...and since last night my leg&apos;s gone weak and I had an
        accident, I couldn&apos;t feel that I needed to go.&quot;{" "}
        <em>
          [The script stops scheduling.]
        </em>{" "}
        &quot;I&apos;m not able to assess that, and what you&apos;re describing
        needs to be seen urgently. Please call 911 or go to the emergency
        department now rather than waiting for an appointment. I&apos;m letting
        the doctor know you called. Is there someone with you?&quot;
      </Callout>

      <H2 id="setup">Setting it up</H2>
      <OL>
        <LI>
          <Strong>Write the two lists first.</Strong> Emergency, and
          not-routine. One page, in plain words a caller would use, signed by
          the chiropractor. Everything else in the setup is secondary to this.
        </LI>
        <LI>
          <Strong>Write the fact sheet.</Strong> Insurance plans accepted, the
          Medicare paragraph, new-patient fee if you publish one, the good faith
          estimate sentence, what to bring. The script may say what is on the
          sheet and nothing beyond it.
        </LI>
        <LI>
          <Strong>Add the seven sentences as explicit prohibitions.</Strong>{" "}
          With a live service, put them in the account instructions. With an AI
          agent, put them in the prompt as hard rules (
          <Internal href="/blog/ai-receptionist-prompts">
            how to write receptionist prompts
          </Internal>
          ).
        </LI>
        <LI>
          <Strong>Sign the BAA</Strong> before forwarding a single call, if you
          are a covered entity.
        </LI>
        <LI>
          <Strong>Decide where bookings land</Strong> and prove it. Watch a test
          appointment arrive in your schedule.
        </LI>
        <LI>
          <Strong>Test the three calls above yourself.</Strong> Especially the
          third. Call your own line after hours, describe a red-flag symptom in
          ordinary language, and see what happens. Then check that the alert
          reached your phone.
        </LI>
        <LI>
          <Strong>Read a week of transcripts or listen to recordings.</Strong>{" "}
          You are looking for one thing: a sentence that sounds like advice.
        </LI>
      </OL>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
