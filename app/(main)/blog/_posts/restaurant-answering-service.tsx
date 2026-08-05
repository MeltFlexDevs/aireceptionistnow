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
  slug: "restaurant-answering-service",
  title: "Restaurant Answering Service: Who Answers During the Rush?",
  description:
    "How a restaurant answering service handles takeout orders, reservations, large parties and allergy calls - and the one question a script must never answer on its own.",
  date: "2026-08-05",
  updated: "2026-08-05",
  readingTime: "13 min read",
  tag: "Industries",
  hero: "/blog/restaurant-answering-service-hero.webp",
  heroAlt:
    "A restaurant host stand during a busy evening service with a ringing phone beside a reservation book, the dining room full and blurred behind it",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "restaurant answering service",
    "answering service for restaurants",
    "restaurant phone answering service",
    "AI phone answering for restaurants",
    "restaurant call answering takeout orders",
    "restaurant reservation phone service",
    "who answers the phone at a restaurant",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "call-mix", title: "Seven callers, one line" },
    { id: "why-phone", title: "Why the phone is still the profitable channel" },
    { id: "rush", title: "The rush is the whole problem" },
    { id: "allergens", title: "The allergy call: the one boundary that is not negotiable" },
    { id: "reservations", title: "Reservations, waitlists and no-shows" },
    { id: "large-party", title: "Large parties and catering: the call worth the most" },
    { id: "models", title: "Live answering vs AI vs online-only" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "limits", title: "Where AI loses" },
    { id: "setup", title: "Setting it up" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a restaurant answering service?",
      a: "It is whatever picks up your dining room line when your staff cannot - a live answering bureau, an AI receptionist, or a hybrid of the two. For a restaurant the job is narrower and more specific than in most trades: take or route takeout orders, book and modify reservations, answer hours, parking, patio, kids and dietary questions, capture large-party and catering inquiries with enough detail that a manager can quote them, and hand off anything involving a complaint, an allergy assurance or a refund to a person.",
    },
    {
      q: "Can an AI answer the phone for a restaurant during a dinner rush?",
      a: "That is the only hour that matters. The rush is exactly when every server is carrying plates and the host is seating a four-top, and it is also when the highest-intent calls arrive. Software answers on the first ring whether it is fielding one call or nine at the same moment, which is the structural difference between it and a host stand: a host can hold one line, and every other caller hears a busy tone or a voicemail box they will not use.",
    },
    {
      q: "Should an answering service take phone orders directly into the POS?",
      a: "Only if the integration is real and the menu is live. An order typed into a system that does not know the kitchen is 86'd on short rib is worse than no order at all, because the customer finds out at pickup. Where the integration exists, phone orders are the most profitable orders you take - no marketplace commission, your own customer data. Where it does not, the honest configuration is to capture the order and read it back to the kitchen line, or to text the caller your direct ordering link and stop pretending.",
    },
    {
      q: "Can an AI receptionist answer allergy questions?",
      a: "It can state what is on the recipe or ingredient list and it must stop there. It must never say a dish is safe, allergen-free, or gluten-free, because that is a kitchen fact about cross-contact that no phone script can know at 7:40 p.m. on a Friday. The correct behavior is to name the allergen policy, offer to have a manager or chef call back before the guest arrives, and flag it on the reservation. The FDA's nine major allergens - milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame - are the list your script should recognize and escalate on.",
    },
    {
      q: "How much does a restaurant answering service cost?",
      a: "Live answering bureaus bill per call or per minute and generally land between $1 and $3 a call once you account for minimums, which gets expensive fast at restaurant call volumes. Restaurant-specific voice AI is usually a flat monthly fee in the $50 to $400 range per location, sometimes with a per-order component. Judge either against the arithmetic that actually matters: a phone order you take yourself carries no third-party commission, and one recovered four-top on a Friday covers most of a month.",
    },
    {
      q: "Will callers be annoyed that a restaurant uses AI to answer?",
      a: "Far less than they are annoyed by ringing out. The complaint people actually make about restaurant phones is that nobody picks up, or that they were put on hold and forgotten mid-order. A voice that answers on the first ring, knows the hours and can book the table beats a busy signal by a wide margin. Where it does grate is when a caller wants a person and cannot get one, so the script has to hand off cleanly the moment anyone asks.",
    },
    {
      q: "Can it handle multiple locations on one number?",
      a: "Yes, and it is one of the better reasons to use software rather than a host stand. A single line can identify which location the caller wants - by asking, by the number they dialed, or by the area they name - and then answer with that location's hours, menu, parking and reservation book. What it must not do is guess: sending a caller to the wrong location for a 7 p.m. booking is a worse outcome than asking one extra question.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "National Restaurant Association: off-premises dining is now essential for restaurant consumers and operators",
    url: "https://restaurant.org/research-and-media/media/press-releases/from-trend-to-transformation-off-premises-dining-now-essential-for-restaurant-consumers,-operators/",
  },
  {
    title:
      "National Restaurant Association: 2025 State of the Restaurant Industry",
    url: "https://www.restaurant.org/research-and-media/media/press-releases/restaurant-industry-poised-for-growth-in-2025-industry-expected-to-employ-15-9-million-people-and-r/",
  },
  {
    title: "FDA: Food Allergies - the nine major food allergens",
    url: "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies",
  },
  {
    title:
      "FDA: sesame added as a major food allergen, 2022 Food Code addition",
    url: "https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/addition-2022-food-code-sesame-added-major-food-allergen",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        The restaurant phone rings hardest at 7:40 p.m. on a Friday, which is
        the exact minute nobody in the building can answer it. The host is
        seating a four-top, the servers are carrying plates, and the manager is
        in the walk-in. So the line rings out, and the person on the other end -
        who wanted to place a $90 pickup order, or book a table for eight next
        Thursday - calls the place down the street instead. We build AI
        receptionists, so treat this skeptically: here is what each caller on a
        restaurant line actually needs, and the one question a script must never
        answer on its own.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>The rush is the problem, not the after-hours.</Strong> Your
            highest-intent calls arrive at the exact hour your staff is least
            able to pick up.
          </>,
          <>
            A phone order is a <Strong>direct order</Strong> - no marketplace
            commission, your own customer data. That is the real arithmetic.
          </>,
          <>
            <Strong>Never let a script call a dish safe or gluten-free.</Strong>{" "}
            Cross-contact is a kitchen fact; the call&apos;s job is to flag it
            and get a manager.
          </>,
          <>
            Large-party and catering calls are worth ten covers.{" "}
            <Strong>They should never become a voicemail.</Strong>
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>restaurant answering service</Strong> covers the dining room
        line when your team physically cannot - mid-rush, mid-shift, before
        open, after close, and on the Monday you are dark but people are still
        booking Saturday. It takes or routes takeout orders, books and changes
        reservations, answers the twenty questions every restaurant gets asked
        (hours, parking, patio, kids, dogs, corkage, dress code, where the
        entrance is), captures large-party and catering inquiries in enough
        detail to quote, and escalates complaints, allergy assurances and
        refunds to a human.
      </P>
      <P>
        It can be a live answering bureau, an AI receptionist, or a hybrid. The
        interesting question is not which one is &quot;better&quot; in the
        abstract - it is which one is awake and free at 7:40 p.m., and which one
        knows that the short rib is 86&apos;d.
      </P>

      <H2 id="call-mix">Seven callers, one line</H2>
      <Table
        caption="The call mix on a restaurant's main number"
        head={["Caller", "What they need", "Right handling"]}
        rows={[
          [
            "Takeout or pickup order",
            "To order food, now, and know when it will be ready",
            "Take it against a live menu with 86'd items, quote a real time, confirm by text - or send your direct ordering link, quickly",
          ],
          [
            "Reservation, new or changed",
            "A table, a time, a party size - or to move or cancel one",
            "Straight into the booking system, with the cancellation handled as willingly as the booking",
          ],
          [
            "The twenty questions",
            "Hours, parking, patio, kids, dogs, corkage, dress code, private room, gift cards",
            "Answered instantly from a facts sheet you own. This is most of your call volume and none of your staff's attention",
          ],
          [
            "Large party or catering",
            "To feed 30 people on a date, and to be taken seriously",
            "Full capture - date, headcount, budget, dietary needs, contact - and a same-day callback from a manager. Never a voicemail",
          ],
          [
            "Allergy or dietary question",
            "To know whether they can eat safely at your restaurant",
            "State the ingredient facts, never an assurance. Flag the reservation and route to a manager or chef",
          ],
          [
            "Delivery driver, vendor, or the guest who is lost",
            "A door, a dock, a person, a direction",
            "Resolved in ten seconds with the right facts, or routed to the one person who can help",
          ],
          [
            "Sales calls and spam",
            "Your time",
            "Filtered before anyone in an apron hears about it",
          ],
        ]}
      />
      <P>
        Look at the middle rows. The bulk of a restaurant&apos;s call volume is
        questions with fixed answers - the sort of thing a well-written facts
        sheet resolves without judgment. That is the part worth automating first,
        because it is what currently interrupts a host mid-seating twenty times
        a night.
      </P>

      <H2 id="why-phone">Why the phone is still the profitable channel</H2>
      <P>
        The National Restaurant Association&apos;s off-premises research puts a
        number on something operators already feel:{" "}
        <Ext href="https://restaurant.org/research-and-media/media/press-releases/from-trend-to-transformation-off-premises-dining-now-essential-for-restaurant-consumers,-operators/">
          roughly three of every four restaurant transactions now happen
          off-premises
        </Ext>{" "}
        - takeout, drive-thru, curbside and delivery. Off-premises stopped being
        a side channel some years ago and became the main one.
      </P>
      <P>
        Which makes the routing question a margin question. Every off-premises
        order arrives through one of three doors, and they are not
        commercially equal:
      </P>
      <Table
        caption="Where an off-premises order can come from"
        head={["Channel", "What it costs you", "What you learn about the guest"]}
        rows={[
          [
            "Third-party marketplace",
            "A commission on every order, on top of card fees",
            "Very little - the marketplace owns the relationship",
          ],
          [
            "Your own online ordering",
            "Payment processing, plus whatever the platform charges",
            "Everything, and you can market to them again",
          ],
          [
            "The phone",
            "A minute of somebody's attention - or nothing, if it rings out",
            "Everything, plus a phone number that answers next time",
          ],
        ]}
      />
      <P>
        A phone order is the cheapest order you will take all night, and it is
        the one most likely to evaporate. That is the whole argument for taking
        the line seriously. The general version of this arithmetic is in{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the cost of a missed call
        </Internal>
        , and{" "}
        <Internal href="/missed-call-calculator">our calculator</Internal> will
        run it with your average ticket instead of ours - which for a restaurant
        is the honest way to do it, because a $28 pickup order and a
        twelve-person Saturday booking are not the same missed call.
      </P>

      <H2 id="rush">The rush is the whole problem</H2>
      <P>
        Most answering-service marketing is about after-hours coverage. For
        restaurants that framing is slightly wrong. Your problem hours are not
        3 a.m. - they are the two hours a night when the room is full, which is
        also when the phone rings most and when your staff has the least
        capacity to answer it.
      </P>
      <Callout>
        A host stand can hold exactly one line. During service, the second
        simultaneous caller gets a busy tone, a voicemail box they will not use,
        or a hold they will not wait through. Restaurants do not lose calls one
        at a time - they lose them in a clump, in the same twenty minutes, every
        Friday.
      </Callout>
      <P>
        That concurrency limit is the structural difference. Software answers
        the ninth simultaneous call the same way it answers the first, which is
        why{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
          handling calls in parallel
        </Internal>{" "}
        matters more here than in almost any other trade. A plumber gets three
        calls in an afternoon. A restaurant gets nine in a minute and then none
        for an hour.
      </P>
      <P>
        The practical consequence: do not start by pointing your after-hours
        calls at a service. Start by pointing the <em>overflow</em> at it - the
        calls that arrive while your line is already busy - and read the
        transcripts for a week. Most operators are surprised twice: by how many
        there are, and by how many were about parking.
      </P>

      <H2 id="allergens">The allergy call: the one boundary that is not negotiable</H2>
      <P>
        This is the section that should decide which service you buy, and no
        vendor page mentions it.
      </P>
      <P>
        A caller asks whether the pasta is gluten-free, or whether the fryer
        touches shellfish, or whether the dessert has sesame. There is a helpful
        answer and a correct answer, and they are not the same. The FDA
        recognizes{" "}
        <Ext href="https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies">
          nine major food allergens - milk, eggs, fish, crustacean shellfish,
          tree nuts, peanuts, wheat, soybeans and sesame
        </Ext>
        , with{" "}
        <Ext href="https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/addition-2022-food-code-sesame-added-major-food-allergen">
          sesame added most recently and folded into the 2022 Food Code
        </Ext>
        . Whether a specific plate reaching a specific guest is free of one of
        them is a question about the kitchen at that moment - shared fryers,
        shared boards, a cook who changed gloves or did not. Nobody on a phone
        can know it.
      </P>
      <P>So the script has exactly three permitted moves:</P>
      <OL>
        <LI>
          <Strong>State ingredients, from the recipe.</Strong> &quot;The romesco
          has almonds in it&quot; is a fact you control and can put in writing.
        </LI>
        <LI>
          <Strong>State the policy, verbatim.</Strong> Whatever your kitchen
          actually does about cross-contact - a dedicated fryer or not, a
          separate prep area or not - written once, said the same way every
          time.
        </LI>
        <LI>
          <Strong>Escalate, and flag the booking.</Strong> Offer a callback from
          a manager or chef before the guest arrives, and put the allergen on
          the reservation so the floor is not learning about it when the plate
          goes down.
        </LI>
      </OL>
      <Callout>
        The forbidden sentences are short and worth writing on the wall:{" "}
        <em>it&apos;s safe</em>, <em>it&apos;s gluten-free</em>,{" "}
        <em>you&apos;ll be fine</em>, <em>we can make anything allergy-free</em>
        . An answering service that improvises reassurance is not being helpful.
        It is making a promise your kitchen has to keep, to a guest who may end
        up in an emergency room.
      </Callout>
      <P>
        This is not a reason to keep humans on the phone, incidentally - an
        underslept host improvises reassurance far more often than a script
        does. It is a reason to write the boundary down and test it, whoever is
        answering. The general craft of writing that kind of bounded instruction
        is in{" "}
        <Internal href="/blog/ai-receptionist-prompts">
          our guide to AI receptionist prompts
        </Internal>
        .
      </P>

      <H2 id="reservations">Reservations, waitlists and no-shows</H2>
      <P>
        Reservation calls look like the easy category and quietly are not,
        because three of the four things a caller wants are edits rather than
        bookings.
      </P>
      <UL>
        <LI>
          <Strong>Take the cancellation as gladly as the booking.</Strong> A
          table released at 4 p.m. is a table you resell. A cancellation that
          hits a voicemail box becomes a no-show, and the difference between
          those two outcomes is one script line: make cancelling easy, not
          slightly embarrassing.
        </LI>
        <LI>
          <Strong>Confirm in writing, always.</Strong> Time, party size, date,
          name, and the one detail that ruins evenings - which location. A text
          confirmation costs nothing and eliminates most of the &quot;we had a
          reservation&quot; conversations at the door.
        </LI>
        <LI>
          <Strong>Waitlist calls are conversion calls.</Strong> &quot;How long
          is the wait right now?&quot; is somebody deciding between you and
          another restaurant while parked outside. An honest number, said fast,
          wins more of those than an optimistic one.
        </LI>
        <LI>
          <Strong>Special occasions belong in the record.</Strong> Birthday,
          anniversary, proposal, high chair, wheelchair access, a regular who
          always sits at 12. This is the cheap detail that turns a booking into
          a memorable service, and it is lost every time a call is a
          scribble on a pad.
        </LI>
        <LI>
          <Strong>Deposit and cancellation policies get said out loud.</Strong>{" "}
          If you hold a card for parties over six, the caller hears it during
          the booking, not in a dispute afterwards.
        </LI>
      </UL>
      <P>
        Mechanically this is the same job as any other booking flow - check real
        availability, write to the real calendar, confirm.{" "}
        <Internal href="/answers/can-an-ai-receptionist-book-appointments">
          How that works end to end
        </Internal>{" "}
        is worth reading if you are evaluating vendors, because &quot;we
        book&quot; can mean anything from a live API write to an email somebody
        retypes.
      </P>

      <H2 id="large-party">Large parties and catering: the call worth the most</H2>
      <P>
        A twelve-top, a rehearsal dinner, an office order for 40 - these are the
        highest-value calls a restaurant receives and the ones most likely to be
        handled worst, because they arrive at the same bad moment as everything
        else and cannot be resolved in ninety seconds.
      </P>
      <P>
        The wrong answer is &quot;can you email us?&quot; The person planning an
        office lunch is calling three restaurants and will book with whichever
        one takes them seriously first. The right answer is a full capture and a
        fast callback:
      </P>
      <Table
        caption="What a large-party or catering call must capture before it ends"
        head={["Field", "Why it matters"]}
        rows={[
          [
            "Date, time, headcount",
            "Decides feasibility before a manager spends a minute on it",
          ],
          [
            "Occasion and format",
            "Seated dinner, buffet, drop-off catering and a private room are four different quotes",
          ],
          [
            "Budget per head, if they will say",
            "Separates a real inquiry from a price check, without making anyone feel screened",
          ],
          [
            "Dietary requirements and allergens",
            "The one thing that changes the menu, and the one thing nobody remembers to ask",
          ],
          [
            "Decision deadline",
            "Tells you whether this is a callback in an hour or a callback tomorrow",
          ],
          [
            "Name, mobile, email",
            "Two channels, because this callback actually has to land",
          ],
        ]}
      />
      <P>
        Then set a hard internal rule: large-party inquiries get a human
        callback the same day, with a name attached. Everything else on this
        page is about handling volume; this row is about not fumbling the one
        call that was worth ten covers.
      </P>

      <H2 id="models">Live answering vs AI vs online-only</H2>
      <Table
        caption="Ways to cover a restaurant line"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Nobody - let it ring, push people online",
            "Counter-service spots with genuinely simple menus and no reservations",
            "The lost orders are invisible. You never see the caller who tried you at 7:40 and ate elsewhere",
          ],
          [
            "Generalist answering bureau",
            "Fine dining wanting a human voice on every call, at low volume",
            "Per-call pricing at restaurant volumes; agents who do not know your menu, your 86 list or your neighborhood",
          ],
          [
            "Restaurant voice AI",
            "Anyone with a real rush, phone takeout, or reservations by phone",
            "The integrations are the value - POS, menu, 86 list, booking system. Without them it is a message-taker with a nice voice",
          ],
          [
            "Hybrid (AI first, staff escalation)",
            "Most independents: AI takes questions, orders and bookings; staff take complaints, large parties and anything odd",
            "Write the always-human list before you launch, not after the first bad transcript",
          ],
        ]}
      />
      <P>
        Cross-market pricing is in our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost guide
        </Internal>{" "}
        and our own flat plans are on the{" "}
        <Internal href="/pricing">pricing page</Internal>. You keep the number
        that is on your listings and your window -{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          forwarding takes about eight minutes
        </Internal>
        , and you can point only the busy-line overflow at it to start.
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <H3>Friday 7:41 p.m., pickup order, third simultaneous caller</H3>
      <Callout>
        &quot;Thanks for calling - are you ordering for pickup? ... Great, go
        ahead. ... Two carnitas tacos, the half chicken, and a side of rice. The
        half chicken is about a twenty-five minute cook tonight, so I&apos;d say
        ready at 8:10. Anything to drink? ... That&apos;s $47.20. I&apos;ll text
        you the confirmation and the pickup time to this number - is this the
        best one? ... Perfect, see you at 8:10.&quot;
      </Callout>
      <H3>The allergy call, handled correctly</H3>
      <Callout>
        &quot;I can tell you exactly what&apos;s in it - the pesto has pine nuts
        and parmesan, and the pasta itself contains wheat. What I can&apos;t
        tell you from here is whether it stays clear of the shellfish in the
        kitchen, because that depends on the line tonight. Let me flag it on
        your reservation and have the manager call you back before you come in -
        what&apos;s the best number? ... Thank you. That call will come within
        the hour.&quot;
      </Callout>
      <H3>The sentence that stops the script</H3>
      <Callout>
        &quot;... my wife got sick after eating there last night.&quot;{" "}
        <em>
          [No explanation, no apology script, no reassurance. Straight to a
          manager, logged with the time and the caller&apos;s number, whatever
          hour it is.]
        </em>
      </Callout>

      <H2 id="limits">Where AI loses (keep a human here)</H2>
      <UL>
        <LI>
          <Strong>Any allergy assurance.</Strong> Covered above and worth
          repeating: state ingredients, never state safety.
        </LI>
        <LI>
          <Strong>Complaints, illness reports and refunds.</Strong> These are
          reputation events and sometimes documents. A person owns them from the
          first sentence.
        </LI>
        <LI>
          <Strong>Press, health department, licensing.</Strong> Rare, and
          catastrophic to improvise. Straight to the owner.
        </LI>
        <LI>
          <Strong>Anything requiring the kitchen&apos;s real-time state.</Strong>{" "}
          If your 86 list lives in a chef&apos;s head rather than the POS, no
          phone system can quote it. Fix the list before you blame the software.
        </LI>
        <LI>
          <Strong>The regular who wants their table.</Strong> Some
          relationships are the product. Route known numbers to a person on
          purpose.
        </LI>
      </UL>

      <H2 id="setup">Setting it up</H2>
      <OL>
        <LI>
          <Strong>Write the facts sheet first.</Strong> Hours by day, holiday
          hours, address and what the entrance looks like, parking, patio,
          dogs, kids, high chairs, corkage, dress code, private room capacity,
          gift cards, accessibility. This one document answers most of your
          calls and takes an afternoon.
        </LI>
        <LI>
          <Strong>Decide what &quot;taking an order&quot; means.</Strong> Live
          into the POS, or captured and read back, or a text with your ordering
          link. All three are defensible. Ambiguity is not, because the caller
          acts on whatever they think happened.
        </LI>
        <LI>
          <Strong>Connect the booking system, not a spreadsheet.</Strong> Real
          availability, real writes, real confirmations - including
          cancellations.
        </LI>
        <LI>
          <Strong>Write the allergen boundary and test it.</Strong> Call your
          own line and try to get the script to say &quot;safe.&quot; If it
          does, fix it before launch.
        </LI>
        <LI>
          <Strong>Route overflow first, then after-hours.</Strong> Busy-line
          overflow during service is where the lost revenue is. After-hours is
          the easy second step.
        </LI>
        <LI>
          <Strong>Read a week of transcripts.</Strong> You will find two
          questions your script fumbles and one you did not know guests asked.
          Both are ten-minute fixes.
        </LI>
      </OL>
      <P>
        The cheapest way to size this before spending anything: pull last
        month&apos;s call log and count the calls that came in while another
        call was already connected. Each one heard a busy tone during your best
        hour. If you want to hear the script yourself, our{" "}
        <Internal href="/pricing">plans run month-to-month</Internal>, and the{" "}
        <Internal href="/restaurants">restaurants page</Internal> covers the
        wider setup. If you run several rooms,{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-locations">
          multi-location handling
        </Internal>{" "}
        is the part to get right before you launch, not after.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
