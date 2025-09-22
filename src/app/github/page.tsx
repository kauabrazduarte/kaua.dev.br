import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { Suspense } from "react";
import getCompleteRepos from "@/utils/getCompleteRepos";
import RepoCard from "./RepoCard";
import GithubPageLoading from "./loading";

async function RepoList() {
  const repos = await getCompleteRepos();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

export default function GithubPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">My GitHub Repositories</h1>
        <p className="text-muted-foreground mb-8">
          Here are some of my projects on GitHub.
        </p>
        <Suspense fallback={<GithubPageLoading />}>
          <RepoList />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
