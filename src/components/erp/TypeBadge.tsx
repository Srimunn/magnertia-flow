import { cn } from "@/lib/utils";

// Categorical tag, not a semantic status — colors distinguish types from
// each other, they don't mean good/bad the way StatusBadge's tones do.
// Reuses existing brand/chart tokens rather than introducing new hex values.
const TYPE_TONES: Record<string, string> = {
  invoice: "bg-primary/10 text-primary",
  receipt: "bg-success/10 text-success",
  payment: "bg-[#3B82F6]/10 text-[#3B82F6]",
  bill: "bg-warning/15 text-[oklch(0.45_0.15_75)]",
  "journal entry": "bg-[#EC4899]/10 text-[#EC4899]",
};

export function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_TONES[type.toLowerCase()] ?? "bg-secondary text-secondary-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        cls,
      )}
    >
      {type}
    </span>
  );
}
