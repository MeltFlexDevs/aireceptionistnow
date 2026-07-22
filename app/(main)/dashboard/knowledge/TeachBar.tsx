"use client";

import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { UploadDropzone } from "./UploadDropzone";
import { NotesModal } from "./NotesModal";
import { addWebsiteKnowledgeAction, addPdfKnowledgeAction } from "./actions";

/**
 * Zone C: the one place you teach the receptionist something new. Each form
 * saves itself and reports with an inline pill - no page reload, no lost scroll
 * position in the source list below.
 *
 * `orgId` may be "": a brand-new account has no business row yet, and the
 * action creates one on the first teach rather than dead-ending on a
 * "create an organization" step.
 */
export function TeachBar({ orgId, notes }: { orgId: string; notes: string }) {
  const t = useT();
  const k = t.knowledge;
  const [siteState, siteAction] = useActionState<ActionState, FormData>(
    addWebsiteKnowledgeAction,
    IDLE,
  );
  const [pdfState, pdfAction] = useActionState<ActionState, FormData>(addPdfKnowledgeAction, IDLE);

  return (
    <div className="shape-card glass shrink-0 space-y-3 p-4">
      <form action={siteAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={orgId} />
        <input
          name="url"
          type="url"
          required
          placeholder={k.teachWebsitePlaceholder}
          className="h-9 min-w-56 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
        />
        <SubmitButton pendingText={k.teachWebsitePending}>{k.teachWebsite}</SubmitButton>
        <SavePill state={siteState} />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {/* The dropzone auto-submits on file pick, so it has to live inside the
            uploading form for useFormStatus to see it. */}
        <form action={pdfAction} className="flex min-w-0 flex-1">
          <input type="hidden" name="id" value={orgId} />
          <UploadDropzone />
        </form>
        <NotesModal orgId={orgId} notes={notes} />
      </div>
      <SavePill state={pdfState} />
    </div>
  );
}
