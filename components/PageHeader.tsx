export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 pb-5">
      <div className="min-w-0">
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-mpneutral-400">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-base text-mpneutral-300">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
