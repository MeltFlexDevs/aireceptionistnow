
export interface DemoNumberCandidate {
  e164: string;
  elevenlabs_phone_number_id: string | null;
}

function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

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
