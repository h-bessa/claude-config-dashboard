import { fetchScriptsList, fetchSettings } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { Terminal, Folder } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const [scripts, settings] = await Promise.all([
    fetchScriptsList(),
    fetchSettings(),
  ]);

  return (
    <>
      <SectionHeader
        title="Scripts"
        description="Custom scripts powering hooks, statusline, and automation"
        badge={`${scripts.length}`}
      />

      {/* Status Line */}
      <div className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Status Line
        </h2>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <code className="font-mono text-xs text-muted-foreground break-all">
              {settings.statusLine?.command || "Not configured"}
            </code>
          </div>
        </div>
      </div>

      {/* Scripts list */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Scripts Directory
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <div key={script.name} className="glass-card p-4">
            <div className="flex items-center gap-3">
              {script.type === "dir" ? (
                <Folder className="h-4 w-4 text-amber-400" />
              ) : (
                <Terminal className="h-4 w-4 text-emerald-400" />
              )}
              <span className="font-mono text-sm">{script.name}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
