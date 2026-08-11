"use client";

import { useActionState, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import type { DemandRow } from "@/lib/dashboard/demand";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { answerKnowledgeGapAction, dismissKnowledgeGapAction } from "./actions";

/**
 * The questions your receptionist could not answer.
 *
 * The most valuable list in the dashboard and the cheapest to produce: it is one
 * extra field on a summary pass that was already running. Everything else here
 * asks the owner to imagine what callers will want. This is a record of what
 * they actually asked, in their own words, and answering one row permanently
 * removes a way the assistant can fail.
 *
 * Two kinds render differently on purpose. An `unanswered` row is a gap with a
 * fix - type a sentence, it becomes a verified answer. A `not_offered` row has
 * no fix and must not pretend to: the caller wanted something the business does
 * not do, and the only honest actions are to note it or to dismiss it. Offering
 * an answer box there would invite an operator to configure away a fact about
 * their market.
 */
export function GapList({ orgId, rows }: { orgId: string; rows: DemandRow[] }) {
  const t = useT();
  const k = t.knowledge;

  if (rows.length === 0) return null;

  const answerable = rows.filter((r) => r.kind === "unanswered");
  const market = rows.filter((r) => r.kind === "not_offered");

  return (
    <section className="shape-card glass shrink-0 space-y-3 p-4">
      <div>
        <h2 className="text-sm font-semibold">{k.gapsTitle}</h2>
        <p className="mt-0.5 text-xs text-neutral-500">{k.gapsNote}</p>
      </div>

      <ul className="divide-y divide-neutral-200/70">
        {answerable.map((row) => (
          <GapRow key={row.id} orgId={orgId} row={row} />
        ))}
      </ul>

      {market.length > 0 ? (
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs font-medium text-neutral-700">{k.gapsNotOffered}</p>
          <ul className="mt-2 space-y-1.5">
            {market.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-neutral-600">
                  <span className="font-medium text-neutral-900">{row.topic}</span>
                  {row.quote ? <> - &ldquo;{row.quote}&rdquo;</> : null}
                </span>
                <DismissButton row={row} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function GapRow({ orgId, row }: { orgId: string; row: DemandRow }) {
  const t = useT();
  const k = t.knowledge;
  const [state, action] = useActionState<ActionState, FormData>(answerKnowledgeGapAction, IDLE);
  const [answer, setAnswer] = useState("");

  return (
    <li className="py-3">
      <p className="text-sm font-medium">{row.topic}</p>
      {row.quote ? (
        <p className="mt-0.5 text-xs text-neutral-500">&ldquo;{row.quote}&rdquo;</p>
      ) : null}

      <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={orgId} />
        <input type="hidden" name="signal_id" value={row.id} />
        <input
          name="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={k.gapsAnswerPlaceholder}
          maxLength={600}
          className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        {/* Gated on a non-empty answer: an empty verified answer is worse than
            no verified answer, because the agent believes it has one. */}
        <SubmitButton disabled={!answer.trim()}>{k.gapsAnswer}</SubmitButton>
        <DismissButton row={row} />
        <SavePill state={state} />
      </form>
    </li>
  );
}

function DismissButton({ row }: { row: DemandRow }) {
  const t = useT();
  const [, action] = useActionState<ActionState, FormData>(dismissKnowledgeGapAction, IDLE);
  return (
    <form action={action}>
      <input type="hidden" name="signal_id" value={row.id} />
      <button
        type="submit"
        className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900"
      >
        {t.knowledge.gapsDismiss}
      </button>
    </form>
  );
}
