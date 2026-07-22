"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/client";
import { importPdfAction } from "../actions";

// 15 MB parse cap (lib/knowledge/pdf.ts); the 16 MB server-action body limit
// would otherwise reject bigger files before our error handling can run.
const MAX_PDF_BYTES = 15 * 1024 * 1024;

// A custom drop-zone rather than the raw native file input (which renders as an
// out-of-place "Choose File" default). The native input is visually hidden but
// still handles the picking; choosing a PDF imports it right away.
export function PdfForm() {
  const o = useT().onboarding;
  const [tooLarge, setTooLarge] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={importPdfAction} className="space-y-1.5">
      <label
        htmlFor="file"
        className="press flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
      >
        <UploadCloud className="h-4 w-4 shrink-0 text-neutral-400" />
        <span className="min-w-0 flex-1 truncate">{name ? name : o.orUpload}</span>
      </label>
      <input
        id="file"
        name="file"
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          const big = !!f && f.size > MAX_PDF_BYTES;
          setTooLarge(big);
          setName(f && !big ? f.name : null);
          if (f && !big) formRef.current?.requestSubmit();
        }}
      />
      <PdfStatus tooLarge={tooLarge} tooLargeText={o.pdfTooLarge} importingText={o.uploading} />
    </form>
  );
}

function PdfStatus({
  tooLarge,
  tooLargeText,
  importingText,
}: {
  tooLarge: boolean;
  tooLargeText: string;
  importingText: string;
}) {
  const { pending } = useFormStatus();
  if (pending) {
    return (
      <p className="flex items-center gap-2 text-xs text-neutral-500">
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
        {importingText}
      </p>
    );
  }
  if (tooLarge) return <p className="text-xs text-rose-600">{tooLargeText}</p>;
  return null;
}

function UploadCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 13v8M8 17l4-4 4 4" />
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </svg>
  );
}
