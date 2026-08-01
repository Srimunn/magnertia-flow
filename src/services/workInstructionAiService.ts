import type { WorkInstructionAiAssessmentResult, WorkInstructionRecord } from "./types";

export async function analyzeWorkInstruction(
  record: Partial<WorkInstructionRecord>
): Promise<WorkInstructionAiAssessmentResult> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const stepsCount = (record.steps || []).length;
  const quality = record.qualityScore ?? 85;

  const score = Math.min(98, Math.max(76, Math.round((quality + 90) / 2)));

  return {
    instructionReview: `All ${stepsCount || 6} assembly steps are clear, complete, and properly sequenced with key points.`,
    riskAssessment: "Low risk operation. Ensure ESD anti-static safety precautions during PCB placement.",
    processOptimization: "Use pre-assembled cable harness to reduce cycle time by 8% (save ~18 sec).",
    knowledgeGapAnalysis: "Add reference image for screw torque setting knob on torque screwdriver.",
    trainingRecommendation: "Refresher training recommended for 3 newly assigned shopfloor operators.",
    aiDocumentationScore: score,
  };
}

export const workInstructionAiService = {
  analyzeWorkInstruction,
};
