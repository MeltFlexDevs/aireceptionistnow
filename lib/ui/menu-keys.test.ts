import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import type { KeyboardEvent } from "react";

import { nextMenuIndex, onMenuKeyDown } from "./menu-keys";

test("arrow keys move one item and wrap around", () => {
  assert.equal(nextMenuIndex("ArrowDown", 0, 3), 1);
  assert.equal(nextMenuIndex("ArrowDown", 2, 3), 0);
  assert.equal(nextMenuIndex("ArrowUp", 2, 3), 1);
  assert.equal(nextMenuIndex("ArrowUp", 0, 3), 2);
});

test("with no item focused, ArrowDown goes to the first item and ArrowUp to the last", () => {
  assert.equal(nextMenuIndex("ArrowDown", -1, 3), 0);
  assert.equal(nextMenuIndex("ArrowUp", -1, 3), 2);
});

test("Home and End jump to the first and the last item", () => {
  assert.equal(nextMenuIndex("Home", 2, 3), 0);
  assert.equal(nextMenuIndex("End", 0, 3), 2);
});

test("other keys and an empty menu do not move focus", () => {
  assert.equal(nextMenuIndex("a", 0, 3), null);
  assert.equal(nextMenuIndex("Enter", 0, 3), null);
  assert.equal(nextMenuIndex("ArrowDown", 0, 0), null);
  assert.equal(nextMenuIndex("Home", -1, 0), null);
});

// onMenuKeyDown reads document.activeElement. Node has no DOM, so the test
// puts a stub on globalThis and removes it again after each test.
afterEach(() => {
  delete (globalThis as { document?: unknown }).document;
});

function press(key: string, focusedIndex: number) {
  const focused: number[] = [];
  const items = [0, 1, 2].map((i) => ({ focus: () => focused.push(i) }));
  Object.assign(globalThis, { document: { activeElement: items[focusedIndex] ?? null } });
  let prevented = false;
  const event = {
    key,
    currentTarget: { querySelectorAll: () => items },
    preventDefault: () => {
      prevented = true;
    },
  } as unknown as KeyboardEvent<HTMLElement>;
  onMenuKeyDown(event);
  return { focused, prevented };
}

test("onMenuKeyDown focuses the next item and stops the page from scrolling", () => {
  assert.deepEqual(press("ArrowDown", 2), { focused: [0], prevented: true });
  assert.deepEqual(press("ArrowUp", -1), { focused: [2], prevented: true });
});

test("onMenuKeyDown leaves other keys alone", () => {
  assert.deepEqual(press("Tab", 1), { focused: [], prevented: false });
  assert.deepEqual(press("Enter", 1), { focused: [], prevented: false });
});
