import { z } from "zod";

export const FactoryOverviewSchema = z.object({
  factoryName: z.string().min(2, "Factory Name is required"),
  plantType: z.string().min(1, "Plant Type is required"),
  industrySegment: z.string().min(1, "Industry Segment is required"),
  totalLandArea: z.number().min(100, "Total land area must be at least 100 m²"),
  builtUpArea: z.number().min(50, "Built-up area must be positive"),
  productionCapacity: z.number().min(1, "Capacity must be positive"),
  factoryObjective: z.string().min(5, "Objective is required"),
  developmentStage: z.string().min(1, "Development stage is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export const LayoutPlanningSchema = z.object({
  masterLayoutDrawing: z.string().optional(),
  shopFloorLayout: z.string().optional(),
  productionLineLayout: z.string().optional(),
  utilityLayout: z.string().optional(),
  materialFlowDiagram: z.string().optional(),
  equipmentLayout: z.string().optional(),
  warehouseLayout: z.string().optional(),
  officeLayout: z.string().optional(),
  layoutPlanningScore: z.number().min(0).max(100),
});

export const InfrastructureSchema = z.object({
  productionAreas: z.array(z.string()).min(1, "Select at least one production area"),
  assemblyAreas: z.array(z.string()).min(1, "Select at least one assembly area"),
  warehouseCapacityM2: z.number().min(100, "Warehouse capacity must be positive"),
  loadingUnloadingBays: z.number().min(1, "Must have at least 1 bay"),
  utilitySystems: z.array(z.string()).min(1, "Select utility systems"),
  maintenanceWorkshop: z.boolean(),
  infrastructureScore: z.number().min(0).max(100),
});

export const MaterialFlowSchema = z.object({
  rawMaterialFlow: z.string().optional(),
  wipFlow: z.string().optional(),
  finishedGoodsFlow: z.string().optional(),
  forkliftRoutes: z.string().optional(),
  agvAmrRoutes: z.string().optional(),
  materialHandlingEq: z.array(z.string()).min(1, "Select material handling equipment"),
  logisticsScore: z.number().min(0).max(100),
});

export const UtilitySafetySchema = z.object({
  electricalLayout: z.string().optional(),
  compressedAirLayout: z.string().optional(),
  waterLayout: z.string().optional(),
  fireSafetyLayout: z.string().optional(),
  emergencyExitPlan: z.string().optional(),
  ehsCompliance: z.boolean(),
  utilitySafetyScore: z.number().min(0).max(100),
});

export const FactoryPerformanceSchema = z.object({
  spaceUtilization: z.number().min(0).max(100),
  materialTravelDistance: z.number().min(0),
  throughputUnitsPerYear: z.number().min(0),
  warehouseEfficiency: z.number().min(0).max(100),
  energyEfficiency: z.number().min(0).max(100),
  equipmentAccessibility: z.number().min(0).max(100),
  factoryEfficiencyScore: z.number().min(0).max(100),
});

export const FactoryApprovalSchema = z.object({
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

export const FactoryLayoutMasterSchema = FactoryOverviewSchema.partial();
