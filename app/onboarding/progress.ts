// Cookie that gates guest funnel progress: it records the furthest step a
// visitor has unlocked by finishing the one before it. Signed-in users are
// gated by their saved config instead; this covers guests, where nothing
// persists. Written by the funnel's server actions (see actions.ts
// `unlockStep`) and read by the page to clamp which step it will open.
export const ONB_STEP_COOKIE = "onb_step";
