"use client";

import { notify, confirmDialog } from "@/components/ui/Dialog";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, Package, Pencil, Trash2, X } from "lucide-react";
import { updateSale, deleteSale } from "@/lib/actions/sales";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Sale } from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import DatePicker from "@/components/ui/DatePicker";

interface SaleRowProps {
  sale: Sale;
  index?: number;
  onOrderChange: () => void;
  onViewItems: () => void;
}

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 disabled:pointer-events-none disabled:opacity-30";

export function PaymentBadge({ status }: { status: string }) {
  const paid = status === "Paid";
  return (
    <span
      className={`badge ${
        paid
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          paid ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {status}
    </span>
  );
}

export default function SaleRow({
  sale,
  index = 0,
  onOrderChange,
  onViewItems,
}: SaleRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const status = sale.payment_status || "Paid";
  const isPaid = status === "Paid";

  const [editData, setEditData] = useState({
    payment_status: status,
    payment_method: sale.payment_method,
    sale_date: sale.sale_date
      ? new Date(sale.sale_date).toISOString().split("T")[0]
      : "",
  });

  const handleSave = () => {
    const formData = new FormData();
    formData.append("sale_id", String(sale.id));
    formData.append("payment_status", editData.payment_status);
    formData.append("payment_method", editData.payment_method);
    formData.append("sale_date", editData.sale_date);

    startTransition(async () => {
      const result = await updateSale(null, formData);
      if (result.success) {
        setIsEditing(false);
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDialog("Delete this sale? Stock will be restored.", {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteSale(sale.id);
      if (result.success) {
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const itemCount = sale.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isPending ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
    >
      <td className="hidden font-mono text-xs font-semibold text-navy-700 md:table-cell">
        {sale.invoice_code}
      </td>
      <td className="font-medium">
        {sale.customer?.name ?? (
          <span className="text-muted">Walk-in</span>
        )}
      </td>
      <td className="hidden text-muted md:table-cell">
        {isEditing ? (
          <DatePicker
            variant="compact"
            aria-label="Sale date"
            value={editData.sale_date}
            onChange={(sale_date) => setEditData({ ...editData, sale_date })}
            disabled={isPending}
          />
        ) : (
          formatDate(sale.sale_date)
        )}
      </td>

      <td>
        <button
          onClick={onViewItems}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-100"
        >
          <Package className="size-3.5" />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </button>
      </td>

      <td className="text-right font-semibold tabular-nums">
        {formatCurrency(sale.total_amount)}
      </td>

      <td className="hidden text-muted lg:table-cell">
        {isEditing ? (
          <select
            value={editData.payment_method}
            onChange={(e) =>
              setEditData({ ...editData, payment_method: e.target.value })
            }
            className="field h-8 cursor-pointer py-1 text-xs"
            disabled={isPending}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        ) : (
          sale.payment_method
        )}
      </td>

      <td>
        {isEditing ? (
          <select
            value={editData.payment_status}
            onChange={(e) =>
              setEditData({ ...editData, payment_status: e.target.value })
            }
            className="field h-8 cursor-pointer py-1 text-xs"
            disabled={isPending}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <PaymentBadge status={status} />
        )}
      </td>

      <td>
        <div className="flex justify-end gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                aria-label="Save"
                className={`${iconBtn} bg-navy-700 text-white hover:bg-navy-600`}
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                aria-label="Cancel"
                className={`${iconBtn} hover:bg-navy-50 hover:text-ink`}
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isPaid}
                aria-label="Edit"
                title={isPaid ? "Paid invoices can't be edited" : "Edit"}
                className={`${iconBtn} hover:bg-navy-50 hover:text-navy-700`}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPaid || isPending}
                aria-label="Delete"
                title={isPaid ? "Paid invoices can't be deleted" : "Delete"}
                className={`${iconBtn} hover:bg-rose-50 hover:text-rose-600`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
