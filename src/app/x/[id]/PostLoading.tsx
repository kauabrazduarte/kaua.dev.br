import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const revalidate = 60 * 60 * 3;

export default async function PostLoading() {
  return (
    <>
      <section className="mt-10">
        <Skeleton className="w-[40vw] h-6" />
        <div className="flex items-center justify-between max-md:block">
          <div className="flex items-center gap-3  mt-2">
            <div className="text-zinc-700 dark:text-zinc-400">
              <Skeleton className="w-[16px] h-[16px]" />
            </div>
            <Skeleton className="w-[50px] h-[16px]" />
            <Skeleton className="w-[1px] h-[16px]" />
            <Skeleton className="w-[32px] h-4" />
            <Skeleton className="w-[60px] h-4" />
          </div>

          <Skeleton className="w-[52px] h-4" />
        </div>
      </section>

      <main className="mt-10">
        <Skeleton className="w-full h-[50vh]" />
      </main>
    </>
  );
}
