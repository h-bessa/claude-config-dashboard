import { fetchSettings, fetchSkillsList, fetchAgentsList } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { MindmapLoader } from "@/components/mindmap-loader";

export const revalidate = 300;

export default async function MindmapPage() {
  const [settings, skills, agents] = await Promise.all([
    fetchSettings(),
    fetchSkillsList(),
    fetchAgentsList(),
  ]);

  const configData = {
    skills: skills.map((s) => s.name),
    agents: agents.map((a) => a.name),
    plugins: Object.keys(settings.enabledPlugins || {}).map((id) => id.split("@")[0]),
    hooks: Object.keys(settings.hooks || {}),
    permissions: {
      allow: (settings.permissions?.allow || []).length,
      deny: (settings.permissions?.deny || []).length,
    },
    mcpServers: ["Context7", "Playwright", "Canva", "Atlassian"],
  };

  return (
    <>
      <SectionHeader
        title="Configuration Mindmap"
        description="Interactive architecture visualization — drag, zoom, and explore"
      />
      <div className="glass-card relative" style={{ height: "calc(100vh - 200px)" }}>
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <MindmapLoader data={configData} />
        </div>
      </div>
    </>
  );
}
