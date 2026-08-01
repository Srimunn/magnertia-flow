import { z } from "zod";

export const ApqpPhaseEnum = z.enum([
  "Phase 1 – Plan & Define Program",
  "Phase 2 – Product Design & Development",
  "Phase 3 – Process Design & Development",
  "Phase 4 – Product & Process Validation",
  "Phase 5 – Feedback, Assessment & Corrective Action",
]);

export const ApqpProgramStatusEnum = z.enum([
  "Not Started",
  "Planning",
  "In Progress",
  "Pilot",
  "Validation",
  "Production Release",
  "Completed",
  "On Hold",
]);

export const ApqpPpapStatusEnum = z.enum([
  "Not Started",
  "In Preparation",
  "Submitted",
  "Customer Approved",
  "Conditionally Approved",
  "Rejected",
]);

export const ApqpRecommendationEnum = z.enum([
  "Approve APQP",
  "Update Design",
  "Improve Process Capability",
  "Complete Validation",
  "Mitigate Risks",
  "Release for Production",
]);

export const ApqpApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const ApqpFormSchema = z.object({
  apqpProjectName: z.string().min(2, "Project Name is required"),
  apqpNumber: z.string().min(2, "APQP Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  customer: z.string().min(1, "Customer is required"),
  projectManager: z.string().min(1, "Project Manager is required"),
  apqpPhase: ApqpPhaseEnum,
  programStatus: ApqpProgramStatusEnum,
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  targetSopDate: z.string().min(1, "Target SOP Date is required"),
  projectScope: z.string().min(5, "Project Scope is required"),
  customerRequirements: z.string().min(5, "Customer Requirements are required"),
  recommendation: ApqpRecommendationEnum,
});

export const ApqpApprovalSchema = z.object({
  decision: ApqpApprovalDecisionEnum,
  comments: z.string().optional(),
});
