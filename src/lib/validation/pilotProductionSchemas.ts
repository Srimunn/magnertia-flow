import { z } from "zod";

export const PilotProductionStatusEnum = z.enum([
  "Planned",
  "Material Preparation",
  "Machine Setup",
  "Running",
  "Paused",
  "Completed",
  "Cancelled",
]);

export const PilotLifecycleStageEnum = z.enum([
  "Planning",
  "Trial Production",
  "Pilot Production",
  "Production Validation",
  "PPAP Submission",
  "Production Release",
]);

export const PilotRecommendationEnum = z.enum([
  "Approve Pilot Production",
  "Improve Process Capability",
  "Update Control Plan",
  "Revise PFMEA",
  "Perform Additional Pilot Run",
  "Release for Mass Production",
]);

export const PilotApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "Additional Pilot Required",
  "On Hold",
  "Rejected",
]);

export const PilotProductionFormSchema = z.object({
  pilotTitle: z.string().min(2, "Pilot Batch Title is required"),
  pilotNumber: z.string().min(2, "Pilot Batch Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  processValidationRef: z.string().min(1, "Process Validation Ref is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  objective: z.string().min(5, "Objective is required"),
  scope: z.string().min(5, "Scope is required"),
  plannedQuantity: z.number().min(1),
  actualQuantity: z.number().min(0),
  recommendation: PilotRecommendationEnum,
});

export const PilotProductionApprovalSchema = z.object({
  decision: PilotApprovalDecisionEnum,
  comments: z.string().optional(),
});
