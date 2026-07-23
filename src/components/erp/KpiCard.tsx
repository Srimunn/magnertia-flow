import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIWidgetCard } from "@/widgets/components/WidgetCustomizer";

type Tone = "default" | "success" | "warning" | "danger";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  const toneRing = {
    default: "bg-secondary text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <KPIWidgetCard label={label} value={value} className="card-soft p-5" actionsPosition="right">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground"
            title={label}
          >
            {label}
          </div>
          <div
            className="mt-2 truncate font-display text-2xl font-bold tracking-tight text-foreground"
            title={value}
          >
            {value}
          </div>
          {hint && (
            <div className="mt-1 truncate text-xs text-muted-foreground" title={hint}>
              {hint}
            </div>
          )}
        </div>
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200 group-hover:opacity-0 group-hover:scale-75",
            toneRing,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5",
              delta.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </KPIWidgetCard>
  );
}
