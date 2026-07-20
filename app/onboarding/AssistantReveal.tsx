"use client";

import { useEffect, useState } from "react";
import { AiAvatar } from "./AiAvatar";

// The finale of onboarding. The brand mark is two vertical bars (see the app
// icon); here they part like a gate and the assistant inflates into the gap,
// then waves hello. The choreography is pure CSS (`.onb-reveal*` in
// onboarding.css) - this component only delays the avatar's mount so its
// pop + wave land just as the bars finish opening. Reduced-motion users skip
// the theatrics and see the assistant immediately.
export function AssistantReveal() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Reduced-motion users get the assistant on the next tick (the CSS gate is
    // disabled for them too); everyone else waits for the bars to part.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setRevealed(true), reduce ? 0 : 470);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="onb-reveal">
      <span className="onb-reveal-bar onb-reveal-bar--l" aria-hidden />
      <span className="onb-reveal-bar onb-reveal-bar--r" aria-hidden />
      <div className={`ava-aura${revealed ? " is-in" : ""}`}>
        <div className="ava-disc">
          {revealed && <AiAvatar mood="celebrate" wave className="h-[74%] w-[74%]" />}
        </div>
      </div>
    </div>
  );
}
