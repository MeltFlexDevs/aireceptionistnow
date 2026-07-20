import { AiAvatar } from "./AiAvatar";
import type { Mood } from "./personality";

// The assistant stays present on every later step: the illustrated avatar
// wearing the personality from the chosen voice, a name chip, and the step's
// heading phrased as the next thing to teach your new teammate. Purely
// presentational (CSS-only motion), so it renders inside the server steps.
export function StepCompanion({
  mood,
  name,
  role,
  title,
  sub,
}: {
  mood: Mood;
  name: string;
  role: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="rise mb-6 flex items-start gap-3.5">
      <div className="ava-ring shrink-0">
        <span>
          <AiAvatar mood={mood} className="h-[82%] w-[82%]" label={name || role} />
        </span>
      </div>
      <div className="min-w-0">
        <span className="onb-name-chip">{name || role}</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {sub && <p className="mt-1 text-sm leading-relaxed text-neutral-500">{sub}</p>}
      </div>
    </div>
  );
}
