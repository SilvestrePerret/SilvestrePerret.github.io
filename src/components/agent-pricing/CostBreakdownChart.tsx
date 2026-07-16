import { useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  OPERATIONS,
  OPERATION_META,
  formatTokens,
  formatUsd,
  type LlmCall,
  type Operation,
  type SimulationResult,
} from "./simulation";

interface CostBreakdownChartProps {
  result: SimulationResult;
}

type ChartName = "calls" | "cumulative";
const WIDTH = 800;
const HEIGHT = 260;
const MARGIN = { top: 28, right: 64, bottom: 42, left: 58 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const TOOLTIP_GAP = 12;
const emptyOperationRecord = (): Record<Operation, number> => ({
  cachedInput: 0,
  cacheWrite: 0,
  uncachedInput: 0,
  output: 0,
});

function Tooltip({
  call,
  cumulativeCost,
}: {
  call: LlmCall;
  cumulativeCost: number;
}) {
  const promptTokens =
    call.tokens.cachedInput +
    call.tokens.cacheWrite +
    call.tokens.uncachedInput;
  return (
    <div className="grid gap-2 text-xs">
      <div>
        <p className="font-semibold">
          Call {call.index}: {call.label}
        </p>
        <p className="text-foreground/65">Turn {call.turn}</p>
      </div>
      <dl className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-foreground tabular-nums [&_dd]:text-foreground [&_dt]:text-foreground">
        <dt className="font-medium">Operation</dt>
        <dd className="font-medium">Tokens</dd>
        <dd className="font-medium">Cost</dd>
        {OPERATIONS.map(operation => (
          <div className="contents" key={operation}>
            <dt>{OPERATION_META[operation].label}</dt>
            <dd className="text-right">
              {formatTokens(call.tokens[operation])}
            </dd>
            <dd className="text-right">{formatUsd(call.cost[operation])}</dd>
          </div>
        ))}
        {call.outputBreakdown.reasoning > 0 && (
          <div className="contents text-foreground/65">
            <dt className="pl-2">Reasoning</dt>
            <dd className="text-right">
              {formatTokens(call.outputBreakdown.reasoning)}
            </dd>
            <dd />
          </div>
        )}
        {call.outputBreakdown.toolRequest > 0 && (
          <div className="contents text-foreground/65">
            <dt className="pl-2">Tool request</dt>
            <dd className="text-right">
              {formatTokens(call.outputBreakdown.toolRequest)}
            </dd>
            <dd />
          </div>
        )}
        {call.outputBreakdown.finalAnswer > 0 && (
          <div className="contents text-foreground/65">
            <dt className="pl-2">Final answer</dt>
            <dd className="text-right">
              {formatTokens(call.outputBreakdown.finalAnswer)}
            </dd>
            <dd />
          </div>
        )}
      </dl>
      <p className="border-t border-border pt-2 text-foreground/65 tabular-nums">
        Prompt input: {formatTokens(promptTokens)} = cached input + cache write
        + uncached input
      </p>
      <div className="border-t border-border pt-2 tabular-nums">
        <p className="flex justify-between gap-4">
          <span>Call total</span>
          <strong>{formatUsd(call.totalCost)}</strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Cumulative total</span>
          <strong>{formatUsd(cumulativeCost)}</strong>
        </p>
      </div>
    </div>
  );
}

function Axis({ maximum, ticks }: { maximum: number; ticks: number[] }) {
  return ticks.map(fraction => {
    const y = MARGIN.top + PLOT_HEIGHT * (1 - fraction);
    return (
      <g key={fraction}>
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={y}
          y2={y}
          className="stroke-border"
        />
        <text
          x={MARGIN.left - 8}
          y={y + 4}
          textAnchor="end"
          className="fill-current text-[11px]"
        >
          {formatUsd(maximum * fraction)}
        </text>
      </g>
    );
  });
}

function XLabels({ callCount }: { callCount: number }) {
  return (
    <>
      <text
        x={MARGIN.left}
        y={HEIGHT - 12}
        className="fill-current text-[11px]"
      >
        LLM call 1
      </text>
      <text
        x={WIDTH - MARGIN.right}
        y={HEIGHT - 12}
        textAnchor="end"
        className="fill-current text-[11px]"
      >
        Call {callCount}
      </text>
    </>
  );
}

function Legend({
  result,
  total = false,
}: {
  result: SimulationResult;
  total?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
      {OPERATIONS.map(operation => (
        <span key={operation} className="inline-flex items-center gap-1.5">
          {total ? (
            <svg className="h-2 w-4" aria-hidden="true">
              <line
                x1="0"
                x2="16"
                y1="4"
                y2="4"
                className={OPERATION_META[operation].strokeClass}
                strokeWidth="2"
              />
            </svg>
          ) : (
            <span
              className={`size-2.5 ${OPERATION_META[operation].swatchClass}`}
              aria-hidden="true"
            />
          )}
          {OPERATION_META[operation].label}:{" "}
          {formatUsd(result.totalCostByOperation[operation])}
        </span>
      ))}
      {total && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-2 w-4" aria-hidden="true">
            <line
              x1="0"
              x2="16"
              y1="4"
              y2="4"
              className="stroke-foreground"
              strokeWidth="2"
            />
          </svg>
          Total: {formatUsd(result.totalCost)}
        </span>
      )}
    </div>
  );
}

