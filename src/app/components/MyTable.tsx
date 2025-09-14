"use client";

import React from "react";
import Link from "next/link";
import getPosts, { Posts } from "@/utils/getPosts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import X from "@/components/icons/X";
import Tabnews from "@/components/icons/Tabnews";
import { useTranslations } from "next-intl";
import getTabnewsPosts from "@/utils/getTabnewsPosts";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyTable() {
  const t = useTranslations("HomePage");
  const [exec, setExec] = React.useState(false);
  const [posts, setPosts] = React.useState<Posts | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      setExec(true);
      const tabnewsPosts = await getTabnewsPosts();
      const data = await getPosts(tabnewsPosts);
      setPosts(data);
    };

    if (!exec) fetchPosts();
  }, [exec]);

  if (!Array.isArray(posts)) {
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
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell colSpan={4} className="p-0">
              <Link
                href={`/${post.in}/${post.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors"
              >
                <span className="w-[60px] text-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  {post.date}
                </span>
                <span className="flex items-center justify-centertext-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  {post.in === "x" ? <X /> : <Tabnews />}
                </span>
                <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 font-normal">
                  {post.title}
                </span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
