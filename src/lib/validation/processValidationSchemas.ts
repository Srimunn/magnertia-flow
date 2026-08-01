import { z } from "zod";

export const ValidationTypeEnum = z.enum([
  "Installation Qualification (IQ)",
  "Operational Qualification (OQ)",
  "Performance Qualification (PQ)",
  "Pilot Production Validation",
  "Safe Launch Validation",
  "Production Validation",
  "Revalidation",
]);

export const ValidationMethodEnum = z.enum([
  "Trial Run",
  "Process Capability Study",
  "DOE Validation",
  "Statistical Validation",
  "Functional Validation",
  "Production Simulation",
]);

export const CapabilityStatusEnum = z.enum([
  "Excellent",
  "Capable",
  "Acceptable",
  "Marginal",
  "Not Capable",
]);

export const ValidationStatusEnum = z.enum([
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Approved",
  "Revalidation Required",
]);

export const ValidationRecommendationEnum = z.enum([
  "Approve Process",
  "Improve Process Capability",
  "Update Control Plan",
  "Revise PFMEA",
  "Perform Revalidation",
  "Release for Production",
]);

export const ValidationApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const ProcessValidationFormSchema = z.object({
  validationTitle: z.string().min(2, "Validation Title is required"),
  validationNumber: z.string().min(2, "Validation Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  apqpRef: z.string().min(1, "APQP Reference is required"),
  controlPlanRef: z.string().min(1, "Control Plan Reference is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  validationType: ValidationTypeEnum,
  validationScope: z.string().min(5, "Validation Scope is required"),
  validationObjective: z.string().min(5, "Validation Objective is required"),
  validationMethod: ValidationMethodEnum,
  acceptanceCriteria: z.string().min(5, "Acceptance criteria is required"),
  trialRunQuantity: z.number().min(1),
  recommendation: ValidationRecommendationEnum,
});

export const ProcessValidationApprovalSchema = z.object({
  decision: ValidationApprovalDecisionEnum,
  comments: z.string().optional(),
});
