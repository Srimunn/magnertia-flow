import { z } from "zod";

export const JigOverviewSchema = z.object({
  jigName: z.string().min(2, "Jig Name is required"),
  jigCategory: z.string().min(1, "Jig Category is required"),
  manufacturingPlant: z.string().min(1, "Manufacturing Plant is required"),
  productionLine: z.string().min(1, "Production Line is required"),
  workstation: z.string().min(1, "Workstation is required"),
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  jigPurpose: z.string().min(5, "Jig Purpose must be at least 5 characters"),
  developmentStage: z.string().min(1, "Development Stage is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export const JigDesignSchema = z.object({
  cadModel: z.string().optional(),
  assemblyDrawing: z.string().optional(),
  detailDrawings: z.string().optional(),
  bom: z.string().optional(),
  bushDesign: z.string().optional(),
  locatorDesign: z.string().optional(),
  clampDesign: z.string().optional(),
  materialSpecification: z.string().optional(),
  surfaceFinish: z.string().optional(),
  designReviewScore: z.number().min(0).max(100),
});

export const JigManufacturingSchema = z.object({
  manufacturingProcess: z.string().min(1, "Manufacturing Process is required"),
  cncProgram: z.string().optional(),
  machineAllocation: z.array(z.string()).min(1, "Select at least one machine"),
  materialRequirements: z.string().min(1, "Material requirement is required"),
  heatTreatment: z.boolean(),
  surfaceTreatment: z.string().min(1, "Surface Treatment is required"),
  manufacturingLeadTime: z.number().min(1, "Lead time must be at least 1 day"),
  manufacturingReadinessScore: z.number().min(0).max(100),
});

export const JigValidationSchema = z.object({
  trialJigCompleted: z.boolean(),
  dimensionalInspection: z.boolean(),
  toolGuidanceAccuracy: z.number().min(0.001, "Accuracy must be positive"),
  repeatabilityTest: z.number().min(0.001, "Repeatability must be positive"),
  processCapabilityCp: z.number().min(0, "Cp must be positive"),
  processCapabilityCpk: z.number().min(0, "Cpk must be positive"),
  safetyValidation: z.boolean(),
  validationRemarks: z.string().optional(),
  validationScore: z.number().min(0).max(100),
});

export const JigCommissioningSchema = z.object({
  installationCompleted: z.boolean(),
  processIntegration: z.boolean(),
  operatorTraining: z.boolean(),
  maintenancePlan: z.string().optional(),
  calibrationSchedule: z.string().optional(),
  productionApproval: z.boolean(),
  commissioningScore: z.number().min(0).max(100),
});

export const JigPerformanceSchema = z.object({
  jigLifeCycles: z.number().min(1000, "Life cycles must be positive"),
  productionCycles: z.number().min(0),
  toolWearPercentage: z.number().min(0).max(100),
  downtimeHoursPerMonth: z.number().min(0),
  mtbfHours: z.number().min(1),
  mttrHours: z.number().min(0.1),
  oeeContribution: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
});

export const JigApprovalSchema = z.object({
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

export const JigDevelopmentMasterSchema = JigOverviewSchema.partial();

