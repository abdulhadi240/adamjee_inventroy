"use client";

import { Banknote, Coins, Percent, TrendingUp } from "lucide-react";
import { Stagger, StatTile } from "@/components/ui/motion";
import { FinancialSummary } from "@/lib/types";

interface StatsOverviewProps {
  summary: FinancialSummary;
}

export default function StatsOverview({ summary }: StatsOverviewProps) {
  const tx = summary.totalTransactions ?? 0;
  return (
    <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label="Gross revenue"
        value={Number(summary.totalRevenue)}
        format="currency"
        icon={Banknote}
        hint={`${tx} ${tx === 1 ? "sale" : "sales"} in period`}
      />
      <StatTile
        label="Cost of goods sold"
        value={Number(summary.totalCost)}
        format="currency"
        icon={Coins}
        tone="red"
        hint="Buy price of items sold"
      />
      <StatTile
        label="Net profit"
        value={Number(summary.grossProfit)}
        format="currency"
        icon={TrendingUp}
        tone="green"
        hint="Revenue minus cost"
      />
      <StatTile
        label="Profit margin"
        value={Number(summary.marginPercent)}
        format="percent"
        icon={Percent}
        tone="navy"
        hint="Profit as share of revenue"
      />
    </Stagger>
  );
}
