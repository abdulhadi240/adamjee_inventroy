"use client";

import { CalendarClock, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Stagger, StatTile } from "@/components/ui/motion";
import { SalesStatsData } from "@/lib/types";

export default function OverallSales({ stats }: { stats: SalesStatsData }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Total revenue"
        value={Number(stats.total_revenue)}
        format="currency"
        icon={Wallet}
        hint="Gross revenue, all time"
      />
      <StatTile
        label="Total profit"
        value={Number(stats.total_profit)}
        format="currency"
        icon={TrendingUp}
        tone="green"
        hint="Revenue minus cost of goods"
      />
      <StatTile
        label="Transactions"
        value={Number(stats.total_transactions)}
        icon={Receipt}
        tone="navy"
        hint="Invoices recorded"
      />
      <StatTile
        label="Today"
        value={Number(stats.today_revenue)}
        format="currency"
        icon={CalendarClock}
        tone="amber"
        hint="Revenue since midnight"
      />
    </Stagger>
  );
}
