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
  slug: "bilingual-answering-service",
  title: "Bilingual Answering Service: Agents vs Interpreters vs AI",
  description:
    "“Bilingual” can mean four different things. What each costs, which services only staff Spanish in business hours, and a five-call test before you sign.",
  date: "2026-10-01",
  updated: "2026-10-01",
  readingTime: "16 min read",
  tag: "Guides",
  hero: "/blog/bilingual-shop-counter-phone.webp",
  heroAlt:
    "The wooden front counter of a small neighborhood shop in warm afternoon light, a desk phone with its handset lying off the hook beside an open blank notepad, a sunlit city street blurred through the window",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "bilingual answering service",
    "spanish answering service",
    "spanish speaking answering service",
    "bilingual virtual receptionist",
    "bilingual phone answering service",
    "english spanish answering service",
    "bilingual answering service cost",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "four-models", title: "Four things “bilingual” can mean" },
    { id: "published", title: "What vendors actually publish" },
    { id: "interpreter-lines", title: "Interpreter lines: the real numbers" },
    { id: "ai", title: "AI: where it is good, and where it is not" },
    { id: "evidence", title: "What happens to Spanish callers today" },
    { id: "law", title: "When language is a legal question" },
    { id: "test", title: "The five-call test" },
    { id: "choose", title: "Which model fits which business" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is a bilingual answering service?",
      a: "It is an answering service that can handle a caller in more than one language - in the US that almost always means English and Spanish. The phrase hides four different delivery models: a Spanish-speaking agent answers first, an English-speaking agent answers and transfers to a bilingual colleague, an agent conferences in a third-party telephone interpreter, or an AI agent detects the language and replies in it. They differ in wait time, hours of coverage and cost, so ask a vendor which one you are buying before you compare prices.",
    },
    {
      q: "Does a bilingual answering service cost extra?",
      a: "It depends on the vendor, and the published answers vary. As of October 2026 Ruby, Abby Connect, PATLive, Posh and AnswerForce state that English and Spanish answering is included in their plans at no extra charge. Smith.ai transfers Spanish callers to a Spanish-speaking agent at no extra cost but charges $1.00 per call for a dedicated Spanish line. AnswerConnect describes bilingual routing as an add-on with a small additional monthly charge and does not publish the amount. The larger cost difference is usually hours, not surcharge: several services staff Spanish only during the business day.",
    },
    {
      q: "Are Spanish-speaking agents available 24/7?",
      a: "Not everywhere. PATLive publishes English coverage 24/7 and Spanish from 8 a.m. to 10 p.m. Eastern. Posh publishes bilingual receptionists Monday to Friday, 8 a.m. to 6 p.m. Eastern, with a Spanish voicemail greeting or an English-speaking receptionist outside those hours. AnsweringService.com publishes Spanish from 5 a.m. to 8 p.m. Mountain time, and ReceptionHQ publishes Spanish during core business hours. Others, including Abby Connect, AnswerForce and Smith.ai, state round-the-clock Spanish. Check the vendor's own page, then test it with a real call on a Saturday night.",
    },
    {
      q: "How much does a telephone interpreter cost per minute?",
      a: "Published retail rates are a few dollars a minute. LanguageLine's pay-as-you-go service lists $3.95 per minute for audio interpreting with no contract or monthly minimum, and Propio sells a prepaid block of 1,000 minutes for $1,000. Volume contracts are far cheaper - a Minnesota Department of Commerce contract sheet lists LanguageLine phone interpretation at $1.05 per minute. Interpreted calls are conducted consecutively, with each side waiting for the interpreter, so they also run longer than a same-language call.",
    },
    {
      q: "Can an AI answering service handle Spanish?",
      a: "For clean, single-language Spanish, yes - current speech recognition is roughly as accurate in Spanish as in English on standard benchmarks. The weak spot is code-switching. In a Pew Research Center survey 63% of US Latinos said they use Spanglish at least sometimes, and published research puts speech recognition error rates on Spanish-English code-switched telephone speech several times higher than on monolingual Spanish. A good setup lets a caller reach a bilingual human whenever the AI is struggling, and you should test it with the way your customers actually talk.",
    },
    {
      q: "Is an interpreter or an AI enough to meet legal language requirements?",
      a: "For most private businesses there is no general federal duty to answer the phone in Spanish. There are specific rules that do bite: health programs that receive federal funds must take reasonable steps to provide meaningful access under 45 CFR 92.201, including a qualified interpreter, and California Civil Code 1632 requires a translated contract when certain consumer agreements are negotiated primarily in Spanish, Chinese, Tagalog, Vietnamese or Korean. An answering service does not discharge either duty by itself. This is general information, not legal advice.",
    },
    {
      q: "What about languages other than Spanish?",
      a: "Most US answering services staff English and Spanish only. A few publish an interpreter layer for everything else: Anserve states it provides live Spanish-speaking agents plus access to over 200 additional languages through professional interpretation services, and AnswerNet states it employs native speakers of English, French and Spanish and uses a translation service for other languages. AI agents cover more languages out of the box - the platform we build on documents 31 - but accuracy varies by language, so the same advice applies: test the language your callers speak.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "U.S. Census Bureau: Language Use in the United States: 2019 (ACS-50, Dietrich and Hernandez, August 2022)",
    url: "https://www.census.gov/content/dam/Census/library/publications/2022/acs/acs-50.pdf",
  },
  {
    title:
      "U.S. Census Bureau: American Community Survey 2024 1-year estimates, table C16001, Language Spoken at Home for the Population 5 Years and Over",
    url: "https://data.census.gov/table/ACSDT1Y2024.C16001",
  },
  {
    title:
      "Chen et al., Access to Cancer Care for Simulated English-, Spanish- and Mandarin-Speaking Patient Callers, JAMA Network Open 2024;7(6):e2415587",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11161839/",
  },
  {
    title:
      "Pew Research Center: Latinos' Views of and Experiences With the Spanish Language (September 20, 2023)",
    url: "https://www.pewresearch.org/race-and-ethnicity/2023/09/20/latinos-views-of-and-experiences-with-the-spanish-language/",
  },
  {
    title:
      "Radford et al., Robust Speech Recognition via Large-Scale Weak Supervision (the Whisper paper), arXiv:2212.04356",
    url: "https://arxiv.org/abs/2212.04356",
  },
  {
    title:
      "Ugan et al., PIER: A Novel Metric for Evaluating What Matters in Code-Switching, arXiv:2501.09512",
    url: "https://arxiv.org/abs/2501.09512",
  },
  {
    title:
      "45 CFR 92.201 - Meaningful access for individuals with limited English proficiency (eCFR)",
    url: "https://www.ecfr.gov/current/title-45/section-92.201",
  },
  {
    title:
      "California Civil Code section 1632 - translation of contracts negotiated in Spanish, Chinese, Tagalog, Vietnamese or Korean",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1632",
  },
  {
    title:
      "16 CFR 429.1 - FTC Cooling-Off Rule: contract in the language of the oral sales presentation (eCFR)",
    url: "https://www.ecfr.gov/current/title-16/section-429.1",
  },
  {
    title:
      "Executive Order 14224, Designating English as the Official Language of the United States (Federal Register, March 6, 2025)",
    url: "https://www.federalregister.gov/documents/2025/03/06/2025-03694/designating-english-as-the-official-language-of-the-united-states",
  },
  {
    title:
      "LanguageLine Solutions: pay-as-you-go interpreting services (published per-minute rate)",
    url: "https://www.languageline.com/interpreting-services/pay-as-you-go-interpreting-services",
  },
  {
    title:
      "Minnesota Department of Commerce: LanguageLine contract information sheet (state contract per-minute rate)",
    url: "https://mn.gov/commerce-stat/pdfs/language-line-info.pdf",
  },
  {
    title: "Propio Pass: prepaid interpreting minutes",
    url: "https://propio.com/propio-pass/",
  },
  {
    title:
      "Smith.ai help center: Have all your calls answered by Spanish-speaking bilingual receptionists",
    url: "https://docs.smith.ai/article/94ugqtj36b-have-all-your-calls-answered-by-spanish-speaking-bilingual-receptionists",
  },
  {
    title: "Ruby: bilingual answering service",
    url: "https://www.ruby.com/bilingual-answering-service/",
  },
  {
    title: "PATLive: bilingual receptionists",
    url: "https://www.patlive.com/solutions/bilingual-receptionists/",
  },
  {
    title: "Posh: bilingual answering service",
    url: "https://posh.com/services/bilingual-answering-service/",
  },
  {
    title: "Abby Connect: bilingual answering",
    url: "https://www.abby.com/use-cases/bilingual-answering/",
  },
  {
    title: "AnswerConnect: bilingual answering service",
    url: "https://www.answerconnect.com/services/answering-services/bilingual-answering-service",
  },
  {
    title: "ElevenLabs Agents documentation: language detection system tool",
    url: "https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/language-detection",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Every answering service in the United States says it is bilingual. Put
        the pages side by side and the word turns out to describe four different
        things: a Spanish speaker who picks up, an English speaker who transfers
        you, a three-way call with an interpreter, or software. They do not cost
        the same, they are not open the same hours, and only some of them
        survive a caller who switches language halfway through a sentence. We
        sell the software kind, so read this with that in mind - we have linked
        every vendor claim to the vendor&apos;s own page so you can check us.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            Ask <Strong>who speaks Spanish, and when they join the call</Strong>.
            That one question separates the four models.
          </>,
          <>
            The surcharge is rarely the catch. <Strong>The hours are</Strong>:
            several well-known services publish Spanish coverage that stops in
            the evening or at the weekend.
          </>,
          <>
            A telephone interpreter is a real option for rare languages, at a
            published retail rate of <Strong>$3.95 a minute</Strong> on top of
            whatever your answering service bills.
          </>,
          <>
            AI is strong on clean Spanish and <Strong>measurably weaker on
            Spanglish</Strong>. Test it the way your callers talk, and keep a
            human exit.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        A <Strong>bilingual answering service</Strong> takes your calls in
        English and at least one other language, which in the US nearly always
        means Spanish. The need is not marginal. The Census Bureau&apos;s most
        recent language report counted{" "}
        <Ext href="https://www.census.gov/content/dam/Census/library/publications/2022/acs/acs-50.pdf">
          41.8 million people aged five and over who spoke Spanish at home in
          2019
        </Ext>
        , of whom 61.4% reported speaking English &quot;very well&quot; - which
        leaves roughly four in ten who did not. The{" "}
        <Ext href="https://data.census.gov/table/ACSDT1Y2024.C16001">
          2024 American Community Survey (table C16001)
        </Ext>{" "}
        puts the figure at 44.9 million Spanish speakers, 18.4 million of whom
        speak English less than &quot;very well&quot;.
      </P>
      <P>
        If you only remember one thing from this guide: the price difference
        between vendors is smaller than the difference in what happens to a
        Spanish-speaking caller at 9 p.m. on a Saturday. Some services answer in
        Spanish. Some play a Spanish voicemail greeting. You find out which by
        reading the hours on the vendor&apos;s own bilingual page, and then by
        calling.
      </P>

      <H2 id="four-models">Four things &quot;bilingual&quot; can mean</H2>
      <Figure
        src="/blog/bilingual-four-models.svg"
        alt="A diagram of four ways an answering service handles a Spanish-speaking caller. One: a Spanish-speaking agent answers first, via a dedicated line or a press-2 menu. Two: an English-speaking agent answers, recognises Spanish and transfers to a bilingual colleague. Three: an agent conferences in a third-party telephone interpreter and every sentence is spoken twice. Four: an AI agent detects the language from the caller's first words and replies in it"
        width={1200}
        height={630}
        caption="The same word on four pricing pages. The caller's experience in the first thirty seconds is different in each one - and so is your bill."
        credit="Illustration by AI Receptionist Now"
      />
      <Table
        caption="The four delivery models behind the word “bilingual”"
        head={["Model", "What the caller experiences", "Where it breaks"]}
        rows={[
          [
            <Strong key="m1">1. Spanish-speaking agent answers first</Strong>,
            "A menu (“para español, oprima 2”) or a separate number routes the call to a bilingual agent, who greets in Spanish",
            "Only as good as the staffing rota - check the published Spanish hours. A dedicated line can carry a per-call fee",
          ],
          [
            <Strong key="m2">2. English agent, then a transfer</Strong>,
            "An English-speaking agent answers, hears Spanish, says “un momento, por favor” and transfers to a bilingual colleague",
            "The caller's first experience is not being understood. If no bilingual agent is free, the fallback is often voicemail",
          ],
          [
            <Strong key="m3">3. Third-party interpreter line</Strong>,
            "The agent identifies the language, dials an interpreting service and runs a three-way call; every sentence is spoken twice",
            "Slow and metered twice - the answering service's minutes plus the interpreter's. Realistic for rare languages, expensive for Spanish volume",
          ],
          [
            <Strong key="m4">4. AI language detection</Strong>,
            "The agent greets, hears the caller's first words and continues in that language without a menu",
            "Code-switching, strong regional accents, bad lines. Needs a tested route to a bilingual human",
          ],
        ]}
      />
      <P>
        None of these is dishonest. The problem is that a landing page rarely
        says which one you are buying, and the two cheapest-looking options -
        model 2 with thin staffing, and model 3 for a language your callers use
        every day - are the ones that feel worst to the caller.
      </P>
      <P>
        Ruby is unusually direct about running model 2. Its{" "}
        <Ext href="https://www.ruby.com/bilingual-answering-service/">
          bilingual page
        </Ext>{" "}
        states that &quot;not all Ruby receptionists are bilingual&quot;, and
        that a receptionist who only speaks English will say &quot;un momento,
        por favor&quot; and transfer the call to a bilingual coworker. That is a
        clear description of what you get, and more than most vendors offer.
      </P>

      <H2 id="published">What vendors actually publish</H2>
      <P>
        We read the bilingual, pricing and help pages of the services below on
        October 1, 2026 and recorded only what each company states about
        itself. Where a company publishes nothing on a point, the table says so
        rather than guessing. Vendors change these pages; follow the link before
        you rely on a row.
      </P>
      <Table
        caption="Spanish coverage as published by each vendor (checked October 1, 2026)"
        head={["Service", "Spanish hours", "Extra cost for Spanish", "How the caller reaches Spanish"]}
        rows={[
          [
            <Ext key="ruby" href="https://www.ruby.com/bilingual-answering-service/">Ruby</Ext>,
            "Bilingual page says 24/7 for incoming calls; its FAQ elsewhere gives weekday hours for bilingual service - ask which applies to your plan",
            "Included in all plans at no additional cost",
            "English-speaking receptionist transfers to a bilingual coworker",
          ],
          [
            <Ext key="smith" href="https://docs.smith.ai/article/94ugqtj36b-have-all-your-calls-answered-by-spanish-speaking-bilingual-receptionists">Smith.ai</Ext>,
            "Spanish-speaking agents online 24/7; if none is available the call goes to a voicemail with a Spanish greeting",
            "Transfer to a Spanish-speaking agent at no extra cost; dedicated Spanish line is an add-on at $1.00 per call",
            "Transfer by default; dedicated line works best behind a press-1/press-2 menu you set up yourself",
          ],
          [
            <Ext key="patlive" href="https://www.patlive.com/solutions/bilingual-receptionists/">PATLive</Ext>,
            "English 24/7; Spanish 8 a.m. to 10 p.m. Eastern",
            "No extra charge",
            <>
              Auto attendant: press 1 for English, 2 for Spanish (
              <Ext href="https://help.patlive.com/bilingual-services">help page</Ext>
              ). Messages are written in English
            </>,
          ],
          [
            <Ext key="posh" href="https://posh.com/services/bilingual-answering-service/">Posh</Ext>,
            "Monday to Friday, 8 a.m. to 6 p.m. Eastern; otherwise a Spanish voicemail greeting or an English-speaking receptionist",
            "Included in all plans",
            "Not published",
          ],
          [
            <Ext key="abby" href="https://www.abby.com/use-cases/bilingual-answering/">Abby Connect</Ext>,
            "Day and night, weekends and holidays; overnight calls can go to its AI receptionist, human receptionists, or both",
            "Included on every plan at no additional charge",
            "Not published",
          ],
          [
            <Ext key="ac" href="https://www.answerconnect.com/services/answering-services/bilingual-answering-service">AnswerConnect</Ext>,
            "Bilingual receptionists “around the clock”",
            "Add-on with “a small additional charge per month”; amount not published",
            "Two tiers: transfer from an English-speaking associate, or direct routing to a bilingual receptionist when one is available",
          ],
          [
            <Ext key="af" href="https://www.answerforce.com/blog/bilingual-call-answering-faqs/">AnswerForce</Ext>,
            "24/7 in English and Spanish",
            "Part of the monthly plan",
            "Not published",
          ],
          [
            <Ext key="rhq" href="https://www.receptionhq.com/service/live-call-answering/bilingual-answering/">ReceptionHQ</Ext>,
            "English around the clock; Spanish during core business hours",
            "After-hours surcharges apply to bilingual answering on weekends and federal holidays",
            "Not published",
          ],
          [
            <Ext key="asc" href="https://answeringservice.com/solutions/bilingual-virtual-reception/">AnsweringService.com</Ext>,
            "English 24 hours; Spanish 5 a.m. to 8 p.m. Mountain time",
            "Not published",
            "Not published",
          ],
        ]}
      />
      <P>Three patterns are worth pulling out of that table.</P>
      <UL>
        <LI>
          <Strong>&quot;Included at no extra cost&quot; is now the norm.</Strong>{" "}
          Five of the nine say so in writing. If a salesperson quotes you a
          Spanish surcharge, you have alternatives.
        </LI>
        <LI>
          <Strong>Hours are the real variable.</Strong> Four of the nine publish
          Spanish coverage that is narrower than their English coverage. A
          plumber whose emergency calls arrive at night is buying something
          quite different from PATLive than from a service staffed in Spanish
          around the clock - and both pages say &quot;bilingual&quot; at the
          top.
        </LI>
        <LI>
          <Strong>The message comes back in English.</Strong> PATLive states
          that all messages are written in English even when the call was in
          Spanish, and Ruby says it relays the message back in English. That is
          usually what an English-speaking owner wants, but it means the quality
          of the translation in the message is the agent&apos;s, and you will
          not see the original words.
        </LI>
      </UL>
      <Callout>
        One thing we could not find on any of these pages: the name of an
        interpreter provider, or a statement of how long a Spanish caller waits
        compared with an English one. Both are fair questions to put in writing
        before you sign.
      </Callout>

      <Figure
        src="/blog/bilingual-caller-kitchen-call.webp"
        alt="A woman standing at a kitchen counter holding a phone to her ear and listening, her other hand resting on the worktop beside a puddle of water next to the sink and a folded towel"
        width={1376}
        height={768}
        caption="The call this is all about: a problem that will not wait, described by someone who would rather describe it in Spanish. What she hears in the first ten seconds decides whether she stays on the line."
      />

      <H2 id="interpreter-lines">Interpreter lines: the real numbers</H2>
      <P>
        For languages other than Spanish, most services either do not offer
        anything or bring in a telephone interpreter.{" "}
        <Ext href="https://www.anserve.com/services-offered/multilingual-answering-service/">
          Anserve
        </Ext>{" "}
        says so plainly: live Spanish-speaking agents, plus &quot;access to over
        200 additional languages through professional interpretation
        services&quot;. It is a legitimate model, and it is worth knowing what
        it costs when you buy it directly.
      </P>
      <Table
        caption="Published telephone interpreting rates (checked October 1, 2026)"
        head={["Provider", "Published rate", "Notes"]}
        rows={[
          [
            <Ext key="ll" href="https://www.languageline.com/interpreting-services/pay-as-you-go-interpreting-services">LanguageLine, pay-as-you-go</Ext>,
            "$3.95 per minute, audio",
            "No contract, setup fee or monthly minimum. Retail rate for occasional users",
          ],
          [
            <Ext key="llmn" href="https://mn.gov/commerce-stat/pdfs/language-line-info.pdf">LanguageLine, Minnesota state contract</Ext>,
            "$1.05 per minute, phone",
            "Shows how far a volume contract sits below retail. Not available to you; useful as a benchmark",
          ],
          [
            <Ext key="propio" href="https://propio.com/propio-pass/">Propio Pass</Ext>,
            "$1,000 for 1,000 minutes",
            "Prepaid; unused minutes expire after 12 months. Interpreters for popular languages “typically found in 30 seconds or less”",
          ],
          [
            <Ext key="cli" href="https://certifiedlanguages.com/faqs/">Certified Languages International</Ext>,
            "Not published",
            "Per-minute price depends on estimated monthly volume and language mix",
          ],
        ]}
      />
      <P>
        Two mechanical points matter more than the rate. First, an interpreted
        call is consecutive: the caller speaks, the interpreter repeats it, the
        agent answers, the interpreter repeats that. Every sentence is said
        twice, so the call is longer, and if your answering service bills by the
        minute you are paying its meter and the interpreter&apos;s at the same
        time. We have not found a credible published figure for how much longer,
        so we are not going to give you one.
      </P>
      <P>
        Second, the traditional workflow puts the delay at the worst moment.
        LanguageLine&apos;s own description of it is that{" "}
        <Ext href="https://www.languageline.com/interpreting-services/inbound-call-interpreting-services">
          &quot;staff often answer the call first, identify the caller&apos;s
          language, and then connect an interpreter, creating delays and added
          complexity&quot;
        </Ext>
        . For a Vietnamese-speaking caller once a month that is an acceptable
        trade. For Spanish in Houston it is not.
      </P>

      <H2 id="ai">AI: where it is good, and where it is not</H2>
      <P>
        This is the model we build, so here is the evidence in both directions.
      </P>
      <H3>The case for it</H3>
      <P>
        On clean, single-language speech, recognition accuracy in Spanish is not
        the weak link. The{" "}
        <Ext href="https://arxiv.org/abs/2212.04356">
          paper that introduced OpenAI&apos;s Whisper model
        </Ext>{" "}
        reports word error rates for its large-v2 model of 4.2% in English and
        3.0% in Spanish on the FLEURS benchmark, and 9.4% against 5.6% on Common
        Voice. Spanish is among the best-served languages in every major speech
        stack. Add the two structural advantages of software - the Spanish
        &quot;shift&quot; never ends, and the tenth simultaneous caller gets the
        same answer speed as the first - and you have a real answer to the
        coverage-hours problem in the table above.
      </P>
      <H3>The case against it</H3>
      <P>
        Real callers do not speak benchmark Spanish. In a{" "}
        <Ext href="https://www.pewresearch.org/race-and-ethnicity/2023/09/20/latinos-views-of-and-experiences-with-the-spanish-language/">
          2023 Pew Research Center survey
        </Ext>
        , 63% of US Latinos said they use Spanglish at least sometimes, and 40%
        said they do so often. That is exactly the condition speech recognition
        handles worst. A{" "}
        <Ext href="https://arxiv.org/abs/2501.09512">
          2025 study of code-switching
        </Ext>{" "}
        measured Whisper large-v3 at a 4.9% word error rate on monolingual
        Spanish and 29.4% on a Spanish-English code-switched telephone corpus.
        Part of that gap is the telephone audio rather than the switching, as
        the comparison is between read speech and conversational calls - but a
        phone line is where an answering service lives, so the combined number
        is the relevant one.
      </P>
      <P>
        Automatic language detection has its own failure mode. The platform our
        own agents run on documents that its language-detection tool{" "}
        <Ext href="https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/language-detection">
          &quot;is not enabled automatically&quot;
        </Ext>{" "}
        and warns that &quot;background speech or an unusual accent can
        occasionally trigger a switch the caller did not intend&quot;. A
        television in Spanish behind an English-speaking caller is a realistic
        way to produce that. It is fixable in configuration, and it is a thing
        to test rather than assume.
      </P>
      <Callout>
        Our honest position: AI is the best answer to &quot;nobody speaks
        Spanish here after 6 p.m.&quot; and a poor answer to &quot;this caller is
        upset, switching languages, and on a bad line&quot;. A setup that cannot
        hand that second caller to a bilingual person is not finished.
      </Callout>
      <P>
        How detection and voice work in practice, and how to configure the
        hand-off, is covered in our{" "}
        <Internal href="/blog/bilingual-ai-receptionist">
          bilingual AI receptionist guide
        </Internal>
        ; the list of supported languages is in{" "}
        <Internal href="/answers/what-languages-can-an-ai-receptionist-speak">
          what languages an AI receptionist can speak
        </Internal>
        .
      </P>

      <H2 id="evidence">What happens to Spanish callers today</H2>
      <P>
        There is surprisingly little published research on what English-only
        phone lines cost ordinary businesses, and we are not going to quote a
        vendor statistic to fill the gap. The best evidence comes from
        healthcare, where researchers have run the experiment properly.
      </P>
      <P>
        In a{" "}
        <Ext href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11161839/">
          cross-sectional audit study published in JAMA Network Open in 2024
        </Ext>
        , trained callers posing as new patients rang 479 clinic numbers 985
        times in English, Spanish and Mandarin, asking for a cancer care
        appointment. English-speaking callers got an appointment date or
        scheduling information on 61.4% of calls. Spanish-speaking callers did
        on 36.4%. Mandarin-speaking callers did on 19.0%. Nearly half of the
        Spanish and Mandarin calls - 291 of 586 - ended because of a language
        barrier, and the authors broke that down:
      </P>
      <UL>
        <LI>
          <Strong>151 calls</Strong>: the caller was told no, or was hung up on.
        </LI>
        <LI>
          <Strong>110 calls</Strong>: the caller was disconnected because an
          automated message needed input and gave no instructions in their
          language.
        </LI>
        <LI>
          <Strong>30 calls</Strong>: the caller reached interpreter services and
          still could not get further help.
        </LI>
      </UL>
      <P>
        These were hospital-affiliated clinics with language-access obligations
        and budgets, not small businesses. Read the three bullets as a list of
        what to test for: a person who cannot cope, a menu that only speaks
        English, and an interpreter hand-off that technically happens and
        practically fails. All three exist in answering services too.
      </P>

      <H2 id="law">When language is a legal question</H2>
      <P>
        Most private businesses have no general federal obligation to answer the
        phone in Spanish, and a lot of marketing copy in this space overstates
        the law. The landscape also changed in 2025, so older articles are
        unreliable.{" "}
        <Ext href="https://www.federalregister.gov/documents/2025/03/06/2025-03694/designating-english-as-the-official-language-of-the-united-states">
          Executive Order 14224
        </Ext>{" "}
        revoked Executive Order 13166, the 2000 order behind most federal
        limited-English-proficiency guidance, and the Department of Justice has
        since rescinded its guidance under it. The points below are the narrower
        rules that still apply on their own terms. This is general information,
        not legal advice.
      </P>
      <UL>
        <LI>
          <Strong>Healthcare that receives federal funds.</Strong> Under{" "}
          <Ext href="https://www.ecfr.gov/current/title-45/section-92.201">
            45 CFR 92.201
          </Ext>
          , a covered entity &quot;must take reasonable steps to provide
          meaningful access to each individual with limited English
          proficiency&quot;, and where interpreting is the reasonable step it
          &quot;must offer a qualified interpreter&quot;. The same section says
          that when machine translation is used for text that is critical to a
          person&apos;s rights, benefits or meaningful access, &quot;the
          translation must be reviewed by a qualified human translator&quot;.
          That sentence is written about translated text; the rule does not
          address AI voice agents directly, and whether an AI phone agent
          satisfies the interpreter requirement is a question for your
          compliance counsel, not for a vendor.
        </LI>
        <LI>
          <Strong>California contracts.</Strong>{" "}
          <Ext href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1632">
            Civil Code section 1632
          </Ext>{" "}
          applies to a business that &quot;negotiates primarily in Spanish,
          Chinese, Tagalog, Vietnamese, or Korean&quot; when entering certain
          agreements - among them auto and retail instalment contracts, consumer
          loans, residential leases longer than a month and legal services fee
          agreements. The business must hand over a translation of the contract
          before it is signed. If your answering service negotiates terms in
          Spanish on your behalf, that can be what triggers the duty.
        </LI>
        <LI>
          <Strong>Door-to-door and similar sales.</Strong> The FTC&apos;s
          Cooling-Off Rule,{" "}
          <Ext href="https://www.ecfr.gov/current/title-16/section-429.1">
            16 CFR 429.1
          </Ext>
          , makes it an unfair practice to fail to give the buyer a contract
          &quot;in the same language, e.g., Spanish, as that principally used in
          the oral sales presentation&quot;.
        </LI>
      </UL>
      <P>
        The practical rule that falls out of all three: a script in any language
        should take the message, book the visit and answer factual questions. It
        should not quote binding terms in a language your paperwork does not
        exist in.
      </P>

      <H2 id="test">The five-call test</H2>
      <P>
        Demos are run in English by a salesperson at 2 p.m. on a Tuesday. Run
        these five calls yourself, or have a Spanish-speaking employee or friend
        run them, on a trial account before you commit. Each one targets a
        failure from the sections above.
      </P>
      <OL>
        <LI>
          <Strong>Saturday, 9 p.m., Spanish only.</Strong> Say nothing in
          English. Time how long it takes until someone - or something - answers
          you in Spanish. A Spanish voicemail greeting is a fail for an
          emergency trade.
        </LI>
        <LI>
          <Strong>The Spanglish call.</Strong> &quot;Hola, necesito un
          appointment para el lunes, pero no sé si mi insurance lo cubre.&quot;
          Check whether the request and the day survive into the message you
          receive.
        </LI>
        <LI>
          <Strong>Names and numbers.</Strong> Give a two-surname name, a street
          name with an ñ or an accent, and a phone number read the Spanish way,
          in pairs. This is where bookings quietly go wrong: the call sounds
          fine and the callback number is off by a digit.
        </LI>
        <LI>
          <Strong>Read the message.</Strong> Compare what you said with what
          arrived in English. You are testing the translation in the summary,
          which is the only part of the call you will ever see.
        </LI>
        <LI>
          <Strong>Ask for a person.</Strong> &quot;¿Puedo hablar con una
          persona?&quot; Whatever answered, find out what happens next and how
          long it takes. With an AI agent this is the most important of the five
          (
          <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
            how transfers to a human work
          </Internal>
          ).
        </LI>
      </OL>
      <P>
        Five calls take under an hour and tell you more than any comparison
        table, including the one in this article.
      </P>

      <H2 id="choose">Which model fits which business</H2>
      <Table
        caption="Matching the delivery model to your call pattern"
        head={["Your situation", "What tends to fit", "Why"]}
        rows={[
          [
            "A steady share of Spanish calls, mostly in business hours",
            "A live service that includes Spanish at no extra cost and routes directly to a bilingual agent",
            "Human nuance where it helps most; limited Spanish hours do not hurt you",
          ],
          [
            "Spanish calls at night and weekends - emergency trades, towing, property management",
            "A service that publishes 24/7 Spanish staffing, or an AI agent with a bilingual human escalation",
            "Coverage hours are the constraint, and several live services stop staffing Spanish in the evening",
          ],
          [
            "Occasional calls in many languages",
            "Any solid English and Spanish service, plus an interpreter line used on demand",
            "At a few calls a month, $3.95 a minute is cheaper than a specialist plan",
          ],
          [
            "Healthcare, legal, or anything where the words carry liability",
            "Qualified bilingual staff or a qualified interpreter for the substantive conversation; scripts and AI for scheduling and intake only",
            "The legal standards above are about accuracy and qualification, not availability",
          ],
          [
            "Callers who mix English and Spanish freely",
            "A bilingual human first, or an AI agent you have personally tested with code-switched calls",
            "This is the measured weak point of speech recognition",
          ],
        ]}
      />
      <P>
        For the money side, per-minute and per-call billing are explained in our{" "}
        <Internal href="/blog/answering-service-cost">
          answering service cost guide
        </Internal>
        , and our own flat monthly plans, which include Spanish and the other
        supported languages without a surcharge, are on the{" "}
        <Internal href="/pricing">pricing page</Internal>. If nights and
        weekends are the gap, the{" "}
        <Internal href="/blog/after-hours-answering-service">
          after-hours answering guide
        </Internal>{" "}
        covers how to split coverage between a daytime team and an overnight
        service.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
