import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { SkillsSection } from "@/components/sections/skills";
import { ExperienceSection } from "@/components/sections/experience";
import { GitHubStatsSection } from "@/components/sections/github-stats";
import { ContactSection } from "@/components/sections/contact";
// ProjectsSection lives in @/components/sections/projects.tsx — kept for later.

type Params = Promise<{ locale: string }>;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <GitHubStatsSection />
      <ContactSection />
    </>
  );
}
