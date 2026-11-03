// When someone last moved the pointer, clicked, typed, scrolled or focused this
// tab. The avatars' ambient motion (idle glances, talk bursts, badge glances,
// reading, the sidebar's desk scenes) plays only while that was recent. Each
// eye move is a style and layout pass per frame, and a dashboard left open on
// a second screen used to spend 2-12% of the main thread on idle animation.
export const AWAKE_MS = 20_000;

let last = 0;

// performance.now(), not Date.now(): a wall clock set back would keep the
// avatars awake until it caught up again.

/** Records activity at `now`. The window listeners below call it. */
export function markActive(now = performance.now()): void {
  last = now;
}

/** True while the last activity is less than AWAKE_MS old. */
export function isAwake(now = performance.now()): boolean {
  return now - last < AWAKE_MS;
}

// Loading the page counts as activity. Capture phase, so a handler that stops
// propagation cannot hide the event.
if (typeof window !== "undefined") {
  markActive();
  const mark = () => markActive();
  for (const type of ["pointermove", "pointerdown", "keydown", "wheel", "focus"]) {
    window.addEventListener(type, mark, { capture: true, passive: true });
  }
}
