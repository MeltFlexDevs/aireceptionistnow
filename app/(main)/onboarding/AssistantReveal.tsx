"use client";

import { useEffect, useState } from "react";
import { AiAvatar } from "./AiAvatar";

// The onboarding finale, doubling as the provisioning loader. The brand mark is
// two vertical bars (the app icon). While `ready` is false they breathe in place
// as a loading indicator; the moment provisioning finishes (`ready` flips true)
// they part like a gate and the assistant inflates into the gap and waves hello.
// The choreography is pure CSS (`.onb-reveal*` in onboarding.css) - this only
// delays the avatar's mount so its pop lands as the bars finish opening.
// Reduced-motion users skip the theatrics and see the assistant immediately.
export function AssistantReveal({ ready }: { ready: boolean }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!ready) {
      setRevealed(false);
      return;
    }
    // Reduced-motion users get the assistant on the next tick (the CSS gate is
    // disabled for them too); everyone else waits for the bars to part.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setRevealed(true), reduce ? 0 : 470);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div className={`onb-reveal${ready ? " is-ready" : ""}`}>
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
