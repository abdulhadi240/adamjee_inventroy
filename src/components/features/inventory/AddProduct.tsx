"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { insertProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LabeledInput from "@/components/ui/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect";
import ImageDropzone from "@/components/ui/ImageDropzone";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { SupplierFormModal } from "@/components/features/suppliers/AddSupplier";
import { useQuickCreate } from "@/lib/hooks/use-quick-create";
import { formatDisplayPhoneNumber } from "@/lib/utils/formatters";
import { FormState, ProductOption, SupplierOption } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const initialState: FormState<ProductOption> = {
  success: false,
  message: "",
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierOption[];
  /** Called with the saved product after a successful insert. */
  onCreated?: (product: ProductOption) => void;
  /** Prefills the product name (e.g. text typed into a picker). */
  defaultName?: string;
  /** Preselects a supplier (e.g. the one chosen on a purchase order). */
  defaultSupplierId?: string | null;
}

/**
 * The "New product" popup. Used by the Inventory page and by every product
 * picker's "Add new product" shortcut. Its own supplier picker can create
 * suppliers inline too.
 */
export function ProductFormModal({
  isOpen,
  onClose,
  suppliers,
  onCreated,
  defaultName = "",
  defaultSupplierId = null,
}: ProductFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    insertProduct,
    initialState
  );
  const processedStateRef = useRef(initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    defaultSupplierId
  );
  const supplierQuick = useQuickCreate(suppliers);

  // Reset per-open state when the popup is (re)opened
  const [lastOpen, setLastOpen] = useState(isOpen);
  if (isOpen !== lastOpen) {
    setLastOpen(isOpen);
    if (isOpen) {
      setSelectedSupplierId(defaultSupplierId);
      setPreviewUrl(null);
    }
  }

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

  const supplierOptions = supplierQuick.items.map((supplier) => ({
    id: String(supplier.id),
    main_text: supplier.supplier_name,
    secondary_text: String(formatDisplayPhoneNumber(supplier.contact_number)),
  }));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="New product"
        description="Add an item to your inventory catalog."
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={onClose}>
              Discard
            </Button>
            <Button type="submit" form="product-form" disabled={isPending}>
              {isPending ? "Adding…" : "Add product"}
            </Button>
          </>
        }
      >
        <form
          id="product-form"
          action={formAction}
          className="grid gap-5 md:grid-cols-[220px_1fr]"
        >
          <ImageDropzone
            name="image_file"
            previewUrl={previewUrl}
            onChange={(file) =>
              setPreviewUrl(file ? URL.createObjectURL(file) : null)
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <SearchableSelect
                label="Supplier"
                name="supplier_id"
                options={supplierOptions}
                onSelect={setSelectedSupplierId}
                value={selectedSupplierId}
                required
                placeholder="Search suppliers…"
                emptyText="No supplier found."
                createLabel="supplier"
                onCreateNew={supplierQuick.open}
              />
            </div>
            <div className="col-span-2">
              <LabeledInput
                label="Product name"
                id="name"
                name="product_name"
                type="text"
                placeholder="e.g., Dell 29-inch LED Monitor"
                defaultValue={defaultName}
                required
              />
            </div>
            <LabeledInput
              label="Type / model"
              id="type"
              name="product_type"
              type="text"
              placeholder="e.g., P2922H"
              required
            />
            <LabeledSelect
              label="Category"
              id="category"
              name="product_category"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {PRODUCT_CATEGORIES.map((categories) => (
                <option key={categories.value} value={categories.value}>
                  {categories.label}
                </option>
              ))}
            </LabeledSelect>
            <LabeledInput
              label="Opening stock"
              id="amountStock"
              name="amount_stock"
              type="number"
              placeholder="e.g., 50"
              min={0}
              required
            />
            <LabeledInput
              label="Cost price (Rs)"
              id="priceBuy"
              name="buy_price"
              type="number"
              placeholder="e.g., 75000"
              min={0}
              required
            />
            <LabeledInput
              label="Sell price (Rs)"
              id="priceSell"
              name="sell_price"
              type="number"
              placeholder="e.g., 149000"
              min={0}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Rendered outside the product <form> so the two forms never nest */}
      <SupplierFormModal
        isOpen={supplierQuick.isOpen}
        onClose={supplierQuick.close}
        defaultName={supplierQuick.draft}
        onCreated={(supplier) => {
          supplierQuick.add(supplier);
          setSelectedSupplierId(String(supplier.id));
        }}
      />
    </>
  );
}

interface AddProductProps {
  suppliers: SupplierOption[];
  onOrderChange: () => void;
}

export default function AddProduct({
  suppliers,
  onOrderChange,
}: AddProductProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" strokeWidth={2.5} />
        Add product
      </Button>
      <ProductFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        suppliers={suppliers}
        onCreated={onOrderChange}
      />
    </>
  );
}
