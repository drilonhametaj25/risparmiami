import { Skeleton } from "@/components/ui/skeleton";

export default function AzioniLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Progress bar skeleton */}
      <div className="bg-white rounded-lg border border-border-light p-6 mb-6">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Actions skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-72 mb-1" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
