import { createServerFn } from "@tanstack/react-start";
import type {
  SmartFactoryDevelopmentRecord,
  SmartFactoryFormInput,
} from "@/services/types";

export const INITIAL_SMART_FACTORY_RECORD: SmartFactoryDevelopmentRecord = {
  id: "sf-rec-2024-00015",
  smartFactoryProjectId: "SFP-2024-00015",
  formCode: "SFPF-2024-25",
  smartFactoryProjectTitle: "EVSE Smart Factory Transformation",
  projectNumber: "SF-TRN-24-001",
  version: 1.0,
  workflowStatus: "In Progress",

  // Header Lookup Details
  manufacturingPlant: "Plant-01",
  factoryZone: "EVSE Assembly Zone",
  projectManager: "Vikram Singh",
  startDate: "05 May 2024",
  targetGoLive: "30 Nov 2024",

  // Section 1: Overview
  factoryVision: "Create a connected, intelligent and sustainable factory for EVSE production.",
  businessObjectives: "Improve agility, quality, productivity, and cost through Industry 4.0.",
  smartFactoryLevel: "Intelligent Factory",
  industry40Maturity: "Intelligent",
  projectScope: "EVSE assembly, testing, packaging, warehousing and material handling.",
  expectedBusinessBenefits: "Higher OEE, predictive maintenance, energy savings, zero defects.",
  priority: "High",
  projectStatus: "Development",

  // Section 2: Digital Infrastructure
  networkArchitectureFile: "Network_Architecture.pdf",
  industrialEthernet: true,
  wifi5gConnectivity: true,
  edgeComputingPlatform: "Dell Edge Gateway 5000",
  cloudPlatform: "Microsoft Azure IoT",
  dataCenterArchitectureFile: "DataCenter_Arch.pdf",
  cybersecurityArchitectureFile: "Cyber_Arch.pdf",
  infrastructureReadinessScore: 86,

  // Section 3: Smart Manufacturing Systems
  mesIntegration: true,
  erpIntegration: true,
  plcIntegration: true,
  scadaIntegration: true,
  roboticsIntegration: true,
  iiotDeviceIntegration: true,
  digitalTwinAvailable: true,
  integrationScore: 89,

  // Section 4: AI & Analytics
  aiProductionOptimization: "Optimized line balance and throughput.",
  predictiveMaintenanceText: "Equipment failure prediction enabled.",
  aiQualityInspection: "Vision AI for defect detection active.",
  demandForecastingText: "AI model for demand forecasting enabled.",
  energyOptimizationText: "AI-driven energy optimization active.",
  aiDecisionSupport: "Real-time decision support dashboards.",
  aiReadinessScore: 91,

  // Section 5: Production Automation
  autonomousProductionLine: true,
  agvAmrDeployment: true,
  robotCellIntegration: true,
  machineVisionIntegration: true,
  smartSensorsInstalled: true,
  autonomousMaterialHandling: true,
  automationScore: 87,

  // Section 6: Smart Operations
  realTimeMonitoring: true,
  digitalDashboards: true,
  predictiveAlerts: true,
  oeeMonitoring: true,
  energyMonitoring: true,
  assetMonitoring: true,
  operationalScore: 85,

  // Section 7: Validation & Readiness
  factoryAcceptanceTest: true,
  siteAcceptanceTest: true,
  cybersecurityValidation: true,
  digitalTwinValidation: true,
  aiValidation: true,
  productionReadiness: true,
  validationScore: 88,

  // Section 8: Summary
  overallSmartFactoryReadiness: 88,
  recommendation: "Approve Smart Factory Deployment",

  // Section 9: Attachments
  attachments: [
    {
      id: "att-sf-001",
      fileName: "Smart_Factory_Architecture.pdf",
      fileType: "PDF Document",
      documentType: "Smart Factory Architecture",
      version: "1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "17 Jun 2024",
      fileSize: "4.2 MB",
      status: "Active",
    },
    {
      id: "att-sf-002",
      fileName: "Digital_Twin_Model.glb",
      fileType: "3D CAD / GLB",
      documentType: "Digital Twin Model",
      version: "2.1",
      uploadedBy: "Arun Kumar",
      uploadedDate: "16 Jun 2024",
      fileSize: "28.5 MB",
      status: "Active",
    },
    {
      id: "att-sf-003",
      fileName: "Network_Diagram.pdf",
      fileType: "PDF Document",
      documentType: "Network Diagram",
      version: "1.1",
      uploadedBy: "Priya Nair",
      uploadedDate: "15 Jun 2024",
      fileSize: "2.8 MB",
      status: "Active",
    },
    {
      id: "att-sf-004",
      fileName: "PLC_SCADA_Config.zip",
      fileType: "ZIP Archive",
      documentType: "PLC & SCADA Configuration",
      version: "1.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "14 Jun 2024",
      fileSize: "12.4 MB",
      status: "Active",
    },
    {
      id: "att-sf-005",
      fileName: "AI_Models.zip",
      fileType: "ZIP Archive",
      documentType: "AI Models",
      version: "1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "13 Jun 2024",
      fileSize: "45.1 MB",
      status: "Active",
    },
    {
      id: "att-sf-006",
      fileName: "Cybersecurity_Report.pdf",
      fileType: "PDF Document",
      documentType: "Cybersecurity Assessment",
      version: "1.0",
      uploadedBy: "Priya Nair",
      uploadedDate: "12 Jun 2024",
      fileSize: "3.6 MB",
      status: "Active",
    },
    {
      id: "att-sf-007",
      fileName: "FAT_SAT_Reports.pdf",
      fileType: "PDF Document",
      documentType: "FAT/SAT Reports",
      version: "1.0",
      uploadedBy: "Sneha Iyer",
      uploadedDate: "11 Jun 2024",
      fileSize: "5.1 MB",
      status: "Active",
    },
    {
      id: "att-sf-008",
      fileName: "SOP_Documents.pdf",
      fileType: "PDF Document",
      documentType: "SOP Documents",
      version: "1.0",
      uploadedBy: "Rakesh Patel",
      uploadedDate: "10 Jun 2024",
      fileSize: "1.9 MB",
      status: "Active",
    },
  ],

  // Section 10: Review & Approval Matrix (10 Roles)
  smartFactoryEngineer: "Vikram Singh",
  automationManager: "Neha Reddy",
  roboticsManager: "Arun Kumar",
  itInfrastructureManager: "Priya Nair",
  productionManager: "Rakesh Patel",
  qualityManager: "Sneha Iyer",
  plantHead: "Sankaran R.",
  cto: "Rakesh Patel",
  coo: "Sanjay Patel",
  ceo: "Anil Mehta",
  approvalDecision: "Pending",
  reviewComments: "",
  approvalDate: "17 Jun 2024",
  reviewers: [
    { id: "rev-1", role: "Smart Factory Engineer", person: "Vikram Singh", decision: "Approved", date: "17 Jun 2024", comments: "Digital infrastructure & architecture verified." },
    { id: "rev-2", role: "Automation Manager", person: "Neha Reddy", decision: "Approved", date: "17 Jun 2024", comments: "PLC, SCADA, and AGV integration complete." },
    { id: "rev-3", role: "Robotics Manager", person: "Arun Kumar", decision: "Approved", date: "17 Jun 2024", comments: "Robot cell safety and communications active." },
    { id: "rev-4", role: "IT Infrastructure Manager", person: "Priya Nair", decision: "Approved", date: "17 Jun 2024", comments: "5G & Edge computing telemetry verified." },
    { id: "rev-5", role: "Production Manager", person: "Rakesh Patel", decision: "Approved", date: "17 Jun 2024", comments: "Shop floor line balance validated." },
    { id: "rev-6", role: "Quality Manager", person: "Sneha Iyer", decision: "Approved", date: "17 Jun 2024", comments: "AI Vision inspection rules verified." },
    { id: "rev-7", role: "Plant Head", person: "Sankaran R.", decision: "Approved", date: "17 Jun 2024", comments: "Facility readiness approved for deployment." },
    { id: "rev-8", role: "CTO", person: "Rakesh Patel", decision: "Pending", date: "-", comments: "Reviewing architecture scalability." },
    { id: "rev-9", role: "COO", person: "Sanjay Patel", decision: "Pending", date: "-", comments: "Reviewing operational readiness." },
    { id: "rev-10", role: "CEO", person: "Anil Mehta", decision: "Pending", date: "-", comments: "Awaiting final executive board sign-off." },
  ],

  // Section 11: System Information
  createdBy: "Rahul Sharma",
  createdDate: "05 May 2024 09:20 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "17 Jun 2024 03:45 PM",
  workflowStage: "Development",
  auditTrail: [
    { id: "aud-1", timestamp: "05 May 2024 09:20 AM", user: "Rahul Sharma", action: "Record Created", details: "Initial Smart Factory Development project created." },
    { id: "aud-2", timestamp: "12 May 2024 11:45 AM", user: "Vikram Singh", action: "Infrastructure Updated", details: "Network and Cloud architecture docs attached." },
    { id: "aud-3", timestamp: "01 Jun 2024 02:15 PM", user: "Arun Kumar", action: "Systems Integrated", details: "MES, ERP, and Digital Twin status updated to connected." },
    { id: "aud-4", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submitted for Review", details: "Record submitted for executive review board authorization." },
  ],
};

let currentRecord: SmartFactoryDevelopmentRecord = { ...INITIAL_SMART_FACTORY_RECORD };

export const getSmartFactoryRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentRecord };
});

