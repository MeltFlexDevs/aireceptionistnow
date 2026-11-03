import type { Metadata } from "next";
import Link from "next/link";
import { currentUserId, getAuthClaims } from "@/lib/auth";
import { siteName, siteUrl, supportEmail, ogCardImage } from "@/lib/site";
import { isAppMode, withAppMode } from "@/lib/legal";
import AppModeHeader from "@/app/components/AppModeHeader";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { deleteOwnAccountAction } from "./actions";
import "../../privacy-policy/policy.css";

const description =
  "How to delete your AI Receptionist Now account and what is removed: receptionists, phone numbers, calls, recordings, transcripts, calendar connections and devices.";

export const metadata: Metadata = {
  title: "Delete your account",
  description,
  alternates: { canonical: `${siteUrl}/account/delete` },
  openGraph: {
    title: "Delete your account",
    description,
    url: `${siteUrl}/account/delete`,
    type: "website",
    siteName,
    images: [ogCardImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delete your account",
    description,
    images: [ogCardImage],
  },
  robots: { index: true, follow: true },
};

// The page reads the cookie session, so it is dynamic by nature.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

const inputStyle = {
  width: "100%",
  maxWidth: "320px",
  height: "44px",
  padding: "0 14px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  fontSize: "15px",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  color: "#1D1D1D",
} as const;

const dangerButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  height: "44px",
  padding: "0 20px",
  background: "#b42318",
  color: "#fff",
  border: "1.5px solid #b42318",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "var(--font-inter), Inter, sans-serif",
} as const;

const noticeStyle = {
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e5e5",
  background: "#fafafa",
  fontSize: "15px",
  color: "#333",
  marginBottom: "24px",
} as const;

/**
 * The public account-deletion page: Play Console's "Delete account URL", the
 * privacy policy's deletion link, and where the dashboard sends people.
 *
 * Signed in (cookie session): a typed-confirmation form that runs the same
 * deletion the app's Settings > Delete account runs. Signed out: how to get
 * there. In app mode there is no web sign-in link - the sign-in dialog leads on
 * to the dashboard - only the in-app path and the email fallback.
 */
