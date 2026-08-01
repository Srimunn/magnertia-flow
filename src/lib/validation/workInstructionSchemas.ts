import { z } from "zod";

export const WorkInstructionOverviewSchema = z.object({
  title: z.string().min(2, "Instruction Title is required"),
  plantName: z.string().min(1, "Plant Name is required"),
  department: z.string().min(1, "Department is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  workstation: z.string().min(1, "Workstation is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  productFamily: z.string().min(1, "Product Family is required"),
  productModel: z.string().min(1, "Product Model is required"),
  processName: z.string().min(1, "Process Name is required"),
  operationNumber: z.string().min(1, "Operation Number is required"),
  operationDescription: z.string().min(5, "Description is required"),
  instructionCategory: z.string().min(1, "Category is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export const WorkInstructionStepSchema = z.object({
  stepNumber: z.number().min(1),
  instruction: z.string().min(2, "Instruction text is required"),
  keyPoints: z.string().min(2, "Key points are required"),
  timeSeconds: z.number().min(1, "Step duration in seconds is required"),
  safetyNotes: z.string().optional(),
  qualityChecks: z.string().optional(),
  requiredTools: z.string().optional(),
  requiredMaterials: z.string().optional(),
  visualReferenceUrl: z.string().optional(),
});

export const WorkInstructionApprovalSchema = z.object({
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

export const WorkInstructionMasterSchema = WorkInstructionOverviewSchema.partial();
