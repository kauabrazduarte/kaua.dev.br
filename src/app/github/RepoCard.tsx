import { CompleteGitHubRepo } from "@/utils/getCompleteRepos";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch, Star, GitFork, MessageSquare } from "lucide-react";
import Link from "next/link";

interface RepoCardProps {
  repo: CompleteGitHubRepo;
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
            {repo.name}
          </Link>
        </CardTitle>
        <CardDescription>{repo.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4" />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center">
            <GitFork className="mr-1 h-4 w-4" />
            <span>{repo.forks_count}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            <span>{repo.commit_count}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium">Languages:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(repo.languages).map((lang) => (
              <span key={lang} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium">Branches:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {repo.branches.map((branch) => (
              <span key={branch} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                <GitBranch className="inline-block mr-1 h-3 w-3" />
                {branch}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground truncate">
          <strong>Latest commit:</strong> {repo.latest_commit_message}
        </p>
      </CardFooter>
    </Card>
  );
}
