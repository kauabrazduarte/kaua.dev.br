"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import getRepos, { GitHubRepo } from "@/utils/getRepos";
import formatDate from "@/utils/formatDate";
import GithubTable from "@/components/icons/GithubTable";

export default function MyTable() {
  const t = useTranslations("HomePage");
  const [exec, setExec] = React.useState(false);
  const [projects, setProjects] = React.useState<GitHubRepo[] | null>(null);

  React.useEffect(() => {
    const fetchProjects = async () => {
      setExec(true);
      const data = await getRepos();
      setProjects(data);
    };

    if (!exec) fetchProjects();
  }, [exec]);

  if (!Array.isArray(projects)) {
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
                {t("table_date")}
              </TableHead>
              <TableHead className="w-[16px] text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
                {t("table_in")}
              </TableHead>
              <TableHead className="text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
                {t("table_title")}
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        <div className="w-full h-full flex flex-col gap-1 mt-3">
          <Skeleton className="w-full min-h-10" />
          <Skeleton className="w-full min-h-10" />
          <Skeleton className="w-full min-h-10" />
          <Skeleton className="w-full min-h-10" />
          <Skeleton className="w-full min-h-10" />
        </div>
      </>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px] text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
            {t("table_date")}
          </TableHead>
          <TableHead className="w-[16px] text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
            {t("table_in")}
          </TableHead>
          <TableHead className="text-sm text-neutral-700 font-normal leading-4 dark:text-neutral-400">
            {t("table_title")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell colSpan={4} className="p-0">
              <Link
                href={`/github/${project.full_name.split("/")[1]}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors"
              >
                <span className="w-[130px] text-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  {formatDate(project.created_at)}
                </span>
                <span className="flex items-center justify-centertext-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  <GithubTable />
                </span>
                <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  {project.name}
                </span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
