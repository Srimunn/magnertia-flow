import type { CSSProperties } from "react";
import type { WidgetDefinition, WidgetInstance, WidgetSize, WidgetSpan } from "./types";

/* ===========================================================================
   Grid math
   ---------------------------------------------------------------------------
   The spec asks for a 12-column desktop grid. We present that language to users
   but implement on 60 columns, because 60 is the LCM of 3/4/5 — the only way a
   5-across KPI row (12 each), thirds (20), quarters (15) and halves (30) can
   all be integer spans. A literal 12-column grid cannot express "one fifth",
   which every existing KPI row in this app uses.

   See the `widget-grid` utility in styles.css for the consuming CSS.
   =========================================================================== */

/** Desktop (>=1280px) column count. */
export const XL_COLUMNS = 60;
/** Tablet/laptop (>=768px) column count. */
export const MD_COLUMNS = 6;

/** Preset spans per size. `auto` resolves to the definition's defaultSize. */
export const SIZE_SPANS: Record<Exclude<WidgetSize, "auto">, Required<WidgetSpan>> = {
  sm: { md: 3, lg: 2, xl: 12 }, //  1/5 of a desktop row  — KPI cards
  md: { md: 3, lg: 3, xl: 20 }, //  1/3
  lg: { md: 6, lg: 3, xl: 30 }, //  1/2
  xl: { md: 6, lg: 4, xl: 40 }, //  2/3
  full: { md: 6, lg: 6, xl: 60 }, // full width
};

export const SIZE_LABELS: Record<WidgetSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra Large",
  full: "Full Width",
  auto: "Auto",
};

export const SIZE_HINTS: Record<WidgetSize, string> = {
  sm: "One fifth of a row",
  md: "One third of a row",
  lg: "Half a row",
  xl: "Two thirds of a row",
  full: "Entire row",
  auto: "Widget decides",
};

/** Every size a user can pick, in display order. */
export const ALL_SIZES: WidgetSize[] = ["sm", "md", "lg", "xl", "full", "auto"];

/** Resolve `auto` to the concrete preset the definition prefers. */
export function resolveSize(size: WidgetSize, def: WidgetDefinition): Exclude<WidgetSize, "auto"> {
  if (size !== "auto") return size;
  return def.defaultSize === "auto" ? "md" : def.defaultSize;
}

/**
 * Final spans for an instance. `spanOverride` wins so default layouts can hit
 * spans the presets don't cover (e.g. quarter-width at 15/60).
 */
export function resolveSpan(instance: WidgetInstance, def: WidgetDefinition): Required<WidgetSpan> {
  const preset = SIZE_SPANS[resolveSize(instance.size, def)];
  return {
    md: instance.spanOverride?.md ?? preset.md,
    lg: instance.spanOverride?.lg ?? preset.lg,
    xl: instance.spanOverride?.xl ?? preset.xl,
  };
}

/**
 * Inline custom properties consumed by the `widget-grid` utility. Tailwind can't
 * emit runtime-computed span classes, so spans travel as CSS variables.
 */
export function spanStyle(instance: WidgetInstance, def: WidgetDefinition): CSSProperties {
  const span = resolveSpan(instance, def);
  return {
    "--ws-md": span.md,
    "--ws-lg": span.lg,
    "--ws-xl": span.xl,
  } as CSSProperties;
}

/** Next size in the allowed list — powers click-to-cycle on the resize handle. */
export function nextSize(current: WidgetSize, allowed: WidgetSize[]): WidgetSize {
  if (allowed.length === 0) return current;
  const i = allowed.indexOf(current);
  return allowed[(i + 1) % allowed.length];
}

/**
 * Nearest preset for a dragged width, used to snap the resize handle.
 * `ratio` is the dragged width as a fraction of the row (0..1].
 */
export function snapToSize(
  ratio: number,
  allowed: WidgetSize[],
  def: WidgetDefinition,
): WidgetSize {
  const candidates = allowed.filter((s) => s !== "auto");
  if (candidates.length === 0) return def.defaultSize;

  const targetXl = Math.max(1, Math.min(XL_COLUMNS, Math.round(ratio * XL_COLUMNS)));
  let best = candidates[0];
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const size of candidates) {
    const delta = Math.abs(SIZE_SPANS[size as Exclude<WidgetSize, "auto">].xl - targetXl);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = size;
    }
  }
  return best;
}
