"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { getPaginatedCustomersByUser } from "@/lib/actions/customers";
import Pagination, { PAGE_SIZE } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/motion";
import { usePagination } from "@/lib/hooks/use-pagination";
import CustomerRow from "@/components/features/customers/CustomerRow";
import { Customer } from "@/lib/types";

interface CustomerTableProps {
  refreshKey: number;
  onOrderChange: () => void;
}

export default function CustomerTable({
  refreshKey,
  onOrderChange,
}: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { currentPage, handlePageChange } = usePagination();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPaginatedCustomersByUser(
          currentPage,
          PAGE_SIZE,
          searchQuery
        );
        setCustomers(res.data);
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
      <div className="overflow-x-auto border-t border-line">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th className="hidden md:table-cell">Address</th>
              <th>Phone</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              customers.length === 0 &&
              [0, 1, 2].map((i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={4}>
                    <div className="skeleton h-6" />
                  </td>
                </tr>
              ))}
            {customers.map((customer, index) => (
              <CustomerRow
                key={customer.id}
                index={index}
                onOrderChange={onOrderChange}
                customer={customer}
              />
            ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && (
          <EmptyState
            icon={Users}
            title={searchQuery ? "No matching customers" : "No customers yet"}
            description={
              searchQuery
                ? `Nothing matches “${searchQuery}”.`
                : "Add a customer to attach them to sales."
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
