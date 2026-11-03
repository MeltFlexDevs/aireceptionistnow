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
  slug: "google-voice-for-business",
  title: "Google Voice for Business: Pricing, Limits and What It Can't Do",
  description:
    "How Google Voice works for a business, what the free and paid plans include ($0, $10, $20, $30 per user), the porting fees, and the limits that matter: 3-month inactivity reclaim, no 911 on free, and no forwarding to automated systems. Checked on Google's own pages, November 2026.",
  date: "2026-11-03",
  updated: "2026-11-03",
  readingTime: "14 min read",
  tag: "Guides",
  hero: "/blog/google-voice-business-counter-phone.webp",
  heroAlt:
    "A florist wrapping a bouquet in brown paper with both hands while a smartphone lights up with an incoming call on the shop counter beside a ball of twine and scissors",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "google voice for business",
    "google voice business",
    "how does google voice work",
    "google voice cost",
    "google voice pricing",
    "is google voice free for business",
    "google voice business number",
    "google voice auto attendant",
    "port number to google voice",
    "google voice starter vs standard",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "how-it-works", title: "How Google Voice works" },
    { id: "plans", title: "Plans and prices" },
    { id: "free-for-business", title: "Using free Google Voice for a business" },
    { id: "paid", title: "What the paid plans add" },
    { id: "porting", title: "Porting a number in and out" },
    { id: "missed-calls", title: "What no plan does: answer the call you miss" },
    { id: "verdict", title: "Who it fits, and who it doesn't" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "Is Google Voice free for business use?",
      a: "No. Google's own plan table describes the free plan as 'for personal, consumer use'. For a business, Google sells Voice Starter, Standard and Premier as add-ons to a paid Google Workspace plan at $10, $20 and $30 per user per month (US prices, checked November 3, 2026), plus two single-user standalone plans in the US at $10 and $20 a month. The free plan also has no 911 emergency calling, no call recording and no auto attendant, and Google reclaims numbers that see no calls or texts for 3 months.",
    },
    {
      q: "How much does Google Voice cost for a business?",
      a: "Voice Starter is $10 per user per month for up to 10 users, Voice Standard is $20 per user per month with unlimited users, and Voice Premier is $30 per user per month. All three are add-ons that need a paid Google Workspace subscription on top, and Google bills Voice monthly with no annual option. In the US, single users without Workspace can buy Voice Starter or Voice Standard standalone at $10 or $20 a month. Prices are Google's US figures as published on November 3, 2026; some EMEA pages show promotional prices.",
    },
    {
      q: "How does Google Voice work?",
      a: "Google Voice gives you a phone number that lives in your Google account rather than on a SIM card. Calls to it ring the Voice app, voice.google.com in a browser, a supported desk phone on paid plans, and up to 6 linked phone numbers you have verified. Calls go over the internet, voicemails are transcribed, and texts are supported in the US. Business plans add an auto attendant ('press 1 for sales'), ring groups and call queues on Standard and Premier.",
    },
    {
      q: "Does Google Voice have an auto attendant?",
      a: "Yes, on Voice Standard and Voice Premier, not on the free plan or Voice Starter. The auto attendant plays a greeting (text-to-speech or your own recording), offers keypad options, follows business hours and holiday closures, and can transfer the caller to a user, a ring group, another attendant or another phone number, or send them to voicemail. Google's documentation describes keypad menus only. It does not understand a caller's request in their own words or book appointments.",
    },
    {
      q: "Can I forward Google Voice calls to an AI receptionist or answering service?",
      a: "Not from the free plan, by Google's own rules. Google's help page says 'forwarding calls from your Google Voice number to an automated system is unsupported' and points you to Workspace and its auto attendant instead. Google's acceptable use policy also says not to forward to numbers that aren't your own or under your control. On Voice Standard or Premier, an auto attendant or ring group can transfer callers to another phone number, which is the supported way to send after-hours or overflow calls to an answering service. Test it before relying on it.",
    },
    {
      q: "How much does it cost to port a number to Google Voice?",
      a: "For a personal Google Voice account, Google charges a $20 fee to port in a mobile number, and only an active US mobile number qualifies. Unlocking a Google Voice number so you can port it out costs $3, waived if you originally ported it in. For Workspace accounts, Google's porting pages list no fee, allow up to 1,000 numbers per request (50 in Canada), exclude toll-free numbers, and say a US port takes no less than 10 and no more than 30 business days.",
    },
    {
      q: "Does Google Voice answer calls with AI?",
      a: "No. Google's AI features in Voice are spam warnings, voicemail transcription, and on some paid plans call recording transcripts and Gemini call notes, which are English only. None of them answers a caller, takes their details or books an appointment. A call nobody picks up goes to voicemail, and Google itself warns that 'voicemail transcripts may be incorrect or missing'.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Google Voice Help: Identify Google Voice subscription types (plan table)",
    url: "https://support.google.com/voice/answer/9249103?hl=en",
  },
  {
    title: "Google Workspace: Google Voice product page (US plans)",
    url: "https://workspace.google.com/intl/en/products/voice/",
  },
  {
    title:
      "Google Voice Help: Set up your phone to make and receive calls (linked numbers, automated systems)",
    url: "https://support.google.com/voice/answer/165221?hl=en",
  },
  {
    title: "Google Voice: Acceptable Use Policy",
    url: "https://support.google.com/voice/answer/9230450?hl=en",
  },
  {
    title: "Google Voice Help: Reclaim an expired number",
    url: "https://support.google.com/voice/answer/159519?hl=en",
  },
  {
    title: "Google Voice Help: Emergency calling",
    url: "https://support.google.com/voice/answer/9198172?hl=en",
  },
  {
    title: "Google Voice Help: Port your number to Google Voice ($20 fee, $3 unlock)",
    url: "https://support.google.com/voice/answer/1065667?hl=en",
  },
  {
    title: "Google Workspace Admin Help: Number porting requirements for Google Voice",
    url: "https://knowledge.workspace.google.com/admin/voice/number-porting-requirements-for-google-voice",
  },
  {
    title: "Google Workspace Admin Help: Google Voice porting FAQ",
    url: "https://knowledge.workspace.google.com/admin/voice/google-voice-porting-faq",
  },
  {
    title: "Google Workspace Admin Help: Set up a Voice automated attendant",
    url: "https://knowledge.workspace.google.com/admin/voice/set-up-a-voice-automated-attendant-for-your-organization",
  },
  {
    title: "Google Workspace Admin Help: Set up call queuing for a ring group",
    url: "https://knowledge.workspace.google.com/admin/voice/set-up-call-queuing-for-a-ring-group",
  },
  {
    title: "Google Workspace Admin Help: How Voice billing works",
    url: "https://knowledge.workspace.google.com/admin/voice/how-voice-billing-works",
  },
  {
    title: "Google Workspace Admin Help: Voice and SIP Link supported countries",
    url: "https://knowledge.workspace.google.com/admin/voice/google-voice-and-sip-link-supported-countries",
  },
  {
    title: "Google Workspace Admin Help: Let Google Voice take AI notes",
    url: "https://knowledge.workspace.google.com/admin/voice/let-google-voice-take-ai-notes-for-my-users",
  },
  {
    title: "Google Voice Help: Record calls",
    url: "https://support.google.com/voice/answer/12009609?hl=en",
  },
  {
    title: "Google Voice Help: Read voicemail transcripts",
    url: "https://support.google.com/voice/answer/168515?hl=en",
  },
  {
    title: "Google Voice Help: Send text messages (limits)",
    url: "https://support.google.com/voice/answer/115116?hl=en",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Google Voice is the cheapest way to give a small business a second
        phone number, and for a lot of one-person businesses it is the right
        answer. It is also the source of a steady stream of unhappy Reddit
        threads, because the free version was never meant for business use and
        the paid one is a Workspace add-on with features spread over three
        tiers. This guide is what Google&apos;s own help pages say about
        prices, plans and limits, checked on November 3, 2026. We sell an AI
        receptionist, which competes with part of what Voice does, so the
        last section explains where we fit and where we don&apos;t.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>Free Google Voice is personal-use only.</Strong>{" "}Google
            says so in its own plan table. It has no 911, no call recording
            and no auto attendant, and an unused number is reclaimed after 3
            months.
          </>,
          <>
            <Strong>Business Voice is $10, $20 or $30 per user a month</Strong>{" "}
            on top of a paid Google Workspace plan. The auto attendant and
            ring groups start at Standard ($20), not Starter.
          </>,
          <>
            <Strong>You can&apos;t forward free Voice calls to a bot.</Strong>{" "}
            Google says forwarding to an automated system is unsupported, so an
            AI receptionist or answering service needs a paid plan, or a
            different number.
          </>,
          <>
            <Strong>No plan answers the call you miss.</Strong>{" "}Every tier
            ends in voicemail. The AI features are spam warnings, transcripts
            and English-only call notes.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        Google Voice for business means one of the paid plans: Voice Starter
        ($10 per user per month, up to 10 users), Voice Standard ($20, unlimited
        users) or Voice Premier ($30), each sold as an add-on to a paid Google
        Workspace subscription. It is good at giving a small team cheap
        business numbers that ring on their phones and laptops. It is weak at
        what happens when nobody picks up: every plan sends that caller to
        voicemail. The free plan is for personal use, and Google&apos;s rules
        for it (inactivity reclaim, no 911, no forwarding to automated systems)
        make it a poor foundation for a business line.
      </P>

      <H2 id="how-it-works">How Google Voice works</H2>
      <P>
        A Google Voice number belongs to your Google account, not to a SIM
        card or a phone line. When someone calls it, Voice rings the places you
        told it to:
      </P>
      <UL>
        <LI>
          the Google Voice app on your phone, and voice.google.com in a
          browser;
        </LI>
        <LI>
          up to{" "}
          <Ext href="https://support.google.com/voice/answer/165221?hl=en">
            6 linked numbers
          </Ext>{" "}
          you have verified, such as your mobile;
        </LI>
        <LI>
          on paid plans, a supported desk phone or an analogue adapter (ATA).
        </LI>
      </UL>
      <P>
        Calls run over the internet. Voicemails are transcribed, US calling is
        unlimited, and texting is unlimited in the US only. On the business
        plans, an administrator manages users and numbers from the Google
        Workspace admin console. Google&apos;s calling plan is available in{" "}
        <Ext href="https://knowledge.workspace.google.com/admin/voice/google-voice-and-sip-link-supported-countries">
          14 countries
        </Ext>
        : the US, Canada, the UK, Ireland and ten EU and EFTA countries. The
        free and standalone plans are US only.
      </P>

      <H2 id="plans">Plans and prices</H2>
      <Figure
        src="/blog/google-voice-plans-what-you-get.svg"
        alt="Comparison of Google Voice plans: Free at 0 dollars for personal use with no auto attendant, no ring groups, no recording, no 911 and forwarding to automated systems unsupported; Starter at 10 dollars per user per month for up to 10 users with manual recording and 911; Standard at 20 dollars with unlimited users, auto attendant and ring groups; Premier at 30 dollars with automatic recording. No plan answers a missed call; it goes to voicemail with a transcript."
        width={1200}
        height={660}
        caption="Standard is the first tier with an auto attendant and ring groups. Starter is cheaper, but it is closer to a shared phone number than a phone system."
        credit="Illustration by AI Receptionist Now, from Google's plan table"
        creditUrl="https://support.google.com/voice/answer/9249103?hl=en"
      />
      <Table
        caption="Google Voice plans, US prices from Google's plan table (November 3, 2026)"
        head={["Plan", "Price", "Users", "Needs", "Notable"]}
        rows={[
          ["Google Voice (free)", "$0", "1", "Personal Gmail", "Personal, consumer use; US only"],
          ["Voice Starter (standalone)", "$10/month", "1", "Personal Gmail", "US only; recording, 911"],
          ["Voice Standard (standalone)", "$20/month", "1", "Personal Gmail", "US only; adds auto attendant"],
          ["Voice Starter (add-on)", "$10/user/month", "Up to 10", "Paid Workspace", "No auto attendant or ring groups"],
          ["Voice Standard (add-on)", "$20/user/month", "Unlimited", "Paid Workspace", "Auto attendant, ring groups, queues"],
          ["Voice Premier (add-on)", "$30/user/month", "Unlimited", "Paid Workspace", "Automatic recording, numbers abroad"],
        ]}
      />
      <P>
        Three things the price list doesn&apos;t make obvious. First, the
        add-on prices sit on top of a paid Workspace plan, so a three-person
        team on Starter pays $30 a month for Voice plus three Workspace
        licences. Second, Google says{" "}
        <Ext href="https://knowledge.workspace.google.com/admin/voice/how-voice-billing-works">
          Voice subscriptions are available with a monthly flexible plan
        </Ext>{" "}
        only, so there is no annual discount. Third, if you read the product
        page from Europe you may see lower Standard and Premier prices. The
        page marks those as EMEA-only promotions.
      </P>

      <H2 id="free-for-business">Using free Google Voice for a business</H2>
      <P>
        Plenty of sole traders do it. Before you print the number on a van,
        here is what Google&apos;s own pages say about the free plan.
      </P>
      <OL>
        <LI>
          <Strong>It is meant for personal use.</Strong>{" "}The plan table
          describes it as{" "}
          <Ext href="https://support.google.com/voice/answer/9249103?hl=en">
            for personal, consumer use
          </Ext>
          . It needs another phone number to link to, and it is US only.
        </LI>
        <LI>
          <Strong>An unused number gets taken back.</Strong>{" "}The acceptable
          use policy expects you to keep the number active by{" "}
          <Ext href="https://support.google.com/voice/answer/9230450?hl=en">
            placing calls or sending text messages for a period of 3 months
          </Ext>
          . After Google reclaims a number you have 45 days to get it back. For
          a seasonal business, that is a real risk.
        </LI>
        <LI>
          <Strong>No 911.</Strong>{" "}Google says{" "}
          <Ext href="https://support.google.com/voice/answer/9198172?hl=en">
            emergency calling is only available
          </Ext>{" "}
          on paid Voice accounts, and even then not during a power or internet
          outage.
        </LI>
        <LI>
          <Strong>You can&apos;t forward it to a bot.</Strong>{" "}This is the one
          most people find out too late:
        </LI>
      </OL>
      <Figure
        src="/blog/google-voice-forwarding-automated-system-unsupported.webp"
        alt="Google Voice Help page text: Forwarding calls from your Google Voice number to an automated system is unsupported. Sign up for Google Workspace to use an auto attendant if you need to forward calls to an automated system."
        width={1200}
        height={450}
        caption="This rules out pointing a free Voice number at an AI receptionist, an answering service's automated line or a third-party phone menu. The highlight is ours."
        credit="Screenshot: Google Voice Help, November 3, 2026"
        creditUrl="https://support.google.com/voice/answer/165221?hl=en"
      />
      <P>
        The acceptable use policy adds a second rule in the same direction:
        &quot;Do not forward to phone numbers that aren&apos;t your own or under
        your control.&quot; Texting has limits too. Google says Voice messaging
        is{" "}
        <Ext href="https://support.google.com/voice/answer/115116?hl=en">
          intended only for 1:1, personal conversations
        </Ext>
        , not bulk sends, and that some banks and subscription services
        won&apos;t send codes to Voice numbers at all.
      </P>
      <Callout>
        Our honest read: free Google Voice is fine as a second number for a
        one-person business that answers its own phone. It is a poor choice for
        a number you plan to print, keep for years, or connect to anything
        else.
      </Callout>

      <H2 id="paid">What the paid plans add</H2>
      <H3>Starter ($10): a shared number with the basics</H3>
      <P>
        Up to 10 users, manual call recording, desk phone support and 911. No
        auto attendant, no ring groups. If two people need to answer the same
        line, Starter is the wrong tier.
      </P>
      <H3>Standard ($20): the first real phone system</H3>
      <P>
        This is where Voice gets the features most businesses mean when they
        say &quot;phone system&quot;:
      </P>
      <UL>
        <LI>
          <Strong>Auto attendant.</Strong>{" "}A greeting (text-to-speech or
          your recording), keypad options such as{" "}
          <Ext href="https://knowledge.workspace.google.com/admin/voice/set-up-a-voice-automated-attendant-for-your-organization">
            &quot;For support, press one. For sales, press 2.&quot;
          </Ext>
          , submenus, business hours, holiday closures and an after-hours
          action. A caller can be transferred to a user, a ring group, another
          attendant or another phone number, or sent to voicemail. Google
          documents keypad input only.
        </LI>
        <LI>
          <Strong>Ring groups and queues.</Strong>{" "}Ring several people at
          once, and hold callers in a queue of up to{" "}
          <Ext href="https://knowledge.workspace.google.com/admin/voice/set-up-call-queuing-for-a-ring-group">
            50 callers with a 30-minute maximum wait
          </Ext>
          .
        </LI>
        <LI>
          <Strong>SIP Link</Strong>{" "}to connect existing numbers from another
          carrier.
        </LI>
        <LI>
          <Strong>Gemini call notes.</Strong>{" "}On Standard and Premier, with
          a qualifying Workspace plan, Voice can produce the recording,
          transcript and notes after a call.{" "}
          <Ext href="https://knowledge.workspace.google.com/admin/voice/let-google-voice-take-ai-notes-for-my-users">
            This feature is available only in English.
          </Ext>
        </LI>
      </UL>
      <H3>Premier ($30): compliance and multi-country</H3>
      <P>
        Premier adds{" "}
        <Ext href="https://support.google.com/voice/answer/12009609?hl=en">
          automatic call recording
        </Ext>
        , Google Vault retention, BigQuery export of call data, and numbers in
        countries other than your own. A small business rarely needs it unless
        it has to record every call.
      </P>

      <H2 id="porting">Porting a number in and out</H2>
      <Table
        caption="Google Voice porting, from Google's help pages (November 3, 2026)"
        head={["", "Personal (free/standalone)", "Workspace (business)"]}
        rows={[
          ["Fee to port in", "$20", "None published"],
          ["Which numbers", "Active US mobile numbers only", "Up to 1,000 per request (50 in Canada); no toll-free"],
          ["How long", "Up to 48 hours (texts up to 3 business days)", "10 to 30 business days in the US"],
          ["Porting out", "$3 to unlock, waived if you ported in", "Port-out PIN from the admin console"],
        ]}
      />
      <P>
        Two practical notes. A landline cannot be ported into a personal Google
        Voice account, because Google&apos;s{" "}
        <Ext href="https://support.google.com/voice/answer/1065667?hl=en">
          personal porting page
        </Ext>{" "}
        only accepts an active US mobile number. And Google Voice does not offer
        1-800 numbers, so a business that wants a toll-free number needs
        another provider for it. If you are moving off Voice, our{" "}
        <Internal href="/blog/google-voice-alternatives">
          Google Voice alternatives
        </Internal>{" "}
        guide compares where the number can go.
      </P>

      <H2 id="missed-calls">What no plan does: answer the call you miss</H2>
      <P>
        Every Google Voice plan is built for the case where somebody picks
        up. When nobody does, at lunch, on a job site or after 6 p.m., the
        caller reaches voicemail. Voice transcribes it, and Google is candid
        that{" "}
        <Ext href="https://support.google.com/voice/answer/168515?hl=en">
          voicemail transcripts may be incorrect or missing
        </Ext>
        . The auto attendant routes callers, but it can&apos;t understand what
        they want, answer a question about your hours or prices, or book them
        in.
      </P>
      <P>
        That gap is what an answering service or an AI receptionist fills, and
        the plan you are on decides whether you can connect one:
      </P>
      <UL>
        <LI>
          <Strong>Free Voice:</Strong>{" "}not supported. Google says forwarding
          to an automated system is unsupported. The clean options are to
          give the answering service its own number, or to move the number to
          a provider that allows it.
        </LI>
        <LI>
          <Strong>Standard or Premier:</Strong>{" "}set the auto attendant&apos;s
          after-hours action, or a ring group&apos;s no-answer route, to
          transfer to another phone number: the answering service&apos;s line.
          That is the setup Google documents. Place a test call in each
          time window before you rely on it.
        </LI>
        <LI>
          <Strong>Starter:</Strong>{" "}no auto attendant or ring groups, and
          Google&apos;s pages don&apos;t say how it treats forwarding to an
          automated system. Ask Google support before you build on it.
        </LI>
      </UL>
      <Callout>
        Where we fit, plainly: our AI receptionist comes with its own phone
        number (one on the €99 plan, three on the €299 plan), answers the
        calls that reach it, takes the details, books into Google Calendar or Outlook and
        texts you a summary. It is not a phone system. It has no desk phones,
        extensions or ring groups. A common setup is Voice Standard for the
        team and our number as the after-hours destination. A free Voice number
        forwarded to us is the setup Google says it does not support, so
        please don&apos;t build it.
      </Callout>
      <P>
        If the missed calls are the real problem, the cheapest first step is
        often a better{" "}
        <Internal href="/blog/professional-voicemail-greeting">
          voicemail greeting
        </Internal>{" "}
        or an automatic{" "}
        <Internal href="/blog/missed-call-text-back">
          text back to every missed call
        </Internal>
        . The difference between a phone menu and something that actually
        holds a conversation is explained in{" "}
        <Internal href="/blog/ai-voice-agent-vs-chatbot-vs-ivr">
          AI voice agent vs chatbot vs IVR
        </Internal>
        .
      </P>

      <H2 id="verdict">Who it fits, and who it doesn&apos;t</H2>
      <Table
        caption="Is Google Voice right for your business?"
        head={["Your situation", "Our recommendation"]}
        rows={[
          ["One person, answers their own phone, already on Workspace", "Voice Starter. Cheap and simple"],
          ["Two to ten people sharing a line, needs 'press 1 for sales'", "Voice Standard. Starter has no auto attendant"],
          ["Must record every call for compliance", "Voice Premier"],
          ["Sole trader on the free plan, number printed on the van", "Move to a paid plan or another provider before the number matters"],
          ["Losing calls at lunch, after hours or on jobs", "Voice won't fix it. Add an answering service or AI receptionist on Standard, or use one with its own number"],
          ["Not on Google Workspace, or outside the 14 countries", "Look at the alternatives"],
        ]}
      />

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
