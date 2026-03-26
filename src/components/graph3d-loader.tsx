"use client";

import dynamic from "next/dynamic";

const Graph3D = dynamic(
  () => import("@/components/graph3d").then((mod) => mod.Graph3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Initializing 3D universe...
      </div>
    ),
  }
);

export function Graph3DLoader({ data }: { data: any }) {
  return <Graph3D data={data} />;
}
