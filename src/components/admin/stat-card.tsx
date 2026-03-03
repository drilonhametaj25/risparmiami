import { Card } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-text-secondary">{label}</p>
        <Icon className="h-4 w-4 text-text-muted" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
    </Card>
  );
}
