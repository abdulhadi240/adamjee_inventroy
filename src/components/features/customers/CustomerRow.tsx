"use client";

import { notify, confirmDialog } from "@/components/ui/Dialog";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import { updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import {
  formatDisplayPhoneNumber,
  formatToLocalPhone,
} from "@/lib/utils/formatters";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Customer } from "@/lib/types";

interface CustomerRowProps {
  customer: Customer;
  index?: number;
  onOrderChange: () => void;
}

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 disabled:pointer-events-none disabled:opacity-30";

export default function CustomerRow({
  customer,
  index = 0,
  onOrderChange,
}: CustomerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editData, setEditData] = useState({
    name: customer.name,
    address: customer.address ?? "",
    contact_number: formatToLocalPhone(customer.contact_number),
  });

  const handleCopyPhone = async () => {
    if (isEditing || !customer.contact_number) return;
    const success = await copyToClipboard(
      formatToLocalPhone(customer.contact_number)
    );
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1600);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("id", customer.id);
    formData.append("customer_name", editData.name);
    formData.append("address", editData.address);
    formData.append("contact_number", editData.contact_number);

    startTransition(async () => {
      const result = await updateCustomer(null, formData);
      if (result.success) {
        setIsEditing(false);
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDialog(`Delete "${customer.name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCustomer(customer.id);
      if (result.success) {
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isPending ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
    >
      <td>
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="field h-8 py-1 text-xs"
            disabled={isPending}
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-50 ring-1 ring-navy-100 text-[11px] font-semibold text-navy-700">
              {initials || "?"}
            </span>
            <span className="font-medium">{customer.name}</span>
          </div>
        )}
      </td>
      <td className="hidden max-w-xs text-muted md:table-cell">
        {isEditing ? (
          <input
            type="text"
            value={editData.address}
            onChange={(e) =>
              setEditData({ ...editData, address: e.target.value })
            }
            className="field h-8 py-1 text-xs"
            disabled={isPending}
          />
        ) : (
          <span className="line-clamp-1">{customer.address || "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="tel"
            inputMode="tel"
            value={editData.contact_number}
            onChange={(e) =>
              setEditData({ ...editData, contact_number: e.target.value })
            }
            className="field h-8 py-1 text-xs"
            disabled={isPending}
          />
        ) : !customer.contact_number ? (
          <span className="text-muted">—</span>
        ) : (
          <button
            type="button"
            onClick={handleCopyPhone}
            title="Copy phone number"
            className="group inline-flex cursor-pointer items-center gap-1.5 tabular-nums transition-colors hover:text-navy-700"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600"
                >
                  <Check className="size-3.5" /> Copied
                </motion.span>
              ) : (
                <motion.span
                  key="phone"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="inline-flex items-center gap-1.5"
                >
                  {formatDisplayPhoneNumber(customer.contact_number)}
                  <Copy className="size-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
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
                aria-label="Edit"
                className={`${iconBtn} hover:bg-navy-50 hover:text-navy-700`}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Delete"
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
