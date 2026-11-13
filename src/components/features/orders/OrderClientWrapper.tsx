"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import AddOrder from "@/components/features/orders/AddOrder";
import OrderTable from "@/components/features/orders/OrderTable";
import OverallOrders from "@/components/features/orders/OverallOrders";
import FilterDropdown, { DropdownOption } from "@/components/ui/FilterDropdown";
import { AnimatedCard, PageHeader } from "@/components/ui/motion";
import { OrderStatsData, ProductOption, SupplierOption } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";

const filterOptions: DropdownOption[] = [
  { label: "Open (Pending + Shipped)", value: null },
  { label: "All", value: "All" },
  ...ORDER_STATUSES,
];

export default function OrderClientWrapper({
  products,
  suppliers,
  stats,
}: {
  products: ProductOption[];
  suppliers: SupplierOption[];
  stats: OrderStatsData;
}) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    // Re-fetch the server-rendered stat tiles too
    router.refresh();
  };

  const filterLabel =
    filterOptions.find((o) => o.value === selectedFilter)?.label ?? "Filter";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Purchase Orders"
        description="Restock from your suppliers. Completing an order adds its items to stock."
        actions={
          <AddOrder
            products={products}
            suppliers={suppliers}
            onOrderChange={triggerRefresh}
          />
        }
      />

      <OverallOrders
        pendingCount={stats.pending_count}
        shippedCount={stats.shipped_count}
        pendingValue={stats.pending_value}
        completed30dCount={stats.completed_30d_count}
      />

      <AnimatedCard flush>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2 className="card-title">Orders</h2>
            <p className="card-subtitle mt-0.5">
              {selectedFilter === null
                ? "Showing open orders"
                : `Showing ${filterLabel.toLowerCase()} orders`}
            </p>
          </div>
          <FilterDropdown
            label={selectedFilter === null ? "Open" : filterLabel}
            icon={<SlidersHorizontal />}
            options={filterOptions}
            onSelectFilter={setSelectedFilter}
            selected={selectedFilter}
          />
        </div>
        <OrderTable
          selectedFilter={selectedFilter}
          refreshKey={refreshKey}
          onOrderChange={triggerRefresh}
        />
      </AnimatedCard>
    </div>
  );
}
