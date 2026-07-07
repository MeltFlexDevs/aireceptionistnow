"use client";

import { useState } from "react";

/**
 * Copy-paste prompt template block for blog posts. Editorial styling to match
 * the prose components: soft gray panel, mono text, quiet copy affordance.
 */
export function PromptBlock({
  label = "Prompt template",
  text,
}: {
  label?: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (old browser, permissions) - leave the text selectable.
    }
  };

  return (
    <div className="my-7 overflow-hidden rounded-md border border-[#e5e5e5] bg-[#fafafa]">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-2.5">
        <span className="text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer text-[11px] font-medium tracking-[0.06em] text-[#666] uppercase transition-colors hover:text-[#1D1D1D]"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] whitespace-pre-wrap text-[#333]">
        {text}
      </pre>
    </div>
  );
}
