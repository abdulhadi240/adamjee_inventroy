"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { insertSupplier } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/Button";
import LabeledInput from "@/components/ui/LabeledInput";
import Modal from "@/components/ui/Modal";
import { FormState, SupplierOption } from "@/lib/types";

const initialState: FormState<SupplierOption> = {
  success: false,
  message: "",
};

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the saved supplier after a successful insert. */
  onCreated?: (supplier: SupplierOption) => void;
  /** Prefills the name field (e.g. text typed into a picker). */
  defaultName?: string;
}

/**
 * The "New supplier" popup. Used by the Suppliers page and by every
 * supplier picker's "Add new supplier" shortcut.
 */
export function SupplierFormModal({
  isOpen,
  onClose,
  onCreated,
  defaultName = "",
}: SupplierFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    insertSupplier,
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
        alert(state.message);
      }
    }
  }, [state, onCreated, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New supplier"
      description="Suppliers can be linked to products and purchase orders."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Discard
          </Button>
          <Button type="submit" form="supplier-form" disabled={isPending}>
            {isPending ? "Adding…" : "Add supplier"}
          </Button>
        </>
      }
    >
      {/* Modal unmounts its content when closed, so defaults re-apply on each open */}
      <form
        id="supplier-form"
        action={formAction}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <LabeledInput
            id="supplier_name"
            name="supplier_name"
            label="Supplier name"
            type="text"
            placeholder="e.g., Al-Noor Traders"
            defaultValue={defaultName}
            autoFocus
            required
          />
        </div>

        <div className="sm:col-span-2">
          <LabeledInput
            id="address"
            name="address"
            label="Address"
            type="text"
            placeholder="e.g., Shop 12, Hall Road, Lahore"
            required
          />
        </div>

        <LabeledInput
          id="contact_number"
          name="contact_number"
          label="Contact number"
          type="tel"
          inputMode="tel"
          placeholder="e.g., 0300 1234567"
          required
        />

        <LabeledInput
          id="purchase_link"
          name="purchase_link"
          label="Store / website (optional)"
          type="text"
          placeholder="e.g., https://daraz.pk/shop/…"
        />
      </form>
    </Modal>
  );
}

const AddSupplier = ({ onOrderChange }: { onOrderChange: () => void }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" />
        Add supplier
      </Button>
      <SupplierFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={onOrderChange}
      />
    </>
  );
};

export default AddSupplier;
