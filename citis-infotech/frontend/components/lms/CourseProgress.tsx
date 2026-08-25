import { CheckCircle2, Circle } from "lucide-react";

interface CourseProgressProps {
  value: number;
  completedLessons?: number;
  totalLessons?: number;
  compact?: boolean;
}

export function CourseProgress({ value, completedLessons, totalLessons, compact = false }: CourseProgressProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Course progress</span>
        <span className="font-semibold text-primary">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      {completedLessons !== undefined && totalLessons !== undefined && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {value === 100 ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <Circle className="size-3.5 text-primary" />}
          {completedLessons} of {totalLessons} lessons complete
        </div>
      )}
    </div>
  );
}