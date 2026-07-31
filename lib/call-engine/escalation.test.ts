import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_TARGETS,
  alertNumber,
  describeTargets,
  escalationPolicyLine,
  needsPerCallPolicy,
  openTargets,
  pageNumber,
  parseEscalation,
  transferCondition,
  transferTypeFor,
} from "./escalation";
import { TRANSFER_POLICY_OPEN, transferPolicyLine } from "./transfer-hours";

// Two things this suite exists to protect:
//
// 1. BACK-COMPAT. Every assistant configured before named destinations existed
//    has only routing.transferTo (+ maybe routing.transferHours). If those stop
//    producing a working transfer, live receptionists silently lose their only
//    hand-off. The single-target path must stay byte-identical to the old one.
// 2. FAIL-OPEN. Wrongly refusing every transfer is silent and much worse than
//    wrongly allowing one.

const NINE_TO_FIVE = {
  timezone: "Europe/Bratislava",
  days: [
    null, // Sun
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    null, // Sat
  ],
};

// 2026-07-27 is a Monday; Bratislava is UTC+2 in July.
const monday = (utcHour: number) => new Date(Date.UTC(2026, 6, 27, utcHour));
const MIDDAY = monday(10); // 12:00 local - inside 9-5
const NIGHT = monday(2); // 04:00 local - outside 9-5

test("a legacy transferTo becomes a single target", () => {
  const cfg = parseEscalation({ transferTo: "+14155550199" });
  assert.equal(cfg.targets.length, 1);
  assert.equal(cfg.targets[0].number, "+14155550199");
  assert.equal(cfg.targets[0].hours, null);
  // null, not false: a setup made before the warm/blind choice existed must not
  // have a transfer type imposed on it retroactively.
  assert.equal(cfg.targets[0].warm, null);
  assert.equal(transferTypeFor(cfg.targets[0]), undefined);
});

test("the transfer type is only sent once the operator has actually chosen one", () => {
  const cfg = parseEscalation({
    escalation: {
      targets: [
        { id: "w", label: "Warm", number: "+421900000001", warm: true },
        { id: "c", label: "Cold", number: "+421900000002", warm: false },
        { id: "u", label: "Unset", number: "+421900000003" },
      ],
    },
  });
  assert.equal(transferTypeFor(cfg.targets[0]), "conference");
  assert.equal(transferTypeFor(cfg.targets[1]), "blind");
  assert.equal(transferTypeFor(cfg.targets[2]), undefined);
});

test("legacy transferHours ride along with the synthesized target", () => {
  const cfg = parseEscalation({ transferTo: "+14155550199", transferHours: NINE_TO_FIVE });
  assert.ok(cfg.targets[0].hours, "schedule must survive the synthesis");
  assert.equal(openTargets(cfg, MIDDAY).length, 1);
  assert.equal(openTargets(cfg, NIGHT).length, 0);
});

test("the single-target policy line is exactly the pre-escalation wording", () => {
  const cfg = parseEscalation({ transferTo: "+14155550199", transferHours: NINE_TO_FIVE });
  const hours = cfg.targets[0].hours;
  assert.equal(escalationPolicyLine(cfg, MIDDAY), transferPolicyLine(hours, MIDDAY));
  assert.equal(escalationPolicyLine(cfg, NIGHT), transferPolicyLine(hours, NIGHT));
});

test("no dialable destination still yields the permissive default", () => {
  // The variable always has to carry something - an unsubstituted
  // {{transfer_policy}} would reach a live prompt otherwise.
  assert.equal(escalationPolicyLine(parseEscalation({}), MIDDAY), TRANSFER_POLICY_OPEN);
  assert.equal(escalationPolicyLine(parseEscalation(null), MIDDAY), TRANSFER_POLICY_OPEN);
});

test("an explicit target list wins over the legacy number", () => {
  const cfg = parseEscalation({
    transferTo: "+14155550199",
    escalation: { targets: [{ id: "a", label: "Billing", number: "+421900000001" }] },
  });
  assert.equal(cfg.targets.length, 1);
  assert.equal(cfg.targets[0].label, "Billing");
});

test("an undialable target is dropped, and the legacy number then fills in", () => {
  // Promising a hand-off the platform cannot perform fails on air, so a bad
  // number must never become a destination.
  const cfg = parseEscalation({
    transferTo: "+14155550199",
    escalation: { targets: [{ label: "Billing", number: "not a phone" }] },
  });
  assert.equal(cfg.targets.length, 1);
  assert.equal(cfg.targets[0].number, "+14155550199");
});

test("targets are capped and duplicate ids are re-keyed, never merged", () => {
  const many = Array.from({ length: MAX_TARGETS + 3 }, () => ({
    id: "same",
    label: "Desk",
    number: "+421900000001",
  }));
  const cfg = parseEscalation({ escalation: { targets: many } });
  assert.equal(cfg.targets.length, MAX_TARGETS);
  assert.equal(new Set(cfg.targets.map((t) => t.id)).size, MAX_TARGETS);
});

