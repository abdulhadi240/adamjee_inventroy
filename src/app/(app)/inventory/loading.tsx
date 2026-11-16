import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function InventoryLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader />
      <SkeletonStatGrid
        count={5}
        firstWide
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
      />
      <SkeletonTableCard className="mt-4" rows={8} columns={7} />
    </SkeletonPage>
  );
}
