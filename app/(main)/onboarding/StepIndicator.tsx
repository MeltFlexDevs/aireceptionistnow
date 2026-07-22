"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";

// Top-right funnel progress: one line per step, filled up to the current one,
// with a dot under the step you're on. Completed/reachable steps are clickable
// links back into the funnel; steps you haven't unlocked stay inert.
export function StepIndicator({
  current,
  total,
  reachable = current,
}: {
  current: number;
  total: number;
  /** Highest step the funnel will actually let you open. */
  reachable?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Setup steps" className="flex items-start gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const active = step === current;
          const filled = step <= current;
          const canGo = step <= reachable && !active;

          const column = (
            <div className="flex flex-col items-center">
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  active ? "w-8" : "w-7"
                } ${filled ? "bg-neutral-900" : "bg-neutral-200"} ${
                  canGo ? "group-hover:bg-neutral-500" : ""
                }`}
              />
              <span className="mt-1 flex h-1.5 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="onb-step-dot"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="h-1.5 w-1.5 rounded-full bg-neutral-900"
                  />
                )}
              </span>
            </div>
          );

          if (canGo) {
            return (
              <motion.div
                key={step}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Link
                  href={`/onboarding?step=${step}`}
                  aria-label={`Go to step ${step}`}
                  className="group block cursor-pointer px-1 py-2"
                >
                  {column}
                </Link>
              </motion.div>
            );
          }

          return (
            <div key={step} aria-current={active ? "step" : undefined} className="px-1 py-2">
              {column}
            </div>
          );
        })}
      </nav>
    </MotionConfig>
  );
}
