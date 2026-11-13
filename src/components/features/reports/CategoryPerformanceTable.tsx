"use client";

import { motion } from "motion/react";
import { Layers, Tags } from "lucide-react";
import { AnimatedCard, CardHeader, EmptyState } from "@/components/ui/motion";
import { formatCurrency } from "@/lib/utils/formatters";
import { CategoryData } from "@/lib/types";

interface CategoryPerformanceTableProps {
  data: CategoryData[];
}

export default function CategoryPerformanceTable({
  data,
}: CategoryPerformanceTableProps) {
  const totalSales = data.reduce((sum, c) => sum + Number(c.sales), 0);

  return (
    <AnimatedCard flush>
      <div className="px-5 pt-5">
        <CardHeader
          title="Performance by category"
          subtitle="Share of revenue and profit per product category"
          icon={Layers}
        />
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No category data"
          description="Sales in this period will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="w-[38%]">Share of sales</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cat, i) => {
                const share = totalSales > 0 ? (Number(cat.sales) / totalSales) * 100 : 0;
                const profit = Number(cat.profit);
                return (
                  <motion.tr
                    key={cat.category}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    <td className="font-medium capitalize">{cat.category}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                          <motion.div
                            className="h-full rounded-full bg-navy-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${share}%` }}
                            transition={{ delay: 0.25 + i * 0.06, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span className="w-11 text-right text-xs font-semibold tabular-nums text-muted">
                          {share.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{formatCurrency(cat.sales)}</td>
                    <td
                      className={`text-right font-semibold tabular-nums ${
                        profit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AnimatedCard>
  );
}
