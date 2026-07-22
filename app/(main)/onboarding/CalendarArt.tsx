// A stylized, monochrome month calendar - the step-3 hero. Purely decorative:
// fixed dates chosen to look balanced, with a pulsing "today" and a few
// booked-appointment dots to hint at callers booking slots.
// July 2026, Sunday-first: the 1st falls on a Wednesday and the month runs to 31.
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS: (number | null)[] = [
  null, null, null, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, null,
];
const TODAY = 18;
const BOOKED = new Set([9, 22, 29]);

export function CalendarArt() {
  return (
    <div className="onb-cal" aria-hidden>
      <div className="onb-cal-head">
        <span className="onb-cal-month">July</span>
      </div>
      <div className="onb-cal-week">
        {WEEK.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="onb-cal-grid">
        {DAYS.map((d, i) => (
          <span
            key={i}
            className={`onb-cal-day${d === TODAY ? " onb-cal-day--today" : ""}${
              d && BOOKED.has(d) ? " onb-cal-day--dot" : ""
            }`}
          >
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
