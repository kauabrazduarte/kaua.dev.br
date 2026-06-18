import { getLocale, getTranslations } from "next-intl/server";
import { ContributionCells } from "@/components/contribution-cells";
import {
  CELL_PX,
  LEVEL_CLASS,
  type Cell,
} from "@/components/contribution-graph.shared";
import { siteConfig } from "@/lib/site";

const LEVELS: Cell["level"][] = [0, 1, 2, 3, 4];

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
  const [data, t, locale] = await Promise.all([
    fetchContributions(),
    getTranslations("stats"),
    getLocale(),
  ]);
  if (!data) return null;

  const { weeks, months } = buildWeeks(data.contributions);
  const totalThisYear = Object.values(data.total).reduce((acc, n) => acc + n, 0);

  // Pre-format each day's tooltip text on the server, where translations and
  // the active locale live, then hand plain strings to the client cells.
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const toCell = (day: Day | null): Cell | null =>
    day
      ? {
          level: day.level,
          countLabel: t("contributions", { count: day.count }),
          dateLabel: dateFmt.format(new Date(day.date)),
        }
      : null;
  const cellWeeks: (Cell | null)[][] = weeks.map((week) => week.map(toCell));

  return (
    <div className="mt-5">
      {/* Horizontal scroll on small screens so the calendar always shows
          its full 53 weeks without squishing the cells. */}
      <div className="scrollbar-none -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div
            className="grid items-end pb-1 text-[10px] text-muted-foreground"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, ${CELL_PX}px)`,
              columnGap: 2,
            }}
            aria-hidden
          >
            {weeks.map((week, idx) => {
              const mark = months.find((m) => m.columnStart === idx + 1);
              // First-week month label looks weird; only show if column >= 2.
              const visible = mark && idx > 0;
              const weekKey =
                week.find((d): d is Day => d !== null)?.date ?? `pad-${mark?.label ?? "head"}`;
              return (
                <div key={weekKey} className="font-mono leading-none">
                  {visible ? <span>{mark.label}</span> : null}
                </div>
              );
            })}
          </div>

          {/* The grid itself — columns are weeks, rows are weekdays (Sun→Sat).
              Rendered client-side so each cell can carry a Radix tooltip. */}
          <ContributionCells
            weeks={cellWeeks}
            ariaLabel={t("graphAria", { count: totalThisYear })}
          />
        </div>
      </div>

      {/* Total + legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">{t("summary", { count: totalThisYear })}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono">{t("legendLess")}</span>
          <div className="flex gap-[2px]">
            {LEVELS.map((lvl) => (
              <div
                key={lvl}
                className={`rounded-[2px] ${LEVEL_CLASS[lvl]}`}
                style={{ width: CELL_PX, height: CELL_PX }}
              />
            ))}
          </div>
          <span className="font-mono">{t("legendMore")}</span>
        </div>
      </div>
    </div>
  );
}
