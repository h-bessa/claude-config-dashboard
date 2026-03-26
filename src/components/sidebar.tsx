"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Bot,
  Plug,
  Webhook,
  Shield,
  Terminal,
  Map,
  Server,
  LayoutDashboard,
  Orbit,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/mindmap", label: "Mindmap", icon: Map },
  { href: "/mindmap3d", label: "Mindmap 3D", icon: Orbit },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/plugins", label: "Plugins", icon: Plug },
  { href: "/hooks", label: "Hooks", icon: Webhook },
  { href: "/permissions", label: "Permissions", icon: Shield },
  { href: "/scripts", label: "Scripts", icon: Terminal },
  { href: "/mcp", label: "MCP Servers", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-0 flex h-screen w-[240px] min-w-[240px] flex-col border-r border-white/[0.06]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Terminal className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-gradient">
              Claude Config
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground">
              h-bessa
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-sm shadow-white/5"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-muted-foreground group-hover:text-white/70"
                }`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] px-4 py-3">
        <p className="font-mono text-[10px] text-muted-foreground/60">
          Live from GitHub ·{" "}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50" />{" "}
          ISR 5min
        </p>
      </div>
    </aside>
  );
}
