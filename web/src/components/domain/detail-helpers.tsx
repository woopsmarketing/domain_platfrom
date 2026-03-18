export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function MetricBlock({
  title,
  items,
}: {
  title?: string;
  items: { label: string; value: number | null; prefix?: string }[];
}) {
  return (
    <div>
      {title && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      {items.map((item) => (
        <div key={item.label} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium tabular-nums">
            {item.value !== null ? `${item.prefix ?? ""}${item.value.toLocaleString()}` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
