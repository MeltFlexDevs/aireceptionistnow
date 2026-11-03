import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DeferredAvatar } from "@/app/(main)/dashboard/components/DeferredAvatar";
import { AiAvatar, AvatarArt, MOUTHS } from "@/app/(main)/onboarding/AiAvatar";
import { LiveAvatar } from "@/app/(main)/onboarding/LiveAvatar";
import type { Mood } from "@/app/(main)/onboarding/personality";
import { AWAKE_MS, isAwake, markActive } from "@/app/(main)/onboarding/presence";

// The avatar CSS is shared by the dashboard and the onboarding funnel.
const css = readFileSync(new URL("../app/(main)/dashboard/surfaces.css", import.meta.url), "utf8");

test("ava-pop fills backwards, so motion's inline rotate is not hidden", () => {
  const fills = [...css.matchAll(/ava-pop 0\.42s cubic-bezier\(0\.34, 1\.56, 0\.64, 1\) (\w+)/g)].map((m) => m[1]);
  assert.deepEqual(fills, ["backwards", "backwards"]);
});

test("the no-pop class turns the entry pop off", () => {
  assert.match(css, /\.ai-avatar\.no-pop\s*\{\s*animation:\s*none;\s*\}/);
});

test("ava-breathe animates transform only, not box-shadow", () => {
  const block = css.match(/@keyframes ava-breathe\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
  assert.match(block, /scale\(1\.035\)/);
  assert.doesNotMatch(block, /box-shadow/);
});

test("DeferredAvatar server-renders a hidden probe, then the static avatar with its pop", () => {
  const html = renderToStaticMarkup(createElement(DeferredAvatar, { mood: "friendly", className: "h-[82%] w-[82%]" }));
  assert.match(html, /^<span hidden(="")?><\/span><svg /);
  assert.ok(html.includes('class="ai-avatar h-[82%] w-[82%]"'));
  assert.ok(!html.includes("no-pop"));
});

const moods = Object.keys(MOUTHS) as Mood[];
const art = (props: Parameters<typeof AvatarArt>[0]) =>
  renderToStaticMarkup(createElement("svg", null, createElement(AvatarArt, props)));

test("AiAvatar draws the headset art with flat fills and no ids, for every mood", () => {
  for (const mood of moods) {
    const html = renderToStaticMarkup(createElement(AiAvatar, { mood }));
    assert.ok(html.startsWith('<svg viewBox="0 0 100 100" class="ai-avatar h-full w-full"'), mood);
    assert.ok(html.includes('aria-label="Your AI receptionist"'), mood);
    assert.doesNotMatch(html, /\sid="|url\(#|ai-float/, mood);
    assert.ok(html.includes(`d="${MOUTHS[mood].d}"`), mood);
    assert.ok(html.includes('<g class="rx-voice">'), mood);
    assert.equal(html.includes("ai-spark"), mood === "celebrate", mood);
    assert.equal(html.includes("ai-eyes"), mood !== "celebrate", mood);
  }
});

test("AvatarArt: one badge top right for desk activities, ring waves for the phone", () => {
  for (const activity of ["calendar", "chart", "study", "gear"] as const) {
    const html = art({ mood: "friendly", activity });
    assert.ok(html.includes('<g class="rx-badge"><circle cx="80" cy="24.5" r="11.5"'), activity);
    assert.ok(!html.includes("rx-ring"), activity);
  }
  const ringing = art({ mood: "friendly", activity: "phone" });
  assert.ok(ringing.includes('class="rx-ring"'));
  assert.ok(!ringing.includes("data-on") && !ringing.includes("rx-badge"));
  const onCall = art({ mood: "friendly", activity: "phone", onCall: true });
  assert.ok(onCall.includes('<g class="rx-voice" data-on="true">'));
  assert.ok(!onCall.includes("rx-ring"));
  assert.ok(art({ mood: "calm", grin: true }).includes(`d="${MOUTHS.bright.d}"`));
});

test("LiveAvatar renders the same art with no ids and keeps the eye-tracking group", () => {
  const html = renderToStaticMarkup(
    createElement(LiveAvatar, { mood: "friendly", activity: "calendar", className: "h-8 w-8 no-pop" }),
  );
  assert.ok(html.includes('class="ai-avatar cursor-pointer h-8 w-8 no-pop"'));
  assert.doesNotMatch(html, /\sid="|url\(#/);
  for (const part of ['class="rx-voice"', 'class="rx-badge"', 'class="ai-eyewrap"', 'class="ai-mouth"']) {
    assert.ok(html.includes(part), part);
  }
});

test("surfaces.css has the rx motion rules and turns them off for reduced motion", () => {
  assert.doesNotMatch(css, /ai-float/);
  for (const name of ["rx-glow", "rx-ring", "rx-pop"]) assert.match(css, new RegExp(`@keyframes ${name} \\{`));
  const reduce = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce) {"));
  assert.ok(reduce.includes('.rx-voice[data-on="true"], .rx-badge { animation: none; }'));
  assert.ok(reduce.includes(".rx-ring path { animation: none; opacity: 1; }"));
});

test("ambient avatar motion rests AWAKE_MS after the last activity", () => {
  markActive(1_000);
  assert.equal(isAwake(1_000 + AWAKE_MS - 1), true);
  assert.equal(isAwake(1_000 + AWAKE_MS), false);
});
