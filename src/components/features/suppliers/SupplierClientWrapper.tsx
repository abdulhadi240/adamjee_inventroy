"use client";

import { useState } from "react";
import SupplierTable from "@/components/features/suppliers/SupplierTable";
import AddSupplier from "@/components/features/suppliers/AddSupplier";
import { AnimatedCard, PageHeader } from "@/components/ui/motion";

export default function SupplierClientWrapper() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Suppliers"
        description="Vendors and distributors you restock from."
        actions={<AddSupplier onOrderChange={triggerRefresh} />}
      />
      <AnimatedCard flush>
        <div className="px-5 pt-4 pb-3">
          <h2 className="card-title">All suppliers</h2>
          <p className="card-subtitle mt-0.5">
            Click a phone number to copy it.
          </p>
        </div>
        <SupplierTable refreshKey={refreshKey} onOrderChange={triggerRefresh} />
      </AnimatedCard>
    </div>
  );
}
