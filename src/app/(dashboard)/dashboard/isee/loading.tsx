import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
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
