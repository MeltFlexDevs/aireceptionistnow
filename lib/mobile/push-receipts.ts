/**
 * Expo push receipts, the second half of a push send.
 *
 * A send returns one ticket per message, but Expo reports most dead tokens
 * only later, in the receipt for that ticket. `sendPushToOwner`
 * (lib/mobile/push.ts) stores every ok ticket in `push_tickets` (migration
 * 0018). The push-receipts cron asks Expo for the receipts 15 minutes later
 * and deletes the push_devices rows whose receipt says `DeviceNotRegistered`,
 * so later sends stop paying for dead installs.
 *
 * No top-level imports: the decisions here are pure and run under node:test.
 * `sweepPushReceipts` loads the service client only when the cron calls it.
 */

const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";

/** Expo's documented cap of receipt ids per getReceipts request. */
export const RECEIPT_BATCH = 1000;

/** Expo recommends checking receipts 15 minutes after the send. */
export const RECEIPT_DELAY_MS = 15 * 60_000;

/** Expo clears receipts after 24 hours, so an older ticket can never be checked. */
export const TICKET_MAX_AGE_MS = 24 * 60 * 60_000;

/**
 * Expo answers within minutes, so a ticket with no receipt an hour after the
 * send will most likely never get one. Such tickets are dropped: kept, they
 * would fill every batch and hide the newer tickets until they are a day old.
 */
export const UNANSWERED_MAX_AGE_MS = 60 * 60_000;

/** Ids per delete request. `.in()` puts them in the URL; analytics.ts uses 500 too. */
export const DELETE_CHUNK = 500;

const TIMEOUT_MS = 10_000;

