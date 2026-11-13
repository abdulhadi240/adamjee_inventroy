import Image from "next/image";
import { PackageOpen } from "lucide-react";

/** True when the product has a real uploaded image (not the legacy placeholder). */
export function hasProductImage(url?: string | null): url is string {
  return !!url && url.trim() !== "" && !url.endsWith("/product.svg");
}

/** Rounded product image tile with a branded placeholder fallback. */
export default function ProductThumb({
  src,
  alt,
  size = 40,
  className = "",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-line bg-canvas ${className}`}
      style={{ width: size, height: size }}
    >
      {hasProductImage(src) ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <PackageOpen
          className="absolute inset-0 m-auto text-navy-400"
          style={{ width: size * 0.42, height: size * 0.42 }}
          strokeWidth={1.7}
        />
      )}
    </div>
  );
}
