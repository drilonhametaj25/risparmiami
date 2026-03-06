import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Savings overview skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Priority actions skeleton */}
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-64 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
