import { serviceClient } from "./supabase";

/**
 * What the phone line heard and could not deliver.
 *
 * Two intake paths land here, and they are the two halves of the same loop.
 *
 *   The assistant's own admission - `demand_signals`, written by the post-call
 *   summarizer when a caller asked for something the knowledge base did not
 *   cover, or for something the business does not do.
 *
 *   The caller's correction - written from the receipt page into `needs_review`
 *   and `review_claims` (see lib/receipts/store.ts), when the assistant was
 *   confident and wrong. That path exists because the accuracy audit cannot
 *   catch a misheard house number: nothing in the knowledge base contradicts it.
 *
 * The first is fixable in one line, which is why this module's main verb is
 * "answer": the owner types the sentence once, it becomes a verified answer, and
 * the same gap is never hit again. That is the compounding half of the product -
 * every answer permanently removes a failure mode - and it is the reason this is
 * a loop rather than a report.
 */

export interface DemandRow {
  id: number;
  kind: "unanswered" | "not_offered";
  topic: string;
  quote: string;
  createdAt: string;
  callId: string;
  /** The caller's number, for context on the row. May be "". */
  from: string;
}

/** Enough to act on in one sitting. A longer list is a backlog, not a task. */
const PAGE = 25;

export async function listOpenDemand(ownerId: string | null): Promise<DemandRow[]> {
  if (!ownerId) return [];
  const { data, error } = await serviceClient()
    .from("demand_signals")
    .select("id, kind, topic, quote, created_at, call_id, call:calls(from_number)")
    .eq("owner_id", ownerId)
    .is("answered_at", null)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(PAGE);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const call = (r.call ?? null) as { from_number?: string } | null;
    return {
      id: Number(r.id),
      kind: r.kind === "not_offered" ? "not_offered" : "unanswered",
      topic: String(r.topic ?? ""),
      quote: String(r.quote ?? ""),
      createdAt: String(r.created_at ?? ""),
      callId: String(r.call_id ?? ""),
      from: String(call?.from_number ?? ""),
    };
  });
}

/**
 * Close a gap.
 *
 * Marks the signal answered and returns the question/answer pair for the caller
 * to merge into the knowledge base. Deliberately does NOT write the knowledge
 * itself: the verified-answer array lives on the organization, the merge has a
 * cap to respect, and the agent re-sync that follows tears down and rebuilds
 * every knowledge document on the ElevenLabs side. That belongs in one place -
 * the knowledge action - not duplicated here.
 *
 * Ownership is enforced in the update predicate rather than by reading first, so
 * there is no window between the check and the write.
 */
export async function markDemandAnswered(
  id: number,
  ownerId: string,
  answer: string,
): Promise<DemandRow | null> {
  const { data, error } = await serviceClient()
    .from("demand_signals")
    .update({ answer, answered_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("answered_at", null)
    .select("id, kind, topic, quote, created_at, call_id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const r = data as unknown as Record<string, unknown>;
  return {
    id: Number(r.id),
    kind: r.kind === "not_offered" ? "not_offered" : "unanswered",
    topic: String(r.topic ?? ""),
    quote: String(r.quote ?? ""),
    createdAt: String(r.created_at ?? ""),
    callId: String(r.call_id ?? ""),
    from: "",
  };
}

export async function dismissDemand(id: number, ownerId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("demand_signals")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", ownerId);
  if (error) throw error;
}

export interface DemandCluster {
  topic: string;
  count: number;
  quotes: string[];
}

export interface DemandDigest {
  ownerId: string;
  from: string;
  /** Total calls in the window, so a report can be suppressed on thin data. */
  calls: number;
  notOffered: DemandCluster[];
  unanswered: DemandCluster[];
}

/**
 * A report about two calls is noise, and a report that arrives every week
 * whether or not there is anything in it teaches the reader to ignore it.
 */
const MIN_CALLS_FOR_DIGEST = 20;
const MIN_CLUSTER_SIZE = 2;
const MAX_CLUSTERS = 6;
const QUOTES_PER_CLUSTER = 2;

/**
 * The weekly roll-up, per owner.
 *
 * Clustered by normalized topic string rather than by a model. An LLM pass would
 * group "saturday appointments" and "weekend opening" together and this does
 * not - but it also cannot invent a cluster, and a demand report whose
 * categories are model-generated is a report nobody can check against their own
 * transcripts. Exact-ish grouping that undercounts is the right failure here.
 */
export async function buildDemandDigests(sinceIso: string): Promise<DemandDigest[]> {
  const db = serviceClient();

  const { data, error } = await db
    .from("demand_signals")
    .select("owner_id, kind, topic, quote")
    .gte("created_at", sinceIso)
    .not("owner_id", "is", null)
    .is("dismissed_at", null);
  if (error) throw error;

  const byOwner = new Map<string, { kind: string; topic: string; quote: string }[]>();
  for (const row of data ?? []) {
    const r = row as unknown as Record<string, unknown>;
    const owner = String(r.owner_id ?? "");
    if (!owner) continue;
    const list = byOwner.get(owner) ?? [];
    list.push({
      kind: String(r.kind ?? ""),
      topic: String(r.topic ?? ""),
      quote: String(r.quote ?? ""),
    });
    byOwner.set(owner, list);
  }
  if (byOwner.size === 0) return [];

  // One count query per owner would be one round trip per tenant; this is a
  // single grouped read the app then buckets itself.
  const { data: callRows } = await db
    .from("calls")
    .select("owner_id")
    .gte("started_at", sinceIso)
    .in("owner_id", [...byOwner.keys()]);
  const callCounts = new Map<string, number>();
  for (const row of callRows ?? []) {
    const owner = String((row as { owner_id: unknown }).owner_id ?? "");
    callCounts.set(owner, (callCounts.get(owner) ?? 0) + 1);
  }

  const digests: DemandDigest[] = [];
  for (const [ownerId, rows] of byOwner) {
    const calls = callCounts.get(ownerId) ?? 0;
    if (calls < MIN_CALLS_FOR_DIGEST) continue;

    const notOffered = clusterDemand(rows.filter((r) => r.kind === "not_offered"));
    const unanswered = clusterDemand(rows.filter((r) => r.kind === "unanswered"));
    if (notOffered.length === 0 && unanswered.length === 0) continue;

    digests.push({ ownerId, from: sinceIso, calls, notOffered, unanswered });
  }
  return digests;
}

/**
 * Exported for its own test. The grouping rule is the whole quality bar of the
 * weekly report - too loose and it merges unrelated requests, too strict and a
 * real pattern shows up as six ones - so it is worth pinning down directly
 * rather than only through the database-shaped function above.
 */
export function clusterDemand(rows: { topic: string; quote: string }[]): DemandCluster[] {
  const buckets = new Map<string, DemandCluster>();
  for (const row of rows) {
    const key = normalize(row.topic);
    if (!key) continue;
    const bucket = buckets.get(key) ?? { topic: row.topic, count: 0, quotes: [] };
    bucket.count += 1;
    if (bucket.quotes.length < QUOTES_PER_CLUSTER && row.quote) bucket.quotes.push(row.quote);
    buckets.set(key, bucket);
  }
  return [...buckets.values()]
    .filter((b) => b.count >= MIN_CLUSTER_SIZE)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_CLUSTERS);
}

/** Lowercase, strip punctuation and collapse whitespace. Nothing cleverer. */
function normalize(topic: string): string {
  return topic
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\u0300-\u036f]", "g"), "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
