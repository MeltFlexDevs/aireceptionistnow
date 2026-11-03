import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { startCheckout } from "./billing-client";
import { loginHomePath } from "./i18n/marketing/login-redirect";

// startCheckout runs in the browser. Stub the two globals it touches: fetch
// and window.location.assign.
const realFetch = globalThis.fetch;
let sentBody: unknown;
let assigned: string[] = [];

function stubBrowser(status: number, payload: unknown, pathname?: string) {
  sentBody = undefined;
  assigned = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    sentBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname, assign: (url: string) => assigned.push(url) } },
  });
}

afterEach(() => {
  globalThis.fetch = realFetch;
  Reflect.deleteProperty(globalThis, "window");
});

test("startCheckout sends the Terms acceptance with the plan and cycle", async () => {
  stubBrowser(200, { url: "https://checkout.stripe.com/c/pay/test" });
  await startCheckout("team", "annual", true);
  assert.deepEqual(sentBody, { plan: "team", cycle: "annual", acceptedTerms: true });
  assert.deepEqual(assigned, ["https://checkout.stripe.com/c/pay/test"]);
});

test("startCheckout throws the server's refusal and does not navigate", async () => {
  stubBrowser(400, { error: "Please accept the Terms of Service to continue." });
  await assert.rejects(
    startCheckout("team", "monthly", false),
    /Please accept the Terms of Service to continue\./,
  );
  assert.deepEqual(sentBody, { plan: "team", cycle: "monthly", acceptedTerms: false });
  assert.deepEqual(assigned, []);
});

// Two endpoints with their own answers: /api/checkout and /api/billing-portal.
function stubRoutes(routes: Record<string, { status: number; payload: unknown }>) {
  const calls: string[] = [];
  assigned = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const route = routes[url];
    if (!route) throw new Error(`unexpected fetch ${url}`);
    return new Response(JSON.stringify(route.payload), {
      status: route.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { assign: (url: string) => assigned.push(url) } },
  });
  return calls;
}

test("startCheckout opens the billing portal when a Stripe plan is already live", async () => {
  const calls = stubRoutes({
    "/api/checkout": {
      status: 409,
      payload: { error: "You already have a plan. Change it in the billing portal.", portal: true },
    },
    "/api/billing-portal": { status: 200, payload: { url: "https://billing.stripe.com/p/session/test" } },
  });
  await startCheckout("team", "monthly", true);
  assert.deepEqual(calls, ["/api/checkout", "/api/billing-portal"]);
  assert.deepEqual(assigned, ["https://billing.stripe.com/p/session/test"]);
});

test("startCheckout still throws a 409 without portal and does not navigate", async () => {
  const calls = stubRoutes({
    "/api/checkout": {
      status: 409,
      payload: {
        error:
          "You already subscribe through the App Store or Google Play. Manage that subscription on your phone.",
      },
    },
  });
  await assert.rejects(startCheckout("team", "monthly", true), /on your phone/);
  assert.deepEqual(calls, ["/api/checkout"]);
  assert.deepEqual(assigned, []);
});

test("startCheckout on a 401 opens the login on the home of the page language", async () => {
  stubBrowser(401, { error: "Sign in first." });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: { lang: "sk" } },
  });
  try {
    await startCheckout("team", "monthly", true);
  } finally {
    Reflect.deleteProperty(globalThis, "document");
  }
  // /sk while the Slovak home is published, "/" if it is ever unpublished.
  assert.deepEqual(assigned, [`${loginHomePath({ cookieLocale: "sk" })}?auth=login&next=/pricing`]);
  assert.notEqual(assigned[0], "/?auth=login&next=/pricing");
});

test("startCheckout on a 401 without a page language opens the English home", async () => {
  stubBrowser(401, { error: "Sign in first." });
  await startCheckout("team", "monthly", true);
  assert.deepEqual(assigned, ["/?auth=login&next=/pricing"]);
});

test("startCheckout on a 401 from a localized pricing page comes back to that page", async () => {
  stubBrowser(401, { error: "Sign in first." }, "/de/pricing");
  await startCheckout("team", "monthly", true);
  assert.deepEqual(assigned, ["/?auth=login&next=/de/pricing"]);
});

test("startCheckout on a 401 outside pricing still comes back to /pricing", async () => {
  stubBrowser(401, { error: "Sign in first." }, "/onboarding");
  await startCheckout("team", "monthly", true);
  assert.deepEqual(assigned, ["/?auth=login&next=/pricing"]);
});
