import {
  SkeletonChartCard,
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function ReportsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actions={2} />
      <div className="flex flex-col gap-4">
        <SkeletonStatGrid
          count={4}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        />
        <SkeletonChartCard height="h-80" />
        <SkeletonTableCard rows={5} columns={3} toolbar={false} />
      </div>
    </SkeletonPage>
  );
}
