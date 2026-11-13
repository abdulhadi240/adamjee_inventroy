"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import AddProduct from "@/components/features/inventory/AddProduct";
import ProductTable from "@/components/features/inventory/ProductTable";
import FilterDropdown, { DropdownOption } from "@/components/ui/FilterDropdown";
import { AnimatedCard, PageHeader } from "@/components/ui/motion";

type SupplierOption = {
  id: string;
  supplier_name: string;
  contact_number: number;
};

const filterOptions: DropdownOption[] = [
  { label: "All", value: null },
  { label: "In stock", value: "In-Stock" },
  { label: "Low stock", value: "Low Stock" },
  { label: "Out of stock", value: "Out of Stock" },
];

export default function InventoryClientWrapper({
  suppliers,
  overview,
}: {
  suppliers: SupplierOption[];
  overview?: React.ReactNode;
}) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

  const filterLabel =
    filterOptions.find((o) => o.value === selectedFilter)?.label ?? "All";

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock levels, pricing and suppliers for every product."
        actions={
          <AddProduct suppliers={suppliers} onOrderChange={triggerRefresh} />
        }
      />

      {overview}

      <AnimatedCard flush className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="card-title">Products</h2>
            <p className="card-subtitle mt-0.5">
              Showing: <span className="font-medium text-ink">{filterLabel}</span>
            </p>
          </div>
          <FilterDropdown
            label="Filter"
            icon={<SlidersHorizontal />}
            options={filterOptions}
            onSelectFilter={setSelectedFilter}
            selected={selectedFilter}
          />
        </div>
        <ProductTable selectedFilter={selectedFilter} refreshKey={refreshKey} />
      </AnimatedCard>
    </div>
  );
}
