"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import { getPaginatedSales } from "@/lib/actions/sales";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/motion";
import { usePagination } from "@/lib/hooks/use-pagination";
import SaleRow from "@/components/features/sales/SaleRow";
import SaleItemsModal from "@/components/features/sales/SaleItemsModal";
import { Sale } from "@/lib/types";

interface SaleTableProps {
  refreshKey?: number;
  statusFilter: string | null;
  methodFilter: string | null;
  onOrderChange: () => void;
}

export default function SaleTable({
  refreshKey,
  statusFilter,
  methodFilter,
  onOrderChange,
}: SaleTableProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { currentPage, handlePageChange } = usePagination();
  const [viewingSaleItems, setViewingSaleItems] = useState<Sale | null>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPaginatedSales(
          currentPage,
          PAGE_SIZE,
          statusFilter,
          methodFilter,
          searchQuery
        );
        setSales(res.data as unknown as Sale[]);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, refreshKey, statusFilter, methodFilter, searchQuery]);

  return (
    <>
      <SaleItemsModal
        sale={viewingSaleItems}
        onClose={() => setViewingSaleItems(null)}
      />
      <div className="overflow-x-auto border-t border-line">
        <table className="data-table">
          <thead>
            <tr>
              <th className="hidden md:table-cell">Invoice</th>
              <th>Customer</th>
              <th className="hidden md:table-cell">Date</th>
              <th>Items</th>
              <th className="text-right">Total</th>
              <th className="hidden lg:table-cell">Payment</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              sales.length === 0 &&
              [0, 1, 2, 3].map((i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={8}>
                    <div className="skeleton h-6" />
                  </td>
                </tr>
              ))}
            {sales.map((sale, index) => (
              <SaleRow
                key={sale.id}
                sale={sale}
                index={index}
                onViewItems={() => setViewingSaleItems(sale)}
                onOrderChange={onOrderChange}
              />
            ))}
          </tbody>
        </table>
        {!loading && sales.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No sales yet"
            description={
              statusFilter || methodFilter || searchQuery
                ? "No invoices match the current filters."
                : "Record your first sale to see it here."
            }
          />
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
