import { preloadPortfolioModels } from '@/components/canvas/modelPreload';
import { AboutStation } from '@/pages/portfolio/world/AboutStation';
import { ContactStation } from '@/pages/portfolio/world/ContactStation';
import { ExperienceDiorama } from '@/pages/portfolio/world/ExperienceDiorama';
import { ProjectsStation } from '@/pages/portfolio/world/ProjectsStation';
import { SkillsStation } from '@/pages/portfolio/world/SkillsStation';

preloadPortfolioModels();

export function StationsWorld() {
  return (
    <group name="portfolio-stations-world">
      <AboutStation />
      <ExperienceDiorama />
      <SkillsStation />
      <ProjectsStation />
      <ContactStation />
    </group>
  );
}
