"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading mindmap...
      </div>
    ),
  }
);

interface ConfigData {
  skills: string[];
  agents: string[];
  plugins: string[];
  hooks: string[];
  permissions: { allow: number; deny: number };
  mcpServers: string[];
}

function buildScene(data: ConfigData) {
  const elements: any[] = [];
  let idCounter = 0;
  const nextId = () => `el_${++idCounter}`;

  function addRect(
    x: number,
    y: number,
    w: number,
    h: number,
    bg: string,
    stroke: string,
    label: string,
    fontSize: number = 14
  ) {
    const rectId = nextId();
    const textId = nextId();

    elements.push({
      id: rectId,
      type: "rectangle",
      x,
      y,
      width: w,
      height: h,
      angle: 0,
      strokeColor: stroke,
      backgroundColor: bg,
      fillStyle: "solid",
      strokeWidth: 1.5,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      isDeleted: false,
      boundElements: [{ id: textId, type: "text" }],
      locked: false,
      link: null,
      updated: 1,
      seed: idCounter * 111,
      version: 1,
      versionNonce: idCounter * 222,
    });

    elements.push({
      id: textId,
      type: "text",
      x: x + 8,
      y: y + h / 2 - fontSize * 0.7,
      width: w - 16,
      height: fontSize * 1.4,
      angle: 0,
      strokeColor: stroke,
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      isDeleted: false,
      boundElements: null,
      locked: false,
      link: null,
      updated: 1,
      seed: idCounter * 333,
      version: 1,
      versionNonce: idCounter * 444,
      text: label,
      fontSize,
      fontFamily: 3,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: rectId,
      originalText: label,
      autoResize: true,
      lineHeight: 1.25,
    });

    return rectId;
  }

  function addArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    startId?: string,
    endId?: string
  ) {
    const id = nextId();
    elements.push({
      id,
      type: "arrow",
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      angle: 0,
      strokeColor: stroke,
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      roughness: 0,
      opacity: 50,
      groupIds: [],
      frameId: null,
      roundness: { type: 2 },
      isDeleted: false,
      boundElements: null,
      locked: false,
      link: null,
      updated: 1,
      seed: idCounter * 555,
      version: 1,
      versionNonce: idCounter * 666,
      points: [
        [0, 0],
        [x2 - x1, y2 - y1],
      ],
      startBinding: startId
        ? { elementId: startId, focus: 0, gap: 5, fixedPoint: null }
        : null,
      endBinding: endId
        ? { elementId: endId, focus: 0, gap: 5, fixedPoint: null }
        : null,
      startArrowhead: null,
      endArrowhead: "arrow",
      elbowed: false,
    });
  }

  // Center node
  const centerW = 280;
  const centerH = 60;
  const cx = -centerW / 2;
  const cy = -centerH / 2;
  const centerId = addRect(
    cx,
    cy,
    centerW,
    centerH,
    "#d97706",
    "#fbbf24",
    "⚡ Claude Code Config",
    20
  );

  const branches = [
    {
      label: `Skills (${data.skills.length})`,
      color: "#f59e0b",
      bg: "#3d2800",
      items: data.skills,
      angle: -2.2,
      dist: 280,
    },
    {
      label: `Agents (${data.agents.length})`,
      color: "#8b5cf6",
      bg: "#2d1b69",
      items: data.agents,
      angle: -0.9,
      dist: 300,
    },
    {
      label: `Plugins (${data.plugins.length})`,
      color: "#10b981",
      bg: "#0a3d2c",
      items: data.plugins,
      angle: 0.3,
      dist: 300,
    },
    {
      label: `Hooks (${data.hooks.length})`,
      color: "#3b82f6",
      bg: "#1a2a4d",
      items: data.hooks,
      angle: 1.2,
      dist: 280,
    },
    {
      label: `MCP (${data.mcpServers.length})`,
      color: "#06b6d4",
      bg: "#0a3040",
      items: data.mcpServers,
      angle: 2.3,
      dist: 280,
    },
    {
      label: `Perms (${data.permissions.allow + data.permissions.deny})`,
      color: "#ec4899",
      bg: "#4d1a33",
      items: [`${data.permissions.allow} allow`, `${data.permissions.deny} deny`],
      angle: -3.5,
      dist: 280,
    },
  ];

  branches.forEach((branch) => {
    const bw = 200;
    const bh = 44;
    const bx = Math.cos(branch.angle) * branch.dist - bw / 2;
    const by = Math.sin(branch.angle) * branch.dist - bh / 2;

    const branchId = addRect(bx, by, bw, bh, branch.bg, branch.color, branch.label, 15);

    addArrow(0, 0, bx + bw / 2, by + bh / 2, branch.color, centerId, branchId);

    // Sub-items
    const items = branch.items.slice(0, 10);
    items.forEach((item, i) => {
      const itemDist = 180 + Math.floor(i / 5) * 170;
      const spread = 0.12;
      const itemAngle = branch.angle + (i - (items.length - 1) / 2) * spread;
      const iw = 155;
      const ih = 28;
      const ix =
        Math.cos(itemAngle) * (branch.dist + itemDist) - iw / 2;
      const iy =
        Math.sin(itemAngle) * (branch.dist + itemDist) - ih / 2;

      const itemId = addRect(ix, iy, iw, ih, "#141425", branch.color + "88", item, 11);
      addArrow(bx + bw / 2, by + bh / 2, ix + iw / 2, iy + ih / 2, branch.color + "44", branchId, itemId);
    });

    if (branch.items.length > 10) {
      const moreAngle = branch.angle;
      const moreDist = branch.dist + 180 + Math.ceil(10 / 5) * 170;
      const mx = Math.cos(moreAngle) * moreDist - 75;
      const my = Math.sin(moreAngle) * moreDist - 14;
      addRect(mx, my, 150, 28, "#141425", "#555", `+${branch.items.length - 10} more...`, 11);
    }
  });

  return elements;
}

export function ExcalidrawMindmap({ data }: { data: ConfigData }) {
  const [mounted, setMounted] = useState(false);
  const elementsRef = useRef<any[]>([]);

  useEffect(() => {
    elementsRef.current = buildScene(data);
    setMounted(true);
  }, [data]);

  if (!mounted) return null;

  return (
    <Excalidraw
      initialData={{
        elements: elementsRef.current,
        appState: {
          viewBackgroundColor: "#0a0a14",
          theme: "dark",
          zenModeEnabled: false,
          viewModeEnabled: false,
          gridSize: 0,
        },
        scrollToContent: true,
      }}
      theme="dark"
    />
  );
}