export default function CostBreakdownChart({
  result,
}: CostBreakdownChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<ChartName>("calls");
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Record<ChartName, SVGSVGElement | null>>({
    calls: null,
    cumulative: null,
  });
  const targetRefs = useRef<Record<ChartName, Array<SVGRectElement | null>>>({
    calls: [],
    cumulative: [],
  });
  const maxCallCost = Math.max(
    ...result.calls.map(call => call.totalCost),
    0.000001
  );
  const maxCumulativeCost = Math.max(result.totalCost, 0.000001);
  const slotWidth = PLOT_WIDTH / Math.max(result.calls.length, 1);
  const xForCall = (index: number) =>
    MARGIN.left + slotWidth * index + slotWidth / 2;
  const gap = slotWidth >= 3 ? 1 : 0;
  const barWidth = Math.max(slotWidth - gap, 0.5);
  const cumulativeByCall = useMemo(() => {
    const running = emptyOperationRecord();
    return result.calls.map(call => {
      for (const operation of OPERATIONS) {
        running[operation] += call.cost[operation];
      }
      return { ...running };
    });
  }, [result.calls]);
  const cumulativeOperations = useMemo(
    () =>
      [...OPERATIONS].sort(
        (left, right) =>
          result.totalCostByOperation[left] - result.totalCostByOperation[right]
      ),
    [result.totalCostByOperation]
  );
  const boundaries = useMemo(
    () =>
      cumulativeByCall.map(costs => {
        let total = 0;
        return cumulativeOperations.map(
          operation => (total += costs[operation])
        );
      }),
    [cumulativeByCall, cumulativeOperations]
  );
  const cumulativeTotals = boundaries.map(values => values.at(-1) ?? 0);
  const queryStartIndexes = useMemo(
    () =>
      result.calls.flatMap((call, index) =>
        index === 0 || call.turn !== result.calls[index - 1].turn ? [index] : []
      ),
    [result.calls]
  );
  const pointsForBoundary = (boundaryIndex: number) =>
    boundaries
      .map(
        (values, index) =>
          `${xForCall(index)},${MARGIN.top + PLOT_HEIGHT - (values[boundaryIndex] / maxCumulativeCost) * PLOT_HEIGHT}`
      )
      .join(" ");
  const bandPoints = (boundaryIndex: number) => {
    const upper = pointsForBoundary(boundaryIndex);
    const lower = boundaries
      .map((values, index) => {
        const value = boundaryIndex === 0 ? 0 : values[boundaryIndex - 1];
        return `${xForCall(index)},${MARGIN.top + PLOT_HEIGHT - (value / maxCumulativeCost) * PLOT_HEIGHT}`;
      })
      .reverse()
      .join(" ");
    return `${upper} ${lower}`;
  };
  const hoveredCall = hoveredIndex === null ? null : result.calls[hoveredIndex];

  useLayoutEffect(() => {
    if (hoveredIndex === null) return;
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    const target = targetRefs.current[hoveredChart][hoveredIndex];
    const chart = chartRefs.current[hoveredChart];
    if (!container || !tooltip || !target || !chart) return;

    const placeTooltip = () => {
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const chartRect = chart.getBoundingClientRect();
      const anchorX =
        targetRect.left + targetRect.width / 2 - containerRect.left;
      const anchorY =
        targetRect.top + targetRect.height / 2 - containerRect.top;
      const minLeft = TOOLTIP_GAP - containerRect.left;
      const maxLeft =
        window.innerWidth -
        TOOLTIP_GAP -
        tooltipRect.width -
        containerRect.left;
      const minTop = TOOLTIP_GAP - containerRect.top;
      const maxTop =
        window.innerHeight -
        TOOLTIP_GAP -
        tooltipRect.height -
        containerRect.top;
      let left = anchorX + TOOLTIP_GAP;
      let top = anchorY - tooltipRect.height / 2;
      const leftPlacement = anchorX - tooltipRect.width - TOOLTIP_GAP;
      const fitsRight = left <= maxLeft;
      const fitsLeft = leftPlacement >= minLeft;
      if (!fitsRight && fitsLeft) left = leftPlacement;
      if (!fitsRight && !fitsLeft) {
        left = anchorX - tooltipRect.width / 2;
        const plotTop = chartRect.top - containerRect.top;
        const plotBottom = chartRect.bottom - containerRect.top;
        const above = plotTop - tooltipRect.height - TOOLTIP_GAP;
        top =
          containerRect.top + above >= TOOLTIP_GAP
            ? above
            : plotBottom + TOOLTIP_GAP;
      }
      setTooltipPosition({
        left: Math.min(Math.max(left, minLeft), maxLeft),
        top: Math.min(Math.max(top, minTop), maxTop),
      });
    };

    placeTooltip();
    window.addEventListener("resize", placeTooltip);
    return () => {
      window.removeEventListener("resize", placeTooltip);
    };
  }, [hoveredChart, hoveredIndex, result]);

  const targetProps = (chart: ChartName, index: number) => ({
    onMouseEnter: () => {
      setHoveredChart(chart);
      setHoveredIndex(index);
    },
    onFocus: () => {
      setHoveredChart(chart);
      setHoveredIndex(index);
    },
    onBlur: () => setHoveredIndex(null),
  });

  return (
    <div ref={containerRef} className="relative space-y-6">
      <section className="space-y-2">
        <div>
          <h4 className="font-semibold">Cost per call</h4>
          <p className="text-sm text-foreground/70">
            Each stacked bar is one LLM call. Its colors show what that call
            spent on cached input, cache writes, uncached input, and output. The first bar contains the system prompt (which is usually rather large).
          </p>
        </div>
        <svg
          ref={element => {
            chartRefs.current.calls = element;
          }}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          role="img"
          aria-label={`Per-call cost breakdown for ${result.calls.length} LLM calls`}
          className="overflow-visible text-foreground"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <title>Per-call operation costs</title>
          <Axis maximum={maxCallCost} ticks={[0, 0.5, 1]} />
          <text x={MARGIN.left} y={14} className="fill-current text-[11px]">
            Cost per call
          </text>
          {queryStartIndexes.map(index => (
            <line
              key={result.calls[index].turn}
              x1={xForCall(index) - slotWidth / 2}
              x2={xForCall(index) - slotWidth / 2}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_HEIGHT}
              className="stroke-foreground/45"
              strokeDasharray="4 4"
              pointerEvents="none"
            />
          ))}
          {result.calls.map((call, index) => {
            const x = xForCall(index) - barWidth / 2;
            let bottom = MARGIN.top + PLOT_HEIGHT;
            return (
              <g key={call.index}>
                {OPERATIONS.map(operation => {
                  const height =
                    (call.cost[operation] / maxCallCost) * PLOT_HEIGHT;
                  bottom -= height;
                  return (
                    <rect
                      key={operation}
                      x={x}
                      y={bottom}
                      width={barWidth}
                      height={height}
                      className={OPERATION_META[operation].fillClass}
                    />
                  );
                })}
                {hoveredIndex === index && (
                  <rect
                    x={xForCall(index) - slotWidth / 2}
                    y={MARGIN.top}
                    width={slotWidth}
                    height={PLOT_HEIGHT}
                    className="fill-accent/10"
                    pointerEvents="none"
                  />
                )}
                <rect
                  ref={element => {
                    targetRefs.current.calls[index] = element;
                  }}
                  x={xForCall(index) - slotWidth / 2}
                  y={MARGIN.top}
                  width={Math.max(slotWidth, 1)}
                  height={PLOT_HEIGHT}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`Call ${call.index}: ${call.label}, ${formatUsd(call.totalCost)}`}
                  {...targetProps("calls", index)}
                />
              </g>
            );
          })}
          <XLabels callCount={result.calls.length} />
        </svg>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Legend result={result} />
          <span className="inline-flex items-center gap-1.5 text-xs">
            <svg className="h-2 w-4" aria-hidden="true">
              <line
                x1="0"
                x2="16"
                y1="4"
                y2="4"
                className="stroke-foreground/45"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            User query
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <div>
          <h4 className="font-semibold">Cumulative cost</h4>
          <p className="text-sm text-foreground/70">
            The colored bands add each operation over the conversation. The dark
            line is the running total.
          </p>
        </div>
        <svg
          ref={element => {
            chartRefs.current.cumulative = element;
          }}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          role="img"
          aria-label={`Cumulative conversation cost across ${result.calls.length} LLM calls`}
          className="overflow-visible text-foreground"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <title>Cumulative operation and total costs</title>
          <Axis maximum={maxCumulativeCost} ticks={[0, 0.25, 0.5, 0.75, 1]} />
          <text x={MARGIN.left} y={14} className="fill-current text-[11px]">
            Cumulative cost
          </text>
          {cumulativeOperations.map((operation, boundaryIndex) => (
            <g key={operation} pointerEvents="none">
              <polygon
                points={bandPoints(boundaryIndex)}
                className={`${OPERATION_META[operation].fillClass} opacity-20`}
              />
              <polyline
                points={pointsForBoundary(boundaryIndex)}
                fill="none"
                className={OPERATION_META[operation].strokeClass}
                strokeWidth={1.25}
              />
            </g>
          ))}
          {result.calls.map((call, index) => {
            const x = xForCall(index);
            return (
              <g key={call.index}>
                {hoveredIndex === index && (
                  <rect
                    x={x - slotWidth / 2}
                    y={MARGIN.top}
                    width={slotWidth}
                    height={PLOT_HEIGHT}
                    className="fill-accent/10"
                    pointerEvents="none"
                  />
                )}
                <rect
                  ref={element => {
                    targetRefs.current.cumulative[index] = element;
                  }}
                  x={x - slotWidth / 2}
                  y={MARGIN.top}
                  width={Math.max(slotWidth, 1)}
                  height={PLOT_HEIGHT}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`Call ${call.index}: cumulative cost ${formatUsd(cumulativeTotals[index])}`}
                  {...targetProps("cumulative", index)}
                />
              </g>
            );
          })}
          <polyline
            points={pointsForBoundary(cumulativeOperations.length - 1)}
            fill="none"
            className="stroke-foreground"
            strokeWidth={2.5}
            pointerEvents="none"
          />
          <XLabels callCount={result.calls.length} />
        </svg>
        <Legend result={result} total />
      </section>

      {hoveredCall && hoveredIndex !== null && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-20 w-64 max-w-[calc(100%-1.5rem)] rounded border border-border bg-background p-3 text-foreground shadow-lg"
          style={tooltipPosition}
        >
          <Tooltip
            call={hoveredCall}
            cumulativeCost={cumulativeTotals[hoveredIndex]}
          />
        </div>
      )}
    </div>
  );
}
