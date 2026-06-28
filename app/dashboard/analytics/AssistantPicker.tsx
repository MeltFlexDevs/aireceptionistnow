"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  function setAssistant(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("assistant", value);
    else next.delete("assistant");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <select
      value={selected}
      onChange={(e) => setAssistant(e.target.value)}
      className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-900"
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
