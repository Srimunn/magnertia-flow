import type { WasteItem, BeforeAfterMetric, KaizenActivityRow, RecommendationOption } from "./types";

// Executive Weights for Overall Lean Readiness
export const WEIGHT_PROCESS_EFFICIENCY = 0.20;
export const WEIGHT_OPERATIONAL = 0.20;
export const WEIGHT_CONTINUOUS_IMPROVEMENT = 0.20;
export const WEIGHT_AI_LEAN = 0.20;
export const WEIGHT_INVERTED_WASTE_SEVERITY = 0.20;

// Polarity map
export const LEAN_METRIC_POLARITY = {
  wasteSeverityScore: "lower_is_better",
  processEfficiencyScore: "higher_is_better",
  operationalScore: "higher_is_better",
  continuousImprovementScore: "higher_is_better",
  aiLeanHealthScore: "higher_is_better",
  overallLeanReadiness: "higher_is_better",
} as const;

/**
 * Returns color bracket for Waste Severity Score (INVERTED: lower is better)
 */
export function getWasteSeverityColorBand(score: number) {
  if (score <= 30) {
    return { label: "Low", colorClass: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", ringColor: "#10b981" };
  }
  if (score <= 60) {
    return { label: "Moderate", colorClass: "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", ringColor: "#f59e0b" };
  }
  if (score <= 80) {
    return { label: "High", colorClass: "text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300", ringColor: "#f43f5e" };
  }
  return { label: "Critical", colorClass: "text-rose-900 bg-rose-200 dark:bg-rose-950 dark:text-rose-200", ringColor: "#991b1b" };
}

/**
 * Section 2: Calculate Waste Severity Score (8 wastes DOWNTIME framework)
 * Contribution: High = 15, Medium = 8, Low = 3, Unchecked = 0
 */
export function calculateWasteSeverityScore(wastes: Record<string, WasteItem>): number {
  let sum = 0;
  Object.values(wastes).forEach((w) => {
    if (w.checked) {
      if (w.severity === "High") sum += 15;
      else if (w.severity === "Medium") sum += 8;
      else sum += 3;
    }
  });

  const scaled = Math.round(sum * 1.5);
  return Math.min(100, Math.max(0, scaled));
}

/**
 * Section 3: Calculate Process Efficiency Score
 */
export function calculateProcessEfficiencyScore(data: {
  cycleTimeSec: number;
  taktTimeSec: number;
  valueAddedRatio: number;
  leadTimeHr: number;
}): number {
  const taktRatio = data.taktTimeSec > 0 ? Math.min(1, data.taktTimeSec / data.cycleTimeSec) * 40 : 20;
  const vaRatio = Math.min(40, (data.valueAddedRatio / 50) * 40);
  const leadTimeScore = Math.max(0, 20 - data.leadTimeHr);
  return Math.round(taktRatio + vaRatio + leadTimeScore);
}

/**
 * Section 5: Calculate Operational Performance Score from Before/After Deltas
 */
export function calculateOperationalScore(metrics: BeforeAfterMetric[]): number {
  if (!metrics || metrics.length === 0) return 80;

  let totalScore = 0;
  metrics.forEach((m) => {
    let score = 50;
    if (m.polarity === "higher_is_better") {
      score += Math.min(50, Math.max(-50, m.improvementPct * 2.5));
    } else {
      score += Math.min(50, Math.max(-50, Math.abs(m.improvementPct) * 1.5));
    }
    totalScore += Math.max(0, Math.min(100, score));
  });

  return Math.round(totalScore / metrics.length);
}

/**
 * Section 6: Calculate Continuous Improvement Score
 */
export function calculateContinuousImprovementScore(activities: KaizenActivityRow[]): number {
  if (!activities || activities.length === 0) return 0;
  let pts = 0;
  activities.forEach((a) => {
    if (a.status === "Completed") pts += 100;
    else if (a.status === "In Progress") pts += 50;
  });
  return Math.round(pts / activities.length);
}

/**
 * Section 8: Overall Lean Readiness (Weighted Mean with Inverted Waste Severity)
 */
export function calculateOverallLeanReadiness(scores: {
  processEfficiencyScore: number;
  operationalScore: number;
  continuousImprovementScore: number;
  aiLeanHealthScore: number;
  wasteSeverityScore: number;
}): number {
  const invertedWaste = 100 - scores.wasteSeverityScore;

  const overall =
    scores.processEfficiencyScore * WEIGHT_PROCESS_EFFICIENCY +
    scores.operationalScore * WEIGHT_OPERATIONAL +
    scores.continuousImprovementScore * WEIGHT_CONTINUOUS_IMPROVEMENT +
    scores.aiLeanHealthScore * WEIGHT_AI_LEAN +
    invertedWaste * WEIGHT_INVERTED_WASTE_SEVERITY;

  return Math.round(overall);
}

/**
 * Calculates computed recommendation suggestion hint for executive guidance
 */
export function getRecommendationSuggestion(
  overallScore: number,
  expectedCostSaving: number,
  realizedCostSaving?: number
): RecommendationOption {
  const isSavingRealized = realizedCostSaving ? (realizedCostSaving / expectedCostSaving) >= 0.8 : true;

  if (overallScore >= 80 && isSavingRealized) {
    return "Scale Across Lines";
  }

  if (overallScore >= 60) {
    return "Pilot Test in Another Area";
  }

  if (overallScore < 60) {
    return "Rework Project";
  }

  return "Sustain Current State";
}

/**
 * Indian Currency Formatter (Lakh/Crore style: ₹12,45,000)
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
