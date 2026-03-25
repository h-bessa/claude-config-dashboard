import { fetchSettings, fetchSkillsList, fetchAgentsList, fetchScriptsList } from "@/lib/github";
import { StatCard } from "@/components/stat-card";
import { SectionHeader } from "@/components/section-header";
import {
  Zap,
  Bot,
  Plug,
  Webhook,
  Shield,
  Terminal,
  Server,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [settings, skills, agents, scripts] = await Promise.all([
    fetchSettings(),
    fetchSkillsList(),
    fetchAgentsList(),
    fetchScriptsList(),
  ]);

  const plugins = Object.keys(settings.enabledPlugins || {});
  const hooksEvents = Object.keys(settings.hooks || {});
  const allowPerms = settings.permissions?.allow?.length || 0;
  const denyPerms = settings.permissions?.deny?.length || 0;

  const mcpServers = [
    { name: "Context7", tools: ["resolve-library-id", "query-docs"] },
    { name: "Playwright", tools: ["browser_navigate", "browser_snapshot", "browser_click", "browser_fill_form", "..."] },
    { name: "Canva", tools: ["generate-design", "export-design", "create-design-from-candidate", "..."] },
    { name: "Atlassian", tools: ["searchJiraIssuesUsingJql", "getConfluencePage", "createConfluencePage"] },
  ];

  return (
    <>
      <SectionHeader
        title="Configuration Overview"
        description="Live snapshot of your Claude Code setup — fetched from GitHub"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Skills" value={skills.length} icon={Zap} color="amber" />
        <StatCard label="Agents" value={agents.length} icon={Bot} color="violet" />
        <StatCard label="Plugins" value={plugins.length} icon={Plug} color="emerald" />
        <StatCard label="Hooks" value={hooksEvents.length} icon={Webhook} color="blue" />
        <StatCard label="Scripts" value={scripts.length} icon={Terminal} color="pink" />
        <StatCard label="MCP Servers" value={mcpServers.length} icon={Server} color="cyan" />
        <StatCard label="Allowed" value={allowPerms} icon={ShieldCheck} color="emerald" />
        <StatCard label="Denied" value={denyPerms} icon={Shield} color="pink" />
      </div>

      {/* Enabled Plugins section */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Enabled Plugins</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {plugins.map((pluginId) => {
            const [name, marketplace] = pluginId.split("@");
            return (
              <div key={pluginId} className="glass-card p-4">
                <p className="text-sm font-medium">{name}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  @{marketplace}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Variables section */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Environment Variables</h2>
        <div className="glass-card divide-y divide-white/[0.06] overflow-hidden">
          {Object.entries(settings.env || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <code className="font-mono text-xs text-amber-400">{key}</code>
              <code className="font-mono text-xs text-muted-foreground">{String(value)}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Config section */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold">Status Line</h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground break-all">
            {settings.statusLine?.command || "Not configured"}
          </p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold">Settings</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Always Thinking</span>
              <span className={settings.alwaysThinkingEnabled ? "text-emerald-400" : "text-muted-foreground"}>
                {settings.alwaysThinkingEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spinner Tips</span>
              <span className={settings.spinnerTipsEnabled ? "text-emerald-400" : "text-muted-foreground"}>
                {settings.spinnerTipsEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Co-Authored-By</span>
              <span className={settings.includeCoAuthoredBy ? "text-emerald-400" : "text-muted-foreground"}>
                {settings.includeCoAuthoredBy ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
