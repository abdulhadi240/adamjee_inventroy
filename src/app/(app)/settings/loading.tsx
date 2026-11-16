import {
  Skeleton,
  SkeletonFormFields,
  SkeletonPage,
  SkeletonPageHeader,
} from "@/components/ui/Skeletons";

export default function SettingsLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl">
      <SkeletonPageHeader />
      <div className="card p-5">
        <div className="mb-5 flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>
        </div>
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div>
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        </div>
        <SkeletonFormFields fields={2} />
        <Skeleton className="mt-6 h-10 w-32 rounded-full" />
      </div>
    </SkeletonPage>
  );
}
