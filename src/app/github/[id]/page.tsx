import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import React, { Suspense } from "react";
import PostLoading from "./PostLoading";
import PostViewer from "./PostViewer";
import { Metadata } from "next";
import getRepoInfo from "@/utils/getRepoInfos";

export const revalidate = 10800;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const post = await getRepoInfo(id);

  if (!post) {
    return {
      title: "Post Não Encontrado",
      description: "O post que você está procurando não existe ou foi movido.",
    };
  }

  const description = post.description || "Leia mais sobre este projeto.";

  return {
    title: `Projeto: ${post.name}`,
    description: description,
    openGraph: {
      title: post.name,
      description: description,
    },
    twitter: {
      card: "summary_large_image",
      title: post.name,
      description: description,
    },
  };
}

export default async function TabnewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
