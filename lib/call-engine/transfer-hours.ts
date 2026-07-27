/**
 * When the receptionist is allowed to hand a caller to a human.
 *
 * The transfer itself is an ElevenLabs BUILT-IN system tool (see
 * buildBuiltInTools in ./agent/tools.ts), which means the platform performs the
 * hand-off and our server is never in the loop. Built-in tools also cannot be
 * overridden per conversation - `PromptAgentApiModelOverrideInput` exposes
 * `prompt` and `toolIds`, but not `builtInTools` - so there is NO way to remove
 * the transfer tool for a single call.
 *
 * What we can override per call is the prompt, and the agent's platform settings
 * already allow-list `agent.prompt.prompt`. So enforcement works like this: the
 * synced prompt carries a {{transfer_policy}} placeholder, and the call-start
 * webhook fills it with either a permission or a prohibition. That is a strong
 * instruction, given the model is also told the current time and the window, but
 * it is steering rather than a hard platform block - a model that ignores its
 * instructions could still call the tool. Worth knowing before treating these
 * hours as a compliance control.
 *
 * Kept free of I/O so the rule can be tested directly - see transfer-hours.test.ts.
 */

/** "HH:MM" in 24-hour form, in the schedule's own timezone. */
export interface TransferWindow {
  start: string;
  end: string;
}

