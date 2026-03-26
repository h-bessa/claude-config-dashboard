import { fetchAgentsList } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { Bot } from "lucide-react";

export const revalidate = 300;

export default async function AgentsPage() {
  const agents = await fetchAgentsList();

  return (
    <>
      <SectionHeader
        title="Agents"
        description="Custom sub-agents for parallel and specialized tasks"
        badge={`${agents.length}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {agents.map((agent) => (
          <div key={agent.name} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                <Bot className="h-4.5 w-4.5 text-violet-400" />
              </div>
              <h3 className="font-mono text-sm font-semibold">{agent.name}</h3>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/20 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
              {agent.content}
            </pre>
          </div>
        ))}
      </div>
    </>
  );
}
