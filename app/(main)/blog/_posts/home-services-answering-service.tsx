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
  slug: "home-services-answering-service",
  title: "Home Services Answering Service: A Trade-by-Trade Guide",
  description:
    "What a home services answering service has to get right for HVAC, plumbing, roofing, electrical, pest control, cleaning, restoration and locksmith calls.",
  date: "2026-10-04",
  updated: "2026-10-04",
  readingTime: "29 min read",
  tag: "Industries",
  hero: "/blog/home-services-answering-hero.webp",
  heroAlt:
    "An electrician in a black cap and orange work vest fitting an exterior outlet box to the wooden wall of a house with a cordless drill, both gloved hands on the job",
  heroWidth: 1600,
  heroHeight: 900,
  heroCredit: "Photo by Jimmy Nilsson Masth on Unsplash",
  heroCreditUrl: "https://unsplash.com/photos/UovTD1dG-lA",
  keywords: [
    "home services answering service",
    "home service answering services",
    "answering service for home services",
    "hvac answering service",
    "plumbing answering service",
    "roofing answering service",
    "electrician answering service",
    "pest control answering service",
    "cleaning company answering service",
    "water damage restoration answering service",
    "locksmith answering service",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "four-calls", title: "Every call is one of four things" },
    { id: "dispatch", title: "Dispatch is the product" },
    { id: "models", title: "Live vs AI vs hybrid" },
    { id: "cost", title: "How the bill is built" },
    { id: "setup", title: "Setup, once, for any trade" },
    { id: "hvac", title: "HVAC" },
    { id: "plumbing", title: "Plumbing" },
    { id: "roofing", title: "Roofing" },
    { id: "electrical", title: "Electrical" },
    { id: "pest-control", title: "Pest control" },
    { id: "cleaning", title: "Cleaning companies" },
    { id: "water-damage", title: "Water damage restoration" },
    { id: "locksmith", title: "Locksmiths" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a home services answering service?",
      a: "It answers a trade business's phone when nobody in the business can - on a job, after hours, or when three calls arrive at once. A useful one does more than take messages: it sorts life-safety calls from emergencies and from bookable work using rules you wrote, pages your on-call person for the urgent ones, books routine jobs into your real calendar, and sends you a summary of every call. It can be staffed by live operators, an AI receptionist, or a hybrid where AI answers first and hands off to a person.",
    },
    {
      q: "Should an answering service handle a gas smell, a carbon monoxide alarm or an electrical fire?",
      a: "Only to get the caller out of danger. A gas smell, a carbon monoxide alarm, smoke, flames or a worsening burning smell is never a service call: the script tells the caller to leave and call the gas company or 911 from outside - or, for an electrical fire, to call 911 and switch off the main breaker only if it is safely reachable - and then escalates to a human. The same applies to a locksmith call about a child or pet locked in a car. Ask any vendor to show you these rules configured word for word, and test them yourself before going live.",
    },
    {
      q: "Can an answering service tell a real emergency from a routine call?",
      a: "Yes, if you give it the rules - it does not guess, it applies your definitions identically at 2 p.m. and 2 a.m. A burst pipe, sewage backup, active roof leak or hot outlet pages the on-call person now; a dripping faucet, a ceiling stain that only shows in heavy rain or a dead outlet books for the next open slot. Ambiguous calls should be set to fail toward escalation, because a false alarm costs minutes and the opposite mistake costs a flooded house.",
    },
    {
      q: "Can it book jobs straight into ServiceTitan, Jobber or Housecall Pro?",
      a: "Some products can and ours cannot, so check before you buy. ServiceTitan, Jobber and Housecall Pro now ship their own AI answering, which books against live capacity with no integration to build. Our AI receptionist books into Google Calendar, Microsoft 365 or Outlook, and Cal.com with two-way sync, emails a summary and transcript after every call, and can post each call to a signed HTTPS webhook - but it does not write into ServiceTitan, Jobber or Housecall Pro. If field-service write-back is the point, start with the one built into your software.",
    },
    {
      q: "Can an answering service handle the call surge after a hailstorm or a freeze?",
      a: "This is where the models differ most. A live operator bureau puts surge callers in a hold queue, and per-minute billing climbs with the surge. An AI answering service takes simultaneous calls in parallel, so the fortieth caller the day after a storm gets the same instant answer as the first. If weather drives your business, ask any vendor how many of your calls it can answer at the same time and what your bill looks like in the week after a storm.",
    },
    {
      q: "Should an answering service quote prices on the phone?",
      a: "Only the numbers you have already published, and only as the range they really are. A trip charge, an inspection fee, a starting price for a standard home and a recurring rate are safe because you wrote them down. A termite treatment, a deep clean, a mitigation job or a commercial contract priced before anyone has seen the property is a guess that becomes an argument at the door. For locksmiths the rule is stricter: quote the all-in price, because consumer agencies tell callers to refuse the work if the door price does not match the phone price.",
    },
    {
      q: "Should insurance questions go to an answering service?",
      a: "No. Whether a roof claim is worth filing, what a policy covers, or what caused a water loss are decided by carriers, adjusters and people on site. The right script captures the carrier, the claim number if one exists and whether the caller has filed, books the inspection or dispatches the crew, and says plainly that a person will walk them through the claim. A coverage promise made on your line at 2 a.m. becomes a deductible argument on invoice day.",
    },
    {
      q: "Do all home service businesses need 24/7 answering?",
      a: "Not in the same way. Plumbing, restoration and locksmith calls arrive at night and do not wait, so round-the-clock answering pays directly. Roofing callers find leaks during weekend storms and call in the evening. Cleaning companies mostly need two windows covered: early morning, when crews call off, and evening, when working prospects call. Most pest control after-hours calls are bookings rather than emergencies. Most shops start by forwarding after-hours and overflow calls only, which touches nothing but calls that were going to voicemail.",
    },
    {
      q: "How should an answering service handle alarm codes and gate codes?",
      a: "It should not take them by voice at all if you can avoid it. Every automated line records and transcribes, so a spoken alarm code becomes stored text in at least one system. The script should note that a code exists and who to contact, and the code itself should be collected through whatever secure channel you already use for client records. Ask any vendor where recordings and transcripts are stored, for how long, and whether a field can be kept out of the transcript.",
    },
    {
      q: "Will customers hang up on an AI?",
      a: "Some will - far fewer than hang up on voicemail, which is the real alternative at 2 a.m. or mid-job. A homeowner standing in water mostly wants an instant answer and confidence that help is moving. A good AI says what it is up front, answers on the first ring, and ends the call with a technician paged or a job booked, and it hands over to a person immediately when asked. Judge it on transcripts of your own calls during a trial, not on the demo.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "Harvard Business Review: The Short Life of Online Sales Leads (lead response-time research)",
    url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  },
  {
    title:
      "FTC .com Disclosures: how to make effective disclosures in digital advertising",
    url: "https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising",
  },
  {
    title:
      "CDC: Carbon Monoxide - what it is, prevention, and annual furnace servicing",
    url: "https://www.cdc.gov/carbon-monoxide/about/index.html",
  },
  {
    title: "EPA: Section 608 Technician Certification for handling refrigerants",
    url: "https://www.epa.gov/section608",
  },
  {
    title:
      "EPA WaterSense: Fix a Leak Week - household leaks waste nearly 1 trillion gallons of water annually",
    url: "https://www.epa.gov/watersense/fix-leak-week",
  },
  {
    title:
      "Insurance Information Institute: Facts + Statistics on homeowners and renters insurance claims (water damage and freezing; wind and hail)",
    url: "https://www.iii.org/fact-statistic/facts-statistics-homeowners-and-renters-insurance",
  },
  {
    title:
      "U.S. Bureau of Labor Statistics: Electricians, Occupational Outlook Handbook (job growth and annual openings)",
    url: "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm",
  },
  {
    title:
      "US EPA, Introduction to Pesticide Labels: label directions are legally enforceable",
    url: "https://www.epa.gov/pesticide-labels/introduction-pesticide-labels",
  },
  {
    title:
      "US EPA, Certification Standards for Pesticide Applicators: state-administered certification for restricted use pesticides",
    url: "https://www.epa.gov/pesticide-worker-safety/certification-standards-pesticide-applicators",
  },
  {
    title:
      "US Bureau of Labor Statistics, Occupational Outlook Handbook: Janitors and Building Cleaners",
    url: "https://www.bls.gov/ooh/building-and-grounds-cleaning/janitors-and-building-cleaners.htm",
  },
  {
    title:
      "US OSHA, Hazard Communication: safety data sheets must be available for the chemicals workers use",
    url: "https://www.osha.gov/hazcom",
  },
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
      "US Federal Trade Commission: consumer guidance on finding a locksmith and avoiding phone-quote bait-and-switch",
    url: "https://consumer.ftc.gov/articles/0089-finding-locksmith",
  },
  {
    title:
      "US Federal Trade Commission press release: caution when seeking a locksmith",
    url: "https://www.ftc.gov/news-events/news/press-releases/2008/05/ftc-urges-consumers-use-caution-when-seeking-locksmith",
  },
  {
    title:
      "Connecticut Department of Consumer Protection: locksmith scams - verify the storefront, the vehicle and the quote before work begins",
    url: "https://portal.ct.gov/dcp/knowledge-base/articles/scam-zone/locksmith-scams",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every home services trade loses work the same way: the phone rings
        while both your hands are in a panel, a cabinet or a lock, and the
        caller dials the next number before your voicemail greeting ends. What
        differs is everything after the first ring. A plumber needs the caller
        at the shutoff valve, an electrician needs a safety check before any
        booking, a roofer needs to survive a storm week, and a locksmith needs
        to quote a price that holds at the door. We build AI receptionists, so
        read this skeptically. The first half covers what every trade call
        needs. The second half goes trade by trade, covering only what is
        actually different.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Every call is one of four things: <Strong>life-safety, emergency,
            bookable, or human-only</Strong>. Write those rules before you
            choose a vendor, and set ambiguous calls to fail toward a person.
          </>,
          <>
            <Strong>Dispatch is the product.</Strong> An intake that lands in
            an inbox at 2 a.m. is theatre. Page, require an acknowledgement,
            escalate on a timer.
          </>,
          <>
            <Strong>Cause, coverage and unpublished prices stay off the
            phone</Strong> in every trade. They get decided on site, by the
            carrier, or by you.
          </>,
          <>
            The trades differ where it matters: <Strong>storm surges</Strong>{" "}
            in roofing, <Strong>safety forks</Strong> in electrical,{" "}
            <Strong>re-entry questions</Strong> in pest control,{" "}
            <Strong>alarm codes</Strong> in cleaning, the{" "}
            <Strong>drying clock</Strong> in restoration, and{" "}
            <Strong>authority to enter</Strong> for locksmiths.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>home services answering service</Strong> answers your
        business line when nobody in the business can. It runs a safety check,
        sorts the emergency from the routine job using your rules, captures what
        a technician needs to arrive prepared, pages your on-call person or books
        the job into your real calendar, and sends you a summary you can act on.
        It can be live operators, an AI receptionist, or a hybrid where AI
        answers first and hands the hard calls to a person.
      </P>
      <P>
        Its real competition isn&apos;t a great in-house dispatcher. It&apos;s
        voicemail, which is what your phone is during jobs, evenings and the
        week after a storm. In the{" "}
        <Ext href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads">
          Harvard Business Review research on lead response time
        </Ext>
        , the odds of reaching a lead collapsed within the first hour. For a
        homeowner with water coming through the ceiling or a family locked out
        in the rain, the window is one voicemail greeting long. If you want to
        put your own numbers on that, see{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the cost of a missed call
        </Internal>{" "}
        or run the{" "}
        <Internal href="/missed-call-calculator">missed call calculator</Internal>{" "}
        with your own average job value.
      </P>
      <P>
        Two related guides cover ground this one skips. If you are choosing
        between AI products (including the ones now built into ServiceTitan,
        Jobber and Housecall Pro), read our{" "}
        <Internal href="/blog/best-ai-receptionist-for-home-services">
          ranking of AI receptionists for home services
        </Internal>
        . If you run a general contracting or remodeling business where the
        calls are bids rather than service calls, the{" "}
        <Internal href="/blog/contractor-answering-service">
          contractor answering service guide
        </Internal>{" "}
        fits better.
      </P>

      <H2 id="four-calls">Every call is one of four things</H2>
      <P>
        Trades differ in their details, but every inbound call fits one of four
        buckets. The quality of any answering service, human or AI, comes down
        to whether it sorts calls into these buckets the way you would.
      </P>
      <Table
        caption="The four call types, in every trade"
        head={["Type", "Examples", "What the service does"]}
        rows={[
          [
            "Life-safety",
            "Gas smell, carbon monoxide alarm, smoke or burning smell, a child locked in a car, injury, water near live electrics",
            "One fixed instruction - get out, call 911 or the utility - then escalate to a human. Never a booking, never troubleshooting",
          ],
          [
            "Emergency",
            "Burst pipe, sewage backup, active roof leak, hot outlet, lockout, water loss in progress",
            "Capture the essentials, give any genuinely useful first step (the shutoff, the breaker), page the on-call person now",
          ],
          [
            "Bookable",
            "Tune-ups, dripping faucets, inspections, rekeys, recurring cleans, estimates",
            "Offer real slots from your calendar, book during the call, text a confirmation",
          ],
          [
            "Human-only",
            "Price haggling, insurance and coverage, cause and liability, disputes, a frightened or furious caller",
            "Capture the facts, say a person will call back by a stated time, route by rule",
          ],
        ]}
      />
      <P>Five design rules carry across every trade below:</P>
      <OL>
        <LI>
          <Strong>Fail toward escalation.</Strong> When a call could be routine
          or an emergency, page a person. A false alarm costs minutes. The
          opposite mistake costs a flooded living room and a review saying you
          never came.
        </LI>
        <LI>
          <Strong>End every bookable call on a date.</Strong> &quot;We&apos;ll
          call you back&quot; loses a caller who has three more numbers on the
          screen. &quot;Thursday at nine&quot; keeps them.
        </LI>
        <LI>
          <Strong>Quote only what you have published.</Strong> A trip charge,
          an inspection fee or a starting price is safe because you wrote it
          down. A number made up for a property nobody has seen becomes an
          argument at the door.
        </LI>
        <LI>
          <Strong>Never speculate on cause, coverage or health.</Strong>{" "}
          &quot;Your insurance will cover this&quot; and &quot;that mold
          won&apos;t hurt you&quot; are sentences that cost money later, in
          every trade.
        </LI>
        <LI>
          <Strong>Disclose the AI.</Strong> A short &quot;this is the AI
          assistant&quot; up front is the honest default, in line with the
          spirit of the{" "}
          <Ext href="https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising">
            FTC&apos;s guidance on clear disclosure
          </Ext>
          . Your name is on the truck, so don&apos;t spend your reputation
          hiding a robot.
        </LI>
      </OL>

      <H2 id="dispatch">Dispatch is the product</H2>
      <P>
        A perfect intake dropped into an email inbox at 2 a.m. has been
        successfully sent to somebody asleep. Write down the dispatch chain
        behind the service, because it&apos;s the part most services get
        wrong:
      </P>
      <UL>
        <LI>
          <Strong>Page, don&apos;t email.</Strong> A call to the on-call phone
          that keeps ringing beats a notification.
        </LI>
        <LI>
          <Strong>Require an acknowledgement.</Strong> A human confirming they
          have it, not just a delivered message.
        </LI>
        <LI>
          <Strong>Escalate on a timer.</Strong> Primary on-call, a defined
          wait, the second name, then the manager or owner, with the minutes
          written in. Ask every vendor to show you the path where nobody
          acknowledges, not the path where everything works. We cover how to
          build the ladder in the{" "}
          <Internal href="/blog/24-hour-answering-service">
            24-hour answering service guide
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Tell the caller the truth.</Strong> &quot;I&apos;ve paged our
          on-call tech and they&apos;ll call you within fifteen minutes&quot;
          is a promise you control. &quot;Someone will be right out&quot; is
          one you don&apos;t.
        </LI>
        <LI>
          <Strong>Filter so the page stays credible.</Strong> A service that
          wakes your tech for a mid-project question or a sales call trains
          your crew to ignore pages, and an ignored page is how the real one
          gets missed.
        </LI>
      </UL>
      <P>
        The page itself should carry a one-line summary dispatch can act on
        without calling anyone back:{" "}
        <em>
          &quot;Burst pipe, 14 Oak St, water off at main, paged on-call -
          urgent&quot;
        </em>{" "}
        or <em>&quot;Fall tune-up, plan member, booked Thu AM.&quot;</em> That
        summary is the actual deliverable. Everything before it is plumbing.
      </P>

      <H2 id="models">Live agents vs AI vs hybrid</H2>
      <P>
        There are four realistic ways to cover a trade phone. The right one
        depends on your call mix and on your worst week, not your average one.
      </P>
      <Table
        caption="Answering models for home services businesses"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Live operator bureau",
            "Steady, predictable volume; owners who want a human voice on every distressed call",
            "Per-minute bills and hold queues peak in exactly the storm or freeze you needed it for; generic operators who can't tell a burst pipe from a drip, or improvise on a safety call",
          ],
          [
            "AI receptionist",
            "After-hours and mid-job leakage, surge weeks, routine booking, small shops with nobody at a desk",
            "Triage rules, safety branches and the escalation chain must be configured explicitly and tested; anything ambiguous must fail toward a person",
          ],
          [
            "Hybrid (AI first, human backup)",
            "Most growing shops: AI answers every call and books the routine majority, humans take danger, judgment and upset callers",
            "You must define exactly what triggers a handoff and who gets it",
          ],
          [
            "Owner's cell phone on rotation",
            "Owner-operators with a handful of after-hours calls a month",
            "It works until the night you sleep through it, and it fails silently - nobody reports the call they never knew about",
          ],
        ]}
      />
      <P>
        For most residential trades the hybrid shape wins. The deciding
        question for weather-driven trades is concurrency: how many of your
        calls can the service answer at the same time? We explain how{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
          parallel answering
        </Internal>{" "}
        works separately, along with{" "}
        <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
          how handoffs to a human work
        </Internal>
        . For a broader comparison, see{" "}
        <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
          AI receptionist vs virtual receptionist vs answering service
        </Internal>
        .
      </P>

      <H2 id="cost">How the bill is built</H2>
      <P>
        Live bureaus usually bill per minute or per call. AI services usually
        charge a flat monthly fee. That difference matters more in the trades
        than anywhere else, because trade volume isn&apos;t smooth. A heat
        wave, a hard freeze or a hailstorm can multiply your calls in a single
        afternoon. Under per-minute pricing your bill climbs in exactly the
        weeks the service has to earn its keep. Under flat pricing it
        doesn&apos;t. For market-wide figures from both models, see our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost guide
        </Internal>
        . Our own plans are on the <Internal href="/pricing">pricing page</Internal>{" "}
        and run month-to-month, so one busy season is a fair trial.
      </P>
      <P>
        Either way, the monthly fee is the wrong number to stare at. Compare
        it to one job in your trade: an emergency repair, a roof, a mitigation
        job, a recurring cleaning client. Then decide on intake quality and
        dispatch reliability, not price.
      </P>

      <H2 id="setup">Setup, once, for any trade</H2>
      <OL>
        <LI>
          <Strong>Forward after-hours and overflow first.</Strong> Forward on
          no-answer and outside office hours, and keep answering yourself when
          your hands are free. Those calls were going to voicemail, so the
          change is pure upside, and you judge the service on real calls
          before it fronts your main line. Your number doesn&apos;t change.{" "}
          <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
            Forwarding takes about eight minutes
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Write the four-bucket rules on one page.</Strong> What is
          life-safety, what pages someone tonight, what books for morning,
          what is human-only. Use the trade tables below as templates. Then add
          your published prices and the exact wording of any fixed answers.
        </LI>
        <LI>
          <Strong>Connect the calendar you actually dispatch from.</Strong> Be
          clear about what that means. Our AI receptionist books into Google
          Calendar, Microsoft 365 or Outlook, and Cal.com with two-way sync. It
          emails a summary and transcript after every call and can post each
          call to a signed HTTPS webhook. It does{" "}
          <Strong>not</Strong> write into ServiceTitan, Jobber, Housecall Pro,
          JobNimbus or AccuLynx. If you run one of those, either dispatch from
          the synced calendar plus the summary, or look first at the AI agent
          built into your field-service software (our{" "}
          <Internal href="/blog/best-ai-receptionist-for-home-services">
            home services ranking
          </Internal>{" "}
          covers those honestly).
        </LI>
        <LI>
          <Strong>Test the dangerous calls out loud.</Strong> Call your own
          number and say &quot;I smell gas,&quot; &quot;my outlet is
          smoking,&quot; &quot;my kid is locked in the car,&quot; and
          &quot;is this covered by my insurance?&quot; Then book a fake routine
          job and confirm it lands where dispatch will see it.
        </LI>
        <LI>
          <Strong>Read two weeks of transcripts.</Strong> You&apos;ll find the
          two questions the script fumbles and the answer you give without
          thinking that was never written down. Treat the service like a new
          dispatcher in training, not a set-and-forget box. If you&apos;d rather
          start from a template,{" "}
          <Internal href="/blog/ai-receptionist-prompts">
            our AI receptionist prompts
          </Internal>{" "}
          include after-hours and triage modules.
        </LI>
      </OL>
      <Callout>
        The sizing test is the same in every trade. For one week, count the
        calls that rang out while you were working. Count the mid-morning ones,
        not just the after-hours ones. That number, and the callers who never
        left a message, is what you&apos;re hiring an answering service to fix.
      </Callout>

      {/* ---------------- Trade sections ---------------- */}

      <H2 id="hvac">HVAC answering service: heat waves, cold snaps and the gas call</H2>
      <P>
        HVAC demand is extremely seasonal and comes in bursts. The first heat
        wave or the first hard freeze can bury a small office in a single
        afternoon, and systems fail at night and on weekends. A homeowner
        sweating through a 95-degree evening, or watching the thermostat read
        52 in January, calls three companies and goes with whoever answers.
        Most of the intake is repetitive: what&apos;s wrong, what system, what
        address, how soon. An answering service handles that well. Three HVAC
        details matter beyond the shared core.
      </P>
      <Table
        caption="A starting triage rule set for HVAC calls"
        head={["Caller says", "Classification", "What the service does"]}
        rows={[
          [
            "Smell of gas, carbon monoxide alarm, smoke",
            "Life-safety",
            "Leave the house now, call the gas company or 911 from outside, don't switch anything on or off; alert the on-call manager. Never booked",
          ],
          [
            "No heat or no cooling, and someone in the home is elderly, an infant, or medically vulnerable",
            "Emergency",
            "Page the on-call tech now - this is a judgment about tonight, made by a person",
          ],
          [
            "No heat or no cooling, nobody vulnerable",
            "Urgent",
            "Per your rules: page on-call or the first slot in the morning; capture system type and symptoms",
          ],
          [
            "Tune-up, maintenance-plan visit, filter or thermostat question",
            "Bookable",
            "Confirm whether they are a plan member, offer real slots, text the arrival window",
          ],
          [
            "Replacement or new-system quote",
            "Sales",
            "Book the estimate visit; no price beyond your published ranges",
          ],
        ]}
      />
      <UL>
        <LI>
          <Strong>The life-safety rule is the most important line in the
          script.</Strong> A gas smell or a{" "}
          <Ext href="https://www.cdc.gov/carbon-monoxide/about/index.html">
            suspected carbon-monoxide leak
          </Ext>{" "}
          isn&apos;t a service call. The service&apos;s only job is to get
          people out and wake a human.
        </LI>
        <LI>
          <Strong>Ask the vulnerability question.</Strong> &quot;Is anyone in
          the home elderly, very young, or having trouble in the heat?&quot;
          turns a routine no-cooling call into a correctly prioritized one.
        </LI>
        <LI>
          <Strong>Recognize plan members.</Strong> A maintenance-plan customer
          or someone whose system you installed should be flagged, so dispatch
          can prioritize them and honor plan commitments.
        </LI>
        <LI>
          <Strong>Stay out of diagnosis.</Strong> The service books and
          triages. It doesn&apos;t diagnose a failing compressor or quote a fix
          over the phone, and refrigerant work legally requires an{" "}
          <Ext href="https://www.epa.gov/section608">
            EPA Section 608 certified technician
          </Ext>
          . Its job is getting the right tech to the door.
        </LI>
      </UL>
      <H3>The after-hours no-cooling call</H3>
      <Callout>
        &quot;Thanks for calling Summit Heating &amp; Air, this is the
        after-hours AI assistant and I can get help moving. Is your system
        blowing warm air or nothing at all? ... Got it, no cooling. Is anyone in
        the home elderly, very young, or having trouble in the heat? ... Okay -
        I&apos;m flagging this as urgent and paging the on-call tech now. Can I
        confirm the service address and a good callback number? ... You&apos;ll
        get a text confirmation, and a tech will call you back within the
        hour.&quot;
      </Callout>
      <H3>The call that must not be booked</H3>
      <Callout>
        &quot;You mentioned a smell of gas - please stop, leave the house now,
        and call your gas company or 911 from outside. Don&apos;t turn anything
        on or off. This isn&apos;t something to schedule a visit for; your
        safety comes first. I&apos;m alerting our on-call manager as
        well.&quot;
      </Callout>

      <H2 id="plumbing">Plumbing answering service: the shutoff valve comes first</H2>
      <P>
        Plumbing has a harsh structural problem. The job takes both your
        hands, and the busiest moments are when the phone rings most. A hard
        freeze doesn&apos;t burst one pipe in town, it bursts fifty, so the
        busier you get, the more calls you miss. Water heaters fail at night
        and sewage backs up on Sunday. Water damage is also one of the most
        common and expensive homeowner insurance claims, according to the{" "}
        <Ext href="https://www.iii.org/fact-statistic/facts-statistics-homeowners-and-renters-insurance">
          Insurance Information Institute&apos;s claims data
        </Ext>
        . That&apos;s why the caller is frantic, and why she books whoever
        answers.
      </P>
      <Figure
        src="/blog/home-services-plumber-sink.webp"
        alt="A plumber reaching under a sink to repair the drain trap and supply lines, both hands occupied inside the cabinet"
        width={1376}
        height={768}
        caption="The core problem in one image: when you're doing the work well, both hands are in the cabinet and the phone is ringing in the truck."
        credit="Photo by Timur Shakerzianov on Unsplash"
        creditUrl="https://unsplash.com/photos/c314Gh8dXAo"
      />
      <Table
        caption="A starting triage rule set for plumbing calls"
        head={["Caller says", "Classification", "What the service does"]}
        rows={[
          [
            "Burst pipe, water actively flowing or spreading",
            "Emergency",
            "Walk them to the main shutoff valve, then page the on-call plumber immediately",
          ],
          [
            "Sewage backing up into the home",
            "Emergency",
            "Page on-call now - health hazard, damage compounds by the hour",
          ],
          [
            "No water in the house",
            "Emergency (fast escalation)",
            "Page on-call; a household without water doesn't wait until morning",
          ],
          [
            "Water heater dead - no hot water",
            "Urgent, same-day",
            "Book the first slot today or tomorrow morning; flag if leaking",
          ],
          [
            "Dripping faucet, running toilet, slow drain",
            "Routine",
            "Book the next open slot; capture details so the tech arrives prepared",
          ],
          [
            "Quote request, remodel, fixture install",
            "Sales",
            "Qualify the job, book an estimate visit, tag it as a sales lead",
          ],
        ]}
      />
      <P>
        The question that changes everything is{" "}
        <em>
          &quot;Is the water still running, and do you know where your main
          shutoff is?&quot;
        </em>{" "}
        Walking a panicked caller to the shutoff valve is the most valuable
        thing anyone, human or AI, can do in the first sixty seconds. At the
        other end of the scale, the EPA&apos;s{" "}
        <Ext href="https://www.epa.gov/watersense/fix-leak-week">
          WaterSense program
        </Ext>{" "}
        estimates household leaks waste nearly a trillion gallons a year.
        Dripping-faucet calls are steady, bookable bread-and-butter work, just
        never 2 a.m. priority.
      </P>
      <Callout>
        &quot;Thanks for calling Reyes Plumbing - this is the after-hours AI
        assistant, and I can get help moving right now. Is water actively
        leaking or spreading? ... Okay. Do you know where your main shutoff
        valve is - usually near the water meter or where the line enters the
        house? Turn it clockwise until it stops. ... Good, that&apos;s the most
        important step. Can I confirm your address and callback number? ...
        I&apos;m paging our on-call plumber now with everything you told me.
        You&apos;ll get a text confirming, and he&apos;ll call you back within
        fifteen minutes.&quot;
      </Callout>
      <P>
        Two plumbing boundaries. <Strong>Price haggling</Strong> (&quot;the
        other guy said $250&quot;) is a negotiation that needs authority the
        service doesn&apos;t have. It should state the trip fee and honest
        ranges, then hand pricing to you. <Strong>Phone diagnostics</Strong>,
        like whether low pressure is a regulator, a slab leak or a municipal
        problem, are judgment calls for a plumber on site. For multi-tech
        shops, map the on-call rotation before signing and ask exactly how
        rotation changes get made without calling the vendor. When a burst
        supply line turns into wet drywall and soaked pads, it has become a
        mitigation job, covered in the{" "}
        <Internal href="#water-damage">restoration section</Internal> below.
      </P>

      <H2 id="roofing">Roofing answering service: surviving the storm week</H2>
      <P>
        Roofing has the most violent demand curve in the trades. For months the
        phone rings at a manageable pace. Then one hail or wind event damages
        hundreds of roofs in your service area on the same afternoon, while
        every crew is on a roof and you&apos;re meeting adjusters. Wind and
        hail are the most frequent cause of homeowners insurance claims in the
        United States, according to the{" "}
        <Ext href="https://www.iii.org/fact-statistic/facts-statistics-homeowners-and-renters-insurance">
          Insurance Information Institute
        </Ext>
        . The storm-week surge is not an edge case in this business. It is the
        business.
      </P>
      <P>
        Two things make roofing different. First,{" "}
        <Strong>surge capacity is the buying criterion</Strong>. Hold queues and
        per-minute billing break down in exactly that week, and the fortieth
        caller the day after the storm needs the same first-ring answer as the
        first. Second, <Strong>most calls aren&apos;t emergencies</Strong>.
        They&apos;re inspection requests, and the money is in booking them
        before the caller dials the next name.
      </P>
      <Table
        caption="A starting triage rule set for roofing calls"
        head={["Caller says", "Classification", "What the service does"]}
        rows={[
          [
            "Water actively coming in - ceiling bulging, dripping into rooms",
            "Emergency",
            "Don't stand under a bulging ceiling; move valuables, contain water; page the on-call lead for a same-day tarp",
          ],
          [
            "Tree or debris through the roof",
            "Emergency",
            "Confirm everyone is safe; page on-call now - exposure compounds with the next rain",
          ],
          [
            "Storm just hit - shingles in the yard, possible hail damage",
            "Hot lead, same-week",
            "Capture damage details and insurance intent; book the earliest inspection slot",
          ],
          [
            "Slow stain on ceiling, leak only when it rains hard",
            "Routine repair",
            "Book the next open inspection; capture where and when it shows",
          ],
          [
            "Roof is 20+ years old, wants a replacement quote",
            "Sales",
            "Qualify age, size, timeline and decision-maker; book the estimate",
          ],
          [
            "Deductible, claim process, adjuster questions",
            "Human-only",
            "Capture the carrier, book the inspection, flag for the owner to call back on the claim",
          ],
        ]}
      />
      <P>
        Ask the deciding question early:{" "}
        <em>&quot;Is water coming inside right now?&quot;</em> That one answer
        routes most roofing calls correctly. After a storm, your competition
        isn&apos;t just other phone numbers. It&apos;s canvassers on the street
        offering a free inspection on the spot. You can&apos;t out-knock a storm
        chaser, but you can out-answer one. A homeowner who gets an inspection
        booked in ninety seconds and a text confirmation from a local company
        has no reason to sign the clipboard. &quot;We&apos;ll call you back to
        schedule&quot; is an open door for the next knock.
      </P>
      <Callout>
        &quot;Thanks for calling Summit Roofing - this is the after-hours AI
        assistant. Are you seeing water inside the house right now? ... Okay, no
        active leak - that&apos;s good. Can I confirm the property address? ...
        Are you planning to go through insurance? ... No problem either way -
        the inspection is free and you&apos;ll get photos of anything we find. I
        have Thursday 10 to 12 or Friday afternoon - which works? ... Booked
        Thursday. You&apos;ll get a text confirmation now, and our estimator
        will call before arriving.&quot;
      </Callout>
      <P>
        That call captures the insurance question without answering it. What a
        policy covers, whether to file and how to talk to an adjuster are
        judgment calls with legal edges, and they stay with you. So does
        judging damage from a description (flashing, fastener back-out or
        condensation takes eyes on the roof) and any call from a homeowner with
        a crew on her roof right now. Before hail season, ask your vendor what
        happens at ten simultaneous calls, and read the first storm-week
        transcripts closely.
      </P>

      <H2 id="electrical">Electrician answering service: the safety fork comes before the sale</H2>
      <P>
        In most trades the worst answering failure is a lost lead. In
        electrical work it&apos;s a mishandled danger call. Nobody should take
        a call with their hands in a live panel, and the missed caller might be
        describing something genuinely dangerous. Volume is rising too. The{" "}
        <Ext href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm">
          Bureau of Labor Statistics
        </Ext>{" "}
        projects employment of electricians to grow much faster than average
        through 2034, with roughly 81,000 openings a year. More calls are
        arriving at the same number of licensed hands.
      </P>
      <P>
        Before any booking logic, the script needs three hard rules, in this
        order:
      </P>
      <OL>
        <LI>
          <Strong>Fire signs → 911, immediately.</Strong> Flames, smoke, or a
          burning smell that&apos;s getting worse: hang up and call 911, and
          shut off the main breaker only if it&apos;s safely reachable. The call
          does not continue into scheduling.
        </LI>
        <LI>
          <Strong>Danger signs → breaker off, on-call paged.</Strong> Hot or
          discolored outlets, buzzing from the panel, a faint electrical smell,
          or sparks when something was plugged in: kill the circuit at the
          breaker, don&apos;t touch the device, page the on-call electrician
          now.
        </LI>
        <LI>
          <Strong>Ambiguity → escalate.</Strong> If the risk can&apos;t be
          classified confidently, a human gets paged.
        </LI>
      </OL>
      <Table
        caption="A starting triage rule set for electrical calls"
        head={["Caller says", "Classification", "What the service does"]}
        rows={[
          [
            "Flames, smoke, burning smell getting worse",
            "911",
            "Hang up and call 911; main breaker off only if safely reachable. No booking",
          ],
          [
            "Hot/scorched outlet, buzzing panel, sparks",
            "Emergency",
            "Circuit off at the breaker, don't touch it; page on-call electrician now",
          ],
          [
            "Whole house dark - and the neighbors too",
            "Utility",
            "Give the utility's outage line; offer follow-up if problems persist after power returns",
          ],
          [
            "Whole house or half the house dark - neighbors fine",
            "Urgent",
            "Page on-call or book the first slot today; capture panel and breaker observations",
          ],
          [
            "One dead outlet or circuit, breaker keeps tripping",
            "Same-day / next-day",
            "Book promptly; capture what's on the circuit and what trips it",
          ],
          [
            "Panel upgrade, EV charger, fan or fixture install, remodel wiring",
            "Sales",
            "Qualify the job, book the estimate visit, tag as a new-work lead",
          ],
        ]}
      />
      <P>
        The utility fork pays for itself fastest:{" "}
        <em>&quot;Are your neighbors out too?&quot;</em> Whole-street darkness
        is the power company&apos;s job. A script that says so politely, with
        the outage line ready, saves your on-call electrician an unpaid night
        drive. Load that number into the script before go-live. The growth is
        in new work: panel upgrades, EV chargers, heat pump circuits. These
        jobs are researched in the evening and comparison-shopped, and they go
        to the first shop that sounds competent and puts a real estimate slot
        on the calendar.
      </P>
      <Callout>
        &quot;Thanks for calling Arc Electric - this is the after-hours AI
        assistant. Is anything smoking, or do you smell burning? ... A warm
        outlet with a faint smell - okay. Please don&apos;t plug anything back
        into it. Can you get to your breaker panel safely? ... Flip the breaker
        for that room off - it&apos;s fine if a few lights go with it. ... Good,
        that removes the immediate risk. I&apos;m paging our on-call electrician
        now; he&apos;ll call you within twenty minutes. If anything starts
        smoking before then, get everyone out and call 911 first.&quot;
      </Callout>
      <P>
        Ask any vendor to show you the fire rule configured word for word, then
        roleplay a burning-smell call against it yourself. Keep{" "}
        <Strong>code and permit questions</Strong> with the electrician,
        because real answers depend on jurisdiction, and a confidently wrong
        code answer is worse than none. Any frightened caller who wants a
        person, even after the breaker is off, should get one immediately.
      </P>

      <H2 id="pest-control">Pest control answering service: swarm season and the re-entry question</H2>
      <P>
        Pest control call volume follows the weather, not your staffing. The
        first warm weekend in spring produces a Monday morning when the same
        four zip codes all see the same swarm. Your competitors get the same
        spike on the same morning, so the surge is a distribution problem, and
        whoever picks up wins it. Most of those calls are bookings, which suits
        an answering service well, as long as it writes into your real route
        schedule instead of taking messages.
      </P>
      <Table
        caption="What rings a pest control line, and how to handle it"
        head={["Call", "Urgency", "Right handling"]}
        rows={[
          [
            "Termite swarm",
            "High, and emotional",
            "Book the inspection today or tomorrow. Don't diagnose swarmers versus flying ants over the phone",
          ],
          [
            "Wasps and hornets",
            "High when over a door or where a child plays",
            "Nest location, height, allergies in the household, then a same-day or next-day slot",
          ],
          [
            "Rodents",
            "High and rising after the first cold snap",
            "Interior or exterior, evidence seen, food business or home. Book an inspection, not a guess",
          ],
          [
            "Bed bugs",
            "High, and the caller is embarrassed",
            "Short, unjudgmental intake: rooms affected, how long, whether they have sprayed anything themselves",
          ],
          [
            "Retreat under warranty",
            "Medium, and reputational",
            "Schedule it without argument - see below",
          ],
        ]}
      />
      <H3>The question a script must never answer</H3>
      <P>
        Sooner or later a caller asks what was sprayed, whether it&apos;s safe
        for the kids, or when the dog can go back on the lawn. The correct
        answer is on a specific product label, and the label isn&apos;t
        advisory. The EPA states that every label carries the statement that{" "}
        <Ext href="https://www.epa.gov/pesticide-labels/introduction-pesticide-labels">
          it is a violation of federal law to use the product in a manner
          inconsistent with its labeling
        </Ext>
        . Applying restricted use pesticides requires certification,{" "}
        <Ext href="https://www.epa.gov/pesticide-worker-safety/certification-standards-pesticide-applicators">
          administered by the states under EPA-approved plans
        </Ext>
        . You didn&apos;t pay for that credential so an answering service could
        improvise around it.
      </P>
      <Table
        caption="Safety and product questions: what a script may and may not say"
        head={["Caller says", "Correct behavior"]}
        rows={[
          [
            "When is it safe for my kids to go back in the room? Is this safe around my cat?",
            "Never answered by the script. Re-entry intervals come off the label for the product used. Get a licensed person on the phone, quickly",
          ],
          [
            "What did the technician spray yesterday?",
            "Route to the office or the technician on the account. The answer is a specific product, not a category",
          ],
          [
            "I sprayed something from the hardware store first",
            "Capture it verbatim and flag it on the job. It changes what the technician can do",
          ],
          [
            "Somebody feels unwell after a treatment",
            "Immediate escalation to a person, plus the standard advice to contact a doctor or Poison Control. Never queued",
          ],
          [
            "Do you use organic or pet-safe products?",
            "Only what you publish about your program. Don't let a script invent a promise you then have to honor",
          ],
        ]}
      />
      <P>
        None of this is legal advice, and your state regulator governs. Treat
        it as the brief for your vendor. Have a licensed technician read the
        safety paragraph and try to break it.
      </P>
      <H3>Quotes, retreats and escrow deadlines</H3>
      <UL>
        <LI>
          <Strong>Explain the three price layers.</Strong> The inspection (free
          or fixed-fee), the initial knockdown (priced by property size and
          pest), and the recurring program. Most callers asking &quot;how much
          to get rid of ants&quot; are shopping for the recurring program
          without knowing it exists. Never quote termite treatment before
          anyone has looked.
        </LI>
        <LI>
          <Strong>The retreat call isn&apos;t a complaint.</Strong> Under a
          service guarantee it&apos;s a scheduling event. &quot;That&apos;s
          covered - I can get someone back out Thursday morning, and I&apos;ll
          note what you&apos;re seeing so they arrive ready&quot; keeps the
          customer. &quot;The technician did apply the treatment
          correctly&quot; loses them.
        </LI>
        <LI>
          <Strong>Protect the WDI call.</Strong> A wood-destroying-insect
          inspection for a property sale comes with someone else&apos;s
          deadline. Capture the address and property type, the closing date,
          who ordered it (agent, buyer, seller, lender), who is paying, access
          (occupied, vacant, lockbox), and whether a specific report format is
          required. Then book it on the spot. If your line rings out, the next
          company gets the job, and possibly the agent&apos;s future
          referrals.
        </LI>
        <LI>
          <Strong>Route commercial sightings to a person.</Strong> A restaurant
          manager who finds droppings the day before a health inspection is a
          same-day escalation. Requests for service logs, safety data sheets
          and licensing certificates go to whoever owns the account file.
        </LI>
        <LI>
          <Strong>Keep night dispatch narrow.</Strong> A wasp nest over the
          front door, a rodent in a bedroom, a bed bug discovery at 11 p.m.,
          and a commercial account with an inspection tomorrow can justify a
          night response. Everything else gets a dated appointment for the next
          available slot.
        </LI>
      </UL>

      <H2 id="cleaning">Cleaning company answering service: quotes, keys and crews</H2>
      <P>
        In a small cleaning business the owner is usually also the estimator,
        the dispatcher, the payroll clerk and the receptionist. The trade is
        huge. Janitors and building cleaners alone{" "}
        <Ext href="https://www.bls.gov/ooh/building-and-grounds-cleaning/janitors-and-building-cleaners.htm">
          held about 2.4 million jobs in the United States in 2024
        </Ext>
        , and almost all of that work is dispatched by phone from businesses
        with nobody at a desk. There are almost no emergencies. The risks are
        a quote that loses money, an alarm code in a transcript, and a crew
        that doesn&apos;t show up.
      </P>
      <H3>The quote is a scope question</H3>
      <P>
        The worst cleaning jobs start with a fast phone quote. The caller said
        &quot;three bedrooms, two baths,&quot; and the crew found a move-out
        after a house full of teenagers. Condition, not size, is what moves the
        price. The fix is a fixed set of questions asked every time, a
        discipline a scripted line keeps better than an owner driving a van:
      </P>
      <OL>
        <LI>
          Which type of clean: recurring, one-time, deep, move-in/move-out,
          post-construction. Getting this wrong is the most expensive intake
          error in the trade.
        </LI>
        <LI>Square footage, bedrooms, and full or half baths.</LI>
        <LI>When it was last cleaned professionally, the politest available proxy for condition.</LI>
        <LI>Pets, and how many.</LI>
        <LI>Occupied or empty, furnished or not.</LI>
        <LI>Add-ons: inside the oven or fridge, windows, blinds, laundry.</LI>
        <LI>Frequency and preferred day.</LI>
        <LI>Access and parking.</LI>
      </OL>
      <P>
        Give the published range for what the caller describes, say that
        condition can change it, and book the walkthrough or the first clean.
        Commercial janitorial callers are collecting bids. Capture facility
        type, square footage, frequency, current provider, insurance and
        bonding requirements, and the decision-maker. Then book a walkthrough
        and never quote a monthly price on the phone.
      </P>
      <H3>Never take an alarm code by voice</H3>
      <P>
        Cleaning businesses hold the keys to their customers&apos; homes. An
        automated line records, transcribes and stores speech, so a caller who
        reads out an alarm code has just created a permanent text record of it
        in a vendor&apos;s systems. The script should note that a code or key
        arrangement exists and send collection to your secure client record.
        Pets, parking, rooms not to enter and whether the client will be home
        are fine to capture in full. Ask vendors where recordings and
        transcripts are stored, for how long, and whether a field can be kept
        out of the transcript.
      </P>
      <H3>The 6 a.m. call-off and the trust questions</H3>
      <P>
        Your most important operational call comes from a crew member at 6:05
        a.m. who can&apos;t work today. Give the crew a line that always gets
        answered. Capture who, which jobs, and whether they can do a later
        shift, then alert whoever builds the routes within a minute. A client
        told at 7 a.m. that the crew will arrive at two is mildly
        inconvenienced. Told at ten past ten, they start looking for a new
        company. Cover evenings before nights, because residential prospects
        call at 6:30 p.m. after work.
      </P>
      <P>
        Prospects are also checking whether to trust you with their home. Are
        you insured and bonded: yes or no, plainly. Do you background-check:
        say only what you actually do. Is your product safe for my child, my
        cat, my asthma: name the product and offer the safety data sheet,
        because OSHA&apos;s hazard communication rules put{" "}
        <Ext href="https://www.osha.gov/hazcom">
          the information about a chemical on its safety data sheet
        </Ext>
        , not in the memory of whoever answered the phone. When a client says
        the clean wasn&apos;t good enough, book the redo and capture what was
        missed, room by room. Say nothing about whether the crew was at fault.
        Breakage claims and complaints about a specific employee go to the
        owner immediately.
      </P>

      <H2 id="water-damage">Water damage restoration answering service: two clocks on every call</H2>
      <P>
        In restoration, the phone call is the sale. Nobody shops three
        mitigation companies and calls back Thursday. They dial in order, and
        whoever picks up is in their hallway ninety minutes later with an
        authorization form. Meanwhile the building has its own clock. The
        EPA&apos;s guidance is blunt:{" "}
        <Ext href="https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home">
          &quot;If wet or damp materials or areas are dried 24-48 hours after a
          leak or spill happens, in most cases mold will not grow.&quot;
        </Ext>{" "}
        Restorers work to the{" "}
        <Ext href="https://iicrc.org/s500/">ANSI/IICRC S500 standard</Ext>,
        which classifies water by contamination category. Clean Category 1
        water left in a structure doesn&apos;t stay Category 1. How fast it
        degrades depends on conditions, so treat it as a risk curve rather than
        a countdown. But a call that rings out at 1 a.m. and gets returned at 8
        a.m. becomes a bigger, dirtier job, and somebody else is doing it.
      </P>
      <Figure
        src="/blog/restoration-two-clocks.svg"
        alt="A two-track timeline. The caller's clock: dials the first result, gets no answer and moves to the next company, a competitor is rolling within twenty minutes, authorisation signed within the hour. The building's clock: clean Category 1 water at hour zero, the EPA 24 to 48 hour drying window, then contamination and a growing scope days later"
        width={1200}
        height={630}
        caption="Most trades only run the top clock. Restoration is unusual in that the job itself gets worse while the phone rings."
        credit="Illustration by AI Receptionist Now"
      />
      <H3>Five callers, one number</H3>
      <Table
        caption="The call mix on a restoration company's main line"
        head={["Caller", "Right handling"]}
        rows={[
          [
            "Homeowner with an active loss",
            "Full loss intake, safety instructions, page the on-call crew, confirm an arrival window you can keep",
          ],
          [
            "Plumber, roofer or property manager referring a job",
            "Short intake from a pro who already knows the answers, immediate page, and a callback to the referrer, not the homeowner",
          ],
          [
            "Adjuster or TPA assigning a claim",
            "Capture carrier, claim number, insured, loss type and the promised response window; route to the program owner, usually a business-hours callback",
          ],
          [
            "Existing job, mid-project",
            "Log against the job number for the project manager in the morning - almost never a page",
          ],
          [
            "Sales, vendors, subs",
            "Captured and filtered - never a page",
          ],
        ]}
      />
      <H3>The intake an estimator can dispatch from</H3>
      <P>
        &quot;Water damage at 14 Oak Street, please call back&quot; is a
        message, and it forces your tech to redo the whole conversation from a
        truck. A dispatchable intake asks, in this order: is anyone hurt, and
        is the water near electricity? What&apos;s the source, and is it still
        running? Can they shut it off (main shutoff, or the breaker for a water
        heater)? What kind of water is it: clean supply, appliance discharge,
        or sewage? How many rooms and floors, how deep, has it come through a
        ceiling, and what flooring? Is the power on, and is anyone vulnerable
        on site? Then the address, gate and parking for a box truck, the
        carrier and claim number recorded as plain facts, and who can authorize
        the work. A tenant can&apos;t authorize demolition in someone
        else&apos;s building, and finding that out on site costs a truck
        roll. The building&apos;s side of the same night - how a leasing
        office triages a tenant&apos;s leak report - is in our{" "}
        <Internal href="/blog/apartment-answering-service#triage">
          apartment answering service guide
        </Internal>
        .
      </P>
      <H3>Five sentences the script must never say</H3>
      <OL>
        <LI>
          <Strong>&quot;Your insurance will cover this.&quot;</Strong> Coverage
          is the carrier&apos;s decision on a specific policy.
        </LI>
        <LI>
          <Strong>&quot;It sounds like the supply line failed / the roofer is
          liable.&quot;</Strong> Cause and origin is determined on site, and
          speculation on a recorded line is a gift to the other side of a
          subrogation fight.
        </LI>
        <LI>
          <Strong>&quot;That&apos;ll be about three thousand dollars.&quot;</Strong>{" "}
          Mitigation is priced from scope, and a number said out loud becomes
          the ceiling on the invoice.
        </LI>
        <LI>
          <Strong>&quot;Someone will be there in thirty minutes.&quot;</Strong>{" "}
          Unless dispatch knows a crew is free, promise a callback with a real
          ETA within a set number of minutes instead.
        </LI>
        <LI>
          <Strong>&quot;That mold won&apos;t hurt you.&quot;</Strong> Health
          reassurance and health alarm are both out of scope. Acknowledge the
          concern and hand it to the estimator.
        </LI>
      </OL>
      <Callout>
        A useful demo test for any restoration answering service: call in and
        ask &quot;Is this covered by my insurance, and how much is it going to
        cost me?&quot; Those are the two questions every real caller asks in
        the first ninety seconds. The right answers are{" "}
        <em>
          &quot;That&apos;s your carrier&apos;s call, and our estimator will
          walk you through the claim process on site - do you know who your
          carrier is?&quot;
        </em>{" "}
        and{" "}
        <em>
          &quot;It depends on what the crew finds; they&apos;ll scope it and go
          through the numbers with you before any work starts.&quot;
        </em>
      </Callout>
      <P>
        Keep a human on injury, fire or gas (one instruction: get out, call
        911, and no intake at all), commercial large losses with a
        business-interruption clock, program and TPA relationships, and anyone
        who has just lost a home. Before a real freeze tests it for you, run
        the escalation chain once at 2 a.m. on purpose. This section is general
        guidance, not legal advice, and your counsel and carrier relationships
        govern.
      </P>

      <H2 id="locksmith">Locksmith answering service: ninety seconds and an honest price</H2>
      <P>
        No trade loses more work to an unanswered phone. A locked-out caller
        is standing in a parking lot with six numbers on a search page, and if
        yours rings more than three or four times they tap the next one. There
        is no voicemail and no callback in that behavior. The call has a fixed,
        short shape that needs no improvisation:
      </P>
      <OL>
        <LI>
          <Strong>Answer fast and name the business</Strong> in the first three
          seconds.
        </LI>
        <LI>
          <Strong>Establish what is locked and where</Strong>: house,
          apartment, car, safe, commercial door, and whether the caller is
          somewhere safe.
        </LI>
        <LI>
          <Strong>Give the all-in number</Strong> as a range, with the two
          things that move it named out loud.
        </LI>
        <LI>
          <Strong>Give a real ETA</Strong> from where the van actually is.
          &quot;He&apos;s finishing a job and can be with you by 10:40&quot;
          keeps more callers than &quot;twenty minutes&quot; followed by an
          hour.
        </LI>
        <LI>
          <Strong>Say what ID they will need</Strong> before dispatch, not at
          the door.
        </LI>
        <LI>
          <Strong>Confirm the callback number by text</Strong>, with your
          business name on it.
        </LI>
      </OL>
      <P>
        Vehicle lockouts sit next door to towing: same roadside caller, same
        &quot;where exactly are you?&quot; problem. If your vans also tow, the
        location intake and motor-club sorting are in our{" "}
        <Internal href="/blog/towing-answering-service">
          24/7 towing dispatch and answering guide
        </Internal>
        .
      </P>
      <H3>The quote is the trade&apos;s reputation</H3>
      <P>
        The scam pattern consumer agencies warn about is a phone problem: a
        very low quote, an unmarked vehicle, and a price that triples on the
        doorstep. The{" "}
        <Ext href="https://consumer.ftc.gov/articles/0089-finding-locksmith">
          FTC warns consumers
        </Ext>{" "}
        that a locksmith listing may not be local at all and that they should
        get the price up front, and the{" "}
        <Ext href="https://www.ftc.gov/news-events/news/press-releases/2008/05/ftc-urges-consumers-use-caution-when-seeking-locksmith">
          FTC has been urging caution
        </Ext>{" "}
        since at least 2008. Connecticut&apos;s consumer protection department
        is more specific:{" "}
        <Ext href="https://portal.ct.gov/dcp/knowledge-base/articles/scam-zone/locksmith-scams">
          ask for the full price including service and travel costs before
          anyone is dispatched, get it in writing, and refuse the work if the
          number at the door does not match the number given on the phone
        </Ext>
        . Read that as a locksmith. Your callers have been trained to test you
        on one thing, so quote all-in and hold it. The quote should name the
        service charge, the labor range for the job type, what moves it
        (high-security cylinder, transponder key, after-hours rate), any
        after-hours premium, the payment methods you accept (cash-only is a
        documented scam signal), and your policy on a job you can&apos;t
        complete.
      </P>
      <H3>Authority to enter</H3>
      <Table
        caption="Proof-of-authority handling by call type"
        head={["Situation", "What the phone should say", "Who decides"]}
        rows={[
          [
            "Residential lockout, occupant",
            "Government photo ID plus something tying you to the address - mail, a lease, a utility bill",
            "Locksmith on site",
          ],
          [
            "Vehicle lockout",
            "ID plus registration or insurance for the vehicle; capture year, make, model and key type first",
            "Locksmith on site",
          ],
          [
            "Landlord or property manager",
            "ID plus proof of ownership or management authority for the unit",
            "Locksmith on site",
          ],
          [
            "Rekey after a breakup or eviction",
            "The same requirement, and never take sides or record a narrative about the other party",
            "Owner or locksmith, never the answering line",
          ],
          [
            "Caller who becomes evasive about ID",
            "Repeat the policy calmly, don't accuse, flag the job for a human before dispatch",
            "A person, not a script",
          ],
        ]}
      />
      <P>
        The ID policy must be stated as a fact, not negotiated. A script that
        softens it under pressure is worse than one that never mentions it. An
        automated line has one real advantage here: every call is timestamped
        and transcribed, which is a far better record of what a caller was told
        than anyone&apos;s memory.
      </P>
      <Callout>
        Four locksmith calls belong to 911, not to you: a child or pet locked
        in a vehicle, someone locked <em>in</em> rather than out, a break-in in
        progress or a caller who feels unsafe, and a medical emergency behind
        the door. Write each one into the script as an explicit rule, and test
        them on your own line before launch. A vendor who can&apos;t show
        recognition working on a live test call hasn&apos;t built it.
      </Callout>
      <P>
        Rekeys, lock changes and installs are scheduled work. They should end
        the call as a dated appointment with the address, the number of
        cylinders, and whether keyed-alike is wanted. Commercial accounts,
        master key systems and access control are site-visit sales. Recognize
        the account, route the caller to the person who owns the relationship,
        and never quote on the phone. Bill disputes, police reports and
        insurance claims go to the owner from the first sentence.
      </P>

      <P>
        Whatever your trade, the test is the same one from the top of this
        guide. Count the calls that rang out last week, then imagine the ones
        that never left a trace. See how our{" "}
        <Internal href="/home-services">
          AI receptionist works for home services businesses
        </Internal>
        , check <Internal href="/pricing">pricing</Internal>, and judge it on
        your own worst call.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
