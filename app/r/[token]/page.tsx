import { after } from "next/server";
import { getPublicReceipt, markReceiptViewed } from "@/lib/receipts/store";
import { receiptLang, receiptStrings } from "@/lib/receipts/strings";
import ReceiptActions from "./ReceiptActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The caller's receipt.
 *
 * The one page in this product whose reader is the business's customer rather
 * than the business. It shows what the assistant understood, what it booked, and
 * offers the only correction channel that exists anywhere in the system - the
 * accuracy audit can catch an invented price, because the knowledge base
 * contradicts it, but nothing can catch a misheard house number except the
 * person who said it.
 *
 * Rendered on every request and never cached: it is one person's private
 * summary of one phone call, and a shared cache holding it would be the whole
 * failure mode.
 */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let receipt: Awaited<ReturnType<typeof getPublicReceipt>> = null;
  try {
    receipt = await getPublicReceipt(token);
  } catch (err) {
    console.error("[receipt] load failed", err);
  }

  // A malformed token, an unknown token, a deleted call and an expired link all
  // render the same thing. Distinguishing them would tell anyone walking the
  // token space when they had found a real one.
  if (!receipt || receipt.expired) {
    const t = receiptStrings("en");
    return (
      <main style={S.page}>
        <div style={S.card}>
          <p style={S.muted}>{t.expired}</p>
        </div>
      </main>
    );
  }

  const t = receiptStrings(receipt.language);
  const lang = receiptLang(receipt.language);

  // Recorded after the response is on its way - the reader should never wait on
  // our bookkeeping, and a failed write must not cost them the page.
  after(() => markReceiptViewed(token));

  return (
    <main lang={lang} style={S.page}>
      <article style={S.card}>
        <header style={S.header}>
          <p style={S.eyebrow}>{t.heading}</p>
          <h1 style={S.title}>{receipt.businessName}</h1>
          <p style={S.when}>{formatWhen(receipt.startedAt, lang)}</p>
        </header>

        {receipt.recap ? (
          <>
            <p style={S.intro}>{t.intro}</p>
            <p style={S.recap}>{receipt.recap}</p>
          </>
        ) : (
          // The summary is written seconds after the call ends, and a booking
          // receipt is texted the moment the calendar write lands - so a fast
          // reader genuinely can arrive first. Say so plainly instead of
          // rendering an empty page or, worse, the owner-language dashboard
          // summary as a stand-in.
          <p style={S.muted}>{t.pending}</p>
        )}

        {receipt.booking ? (
          <section style={S.booking}>
            <p style={S.bookingLabel}>{t.appointment}</p>
            <p style={S.bookingWhen}>{formatWhen(receipt.booking.startTime, lang)}</p>
            {receipt.booking.title ? (
              <p style={S.bookingTitle}>{receipt.booking.title}</p>
            ) : null}
            <a style={S.icsLink} href={`/api/r/${receipt.token}/calendar`} download>
              {t.appointment} (.ics)
            </a>
          </section>
        ) : null}

        {receipt.hasAudio ? (
          <section style={S.audio}>
            <p style={S.audioLabel}>{t.listen}</p>
            {/* Streamed through our own route so the ElevenLabs account key
                never reaches the page, and so the audio dies with the link. */}
            <audio controls preload="none" style={S.player} src={`/api/r/${receipt.token}/audio`}>
              <track kind="captions" />
            </audio>
          </section>
        ) : null}

        <ReceiptActions
          token={receipt.token}
          strings={t}
          confirmed={receipt.confirmed}
          corrected={receipt.corrected}
        />

        <p style={S.privacy}>{t.privacy}</p>
      </article>
    </main>
  );
}

function formatWhen(iso: string, lang: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

/**
 * Inline styles, not Tailwind classes.
 *
 * This page ships to a stranger on a phone connection and has no other reason to
 * pull a stylesheet: the whole document is one card. Inlining keeps it to a
 * single request and removes any chance of the marketing CSS growing into it.
 */
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#f6f6f5",
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px 48px",
    fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
    color: "#1D1D1D",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 16,
    padding: "28px 22px",
    boxShadow: "0 1px 3px rgb(15 23 42 / 0.06), 0 10px 30px -18px rgb(15 23 42 / 0.25)",
  },
  header: { marginBottom: 20 },
  eyebrow: { margin: 0, fontSize: 13, color: "#6b7280", letterSpacing: "0.01em" },
  title: { margin: "2px 0 0", fontSize: 24, fontWeight: 600, lineHeight: 1.2 },
  when: { margin: "6px 0 0", fontSize: 14, color: "#6b7280" },
  intro: { margin: "0 0 14px", fontSize: 14, color: "#6b7280", lineHeight: 1.5 },
  recap: { margin: 0, fontSize: 17, lineHeight: 1.6 },
  muted: { margin: 0, fontSize: 15, color: "#6b7280", lineHeight: 1.6 },
  booking: {
    marginTop: 22,
    padding: "16px 18px",
    background: "#f6f6f5",
    borderRadius: 12,
  },
  bookingLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6b7280",
  },
  bookingWhen: { margin: "6px 0 0", fontSize: 18, fontWeight: 600 },
  bookingTitle: { margin: "4px 0 0", fontSize: 15, color: "#374151" },
  icsLink: { display: "inline-block", marginTop: 10, fontSize: 14, color: "#1D1D1D" },
  audio: { marginTop: 22 },
  audioLabel: { margin: "0 0 8px", fontSize: 13, color: "#6b7280" },
  player: { width: "100%" },
  privacy: { margin: "22px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 },
};
