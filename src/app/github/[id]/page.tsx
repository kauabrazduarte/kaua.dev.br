import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import React, { Suspense } from "react";
import ProjectLoading from "./ProjectLoading";
import ProjectViewer from "./ProjectViewer";
import { Metadata } from "next";
import getRepoInfo from "@/utils/getRepoInfos";

export const revalidate = 10800;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const project = await getRepoInfo(id);

  if (!project) {
    return {
      title: "Projeto Não Encontrado",
      description:
        "O project que você está procurando não existe ou foi movido.",
    };
  }

  const description = project.description || "Leia mais sobre este projeto.";

  return {
    title: `Projeto: ${project.name}`,
    description: description,
    openGraph: {
      title: project.name,
      description: description,
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: description,
    },
  };
}

export default async function ProjectGithubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <Suspense fallback={<ProjectLoading />}>
        <ProjectViewer id={id} />
      </Suspense>
      <Footer />
    </>
  );
}
