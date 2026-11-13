"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ListFilter } from "lucide-react";
import AddSale from "./AddSale";
import SaleTable from "./SaleTable";
import OverallSales from "./OverallSales";
import FilterDropdown, { DropdownOption } from "@/components/ui/FilterDropdown";
import { AnimatedCard, CardHeader, PageHeader } from "@/components/ui/motion";
import {
  ProductOption,
  CustomerOption,
  SupplierOption,
  SalesStatsData,
} from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";

const statusOptions: DropdownOption[] = [
  { label: "All statuses", value: null },
  ...PAYMENT_STATUSES,
];

const methodOptions: DropdownOption[] = [
  { label: "All methods", value: null },
  ...PAYMENT_METHODS,
];

export default function SaleClientWrapper({
  products,
  customers,
  suppliers,
  stats,
}: {
  products: ProductOption[];
  customers: CustomerOption[];
  suppliers: SupplierOption[];
  stats: SalesStatsData;
}) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    // Re-fetch server data (stats, product stock levels)
    router.refresh();
  };

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales"
        description="Record invoices and track what's going out of stock."
        actions={
          <AddSale
            products={products}
            customers={customers}
            suppliers={suppliers}
            onSaleChange={triggerRefresh}
          />
        }
      />

      <OverallSales stats={stats} />

      <AnimatedCard flush className="overflow-hidden">
        <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardHeader
            title="Transactions"
            subtitle="Paid invoices are locked from editing"
            className="mb-0"
          />
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label={
                statusOptions.find((o) => o.value === statusFilter)?.label ??
                "Status"
              }
              icon={<ListFilter />}
              options={statusOptions}
              selected={statusFilter}
              onSelectFilter={setStatusFilter}
            />
            <FilterDropdown
              label={
                methodOptions.find((o) => o.value === methodFilter)?.label ??
                "Method"
              }
              icon={<CreditCard />}
              options={methodOptions}
              selected={methodFilter}
              onSelectFilter={setMethodFilter}
            />
          </div>
        </div>
        <SaleTable
          refreshKey={refreshKey}
          statusFilter={statusFilter}
          methodFilter={methodFilter}
          onOrderChange={triggerRefresh}
        />
      </AnimatedCard>
    </div>
  );
}