export default async function DeleteAccountPage({ searchParams }: { searchParams: SearchParams }) {
  const [sp, userId, claims] = await Promise.all([searchParams, currentUserId(), getAuthClaims()]);
  const app = isAppMode(sp);
  const done = one(sp.done) === "1";
  const store = one(sp.store);
  const error = one(sp.error);
  const email = typeof claims?.email === "string" ? claims.email : "";

  return (
    <div className="policy-page">
      {/* The key remounts SiteHeader after the server sign-out, so it re-reads the now cleared auth cookie. */}
      {app ? <AppModeHeader /> : <SiteHeader key={done ? "signed-out" : "account"} />}

      <main className="policy-main" style={app ? { paddingTop: "40px" } : undefined}>
        <div className="policy-container">
          <h1 className="policy-title">Delete your account</h1>
          <p className="policy-updated">
            Deleting your account is permanent. This page explains what is removed and lets you do it.
          </p>

          <div className="policy-content">

            {done && (
              <div role="status" style={noticeStyle}>
                <p style={{ marginBottom: store ? "10px" : 0 }}>
                  <strong>Your account has been deleted.</strong> Your receptionists, phone numbers,
                  calls, recordings, transcripts, calendar connections and devices are gone.
                </p>
                {store === "apple" && (
                  <p style={{ margin: 0 }}>
                    Your subscription is billed by Apple and is not cancelled by deleting the account.
                    Cancel it in iPhone Settings: your name, then Subscriptions.
                  </p>
                )}
                {store === "google" && (
                  <p style={{ margin: 0 }}>
                    Your subscription is billed by Google and is not cancelled by deleting the account.
                    Cancel it in the Play Store: your profile, Payments &amp; subscriptions, then Subscriptions.
                  </p>
                )}
              </div>
            )}

            {error === "confirm" && (
              <div role="alert" style={noticeStyle}>
                <p style={{ margin: 0 }}>Type DELETE, in capitals, to confirm.</p>
              </div>
            )}
            {error === "signed-out" && (
              <div role="alert" style={noticeStyle}>
                <p style={{ margin: 0 }}>You are no longer signed in. Sign in again to delete your account.</p>
              </div>
            )}
            {error === "failed" && (
              <div role="alert" style={noticeStyle}>
                <p style={{ margin: 0 }}>
                  Could not delete your account. Nothing was charged. Try again in a moment, or email{" "}
                  <a href={`mailto:${supportEmail}`}>{supportEmail}</a> from the address on your account.
                </p>
              </div>
            )}

            <h2>What deletion removes</h2>
            <ul>
              <li>Your AI receptionists and their settings, greetings, voices and knowledge</li>
              <li>Your phone numbers, which are returned to us and stop answering immediately</li>
              <li>Your calls, including recordings, transcripts, summaries and messages</li>
              <li>Your connected calendars (we drop the connection; nothing in your calendar is deleted)</li>
              <li>Your signed-in devices and notification settings</li>
              <li>Your profile and sign-in, including a Sign in with Apple link if you used one</li>
            </ul>
            <p>
              Account data is deleted immediately. Payment records are kept for as long as Slovak tax
              and accounting law requires, as described in our{" "}
              <Link href={withAppMode("/privacy-policy", app)}>Privacy Policy</Link>.
            </p>

            <h2>Subscriptions bought in the App Store or on Google Play</h2>
            <p>
              Deleting your account does <strong>not</strong> cancel a subscription billed by Apple or
              Google. Cancel it in the store first, or it may keep renewing:
            </p>
            <ul>
              <li><strong>App Store:</strong> iPhone Settings, tap your name, tap Subscriptions, choose AI Receptionist, tap Cancel Subscription.</li>
              <li><strong>Google Play:</strong> Play Store app, tap your profile picture, Payments &amp; subscriptions, Subscriptions, choose AI Receptionist, tap Cancel subscription.</li>
            </ul>

            <h2>How to delete your account</h2>
            <p>
              <strong>In the app:</strong> open Settings and choose Delete account. You will be asked to type
              DELETE to confirm.
            </p>

            {userId && !done ? (
              <form action={deleteOwnAccountAction} style={{ marginTop: "8px" }}>
                <p>
                  <strong>On this page:</strong> you are signed in{email ? ` as ${email}` : ""}. Type{" "}
                  <strong>DELETE</strong> below to delete this account now.
                </p>
                {app && <input type="hidden" name="app" value="1" />}
                <p>
                  <label htmlFor="confirm" style={{ display: "block", marginBottom: "8px" }}>
                    Type DELETE to confirm
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="text"
                    required
                    pattern="DELETE"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="DELETE"
                    title="Type DELETE in capitals"
                    style={inputStyle}
                  />
                </p>
                <p>
                  <button type="submit" style={dangerButtonStyle}>
                    Delete my account
                  </button>
                </p>
              </form>
            ) : (
              !done && (
                <p>
                  <strong>On this page:</strong>{" "}
                  {app ? (
                    <>
                      you are not signed in here. Use Settings &gt; Delete account in the app, or email{" "}
                      <a href={`mailto:${supportEmail}`}>{supportEmail}</a> from the address on your
                      account and we will delete it for you.
                    </>
                  ) : (
                    <>
                      {/* A plain anchor on purpose: AuthDialogProvider reads ?auth=login
                          once, when it mounts, and a next/link soft navigation would
                          leave it mounted with the dialog closed. */}
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                      <a href="/account/delete?auth=login&next=%2Faccount%2Fdelete">sign in</a> to
                      delete your account here, or email{" "}
                      <a href={`mailto:${supportEmail}`}>{supportEmail}</a> from the address on your
                      account and we will delete it for you.
                    </>
                  )}
                </p>
              )
            )}

            <h2>Questions</h2>
            <p>
              Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. See also our{" "}
              <Link href={withAppMode("/support", app)}>support page</Link>.
            </p>

          </div>
        </div>
      </main>
      {!app && <SiteFooter />}
    </div>
  );
}
