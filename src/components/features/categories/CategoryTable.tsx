"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tags } from "lucide-react";
import { getCategoriesWithCounts } from "@/lib/actions/categories";
import CategoryRow from "@/components/features/categories/CategoryRow";
import { EmptyState } from "@/components/ui/motion";
import { CategoryWithCount } from "@/lib/types";

interface CategoryTableProps {
  refreshKey: number;
  onChange: () => void;
}

export default function CategoryTable({
  refreshKey,
  onChange,
}: CategoryTableProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCategories(await getCategoriesWithCounts(searchQuery));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, searchQuery]);

  return (
    <div className="overflow-x-auto px-2 pb-2">
      <table className="data-table">
        <thead>
          <tr>
            <th>Category</th>
            <th className="text-right">Products</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            categories.length === 0 &&
            [0, 1, 2].map((i) => (
              <tr key={`sk-${i}`}>
                <td colSpan={3}>
                  <div className="skeleton h-6" />
                </td>
              </tr>
            ))}
          {categories.map((category, index) => (
            <CategoryRow
              key={category.id}
              index={index}
              category={category}
              onChange={onChange}
            />
          ))}
        </tbody>
      </table>
      {!loading && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title={searchQuery ? "No matching categories" : "No categories yet"}
          description="Add categories so products can be grouped in inventory and reports."
        />
      )}
    </div>
  );
}
