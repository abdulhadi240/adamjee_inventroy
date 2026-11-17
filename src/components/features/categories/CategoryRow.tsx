"use client";

import { notify, confirmDialog } from "@/components/ui/Dialog";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Pencil, Tag, Trash2, X } from "lucide-react";
import { updateCategory, deleteCategory } from "@/lib/actions/categories";
import { CategoryWithCount } from "@/lib/types";

interface CategoryRowProps {
  category: CategoryWithCount;
  index?: number;
  onChange: () => void;
}

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors duration-150 hover:border-navy-200 hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-40";

export default function CategoryRow({
  category,
  index = 0,
  onChange,
}: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [isPending, startTransition] = useTransition();

  const inUse = category.product_count > 0;

  const startEditing = () => {
    setName(category.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCategory(category.id, name);
      if (result.success) {
        setIsEditing(false);
        onChange();
      } else {
        notify(result.message);
      }
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDialog(`Delete "${category.name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        onChange();
      } else {
        notify(result.message);
      }
    });
  };

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setIsEditing(false);
            }}
            aria-label="Category name"
            className="field max-w-sm py-1.5"
            disabled={isPending}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-700">
              <Tag className="size-3.5" />
            </span>
            <span className="font-medium">{category.name}</span>
          </div>
        )}
      </td>
      <td className="text-right tabular-nums text-muted">
        {category.product_count}
      </td>
      <td>
        <div className="flex justify-end gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || !name.trim()}
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
                onClick={startEditing}
                disabled={isPending}
                aria-label="Rename category"
                className={iconBtn}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending || inUse}
                aria-label="Delete category"
                title={
                  inUse
                    ? "In use by products — move them to another category first"
                    : "Delete category"
                }
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
