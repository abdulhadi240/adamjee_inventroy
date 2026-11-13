/** Shared Recharts styling so every chart matches the brand. */
export const CHART_COLORS = {
  navy: "#163a6e",
  navyLight: "#5b8bd6",
  glow: "#10b3ee",
  glowLight: "#7fdcff",
  green: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  grid: "#e6e9f0",
  axis: "#66728a",
} as const;

export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: CHART_COLORS.axis, fontSize: 11 },
} as const;

export const gridProps = {
  strokeDasharray: "4 4",
  vertical: false,
  stroke: CHART_COLORS.grid,
} as const;

export const tooltipProps = {
  cursor: { fill: "rgba(22,58,110,0.05)" },
  contentStyle: {
    borderRadius: 14,
    border: "1px solid #e6e9f0",
    boxShadow: "0 12px 32px -12px rgba(16,46,99,0.25)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { color: "#0d1b33", fontWeight: 600, marginBottom: 4 },
} as const;

/** 1.2M / 450k style tick labels. */
export function compactTick(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}
