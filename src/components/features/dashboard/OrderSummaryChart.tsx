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
import { Truck } from "lucide-react";
import { AnimatedCard, CardHeader } from "@/components/ui/motion";
import { ChartData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  CHART_COLORS,
  axisProps,
  compactTick,
  gridProps,
  tooltipProps,
} from "@/lib/chart-theme";

export default function OrderSummaryChart({ data }: { data: ChartData[] }) {
  return (
    <AnimatedCard>
      <CardHeader
        title="Restock flow"
        subtitle="Ordered vs delivered value"
        icon={Truck}
      />

      <div className="mb-2 flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" /> Ordered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-navy-700" /> Delivered
        </span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="area-ordered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.amber} stopOpacity={0.12} />
                <stop offset="100%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="area-delivered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.navy} stopOpacity={0.12} />
                <stop offset="100%" stopColor={CHART_COLORS.navy} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} dy={8} minTickGap={8} />
            <YAxis {...axisProps} tickFormatter={compactTick} />
            <Tooltip
              {...tooltipProps}
              cursor={{ stroke: CHART_COLORS.navyLight, strokeDasharray: "4 4" }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Area
              type="monotone"
              dataKey="ordered"
              name="Ordered"
              stroke={CHART_COLORS.amber}
              strokeWidth={2.2}
              fill="url(#area-ordered)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="delivered"
              name="Delivered"
              stroke={CHART_COLORS.navy}
              strokeWidth={2.2}
              fill="url(#area-delivered)"
              animationDuration={1000}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnimatedCard>
  );
}
