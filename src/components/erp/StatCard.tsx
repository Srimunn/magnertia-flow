import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { KPIWidgetCard } from "@/widgets/components/WidgetCustomizer";

export type StatDelta = { label: string; direction: "up" | "down"; tone: "positive" | "negative" };

// Icon-left KPI card ("Convention A") — the pattern used on pages that were
// built from a pixel mockup (Dashboard, Transactions). Distinct from the
// icon-top-right KpiCard used by the older scaffolded pages — see
// design-system.md for which one to use where.
// muted (default) = plain gray caption, no semantic weight (e.g. "This Year").
// positive/negative = colored caption with NO arrow icon, for figures that
// carry meaning on their own without an up/down comparison (e.g. "24.18% of
// Total" on an Overdue Amount card) — distinct from `delta`, which always
// pairs a color with an arrow for a vs.-previous-period comparison.
export type CaptionTone = "muted" | "positive" | "negative";

export function StatCard({
  label,
  value,
  delta,
  neutralText,
  captionTone = "muted",
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  delta?: StatDelta;
  neutralText?: string;
  captionTone?: CaptionTone;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  const captionColor =
    captionTone === "positive"
      ? "text-[#22C55E]"
      : captionTone === "negative"
        ? "text-[#EF4444]"
        : "text-muted-foreground";

  return (
    <KPIWidgetCard label={label} value={value} className="card-soft p-5" actionsPosition="left">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconBg} ${iconColor} group-hover:opacity-0 group-hover:scale-75 transition-all duration-200`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium leading-snug text-muted-foreground" title={label}>
            {label}
          </div>
          <div
            className="mt-0.5 truncate font-display text-[22px] font-bold leading-tight text-foreground tabular"
            title={value}
          >
            {value}
          </div>
          {delta && <StatDeltaLine delta={delta} />}
          {neutralText && (
            <div
              className={`mt-1 truncate text-[12px] font-medium ${captionColor}`}
              title={neutralText}
            >
              {neutralText}
            </div>
          )}
        </div>
      </div>
    </KPIWidgetCard>
  );
}

export function StatDeltaLine({ delta }: { delta: StatDelta }) {
  const color = delta.tone === "positive" ? "text-[#22C55E]" : "text-[#EF4444]";
  const Arrow = delta.direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={`mt-1 flex items-center gap-1 text-[12px] font-medium ${color}`}
      title={delta.label}
    >
      <Arrow className="h-3 w-3 shrink-0" /> <span className="truncate">{delta.label}</span>
    </div>
  );
}
