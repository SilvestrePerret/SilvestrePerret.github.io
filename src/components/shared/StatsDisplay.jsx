export default function StatsDisplay({ stats, expectedValue, currency = "$" }) {
    const formatValue = (val) => {
        if (val === null || val === undefined) return "—";
        return `${currency}${val.toFixed(2)}`;
    };

    return (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
                <p className="text-sm text-foreground/60 my-0">Mean</p>
                <p className="text-lg font-semibold text-accent my-0">{formatValue(stats.mean)}</p>
            </div>
            <div>
                <p className="text-sm text-foreground/60 my-0">Median</p>
                <p className="text-lg font-semibold my-0">{formatValue(stats.median)}</p>
            </div>
            <div>
                <p className="text-sm text-foreground/60 my-0">Min</p>
                <p className="text-lg font-semibold my-0">{formatValue(stats.min)}</p>
            </div>
            <div>
                <p className="text-sm text-foreground/60 my-0">Max</p>
                <p className="text-lg font-semibold my-0">{formatValue(stats.max)}</p>
            </div>
            <div>
                <p className="text-sm text-foreground/60 my-0">Expected Value</p>
                <p className="text-lg font-semibold text-accent my-0">
                    {expectedValue === Infinity ? "∞" : formatValue(expectedValue)}
                </p>
            </div>
        </div>
    );
}
