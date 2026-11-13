"use client";

import {
  useState,
  useActionState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { insertSale } from "@/lib/actions/sales";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { CustomerFormModal } from "@/components/features/customers/AddCustomer";
import { ProductFormModal } from "@/components/features/inventory/AddProduct";
import { useQuickCreate } from "@/lib/hooks/use-quick-create";
import {
  formatCurrency,
  formatDisplayPhoneNumber,
} from "@/lib/utils/formatters";
import {
  FormState,
  ProductOption,
  CustomerOption,
  SupplierOption,
  SaleItem,
} from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import DatePicker from "@/components/ui/DatePicker";

const initialState: FormState = { success: false, message: "" };

const today = () => new Date().toISOString().split("T")[0];

interface AddSaleProps {
  products: ProductOption[];
  customers: CustomerOption[];
  suppliers?: SupplierOption[];
  onSaleChange: () => void;
}

/** Pill segmented control with a sliding highlight; mirrors value into a hidden input. */
function Segmented({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-canvas/70 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`relative flex-1 cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`seg-${name}`}
                  className="absolute inset-0 rounded-xl bg-navy-700"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  max,
  onChange,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  const btn = `grid cursor-pointer place-items-center rounded-full text-ink transition-all hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-30 ${
    size === "sm" ? "size-6" : "size-8"
  }`;
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-white p-0.5 ${
        size === "sm" ? "" : "h-10.5"
      }`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={btn}
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={`min-w-7 text-center font-semibold tabular-nums ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export default function AddSale({
  products: baseProducts = [],
  customers: baseCustomers = [],
  suppliers = [],
  onSaleChange,
}: AddSaleProps) {
  // "Add new …" shortcuts in the pickers
  const customerQuick = useQuickCreate(baseCustomers);
  const productQuick = useQuickCreate(baseProducts);
  const customers = customerQuick.items;
  const products = productQuick.items;

  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    insertSale,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [saleDate, setSaleDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const [tempProductId, setTempProductId] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState(1);
  const [itemFormKey, setItemFormKey] = useState(0);
  const [itemError, setItemError] = useState<string | null>(null);

  const processedStateRef = useRef(initialState);

  const stockOf = (productId: string) =>
    products.find((p) => String(p.id) === productId)?.amount_stock ?? 0;

  const customerOptions = (customers || []).map((c) => ({
    id: String(c.id),
    main_text: c.name,
    secondary_text: formatDisplayPhoneNumber(c.contact_number),
  }));

  const productOptions = (products || []).map((p) => ({
    id: String(p.id),
    main_text: p.product_name,
    secondary_text: `${p.amount_stock} in stock · ${formatCurrency(
      p.sell_price
    )}`,
  }));

  const tempProduct = products.find((p) => String(p.id) === tempProductId);
  const alreadyInCart =
    items.find((i) => i.product_id === tempProductId)?.quantity ?? 0;
  const tempMax = tempProduct
    ? Math.max(tempProduct.amount_stock - alreadyInCart, 0)
    : 1;

  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.sell_price,
    0
  );
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const resetItemForm = () => {
    setTempProductId(null);
    setTempQty(1);
    setItemError(null);
    setItemFormKey((prev) => prev + 1);
  };

  const handleDiscard = useCallback(() => {
    formRef.current?.reset();
    setItems([]);
    setPaymentStatus("Paid");
    setPaymentMethod("Cash");
    setSelectedCustomerId(null);
    setSaleDate(today());
    setTempProductId(null);
    setTempQty(1);
    setItemError(null);
    setItemFormKey((prev) => prev + 1);
    setShowForm(false);
  }, []);

  useEffect(() => {
    if (state !== processedStateRef.current && state.message) {
      processedStateRef.current = state;
      if (state.success) {
        handleDiscard();
        onSaleChange();
      } else {
        alert(state.message);
      }
    }
  }, [state, onSaleChange, handleDiscard]);

  const handleAddItem = () => {
    if (!tempProduct) return setItemError("Select a product first.");
    if (tempMax <= 0)
      return setItemError(
        `No more stock available for ${tempProduct.product_name}.`
      );
    const qty = Math.min(tempQty, tempMax);

    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === tempProductId);
      if (existing) {
        return prev.map((i) =>
          i.product_id === tempProductId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: String(tempProduct.id),
          product_name: tempProduct.product_name,
          quantity: qty,
          sell_price: Number(tempProduct.sell_price),
        },
      ];
    });
    resetItemForm();
  };

  const updateQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i))
    );

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.product_id !== productId));

  // The server only needs product ids and quantities; price comes from the product.
  const itemsPayload = items.map(({ product_id, quantity }) => ({
    product_id,
    quantity: String(quantity),
  }));

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" />
        New sale
      </Button>

      <Modal
        isOpen={showForm}
        onClose={handleDiscard}
        size="lg"
        title="New sale"
        description="Build the cart, then charge the customer."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleDiscard}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="sale-form"
              variant="primary"
              disabled={isPending || items.length === 0}
            >
              {isPending
                ? "Processing…"
                : `Charge ${formatCurrency(totalAmount)}`}
            </Button>
          </>
        }
      >
        <form
          id="sale-form"
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(itemsPayload)}
          />

          {/* Sale details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              label="Customer (optional)"
              name="customer_id"
              options={customerOptions}
              onSelect={setSelectedCustomerId}
              value={selectedCustomerId}
              placeholder="Walk-in customer"
              emptyText="No customers found."
              createLabel="customer"
              onCreateNew={customerQuick.open}
            />
            <DatePicker
              label="Date"
              name="sale_date"
              value={saleDate}
              onChange={setSaleDate}
              required
            />
            <Segmented
              name="payment_method"
              label="Payment method"
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
            <Segmented
              name="payment_status"
              label="Payment status"
              options={PAYMENT_STATUSES}
              value={paymentStatus}
              onChange={setPaymentStatus}
            />
          </div>

          {/* Add to cart */}
          <div className="rounded-2xl border border-line bg-canvas/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <SearchableSelect
                  key={itemFormKey}
                  label="Product"
                  name="temp_product"
                  options={productOptions}
                  onSelect={(id) => {
                    setTempProductId(id);
                    setTempQty(1);
                    setItemError(null);
                  }}
                  value={tempProductId}
                  placeholder="Search products…"
                  emptyText="No products found."
                  createLabel="product"
                  onCreateNew={productQuick.open}
                />
              </div>
              <div>
                <p className="field-label">Qty</p>
                <QtyStepper
                  value={tempQty}
                  max={Math.max(tempMax, 1)}
                  onChange={setTempQty}
                />
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddItem}
                disabled={!tempProductId}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <AnimatePresence>
              {(itemError || tempProduct) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-2 text-xs ${
                    itemError ? "text-rose-600" : "text-muted"
                  }`}
                >
                  {itemError ??
                    (tempProduct &&
                      `${formatCurrency(tempProduct.sell_price)} each · ${tempMax} available`)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Cart</p>
              {items.length > 0 && (
                <span className="badge bg-navy-50 text-navy-700">
                  {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5 pl-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatCurrency(item.sell_price)} each
                      </p>
                    </div>
                    <QtyStepper
                      size="sm"
                      value={item.quantity}
                      max={stockOf(item.product_id)}
                      onChange={(q) => updateQty(item.product_id, q)}
                    />
                    <span className="w-24 text-right text-sm font-semibold tabular-nums">
                      {formatCurrency(item.sell_price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.product_name}`}
                      onClick={() => removeItem(item.product_id)}
                      className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {items.length === 0 && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-line py-7 text-center">
                <ShoppingCart className="mb-1.5 size-5 text-navy-200" />
                <p className="text-xs text-muted">
                  The cart is empty. Add a product above.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="field-label">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="e.g., Warranty card handed over"
              className="field resize-none"
            />
          </div>

          {/* Sticky total */}
          <div className="sticky bottom-0 -mx-6 -mb-5 flex items-center justify-between border-t border-line bg-white px-6 py-3">
            <span className="text-sm text-muted">Total</span>
            <motion.span
              key={totalAmount}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold tabular-nums text-navy-800"
            >
              {formatCurrency(totalAmount)}
            </motion.span>
          </div>
        </form>
      </Modal>

      {/* Quick-add popups, outside the sale <form> so forms never nest */}
      <CustomerFormModal
        isOpen={customerQuick.isOpen}
        onClose={customerQuick.close}
        defaultName={customerQuick.draft}
        onCreated={(customer) => {
          customerQuick.add(customer);
          setSelectedCustomerId(String(customer.id));
        }}
      />
      <ProductFormModal
        isOpen={productQuick.isOpen}
        onClose={productQuick.close}
        suppliers={suppliers}
        defaultName={productQuick.draft}
        onCreated={(product) => {
          productQuick.add(product);
          setTempProductId(String(product.id));
          setTempQty(1);
          setItemError(null);
        }}
      />
    </>
  );
}
