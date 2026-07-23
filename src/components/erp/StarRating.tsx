import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===========================================================================
   StarRating — 1..10 rating shown as 5 half-fillable stars + numeric readout
   ---------------------------------------------------------------------------
   The design system had no rating control, so this is the shared one. It stores
   a 1–10 value (matching the Idea Management ratings) but renders 5 stars, each
   worth 2 points, with half-star precision. Interactive and keyboard-accessible
   (role="slider"). `invert` flips the color meaning for "lower is better"
   fields (Risk Level, Complexity) so a high score reads as a warning.
   =========================================================================== */

export type StarRatingProps = {
  value: number; // 1..10
  onChange?: (value: number) => void;
  readOnly?: boolean;
  /** Lower-is-better field: high values render in a warning/danger colour. */
  invert?: boolean;
  size?: "sm" | "md";
  /** Show the numeric "/10" value beside the stars. */
  showValue?: boolean;
  "aria-label"?: string;
};

const STAR_COUNT = 5;
const MAX = 10;

export function StarRating({
  value,
  onChange,
  readOnly = false,
  invert = false,
  size = "md",
  showValue = true,
  "aria-label": ariaLabel,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  const starPx = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  // Colour: normal = amber; invert = green (low) → amber → red (high).
  const fillColor = invert
    ? shown >= 7
      ? "text-destructive"
      : shown >= 4
        ? "text-[#F59E0B]"
        : "text-[#22C55E]"
    : "text-[#F59E0B]";

  const commit = (v: number) => {
    if (readOnly || !onChange) return;
    onChange(Math.max(1, Math.min(MAX, v)));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commit(value + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commit(value - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(1);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(MAX);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        role={readOnly ? undefined : "slider"}
        aria-label={ariaLabel}
        aria-valuemin={readOnly ? undefined : 1}
        aria-valuemax={readOnly ? undefined : MAX}
        aria-valuenow={readOnly ? undefined : value}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={handleKey}
        onMouseLeave={() => setHover(null)}
        className={cn(
          "inline-flex items-center gap-0.5 rounded outline-none",
          !readOnly && "cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {Array.from({ length: STAR_COUNT }).map((_, i) => {
          const fillPct = Math.max(0, Math.min(1, (shown - i * 2) / 2)) * 100;
          return (
            <span
              key={i}
              className="relative inline-block"
              onMouseMove={(e) => {
                if (readOnly) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const half = e.clientX - rect.left < rect.width / 2 ? 1 : 2;
                setHover(i * 2 + half);
              }}
              onClick={(e) => {
                if (readOnly) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const half = e.clientX - rect.left < rect.width / 2 ? 1 : 2;
                commit(i * 2 + half);
              }}
            >
              <Star className={cn(starPx, "text-muted-foreground/25")} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                <Star className={cn(starPx, fillColor, "fill-current")} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span
          className={cn(
            "tabular font-semibold text-foreground",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
}
