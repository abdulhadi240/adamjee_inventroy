"use client";

import { AlertTriangle, Boxes, Layers, PackageX, Wallet } from "lucide-react";
import { Stagger, StatTile } from "@/components/ui/motion";

interface OverallInventoryProps {
  totalCategories: number;
  totalProducts: number;
  totalInventoryValue: number;
  lowStockCount: number;
  noStockCount: number;
}

export default function OverallInventory({
  totalCategories,
  totalProducts,
  totalInventoryValue,
  lowStockCount,
  noStockCount,
}: OverallInventoryProps) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div className="col-span-2 lg:col-span-1">
        <StatTile
          label="Stock value"
          value={totalInventoryValue}
          format="currency"
          icon={Wallet}
          tone="navy"
          hint="At cost price"
        />
      </div>
      <StatTile
        label="Products"
        value={totalProducts}
        icon={Boxes}
        tone="navy"
        hint="Items in catalog"
      />
      <StatTile
        label="Categories"
        value={totalCategories}
        icon={Layers}
        tone="glow"
        hint="Distinct categories"
      />
      <StatTile
        label="Low stock"
        value={lowStockCount}
        icon={AlertTriangle}
        tone="amber"
        hint="Below threshold"
      />
      <StatTile
        label="Out of stock"
        value={noStockCount}
        icon={PackageX}
        tone="red"
        hint="Need restock"
      />
    </Stagger>
  );
}
