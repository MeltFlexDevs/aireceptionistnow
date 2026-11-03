import Link from "next/link";
import { supportEmail } from "@/lib/site";
import { withAppMode } from "@/lib/legal";
import AppModeHeader from "@/app/components/AppModeHeader";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
// Shared with the privacy policy - one stylesheet for the policy-style pages,
// loaded only on those routes.
import "../privacy-policy/policy.css";

/**
 * The App Store "Support URL" and the in-app Help & support target. Web
 * subscriptions are mentioned as text only, on purpose: from inside the app a
 * link to the website's billing is a purchase path outside the store.
 *
 * page.tsx renders it for the web. in-app/page.tsx renders it with `app` for
 * `?app=1` (rewrite in next.config.ts): no site header, footer or purchase links.
 */
export default function SupportContent({ app }: { app: boolean }) {
  return (
    <div className="policy-page">
      {app ? <AppModeHeader /> : <SiteHeader />}

      <main className="policy-main" style={app ? { paddingTop: "40px" } : undefined}>
        <div className="policy-container">
          <h1 className="policy-title">Support</h1>
          <p className="policy-updated">We are here to help with your AI receptionist, your subscription and your account.</p>

          <div className="policy-content">

            <h2>Contact us</h2>
            <p>
              Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
            <p>
              We reply within 2 business days, usually the same day. Please write from the email
              address on your account and tell us which business or phone number the question is
              about, so we can look it up straight away.
            </p>

            <h2>Frequently asked questions</h2>

            <p id="forward-calls"><strong>How do I send my calls to the receptionist?</strong></p>
            <p>
              Keep your business number and forward it to the receptionist number shown in the
              app. On a mobile line, dial a short code plus that number. On Verizon, dial *71 plus
              the number for unanswered calls, and *73 to switch forwarding off. On T-Mobile and
              AT&amp;T, dial **61*number# for unanswered calls and **67*number# for calls while
              you are busy, and ##004# to clear forwarding.
            </p>
            <p>
              On a VoIP or office phone system, set the receptionist number as the forwarding
              destination in its admin panel. Start with unanswered and busy calls only. Then
              call your business number from another phone to check that it works.
            </p>

            <p><strong>How do I cancel a subscription bought in the App Store?</strong></p>
            <p>
              Subscriptions bought on an iPhone are billed by Apple and are cancelled in your Apple
              account, not in our app. Open the iPhone Settings app, tap your name, tap
              Subscriptions, choose AI Receptionist and tap Cancel Subscription. You keep access
              until the end of the period you have paid for. Refunds for App Store purchases are
              handled by Apple under Apple&apos;s refund policy.
            </p>

            <p><strong>How do I cancel a subscription bought on Google Play?</strong></p>
            <p>
              Subscriptions bought on Android are billed by Google and are cancelled in Google Play.
              Open the Play Store app, tap your profile picture, tap Payments &amp; subscriptions,
              then Subscriptions, choose AI Receptionist and tap Cancel subscription. You keep
              access until the end of the period you have paid for. Refunds for Google Play purchases
              follow Google Play&apos;s refund policy.
            </p>

            <p><strong>I subscribed on the website. Where do I manage that?</strong></p>
            <p>
              Subscriptions bought on our website are managed from your account on the website.
            </p>

            <p><strong>How do I delete my account?</strong></p>
            <p>
              In the app, open Settings and choose Delete account. You can also delete it from{" "}
              <Link href={withAppMode("/account/delete", app)}>our account deletion page</Link>.
              Deletion removes your receptionists, returns your phone numbers, and deletes your
              calls, recordings, transcripts, calendar connections and devices. A subscription
              bought in the App Store or on Google Play is not cancelled by deleting the account -
              cancel it in the store first, as described above.
            </p>

            <p><strong>Something is wrong with a call.</strong></p>
            <p>
              Open the call in the app or the dashboard and use Report an issue. The report includes
              the transcript and timing we need. For anything urgent, email us.
            </p>

            <h2>Company</h2>
            <p><strong>MeltFlex s.r.o.</strong></p>
            <p>Bratislava, Slovak Republic</p>
            <p>Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>

          </div>
        </div>
      </main>
      {!app && <SiteFooter />}
    </div>
  );
}
