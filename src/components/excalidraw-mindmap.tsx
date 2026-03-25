"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

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

function buildMermaid(data: ConfigData): string {
  const sanitize = (s: string) => s.replace(/[()[\]{}]/g, "").replace(/"/g, "'");

  let mermaid = `mindmap
  root((Claude Code Config))
    Skills ${data.skills.length}
`;
  data.skills.slice(0, 12).forEach((s) => {
    mermaid += `      ${sanitize(s)}\n`;
  });
  if (data.skills.length > 12) {
    mermaid += `      +${data.skills.length - 12} more\n`;
  }

  mermaid += `    Agents ${data.agents.length}\n`;
  data.agents.forEach((a) => {
    mermaid += `      ${sanitize(a)}\n`;
  });

  mermaid += `    Plugins ${data.plugins.length}\n`;
  data.plugins.forEach((p) => {
    mermaid += `      ${sanitize(p)}\n`;
  });

  mermaid += `    Hooks ${data.hooks.length}\n`;
  data.hooks.forEach((h) => {
    mermaid += `      ${sanitize(h)}\n`;
  });

  mermaid += `    MCP Servers ${data.mcpServers.length}\n`;
  data.mcpServers.forEach((m) => {
    mermaid += `      ${sanitize(m)}\n`;
  });

  mermaid += `    Permissions ${data.permissions.allow + data.permissions.deny}\n`;
  mermaid += `      ${data.permissions.allow} allow\n`;
  mermaid += `      ${data.permissions.deny} deny\n`;

  return mermaid;
}

export function ExcalidrawMindmap({ data }: { data: ConfigData }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [api, setApi] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!api) return;

    async function loadMindmap() {
      try {
        const { parseMermaidToExcalidraw } = await import(
          "@excalidraw/mermaid-to-excalidraw"
        );
        const { convertToExcalidrawElements } = await import(
          "@excalidraw/excalidraw"
        );

        const mermaidSyntax = buildMermaid(data);
        const { elements: skeletonElements, files } =
          await parseMermaidToExcalidraw(mermaidSyntax);

        const excalidrawElements =
          convertToExcalidrawElements(skeletonElements);

        api.updateScene({
          elements: excalidrawElements,
        });

        setTimeout(() => {
          api.scrollToContent(api.getSceneElements(), {
            fitToViewport: true,
            viewportZoomFactor: 0.9,
          });
          setLoaded(true);
        }, 300);
      } catch (err) {
        console.error("Failed to parse mermaid:", err);
        setLoaded(true);
      }
    }

    loadMindmap();
  }, [api, data]);

  const onApiReady = useCallback((excalidrawApi: any) => {
    setApi(excalidrawApi);
  }, []);

  return (
    <div
      className="excalidraw-wrapper"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <ExcalidrawComp
        excalidrawAPI={onApiReady}
        initialData={{
          appState: {
            viewBackgroundColor: "#0a0a14",
            theme: "dark",
            zenModeEnabled: true,
            viewModeEnabled: false,
          },
        }}
        theme="dark"
      />
    </div>
  );
}
