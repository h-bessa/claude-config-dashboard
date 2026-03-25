import { SectionHeader } from "@/components/section-header";
import { Server, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mcpServers = [
  {
    name: "Context7",
    plugin: "context7@claude-plugins-official",
    description: "Up-to-date documentation and code examples for any library",
    tools: ["resolve-library-id", "query-docs"],
  },
  {
    name: "Playwright",
    plugin: "playwright@claude-plugins-official",
    description: "Browser automation — navigate, click, fill forms, take screenshots",
    tools: [
      "browser_navigate", "browser_snapshot", "browser_click", "browser_fill_form",
      "browser_type", "browser_press_key", "browser_hover", "browser_drag",
      "browser_take_screenshot", "browser_evaluate", "browser_console_messages",
      "browser_network_requests", "browser_tabs", "browser_close",
      "browser_wait_for", "browser_file_upload", "browser_handle_dialog",
      "browser_select_option", "browser_navigate_back", "browser_resize",
      "browser_run_code", "browser_install",
    ],
  },
  {
    name: "Canva",
    plugin: "N/A (claude.ai built-in)",
    description: "Design generation, editing, export, and asset management in Canva",
    tools: [
      "generate-design", "generate-design-structured", "export-design",
      "create-design-from-candidate", "get-design", "get-design-content",
      "get-design-pages", "get-design-thumbnail", "search-designs",
      "start-editing-transaction", "perform-editing-operations", "commit-editing-transaction",
      "cancel-editing-transaction", "comment-on-design", "list-comments",
      "list-replies", "reply-to-comment", "upload-asset-from-url",
      "get-assets", "create-folder", "search-folders", "list-folder-items",
      "move-item-to-folder", "resize-design", "import-design-from-url",
      "resolve-shortlink", "list-brand-kits", "get-export-formats",
      "get-presenter-notes", "request-outline-review",
    ],
  },
  {
    name: "Atlassian",
    plugin: "atlassian@claude-plugins-official",
    description: "Jira issue search and Confluence page management",
    tools: ["searchJiraIssuesUsingJql", "getConfluencePage", "createConfluencePage"],
  },
];

export default function McpPage() {
  return (
    <>
      <SectionHeader
        title="MCP Servers"
        description="Model Context Protocol servers providing external tool access"
        badge={`${mcpServers.length} servers`}
      />

      <div className="space-y-4">
        {mcpServers.map((server) => (
          <div key={server.name} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <Server className="h-4.5 w-4.5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{server.name}</h2>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {server.plugin}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-white/5 font-mono text-[10px] ring-1 ring-white/10">
                {server.tools.length} tools
              </Badge>
            </div>
            <div className="px-5 py-3">
              <p className="mb-3 text-xs text-muted-foreground">{server.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {server.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground ring-1 ring-white/[0.06]"
                  >
                    <Wrench className="h-2.5 w-2.5" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
