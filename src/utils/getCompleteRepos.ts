import getRepos, { GitHubRepo } from "./getRepos";

export interface CompleteGitHubRepo extends GitHubRepo {
  languages: Record<string, number>;
  branches: string[];
  commit_count: number;
  latest_commit_message: string;
}

const BASE_URL = "https://api.github.com/repos/kauabrazduarte";
const headers: HeadersInit = {};
if (process.env.GITHUB_BEARER_TOKEN) {
  headers["Authorization"] = `Bearer ${process.env.GITHUB_BEARER_TOKEN}`;
}

const HEADERS = headers;

async function getRepoDetails(repoName: string) {
  try {
    const fetchOptions = {
      headers: HEADERS,
      next: {
        revalidate: 3600 * 24, // 24 hours
      },
    };

    const [languagesRes, branchesRes, commitsRes] = await Promise.all([
      fetch(`${BASE_URL}/${repoName}/languages`, fetchOptions),
      fetch(`${BASE_URL}/${repoName}/branches`, fetchOptions),
      fetch(`${BASE_URL}/${repoName}/commits`, fetchOptions),
    ]);

    const languages = await languagesRes.json();
    const branches = (await branchesRes.json()).map((branch: any) => branch.name);
    const commits = await commitsRes.json();

    const commit_count = commits.length;
    const latest_commit_message =
      commits[0]?.commit?.message || "No commits found.";

    return { languages, branches, commit_count, latest_commit_message };
  } catch (error) {
    console.error(`Failed to get details for repo ${repoName}:`, error);
    return {
      languages: {},
      branches: [],
      commit_count: 0,
      latest_commit_message: "Could not load commit information.",
    };
  }
}

export default async function getCompleteRepos(): Promise<CompleteGitHubRepo[]> {
  const repos = await getRepos();

  const completeRepos = await Promise.all(
    repos.map(async (repo) => {
      const details = await getRepoDetails(repo.name);
      return { ...repo, ...details };
    })
  );

  return completeRepos;
}
