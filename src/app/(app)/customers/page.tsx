"use client";

import { useState } from "react";
import CustomerTable from "@/components/features/customers/CustomerTable";
import AddCustomer from "@/components/features/customers/AddCustomer";
import { AnimatedCard, CardHeader, PageHeader } from "@/components/ui/motion";

export default function CustomersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Customers"
        description="People and businesses you sell to."
        actions={<AddCustomer onOrderChange={triggerRefresh} />}
      />
      <AnimatedCard flush className="overflow-hidden">
        <div className="p-5 pb-4">
          <CardHeader
            title="Customer directory"
            subtitle="Click a phone number to copy it"
            className="mb-0"
          />
        </div>
        <CustomerTable
          refreshKey={refreshKey}
          onOrderChange={triggerRefresh}
        />
      </AnimatedCard>
    </div>
  );
}
