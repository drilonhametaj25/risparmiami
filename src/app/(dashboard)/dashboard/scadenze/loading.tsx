import { Skeleton } from "@/components/ui/skeleton";

export default function ScadenzeLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
