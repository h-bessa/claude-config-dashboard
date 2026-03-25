const REPO = "h-bessa/claude-config";
const GITHUB_API = "https://api.github.com";

async function fetchGitHub(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(`[github] No GITHUB_TOKEN set — skipping fetch for ${path}`);
    return null;
  }
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 300 }, // ISR 5 min
  });
  if (!res.ok) {
    console.warn(`[github] API error ${res.status} for ${path}`);
    return null;
  }
  return res.json();
}

function decodeContent(content: string): string {
  return Buffer.from(content, "base64").toString("utf-8");
}

export async function fetchSettings(): Promise<Record<string, any>> {
  const data = await fetchGitHub("settings.json");
  if (!data) return {};
  return JSON.parse(decodeContent(data.content));
}

export async function fetchSettingsLocal(): Promise<Record<string, any>> {
  const data = await fetchGitHub("settings.local.json");
  if (!data) return {};
  return JSON.parse(decodeContent(data.content));
}

export async function fetchSkillsList(): Promise<Array<{ name: string; type: string; path: string }>> {
  const items = await fetchGitHub("skills");
  if (!items || !Array.isArray(items)) return [];
  return items
    .filter((item: any) => item.type === "dir" || item.type === "symlink")
    .map((item: any) => ({ name: item.name, type: item.type, path: item.path }));
}

export async function fetchSkillContent(skillName: string): Promise<string> {
  try {
    const data = await fetchGitHub(`skills/${skillName}/SKILL.md`);
    return decodeContent(data.content);
  } catch {
    return "";
  }
}

export async function fetchAgentsList(): Promise<Array<{ name: string; content: string }>> {
  const items = await fetchGitHub("agents");
  if (!items || !Array.isArray(items)) return [];
  const agents = await Promise.all(
    items
      .filter((item: any) => item.name.endsWith(".md"))
      .map(async (item: any) => {
        const data = await fetchGitHub(`agents/${item.name}`);
        return { name: item.name.replace(".md", ""), content: data ? decodeContent(data.content) : "" };
      })
  );
  return agents;
}

export async function fetchHooksList(): Promise<Array<{ name: string; type: string }>> {
  const items = await fetchGitHub("hooks");
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => ({ name: item.name, type: item.type }));
}

export async function fetchHookContent(hookName: string): Promise<string> {
  try {
    const data = await fetchGitHub(`hooks/${hookName}`);
    return decodeContent(data.content);
  } catch {
    return "";
  }
}

export async function fetchScriptsList(): Promise<Array<{ name: string; type: string }>> {
  const items = await fetchGitHub("scripts");
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => ({ name: item.name, type: item.type }));
}

export async function fetchCommandsList(): Promise<Array<{ name: string; type: string }>> {
  const items = await fetchGitHub("commands");
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => ({ name: item.name, type: item.type }));
}

export async function fetchCommandContent(cmdName: string): Promise<string> {
  try {
    const data = await fetchGitHub(`commands/${cmdName}`);
    return decodeContent(data.content);
  } catch {
    return "";
  }
}
