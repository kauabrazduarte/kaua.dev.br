import { siteConfig } from "@/lib/site";

interface Day {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface Response {
  total: Record<string, number>;
  contributions: Day[];
}

// Public, tokenless API maintained by @jogruber that mirrors the GitHub
// contributions calendar. We revalidate every 6 hours.
async function fetchContributions(): Promise<Response | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${siteConfig.github.username}?y=last`,
      { next: { revalidate: 60 * 60 * 6 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Response;
  } catch {
    return null;
  }
}

// Tints of --primary (amber-600 in light, violet-400 in dark) via Tailwind
// arbitrary opacity utilities — JIT picks them up at build time.
const LEVEL_CLASS: Record<Day["level"], string> = {
  0: "bg-muted",
  1: "bg-primary/20",
  2: "bg-primary/40",
  3: "bg-primary/65",
  4: "bg-primary",
};

const MONTH_LABEL = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthMark {
  columnStart: number; // 1-based
  label: string;
}

function buildWeeks(contributions: Day[]) {
  if (!contributions.length) return { weeks: [] as (Day | null)[][], months: [] as MonthMark[] };

  // Pad the first week so the grid always starts on a Sunday.
  const firstDate = new Date(contributions[0].date);
  const firstWeekday = firstDate.getUTCDay(); // 0 = Sunday
  const padded: (Day | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...contributions,
  ];

  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Compute month boundaries — label the column where each new month starts.
  const months: MonthMark[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstReal = week.find((d): d is Day => d !== null);
    if (!firstReal) return;
    const m = new Date(firstReal.date).getUTCMonth();
    if (m !== lastMonth) {
      months.push({ columnStart: weekIdx + 1, label: MONTH_LABEL[m] });
      lastMonth = m;
    }
  });

  return { weeks, months };
}

export async function ContributionGraph() {
  const data = await fetchContributions();
  if (!data) return null;

  const { weeks, months } = buildWeeks(data.contributions);
  const totalThisYear = Object.values(data.total).reduce((acc, n) => acc + n, 0);

  return (
    <div className="mt-5">
      {/* Horizontal scroll on small screens so the calendar always shows
          its full 53 weeks without squishing the cells. */}
      <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div
            className="grid items-end pb-1 text-[10px] text-muted-foreground"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 9px)`,
              columnGap: 2,
            }}
            aria-hidden
          >
            {weeks.map((_, idx) => {
              const mark = months.find((m) => m.columnStart === idx + 1);
              // First-week month label looks weird; only show if column >= 2.
              const visible = mark && idx > 0;
              return (
                <div key={idx} className="font-mono leading-none">
                  {visible ? <span>{mark.label}</span> : null}
                </div>
              );
            })}
          </div>

          {/* The grid itself — columns are weeks, rows are weekdays (Sun→Sat). */}
          <div
            className="grid"
            role="img"
            aria-label={`${totalThisYear} GitHub contributions in the last year`}
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 9px)`,
              gridTemplateRows: "repeat(7, 9px)",
              gridAutoFlow: "column",
              gap: 2,
            }}
          >
            {weeks.flat().map((day, i) =>
              day ? (
                <div
                  key={i}
                  className={`rounded-[2px] ${LEVEL_CLASS[day.level]}`}
                  title={`${day.count} on ${day.date}`}
                />
              ) : (
                <div key={i} className="rounded-[2px] bg-transparent" />
              ),
            )}
          </div>
        </div>
      </div>

      {/* Total + legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">
          {totalThisYear.toLocaleString()} contributions · last 12 months
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono">less</span>
          <div className="flex gap-[2px]">
            {(Object.keys(LEVEL_CLASS) as unknown as Day["level"][]).map((lvl) => (
              <div
                key={lvl}
                className={`h-2.5 w-2.5 rounded-[2px] ${LEVEL_CLASS[lvl]}`}
              />
            ))}
          </div>
          <span className="font-mono">more</span>
        </div>
      </div>
    </div>
  );
}
