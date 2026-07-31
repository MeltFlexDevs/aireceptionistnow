import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_CUSTOM_PARAMS,
  MAX_CUSTOM_TOOLS,
  RESERVED_TOOL_NAMES,
  checkToolUrl,
  describeCustomTools,
  formatParamLines,
  isBlockedHost,
  parseParamLines,
  parseCustomTools,
  toCustomToolRequest,
} from "./custom-tools";

const VALID = {
  id: "t1",
  name: "check_stock",
  description: "Check whether an item is in stock. Use when the caller asks about availability.",
  url: "https://api.example.com/stock",
  method: "POST",
  params: [{ name: "sku", type: "string", description: "The item code.", required: true }],
  timeoutSecs: 6,
};

const wrap = (tool: unknown) => ({ customTools: [tool] });

test("a well-formed tool survives the round trip", () => {
  const [tool] = parseCustomTools(wrap(VALID));
  assert.equal(tool.name, "check_stock");
  assert.equal(tool.method, "POST");
  assert.equal(tool.timeoutSecs, 6);
  assert.deepEqual(tool.params[0], {
    name: "sku",
    type: "string",
    description: "The item code.",
    required: true,
  });
});

test("plain http is refused - the auth header would go out in clear text", () => {
  assert.deepEqual(checkToolUrl("http://api.example.com/stock"), {
    ok: false,
    reason: "not_https",
  });
  assert.equal(parseCustomTools(wrap({ ...VALID, url: "http://api.example.com" })).length, 0);
});

test("credentials in the URL are refused", () => {
  assert.deepEqual(checkToolUrl("https://user:pass@api.example.com/x"), {
    ok: false,
    reason: "credentials",
  });
});

test("the addresses an operator must not be able to point a tool at", () => {
  // Cloud metadata first: it is the one that hands out credentials.
  for (const host of [
    "169.254.169.254",
    "::ffff:169.254.169.254",
    "localhost",
    "api.localhost",
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.5",
    "172.16.4.1",
    "172.31.255.255",
    "192.168.1.1",
    "100.64.0.1",
    "::1",
    "fd00::1",
    "printer.local",
    "db.internal",
    "239.0.0.1",
  ]) {
    assert.equal(isBlockedHost(host), true, `${host} must be blocked`);
  }

  for (const host of ["api.example.com", "8.8.8.8", "172.32.0.1", "192.169.1.1", "11.0.0.1"]) {
    assert.equal(isBlockedHost(host), false, `${host} must be allowed`);
  }
});

test("a blocked host drops the whole tool rather than repairing it", () => {
  // Advertising a tool to the model and having it fail mid-call is worse for
  // the caller than the tool simply not existing.
  assert.equal(parseCustomTools(wrap({ ...VALID, url: "https://169.254.169.254/" })).length, 0);
});

test("the validation is honest about what it is", () => {
  // Documented at the top of custom-tools.ts, asserted here so it cannot be
  // quietly reinterpreted: ElevenLabs makes the request, so a name that
  // resolves publicly now and privately later is NOT covered. This test exists
  // to pin the literal-address checks as the scope, not to claim more.
  assert.equal(isBlockedHost("rebind.example.com"), false);
});

test("a custom tool cannot shadow a built-in one", () => {
  for (const reserved of RESERVED_TOOL_NAMES) {
    assert.equal(
      parseCustomTools(wrap({ ...VALID, name: reserved })).length,
      0,
      `${reserved} must not be claimable`,
    );
  }
});

test("names must be the shape the model can call", () => {
  for (const bad of ["", "X", "no", "check-stock", "9lives", "has space", "a".repeat(41)]) {
    assert.equal(parseCustomTools(wrap({ ...VALID, name: bad })).length, 0, `${bad} must be rejected`);
  }
});

test("stray case and whitespace are normalized rather than rejected", () => {
  // A capital letter is a typo, not a security problem, and refusing to save
  // over one is the kind of pedantry that makes an operator give up.
  const [tool] = parseCustomTools(wrap({ ...VALID, name: "  Check_Stock " }));
  assert.equal(tool.name, "check_stock");

  // But normalizing must not become a way to claim a built-in name.
  assert.equal(parseCustomTools(wrap({ ...VALID, name: " End_Call " })).length, 0);
});

test("a tool with no description is dropped", () => {
  // The description is the only thing telling the model when to call it.
  assert.equal(parseCustomTools(wrap({ ...VALID, description: "  " })).length, 0);
});

