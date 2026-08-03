// Score Weighting Constants for Overall Pilot Readiness
export const WEIGHT_PRODUCTION = 0.20;
export const WEIGHT_QUALITY = 0.25;
export const WEIGHT_PROCESS_PERFORMANCE = 0.20;
export const WEIGHT_READINESS = 0.15;
export const WEIGHT_AI_HEALTH = 0.20;

// Recommendation Threshold Constants
export const THRESHOLD_MASS_PROD_OVERALL = 85;
export const THRESHOLD_MASS_PROD_QUALITY = 88;
export const THRESHOLD_MASS_PROD_AI_HEALTH = 85;

export const THRESHOLD_MINOR_IMPROVEMENT_MIN_OVERALL = 70;
export const THRESHOLD_MINOR_IMPROVEMENT_MIN_QUALITY = 75;

export const THRESHOLD_CRITICAL_REJECTION_OVERALL = 50;

// Polarity rules map
export const METRIC_POLARITY = {
  oee: "higher_is_better",
  fpy: "higher_is_better",
  defectRate: "lower_is_better",
  overallReadiness: "higher_is_better",
  aiHealth: "higher_is_better",
  scrapRate: "lower_is_better",
  reworkRate: "lower_is_better",
} as const;

/**
 * Calculates Production Readiness score (Section 6) as weighted mean of 6 checks
 */
export function calculateReadinessScore(checks: {
  equipmentReadiness: boolean;
  toolingReadiness: boolean;
  operatorReadiness: boolean;
  materialReadiness: boolean;
  safetyReadiness: boolean;
  documentationComplete: boolean;
}): number {
  const values = [
    checks.equipmentReadiness ? 100 : 0,
    checks.toolingReadiness ? 100 : 0,
    checks.operatorReadiness ? 100 : 0,
    checks.materialReadiness ? 100 : 0,
    checks.safetyReadiness ? 100 : 0,
    checks.documentationComplete ? 100 : 0,
  ];
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
}

/**
 * Calculates Overall Pilot Readiness score
 * (Production x 0.20) + (Quality x 0.25) + (Process Performance x 0.20) + (Readiness x 0.15) + (AI Health x 0.20)
 */
export function calculateOverallPilotReadiness(scores: {
  productionScore: number;
  qualityScore: number;
  performanceScore: number;
  readinessScore: number;
  aiHealthScore: number;
}): number {
  const overall =
    scores.productionScore * WEIGHT_PRODUCTION +
    scores.qualityScore * WEIGHT_QUALITY +
    scores.performanceScore * WEIGHT_PROCESS_PERFORMANCE +
    scores.readinessScore * WEIGHT_READINESS +
    scores.aiHealthScore * WEIGHT_AI_HEALTH;
  return Math.round(overall);
}

export type RecommendationType =
  | "Release for Mass Production"
  | "Minor Improvements Recommended"
  | "Additional Pilot Recommended"
  | "Not Recommended for Release";

/**
 * Derives aggregate recommendation pill from overall metrics
 */
export function calculateRecommendation(
  overallScore: number,
  qualityScore: number,
  aiHealthScore: number
): RecommendationType {
  if (
    overallScore >= THRESHOLD_MASS_PROD_OVERALL &&
    qualityScore >= THRESHOLD_MASS_PROD_QUALITY &&
    aiHealthScore >= THRESHOLD_MASS_PROD_AI_HEALTH
  ) {
    return "Release for Mass Production";
  }

  if (
    (overallScore >= THRESHOLD_MINOR_IMPROVEMENT_MIN_OVERALL && overallScore < THRESHOLD_MASS_PROD_OVERALL) ||
    (qualityScore >= THRESHOLD_MINOR_IMPROVEMENT_MIN_QUALITY && qualityScore <= THRESHOLD_MASS_PROD_QUALITY)
  ) {
    return "Minor Improvements Recommended";
  }

  if (overallScore < THRESHOLD_CRITICAL_REJECTION_OVERALL) {
    return "Not Recommended for Release";
  }

  return "Additional Pilot Recommended";
}

/**
 * Helper to compute Defect Rate label and semantic color
 */
export function getDefectRateSemantic(defectRate: number) {
  if (defectRate <= 1.0) {
    return { label: "Low", isGood: true, badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  } else if (defectRate <= 3.0) {
    return { label: "Moderate", isGood: false, badgeClass: "text-amber-700 bg-amber-50 border-amber-200" };
  }
  return { label: "High", isGood: false, badgeClass: "text-rose-700 bg-rose-50 border-rose-200" };
}
