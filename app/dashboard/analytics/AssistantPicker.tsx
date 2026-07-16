"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Option {
  id: string;
  name: string;
}

interface Props {
  assistants: Option[];
  selected: string;
}

export function AssistantPicker({ assistants, selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setAssistant(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("assistant", value);
    else next.delete("assistant");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  return (
    <select
      value={selected}
      onChange={(e) => setAssistant(e.target.value)}
      aria-busy={isPending}
      className={`h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition-opacity focus:border-neutral-900 ${isPending ? "opacity-60" : ""}`}
      aria-label="Filter analytics by assistant"
    >
      <option value="">All assistants</option>
      {assistants.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
