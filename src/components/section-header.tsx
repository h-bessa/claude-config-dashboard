interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function SectionHeader({ title, description, badge }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {badge && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