test("duplicate names and duplicate params are collapsed, not stored twice", () => {
  const dupes = parseCustomTools({ customTools: [VALID, { ...VALID, id: "t2" }] });
  assert.equal(dupes.length, 1);

  const [tool] = parseCustomTools(
    wrap({
      ...VALID,
      params: [
        { name: "sku", type: "string", description: "a" },
        { name: "sku", type: "number", description: "b" },
      ],
    }),
  );
  assert.equal(tool.params.length, 1);
});

test("counts are capped", () => {
  const many = Array.from({ length: MAX_CUSTOM_TOOLS + 3 }, (_, i) => ({
    ...VALID,
    name: `tool_${i}`,
  }));
  assert.equal(parseCustomTools({ customTools: many }).length, MAX_CUSTOM_TOOLS);

  const params = Array.from({ length: MAX_CUSTOM_PARAMS + 4 }, (_, i) => ({
    name: `p${i}`,
    type: "string",
    description: "x",
  }));
  assert.equal(parseCustomTools(wrap({ ...VALID, params }))[0].params.length, MAX_CUSTOM_PARAMS);
});

test("the timeout is clamped to what a caller will sit through", () => {
  const at = (timeoutSecs: unknown) => parseCustomTools(wrap({ ...VALID, timeoutSecs }))[0].timeoutSecs;
  assert.equal(at(300), 20);
  assert.equal(at(0), 1);
  assert.equal(at(-5), 1);
  assert.equal(at("nonsense"), 8, "an unusable value falls back to the default, not to zero");
});

test("a disabled tool is not advertised to the model at all", () => {
  assert.equal(parseCustomTools(wrap({ ...VALID, enabled: false })).length, 0);
});

test("GET sends query params and POST sends a body", () => {
  const [get] = parseCustomTools(wrap({ ...VALID, method: "GET" }));
  const getReq = toCustomToolRequest(get).toolConfig as unknown as Record<string, unknown>;
  const getSchema = getReq.apiSchema as Record<string, unknown>;
  assert.ok(getSchema.queryParamsSchema);
  assert.equal(getSchema.requestBodySchema, undefined);

  const [post] = parseCustomTools(wrap(VALID));
  const postSchema = (toCustomToolRequest(post).toolConfig as unknown as Record<string, unknown>)
    .apiSchema as Record<string, unknown>;
  assert.ok(postSchema.requestBodySchema);
  assert.equal(postSchema.queryParamsSchema, undefined);
});

test("the auth header is only attached when there is a value for it", () => {
  const [tool] = parseCustomTools(wrap({ ...VALID, authHeader: "Authorization" }));
  const without = (toCustomToolRequest(tool).toolConfig as unknown as Record<string, unknown>)
    .apiSchema as Record<string, unknown>;
  assert.equal(without.requestHeaders, undefined, "no secret resolved means no empty header");

  const withSecret = (
    toCustomToolRequest(tool, { secretId: "sec_1" }).toolConfig as unknown as Record<string, unknown>
  ).apiSchema as Record<string, unknown>;
  assert.deepEqual(withSecret.requestHeaders, { Authorization: { secretId: "sec_1" } });
});

test("the prompt block passes the operator's description through verbatim", () => {
  // That sentence IS the trigger condition - summarizing it would change when
  // the model decides to call the action.
  const tools = parseCustomTools(wrap(VALID));
  const block = describeCustomTools(tools);
  assert.match(block, /check_stock: Check whether an item is in stock/);
  assert.match(block, /never invent the answer/);
  assert.equal(describeCustomTools([]), "");
});

test("parameters are declared one per line, with sensible defaults", () => {
  const params = parseParamLines(
    "order_number: The caller's order reference\nquantity: How many they want (number) (optional)\n\n  postcode  \n",
  );
  assert.deepEqual(params, [
    {
      name: "order_number",
      type: "string",
      description: "The caller's order reference",
      required: true,
    },
    { name: "quantity", type: "number", description: "How many they want", required: false },
    // No colon and no description: the name itself is the best hint available,
    // and an empty description would leave the model guessing what to send.
    { name: "postcode", type: "string", description: "postcode", required: true },
  ]);
});

test("parameter suffixes work in either order and are case-insensitive", () => {
  const [a] = parseParamLines("qty: How many (OPTIONAL) (Number)");
  assert.equal(a.type, "number");
  assert.equal(a.required, false);
  assert.equal(a.description, "How many");
});

test("unusable parameter lines are skipped, not stored broken", () => {
  assert.deepEqual(parseParamLines("9lives: nope\n-: nope\n: nope"), []);
  // A name with spaces is the likely human input, so snap it rather than drop it.
  assert.equal(parseParamLines("order number: ref")[0].name, "order_number");
});

test("parameters survive the edit round trip", () => {
  const text = "order_number: The order reference\nquantity: How many (number) (optional)";
  assert.equal(formatParamLines(parseParamLines(text)), text);
});
