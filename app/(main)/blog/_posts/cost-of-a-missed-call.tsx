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
  slug: "cost-of-a-missed-call",
  title: "How Much Does a Missed Call Cost Your Business?",
  description:
    "What do missed calls cost a small business? A missed call isn't a zero - it's a lead dialling your competitor. Put a real dollar figure on yours, and the cheapest fix.",
  date: "2026-07-13",
  updated: "2026-07-21",
  readingTime: "11 min read",
  tag: "Guides",
  hero: "/blog/cost-of-a-missed-call-hero.webp",
  heroAlt:
    "A matte-black desk phone sitting unanswered on a small-business reception desk beside an empty chair in warm end-of-day light",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "cost of a missed call",
    "how much does a missed call cost",
    "missed calls cost small business",
    "missed calls small business",
    "receptionist services for missed calls",
    "missed call revenue loss",
    "how much revenue do missed calls cost",
    "stop missing business calls",
    "missed call statistics",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "the-formula", title: "The formula to price your own miss" },
    { id: "worked-example", title: "A worked example" },
    { id: "why-a-miss-is-not-zero", title: "Why a missed call isn't a zero" },
    { id: "hidden-costs", title: "The costs that don't show on the P&L" },
    { id: "where-they-hide", title: "Where your missed calls are hiding" },
    { id: "the-fix", title: "The cheapest way to stop missing them" },
    { id: "bottom-line", title: "The bottom line" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "How much does a missed call cost a small business?",
      a: "There's no single number - it depends entirely on what one new customer is worth to you. The honest way to calculate it: multiply your average customer value by your booking rate by the share of missed calls that never call back. A dental practice where a new patient is worth $600 loses far more per missed call than a coffee shop. For many appointment-based local businesses, a single missed new-customer call works out to somewhere between $100 and $1,000+ in expected lost revenue once you account for lifetime value. The point isn't the exact figure; it's that a missed call is almost never worth $0.",
    },
    {
      q: "Do people call back if you miss their call?",
      a: "Often they don't. A caller who reaches voicemail or endless ringing will frequently just hang up and dial the next business on their search results, especially for urgent or commodity services where any provider will do. Some regulars and high-intent buyers will try again, but a large share of first-time callers treat one unanswered ring as a signal to move on. That's why the real cost of a missed call is driven by callers who never give you a second chance.",
    },
    {
      q: "What percentage of calls do small businesses miss?",
      a: "It varies widely by industry and staffing, but many small businesses miss a meaningful chunk of inbound calls - the phone rings during another call, at lunch, after hours, on weekends, or while the one person who answers is with a customer. Rather than trust a generic percentage, pull your own phone records for a month and count the calls that went unanswered or straight to voicemail. Most owners are surprised by how many there are, and by how many came from numbers they never heard from again.",
    },
    {
      q: "Is it cheaper to hire someone or use an AI receptionist to catch missed calls?",
      a: "For catching overflow, after-hours, and weekend calls, an AI receptionist is almost always cheaper, because you're not paying a salary to sit idle during quiet stretches. A full-time receptionist runs tens of thousands of dollars a year and still only covers staffed hours; AI answering runs a flat monthly fee (commonly $30-$300) and covers every hour. Many businesses keep their human for daytime, relationship-heavy calls and use AI for exactly the overflow and after-hours calls that were being missed.",
    },
    {
      q: "How do I calculate the ROI of answering more calls?",
      a: "Start with the cost of the miss: (average customer value) x (your booking rate) x (missed calls per month) x (share that never call back). That's your monthly bleed. Then compare it to the flat cost of answering those calls. If you're a home-services business missing even a handful of new-job calls a month, the recovered revenue usually dwarfs the cost of an answering solution by an order of magnitude - which is why 'just answer the phone' is one of the highest-ROI fixes a local business has.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "Harvard Business Review: The Short Life of Online Sales Leads (lead response-time research by James Oldroyd)",
    url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  },
  {
    title:
      "U.S. Bureau of Labor Statistics: Receptionists, Occupational Outlook Handbook (median pay)",
    url: "https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        &quot;A missed call is just a missed call&quot; is the quiet assumption
        that costs local businesses the most money. It treats a ring-out as a
        zero, when in reality it&apos;s a customer with their wallet open who
        just dialled someone else. We build AI phone agents, so read us as an
        interested party - but the math below is yours to run, with your own
        numbers, and it usually lands somewhere that stings.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            A missed call is <Strong>rarely worth $0</Strong>. Its real cost is
            your average customer value times your booking rate times the share
            of callers who <em>never call back</em>.
          </>,
          <>
            The expensive part isn&apos;t the one call - it&apos;s that most
            first-time callers who hit voicemail{" "}
            <Strong>dial your competitor</Strong> instead of trying again.
          </>,
          <>
            Speed is the hidden variable. Research on sales leads shows the odds
            of converting <Strong>collapse within minutes</Strong> of the first
            attempt, so &quot;we&apos;ll call them back tomorrow&quot; is often
            already too late.
          </>,
          <>
            The cheapest fix isn&apos;t a new hire - it&apos;s making sure{" "}
            <Strong>something answers every call</Strong>, on the first ring,
            including nights, weekends, and your Monday rush.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        There is no universal dollar figure, and any vendor who gives you one
        without asking about your business is selling, not calculating. The
        honest answer is a formula: a missed call costs you your{" "}
        <Strong>average customer value</Strong>, discounted by how likely that
        call was to book and how likely the caller was to simply give up and go
        elsewhere. For a barber, one missed call might be a $30 haircut. For a
        law firm or an HVAC contractor, a single missed new-client call can be
        hundreds or thousands of dollars in lifetime value. The mistake almost
        everyone makes is filing the whole thing under &quot;$0, they&apos;ll
        call back&quot; - because a good share of them won&apos;t.
      </P>

      <H2 id="the-formula">The formula to price your own miss</H2>
      <P>
        Skip the scary industry averages and price <em>your</em> missed call.
        You need four numbers, and you can pull all of them from things you
        already know:
      </P>
      <Table
        caption="The four inputs to your cost-per-missed-call"
        head={["Input", "What it means", "How to estimate it"]}
        rows={[
          [
            "Average customer value",
            "What a new customer is worth to you - ideally over their lifetime, not just the first visit",
            "First-sale value x how many times a typical customer returns",
          ],
          [
            "Booking rate",
            "The share of answered new-customer calls that turn into a booking or sale",
            "Gut-check it, or count a week of answered calls and how many booked",
          ],
          [
            "Missed calls / month",
            "Calls that rang out, hit voicemail, or were abandoned",
            "Pull your phone or carrier call log for the last 30 days",
          ],
          [
            "No-callback share",
            "The share of missed callers who never try you again",
            "Conservative default: assume at least half never call back",
          ],
        ]}
      />
      <P>
        Multiply them together and you get a monthly number:{" "}
        <Strong>
          average customer value x booking rate x missed calls x no-callback
          share
        </Strong>
        . That&apos;s your monthly missed-call bleed - the revenue that walked
        because nobody picked up. It is almost always a bigger number than the
        cost of fixing it, which is the entire point of this article.
      </P>
      <Callout>
        Use <em>lifetime</em> value, not the first ticket. A dental patient
        isn&apos;t worth one cleaning; they&apos;re worth years of cleanings,
        the occasional crown, and the family members they refer. Pricing a
        missed call at the first-visit value is how businesses talk themselves
        into ignoring the phone.
      </Callout>
      <P>
        If you&apos;d rather not do the arithmetic by hand, the{" "}
        <Internal href="/missed-call-calculator">missed call calculator</Internal>{" "}
        runs exactly this formula with your numbers in it, and shows each step
        so you can see where the figure comes from rather than taking it on
        faith.
      </P>

      <H2 id="worked-example">A worked example</H2>
      <P>
        Numbers make it concrete. Take a two-van plumbing company. Say an
        average new job is worth <Strong>$450</Strong>, and a typical customer
        comes back and refers enough that lifetime value is closer to{" "}
        <Strong>$1,200</Strong>. Of the new-customer calls they actually answer,
        about <Strong>60%</Strong> turn into a booked job. They&apos;re a small
        team, so they miss roughly <Strong>30 calls a month</Strong> - the phone
        rings while they&apos;re under a sink, at lunch, or after 6&nbsp;p.m. Assume,
        conservatively, that half of those missed callers{" "}
        <Strong>never call back</Strong> because a burst pipe won&apos;t wait.
      </P>
      <Table
        caption="One plumbing company's monthly missed-call cost, two ways to count it"
        head={["Method", "Calculation", "Monthly cost"]}
        rows={[
          [
            "First-job value",
            "$450 x 60% x 30 x 50%",
            "~$4,050",
          ],
          [
            "Lifetime value",
            "$1,200 x 60% x 30 x 50%",
            "~$10,800",
          ],
        ]}
      />
      <P>
        Even the conservative, first-job-only version is over{" "}
        <Strong>$4,000 a month</Strong> walking out the door - and that&apos;s
        before you count the referrals those customers would have brought. Run
        the same formula for a business where the first ticket is $30 and the
        answer is much smaller; run it for one where a new client is worth
        $5,000 and it becomes an emergency. The formula doesn&apos;t care about
        industry averages. It cares about your numbers, and yours are the only
        ones that matter.
      </P>

      <H2 id="why-a-miss-is-not-zero">Why a missed call isn&apos;t a zero</H2>
      <P>
        The whole cost hinges on one behaviour: what people do when you
        don&apos;t answer. And the uncomfortable truth is that a modern caller,
        looking at a screen full of search results, treats an unanswered ring as
        a reason to tap the next listing. They are not personally invested in
        you yet. You were a search result, and one ring-out demoted you.
      </P>
      <Figure
        src="/blog/missed-call-leak.svg"
        alt="Flow diagram: a phone rings, goes unanswered, the caller hangs up without leaving a message, then dials a competitor who answers and closes the sale"
        width={1200}
        height={630}
        caption="The path of a missed call. The only step that has to change is the second one - something answering on the first ring - and the whole chain to your competitor never starts."
      />
      <P>
        Two forces make this worse than it sounds. First,{" "}
        <Strong>most people don&apos;t leave voicemails anymore</Strong>. A
        voicemail is a callback you have to wait for; dialling the next business
        is an answer you get now. So the miss usually doesn&apos;t even leave you
        a trace to follow up on - it just vanishes.
      </P>
      <P>
        Second, <Strong>speed decides everything</Strong>, and &quot;we&apos;ll
        ring them back later&quot; loses to whoever picks up first. Classic
        research on inbound sales leads, popularised by{" "}
        <Ext href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads">
          Harvard Business Review&apos;s write-up of James Oldroyd&apos;s study
        </Ext>
        , found that the odds of qualifying a lead drop off dramatically when
        the response comes in an hour rather than within minutes - the contact
        gets far harder to reach and far less interested with every passing
        minute. A phone call is the most time-sensitive lead there is: the
        person is holding the phone <em>right now</em>. Miss that moment and you
        aren&apos;t deferring the revenue, you&apos;re usually forfeiting it.
      </P>

      <H2 id="hidden-costs">The costs that don&apos;t show on the P&amp;L</H2>
      <P>
        The lost booking is the obvious line item. Three quieter costs ride
        along with it, and together they often exceed the first sale:
      </P>
      <UL>
        <LI>
          <Strong>Lifetime value, not one ticket.</Strong> Every missed
          first-time caller is a relationship that never started - the repeat
          visits, the upsells, and the word-of-mouth referrals all evaporate
          with the one call.
        </LI>
        <LI>
          <Strong>Wasted marketing spend.</Strong> You paid for that ring. Ads,
          SEO, the truck wrap, the sign - all of it exists to make the phone
          ring, and a missed call is that budget landing in a competitor&apos;s
          pocket. It quietly wrecks your true cost-per-lead.
        </LI>
        <LI>
          <Strong>Reputation and reviews.</Strong> A caller who can never reach
          you doesn&apos;t just leave - some of them say so publicly. &quot;Tried
          calling three times, no one answered&quot; is a review that costs you
          the <em>next</em> caller too.
        </LI>
        <LI>
          <Strong>Your own attention.</Strong> The missed call you do notice
          becomes a nagging callback task, usually attempted too late, that
          pulls you off the job you&apos;re actually being paid for.
        </LI>
      </UL>

      <H2 id="where-they-hide">Where your missed calls are actually hiding</H2>
      <P>
        Before you fix anything, find out when you&apos;re bleeding. Missed calls
        cluster in predictable places, and most owners underestimate every one
        of them:
      </P>
      <Table
        caption="The usual sources of missed calls"
        head={["When", "Why the call gets missed", "How often it's underestimated"]}
        rows={[
          [
            "After hours & weekends",
            "The office is closed; the call goes to voicemail or nothing",
            "Badly - a large share of consumer calls come outside 9-5",
          ],
          [
            "The Monday / lunchtime rush",
            "Every line is busy; the one person answering is already on a call",
            "Badly - your busiest hour is when you drop the most calls",
          ],
          [
            "On the job / with a customer",
            "The person who answers is a plumber, dentist, or stylist mid-task",
            "Constantly - you literally can't hear it ring",
          ],
          [
            "Second simultaneous call",
            "Two people call at once; one wins, one rings out",
            "Invisible - it never shows as a 'missed call' to a human",
          ],
        ]}
      />
      <P>
        The fix for the after-hours slice specifically is its own topic - we go
        deep on it in{" "}
        <Internal href="/blog/after-hours-answering-service">
          the after-hours answering guide
        </Internal>{" "}
        - but the pattern is the same everywhere: the calls you miss are the
        ones a busy human was never going to catch.
      </P>

      <H2 id="the-fix">The cheapest way to stop missing them</H2>
      <P>
        Once you&apos;ve priced the miss, the fix has to be measured against that
        number, not against zero. There are four honest options, roughly in
        order of cost:
      </P>
      <OL>
        <LI>
          <Strong>Voicemail.</Strong> Free, and the weakest option. It only
          &quot;catches&quot; a call if the person leaves a message, and most
          won&apos;t. It&apos;s a record of lost revenue, not a recovery of it.
        </LI>
        <LI>
          <Strong>An answering service.</Strong> A call centre takes a message
          in your name. Better than voicemail, but it usually can&apos;t book
          your calendar, and per-minute pricing gets expensive fast. We compared
          it to the alternatives in our{" "}
          <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
            answering service vs. receptionist breakdown
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Hire another person.</Strong> The gold standard for daytime,
          relationship-heavy calls, and the most expensive - a full-time
          receptionist runs about $37,000 a year before benefits, per the{" "}
          <Ext href="https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm">
            Bureau of Labor Statistics
          </Ext>
          , and still only covers staffed hours. You&apos;re paying a salary to
          sit idle through the quiet stretches.
        </LI>
        <LI>
          <Strong>An AI receptionist.</Strong> Software answers every call on the
          first ring, books directly on your calendar, takes a structured
          message, and texts you a summary - 24/7, in parallel, for a flat
          monthly fee that doesn&apos;t spike when you get busy. It&apos;s the
          natural fit for exactly the overflow, after-hours, and second-line
          calls that were being missed, which is the whole cost we just
          calculated.
        </LI>
      </OL>
      <Callout>
        You don&apos;t have to choose one. The highest-ROI setup for most local
        businesses is a human for the daytime calls that need a relationship, and
        an AI catching everything the human can&apos;t get to - the nights, the
        weekends, and the second call that comes in while they&apos;re already on
        the phone.
      </Callout>
      <P>
        Whatever you pick, judge it against your missed-call bleed. If the
        plumbing company above spends a flat monthly fee to recover even a third
        of that $4,000, the maths isn&apos;t close. For a fuller buyer&apos;s
        checklist - integrations, escalation, and the pricing traps to avoid -
        see our guide to{" "}
        <Internal href="/blog/how-to-choose-an-ai-receptionist">
          choosing an AI receptionist
        </Internal>
        .
      </P>

      <H2 id="bottom-line">The bottom line</H2>
      <P>
        The cost of a missed call isn&apos;t a mystery and it isn&apos;t zero.
        It&apos;s a number you can calculate tonight from your own phone log and
        your own customer value, and for most appointment-based businesses
        it&apos;s uncomfortably large - because a missed call isn&apos;t a
        deferred sale, it&apos;s usually a sale that went to whoever answered.
        The good news is that it&apos;s also one of the most fixable problems a
        business has. You don&apos;t need more leads; you need to stop dropping
        the ones already dialling your number.
      </P>
      <P>
        Run the formula on your last thirty days. If the answer bothers you, the
        cheapest response is simply to make sure something always picks up. You
        can{" "}
        <Internal href="/">hear our AI receptionist</Internal> answer a call
        right now and check the{" "}
        <Internal href="/pricing">flat monthly pricing</Internal> against the
        number you just calculated - that comparison is the only sales pitch
        that matters.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
