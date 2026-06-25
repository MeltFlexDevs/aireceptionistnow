import Link from "next/link";
import { listNumbers, type PhoneNumber } from "@/lib/dashboard/db";
import { SectionCard } from "../components/SectionCard";
import { Hash, Plus } from "../icons";
import { buyNumberAction } from "./actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
];

export default async function NumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let numbers: PhoneNumber[] = [];
  let loadError = "";
  try {
    numbers = await listNumbers();
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Phone numbers</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Register the numbers your AI answers and configure each one.
          </p>
        </div>
      </header>

      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      <SectionCard title="Add a number" subtitle="Create a new AI phone number in one click.">
        <form action={buyNumberAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-48">
            <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">Country</label>
            <select id="country" name="country" defaultValue="US" className={field}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-32">
            <label htmlFor="area_code" className="mb-1.5 block text-sm font-medium text-neutral-700">Area code</label>
            <input id="area_code" name="area_code" placeholder="optional" className={field} />
          </div>
          <button
            type="submit"
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Create number
          </button>
        </form>
      </SectionCard>

      {numbers.length === 0 && !loadError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Hash className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-medium text-neutral-900">No numbers yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Add your first number above to start taking AI calls.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {numbers.map((n) => (
            <Link
              key={n.id}
              href={`/dashboard/numbers/${n.id}`}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-medium tracking-tight text-neutral-900">{n.e164}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    n.enabled ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${n.enabled ? "bg-emerald-500" : "bg-neutral-400"}`} />
                  {n.enabled ? "Live" : "Off"}
                </span>
              </div>
              <div className="mt-3 text-xs text-neutral-400">
                {n.assistant_id ? "Assigned to an assistant" : "Unassigned"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
