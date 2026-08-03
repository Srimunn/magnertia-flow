import { createServerFn } from "@tanstack/react-start";
import type { RoboticsIntegration } from "@/lib/robotics-integration/types";

export const MOCK_ROBOTICS_RECORD_35: RoboticsIntegration = {
  id: "RIP-2024-00035",
  formCode: "RPF-2024-25",
  roboticsProjectTitle: "Robotic Welding Cell Integration",
  projectNumber: "RW-INT-24-001",
  version: "1.0",
  workflowStatus: "In Progress" as any,

  automationDevelopmentId: "APD-2024-00045",

  // Metadata Row
  productProcess: "Chassis Assembly",
  manufacturingPlant: "Plant-01",
  productionLine: "Welding Line-03",
  roboticsEngineer: "Vikram Singh",
  startDate: "05 May 2024",
  targetDeployment: "15 Sep 2024",
  createdBy: "Rahul Sharma",
  createdDate: "05 May 2024",
  lastModifiedBy: "Rahul Sharma",
  lastUpdated: "17 Jun 2024",

  // Section 1: Overview
  roboticsCategory: "Industrial Robot",
  businessObjective: "Automate chassis welding process to improve productivity, quality and safety.",
  manualProcess: "Manual welding with fixtures, operator dependent.",
  automatedRoboticProcess: "Robotic arc welding with positioner, automatic part load/unload.",
  expectedProductivityGainPct: 28.5,
  roiEstimateInr: 4875000, // ₹48,75,000.00
  priority: "High",
  projectStatus: "Development",

  // Section 2: Robot Cell Design
  robotCellLayoutFile: {
    id: "f-r-01",
    filename: "Welding_Cell_Layout.pdf",
    uploadedAt: "06 May 2024",
    fileSize: "3.2 MB",
    version: 1,
    source: "inline:section-2",
  },
  robotModel: {
    id: "vp-r-01",
    name: "FANUC ARC Mate 120iC",
    category: "Industrial Robot",
    vendor: "FANUC",
    model: "ARC Mate 120iC/12L",
    specSheetUrl: "/files/specs/FANUC_ARC_Mate_120iC.pdf",
  },
  robotPayloadKg: 12.0,
  robotReachMm: 1440,
  degreesOfFreedom: 6,
  eoatConfiguration: "Welding Gun + Positioner",
  safetyZoneLayoutFile: {
    id: "f-r-02",
    filename: "Safety_Zone_Layout.pdf",
    uploadedAt: "08 May 2024",
    fileSize: "2.1 MB",
    version: 1,
    source: "inline:section-2",
  },
  cellReadinessScore: 85,

  // Section 3: System Integration Checkboxes
  plcIntegration: true,
  scadaIntegration: true,
  mesIntegration: true,
  erpIntegration: true,
  machineVisionIntegration: true,
  iiotConnectivity: true,
  digitalTwinAvailable: false,
  integrationScore: 88,

  // Section 4: Robot Programming
  robotProgramFile: {
    id: "f-r-03",
    filename: "Welding_Program.vpp",
    uploadedAt: "16 Jun 2024",
    fileSize: "4.8 MB",
    version: 2,
    allowedExtensions: [".vpp", ".tp", ".ls", ".mod", ".rapid", ".src"],
    source: "inline:section-4",
  },
  motionSequenceFile: {
    id: "f-r-04",
    filename: "Motion_Sequence.vpp",
    uploadedAt: "15 Jun 2024",
    fileSize: "3.4 MB",
    version: 1,
    allowedExtensions: [".vpp", ".tp", ".ls", ".mod"],
    source: "inline:section-4",
  },
  pathOptimization: true,
  collisionDetection: true,
  cycleTimeSec: 45.6,
  programVersion: "v2.1",
  programmingScore: 84,

  // Section 5: Testing & Validation
  simulationCompleted: true,
  offlineProgrammingVerified: true,
  fatCompleted: true,
  satCompleted: true,
  safetyValidation: true,
  performanceValidation: true,
  oeeImprovementPct: 22.8,
  validationScore: 87,

  // Section 6: Production Deployment
  installationStatus: "Installed",
  robotCalibration: true,
  operatorTraining: true,
  maintenanceTraining: true,
  sopUpdated: true,
  productionHandover: false,
  commissioningScore: 82,

  // Section 7: AI Robotics Assessment
  aiMotionOptimization: "Optimized path reduced cycle time by 18%.",
  aiCollisionPrediction: "Zero collision risk detected in current path.",
  aiPredictiveMaintenance: "Bearing wear predicted in 24 days.",
  aiVisionAccuracy: "Detected 98.7% defects with current model.",
  aiRobotPerformanceAnalysis: "Robot utilization is 87% above target.",
  aiRoboticsHealthScore: 89,

  // Section 8: Robotics Project Summary
  overallRoboticsReadiness: 86,
  recommendation: "Approve Robotics Integration",
  recommendationSuggestion: "Approve Robotics Integration",

  // Snapshots & Release States
  manufacturingContextSnapshot: {
    processEngineering: { processFlow: "PF-CH-003", workSequence: "WS-CH-12" },
    plm: { cadModels: "CAD-CHASSIS-V3", bom: "BOM-CHASSIS-88", assemblyData: "ASM-CH-001" },
    automationDev: {
      automationDevId: "APD-2024-00045",
      plcPlatform: "Siemens SIMATIC S7-1500",
      hmiPlatform: "Siemens Comfort Panel",
      scadaPlatform: "WinCC Unified",
      automationArchitecture: "Architecture.pdf",
    },
    snapshotAt: "05 May 2024 09:20 AM",
  },
  deploymentReleaseActions: {
    releaseRoboticProductionCell: null,
    registerRoboticAssets: null,
    archiveRobotPrograms: null,
    markProductionDeploymentApproved: null,
  },
  productionDeploymentApprovedAt: null,

  // Section 9: Review & Approval (9 Approvers)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Robotics Engineer", reviewer: "Vikram Singh", status: "Approved", comments: "Motion sequence & torch angles verified." },
    { role: "Controls Engineer", reviewer: "Neha Reddy", status: "Approved", comments: "Interlock signals synced with PLC." },
    { role: "Automation Engineer", reviewer: "Arun Kumar", status: "Approved", comments: "Cell safety enclosure passed inspection." },
    { role: "Production Manager", reviewer: "Priya Nair", status: "Approved", comments: "Welding cycle time 45.6s meets target." },
    { role: "Maintenance Manager", reviewer: "Rajesh Patel", status: "Approved", comments: "Greasing & cable dress pack PM active." },
    { role: "Quality Manager", reviewer: "Neha Reddy", status: "Approved", comments: "Weld seam penetration meets AWS D1.1." },
    { role: "Plant Head", reviewer: "Sankaran R.", status: "Pending" },
    { role: "CTO", reviewer: "Rakesh Patel", status: "Pending" },
    { role: "COO", reviewer: "Sanjay Patel", status: "Pending" },
  ],
  reviewComments: "Welding cell validation passed. Ready for robotic production release.",
  approvalDate: "17 Jun 2024",

  // Attachments (single source of truth)
  attachments: [
    { id: "att-r-01", filename: "Robot Cell Layout.pdf", source: "inline:section-2", uploadedAt: "17 Jun 2024", fileSize: "3.2 MB", revision: 1 },
    { id: "att-r-02", filename: "Robot Program.vpp", source: "inline:section-4", uploadedAt: "16 Jun 2024", fileSize: "4.8 MB", revision: 2 },
    { id: "att-r-03", filename: "PLC Logic.pdf", source: "auto:controls", uploadedAt: "15 Jun 2024", fileSize: "2.9 MB", revision: 1 },
    { id: "att-r-04", filename: "SCADA Configuration.pdf", source: "auto:scada", uploadedAt: "14 Jun 2024", fileSize: "3.8 MB", revision: 1 },
    { id: "att-r-05", filename: "Vision System Config.pdf", source: "auto:vision", uploadedAt: "13 Jun 2024", fileSize: "1.7 MB", revision: 1 },
    { id: "att-r-06", filename: "FAT Report.pdf", source: "auto:testing", uploadedAt: "12 Jun 2024", fileSize: "2.4 MB", revision: 1 },
    { id: "att-r-07", filename: "SAT Report.pdf", source: "auto:testing", uploadedAt: "11 Jun 2024", fileSize: "2.1 MB", revision: 1 },
    { id: "att-r-08", filename: "Risk Assessment.pdf", source: "auto:safety", uploadedAt: "10 Jun 2024", fileSize: "1.4 MB", revision: 1 },
    { id: "att-r-09", filename: "Robot User Manual.pdf", source: "auto:documentation", uploadedAt: "09 Jun 2024", fileSize: "7.6 MB", revision: 1 },
  ],

  // System Information & History
  auditTrail: [
    { id: "at-r-01", timestamp: "05 May 2024 09:20 AM", user: "Rahul Sharma", action: "Record Created", description: "Created Robotics Integration record RIP-2024-00035." },
    { id: "at-r-02", timestamp: "08 May 2024 01:15 PM", user: "Vikram Singh", action: "Robot Model Selected", description: "Selected FANUC ARC Mate 120iC for chassis welding." },
    { id: "at-r-03", timestamp: "11 Jun 2024 10:45 AM", user: "Neha Reddy", action: "SAT Completed", description: "Site Acceptance Test executed on Welding Line-03." },
    { id: "at-r-04", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submitted for Approval", description: "Submitted package for executive review." },
  ],
};

let mockRoboticsDatabase: Record<string, RoboticsIntegration> = {
  "RIP-2024-00035": MOCK_ROBOTICS_RECORD_35,
};

export const getRoboticsIntegrationFn = createServerFn({ method: "GET" })
  .validator((data?: { id?: string }) => data)
  .handler(async ({ data }) => {
    const id = data?.id || "RIP-2024-00035";
    const record = mockRoboticsDatabase[id] || MOCK_ROBOTICS_RECORD_35;
    return { success: true, data: record };
  });

export const listRoboticsIntegrationFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: Object.values(mockRoboticsDatabase) };
});

export const saveRoboticsIntegrationFn = createServerFn({ method: "POST" })
  .validator((data: { record: RoboticsIntegration }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...data.record,
      lastUpdated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    mockRoboticsDatabase[updated.id] = updated;
    return { success: true, data: updated };
  });
