"use client";

import { useState } from "react";
import type { ReceiptStrings } from "@/lib/receipts/strings";

type State = "idle" | "writing" | "sending" | "confirmed" | "corrected";

/**
 * The two buttons, and the only interactive thing on the page.
 *
 * "Something's wrong" is the one that matters. The confirm button exists mostly
 * so the correction is not the only thing to press - a page offering a single
 * negative action reads as an accusation and gets ignored - and what it records
 * is never published as a satisfaction rate.
 *
 * The correction box is free text on purpose. A category picker ("wrong time /
 * wrong service / wrong name") would make the caller choose our words for our
 * mistake, and the sentence they would have typed is worth more to whoever reads
 * it than the bucket we would have put it in.
 */
export default function ReceiptActions({
  token,
  strings: t,
  confirmed,
  corrected,
}: {
  token: string;
  strings: ReceiptStrings;
  confirmed: boolean;
  corrected: boolean;
}) {
  const [state, setState] = useState<State>(
    corrected ? "corrected" : confirmed ? "confirmed" : "idle",
  );
  const [text, setText] = useState("");

  async function post(body: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch(`/api/r/${token}/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  if (state === "confirmed") {
    return <p style={S.done}>{t.thanksConfirmed}</p>;
  }
  if (state === "corrected") {
    return <p style={S.done}>{t.thanksCorrected}</p>;
  }

  if (state === "writing" || state === "sending") {
    const sending = state === "sending";
    return (
      <form
        style={S.form}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setState("sending");
          const ok = await post({ correction: text });
          // An optimistic "thanks" for a correction that never landed would be
          // the exact failure this feature exists to prevent, so a failed send
          // returns them to the box with their words still in it.
          setState(ok ? "corrected" : "writing");
        }}
      >
        <label htmlFor="correction" style={S.label}>
          {t.correctionPrompt}
        </label>
        <textarea
          id="correction"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.correctionPlaceholder}
          rows={3}
          maxLength={600}
          autoFocus
          style={S.textarea}
        />
        <button type="submit" disabled={sending || !text.trim()} style={S.primary}>
          {t.send}
        </button>
      </form>
    );
  }

  return (
    <div style={S.row}>
      <button
        type="button"
        style={S.secondary}
        onClick={async () => {
          // Optimistic: confirming is a courtesy, and bouncing someone back to
          // a button because a write failed is worse than losing the datum.
          setState("confirmed");
          await post({ confirm: true });
        }}
      >
        {t.looksRight}
      </button>
      <button type="button" style={S.primary} onClick={() => setState("writing")}>
        {t.somethingWrong}
      </button>
    </div>
  );
}

const base: React.CSSProperties = {
  flex: 1,
  padding: "13px 16px",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 500,
  fontFamily: "inherit",
  border: "1px solid transparent",
  cursor: "pointer",
};

const S: Record<string, React.CSSProperties> = {
  row: { display: "flex", gap: 10, marginTop: 24 },
  secondary: { ...base, background: "#fff", borderColor: "#d4d4d4", color: "#1D1D1D" },
  primary: { ...base, background: "#1D1D1D", color: "#fff" },
  form: { marginTop: 24, display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 14, fontWeight: 500 },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d4d4d4",
    fontSize: 16,
    fontFamily: "inherit",
    lineHeight: 1.5,
    resize: "vertical",
  },
  done: {
    marginTop: 24,
    padding: "14px 16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    fontSize: 15,
    lineHeight: 1.5,
    color: "#166534",
  },
};
