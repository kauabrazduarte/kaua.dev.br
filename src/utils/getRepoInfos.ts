"use server";

import { GitHubRepo } from "./getRepos";

export interface GithubCompleteRepo extends GitHubRepo {
  content?: string;
}

export default async function getRepoInfo(repo: string) {
  const BASE_URL = "https://api.github.com/repos/kauabrazduarte";

  const responseRepo = await fetch(`${BASE_URL}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_BEARER_TOKEN}`,
    },
    next: {
      revalidate: 3600 * 24,
    },
  });
  const dataRepo = await responseRepo.json();

  let markdownContent: string | undefined = undefined;

  try {
    const responseReadme = await fetch(`${BASE_URL}/${repo}/readme`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_BEARER_TOKEN}`,
      },
      next: {
        revalidate: 3600 * 24,
      },
    });

    if (!responseReadme.ok) {
      throw new Error(`Failed to fetch README for ${repo}`);
    }

    const dataReadme = await responseReadme.json();

    markdownContent = Buffer.from(dataReadme.content, "base64").toString(
      "utf8",
    );
  } catch {}

  return Object.assign(dataRepo, {
    content: markdownContent,
  }) as GithubCompleteRepo;
}
