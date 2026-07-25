"use client";

import { useEffect, useState, type ComponentType } from "react";
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

  useEffect(() => {
    let alive = true;
    void import("@/app/(main)/onboarding/LiveAvatar").then((m) => {
      // setState with a function value would be read as an updater, so wrap it.
      if (alive) setLive(() => m.LiveAvatar);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!Live) {
    return <AiAvatar mood={props.mood} className={props.className} label={props.label} />;
  }
  return <Live {...props} />;
}
