import { fetchSkillsList, fetchSkillContent } from "@/lib/github";
import { parseFrontmatter } from "@/lib/parse-frontmatter";
import { SectionHeader } from "@/components/section-header";
import { SkillGrid } from "@/components/skill-grid";

export const revalidate = 300;

export default async function SkillsPage() {
  const skills = await fetchSkillsList();

  // Only fetch frontmatter for each skill (light), not full content
  const skillsWithMeta = await Promise.all(
    skills.map(async (skill) => {
      const content = await fetchSkillContent(skill.name);
      const { metadata } = parseFrontmatter(content);
      return {
        name: skill.name,
        type: skill.type,
        description: metadata.description || "",
        model: metadata.model || "",
        argumentHint: metadata["argument-hint"] || "",
        allowedTools: metadata["allowed-tools"] || "",
        body: "",
        content: content.slice(0, 2000), // Truncate to reduce payload
      };
    })
  );

  return (
    <>
      <SectionHeader
        title="Skills"
        description="Custom skills extending Claude Code's capabilities"
        badge={`${skillsWithMeta.length}`}
      />
      <SkillGrid skills={skillsWithMeta} />
    </>
  );
}