/** One entry of a /push/send answer, in the order of the messages sent. */
export interface ExpoTicket {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

/** One entry of a /push/getReceipts answer. */
export interface ExpoReceipt {
  status?: "ok" | "error";
  message?: string;
  details?: { error?: string };
}

/** A push_devices row that a send goes to. */
export interface PushTarget {
  id: string;
  token: string;
}

/** A push_tickets row: a ticket that waits for its receipt. */
export interface PushTicketRow {
  ticket_id: string;
  push_device_id: string;
}

/** A push_tickets row as the cron lists it. */
export interface DueTicketRow extends PushTicketRow {
  created_at: string;
}

/**
 * Reads the tickets of one send request; `tickets[i]` belongs to `targets[i]`.
 * An ok ticket with an id waits for its receipt. A `DeviceNotRegistered`
 * ticket is dead now. Any other error is only for the log.
 */
export function readTickets(
  targets: PushTarget[],
  tickets: ExpoTicket[],
): { dead: string[]; pending: PushTicketRow[]; errors: string[] } {
  const dead: string[] = [];
  const pending: PushTicketRow[] = [];
  const errors: string[] = [];
  tickets.forEach((ticket, i) => {
    const target = targets[i];
    if (!target) return;
    if (ticket.status === "ok") {
      if (ticket.id) pending.push({ ticket_id: ticket.id, push_device_id: target.id });
      return;
    }
    if (ticket.status !== "error") return;
    if (ticket.details?.error === "DeviceNotRegistered") dead.push(target.token);
    else errors.push(`${ticket.message ?? ticket.details?.error}`);
  });
  return { dead, pending, errors };
}

/**
 * Reads one getReceipts answer for the tickets that were asked about. A ticket
 * with a receipt is done, whatever the receipt says. A ticket without one
 * waits for the next run (checkPushReceipts drops it after an hour).
 */
export function readReceipts(
  asked: PushTicketRow[],
  receipts: Record<string, ExpoReceipt | undefined>,
): { deadDeviceIds: string[]; done: string[]; errors: string[] } {
  const dead = new Set<string>();
  const done: string[] = [];
  const errors: string[] = [];
  for (const row of asked) {
    const receipt = receipts[row.ticket_id];
    if (!receipt) continue;
    done.push(row.ticket_id);
    if (receipt.status !== "error") continue;
    if (receipt.details?.error === "DeviceNotRegistered") dead.add(row.push_device_id);
    else errors.push(`${receipt.message ?? receipt.details?.error}`);
  }
  return { deadDeviceIds: [...dead], done, errors };
}

/** What one cron run needs from the database and from Expo. Each one throws on failure. */
export interface ReceiptSweepDeps {
  /** Deletes the tickets created before `before`. */
  deleteExpired(before: Date): Promise<void>;
  /** The oldest tickets created at or before `before`, at most `limit`. */
  listDue(before: Date, limit: number): Promise<DueTicketRow[]>;
  /** Asks Expo for the receipts of `ids`; returns the receipts by ticket id. */
  fetchReceipts(ids: string[]): Promise<Record<string, ExpoReceipt | undefined>>;
  deleteDevices(ids: string[]): Promise<void>;
  deleteTickets(ids: string[]): Promise<void>;
}

export interface ReceiptSweepResult {
  /** Tickets asked about. */
  checked: number;
  /** Tickets that had a receipt and were deleted. */
  done: number;
  /** push_devices rows deleted as dead. */
  dead: number;
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * One cron run. The dead devices go before the done tickets: when a delete
 * fails, the tickets stay and the next run asks Expo again.
 */
export async function checkPushReceipts(
  deps: ReceiptSweepDeps,
  now = Date.now(),
): Promise<ReceiptSweepResult> {
  await deps.deleteExpired(new Date(now - TICKET_MAX_AGE_MS));
  const due = await deps.listDue(new Date(now - RECEIPT_DELAY_MS), RECEIPT_BATCH);
  if (due.length === 0) return { checked: 0, done: 0, dead: 0 };

  const receipts = await deps.fetchReceipts(due.map((row) => row.ticket_id));
  const { deadDeviceIds, done, errors } = readReceipts(due, receipts);
  const staleBefore = now - UNANSWERED_MAX_AGE_MS;
  const unanswered = due
    .filter((row) => !receipts[row.ticket_id] && Date.parse(row.created_at) < staleBefore)
    .map((row) => row.ticket_id);
  for (const error of errors) console.error(`[push] receipt error: ${error}`);
  for (const ids of chunks(deadDeviceIds, DELETE_CHUNK)) await deps.deleteDevices(ids);
  for (const ids of chunks([...done, ...unanswered], DELETE_CHUNK)) await deps.deleteTickets(ids);
  return { checked: due.length, done: done.length, dead: deadDeviceIds.length };
}

/** The cron's run, wired to the service client and to Expo. */
export async function sweepPushReceipts(): Promise<ReceiptSweepResult> {
  const { serviceClient } = await import("@/lib/dashboard/supabase");
  const tickets = () => serviceClient().from("push_tickets");
  return checkPushReceipts({
    deleteExpired: async (before) => {
      const { error } = await tickets().delete().lt("created_at", before.toISOString());
      if (error) throw new Error(error.message);
    },
    listDue: async (before, limit) => {
      const { data, error } = await tickets()
        .select("ticket_id, push_device_id, created_at")
        .lte("created_at", before.toISOString())
        .order("created_at")
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as DueTicketRow[];
    },
    fetchReceipts: async (ids) => {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(EXPO_RECEIPTS_URL, {
          method: "POST",
          signal: abort.signal,
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) throw new Error(`expo responded ${res.status}`);
        const body = (await res.json()) as { data?: Record<string, ExpoReceipt> };
        return body.data ?? {};
      } finally {
        clearTimeout(timer);
      }
    },
    deleteDevices: async (ids) => {
      const { error } = await serviceClient().from("push_devices").delete().in("id", ids);
      if (error) throw new Error(error.message);
    },
    deleteTickets: async (ids) => {
      const { error } = await tickets().delete().in("ticket_id", ids);
      if (error) throw new Error(error.message);
    },
  });
}
