"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Initializing 3D universe...
    </div>
  ),
});

interface ConfigData {
  skills: Array<{ name: string; description: string; model: string; content: string }>;
  agents: Array<{ name: string; content: string }>;
  plugins: Array<{ name: string; marketplace: string }>;
  hooks: Array<{ event: string; handlers: number; commands: string[] }>;
  mcpServers: Array<{ name: string; tools: string[] }>;
  permissions: { allow: string[]; deny: string[] };
}

interface GraphNode {
  id: string;
  name: string;
  group: string;
  color: string;
  size: number;
  detail?: any;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
}

const GROUP_COLORS: Record<string, string> = {
  core: "#d97706",
  skill: "#f59e0b",
  agent: "#8b5cf6",
  plugin: "#10b981",
  hook: "#3b82f6",
  mcp: "#06b6d4",
  permission: "#ec4899",
  tool: "#64748b",
};

function buildGraphData(data: ConfigData) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Core node
  nodes.push({
    id: "core",
    name: "Claude Code",
    group: "core",
    color: GROUP_COLORS.core,
    size: 24,
  });

  // Category nodes
  const categories = [
    { id: "cat-skills", name: `Skills (${data.skills.length})`, group: "skill" },
    { id: "cat-agents", name: `Agents (${data.agents.length})`, group: "agent" },
    { id: "cat-plugins", name: `Plugins (${data.plugins.length})`, group: "plugin" },
    { id: "cat-hooks", name: `Hooks (${data.hooks.length})`, group: "hook" },
    { id: "cat-mcp", name: `MCP (${data.mcpServers.length})`, group: "mcp" },
    { id: "cat-perms", name: `Perms (${data.permissions.allow.length + data.permissions.deny.length})`, group: "permission" },
  ];

  categories.forEach((cat) => {
    nodes.push({ ...cat, color: GROUP_COLORS[cat.group], size: 14 });
    links.push({ source: "core", target: cat.id, color: GROUP_COLORS[cat.group] + "66" });
  });

  // Skills
  data.skills.forEach((skill) => {
    const id = `skill-${skill.name}`;
    nodes.push({
      id,
      name: skill.name,
      group: "skill",
      color: GROUP_COLORS.skill,
      size: 6,
      detail: skill,
    });
    links.push({ source: "cat-skills", target: id, color: GROUP_COLORS.skill + "33" });
  });

  // Agents
  data.agents.forEach((agent) => {
    const id = `agent-${agent.name}`;
    nodes.push({
      id,
      name: agent.name,
      group: "agent",
      color: GROUP_COLORS.agent,
      size: 8,
      detail: agent,
    });
    links.push({ source: "cat-agents", target: id, color: GROUP_COLORS.agent + "33" });
  });

  // Plugins
  data.plugins.forEach((plugin) => {
    const id = `plugin-${plugin.name}`;
    nodes.push({
      id,
      name: plugin.name,
      group: "plugin",
      color: GROUP_COLORS.plugin,
      size: 7,
      detail: plugin,
    });
    links.push({ source: "cat-plugins", target: id, color: GROUP_COLORS.plugin + "33" });
  });

  // Hooks
  data.hooks.forEach((hook) => {
    const id = `hook-${hook.event}`;
    nodes.push({
      id,
      name: hook.event,
      group: "hook",
      color: GROUP_COLORS.hook,
      size: 8,
      detail: hook,
    });
    links.push({ source: "cat-hooks", target: id, color: GROUP_COLORS.hook + "33" });
  });

  // MCP Servers
  data.mcpServers.forEach((server) => {
    const serverId = `mcp-${server.name}`;
    nodes.push({
      id: serverId,
      name: server.name,
      group: "mcp",
      color: GROUP_COLORS.mcp,
      size: 8,
      detail: server,
    });
    links.push({ source: "cat-mcp", target: serverId, color: GROUP_COLORS.mcp + "33" });

    // MCP tools as tiny nodes
    server.tools.slice(0, 6).forEach((tool) => {
      const toolId = `tool-${server.name}-${tool}`;
      nodes.push({
        id: toolId,
        name: tool,
        group: "tool",
        color: GROUP_COLORS.tool,
        size: 3,
        detail: { name: tool, server: server.name },
      });
      links.push({ source: serverId, target: toolId, color: GROUP_COLORS.tool + "22" });
    });
  });

  return { nodes, links };
}

export function Graph3D({ data }: { data: ConfigData }) {
  const fgRef = useRef<any>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => buildGraphData(data), [data]);

  // Responsive sizing
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slow auto-rotation
  useEffect(() => {
    if (!fgRef.current) return;
    const controls = fgRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (node.id === "core" || node.id.startsWith("cat-")) return;
    setSelected(node as GraphNode);

    // Zoom to node
    if (fgRef.current) {
      const distance = 120;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1500
      );
    }
  }, []);

  return (
    <>
      <div ref={containerRef} className="h-full w-full">
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#06060e"
          nodeLabel="name"
          nodeColor={(node: any) => node.color}
          nodeVal={(node: any) => node.size}
          nodeOpacity={0.9}
          nodeResolution={16}
          linkColor={(link: any) => link.color}
          linkWidth={0.4}
          linkOpacity={0.3}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={0.8}
          linkDirectionalParticleSpeed={0.003}
          linkDirectionalParticleColor={(link: any) => link.color}
          onNodeClick={handleNodeClick}
          enableNodeDrag={true}
          enableNavigationControls={true}
          showNavInfo={false}
          warmupTicks={80}
          cooldownTime={3000}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-lg border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-mono text-lg">
              {selected?.name}
              {selected && (
                <Badge
                  variant="secondary"
                  className="text-[10px]"
                  style={{
                    backgroundColor: selected.color + "22",
                    color: selected.color,
                    borderColor: selected.color + "44",
                  }}
                >
                  {selected.group}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected?.detail && (
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-3 pr-4">
                {/* Skill detail */}
                {selected.group === "skill" && (
                  <>
                    {selected.detail.description && (
                      <p className="text-sm text-muted-foreground">
                        {selected.detail.description}
                      </p>
                    )}
                    {selected.detail.model && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Model:</span>
                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 text-[10px]">
                          {selected.detail.model}
                        </Badge>
                      </div>
                    )}
                    {selected.detail.content && (
                      <pre className="max-h-60 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                        {selected.detail.content.slice(0, 1000)}
                      </pre>
                    )}
                  </>
                )}

                {/* Agent detail */}
                {selected.group === "agent" && (
                  <pre className="max-h-60 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                    {selected.detail.content}
                  </pre>
                )}

                {/* Plugin detail */}
                {selected.group === "plugin" && (
                  <p className="font-mono text-xs text-muted-foreground">
                    Marketplace: @{selected.detail.marketplace}
                  </p>
                )}

                {/* Hook detail */}
                {selected.group === "hook" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {selected.detail.handlers} handler(s)
                    </p>
                    {selected.detail.commands.map((cmd: string, i: number) => (
                      <code key={i} className="block rounded bg-black/30 p-2 font-mono text-[10px] text-muted-foreground break-all">
                        {cmd}
                      </code>
                    ))}
                  </div>
                )}

                {/* MCP detail */}
                {selected.group === "mcp" && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.detail.tools?.map((tool: string) => (
                      <span key={tool} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground ring-1 ring-white/[0.06]">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tool detail */}
                {selected.group === "tool" && (
                  <p className="font-mono text-xs text-muted-foreground">
                    Server: {selected.detail.server}
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
