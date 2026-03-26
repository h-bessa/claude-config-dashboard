import { fetchSettings } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

export default async function PermissionsPage() {
  const settings = await fetchSettings();
  const perms = settings.permissions || {};
  const allow = perms.allow || [];
  const deny = perms.deny || [];

  return (
    <>
      <SectionHeader
        title="Permissions"
        description="Tool access control — what Claude Code can and cannot do"
        badge={`${allow.length + deny.length} rules`}
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="secondary" className="bg-white/5 font-mono text-xs ring-1 ring-white/10">
          Default Mode: {perms.defaultMode || "default"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Allow */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold">Allowed</h2>
            <span className="ml-auto font-mono text-xs text-emerald-400">{allow.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {allow.map((perm: string, i: number) => {
              const isBash = perm.startsWith("Bash(");
              const isMcp = perm.startsWith("mcp__");
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${isBash ? "bg-amber-400" : isMcp ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <code className="font-mono text-xs text-muted-foreground">{perm}</code>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deny */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <ShieldOff className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold">Denied</h2>
            <span className="ml-auto font-mono text-xs text-red-400">{deny.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {deny.map((perm: string, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <code className="font-mono text-xs text-red-400/80">{perm}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
