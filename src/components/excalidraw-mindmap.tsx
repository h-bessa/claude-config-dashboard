"use client";

import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface ConfigData {
  skills: string[];
  agents: string[];
  plugins: string[];
  hooks: string[];
  permissions: { allow: number; deny: number };
  mcpServers: string[];
}

function buildSkeleton(data: ConfigData) {
  const elements: any[] = [];

  // Center
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
    label: { text: "Claude Code Config", fontSize: 18, strokeColor: "#ffffff" },
  });

  const branches = [
    { label: `Skills (${data.skills.length})`, color: "#f59e0b", bg: "#3d2800", items: data.skills, x: -450, y: -280 },
    { label: `Agents (${data.agents.length})`, color: "#8b5cf6", bg: "#2d1b69", items: data.agents, x: 280, y: -280 },
    { label: `Plugins (${data.plugins.length})`, color: "#10b981", bg: "#0a3d2c", items: data.plugins, x: -450, y: 120 },
    { label: `Hooks (${data.hooks.length})`, color: "#3b82f6", bg: "#1a2a4d", items: data.hooks, x: 280, y: 120 },
    { label: `MCP (${data.mcpServers.length})`, color: "#06b6d4", bg: "#0a3040", items: data.mcpServers, x: -80, y: 250 },
    { label: `Perms (${data.permissions.allow + data.permissions.deny})`, color: "#ec4899", bg: "#4d1a33", items: [`${data.permissions.allow} allow`, `${data.permissions.deny} deny`], x: -80, y: -380 },
  ];

  branches.forEach((b) => {
    elements.push({
      type: "rectangle",
      x: b.x, y: b.y, width: 180, height: 40,
      backgroundColor: b.bg, strokeColor: b.color,
      strokeWidth: 1.5, fillStyle: "solid", roughness: 0,
      label: { text: b.label, fontSize: 14, strokeColor: b.color },
    });

    elements.push({
      type: "line",
      x: 0, y: 0,
      strokeColor: b.color, strokeWidth: 2, roughness: 0, opacity: 50,
      points: [[0, 0], [b.x + 90, b.y + 20]],
    });

    const isLeft = b.x < 0;
    b.items.slice(0, 8).forEach((item, i) => {
      const ix = isLeft ? b.x - 170 : b.x + 200;
      const iy = b.y - 10 + i * 32;
      elements.push({
        type: "rectangle",
        x: ix, y: iy, width: 150, height: 26,
        backgroundColor: "#141425", strokeColor: b.color + "77",
        strokeWidth: 1, fillStyle: "solid", roughness: 0,
        label: { text: item, fontSize: 10, strokeColor: b.color },
      });
      elements.push({
        type: "line",
        x: isLeft ? b.x : b.x + 180, y: b.y + 20,
        strokeColor: b.color + "33", strokeWidth: 1, roughness: 0, opacity: 30,
        points: [[0, 0], [isLeft ? ix + 150 - b.x : ix - (b.x + 180), iy + 13 - (b.y + 20)]],
      });
    });

    if (b.items.length > 8) {
      elements.push({
        type: "text",
        x: (isLeft ? b.x - 150 : b.x + 220), y: b.y - 10 + 8 * 32 + 5,
        text: `+${b.items.length - 8} more...`, fontSize: 10, strokeColor: "#666",
      });
    }
  });

  return elements;
}

export function ExcalidrawMindmap({ data }: { data: ConfigData }) {
  const [api, setApi] = useState<any>(null);
  const hasLoadedRef = useRef(false);

  const onApiReady = useCallback((excalidrawApi: any) => {
    setApi(excalidrawApi);
  }, []);

  useEffect(() => {
    if (!api || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const skeleton = buildSkeleton(data);
    const elements = convertToExcalidrawElements(skeleton);
    api.updateScene({ elements });

    requestAnimationFrame(() => {
      setTimeout(() => {
        const sceneElements = api.getSceneElements();
        if (sceneElements.length > 0) {
          api.scrollToContent(sceneElements, {
            fitToViewport: true,
            viewportZoomFactor: 0.85,
          });
        }
      }, 500);
    });
  }, [api, data]);

  return (
    <div
      className="excalidraw-wrapper"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Excalidraw
        excalidrawAPI={onApiReady}
        initialData={{
          appState: {
            viewBackgroundColor: "#0a0a14",
            theme: "dark",
            zenModeEnabled: true,
          },
        }}
        theme="dark"
      />
    </div>
  );
}
