import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-success/10 text-success ring-success/20",
  posted: "bg-success/10 text-success ring-success/20",
  online: "bg-success/10 text-success ring-success/20",
  active: "bg-success/10 text-success ring-success/20",
  operational: "bg-success/10 text-success ring-success/20",
  approved: "bg-accent/15 text-accent-foreground ring-accent/25",
  pending: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  degraded: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  maintenance: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  "due soon": "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
  inactive: "bg-muted text-muted-foreground ring-border",
  canceled: "bg-muted text-muted-foreground ring-border",
  "credit memo": "bg-muted text-muted-foreground ring-border",
  overdue: "bg-destructive/10 text-destructive ring-destructive/20",
  offline: "bg-destructive/10 text-destructive ring-destructive/20",
  // "info" tone — in-progress/neutral-informational states that aren't
  // fully resolved (success) but aren't a warning either, e.g. "Partially
  // Paid". Same blue already used for neutral KPI icons (#3B82F6).
  "partially paid": "bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/20",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cls = TONES[key] ?? "bg-secondary text-secondary-foreground ring-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
