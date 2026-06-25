import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Receptionist",
  description: "How AI Receptionist collects, uses, and protects your personal data. GDPR-compliant privacy policy for our AI phone answering service.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="policy-page">
      {/* Header */}
      <header className="policy-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#000" }}>
          <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="2.5" height="15" rx="1" fill="#000" />
            <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill="#000" />
          </svg>
          <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "17px", letterSpacing: "-0.02em" }}>
            AI RECEPTIONIST
          </span>
        </Link>
      </header>

      <main className="policy-main">
        <div className="policy-container">
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-updated">Last Updated: June 2026</p>

          <div className="policy-content">
            <h4>1. Introduction</h4>
            <p>
              MeltFlex s.r.o. (&ldquo;MeltFlex&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, &ldquo;Our&rdquo;)
              is committed to protecting your privacy. This Privacy Policy explains how We collect, use, store,
              and protect your personal information when you use our AI phone receptionist service at
              aireceptionistnow.com (the &ldquo;Service&rdquo;).
            </p>
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
              MeltFlex s.r.o. is subject to the General Data Protection Regulation (GDPR)
              as a company established within the European Union.
            </p>

            <h4>3. Information We Collect</h4>
            <p><strong>3.1 Information You Provide Directly:</strong></p>
            <ul>
              <li>Phone number (when you submit it to speak with our AI receptionist)</li>
              <li>Email address (when creating an account or contacting us)</li>
              <li>Name and business information (if provided during account setup)</li>
              <li>Payment information (processed securely by Stripe; We do not store card details)</li>
              <li>Call configuration and preferences you set for your AI receptionist</li>
              <li>Communications you send to us (support requests, feedback)</li>
            </ul>

            <p><strong>3.2 Information Collected Automatically:</strong></p>
            <ul>
              <li>Call metadata (call duration, time, originating number — not call recordings unless you enable them)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate geographic location</li>
              <li>Pages visited and actions taken on our website</li>
              <li>Referral source (how you found our Service)</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h4>4. How We Use Your Information</h4>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li><strong>Providing the Service:</strong> To connect you with our AI receptionist, manage your account, handle calls on your behalf, and book appointments</li>
              <li><strong>Subscription Management:</strong> To process payments, manage billing cycles, and provide access to paid features</li>
              <li><strong>Service Improvement:</strong> To understand how users interact with our Service, identify issues, and improve call quality and features</li>
              <li><strong>Communication:</strong> To respond to support requests and send essential service notifications (subscription confirmations, service updates)</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal obligations</li>
            </ul>
            <p>We do not use your personal data for automated decision-making or profiling that produces legal effects.</p>

            <h4>5. Legal Basis for Processing (GDPR)</h4>
            <p>We process your personal data on the following legal bases:</p>
            <ul>
              <li><strong>Contract Performance:</strong> Processing necessary to provide the AI receptionist service and fulfill our agreement with you</li>
              <li><strong>Legitimate Interest:</strong> Analytics and service improvement, fraud prevention, and security</li>
              <li><strong>Consent:</strong> Marketing communications and call recording features (only with your explicit consent)</li>
              <li><strong>Legal Obligation:</strong> Retaining financial records as required by Slovak and EU law</li>
            </ul>

            <h4>6. Call Data and AI Processing</h4>
            <p>
              When calls are routed through our AI receptionist, we process call metadata (duration, time, phone numbers)
              to provide the Service. If you enable call recording in your account settings, call audio may be stored
              to allow you to review conversations. We do not use call recordings to train AI models without your explicit consent.
            </p>
            <p>
              Our AI processes spoken language in real-time to respond to callers. This processing occurs via
              our telephony and AI infrastructure partners and is subject to appropriate data processing agreements.
            </p>

            <h4>7. Data Sharing and Third-Party Processors</h4>
            <p>
              We do not sell your personal data. We share your data only with the following
              third-party service providers who process data on our behalf:
            </p>
            <ul>
              <li><strong>Twilio</strong> (telephony infrastructure and call routing)</li>
              <li><strong>Stripe</strong> (subscription payment processing)</li>
              <li><strong>Vercel</strong> (website and application hosting)</li>
              <li><strong>Supabase</strong> (database and authentication)</li>
              <li><strong>Google Analytics</strong> (website traffic analytics)</li>
              <li><strong>PostHog</strong> (product analytics)</li>
            </ul>
            <p>
              Each processor is bound by data processing agreements and processes data only
              as instructed by Us. We ensure all processors provide adequate data protection.
            </p>

            <h4>8. International Data Transfers</h4>
            <p>
              Some of our third-party processors operate outside the European Economic Area (EEA).
              Where data is transferred outside the EEA, We ensure appropriate safeguards are in place,
              including Standard Contractual Clauses (SCCs) approved by the European Commission or
              adequacy decisions.
            </p>

            <h4>9. Data Security</h4>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal data, including:
            </p>
            <ul>
              <li>Encryption in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication and session management</li>
              <li>Access controls limiting data access to authorized personnel only</li>
              <li>Regular security reviews and monitoring</li>
            </ul>
            <p>
              While We strive to protect your data, no method of transmission over the Internet
              is 100% secure. We cannot guarantee absolute security.
            </p>

            <h4>10. Data Retention</h4>
            <ul>
              <li><strong>Account data:</strong> Retained while your account is active. Deleted within 30 days of an account deletion request.</li>
              <li><strong>Call metadata:</strong> Retained for up to 12 months, then deleted or anonymized.</li>
              <li><strong>Call recordings:</strong> Retained for the period you configure in your account settings (if enabled).</li>
              <li><strong>Payment records:</strong> Retained for up to 10 years as required by Slovak tax and accounting law.</li>
              <li><strong>Analytics data:</strong> Retained for up to 24 months, then anonymized or deleted.</li>
              <li><strong>Support communications:</strong> Retained for up to 24 months after resolution.</li>
            </ul>

            <h4>11. Your Rights Under GDPR</h4>
            <p>As a data subject, you have the following rights:</p>
            <ul>
              <li><strong>Right of Access:</strong> Request a copy of the personal data We hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Right to Restrict Processing:</strong> Request that We limit how We use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <a href="mailto:info@meltflexai.com">info@meltflexai.com</a>.
              We will respond within 30 days. You also have the right to lodge a complaint with your local
              data protection authority. In Slovakia, this is the Office for Personal Data Protection
              of the Slovak Republic (<a href="https://dataprotection.gov.sk" target="_blank" rel="noopener noreferrer">dataprotection.gov.sk</a>).
            </p>

            <h4>12. Cookies</h4>
            <p>
              We use cookies and similar technologies to operate our website and improve your experience.
              Essential cookies are required for the Service to function. Analytics cookies help us understand
              how the website is used. You can control non-essential cookies through your browser settings.
              Continued use of our website without changing your cookie settings constitutes consent to
              our use of cookies.
            </p>

            <h4>13. Children&apos;s Privacy</h4>
            <p>
              Our Service is not intended for children under 16 years of age. We do not knowingly
              collect personal data from children. If We become aware that We have collected data
              from a child under 16, We will delete it promptly.
            </p>

            <h4>14. Changes to This Policy</h4>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated &ldquo;Last Updated&rdquo; date. Continued use of the Service
              after changes constitutes acceptance of the revised policy.
            </p>

            <h4>15. Contact Us</h4>
            <p>
              If you have any questions about this Privacy Policy or how We handle your data,
              please contact us:
            </p>
            <p>Email: <a href="mailto:info@meltflexai.com">info@meltflexai.com</a></p>
            <p><strong>MeltFlex s.r.o.</strong></p>
            <p>Bratislava, Slovak Republic</p>
          </div>
        </div>
      </main>
    </div>
  );
}
