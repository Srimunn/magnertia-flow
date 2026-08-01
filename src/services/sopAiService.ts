import type { SopAiAssessmentResult, SopRecord } from "./types";

export async function analyzeSOP(
  record: Partial<SopRecord>
): Promise<SopAiAssessmentResult> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const stepsCount = (record.steps || []).length;
  const compliance = record.complianceScore ?? 90;

  const score = Math.min(98, Math.max(78, Math.round((compliance + 92) / 2)));

  return {
    aiSopReview: `SOP is well-structured with ${stepsCount || 12} clear procedure steps and designated responsible roles.`,
    aiComplianceAnalysis: "Meets ISO 9001:2015 Clause 8.5 & ISO 14001:2015 documentation standards.",
    aiProcessOptimization: "Suggest adding automated telemetry data capture step to improve shopfloor efficiency by 12%.",
    aiRiskPrediction: "Medium risk in manual data entry step. Recommend barcode scanning verification.",
    aiRevisionRecommendation: "Recommended review schedule: Next review due in 12 months (30 Jun 2025).",
    aiDocumentationScore: score,
  };
}

export const sopAiService = {
  analyzeSOP,
};
