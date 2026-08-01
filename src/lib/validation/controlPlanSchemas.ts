import { z } from "zod";

export const ControlPlanTypeEnum = z.enum([
  "Prototype",
  "Pre-Launch",
  "Production",
  "Safe Launch",
  "Service",
]);

export const ControlMethodEnum = z.enum([
  "Visual Inspection",
  "Dimensional Inspection",
  "Functional Test",
  "SPC Monitoring",
  "100% Inspection",
  "Sampling Inspection",
  "Automated Inspection",
]);

export const InspectionFrequencyEnum = z.enum([
  "Every Part",
  "Hourly",
  "Every Shift",
  "Daily",
  "Weekly",
  "Lot-wise",
  "First-Off & Last-Off",
]);

export const ControlPlanLifecycleStageEnum = z.enum([
  "Planning",
  "Process Development",
  "Validation",
  "Pilot Production",
  "Production Release",
  "Continuous Improvement",
]);

export const ControlPlanRecommendationEnum = z.enum([
  "Approve Control Plan",
  "Improve Process Controls",
  "Increase Inspection Frequency",
  "Complete Validation",
  "Update PFMEA",
  "Release for Production",
]);

export const ControlPlanApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const ControlPlanCharacteristicSchema = z.object({
  id: z.string(),
  stepNo: z.number().min(1),
  operationNo: z.string().min(1, "Operation No. is required"),
  processStep: z.string().min(1, "Process Step is required"),
  productCharacteristic: z.string().min(1, "Product characteristic is required"),
  processCharacteristic: z.string().min(1, "Process characteristic is required"),
  specialCharacteristics: z.string(),
  specification: z.string().min(1, "Specification / tolerance is required"),
  controlMethod: ControlMethodEnum,
  readinessScore: z.number().min(0).max(100),
});

export const ControlPlanFormSchema = z.object({
  controlPlanTitle: z.string().min(2, "Control Plan Title is required"),
  controlPlanNumber: z.string().min(2, "Control Plan Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  apqpRef: z.string().min(1, "APQP Reference is required"),
  pfmeaRef: z.string().min(1, "PFMEA Reference is required"),
  processOwner: z.string().min(1, "Process Owner is required"),
  productFamily: z.string().min(1, "Product Family is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  workCentre: z.string().min(1, "Work Centre is required"),
  controlPlanType: ControlPlanTypeEnum,
  lifecycleStage: ControlPlanLifecycleStageEnum,
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  recommendation: ControlPlanRecommendationEnum,
});

export const ControlPlanApprovalSchema = z.object({
  decision: ControlPlanApprovalDecisionEnum,
  comments: z.string().optional(),
});
