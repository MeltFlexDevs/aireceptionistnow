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
  Mono,
  Callout,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "how-to-set-up-emergency-call-escalation",
  title: "How to Set Up Emergency Call Escalation After Hours",
  description:
    "A practical guide to after-hours emergency call escalation: writing triggers, building an on-call ladder, and the 911 boundary.",
  date: "2026-07-30",
  updated: "2026-07-30",
  readingTime: "12 min read",
  tag: "Guides",
  hero: "/blog/emergency-call-escalation-hero.webp",
  heroAlt:
    "A phone glowing on a bedside table in a dark room at night with a service company work jacket on a chair behind it",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "emergency call escalation",
    "after hours emergency call routing",
    "on-call rotation phone",
    "urgent call routing answering service",
    "escalation policy phone calls",
    "AI receptionist emergency escalation",
    "after hours on call escalation setup",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "five-parts", title: "The five parts of an escalation policy" },
    { id: "triggers", title: "Writing triggers that don't over-fire" },
    { id: "ladder", title: "The ladder and the timers" },
    { id: "acknowledgement", title: "Escalate on silence, not on 'no answer'" },
    { id: "rotation", title: "An on-call rotation people will actually keep" },
    { id: "911", title: "The 911 boundary" },
    { id: "by-industry", title: "What the trigger list looks like by trade" },
    { id: "close-loop", title: "Closing the loop with the caller" },
    { id: "test", title: "Testing it (including the 2 a.m. drill)" },
    { id: "tuning", title: "Tuning it with two numbers" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is emergency call escalation?",
      a: "It is the rule set that decides which after-hours calls wake someone up and how. A caller reaches your answering service or AI receptionist, the call is classified against triggers you wrote, and anything that qualifies gets pushed to your on-call person - by call, text, or push - with a timer. If they do not acknowledge within that timer, it moves to the next person on the ladder. Everything that does not qualify gets captured as a normal message or work order for the morning.",
    },
    {
      q: "How does an AI receptionist know a call is an emergency?",
      a: "From conditions you describe in plain language, not from a keyword list. Keyword matching fails in both directions: a caller who says 'this is an emergency' about a burnt-out bulb triggers it, and a caller who calmly says 'there's water coming through the ceiling' does not. Describing the situation instead - active water, no heat below a temperature you name, no power, gas smell, anyone hurt - classifies far more reliably, and you bound it with an explicit list of things that are never emergencies.",
    },
    {
      q: "How long should the escalation timer be?",
      a: "Short enough that the whole ladder completes inside the promise you made the caller. If the script says 'someone will call you back within fifteen minutes,' then a three-rung ladder needs roughly four-minute timers, not ten. Work backwards from the promise rather than picking a round number, and make the promise one you can keep on your worst night, not your average one.",
    },
    {
      q: "Should the AI transfer emergency calls or take a message?",
      a: "Transfer live when the on-call person is reachable and the situation benefits from talking - a caller standing next to a leak needs to be told which valve to close. Page with a full summary when they are not reachable or when the details matter more than the conversation, so your tech wakes up already knowing the address, the problem, and the callback number instead of dialing into a cold call. Most good setups do both: attempt the transfer, fall back to a paged summary, and keep escalating.",
    },
    {
      q: "Can an AI receptionist call 911 for a caller?",
      a: "No, and it should never try. Emergency calls are routed to a dispatch center based on the calling device's validated location, so a call placed by a phone system reaches the wrong dispatch center with the wrong address. The only correct behavior for fire, gas smell, injury, or any life-safety situation is to tell the caller to hang up and dial 911 themselves, immediately, and to stop working the script.",
    },
    {
      q: "Why do escalations get missed even when everything is configured?",
      a: "Almost always one of three reasons. Focus mode or Do Not Disturb silenced the page - fix it by adding the paging number as an emergency-bypass contact on every on-call phone. The system escalated on 'no answer' but the tech answered, mumbled, and went back to sleep - fix it by requiring an explicit acknowledgement. Or the rotation calendar says a name that is on a plane - fix it with a published calendar and a real handoff. Configuration is rarely the failure; the human layer around it usually is.",
    },
    {
      q: "How do I know the triggers are set correctly?",
      a: "Track two numbers, because only one of them complains. Count false escalations - your tech woken for something that could have waited - which you hear about the next morning. Then deliberately audit the non-escalated calls each week for something that should have woken someone, because nobody reports the emergency that quietly became a message. A trigger list that produces zero false escalations is almost certainly missing real ones.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "FCC: Multi-line Telephone Systems - Kari's Law and RAY BAUM'S Act 911 direct dialing and dispatchable location requirements",
    url: "https://www.fcc.gov/mlts-911-requirements",
  },
  {
    title:
      "FCC: Dispatchable Location for 911 Calls from Fixed Telephony, Interconnected VoIP and Mobile Services",
    url: "https://www.fcc.gov/911-dispatchable-location",
  },
  {
    title:
      "Google SRE Book, chapter 11: Being On-Call (on-call load, pager fatigue and escalation practice)",
    url: "https://sre.google/sre-book/being-on-call/",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every service business eventually writes the same sentence into its
        after-hours greeting: <em>if this is an emergency, we&apos;ll get
        someone to you.</em> Almost nobody writes down what happens next. The
        gap between that promise and a tech actually standing in a flooded
        basement is a set of unglamorous mechanics - triggers, timers,
        acknowledgements, a rotation, and a 911 boundary - and when an
        escalation fails at 2 a.m. it is almost never because the software
        broke. We build AI receptionists that run these ladders, so this is
        written from the failures: here is how to specify one that works,
        including the parts that look fine on paper and fall over in the dark.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Escalate on silence, not on &quot;no answer.&quot;</Strong>{" "}
            Require an explicit acknowledgement; a tech who answers and falls
            back asleep is the most common real failure.
          </>,
          <>
            Write triggers as <Strong>conditions, not keywords</Strong>, and
            bound them with an explicit list of things that are never
            emergencies.
          </>,
          <>
            <Strong>Timers work backwards from the promise</Strong> you made
            the caller. A fifteen-minute promise cannot contain three
            ten-minute rungs.
          </>,
          <>
            An automated system{" "}
            <Strong>must never attempt to dial 911 for a caller</Strong> -
            emergency routing depends on the calling device&apos;s validated
            location.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        An escalation policy is five things written down: <Strong>what
        qualifies</Strong> as an emergency, <Strong>who</Strong> gets it,{" "}
        <Strong>how fast</Strong> they have to acknowledge it,{" "}
        <Strong>what happens</Strong> when they don&apos;t, and{" "}
        <Strong>what the caller is told</Strong> while all of that runs. Your
        answering service or AI receptionist executes it; you own it. If you
        only want the conceptual version - can an AI do this at all - that is{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-emergency-calls">
          answered here
        </Internal>
        . This page is the specification you hand to whoever configures it.
      </P>

      <H2 id="five-parts">The five parts of an escalation policy</H2>
      <Table
        caption="What every escalation policy has to specify"
        head={["Part", "The question it answers", "Common failure"]}
        rows={[
          [
            "Trigger",
            "What counts as an emergency, and what explicitly does not",
            "A keyword list, or nothing written down at all",
          ],
          [
            "Target",
            "Who is on call for this window, and how they are reached",
            "A name with no calendar, or a phone in Do Not Disturb",
          ],
          [
            "Timer",
            "How long before this moves to the next person",
            "Timers that don't fit inside the promise made to the caller",
          ],
          [
            "Fallback",
            "The full ladder, ending somewhere that always answers",
            "A ladder with one rung, or a last rung that is a voicemail box",
          ],
          [
            "Caller contract",
            "What the caller is told and when they hear back",
            "A vague 'someone will call you' with no time and no confirmation",
          ],
        ]}
      />

      <H2 id="triggers">Writing triggers that don&apos;t over-fire</H2>
      <P>
        The instinct is to hand over a list of words - <em>emergency, urgent,
        flooding, ASAP</em>. It fails in both directions, reliably:
      </P>
      <UL>
        <LI>
          <Strong>False positives.</Strong> &quot;This is an emergency, my
          garbage disposal is jammed&quot; is a sincere sentence and a
          three-word trigger. Wake a tech twice for that and they start
          ignoring the pager - the pager-fatigue dynamic documented at length
          in{" "}
          <Ext href="https://sre.google/sre-book/being-on-call/">
            Google&apos;s SRE book chapter on being on-call
          </Ext>
          , which is about servers but describes human beings.
        </LI>
        <LI>
          <Strong>False negatives.</Strong> A calm caller saying &quot;there&apos;s
          water coming through the ceiling and I can hear it running&quot; uses
          none of the trigger words and is the worst call of the night.
        </LI>
      </UL>
      <P>Write conditions instead. Three lists, on one page:</P>
      <OL>
        <LI>
          <Strong>Always escalate.</Strong> Described as situations, in the
          language a caller would actually use: water running that cannot be
          stopped; no heat with outside temperatures below a number you name;
          no power to the whole property; sewage backing up; a smell of gas;
          anyone hurt; a security failure like a door that will not lock.
        </LI>
        <LI>
          <Strong>Never escalate.</Strong> Equally explicit, and equally
          important: cosmetic damage, one appliance, one outlet, noise
          complaints, billing questions, scheduling, &quot;can someone come
          look at it this week.&quot; This list is what keeps your on-call
          person willing to stay on call.
        </LI>
        <LI>
          <Strong>Ask one question, then decide.</Strong> The middle band, and
          the part that separates a good script from a checklist. &quot;No hot
          water&quot; is a Monday problem in a house and an emergency in a
          twelve-unit building; &quot;the AC is out&quot; is a Monday problem
          in April and an emergency in a heat advisory with an elderly
          resident. Write the disambiguating question rather than guessing at
          the answer.
        </LI>
      </OL>
      <P>
        This is prompt work, and the general craft of it - being specific,
        bounding the model, writing what <em>not</em> to do - is in{" "}
        <Internal href="/blog/ai-receptionist-prompts">
          our guide to AI receptionist prompts
        </Internal>
        .
      </P>

      <H2 id="ladder">The ladder and the timers</H2>
      <P>
        A ladder is a sequence of targets with a timer between each. The shape
        that works for most small operations:
      </P>
      <Table
        caption="A three-rung ladder inside a fifteen-minute promise"
        head={["Rung", "Target", "Timer", "Method"]}
        rows={[
          [
            "1",
            "On-call tech for this window",
            "4 minutes",
            "Live transfer attempt, then a call with an acknowledgement prompt",
          ],
          [
            "2",
            "Second on-call / lead tech",
            "4 minutes",
            "Call plus SMS with the full summary",
          ],
          [
            "3",
            "Owner or manager",
            "Until answered",
            "Call, repeated - the last rung is a person, never a mailbox",
          ],
        ]}
      />
      <P>
        Three rules about timers that are learned the hard way.{" "}
        <Strong>Work backwards from the promise</Strong>: if the caller was
        told fifteen minutes, the whole ladder has to finish inside fifteen
        minutes with room for the callback.{" "}
        <Strong>The last rung must be a human, not a voicemail box</Strong> - a
        ladder that terminates in a mailbox is a ladder that terminates in
        nothing. And <Strong>keep escalating in parallel, not instead</Strong>:
        when the ladder moves on, the previous rung should still be able to
        pick it up; someone waking up ninety seconds late is a good outcome,
        not a race that has already been lost.
      </P>

      <H2 id="acknowledgement">Escalate on silence, not on &quot;no answer&quot;</H2>
      <Callout>
        The most common real-world failure is not an unanswered page. It is an
        answered one. The tech picks up at 2 a.m., says something
        approximately like &quot;yeah, okay,&quot; and goes back to sleep. The
        system records a successful delivery and stops escalating. Nobody goes
        anywhere. The caller waits.
      </Callout>
      <P>
        The fix is to define delivery as an <Strong>explicit
        acknowledgement</Strong>, not a connected call: press 1 to accept,
        reply <Mono>YES</Mono>, tap the notification. Anything else - answered
        and silent, declined, voicemail, no answer - is treated identically as
        a failure and the timer keeps running. This one change fixes more
        broken escalation setups than any other, and it costs one line of
        configuration.
      </P>
      <P>
        Its close cousin is the phone itself. iOS Focus modes and Android Do
        Not Disturb will silence your paging number by default, and every
        on-call person has their phone in one of them at 2 a.m. -{" "}
        <Strong>add the paging number as an emergency-bypass or favorite
        contact on every on-call phone</Strong> and confirm it with a real
        test call while the phone is silenced. It is the single most common
        cause of &quot;the system didn&apos;t page me.&quot;
      </P>

      <H2 id="rotation">An on-call rotation people will actually keep</H2>
      <UL>
        <LI>
          <Strong>One owner per window.</Strong> &quot;Whoever&apos;s
          around&quot; means nobody. A window has exactly one name and exactly
          one backup.
        </LI>
        <LI>
          <Strong>A published calendar, not a group chat.</Strong> If the
          schedule lives in someone&apos;s head or in a message from three
          weeks ago, it is wrong by now.
        </LI>
        <LI>
          <Strong>An explicit handoff.</Strong> The outgoing person says what
          is still open. Rotations fail at the seam more than in the middle.
        </LI>
        <LI>
          <Strong>Protect the load.</Strong> The SRE literature&apos;s core
          finding transfers cleanly: on-call people who are woken too often
          stop responding well, and the fix is fewer false pages, not more
          discipline. Every false escalation you eliminate makes the real ones
          faster.
        </LI>
        <LI>
          <Strong>Pay for it, visibly.</Strong> A stipend for the window turns
          on-call from an imposition into a shift. It also makes you honest
          about how much of it you are asking for.
        </LI>
      </UL>

      <H2 id="911">The 911 boundary</H2>
      <P>
        There is one hard line in every escalation policy, and it is worth
        being precise about why.
      </P>
      <P>
        An automated system must <Strong>never attempt to place a 911 call on a
        caller&apos;s behalf</Strong>. Emergency calls are routed to a dispatch
        center based on the calling device&apos;s validated location - the FCC
        calls this{" "}
        <Ext href="https://www.fcc.gov/911-dispatchable-location">
          dispatchable location
        </Ext>
        , the street address plus the suite or apartment needed to actually
        find the caller. A call placed by your phone system carries your phone
        system&apos;s registered location, which means it reaches the wrong
        dispatch center and reports the wrong address. The correct script, in
        every trade, is the same three beats: <Strong>tell the caller to hang
        up and dial 911 now</Strong>, say nothing else that keeps them on the
        line, and log the call. Same for a gas smell, with the addition of
        &quot;get outside first, and call from outside.&quot;
      </P>
      <P>
        Related and easy to miss if you are rebuilding your phone system
        anyway: under Kari&apos;s Law, a multi-line telephone system in the US
        must let anyone dial 911 directly, without a 9 prefix or any other
        code, and must notify a front desk or equivalent when someone does. The
        FCC&apos;s{" "}
        <Ext href="https://www.fcc.gov/mlts-911-requirements">
          MLTS requirements page
        </Ext>{" "}
        is the authority. It is a compliance item, not an optional
        configuration, and the moment you are most likely to break it is the
        moment you are rewiring routing for after-hours coverage.
      </P>

      <H2 id="by-industry">What the trigger list looks like by trade</H2>
      <P>
        The mechanics above are universal; the &quot;always escalate&quot; list
        is not. Broad strokes, with the detail in each trade&apos;s own guide:
      </P>
      <Table
        caption="Emergency triggers by business type"
        head={["Business", "Always escalate", "Deeper detail"]}
        rows={[
          [
            "Plumbing",
            "Uncontrolled water, sewage backup, no water to the property, water heater leaking",
            <Internal key="p" href="/blog/plumbing-answering-service">
              Plumbing answering service
            </Internal>,
          ],
          [
            "HVAC",
            "No heat or no cooling in extreme weather, gas smell, carbon monoxide alarm",
            <Internal key="h" href="/blog/hvac-answering-service">
              HVAC answering service
            </Internal>,
          ],
          [
            "Electrical",
            "Burning smell, sparking, panel hot to touch, total power loss, exposed conductor",
            <Internal key="e" href="/blog/electrician-answering-service">
              Electrician answering service
            </Internal>,
          ],
          [
            "Apartments and property management",
            "Active leak, no heat, no power, sewage, broken exterior door or lock, elevator entrapment",
            <Internal key="a" href="/blog/apartment-answering-service">
              Apartment answering service
            </Internal>,
          ],
          [
            "Medical and dental",
            "Post-op bleeding, severe pain, medication reaction, anything the clinician's protocol names",
            <Internal key="m" href="/blog/medical-answering-service">
              Medical answering service
            </Internal>,
          ],
          [
            "Veterinary",
            "Trauma, seizures, bloat, toxin ingestion, labored breathing",
            <Internal key="v" href="/blog/veterinary-answering-service">
              Veterinary answering service
            </Internal>,
          ],
          [
            "Towing and roadside",
            "Caller in a live traffic lane, accident scene, anyone in the vehicle at risk",
            <Internal key="t" href="/blog/towing-answering-service">
              Towing answering service
            </Internal>,
          ],
        ]}
      />

      <H2 id="close-loop">Closing the loop with the caller</H2>
      <P>
        Half of what people describe as &quot;the emergency was handled
        badly&quot; is actually &quot;nobody told me anything.&quot; The caller
        is standing in the dark with no idea whether their call went anywhere.
        Three cheap things fix it:
      </P>
      <UL>
        <LI>
          <Strong>Say the time out loud.</Strong> &quot;Our on-call technician
          is being paged now and will call you within fifteen minutes&quot; -
          then keep it. A concrete promise you hit beats a warm promise you
          miss.
        </LI>
        <LI>
          <Strong>Text the confirmation.</Strong> What was reported, who is
          coming, what to do in the meantime - shut the valve, kill the
          breaker, stay out of the room. The caller has something to hold
          onto.
        </LI>
        <LI>
          <Strong>Give them the escape hatch.</Strong> Anyone who asks for a
          person gets a{" "}
          <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
            transfer
          </Internal>
          , and the script says so before they have to ask twice. What happens
          when the assistant is out of its depth is worth deciding explicitly
          too -{" "}
          <Internal href="/answers/what-happens-if-an-ai-receptionist-cant-answer">
            here is how that should behave
          </Internal>
          .
        </LI>
      </UL>

      <H2 id="test">Testing it (including the 2 a.m. drill)</H2>
      <OL>
        <LI>
          <Strong>Call your own line and describe a real emergency</Strong>, in
          the words a caller would use, without saying &quot;emergency.&quot;
          It should escalate anyway.
        </LI>
        <LI>
          <Strong>Call and describe something trivial</Strong> while insisting
          it is urgent. It should not escalate.
        </LI>
        <LI>
          <Strong>Let rung one ignore the page deliberately.</Strong> Time the
          ladder. Confirm rung two fires and that rung one can still pick up.
        </LI>
        <LI>
          <Strong>Answer the page and say nothing.</Strong> The ladder must
          keep going. If it stops, you are escalating on connection rather
          than acknowledgement - fix it before anything else.
        </LI>
        <LI>
          <Strong>Run one drill at 2 a.m.</Strong> With phones in their real
          overnight state - Focus on, chargers across the room, everyone
          asleep. This is the only test that tells you the truth, and it is
          the one nobody runs until after the first miss.
        </LI>
        <LI>
          <Strong>Test the 911 script.</Strong> Say &quot;I smell gas.&quot;
          The correct response is short, immediate, and ends the call.
        </LI>
      </OL>

      <H2 id="tuning">Tuning it with two numbers</H2>
      <P>
        Review weekly for the first month, then monthly. Two numbers matter
        and only one of them will find you on its own:
      </P>
      <UL>
        <LI>
          <Strong>False escalations.</Strong> Techs woken for something that
          could have waited. You will hear about these. Each one is a missing
          entry on the &quot;never escalate&quot; list or a missing
          disambiguating question.
        </LI>
        <LI>
          <Strong>Missed escalations.</Strong> Nobody reports the emergency
          that quietly became a Monday message - so audit a sample of
          non-escalated overnight calls deliberately, every week. A trigger list
          producing zero false escalations is almost certainly missing real
          ones; the target is a small, visible false-positive rate, not zero.
        </LI>
      </UL>
      <P>
        Also track acknowledgement time. If rung one is routinely acknowledging
        at three and a half minutes on a four-minute timer, the timer is
        holding the whole thing together by luck.
      </P>

      <H2 id="next">Where this fits</H2>
      <P>
        Escalation is the sharp end of after-hours coverage, not the whole of
        it - the shape of the rest is in{" "}
        <Internal href="/blog/after-hours-answering-service">
          the after-hours answering service guide
        </Internal>{" "}
        and{" "}
        <Internal href="/blog/24-hour-answering-service">
          the 24 hour guide
        </Internal>
        . If you are setting this up for the first time, the practical
        sequence is: write the three trigger lists, wire the ladder with
        acknowledgement, point your line at it with{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          conditional call forwarding
        </Internal>
        , and run the 2 a.m. drill before you rely on it. What the ladder has
        to carry differs by business: the{" "}
        <Internal href="/blog/water-damage-restoration-answering-service">
          restoration
        </Internal>
        ,{" "}
        <Internal href="/blog/home-care-answering-service">home care</Internal>{" "}
        and{" "}
        <Internal href="/blog/self-storage-answering-service">
          self storage
        </Internal>{" "}
        guides each show the escalation triggers those operators actually
        write down. Our plans are on the{" "}
        <Internal href="/pricing">pricing page</Internal> and run
        month-to-month, which means you can test a full ladder on real calls
        for two weeks before committing to anything.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
