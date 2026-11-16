import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function OrdersLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader />
      <div className="flex flex-col gap-5">
        <SkeletonStatGrid count={4} />
        <SkeletonTableCard rows={8} columns={6} />
      </div>
    </SkeletonPage>
  );
}
