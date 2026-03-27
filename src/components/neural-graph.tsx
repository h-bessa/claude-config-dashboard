"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConfigData {
  skills: Array<{ name: string; description: string; model: string; content: string }>;
  agents: Array<{ name: string; content: string }>;
  plugins: Array<{ name: string; marketplace: string }>;
  hooks: Array<{ event: string; handlers: number; commands: string[] }>;
  mcpServers: Array<{ name: string; tools: string[] }>;
  permissions: { allow: string[]; deny: string[] };
}

interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
  radius: number;
  color: string;
  glow: string;
  emoji: string;
  detail?: any;
}

interface Link extends SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

const GROUPS: Record<string, { color: string; glow: string; emoji: string }> = {
  core:       { color: "#f59e0b", glow: "#fbbf24", emoji: "⚡" },
  skill:      { color: "#f59e0b", glow: "#fcd34d", emoji: "🔧" },
  agent:      { color: "#8b5cf6", glow: "#a78bfa", emoji: "🤖" },
  plugin:     { color: "#10b981", glow: "#34d399", emoji: "🔌" },
  hook:       { color: "#3b82f6", glow: "#60a5fa", emoji: "⚡" },
  mcp:        { color: "#06b6d4", glow: "#22d3ee", emoji: "🌐" },
  permission: { color: "#ec4899", glow: "#f472b6", emoji: "🛡️" },
  tool:       { color: "#64748b", glow: "#94a3b8", emoji: "🔨" },
};

function buildGraph(data: ConfigData) {
  const nodes: Node[] = [];
  const links: Link[] = [];

  const addNode = (id: string, name: string, group: string, radius: number, detail?: any) => {
    const g = GROUPS[group];
    nodes.push({ id, name, group, radius, color: g.color, glow: g.glow, emoji: g.emoji, detail });
  };

  const addLink = (source: string, target: string) => {
    links.push({ source, target });
  };

  addNode("core", "Claude Code", "core", 28);

  addNode("cat-skills", `Skills (${data.skills.length})`, "skill", 18);
  addNode("cat-agents", `Agents (${data.agents.length})`, "agent", 18);
  addNode("cat-plugins", `Plugins (${data.plugins.length})`, "plugin", 18);
  addNode("cat-hooks", `Hooks (${data.hooks.length})`, "hook", 18);
  addNode("cat-mcp", `MCP (${data.mcpServers.length})`, "mcp", 18);
  addNode("cat-perms", `Permissions`, "permission", 18);

  ["cat-skills", "cat-agents", "cat-plugins", "cat-hooks", "cat-mcp", "cat-perms"].forEach((id) =>
    addLink("core", id)
  );

  data.skills.forEach((s) => { addNode(`s-${s.name}`, s.name, "skill", 8, s); addLink("cat-skills", `s-${s.name}`); });
  data.agents.forEach((a) => { addNode(`a-${a.name}`, a.name, "agent", 10, a); addLink("cat-agents", `a-${a.name}`); });
  data.plugins.forEach((p) => { addNode(`p-${p.name}`, p.name, "plugin", 9, p); addLink("cat-plugins", `p-${p.name}`); });
  data.hooks.forEach((h) => { addNode(`h-${h.event}`, h.event, "hook", 10, h); addLink("cat-hooks", `h-${h.event}`); });
  data.mcpServers.forEach((m) => {
    addNode(`m-${m.name}`, m.name, "mcp", 11, m);
    addLink("cat-mcp", `m-${m.name}`);
    m.tools.slice(0, 4).forEach((t) => { addNode(`t-${m.name}-${t}`, t, "tool", 5, { name: t, server: m.name }); addLink(`m-${m.name}`, `t-${m.name}-${t}`); });
  });

  addNode("perm-allow", `${data.permissions.allow.length} allow`, "permission", 10, { type: "allow", rules: data.permissions.allow });
  addNode("perm-deny", `${data.permissions.deny.length} deny`, "permission", 10, { type: "deny", rules: data.permissions.deny });
  addLink("cat-perms", "perm-allow");
  addLink("cat-perms", "perm-deny");

  return { nodes, links };
}

