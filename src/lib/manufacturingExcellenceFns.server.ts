import { createServerFn } from "@tanstack/react-start";
import type {
  ManufacturingExcellenceRecord,
  ExcellenceFormInput,
} from "@/services/types";

export const INITIAL_MANUFACTURING_EXCELLENCE_RECORD: ManufacturingExcellenceRecord = {
  id: "mex-rec-2024-00045",
  manufacturingExcellenceId: "MEX-2024-00045",
  formCode: "MEXF-2024-25",
  initiativeTitle: "OEE Improvement & Cost Optimization Initiative",
  initiativeNumber: "MEX-INIT-24-001",
  version: 1.0,
  workflowStatus: "In Progress",

  // Header Details
  manufacturingPlant: "Plant-01",
  businessUnit: "EVSE Manufacturing",
  processOwner: "Rahul Sharma",
  startDate: "05 May 2024",
  targetCompletion: "30 Nov 2024",

  // Section 1: Overview
  initiativeCategory: "Operational Excellence",
  businessObjective: "Improve overall equipment effectiveness, reduce production cost and enhance quality.",
  currentPerformance: "OEE 72%, High downtime, Defects 1.8%, High energy cost.",
  targetPerformance: "OEE 85%, Downtime < 5%, Defects < 0.5%, Cost reduction 12%.",
  improvementStrategy: "Lean, TPM, AI analytics, predictive maintenance and automation.",
  expectedBusinessBenefits: "Higher productivity, lower cost, better quality and sustainability.",
  priority: "High",
  initiativeStatus: "Implementation",

  // Section 2: Operational Excellence Assessment
  oeePercentage: 72.65,
  productivityIndex: 78,
  qualityPerformance: 83,
  deliveryPerformance: 80,
  costEfficiency: 75,
  safetyPerformance: 90,
  sustainabilityAssessmentScore: 82,
  operationalExcellenceScore: 86,

  // Section 3: Continuous Improvement Programs
  leanManufacturing: true,
  sixSigmaProject: true,
  kaizenInitiative: true,
  tpmProgram: true,
  fiveSImplementation: true,
  valueStreamMapping: true,
  standardWork: true,
  improvementScore: 85,

  // Section 4: Smart Manufacturing Excellence
  smartFactoryIntegration: true,
  aiManufacturingAnalytics: true,
  roboticsOptimization: true,
  iiotConnectivity: true,
  digitalTwin: true,
  predictiveMaintenance: true,
  energyOptimization: true,
  digitalExcellenceScore: 84,

  // Section 5: Quality & Compliance
  customerPpm: 850,
  firstPassYield: 96.40,
  processCapabilityCpk: "1.67 / 1.89",
  capaStatus: "In Progress",
  auditCompliance: 94.50,
  regulatoryCompliance: true,
  qualityExcellenceScore: 88,

  // Section 6: Sustainability & ESG
  energyConsumption: 1.24,
  carbonEmissions: 0.68,
  waterConsumption: 2.35,
  wasteReduction: 18.60,
  recyclingRate: 72.30,
  esgCompliance: true,
  sustainabilityScore: 82,

  // Section 7: AI Excellence Assessment
  aiPerformanceInsights: "AI identifies key loss areas and root causes.",
  productivityForecast: "Expected 14% productivity improvement.",
  predictiveQuality: "AI predicts defect reduction by 20%.",
  costOptimizationText: "Potential savings of ₹ 18.75 Lakhs.",
  riskPredictionText: "Low risk with proactive AI alerts.",
  aiRecommendations: "Focus on downtime, energy and quality.",
  aiExcellenceScore: 89,

  // Section 8: Summary
  overallManufacturingExcellenceScore: 87,
  recommendation: "Approve Excellence Initiative",

  // Section 9: Attachments
  attachments: [
    {
      id: "att-mex-001",
      fileName: "Improvement_Roadmap.pdf",
      fileType: "PDF Document",
      documentType: "Improvement Roadmap",
      version: "1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "17 Jun 2024",
      fileSize: "3.4 MB",
      status: "Active",
    },
    {
      id: "att-mex-002",
      fileName: "Lean_Assessment.pdf",
      fileType: "PDF Document",
      documentType: "Lean Assessment",
      version: "1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "16 Jun 2024",
      fileSize: "2.1 MB",
      status: "Active",
    },
    {
      id: "att-mex-003",
      fileName: "Six_Sigma_Report.pdf",
      fileType: "PDF Document",
      documentType: "Six Sigma Report",
      version: "1.0",
      uploadedBy: "Sneha Iyer",
      uploadedDate: "15 Jun 2024",
      fileSize: "4.8 MB",
      status: "Active",
    },
    {
      id: "att-mex-004",
      fileName: "OEE_Dashboard.xlsx",
      fileType: "Excel Spreadsheet",
      documentType: "OEE Dashboard",
      version: "2.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "14 Jun 2024",
      fileSize: "1.5 MB",
      status: "Active",
    },
    {
      id: "att-mex-005",
      fileName: "AI_Analytics_Report.pdf",
      fileType: "PDF Document",
      documentType: "AI Analytics Report",
      version: "1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "13 Jun 2024",
      fileSize: "5.2 MB",
      status: "Active",
    },
    {
      id: "att-mex-006",
      fileName: "ESG_Report.pdf",
      fileType: "PDF Document",
      documentType: "ESG Report",
      version: "1.0",
      uploadedBy: "Arun Kumar",
      uploadedDate: "12 Jun 2024",
      fileSize: "2.9 MB",
      status: "Active",
    },
    {
      id: "att-mex-007",
      fileName: "Audit_Reports.pdf",
      fileType: "PDF Document",
      documentType: "Audit Reports",
      version: "1.0",
      uploadedBy: "Sneha Iyer",
      uploadedDate: "11 Jun 2024",
      fileSize: "3.8 MB",
      status: "Active",
    },
    {
      id: "att-mex-008",
      fileName: "SOP_Documents.pdf",
      fileType: "PDF Document",
      documentType: "SOP Documents",
      version: "1.0",
      uploadedBy: "Rajesh Patel",
      uploadedDate: "10 Jun 2024",
      fileSize: "1.7 MB",
      status: "Active",
    },
    {
      id: "att-mex-009",
      fileName: "Supporting_Documents.zip",
      fileType: "ZIP Archive",
      documentType: "Supporting Documents",
      version: "1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "09 Jun 2024",
      fileSize: "14.2 MB",
      status: "Active",
    },
  ],

  // Section 10: Review & Approval (9 Roles)
  manufacturingExcellenceManager: "Vikram Singh",
  productionManager: "Neha Reddy",
  qualityManager: "Sneha Iyer",
  maintenanceManager: "Rajesh Patel",
  operationsManager: "Arun Kumar",
  plantHead: "Sankaran R.",
  coo: "Rakesh Patel",
  cto: "Sanjay Patel",
  ceo: "Anil Mehta",
  approvalDecision: "Pending",
  reviewComments: "",
  approvalDate: "17 Jun 2024",
  reviewers: [
    { id: "rev-mex-1", role: "Excellence Manager", person: "Vikram Singh", decision: "Approved", date: "10 May 2024", comments: "Lean & Six Sigma framework verified." },
    { id: "rev-mex-2", role: "Production Manager", person: "Neha Reddy", decision: "Approved", date: "11 May 2024", comments: "OEE targets aligned with plant capacity." },
    { id: "rev-mex-3", role: "Quality Manager", person: "Sneha Iyer", decision: "Approved", date: "12 May 2024", comments: "FPY and PPM target controls verified." },
    { id: "rev-mex-4", role: "Maintenance Manager", person: "Rajesh Patel", decision: "Approved", date: "13 May 2024", comments: "TPM and predictive maintenance schedule active." },
    { id: "rev-mex-5", role: "Operations Manager", person: "Arun Kumar", decision: "Approved", date: "14 May 2024", comments: "Operational workflow validated." },
    { id: "rev-mex-6", role: "Plant Head", person: "Sankaran R.", decision: "Pending", date: "-", comments: "Reviewing plant-wide deployment timeline." },
    { id: "rev-mex-7", role: "COO", person: "Rakesh Patel", decision: "Pending", date: "-", comments: "Reviewing operational cost reduction targets." },
    { id: "rev-mex-8", role: "CTO", person: "Sanjay Patel", decision: "Pending", date: "-", comments: "Reviewing AI & Smart Factory integration." },
    { id: "rev-mex-9", role: "CEO", person: "Anil Mehta", decision: "Pending", date: "-", comments: "Awaiting final executive review board sign-off." },
  ],

  // Section 11: System Information
  createdBy: "Rahul Sharma",
  createdDate: "05 May 2024 09:20 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "17 Jun 2024 03:45 PM",
  workflowStage: "Implementation",
  auditTrail: [
    { id: "aud-mex-1", timestamp: "05 May 2024 09:20 AM", user: "Rahul Sharma", action: "Record Created", details: "Initial Manufacturing Excellence initiative created." },
    { id: "aud-mex-2", timestamp: "12 May 2024 11:45 AM", user: "Vikram Singh", action: "Programs Updated", details: "Lean, TPM, and Kaizen program parameters updated." },
    { id: "aud-mex-3", timestamp: "01 Jun 2024 02:15 PM", user: "Sneha Iyer", action: "Quality & ESG Integrated", details: "OEE, FPY, and carbon emission metrics synced." },
    { id: "aud-mex-4", timestamp: "17 Jun 2024 03:45 PM", user: "Rahul Sharma", action: "Submitted for Review", details: "Initiative submitted to Manufacturing Excellence Review Board." },
  ],
};

