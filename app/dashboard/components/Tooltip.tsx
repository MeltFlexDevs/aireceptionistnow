import type { ReactNode } from "react";

export function Tooltip({
  label,
  children,
  side = "top",
  className = "",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const pos = side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5";
  return (
    <span
      className={`group/tt relative inline-flex items-center ${className}`}
      tabIndex={0}
      title={label}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 ${pos} max-w-[16rem] whitespace-normal rounded-md bg-neutral-900 px-2 py-1 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-md transition-opacity duration-100 group-hover/tt:opacity-100 group-focus/tt:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
