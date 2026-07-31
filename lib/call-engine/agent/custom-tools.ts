/**
 * Actions the business defines itself: look up an order, check stock, quote a
 * tiered price - anything that lives behind their own API.
 *
 * This is the answer to "the setup is too simple to handle real workflows". The
 * built-in tools (calendar, messages, transfer) cover the common shape of a
 * receptionist; everything past that needs a call into the customer's own
 * systems, and until now there was no way to make one.
 *
 * SECURITY - READ THIS BEFORE CHANGING THE URL RULES.
 *
 * The HTTP request is made by ElevenLabs' servers, not by ours. That means
 * everything here is SAVE-TIME VALIDATION, NOT ENFORCEMENT. It stops an operator
 * pointing a tool at http://169.254.169.254 or http://localhost by mistake, and
 * it stops the obvious copy-paste of an internal address. It does NOT stop a
 * hostname that resolves publicly at save time and privately later (DNS
 * rebinding), because we are not the one resolving it at call time. Do not
 * describe this as an SSRF defence for our own network - our network is never
 * the one making the request.
 *
 * Auth header values never land in our database: they go into an ElevenLabs
 * workspace secret and only the secret id is stored on the assistant.
 *
 * Kept free of I/O so the rules can be tested directly - see custom-tools.test.ts.
 */

import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";

export type CustomToolParamType = "string" | "number" | "boolean";

export interface CustomToolParam {
  name: string;
  type: CustomToolParamType;
  description: string;
  required: boolean;
}

export interface CustomTool {
  id: string;
  /** The name the model calls. Snake case, unique, not a built-in. */
  name: string;
  /** When to use it, in the operator's words. This is what steers the model. */
  description: string;
  url: string;
  method: "GET" | "POST";
  params: CustomToolParam[];
  /** Seconds the agent will wait. Anything longer is dead air on a live call. */
  timeoutSecs: number;
  /** Header name for auth, e.g. "Authorization". Blank = no auth header. */
  authHeader: string;
  /** ElevenLabs workspace secret id holding that header's value. */
  authSecretId: string;
  enabled: boolean;
}

/** More than this and the prompt bloats and the tool descriptions blur. */
export const MAX_CUSTOM_TOOLS = 5;
export const MAX_CUSTOM_PARAMS = 8;

/** A custom tool may not shadow one the agent already relies on. */
export const RESERVED_TOOL_NAMES: ReadonlySet<string> = new Set([
  "check_availability",
  "book_appointment",
  "take_message",
  "end_call",
  "transfer_to_number",
  "transfer_to_agent",
  "language_detection",
  "voicemail_detection",
  "skip_turn",
  "play_keypad_touch_tone",
]);

const NAME_RE = /^[a-z][a-z0-9_]{2,39}$/;
const PARAM_NAME_RE = /^[a-z][a-z0-9_]{0,31}$/;

/** A caller is on the line: past this the wait is worse than no answer. */
const MIN_TIMEOUT_SECS = 1;
const MAX_TIMEOUT_SECS = 20;
const DEFAULT_TIMEOUT_SECS = 8;

/**
 * Hostnames that must never be a tool target.
 *
 * Literal addresses are checked numerically; names are checked against the
 * loopback/`.local`/`.internal` families that mean "inside somebody's network".
 */
export function isBlockedHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".home.arpa")) {
    return true;
  }

  // IPv6 loopback and the unique-local range (fc00::/7).
  if (host === "::1" || host === "::") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(host)) return true;
  // IPv4-mapped IPv6 (::ffff:169.254.169.254) - strip and fall through.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(host);
  const v4 = mapped ? mapped[1] : host;

  const octets = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v4);
  if (!octets) return false; // an ordinary DNS name

  const [a, b] = octets.slice(1).map(Number);
  if (octets.slice(1).some((o) => Number(o) > 255)) return true; // not a real address
  if (a === 0 || a === 127) return true; // this host / loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast and reserved
  return false;
}