export function NeuralGraph({ data }: { data: ConfigData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selected, setSelected] = useState<Node | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const simRef = useRef<any>(null);
  const rafRef = useRef<number>(0);

  const { nodes, links } = useMemo(() => buildGraph(data), [data]);

  // Build adjacency map for hover highlighting
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sId = typeof link.source === "string" ? link.source : link.source.id;
      const tId = typeof link.target === "string" ? link.target : link.target.id;
      if (!map.has(sId)) map.set(sId, new Set());
      if (!map.has(tId)) map.set(tId, new Set());
      map.get(sId)!.add(tId);
      map.get(tId)!.add(sId);
    });
    return map;
  }, [links]);

  const isConnected = useCallback(
    (nodeId: string) => {
      if (!hovered) return true;
      if (nodeId === hovered) return true;
      return adjacency.get(hovered)?.has(nodeId) ?? false;
    },
    [hovered, adjacency]
  );

  const isLinkConnected = useCallback(
    (sourceId: string, targetId: string) => {
      if (!hovered) return true;
      return (sourceId === hovered || targetId === hovered);
    },
    [hovered]
  );

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // d3-force simulation
  useEffect(() => {
    const sim = forceSimulation<Node>(nodes)
      .force("link", forceLink<Node, Link>(links).id((d) => d.id).distance(80).strength(0.3))
      .force("charge", forceManyBody().strength(-120).distanceMax(400))
      .force("center", forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", forceCollide<Node>().radius((d) => d.radius + 12))
      .force("x", forceX(dimensions.width / 2).strength(0.03))
      .force("y", forceY(dimensions.height / 2).strength(0.03))
      .alphaDecay(0.008)
      .velocityDecay(0.4);

    simRef.current = sim;

    const tick = () => {
      const positions = new Map<string, { x: number; y: number }>();
      nodes.forEach((n) => {
        positions.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      });
      setNodePositions(new Map(positions));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      sim.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, [nodes, links, dimensions]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on background (not on nodes)
    if ((e.target as SVGElement).tagName === "rect") {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(3, Math.max(0.2, z + delta)));
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(3, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.2, z - 0.15)), []);
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleClick = useCallback((node: Node) => {
    if (node.id === "core" || node.id.startsWith("cat-")) return;
    setSelected(node);
  }, []);

  const arcPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
    return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
  };

  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full relative overflow-hidden"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            {Object.entries(GROUPS).map(([group, { glow }]) => (
              <filter key={group} id={`glow-${group}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={glow} floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Background (clickable for pan) */}
          <rect width={dimensions.width} height={dimensions.height} fill="#04040a" />

          {/* Pan group */}
          <g transform={`translate(${dimensions.width / 2 + pan.x},${dimensions.height / 2 + pan.y}) scale(${zoom}) translate(${-dimensions.width / 2},${-dimensions.height / 2})`}>
            {/* Links */}
            <g>
              {links.map((link, i) => {
                const sourceId = typeof link.source === "string" ? link.source : link.source.id;
                const targetId = typeof link.target === "string" ? link.target : link.target.id;
                const s = nodePositions.get(sourceId);
                const t = nodePositions.get(targetId);
                if (!s || !t) return null;
                const connected = isLinkConnected(sourceId, targetId);
                return (
                  <path
                    key={i}
                    d={arcPath(s.x, s.y, t.x, t.y)}
                    stroke={connected && hovered ? GROUPS[nodes.find(n => n.id === (sourceId === hovered ? sourceId : targetId))?.group || "core"]?.color || "#333" : "#333"}
                    strokeOpacity={hovered ? (connected ? 0.6 : 0.08) : 0.35}
                    strokeWidth={connected && hovered ? 1.5 : 1}
                    fill="none"
                    style={{ transition: "stroke-opacity 0.3s, stroke-width 0.3s" }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isNodeHovered = hovered === node.id;
                const connected = isConnected(node.id);
                const dimmed = hovered && !connected;
                const isCategory = node.id === "core" || node.id.startsWith("cat-");
                const isClickable = !isCategory;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    onClick={(e) => { e.stopPropagation(); handleClick(node); }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      cursor: isClickable ? "pointer" : "default",
                      transition: "opacity 0.3s",
                      opacity: dimmed ? 0.15 : 1,
                    }}
                  >
                    {/* Outer glow */}
                    <circle
                      r={node.radius + (isNodeHovered ? 6 : 3)}
                      fill={node.color}
                      opacity={isNodeHovered ? 0.25 : 0.08}
                      filter={isNodeHovered ? `url(#glow-${node.group})` : undefined}
                    />
                    {/* Main circle */}
                    <circle
                      r={node.radius}
                      fill={node.color}
                      opacity={isNodeHovered ? 1 : 0.85}
                      stroke={isNodeHovered ? node.glow : "transparent"}
                      strokeWidth={isNodeHovered ? 2 : 0}
                    />
                    {/* Emoji */}
                    {isCategory && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={node.radius * 0.8}
                        fill="white"
                        style={{ pointerEvents: "none" }}
                      >
                        {node.emoji}
                      </text>
                    )}
                    {/* Label */}
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      fill={isNodeHovered ? "#fff" : connected || !hovered ? "#999" : "#333"}
                      fontSize={isCategory ? 11 : 9}
                      fontFamily="var(--font-mono), monospace"
                      fontWeight={isCategory ? 600 : 400}
                      style={{ pointerEvents: "none", transition: "fill 0.3s" }}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button
            onClick={zoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-sm text-white/70 ring-1 ring-white/[0.08] backdrop-blur-sm transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-sm text-white/70 ring-1 ring-white/[0.08] backdrop-blur-sm transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-[10px] font-medium text-white/70 ring-1 ring-white/[0.08] backdrop-blur-sm transition-colors hover:bg-white/[0.1] hover:text-white"
            title="Reset view"
          >
            ⌂
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {Object.entries(GROUPS).filter(([k]) => !["tool", "core"].includes(k)).map(([group, { color, glow }]) => (
            <div key={group} className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm ring-1 ring-white/[0.06]">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${glow}` }} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{group}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-mono text-lg">
              {selected?.emoji} {selected?.name}
              {selected && (
                <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: selected.color + "22", color: selected.glow, borderColor: selected.color + "44" }}>
                  {selected.group}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected?.detail && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-3 pr-4">
                {selected.group === "skill" && (
                  <>
                    {selected.detail.description && <p className="text-sm text-muted-foreground">{selected.detail.description}</p>}
                    {selected.detail.model && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 text-[10px]">
                        model: {selected.detail.model}
                      </Badge>
                    )}
                    {selected.detail.content && (
                      <pre className="max-h-60 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                        {selected.detail.content.slice(0, 2000)}
                      </pre>
                    )}
                  </>
                )}
                {selected.group === "agent" && (
                  <pre className="max-h-60 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                    {selected.detail.content}
                  </pre>
                )}
                {selected.group === "plugin" && (
                  <p className="font-mono text-xs text-muted-foreground">Marketplace: <span className="text-emerald-400">@{selected.detail.marketplace}</span></p>
                )}
                {selected.group === "hook" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{selected.detail.handlers} handler(s)</p>
                    {selected.detail.commands.map((cmd: string, i: number) => (
                      <code key={i} className="block rounded bg-black/30 p-2 font-mono text-[10px] text-muted-foreground break-all">{cmd}</code>
                    ))}
                  </div>
                )}
                {selected.group === "mcp" && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.detail.tools?.map((tool: string) => (
                      <span key={tool} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground ring-1 ring-white/[0.06]">{tool}</span>
                    ))}
                  </div>
                )}
                {selected.group === "tool" && (
                  <p className="font-mono text-xs text-muted-foreground">Server: <span className="text-cyan-400">{selected.detail.server}</span></p>
                )}
                {selected.group === "permission" && (
                  <div className="space-y-1">
                    {selected.detail.rules?.map((rule: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`h-1.5 w-1.5 rounded-full ${selected.detail.type === "allow" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <code className="font-mono text-muted-foreground">{rule}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
