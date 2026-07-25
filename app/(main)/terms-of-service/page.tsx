import type { Metadata } from "next";
import Link from "next/link";
import { siteName, siteUrl } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
// Shared with the privacy policy - one stylesheet for both legal pages, loaded
// only on those routes rather than as render-blocking CSS everywhere.
import "../privacy-policy/policy.css";

const description =
  "Terms of Service for AI Receptionist Now - subscription plans, acceptable use, call recording obligations, liability, and cancellation.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: `${siteUrl}/terms-of-service` },
  // Both blocks are required. With neither set, this page would inherit the root
  // layout's openGraph.url (which points at the homepage, contradicting the
  // canonical above) and its homepage twitter title.
  openGraph: {
    title: "Terms of Service",
    description,
    url: `${siteUrl}/terms-of-service`,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description,
  },
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <div className="policy-page">
      <SiteHeader />

      <main className="policy-main">
        <div className="policy-container">
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-updated">Last Updated: July 2026</p>

          <div className="policy-content">

            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) form a binding agreement between{" "}
              <strong>MeltFlex s.r.o.</strong>{" "}
              (&ldquo;MeltFlex&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, &ldquo;Our&rdquo;), a company
              registered in the Slovak Republic, and you or the entity you represent
              (&ldquo;you&rdquo;, &ldquo;Customer&rdquo;), governing your use of the AI phone
              receptionist service available at aireceptionistnow.com (the &ldquo;Service&rdquo;).
            </p>
            <p>
              By creating an account, subscribing to a plan, or otherwise using the Service, you accept
              these Terms. If you do not accept them, do not use the Service. If you are entering into
              these Terms on behalf of a company or other legal entity, you represent that you have the
              authority to bind that entity.
            </p>
            <p>
              Our <Link href="/privacy-policy">Privacy Policy</Link> is incorporated into these Terms by
              reference and explains how personal data is handled.
            </p>

            <h2>2. The Service</h2>
            <p>
              The Service provides an AI-powered receptionist that answers inbound telephone calls to
              numbers you connect or provision through us. Depending on your configuration and plan, it
              may greet callers, answer questions from knowledge you supply, book appointments in
              calendars you connect, take messages, transfer calls, and send you summaries by email or
              SMS.
            </p>
            <p>
              We may improve, modify, or discontinue features of the Service. Where a change materially
              reduces core functionality of a paid plan, we will give you at least 30 days&rsquo; notice
              by email, and you may terminate under Section 12.
            </p>

            <h2>3. Eligibility and Accounts</h2>
            <ul>
              <li>The Service is offered for business use. You must be at least 18 years old and legally capable of entering into contracts.</li>
              <li>You must provide accurate account information and keep it current.</li>
              <li>You are responsible for safeguarding your account credentials and for all activity that occurs under your account.</li>
              <li>You must notify us promptly at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a> if you suspect unauthorised access.</li>
            </ul>

            <h2>4. Plans, Fees and Billing</h2>
            <p><strong>4.1 Subscriptions.</strong> The Service is sold as a monthly or annual subscription. Current plans, inclusive allowances and prices are shown on our <Link href="/pricing">pricing page</Link>, which forms part of these Terms. Annual subscriptions are billed once a year at a discount to the equivalent monthly price.</p>
            <p><strong>4.2 Payment.</strong> Payments are processed by Stripe. By subscribing you authorise us, through Stripe, to charge your payment method on a recurring basis until you cancel. We do not store full card details.</p>
            <p><strong>4.3 Renewal.</strong> Subscriptions renew automatically at the end of each billing period at the then-current price, unless cancelled before the renewal date.</p>
            <p><strong>4.4 Usage beyond your allowance.</strong> Each plan includes a monthly allowance of call minutes and other limits. Usage above the included allowance, and any additional phone numbers, are charged at the rates published on the pricing page and billed in arrears.</p>
            <p><strong>4.5 Taxes.</strong> Prices are exclusive of VAT and other applicable taxes unless stated otherwise. Where you provide a valid EU VAT identification number, the reverse-charge mechanism may apply.</p>
            <p><strong>4.6 Price changes.</strong> We may change prices with at least 30 days&rsquo; notice by email. Changes take effect at your next renewal; if you do not accept them, you may cancel before that date.</p>
            <p><strong>4.7 Failed payments.</strong> If a payment fails, we may retry it and may suspend the Service until the balance is settled. Calls will not be answered while an account is suspended.</p>

            <h2>5. Cancellation and Refunds</h2>
            <p>
              You may cancel at any time from your account&rsquo;s billing settings. Cancellation takes
              effect at the end of the current billing period. You retain access until that date, and
              we do not pro-rate or refund the unused remainder of a period except where required by law
              or where we have materially breached these Terms.
            </p>
            <p>
              <strong>Consumers in the EU.</strong> If you are a consumer rather than a business, you have
              a statutory right to withdraw from a distance contract within 14 days. By starting to use
              the Service during that period you request that performance begin immediately, and you
              acknowledge that you will owe a proportionate amount for the Service used before withdrawal.
            </p>

            <h2>6. Your Responsibilities as Controller of Caller Data</h2>
            <p>
              This section is important and specific to a service that answers telephone calls.
            </p>
            <p>
              <strong>6.1 Call recording and notice.</strong> The Service processes, transcribes and may
              record telephone calls. Laws on recording and monitoring calls differ by country and, in the
              United States, by state - some require the consent of all parties. <strong>You are solely
              responsible for determining what notice and consent the law requires in every jurisdiction
              you receive calls from, and for ensuring callers receive that notice</strong>, including by
              configuring your greeting accordingly. We provide the means to include such a notice; we do
              not determine whether your configuration is lawful.
            </p>
            <p>
              <strong>6.2 Roles.</strong> As between you and us, you are the data controller for personal
              data of your callers and we act as your processor, as described in the
              <Link href="/privacy-policy"> Privacy Policy</Link>. A Data Processing Agreement is available
              on request at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a>.
            </p>
            <p>
              <strong>6.3 Content you supply.</strong> You are responsible for the accuracy and legality of
              the business information, scripts, documents and knowledge sources you configure the AI to
              use, and for keeping them up to date.
            </p>

            <h2>7. Acceptable Use</h2>
            <p>You must not use the Service to:</p>
            <ul>
              <li>make or facilitate unsolicited marketing, robocalls, or automated dialling campaigns in breach of applicable law (including the TCPA, ePrivacy Directive, or equivalent national rules);</li>
              <li>impersonate another person or organisation, or misrepresent the AI as a human where the law requires disclosure;</li>
              <li>transmit unlawful, fraudulent, deceptive, harassing, or infringing content;</li>
              <li>handle special categories of personal data (such as health or biometric data) unless you have a lawful basis and have told us in advance;</li>
              <li>attempt to gain unauthorised access to the Service, probe or test its security, or interfere with its operation;</li>
              <li>reverse engineer, decompile, or attempt to derive the source code or underlying models of the Service, except to the extent this restriction is prohibited by law;</li>
              <li>resell, sublicense, or provide the Service to third parties as your own without our written agreement;</li>
              <li>exceed plan limits through artificial means, or share one account across separate businesses to avoid fees.</li>
            </ul>
            <p>
              We may suspend an account immediately, without notice, where use presents a legal risk, a
              security risk, or a risk of harm to our telephony carriers or other customers.
            </p>

            <h2>8. Emergency Calls and Critical Use</h2>
            <p>
              <strong>The Service is not a telephone service for emergencies and must never be relied
              upon to reach emergency services.</strong> It cannot dial 112, 911, or any other emergency
              number, and it does not transmit caller location to emergency responders. You must not
              deploy it on any line advertised or used for emergency, medical, safety-of-life, or other
              critical response, and you must ensure an alternative means of contacting emergency
              services is always available to your callers.
            </p>

            <h2>9. Nature and Limits of AI Output</h2>
            <p>
              The Service uses automated speech recognition, large language models, and synthetic speech.
              These technologies are probabilistic. Output may be inaccurate, incomplete, or unexpected:
              the AI may mishear a caller, misinterpret a request, transcribe a name or number
              incorrectly, book an appointment at the wrong time, or fail to answer a call.
            </p>
            <p>
              The Service is a business tool, not professional advice. It does not provide legal, medical,
              financial, or other regulated advice, and its output must not be relied upon as such. You
              are responsible for reviewing summaries, messages and bookings it produces, and for any
              decision you take on the basis of them.
            </p>

            <h2>10. Phone Numbers and Telephony</h2>
            <p>
              Phone numbers provisioned through the Service are supplied by our telephony providers and
              are licensed to you for the term of your subscription; you do not own them. Some numbers
              require regulatory documentation (such as proof of local address) before they can be
              activated. Number availability, portability, and any porting request are subject to carrier
              and regulatory rules outside our control. Numbers may be reclaimed after termination or
              prolonged non-payment, and once reclaimed cannot generally be recovered.
            </p>

            <h2>11. Third-Party Services</h2>
            <p>
              The Service integrates third-party providers, including telephony, speech and language model
              providers, payment processing, and any calendar or business tools you choose to connect. Your
              use of a connected third-party service is governed by that provider&rsquo;s own terms, and we
              are not responsible for its availability, acts, or omissions. Revoking our access to a
              connected account may disable related features.
            </p>

            <h2>12. Term, Suspension and Termination</h2>
            <p>
              These Terms apply for as long as you hold an account. You may terminate at any time under
              Section 5. We may suspend or terminate your access if you materially breach these Terms and,
              where the breach is capable of being remedied, fail to remedy it within 14 days of notice; if
              required by law; or if your account remains unpaid.
            </p>
            <p>
              On termination, your right to use the Service ends and your assistants stop answering calls.
              You may export your call data before termination. We retain and delete data as described in
              the <Link href="/privacy-policy">Privacy Policy</Link>. Sections 6, 9, 13, 14, 15 and 17
              survive termination.
            </p>

            <h2>13. Intellectual Property</h2>
            <p>
              We retain all rights in the Service, including its software, models, interfaces, and branding.
              Subject to these Terms and payment of applicable fees, we grant you a non-exclusive,
              non-transferable, revocable licence to use the Service for your internal business purposes
              for the term of your subscription.
            </p>
            <p>
              You retain all rights in the content you supply and in your call data. You grant us a limited
              licence to host, process and transmit that content solely to provide, secure and support the
              Service. <strong>We do not use your call recordings, transcripts, or business content to train
              our own or third-party foundation models.</strong>
            </p>
            <p>
              If you send us feedback or suggestions, you grant us a perpetual, royalty-free right to use
              them without obligation to you.
            </p>

            <h2>14. Availability and Disclaimer of Warranties</h2>
            <p>
              We aim to keep the Service continuously available but do not guarantee uninterrupted or
              error-free operation. Availability depends on telephony carriers, third-party AI providers,
              and the public internet. We may perform maintenance, and will use reasonable efforts to
              schedule planned maintenance outside peak hours.
            </p>
            <p>
              To the fullest extent permitted by law, the Service is provided &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo;, without warranties of any kind, whether express, implied, or
              statutory, including implied warranties of merchantability, fitness for a particular purpose,
              accuracy, and non-infringement. Nothing in these Terms excludes statutory rights that cannot
              be excluded, including consumer rights under Slovak and EU law.
            </p>

            <h2>15. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, and except as stated below, our total aggregate
              liability arising out of or relating to the Service in any 12-month period shall not exceed
              the total fees you paid to us in the 12 months immediately preceding the event giving rise
              to the claim.
            </p>
            <p>
              We shall not be liable for indirect, incidental, special, consequential or punitive damages,
              nor for lost profits, lost revenue, lost business, lost goodwill, or lost or missed calls,
              appointments or opportunities, even if advised of the possibility.
            </p>
            <p>
              Nothing in these Terms limits liability for death or personal injury caused by negligence,
              for fraud or fraudulent misrepresentation, or for any other liability that cannot lawfully
              be limited.
            </p>

            <h2>16. Indemnity</h2>
            <p>
              You agree to indemnify and hold us harmless against claims, damages, and reasonable costs
              arising from your use of the Service in breach of these Terms or applicable law, including
              claims brought by your callers relating to call recording, notice, or consent where you
              failed to meet your obligations under Section 6.
            </p>

            <h2>17. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the Slovak Republic, excluding its conflict-of-law
              rules and the UN Convention on Contracts for the International Sale of Goods. The courts of
              the Slovak Republic have exclusive jurisdiction, save that if you are a consumer you may
              also bring proceedings in the courts of your country of residence and benefit from the
              mandatory consumer protections of that country.
            </p>
            <p>
              Consumers may also use the European Commission&rsquo;s online dispute resolution platform at
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"> ec.europa.eu/consumers/odr</a>.
            </p>

            <h2>18. Changes to These Terms</h2>
            <p>
              We may update these Terms to reflect changes in the Service, the law, or our practices.
              Changes will be posted here with an updated &ldquo;Last Updated&rdquo; date. For material
              changes we will notify active account holders by email at least 14 days before they take
              effect. Continued use of the Service after the effective date constitutes acceptance.
            </p>

            <h2>19. General</h2>
            <ul>
              <li><strong>Entire agreement.</strong> These Terms, the Privacy Policy, and the pricing page form the entire agreement between us regarding the Service.</li>
              <li><strong>Severability.</strong> If a provision is held unenforceable, the remainder stays in force.</li>
              <li><strong>No waiver.</strong> Failure to enforce a provision is not a waiver of it.</li>
              <li><strong>Assignment.</strong> You may not assign these Terms without our written consent. We may assign them to an affiliate or successor in connection with a merger or sale of assets.</li>
              <li><strong>Force majeure.</strong> Neither party is liable for failure to perform due to events beyond its reasonable control.</li>
            </ul>

            <h2>20. Contact</h2>
            <p>Questions about these Terms:</p>
            <p>Email: <a href="mailto:info@meltflexai.com">info@meltflexai.com</a></p>
            <p><strong>MeltFlex s.r.o.</strong></p>
            <p>Bratislava, Slovak Republic</p>
            <p>We aim to respond to all enquiries within 5 business days.</p>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
