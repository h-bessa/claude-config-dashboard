"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Loading mindmap...</div> }
);

interface ConfigData {
  skills: string[];
  agents: string[];
  plugins: string[];
  hooks: string[];
  permissions: { allow: number; deny: number };
  mcpServers: string[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createNode(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  options: {
    bgColor?: string;
    strokeColor?: string;
    fontSize?: number;
    roundness?: number;
  } = {}
) {
  const rectId = generateId();
  const textId = generateId();

  const rect = {
    id: rectId,
    type: "rectangle" as const,
    x,
    y,
    width,
    height,
    strokeColor: options.strokeColor || "#555",
    backgroundColor: options.bgColor || "#1e1e1e",
    fillStyle: "solid" as const,
    strokeWidth: 1,
    roughness: 0,
    opacity: 100,
    roundness: { type: 3, value: options.roundness ?? 12 },
    boundElements: [{ type: "text" as const, id: textId }],
    groupIds: [],
    frameId: null,
    isDeleted: false,
    locked: false,
    link: null,
    updated: Date.now(),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    seed: Math.floor(Math.random() * 1000000),
    angle: 0,
  };

  const textEl = {
    id: textId,
    type: "text" as const,
    x: x + width / 2,
    y: y + height / 2,
    width: width - 16,
    height: options.fontSize ? options.fontSize * 1.4 : 20,
    text,
    fontSize: options.fontSize || 14,
    fontFamily: 3, // monospace
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
    strokeColor: options.strokeColor || "#e8e8e8",
    backgroundColor: "transparent",
    fillStyle: "solid" as const,
    strokeWidth: 1,
    roughness: 0,
    opacity: 100,
    roundness: null,
    containerId: rectId,
    originalText: text,
    autoResize: true,
    lineHeight: 1.25,
    boundElements: [],
    groupIds: [],
    frameId: null,
    isDeleted: false,
    locked: false,
    link: null,
    updated: Date.now(),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    seed: Math.floor(Math.random() * 1000000),
    angle: 0,
  };

  return { rect, text: textEl, id: rectId };
}

function createArrow(
  startId: string,
  endId: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = "#555"
) {
  const id = generateId();
  return {
    id,
    type: "arrow" as const,
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
    strokeColor: color,
    backgroundColor: "transparent",
    fillStyle: "solid" as const,
    strokeWidth: 1,
    roughness: 0,
    opacity: 60,
    roundness: { type: 2 },
    points: [[0, 0], [endX - startX, endY - startY]] as [number, number][],
    startBinding: { elementId: startId, focus: 0, gap: 4, fixedPoint: null },
    endBinding: { elementId: endId, focus: 0, gap: 4, fixedPoint: null },
    startArrowhead: null,
    endArrowhead: "arrow" as const,
    boundElements: [],
    groupIds: [],
    frameId: null,
    isDeleted: false,
    locked: false,
    link: null,
    updated: Date.now(),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    seed: Math.floor(Math.random() * 1000000),
    angle: 0,
    elbowed: false,
  };
}

export function ExcalidrawMindmap({ data }: { data: ConfigData }) {
  const { elements } = useMemo(() => {
    const els: any[] = [];

    // Center node
    const center = createNode(-100, -30, 250, 60, "Claude Code Config", {
      bgColor: "#d97706",
      strokeColor: "#fbbf24",
      fontSize: 18,
      roundness: 16,
    });
    els.push(center.rect, center.text);

    const branches = [
      { label: `Skills (${data.skills.length})`, color: "#f59e0b", items: data.skills, x: -500, y: -350 },
      { label: `Agents (${data.agents.length})`, color: "#8b5cf6", items: data.agents, x: 350, y: -350 },
      { label: `Plugins (${data.plugins.length})`, color: "#10b981", items: data.plugins, x: -500, y: 150 },
      { label: `Hooks (${data.hooks.length})`, color: "#3b82f6", items: data.hooks, x: 350, y: 150 },
      { label: `MCP (${data.mcpServers.length})`, color: "#06b6d4", items: data.mcpServers, x: 0, y: 300 },
      { label: `Perms (${data.permissions.allow + data.permissions.deny})`, color: "#ec4899", items: [`${data.permissions.allow} allow`, `${data.permissions.deny} deny`], x: 0, y: -400 },
    ];

    branches.forEach((branch) => {
      const branchNode = createNode(branch.x, branch.y, 200, 44, branch.label, {
        bgColor: branch.color + "22",
        strokeColor: branch.color,
        fontSize: 14,
      });
      els.push(branchNode.rect, branchNode.text);

      const arrow = createArrow(
        center.id,
        branchNode.id,
        center.rect.x + center.rect.width / 2,
        center.rect.y + center.rect.height / 2,
        branchNode.rect.x + branchNode.rect.width / 2,
        branchNode.rect.y + branchNode.rect.height / 2,
        branch.color
      );
      els.push(arrow);

      // Sub-items (max 12 for readability)
      const itemsToShow = branch.items.slice(0, 12);
      const columns = Math.ceil(itemsToShow.length / 6);

      itemsToShow.forEach((item, i) => {
        const col = Math.floor(i / 6);
        const row = i % 6;
        const offsetX = branch.x < 0 ? branch.x - 200 - col * 180 : branch.x + 220 + col * 180;
        const offsetY = branch.y - 30 + row * 36;

        const itemNode = createNode(offsetX, offsetY, 160, 28, item, {
          bgColor: "#1a1a2e",
          strokeColor: branch.color + "66",
          fontSize: 10,
          roundness: 6,
        });
        els.push(itemNode.rect, itemNode.text);

        const subArrow = createArrow(
          branchNode.id,
          itemNode.id,
          branchNode.rect.x + branchNode.rect.width / 2,
          branchNode.rect.y + branchNode.rect.height / 2,
          itemNode.rect.x + itemNode.rect.width / 2,
          itemNode.rect.y + itemNode.rect.height / 2,
          branch.color + "44"
        );
        els.push(subArrow);
      });

      if (branch.items.length > 12) {
        const moreNode = createNode(
          branch.x < 0 ? branch.x - 200 : branch.x + 220,
          branch.y - 30 + 12 * 36,
          160,
          28,
          `+${branch.items.length - 12} more...`,
          { bgColor: "#1a1a2e", strokeColor: "#555", fontSize: 10, roundness: 6 }
        );
        els.push(moreNode.rect, moreNode.text);
      }
    });

    return { elements: els };
  }, [data]);

  return (
    <Excalidraw
      initialData={{
        elements,
        appState: {
          viewBackgroundColor: "#0a0a1a",
          theme: "dark",
          gridSize: 20,
          zenModeEnabled: false,
          viewModeEnabled: false,
        },
        scrollToContent: true,
      }}
      theme="dark"
    />
  );
}
