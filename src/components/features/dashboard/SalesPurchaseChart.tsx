"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartColumnBig } from "lucide-react";
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

const PERIODS = [
  { value: "weekly", label: "4W" },
  { value: "monthly", label: "12M" },
  { value: "yearly", label: "3Y" },
];

export default function SalesPurchaseChart({ data }: { data: ChartData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "monthly";

  const setPeriod = (period: string) =>
    router.push(`?period=${period}`, { scroll: false });

  return (
    <AnimatedCard className="lg:col-span-2">
      <CardHeader
        title="Sales vs purchases"
        subtitle="Revenue against completed restock spend"
        icon={ChartColumnBig}
        action={
          <div className="flex rounded-full border border-line bg-canvas p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`relative cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  currentPeriod === p.value
                    ? "text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {currentPeriod === p.value && (
                  <motion.span
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-full bg-navy-700"
                  />
                )}
                <span className="relative">{p.label}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-2 flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-navy-700" /> Sales
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-navy-400" /> Purchases
        </span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 4, left: -18, bottom: 0 }} barGap={4}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} dy={8} interval={0} />
            <YAxis {...axisProps} tickFormatter={compactTick} />
            <Tooltip
              {...tooltipProps}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar
              dataKey="sales"
              name="Sales"
              fill={CHART_COLORS.navy}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              animationDuration={900}
            />
            <Bar
              dataKey="purchase"
              name="Purchases"
              fill={CHART_COLORS.navyLight}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              animationDuration={900}
              animationBegin={150}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnimatedCard>
  );
}
