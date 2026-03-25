import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: "amber" | "violet" | "emerald" | "blue" | "pink" | "cyan";
}

const colorMap = {
  amber: {
    bg: "from-amber-500/10 to-amber-500/5",
    icon: "text-amber-400",
    ring: "ring-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-500/5",
    icon: "text-violet-400",
    ring: "ring-violet-500/20",
    glow: "shadow-violet-500/10",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-500/5",
    icon: "text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-500/5",
    icon: "text-blue-400",
    ring: "ring-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  pink: {
    bg: "from-pink-500/10 to-pink-500/5",
    icon: "text-pink-400",
    ring: "ring-pink-500/20",
    glow: "shadow-pink-500/10",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-500/5",
    icon: "text-cyan-400",
    ring: "ring-cyan-500/20",
    glow: "shadow-cyan-500/10",
  },
};

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card group relative overflow-hidden p-5`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.bg} ring-1 ${c.ring} shadow-lg ${c.glow}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
