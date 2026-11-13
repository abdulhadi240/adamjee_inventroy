"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Package, Pencil, Trash2, X } from "lucide-react";
import { updateOrder, deleteOrder } from "@/lib/actions/orders";
import {
  formatCurrency,
  formatDate,
  formatDateForInput,
} from "@/lib/utils/formatters";
import { ORDER_STATUSES } from "@/lib/constants";
import { Order } from "@/lib/types";
import DatePicker from "@/components/ui/DatePicker";

interface OrderRowProps {
  order: Order;
  index?: number;
  onOrderChange: () => void;
  onViewItems: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Shipped: "bg-sky-50 text-navy-700 ring-1 ring-sky-100",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  Cancelled: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`badge ${STATUS_STYLES[status] ?? "bg-canvas text-muted"}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "Completed"
            ? "bg-emerald-500"
            : status === "Pending"
            ? "bg-amber-500"
            : status === "Shipped"
            ? "bg-navy-500"
            : "bg-current"
        }`}
      />
      {status}
    </span>
  );
}

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors duration-150 hover:border-navy-200 hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-40";

export default function OrderRow({
  order,
  index = 0,
  onOrderChange,
  onViewItems,
}: OrderRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isCompleted = order.status === "Completed";

  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const busy = isSaving || isDeleting;

  const [editData, setEditData] = useState({
    status: order.status,
    date: formatDateForInput(order.expected_delivery_date),
  });

  const handleSave = async () => {
    if (
      editData.status === "Completed" &&
      !window.confirm(
        "Mark as completed? All items in this order will be added to stock. This can't be undone."
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.append("order_id", String(order.id));
    formData.append("status", editData.status);
    formData.append("expected_delivery_date", editData.date);

    startSaveTransition(async () => {
      const result = await updateOrder(null, formData);
      if (result.success) {
        setIsEditing(false);
        onOrderChange();
      } else {
        alert(result.message);
      }
    });
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteOrder(order.id);
      if (result.success) {
        onOrderChange();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: busy ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      className={isEditing ? "bg-navy-50/60" : ""}
    >
      <td className="hidden font-mono text-xs font-semibold text-navy-700 md:table-cell">
        {order.po_code}
      </td>
      <td className="font-medium">{order.supplier?.supplier_name ?? "—"}</td>
      <td className="hidden tabular-nums md:table-cell">
        {formatCurrency(order.total_cost)}
      </td>
      <td>
        <button
          onClick={onViewItems}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-100"
        >
          <Package className="size-3.5" />
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </button>
      </td>

      <td className="hidden text-muted md:table-cell">
        {isEditing ? (
          <DatePicker
            variant="compact"
            aria-label="Expected delivery"
            value={editData.date}
            onChange={(date) => setEditData({ ...editData, date })}
            disabled={busy}
          />
        ) : order.expected_delivery_date ? (
          formatDate(order.expected_delivery_date)
        ) : (
          "—"
        )}
      </td>

      <td>
        {isEditing ? (
          <select
            value={editData.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value })
            }
            className="field w-fit cursor-pointer py-1.5"
            disabled={busy}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <OrderStatusBadge status={order.status} />
        )}
      </td>

      <td>
        <div className="flex justify-end gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                aria-label="Save"
                className={`${iconBtn} border-navy-700 bg-navy-700 text-white hover:bg-navy-600 hover:text-white`}
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={busy}
                aria-label="Cancel"
                className={iconBtn}
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isCompleted || busy}
                title={isCompleted ? "Completed orders can't be edited" : "Edit"}
                aria-label="Edit order"
                className={iconBtn}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isCompleted || busy}
                title={
                  isCompleted ? "Completed orders can't be deleted" : "Delete"
                }
                aria-label="Delete order"
                className={`${iconBtn} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`}
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
