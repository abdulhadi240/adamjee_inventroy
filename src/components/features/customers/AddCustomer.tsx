"use client";

import { notify } from "@/components/ui/Dialog";
import { useState, useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { insertCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/Button";
import LabeledInput from "@/components/ui/LabeledInput";
import Modal from "@/components/ui/Modal";
import { CustomerOption, FormState } from "@/lib/types";

const initialState: FormState<CustomerOption> = {
  success: false,
  message: "",
};

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the saved customer after a successful insert. */
  onCreated?: (customer: CustomerOption) => void;
  /** Prefills the name field (e.g. text typed into a picker). */
  defaultName?: string;
}

/**
 * The "New customer" popup. Used by the Customers page and by the
 * customer picker's "Add new customer" shortcut when recording a sale.
 */
export function CustomerFormModal({
  isOpen,
  onClose,
  onCreated,
  defaultName = "",
}: CustomerFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    insertCustomer,
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
      title="New customer"
      description="Saved customers can be picked when recording a sale."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" disabled={isPending}>
            {isPending ? "Saving…" : "Save customer"}
          </Button>
        </>
      }
    >
      {/* Modal unmounts its content when closed, so defaults re-apply on each open */}
      <form
        id="customer-form"
        action={formAction}
        className="flex flex-col gap-4"
      >
        <LabeledInput
          id="customer_name"
          name="customer_name"
          label="Name"
          type="text"
          placeholder="e.g., Ahmed Raza"
          defaultValue={defaultName}
          autoFocus
          required
        />
        <LabeledInput
          id="customer_contact_number"
          name="contact_number"
          label="Phone"
          type="tel"
          inputMode="tel"
          placeholder="e.g., 0300 1234567"
          required
        />
        <LabeledInput
          id="customer_address"
          name="address"
          label="Address"
          type="text"
          placeholder="e.g., House 12, Gulberg III, Lahore"
          required
        />
      </form>
    </Modal>
  );
}

export default function AddCustomer({
  onOrderChange,
}: {
  onOrderChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <UserPlus className="size-4" />
        Add customer
      </Button>
      <CustomerFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={onOrderChange}
      />
    </>
  );
}
