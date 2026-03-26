"use client";

import dynamic from "next/dynamic";

const NeuralGraph = dynamic(
  () => import("@/components/neural-graph").then((mod) => mod.NeuralGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Initializing neural map...
      </div>
    ),
  }
);

export function Graph3DLoader({ data }: { data: any }) {
  return <NeuralGraph data={data} />;
}
