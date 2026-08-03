import type { AutomationRecommendationOption } from "./types";

export const WEIGHT_PRODUCTIVITY = 0.25;
export const WEIGHT_QUALITY_IMPROVEMENT = 0.20;
export const WEIGHT_COST_SAVING = 0.20;
export const WEIGHT_ENERGY_EFFICIENCY = 0.15;
export const WEIGHT_AI_HEALTH = 0.20;

/**
 * Section 2: Calculate Process Readiness Score
 */
export function calculateProcessReadinessScore(data: {
  currentCycleSec: number;
  targetCycleSec: number;
  automationPotential: number;
}): number {
  const reductionPct =
    data.currentCycleSec > 0
      ? ((data.currentCycleSec - data.targetCycleSec) / data.currentCycleSec) * 100
      : 30;
  const reductionPts = Math.min(50, Math.max(0, reductionPct * 1.2));
  const potentialPts = Math.min(50, Math.max(0, (data.automationPotential / 100) * 50));
  return Math.round(reductionPts + potentialPts);
}

/**
 * Section 4: Calculate Development Score
 */
export function calculateDevelopmentScore(data: {
  hasElectricalDesign: boolean;
  hasPlcProgram: boolean;
  hasHmiScreens: boolean;
  hasScadaConfig: boolean;
  hasRobotProgram: boolean;
  iiotStatus: string;
  cybersecurityStatus: string;
}): number {
  let pts = 0;
  if (data.hasElectricalDesign) pts += 15;
  if (data.hasPlcProgram) pts += 20;
  if (data.hasHmiScreens) pts += 15;
  if (data.hasScadaConfig) pts += 15;
  if (data.hasRobotProgram) pts += 15;
  if (data.iiotStatus === "Connected") pts += 10;
  if (data.cybersecurityStatus === "Validated") pts += 10;
  return Math.min(100, pts);
}

/**
 * Section 5: Calculate Validation Score
 */
export function calculateValidationScore(data: {
  fatCompleted: boolean;
  satCompleted: boolean;
  dryRunCompleted: boolean;
  performanceTest: boolean;
  safetyValidation: boolean;
  oeeImprovementPct: number;
}): number {
  const checkedCount = [
    data.fatCompleted,
    data.satCompleted,
    data.dryRunCompleted,
    data.performanceTest,
    data.safetyValidation,
  ].filter(Boolean).length;

  const checkPts = (checkedCount / 5) * 70;
  const oeePts = Math.min(30, (data.oeeImprovementPct / 30) * 30);
  return Math.round(checkPts + oeePts);
}

/**
 * Section 6: Calculate Commissioning Score
 */
export function calculateCommissioningScore(data: {
  installationStatus: string;
  operatorTraining: boolean;
  maintenanceTraining: boolean;
  documentationCompleted: boolean;
  sopUpdated: boolean;
  productionHandover: boolean;
}): number {
  let count = [
    data.operatorTraining,
    data.maintenanceTraining,
    data.documentationCompleted,
    data.sopUpdated,
    data.productionHandover,
  ].filter(Boolean).length;

  if (data.installationStatus === "Installed" || data.installationStatus === "Handover Complete") {
    count += 1;
  }

  return Math.round((count / 6) * 100);
}

/**
 * Section 8: Calculate Overall Automation Readiness
 */
export function calculateOverallAutomationReadiness(scores: {
  productivityScore: number;
  qualityImprovementScore: number;
  costSavingScore: number;
  energyEfficiencyScore: number;
  aiHealthScore: number;
}): number {
  const overall =
    scores.productivityScore * WEIGHT_PRODUCTIVITY +
    scores.qualityImprovementScore * WEIGHT_QUALITY_IMPROVEMENT +
    scores.costSavingScore * WEIGHT_COST_SAVING +
    scores.energyEfficiencyScore * WEIGHT_ENERGY_EFFICIENCY +
    scores.aiHealthScore * WEIGHT_AI_HEALTH;

  return Math.round(overall);
}

/**
 * Computes recommendation suggestion hint for executive guidance
 */
export function getRecommendationSuggestion(
  overallScore: number,
  validationScore: number,
  commissioningScore: number
): AutomationRecommendationOption {
  if (overallScore >= 80 && validationScore >= 80 && commissioningScore >= 75) {
    return "Approve Automation Project";
  }
  if (overallScore >= 60) {
    return "Deploy After Minor Improvements";
  }
  if (overallScore >= 40) {
    return "Redesign & Revalidate";
  }
  return "Reject Project";
}

/**
 * Format INR with Crore / Lakh support (e.g. 487500000 -> ₹48,75,00,000 / ₹48.75 Cr)
 */
export function formatINR(amount: number, options?: { style?: "crore" | "full" }): string {
  if (options?.style === "crore" && amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr} Cr`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
