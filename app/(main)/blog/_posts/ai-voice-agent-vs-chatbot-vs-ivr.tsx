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
  slug: "ai-voice-agent-vs-chatbot-vs-ivr",
  title: "AI Voice Agent vs Chatbot vs IVR: Which One Answers Your Phone?",
  description:
    "Four different products are sold as conversational AI for phone calls. What separates a voice agent from a chatbot with a voice bolted on, why the phone is harder than a chat window, and seven things to try on a demo call.",
  date: "2026-08-12",
  updated: "2026-08-12",
  readingTime: "15 min read",
  tag: "Guides",
  hero: "/blog/voice-agent-vs-chatbot-hero.webp",
  heroAlt:
    "A person sitting alone in a quiet office at dusk holding a phone to their ear mid-sentence, one hand raised as if interrupting the other speaker",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "ai voice agent",
    "conversational ai phone",
    "ai voice assistant",
    "voice ai vs chatbot",
    "ai voice agent vs ivr",
    "conversational ai vs ivr",
    "what is a voice ai agent",
    "ai phone agent",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "four-things", title: "Four things sold as the same thing" },
    { id: "assistant-vs-agent", title: "Assistant, agent, and the tool-call test" },
    { id: "why-voice-is-hard", title: "Why the phone is harder than the chat box" },
    { id: "demo-tests", title: "Seven things to try on a demo call" },
    { id: "where-each-wins", title: "Where each one is genuinely right" },
    { id: "limits", title: "Where voice agents still lose" },
    { id: "glossary", title: "The words vendors use" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "What is an AI voice agent?",
      a: "A system that holds a spoken conversation over a live audio connection and can take actions during it. Audio streams in both directions continuously, so it can be interrupted mid-sentence, and it is wired to tools - a calendar, a CRM, a scheduling system - so it can look something up or write something down while the caller is still on the line. The two halves matter equally: something that converses beautifully but cannot write anything is an assistant, not an agent.",
    },
    {
      q: "What is the difference between a voice AI agent and a chatbot?",
      a: "A chatbot is turn-based and text-native: it waits for a complete message, then produces a complete reply. Bolt speech synthesis onto one and you get something that talks but cannot be interrupted, cannot handle two people speaking at once, and has no notion of a pause meaning “go on”. A voice agent is built around continuous audio and turn-taking, which is why interrupting it actually stops it. On a phone line that difference is not cosmetic - callers interrupt constantly.",
    },
    {
      q: "Is conversational AI the same as IVR?",
      a: "No, though the marketing overlaps heavily. Classic IVR routes on keypresses and plays recordings. Conversational IVR adds speech recognition but still maps what you said onto a fixed list of intents, so anything outside the list gets the same prompt repeated back at you. A conversational AI agent generates its answers rather than selecting them, and can act on them. A useful field test: ask something the menu was never designed for and see whether you get an answer or the prompt again.",
    },
    {
      q: "Is an AI receptionist a voice agent?",
      a: "It should be. “AI receptionist” describes packaging rather than architecture - a voice agent set up for one business's phone line, with the greeting, the hours, the FAQ, the booking rules and the escalation path already configured. Plenty of products using the name are still conversational IVR or a chatbot with a voice, which is why the demo call tells you more than the feature list.",
    },
    {
      q: "How fast does an AI voice agent have to reply?",
      a: "Faster than most people expect. Cross-linguistic research on human conversation finds response gaps clustering around 200 milliseconds, and the ITU's telephony guidance treats 150 ms of one-way delay as the point below which a call feels transparent. Nobody hits those numbers with speech recognition, a language model and speech synthesis in the loop. In practice we treat roughly 800 ms from the caller's last syllable to the first syllable of the reply as the line between brisk and obviously a machine - and the network has already spent part of that budget before the AI does anything.",
    },
    {
      q: "Can a voice agent transfer a call to a person?",
      a: "Yes, and how it does it is worth asking about. A cold transfer dumps the caller onto another ringing line and hopes. A warm transfer briefs the person first - who is calling, what they want, what has already been said - so the caller does not repeat themselves. If nobody picks up, the agent should come back on the line rather than leaving the caller in silence. Ask a vendor to demonstrate the failed-transfer path, not the happy one.",
    },
    {
      q: "Do callers need to be told they are talking to an AI?",
      a: "Disclosure rules vary by jurisdiction and by what the call is doing, and several US states have introduced requirements around automated callers, so treat this as something to check locally rather than assume. Separately from the law: a short, plain disclosure in the greeting costs nothing and tends to improve calls, because callers who know they are talking to software speak more directly and are less annoyed when it hands them to a human.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title:
      "Stivers et al., Universals and cultural variation in turn-taking in conversation (PNAS, 2009)",
    url: "https://www.pnas.org/doi/10.1073/pnas.0903616106",
  },
  {
    title:
      "ITU-T Recommendation G.114: One-way transmission time (International Telecommunication Union)",
    url: "https://www.itu.int/rec/T-REC-G.114-200305-I/en",
  },
  {
    title: "Twilio: Conversation Relay documentation (voice AI over a WebSocket)",
    url: "https://www.twilio.com/docs/voice/conversationrelay",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Four genuinely different products are being sold under the same handful
        of words: voice AI, conversational AI, voice assistant, AI agent, AI
        receptionist. They can look identical on a pricing page and sound
        identical in a scripted demo video. On a real phone call, with a real
        caller who interrupts and changes their mind, they behave nothing alike.
        We build the last kind, so treat this as an interested party&apos;s
        guide - but the tests at the end work on us as well as on anyone else,
        and they take one phone call.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>IVR selects, an agent generates.</Strong> A phone menu -
            with or without speech recognition - matches you against a fixed
            list. A conversational AI agent composes an answer, which is why it
            can handle the question nobody anticipated.
          </>,
          <>
            <Strong>The interruption test settles it in ten seconds.</Strong>{" "}
            Talk over the system mid-sentence. A voice agent stops and listens; a
            chatbot with speech synthesis bolted on keeps talking to the end of
            its paragraph.
          </>,
          <>
            <Strong>Assistant answers, agent acts.</Strong> The labour saving
            lives entirely in the writes - booking the slot, creating the ticket,
            paging the on-call person - and most demos quietly stay on the read-only
            side.
          </>,
          <>
            <Strong>Voice is harder than chat for reasons that are not about
            the model.</Strong> Human turn-taking runs on roughly 200 ms gaps,
            phone audio is narrowband, and there is no backspace, no scrollback
            and no way to show a form.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        <Strong>
          An AI voice agent holds a real-time spoken conversation and can take
          actions during it. A chatbot exchanges complete messages, one turn at a
          time, and a voice on top of it does not change that. An IVR does not
          converse at all - it routes you against a list somebody wrote in
          advance.
        </Strong>{" "}
        Everything else in this article is detail, but the detail is where money
        gets wasted, because the three are priced as if they were the same
        product and are usually demonstrated in ways that hide the difference.
      </P>
      <P>
        The confusion is not anyone&apos;s fault. &quot;Conversational AI&quot;
        was coined for the intent-matching systems of the 2010s and then
        inherited by generative models that work nothing like them. &quot;Voice
        assistant&quot; means both a smart speaker and a phone agent that books
        appointments. And &quot;agent&quot; has been applied to everything from
        a support macro to a system with write access to your calendar. Vendors
        did not conspire; the vocabulary just drifted faster than the products.
      </P>

      <H2 id="four-things">Four things sold as the same thing</H2>
      <Figure
        src="/blog/voice-agent-four-tiers.svg"
        alt="Four cards comparing a phone menu or IVR, a conversational IVR, a chatbot with a voice bolted on, and a voice AI agent - each with what it can do, what it cannot do, and the tell-tale sign on a demo call"
        width={1200}
        height={630}
        caption="The bottom row of each card is the useful part: a behaviour you can provoke on one call, without a spec sheet and without trusting anybody's marketing."
        credit="Illustration by AI Receptionist Now"
      />

      <H3>1. The phone menu (IVR)</H3>
      <P>
        Interactive voice response is sixty-year-old technology and it works
        exactly as advertised. It plays a recording, you press a digit, it routes
        you. Modern versions accept a spoken &quot;billing&quot; instead of a
        keypress, but the mechanism is unchanged: your input is matched against a
        list. It cannot answer anything, because it was never built to. The
        tell is that it asks you to press a number.
      </P>
      <P>
        IVR gets a bad reputation it partly deserves and partly does not. For a
        business with four genuinely distinct departments and high call volume,
        a two-option menu is faster than any conversation. The failure mode is
        the eleven-option tree with a submenu, which exists to protect the
        organisation from its callers.
      </P>

      <H3>2. Conversational IVR</H3>
      <P>
        &quot;In a few words, tell me what you&apos;re calling about.&quot; This
        is speech recognition feeding an intent classifier: your sentence is
        mapped onto one of a fixed set of labels, and each label has a
        pre-written response or a routing rule. It is a real improvement over
        pressing 4 - callers describe their problem instead of translating it
        into menu vocabulary - and for pure routing at scale it remains a
        sensible, cheap, predictable choice.
      </P>
      <P>
        Its ceiling is hard, though. Ask something outside the intent list and
        you do not get a wrong answer; you get the same prompt again, and then
        again, and then a transfer. The tell is that repetition. Nothing
        generative is happening, so there is nothing to generate an answer with.
      </P>

      <H3>3. A chatbot with a voice bolted on</H3>
      <P>
        This is the one that catches people out, because it is genuinely
        intelligent. A language model with your knowledge base behind it will
        answer almost anything sensibly. The problem is not the brain, it is the
        plumbing: the thing was designed for a chat window, where a turn is a
        complete message and nobody speaks over anybody.
      </P>
      <P>
        Put that on a phone line and it waits for what it judges to be the end of
        your sentence, thinks, then delivers a paragraph to the end regardless of
        what you do. Callers interrupt constantly - to correct a spelled name, to
        say &quot;no, the other branch&quot;, to answer before the question
        finishes - and every one of those interruptions is either ignored or
        turns into a collision where both parties talk and neither hears. Two
        minutes into such a call, most callers give up on collaborating and just
        wait, which makes the call slower than a menu.
      </P>

      <H3>4. A voice AI agent</H3>
      <P>
        Audio streams continuously in both directions. The system is deciding, as
        it speaks, whether the noise coming back is a new turn, a
        &quot;mm-hm&quot;, a cough, or a car going past. When it decides you have
        taken the floor, it stops - mid-word if necessary - discards what it was
        about to say, and listens. And when the conversation reaches a point that
        requires the world to change, it calls a tool: reads the calendar, holds
        the slot, writes the record, sends the text, pages the on-call engineer.
      </P>
      <P>
        An <Internal href="/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service">
          AI receptionist
        </Internal>{" "}
        is this fourth thing wrapped for one business&apos;s phone line: the
        greeting, the hours, the service area, the booking rules and the
        escalation path already configured, so you are not assembling anything.
        The name describes the packaging, not the architecture - which is why
        products sitting at level 2 or 3 use it too.
      </P>

      <H2 id="assistant-vs-agent">Assistant, agent, and the tool-call test</H2>
      <P>
        &quot;Agent&quot; is the most abused word in this vocabulary, and there
        is a clean test for it. An assistant knows things. An agent changes
        things. Everything an assistant does is a read: the opening hours, the
        address, the published price, an answer from the knowledge base, a
        message taken for someone else to act on. Everything that saves you
        actual labour is a write.
      </P>
      <Figure
        src="/blog/voice-agent-assistant-vs-agent.svg"
        alt="Two columns comparing an assistant that only reads - hours, address, prices, knowledge base answers, taking a message - against an agent that writes: holds a calendar slot, creates a record, sends a confirmation, pages the on-call person, warm-transfers the caller"
        width={1200}
        height={630}
        caption="Both columns sound the same on a recording. Only the right-hand one removes work from somebody's morning."
        credit="Illustration by AI Receptionist Now"
      />
      <P>
        This matters commercially because the two are priced against each other.
        A product that takes beautiful messages is being sold on the value of a
        product that files work orders. The message-taker is still worth having -
        a captured call beats a missed one - but the savings are one hour of
        transcription, not the four hours of dispatch and data entry that follow
        it.
      </P>
      <P>
        The writes are also where the engineering is. Reading a knowledge base is
        nearly free. Writing into a live system means credentials, permissions,
        idempotency (what happens when the call drops after the booking but
        before the confirmation?), conflict handling, and a rule for what the
        agent says when the write fails - which it will, because calendars are
        double-booked and APIs time out. Ask about that rule. The answer tells
        you whether anyone has run this in production.
      </P>
      <Callout>
        A blunt question that saves an hour of evaluation: &quot;In the demo I
        just heard, which of those actions actually happened in a real system,
        and which were spoken aloud and then discarded?&quot; Both are legitimate
        demos. Only one of them is the product.
      </Callout>

      <H2 id="why-voice-is-hard">Why the phone is harder than the chat box</H2>
      <P>
        People who have shipped a good chat assistant are often surprised by how
        badly it transfers to a phone line. The model is the same; almost
        everything around it is different.
      </P>

      <H3>Silence is a message, and it expires fast</H3>
      <P>
        In a chat window, a pause means nothing. On a call it means everything,
        and the tolerance is startlingly small. The largest cross-linguistic
        study of conversational turn-taking, published in{" "}
        <Ext href="https://www.pnas.org/doi/10.1073/pnas.0903616106">
          PNAS in 2009
        </Ext>
        , found response gaps clustering around 200 milliseconds across ten
        languages drawn from very different families, with cultural variation
        measured in a couple of hundred milliseconds either side. That is not a preference. It is close
        to a species-level default, and callers apply it to software without
        thinking about it.
      </P>
      <P>
        The telephone network was engineered around the same reality. The ITU&apos;s{" "}
        <Ext href="https://www.itu.int/rec/T-REC-G.114-200305-I/en">
          G.114 recommendation
        </Ext>{" "}
        treats one-way delay under 150 ms as the range where interactivity is
        essentially transparent, and 400 ms as the point where it is unacceptable
        for planning purposes. Some of that budget is spent before your system
        sees a packet.
      </P>
      <P>
        Now stack the work: the speech recogniser has to decide the caller has
        finished, the model has to produce a first token, the synthesiser has to
        produce a first chunk of audio, and all of it has to cross a network. In
        our own builds we treat about 800 ms from the caller&apos;s last syllable
        to the first syllable of the reply as the boundary between brisk and
        obviously mechanical. Under that, callers talk normally. Over about a
        second and a half, they start repeating themselves, which produces a
        collision, which costs another two seconds - the delay compounds instead
        of merely annoying.
      </P>

      <H3>Deciding when the caller has stopped is a guess</H3>
      <P>
        This is the part chat has no analogue for. There is no send button. The
        system is continuously guessing whether a silence means &quot;your
        turn&quot; or &quot;I am thinking&quot;. Guess too eagerly and it
        interrupts somebody mid-address. Guess too slowly and every exchange
        gains a beat of dead air. The hard cases are exactly the ones that matter
        on a business line: reading out a phone number in groups, spelling a
        surname, saying an address with a pause before the postcode.
      </P>

      <H3>The audio is worse than you think</H3>
      <P>
        A traditional phone call is narrowband, and that band was chosen for
        intelligibility to humans, not machines. Add a caller on speakerphone in
        a van, a dog, a till, wind. Consonants that distinguish similar words are
        the first casualties - which is why the fields most worth getting right,
        names and numbers, are the ones most likely to be misheard.
      </P>
      <P>
        The fix is not a better model, it is a design decision: read critical
        fields back to the caller and confirm them. Any vendor whose agent takes
        a phone number without repeating it has optimised the demo, not the
        outcome. We wrote about the voice-quality half of this problem
        separately, in{" "}
        <Internal href="/blog/do-ai-voices-sound-human-on-the-phone">
          do AI voices sound human on the phone
        </Internal>
        .
      </P>

      <H3>There is no interface to fall back on</H3>
      <P>
        Chat can render a form, a date picker, a list of five options. Voice
        cannot. Every choice has to be spoken, held in the caller&apos;s
        short-term memory, and referred back to. Any flow with more than three
        options at a step will fail out loud regardless of how good the model is,
        so voice-first design means collapsing choices, asking one thing at a
        time, and moving anything genuinely complicated to a text message with a
        link.
      </P>

      <H2 id="demo-tests">Seven things to try on a demo call</H2>
      <P>
        Do these on any vendor - including us. They take one call, and they
        expose the category faster than any comparison table, because a scripted
        demo cannot survive them.
      </P>
      <OL>
        <LI>
          <Strong>Interrupt it mid-sentence.</Strong> Start talking while it is
          three words into an answer. It should stop almost immediately and
          respond to what you said. If it finishes its paragraph, it is a chatbot
          with a voice.
        </LI>
        <LI>
          <Strong>Ask two things in one breath.</Strong> &quot;Are you open
          Saturday and do you cover the north side?&quot; Two answers is an
          agent. One answer, or the first question restated, is intent matching.
        </LI>
        <LI>
          <Strong>Change your mind halfway.</Strong> Book Tuesday, then say
          &quot;actually, can we make it Thursday?&quot; Watch whether it edits
          the booking or starts the whole flow again. Restarting is a scripted
          flow wearing a conversational coat.
        </LI>
        <LI>
          <Strong>Spell something awkward.</Strong> Give a surname with a double
          letter and a phone number in an unusual rhythm. Does it read them back?
          If not, you have just found where your bad leads will come from.
        </LI>
        <LI>
          <Strong>Ask something it cannot know.</Strong> &quot;How much would you
          charge for the thing my neighbour had done?&quot; You want a clean
          &quot;I don&apos;t have that - let me get someone to call you&quot;.
          A confident invented answer is the single most expensive failure mode
          in this category.
        </LI>
        <LI>
          <Strong>Go silent for four seconds.</Strong> A good agent prompts
          gently and then keeps waiting. A brittle one either fills the silence
          continuously or hangs up on a caller who was fetching their diary.
        </LI>
        <LI>
          <Strong>Ask for a human, then have nobody answer.</Strong> This is the
          test nearly everyone skips and the one that decides how bad your worst
          call of the month is. The caller should not be dumped into a ringing
          void. The agent should come back, apologise, and take the message it
          could have taken in the first place.
        </LI>
      </OL>
      <Figure
        src="/blog/voice-agent-demo-test.webp"
        alt="A desk from above with a phone lying face down beside an open blank notebook and pen, headphones and a cup of coffee in morning light"
        width={1376}
        height={768}
        caption="Twenty minutes and a notebook beats a fortnight of feature comparison. Run the same seven prompts at every vendor and the categories separate themselves."
      />

      <H2 id="where-each-wins">Where each one is genuinely right</H2>
      <P>
        None of these is obsolete, and buying the most sophisticated option is a
        common way to spend more for a worse call.
      </P>
      <Table
        caption="Matching the technology to the call"
        head={["If your calls are...", "The right answer", "Why"]}
        rows={[
          [
            "High volume, four genuinely distinct destinations, no questions",
            "A two-option phone menu",
            "Nothing beats a keypress for speed, and it never mishears anyone",
          ],
          [
            "Routing at scale with a stable, well-known set of reasons to call",
            "Conversational IVR",
            "Cheap, predictable, no hallucination risk, no integration project",
          ],
          [
            "Long, complex, document-heavy questions from customers at a screen",
            "A chat assistant, not a phone one",
            "Voice is the wrong channel for anything that wants a list or a form",
          ],
          [
            "Mixed: bookings, quotes, questions, emergencies, on one small-business line",
            "A voice agent, packaged as an AI receptionist",
            "The call mix is unpredictable, and most calls end in an action",
          ],
          [
            "Regulated, high-stakes, or emotionally loaded from the first second",
            "A human, with AI capturing the calls they miss",
            "The value is in judgement and liability, not in call handling",
          ],
        ]}
      />

      <H2 id="limits">Where voice agents still lose</H2>
      <P>
        We sell these, so this section is the one worth reading twice.
      </P>
      <UL>
        <LI>
          <Strong>Anything that needs to be believed.</Strong> A distressed
          caller, a complaint that has already escalated, a bereavement. The
          agent&apos;s job on those calls is to be brief, be kind, and get a
          human - not to handle it.
        </LI>
        <LI>
          <Strong>Facts nobody loaded.</Strong> An agent is only as accurate as
          its brief, and the gaps show up as confident nonsense about pricing or
          coverage. Constraining what it may say - and rehearsing what it says
          when it does not know - is most of the{" "}
          <Internal href="/blog/ai-receptionist-prompts">
            prompt-writing work
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Genuinely bad audio.</Strong> A motorway hands-free call with
          the window down defeats everyone. The correct behaviour is to notice,
          say so, and offer a callback or a text - not to guess at a name.
        </LI>
        <LI>
          <Strong>Heavy accents and code-switching mid-sentence.</Strong> Better
          than it was, still uneven, and worse on narrowband audio than on the
          demo you heard through a laptop.
        </LI>
        <LI>
          <Strong>Anything where being wrong is expensive.</Strong> Dosage,
          legal deadlines, whether a payment cleared, whether a gas smell is
          urgent. Those calls want a triage script that escalates fast, which is
          a design problem more than a model one - see{" "}
          <Internal href="/blog/24-hour-answering-service#emergency-escalation">
            emergency call escalation
          </Internal>
          .
        </LI>
      </UL>

      <H2 id="glossary">The words vendors use</H2>
      <Table
        caption="A short glossary for reading voice AI marketing"
        head={["Term", "What it actually means", "Why you should care"]}
        rows={[
          [
            "Barge-in",
            "The caller can interrupt and the system stops talking",
            "Without it, you have a chatbot with a voice, whatever the page says",
          ],
          [
            "Endpointing / turn detection",
            "Deciding the caller has finished their turn",
            "Tuned badly, it either talks over people or leaves dead air",
          ],
          [
            "Cascaded pipeline",
            "Speech to text, then a model, then text to speech",
            "The common architecture; each stage adds delay you can feel",
          ],
          [
            "Speech-to-speech",
            "One model taking audio in and producing audio out",
            "Lower latency, less control over exactly what gets said",
          ],
          [
            "Tool calling / function calling",
            "The model triggering a real action in another system",
            "This is the whole difference between an assistant and an agent",
          ],
          [
            "Warm transfer",
            "Briefing the human before handing the caller over",
            "Decides whether your caller repeats themselves at the worst moment",
          ],
          [
            "Media stream / WebSocket audio",
            "Raw call audio piped to your own software in real time",
            "How platforms like Twilio expose calls to a voice agent you build",
          ],
        ]}
      />
      <P>
        That last row is worth expanding, because it explains why so many
        products in this market feel similar under the surface. Telephony
        platforms now hand raw call audio to whatever you have built -{" "}
        <Ext href="https://www.twilio.com/docs/voice/conversationrelay">
          Twilio&apos;s Conversation Relay
        </Ext>
        , for instance, streams a call over a WebSocket and manages the speech
        recognition, synthesis and interruption handling while you supply the
        reasoning. Which means the interesting question about any vendor is
        rarely &quot;can it talk&quot;. It is what the thing at the other end of
        that socket knows about your business and what it is allowed to change.
      </P>
      <P>
        If you are working out which category you actually need, the{" "}
        <Internal href="/blog/best-ai-receptionist#how-to-choose">
          buyer&apos;s checklist
        </Internal>{" "}
        covers the commercial side, and our{" "}
        <Internal href="/pricing">plans are month-to-month</Internal> if you
        would rather run the seven tests above on a live line than read another
        comparison.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
