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
  slug: "best-ai-phone-answering-for-restaurants",
  title: "Best AI Phone Answering for Restaurants (2026)",
  description:
    "Five AI phone products for restaurants, ranked by where the call ends - a message, a reservation, or an order in your POS. Plus what a restaurant answering service must handle: the rush, allergy calls, reservations and large parties.",
  date: "2026-08-25",
  updated: "2026-10-04",
  readingTime: "21 min read",
  tag: "Guides",
  hero: "/blog/restaurant-phone-service-hero.webp",
  heroAlt:
    "A restaurant pass during service, with a ticket rail, steam and plated dishes, and in the foreground a corded phone handset hanging off the hook against the stainless steel",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "ai answering service for restaurants",
    "restaurant answering service",
    "answering service for restaurants",
    "restaurant phone answering service",
    "restaurant reservation phone service",
    "ai voice agent for restaurants",
    "ai phone answering for restaurants",
    "restaurant ai phone system",
    "ai phone agent for restaurants",
    "best ai phone answering restaurants",
    "slang ai alternative",
    "restaurant ai phone ordering",
  ],
  sections: [
    { id: "the-ranking", title: "The ranking, in one table" },
    { id: "the-fork", title: "Where does the call end?" },
    { id: "call-mix", title: "Seven callers, one line - and the rush" },
    { id: "how-we-ranked", title: "How we ranked these - and who we are" },
    { id: "why-ordering-is-hard", title: "Why phone ordering is the hard one" },
    { id: "reservations", title: "Reservations, large parties and catering" },
    { id: "shortlist", title: "The five, one at a time" },
    { id: "pricing", title: "What each one actually costs" },
    { id: "allergens", title: "The two sentences that must never be automated" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "test", title: "A test you can run during a slow Tuesday" },
    { id: "not-for-you", title: "When none of these is the answer" },
    { id: "faq", title: "FAQ" },
  ],
  itemList: [
    {
      name: "Loman",
      description:
        "Best when the call has to end as an order inside your POS. Names Toast, Square, Clover, SpotOn, Shift4, Aloha by NCR, Olo, OpenTable and Resy. Ordering sits on the upper tier, and neither tier publishes a price.",
      url: "https://loman.ai/",
    },
    {
      name: "Slang.ai",
      description:
        "Best when the call ends in a reservation or a question. The only vendor in the category publishing prices: Core from $399/mo and Premium from $599/mo per location. Integrates with OpenTable, SevenRooms, Tripleseat and Yelp - and no POS.",
      url: "https://www.slang.ai/pricing",
    },
    {
      name: "ConverseNow",
      description:
        "Best for high-volume QSR and multi-unit franchise groups. Names Denny's, Domino's, Wingstop, Hardee's and Fazoli's as customers, and Brink, PAR, Qu, Olo, NCR Aloha and Fiserv among POS partners. No published price.",
      url: "https://conversenow.ai/",
    },
    {
      name: "PolyAI",
      description:
        "Best for enterprise hospitality groups that want a custom-built agent. Priced per minute of ongoing use, quoted after a demo, spanning ten verticals rather than restaurants alone.",
      url: "https://poly.ai/pricing/",
    },
    {
      name: "A general packaged AI receptionist",
      description:
        "Best when the phone only needs answering - hours, directions, large-party enquiries, a callback - and no POS or booking write-back is required. Flat monthly pricing, live the same day.",
      url: "https://aireceptionistnow.com/pricing",
    },
  ],
  faqs: [
    {
      q: "What is the best AI phone answering system for a restaurant?",
      a: "It depends entirely on where you need the call to end. If it has to end as an order in your POS, Loman is the strongest independent-focused option and names Toast, Square, Clover, SpotOn, Shift4, Aloha and Olo. If it has to end as a reservation, Slang.ai is the most transparent, publishing $399 and $599 per location per month and integrating with OpenTable, SevenRooms, Tripleseat and Yelp. If you run a high-volume QSR group, ConverseNow is built for that scale. And if the call only needs answering - hours, directions, a callback - a general packaged AI receptionist does it for a fraction of any of them.",
    },
    {
      q: "Can an AI take phone orders straight into Toast or Square?",
      a: "Products in this category do claim it, and it is the single hardest thing any of them do. Taking an order means reading a live menu, applying modifiers correctly, knowing what has been 86'd in the last twenty minutes, quoting a pickup time that survives contact with a full kitchen, and in most cases handling payment. Loman's upper tier lists complete POS integration, secure payment over the phone and out-of-stock menu updates as distinct features, which tells you those are distinct problems. Ask any vendor to demo an 86'd item and a three-modifier order rather than a plain cheeseburger.",
    },
    {
      q: "How much does AI phone answering for a restaurant cost?",
      a: "Slang.ai is the only vendor in this comparison publishing figures: Core starting at $399 per month per location and Premium at $599, with enterprise quoted. Loman, ConverseNow and PolyAI all sell through a demo, though PolyAI states its ongoing pricing is per minute. A general packaged AI receptionist that answers questions and takes messages without touching a POS runs roughly €99-€299 per month. The spread is not margin - order-taking into a POS is materially harder to build and to support than answering a question about parking.",
    },
    {
      q: "Does Slang.ai take takeout orders?",
      a: "Not into a point-of-sale system, on the evidence of its own site. Slang.ai's integrations page lists OpenTable, SevenRooms, Tripleseat and Yelp - reservation and event platforms - and names no POS at all. Its own description of the product centres on answering guest enquiries and managing reservations, covering everything from hours and directions to promos and allergy information. That is a coherent product for a full-service restaurant taking bookings. It is the wrong product for a pizzeria whose phone volume is orders.",
    },
    {
      q: "Can an AI answer the phone for a restaurant during a dinner rush?",
      a: "That is the hour that matters most. The rush is when every server is carrying plates and the host is seating a four-top, and it is also when the highest-intent calls arrive. A host stand can hold one line, so the second simultaneous caller hears a busy tone or a voicemail box they will not use. Software answers the ninth simultaneous call the same way it answers the first. The practical way to start is to point only the busy-line overflow at it during service and read a week of transcripts before adding after-hours.",
    },
    {
      q: "Can an AI receptionist answer allergy questions?",
      a: "It can state what is in a dish from the recipe and your written cross-contact policy, and it must stop there. It must never say a dish is safe, allergen-free or gluten-free, because whether a specific plate is free of an allergen is a question about the kitchen at that moment - shared fryers, shared boards - that no phone script can know. The correct behaviour is to state the ingredients and the policy, offer a callback from a manager or chef before the guest arrives, and flag the allergen on the reservation. The FDA's nine major allergens - milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame - are the list a script should recognise and escalate on.",
    },
    {
      q: "Will an AI answering the phone annoy my regulars?",
      a: "Some of them, yes, and the mitigation is structural rather than cosmetic. Have the agent identify itself as AI in the first sentence - a fake human is what actually generates complaints. Make the route to a person short and reliable, and route large parties, private events and complaints straight to a human without argument. Then run it only during service and after hours for a month and read your reviews. If a name shows up twice, that is data, not noise.",
    },
    {
      q: "What happens when the AI gets a quote time wrong on a Friday night?",
      a: "You get an angry guest at the counter at 7:40, which is worse than a missed call. This is the sharpest limitation of phone ordering and the question fewest demos will answer well. Ask the vendor precisely where the quote time comes from: a static number you configured, a rule based on order count, or something reading live kitchen state. If it is static, set it pessimistically and change it manually on your busiest nights - and treat that fifteen seconds of work as part of the cost of the system.",
    },
    {
      q: "Can it handle multiple locations on one number?",
      a: "Yes, and it is one of the better reasons to use software rather than a host stand. A single line can identify which location the caller wants - by asking, by the number they dialled, or by the area they name - and then answer with that location's hours, menu, parking and reservation book. What it must not do is guess: sending a caller to the wrong location for a 7 p.m. booking is worse than asking one extra question, and the location belongs in every written confirmation.",
    },
    {
      q: "Should I use my POS's own AI instead of a third-party voice agent?",
      a: "Check first, because the answer changes fast. Point-of-sale vendors are actively adding voice ordering partners and native capability, and a product that already holds your live menu, your 86 list and your ticket flow starts with an advantage no third party can buy. The pattern is playing out identically in other trades - in home services, Jobber, Housecall Pro and ServiceTitan all now ship their own AI receptionists. If your POS offers one, evaluate it first: it will be cheaper to integrate and it is one fewer vendor between the phone and the kitchen.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Slang.ai: pricing (Core, Premium, Enterprise)",
    url: "https://www.slang.ai/pricing",
  },
  {
    title: "Slang.ai: integrations and partners (OpenTable, SevenRooms, Tripleseat, Yelp)",
    url: "https://www.slang.ai/integrations",
  },
  {
    title: "Loman: pricing tiers and POS integrations",
    url: "https://loman.ai/pricing",
  },
  {
    title: "ConverseNow: product site, named brands and POS partners",
    url: "https://conversenow.ai/",
  },
  {
    title: "PolyAI: pricing model (per-minute, quoted)",
    url: "https://poly.ai/pricing/",
  },
  {
    title: "Toast: partner directory listing for Incept AI",
    url: "https://pos.toasttab.com/partners/directory/Incept%20AI",
  },
  {
    title:
      "National Restaurant Association: off-premises dining is now essential for restaurant consumers and operators",
    url: "https://restaurant.org/research-and-media/media/press-releases/from-trend-to-transformation-off-premises-dining-now-essential-for-restaurant-consumers,-operators/",
  },
  {
    title: "FDA: Food Allergies - the nine major food allergens",
    url: "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies",
  },
  {
    title: "FDA: sesame added as a major food allergen, 2022 Food Code addition",
    url: "https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/addition-2022-food-code-sesame-added-major-food-allergen",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        The phone in a restaurant rings hardest at exactly the moment nobody can
        pick it up, which is why this category exists and why so much of it is
        sold badly. Search for the best AI phone answering for restaurants and
        you will find lists that compare voices, personalities and setup times -
        none of which is the decision. The decision is whether the call has to
        end as a message, a reservation, or an order sitting in your POS, because
        those are three genuinely different products at three genuinely different
        prices. We make one of the five things on this list, the simplest one,
        which places us last. Here is the ranking anyway, with every published
        price sourced and every missing one named as missing.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Decide the ending before you compare vendors.</Strong> A
            message, a reservation, or a transaction. Products cluster hard
            around those three and barely overlap.
          </>,
          <>
            <Strong>Slang.ai does not connect to a POS.</Strong> Its own
            integrations page lists OpenTable, SevenRooms, Tripleseat and Yelp.
            That is a reservations product, correctly built, wrongly shortlisted
            by pizzerias.
          </>,
          <>
            <Strong>Order-taking is where the prices go quiet.</Strong> The one
            vendor publishing figures is the reservations one. Everybody selling
            POS write-back sells by demo.
          </>,
          <>
            <Strong>Ask about 86&apos;d items and quote times, not
            voices.</Strong> Every product sounds good. Very few handle a
            sold-out special at 7:15 on a Friday.
          </>,
        ]}
      />

      <H2 id="the-ranking">The ranking, in one table</H2>
      <P>
        Ordered for the restaurant most likely to be reading this: one to three
        locations, independent or small group, losing calls during service. A
        forty-unit franchise group should read this table bottom-up.
      </P>
      <Table
        caption="Five restaurant phone products, ranked for an independent (August 2026)"
        head={["#", "Product", "Best when the call ends in", "Published price?"]}
        rows={[
          [
            "1",
            "Loman",
            "An order inside your POS - Toast, Square, Clover, SpotOn, Olo",
            "No",
          ],
          [
            "2",
            "Slang.ai",
            "A reservation or a question - OpenTable, SevenRooms, Yelp, Tripleseat",
            "Yes - $399 and $599/mo per location",
          ],
          [
            "3",
            "ConverseNow",
            "A high-volume QSR order, at franchise scale",
            "No",
          ],
          [
            "4",
            "PolyAI",
            "A custom enterprise flow across more than the phone",
            "No - per-minute, quoted",
          ],
          [
            "5",
            "A general packaged AI receptionist",
            "A message, an answer, or a callback",
            "Yes - typically €99-€299/mo",
          ],
        ]}
      />

      <H2 id="the-fork">Where does the call end?</H2>
      <P>
        This is the whole comparison, and it takes about ninety seconds to answer
        for your own restaurant. Pull up last week and ask what the phone was
        actually for.
      </P>
      <Figure
        src="/blog/restaurant-call-fork.svg"
        alt="A branching diagram showing three endings for a restaurant phone call - a message, which needs no integration; a reservation, which needs write access to OpenTable, SevenRooms, Resy, Yelp or Tripleseat; and a transaction, which needs write access to a POS such as Toast, Square, Clover, SpotOn, Olo, PAR or NCR Aloha plus modifiers, 86'd items, quote times and payment"
        width={1200}
        height={630}
        caption="The voices are all fine now. What separates these products is the write-back at the end of the call - and the further right you go, the fewer vendors publish a price."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        A full-service restaurant with a booking platform sits on the middle
        branch, and most of its phone volume is questions it has answered ten
        thousand times: are you open Monday, do you have parking, can we bring a
        cake, is there a gluten-free option. A pizzeria, a taqueria or a wing
        place sits on the right branch, where every unanswered call is a basket
        that went to the competitor two streets over. Those two restaurants
        should not buy the same product, and both of them will be shown the same
        five names by every listicle on this results page.
      </P>

      <H2 id="call-mix">Seven callers, one line - and the rush</H2>
      <P>
        Whatever picks up your line - a live answering bureau, an AI, or a
        hybrid - is fielding the same seven kinds of caller. Sorting last
        week&apos;s calls into these rows is the fastest way to see which branch
        of the fork you are really on.
      </P>
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
            "Answered instantly from a facts sheet you own. Most of your call volume and none of your staff's attention",
          ],
          [
            "Large party or catering",
            "To feed 30 people on a date, and to be taken seriously",
            "Full capture and a same-day callback from a manager. Never a voicemail",
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
        The commercial weight sits in the first row. The National Restaurant
        Association&apos;s off-premises research found that{" "}
        <Ext href="https://restaurant.org/research-and-media/media/press-releases/from-trend-to-transformation-off-premises-dining-now-essential-for-restaurant-consumers,-operators/">
          roughly three of every four restaurant transactions now happen
          off-premises
        </Ext>{" "}
        - takeout, drive-thru, curbside and delivery. Of the doors an
        off-premises order can come through, the phone is the one with no
        marketplace commission and the one where you keep the guest&apos;s
        number. It is the cheapest order you will take all night, and the one
        most likely to evaporate.
      </P>
      <Callout>
        A host stand can hold exactly one line. During service the second
        simultaneous caller gets a busy tone, a voicemail box they will not use,
        or a hold they will not wait through. Restaurants do not lose calls one
        at a time - they lose them in a clump, in the same twenty minutes, every
        Friday.
      </Callout>
      <P>
        That is why most after-hours framing is slightly wrong for restaurants.
        The problem hours are the two a night when the room is full, and the
        structural advantage of software is concurrency -{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
          answering calls in parallel
        </Internal>{" "}
        matters more here than in almost any other trade. Whichever product you
        choose, start by pointing the busy-line <em>overflow</em> at it during
        service, not your after-hours calls, and read a week of transcripts.
        Most operators are surprised twice: by how many there are, and by how
        many were about parking.
      </P>

      <H2 id="how-we-ranked">How we ranked these - and who we are</H2>
      <OL>
        <LI>
          <Strong>First-party sources only.</Strong> Every figure below is from
          the vendor&apos;s own pricing page, product page or integrations page,
          read in August 2026. Where a vendor does not publish a number, we say
          so instead of borrowing one from another blog. A striking amount of the
          pricing circulating for this category traces back to nobody.
        </LI>
        <LI>
          <Strong>Ranked by fit for an independent, not by size.</Strong>{" "}
          ConverseNow is arguably the most capable product here and it sits
          third, because a two-location bistro cannot buy it and would not want
          to. Fit beats capability every time in a purchase this small.
        </LI>
        <LI>
          <Strong>Write-back outranks voice.</Strong> A product that puts an
          order on the kitchen printer removes work. One that emails you a
          transcript creates a to-do list. Both are marketed with the same
          sentence about never missing a call.
        </LI>
        <LI>
          <Strong>We disclose our own position.</Strong> We sell a general
          packaged AI receptionist. It does not write into a POS or a booking
          platform. That places us fifth, and if you need either, four other
          products here beat ours.
        </LI>
      </OL>

      <H2 id="why-ordering-is-hard">Why phone ordering is the hard one</H2>
      <P>
        It is worth being precise about this, because &quot;takes orders&quot; on
        a feature list conceals five separate engineering problems, each with its
        own way of ruining a Friday.
      </P>
      <UL>
        <LI>
          <Strong>The menu is not a document, it is a live state.</Strong>{" "}
          Prices change, specials appear, a category gets renamed at 4 p.m. An
          agent working from a PDF someone uploaded in March will confidently
          quote a price you no longer charge.
        </LI>
        <LI>
          <Strong>Modifiers are where accuracy actually dies.</Strong> No onions,
          extra cheese, sub fries for salad, half-and-half on a large. A plain
          order is a demo. Three modifiers on one item is the product.
        </LI>
        <LI>
          <Strong>The 86 list changes faster than any integration.</Strong> The
          salmon goes at 7:15. If the agent is still selling it at 7:20, you have
          converted a missed call into a refund and a bad review. Loman lists
          out-of-stock AI menu updates as its own line item on the upper tier,
          which tells you it is a distinct thing that has to be built.
        </LI>
        <LI>
          <Strong>Quote times are a promise, not a field.</Strong> Twenty minutes
          on a Tuesday is fifty on a Friday. Ask whether the number is static,
          rule-based or reading real kitchen state, and set it pessimistically if
          it is the first.
        </LI>
        <LI>
          <Strong>Payment drags in a second compliance surface.</Strong> Taking a
          card over the phone through a voice agent is a different product
          decision from taking a name and charging at pickup. Loman&apos;s upper
          tier lists secure payment over the phone as a separate feature for
          exactly this reason.
        </LI>
      </UL>
      <Callout>
        A demo-call rule that has never once failed us: order the most annoying
        thing on your own menu, with modifiers, ask to change it halfway through,
        and then ask for something you know is sold out. Anyone can take an order
        for a Margherita.
      </Callout>

      <H2 id="reservations">Reservations, large parties and catering</H2>
      <P>
        Reservation calls look like the easy branch and quietly are not, because
        many of them are edits rather than bookings. Whether the agent writes
        into OpenTable or SevenRooms or just takes details, these are the
        behaviours to configure and test:
      </P>
      <UL>
        <LI>
          <Strong>Take the cancellation as gladly as the booking.</Strong> A
          table released at 4 p.m. is a table you resell. A cancellation that
          hits a voicemail box becomes a no-show.
        </LI>
        <LI>
          <Strong>Confirm in writing, always.</Strong> Time, party size, date,
          name, and the one detail that ruins evenings - which location.
        </LI>
        <LI>
          <Strong>Waitlist calls are conversion calls.</Strong> &quot;How long
          is the wait right now?&quot; is somebody deciding between you and
          another restaurant while parked outside. An honest number, said fast,
          wins more of those than an optimistic one.
        </LI>
        <LI>
          <Strong>Special occasions belong in the record.</Strong> Birthday,
          anniversary, high chair, wheelchair access, the regular who always
          sits at 12 - lost every time a call is a scribble on a pad.
        </LI>
        <LI>
          <Strong>Deposit and cancellation policies get said out loud.</Strong>{" "}
          If you hold a card for parties over six, the caller hears it during
          the booking, not in a dispute afterwards.
        </LI>
      </UL>
      <P>
        Large parties and catering are the highest-value calls a restaurant
        receives and the ones most often fumbled, because they arrive at the same
        bad moment as everything else and cannot be resolved in ninety seconds.
        &quot;Can you email us?&quot; loses them: the person planning an office
        lunch is calling three restaurants and books with whoever takes them
        seriously first. No product on this list should quote one - but every one
        of them, including the cheapest, can capture it properly:
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
            "Tells you whether this is a callback in an hour or tomorrow",
          ],
          [
            "Name, mobile, email",
            "Two channels, because this callback actually has to land",
          ],
        ]}
      />
      <P>
        Then set a hard internal rule: large-party enquiries get a human callback
        the same day, with a name attached. Mechanically the booking side is the
        same job as any other appointment flow -{" "}
        <Internal href="/answers/can-an-ai-receptionist-book-appointments">
          how that works end to end
        </Internal>{" "}
        is worth reading, because &quot;we book&quot; can mean anything from a
        live API write to an email somebody retypes.
      </P>

      <H2 id="shortlist">The five, one at a time</H2>

      <H3>1. Loman - built for the branch where the money is</H3>
      <P>
        Loman is the clearest independent-focused answer to the transaction
        branch. Its integration list is POS-first and specific - Toast, Square,
        Clover, SpotOn, Shift4, Aloha by NCR, Olo and Stream - with OpenTable and
        Resy alongside, so it reaches both endings rather than picking one. Its
        pricing page states plainly: no per minute fees, no hidden costs.
      </P>
      <P>
        The tier split tells you more than the marketing does. Starter is
        described as being for basic call management. Premium is for ordering and
        reservations, and the features that appear only there are the hard ones:
        takeout and delivery ordering, complete POS integration, secure payment
        over the phone, out-of-stock AI menu updates, a dynamic upsell engine.
        That is an accurate map of where the difficulty lives.
      </P>
      <Figure
        src="/blog/loman-pricing-tiers.webp"
        alt="Loman's pricing page showing two tiers - Starter, for basic call management, and Premium, for ordering and reservations - both priced 'Contact Us', with the Premium feature list including complete POS integration, secure payment over the phone and out-of-stock AI menu updates"
        width={1290}
        height={879}
        caption="Two tiers, one honest map of the category, and no number on either. The features that separate them are precisely the five hard problems above."
        credit="Screenshot: loman.ai pricing, August 2026"
        creditUrl="https://loman.ai/pricing"
      />
      <P>
        <Strong>The critical read:</Strong> neither tier publishes a price,
        including the basic one, which is a choice. For a single-site restaurant
        that means a sales call before you can even size the decision. And treat
        every accuracy percentage in this category - Loman&apos;s pricing page
        claims 99.6% order accuracy - as a vendor metric measured by the vendor
        on their own definition of an error. It is not a lie; it is simply not
        something you can compare across vendors. Your Tuesday test is worth more
        than the number.
      </P>

      <H3>2. Slang.ai - the transparent one, for the other branch</H3>
      <P>
        Slang.ai is the only product in this comparison that will tell you what
        it costs without a meeting:{" "}
        <Ext href="https://www.slang.ai/pricing">
          Core starting at $399 per month per location and Premium at $599
        </Ext>
        , with enterprise quoted, and a claim that setup takes less than thirty
        minutes. In a category this coy, publishing is worth something on its own.
      </P>
      <P>
        It is also unusually clear about what it is for. Its own description
        covers everything from hours and directions to reservations, promos and
        allergy information, and its integrations page is four logos deep:
        OpenTable, SevenRooms, Tripleseat and Yelp.
      </P>
      <Figure
        src="/blog/slang-ai-integrations.webp"
        alt="Slang AI's integrations and partners page, showing four integrations - OpenTable, Tripleseat, SevenRooms and Yelp - all reservation and event platforms, with no point-of-sale system listed"
        width={1400}
        height={673}
        caption="Four reservation platforms, no POS. This is the single most useful screenshot on this page: it is not a gap in the product, it is the product's definition - and it disqualifies Slang for a restaurant whose calls are orders."
        credit="Screenshot: slang.ai integrations, August 2026"
        creditUrl="https://www.slang.ai/integrations"
      />
      <P>
        <Strong>The critical read:</Strong> $399 per location per month is real
        money for an independent, and you are paying it to deflect questions and
        capture bookings rather than to generate revenue directly. That maths
        works comfortably for a busy full-service room with an expensive host
        stand and a hundred calls a day. It works badly for a forty-cover
        neighbourhood restaurant that gets nine. Count your calls before you
        count the features.
      </P>

      <H3>3. ConverseNow - the one built for scale you probably do not have</H3>
      <P>
        ConverseNow sells voice AI for restaurant ordering to the top of the
        market, and it is not shy about who it works with: its site names Blake&apos;s
        Lotaburger, Denny&apos;s, Domino&apos;s Pizza, Fazoli&apos;s,
        Hardee&apos;s, Jets Pizza and Wingstop. The POS partner list reads like a
        franchise procurement document - Brink POS, Fiserv, Focus, ItsaCheckmate,
        NCR Aloha, Olo, PAR, Qu and Xpient.
      </P>
      <P>
        If you run twenty units with a drive-thru and a franchisor with opinions
        about your tech stack, this is the shape of vendor you want: one that has
        already been through that integration and that certification, and that
        prices per unit at a volume where a point of order accuracy is worth
        seven figures.
      </P>
      <P>
        <Strong>The critical read:</Strong> everything that makes ConverseNow
        right for Wingstop makes it wrong for one restaurant. No published price,
        an enterprise sales motion, and a deployment model that assumes a
        standardised menu across units. A single independent asking for a quote
        here is asking for a procurement cycle in exchange for capability it has
        no way to consume.
      </P>

      <H3>4. PolyAI - a platform that also does restaurants</H3>
      <P>
        PolyAI is a horizontal enterprise voice-agent company covering ten
        verticals - consumer services, financial services, healthcare,
        hospitality, insurance, restaurants, retail, telecoms, travel, utilities -
        with use cases spanning authentication, billing, routing and order
        management as well as bookings. Its pricing page is explicit about the
        model:{" "}
        <Ext href="https://poly.ai/pricing/">
          ongoing use of the voice agent is priced on a per-minute basis
        </Ext>
        , inclusive of maintenance, performance improvements and 24/7 support.
      </P>
      <P>
        Per-minute is an honest meter and a demanding one. It means a busy month
        costs more, which is correct in principle and unpleasant when it arrives
        in a quarter you already budgeted. It also means the vendor is exposed to
        their own inefficiency, which is a good incentive.
      </P>
      <P>
        <Strong>The critical read:</Strong> a hospitality group with a contact
        centre and a brand voice worth designing should absolutely talk to them.
        A restaurant should not, for the same reason it should not hire an
        architect to hang a shelf. The build-versus-buy version of this argument,
        with the platform vendors, is in{" "}
        <Internal href="/blog/twilio-vs-dialpad-vs-freshworks-vs-eliseai">
          Twilio vs Dialpad vs Freshworks vs EliseAI
        </Internal>
        .
      </P>

      <H3>5. A general packaged AI receptionist - including ours</H3>
      <P>
        Last, and honestly last: a general AI receptionist answers with your
        greeting, knows your hours, menu highlights, allergen policy, parking and
        booking policy, handles large-party and private-hire enquiries by taking
        details, transfers a complaint to a human, and puts a transcript of every
        call in your inbox. Flat monthly - ours is{" "}
        <Internal href="/pricing">€99 or €299 a month</Internal> - live the same
        day, cancellable.
      </P>
      <P>
        For a large share of independents this is the correctly sized purchase,
        because their phone problem is not lost orders. It is that four people a
        night ring during service to ask something already on the website, and
        one of them was a twelve-top. Deflect the four, capture the one, and stop
        paying a per-location fee for a POS integration you were never going to
        use.
      </P>
      <P>
        <Strong>The critical read, on ourselves:</Strong> if your calls are
        orders, we are the wrong product and so is any other general receptionist,
        whatever its home page implies about restaurants. An order that arrives as
        an email is not an order - it is a second job for whoever reads the email.
        Buy Loman, or check your POS directory first. Toast&apos;s own listing for
        Incept AI describes the arrangement precisely:{" "}
        <Ext href="https://pos.toasttab.com/partners/directory/Incept%20AI">
          your Toast menu is ingested into Incept AI, and when it takes an order
          it is automatically pushed to the Toast POS and any KDSes
        </Ext>
        . That is what a real POS integration reads like, in the POS
        vendor&apos;s own words, and going through the directory is usually the
        cheapest route to one.
      </P>

      <H2 id="pricing">What each one actually costs</H2>
      <Table
        caption="Published pricing as of August 2026 - confirm before buying"
        head={["Product", "What the vendor publishes", "What to expect"]}
        rows={[
          [
            "Slang.ai",
            "Core from $399/mo, Premium from $599/mo per location; Enterprise custom. CAD and AUD rates listed.",
            "Per location, monthly, with named reservation integrations. No POS.",
          ],
          [
            "Loman",
            "Nothing. Starter and Premium both say Contact Us. States no per-minute fees.",
            "A sales call before a number. Ordering features sit on the upper tier.",
          ],
          [
            "ConverseNow",
            "Nothing.",
            "Enterprise, per-unit, franchise procurement. Not sold to single sites.",
          ],
          [
            "PolyAI",
            "Per-minute for ongoing use; rate quoted after a demo.",
            "Usage meter, so the bill moves with your volume. Enterprise motion.",
          ],
          [
            "General packaged AI receptionist",
            "Flat monthly, publicly listed. Ours is €99 (1,000 min) or €299 (3,000 min), €0.09 per extra minute.",
            "Month to month, same-day setup, no POS or booking write-back.",
          ],
        ]}
      />
      <P>
        Before comparing any of these to each other, compare them to the thing
        they replace. A missed call at a restaurant is not a lost enquiry, it is
        a lost basket with a known average value, and it is one of the few
        industries where the arithmetic is genuinely easy to do -{" "}
        <Internal href="/blog/cost-of-a-missed-call">
          the method is here
        </Internal>
        . Run it on last month before you read another feature list.
      </P>

      <H2 id="allergens">The two sentences that must never be automated</H2>
      <P>
        Restaurants carry a specific liability that dentists and plumbers do not,
        and it is worth writing the rule down before you configure anything.
      </P>
      <P>
        <Strong>An AI must never confirm that a dish is safe for an
        allergy.</Strong> Not &quot;it&apos;s gluten-free&quot;, not
        &quot;there&apos;s no nuts in that&quot;. Kitchens cross-contaminate,
        recipes change, and a model repeating a menu tag as a safety assurance is
        the worst possible failure mode this software has. The correct behaviour
        is to state what the menu says, then hand the call to a person or take a
        number for the manager. Slang.ai&apos;s own product description mentions
        handling allergy information, which is fine as information and dangerous
        as assurance - make sure your configuration knows the difference.
      </P>
      <P>
        The list the script should recognise and escalate on is the FDA&apos;s{" "}
        <Ext href="https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies">
          nine major food allergens - milk, eggs, fish, crustacean shellfish,
          tree nuts, peanuts, wheat, soybeans and sesame
        </Ext>
        , with{" "}
        <Ext href="https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/addition-2022-food-code-sesame-added-major-food-allergen">
          sesame the most recent addition, folded into the 2022 Food Code
        </Ext>
        . Within that, the script has exactly three permitted moves:
      </P>
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
        . This is not a reason to keep humans on the phone - an underslept host
        improvises reassurance far more often than a script does. It is a reason
        to write the boundary down and test it, whoever is answering.
      </Callout>
      <P>
        <Strong>An AI must never promise a time it cannot see.</Strong> That
        applies to a table at 8 and to a pickup at 7:30 equally. If the agent
        cannot read live state, it should quote a range, err long, and say it is
        approximate.
      </P>
      <P>
        Alongside those two: have the agent say it is AI in its first sentence.
        Guests forgive a robot that says it is a robot and they do not forgive
        one that pretends. And route complaints to a human immediately - nobody
        who is already annoyed wants to explain themselves twice.
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <P>
        Three calls worth modelling, whichever product you buy. Keep them short;
        long scripts are where agents and tired hosts both go wrong.
      </P>
      <H3>Friday 7:41 p.m., pickup order, third simultaneous caller</H3>
      <Callout>
        &quot;Thanks for calling - are you ordering for pickup? ... Great, go
        ahead. ... Two carnitas tacos, the half chicken, and a side of rice. The
        half chicken is about a twenty-five minute cook tonight, so I&apos;d say
        ready at 8:10. Anything to drink? ... That&apos;s $47.20. I&apos;ll text
        you the confirmation and the pickup time to this number - is this the
        best one? ... Perfect, see you at 8:10.&quot;
      </Callout>
      <P>
        If your system cannot take that order into the POS, the honest
        alternatives are capturing it and reading it back to the kitchen line, or
        texting the caller your direct ordering link. All three are defensible;
        ambiguity is not, because the caller acts on whatever they think
        happened.
      </P>
      <H3>The allergy call, handled correctly</H3>
      <Callout>
        &quot;I can tell you exactly what&apos;s in it - the pesto has pine nuts
        and parmesan, and the pasta itself contains wheat. What I can&apos;t
        tell you from here is whether it stays clear of the shellfish in the
        kitchen, because that depends on the line tonight. Let me flag it on
        your reservation and have the manager call you back before you come in -
        what&apos;s the best number?&quot;
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
      <P>
        Illness reports sit on a short always-human list with complaints,
        refunds, press, health department and licensing calls, and the regular
        whose relationship is the product - route known numbers to a person on
        purpose. Write that list before launch, not after the first bad
        transcript. The craft of writing bounded instructions like these is in{" "}
        <Internal href="/blog/ai-receptionist-prompts">
          our guide to AI receptionist prompts
        </Internal>
        .
      </P>

      <H2 id="test">A test you can run during a slow Tuesday</H2>
      <OL>
        <LI>
          <Strong>Order your most-modified item.</Strong> Three changes,
          minimum. Then change your mind about one of them mid-sentence.
        </LI>
        <LI>
          <Strong>Order something you know is 86&apos;d.</Strong> If it takes the
          order, the demo is over.
        </LI>
        <LI>
          <Strong>Ask how long for pickup.</Strong> Then ask where that number
          came from. The vendor should be able to answer even if the agent cannot.
        </LI>
        <LI>
          <Strong>Ask an allergy question.</Strong> Anything other than
          careful deferral is a fail, no matter how confident it sounds.
        </LI>
        <LI>
          <Strong>Ask for a table for fourteen on Saturday.</Strong> Large
          parties are a human decision in almost every restaurant. Does it know
          that?
        </LI>
        <LI>
          <Strong>Talk over it.</Strong> Interrupt the greeting the way a real
          caller in a car does.
        </LI>
        <LI>
          <Strong>Then go and look.</Strong> Did the ticket print? Did the
          booking appear in OpenTable? Everything before this step is theatre.
        </LI>
      </OL>
      <P>
        We run the same ranking for two other trades where the system of record
        is completely different -{" "}
        <Internal href="/blog/best-ai-receptionist-for-dental-practices">
          dental practices, where it is Dentrix or Open Dental
        </Internal>
        , and{" "}
        <Internal href="/blog/best-ai-receptionist-for-home-services">
          home services, where the platform vendors now ship their own agent
        </Internal>
        .
      </P>

      <H2 id="not-for-you">When none of these is the answer</H2>
      <UL>
        <LI>
          <Strong>Your POS already offers one.</Strong> Check before you shop.
          The vendor holding your live menu and your ticket flow starts with an
          advantage no third party can buy, and the same pattern has already
          played out in the trades, where{" "}
          <Internal href="/blog/best-ai-receptionist-for-home-services">
            Jobber, Housecall Pro and ServiceTitan all now ship their own
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Your phone volume is nine calls a day.</Strong> At that level
          almost any of these is more expensive than the problem. An answering
          machine with a good message and a text-back does most of the work.
        </LI>
        <LI>
          <Strong>Your real problem is online ordering adoption.</Strong> If
          eighty per cent of your phone orders would happily have been placed
          online, a QR code on the door and a link in your Google profile is a
          cheaper fix than a voice agent.
        </LI>
        <LI>
          <Strong>Nobody owns the menu updates.</Strong> Every product here is
          exactly as accurate as what you last loaded. If your specials change
          weekly and nobody has fifteen minutes to keep it current, you are
          buying a machine that will confidently sell last week&apos;s menu.
        </LI>
      </UL>
      <P>
        If what you need is the simple version - the phone answered properly
        during service, questions handled, the twelve-top captured, a transcript
        in your inbox - that is the narrow problem we built for. Write the facts
        sheet first (hours by day, holiday hours, entrance, parking, patio,
        dogs, kids, corkage, dress code, private room capacity, accessibility),
        use the{" "}
        <Internal href="#scripts">scripts above</Internal> as the starting
        point, and keep the number on your listings -{" "}
        <Internal href="/blog/how-to-forward-calls-to-an-answering-service">
          forwarding takes minutes
        </Internal>
        . If you run several rooms,{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-locations">
          multi-location handling
        </Internal>{" "}
        is the part to get right before launch, and the{" "}
        <Internal href="/restaurants">restaurants page</Internal> covers our
        setup.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
