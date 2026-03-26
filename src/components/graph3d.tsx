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
  glowColor: string;
  detail?: any;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  particleColor: string;
  width: number;
}

const GROUP_COLORS: Record<string, { main: string; glow: string }> = {
  core:       { main: "#f59e0b", glow: "#fbbf24" },
  skill:      { main: "#f59e0b", glow: "#fcd34d" },
  agent:      { main: "#8b5cf6", glow: "#a78bfa" },
  plugin:     { main: "#10b981", glow: "#34d399" },
  hook:       { main: "#3b82f6", glow: "#60a5fa" },
  mcp:        { main: "#06b6d4", glow: "#22d3ee" },
  permission: { main: "#ec4899", glow: "#f472b6" },
  tool:       { main: "#64748b", glow: "#94a3b8" },
};

function buildGraphData(data: ConfigData) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Core
  nodes.push({
    id: "core", name: "Claude Code", group: "core",
    color: GROUP_COLORS.core.main, glowColor: GROUP_COLORS.core.glow, size: 28,
  });

  const categories = [
    { id: "cat-skills",  name: `Skills (${data.skills.length})`,  group: "skill" },
    { id: "cat-agents",  name: `Agents (${data.agents.length})`,  group: "agent" },
    { id: "cat-plugins", name: `Plugins (${data.plugins.length})`, group: "plugin" },
    { id: "cat-hooks",   name: `Hooks (${data.hooks.length})`,    group: "hook" },
    { id: "cat-mcp",     name: `MCP (${data.mcpServers.length})`, group: "mcp" },
    { id: "cat-perms",   name: `Perms (${data.permissions.allow.length + data.permissions.deny.length})`, group: "permission" },
  ];

  categories.forEach((cat) => {
    const gc = GROUP_COLORS[cat.group];
    nodes.push({ ...cat, color: gc.main, glowColor: gc.glow, size: 16 });
    links.push({ source: "core", target: cat.id, color: gc.main + "88", particleColor: gc.glow, width: 1.5 });
  });

  // Skills
  data.skills.forEach((skill) => {
    const id = `skill-${skill.name}`;
    const gc = GROUP_COLORS.skill;
    nodes.push({ id, name: skill.name, group: "skill", color: gc.main, glowColor: gc.glow, size: 5, detail: skill });
    links.push({ source: "cat-skills", target: id, color: gc.main + "22", particleColor: gc.glow, width: 0.3 });
  });

  // Agents
  data.agents.forEach((agent) => {
    const id = `agent-${agent.name}`;
    const gc = GROUP_COLORS.agent;
    nodes.push({ id, name: agent.name, group: "agent", color: gc.main, glowColor: gc.glow, size: 8, detail: agent });
    links.push({ source: "cat-agents", target: id, color: gc.main + "33", particleColor: gc.glow, width: 0.5 });
  });

  // Plugins
  data.plugins.forEach((plugin) => {
    const id = `plugin-${plugin.name}`;
    const gc = GROUP_COLORS.plugin;
    nodes.push({ id, name: plugin.name, group: "plugin", color: gc.main, glowColor: gc.glow, size: 7, detail: plugin });
    links.push({ source: "cat-plugins", target: id, color: gc.main + "33", particleColor: gc.glow, width: 0.5 });
  });

  // Hooks
  data.hooks.forEach((hook) => {
    const id = `hook-${hook.event}`;
    const gc = GROUP_COLORS.hook;
    nodes.push({ id, name: hook.event, group: "hook", color: gc.main, glowColor: gc.glow, size: 8, detail: hook });
    links.push({ source: "cat-hooks", target: id, color: gc.main + "33", particleColor: gc.glow, width: 0.5 });
  });

  // MCP
  data.mcpServers.forEach((server) => {
    const serverId = `mcp-${server.name}`;
    const gc = GROUP_COLORS.mcp;
    nodes.push({ id: serverId, name: server.name, group: "mcp", color: gc.main, glowColor: gc.glow, size: 9, detail: server });
    links.push({ source: "cat-mcp", target: serverId, color: gc.main + "44", particleColor: gc.glow, width: 0.6 });

    server.tools.slice(0, 5).forEach((tool) => {
      const toolId = `tool-${server.name}-${tool}`;
      const tgc = GROUP_COLORS.tool;
      nodes.push({ id: toolId, name: tool, group: "tool", color: tgc.main, glowColor: tgc.glow, size: 3, detail: { name: tool, server: server.name } });
      links.push({ source: serverId, target: toolId, color: tgc.main + "18", particleColor: tgc.glow, width: 0.2 });
    });
  });

  return { nodes, links };
}

