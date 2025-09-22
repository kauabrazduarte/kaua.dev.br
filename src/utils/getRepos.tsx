"use server";

export interface GitHubOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  private: boolean;
  html_url: string;
  description: string | null; // A descrição pode ser nula
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  language: string | null; // A linguagem principal pode não ser detectada
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
  topics: string[];
  visibility: "public" | "private" | "internal";
  default_branch: string;
}

export default async function getRepos(): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {};
  if (process.env.GITHUB_BEARER_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_BEARER_TOKEN}`;
  }

  const reposRes = await fetch(
    "https://api.github.com/users/kauabrazduarte/repos",
    {
      headers,
      next: {
        revalidate: 3600 * 24,
      },
    },
  );
  const repos = await reposRes.json();
  const myrepos = repos as GitHubRepo[];

  if (!Array.isArray(myrepos)) {
    console.error("Failed to fetch repositories, received:", myrepos);
    return [];
  }

  return myrepos.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}
