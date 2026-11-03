"use client";

import { useActionState, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { ChevronDown, FileText, Globe, Sparkle } from "../icons";
import { NotesModal } from "./NotesModal";
import { removeKnowledgeSourceAction, updateKnowledgeNotesAction } from "./actions";

export interface SourceRow {
  id: string;
  kind: "website" | "pdf" | "text";
  title: string;
  /** Localized "Added 2 days ago"; "" when unknown. */
  added: string;
  summary: string;
}

function RemoveButton({ orgId, sourceId }: { orgId: string; sourceId: string }) {
  const t = useT();
  const k = t.knowledge;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    removeKnowledgeSourceAction,
    IDLE,
  );
  // Two steps, like disconnecting a calendar: a removed source is gone for
  // good, so the first click only asks.
  const [confirming, setConfirming] = useState(false);
  // After Cancel, focus goes back to the Remove button that opened the confirm.
  const [returnFocus, setReturnFocus] = useState(false);
  return (
    <form action={formAction} className="flex shrink-0 items-center gap-2">
      <input type="hidden" name="id" value={orgId} />
      <input type="hidden" name="source_id" value={sourceId} />
      {/* Success is self-evident - the row disappears on revalidate - so only
          a failure needs the pill. */}
      {state.ok === false && <SavePill state={state} />}
      {confirming ? (
        <>
          <span className="text-xs text-neutral-500">{k.removeConfirm}</span>
          <button
            type="submit"
            disabled={pending}
            className="press rounded-lg border border-rose-200 bg-white inline-flex min-h-9 items-center px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? k.removing : k.remove}
          </button>
          {/* Focus lands on the safe choice, so a second Enter does not delete. */}
          <button
            type="button"
            autoFocus
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setReturnFocus(true);
            }}
            className="press inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            {t.common.cancel}
          </button>
        </>
      ) : (
        <button
          type="button"
          autoFocus={returnFocus}
          onClick={() => setConfirming(true)}
          className="press rounded-lg border border-neutral-200 bg-white inline-flex min-h-9 items-center px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-rose-200 hover:text-rose-600"
        >
          {k.remove}
        </button>
      )}
    </form>
  );
}

/**
 * Zone D: the page's single scroll region. Rows expand in place to show what
 * the receptionist actually took from each source. No character counts - a
 * number of characters is not something a business owner can act on.
 */
export function SourceList({
  orgId,
  notes,
  verified,
  rows,
}: {
  orgId: string;
  notes: string;
  verified: string;
  rows: SourceRow[];
}) {
  const t = useT();
  const k = t.knowledge;
  // One label per kind. A Record, so a new kind fails tsc instead of falling
  // through to "PDF" again.
  const kindLabel: Record<SourceRow["kind"], string> = {
    website: k.sourceWebsite,
    pdf: k.sourcePdf,
    text: k.sourceText,
  };
  const [notesState, notesAction, notesPending] = useActionState<ActionState, FormData>(
    updateKnowledgeNotesAction,
    IDLE,
  );

  return (
    <ul className="divide-y divide-neutral-100">
      {notes && (
        <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
          <Sparkle className="h-4 w-4 shrink-0 text-neutral-400" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-neutral-900">
              {k.sourceNotes}
            </span>
            <span className="block truncate text-xs text-neutral-500">{k.sourceNotesMeta}</span>
          </span>
          <NotesModal
            orgId={orgId}
            notes={notes}
            verified={verified}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="press shrink-0 rounded-lg border border-neutral-200 bg-white inline-flex min-h-9 items-center px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {t.common.edit}
              </button>
            )}
          />
          {/* Removing the notes row is just saving them empty. */}
          <form action={notesAction} className="shrink-0">
            <input type="hidden" name="id" value={orgId} />
            <input type="hidden" name="knowledge_notes" value="" />
            <button
              type="submit"
              disabled={notesPending}
              className="press rounded-lg border border-neutral-200 bg-white inline-flex min-h-9 items-center px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60"
            >
              {notesPending ? k.removing : k.remove}
            </button>
          </form>
          {notesState.ok === false && <SavePill state={notesState} />}
        </li>
      )}

      {rows.map((row) => (
        <li key={row.id} className="py-3">
          <details className="group">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 [&::-webkit-details-marker]:hidden">
              {row.kind === "website" ? (
                <Globe className="h-4 w-4 shrink-0 text-neutral-400" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-900">
                  {row.title}
                </span>
                <span className="block truncate text-xs text-neutral-500">
                  {kindLabel[row.kind]}
                  {row.added ? ` · ${row.added}` : ""}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
              <RemoveButton orgId={orgId} sourceId={row.id} />
            </summary>
            <p className="mt-2 pl-7 text-xs leading-relaxed text-neutral-600">
              {row.summary || k.sourceNoSummary}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
