"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Truck } from "lucide-react";
import { getPaginatedSuppliersByUser } from "@/lib/actions/suppliers";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/use-pagination";
import SupplierRow from "@/components/features/suppliers/SupplierRow";
import { EmptyState } from "@/components/ui/motion";
import { Supplier } from "@/lib/types";

interface SupplierTableProps {
  refreshKey: number;
  onOrderChange: () => void;
}

export default function SupplierTable({
  refreshKey,
  onOrderChange,
}: SupplierTableProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { currentPage, handlePageChange } = usePagination();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPaginatedSuppliersByUser(
          currentPage,
          PAGE_SIZE,
          searchQuery
        );
        setSuppliers(res.data);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, refreshKey, searchQuery]);

  return (
    <>
      <div className="overflow-x-auto px-2">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th className="hidden md:table-cell">Address</th>
              <th>Contact</th>
              <th className="text-center">Store</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              suppliers.length === 0 &&
              [0, 1, 2].map((i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={5}>
                    <div className="skeleton h-6" />
                  </td>
                </tr>
              ))}
            {suppliers.map((supplier, index) => (
              <SupplierRow
                key={supplier.id}
                index={index}
                onOrderChange={onOrderChange}
                supplier={supplier}
              />
            ))}
          </tbody>
        </table>
        {!loading && suppliers.length === 0 && (
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add the vendors you buy stock from so you can raise purchase orders."
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
