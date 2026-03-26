import { fetchScriptsList, fetchSettings } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { Terminal, Folder, Activity, Shield, FileText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

// Map known scripts to descriptions and categories
const scriptMeta: Record<string, { description: string; category: string; icon: string }> = {
  "statusline": { description: "Custom status bar showing session info, token usage, and spend data", category: "UI", icon: "activity" },
  "auto-rename-session": { description: "Automatically renames sessions based on conversation content when Claude stops", category: "Automation", icon: "refresh" },
  "command-validator": { description: "PreToolUse hook that validates bash commands against safety rules before execution", category: "Security", icon: "shield" },
  "claude-code-ai": { description: "AI-powered utilities and helpers for Claude Code", category: "AI", icon: "terminal" },
  "biome.json": { description: "Biome formatter/linter configuration", category: "Config", icon: "file" },
  "tsconfig.json": { description: "TypeScript compiler configuration", category: "Config", icon: "file" },
  "package.json": { description: "Node.js package manifest for scripts workspace", category: "Config", icon: "file" },
  "CLAUDE.md": { description: "Project instructions for Claude Code in the scripts directory", category: "Config", icon: "file" },
  "statusline.sh": { description: "Shell-based statusline fallback script", category: "UI", icon: "activity" },
};

const categoryOrder = ["Security", "Automation", "UI", "AI", "Config"];
const categoryIcons: Record<string, any> = {
  Security: Shield,
  Automation: RefreshCw,
  UI: Activity,
  AI: Terminal,
  Config: FileText,
};

const categoryColors: Record<string, string> = {
  Security: "text-red-400 bg-red-500/10 ring-red-500/20",
  Automation: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  UI: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  AI: "text-violet-400 bg-violet-500/10 ring-violet-500/20",
  Config: "text-muted-foreground bg-white/5 ring-white/10",
};

export default async function ScriptsPage() {
  const [scripts, settings] = await Promise.all([
    fetchScriptsList(),
    fetchSettings(),
  ]);

  // Group by category
  const grouped: Record<string, Array<{ name: string; type: string; description: string }>> = {};

  scripts.forEach((script) => {
    const meta = scriptMeta[script.name];
    const category = meta?.category || "Other";
    const description = meta?.description || (script.type === "dir" ? "Script directory" : "Configuration file");
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ ...script, description });
  });

  const hookCount = Object.values(settings.hooks || {}).reduce(
    (acc: number, handlers: any) => acc + handlers.reduce((a: number, h: any) => a + (h.hooks?.length || 0), 0),
    0
  );

  return (
    <>
      <SectionHeader
        title="Scripts & Automation"
        description="Custom scripts powering hooks, statusline, and workflow automation"
        badge={`${scripts.length} items`}
      />

      {/* Summary */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hook Commands</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{hookCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Script Dirs</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{scripts.filter(s => s.type === "dir").length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Config Files</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{scripts.filter(s => s.type === "file").length}</p>
        </div>
      </div>

      {/* Grouped scripts */}
      {categoryOrder.filter(cat => grouped[cat]).map((category) => {
        const Icon = categoryIcons[category] || Folder;
        const colorClass = categoryColors[category] || "text-muted-foreground bg-white/5 ring-white/10";

        return (
          <div key={category} className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Icon className="h-3 w-3" />
              {category}
              <span className="text-muted-foreground/50">({grouped[category].length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grouped[category].map((script) => (
                <div key={script.name} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${colorClass}`}>
                      {script.type === "dir" ? (
                        <Folder className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-semibold">{script.name}</h3>
                        <Badge variant="secondary" className="bg-white/5 text-[9px] ring-1 ring-white/10">
                          {script.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{script.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Other uncategorized */}
      {grouped["Other"] && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Folder className="h-3 w-3" />
            Other
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {grouped["Other"].map((script) => (
              <div key={script.name} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-mono text-sm">{script.name}</h3>
                    <p className="text-xs text-muted-foreground">{script.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
