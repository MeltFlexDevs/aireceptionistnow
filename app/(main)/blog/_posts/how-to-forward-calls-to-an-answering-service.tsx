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
  Mono,
  Callout,
  KeyTakeaways,
  FAQList,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "how-to-forward-calls-to-an-answering-service",
  title: "How to Forward Calls to an Answering Service (Carrier Codes)",
  description:
    "Step-by-step call forwarding setup for an answering service or AI receptionist: the four forwarding rules, carrier codes, and how to test it.",
  date: "2026-07-30",
  updated: "2026-07-30",
  readingTime: "12 min read",
  tag: "Guides",
  hero: "/blog/call-forwarding-setup-hero.webp",
  heroAlt:
    "Hands holding a smartphone on a small-business desk beside a desk phone handset in warm afternoon light",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "how to forward calls to an answering service",
    "call forwarding to answering service",
    "conditional call forwarding business phone",
    "forward calls after hours",
    "call forwarding codes",
    "forward unanswered calls to AI receptionist",
    "busy call forwarding setup",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "four-rules", title: "The four forwarding rules" },
    { id: "which-rule", title: "Which rule you actually want" },
    { id: "mobile", title: "Forwarding a mobile line" },
    { id: "voicemail-race", title: "The voicemail race (the #1 failure)" },
    { id: "landline-voip", title: "Landlines, VoIP and PBX systems" },
    { id: "test", title: "Testing it in eight minutes" },
    { id: "mistakes", title: "Six things that quietly break forwarding" },
    { id: "turn-off", title: "Turning it off again" },
    { id: "vs-porting", title: "Forwarding vs porting your number" },
    { id: "faq", title: "FAQ" },
  ],
  faqs: [
    {
      q: "How do I forward my business phone to an answering service?",
      a: "You dial a short code on the line you want to forward, followed by the number the service gave you. On Verizon mobile it is *72 plus the number for all calls, or *71 plus the number for unanswered calls only, and *73 to switch forwarding off. On T-Mobile and AT&T it is the GSM-style codes - **21*number# for all calls, **61*number# for unanswered calls, **67*number# when you are on another call - and ##004# to clear all of them. On VoIP systems (RingCentral, Dialpad, Google Voice, 8x8, a hosted PBX) you do not dial codes at all; you set a forwarding or overflow destination in the admin panel, which is better because it can follow a schedule.",
    },
    {
      q: "Should I forward all calls or only the ones I miss?",
      a: "Start with conditional forwarding - unanswered and busy only - so nothing changes about the calls you already answer well, and the service only picks up what would otherwise have gone to voicemail. Move to unconditional forwarding once you have read a couple of weeks of transcripts and decided the service should answer everything first. Most businesses that switch to answer-everything do it for consistency, not for coverage: one greeting, one intake, one log for every call.",
    },
    {
      q: "Why do my calls still go to voicemail instead of the answering service?",
      a: "Because carrier voicemail is racing your forwarding rule and winning. No-answer forwarding fires after a ring timer, and if your voicemail picks up sooner, voicemail always gets the call. Fix it by shortening the forwarding timer (T-Mobile lets you set 5 to 30 seconds) or by disabling carrier voicemail on that line entirely so there is nothing to lose the race to. If both are set and you are not sure which is firing, call the line and count the rings.",
    },
    {
      q: "Will the answering service see the real caller's number?",
      a: "Usually yes. Carriers pass the original caller's number along with the forwarded call, plus a diversion header saying which of your numbers it came from - that is how a service can greet callers correctly when you forward several lines to it. The exception is a badly configured PBX that rewrites caller ID to your main number, which makes every call look like it came from you. Test it before you go live: forward a call from a phone whose number you know and check what the service logged.",
    },
    {
      q: "Do forwarded calls use my mobile plan minutes?",
      a: "On many carriers, yes - the leg from your number to the answering service is an outbound call billed to your line, and unlimited-talk plans usually swallow it without noticing. It matters mainly on pooled-minute business plans and on lines that forward high call volume. Check your carrier's call forwarding page before you forward a busy line, and prefer forwarding at the VoIP or PBX layer where the leg is usually free.",
    },
    {
      q: "Can I forward calls only after business hours?",
      a: "Not with carrier star codes, which have no concept of time - you would be dialing *72 every evening and *73 every morning, and you will forget. Handle the schedule one layer up instead: forward all calls to the answering service permanently and let the service answer differently by time of day, or set a time-based routing rule in your VoIP admin panel. Both survive the Tuesday you are too busy to remember.",
    },
    {
      q: "How long does forwarding take to activate?",
      a: "It is immediate. Star codes and GSM codes take effect on the carrier's switch as soon as you get the confirmation tone, and VoIP admin changes take effect within seconds of saving. That also means you can switch it off just as fast, which is the point of testing forwarding before you commit to anything longer term.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "Verizon Support: Call Forwarding FAQs (*72, *71, *73)",
    url: "https://www.verizon.com/support/call-forwarding-faqs/",
  },
  {
    title:
      "T-Mobile Support: Self-service short codes (call forwarding and forwarding timer)",
    url: "https://www.t-mobile.com/support/plans-features/self-service-short-codes",
  },
  {
    title: "AT&T Wireless Support: Call Forwarding",
    url: "https://www.att.com/support/article/wireless/KM1011513/",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        Forwarding is the whole migration. You do not port a number, change your
        cards, or touch your website - you dial a short code and every call your
        business would have lost lands somewhere that answers. It takes about
        eight minutes and it is reversible in one more code, which is why we
        tell people to test an answering service this way before anything else.
        The catch is that four different forwarding rules exist, the codes
        differ by carrier, and one silent failure - carrier voicemail beating
        your forward to the call - accounts for most of the &quot;it
        didn&apos;t work&quot; support tickets we see. This guide covers all of
        it.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            There are <Strong>four forwarding rules</Strong>, not one:
            unconditional, no-answer, busy, and unreachable. Most businesses
            want the last three together and the first one later.
          </>,
          <>
            <Strong>Carrier voicemail is the thing you are competing
            with.</Strong> If voicemail picks up before your no-answer forward
            fires, the forward never happens.
          </>,
          <>
            On VoIP or a hosted PBX, <Strong>ignore star codes entirely</Strong>{" "}
            and set the destination in the admin panel - it can follow a
            schedule, which star codes cannot.
          </>,
          <>
            Forwarding is <Strong>reversible in one code</Strong> (
            <Mono>*73</Mono> or <Mono>##004#</Mono>), which makes it the right
            way to trial a service on real calls.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        Your answering service gives you a destination number. You tell your
        carrier to send calls there under a condition you choose. On a Verizon
        mobile line that is <Mono>*72</Mono> plus the number for every call, or{" "}
        <Mono>*71</Mono> plus the number for unanswered calls only, with{" "}
        <Mono>*73</Mono> to switch it off. On AT&amp;T and T-Mobile it is the
        GSM-style codes - <Mono>**21*number#</Mono> for all calls,{" "}
        <Mono>**61*number#</Mono> for unanswered, <Mono>**67*number#</Mono> for
        busy - with <Mono>##004#</Mono> to clear everything. On VoIP you skip
        the codes and set a forwarding rule in the admin panel. You keep your
        number either way; nothing is ported and nothing is permanent. The
        background on that is in{" "}
        <Internal href="/answers/use-existing-phone-number-with-ai-receptionist">
          can I use my existing number with an AI receptionist
        </Internal>
        ; this guide is the actual keypad work.
      </P>

      <H2 id="four-rules">The four forwarding rules</H2>
      <P>
        Every phone system in the world implements the same four conditions,
        even when it hides them behind friendlier names. Knowing which is which
        is most of the job:
      </P>
      <Table
        caption="The four call forwarding conditions"
        head={["Rule", "Fires when", "Also called"]}
        rows={[
          [
            "Unconditional",
            "Always. Your phone never rings at all.",
            "Immediate forwarding, CFU, \"forward all calls\"",
          ],
          [
            "No answer",
            "Nobody picks up within a ring timer you set.",
            "Conditional forwarding, CF-NRy, \"forward if unanswered\"",
          ],
          [
            "Busy",
            "The line is already occupied by another call.",
            "CFB, \"forward on busy\", overflow",
          ],
          [
            "Unreachable",
            "The phone is off, in airplane mode, or has no signal.",
            "CF-NRc, \"forward if unavailable\"",
          ],
        ]}
      />
      <P>
        The three conditional rules are usually set separately and are usually
        wanted together - a call that rings out, a call that arrives while
        you&apos;re on another one, and a call that arrives while your phone is
        dead in a basement are all the same event from the caller&apos;s side:
        nobody answered. Setting only the no-answer rule and forgetting the busy
        rule is the most common half-finished setup, and it fails on exactly the
        calls that matter most - the second and third callers during your
        busiest hour. That is also what makes{" "}
        <Internal href="/answers/can-an-ai-receptionist-handle-multiple-calls-at-once">
          parallel answering
        </Internal>{" "}
        worth having on the receiving end.
      </P>

      <H2 id="which-rule">Which rule you actually want</H2>
      <Table
        caption="Picking a forwarding rule by situation"
        head={["Your situation", "Set this", "Why"]}
        rows={[
          [
            "Trialling a service, staff still answering",
            "No answer + busy + unreachable",
            "Nothing changes about calls you already handle well; the service only catches the ones that would have died in voicemail",
          ],
          [
            "Nights and weekends only",
            "Unconditional, with the schedule handled by the service",
            "Star codes have no clock. Forward permanently and let the service answer differently by hour",
          ],
          [
            "One person, phone often in a pocket or a crawlspace",
            "Unconditional",
            "\"Unanswered\" is the normal state, not the exception - answering everything first is more consistent than racing to the phone",
          ],
          [
            "Multi-line office with a PBX",
            "Overflow rule in the PBX, no star codes",
            "The PBX already knows about queues, hunt groups and hours; carrier codes fight it",
          ],
          [
            "Second location or a marketing number",
            "Unconditional on that number only",
            "Gives you a clean before-and-after on one line while the main line stays untouched",
          ],
        ]}
      />
      <P>
        Our honest recommendation for the first two weeks is the conditional
        set. It has no downside worth naming: the calls you answer stay exactly
        as they were, and you get a log of everything you were previously
        losing. Read the transcripts, then decide whether answering
        <em> everything </em> first is the better experience - for most
        businesses with a real front desk it eventually is, for the reasons in{" "}
        <Internal href="/blog/how-to-replace-front-desk-receptionist-with-ai">
          replacing a front desk receptionist with AI
        </Internal>
        .
      </P>

      <H2 id="mobile">Forwarding a mobile line</H2>
      <P>
        Dial the code from the phone whose calls you want forwarded, exactly as
        if it were a phone number, and wait for the confirmation tone or
        message. Codes as the three big US carriers document them:
      </P>
      <Table
        caption="Call forwarding codes by carrier (verify on the carrier's own page - these change)"
        head={["Carrier", "All calls", "Unanswered", "Busy", "Off"]}
        rows={[
          [
            "Verizon",
            <Mono key="v1">*72 + number</Mono>,
            <Mono key="v2">*71 + number</Mono>,
            <span key="v3">
              Covered by <Mono>*71</Mono> (no answer / busy transfer)
            </span>,
            <Mono key="v4">*73</Mono>,
          ],
          [
            "AT&T",
            <Mono key="a1">*21*number#</Mono>,
            <Mono key="a2">**61*number#</Mono>,
            <Mono key="a3">**67*number#</Mono>,
            <span key="a4">
              <Mono>#21#</Mono> or <Mono>##004#</Mono>
            </span>,
          ],
          [
            "T-Mobile",
            <Mono key="t1">**21*number#</Mono>,
            <Mono key="t2">**61*number#</Mono>,
            <Mono key="t3">**67*number#</Mono>,
            <Mono key="t4">##004#</Mono>,
          ],
        ]}
      />
      <P>
        Two notes that save an afternoon. First, enter the destination in full
        with the country and area code - <Mono>**61*15551234567#</Mono>, not a
        seven-digit number - because the switch is not guessing your area code.
        Second, <Mono>##004#</Mono> is the universal reset on GSM networks: it
        clears all conditional forwarding at once, which is what you want when
        you have been experimenting and no longer trust what is set. On Verizon,{" "}
        <Ext href="https://www.verizon.com/support/call-forwarding-faqs/">
          the official FAQ
        </Ext>{" "}
        also lets you set forwarding from the My Verizon app instead of the
        keypad, and T-Mobile documents its codes on{" "}
        <Ext href="https://www.t-mobile.com/support/plans-features/self-service-short-codes">
          the self-service short codes page
        </Ext>
        . If a code returns &quot;invalid MMI&quot;, that is the network
        refusing it, not your phone - use the carrier app or account portal.
      </P>

      <H2 id="voicemail-race">The voicemail race (the #1 failure)</H2>
      <P>
        This is the one thing to understand before you touch the keypad, and it
        is why most people&apos;s first attempt appears to do nothing at all.
      </P>
      <Callout>
        No-answer forwarding fires after a ring timer. Carrier voicemail also
        picks up after a ring timer. <Strong>Whichever timer is shorter
        wins the call</Strong> - and carrier voicemail is usually set to
        somewhere around 20 to 30 seconds by default. If your forwarding timer
        is longer, or if it defaulted to the same value, callers keep landing
        in voicemail and the answering service never sees a thing.
      </Callout>
      <P>There are exactly two clean fixes, and you should do one of them:</P>
      <OL>
        <LI>
          <Strong>Shorten the forwarding timer.</Strong> T-Mobile documents a
          code for this - the same <Mono>**61*</Mono> form with a seconds value
          appended, settable between 5 and 30 seconds. Set it to 15 and the
          forward wins comfortably.
        </LI>
        <LI>
          <Strong>Turn carrier voicemail off on that line.</Strong> Blunter and
          more reliable: with nothing to lose the race to, the forward is the
          only outcome. This is the right choice once you trust the service,
          because two message inboxes - a voicemail box nobody checks and a
          call log somebody does - is worse than one.
        </LI>
      </OL>
      <P>
        Doing both is fine. Doing neither and wondering why nothing happens is
        the default outcome, and it is the reason we walk new accounts through a
        live test call rather than trusting the setup screen.
      </P>

      <H2 id="landline-voip">Landlines, VoIP and PBX systems</H2>
      <H3>Traditional landline</H3>
      <P>
        Copper and cable landlines generally use <Mono>*72</Mono> to enable and{" "}
        <Mono>*73</Mono> to disable, with <Mono>*71</Mono> or <Mono>*68</Mono>{" "}
        for the busy/no-answer variant depending on the provider. Dial from the
        line itself, listen for the stutter tone, and note that some providers
        require you to hear the destination ring before the setting sticks.
      </P>
      <H3>VoIP and hosted PBX</H3>
      <P>
        If you are on RingCentral, Dialpad, 8x8, Nextiva, Zoom Phone, Google
        Voice or any hosted PBX, <Strong>do not use star codes</Strong>. Set the
        destination in the admin panel instead. You get three things the carrier
        cannot give you:
      </P>
      <UL>
        <LI>
          <Strong>Schedules.</Strong> Business hours to your team, everything
          else to the service, automatically, forever - no more remembering to
          dial anything on a Friday evening.
        </LI>
        <LI>
          <Strong>Ring-then-overflow.</Strong> Ring the desk for twelve seconds,
          then hand off. This is the setup most offices actually want and it is
          impossible to express with a star code.
        </LI>
        <LI>
          <Strong>Per-number routing.</Strong> Point three DIDs at the same
          service and let it greet each one differently - the sales line, the
          service line, the Spanish line.
        </LI>
      </UL>
      <P>
        One warning specific to PBXs: check whether yours rewrites outbound
        caller ID. A PBX that stamps your main number on the forwarded leg makes
        every single call look like it came from your own office, which destroys
        callback numbers, CRM matching, and returning-caller recognition. It is
        a one-line setting and a five-minute test.
      </P>

      <H2 id="test">Testing it in eight minutes</H2>
      <OL>
        <LI>
          <Strong>Set the rule</Strong> from the line you want forwarded, using
          the destination number the service gave you. Wait for the confirmation
          tone.
        </LI>
        <LI>
          <Strong>Call from a phone that is not on your account</Strong> -
          borrow one. Calling yourself from the same line or the same account
          can behave differently and will teach you the wrong lesson.
        </LI>
        <LI>
          <Strong>Let it ring out</Strong> if you set the no-answer rule. Count
          the rings and note whether the service or voicemail answers. If it is
          voicemail, go back to the section above; nothing else is wrong.
        </LI>
        <LI>
          <Strong>Test the busy path.</Strong> Get on a call, then have someone
          else dial in. This is the leg everybody skips and the one that fails
          most often in practice.
        </LI>
        <LI>
          <Strong>Check the log.</Strong> Open the service&apos;s call log and
          confirm three things: the caller&apos;s real number appears, the
          correct greeting played, and the transcript is complete.
        </LI>
        <LI>
          <Strong>Test the escape hatch.</Strong> Ask to speak to a human and
          confirm the{" "}
          <Internal href="/answers/can-an-ai-receptionist-transfer-calls-to-a-human">
            transfer
          </Internal>{" "}
          rings the right phone. A forward that cannot get back to you is a
          trap, not a safety net.
        </LI>
      </OL>

      <H2 id="mistakes">Six things that quietly break forwarding</H2>
      <UL>
        <LI>
          <Strong>The forwarding loop.</Strong> Forwarding to a number that
          forwards back gives callers a fast busy tone or dead air, and it is
          easy to build accidentally when a service hands you a number that
          already points at your mobile.
        </LI>
        <LI>
          <Strong>Setting the code on the wrong line.</Strong> Codes apply to
          the line you dial them from. Forwarding your personal mobile because
          it was the phone in your hand is a memorable afternoon.
        </LI>
        <LI>
          <Strong>Forgetting the busy rule.</Strong> No-answer forwarding does
          nothing for the second simultaneous caller. Set all three conditional
          rules or accept that you are still losing your busiest hour - the
          arithmetic of which is in{" "}
          <Internal href="/blog/cost-of-a-missed-call">
            the cost of a missed call
          </Internal>
          .
        </LI>
        <LI>
          <Strong>Plan minutes.</Strong> On many carriers the forwarded leg is
          billed to your line like an outbound call. Irrelevant on unlimited
          talk; relevant on pooled business minutes and high volume.
        </LI>
        <LI>
          <Strong>Number formats.</Strong> A destination entered without a
          country or area code fails silently on some switches and succeeds
          into the wrong area code on others.
        </LI>
        <LI>
          <Strong>Leaving it on after you stop.</Strong> If you cancel a
          service, clear the forward the same day (<Mono>*73</Mono> or{" "}
          <Mono>##004#</Mono>). An orphaned forward points your business line at
          a number that no longer answers - the single worst state your phone
          can be in.
        </LI>
      </UL>

      <H2 id="turn-off">Turning it off again</H2>
      <P>
        <Mono>*73</Mono> on Verizon and most landlines. <Mono>##004#</Mono> on
        GSM networks to clear every conditional rule at once, or the specific
        off-codes (<Mono>##21#</Mono>, <Mono>##61#</Mono>, <Mono>##67#</Mono>,{" "}
        <Mono>##62#</Mono>) if you want to remove one and keep the others. On
        VoIP, delete the rule in the panel. Listen for the confirmation, then
        place one real test call to be certain - the code silently failing is
        rarer than the human assuming it worked.
      </P>
      <P>
        This reversibility is the argument for evaluating an answering service
        by forwarding rather than by demo. You are risking one code in each
        direction and no contract - see{" "}
        <Internal href="/answers/does-an-ai-receptionist-require-a-contract">
          whether an AI receptionist requires a contract
        </Internal>{" "}
        - so the only real evaluation, your own callers on your own number,
        costs you two weeks and nothing else.
      </P>

      <H2 id="vs-porting">Forwarding vs porting your number</H2>
      <Table
        caption="Forwarding compared with porting"
        head={["", "Forwarding", "Porting"]}
        rows={[
          [
            "Setup time",
            "Immediate - one code",
            "Days to weeks, carrier-dependent",
          ],
          [
            "Reversible",
            "Instantly, with one code",
            "Only by porting back, with the same delay",
          ],
          [
            "Conditional rules",
            "Yes - all calls, unanswered, busy, unreachable",
            "N/A - the number simply lives elsewhere",
          ],
          [
            "Ongoing cost",
            "Possible per-minute charges on the forwarded leg",
            "None once complete; you leave the old carrier",
          ],
          [
            "Right for",
            "Trials, after-hours and overflow coverage, keeping staff in the loop",
            "A permanent, settled setup where the old carrier adds nothing",
          ],
        ]}
      />
      <P>
        Almost nobody should port on day one. Forward, run two weeks, read the
        transcripts, and port later only if the old line has stopped earning its
        bill.
      </P>

      <H2 id="next">What to set up on the receiving end</H2>
      <P>
        A forward is only as good as what answers. Before you point real calls
        anywhere, make sure the destination knows your hours, your services,
        your prices and your escalation rules - the practical checklist for that
        is in{" "}
        <Internal href="/blog/ai-receptionist-prompts">
          AI receptionist prompts
        </Internal>
        , and if the reason you are forwarding is nights and weekends, the
        coverage patterns are in{" "}
        <Internal href="/blog/after-hours-answering-service">
          the after-hours answering service guide
        </Internal>{" "}
        and{" "}
        <Internal href="/blog/24-hour-answering-service">
          the 24 hour guide
        </Internal>
        . If you want the number to point at, our{" "}
        <Internal href="/pricing">pricing page</Internal> has plans that start
        month-to-month, and{" "}
        <Internal href="/missed-call-calculator">
          the missed-call calculator
        </Internal>{" "}
        will tell you what the calls you are currently forwarding to voicemail
        are worth.
      </P>

      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
