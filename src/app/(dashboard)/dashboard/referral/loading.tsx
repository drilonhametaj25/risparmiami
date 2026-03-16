import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-6 w-56 mb-3" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </div>
    </div>
  );
}
