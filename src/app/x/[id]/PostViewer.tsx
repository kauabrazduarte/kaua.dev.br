import X from "@/components/icons/X";
import { markdownToHtml } from "@/lib/markdown";
import getTwitterPosts from "@/utils/getTwitterPosts";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import React from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostViewer({ params }: PageProps) {
  const t = await getTranslations("XPostPage");

  const posts = await getTwitterPosts();
  const postid = (await params).id;

  // Check if posts data exists
  if (!posts || !posts.data) {
    notFound();
  }

  const post = posts.data.find((p) => p.id === postid);

  if (!post) {
    notFound();
  }

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

  const content = await markdownToHtml(post.text);
  let title: string | null = null;
  let titleLine: string | null = null;
  let titlePoint: string | null = null;

  const breakLines = post.text.split(/\n/g);

  if (breakLines.length > 1) {
    titleLine = breakLines[0];
  }

  const breakPoints = post.text.split(/\./g);

  if (breakPoints.length > 1) {
    titlePoint =
      breakLines[0].length > 120 ? breakLines[0].slice(0, 120) : breakLines[0];
  }

  if (titleLine?.includes(".")) {
    title = titlePoint;
  } else {
    title = titleLine;
  }

  const attchaments: {
    width: number;
    height: number;
    url: string;
    type: string;
  }[] = [];

  post.attachments?.media_keys?.forEach((key) => {
    const media = posts.includes.media.find((m) => m.media_key === key);

    if (media) {
      attchaments.push({
        height: media.height,
        width: media.width,
        url: media.url,
        type: media.type,
      });
    }
  });

  return (
    <>
      <section className="mt-10">
        <h1 className="text-2xl leading-9 text-black dark:text-white">
          {title ?? "---------"}
        </h1>
        <div className="flex items-center justify-between max-md:block">
          <div className="flex items-center gap-3  mt-2">
            <div className="text-neutral-700 dark:text-neutral-400">
              <X />
            </div>
            <p className="text-neutral-700 dark:text-neutral-400 text-sm leading-4">
              oKauaDev
            </p>
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
            __html: content,
          }}
        ></div>

        <div className="mt-5">
          {attchaments
            .filter((a) => a.type === "photo")
            .map((att) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={att.url}
                src={att.url}
                alt=""
                className="w-full h-auto rounded-[8px]"
              />
            ))}
        </div>
      </main>
    </>
  );
}
