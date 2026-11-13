"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getPaginatedOrders } from "@/lib/actions/orders";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/use-pagination";
import OrderRow from "@/components/features/orders/OrderRow";
import OrderItemsModal from "@/components/features/orders/OrderItemsModal";
import { EmptyState } from "@/components/ui/motion";
import { Order } from "@/lib/types";

interface OrderTableProps {
  selectedFilter: string | null;
  refreshKey: number;
  onOrderChange: () => void;
}

export default function OrderTable({
  selectedFilter,
  refreshKey,
  onOrderChange,
}: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { currentPage, handlePageChange } = usePagination();
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(
    null
  );

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPaginatedOrders(
          currentPage,
          PAGE_SIZE,
          selectedFilter,
          searchQuery
        );
        setOrders(res.data as unknown as Order[]);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, selectedFilter, refreshKey, searchQuery]);

  return (
    <>
      <OrderItemsModal
        order={viewingOrderItems}
        onClose={() => setViewingOrderItems(null)}
      />
      <div className="overflow-x-auto px-2">
        <table className="data-table">
          <thead>
            <tr>
              <th className="hidden md:table-cell">PO code</th>
              <th>Supplier</th>
              <th className="hidden md:table-cell">Total cost</th>
              <th>Items</th>
              <th className="hidden md:table-cell">Expected</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              orders.length === 0 &&
              [0, 1, 2, 3].map((i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={7}>
                    <div className="skeleton h-6" />
                  </td>
                </tr>
              ))}
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                index={index}
                order={order}
                onOrderChange={onOrderChange}
                onViewItems={() => setViewingOrderItems(order)}
              />
            ))}
          </tbody>
        </table>
        {!loading && orders.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No purchase orders here"
            description="Create a purchase order to restock products from a supplier."
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
