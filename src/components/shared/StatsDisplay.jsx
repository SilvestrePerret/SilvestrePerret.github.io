export default function StatsDisplay({ stats, expectedValue, currency = "$" }) {
  const formatValue = val => {
    if (val === null || val === undefined) return "—";
    return `${currency}${val.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-5">
      <div>
        <p className="my-0 text-sm text-foreground/60">Mean</p>
        <p className="my-0 text-lg font-semibold text-accent">
          {formatValue(stats.mean)}
        </p>
      </div>
      <div>
        <p className="my-0 text-sm text-foreground/60">Median</p>
        <p className="my-0 text-lg font-semibold">
          {formatValue(stats.median)}
        </p>
      </div>
      <div>
        <p className="my-0 text-sm text-foreground/60">Min</p>
        <p className="my-0 text-lg font-semibold">{formatValue(stats.min)}</p>
      </div>
      <div>
        <p className="my-0 text-sm text-foreground/60">Max</p>
        <p className="my-0 text-lg font-semibold">{formatValue(stats.max)}</p>
      </div>
      <div>
        <p className="my-0 text-sm text-foreground/60">Expected Value</p>
        <p className="my-0 text-lg font-semibold text-accent">
          {expectedValue === Infinity ? "∞" : formatValue(expectedValue)}
        </p>
      </div>
    </div>
  );
}
