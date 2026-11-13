"use client";

import { CircleCheck, Clock, Truck, Wallet } from "lucide-react";
import { Stagger, StatTile } from "@/components/ui/motion";

interface OverallOrdersProps {
  pendingCount: number;
  shippedCount: number;
  pendingValue: number;
  completed30dCount: number;
}

export default function OverallOrders({
  pendingCount,
  shippedCount,
  pendingValue,
  completed30dCount,
}: OverallOrdersProps) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Value pending"
        value={Number(pendingValue) || 0}
        format="currency"
        icon={Wallet}
        tone="navy"
        hint="Cost of orders not yet received"
      />
      <StatTile
        label="Pending"
        value={Number(pendingCount) || 0}
        icon={Clock}
        tone="amber"
        hint="Awaiting dispatch"
      />
      <StatTile
        label="In transit"
        value={Number(shippedCount) || 0}
        icon={Truck}
        tone="navy"
        hint="Shipped by suppliers"
      />
      <StatTile
        label="Received (30 days)"
        value={Number(completed30dCount) || 0}
        icon={CircleCheck}
        tone="green"
        hint="Completed and stocked"
      />
    </Stagger>
  );
}
