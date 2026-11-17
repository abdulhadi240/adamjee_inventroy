"use client";

import { useState } from "react";
import CategoryTable from "@/components/features/categories/CategoryTable";
import AddCategory from "@/components/features/categories/AddCategory";
import { AnimatedCard, PageHeader } from "@/components/ui/motion";

export default function CategoryClientWrapper() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Categories"
        description="Groups used to organise products and reports."
        actions={<AddCategory onChange={triggerRefresh} />}
      />
      <AnimatedCard flush>
        <div className="px-5 pt-4 pb-3">
          <h2 className="card-title">All categories</h2>
          <p className="card-subtitle mt-0.5">
            Renaming a category updates its products too.
          </p>
        </div>
        <CategoryTable refreshKey={refreshKey} onChange={triggerRefresh} />
      </AnimatedCard>
    </div>
  );
}
