export default function Histogram({ data, title, xLabel = "Reward ($)", yLabel = "Frequency (%)" }) {
    if (!data || !data.bins || data.bins.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/20">
                <p className="text-foreground/60">No data to display. Play some games!</p>
            </div>
        );
    }

    const maxPercentage = Math.max(...data.percentages, 1);

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
            {title && <h3 className="mb-4 text-center text-lg font-semibold">{title}</h3>}

            <div className="relative h-64">
                {/* Y-axis label */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-foreground/60">
                    {yLabel}
                </div>

                {/* Bars */}
                <div className="flex h-full items-end justify-around gap-1 pl-8 pr-2">
                    {data.bins.map((bin, i) => {
                        const percentage = data.percentages[i];
                        const count = data.counts[i];
                        // Calculate height in pixels instead of percentage
                        const maxHeight = 240; // ~h-64 = 16rem = 256px, minus some padding
                        const heightPx = count > 0
                            ? Math.max((percentage / maxPercentage) * maxHeight, 4)
                            : 0;

                        // Create range label for tooltip
                        const nextBin = i < data.bins.length - 1 ? data.bins[i + 1] : null;
                        const rangeLabel = nextBin
                            ? `[$${bin}-$${nextBin}[`
                            : `[$${bin}+∞[`;

                        return (
                            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                                {/* Bar */}
                                <div
                                    className="w-full bg-accent transition-all duration-300 hover:opacity-80 rounded-t"
                                    style={{ height: `${heightPx}px` }}
                                    title={`${rangeLabel}: ${count} games (${percentage.toFixed(1)}%)`}
                                >
                                    {/* Tooltip on hover */}
                                    {count > 0 && (
                                        <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                                            <div className="font-semibold">{rangeLabel}</div>
                                            <div>{count} games ({percentage.toFixed(1)}%)</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* X-axis labels */}
            <div className="mt-2 flex justify-around pl-8 pr-2">
                {data.bins.map((bin, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-foreground/60">
                        {bin >= 1000 ? `${(bin / 1000).toFixed(0)}k+` : `$${bin}`}
                    </div>
                ))}
            </div>

            {/* X-axis label */}
            <div className="mt-1 text-center text-xs text-foreground/60">{xLabel}</div>
        </div>
    );
}
