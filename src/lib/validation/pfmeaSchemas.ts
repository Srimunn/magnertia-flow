import { z } from "zod";

export const ActionPriorityEnum = z.enum(["High (H)", "Medium (M)", "Low (L)", "H", "M", "L"]);

export const PfmeaActionStatusEnum = z.enum([
  "Open",
  "In Progress",
  "Completed",
  "Verified",
  "Closed",
]);

export const PfmeaLifecycleStageEnum = z.enum([
  "Planning",
  "Process Design",
  "Risk Analysis",
  "Validation",
  "Pilot Production",
  "Production Release",
  "Continuous Improvement",
]);

export const PfmeaRecommendationEnum = z.enum([
  "Approve PFMEA",
  "Update Process Controls",
  "Reduce Process Risk",
  "Complete Validation",
  "Implement Corrective Actions",
  "Release for Production",
]);

export const PfmeaApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const PfmeaFailureModeSchema = z.object({
  id: z.string(),
  stepNo: z.number().min(1),
  processStep: z.string().min(1, "Process Step is required"),
  potentialFailureMode: z.string().min(1, "Failure Mode is required"),
  severity: z.number().min(1).max(10),
  potentialEffect: z.string().min(1, "Effect is required"),
  occurrence: z.number().min(1).max(10),
  potentialCause: z.string().min(1, "Cause is required"),
  currentControls: z.string().min(1, "Current controls are required"),
  detection: z.number().min(1).max(10),
  actionPriority: ActionPriorityEnum,
  rpnBefore: z.number().min(1),
  rpnAfter: z.number().min(1),
  status: z.enum(["Open", "In Progress", "Completed", "Verified"]),
});

export const PfmeaFormSchema = z.object({
  pfmeaTitle: z.string().min(2, "PFMEA Title is required"),
  pfmeaNumber: z.string().min(2, "PFMEA Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  apqpRef: z.string().min(1, "APQP Reference is required"),
  productFamily: z.string().min(1, "Product Family is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  workCentre: z.string().min(1, "Work Centre is required"),
  projectScope: z.string().min(5, "Project Scope is required"),
  lifecycleStage: PfmeaLifecycleStageEnum,
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  recommendation: PfmeaRecommendationEnum,
});

export const PfmeaApprovalSchema = z.object({
  decision: PfmeaApprovalDecisionEnum,
  comments: z.string().optional(),
});
