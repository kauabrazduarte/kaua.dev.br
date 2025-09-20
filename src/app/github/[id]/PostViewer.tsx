// Removido o "use client"; para se tornar um Server Component
import GithubTable from "@/components/icons/GithubTable";
import { markdownToHtml } from "@/lib/markdown";
import getRepoInfo from "@/utils/getRepoInfos";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function PostViewer({ id }: { id: string }) {
  const t = await getTranslations("TabnewsPostPage");

  const post = await getRepoInfo(id);

  if (!post) {
    notFound();
  }

  if (!post.content) {
    redirect(post.html_url);
  }

  const content = await markdownToHtml(
    post.full_name.split("/")[1],
    post.content,
  );

  const dateLong = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const dateShort = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const actualDate = new Date();
  const diff = actualDate.getTime() - new Date(post.created_at).getTime();
  const diffYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const diffHour = Math.floor(diff / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diff / (1000 * 60));

  let timeDiff = "";

  if (diffYears > 1) {
    timeDiff = `${t("a")} ${diffYears} ${t("years")}`;
  } else if (diffYears === 1) {
    timeDiff = `${t("a")} ${diffYears} ${t("year")}`;
  } else if (diffMonths > 1) {
    timeDiff = `${t("a")} ${diffMonths} ${t("months")}`;
  } else if (diffMonths === 1) {
    timeDiff = `${t("a")} ${diffMonths} ${t("month")}`;
  } else if (diffDays > 1) {
    timeDiff = `${t("a")} ${diffDays} ${t("days")}`;
  } else if (diffDays === 1) {
    timeDiff = `${t("a")} ${diffDays} ${t("day")}`;
  } else if (diffHour > 1) {
    timeDiff = `${t("a")} ${diffHour} ${t("hours")}`;
  } else if (diffHour === 1) {
    timeDiff = `${t("a")} ${diffHour} ${t("hour")}`;
  } else if (diffMinutes > 1) {
    timeDiff = `${t("a")} ${diffMinutes} ${t("minutes")}`;
  } else if (diffMinutes === 1) {
    timeDiff = `${t("ago")}`;
  }

  return (
    <>
      <section className="mt-10">
        <h1 className="text-2xl leading-9 text-black dark:text-white">
          {post.name}
        </h1>
        <div className="flex items-center justify-between max-md:block">
          <div className="flex items-center gap-3  mt-2">
            <Link
              className="flex items-center gap-3  mt-2"
              href={`${post.homepage}`}
              target="_blank"
            >
              <div className="text-neutral-700 dark:text-neutral-400">
                <GithubTable />
              </div>
              <p className="text-neutral-700 dark:text-neutral-400 text-sm leading-4 underline">
                kauabrazduarte
              </p>
            </Link>
            <span className="block w-[1px] h-full min-h-[16px] bg-neutral-700 dark:bg-neutral-400"></span>
            <p className="text-neutral-700 dark:text-neutral-400 text-sm leading-4 max-md:hidden">
              {dateLong} ({timeDiff})
            </p>
            <p className="text-neutral-700 dark:text-neutral-400 text-sm leading-4 hidden max-md:block">
              {dateShort} ({timeDiff})
            </p>
          </div>
        </div>
      </section>

      <main>
        <div
          className="mt-10 prose prose-img:rounded-[8px] max-w-full dark:prose-invert w-full"
          id="post-content"
          dangerouslySetInnerHTML={{
            __html: content ?? "",
          }}
        ></div>
      </main>
    </>
  );
}