export function Graph3D({ data }: { data: ConfigData }) {
  const fgRef = useRef<any>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const graphData = useMemo(() => buildGraphData(data), [data]);

  // Responsive
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

  // Auto-rotation + post-processing
  useEffect(() => {
    if (!fgRef.current) return;

    const controls = fgRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    // Add bloom/glow via Three.js scene
    const scene = fgRef.current.scene();
    if (scene) {
      scene.fog = null; // Remove any default fog
    }
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (node.id === "core" || node.id.startsWith("cat-")) {
      // Zoom to category
      if (fgRef.current) {
        const dist = 200;
        const ratio = 1 + dist / Math.hypot(node.x, node.y, node.z);
        fgRef.current.cameraPosition(
          { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
          node, 1200
        );
      }
      return;
    }
    setSelected(node as GraphNode);
    if (fgRef.current) {
      const dist = 80;
      const ratio = 1 + dist / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
        node, 1000
      );
    }
  }, []);

  // Custom node rendering with glow
  const nodeThreeObject = useCallback((node: any) => {
    const THREE = require("three");
    const group = new THREE.Group();

    // Inner sphere (solid)
    const innerGeo = new THREE.SphereGeometry(node.size * 0.3, 24, 24);
    const innerMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(node.color),
      emissive: new THREE.Color(node.color),
      emissiveIntensity: 0.6,
      shininess: 100,
      transparent: true,
      opacity: 0.95,
    });
    group.add(new THREE.Mesh(innerGeo, innerMat));

    // Outer glow sphere
    const glowGeo = new THREE.SphereGeometry(node.size * 0.5, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(node.glowColor),
      transparent: true,
      opacity: hovered === node.id ? 0.35 : 0.12,
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Pulse ring for core and categories
    if (node.id === "core" || node.id.startsWith("cat-")) {
      const ringGeo = new THREE.RingGeometry(node.size * 0.45, node.size * 0.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.glowColor),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(0, 0, 1);
      group.add(ring);
    }

    // Text sprite
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const fontSize = node.id === "core" ? 48 : node.id.startsWith("cat-") ? 36 : 24;
      canvas.width = 512;
      canvas.height = 128;
      ctx.clearRect(0, 0, 512, 128);
      ctx.font = `600 ${fontSize}px "Geist", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Text shadow / glow
      ctx.shadowColor = node.glowColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(node.name, 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const scale = node.id === "core" ? 40 : node.id.startsWith("cat-") ? 28 : 18;
      sprite.scale.set(scale, scale * 0.25, 1);
      sprite.position.y = -(node.size * 0.5 + 4);
      group.add(sprite);
    }

    return group;
  }, [hovered]);

  return (
    <>
      <div ref={containerRef} className="h-full w-full" style={{ cursor: "grab" }}>
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#04040a"
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={false}
          linkColor={(link: any) => link.color}
          linkWidth={(link: any) => link.width}
          linkOpacity={0.5}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={(link: any) => link.width * 2.5}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={(link: any) => link.particleColor}
          linkCurvature={0.15}
          linkCurveRotation={0.5}
          onNodeClick={handleNodeClick}
          onNodeHover={(node: any) => setHovered(node?.id || null)}
          enableNodeDrag={true}
          enableNavigationControls={true}
          showNavInfo={false}
          warmupTicks={100}
          cooldownTime={4000}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.25}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        {Object.entries(GROUP_COLORS).filter(([k]) => k !== "tool").map(([group, colors]) => (
          <div key={group} className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm ring-1 ring-white/[0.06]">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.main, boxShadow: `0 0 6px ${colors.glow}` }} />
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{group}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                    color: selected.glowColor,
                    borderColor: selected.color + "44",
                    boxShadow: `0 0 8px ${selected.color}33`,
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
                {selected.group === "skill" && (
                  <>
                    {selected.detail.description && (
                      <p className="text-sm text-muted-foreground">{selected.detail.description}</p>
                    )}
                    {selected.detail.model && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 text-[10px]">
                        model: {selected.detail.model}
                      </Badge>
                    )}
                    {selected.detail.content && (
                      <pre className="max-h-60 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                        {selected.detail.content.slice(0, 1500)}
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
                  <p className="font-mono text-xs text-muted-foreground">
                    Marketplace: <span className="text-emerald-400">@{selected.detail.marketplace}</span>
                  </p>
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
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
