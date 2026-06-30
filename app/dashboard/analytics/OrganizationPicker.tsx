"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  function setOrganization(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("org", value);
    else next.delete("org");
    // Switching organization resets the assistant filter. It may not belong to
    // the newly selected org.
    next.delete("assistant");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <select
      value={selected}
      onChange={(e) => setOrganization(e.target.value)}
      className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-900"
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
