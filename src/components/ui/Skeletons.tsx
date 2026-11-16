/**
 * Loading placeholders that mirror the real page layouts, so content swaps in
 * without the page jumping. Used by the route-level `loading.tsx` files.
 */

function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/** Wraps a whole skeleton page and announces the loading state to screen readers. */
export function SkeletonPage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className={className}>
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Title + description on the left, optional action button(s) on the right. */
export function SkeletonPageHeader({ actions = 1 }: { actions?: number }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Bone className="h-7 w-44" />
        <Bone className="mt-2 h-4 w-72 max-w-full" />
      </div>
      {actions > 0 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Bone key={i} className="h-10 w-32 rounded-full" />
          ))}
        </div>
      )}
    </div>
  );
}

export function SkeletonStatTile({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-4.5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <Bone className="h-3.5 w-20" />
        <Bone className="size-9 rounded-xl" />
      </div>
      <Bone className="mt-2 h-7 w-28" />
      <Bone className="mt-2 h-3 w-24" />
    </div>
  );
}

/** Row of stat tiles. `className` sets the grid columns to match the real page. */
export function SkeletonStatGrid({
  count = 4,
  className = "grid grid-cols-2 gap-3 lg:grid-cols-4",
  firstWide = false,
}: {
  count?: number;
  className?: string;
  /** First tile spans two columns on small screens (inventory overview). */
  firstWide?: boolean;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatTile
          key={i}
          className={firstWide && i === 0 ? "col-span-2 lg:col-span-1" : ""}
        />
      ))}
    </div>
  );
}

/** Card with a heading, an optional toolbar control and table rows. */
export function SkeletonTableCard({
  rows = 6,
  columns = 5,
  toolbar = true,
  className = "",
}: {
  rows?: number;
  columns?: number;
  toolbar?: boolean;
  className?: string;
}) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <Bone className="h-5 w-36" />
          <Bone className="mt-2 h-3 w-48" />
        </div>
        {toolbar && <Bone className="h-9 w-24 rounded-full" />}
      </div>
      <div className="border-t border-line">
        <div className="flex items-center gap-4 bg-canvas/60 px-5 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Bone
              key={i}
              className={`h-3 flex-1 ${i > 2 ? "hidden md:block" : ""}`}
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 border-t border-line px-5 py-3.5"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`flex flex-1 items-center gap-3 ${
                  c > 2 ? "hidden md:flex" : ""
                }`}
              >
                {c === 0 && <Bone className="size-9 shrink-0 rounded-lg" />}
                <Bone className={`h-4 ${c === 0 ? "w-full" : "w-3/4"}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card with a heading and a chart-shaped block. */
export function SkeletonChartCard({
  className = "",
  height = "h-64",
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Bone className="h-5 w-40" />
          <Bone className="mt-2 h-3 w-52 max-w-full" />
        </div>
        <Bone className="h-7 w-28 rounded-full" />
      </div>
      <Bone className={`w-full rounded-xl ${height}`} />
    </div>
  );
}

/** Card with a heading and a short list of image + two-line rows. */
export function SkeletonListCard({
  rows = 4,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      <Bone className="h-5 w-32" />
      <Bone className="mt-2 h-3 w-44" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="size-10 shrink-0 rounded-lg" />
            <div className="flex-1">
              <Bone className="h-4 w-3/4" />
              <Bone className="mt-1.5 h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stacked label + input placeholders. */
export function SkeletonFormFields({ fields = 3 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Bone className="h-3.5 w-24" />
          <Bone className="mt-2 h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export { Bone as Skeleton };
