import {
  Skeleton,
  SkeletonChartCard,
  SkeletonListCard,
  SkeletonPage,
  SkeletonStatGrid,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function DashboardLoading() {
  return (
    <SkeletonPage className="flex flex-col gap-4">
      {/* Hero */}
      <div className="card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-7 w-56" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-xl lg:w-[440px]" />
        </div>
      </div>

      <SkeletonStatGrid count={4} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SkeletonChartCard className="lg:col-span-2" />
        <SkeletonChartCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SkeletonTableCard className="lg:col-span-2" rows={5} columns={4} />
        <div className="flex flex-col gap-4">
          <SkeletonListCard rows={3} />
          <SkeletonListCard rows={2} />
        </div>
      </div>
    </SkeletonPage>
  );
}
