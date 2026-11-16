import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function SuppliersLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader />
      <SkeletonTableCard rows={8} columns={5} toolbar={false} />
    </SkeletonPage>
  );
}
