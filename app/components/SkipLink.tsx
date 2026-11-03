// First Tab stop on the dashboard and onboarding shells: jumps past the
// sidebar and top bar to <main id="main">. Visually hidden until focused.
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
    >
      {label}
    </a>
  );
}
