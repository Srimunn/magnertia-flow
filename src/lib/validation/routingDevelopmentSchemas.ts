import { z } from "zod";

export const ProductionTypeEnum = z.enum([
  "Prototype",
  "Pilot Production",
  "Batch Production",
  "Mass Production",
  "Engineer-to-Order (ETO)",
  "Make-to-Order (MTO)",
  "Make-to-Stock (MTS)",
]);

export const OperatorSkillLevelEnum = z.enum([
  "Beginner",
  "Intermediate",
  "Skilled",
  "Expert",
  "Certified",
]);

export const RoutingLifecycleStageEnum = z.enum([
  "Process Planning",
  "Routing Development",
  "Validation",
  "Pilot Production",
  "Mass Production",
  "Obsolete",
]);

export const RoutingRecommendationEnum = z.enum([
  "Approve Routing",
  "Update Operation Sequence",
  "Optimize Cycle Time",
  "Improve Resource Allocation",
  "Validate Manufacturing",
  "Release for Production",
]);

export const RoutingApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const RoutingOperationSchema = z.object({
  id: z.string(),
  seq: z.number().min(1),
  operationNo: z.string().min(1, "Operation No. is required"),
  operationName: z.string().min(1, "Operation Name is required"),
  workCentre: z.string().min(1, "Work Centre is required"),
  machine: z.string().min(1, "Machine is required"),
  setupTimeMins: z.number().min(0, "Setup time cannot be negative"),
  cycleTimeMins: z.number().min(0.1, "Cycle time must be greater than 0"),
  labourCount: z.number().min(1, "Labour count must be at least 1"),
  status: z.enum(["Active", "Pending", "In Review", "Draft"]),
  description: z.string().optional(),
  inspectionPoint: z.boolean().optional(),
  spcRequired: z.boolean().optional(),
  criticalOp: z.boolean().optional(),
});

export const RoutingDevelopmentFormSchema = z.object({
  routingName: z.string().min(2, "Routing Name is required"),
  routingNumber: z.string().min(2, "Routing Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  productFamily: z.string().min(1, "Product Family is required"),
  productModel: z.string().min(1, "Product Model is required"),
  manufacturingPlant: z.string().min(1, "Plant is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  routingDescription: z.string().min(5, "Routing Description is required"),
  lifecycleStage: RoutingLifecycleStageEnum,
  productionType: ProductionTypeEnum,
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  recommendation: RoutingRecommendationEnum,
});

export const RoutingApprovalSchema = z.object({
  decision: RoutingApprovalDecisionEnum,
  comments: z.string().optional(),
});
