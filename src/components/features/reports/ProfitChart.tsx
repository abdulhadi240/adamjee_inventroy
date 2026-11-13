"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartSpline, LineChart } from "lucide-react";
import { AnimatedCard, CardHeader, EmptyState } from "@/components/ui/motion";
import { ProfitChartData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  CHART_COLORS,
  axisProps,
  compactTick,
  gridProps,
  tooltipProps,
} from "@/lib/chart-theme";

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export default function ProfitChart({ data }: { data: ProfitChartData[] }) {
  return (
    <AnimatedCard>
      <CardHeader
        title="Revenue & profit trend"
        subtitle="Daily totals for the selected period"
        icon={ChartSpline}
        action={
          <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-navy-700" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-navy-400" /> Profit
            </span>
          </div>
        }
      />
      {data.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="No sales in this period"
          description="Pick a wider date range to see the trend."
        />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.navy} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={CHART_COLORS.navy} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profit-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.navyLight} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={CHART_COLORS.navyLight} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" {...axisProps} tickFormatter={shortDate} dy={8} minTickGap={16} />
              <YAxis {...axisProps} tickFormatter={compactTick} width={48} />
              <Tooltip
                {...tooltipProps}
                cursor={{ stroke: CHART_COLORS.navyLight, strokeDasharray: "4 4" }}
                labelFormatter={(l) => shortDate(String(l))}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={CHART_COLORS.navy}
                strokeWidth={2}
                fill="url(#rev-fill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={1100}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke={CHART_COLORS.navyLight}
                strokeWidth={2}
                fill="url(#profit-fill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={1300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnimatedCard>
  );
}
