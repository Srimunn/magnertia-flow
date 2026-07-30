/* ===========================================================================
   Shared categorical chart palette
   ---------------------------------------------------------------------------
   Recharts data series and pie/donut slices reach for this array so every
   chart in the app pulls from the same colorful set. Kept OUTSIDE the brand
   theme — the theme's navy/beige is for chrome (buttons, headers, badges);
   these are for chart *data*. Add colors here to expand the palette; pick
   from here (never hardcode a fresh hex in a chart file).

   Colors chosen for good contrast side-by-side on both light and dark chart
   backgrounds, with an even hue rotation so adjacent series don't blur.
   =========================================================================== */

// Deliberately EXCLUDES the blue family (blue/sky/cyan/indigo) so chart data
// never competes with the brand's navy primary. Warm + violet + green tones only.
export const CHART_COLORS = [
  "#22C55E", // green-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#EC4899", // pink-500
  "#F97316", // orange-500
  "#14B8A6", // teal-500 (leans green)
  "#A855F7", // purple-500
  "#84CC16", // lime-500
  "#EAB308", // yellow-500
  "#F43F5E", // rose-500
  "#D946EF", // fuchsia-500
] as const;

/** Wrap-around lookup so any index (even > palette length) returns a valid color. */
export function chartColor(idx: number): string {
  return CHART_COLORS[Math.abs(idx) % CHART_COLORS.length];
}

/** Slice-friendly aliases so consumers can grab the first N without a slice. */
export const PIE_COLORS = CHART_COLORS;
export const BAR_COLORS = CHART_COLORS;
export const LINE_COLORS = CHART_COLORS;
