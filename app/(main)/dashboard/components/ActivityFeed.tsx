import Link from "next/link";

export interface ActivityRow {
  id: string;
  /** What the receptionist did, already localized. */
  headline: string;
  /** Caller number or name; "" to omit. */
  caller: string;
  /** Relative time, already localized. */
  when: string;
  href: string;
}

// A Stripe-style event timeline built from the most recent calls: each call's
// outcome is the headline, the caller and time sit underneath, and a rail
// connects the dots. Purely presentational - the caller localizes every string
// and supplies the link, so this stays a dumb list. Real data only, so it stays
// honest even when the account is quiet.
export function ActivityFeed({ rows }: { rows: ActivityRow[] }) {
  return (
    <ol className="relative">
      {rows.map((row, i) => (
        <li key={row.id} className="relative flex gap-3 pb-4 pl-5 last:pb-0">
          {i < rows.length - 1 && (
            <span className="absolute bottom-0 left-[3px] top-2.5 w-px bg-neutral-200" aria-hidden />
          )}
          <span
            className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full bg-neutral-900 ring-4 ring-white"
            aria-hidden
          />
          <Link href={row.href} scroll={false} className="press min-w-0 flex-1 rounded-lg">
            <p className="truncate text-sm text-neutral-800">
              <span className="font-medium">{row.headline}</span>
              {row.caller ? <span className="text-neutral-500"> · {row.caller}</span> : null}
            </p>
            <p className="text-xs text-neutral-400">{row.when}</p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
