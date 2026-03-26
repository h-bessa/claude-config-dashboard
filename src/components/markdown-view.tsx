"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="glass-card p-8">
      <article className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-xl prose-h1:text-gradient prose-h2:text-base prose-h2:text-amber-400 prose-h2:border-b prose-h2:border-white/[0.06] prose-h2:pb-2 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-white prose-code:text-amber-400 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/[0.06] prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-hr:border-white/[0.06] prose-table:text-sm prose-th:text-left prose-th:text-muted-foreground prose-td:text-muted-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
