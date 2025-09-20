import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import React, { Suspense } from "react";
import PostLoading from "./PostLoading";
import PostViewer from "./PostViewer";

export const revalidate = 10800;

export default async function TabnewsPostPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return (
    <>
      <Navbar />
      <Suspense fallback={<PostLoading />}>
        <PostViewer id={id} />
      </Suspense>
      <Footer />
    </>
  );
}
