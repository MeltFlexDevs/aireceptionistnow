"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";
import type { Mood } from "@/app/(main)/onboarding/personality";
import type { Activity } from "@/app/(main)/onboarding/LiveAvatar";

/**
 * The sidebar receptionist, with its animation runtime kept off the critical path.
 *
 * LiveAvatar pulls in motion/react (~140kB) - which was every dashboard route's
 * second-largest client chunk, loaded before first paint for an element that is
 * decorative. AiAvatar is its static twin: same 100x100 viewBox, same `ai-avatar`
 * class, same head/eye geometry, and the same shared MOUTHS table, so it renders
 * the identical picture with no motion code at all.
 *
 * So: server-render (and first-paint) the static twin, then swap in the animated
 * one once its chunk arrives. No layout shift and no visible pop - the shapes are
 * the same, they just start moving a moment later.
 *
 * The live one loads and runs only while the avatar is displayed. The sidebar is
 * display:none below md, and a hidden avatar should not pay for motion and rAF.
 * A hidden probe span watches its parent box; with no client rects (display:none)
 * the static twin shows instead. After the first swap every remount gets `no-pop`.
 */
type LiveAvatarProps = {
  mood: Mood;
  nudge?: number;
  rewind?: number;
  celebrate?: boolean;
  activity?: Activity | null;
  className?: string;
  label?: string;
};

export function DeferredAvatar(props: LiveAvatarProps) {
  const [Live, setLive] = useState<ComponentType<LiveAvatarProps> | null>(null);
  const [shown, setShown] = useState(false);
  const probe = useRef<HTMLSpanElement>(null);

  // Is the avatar's box displayed? Resizes cover the md breakpoint.
  useEffect(() => {
    const host = probe.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(() => setShown(host.getClientRects().length > 0));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!shown || Live) return;
    let alive = true;
    void import("@/app/(main)/onboarding/LiveAvatar").then((m) => {
      // setState with a function value would be read as an updater, so wrap it.
      if (alive) setLive(() => m.LiveAvatar);
    });
    return () => {
      alive = false;
    };
  }, [shown, Live]);

  const noPop = `${props.className ?? "h-full w-full"} no-pop`;
  return (
    <>
      <span ref={probe} hidden />
      {Live && shown ? (
        <Live {...props} className={noPop} />
      ) : (
        <AiAvatar mood={props.mood} className={Live ? noPop : props.className} label={props.label} />
      )}
    </>
  );
}
