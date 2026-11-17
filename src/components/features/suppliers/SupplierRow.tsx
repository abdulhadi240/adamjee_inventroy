"use client";

import { notify, confirmDialog } from "@/components/ui/Dialog";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { updateSupplier, deleteSupplier } from "@/lib/actions/suppliers";
import {
  formatDisplayPhoneNumber,
  formatPurchaseLink,
  formatToLocalPhone,
} from "@/lib/utils/formatters";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Supplier } from "@/lib/types";

interface SupplierRowProps {
  supplier: Supplier;
  index?: number;
  onOrderChange: () => void;
}

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors duration-150 hover:border-navy-200 hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-40";

export default function SupplierRow({
  supplier,
  index = 0,
  onOrderChange,
}: SupplierRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editData, setEditData] = useState({
    supplier_name: supplier.supplier_name,
    address: supplier.address,
    contact_number: formatToLocalPhone(supplier.contact_number),
    purchase_link: supplier.purchase_link ?? "",
  });

  const handleCopyPhone = async () => {
    if (isEditing || !supplier.contact_number) return;

    const success = await copyToClipboard(
      formatToLocalPhone(supplier.contact_number)
    );
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } else {
      notify("Couldn't copy the number.");
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("id", supplier.id);
    formData.append("supplier_name", editData.supplier_name);
    formData.append("address", editData.address);
    formData.append("contact_number", editData.contact_number);
    formData.append("purchase_link", editData.purchase_link);

    startTransition(async () => {
      const result = await updateSupplier(null, formData);
      if (result.success) {
        setIsEditing(false);
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDialog(`Delete "${supplier.supplier_name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteSupplier(supplier.id);
      if (result.success) {
        onOrderChange();
      } else {
        notify(result.message);
      }
    });
  };

  const initials = supplier.supplier_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      className={isEditing ? "bg-navy-50/60" : ""}
    >
      <td>
        {isEditing ? (
          <input
            type="text"
            value={editData.supplier_name}
            onChange={(e) =>
              setEditData({ ...editData, supplier_name: e.target.value })
            }
            className="field py-1.5"
            disabled={isPending}
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-[11px] font-semibold text-navy-700">
              {initials || "S"}
            </span>
            <span className="font-medium">{supplier.supplier_name}</span>
          </div>
        )}
      </td>
      <td className="hidden max-w-64 text-muted md:table-cell">
        {isEditing ? (
          <input
            type="text"
            value={editData.address}
            onChange={(e) =>
              setEditData({ ...editData, address: e.target.value })
            }
            className="field py-1.5"
            disabled={isPending}
          />
        ) : (
          <span className="line-clamp-1">{supplier.address || "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="tel"
            value={editData.contact_number}
            onChange={(e) =>
              setEditData({ ...editData, contact_number: e.target.value })
            }
            className="field py-1.5"
            disabled={isPending}
          />
        ) : (
          <button
            type="button"
            onClick={handleCopyPhone}
            title="Copy phone number"
            className="group inline-flex cursor-pointer items-center gap-1.5 tabular-nums transition-colors hover:text-navy-600"
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
                  <Check className="size-3.5" />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="phone"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="inline-flex items-center gap-1.5"
                >
                  {formatDisplayPhoneNumber(supplier.contact_number)}
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </td>
      <td className="text-center">
        {isEditing ? (
          <input
            type="text"
            value={editData.purchase_link}
            placeholder="https://…"
            onChange={(e) =>
              setEditData({ ...editData, purchase_link: e.target.value })
            }
            className="field py-1.5"
            disabled={isPending}
          />
        ) : supplier.purchase_link ? (
          <a
            href={formatPurchaseLink(supplier.purchase_link)}
            target="_blank"
            rel="noopener noreferrer"
            title={supplier.purchase_link}
            aria-label="Open supplier store"
            className={`${iconBtn} mx-auto`}
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        <div className="flex justify-end gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                aria-label="Save"
                className={`${iconBtn} border-navy-700 bg-navy-700 text-white hover:bg-navy-600 hover:text-white`}
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
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
                disabled={isPending}
                aria-label="Edit supplier"
                className={iconBtn}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Delete supplier"
                className={`${iconBtn} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`}
              >
                {isPending ? (
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
