import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AI Receptionist Now collects, uses, and protects your personal data. GDPR-compliant privacy policy for our AI phone answering service.",
  alternates: { canonical: `${siteUrl}/privacy-policy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="policy-page">
      <SiteHeader />

      <main className="policy-main">
        <div className="policy-container">
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-updated">Last Updated: June 2026</p>

          <div className="policy-content">

            <h4>1. Introduction and Scope</h4>
            <p>
              MeltFlex s.r.o. (&ldquo;MeltFlex&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, &ldquo;Our&rdquo;)
              is committed to protecting your privacy. This Privacy Policy explains how We collect, use, store,
              and protect personal information in connection with our AI phone receptionist service available at
              aireceptionistnow.com (the &ldquo;Service&rdquo;).
            </p>
            <p>This policy applies to two distinct groups:</p>
            <ul>
              <li><strong>Business customers</strong> — companies and individuals who sign up to use our Service to manage their incoming calls.</li>
              <li><strong>Callers</strong> — third parties who call a business that uses our AI receptionist. If you are a caller, please read Section 6 which specifically covers your data.</li>
            </ul>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with
              this Privacy Policy. If you do not agree, please do not use the Service.
            </p>

            <h4>2. Data Controller</h4>
            <p>The data controller responsible for your personal data is:</p>
            <p><strong>MeltFlex s.r.o.</strong></p>
            <p>Bratislava, Slovak Republic</p>
            <p>Email: <a href="mailto:info@meltflexai.com">info@meltflexai.com</a></p>
            <p>
              MeltFlex s.r.o. is established within the European Union and is subject to the
              General Data Protection Regulation (GDPR) (EU) 2016/679.
            </p>
            <p>
              <strong>Note for business customers:</strong> When your customers call your AI receptionist, you act as the
              data controller for their personal data. MeltFlex acts as your data processor in that context,
              processing caller data only on your behalf and according to your instructions. A Data Processing
              Agreement (DPA) is available upon request at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a>.
            </p>

            <h4>3. Information We Collect — Business Customers</h4>
            <p><strong>3.1 Information You Provide Directly:</strong></p>
            <ul>
              <li>Email address (when creating an account)</li>
              <li>Name and business name (during account setup)</li>
              <li>Phone number(s) you register with the Service</li>
              <li>Payment information (processed securely by Stripe; We do not store card details)</li>
              <li>Call routing rules, scripts, and preferences you configure</li>
              <li>Communications you send to us (support requests, feedback)</li>
            </ul>

            <p><strong>3.2 Information Collected Automatically:</strong></p>
            <ul>
              <li>Call metadata (call duration, timestamps, originating and destination numbers)</li>
              <li>Call recordings and transcripts (only if you enable this in your account settings)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate geographic location</li>
              <li>Pages visited and actions taken on our website</li>
              <li>Referral source (how you found our Service)</li>
              <li>Cookies and similar technologies (see Section 12)</li>
            </ul>

            <h4>4. How We Use Business Customer Data</h4>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li><strong>Providing the Service</strong> — account management, call routing, AI receptionist operation, appointment booking. <em>Legal basis: Contract performance.</em></li>
              <li><strong>Subscription &amp; Billing</strong> — processing payments, managing billing cycles, invoicing. <em>Legal basis: Contract performance, legal obligation.</em></li>
              <li><strong>Service Improvement</strong> — understanding how users interact with our platform, identifying bugs, improving call quality and AI accuracy. <em>Legal basis: Legitimate interest.</em></li>
              <li><strong>Support &amp; Communication</strong> — responding to support requests, sending essential service notifications (subscription confirmations, outages, policy updates). <em>Legal basis: Contract performance, legitimate interest.</em></li>
              <li><strong>Marketing</strong> — sending product updates or promotional communications. <em>Legal basis: Consent (you may unsubscribe at any time via the link in any email or by contacting us).</em></li>
              <li><strong>Fraud Prevention &amp; Security</strong> — detecting and preventing abuse, unauthorized access, and fraudulent activity. <em>Legal basis: Legitimate interest.</em></li>
              <li><strong>Legal Compliance</strong> — complying with applicable laws and regulations. <em>Legal basis: Legal obligation.</em></li>
            </ul>
            <p>We do not use your personal data for automated decision-making or profiling that produces legal effects.</p>

            <h4>5. Legal Basis for Processing (GDPR Summary)</h4>
            <ul>
              <li><strong>Contract Performance (Art. 6(1)(b))</strong> — processing necessary to provide the Service</li>
              <li><strong>Legitimate Interest (Art. 6(1)(f))</strong> — analytics, security, fraud prevention, service improvement</li>
              <li><strong>Consent (Art. 6(1)(a))</strong> — marketing emails, call recording features, non-essential cookies</li>
              <li><strong>Legal Obligation (Art. 6(1)(c))</strong> — retaining financial records as required by Slovak and EU law</li>
            </ul>

            <h4>6. Caller Data — Third-Party Data Subjects</h4>
            <p>
              When a caller contacts a business that uses our AI receptionist, their call is handled by our
              AI system. In this context, the business (our customer) is the data controller for the caller&apos;s
              personal data. MeltFlex processes caller data solely as a data processor acting on the
              business&apos;s instructions.
            </p>
            <p><strong>What data is processed from callers:</strong></p>
            <ul>
              <li>Phone number (caller ID)</li>
              <li>Call duration and timestamp</li>
              <li>Spoken content processed in real-time by our AI to generate a response</li>
              <li>Call recording and transcript (only if the business customer has enabled this feature)</li>
            </ul>
            <p><strong>Caller consent and transparency:</strong></p>
            <p>
              Businesses using our Service are required by our Terms of Service to inform their callers that
              they may be interacting with an AI system, and to obtain any necessary consents (including for
              call recording) in accordance with applicable law. MeltFlex includes an automated disclosure at
              the start of each call where technically feasible.
            </p>
            <p>
              If you are a caller and wish to exercise your GDPR rights (access, erasure, etc.) in relation
              to a call you made to a business using our Service, you should contact that business directly.
              If you are unable to do so, contact us at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a> and
              We will assist in directing your request appropriately.
            </p>

            <h4>7. Data Sharing and Third-Party Processors</h4>
            <p>
              We do not sell your personal data. We share data only with the following
              third-party service providers who process data strictly on our behalf:
            </p>
            <ul>
              <li><strong>Twilio Inc.</strong> (USA) — telephony infrastructure, call routing, and voice AI processing. <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Stripe Inc.</strong> (USA) — subscription payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Vercel Inc.</strong> (USA) — website and application hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Supabase Inc.</strong> (USA) — database hosting and authentication. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Google LLC</strong> (USA) — analytics (Google Analytics), font delivery (Google Fonts). <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>PostHog Inc.</strong> (USA) — product analytics and session recording. <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>
            <p>
              Each processor is bound by a data processing agreement (DPA) and processes data only as
              instructed by Us. We verify that all processors provide adequate data protection guarantees.
            </p>
            <p>
              We may also disclose your data if required by law, court order, or to protect the rights,
              property, or safety of MeltFlex, our customers, or the public.
            </p>

            <h4>8. International Data Transfers</h4>
            <p>
              Several of our third-party processors (Twilio, Stripe, Vercel, Supabase, Google, PostHog) are
              based in the United States. Transfers of personal data from the EEA to the US are carried out
              using one or more of the following safeguards:
            </p>
            <ul>
              <li><strong>EU-US Data Privacy Framework (DPF)</strong> — for processors certified under the DPF as recognised by the European Commission&apos;s adequacy decision of July 2023</li>
              <li><strong>Standard Contractual Clauses (SCCs)</strong> — approved by the European Commission under Decision 2021/914, applied where DPF certification does not cover the specific transfer</li>
            </ul>
            <p>
              You may request a copy of the applicable transfer safeguards by contacting us at
              <a href="mailto:info@meltflexai.com"> info@meltflexai.com</a>.
            </p>

            <h4>9. Google Fonts</h4>
            <p>
              Our website uses Google Fonts, loaded via Next.js&apos;s built-in font optimization. Fonts are
              downloaded and self-hosted at build time by our hosting provider (Vercel), meaning your browser
              does not make direct requests to Google servers when visiting our website. No IP address or
              personal data is transmitted to Google as a result of font loading.
            </p>

            <h4>10. Data Security</h4>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal data, including:
            </p>
            <ul>
              <li>Encryption in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication and session management</li>
              <li>Role-based access controls limiting data access to authorized personnel only</li>
              <li>Regular security reviews, vulnerability assessments, and monitoring</li>
              <li>Incident response procedures for data breaches</li>
            </ul>
            <p>
              In the event of a personal data breach that is likely to result in a risk to your rights and freedoms,
              We will notify the relevant supervisory authority within 72 hours and, where required, notify
              affected individuals without undue delay.
            </p>
            <p>
              While We strive to protect your data, no method of transmission over the Internet
              is 100% secure. We cannot guarantee absolute security.
            </p>

            <h4>11. Data Retention</h4>
            <ul>
              <li><strong>Account data:</strong> Retained while your account is active. Deleted within 30 days of an account deletion request.</li>
              <li><strong>Call metadata:</strong> Retained for up to 12 months, then deleted or anonymized.</li>
              <li><strong>Call recordings &amp; transcripts:</strong> Retained for the period configured in your account settings (if enabled). Deleted on account closure.</li>
              <li><strong>Payment records:</strong> Retained for up to 10 years as required by Slovak tax and accounting law.</li>
              <li><strong>Analytics data:</strong> Retained for up to 24 months, then anonymized or deleted.</li>
              <li><strong>Support communications:</strong> Retained for up to 24 months after resolution.</li>
              <li><strong>Marketing consent records:</strong> Retained for the duration of the relationship plus 3 years to demonstrate compliance.</li>
            </ul>

            <h4>12. Cookies and Local Storage</h4>
            <p>We use the following categories of cookies and similar technologies:</p>
            <ul>
              <li><strong>Essential cookies</strong> — required for the Service to function (session management, authentication). Cannot be disabled. <em>Legal basis: Legitimate interest / contract performance.</em></li>
              <li><strong>Analytics cookies</strong> — Google Analytics and PostHog to understand website usage, measure performance, and improve the Service. <em>Legal basis: Consent.</em></li>
              <li><strong>Preference cookies</strong> — storing your settings and preferences (e.g., selected country code). <em>Legal basis: Legitimate interest.</em></li>
            </ul>
            <p>
              Non-essential cookies are only placed with your consent, which you can give or withdraw at any
              time via your browser settings or by contacting us. Withdrawing consent does not affect the
              lawfulness of processing based on consent before its withdrawal.
            </p>

            <h4>13. Your Rights Under GDPR</h4>
            <p>As a data subject under the GDPR, you have the following rights:</p>
            <ul>
              <li><strong>Right of Access (Art. 15)</strong> — request a copy of the personal data We hold about you</li>
              <li><strong>Right to Rectification (Art. 16)</strong> — request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (Art. 17)</strong> — request deletion of your personal data (&ldquo;right to be forgotten&rdquo;), subject to legal retention obligations</li>
              <li><strong>Right to Restrict Processing (Art. 18)</strong> — request that We limit how We use your data</li>
              <li><strong>Right to Data Portability (Art. 20)</strong> — receive your data in a structured, machine-readable format (JSON or CSV)</li>
              <li><strong>Right to Object (Art. 21)</strong> — object to processing based on legitimate interest, including direct marketing</li>
              <li><strong>Right to Withdraw Consent (Art. 7(3))</strong> — withdraw consent at any time where processing is based on consent, without affecting prior processing</li>
              <li><strong>Rights related to automated decision-making (Art. 22)</strong> — We do not carry out solely automated decision-making with legal or similarly significant effects</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a>.
              We will respond within 30 days (extendable by a further 60 days for complex requests, with notice).
            </p>
            <p>
              You also have the right to lodge a complaint with a supervisory authority. In Slovakia, this is
              the <strong>Office for Personal Data Protection of the Slovak Republic</strong>:
              <br />Website: <a href="https://dataprotection.gov.sk" target="_blank" rel="noopener noreferrer">dataprotection.gov.sk</a>
              <br />Address: Hraničná 12, 820 07 Bratislava, Slovak Republic
            </p>

            <h4>14. Children&apos;s Privacy</h4>
            <p>
              Our Service is not intended for children under 16 years of age. We do not knowingly
              collect personal data from children. If We become aware that We have collected data
              from a child under 16 without verifiable parental consent, We will delete it promptly.
              If you believe We may have inadvertently collected such data, please contact us at
              <a href="mailto:info@meltflexai.com"> info@meltflexai.com</a>.
            </p>

            <h4>15. Changes to This Policy</h4>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, legal requirements, or other factors. Changes will be posted on this page with
              an updated &ldquo;Last Updated&rdquo; date. For material changes, We will notify active
              account holders by email at least 14 days before the changes take effect. Continued use
              of the Service after the effective date constitutes acceptance of the revised policy.
            </p>

            <h4>16. Contact Us</h4>
            <p>
              If you have any questions about this Privacy Policy, how We handle your data, or wish to
              exercise your rights, please contact us:
            </p>
            <p>Email: <a href="mailto:info@meltflexai.com">info@meltflexai.com</a></p>
            <p><strong>MeltFlex s.r.o.</strong></p>
            <p>Bratislava, Slovak Republic</p>
            <p>
              We aim to respond to all privacy-related enquiries within 5 business days and to resolve
              them within 30 days.
            </p>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
