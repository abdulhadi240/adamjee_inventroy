import {
  Skeleton,
  SkeletonFormFields,
  SkeletonPage,
} from "@/components/ui/Skeletons";

export default function AuthLoading() {
  return (
    <SkeletonPage className="w-full max-w-sm">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 mb-7 h-4 w-60 max-w-full" />
      <SkeletonFormFields fields={2} />
      <Skeleton className="mt-6 h-11 w-full rounded-full" />
    </SkeletonPage>
  );
}
