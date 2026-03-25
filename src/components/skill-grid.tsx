"use client";

import { useState } from "react";
import { Search, Zap, Link2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SkillData {
  name: string;
  type: string;
  description: string;
  model: string;
  argumentHint: string;
  allowedTools: string;
  body: string;
  content: string;
}

export function SkillGrid({ skills }: { skills: SkillData[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SkillData | null>(null);

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories: Record<string, SkillData[]> = {};
  filtered.forEach((skill) => {
    const prefix = skill.name.split("-")[0];
    const cat =
      prefix === "workflow"
        ? "Workflows"
        : prefix === "utils"
        ? "Utilities"
        : prefix === "git"
        ? "Git"
        : prefix === "meta"
        ? "Meta"
        : prefix === "vercel"
        ? "Vercel"
        : "Custom";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  });

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-subtle pl-10"
        />
      </div>

      {Object.entries(categories)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, catSkills]) => (
          <div key={category} className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {category}
              <span className="ml-1 text-muted-foreground/50">
                ({catSkills.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catSkills.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => setSelected(skill)}
                  className="glass-card cursor-pointer p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {skill.type === "symlink" ? (
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      ) : (
                        <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      )}
                      <h3 className="font-mono text-sm font-semibold">
                        /{skill.name}
                      </h3>
                    </div>
                    {skill.model && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-violet-500/10 text-[10px] text-violet-400 ring-1 ring-violet-500/20"
                      >
                        {skill.model}
                      </Badge>
                    )}
                  </div>
                  {skill.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  )}
                  {skill.argumentHint && (
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground/60 truncate">
                      {skill.argumentHint}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg">
              /{selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                {selected.description && (
                  <p className="text-sm text-muted-foreground">
                    {selected.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {selected.model && (
                    <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                      model: {selected.model}
                    </Badge>
                  )}
                  {selected.type === "symlink" && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                      symlink
                    </Badge>
                  )}
                </div>
                {selected.argumentHint && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Usage</p>
                    <code className="block rounded-lg bg-black/30 p-3 font-mono text-xs text-amber-400">
                      /{selected.name} {selected.argumentHint}
                    </code>
                  </div>
                )}
                {selected.allowedTools && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Allowed Tools</p>
                    <code className="block rounded-lg bg-black/30 p-3 font-mono text-xs text-emerald-400">
                      {selected.allowedTools}
                    </code>
                  </div>
                )}
                {selected.content && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">SKILL.md Content</p>
                    <pre className="max-h-80 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                      {selected.content}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
