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
  slug: "water-damage-restoration-answering-service",
  title: "Restoration Answering Service: Winning the 2 a.m. Water Loss Call",
  description:
    "How a water damage restoration answering service captures emergency losses, takes the intake an estimator can actually dispatch from, and stays out of cause and coverage.",
  date: "2026-08-03",
  updated: "2026-08-03",
  readingTime: "15 min read",
  tag: "Industries",
  hero: "/blog/water-damage-restoration-answering-service-hero.webp",
  heroAlt:
    "A residential hallway at night during a water loss - air mover and dehumidifier running on damp hardwood, baseboard removed, a single work light casting long shadows",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "restoration answering service",
    "water damage answering service",
    "water damage restoration answering service",
    "answering service for restoration companies",
    "24/7 restoration call answering",
    "emergency restoration answering service",
    "mitigation call intake",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "clock", title: "Two clocks are running on every loss call" },
    { id: "call-mix", title: "Who actually calls a restoration company" },
    { id: "intake", title: "The intake an estimator can dispatch from" },
    { id: "never-say", title: "Five sentences the script must never say" },
    { id: "dispatch", title: "Dispatch: the part most services get wrong" },
    { id: "models", title: "Live agents vs AI vs hybrid" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "limits", title: "Where AI loses" },
    { id: "setup", title: "Setting it up" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a restoration answering service?",
      a: "It answers the emergency line for a water, fire, mold or storm damage restoration company 24/7, takes a structured loss intake - source of the water, whether it is still running, how many rooms and floors are affected, whether the power is on, the address and access details, the insurance carrier and claim number if there is one - and then either pages the on-call crew or logs a non-urgent call for the morning. It can be a live answering bureau, an AI receptionist, or a hybrid where AI answers first and escalates to a person.",
    },
    {
      q: "Why does answering speed matter so much in restoration?",
      a: "Because two clocks start at the same moment. The homeowner is calling down a list and will hire whoever answers and arrives first, and the water itself is degrading the loss - the EPA's guidance is that materials dried within 24 to 48 hours will in most cases not grow mold, and clean water left standing picks up contamination over the following days. Every hour of ring-out is both a lost job and a worse job for whoever eventually takes it.",
    },
    {
      q: "How much does a restoration answering service cost?",
      a: "Live emergency answering bureaus generally bill per minute - roughly $1 to $3 - or per call, which for a company running a real 24/7 line usually lands between $300 and $1,500 a month, and rises in exactly the weeks a storm makes it busiest. AI answering is typically flat, in the $30 to $300 a month range per line, and does not meter or queue when a freeze event puts nine callers on the line at once. Against a single Category 1 mitigation job the monthly fee of either is a rounding error - which is why the decision should be made on intake quality, not price.",
    },
    {
      q: "Can an answering service dispatch my on-call crew?",
      a: "Yes, and this is the part worth testing before you sign. A good setup pages the primary on-call tech, waits a defined number of minutes for an acknowledgement, escalates to the second name, then to the production manager, and tells the caller what is actually happening. A weak setup emails a message to an inbox nobody is reading at 2 a.m. Ask any prospective service to demonstrate the unacknowledged-page path, not the happy path.",
    },
    {
      q: "Should the script tell the caller their insurance will cover the job?",
      a: "Never. Coverage is decided by the carrier against a specific policy, and a promise made on your phone line at 2 a.m. becomes a deductible argument on invoice day. The correct script captures the carrier, the claim number if one exists, and whether the caller has notified them, then says an estimator will walk them through the process on site. The same rule applies to cause and origin - the phone is not the place to say what failed or who is liable.",
    },
    {
      q: "Can AI handle a panicked caller standing in water?",
      a: "For intake, yes - and consistency is its real advantage, because it asks the safety questions in the same order at 2 a.m. as at 2 p.m. and never skips them because the caller is upset. What it should not do is improvise. Any answer involving standing water near electrical outlets, sewage, a gas smell, or an injury gets a fixed safety instruction and, where relevant, 911 - not troubleshooting. And a caller who asks for a person should get one.",
    },
    {
      q: "What about insurance adjusters and program work?",
      a: "They are a separate path, and treating them like homeowner emergencies is how companies lose program assignments. An adjuster or third-party administrator calling to assign a loss needs the assignment captured cleanly - carrier, claim number, insured name and address, loss type, and the response window promised - and routed to whoever owns that program relationship, usually with a same-business-hours callback commitment rather than a middle-of-the-night page.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "EPA: A Brief Guide to Mold, Moisture and Your Home (drying within 24-48 hours)",
    url: "https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home",
  },
  {
    title:
      "IICRC: ANSI/IICRC S500 Standard for Professional Water Damage Restoration",
    url: "https://iicrc.org/s500/",
  },
  {
    title:
      "Harvard Business Review: The Short Life of Online Sales Leads (lead response-time research)",
    url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Restoration is the rare trade where the phone call <em>is</em> the sale.
        Nobody shops three mitigation companies and calls back Thursday - they
        dial the first result, and if it rings out they dial the second, and
        whoever picks up is standing in their hallway ninety minutes later with
        an authorization form. Meanwhile the water is not waiting either. We
        build the AI kind of answering service, so read this with suspicion:
        here is what the loss call actually has to capture, the five sentences
        that must never come out of an automated script, and the parts of this
        job where a machine has no business at all.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Two clocks run at once: the caller is working down a list, and the{" "}
            <Strong>water is degrading the loss</Strong> while your line rings.
          </>,
          <>
            The job of the call is not a message. It is a{" "}
            <Strong>dispatchable intake</Strong> - source, still running, floors
            affected, power, access, carrier - plus a paged crew.
          </>,
          <>
            <Strong>Cause, coverage and price stay off the phone.</Strong> They
            are decided on site and by the carrier, and a 2 a.m. promise becomes
            an invoice-day argument.
          </>,
          <>
            Test the <Strong>unacknowledged-page path</Strong> before you sign
            anything. Every service demos the happy path.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>restoration answering service</Strong> covers the emergency
        line for a water, fire, mold or storm damage company around the clock -
        nights, weekends, holidays, and the four hours during a freeze event
        when every phone in the office is already in use. It answers on the
        first ring, runs a structured loss intake, gives the caller fixed safety
        instructions where they are warranted, pages the on-call crew and
        escalates if nobody acknowledges, and logs everything with a recording
        and a transcript. Live operators can do it, an AI receptionist can do
        it, and most companies past a certain size end up with a hybrid.
      </P>
      <P>
        If your emergency volume comes mostly through a plumbing or roofing arm,
        our{" "}
        <Internal href="/blog/plumbing-answering-service">
          plumbing answering service guide
        </Internal>{" "}
        and{" "}
        <Internal href="/blog/roofing-answering-service">
          roofing answering service guide
        </Internal>{" "}
        cover those call mixes specifically. This one is about mitigation: the
        call where somebody is looking at water they cannot stop.
      </P>

      <Figure
        src="/blog/restoration-homeowner-call.webp"
        alt="A homeowner standing in a dim hallway at night, phone to her ear, looking up at a spreading water stain on the ceiling with a bucket catching drips below"
        width={1376}
        height={768}
        caption="The call your answering setup exists for. She is not comparing vendors or waiting for a callback - she is dialling in order and will stop at the first company that picks up."
      />

      <H2 id="clock">Two clocks are running on every loss call</H2>
      <P>
        Most answering service pages make the speed argument in general terms.
        In restoration it is unusually literal, because two independent things
        are getting worse while the phone rings.
      </P>
      <H3>The caller&apos;s clock</H3>
      <P>
        A homeowner with water coming through a ceiling is not evaluating
        vendors. They are dialing whatever the search results gave them and
        stopping at the first company that answers. The general research on lead
        response -{" "}
        <Ext href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads">
          the Harvard Business Review study on contact rates
        </Ext>{" "}
        found the odds of reaching a lead collapsing within the first hour - is
        an understatement here, because the restoration caller is not going to
        be reached later at all. They will already have hired someone.
      </P>
      <H3>The building&apos;s clock</H3>
      <P>
        The second clock is physical and it does not care who eventually shows
        up. The EPA&apos;s guidance is blunt:{" "}
        <Ext href="https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home">
          &quot;If wet or damp materials or areas are dried 24-48 hours after a
          leak or spill happens, in most cases mold will not grow.&quot;
        </Ext>{" "}
        Restorers work to the{" "}
        <Ext href="https://iicrc.org/s500/">ANSI/IICRC S500 standard</Ext>, which
        classifies water by contamination category, and clean Category 1 water
        left sitting in a structure does not stay Category 1 - given time,
        temperature and the right substrate it picks up contamination and the
        scope changes with it. How fast depends on conditions, so treat it as a
        risk curve rather than a countdown. The direction of the curve is never
        in doubt.
      </P>
      <Figure
        src="/blog/restoration-two-clocks.svg"
        alt="A two-track timeline. The caller's clock: dials the first result, gets no answer and moves to the next company, a competitor is rolling within twenty minutes, authorisation signed within the hour. The building's clock: clean Category 1 water at hour zero, the EPA 24 to 48 hour drying window, then contamination and a growing scope days later"
        width={1200}
        height={630}
        caption="The two clocks, side by side. Most trades only run the top one - restoration is unusual in that the job itself gets worse while the phone rings."
        credit="Illustration by AI Receptionist Now"
      />

      <Callout>
        The commercial consequence of the second clock is easy to miss: a call
        that rings out at 1 a.m. and gets returned at 8 a.m. is not the same job
        seven hours later. It is a bigger, dirtier, more argued-about job that
        somebody else is now doing.
      </Callout>
      <P>
        If you want the general version of this arithmetic with your own
        numbers, we wrote{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the cost of a missed call
        </Internal>{" "}
        and built{" "}
        <Internal href="/missed-call-calculator">a calculator</Internal> for it.
        Restoration sits at the extreme end of it: high average job value, near
        zero callback tolerance.
      </P>

      <H2 id="call-mix">Who actually calls a restoration company</H2>
      <P>
        The mistake behind most bad restoration answering setups is treating
        every inbound call as an emergency. Five different callers use the same
        number and only one of them should ever wake anybody up.
      </P>
      <Table
        caption="The call mix on a restoration company's main line"
        head={["Caller", "What they need", "Right handling"]}
        rows={[
          [
            "Homeowner with an active loss",
            "Someone on site, and to be told what to do in the next five minutes",
            "Full loss intake, safety instructions, page the on-call crew, confirm an arrival window you can keep",
          ],
          [
            "Plumber, roofer or property manager referring a job",
            "To hand off a loss they are standing in front of and get back to their own work",
            "Short intake from a pro who already knows the answers, immediate page, and a callback to the referrer - this is the relationship that feeds you",
          ],
          [
            "Adjuster or TPA assigning a claim",
            "The assignment accepted and the response window acknowledged",
            "Capture carrier, claim number, insured, loss type and promised window; route to the program owner; usually a business-hours callback, not a page",
          ],
          [
            "Existing job, mid-project",
            "An answer about equipment, drying days, scheduling or the reconstruction phase",
            "Log against the job number and route to the project manager in the morning - almost never an emergency",
          ],
          [
            "Sales, vendors, subs, marketing",
            "Your money",
            "Captured and filtered - logged for the morning, never a page",
          ],
        ]}
      />
      <P>
        A service that pages the on-call tech for a mid-project drying question
        is a service your crew will start ignoring within a month - and an
        ignored page is how you miss the real one. Filtering is not a
        nice-to-have here; it is what keeps escalation credible. Our{" "}
        <Internal href="/answers/can-an-ai-receptionist-block-spam-calls">
          note on spam and sales filtering
        </Internal>{" "}
        covers the least glamorous version of the same principle.
      </P>

      <H2 id="intake">The intake an estimator can dispatch from</H2>
      <P>
        &quot;Water damage at 14 Oak Street, please call back&quot; is not an
        intake. It is a message, and it forces your tech to re-run the entire
        conversation from a truck. A dispatchable intake answers the questions
        that change what gets loaded and who goes:
      </P>
      <UL>
        <LI>
          <Strong>Is anyone hurt, and is the water near electricity?</Strong>{" "}
          First, always. Ceiling water around light fixtures, standing water in a
          basement with a panel or outlets in it - the script gives a fixed
          instruction and, when warranted, 911, before anything else.
        </LI>
        <LI>
          <Strong>What is the source, and is it still running?</Strong> Supply
          line, water heater, roof, appliance, sewer backup, sprinkler, storm.
          &quot;Still running&quot; is the single most important field on the
          form, and it comes with the next question.
        </LI>
        <LI>
          <Strong>Can they shut it off?</Strong> Main shutoff for supply-side
          losses, breaker for a water heater. Walk them to it if they are able.
          This is the one piece of genuine help the call itself can deliver.
        </LI>
        <LI>
          <Strong>What kind of water?</Strong> Not a category call - the
          estimator makes that on site - but the caller can tell you if it is
          clean supply water, washing machine or dishwasher water, or sewage,
          and the answer changes the PPE and the truck.
        </LI>
        <LI>
          <Strong>How much, how far, and how many floors?</Strong> Rooms
          affected, standing depth, whether it has gone through a ceiling to the
          floor below, carpet or hardwood or tile, approximate square footage.
          This decides equipment count.
        </LI>
        <LI>
          <Strong>Is the power on? Is the building occupied?</Strong> Plus
          vulnerable occupants, pets, and whether anyone can stay on site.
        </LI>
        <LI>
          <Strong>Address, gate and access.</Strong> Gate codes, apartment or
          unit number, parking for a box truck, who will meet the crew and on
          what number. Half the delay in restoration dispatch is finding the
          door.
        </LI>
        <LI>
          <Strong>Insurance carrier, claim number, and whether they have
          filed.</Strong> Captured as facts, with no opinion attached to them.
        </LI>
        <LI>
          <Strong>Who can authorize the work?</Strong> Owner, tenant, property
          manager, or the HOA for a common-element loss. A tenant cannot
          authorize demolition in someone else&apos;s building, and finding that
          out on site costs a truck roll.
        </LI>
      </UL>
      <P>
        That is fifteen or so fields captured in three or four minutes, in the
        same order every time, at any hour. It is the strongest structural
        argument for a scripted service over a rushed human - not that the
        script is smarter, but that it does not get tired at 3 a.m. and skip
        straight to &quot;we&apos;ll be right there.&quot;
      </P>

      <Figure
        src="/blog/restoration-moisture-reading.webp"
        alt="A restoration technician kneeling with a handheld moisture meter pressed against damp drywall above a removed baseboard, gloved hands, an air mover running in the background"
        width={1376}
        height={768}
        caption="Everything the estimator does on site depends on what was captured on the phone. A message saying 'water damage, please call back' sends this technician out blind - and often in the wrong truck."
      />

      <H2 id="never-say">Five sentences the script must never say</H2>
      <P>
        This is the section to bring to whichever vendor you are evaluating, AI
        or human. Every one of these gets said by well-meaning answering
        services and every one of them costs money later.
      </P>
      <OL>
        <LI>
          <Strong>&quot;Your insurance will cover this.&quot;</Strong> Coverage
          is a carrier decision against a specific policy, and a sentence said
          on your line becomes the reason a homeowner refuses to pay a
          deductible. Capture the carrier and the claim number. Say the
          estimator will walk them through the process.
        </LI>
        <LI>
          <Strong>&quot;It sounds like the supply line failed / the roofer is
          liable.&quot;</Strong> Cause and origin is determined on site, and
          sometimes by someone with credentials your phone answerer does not
          have. Speculation on a recorded line is a gift to the other side of a
          subrogation fight.
        </LI>
        <LI>
          <Strong>&quot;That&apos;ll be about three thousand dollars.&quot;</Strong>{" "}
          Mitigation is priced from scope, and scope is not visible over the
          phone. A number said out loud becomes the ceiling on the invoice.
        </LI>
        <LI>
          <Strong>&quot;Someone will be there in thirty minutes.&quot;</Strong>{" "}
          Unless the dispatch system knows a crew is free and the drive time is
          real, an arrival promise is a complaint you have scheduled for
          yourself. Commit to a window you can keep, or commit to a callback
          from the tech with a real ETA within a defined number of minutes.
        </LI>
        <LI>
          <Strong>&quot;That mold won&apos;t hurt you.&quot;</Strong> Or the
          reverse - health reassurance and health alarm are both out of scope.
          The script acknowledges the concern and hands it to the estimator, who
          can point at the actual conditions.
        </LI>
      </OL>
      <Callout>
        A useful test when you demo any service: call in and say &quot;is this
        covered by my insurance, and how much is it going to cost me?&quot; -
        the two questions every real caller asks in the first ninety seconds.
        What comes back tells you more about the product than the feature list
        does.
      </Callout>
      <P>
        None of this is legal advice, and nothing here should be read as a
        statement about how any particular policy or claim will be handled -
        your counsel and your carrier relationships govern. Treat it as the
        brief you hand whichever service you are evaluating: here is the
        intake, and here are the five places the script stops talking.
      </P>

      <H2 id="dispatch">Dispatch: the part most services get wrong</H2>
      <P>
        Capturing a beautiful intake and dropping it into an inbox at 2 a.m. is
        theatre. The dispatch chain is the product, and it has four parts worth
        specifying in writing:
      </P>
      <UL>
        <LI>
          <Strong>Page, don&apos;t email.</Strong> A call to the on-call
          phone that keeps ringing beats a notification, every time.
        </LI>
        <LI>
          <Strong>Require an acknowledgement.</Strong> Not a delivered message -
          an actual confirmation from a human being that they have it. Anything
          else is a message that was successfully sent to somebody asleep.
        </LI>
        <LI>
          <Strong>Escalate on a timer.</Strong> Primary on-call, then a defined
          wait, then the second name, then the production manager, then the
          owner. Written down, with the minutes filled in. We covered how to
          build this chain in{" "}
          <Internal href="/blog/how-to-set-up-emergency-call-escalation">
            the guide to emergency call escalation
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Tell the caller the truth about what is happening.</Strong>{" "}
          &quot;I&apos;ve paged our on-call crew now and they will call you back
          within fifteen minutes&quot; is a promise you control. &quot;Someone
          will be right out&quot; is one you do not.
        </LI>
      </UL>
      <P>
        The other reason dispatch decides the vendor: catastrophe volume. A hard
        freeze or a regional storm does not produce one call, it produces forty
        in an hour, and a per-minute answering bureau puts them in a queue while
        your competitors&apos; lines are also busy.{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
          Parallel answering
        </Internal>{" "}
        is the one capability that matters more in restoration than in almost
        any other trade, because your revenue is concentrated into exactly the
        hours when volume spikes.
      </P>

      <H2 id="models">Live agents vs AI vs hybrid</H2>
      <Table
        caption="Answering models for restoration companies"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Live emergency answering bureau",
            "Companies that want a human voice on every distressed call and have the margin for it",
            "Per-minute billing that peaks with catastrophe volume; hold queues during exactly the storm you needed it for; operators who know the script but not your service area",
          ],
          [
            "AI receptionist",
            "Companies losing after-hours calls and referral handoffs, and anyone whose intake quality varies by who answered",
            "The intake form, safety branches and page-escalation chain must be configured properly; the never-say list has to be explicit",
          ],
          [
            "Hybrid (AI first, human escalation)",
            "Most established shops - AI answers instantly and takes intake, humans take what needs judgment",
            "Define the always-human list up front: injuries, commercial large-loss, program work, angry existing customers",
          ],
          [
            "In-house rotation with a cell phone",
            "Owner-operators doing under a handful of losses a month",
            "It works until the night you sleep through it, and it fails silently - nobody reports the call they never knew about",
          ],
        ]}
      />
      <P>
        Cross-market pricing lives in our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost guide
        </Internal>
        ; our own flat plans are on the{" "}
        <Internal href="/pricing">pricing page</Internal>. You keep the number
        that is on your trucks either way -{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          forwarding takes about eight minutes
        </Internal>
        .
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <H3>2:14 a.m., homeowner, active loss</H3>
      <Callout>
        &quot;Thanks for calling - is anyone hurt? ... No. Is the water anywhere
        near outlets, a panel, or light fixtures? ... It&apos;s coming through a
        ceiling light. Okay: don&apos;t touch that fixture or the switch, and if
        you can reach your breaker panel safely, cut power to that room. Is the
        water still running? ... I think it&apos;s from the bathroom upstairs.
        Do you know where your main shutoff is? ... Garage. If it&apos;s safe,
        turn it clockwise until it stops, and stay on with me. ... Done, it
        stopped. Good - that&apos;s the most important thing you could have
        done. How many rooms have water in them now? ... Two down here, and the
        bathroom above. Hardwood or carpet? ... Hardwood. I&apos;m paging our
        on-call crew right now - they&apos;ll call you back within fifteen
        minutes with an arrival time. While I have you: what&apos;s the address
        and how do we get in, is anyone staying at the house tonight, and do you
        have pets?&quot;
      </Callout>
      <H3>7:50 p.m., plumber referring a job</H3>
      <Callout>
        &quot;You&apos;re at the property now? ... Yes, I&apos;ve capped the
        supply line, but the pad&apos;s soaked through two rooms. ... Got it -
        that&apos;s exactly what we need to know. Category-wise, clean supply
        water? ... Clean. Homeowner on site? ... Yes. I&apos;m paging our crew
        now and I&apos;ll have them call you directly rather than the homeowner,
        so you can hand off in person. What&apos;s the best number for you
        tonight?&quot;
      </Callout>
      <H3>The two questions with fixed answers</H3>
      <Callout>
        &quot;Is this covered by insurance?&quot; -{" "}
        <em>
          &quot;That&apos;s your carrier&apos;s call, and our estimator will walk
          you through exactly how the claim process works when they&apos;re
          there. Do you know who your carrier is, and have you opened a claim
          yet?&quot;
        </em>
        <br />
        &quot;How much is this going to cost?&quot; -{" "}
        <em>
          &quot;It depends on what the crew finds - how far the water travelled
          and what it got into. They&apos;ll scope it on site and go through the
          numbers with you before any work starts.&quot;
        </em>
      </Callout>

      <H2 id="limits">Where AI loses (keep a human here)</H2>
      <UL>
        <LI>
          <Strong>Injury, fire, gas, or electrocution risk.</Strong> The script
          gives one instruction - get out, call 911 - and does not run intake.
          There is no version of this where continuing the form is correct.
        </LI>
        <LI>
          <Strong>Commercial and large loss.</Strong> A flooded facility with a
          business interruption clock and a risk manager on the line needs your
          most senior person now, not a form. Route it straight through.
        </LI>
        <LI>
          <Strong>Program and TPA relationships.</Strong> Assignment terms,
          response-time compliance and program scorecards are a human
          relationship. Capture cleanly, escalate to the owner of that account.
        </LI>
        <LI>
          <Strong>Anything about cause, liability or coverage.</Strong> Covered
          above, and worth saying twice because it is the most expensive place
          an automated script can wander.
        </LI>
        <LI>
          <Strong>The distressed caller who needs a person.</Strong> Somebody
          who has just lost a home to a fire is not an intake problem. The
          script should recognise it early and hand over.
        </LI>
      </UL>

      <H2 id="setup">Setting it up</H2>
      <OL>
        <LI>
          <Strong>Write the emergency definition first.</Strong> One page: what
          gets a page tonight, what waits for morning, what is never an
          emergency. Mid-project questions belong in the third column - that
          decision alone will save your on-call rotation.
        </LI>
        <LI>
          <Strong>Build the intake form and make it mandatory.</Strong> Fifteen
          fields, fixed order, safety first, no free-text-only messages. Send it
          to the tech in the page itself, not as a link they have to open in a
          truck.
        </LI>
        <LI>
          <Strong>Write the never-say list into the script.</Strong> Coverage,
          cause, price, arrival promises, health opinions. Then call in and try
          to break each one.
        </LI>
        <LI>
          <Strong>Wire the escalation chain and test it at night.</Strong> Page,
          wait, second name, manager. Run it once at 2 a.m. deliberately, before
          a real freeze does it for you.
        </LI>
        <LI>
          <Strong>Give the referral sources their own path.</Strong> Plumbers,
          roofers and property managers should never sit through a homeowner
          script. Recognise them, shorten the intake, call them back rather than
          the homeowner.
        </LI>
        <LI>
          <Strong>Read the transcripts for two weeks.</Strong> Every miss is a
          missing branch. The intake you ship in week one is not the one you
          will be running in month two, and that is how it should work.
        </LI>
      </OL>
      <P>
        The test for whether you need this is not a hunch. Pull the call log for
        the last big weather event in your market and count the inbound calls
        that rang out or went to voicemail. Each one was a loss that somebody
        else mitigated. If the coverage question is broader than restoration,
        our{" "}
        <Internal href="/blog/after-hours-answering-service">
          after-hours guide
        </Internal>{" "}
        and{" "}
        <Internal href="/home-services">home services page</Internal> cover the
        general patterns - and if you want to hear the intake script yourself,
        the{" "}
        <Internal href="/pricing">plans are month-to-month</Internal>.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
