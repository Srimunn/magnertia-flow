import { createServerFn } from "@tanstack/react-start";
import type { AutomationDevelopment } from "@/lib/automation-development/types";

export const MOCK_AUTOMATION_RECORD_45: AutomationDevelopment = {
  id: "APD-2024-00045",
  formCode: "APDF-2024-25",
  automationProjectTitle: "Automated Battery Assembly & Testing Cell",
  projectNumber: "AP-BA-24-001",
  version: "1.0",
  workflowStatus: "In Progress",

  // Metadata Row
  productProcess: "Battery Assembly",
  manufacturingPlant: "Plant-01",
  productionLine: "Battery Assembly Line-02",
  automationEngineer: "Vikram Singh",
  startDate: "05 May 2024",
  targetDeployment: "30 Aug 2024",
  createdBy: "Rahul Sharma",
  createdDate: "05 May 2024",
  lastModifiedBy: "Rahul Sharma",
  lastUpdated: "17 Jun 2024",

  // Section 1: Overview
  automationCategory: "Industrial Robotics",
  automationObjective: "Automate battery module assembly and testing to improve productivity and quality.",
  existingManualProcess: "Manual loading, screw fastening, testing and unloading.",
  proposedAutomatedProcess: "Robotic pick & place, automated screw fastening, vision inspection and auto test.",
  businessJustification: "Reduce labor dependency, improve quality and throughput.",
  expectedBenefits: "Higher OEE, lower defects, cost savings.",
  priority: "High",
  projectStatus: "Development",

  // Section 2: Process Analysis
  currentProcessFlowFile: {
    id: "f-01",
    filename: "Current_Flow.pdf",
    uploadedAt: "06 May 2024",
    fileSize: "1.8 MB",
    version: 1,
    source: "inline:section-2",
  },
  targetProcessFlowFile: {
    id: "f-02",
    filename: "Target_Flow.pdf",
    uploadedAt: "08 May 2024",
    fileSize: "2.4 MB",
    version: 1,
    source: "inline:section-2",
  },
  cycleTimeCurrentSec: 120.0,
  cycleTimeTargetSec: 75.0,
  bottleneckProcess: "Manual Testing",
  automationPotential: 88,
  roiEstimateInr: 487500000, // ₹48,75,00,000 (48.75 Cr)
  processReadinessScore: 82,

  // Section 3: System Design
  automationArchitectureFile: {
    id: "f-03",
    filename: "Architecture.pdf",
    uploadedAt: "17 Jun 2024",
    fileSize: "4.2 MB",
    version: 1,
    source: "inline:section-3",
  },
  plcPlatform: {
    id: "vp-01",
    name: "Siemens SIMATIC S7-1500",
    category: "PLC",
    vendor: "Siemens",
    model: "S7-1517F",
  },
  hmiPlatform: {
    id: "vp-02",
    name: "Siemens Comfort Panel",
    category: "HMI",
    vendor: "Siemens",
    model: "TP1200 Comfort",
  },
  scadaPlatform: {
    id: "vp-03",
    name: "WinCC Unified",
    category: "SCADA",
    vendor: "Siemens",
    model: "WinCC Unified V18",
  },
  robotCobotModel: {
    id: "vp-04",
    name: "ABB IRB 1200",
    category: "Industrial Robot",
    vendor: "ABB",
    model: "IRB 1200-5/0.9",
  },
  machineVisionSystem: {
    id: "vp-05",
    name: "Cognex In-Sight 7800",
    category: "Machine Vision",
    vendor: "Cognex",
    model: "In-Sight 7802M",
  },
  sensorConfigurationFile: {
    id: "f-04",
    filename: "Sensors_Config.pdf",
    uploadedAt: "12 May 2024",
    fileSize: "1.5 MB",
    version: 1,
    source: "inline:section-3",
  },
  controlLogicReferenceFile: {
    id: "f-05",
    filename: "Control_Logic.pdf",
    uploadedAt: "14 May 2024",
    fileSize: "3.1 MB",
    version: 1,
    source: "inline:section-3",
  },

  // Section 4: Hardware & Software Development
  electricalPanelDesignFile: {
    id: "f-06",
    filename: "Panel_Design.pdf",
    uploadedAt: "20 May 2024",
    fileSize: "5.4 MB",
    version: 1,
    source: "inline:section-4",
  },
  plcProgramFile: {
    id: "f-07",
    filename: "PLC_Program.a17",
    uploadedAt: "15 Jun 2024",
    fileSize: "12.8 MB",
    version: 1,
    allowedExtensions: [".a17", ".l5x", ".acp23"],
    source: "inline:section-4",
  },
  hmiScreensFile: {
    id: "f-08",
    filename: "HMI_Screens.zip",
    uploadedAt: "10 Jun 2024",
    fileSize: "8.6 MB",
    version: 1,
    allowedExtensions: [".zip", ".hmi", ".mer"],
    source: "inline:section-4",
  },
  scadaConfigurationFile: {
    id: "f-09",
    filename: "SCADA_Config.pdf",
    uploadedAt: "11 Jun 2024",
    fileSize: "4.1 MB",
    version: 1,
    allowedExtensions: [".pdf", ".zip"],
    source: "inline:section-4",
  },
  robotProgrammingFile: {
    id: "f-10",
    filename: "Robot_Program.mod",
    uploadedAt: "14 Jun 2024",
    fileSize: "2.3 MB",
    version: 1,
    allowedExtensions: [".mod", ".rapid", ".src", ".urp"],
    source: "inline:section-4",
  },
  iiotConnectivity: "Connected",
  cybersecurityValidation: "Validated",
  developmentScore: 88,

  // Section 5: Testing & Validation
  fatCompleted: true,
  satCompleted: true,
  dryRunCompleted: true,
  performanceTest: true,
  safetyValidation: true,
  oeeImprovementPct: 22.5,
  validationScore: 85,

  // Section 6: Deployment & Commissioning
  installationStatus: "Installed",
  operatorTraining: true,
  maintenanceTraining: true,
  documentationCompleted: true,
  sopUpdated: true,
  productionHandover: true,
  commissioningScore: 79,

  // Section 7: AI Automation Assessment
  aiProcessOptimization: "AI suggests optimizing robot path and reducing motion time by 12%.",
  aiCycleTimePrediction: "Predicted cycle time after full optimization: 68 sec.",
  aiPredictiveMaintenance: "AI model predicts health score 96% for key assets.",
  aiEnergyOptimization: "Estimated energy savings of 18% with current configuration.",
  aiAutomationRecommendations: "Implement adaptive force control for screw fastening.",
  aiAutomationHealthScore: 86,

  // Section 8: Project Benefits Summary
  productivityScore: 88,
  qualityImprovementScore: 86,
  costSavingScore: 84,
  energyEfficiencyScore: 82,
  overallAutomationReadiness: 84,
  recommendation: "Approve Automation Project",
  recommendationSuggestion: "Approve Automation Project",

  // Snapshots & Release States
  manufacturingContextSnapshot: {
    processEngineering: { processFlow: "PF-BA-001", cycleTime: 120 },
    plm: { bomReference: "BOM-BA-REV2.1", drawingsReference: "DWG-BA-1004", specificationsReference: "SPEC-BA-09" },
    snapshotAt: "05 May 2024 09:15 AM",
  },
  deploymentReleaseActions: {
    releaseAutomatedProduction: null,
    registerAutomationAssets: null,
    archiveAutomationDocumentation: null,
    markProductionDeploymentApproved: null,
  },
  productionDeploymentApprovedAt: null,

  // Section 9: Review & Approval (8 Approvers)
  approvalDecision: "Approved",
  reviewers: [
    { role: "Automation Engineer", reviewer: "Vikram Singh", status: "Approved", comments: "Cell integration verified." },
    { role: "Controls Engineer", reviewer: "Neha Reddy", status: "Approved", comments: "PLC logic & safety interlocks validated." },
    { role: "Electrical Engineer", reviewer: "Arun Kumar", status: "Approved", comments: "Panel wiring & arc flash audit passed." },
    { role: "Production Manager", reviewer: "Priya Nair", status: "Approved", comments: "Target cycle time 75s achieved." },
    { role: "Maintenance Manager", reviewer: "Rajesh Patel", status: "Approved", comments: "PM routines & spare parts staged." },
    { role: "Plant Head", reviewer: "Sankaran R.", status: "Pending" },
    { role: "CTO", reviewer: "Rakesh Patel", status: "Pending" },
    { role: "COO", reviewer: "Sanjay Patel", status: "Pending" },
  ],
  reviewComments: "Cell validation completed. Ready for production deployment.",
  approvalDate: "17 Jun 2024",

  // Attachments (single source of truth)
  attachments: [
    { id: "att-ap-01", filename: "Automation Architecture.pdf", source: "inline:section-3", uploadedAt: "17 Jun 2024", fileSize: "4.2 MB", revision: 1 },
    { id: "att-ap-02", filename: "PLC_Program.a17", source: "inline:section-4", uploadedAt: "15 Jun 2024", fileSize: "12.8 MB", revision: 1 },
    { id: "att-ap-03", filename: "Robot_Program.mod", source: "inline:section-4", uploadedAt: "14 Jun 2024", fileSize: "2.3 MB", revision: 1 },
    { id: "att-ap-04", filename: "Electrical_Drawings.pdf", source: "auto:electrical", uploadedAt: "13 Jun 2024", fileSize: "6.1 MB", revision: 1 },
    { id: "att-ap-05", filename: "Control_Panel_Drawings.pdf", source: "auto:controls", uploadedAt: "12 Jun 2024", fileSize: "3.4 MB", revision: 1 },
    { id: "att-ap-06", filename: "FAT_Report.pdf", source: "auto:testing", uploadedAt: "10 Jun 2024", fileSize: "1.9 MB", revision: 1 },
    { id: "att-ap-07", filename: "SAT_Report.pdf", source: "auto:testing", uploadedAt: "08 Jun 2024", fileSize: "2.2 MB", revision: 1 },
    { id: "att-ap-08", filename: "Risk_Assessment.pdf", source: "auto:safety", uploadedAt: "06 Jun 2024", fileSize: "1.5 MB", revision: 1 },
    { id: "att-ap-09", filename: "User_Manual.pdf", source: "auto:documentation", uploadedAt: "05 Jun 2024", fileSize: "8.9 MB", revision: 1 },
  ],

  // System Information & History
  auditTrail: [
    { id: "at-ap-01", timestamp: "05 May 2024 09:15 AM", user: "Rahul Sharma", action: "Record Created", description: "Created Automation Development record APD-2024-00045." },
    { id: "at-ap-02", timestamp: "12 May 2024 02:30 PM", user: "Vikram Singh", action: "Hardware Platforms Selected", description: "Selected Siemens S7-1500, ABB IRB 1200, Cognex In-Sight 7800." },
    { id: "at-ap-03", timestamp: "10 Jun 2024 11:00 AM", user: "Neha Reddy", action: "FAT Completed", description: "Factory Acceptance Test executed successfully at vendor facility." },
    { id: "at-ap-04", timestamp: "17 Jun 2024 04:30 PM", user: "Rahul Sharma", action: "Submitted for Approval", description: "Submitted package for executive review." },
  ],
};

let mockAutomationDatabase: Record<string, AutomationDevelopment> = {
  "APD-2024-00045": MOCK_AUTOMATION_RECORD_45,
};

export const getAutomationDevelopmentFn = createServerFn({ method: "GET" })
  .validator((data?: { id?: string }) => data)
  .handler(async ({ data }) => {
    const id = data?.id || "APD-2024-00045";
    const record = mockAutomationDatabase[id] || MOCK_AUTOMATION_RECORD_45;
    return { success: true, data: record };
  });

export const listAutomationDevelopmentFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: Object.values(mockAutomationDatabase) };
});

export const saveAutomationDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data: { record: AutomationDevelopment }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...data.record,
      lastUpdated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    mockAutomationDatabase[updated.id] = updated;
    return { success: true, data: updated };
  });
