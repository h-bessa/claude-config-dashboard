"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Code } from "lucide-react";

export function MarkdownView({ content }: { content: string }) {
  const [mode, setMode] = useState<"rendered" | "raw">("rendered");

  return (
    <div>
      {/* Toggle */}
      <div className="mb-4 inline-flex items-center rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
        <button
          onClick={() => setMode("rendered")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "rendered"
              ? "bg-white/[0.1] text-white shadow-sm"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={() => setMode("raw")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "raw"
              ? "bg-white/[0.1] text-white shadow-sm"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          Source
        </button>
      </div>

      {/* Content */}
      <div className="glass-card p-8">
        {mode === "rendered" ? (
          <article className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-xl prose-h1:text-gradient prose-h2:text-base prose-h2:text-amber-400 prose-h2:border-b prose-h2:border-white/[0.06] prose-h2:pb-2 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-white prose-code:text-amber-400 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/[0.06] prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-hr:border-white/[0.06]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : (
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted-foreground">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
