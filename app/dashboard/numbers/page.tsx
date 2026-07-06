import Link from "next/link";
import { listNumbers, type PhoneNumber } from "@/lib/dashboard/db";
import { countryForE164 } from "@/lib/number-pricing";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { PageHeader } from "../components/PageHeader";
import { Hash } from "../icons";

export const dynamic = "force-dynamic";

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

  // Available to assign = same rule claimFreeNumber() uses to hand a number to an assistant.
  const available = numbers.filter((n) => !n.assistant_id && n.enabled && n.twilio_sid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phone numbers"
        description="Available numbers you can assign to an assistant."
      />

      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      {available.length === 0 && !loadError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
            <Hash className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-medium text-neutral-900">No numbers available</h2>
          <p className="mt-1 text-sm text-neutral-500">Every number is already assigned to an assistant.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {available.map((n) => {
            const { flag, name } = countryForE164(n.e164);
            return (
              <Link
                key={n.id}
                href={`/dashboard/numbers/${n.id}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-base font-medium tracking-tight text-neutral-900">
                    <span className="text-lg leading-none" aria-hidden>{flag}</span>
                    {formatPhone(n.e164)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
                <div className="mt-3 text-xs text-neutral-400">{name}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
