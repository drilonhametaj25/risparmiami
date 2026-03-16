import { Skeleton } from "@/components/ui/skeleton";

export default function ImpostazioniLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="max-w-2xl space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