let currentRecord: ManufacturingExcellenceRecord = { ...INITIAL_MANUFACTURING_EXCELLENCE_RECORD };

export const getExcellenceRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentRecord };
});

export const saveExcellenceDraftFn = createServerFn({ method: "POST" })
  .validator((data: { input: ExcellenceFormInput }) => data)
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

    // Calculate Overall Manufacturing Excellence Score
    const avgScore = Math.round(
      (currentRecord.operationalExcellenceScore +
        currentRecord.digitalExcellenceScore +
        currentRecord.qualityExcellenceScore +
        currentRecord.sustainabilityScore +
        currentRecord.aiExcellenceScore) / 5
    );
    currentRecord.overallManufacturingExcellenceScore = avgScore;

    return { success: true, data: currentRecord };
  });

export const submitExcellenceReviewFn = createServerFn({ method: "POST" }).handler(async () => {
  currentRecord.workflowStatus = "Under Review";
  currentRecord.workflowStage = "Performance Monitoring";
  currentRecord.auditTrail.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    user: "Current User",
    action: "Submitted for Review",
    details: "Initiative submitted to Manufacturing Excellence Review Board authorization.",
  });
  return { success: true, data: currentRecord };
});

export const updateExcellenceDecisionFn = createServerFn({ method: "POST" })
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
      currentRecord.workflowStage = "Completed";
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
