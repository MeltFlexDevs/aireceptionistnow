"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Option {
  id: string;
  name: string;
}

interface Props {
  organizations: Option[];
  selected: string;
}

export function OrganizationPicker({ organizations, selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setOrganization(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("org", value);
    else next.delete("org");
    next.delete("assistant");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  return (
    <select
      value={selected}
      onChange={(e) => setOrganization(e.target.value)}
      aria-busy={isPending}
      className={`h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition-opacity focus:border-neutral-900 ${isPending ? "opacity-60" : ""}`}
      aria-label="Filter analytics by organization"
    >
      <option value="">All organizations</option>
      {organizations.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
