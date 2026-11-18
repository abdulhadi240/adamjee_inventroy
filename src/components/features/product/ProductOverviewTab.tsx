"use client";

import { notify, confirmDialog } from "@/components/ui/Dialog";
import { useState, useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateProduct,
  deleteProduct,
  reduceProductStock,
  addProductStock,
} from "@/lib/actions/products";
import Modal from "@/components/ui/Modal";
import { getAllCategories } from "@/lib/actions/categories";
import { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import InfoRow from "@/components/ui/InfoRow";
import LabeledInput from "@/components/ui/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect";
import ImageDropzone from "@/components/ui/ImageDropzone";
import {
  Check,
  Copy,
  ExternalLink,
  Minus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatedCard, CardHeader } from "@/components/ui/motion";
import { hasProductImage } from "@/components/features/inventory/ProductThumb";
import {
  formatCurrency,
  formatDisplayPhoneNumber,
  formatPurchaseLink,
  formatToLocalPhone,
} from "@/lib/utils/formatters";
import { copyToClipboard } from "@/lib/utils/clipboard";

type StockStats = {
  pendingStock: number;
  shippedStock: number;
};

const initialState: { success: boolean; message: string } = {
  success: false,
  message: "",
};

export default function ProductOverviewTab({
  product,
}: {
  product: Product;
  stockStats: StockStats | null;
}) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [, setNewImageFile] = useState<File | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(
    null
  );
  const [isCopied, setIsCopied] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load the category list when editing starts
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    getAllCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, [isEditing]);

  const [updateState, formAction, isPending] = useActionState(
    updateProduct,
    initialState
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (updateState.message) {
      notify(updateState.message, updateState.success ? "success" : "error");
      if (updateState.success) {
        setIsEditing(false);
        setNewImageFile(null);
        setNewImagePreviewUrl(null);
        router.refresh();
      }
    }
  }, [updateState, router]);

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setNewImagePreviewUrl(
      hasProductImage(product.product_image) ? product.product_image : null
    );
    setNewImageFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewImageFile(null);
    setNewImagePreviewUrl(null);
  };

  const handleDelete = async () => {
    const ok = await confirmDialog("Delete this product?", {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    startDeleteTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        router.push("/inventory");
      } else {
        notify(result.message);
      }
    });
  };

  // Direct stock adjustment: add units, or take them out without a sale
  const [stockMode, setStockMode] = useState<"add" | "reduce" | null>(null);
  // Kept while the popup animates closed, so its wording does not flip
  const [shownStockMode, setShownStockMode] = useState<"add" | "reduce">("add");
  const [stockQty, setStockQty] = useState("");
  const [isAdjusting, startAdjustTransition] = useTransition();

  const isAdding = shownStockMode === "add";
  const stockAmount = Number(stockQty);
  const stockValid =
    Number.isInteger(stockAmount) &&
    stockAmount > 0 &&
    (isAdding || stockAmount <= product.amount_stock);
  const stockAfter = isAdding
    ? product.amount_stock + stockAmount
    : product.amount_stock - stockAmount;

  const openStock = (mode: "add" | "reduce") => {
    setShownStockMode(mode);
    setStockMode(mode);
    setStockQty("");
  };

  const closeStock = () => setStockMode(null);

  const handleAdjustStock = () => {
    if (!stockValid) return;
    startAdjustTransition(async () => {
      const result = isAdding
        ? await addProductStock(product.id, stockAmount)
        : await reduceProductStock(product.id, stockAmount);
      if (result.success) {
        closeStock();
        router.refresh();
      }
      notify(result.message, result.success ? "success" : "error");
    });
  };

  const handleFileChange =(file: File | null) => {
    if (file) {
      setNewImageFile(file);
      setNewImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setNewImageFile(null);
      setNewImagePreviewUrl(
        hasProductImage(product.product_image) ? product.product_image : null
      );
    }
  };

  const handleCopyPhone = async () => {
    if (!product.supplier?.contact_number) return;
    const localPhone = formatToLocalPhone(product.supplier.contact_number);
    if (await copyToClipboard(localPhone)) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const Container = isEditing ? "form" : "div";
  const link = product.supplier?.purchase_link;

  return (
    <Container action={isEditing ? formAction : undefined}>
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {isEditing
            ? "Editing product details. Changes apply after saving."
            : "Product details and supplier information."}
        </p>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                <X className="size-3.5" /> Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                <Check className="size-3.5" />
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleEdit}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openStock("add")}
              >
                <Plus className="size-3.5" /> Add stock
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openStock("reduce")}
                disabled={product.amount_stock <= 0}
                title={
                  product.amount_stock <= 0 ? "Nothing in stock" : undefined
                }
              >
                <Minus className="size-3.5" /> Reduce stock
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AnimatedCard className="lg:col-span-2">
          <CardHeader title="Product information" />
          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <LabeledInput
                  id="product_name"
                  label="Product name"
                  name="product_name"
                  defaultValue={product.product_name}
                />
              </div>
              <LabeledInput
                id="product_type"
                label="Type / model"
                name="product_type"
                defaultValue={product.product_type}
              />
              <LabeledSelect
                id="product_category"
                label="Category"
                name="product_category"
                defaultValue={product.product_category}
              >
                {/* Keep the current value selectable even if it is not in the list */}
                {!categories.some(
                  (c) => c.name === product.product_category
                ) && (
                  <option value={product.product_category}>
                    {product.product_category}
                  </option>
                )}
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </LabeledSelect>
              <LabeledInput
                id="buy_price"
                label="Cost price (Rs)"
                name="buy_price"
                type="number"
                defaultValue={product.buy_price}
              />
              <LabeledInput
                id="sell_price"
                label="Sell price (Rs)"
                name="sell_price"
                type="number"
                defaultValue={product.sell_price}
              />
            </div>
          ) : (
            <div>
              <InfoRow label="Product name" value={product.product_name} />
              <InfoRow label="Type / model" value={product.product_type} />
              <InfoRow
                label="Category"
                value={
                  <span className="capitalize">{product.product_category}</span>
                }
              />
              <InfoRow
                label="Cost price"
                value={formatCurrency(product.buy_price)}
              />
              <InfoRow
                label="Sell price"
                value={formatCurrency(product.sell_price)}
              />
            </div>
          )}
        </AnimatedCard>

        {isEditing ? (
          <AnimatedCard>
            <CardHeader title="Product image" />
            <ImageDropzone
              name="image_file"
              previewUrl={newImagePreviewUrl}
              onChange={handleFileChange}
            />
          </AnimatedCard>
        ) : (
          <AnimatedCard>
            <CardHeader title="Supplier" />
            <InfoRow label="Name" value={product.supplier?.supplier_name} />
            <InfoRow
              label="Contact"
              value={
                product.supplier?.contact_number ? (
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    title="Copy number"
                    className="group inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-navy-600"
                  >
                    {isCopied
                      ? "Copied!"
                      : formatDisplayPhoneNumber(product.supplier.contact_number)}
                    {isCopied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                ) : undefined
              }
            />
            <InfoRow
              label="Purchase link"
              value={
                link ? (
                  <Link
                    href={formatPurchaseLink(link)}
                    target="_blank"
                    className="link inline-flex max-w-44 items-center gap-1"
                  >
                    <span className="truncate">{link}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </Link>
                ) : undefined
              }
            />
          </AnimatedCard>
        )}
      </div>

      <Modal
        isOpen={stockMode !== null}
        onClose={closeStock}
        title={isAdding ? "Add stock" : "Reduce stock"}
        description={
          isAdding
            ? `Put units of ${product.product_name} into stock without a purchase order.`
            : `Take units of ${product.product_name} out of stock without a sale.`
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeStock}
              disabled={isAdjusting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdjustStock}
              disabled={!stockValid || isAdjusting}
            >
              {isAdjusting ? "Saving…" : isAdding ? "Add stock" : "Reduce stock"}
            </Button>
          </>
        }
      >
        <LabeledInput
          id="stock_quantity"
          label={isAdding ? "Quantity to add" : "Quantity to remove"}
          type="number"
          min={1}
          max={isAdding ? undefined : product.amount_stock}
          step={1}
          autoFocus
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdjustStock();
            }
          }}
        />
        <p className="text-xs text-muted">
          In stock: {product.amount_stock}
          {stockValid && ` → ${stockAfter} after`}
          {stockQty !== "" &&
            !stockValid &&
            (isAdding
              ? " · enter a whole number above zero"
              : ` · enter a whole number from 1 to ${product.amount_stock}`)}
        </p>
      </Modal>
    </Container>
  );
}
