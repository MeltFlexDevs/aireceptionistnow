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
  slug: "best-ai-receptionist-for-dental-practices",
  title: "Best AI Receptionist for Dental Practices (2026)",
  description:
    "Five dental AI phone products ranked by what they can actually write into your practice management system - plus what a dental answering service costs, how after-hours and emergency calls should be handled, and the scripts.",
  date: "2026-08-25",
  updated: "2026-10-04",
  readingTime: "21 min read",
  tag: "Guides",
  hero: "/blog/dental-front-desk-phone-hero.webp",
  heroAlt:
    "An empty dental practice reception counter at the start of the day, with a desk phone in its cradle, a closed appointment folder and the treatment corridor blurred behind",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "dental ai receptionist",
    "ai receptionist for dentists",
    "dental answering service",
    "dental answering service cost",
    "ai answering service for dentists",
    "after-hours dental answering service",
    "hipaa dental answering service",
    "best ai dental receptionist",
    "ai receptionist for dental practice",
    "dental ai phone answering",
    "ai answering service for dental office",
    "arini alternative",
    "dentina vs arini vs weave",
  ],
  sections: [
    { id: "the-ranking", title: "The ranking, in one table" },
    { id: "how-we-ranked", title: "How we ranked these - and who we are" },
    { id: "the-real-criterion", title: "Why voice quality is the wrong test" },
    { id: "the-gate", title: "The gate nobody in the SERP mentions" },
    { id: "shortlist", title: "The five, one at a time" },
    { id: "pricing", title: "What each one actually costs" },
    { id: "after-hours", title: "After hours and emergencies" },
    { id: "scripts", title: "What good calls sound like" },
    { id: "hipaa", title: "The BAA conversation, before the demo" },
    { id: "test", title: "A fifteen-minute test that settles it" },
    { id: "not-for-you", title: "When none of these is the answer" },
    { id: "faq", title: "FAQ" },
  ],
  itemList: [
    {
      name: "Dentina",
      description:
        "Best when you want a published price and a named practice management system before you take a demo. Standard Inbound from $299/mo and Premium Inbound from $399/mo per location, billed annually, with a 30-day trial.",
      url: "https://dentina.ai/",
    },
    {
      name: "Weave AI Receptionist",
      description:
        "Best when Weave is already your phone system and patient messaging. Bought TrueLark for $35 million in May 2025 and folded it into the platform. No published price.",
      url: "https://www.getweave.com/ai/",
    },
    {
      name: "Arini",
      description:
        "Best for DSOs and multi-location groups that will run a real procurement process. Demo-led, no published price, and no practice management system named on its own product page as of August 2026.",
      url: "https://www.arini.ai/",
    },
    {
      name: "Peerlogic",
      description:
        "Best when the problem is what your human front desk does with calls it already answers, rather than the calls nobody picks up. Conversational analytics first, AI answering second.",
      url: "https://www.peerlogic.com/",
    },
    {
      name: "A general packaged AI receptionist",
      description:
        "Best when the phone simply needs answering after hours and the practice management write-back is not the point. Flat monthly pricing, live the same day, calendar-level integrations only.",
      url: "https://aireceptionistnow.com/pricing",
    },
  ],
  faqs: [
    {
      q: "What is the best AI receptionist for a dental practice?",
      a: "There is no single best one, because the products differ far more in what they can write into your practice management system than in how they sound. If you want a published price and a named PMS list before you take a demo, Dentina is the most legible option on the market. If Weave is already your phone system, the Weave AI Receptionist is the smallest decision you can make. If you run a DSO with a procurement process, Arini is built for that shape of buyer. If your front desk answers the phone but converts badly, Peerlogic is solving a different problem and solving it better. And if you only need the phone answered after hours, a general packaged AI receptionist costs a fraction of all of them.",
    },
    {
      q: "Does a dental AI receptionist integrate with Dentrix or Open Dental?",
      a: "Some do, and the word 'integrate' is doing an enormous amount of work in that sentence. Both systems gate third-party access behind a real programme. Open Dental requires the developer to request a Developer API Key from vendor relations, supplying a billing address and a list of the exact permissions they need, then generate a per-office Customer API Key - and the practice must run the eConnector and tick Enabled in API Setup. Dentrix goes further: the Dentrix Developer Program charges a one-time $5,000 registration fee for read access and a further $5,000 for write, and Henry Schein One's API Exchange states that all integrated software vendors are SOC 2 Type II and OAuth 2.0 certified. So ask any vendor two questions in writing: which of my systems, and read or write? A nightly one-way export is an integration too, and it will never book anything.",
    },
    {
      q: "How much does a dental answering service cost?",
      a: "It depends on which kind. Among dental AI products, Dentina publishes the clearest numbers: Standard Inbound starting at $299 per month and Premium Inbound starting at $399 per month, billed annually per location, with a 30-day free trial. Arini, Weave and Peerlogic all sell through a demo request rather than a price page, which usually signals per-location quotes and an annual contract. A general packaged AI receptionist that does not touch your PMS runs roughly €99-€299 per month. Live human answering services usually bill per minute or per call on top of a base plan, so the bill rises with exactly the busy weeks you bought it for. The gap between the AI numbers is not margin - it is the cost of writing into dental software.",
    },
    {
      q: "Can an AI receptionist book a dental appointment correctly?",
      a: "Booking a dental appointment is five decisions, not one: what the visit is, how long that procedure takes, whether it belongs in the hygiene column or the doctor's, which operatory is free at that time, and whether the plan is active. A voice agent that cannot read your practice management system is guessing at four of them, and the failure mode is not a rude call - it is two patients arriving for one chair, or a crown seat booked into a 30-minute hygiene slot. Ask a vendor which of the five it reads and which it assumes.",
    },
    {
      q: "Does an AI answer dental calls after hours?",
      a: "Yes - after hours and lunch are where an AI receptionist earns its keep, because those are the windows patients are free to call and nobody is at the desk. After hours it should capture the patient (new or existing, reason for the visit, insurance carrier, callback number), book or request the visit depending on whether it can write into your practice management system, and send a summary for the morning huddle. For emergencies it should triage by rules you set, never diagnose: a knocked-out tooth pages the on-call dentist straight away, and facial swelling that affects breathing or swallowing, uncontrolled bleeding or trauma gets a hard stop - call 911 or go to the ER now - followed by an escalation to a person.",
    },
    {
      q: "Is a dental AI receptionist HIPAA compliant?",
      a: "The product is not the unit of compliance - the arrangement is. A vendor that receives patient names, phone numbers, appointment reasons or call recordings on your behalf is a business associate under 45 CFR 160.103, and you need a signed business associate agreement before it takes a single live call. Ask for the BAA as a document, not a reassurance, and read what it says about call recordings: how long they are retained, whether they are used to train models, and what happens to them when you leave. A vendor that cannot produce a BAA on request is not ready to answer a dental phone.",
    },
    {
      q: "Should I use an AI receptionist or hire a second front desk person?",
      a: "They fail in opposite directions, so the question is which failure you can live with. A person handles the distressed patient, the insurance argument and the walk-in standing at the counter far better than any model, and costs the same whether the phone rings or not. An AI answers at 9 p.m., at lunch and when three lines ring at once, never gets pulled away by a patient at the desk, and is useless at judgement. Most practices we speak to are not short of daytime capacity - they are losing the after-hours and lunchtime calls entirely, which is the narrow problem this software actually solves.",
    },
    {
      q: "What about DSOs and multi-location groups?",
      a: "Multi-location changes the maths in three ways. Per-location pricing turns a $299 decision into a five-figure annual line. API fees are per location too - the Dentrix Ascend API is $47 per location per month on top of a $5,000 one-time registration fee, so a fifteen-practice group is paying fifteen times. And the interesting requirement stops being 'answer the phone' and becomes routing: which location, which provider, which of your two hygiene schedules. That is genuinely enterprise software, and it is where a vertical vendor with a real DSO deployment history earns the premium a single practice should refuse to pay.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Open Dental: API Developer Setup (developer key, customer key, eConnector)",
    url: "https://www.opendental.com/site/apisetup.html",
  },
  {
    title: "Henry Schein One: API Exchange for practices (SOC 2 Type II, OAuth 2.0)",
    url: "https://www.henryscheinone.com/dental-solutions/api-exchange/api-exchange-practices/",
  },
  {
    title:
      "Dentrix Developer Program: FAQ (registration fees for read and write, Ascend per-location fee)",
    url: "https://ddp.dentrix.com/pages/faq",
  },
  {
    title: "Dentina: pricing and named practice management systems",
    url: "https://dentina.ai/",
  },
  {
    title: "Weave: AI Receptionist product page",
    url: "https://www.getweave.com/ai/",
  },
  {
    title:
      "Businesswire: Weave Communications to acquire TrueLark for $35 million (5 May 2025)",
    url: "https://www.businesswire.com/news/home/20250505777895/en/Weave-Communications-to-Acquire-TrueLark-Accelerating-AI-Powered-Front-Office-Automation",
  },
  {
    title: "Arini: product site",
    url: "https://www.arini.ai/",
  },
  {
    title: "Peerlogic: product site",
    url: "https://www.peerlogic.com/",
  },
  {
    title:
      "45 CFR 160.103 - definition of business associate (HIPAA administrative requirements)",
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103",
  },
  {
    title:
      "HHS: Business Associates under HIPAA (business associate agreement requirements, 45 CFR 164.504(e))",
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html",
  },
  {
    title: "American Dental Association: FAQ on HIPAA Business Associates",
    url: "https://www.ada.org/resources/practice/legal-and-regulatory/faqs-on-hipaa-business-associates",
  },
  {
    title:
      "FTC .com Disclosures: how to make effective disclosures in digital advertising",
    url: "https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Search &quot;dental AI receptionist&quot; and you get a page of ranked
        lists written by companies selling one. This is another of those, and you
        should read it with that in mind: we make a general AI receptionist,
        which places us fifth in our own ranking and outside the top four on the
        criterion that actually matters here. What follows is the ranking we
        would give a dentist who called and asked, with every published number
        sourced and every unpublished one named as unpublished - because the
        thing that separates these products is not how they sound. It is what
        they are allowed to write into Dentrix, Eaglesoft or Open Dental, and
        almost nobody in the search results will tell you that straight.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Rank them on write access, not on voice.</Strong> Every
            product in this category sounds fine now. Booking a dental
            appointment correctly is five decisions, and four of them live inside
            your practice management system.
          </>,
          <>
            <Strong>One vendor publishes a price. The rest sell by demo.</Strong>{" "}
            Dentina lists $299 and $399 per month per location. Arini, Weave and
            Peerlogic do not publish, which usually means per-location quotes and
            an annual term.
          </>,
          <>
            <Strong>&quot;Integrates with Dentrix&quot; is not a claim, it is a
            category.</Strong> Open Dental gates access behind a developer key,
            a per-office customer key and an eConnector the practice must run.
            Ask which system, and read or write.
          </>,
          <>
            <Strong>The BAA is the first document, not the last.</Strong>{" "}
            A vendor holding your patients&apos; names and call recordings is a
            business associate. Ask for the agreement before the demo, and read
            the retention clause.
          </>,
        ]}
      />

      <H2 id="the-ranking">The ranking, in one table</H2>
      <P>
        Ordered by how well each one serves the practice most likely to be
        reading this: a one-to-three location general practice that is losing
        calls after hours and at lunch. Change that starting assumption and the
        order changes with it, which is exactly why the third column exists.
      </P>
      <Table
        caption="Five dental phone products, ranked for a small general practice (August 2026)"
        head={["#", "Product", "Best when", "Published price?"]}
        rows={[
          [
            "1",
            "Dentina",
            "You want a price and a named PMS list before you spend an hour on a demo",
            "Yes - from $299/mo",
          ],
          [
            "2",
            "Weave AI Receptionist",
            "Weave is already your phone system and patient messaging",
            "No",
          ],
          [
            "3",
            "Arini",
            "You are a DSO or a group with a real procurement process",
            "No",
          ],
          [
            "4",
            "Peerlogic",
            "Your front desk answers the phone and still loses the patient",
            "No",
          ],
          [
            "5",
            "A general packaged AI receptionist",
            "You need the phone answered after hours and the PMS is not the point",
            "Yes - typically €99-€299/mo",
          ],
        ]}
      />
      <Callout>
        If you take one thing from this page: the difference between the top of
        this list and the bottom is not quality. It is whether the product can
        put an appointment into your schedule, or merely tell you someone called
        wanting one.
      </Callout>

      <H2 id="how-we-ranked">How we ranked these - and who we are</H2>
      <P>
        Most rankings in this SERP are unfalsifiable, so here is the method,
        stated plainly enough that you can disagree with it.
      </P>
      <OL>
        <LI>
          <Strong>Only first-party claims count.</Strong> Every figure below
          comes from the vendor&apos;s own pricing page, product page or press
          release, read in August 2026. Where a vendor does not publish
          something, we say so rather than repeating a number from another
          listicle. Several of the top-ranking pages for this query assert PMS
          integrations that the vendors themselves do not name anywhere.
        </LI>
        <LI>
          <Strong>Write access to the practice management system outranks
          everything.</Strong> A voice agent that books into your schedule
          removes work. One that emails a summary creates a to-do list. Both are
          sold with the same headline.
        </LI>
        <LI>
          <Strong>Published pricing is itself a ranking signal.</Strong> Not
          because cheap is good, but because a price page tells you the shape of
          the customer the vendor is built for. Demo-only pricing is an accurate
          signal about deal size, not evasiveness.
        </LI>
        <LI>
          <Strong>We disclose our own position.</Strong> We sell a general
          packaged AI receptionist. It does not write into Dentrix or Open
          Dental. That is why it is fifth here and not first, and if the PMS
          write-back is what you need, four other products on this page beat
          ours.
        </LI>
      </OL>
      <P>
        What we have not done: run a scored bake-off of voice quality. We could
        not do it honestly at the scale required, the results would be stale in
        a quarter, and it is not the axis that decides these purchases anyway.
        The general question of how to evaluate any of them is covered in{" "}
        <Internal href="/blog/best-ai-receptionist">
          how to choose an AI receptionist
        </Internal>
        .
      </P>

      <H2 id="the-real-criterion">Why voice quality is the wrong test</H2>
      <P>
        Ask a dental AI to book a cleaning and it will sound superb doing it.
        That tells you almost nothing, because the hard part of a dental booking
        is not the conversation. It is that &quot;book me an appointment&quot;
        expands into five separate lookups, and a general-purpose voice agent has
        access to none of them.
      </P>
      <Figure
        src="/blog/dental-booking-five-decisions.svg"
        alt="A five-step chain showing what booking one dental appointment requires: what the visit is, how long the procedure takes, whether it belongs to the dentist or hygienist, which operatory is free, and whether the insurance plan is active - each compared between a generic voice agent and one that can read the practice management system"
        width={1200}
        height={630}
        caption="Four of these five answers already exist inside your practice management system. The fifth is the one nobody should automate."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        The failure modes are specific and they are all operational rather than
        conversational. A crown seat booked into a thirty-minute hygiene slot
        costs you the afternoon. Two patients booked into one operatory costs you
        a review. A recall booked with the doctor rather than the hygienist costs
        you a chair-hour you cannot get back. None of these sound wrong on the
        recording. They surface at 7:40 the next morning, when the schedule is
        already printed.
      </P>
      <P>
        And the fifth decision is the one worth being conservative about.
        Eligibility changes without warning, and a voice agent that reassures a
        caller their plan covers the visit has committed your practice to a
        conversation at the front desk that you did not agree to. The correct
        behaviour is to take the carrier, the subscriber and the date of birth,
        and hand it to a person. Ask every vendor what their agent says when a
        caller asks &quot;is this covered?&quot; The good ones have a rehearsed
        answer.
      </P>

      <H2 id="the-gate">The gate nobody in the SERP mentions</H2>
      <P>
        Here is why so few products in this category can honestly claim write
        access: the practice management vendors control it, and the process is
        neither instant nor free.
      </P>
      <P>
        Open Dental publishes the whole thing. To get Developer Portal access, a
        vendor emails vendor relations and supplies its company name, a phone
        number, a billing email, a physical mailing address, and{" "}
        <Ext href="https://www.opendental.com/site/apisetup.html">
          a list of the API resources they need access to and for each
          permission, whether you need read, create, or update
        </Ext>
        . Requests take one to three business days. Every request thereafter
        carries two keys - a Developer API Key belonging to the vendor and a
        Customer API Key unique to your practice - and your office has to run the
        eConnector service and tick <em>Enabled</em> in API Setup before any of
        it works.
      </P>
      <Figure
        src="/blog/open-dental-api-developer-setup.webp"
        alt="Open Dental's API Developer Setup documentation page, showing the eConnector requirement, the two-key model with a Developer API Key and Customer API Key, and the list of details a vendor must email to vendor relations including a billing address"
        width={1314}
        height={924}
        caption="Read the asterisked lines. A vendor asking for 'create' and 'update' permissions on appointments is building something that books. One asking only for 'read' is building something that reports."
        credit="Screenshot: Open Dental API documentation, August 2026"
        creditUrl="https://www.opendental.com/site/apisetup.html"
      />
      <P>
        Dentrix routes third parties through Henry Schein One&apos;s API
        Exchange, which sets a security floor rather than a paperwork one: the
        programme states that{" "}
        <Ext href="https://www.henryscheinone.com/dental-solutions/api-exchange/api-exchange-practices/">
          all integrated software vendors are SOC2 Type II and OAuth2.0 certified
        </Ext>
        . For a small vendor, a SOC 2 Type II report is a genuine, months-long,
        five-figure undertaking. That is the moat, and it is why the field of
        products that can really write into dental software is narrow.
      </P>
      <P>
        The Dentrix Developer Program publishes the rest of it, and the numbers
        are the clearest explanation of this whole category. For the on-premise
        Dentrix API there is a{" "}
        <Ext href="https://ddp.dentrix.com/pages/faq">
          one-time registration fee of $5,000 for read access and a further
          $5,000 for write access
        </Ext>
        , plus a monthly royalty by API category. For Dentrix Ascend it is a
        $5,000 registration fee and $47 per Ascend location per month, including
        30,000 calls and 3GB of data, with overage at $0.0018 per call and $1.00
        per GB.
      </P>
      <Callout>
        Read that again: writing into Dentrix costs a vendor five thousand
        dollars more than reading from it. When a product tells you it
        &quot;integrates with Dentrix&quot; and cannot say which side of that
        line it paid for, you have learned something useful.
      </Callout>
      <Figure
        src="/blog/dentrix-api-exchange-security.webp"
        alt="Henry Schein One's API Exchange page for dental practices, listing benefits including full data ownership and access and robust security with SOC 2 Type II compliance and OAuth 2.0"
        width={1000}
        height={803}
        caption="A useful reframing of the same fact: the certification requirement that protects your patient data is also the reason your shortlist is four names long rather than forty."
        credit="Screenshot: Henry Schein One API Exchange, August 2026"
        creditUrl="https://www.henryscheinone.com/dental-solutions/api-exchange/api-exchange-practices/"
      />
      <P>
        For multi-location groups the $47 line compounds: a fifteen-practice
        group is paying fifteen times over for the privilege of letting software
        talk to its own data. Nobody raises this in a demo, because it is
        usually absorbed into the vendor&apos;s per-location price. Ask anyway -
        it tells you whether the person selling to you understands their own
        cost base.
      </P>

      <H2 id="shortlist">The five, one at a time</H2>

      <H3>1. Dentina - the only one that answers the question in public</H3>
      <P>
        Dentina earns the top slot on legibility more than on any feature. It is
        the one product in this category whose own site tells you the price
        before you talk to anybody -{" "}
        <Ext href="https://dentina.ai/">
          Standard Inbound starting at $299 per month and Premium Inbound at $399
          per month
        </Ext>
        , billed annually per location, with a 30-day free trial and cancel
        anytime. It also names the systems it works with rather than gesturing at
        them: Dentrix, Dentrix Ascend, Open Dental, Eaglesoft, Curve, Denticon,
        Cloud9, Dentrix Enterprise, Dolphin, OrthoTrac and PracticeWorks.
      </P>
      <P>
        The product covers voice, SMS reply to missed calls, and web chat on the
        inbound side, plus outbound recalls pulled from the PMS, family-aware
        confirmations, and reactivation of patients lapsed eighteen months or
        more. Treatment follow-up is marked on its own site as a Q2 2026 item,
        which is a level of roadmap honesty this category does not usually
        volunteer.
      </P>
      <P>
        <Strong>The critical read:</Strong> a published price is not proof of
        anything except a published price. Naming eleven systems tells you which
        systems, not the permission level in each. Take the trial, and spend it
        checking whether an appointment it books arrives in the right column with
        the right length - not whether it sounds pleasant.
      </P>

      <H3>2. Weave AI Receptionist - the smallest decision, if you are already there</H3>
      <P>
        Weave is a healthcare communications platform - phones, texting,
        payments, reviews, recall - and its AI Receptionist is a layer on top of
        all of it. On its product page Weave describes it as an{" "}
        <Ext href="https://www.getweave.com/ai/">
          always-on agentic AI Receptionist
        </Ext>{" "}
        that books appointments, answers FAQs, takes payments and hands off to
        staff. It did not build this from nothing: in May 2025 Weave announced it
        would acquire TrueLark, an AI front-desk platform with real DSO
        deployments, for{" "}
        <Ext href="https://www.businesswire.com/news/home/20250505777895/en/Weave-Communications-to-Acquire-TrueLark-Accelerating-AI-Powered-Front-Office-Automation">
          $35 million - $25 million in cash and $10 million in equity
        </Ext>
        .
      </P>
      <P>
        That acquisition is the strongest single argument for Weave and the
        clearest signal about where this category is going. Platforms that
        already hold your patient communications are not waiting to be
        disintermediated by a phone startup; they are buying one. If Weave is
        already your phone system, adding its receptionist is a change of
        configuration rather than a change of vendor - no porting, no second
        integration, one bill, one support number.
      </P>
      <P>
        <Strong>The critical read:</Strong> the AI product page does not name a
        single practice management system, describing them only as leading
        practice management systems. Weave has a large integration estate
        elsewhere on its site, so this is a documentation gap rather than a
        capability claim - but it is your job to close it. Ask, in writing, which
        of your systems and whether the agent creates appointments or only reads
        availability. And be honest with yourself about the counterfactual: if
        you are not on Weave, adopting Weave to get its receptionist is a
        platform migration standing in for a phone problem.
      </P>

      <H3>3. Arini - built for the buyer with a procurement process</H3>
      <P>
        Arini positions itself as{" "}
        <Ext href="https://www.arini.ai/">
          the leading AI receptionist for dentists
        </Ext>
        , with the pitch aimed squarely at revenue recovery: answer every call,
        reactivate every patient, and stop opportunities for care slipping. Its
        stated scope goes well past answering - reactivation campaigns, online
        scheduling, confirmations, recall management, with insurance verification
        described as roadmap. There is an enterprise partner motion and an
        analytics product alongside the core.
      </P>
      <P>
        For a DSO, that shape is right. Multi-location dentistry has genuinely
        different requirements - routing between locations, per-provider rules,
        consolidated reporting - and a vendor that sells by demo and quotes by
        portfolio is built for that conversation.
      </P>
      <P>
        <Strong>The critical read, and it matters:</Strong> most of the ranked
        lists above this one on the results page state that Arini has native
        Dentrix, Eaglesoft and Open Dental integration. On the Arini page we read
        in August 2026, no practice management system is named at all. It may
        well have all three; that is not the point. The point is that a claim
        repeated by six listicles and made by none of them checkable is exactly
        the kind of thing you should not carry into a purchase. Ask Arini
        directly, name your system, and ask for read or write in the same
        sentence.
      </P>

      <H3>4. Peerlogic - the one solving a different problem, well</H3>
      <P>
        Peerlogic sits slightly outside this comparison and belongs in it anyway,
        because a real share of practices searching for an AI receptionist do not
        have a coverage problem. They have a conversion problem. The phone gets
        answered; the caller still does not book. Peerlogic&apos;s centre of
        gravity is conversational intelligence over your existing calls - what
        was said, what was missed, which team member converts - with an AI
        assistant that also texts missed calls, answers questions and books.
      </P>
      <P>
        If your front desk answers ninety per cent of calls and books forty per
        cent of them, a voice agent that answers the other ten per cent is
        rounding error. Fixing the forty is the whole business.
      </P>
      <P>
        <Strong>The critical read:</Strong> like Weave and Arini, no PMS is named
        on the page and no price is published. And be clear about what you are
        buying - analytics products create work before they save it. Somebody has
        to listen to the coaching, run the huddle and change the script. If
        nobody in your practice owns that, the dashboard becomes a subscription
        to a graph.
      </P>

      <H3>5. A general packaged AI receptionist - including ours</H3>
      <P>
        The last category is the one we are in, and it is fifth here for an
        honest reason: it does not touch your practice management system. A
        general AI receptionist answers with your greeting, knows your hours,
        services and location, screens and routes, books onto a mainstream
        calendar, escalates a genuine emergency to a real phone, and drops a
        transcript in your inbox. It goes live the same day, costs a flat monthly
        fee, and cancels month to month - ours is{" "}
        <Internal href="/pricing">€99 or €299 a month</Internal> depending on
        volume.
      </P>
      <P>
        For an after-hours and lunchtime overflow line, that is frequently the
        correctly sized purchase, and the arithmetic is not close: a dental
        vendor at $299 per location per month solving a problem you have for two
        hours a day is a different trade from a general product at a third of the
        price solving exactly those two hours. The general product also handles
        the calls that are not bookings at all - the sales calls, the wrong
        numbers, the patient asking whether you are open on Saturday - which is
        most of the volume.
      </P>
      <P>
        <Strong>The critical read, on ourselves:</Strong> if what you need is an
        appointment to land in the hygiene column with the right length against
        the right operatory, we cannot do that, and neither can any other general
        product regardless of what its home page implies. Buy one of the four
        above. We are also not the right answer for a practice that needs
        outbound recall campaigns driven from the PMS, or insurance workflows of
        any kind.
      </P>

      <H2 id="pricing">What each one actually costs</H2>
      <P>
        Two of these five publish numbers. Rather than fill the gaps with
        guesses, here is exactly what each vendor states, and what the silence
        usually means.
      </P>
      <Table
        caption="Published pricing as of August 2026 - confirm before buying"
        head={["Product", "What the vendor publishes", "What to expect"]}
        rows={[
          [
            "Dentina",
            "Standard Inbound from $299/mo, Premium Inbound from $399/mo, billed annually per location. 30-day free trial.",
            "Annual commitment, priced per location. Outbound campaigns quoted separately.",
          ],
          [
            "Weave AI Receptionist",
            "Nothing. Pricing page exists; the AI product page carries no figure.",
            "Bundled into a platform subscription - so the real question is the total Weave bill, not the AI line.",
          ],
          [
            "Arini",
            "Nothing. Book a demo.",
            "Per-location quote, annual term, enterprise motion. Expect a procurement cycle.",
          ],
          [
            "Peerlogic",
            "Nothing on the product page.",
            "Quoted. Analytics products often price per location or per seat.",
          ],
          [
            "General packaged AI receptionist",
            "Flat monthly, publicly listed. Ours is €99 (1,000 min) or €299 (3,000 min), €0.09 per extra minute.",
            "Month to month, live same day, no PMS write-back.",
          ],
        ]}
      />
      <P>
        One structural point worth more than any of these numbers: per-location
        pricing and per-location API fees compound in the same direction. A
        three-location group evaluating a $299 product is looking at roughly
        $10,800 a year before the Dentrix Ascend API line, not $3,588. Run your
        own arithmetic on locations, not on the headline.
      </P>
      <H3>If you are comparing against a live dental answering service</H3>
      <P>
        Many practices searching for a dental answering service are really
        choosing between three shapes, not five products. Be honest about how
        many calls you miss in a normal week before picking one.
      </P>
      <Table
        caption="Answering models for a dental practice"
        head={["Model", "Best fit", "Watch out for"]}
        rows={[
          [
            "Live human operators",
            "Practices that want a person on every call and have steady, predictable volume",
            "Usually billed per minute or per call; hold times when several calls hit at once; operators who do not know dental triage or your software",
          ],
          [
            "AI receptionist",
            "Heavy lunch, after-hours and overflow volume; routine booking, recall and reactivation; small front desks",
            "Must be configured for emergency triage, insurance honesty and HIPAA; needs a clean handoff for anything clinical or sensitive",
          ],
          [
            "Hybrid (AI first, human backup)",
            "Most growing practices: the AI catches every call, a person takes the ones that need one",
            "You must define exactly what triggers a handoff and where it goes",
          ],
        ]}
      />
      <P>
        The meter matters as much as the rate. A per-minute live service bills
        hardest in exactly the weeks you bought it for, while the AI products
        above are flat or per location. The base-plus-per-minute structure of
        live services, and what real monthly bills look like, is broken down in{" "}
        <Internal href="/blog/virtual-receptionist-pricing">
          virtual receptionist pricing
        </Internal>
        . Whichever you compare, weigh it against what you are losing: a new
        patient is not one cleaning but years of exams, hygiene and restorative
        work, plus the family they refer.
      </P>

      <H2 id="after-hours">After hours and emergencies: what the AI should do</H2>
      <P>
        Yes, an AI receptionist answers dental calls after hours - that is the
        most common reason practices buy one. Lunch, the first hour of the
        morning, evenings and weekends are when patients are free to call and
        your office often is not, and during the day the front desk is checking
        patients in and walking them back while the phone rings through. On
        those calls the agent should do four things: answer instantly; capture
        the patient cleanly (name, callback number, new or existing, reason for
        the visit, the insurance they want on file); sort urgency by your rules;
        and either book the visit or, if it cannot write into your PMS, leave a
        request the front desk can act on in the morning.
      </P>
      <Figure
        src="/blog/dental-call-flow.svg"
        alt="Diagram: an incoming dental call is answered by the AI, which then books a new-patient exam, schedules recall or hygiene, or triages an emergency and pages the on-call dentist"
        width={1200}
        height={630}
        caption="Answer instantly, identify new versus existing and the reason, then book the visit or escalate a true emergency. The emergency branch is the one to configure before you trust it."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        The emergency rules are the highest-stakes configuration in the whole
        setup, and they belong in writing before the first forwarded call:
      </P>
      <UL>
        <LI>
          <Strong>Hard stop to 911 or the ER.</Strong> Facial swelling that
          affects breathing or swallowing, bleeding that will not stop, or
          trauma. The agent tells the caller to call 911 or go to the ER now,
          then escalates to a person. It never schedules this for tomorrow.
        </LI>
        <LI>
          <Strong>Page the on-call dentist.</Strong> Time-critical dental
          emergencies such as a knocked-out tooth get flagged urgent and paged
          with the callback number, rather than left in a queue until morning.
        </LI>
        <LI>
          <Strong>Book or route by your definitions.</Strong> &quot;My crown fell
          off&quot; and &quot;I&apos;d like a cleaning&quot; are different calls
          from &quot;my tooth was knocked out an hour ago,&quot; and each goes
          where you decided in advance.
        </LI>
        <LI>
          <Strong>Never diagnose.</Strong> An AI must not decide whether pain is
          serious, recommend treatment or advise on medication. Its only job on a
          symptom call is triage and escalation.
        </LI>
        <LI>
          <Strong>Anxious callers go to a person early.</Strong> Dental anxiety
          is real, and a frightened patient often wants a human voice. A polite
          AI is not the same thing, and they can tell.
        </LI>
      </UL>
      <P>
        If the agent cannot reach anyone, it must say so and tell the caller what
        to do next. Wiring the escalation chain so someone actually wakes up is
        covered in our{" "}
        <Internal href="/blog/24-hour-answering-service">
          24-hour answering service guide
        </Internal>
        , and the wider healthcare version of these triage rules is in the{" "}
        <Internal href="/blog/medical-answering-service">
          medical answering service guide
        </Internal>
        .
      </P>

      <H2 id="scripts">What good calls sound like</H2>
      <P>
        The quality of any answering setup lives in the script, and the short
        ones work best - long scripts are where AI and tired humans both go
        wrong. Three calls worth modelling, whichever product you buy:
      </P>
      <H3>New-patient booking</H3>
      <Callout>
        &quot;Thanks for calling Bright Smiles Dental, this is the practice&apos;s
        AI assistant and I can get you scheduled. Are you a new patient with us,
        or have you been in before? ... Welcome. Is this a routine checkup and
        cleaning, or is something bothering you today? ... Got it. Do you have
        dental insurance you&apos;d like us to keep on file? ... I have next
        Tuesday at 9 or Thursday at 2 open for a new-patient exam, which works
        better? ... Booked. I&apos;ll text you the confirmation, the address and
        the new-patient forms now.&quot;
      </Callout>
      <P>
        Note the longer new-patient slot rather than a squeezed-in checkup, and
        the forms going out before the visit so the patient arrives ready.
      </P>
      <H3>The emergency call - triage and escalate, never diagnose</H3>
      <Callout>
        &quot;You said a tooth was knocked out - let&apos;s act fast because
        timing matters. If you can find the tooth, pick it up by the crown, not
        the root, and keep it in a little milk or tucked in your cheek. I&apos;m
        flagging this as urgent and paging the on-call dentist to call you
        straight back. What&apos;s the best number to reach you? ... If you have
        bleeding that won&apos;t stop, trouble breathing or swallowing, or major
        swelling, please call 911 or head to the ER now.&quot;
      </Callout>
      <P>
        Any first-aid line in a script like this should be wording your dentist
        has signed off, said the same way every time.
      </P>
      <H3>The insurance question - capture, don&apos;t promise</H3>
      <Callout>
        &quot;I can note your plan and have our team verify your benefits before
        the visit, but I can&apos;t confirm exactly what your insurance will
        cover on this call - that depends on your specific policy. Want me to
        book the exam and have someone confirm your coverage and any estimate
        beforehand?&quot;
      </Callout>
      <P>
        The moment a call ends, the front desk should get a one-line summary it
        can act on: <em>&quot;New patient, cracked molar, Delta Dental, booked
        Thu 2pm, forms sent&quot;</em> or{" "}
        <em>&quot;Recall, existing patient, hygiene, booked next Tue 9am.&quot;</em>{" "}
        That summary is the actual product. Templates for these modules are in
        our{" "}
        <Internal href="/blog/ai-receptionist-prompts">
          AI receptionist prompts
        </Internal>
        .
      </P>

      <H2 id="hipaa">The BAA conversation, before the demo</H2>
      <P>
        A vendor that answers your phone receives patient names, phone numbers,
        the reason for the visit and, usually, a recording of the whole exchange.
        That makes it a business associate creating, receiving, maintaining or
        transmitting protected health information on your behalf, under{" "}
        <Ext href="https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103">
          45 CFR 160.103
        </Ext>
        . You need a signed business associate agreement in place before the
        first live call, not after the pilot goes well -{" "}
        <Ext href="https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html">
          HHS guidance on business associates
        </Ext>{" "}
        sets out what that agreement must cover, and the{" "}
        <Ext href="https://www.ada.org/resources/practice/legal-and-regulatory/faqs-on-hipaa-business-associates">
          ADA&apos;s own FAQ
        </Ext>{" "}
        makes the same point for practices. Compliance is yours as the covered
        entity; a vendor&apos;s marketing cannot grant it to you.
      </P>
      <P>
        Ask for the document itself and read four clauses: how long call
        recordings and transcripts are retained; whether your call content is
        used to train or improve models; which subprocessors touch the audio -
        the speech and language vendors underneath almost every product in this
        category; and what happens to your data when you cancel. A vendor with
        this in order will send you a PDF the same day. One that answers &quot;we
        are fully HIPAA compliant&quot; and changes the subject has told you
        something.
      </P>
      <Callout>
        Two smaller things worth settling in the same conversation: whether the
        agent identifies itself as AI at the start of the call - the honest
        default, and in line with the{" "}
        <Ext href="https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising">
          FTC&apos;s guidance on clear disclosure
        </Ext>{" "}
        - and whether
        recording notice meets your state&apos;s consent rules. Both are cheap to
        fix before launch and awkward to fix after a complaint.
      </Callout>

      <H2 id="test">A fifteen-minute test that settles it</H2>
      <P>
        Every vendor here will give you a demo number. Do not let them drive.
        Call it yourself, from a mobile, with a colleague listening, and run
        these seven. It sorts the field faster than any comparison table,
        including ours.
      </P>
      <OL>
        <LI>
          <Strong>&quot;I chipped a tooth, it&apos;s bleeding.&quot;</Strong>
          Does it triage and escalate, or offer you Thursday at 3? Emergency
          handling is the single most revealing turn in dentistry.
        </LI>
        <LI>
          <Strong>&quot;I need a cleaning.&quot;</Strong> Then ask which
          provider it just booked you with. If it cannot answer, it is not
          reading your columns.
        </LI>
        <LI>
          <Strong>&quot;Is that covered by my insurance?&quot;</Strong> The
          right answer is a careful one that collects details and defers. Any
          confident yes is a liability.
        </LI>
        <LI>
          <Strong>Interrupt it mid-sentence.</Strong> Talk over the greeting.
          Real callers do this constantly and it is where weaker products fall
          apart.
        </LI>
        <LI>
          <Strong>Ask something not in the knowledge base.</Strong>
          &quot;Do you do Invisalign on Saturdays?&quot; A good agent says it
          will check and takes a number. A bad one invents an answer, and it will
          invent prices too.
        </LI>
        <LI>
          <Strong>Ask for a human.</Strong> Time it. Where does it go after
          hours, and what happens if nobody picks up?
        </LI>
        <LI>
          <Strong>Then go and look at the schedule.</Strong> This is the whole
          test. Did an appointment appear, in the right column, with the right
          length, against the right operatory? Everything before this is theatre.
        </LI>
      </OL>
      <P>
        The same protocol, in more general form and with the reasoning behind
        each step, is in{" "}
        <Internal href="/blog/ai-voice-agent-vs-chatbot-vs-ivr">
          AI voice agent vs chatbot vs IVR
        </Internal>
        . We run the same ranking for two other trades whose systems of record
        work completely differently -{" "}
        <Internal href="/blog/best-ai-phone-answering-for-restaurants">
          restaurants, where the write-back is a POS
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
          <Strong>Your problem is daytime capacity, not coverage.</Strong> If
          the phone rings ninety times a day and two people cannot keep up, an AI
          answering the overflow will book badly at volume. Hire, then automate
          the after-hours edge.
        </LI>
        <LI>
          <Strong>Your patient base will not take it.</Strong> A practice built
          on twenty years of the same voice at the front desk can lose more in
          goodwill than it recovers in captured calls. Run it after hours only
          for a quarter and read the reviews.
        </LI>
        <LI>
          <Strong>You are mid-migration.</Strong> Changing practice management
          systems and introducing a voice agent in the same quarter guarantees
          you will not know which one broke the schedule.
        </LI>
        <LI>
          <Strong>Nobody owns the knowledge base.</Strong> Every product here is
          exactly as accurate as what you loaded into it. Fees change, hygienists
          leave, hours move. Half an hour a month, permanently, or it degrades
          into a confident liar.
        </LI>
        <LI>
          <Strong>What you actually wanted was missed-call text-back.</Strong>{" "}
          For a meaningful number of practices, an automatic text to every missed
          call recovers most of the loss for a fraction of the cost -{" "}
          <Internal href="/blog/missed-call-text-back">
            the case for it is here
          </Internal>
          .
        </LI>
      </UL>
      <P>
        If after all that the honest answer is that you just need the phone
        answered after six and at lunch, that is the narrow problem we built for.
        Start with the{" "}
        <Internal href="#after-hours">
          after-hours rules
        </Internal>{" "}
        and the{" "}
        <Internal href="#scripts">
          scripts
        </Internal>{" "}
        above, forward only the lunch, evening and overflow calls you are
        already missing, and read the first two weeks of transcripts before you
        hand it the main line.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