export interface TransferHours {
  /** IANA zone, e.g. "Europe/Bratislava". Stored WITH the schedule rather than
   *  read from account settings, because the call-start webhook resolves a
   *  NumberConfig, which carries no timezone. Self-contained beats a join. */
  timezone: string;
  /** Seven entries, index 0 = Sunday, matching Date.prototype.getDay(). A null
   *  entry means no transfers that day. */
  days: (TransferWindow | null)[];
}

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Minutes since local midnight, or null if the text is not a valid HH:MM. */
export function parseTime(text: string): number | null {
  const m = TIME_RE.exec(text.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function isValidTimezone(tz: string): boolean {
  if (!tz.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize whatever is sitting in `routing.transferHours` into a usable
 * schedule, or null if it is absent/unusable.
 *
 * Returns null rather than a permissive default on purpose: null means "no hours
 * configured", which callers treat as "transfer always allowed" - the behaviour
 * before this feature existed. A malformed schedule must never silently become a
 * restriction the user did not ask for.
 */
export function parseTransferHours(raw: unknown): TransferHours | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const tz = typeof obj.timezone === "string" ? obj.timezone.trim() : "";
  if (!isValidTimezone(tz)) return null;

  const rawDays = Array.isArray(obj.days) ? obj.days : null;
  if (!rawDays) return null;

  const days: (TransferWindow | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const d = rawDays[i];
    if (!d || typeof d !== "object") {
      days.push(null);
      continue;
    }
    const { start, end } = d as Record<string, unknown>;
    const s = typeof start === "string" ? parseTime(start) : null;
    const e = typeof end === "string" ? parseTime(end) : null;
    // start === end is a zero-length window; treat it as closed rather than
    // guessing that the user meant "all day".
    if (s === null || e === null || s === e) {
      days.push(null);
      continue;
    }
    days.push({ start: start as string, end: end as string });
  }

  // Every day closed is indistinguishable from "never transfer", which is a
  // legitimate setting, but it is far more often an empty form. Treat it as
  // unconfigured so a blank save cannot silently disable transfers entirely.
  if (days.every((d) => d === null)) return null;

  return { timezone: tz, days };
}

interface LocalNow {
  weekday: number; // 0 = Sunday
  minutes: number; // since local midnight
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Local weekday + minutes-of-day for an instant in an IANA zone.
 *
 * Uses Intl rather than manual offset arithmetic so DST is handled by the
 * platform's tz database: on a spring-forward Sunday the local clock really does
 * jump from 01:59 to 03:00, and a fixed offset would place the call an hour off.
 */
function localNow(at: Date, timezone: string): LocalNow | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(at);

    let weekday = -1;
    let hour = -1;
    let minute = -1;
    for (const p of parts) {
      if (p.type === "weekday") weekday = WEEKDAY_INDEX[p.value] ?? -1;
      else if (p.type === "hour") hour = Number(p.value);
      else if (p.type === "minute") minute = Number(p.value);
    }
    if (weekday < 0 || !Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    // h23 can render midnight as "24" in some ICU versions; fold it back.
    return { weekday, minutes: (hour % 24) * 60 + minute };
  } catch {
    return null;
  }
}

/**
 * Is a human reachable at `at`?
 *
 * FAILS OPEN. An unreadable schedule or a timezone the runtime does not know
 * returns true, matching the pre-feature behaviour. A caller who needs a person
 * should not be stranded because of a bad config value; the opposite failure
 * mode - silently refusing every transfer - is much worse and much harder to
 * notice.
 */
export function isTransferOpen(hours: TransferHours | null, at: Date): boolean {
  if (!hours) return true;
  const now = localNow(at, hours.timezone);
  if (!now) return true;

  const today = hours.days[now.weekday] ?? null;
  if (today) {
    const s = parseTime(today.start);
    const e = parseTime(today.end);
    if (s !== null && e !== null) {
      if (s < e) {
        if (now.minutes >= s && now.minutes < e) return true;
      } else if (now.minutes >= s) {
        // Wraps past midnight: open from `start` to the end of the day.
        return true;
      }
    }
  }

  // A window that started yesterday and wraps past midnight (e.g. an on-call
  // line open 22:00-06:00) is still open in the small hours of today.
  const yesterday = hours.days[(now.weekday + 6) % 7] ?? null;
  if (yesterday) {
    const s = parseTime(yesterday.start);
    const e = parseTime(yesterday.end);
    if (s !== null && e !== null && s > e && now.minutes < e) return true;
  }

  return false;
}

/**
 * The dynamic variable the synced prompt carries as {{transfer_policy}}.
 * Exported as a constant because the call-start webhook must emit exactly this
 * when it cannot resolve a config - see transferPolicyLine.
 */
export const TRANSFER_POLICY_OPEN =
  "A human is available right now: if the caller asks for a person, asks to be transferred, or has a request beyond what you can handle, use transfer_to_number to hand off.";

/**
 * What to tell the agent about transfers for a call starting at `at`.
 *
 * Lives here rather than with the rest of the prompt copy in agent/sync.ts
 * because it is the same rule as isTransferOpen, phrased for the model - and
 * because sync composes once while this is evaluated per call. Two callers, one
 * source of truth.
 */
export function transferPolicyLine(hours: TransferHours | null, at: Date): string {
  if (isTransferOpen(hours, at)) return TRANSFER_POLICY_OPEN;

  const when = describeTransferHours(hours);
  const window = when && hours ? ` A human can only be reached ${when}, ${hours.timezone} time.` : "";
  return (
    `No one is available to take a transfer right now.${window}` +
    " Do NOT use transfer_to_number at any point during this call." +
    " If the caller asks for a person, tell them plainly that nobody is available to take the call right now, say when someone will be, and offer to take a message instead."
  );
}

function fmtRange(w: TransferWindow): string {
  return `${w.start}-${w.end}`;
}

/**
 * One-line description of the schedule for the agent prompt and the dashboard
 * summary, collapsing consecutive days that share a window ("Mon-Fri 09:00-17:00").
 */
export function describeTransferHours(hours: TransferHours | null): string {
  if (!hours) return "";

  // Walk Monday-first so the common working week collapses into one run rather
  // than being split by Sunday sitting at index 0.
  const order = [1, 2, 3, 4, 5, 6, 0];
  const runs: { from: number; to: number; window: TransferWindow }[] = [];

  for (const day of order) {
    const w = hours.days[day];
    if (!w) continue;
    const last = runs[runs.length - 1];
    const contiguous = last && order.indexOf(day) === order.indexOf(last.to) + 1;
    if (last && contiguous && last.window.start === w.start && last.window.end === w.end) {
      last.to = day;
    } else {
      runs.push({ from: day, to: day, window: w });
    }
  }

  if (!runs.length) return "";

  return runs
    .map((r) => {
      const days =
        r.from === r.to
          ? DAY_LABELS[r.from].slice(0, 3)
          : `${DAY_LABELS[r.from].slice(0, 3)}-${DAY_LABELS[r.to].slice(0, 3)}`;
      return `${days} ${fmtRange(r.window)}`;
    })
    .join(", ");
}
