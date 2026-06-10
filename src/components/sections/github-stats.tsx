import { getTranslations } from "next-intl/server";
import { Section } from "@/components/section";
import { ContributionGraph } from "@/components/contribution-graph";
import { AnimatedStat } from "@/components/animated-stat";
import { siteConfig } from "@/lib/site";

interface GhUser {
  public_repos: number;
  followers: number;
  following: number;
}

interface GhRepo {
  stargazers_count: number;
  fork: boolean;
}

async function fetchGitHub() {
  const username = siteConfig.github.username;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "kauadevbr-portfolio",
  };
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 60 * 60 * 6 },
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`,
        { headers, next: { revalidate: 60 * 60 * 6 } },
      ),
    ]);
    if (!userRes.ok || !reposRes.ok) return null;
    const user = (await userRes.json()) as GhUser;
    const repos = (await reposRes.json()) as GhRepo[];
    const stars = repos
      .filter((r) => !r.fork)
      .reduce((acc, r) => acc + (r.stargazers_count ?? 0), 0);
    return {
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      stars,
    };
  } catch {
    return null;
  }
}

export async function GitHubStatsSection() {
  const [t, stats] = await Promise.all([
    getTranslations("stats"),
    fetchGitHub(),
  ]);
  // value is the raw number for the odometer roll-up; null falls back to a dash
  // when the GitHub fetch fails.
  const items: { key: string; label: string; value: number | null }[] = stats
    ? [
        { key: "repos", label: t("repos"), value: stats.repos },
        { key: "stars", label: t("stars"), value: stats.stars },
        { key: "followers", label: t("followers"), value: stats.followers },
        { key: "following", label: t("following"), value: stats.following },
      ]
    : [
        { key: "repos", label: t("repos"), value: null },
        { key: "stars", label: t("stars"), value: null },
        { key: "followers", label: t("followers"), value: null },
        { key: "following", label: t("following"), value: null },
      ];

  return (
    <Section id="stats" kicker={t("kicker")} title={t("title")}>
      <dl className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.key}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-xl font-medium tabular-nums text-foreground sm:text-2xl">
              {item.value === null ? "—" : <AnimatedStat value={item.value} />}
            </dd>
          </div>
        ))}
      </dl>

      <ContributionGraph />

      <p className="mt-5 text-sm text-muted-foreground">
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          @{siteConfig.github.username}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
        </a>
      </p>
    </Section>
  );
}