export type UrlCheck = { ok: true; url: string } | { ok: false; reason: UrlProblem };
export type UrlProblem = "malformed" | "not_https" | "credentials" | "blocked_host";

export function checkToolUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "malformed" };
  }
  // http would put the business's own auth header on the wire in clear text.
  if (url.protocol !== "https:") return { ok: false, reason: "not_https" };
  if (url.username || url.password) return { ok: false, reason: "credentials" };
  if (isBlockedHost(url.hostname)) return { ok: false, reason: "blocked_host" };
  return { ok: true, url: url.toString() };
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseParam(raw: unknown): CustomToolParam | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const name = text(obj.name, 32).toLowerCase();
  if (!PARAM_NAME_RE.test(name)) return null;
  const type = obj.type === "number" || obj.type === "boolean" ? obj.type : "string";
  return {
    name,
    type,
    // The description is what tells the model what to put in the field, so an
    // empty one is a broken tool. Fall back to the name rather than nothing.
    description: text(obj.description, 300) || name.replace(/_/g, " "),
    required: obj.required === true,
  };
}

/**
 * Normalize whatever is stored at `routing.customTools`.
 *
 * Anything that fails validation is DROPPED, not repaired. A tool with a bad URL
 * or a reserved name would be advertised to the model and then fail on air,
 * which is worse for the caller than the tool simply not existing.
 */
export function parseCustomTools(routing: unknown): CustomTool[] {
  const r = routing && typeof routing === "object" ? (routing as Record<string, unknown>) : {};
  const raw = Array.isArray(r.customTools) ? r.customTools : [];

  const tools: CustomTool[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (tools.length >= MAX_CUSTOM_TOOLS) break;
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;

    if (obj.enabled === false) continue;

    // Deliberately NOT clipped to the length limit: a silently truncated name
    // can collide with another tool's, and two tools answering to one name is a
    // far stranger failure than a save that refuses an over-long one.
    const name = (typeof obj.name === "string" ? obj.name : "").trim().toLowerCase();
    if (!NAME_RE.test(name) || RESERVED_TOOL_NAMES.has(name) || seen.has(name)) continue;

    const url = checkToolUrl(text(obj.url, 2000));
    if (!url.ok) continue;

    const description = text(obj.description, 600);
    if (!description) continue; // with no description the model cannot know when to call it

    const params: CustomToolParam[] = [];
    if (Array.isArray(obj.params)) {
      for (const p of obj.params) {
        if (params.length >= MAX_CUSTOM_PARAMS) break;
        const parsed = parseParam(p);
        if (parsed && !params.some((x) => x.name === parsed.name)) params.push(parsed);
      }
    }

    const timeout = Number(obj.timeoutSecs);
    seen.add(name);
    tools.push({
      id: text(obj.id, 40) || name,
      name,
      description,
      url: url.url,
      method: obj.method === "GET" ? "GET" : "POST",
      params,
      timeoutSecs: Number.isFinite(timeout)
        ? Math.min(MAX_TIMEOUT_SECS, Math.max(MIN_TIMEOUT_SECS, Math.round(timeout)))
        : DEFAULT_TIMEOUT_SECS,
      authHeader: text(obj.authHeader, 64),
      authSecretId: text(obj.authSecretId, 80),
      enabled: true,
    });
  }
  return tools;
}

/**
 * Parse the parameter textarea: one per line, `name: what it is`.
 *
 * A nested repeatable editor (rows of rows) is a lot of machinery for something
 * that is nearly always one or two plain fields - an order number, a postcode.
 * Suffixes cover the rest: `(optional)`, `(number)`, `(boolean)`.
 *
 *   order_number: The caller's order reference
 *   quantity: How many they want (number) (optional)
 */
