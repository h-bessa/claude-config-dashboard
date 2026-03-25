"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ExcalidrawWithConvert = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
      convert: mod.convertToExcalidrawElements,
    })),
  { ssr: false }
);

// We need to wrap because dynamic import returns a component, not the convert function
// So we'll import them separately inside the client component
const ExcalidrawComp = dynamic(
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

function buildSkeletonElements(data: ConfigData) {
  const elements: any[] = [];

  // Center node
  elements.push({
    type: "rectangle",
    x: -140,
    y: -30,
    width: 280,
    height: 60,
    backgroundColor: "#d97706",
    strokeColor: "#fbbf24",
    strokeWidth: 2,
    fillStyle: "solid",
    roughness: 0,
    label: {
      text: "Claude Code Config",
      fontSize: 20,
      strokeColor: "#fff",
    },
  });

  const branches = [
    {
      label: `Skills (${data.skills.length})`,
      color: "#f59e0b",
      bg: "#3d2800",
      items: data.skills,
      x: -520,
      y: -320,
    },
    {
      label: `Agents (${data.agents.length})`,
      color: "#8b5cf6",
      bg: "#2d1b69",
      items: data.agents,
      x: 320,
      y: -320,
    },
    {
      label: `Plugins (${data.plugins.length})`,
      color: "#10b981",
      bg: "#0a3d2c",
      items: data.plugins,
      x: -520,
      y: 120,
    },
    {
      label: `Hooks (${data.hooks.length})`,
      color: "#3b82f6",
      bg: "#1a2a4d",
      items: data.hooks,
      x: 320,
      y: 120,
    },
    {
      label: `MCP Servers (${data.mcpServers.length})`,
      color: "#06b6d4",
      bg: "#0a3040",
      items: data.mcpServers,
      x: -100,
      y: 280,
    },
    {
      label: `Permissions (${data.permissions.allow + data.permissions.deny})`,
      color: "#ec4899",
      bg: "#4d1a33",
      items: [`${data.permissions.allow} allow`, `${data.permissions.deny} deny`],
      x: -100,
      y: -420,
    },
  ];

  branches.forEach((branch) => {
    const bw = 200;
    const bh = 44;

    // Branch node
    elements.push({
      type: "rectangle",
      x: branch.x,
      y: branch.y,
      width: bw,
      height: bh,
      backgroundColor: branch.bg,
      strokeColor: branch.color,
      strokeWidth: 1.5,
      fillStyle: "solid",
      roughness: 0,
      label: {
        text: branch.label,
        fontSize: 15,
        strokeColor: branch.color,
      },
    });

    // Arrow from center to branch
    elements.push({
      type: "arrow",
      x: 0,
      y: 0,
      width: branch.x + bw / 2,
      height: branch.y + bh / 2,
      strokeColor: branch.color,
      strokeWidth: 1.5,
      roughness: 0,
      opacity: 60,
      points: [
        [0, 0],
        [branch.x + bw / 2, branch.y + bh / 2],
      ],
      startArrowhead: null,
      endArrowhead: "arrow",
    });

    // Sub-items
    const items = branch.items.slice(0, 10);
    const isLeft = branch.x < 0;

    items.forEach((item, i) => {
      const cols = Math.ceil(items.length / 6);
      const col = Math.floor(i / 6);
      const row = i % 6;
      const iw = 155;
      const ih = 28;
      const ix = isLeft
        ? branch.x - 180 - col * 175
        : branch.x + bw + 20 + col * 175;
      const iy = branch.y - 20 + row * 36;

      elements.push({
        type: "rectangle",
        x: ix,
        y: iy,
        width: iw,
        height: ih,
        backgroundColor: "#141425",
        strokeColor: branch.color + "88",
        strokeWidth: 1,
        fillStyle: "solid",
        roughness: 0,
        label: {
          text: item,
          fontSize: 11,
          strokeColor: branch.color,
        },
      });

      // Arrow from branch to item
      elements.push({
        type: "arrow",
        x: isLeft ? branch.x : branch.x + bw,
        y: branch.y + bh / 2,
        width: isLeft ? ix + iw - branch.x : ix - (branch.x + bw),
        height: iy + ih / 2 - (branch.y + bh / 2),
        strokeColor: branch.color + "44",
        strokeWidth: 1,
        roughness: 0,
        opacity: 40,
        points: [
          [0, 0],
          [
            isLeft ? ix + iw - branch.x : ix - (branch.x + bw),
            iy + ih / 2 - (branch.y + bh / 2),
          ],
        ],
        startArrowhead: null,
        endArrowhead: "arrow",
      });
    });

    // "+N more" node
    if (branch.items.length > 10) {
      const row = Math.min(items.length, 6);
      const ix = isLeft ? branch.x - 180 : branch.x + bw + 20;
      const iy = branch.y - 20 + row * 36;
      elements.push({
        type: "rectangle",
        x: ix,
        y: iy,
        width: 155,
        height: 28,
        backgroundColor: "#141425",
        strokeColor: "#555",
        strokeWidth: 1,
        fillStyle: "solid",
        roughness: 0,
        label: {
          text: `+${branch.items.length - 10} more...`,
          fontSize: 11,
          strokeColor: "#666",
        },
      });
    }
  });

  return elements;
}

export function ExcalidrawMindmap({ data }: { data: ConfigData }) {
  const [elements, setElements] = useState<any[] | null>(null);

  useEffect(() => {
    // Import convertToExcalidrawElements dynamically on the client
    import("@excalidraw/excalidraw").then((mod) => {
      const skeleton = buildSkeletonElements(data);
      const converted = mod.convertToExcalidrawElements(skeleton);
      setElements(converted);
    });
  }, [data]);

  if (!elements) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading mindmap...
      </div>
    );
  }

  return (
    <div className="excalidraw-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
      <ExcalidrawComp
        initialData={{
          elements,
          appState: {
            viewBackgroundColor: "#0a0a14",
            theme: "dark",
            zenModeEnabled: true,
            viewModeEnabled: false,
          },
          scrollToContent: true,
        }}
        theme="dark"
      />
    </div>
  );
}