test("multi-target policy names what is open and what is not", () => {
  const cfg = parseEscalation({
    escalation: {
      targets: [
        { id: "a", label: "Front desk", number: "+421900000001" },
        { id: "b", label: "Billing", number: "+421900000002", hours: NINE_TO_FIVE },
      ],
    },
  });

  const midday = escalationPolicyLine(cfg, MIDDAY);
  assert.match(midday, /Front desk/);
  assert.match(midday, /Billing/);
  assert.doesNotMatch(midday, /cannot transfer/, "both are reachable at midday");

  const night = escalationPolicyLine(cfg, NIGHT);
  assert.match(night, /Right now you can transfer to: Front desk/);
  assert.match(night, /You cannot transfer to: Billing/);
  assert.match(night, /Mon-Fri 09:00-17:00/, "must say when Billing is back");
});

test("when every destination is closed, transfers are forbidden outright", () => {
  const cfg = parseEscalation({
    escalation: {
      targets: [
        { id: "a", label: "Front desk", number: "+421900000001", hours: NINE_TO_FIVE },
        { id: "b", label: "Billing", number: "+421900000002", hours: NINE_TO_FIVE },
      ],
    },
  });
  const night = escalationPolicyLine(cfg, NIGHT);
  assert.match(night, /Do NOT use transfer_to_number/);
  assert.match(night, /offer to take a message/);
});

test("a malformed schedule fails open rather than muting the destination", () => {
  const cfg = parseEscalation({
    escalation: {
      targets: [{ id: "a", label: "Desk", number: "+421900000001", hours: { timezone: "Nope/Nowhere" } }],
    },
  });
  assert.equal(cfg.targets[0].hours, null);
  assert.equal(openTargets(cfg, NIGHT).length, 1);
});

test("the per-call placeholder is only needed when availability varies", () => {
  const always = parseEscalation({ transferTo: "+14155550199" });
  assert.equal(needsPerCallPolicy(always), false);

  const scheduled = parseEscalation({ transferTo: "+14155550199", transferHours: NINE_TO_FIVE });
  assert.equal(needsPerCallPolicy(scheduled), true);
});

test("a gated transfer condition cannot contradict the per-call policy", () => {
  const cfg = parseEscalation({
    escalation: { targets: [{ id: "a", label: "Billing", number: "+421900000001", hours: NINE_TO_FIVE }] },
  });
  const gated = transferCondition(cfg.targets[0], true);
  assert.match(gated, /Only use it when/);
  assert.match(gated, /Never use it when/);

  const ungated = transferCondition(cfg.targets[0], false);
  assert.doesNotMatch(ungated, /Never use it when/);
});

test("the destination block lists every target for the prompt", () => {
  const cfg = parseEscalation({
    escalation: {
      targets: [
        { id: "a", label: "Front desk", number: "+421900000001", when: "the caller wants an appointment changed" },
        { id: "b", label: "Emergencies", number: "+421900000002", when: "it is a burst pipe or a flood" },
      ],
    },
  });
  const block = describeTargets(cfg);
  assert.match(block, /Front desk: when the caller wants an appointment changed/);
  assert.match(block, /Emergencies: when it is a burst pipe or a flood/);
  assert.match(block, /never read this list out loud/);
});

test("paging is off unless asked for, and falls back to the first destination", () => {
  const off = parseEscalation({ escalation: { targets: [{ number: "+421900000001" }] } });
  assert.equal(pageNumber(off), "", "paging costs a phone call - it must be opt-in");

  const on = parseEscalation({
    escalation: { page: { enabled: true }, targets: [{ number: "+421900000001" }] },
  });
  assert.equal(pageNumber(on), "+421900000001");

  const explicit = parseEscalation({
    escalation: {
      page: { enabled: true, number: "+421900000009" },
      targets: [{ number: "+421900000001" }],
    },
  });
  assert.equal(pageNumber(explicit), "+421900000009");
});

test("SMS alerts survive the move from a legacy number to named destinations", () => {
  // This is the regression that would be invisible: alerts used to key off
  // routing.transferTo, so an operator who adopted destinations would quietly
  // stop receiving every new-message text.
  const legacy = parseEscalation({ transferTo: "+14155550199" });
  assert.equal(alertNumber(legacy), "+14155550199");

  const named = parseEscalation({
    escalation: { targets: [{ id: "a", label: "Desk", number: "+421900000001" }] },
  });
  assert.equal(alertNumber(named), "+421900000001");

  // Texting is free, so it stays on even when paging (which rings a phone) is off.
  assert.equal(named.page.enabled, false);
  assert.notEqual(alertNumber(named), "");
});

test("a nonsense callback SLA is discarded rather than promised to callers", () => {
  for (const bad of [0, 1, -30, 99999, "soon", null]) {
    assert.equal(parseEscalation({ escalation: { callbackSlaMinutes: bad } }).callbackSlaMinutes, null);
  }
  assert.equal(parseEscalation({ escalation: { callbackSlaMinutes: 30 } }).callbackSlaMinutes, 30);
});
