import { fetchSettings } from "@/lib/github";
import { SectionHeader } from "@/components/section-header";
import { Plug, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PluginsPage() {
  const settings = await fetchSettings();
  const plugins = Object.entries(settings.enabledPlugins || {}).map(
    ([id, enabled]) => {
      const [name, marketplace] = id.split("@");
      return { id, name, marketplace, enabled: !!enabled };
    }
  );

  const byMarketplace: Record<string, typeof plugins> = {};
  plugins.forEach((p) => {
    if (!byMarketplace[p.marketplace]) byMarketplace[p.marketplace] = [];
    byMarketplace[p.marketplace].push(p);
  });

  return (
    <>
      <SectionHeader
        title="Plugins"
        description="Installed marketplace plugins and extensions"
        badge={`${plugins.length}`}
      />

      {Object.entries(byMarketplace).map(([marketplace, items]) => (
        <div key={marketplace} className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            {marketplace}
            <span className="text-muted-foreground/50">({items.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((plugin) => (
              <div key={plugin.id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                      <Plug className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{plugin.name}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        @{plugin.marketplace}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      plugin.enabled
                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                        : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                    }
                  >
                    {plugin.enabled ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" /> Enabled
                      </span>
                    ) : (
                      "Disabled"
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
