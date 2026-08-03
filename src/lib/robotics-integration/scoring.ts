import type { RoboticsRecommendationOption } from "./types";

export const WEIGHT_CELL_READINESS = 0.20;
export const WEIGHT_INTEGRATION = 0.20;
export const WEIGHT_PROGRAMMING = 0.20;
export const WEIGHT_VALIDATION = 0.20;
export const WEIGHT_COMMISSIONING = 0.10;
export const WEIGHT_AI_HEALTH = 0.10;

/**
 * Section 2: Calculate Cell Readiness Score
 */
export function calculateCellReadinessScore(data: {
  hasLayout: boolean;
  hasRobotModel: boolean;
  hasPayloadAndReach: boolean;
  hasDof: boolean;
  hasEoat: boolean;
  hasSafetyZone: boolean;
}): number {
  let pts = 0;
  if (data.hasLayout) pts += 15;
  if (data.hasRobotModel) pts += 20;
  if (data.hasPayloadAndReach) pts += 15;
  if (data.hasDof) pts += 10;
  if (data.hasEoat) pts += 15;
  if (data.hasSafetyZone) pts += 25;
  return Math.min(100, pts);
}

/**
 * Section 3: Calculate System Integration Score
 */
export function calculateIntegrationScore(data: {
  plc: boolean;
  scada: boolean;
  mes: boolean;
  erp: boolean;
  vision: boolean;
  iiot: boolean;
  digitalTwin: boolean;
}): number {
  const count = [
    data.plc,
    data.scada,
    data.mes,
    data.erp,
    data.vision,
    data.iiot,
    data.digitalTwin,
  ].filter(Boolean).length;

  return Math.round((count / 7) * 100);
}

/**
 * Section 4: Calculate Programming Score
 */
export function calculateProgrammingScore(data: {
  hasRobotProgram: boolean;
  hasMotionSequence: boolean;
  pathOptimized: boolean;
  collisionDetected: boolean;
  cycleTimeSec: number;
}): number {
  let pts = 0;
  if (data.hasRobotProgram) pts += 25;
  if (data.hasMotionSequence) pts += 25;
  if (data.pathOptimized) pts += 15;
  if (data.collisionDetected) pts += 15;

  const cyclePts = data.cycleTimeSec > 0 ? Math.min(20, (50 / data.cycleTimeSec) * 20) : 10;
  return Math.round(pts + cyclePts);
}

/**
 * Section 5: Calculate Validation Score
 */
export function calculateValidationScore(data: {
  simulationCompleted: boolean;
  offlineVerified: boolean;
  fatCompleted: boolean;
  satCompleted: boolean;
  safetyValidation: boolean;
  performanceValidation: boolean;
  oeeImprovementPct: number;
}): number {
  const checkedCount = [
    data.simulationCompleted,
    data.offlineVerified,
    data.fatCompleted,
    data.satCompleted,
    data.safetyValidation,
    data.performanceValidation,
  ].filter(Boolean).length;

  const checkPts = (checkedCount / 6) * 70;
  const oeePts = Math.min(30, (data.oeeImprovementPct / 30) * 30);
  return Math.round(checkPts + oeePts);
}

/**
 * Section 6: Calculate Commissioning Score
 */
export function calculateCommissioningScore(data: {
  installationStatus: string;
  robotCalibration: boolean;
  operatorTraining: boolean;
  maintenanceTraining: boolean;
  sopUpdated: boolean;
  productionHandover: boolean;
}): number {
  let count = [
    data.robotCalibration,
    data.operatorTraining,
    data.maintenanceTraining,
    data.sopUpdated,
    data.productionHandover,
  ].filter(Boolean).length;

  const installPts =
    data.installationStatus === "Installed" || data.installationStatus === "Handover Complete"
      ? 20
      : 0;

  return Math.round(installPts + (count / 5) * 80);
}

/**
 * Section 8: Calculate Overall Robotics Readiness
 */
export function calculateOverallRoboticsReadiness(scores: {
  cellReadinessScore: number;
  integrationScore: number;
  programmingScore: number;
  validationScore: number;
  commissioningScore: number;
  aiHealthScore: number;
}): number {
  const overall =
    scores.cellReadinessScore * WEIGHT_CELL_READINESS +
    scores.integrationScore * WEIGHT_INTEGRATION +
    scores.programmingScore * WEIGHT_PROGRAMMING +
    scores.validationScore * WEIGHT_VALIDATION +
    scores.commissioningScore * WEIGHT_COMMISSIONING +
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
): RoboticsRecommendationOption {
  if (overallScore >= 82 && validationScore >= 80 && commissioningScore >= 75) {
    return "Approve Robotics Integration";
  }
  if (overallScore >= 65) {
    return "Deploy After Minor Improvements";
  }
  if (overallScore >= 45) {
    return "Redesign & Revalidate";
  }
  return "Reject Project";
}

/**
 * Format INR currency with standard Indian grouping
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
