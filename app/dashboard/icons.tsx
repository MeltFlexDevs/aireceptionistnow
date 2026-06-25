// Inline SVG icon set for the dashboard. Pure presentational components - // stroke icons inherit `currentColor`. Keep new icons in this one file.

interface IconProps {
  className?: string;
}

const base = "h-5 w-5";

export function Logo({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 7 15" fill="currentColor" className={className} aria-hidden>
      <rect x="0" y="0" width="2.5" height="15" rx="1" />
      <rect x="4.5" y="0" width="2.5" height="15" rx="1" />
    </svg>
  );
}

function Stroke({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {children}
    </svg>
  );
}

export const Grid = ({ className = base }: IconProps) => (
  <Stroke className={className}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Stroke>
);

export const Phone = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M4 5c0 8.284 6.716 15 15 15a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-.8-.98l-3.4-.68a1 1 0 0 0-1 .42l-.9 1.2a12 12 0 0 1-5.1-5.1l1.2-.9a1 1 0 0 0 .42-1l-.68-3.4A1 1 0 0 0 8.5 3H6a2 2 0 0 0-2 2Z" /></Stroke>
);

export const Hash = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16" /></Stroke>
);

export const Bot = ({ className = base }: IconProps) => (
  <Stroke className={className}><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 8V4M9 13h.01M15 13h.01M2 13v2M22 13v2" /></Stroke>
);

export const Plug = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M9 3v5M15 3v5M6 8h12v2a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8ZM12 16v5" /></Stroke>
);

export const ChartBar = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></Stroke>
);

export const Gear = ({ className = base }: IconProps) => (
  <Stroke className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.04.05a2 2 0 1 1-2.83 2.83l-.05-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.05.04a2 2 0 1 1-2.83-2.83l.04-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.04-.05a2 2 0 1 1 2.83-2.83l.05.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.05-.04a2 2 0 1 1 2.83 2.83l-.04.05A1.7 1.7 0 0 0 19.4 9c.32.74 1.03 1.2 1.55 1.2H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></Stroke>
);

export const Search = ({ className = base }: IconProps) => (
  <Stroke className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Stroke>
);

export const Bell = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></Stroke>
);

export const ChevronDown = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="m6 9 6 6 6-6" /></Stroke>
);

export const Plus = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M12 5v14M5 12h14" /></Stroke>
);

export const ArrowUp = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M12 19V5M5 12l7-7 7 7" /></Stroke>
);

export const ArrowDown = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M12 5v14M19 12l-7 7-7-7" /></Stroke>
);

export const Clock = ({ className = base }: IconProps) => (
  <Stroke className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>
);

export const Bolt = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></Stroke>
);

export const Sparkle = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" /></Stroke>
);

export const Download = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M12 4v11M8 11l4 4 4-4M4 20h16" /></Stroke>
);

export const Menu = ({ className = base }: IconProps) => (
  <Stroke className={className}><path d="M4 7h16M4 12h16M4 17h16" /></Stroke>
);
