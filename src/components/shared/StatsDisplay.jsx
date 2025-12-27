export default function StatsDisplay({ stats, expectedValue, currency = "$" }) {
    const formatValue = (val) => {
        if (val === null || val === undefined) return "—";
        return `${currency}${val.toFixed(2)}`;
    };

    return (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
                <div className="text-sm text-foreground/60">Mean</div>
                <div className="text-lg font-semibold text-accent">{formatValue(stats.mean)}</div>
            </div>
            <div>
                <div className="text-sm text-foreground/60">Median</div>
                <div className="text-lg font-semibold">{formatValue(stats.median)}</div>
            </div>
            <div>
                <div className="text-sm text-foreground/60">Min</div>
                <div className="text-lg font-semibold">{formatValue(stats.min)}</div>
            </div>
            <div>
                <div className="text-sm text-foreground/60">Max</div>
                <div className="text-lg font-semibold">{formatValue(stats.max)}</div>
            </div>
            <div>
                <div className="text-sm text-foreground/60">Expected Value</div>
                <div className="text-lg font-semibold text-accent">
                    {expectedValue === Infinity ? "∞" : formatValue(expectedValue)}
                </div>
            </div>
        </div>
    );
}
