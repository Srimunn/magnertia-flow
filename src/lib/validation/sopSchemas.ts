import { z } from "zod";

export const SopOverviewSchema = z.object({
  title: z.string().min(2, "SOP Title is required"),
  department: z.string().min(1, "Department is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  sopCategory: z.string().min(1, "SOP Category is required"),
  businessFunction: z.string().min(1, "Business Function is required"),
  processName: z.string().min(1, "Process Name is required"),
  processObjective: z.string().min(5, "Process Objective is required"),
  scope: z.string().min(5, "Scope is required"),
  applicability: z.string().min(2, "Applicability is required"),
  triggerEvent: z.string().min(2, "Trigger Event is required"),
  expectedOutput: z.string().min(2, "Expected Output is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export const SopStepSchema = z.object({
  stepNumber: z.number().min(1),
  description: z.string().min(2, "Step description is required"),
  responsibleRole: z.string().min(1, "Responsible Role is required"),
  durationMins: z.number().min(1, "Duration in minutes is required"),
  requiredDocuments: z.string().optional(),
  notes: z.string().optional(),
  safetyCheck: z.string().optional(),
  qualityCheck: z.string().optional(),
});

export const SopApprovalSchema = z.object({
  decision: z.enum([
    "Pending",
    "Approved",
    "Approved with Conditions",
    "Revision Required",
    "On Hold",
    "Rejected",
  ]),
  comments: z.string().optional(),
  approvalDate: z.string().optional(),
});

export const SopMasterSchema = SopOverviewSchema.partial();