export const saveSmartFactoryDraftFn = createServerFn({ method: "POST" })
  .validator((data: { input: SmartFactoryFormInput }) => data)
  .handler(async ({ data }) => {
    currentRecord = {
      ...currentRecord,
      ...data.input,
      lastModifiedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    // Auto calculate overall readiness score
    const avgScore = Math.round(
      (currentRecord.infrastructureReadinessScore +
        currentRecord.integrationScore +
        currentRecord.aiReadinessScore +
        currentRecord.automationScore +
        currentRecord.operationalScore +
        currentRecord.validationScore) / 6
    );
    currentRecord.overallSmartFactoryReadiness = avgScore;

    return { success: true, data: currentRecord };
  });

export const submitSmartFactoryReviewFn = createServerFn({ method: "POST" }).handler(async () => {
  currentRecord.workflowStatus = "Under Review";
  currentRecord.workflowStage = "Testing & Validation";
  currentRecord.auditTrail.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    user: "Current User",
    action: "Submitted for Review",
    details: "Project submitted to Smart Factory Executive Review Board.",
  });
  return { success: true, data: currentRecord };
});

export const updateSmartFactoryDecisionFn = createServerFn({ method: "POST" })
  .validator((data: { decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected"; comments: string }) => data)
  .handler(async ({ data }) => {
    currentRecord.approvalDecision = data.decision;
    currentRecord.reviewComments = data.comments;
    currentRecord.approvalDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (data.decision === "Approved") {
      currentRecord.workflowStatus = "Approved";
      currentRecord.workflowStage = "Commissioning";
    } else if (data.decision === "Approved with Conditions") {
      currentRecord.workflowStatus = "Approved with Conditions";
    } else if (data.decision === "Revision Required") {
      currentRecord.workflowStatus = "Revision Required";
    } else {
      currentRecord.workflowStatus = "Rejected";
    }

    currentRecord.auditTrail.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      user: "Current User",
      action: `Decision: ${data.decision}`,
      details: data.comments || `Review decision updated to ${data.decision}.`,
    });

    return { success: true, data: currentRecord };
  });
