import { SectionHeader } from "@/components/section-header";
import { MarkdownView } from "@/components/markdown-view";

export const revalidate = 300;

const REPO = "h-bessa/claude-config";

async function fetchClaudeMd(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return "_No GITHUB_TOKEN configured_";

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/CLAUDE.md`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return "_Could not fetch CLAUDE.md_";
  const data = await res.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}

export default async function ClaudeMdPage() {
  const content = await fetchClaudeMd();

  return (
    <>
      <SectionHeader
        title="CLAUDE.md"
        description="Personal instructions loaded at every Claude Code session"
      />
      <MarkdownView content={content} />
    </>
  );
}
