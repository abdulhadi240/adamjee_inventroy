import {
  Skeleton,
  SkeletonPage,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function ProductLoading() {
  return (
    <SkeletonPage>
      <Skeleton className="mb-4 h-4 w-32" />

      {/* Summary card: image + name, prices and stock facts */}
      <div className="card mb-6 grid gap-6 overflow-hidden p-4 md:grid-cols-[280px_1fr] md:p-5">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex min-w-0 flex-col">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-8 w-3/4" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1.5 h-6 w-24" />
              </div>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2.5 pt-5 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[68px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <SkeletonTableCard rows={4} columns={4} toolbar={false} />
    </SkeletonPage>
  );
}
