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
  slug: "best-ai-receptionist-for-home-services",
  title: "Best AI Receptionist for HVAC and Home Services (2026)",
  description:
    "Ranked for contractors, starting with the one already inside your field service software. ServiceTitan, Jobber and Housecall Pro all ship their own now - which changes what a third-party tool has to beat.",
  date: "2026-08-25",
  updated: "2026-08-25",
  readingTime: "17 min read",
  tag: "Guides",
  hero: "/blog/home-services-dispatch-hero.webp",
  heroAlt:
    "The cab of a service van at dusk outside a suburban house, seen through the open driver door, with a phone face-down on the seat, a clipboard, coiled copper pipe and work gloves on the dashboard",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "ai receptionist for hvac",
    "ai receptionist for home services",
    "ai answering service for contractors",
    "ai voice agent for home services",
    "best ai receptionist for contractors",
    "hvac ai answering service",
    "avoca ai alternative",
    "sameday ai alternative",
  ],
  sections: [
    { id: "the-ranking", title: "The ranking, in one table" },
    { id: "what-changed", title: "What changed in the last eight months" },
    { id: "how-we-ranked", title: "How we ranked these - and who we are" },
    { id: "capacity", title: "Booking a job you cannot staff" },
    { id: "shortlist", title: "The five, one at a time" },
    { id: "pricing", title: "What each one actually costs" },
    { id: "safety", title: "The calls an AI must hand over immediately" },
    { id: "test", title: "Seven calls that sort the field" },
    { id: "not-for-you", title: "When none of these is the answer" },
    { id: "faq", title: "FAQ" },
  ],
  itemList: [
    {
      name: "The AI already inside your field service software",
      description:
        "ServiceTitan AI Virtual Agents, Jobber AI Receptionist or Housecall Pro CSR AI. Check this first - it books against live capacity and job types, needs no integration, and in ServiceTitan's case has no commitment and a per-call usage fee.",
      url: "https://www.servicetitan.com/blog/webinar-recap-ai-virtual-agents-call-booking",
    },
    {
      name: "Avoca",
      description:
        "Best for established shops that want booking, win-back and CSR coaching from one vendor. A ServiceTitan Certified App with deep CRM integration. Demo-only pricing.",
      url: "https://www.avoca.ai/",
    },
    {
      name: "Sameday AI",
      description:
        "Best when you want a published price and native field-service scheduling. Launch from $449/mo with 500 minutes and 3 locations; Scale from $789/mo with 1,000 minutes and unlimited locations.",
      url: "https://sameday.ai/pricing",
    },
    {
      name: "Rosie or Goodcall",
      description:
        "Best for one to five trucks. Published SMB pricing - Rosie from $49/mo for 250 minutes, Goodcall from $79/mo per agent with unlimited minutes billed on unique callers. Zapier-level integrations, not FSM write-back.",
      url: "https://www.heyrosie.com/pricing",
    },
    {
      name: "A general packaged AI receptionist",
      description:
        "Best when the phone needs answering after hours and jobs are still booked by a human in the morning. Flat monthly pricing, live the same day, calendar-level integrations only.",
      url: "https://aireceptionistnow.com/pricing",
    },
  ],
  faqs: [
    {
      q: "What is the best AI receptionist for an HVAC or plumbing company?",
      a: "Check your field service software first, because the answer has changed. ServiceTitan introduced AI Virtual Agents in April 2026, Jobber launched its AI Receptionist in August 2025, and Housecall Pro pairs CSR AI with its own human answering service. A native agent books against live capacity and your real job types with no integration to build, which no third party can match. If your FSM has nothing, or its version is too limited, Avoca is the deepest third-party option for established shops, Sameday AI is the one that publishes a price, and Rosie or Goodcall fit one to five trucks.",
    },
    {
      q: "How much does an AI receptionist for contractors cost?",
      a: "The published numbers span an order of magnitude. Rosie starts at $49 per month for 250 minutes, rising to $299 for 2,000. Goodcall runs $79 to $249 per agent per month with unlimited minutes, billed instead on unique callers - 100, 250 or 500 - and $0.50 per caller beyond. Sameday AI's Launch plan starts at $449 per month with 500 minutes and three locations, and Scale at $789 with 1,000 minutes. Avoca does not publish. ServiceTitan states no commitment is needed and charges a per-call usage fee. A general packaged AI receptionist runs €99-€299 a month.",
    },
    {
      q: "Does an AI receptionist integrate with ServiceTitan?",
      a: "Several do, at different depths. Avoca is listed as a ServiceTitan Certified App with deep CRM integration, and Sameday AI lists Pro scheduling with ServiceTitan among its included features. ServiceTitan's own marketplace describes its listings as ServiceTitan-approved integration and services partners. But the highest-depth option is now ServiceTitan itself: its AI Virtual Agents are described as the only ones that integrate with adaptive capacity directly inside ServiceTitan, and they work whether you use Contact Center Pro, Phones Pro or a third-party phone system.",
    },
    {
      q: "Can an AI receptionist handle an after-hours emergency call?",
      a: "It can triage one and escalate it, and that is exactly what it should do rather than trying to resolve it. The rule worth writing down before you configure anything: a suspected gas leak, a carbon monoxide alarm, smoke, or an active flood is never a booking. The agent should tell the caller to leave the property and call the utility or emergency services, then wake a human. Everything else - no heat, no cooling, a slow leak, a dead outlet - is a triage question about severity and vulnerability, and that is where a well-configured agent earns its money at 2 a.m.",
    },
    {
      q: "Is it better than an answering service with real people?",
      a: "They fail differently. A human service handles the distressed caller and the unusual situation better, and charges you per minute or per call whether or not the call was worth taking. An AI answers three simultaneous calls at 2 a.m. for a flat fee, never has a bad night, and has no judgement whatsoever. The strongest configuration for most shops is neither alone: an AI on the front, with a fast, reliable route to a real person - your on-call tech, or a human service behind it. ServiceTitan's own agent will escalate to a third-party answering service for precisely this reason.",
    },
    {
      q: "Will an AI receptionist book jobs I cannot staff?",
      a: "Yes, unless it can see your capacity, and this is the failure that costs more than a missed call. A booked job you have to ring back and cancel burns the lead and your reputation at once. It is the specific advantage a native agent has: ServiceTitan's books against adaptive capacity and lets you restrict which job types the agent may book, down to the business unit, with a configurable dispatch fee per combination. Ask any third-party vendor what happens when the board is full - if the answer is that it books anyway and a dispatcher fixes it in the morning, price that dispatcher's time in.",
    },
    {
      q: "What about speed to lead from Angi and Thumbtack?",
      a: "That is outbound, not answering, and it is a separate product decision worth making deliberately. Lead-platform enquiries decay in minutes, so several vendors here sell an outbound speed-to-lead motion alongside inbound answering - Avoca lists Speed-to-Lead, Outbound Campaigns and Google LSA as its own module, and ServiceTitan has named lead-platform speed-to-lead as a roadmap item. If most of your leads arrive through those platforms rather than your own phone number, solve that first; the best inbound agent in the world cannot answer a call nobody made.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "ServiceTitan: Introducing AI Virtual Agents (17 April 2026) - capacity, escalation, per-call fee",
    url: "https://www.servicetitan.com/blog/webinar-recap-ai-virtual-agents-call-booking",
  },
  {
    title: "ServiceTitan Marketplace: approved integration and services partners",
    url: "https://marketplace.servicetitan.com/",
  },
  {
    title:
      "Jobber: AI Receptionist product page (add-on to any plan, included with Plus)",
    url: "https://www.getjobber.com/features/ai-receptionist/",
  },
  {
    title:
      "PR Newswire: Jobber launches AI-powered Receptionist (18 August 2025)",
    url: "https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html",
  },
  {
    title: "Avoca: product site (ServiceTitan Certified App, Book / Win Back / Coach)",
    url: "https://www.avoca.ai/",
  },
  {
    title: "Sameday AI: pricing (Launch, Scale, Enterprise)",
    url: "https://sameday.ai/pricing",
  },
  {
    title: "Rosie: pricing (Professional, Scale, Growth)",
    url: "https://www.heyrosie.com/pricing",
  },
  {
    title: "Goodcall: pricing (Starter, Growth, Scale - billed on unique customers)",
    url: "https://www.goodcall.com/pricing",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every ranked list of AI receptionists for contractors has the same
        problem: it was written by someone selling one, and it quietly skips the
        product most likely to be the right answer. Between August 2025 and April
        2026, Jobber, Housecall Pro and ServiceTitan all shipped their own AI
        that answers the phone. If you pay one of them already, that is where
        your evaluation starts - and it is why the top of this ranking is not a
        vendor at all. We sell a general AI receptionist, which puts us fifth on
        our own list. Everything below is sourced to the vendors&apos; own pages,
        with the numbers they publish and an explicit note wherever they publish
        nothing.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Check your FSM first.</Strong> ServiceTitan, Jobber and
            Housecall Pro all now ship a voice agent. A native one books against
            live capacity and real job types with nothing to integrate.
          </>,
          <>
            <Strong>Capacity is the differentiator, not voice.</Strong> A booked
            job you cannot staff costs more than a missed call. Ask every vendor
            what happens when the board is full.
          </>,
          <>
            <Strong>The published prices span 6x.</Strong> $49 a month at Rosie,
            $789 at Sameday&apos;s Scale tier. They are not the same product and
            the gap is mostly field-service write-back.
          </>,
          <>
            <Strong>Write the safety rule before you configure
            anything.</Strong> Gas, CO, smoke and active flooding are never
            bookings. They are &quot;leave the building&quot; plus a human, every
            time.
          </>,
        ]}
      />

      <H2 id="the-ranking">The ranking, in one table</H2>
      <P>
        Ordered for the shop most likely to be reading this: one to twenty
        trucks, running an FSM, losing calls after hours and during the summer
        peak. A one-van operation should read from row four down.
      </P>
      <Table
        caption="Five options for a home services contractor, ranked (August 2026)"
        head={["#", "Option", "Best when", "Published price?"]}
        rows={[
          [
            "1",
            "The AI inside your FSM",
            "You already pay for ServiceTitan, Jobber or Housecall Pro",
            "Partly - Jobber bundles it; ServiceTitan bills per call",
          ],
          [
            "2",
            "Avoca",
            "Established shop, wants booking, win-back and CSR coaching in one",
            "No",
          ],
          [
            "3",
            "Sameday AI",
            "You want a number on a page and native FSM scheduling",
            "Yes - from $449/mo",
          ],
          [
            "4",
            "Rosie or Goodcall",
            "One to five trucks, calendar-level booking is enough",
            "Yes - from $49 and $79/mo",
          ],
          [
            "5",
            "A general packaged AI receptionist",
            "After-hours cover, jobs still booked by a human in the morning",
            "Yes - typically €99-€299/mo",
          ],
        ]}
      />

      <H2 id="what-changed">What changed in the last eight months</H2>
      <P>
        This category was reasonably simple until recently. Contractors bought an
        FSM for scheduling and dispatch, and bought answering separately, from a
        human service or an AI vendor. That separation is closing, quickly.
      </P>
      <Figure
        src="/blog/home-services-platform-timeline.svg"
        alt="A timeline showing Jobber launching its AI Receptionist in August 2025 as an add-on included free on the Plus plan, Housecall Pro pairing CSR AI with its HCP Assist human answering service, and ServiceTitan introducing AI Virtual Agents in April 2026 that book against live capacity with no commitment and a per-call fee"
        width={1200}
        height={630}
        caption="The consequence is the part worth sitting with: a third-party agent no longer has to beat your voicemail. It has to beat something already inside the system holding your capacity and your dispatch board."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        ServiceTitan announced its version in April 2026 and did not hedge about
        who it was aimed at. Its own launch write-up lists, among the reasons
        contractors need this, that{" "}
        <Ext href="https://www.servicetitan.com/blog/webinar-recap-ai-virtual-agents-call-booking">
          third-party answering services just don&apos;t cut it for the trades
        </Ext>
        . When the platform your dispatch runs on says that in public, the
        question for every third-party vendor - including us - stops being
        &quot;are we good&quot; and becomes &quot;are we better than the thing
        already inside the software you pay for&quot;.
      </P>
      <Figure
        src="/blog/servicetitan-ai-virtual-agents.webp"
        alt="ServiceTitan's blog post header, tagged product announcements and AI voice agent, titled Introducing AI Virtual Agents: Never Miss a Call with the Smartest AI CSR, dated April 17th 2026"
        width={1400}
        height={361}
        caption="Filed by ServiceTitan under product announcements, April 2026. The category tags at the top - AI, AI Voice Agent - are the clearest statement of intent available."
        credit="Screenshot: servicetitan.com, August 2026"
        creditUrl="https://www.servicetitan.com/blog/webinar-recap-ai-virtual-agents-call-booking"
      />
      <P>
        Jobber got there earlier and aimed lower down the market. It launched its
        AI Receptionist on 18 August 2025, and its own announcement states that{" "}
        <Ext href="https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html">
          Receptionist has handled more than 200,000 conversations
        </Ext>{" "}
        on behalf of participating businesses before the product went generally
        available. Its positioning is not subtle either.
      </P>
      <Figure
        src="/blog/jobber-ai-receptionist.webp"
        alt="Jobber's AI Receptionist page, headlined 'The best AI answering service in blue collar', with an audio player showing the agent saying 'Hi there, you've reached Blossom and Blade Landscaping. Just a heads up, I'm an AI receptionist.'"
        width={1400}
        height={442}
        caption="Note the second line of the sample greeting. The platform vendors have settled on disclosure by default - which is the right call, and worth copying whichever product you buy."
        credit="Screenshot: getjobber.com, August 2026"
        creditUrl="https://www.getjobber.com/features/ai-receptionist/"
      />

      <H2 id="how-we-ranked">How we ranked these - and who we are</H2>
      <OL>
        <LI>
          <Strong>First-party sources only.</Strong> Every number below comes
          from a vendor pricing page, product page or announcement read in August
          2026. Where a vendor publishes nothing, we say so rather than repeating
          a figure from another blog. Several widely-cited prices for this
          category do not appear on any vendor site we could find.
        </LI>
        <LI>
          <Strong>Depth of field-service write-back is the main axis.</Strong>{" "}
          An agent that books a job against real capacity removes work. One that
          emails a lead creates a to-do list for a dispatcher. Both are sold with
          the same headline about never missing a call.
        </LI>
        <LI>
          <Strong>The incumbent gets the top slot on merit.</Strong> Not
          loyalty - arithmetic. Zero integration risk, live capacity, your job
          types, one bill, one support number. A third party has to be
          meaningfully better to justify existing alongside that.
        </LI>
        <LI>
          <Strong>We disclose our own position.</Strong> We sell a general
          packaged AI receptionist. It does not write into ServiceTitan or
          Housecall Pro. That is why it is fifth, and if the FSM write-back is
          the point, four other options here beat ours.
        </LI>
      </OL>

      <H2 id="capacity">Booking a job you cannot staff</H2>
      <P>
        The demo everyone runs is the wrong one. You call, you say the AC is out,
        the agent is polite, it books you Thursday, everyone nods. Now ask what
        happens on the third day of a heatwave when Thursday has been full since
        Monday.
      </P>
      <P>
        There are three possible answers and only one of them is good. It books
        anyway, and a dispatcher spends the morning ringing customers to cancel -
        which converts a missed call into a broken promise, the more expensive of
        the two. It refuses to book and takes a message, which is honest and
        wastes the capture. Or it sees the board, offers what genuinely exists,
        and escalates the ones that cannot wait.
      </P>
      <P>
        This is the specific thing the native products are built to do.
        ServiceTitan describes its agents as{" "}
        <Ext href="https://www.servicetitan.com/blog/webinar-recap-ai-virtual-agents-call-booking">
          the only virtual agents that integrate with adaptive capacity directly
          inside of ServiceTitan
        </Ext>
        , and lets you restrict which job types the agent may book down to the
        business unit, with a custom dispatch fee and its wording set per job
        type. Whether or not you buy theirs, that list is the specification to
        hold every other vendor against.
      </P>
      <Callout>
        The question that separates a demo from a purchase: &quot;show me what
        the agent says when my board is full and the caller has no heat.&quot;
        Everything else in a home services demo is decoration.
      </Callout>

      <H2 id="shortlist">The five, one at a time</H2>

      <H3>1. The AI already inside your field service software</H3>
      <P>
        <Strong>ServiceTitan AI Virtual Agents.</Strong> Announced April 2026.
        Books and reschedules against live capacity, recognises members, states
        your dispatch fee, classifies its own calls so booked ones tie back to
        jobs, and escalates to a human team member, a cellphone, or a third-party
        answering service. It works regardless of your phone system - Contact
        Center Pro, Phones Pro or a third party. On commercials, ServiceTitan
        states businesses do not need a commitment to start and pay a per-call
        usage fee, which is unusually buyer-friendly for a platform feature.
      </P>
      <P>
        <Strong>Jobber AI Receptionist.</Strong> Launched 18 August 2025. Answers
        calls and texts, captures job requests and books visits during the call,
        and feeds leads into your existing workflow. Commercially it is the
        friendliest arrangement on this page: an add-on to any plan, included at
        no additional cost on the Plus plan, with no per-minute fees. For a small
        shop already on Jobber Plus, the correct next step is to switch it on
        this week and shortlist nothing.
      </P>
      <P>
        <Strong>Housecall Pro.</Strong> Pairs CSR AI across chat and calls with
        HCP Assist, its own human answering service, so the escalation path stays
        inside one vendor. That hybrid is a genuinely good shape for the trades,
        where the calls an AI should not take are the ones that matter most.
      </P>
      <P>
        <Strong>The critical read:</Strong> native is not automatically better,
        and version one of anything is version one. Test it against the same
        seven calls below before you conclude it is enough. The specific things
        to check are the ones a platform tends to ship late - how fast it
        escalates, whether it handles two simultaneous calls, what it does with a
        caller who will not speak to a machine, and how the transcript reaches
        whoever needs it at 6 a.m. Also read the meter: a per-call fee is
        excellent at a hundred calls a month and worth modelling at a thousand.
      </P>

      <H3>2. Avoca - the deepest third party, if you are big enough</H3>
      <P>
        Avoca describes itself as{" "}
        <Ext href="https://www.avoca.ai/">
          the AI Front Office for Service Businesses
        </Ext>
        , and the scope is genuinely wider than answering. Three modules: Book
        (an AI CSR for 24/7 job booking, a self-service scheduler, web chat), Win
        Back (speed-to-lead, outbound campaigns, Google LSA), and Coach
        (real-time scoring and analytics for your human CSRs). It is listed as a
        ServiceTitan Certified App with deep CRM integration, and its footer
        carries Housecall Pro and FieldRoutes badges.
      </P>
      <P>
        The Coach module is the part most worth attention and the part nobody
        shortlists for. Plenty of contractors do not have an answering problem -
        they have a booking-rate problem on calls their own CSRs already take.
        Buying a product that scores those calls and coaches on them is a
        different, often larger, lever than answering the overflow.
      </P>
      <P>
        <Strong>The critical read:</Strong> no published price, a demo-led
        motion, and a product surface aimed at shops with a real CSR team to
        coach. A two-truck operation buying Avoca is buying three modules to use
        one. And now that ServiceTitan ships its own agent, ask Avoca directly
        what its booking does that the native one does not - it is a fair
        question and they will have a real answer.
      </P>

      <H3>3. Sameday AI - the one that publishes a number</H3>
      <P>
        Sameday is an AI phone agent aimed squarely at converting inbound calls
        into booked jobs for contractors, and it is the only dedicated
        home-services vendor here that will tell you the price without a meeting:{" "}
        <Ext href="https://sameday.ai/pricing">
          Launch starting at $449 per month
        </Ext>{" "}
        with 500 minutes, three locations and unlimited users; Scale at $789 with
        1,000 minutes, unlimited locations and voice cloning; Enterprise quoted,
        adding multilingual voices, advanced analytics and API access. Pro
        scheduling with ServiceTitan is listed on both paid tiers, and the page
        promises zero surprise fees.
      </P>
      <P>
        <Strong>The critical read:</Strong> price the minutes, not the plan. 500
        minutes is roughly 165 three-minute calls a month - fine for after-hours
        cover at a small shop, thin as a primary line for anyone busy. Work out
        your real monthly call minutes first, then look at which tier that lands
        in, because the jump from $449 to $789 arrives sooner than most people
        expect. And as with Avoca, the ServiceTitan question is now fair game:
        what does this do that the native agent does not?
      </P>

      <H3>4. Rosie or Goodcall - for one to five trucks</H3>
      <P>
        Below the field-service tier sits a set of general small-business AI
        receptionists that trades buy constantly, and two of them are worth
        naming because they publish clear, honest pricing.
      </P>
      <P>
        <Strong>Rosie</Strong> runs{" "}
        <Ext href="https://www.heyrosie.com/pricing">
          $49 a month for 250 minutes
        </Ext>
        , $149 for 1,000 with direct calendar booking, warm and live transfers,
        and $299 for 2,000 with unlimited message scenarios and custom agent
        training. A website texting add-on is $50 a month for 25 conversations
        and $1 each after. Integrations are Zapier-led rather than native.
      </P>
      <P>
        <Strong>Goodcall</Strong> takes an unusual and rather clever meter:{" "}
        <Ext href="https://www.goodcall.com/pricing">
          $79, $129 or $249 per agent per month
        </Ext>{" "}
        (roughly 15% less annually) with unlimited minutes and tokens, billed
        instead on unique customers - 100, 250 or 500 a month, then $0.50 per
        additional caller. For a trade whose callers rarely ring twice, that is
        worth modelling; for one with a repeat maintenance base, it is a
        genuinely cheap meter.
      </P>
      <P>
        <Strong>The critical read:</Strong> neither writes into a field service
        platform. They book onto a calendar and hand you a lead, which for a
        one-to-five-truck shop where the owner is also the dispatcher is often
        exactly right - the job was going to be scheduled by a person regardless.
        Above about five trucks, the missing FSM write-back starts costing a
        dispatcher real hours.
      </P>

      <H3>5. A general packaged AI receptionist - including ours</H3>
      <P>
        Last, honestly. A general AI receptionist answers with your greeting,
        knows your trades, service area, hours and call-out fee, triages
        emergencies against rules you write, escalates a genuine one to a real
        phone until somebody picks up, books onto a mainstream calendar and drops
        a transcript in your inbox. Flat monthly - ours is{" "}
        <Internal href="/pricing">€99 or €299 a month</Internal> - live the same
        day, month to month.
      </P>
      <P>
        Where this wins is the shape of problem most small contractors actually
        have: the phone is fine from eight to five because someone is in the
        office, and everything from six in the evening to seven the next morning
        goes to voicemail, which is where a meaningful share of the year&apos;s
        emergency work is decided. Buying a $449 field-service product to cover
        thirteen hours a day is a different trade from buying a €99 one.
      </P>
      <P>
        <Strong>The critical read, on ourselves:</Strong> if you need a job to
        appear on the dispatch board against real capacity, we cannot do that,
        and no general product can regardless of what its home page says about
        HVAC. Buy the native one or Avoca. We are also the wrong answer if your
        volume needs more than three simultaneous calls, or if you want CSR
        coaching, outbound win-back campaigns, or speed-to-lead on Angi and
        Thumbtack.
      </P>

      <H2 id="pricing">What each one actually costs</H2>
      <Table
        caption="Published pricing as of August 2026 - confirm before buying"
        head={["Option", "What the vendor publishes", "The meter"]}
        rows={[
          [
            "ServiceTitan AI Virtual Agents",
            "No rate card; states no commitment required and a per-call usage fee",
            "Per call - scales with exactly the volume you want handled",
          ],
          [
            "Jobber AI Receptionist",
            "Add-on to any plan; included at no additional cost on Plus; no per-minute fees",
            "Bundled into the plan",
          ],
          [
            "Avoca",
            "Nothing. Book a demo.",
            "Quoted - expect an annual term aimed at established shops",
          ],
          [
            "Sameday AI",
            "Launch from $449/mo (500 min, 3 locations); Scale from $789/mo (1,000 min, unlimited locations)",
            "Monthly, banded by minutes",
          ],
          [
            "Rosie",
            "$49 / $149 / $299 per month for 250 / 1,000 / 2,000 minutes; texting add-on $50",
            "Monthly, banded by minutes",
          ],
          [
            "Goodcall",
            "$79 / $129 / $249 per agent per month, ~15% off annually; unlimited minutes",
            "Unique callers - 100 / 250 / 500, then $0.50 each",
          ],
          [
            "General packaged AI receptionist",
            "Ours is €99 (1,000 min) or €299 (3,000 min), €0.09 per extra minute",
            "Flat monthly with included minutes",
          ],
        ]}
      />
      <P>
        Four different meters on one page - per call, bundled, per minute, per
        unique caller - which means the cheapest headline tells you nothing until
        you convert everything to your own annual total. Pull last month&apos;s
        call log, count the calls and the minutes, and price all four. Then
        compare that number to what the missed ones cost you, which for trades
        with an average job value in the hundreds is usually the shorter
        calculation -{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the method is here
        </Internal>
        .
      </P>

      <H2 id="safety">The calls an AI must hand over immediately</H2>
      <P>
        Trades carry a category of call that no voice agent should ever attempt
        to handle, and the rule needs writing down before you configure anything,
        not after an incident.
      </P>
      <UL>
        <LI>
          <Strong>A smell of gas.</Strong> The agent does not troubleshoot, does
          not book, does not ask diagnostic questions. It tells the caller to
          leave the property and call the gas emergency line or 911 from outside,
          then escalates to a human. There is no version of this that is a
          booking.
        </LI>
        <LI>
          <Strong>A carbon monoxide alarm.</Strong> Same handling. Out of the
          building first, emergency services, then you.
        </LI>
        <LI>
          <Strong>Smoke, burning smell, or anything electrical arcing.</Strong>{" "}
          Same again.
        </LI>
        <LI>
          <Strong>Water actively flooding.</Strong> Shut-off guidance is
          reasonable and useful; a Thursday appointment is not.
        </LI>
        <LI>
          <Strong>A vulnerable person with no heat or no cooling.</Strong> Not an
          emergency service call, but not a routine booking either. Elderly, an
          infant, a medical dependency - these should route to a human who can
          make a judgement about tonight.
        </LI>
      </UL>
      <P>
        Everything else is triage, and triage is where a well-configured agent
        genuinely outperforms voicemail: severity, whether the system is fully
        down or intermittent, whether anyone is home, whether it is under
        warranty or a membership. How to wire the escalation so somebody actually
        wakes up is a whole subject on its own -{" "}
        <Internal href="/blog/how-to-set-up-emergency-call-escalation">
          we wrote it up separately
        </Internal>
        .
      </P>

      <H2 id="test">Seven calls that sort the field</H2>
      <OL>
        <LI>
          <Strong>&quot;I smell gas.&quot;</Strong> The first call, every time.
          Anything other than leave-and-call-the-utility ends the evaluation.
        </LI>
        <LI>
          <Strong>&quot;No heat, it&apos;s 20 degrees, my mother is 84.&quot;</Strong>{" "}
          Does it hear the second half of that sentence?
        </LI>
        <LI>
          <Strong>Book a job on a day you know is full.</Strong> The whole
          capacity question, in one call.
        </LI>
        <LI>
          <Strong>&quot;How much to replace a water heater?&quot;</Strong> A
          confident number is a liability. The right answer explains why it needs
          a visit and offers one.
        </LI>
        <LI>
          <Strong>Ask if you are in the service area, from just outside
          it.</Strong> Cheap to test, and revealing - a lot of agents will
          happily book a job forty minutes past where you go.
        </LI>
        <LI>
          <Strong>Ask for a human at 11 p.m.</Strong> Time it, and check where it
          lands if nobody answers. Then check it again after two rings.
        </LI>
        <LI>
          <Strong>Then go and look at the board.</Strong> Did the job appear,
          with the right type, the right duration and the right business unit?
          Everything before this is theatre.
        </LI>
      </OL>
      <P>
        The same protocol in general form, with the reasoning behind each step,
        is in{" "}
        <Internal href="/blog/ai-voice-agent-vs-chatbot-vs-ivr">
          AI voice agent vs chatbot vs IVR
        </Internal>
        . We run comparable rankings for two other trades where the systems of
        record differ completely -{" "}
        <Internal href="/blog/best-ai-receptionist-for-dental-practices">
          dental practices
        </Internal>{" "}
        and{" "}
        <Internal href="/blog/best-ai-phone-answering-for-restaurants">
          restaurants
        </Internal>
        .
      </P>

      <H2 id="not-for-you">When none of these is the answer</H2>
      <UL>
        <LI>
          <Strong>Your FSM already covers it and you have not tried.</Strong>{" "}
          Genuinely the most common mistake this month. Switch it on, run the
          seven calls, and only then shop.
        </LI>
        <LI>
          <Strong>Your leads come from Angi and Thumbtack, not your
          number.</Strong> Inbound answering cannot fix a lead source that never
          rings you. Fix speed-to-lead first.
        </LI>
        <LI>
          <Strong>You are one van and the phone is in your pocket.</Strong> An
          automatic text to every missed call recovers most of what you are
          losing for near-nothing -{" "}
          <Internal href="/blog/missed-call-text-back">
            the case for it is here
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Nobody owns the knowledge base.</Strong> Prices change, the
          service area expands, you drop a trade. Half an hour a month,
          permanently, or the agent becomes a confident source of last
          year&apos;s prices.
        </LI>
        <LI>
          <Strong>Your problem is daytime and structural.</Strong> If two CSRs
          cannot keep up at 10 a.m. in July, an AI answering the overflow will
          book badly at volume. Hire for the peak, automate the edges.
        </LI>
      </UL>
      <P>
        If the honest answer is the narrow one - the phone answered properly from
        six in the evening until seven in the morning, emergencies escalated,
        everything else waiting on your desk - that is the problem we built for,
        and the trade-specific versions are in our guides for{" "}
        <Internal href="/blog/hvac-answering-service">HVAC</Internal>,{" "}
        <Internal href="/blog/plumbing-answering-service">plumbing</Internal> and{" "}
        <Internal href="/blog/contractor-answering-service">
          general contracting
        </Internal>
        .
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
