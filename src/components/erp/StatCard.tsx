import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

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
    <div className="card-soft p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-display text-[22px] font-bold leading-tight text-foreground tabular">
            {value}
          </div>
          {delta && <StatDeltaLine delta={delta} />}
          {neutralText && (
            <div className={`mt-1 text-[12px] font-medium ${captionColor}`}>{neutralText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatDeltaLine({ delta }: { delta: StatDelta }) {
  const color = delta.tone === "positive" ? "text-[#22C55E]" : "text-[#EF4444]";
  const Arrow = delta.direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`mt-1 flex items-center gap-1 text-[12px] font-medium ${color}`}>
      <Arrow className="h-3 w-3" /> {delta.label}
    </div>
  );
}
