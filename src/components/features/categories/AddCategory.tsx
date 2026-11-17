"use client";

import { notify } from "@/components/ui/Dialog";
import { useState, useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { insertCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import LabeledInput from "@/components/ui/LabeledInput";
import Modal from "@/components/ui/Modal";
import { Category, FormState } from "@/lib/types";

const initialState: FormState<Category> = {
  success: false,
  message: "",
};

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the saved category after a successful insert. */
  onCreated?: (category: Category) => void;
}

/**
 * The "New category" popup. Used by the Categories page and by the product
 * form's "New category" shortcut.
 */
export function CategoryFormModal({
  isOpen,
  onClose,
  onCreated,
}: CategoryFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    insertCategory,
    initialState
  );
  const processedStateRef = useRef(initialState);

  useEffect(() => {
    if (state !== processedStateRef.current && state.message) {
      processedStateRef.current = state;
      if (state.success && state.data) {
        onCreated?.(state.data);
        onClose();
      } else if (!state.success) {
        notify(state.message);
      }
    }
  }, [state, onCreated, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New category"
      description="Categories group products in inventory and reports."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Discard
          </Button>
          <Button type="submit" form="category-form" disabled={isPending}>
            {isPending ? "Adding…" : "Add category"}
          </Button>
        </>
      }
    >
      <form id="category-form" action={formAction}>
        <LabeledInput
          id="category_name"
          name="name"
          label="Category name"
          type="text"
          placeholder="e.g., Printers"
          maxLength={60}
          autoFocus
          required
        />
      </form>
    </Modal>
  );
}

const AddCategory = ({ onChange }: { onChange: () => void }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" />
        Add category
      </Button>
      <CategoryFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={onChange}
      />
    </>
  );
};

export default AddCategory;
