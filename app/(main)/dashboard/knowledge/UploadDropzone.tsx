"use client";

import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/client";
import { FileText, Spinner } from "../icons";

// Dropzone that submits its parent form the moment a file is picked or
// dropped - no separate upload button. Must be rendered inside the <form>
// whose action does the upload (useFormStatus reads that form's state).
export function UploadDropzone() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <label
      htmlFor="kn_pdf"
      aria-busy={pending}
      className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed px-4 py-3 text-center transition-colors ${
        pending
          ? "border-neutral-300 bg-neutral-50 opacity-80"
          : "border-neutral-300 bg-white/60 hover:border-neutral-500"
      }`}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4 animate-spin text-neutral-400" />
          <span className="text-[13px] font-medium leading-snug text-neutral-700">
            {t.knowledge.uploading}
          </span>
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 text-neutral-400" />
          <span className="text-[13px] font-medium leading-snug text-neutral-700">
            {t.knowledge.dropPdf}
          </span>
          <span className="text-xs text-neutral-400">{t.knowledge.dropPdfHint}</span>
        </>
      )}
      <input
        id="kn_pdf"
        name="pdf"
        type="file"
        accept="application/pdf"
        required
        disabled={pending}
        onChange={(e) => {
          if (e.currentTarget.files?.length) e.currentTarget.form?.requestSubmit();
        }}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-wait"
      />
    </label>
  );
}
