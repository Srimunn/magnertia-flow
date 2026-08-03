import type { PpapStatusType } from "./types";

// Executive Score Weights for Overall Mass Production Readiness
export const WEIGHT_MANUFACTURING = 0.25;
export const WEIGHT_QUALITY = 0.25;
export const WEIGHT_SUPPLY_CHAIN = 0.20;
export const WEIGHT_OPERATIONS = 0.15;
export const WEIGHT_AI_READINESS = 0.15;

// Recommendation Threshold Constants
export const THRESHOLD_RELEASE_OVERALL = 90;
export const THRESHOLD_RELEASE_QUALITY = 88;
export const THRESHOLD_MINOR_IMPROVEMENT_MIN_OVERALL = 75;
export const THRESHOLD_ADDITIONAL_VALIDATION_MIN_OVERALL = 60;

export type ScoreBand = "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";

/**
 * Returns dynamic score band label based on executive rating brackets
 */
export function getScoreBand(score: number): { label: ScoreBand; colorClass: string; ringColor: string } {
  if (score >= 90) {
    return { label: "Excellent", colorClass: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", ringColor: "#10b981" };
  }
  if (score >= 75) {
    return { label: "Very Good", colorClass: "text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300", ringColor: "#2563eb" };
  }
  if (score >= 60) {
    return { label: "Good", colorClass: "text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300", ringColor: "#9333ea" };
  }
  if (score >= 40) {
    return { label: "Fair", colorClass: "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", ringColor: "#f59e0b" };
  }
  return { label: "Poor", colorClass: "text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300", ringColor: "#f43f5e" };
}

/**
 * Section 2: Manufacturing Readiness Score (7 checked items)
 */
export function calculateManufacturingScore(checks: {
  productionLineQualified: boolean;
  equipmentQualification: boolean;
  toolingQualification: boolean;
  manufacturingCapacityVerified: boolean;
  oeeTargetAchieved: boolean;
  cycleTimeVerified: boolean;
  standardWorkAvailable: boolean;
}): number {
  const values: number[] = Object.values(checks).map((v) => (v ? 100 : 0));
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Section 3: Quality Readiness Score (7 items, 6 checked + PPAP status)
 */
export function calculateQualityScore(checks: {
  pfmeaApproved: boolean;
  controlPlanApproved: boolean;
  spcActive: boolean;
  msaApproved: boolean;
  ppapStatus: PpapStatusType;
  qualityTargetsAchieved: boolean;
  customerRequirementsVerified: boolean;
}): number {
  const ppapVal = checks.ppapStatus === "Customer Approved" ? 100 : checks.ppapStatus === "Submitted" ? 50 : 0;
  const bools = [
    checks.pfmeaApproved,
    checks.controlPlanApproved,
    checks.spcActive,
    checks.msaApproved,
    checks.qualityTargetsAchieved,
    checks.customerRequirementsVerified,
  ].map((v) => (v ? 100 : 0));

  const total = [...bools, ppapVal].reduce((a, b) => a + b, 0);
  return Math.round(total / 7);
}

/**
 * Section 4: Supply Chain Score (6 items)
 */
export function calculateSupplyChainScore(checks: {
  supplierApprovalStatus: string;
  rawMaterialAvailability: boolean;
  safetyStockAvailable: boolean;
  logisticsReadiness: boolean;
  packagingValidation: boolean;
  warehouseReady: boolean;
}): number {
  const supplierVal = checks.supplierApprovalStatus === "Approved" ? 100 : 50;
  const bools = [
    checks.rawMaterialAvailability,
    checks.safetyStockAvailable,
    checks.logisticsReadiness,
    checks.packagingValidation,
    checks.warehouseReady,
  ].map((v) => (v ? 100 : 0));

  const total = [...bools, supplierVal].reduce((a, b) => a + b, 0);
  return Math.round(total / 6);
}

/**
 * Section 6: Operational Readiness Score (6 items)
 */
export function calculateOperationalScore(checks: {
  operatorTrainingCompleted: boolean;
  maintenanceTeamReady: boolean;
  sparePartsAvailable: boolean;
  safetyAuditCompleted: boolean;
  emergencyResponsePlan: boolean;
  itMesReady: boolean;
}): number {
  const values: number[] = Object.values(checks).map((v) => (v ? 100 : 0));
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Section 8: Overall Mass Production Readiness (Weighted Mean)
 */
export function calculateOverallMassProductionReadiness(scores: {
  manufacturingScore: number;
  qualityScore: number;
  supplyChainScore: number;
  operationalScore: number;
  aiReadinessScore: number;
}): number {
  const overall =
    scores.manufacturingScore * WEIGHT_MANUFACTURING +
    scores.qualityScore * WEIGHT_QUALITY +
    scores.supplyChainScore * WEIGHT_SUPPLY_CHAIN +
    scores.operationalScore * WEIGHT_OPERATIONS +
    scores.aiReadinessScore * WEIGHT_AI_READINESS;

  return Math.round(overall);
}

export type MassProductionRecommendationType =
  | "Release for Mass Production"
  | "Minor Improvements Recommended"
  | "Additional Validation Recommended"
  | "Not Recommended for Release";

/**
 * Compute executive recommendation based on overall score, quality score, and PPAP state
 */
export function calculateRecommendation(
  overallScore: number,
  qualityScore: number,
  ppapStatus: PpapStatusType
): MassProductionRecommendationType {
  if (
    overallScore >= THRESHOLD_RELEASE_OVERALL &&
    qualityScore >= THRESHOLD_RELEASE_QUALITY &&
    ppapStatus === "Customer Approved"
  ) {
    return "Release for Mass Production";
  }

  if (overallScore >= THRESHOLD_MINOR_IMPROVEMENT_MIN_OVERALL) {
    return "Minor Improvements Recommended";
  }

  if (overallScore >= THRESHOLD_ADDITIONAL_VALIDATION_MIN_OVERALL) {
    return "Additional Validation Recommended";
  }

  return "Not Recommended for Release";
}
