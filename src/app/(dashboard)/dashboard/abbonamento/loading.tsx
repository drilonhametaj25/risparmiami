import { Skeleton } from "@/components/ui/skeleton";

export default function AbbonamentoLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
