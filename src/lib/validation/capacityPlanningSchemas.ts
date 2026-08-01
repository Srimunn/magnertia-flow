import { z } from "zod";

export const CapacityOverviewSchema = z.object({
  projectName: z.string().min(2, "Project Name is required"),
  plantName: z.string().min(1, "Plant Name is required"),
  businessUnit: z.string().min(1, "Business Unit is required"),
  planningPeriod: z.string().min(1, "Planning Period is required"),
  developmentStage: z.string().min(1, "Development Stage is required"),
  demandForecastUnits: z.number().min(1, "Demand forecast must be positive"),
  plannedProductionUnits: z.number().min(1, "Production volume must be positive"),
});

export const CapacityAssessmentSchema = z.object({
  availableMachineHours: z.number().min(0),
  availableLabourHours: z.number().min(0),
  productionLineCapacity: z.number().min(0),
  workstationCapacity: z.number().min(0),
  equipmentUtilization: z.number().min(0).max(100),
  assessmentScore: z.number().min(0).max(100),
});

export const ResourcePlanningSchema = z.object({
  allocatedMachines: z.number().min(0),
  totalMachines: z.number().min(1),
  allocatedWorkforce: z.number().min(0),
  totalWorkforce: z.number().min(1),
  materialAvailability: z.number().min(0).max(100),
  toolAvailability: z.number().min(0).max(100),
  utilityAvailability: z.number().min(0).max(100),
  shiftPattern: z.string().min(1),
  resourceScore: z.number().min(0).max(100),
});

export const CapacityApprovalSchema = z.object({
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

export const CapacityPlanningMasterSchema = CapacityOverviewSchema.partial();
