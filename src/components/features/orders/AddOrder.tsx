"use client";

import {
  useState,
  useActionState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lock, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { insertOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LabeledInput from "@/components/ui/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { SupplierFormModal } from "@/components/features/suppliers/AddSupplier";
import { ProductFormModal } from "@/components/features/inventory/AddProduct";
import { useQuickCreate } from "@/lib/hooks/use-quick-create";
import {
  formatCurrency,
  formatDisplayPhoneNumber,
} from "@/lib/utils/formatters";
import {
  FormState,
  SupplierOption,
  ProductOption,
  OrderItem,
  OrderItemState,
} from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";
import DatePicker from "@/components/ui/DatePicker";

const initialState: FormState = { success: false, message: "" };
const initialItemState: OrderItemState = {
  product_id: "",
  product_name: "",
  product_type: "",
  quantity: "1",
  cost_per_item: "0",
};

interface AddOrderProps {
  products: ProductOption[];
  suppliers: SupplierOption[];
  onOrderChange: () => void;
}

export default function AddOrder({
  products,
  suppliers,
  onOrderChange,
}: AddOrderProps) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    insertOrder,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] =
    useState<OrderItemState>(initialItemState);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);
  const processedStateRef = useRef(initialState);
  const [itemFormKey, setItemFormKey] = useState(0);

  // "Add new …" shortcuts in the pickers
  const supplierQuick = useQuickCreate(suppliers);
  const productQuick = useQuickCreate(products);
  const allProducts = productQuick.items;

  const supplierOptions = supplierQuick.items.map((s) => ({
    id: s.id,
    main_text: s.supplier_name,
    secondary_text: String(formatDisplayPhoneNumber(s.contact_number)),
  }));

  const productOptions = useMemo(() => {
    if (!selectedSupplierId) return [];
    return allProducts
      .filter((p) => String(p.supplier_id) === String(selectedSupplierId))
      .map((p) => ({
        id: p.id,
        main_text: p.product_name,
        secondary_text: p.product_type,
      }));
  }, [allProducts, selectedSupplierId]);

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_per_item,
    0
  );

  const isHeaderLocked = items.length > 0;
  const isItemFormDisabled =
    !selectedSupplierId || !expectedDeliveryDate || !orderStatus;

  const handleDiscard = useCallback(() => {
    formRef.current?.reset();
    setItems([]);
    setCurrentItem(initialItemState);
    setSelectedSupplierId(null);
    setExpectedDeliveryDate("");
    setOrderStatus("");
    setItemError(null);
    setShowForm(false);
    setItemFormKey((prevKey) => prevKey + 1);
  }, []);

  useEffect(() => {
    if (state !== processedStateRef.current && state.message) {
      processedStateRef.current = state;
      if (state.success) {
        handleDiscard();
        onOrderChange();
      } else {
        alert(state.message);
      }
    }
  }, [state, onOrderChange, handleDiscard]);

  const handleProductSelect = (productId: string | null) => {
    if (!productId) return;
    const product = allProducts.find((p) => String(p.id) === String(productId));

    if (product) {
      setItemError(null);
      setCurrentItem({
        product_id: product.id,
        product_name: product.product_name,
        product_type: product.product_type,
        quantity: "1",
        cost_per_item: String(product.buy_price || 0),
      });
    }
  };

  const handleAddItem = () => {
    const quantityNum = parseInt(currentItem.quantity, 10);
    const costNum = parseFloat(currentItem.cost_per_item);

    if (!currentItem.product_id || isNaN(quantityNum) || quantityNum <= 0) {
      setItemError("Select a product and enter a valid quantity.");
      return;
    }
    if (isNaN(costNum) || costNum < 0) {
      setItemError("Enter a valid cost per item.");
      return;
    }

    setItemError(null);
    setItems([
      ...items,
      {
        product_id: currentItem.product_id,
        product_name: currentItem.product_name,
        quantity: quantityNum,
        cost_per_item: costNum,
      },
    ]);
    setCurrentItem(initialItemState);
    setItemFormKey((prevKey) => prevKey + 1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" />
        New order
      </Button>
      <Modal
        isOpen={showForm}
        onClose={handleDiscard}
        size="lg"
        title="New purchase order"
        description="Pick a supplier, then add the products you're restocking."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleDiscard}>
              Discard
            </Button>
            <Button
              type="submit"
              form="order-form"
              disabled={isPending || items.length === 0}
            >
              {isPending
                ? "Saving…"
                : items.length === 0
                ? "Add items to save"
                : `Save order · ${formatCurrency(total)}`}
            </Button>
          </>
        }
      >
        <form
          id="order-form"
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <SearchableSelect
                label="Supplier"
                name="supplier_id"
                options={supplierOptions}
                onSelect={setSelectedSupplierId}
                value={selectedSupplierId}
                disabled={isHeaderLocked}
                placeholder="Search suppliers…"
                emptyText="No suppliers found."
                createLabel="supplier"
                onCreateNew={supplierQuick.open}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <DatePicker
                label="Expected delivery"
                name="expected_delivery_date"
                value={expectedDeliveryDate}
                onChange={setExpectedDeliveryDate}
                disabled={isHeaderLocked}
                placeholder="Pick a delivery date"
                required
              />
            </div>
            <LabeledSelect
              label="Status"
              id="status"
              name="status"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className={
                isHeaderLocked
                  ? "pointer-events-none cursor-not-allowed bg-canvas text-muted"
                  : ""
              }
              required
            >
              <option value="" disabled>
                Select status
              </option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </LabeledSelect>
          </div>

          <AnimatePresence>
            {isHeaderLocked && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="-mt-2 flex items-center gap-1.5 text-xs text-muted"
              >
                <Lock className="size-3" />
                Remove all items to change supplier, date or status.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Line-item builder */}
          <div
            className={`rounded-2xl border border-line bg-canvas/60 p-4 transition-opacity duration-300 ${
              isItemFormDisabled ? "opacity-55" : ""
            }`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Add item
            </p>
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_90px_130px_auto]">
              <SearchableSelect
                label="Product"
                name="product_id"
                options={productOptions}
                onSelect={handleProductSelect}
                disabled={isItemFormDisabled}
                placeholder={
                  !selectedSupplierId
                    ? "Select a supplier first…"
                    : "Search products…"
                }
                emptyText="This supplier has no products yet."
                value={currentItem.product_id || null}
                createLabel="product"
                onCreateNew={productQuick.open}
                key={itemFormKey}
              />
              <LabeledInput
                label="Qty"
                id="temp_qty"
                type="number"
                min={1}
                value={currentItem.quantity}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, quantity: e.target.value })
                }
                disabled={isItemFormDisabled}
              />
              <LabeledInput
                label="Cost / item"
                id="temp_cost"
                type="number"
                min={0}
                value={currentItem.cost_per_item}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    cost_per_item: e.target.value,
                  })
                }
                disabled={isItemFormDisabled}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                disabled={isItemFormDisabled}
                className="h-[42px]"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            {itemError && (
              <p className="mt-2 text-xs text-rose-600">{itemError}</p>
            )}
          </div>

          {/* Items list */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Order items
              </p>
              <span className="text-xs text-muted">
                {items.length} {items.length === 1 ? "line" : "lines"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line py-6 text-center">
                <ShoppingCart className="mb-1.5 size-5 text-navy-200" />
                <p className="text-xs text-muted">No items added yet.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <motion.li
                      key={`${item.product_id}-${index}`}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
                        <Package className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {item.product_name}
                        </p>
                        <p className="text-xs tabular-nums text-muted">
                          {item.quantity} × {formatCurrency(item.cost_per_item)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-ink">
                        {formatCurrency(item.quantity * item.cost_per_item)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        aria-label={`Remove ${item.product_name}`}
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}

            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-between rounded-xl bg-navy-800 px-4 py-3 text-white"
                >
                  <span className="text-sm text-navy-100">Order total</span>
                  <motion.span
                    key={total}
                    initial={{ opacity: 0.4, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base font-semibold tabular-nums"
                  >
                    {formatCurrency(total)}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </Modal>

      {/* Quick-add popups, outside the order <form> so forms never nest */}
      <SupplierFormModal
        isOpen={supplierQuick.isOpen}
        onClose={supplierQuick.close}
        defaultName={supplierQuick.draft}
        onCreated={(supplier) => {
          supplierQuick.add(supplier);
          setSelectedSupplierId(String(supplier.id));
        }}
      />
      <ProductFormModal
        isOpen={productQuick.isOpen}
        onClose={productQuick.close}
        suppliers={supplierQuick.items}
        defaultName={productQuick.draft}
        defaultSupplierId={selectedSupplierId}
        onCreated={(product) => {
          productQuick.add(product);
          // Only auto-pick it if it belongs to this order's supplier
          if (String(product.supplier_id) === String(selectedSupplierId)) {
            setItemError(null);
            setCurrentItem({
              product_id: String(product.id),
              product_name: product.product_name,
              product_type: product.product_type,
              quantity: "1",
              cost_per_item: String(product.buy_price || 0),
            });
          }
        }}
      />
    </>
  );
}
