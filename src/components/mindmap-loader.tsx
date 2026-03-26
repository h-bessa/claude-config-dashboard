"use client";

import dynamic from "next/dynamic";

const ExcalidrawMindmap = dynamic(
  () =>
    import("@/components/excalidraw-mindmap").then(
      (mod) => mod.ExcalidrawMindmap
    ),
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

export function MindmapLoader({ data }: { data: ConfigData }) {
  return <ExcalidrawMindmap data={data} />;
}
