import type { ReactNode } from "react";
import { Info, Lightbulb } from "../icons";

type Tone = "info" | "tip";

interface Props {
  title?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const TONES: Record<Tone, { wrap: string; icon: string; Icon: (p: { className?: string }) => React.ReactElement }> = {
  info: {
    wrap: "border-neutral-300 bg-neutral-100/70 text-neutral-900",
    icon: "text-neutral-500",
    Icon: Info,
  },
  tip: {
    wrap: "border-neutral-300 bg-neutral-100/70 text-neutral-900",
    icon: "text-neutral-800",
    Icon: Lightbulb,
  },
};

// A friendly, plain-language guidance box. Use it to explain what a screen does
// or what to do next, written for people who aren't technical.
export function Hint({ title, children, tone = "info", className = "" }: Props) {
  const t = TONES[tone];
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${t.wrap} ${className}`}>
      <t.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.icon}`} />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? "mt-0.5 opacity-90" : "opacity-90"}>{children}</div>
      </div>
    </div>
  );
}
