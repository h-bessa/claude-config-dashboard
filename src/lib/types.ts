export interface Skill {
  name: string;
  type: "dir" | "symlink";
  description?: string;
  model?: string;
  argumentHint?: string;
  allowedTools?: string;
  content?: string;
}

export interface Agent {
  name: string;
  content: string;
}

export interface Hook {
  matcher: string;
  hooks: Array<{ type: string; command: string }>;
}

export interface HooksConfig {
  PreToolUse?: Hook[];
  PostToolUse?: Hook[];
  Stop?: Hook[];
  Notification?: Hook[];
  UserPromptSubmit?: Hook[];
}

export interface Plugin {
  id: string;
  name: string;
  marketplace: string;
  enabled: boolean;
}

export interface Permission {
  type: "allow" | "deny";
  pattern: string;
}

export interface McpServer {
  name: string;
  tools: string[];
}

export interface ConfigOverview {
  skillsCount: number;
  agentsCount: number;
  pluginsCount: number;
  hooksCount: number;
  scriptsCount: number;
  mcpServersCount: number;
  permissionsAllow: number;
  permissionsDeny: number;
}