export function parseParamLines(text: string): CustomToolParam[] {
  const params: CustomToolParam[] = [];
  const seen = new Set<string>();

  for (const raw of text.split("\n")) {
    if (params.length >= MAX_CUSTOM_PARAMS) break;
    let line = raw.trim();
    if (!line) continue;

    let required = true;
    let type: CustomToolParamType = "string";
    // Suffixes may appear in any order and are stripped off the description.
    for (let found = true; found; ) {
      found = false;
      for (const [suffix, apply] of [
        ["(optional)", () => (required = false)],
        ["(number)", () => (type = "number")],
        ["(boolean)", () => (type = "boolean")],
      ] as const) {
        if (line.toLowerCase().endsWith(suffix)) {
          line = line.slice(0, -suffix.length).trim();
          apply();
          found = true;
        }
      }
    }

    const sep = line.indexOf(":");
    const name = (sep === -1 ? line : line.slice(0, sep)).trim().toLowerCase().replace(/\s+/g, "_");
    if (!PARAM_NAME_RE.test(name) || seen.has(name)) continue;
    seen.add(name);

    params.push({
      name,
      type,
      description: (sep === -1 ? "" : line.slice(sep + 1).trim()) || name.replace(/_/g, " "),
      required,
    });
  }
  return params;
}

/** Render params back into the textarea format, for editing. */
export function formatParamLines(params: CustomToolParam[]): string {
  return params
    .map((p) => {
      const suffixes = [
        p.type === "number" ? " (number)" : p.type === "boolean" ? " (boolean)" : "",
        p.required ? "" : " (optional)",
      ].join("");
      return `${p.name}: ${p.description}${suffixes}`;
    })
    .join("\n");
}

function schemaFor(tool: CustomTool): Record<string, ElevenLabs.LiteralJsonSchemaProperty> {
  const props: Record<string, ElevenLabs.LiteralJsonSchemaProperty> = {};
  for (const p of tool.params) {
    props[p.name] = { type: p.type, description: p.description };
  }
  return props;
}

/**
 * Build the ElevenLabs tool request for one custom action.
 *
 * `authValue` is the resolved header value - a workspace secret locator where
 * one could be created, so the credential never travels as plaintext.
 */
export function toCustomToolRequest(
  tool: CustomTool,
  authValue?: string | ElevenLabs.ConvAiSecretLocator,
): ElevenLabs.ToolRequestModel {
  const properties = schemaFor(tool);
  const required = tool.params.filter((p) => p.required).map((p) => p.name);
  const headers =
    tool.authHeader && authValue ? { [tool.authHeader]: authValue } : undefined;

  return {
    toolConfig: {
      type: "webhook",
      name: tool.name,
      description: tool.description,
      responseTimeoutSecs: tool.timeoutSecs,
      // Always announce: this reaches a system we know nothing about, so the
      // wait is unpredictable and dead air is the one outcome to rule out.
      preToolSpeech: "force",
      toolCallSound: "typing",
      toolCallSoundBehavior: "auto",
      apiSchema: {
        url: tool.url,
        method: tool.method,
        ...(headers ? { requestHeaders: headers } : {}),
        // GET puts the parameters on the query string; POST sends a JSON body.
        // QueryParamsJsonSchema carries no `type` discriminator, unlike the
        // body schema - passing one is a validation error on the wire.
        ...(tool.method === "GET"
          ? { queryParamsSchema: { required, properties } }
          : {
              requestBodySchema: {
                type: "object" as const,
                required,
                properties,
              },
            }),
      },
    },
  };
}

/**
 * The prompt block describing the custom actions.
 *
 * The operator's own description IS the trigger condition - it is the only thing
 * that tells the model when this action applies - so it is passed through
 * verbatim rather than summarized.
 */
export function describeCustomTools(tools: CustomTool[]): string {
  if (tools.length === 0) return "";
  const lines = tools.map((t) => `- ${t.name}: ${t.description}`);
  return [
    "You can also look things up in this business's own systems. These are the actions available and what each one is for:",
    lines.join("\n"),
    "Use them when the caller's request matches one, and answer from what comes back rather than guessing." +
      " If an action fails or returns nothing useful, say plainly that you can't look that up right now - never invent the answer it would have given.",
  ].join("\n");
}
