import { fetchSettings } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { Webhook, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const eventColors: Record<string, string> = {
  PreToolUse: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  PostToolUse: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  Stop: "bg-pink-500/10 text-pink-400 ring-pink-500/20",
  Notification: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  UserPromptSubmit: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
};

export default async function HooksPage() {
  const settings = await fetchSettings();
  const hooks = settings.hooks || {};

  return (
    <>
      <SectionHeader
        title="Hooks"
        description="Event-driven automations triggered by Claude Code lifecycle events"
        badge={`${Object.keys(hooks).length} events`}
      />

      <div className="space-y-6">
        {Object.entries(hooks).map(([event, handlers]: [string, any]) => (
          <div key={event} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] ring-1 ring-white/10">
                <Webhook className="h-4 w-4 text-amber-400" />
              </div>
              <h2 className="font-mono text-sm font-semibold">{event}</h2>
              <Badge variant="secondary" className={`ring-1 ${eventColors[event] || "bg-white/5 text-white ring-white/10"}`}>
                {handlers.length} handler{handlers.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {handlers.map((handler: any, i: number) => (
                <div key={i} className="px-5 py-4">
                  {handler.matcher && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Matcher
                      </span>
                      <Badge variant="secondary" className="bg-white/5 font-mono text-[10px] ring-1 ring-white/10">
                        {handler.matcher || "*"}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-2">
                    {handler.hooks.map((hook: any, j: number) => (
                      <div key={j} className="flex items-start gap-2">
                        <Play className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                        <code className="font-mono text-xs text-muted-foreground break-all">
                          {hook.command}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
