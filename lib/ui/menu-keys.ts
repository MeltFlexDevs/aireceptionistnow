import type { KeyboardEvent } from "react";

// Arrow-key focus for role="menu" popups (WAI-ARIA menu button pattern).
// Each menu keeps its own open state, Escape and outside click; this only
// moves focus between the items.

export const MENU_ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"]';

/**
 * Index of the item to focus after `key`, or null when the key does not move
 * focus. `index` is -1 when no item has focus.
 */
export function nextMenuIndex(key: string, index: number, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowUp":
      return index <= 0 ? count - 1 : index - 1;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/** onKeyDown for the role="menu" element: ArrowDown/ArrowUp wrap, Home/End jump. */
export function onMenuKeyDown(e: KeyboardEvent<HTMLElement>): void {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
  const next = nextMenuIndex(e.key, items.indexOf(document.activeElement as HTMLElement), items.length);
  if (next === null) return;
  e.preventDefault();
  items[next].focus();
}
