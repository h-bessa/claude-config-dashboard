import { fetchSettings, fetchSkillsList, fetchSkillContent, fetchAgentsList } from "@/lib/github";
import { parseFrontmatter } from "@/lib/parse-frontmatter";
import { SectionHeader } from "@/components/section-header";
import { Graph3DLoader } from "@/components/graph3d-loader";

export const revalidate = 300;

export default async function Mindmap3DPage() {
  const [settings, skills, agents] = await Promise.all([
    fetchSettings(),
    fetchSkillsList(),
    fetchAgentsList(),
  ]);

  // Fetch skill details
  const skillsWithMeta = await Promise.all(
    skills.map(async (skill) => {
      const content = await fetchSkillContent(skill.name);
      const { metadata } = parseFrontmatter(content);
      return {
        name: skill.name,
        description: metadata.description || "",
        model: metadata.model || "",
        content,
      };
    })
  );

  const plugins = Object.entries(settings.enabledPlugins || {}).map(([id]) => {
    const [name, marketplace] = id.split("@");
    return { name, marketplace };
  });

  const hooks = Object.entries(settings.hooks || {}).map(([event, handlers]: [string, any]) => ({
    event,
    handlers: handlers.length,
    commands: handlers.flatMap((h: any) => h.hooks?.map((hk: any) => hk.command) || []),
  }));

  const mcpServers = [
    { name: "Context7", tools: ["resolve-library-id", "query-docs"] },
    { name: "Playwright", tools: ["browser_navigate", "browser_snapshot", "browser_click", "browser_fill_form", "browser_take_screenshot", "browser_evaluate"] },
    { name: "Canva", tools: ["generate-design", "export-design", "search-designs", "start-editing-transaction", "upload-asset-from-url"] },
    { name: "Atlassian", tools: ["searchJiraIssuesUsingJql", "getConfluencePage", "createConfluencePage"] },
  ];

  const permissions = {
    allow: settings.permissions?.allow || [],
    deny: settings.permissions?.deny || [],
  };

  const configData = {
    skills: skillsWithMeta,
    agents,
    plugins,
    hooks,
    mcpServers,
    permissions,
  };

  return (
    <>
      <SectionHeader
        title="3D Neural Map"
        description="Navigate your config as a living neural network — click any node to inspect"
      />
      <div className="glass-card relative overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <Graph3DLoader data={configData} />
      </div>
    </>
  );
}
