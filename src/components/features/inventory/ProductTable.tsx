"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getPaginatedProductsByUser } from "@/lib/actions/products";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/motion";
import { usePagination } from "@/lib/hooks/use-pagination";
import ProductRow from "@/components/features/inventory/ProductRow";
import { Product } from "@/lib/types";

interface ProductTableProps {
  selectedFilter: string | null;
  refreshKey: number;
}

export default function ProductTable({
  selectedFilter,
  refreshKey,
}: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { currentPage, handlePageChange } = usePagination();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPaginatedProductsByUser(
          currentPage,
          PAGE_SIZE,
          selectedFilter,
          searchQuery
        );
        setProducts(res.data);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, selectedFilter, refreshKey, searchQuery]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="hidden lg:table-cell">Type</th>
              <th className="hidden md:table-cell">Supplier</th>
              <th className="hidden lg:table-cell text-right">Cost</th>
              <th className="hidden md:table-cell text-right">Price</th>
              <th className="text-right">Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              products.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={7}>
                    <div className="h-9 rounded-lg bg-canvas" />
                  </td>
                </tr>
              ))}
            {products.map((product, i) => (
              <ProductRow key={product.id} product={product} index={i} />
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description={
              searchQuery || selectedFilter
                ? "Try a different search or filter."
                : "Add your first product to start tracking stock."
            }
          />
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
