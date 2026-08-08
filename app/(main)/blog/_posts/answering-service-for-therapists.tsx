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
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "answering-service-for-therapists",
  title: "Answering Service for Therapists: Intake Without the Risk",
  description:
    "A private practice phone has three jobs and one hard rule. How to run intake, protect confidentiality, and make sure a crisis call never meets an automated script.",
  date: "2026-08-08",
  updated: "2026-08-08",
  readingTime: "13 min read",
  tag: "Industries",
  hero: "/blog/answering-service-for-therapists-hero.svg",
  ogImage: "/blog/answering-service-for-therapists-og.webp",
  heroAlt:
    "An illustration of a heart and an appointment calendar either side of an AI receptionist chip with a voice waveform",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "answering service for therapists",
    "therapist answering service",
    "private practice answering service",
    "answering service for mental health practice",
    "counseling practice phone answering",
    "psychotherapy intake calls",
    "HIPAA compliant answering service therapists",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "crisis", title: "The rule that comes before every other rule" },
    { id: "three-jobs", title: "A private practice phone has three jobs" },
    { id: "hipaa", title: "HIPAA: your answering service is a business associate" },
    { id: "messages", title: "Voicemail, callbacks and who may know you called" },
    { id: "waitlist", title: "The honest waitlist conversation" },
    { id: "insurance", title: "Insurance questions, answered without guessing" },
    { id: "confirm", title: "The call you can neither confirm nor deny" },
    { id: "never", title: "What to never automate" },
    { id: "setup", title: "Setting it up" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "Should a therapist use an AI answering service?",
      a: "For the administrative half of the phone, it works well: new-client enquiries, scheduling and rescheduling, practical questions about location, fees, telehealth and paperwork, and taking a message properly. For anything clinical it should not be involved at all, and for anything resembling a crisis it must do exactly one thing - direct the caller to 988 or 911 and get a human involved. If a vendor sells you clinical triage, that is the moment to end the conversation.",
    },
    {
      q: "Is an AI answering service HIPAA compliant for a therapy practice?",
      a: "Compliance is not a property of a product, it is a property of an arrangement. If a service receives protected health information on your behalf it is a business associate, and you need a signed business associate agreement before it handles a single call. Ask three concrete questions: will you sign a BAA, where are recordings and transcripts stored and for how long, and who on your side can access them. A vendor who answers 'we're HIPAA compliant' without addressing those has not answered.",
    },
    {
      q: "What should happen when someone in crisis calls a therapy practice?",
      a: "They should reach a person, and before that they should hear the 988 Suicide and Crisis Lifeline named clearly. 988 is free, confidential and staffed around the clock by trained crisis counselors, with call, text and chat options. An automated line's entire job on that call is to recognize it in the first sentence, say that plainly, and stop trying to be helpful in any other way. Design and test this before anything else in your phone setup.",
    },
    {
      q: "Can an answering service take my new client enquiries?",
      a: "Yes, and it is the part most worth covering, because private practice enquiries arrive in evenings and gaps when you are in session and cannot answer. What it should collect is administrative: name, contact details, whether it is safe to leave a message and where, what they are looking for in general terms, insurance or self-pay, and availability. What it should never collect is a clinical history. You are not helped by a transcript containing someone's trauma narrative before they have met you.",
    },
    {
      q: "Should the phone tell callers whether I am accepting new clients?",
      a: "Yes, immediately, and it is a kindness. Somebody calling six practices while already struggling should not spend a week waiting for a callback that ends in 'I'm full.' If you are closed to new clients, the script should say so in the first thirty seconds, offer the waitlist if you keep one, and name where else to look - a directory, a referral list, your local network. That call ends better for everyone and costs you nothing you actually wanted.",
    },
    {
      q: "Can an answering service confirm whether someone is my client?",
      a: "No, and this is the one that catches practices out. A spouse, a parent, an employer, an attorney or a family member may call asking whether a person is seeing you. Whether that person is a client is itself protected information, and confirming it can be a disclosure regardless of how reasonable the caller sounds. The correct script neither confirms nor denies, explains that the practice cannot discuss whether anyone is a client, takes a message for you and stops. Custody disputes are exactly where this goes wrong.",
    },
    {
      q: "What does an answering service cost for a solo practice?",
      a: "Live services in this niche are usually priced per minute or per call and land somewhere in the low hundreds per month for a solo practice with modest volume; AI lines are flat monthly and cheaper, typically tens of dollars rather than hundreds. But price is the wrong first question here. The first question is whether the arrangement is safe: a signed BAA, a tested crisis path, and a clear rule that nothing clinical gets handled by the phone. A cheap service that fails either of those first two tests is not cheap.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "988 Suicide & Crisis Lifeline: free, confidential support by call, text and chat, 24/7",
    url: "https://988lifeline.org/",
  },
  {
    title:
      "SAMHSA: 988 Suicide & Crisis Lifeline overview and frequently asked questions",
    url: "https://www.samhsa.gov/mental-health/988",
  },
  {
    title:
      "US HHS: Business Associates - a service that handles PHI on a covered entity's behalf requires a business associate agreement",
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html",
  },
  {
    title:
      "US HHS OCR FAQ 198: leaving messages for patients, and limiting the information disclosed",
    url: "https://www.hhs.gov/hipaa/for-professionals/faq/198/may-health-care-providers-leave-messages/index.html",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        A private practice phone is answered by a person who is, by definition,
        unavailable. You are in session fifty minutes of every hour, you cannot
        take a call from the room, and the people trying to reach you are often
        having a hard week. We build AI receptionists, so read this skeptically:
        this is an article about which parts of a therapy practice&apos;s phone
        should be automated, which parts must never be, and the one call that
        decides whether the whole arrangement is safe.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Crisis calls are not a use case, they are an
            exception.</Strong> Recognize, name 988, get a human. Nothing else.
          </>,
          <>
            <Strong>No BAA, no service.</Strong> A phone service handling your
            callers is a business associate, and the agreement comes before the
            first call.
          </>,
          <>
            <Strong>Never confirm that someone is a client.</Strong> Not to a
            spouse, a parent, an employer or an attorney.
          </>,
          <>
            <Strong>Say &quot;not accepting new clients&quot; in the first
            thirty seconds.</Strong> The kindest script in this trade is also
            the most efficient one.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        An <Strong>answering service for therapists</Strong> covers the practice
        line while you are in session, which is most of your working day. Done
        properly it handles new-client enquiries administratively, schedules and
        reschedules, answers practical questions about fees, location,
        telehealth and paperwork, takes messages with the right confidentiality
        rules attached, and routes anything clinical or urgent to you or to
        emergency resources.
      </P>
      <P>
        Done improperly it becomes a system that records clinical disclosures
        into a transcript, tells a caller in distress that someone will call
        them back on Monday, or cheerfully confirms to a stranger that yes, that
        person has an appointment on Thursday. All three of those are
        configuration failures, not technology failures, and all three are
        preventable in an afternoon of setup.
      </P>

      <H2 id="crisis">The rule that comes before every other rule</H2>
      <P>
        Some callers to a therapy practice are in crisis. That is not an edge
        case to be handled elegantly; it is a category that must be routed out
        of the automated system entirely, in the first sentence.
      </P>
      <P>
        The 988 Suicide &amp; Crisis Lifeline exists precisely for this and it
        is better at it than any practice phone will ever be. It is{" "}
        <Ext href="https://988lifeline.org/">
          free, confidential and available around the clock by call, text or
          chat
        </Ext>
        , staffed by trained crisis counselors, with{" "}
        <Ext href="https://www.samhsa.gov/mental-health/988">
          Spanish-language service and interpretation in more than 240 languages
        </Ext>
        . A caller who needs that is not helped by an appointment slot.
      </P>
      <Callout>
        Write this into any answering setup as an explicit, tested rule: on any
        indication of risk to self or others, the line names 988 immediately,
        says to call 911 if there is immediate danger, and escalates to a
        person. Then call your own number and test it out loud before you go
        live. A vendor who cannot demonstrate that on a live test call has not
        built it - they are relying on a model behaving sensibly, which is not
        the same as a guarantee.
      </Callout>
      <P>
        There is a second, quieter reason to design this deliberately. A caller
        who reaches an obviously automated system while in distress experiences
        it as being turned away by their own therapist&apos;s office. That harm
        is real even when nothing goes clinically wrong, and the way to avoid it
        is a fast, warm, unmistakable handoff rather than a longer script.
      </P>

      <H2 id="three-jobs">A private practice phone has three jobs</H2>
      <P>
        Once the crisis path is settled, the rest of the line is more ordinary
        than most therapists expect - and more automatable.
      </P>
      <Table
        caption="What actually rings a therapy practice"
        head={["Caller", "What they need", "Right handling"]}
        rows={[
          [
            "Prospective client",
            "Do you have openings, do you take my insurance, what do you charge, do you work with this",
            "Administrative intake only. Answer the four practical questions honestly and either book a consult or say plainly that you are full",
          ],
          [
            "Current client, scheduling",
            "Move, cancel, or confirm a session",
            "Straightforward calendar work. The highest-volume call and the easiest to automate well",
          ],
          [
            "Current client, distressed",
            "You",
            "Not a script's call. Named risk indicators route immediately; everything else takes a message flagged urgent and tells the truth about when you will call back",
          ],
          [
            "Referral source",
            "To send you someone, or discuss a case",
            "Take the message and route. Never discuss any client, including confirming one exists",
          ],
          [
            "Insurance, billing, EAP",
            "Claims, authorisations, superbills",
            "Capture and route to whoever does your billing. Never improvise coverage answers",
          ],
          [
            "Third party asking about a client",
            "Confirmation, records, or a conversation about someone",
            "Neither confirm nor deny. Message taken, nothing disclosed. See below",
          ],
        ]}
      />
      <P>
        Four of those six rows are administrative, and they are the ones eating
        your evenings. The two that are not administrative need a person - which
        is why the useful question is not &quot;should a therapist use an
        answering service&quot; but &quot;which rows am I handing over, and what
        does the system do when it meets one of the other two?&quot;
      </P>

      <H2 id="hipaa">HIPAA: your answering service is a business associate</H2>
      <P>
        If your practice is a covered entity, then a service that receives
        protected health information on your behalf is a business associate, and
        the HIPAA rules only permit you to disclose PHI to it once you have{" "}
        <Ext href="https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html">
          satisfactory assurances in the form of a written business associate
          agreement
        </Ext>{" "}
        that it will safeguard that information. An answering service that hears
        a caller&apos;s name and the fact that they are seeking treatment from
        you is handling PHI. That is not a grey area.
      </P>
      <P>
        For an automated line specifically, there is more of it than people
        expect, because the system generates artifacts a human answering service
        does not:
      </P>
      <Table
        caption="What an automated phone line creates, and what to ask about each"
        head={["Artifact", "The question to ask your vendor"]}
        rows={[
          [
            "Call recording",
            "Is it retained, where, for how long, and can recording be disabled for this line entirely",
          ],
          [
            "Transcript",
            "Where is it stored, who can read it, and is it used for anything beyond serving your account",
          ],
          [
            "Message notifications by email or SMS",
            "What exactly appears in them. A push notification containing a caller's name and reason for calling is a disclosure to whatever device it lands on",
          ],
          [
            "Model processing",
            "Which subprocessors touch the audio or text, and are they covered by the BAA chain",
          ],
          [
            "Your dashboard",
            "Who in your practice has access, and can access be limited per user",
          ],
        ]}
      />
      <P>
        Two of those deserve a decision rather than a question. First, consider
        turning recording off and keeping only structured fields - name, number,
        callback preference, and a short administrative note. Second, configure
        notifications so the alert says a message is waiting rather than
        reproducing its contents on a lock screen in a waiting room.
      </P>
      <P>
        None of this is legal advice, and your professional body and state
        licensing board impose their own confidentiality obligations that go
        beyond HIPAA. Treat it as the list of questions to put to a vendor
        before signing. The equivalent conversation for clinics is in our{" "}
        <Internal href="/blog/medical-answering-service">
          medical answering service
        </Internal>{" "}
        piece, and the underlying contract point is the same one every practice
        has to settle: no BAA, no calls.
      </P>

      <H2 id="messages">Voicemail, callbacks and who may know you called</H2>
      <P>
        In no other health specialty does the act of contacting a patient carry
        as much risk as it does here. A message on the wrong phone, or answered
        by the wrong person in a household, can disclose that someone is in
        therapy - to a partner, a parent, an employer.
      </P>
      <P>
        The federal guidance is permissive but pointed: providers may leave
        messages for patients, including on an answering machine, but should{" "}
        <Ext href="https://www.hhs.gov/hipaa/for-professionals/faq/198/may-health-care-providers-leave-messages/index.html">
          limit the amount of information disclosed - a name and number and what
          is needed to confirm an appointment, or simply a request to call back
        </Ext>
        .
      </P>
      <P>
        In practice, that means the two most important fields in a therapy
        practice&apos;s intake are the ones most answering services never ask:
      </P>
      <UL>
        <LI>
          <Strong>Is it safe to leave a message at this number?</Strong> Asked
          plainly, every time, before anything else is captured.
        </LI>
        <LI>
          <Strong>Is it safe to say the name of the practice?</Strong> Some
          callers need a callback that identifies nothing at all.
        </LI>
        <LI>
          <Strong>Preferred contact method and times.</Strong> Someone who can
          only speak in a parked car at lunchtime should not be called at seven
          in the evening.
        </LI>
        <LI>
          <Strong>Whether text or email is acceptable.</Strong> And under what
          name, if any.
        </LI>
      </UL>
      <Callout>
        A script that asks &quot;is it okay to leave a voicemail on this
        number, and is it okay to mention the practice name?&quot; is doing more
        for your callers&apos; confidentiality than most of the compliance
        paperwork in your filing cabinet. It costs eight seconds.
      </Callout>

      <H2 id="waitlist">The honest waitlist conversation</H2>
      <P>
        Most private practices are full most of the time, and most practice
        phones handle that fact badly - by collecting an enquiry, promising a
        callback, and delivering the bad news four days later to someone who has
        been waiting.
      </P>
      <P>
        The better script is uncomfortable and much kinder. If you are not
        accepting clients, say so in the first thirty seconds. Then offer, in
        order: the waitlist if you genuinely keep and use one, a realistic
        timeframe rather than an optimistic one, and where else to look - a
        directory, a colleague&apos;s practice, a community mental health
        service, the local referral network you already trust.
      </P>
      <P>
        The version of this that automates well is a script that knows your
        current status and states it. The version that does damage is one that
        collects a full intake from someone you will never see, because it makes
        the eventual rejection feel personal and it puts their information into
        your systems for no reason.
      </P>

      <H2 id="insurance">Insurance questions, answered without guessing</H2>
      <P>
        &quot;Do you take my insurance?&quot; is the most common question on a
        therapy practice line and one of the easiest to answer wrongly.
      </P>
      <OL>
        <LI>
          <Strong>Say which panels you are on.</Strong> A fact, published,
          safely stated by any script.
        </LI>
        <LI>
          <Strong>Say your self-pay fee.</Strong> Also a fact. Withholding it
          wastes everyone&apos;s time and reads as evasive.
        </LI>
        <LI>
          <Strong>Never confirm coverage, benefits or copay.</Strong> That
          depends on the caller&apos;s specific plan and only their insurer can
          confirm it. The right sentence is that they should check their
          behavioral health benefits with the number on their card, and that you
          can provide a superbill if you are out of network.
        </LI>
        <LI>
          <Strong>Do not promise a sliding scale a script does not
          control.</Strong> If you offer one, define the rule the phone may
          state; otherwise the phone says the fee and you have the conversation
          yourself.
        </LI>
      </OL>

      <H2 id="confirm">The call you can neither confirm nor deny</H2>
      <P>
        A caller says: I am ringing about my wife, she sees you on Tuesdays, I
        just need to know whether she attended last week.
      </P>
      <P>
        Whether that person is your client is itself protected information.
        Confirming the appointment, or even that the name is familiar, can be a
        disclosure, and this scenario arrives most often in exactly the
        circumstances where a disclosure does the most harm - custody disputes,
        separations, employment investigations, court matters.
      </P>
      <Table
        caption="Third-party callers: the script and the boundary"
        head={["Caller", "Correct handling"]}
        rows={[
          [
            "Family member asking whether someone is a client",
            "Neither confirm nor deny. State that the practice cannot discuss whether anyone is a client. Take a message for the therapist",
          ],
          [
            "Attorney or court staff requesting records",
            "No discussion, no confirmation. Take contact details and route to the therapist. Records requests are never handled by a phone service",
          ],
          [
            "Employer or EAP administrator",
            "Same rule. Route. Any coordination happens with a release in place",
          ],
          [
            "Parent of an adolescent client",
            "Depends on your state's minor consent law and your practice policy. Which means it is a therapist call, not a script call",
          ],
          [
            "Another clinician making a referral",
            "Take the referral. Do not confirm or discuss any existing client, even implicitly",
          ],
        ]}
      />
      <P>
        The general-purpose helpfulness of an assistant is a liability in every
        row of that table. Write the boundary explicitly, and test it by calling
        your own line and asking whether your friend has an appointment.
      </P>

      <H2 id="never">What to never automate</H2>
      <UL>
        <LI>
          <Strong>Crisis and risk.</Strong> Covered above. This is the rule that
          precedes all the others.
        </LI>
        <LI>
          <Strong>Anything clinical.</Strong> Whether a symptom is normal,
          whether a medication interacts, whether a caller should be worried.
          Not a script&apos;s answer, and not a receptionist&apos;s either.
        </LI>
        <LI>
          <Strong>Confirming a client relationship.</Strong> To anyone, ever,
          without a release.
        </LI>
        <LI>
          <Strong>Records requests, subpoenas and legal correspondence.</Strong>{" "}
          Recognize and route. These have deadlines and rules attached.
        </LI>
        <LI>
          <Strong>Clinical history at intake.</Strong> Take administrative
          details and a general sense of what the caller is seeking. Their story
          belongs in the room, not in a transcript.
        </LI>
        <LI>
          <Strong>Fee negotiation and sliding-scale decisions.</Strong> Unless
          you have written a rule the phone can state exactly.
        </LI>
      </UL>

      <H2 id="setup">Setting it up</H2>
      <OL>
        <LI>
          <Strong>Get the BAA signed first.</Strong> Before a single call routes
          anywhere. If a vendor will not sign one, the evaluation is over.
        </LI>
        <LI>
          <Strong>Write and test the crisis path.</Strong> Explicit indicators,
          988 named clearly, 911 for immediate danger, immediate escalation to a
          person. Test it out loud on a live call before launch, and again after
          any change to the script.
        </LI>
        <LI>
          <Strong>Decide your recording and retention posture.</Strong> Consider
          no recording at all. Decide what a notification is allowed to say on a
          lock screen.
        </LI>
        <LI>
          <Strong>Write the two confidentiality questions into intake.</Strong>{" "}
          Safe to leave a message, safe to name the practice. Every call, no
          exceptions.
        </LI>
        <LI>
          <Strong>State your availability truthfully.</Strong> Open, closed, or
          waitlist with a real timeframe, and a referral list for when the
          answer is no.
        </LI>
        <LI>
          <Strong>Write the neither-confirm-nor-deny script.</Strong> One
          paragraph, and test it by trying to break it yourself.
        </LI>
        <LI>
          <Strong>Read the first two weeks of messages closely.</Strong> You are
          looking for two things: anything clinical that got captured when it
          should not have been, and any caller who sounded like they needed a
          person and did not get one. Both are fixable, and both are invisible
          if you never look.
        </LI>
      </OL>
      <P>
        The honest summary is that a therapy practice gets less out of
        automation than a plumbing company does, and the parts it does get are
        worth having: an enquiry answered at 7 p.m. instead of Monday, a
        reschedule handled without interrupting a session, and a message taken
        with the confidentiality questions asked properly every time. If you
        want the general version of where these systems help and where they
        genuinely lose to a person, we wrote{" "}
        <Internal href="/blog/can-an-ai-receptionist-replace-a-human-receptionist">
          the honest version of that comparison
        </Internal>
        , and{" "}
        <Internal href="/blog/how-to-choose-an-ai-receptionist">
          the buyer&apos;s guide
        </Internal>{" "}
        lists what to ask every vendor, including us.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
