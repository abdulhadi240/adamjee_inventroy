import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonTableCard,
} from "@/components/ui/Skeletons";

export default function CustomersLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader />
      <SkeletonTableCard rows={8} columns={4} toolbar={false} />
    </SkeletonPage>
  );
}
