// Which line the public "Talk to our AI now" demo may dial out from.
//
// Split out from the route (and kept free of I/O) because this decision is the
// whole ballgame: pick a line an assistant is using and the demo goes out AS
// that customer - ElevenLabs reports their line as the call's agent_number, so
// the post-call webhook resolves the conversation to their assistant and a
// stranger's demo transcript lands in their dashboard.

export interface DemoNumberCandidate {
  e164: string;
  elevenlabs_phone_number_id: string | null;
}

/** Digits two E.164 numbers share from the left - the country/area proximity
 *  score. "+421903…" scores 3 against "+420…" (shared "+42"). */
function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/**
 * The ElevenLabs phone-number id to place a demo call to `to` from, or null when
 * there is nothing safe to call from (caller must then refuse the call).
 *
 * Prefers the free-pool line whose country best matches the destination, so the
 * visitor sees a local(ish) caller ID. `envId` (the configured demo line) is the
 * last resort and is only used when it is not in `inUse` - typically it's a
 * dedicated demo number absent from phone_numbers entirely.
 *
 * Every candidate is checked against `inUse`, including pool ones: the pool query
 * filters on assistant_id, but a number can be claimed between that read and this
 * decision, and being wrong here is what pollutes a customer's dashboard.
 */
export function pickDemoCallerId(
  to: string,
  pool: DemoNumberCandidate[],
  inUse: ReadonlySet<string>,
  envId?: string | null,
): string | null {
  let best: { id: string; shared: number } | null = null;
  for (const n of pool) {
    const id = n.elevenlabs_phone_number_id;
    if (!id || inUse.has(id)) continue;
    const shared = sharedPrefix(n.e164, to);
    if (!best || shared > best.shared) best = { id, shared };
  }
  if (best) return best.id;

  const env = (envId ?? "").trim();
  if (!env || inUse.has(env)) return null;
  return env;
}
