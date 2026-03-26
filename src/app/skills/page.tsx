import { fetchSkillsList, fetchSkillContent } from "@/lib/github";
import { parseFrontmatter } from "@/lib/parse-frontmatter";
import { SectionHeader } from "@/components/section-header";
import { SkillGrid } from "@/components/skill-grid";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await fetchSkillsList();

  const skillsWithMeta = await Promise.all(
    skills
      .filter((skill) => skill.type !== "symlink")
      .map(async (skill) => {
      const content = await fetchSkillContent(skill.name);
      const { metadata, body } = parseFrontmatter(content);
      return {
        ...skill,
        description: metadata.description || "",
        model: metadata.model || "",
        argumentHint: metadata["argument-hint"] || "",
        allowedTools: metadata["allowed-tools"] || "",
        body: body.slice(0, 300),
        content,
      };
    })
  );

  return (
    <>
      <SectionHeader
        title="Skills"
        description="Custom skills extending Claude Code's capabilities"
        badge={`${skills.length}`}
      />
      <SkillGrid skills={skillsWithMeta} />
    </>
  );
}
