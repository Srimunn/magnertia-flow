import { createServerFn } from "@tanstack/react-start";
import type {
  FactoryApprovalDecision,
  FactoryAttachment,
  FactoryLayoutFormInput,
  FactoryLayoutRecord,
  FactoryReviewer,
} from "@/services/types";

/* ===========================================================================
   Factory Layout Design — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateFactoryScores(record: Partial<FactoryLayoutRecord>) {
  const layoutScore = record.layoutPlanningScore ?? 88;
  const infraScore = record.infrastructureScore ?? 86;
  const logisticsScore = record.logisticsScore ?? 85;
  const safetyScore = record.utilitySafetyScore ?? 88;
  const perfScore = record.factoryEfficiencyScore ?? 87;

  // Weighted overall readiness calculation
  const overallScore = Math.round(
    layoutScore * 0.20 +
      infraScore * 0.20 +
      logisticsScore * 0.20 +
      safetyScore * 0.20 +
      perfScore * 0.20
  );

  return {
    layoutPlanningScore: layoutScore,
    infrastructureScore: infraScore,
    logisticsScore,
    utilitySafetyScore: safetyScore,
    factoryEfficiencyScore: perfScore,
    overallFactoryReadiness: overallScore,
  };
}

export const DEFAULT_FACTORY_LAYOUT_RECORD: FactoryLayoutRecord = {
  id: "proc-fact-rec-0012",
  layoutId: "FLD-2024-0012",
  formCode: "FLF-2024-25",
  projectName: "EV Charger Manufacturing Plant Layout",
  layoutVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 3, // Detailed Layout
  createdOn: "18 Jun 2024 09:40 AM",
  dateCreated: "2024-06-18T09:40:00Z",
  lastModified: "2024-06-20T15:15:00Z",
  lastUpdated: "20 Jun 2024 03:15 PM",

  plantName: "Magnertia Plant - 01",
  facilityLocation: "Pune, Maharashtra, India",
  engineerName: "Rahul Sharma",
  engineerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  totalLandArea: 120000,
  builtUpArea: 45000,
  productionCapacity: 250000,
  nextReviewDate: "25 Jun 2024",

  // Section 1: Overview
  factoryName: "Magnertia EV Plant",
  plantType: "Greenfield Factory",
  industrySegment: "Electric Vehicles",
  factoryObjective: "Design a world-class EV charger manufacturing facility with lean flow, high automation, and future expansion capability.",
  developmentStage: "Detailed Layout",
  priority: "High",

  // Section 2: Layout Planning
  masterLayoutDrawing: "master_layout_v1.2.dwg",
  shopFloorLayout: "shopfloor_layout_v1.2.dwg",
  productionLineLayout: "line_layout_v1.2.dwg",
  utilityLayout: "utility_layout_v1.2.dwg",
  materialFlowDiagram: "material_flow_v1.2.pdf",
  equipmentLayout: "equipment_layout_v1.2.dwg",
  warehouseLayout: "warehouse_layout_v1.2.dwg",
  officeLayout: "office_layout_v1.2.dwg",
  layoutPlanningScore: 88,

  // Section 3: Infrastructure
  productionAreas: ["Machining", "Assembly", "Testing", "Packing"],
  assemblyAreas: ["SMT", "Panel Assembly", "Final Assembly"],
  warehouseCapacityM2: 8500,
  loadingUnloadingBays: 6,
  utilitySystems: ["Electrical", "Compressed Air", "HVAC"],
  maintenanceWorkshop: true,
  infrastructureScore: 86,

  // Section 4: Material Flow & Logistics
  rawMaterialFlow: "raw_material_flow_v1.2.pdf",
  wipFlow: "wip_flow_v1.2.pdf",
  finishedGoodsFlow: "fg_flow_v1.2.pdf",
  forkliftRoutes: "forklift_routes_v1.2.pdf",
  agvAmrRoutes: "agv_routes_v1.2.pdf",
  materialHandlingEq: ["Forklift", "AGV", "Conveyor", "Overhead Crane"],
  logisticsScore: 85,

  // Section 5: Utilities & Safety
  electricalLayout: "electrical_layout_v1.2.dwg",
  compressedAirLayout: "cir_layout_v1.2.dwg",
  waterLayout: "water_layout_v1.2.dwg",
  fireSafetyLayout: "fire_safety_layout_v1.2.pdf",
  emergencyExitPlan: "emergency_exit_v1.2.pdf",
  ehsCompliance: true,
  utilitySafetyScore: 88,

  // Section 6: Performance
  spaceUtilization: 78,
  materialTravelDistance: 1.62,
  throughputUnitsPerYear: 250000,
  warehouseEfficiency: 92,
  energyEfficiency: 86,
  equipmentAccessibility: 90,
  factoryEfficiencyScore: 87,

  // Section 7: AI Assessment
  aiLayoutOptimization: "AI suggests relocating SMT line to reduce material travel by 12%.",
  aiBottleneckPrediction: "Panel assembly zone may become a bottleneck at 85% capacity.",
  aiMaterialFlowOptimization: "AI optimizes AGV routes and storage locations for better flow.",
  aiCapacityExpansionRec: "Add 2 additional assembly cells in Phase 2 expansion.",
  aiSafetyImprovementRec: "AI suggests additional fire exits in warehouse zone.",
  aiFactoryScore: 89,

  overallFactoryReadiness: 87,
  recommendation: "Approve Factory Layout",

  attachments: [
    {
      id: "fatt-001",
      fileName: "factory_master_plan_v1.2.pdf",
      fileType: "pdf",
      documentType: "Master Layout",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "3.2 MB",
      status: "Active",
    },
    {
      id: "fatt-002",
      fileName: "digital_twin_model_v1.2.zip",
      fileType: "zip",
      documentType: "Digital Twin Model",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "65.6 MB",
      status: "Active",
    },
    {
      id: "fatt-003",
      fileName: "utility_drawings_v1.2.zip",
      fileType: "zip",
      documentType: "Utility Layout",
      version: "v1.2",
      uploadedBy: "Naresh Verma",
      uploadedDate: "19 Jun 2024",
      fileSize: "24.1 MB",
      status: "Active",
    },
    {
      id: "fatt-004",
      fileName: "ehs_reports_v1.2.pdf",
      fileType: "pdf",
      documentType: "Safety Report",
      version: "v1.0",
      uploadedBy: "Neha Reddy",
      uploadedDate: "19 Jun 2024",
      fileSize: "2.8 MB",
      status: "Active",
    },
    {
      id: "fatt-005",
      fileName: "material_flow_simulation.mp4",
      fileType: "mp4",
      documentType: "Simulation Video",
      version: "v1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "18 Jun 2024",
      fileSize: "125.8 MB",
      status: "Active",
    },
    {
      id: "fatt-006",
      fileName: "topography_survey.pdf",
      fileType: "pdf",
      documentType: "Site Survey",
      version: "v1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "15 Jun 2024",
      fileSize: "5.4 MB",
      status: "Active",
    },
    {
      id: "fatt-007",
      fileName: "soil_test_report.pdf",
      fileType: "pdf",
      documentType: "Geotechnical Report",
      version: "v1.0",
      uploadedBy: "Amit Patel",
      uploadedDate: "14 Jun 2024",
      fileSize: "2.1 MB",
      status: "Active",
    },
    {
      id: "fatt-008",
      fileName: "supporting_documents.zip",
      fileType: "zip",
      documentType: "General Attachment",
      version: "v1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "20 Jun 2024",
      fileSize: "18.7 MB",
      status: "Active",
    },
  ],

  reviewers: [
    {
      role: "Factory Layout Engineer",
      person: "Rahul Sharma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Layout completed",
      status: "Approved",
    },
    {
      role: "Manufacturing Engineer",
      person: "Naresh Verma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Flow is optimized",
      status: "Approved",
    },
    {
      role: "Production Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Line integration ok",
      status: "Approved",
    },
    {
      role: "Industrial Engineer",
      person: "Amit Patel",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Lean layout achieved",
      status: "Approved",
    },
    {
      role: "Facility Manager",
      person: "Neha Reddy",
      decision: "Pending",
      date: "-",
      comments: "Utility plan under review",
      status: "Pending",
    },
    {
      role: "EHS Manager",
      person: "Arun Kumar",
      decision: "Pending",
      date: "-",
      comments: "Safety plan validation",
      status: "Pending",
    },
    {
      role: "Plant Head",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Executive review",
      status: "Pending",
    },
    {
      role: "COO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Final approval pending",
      status: "Pending",
    },
    {
      role: "CEO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Final approval pending",
      status: "Pending",
    },
  ],

  approvalDecision: "Approved",
  reviewComments: "Detailed factory layout design approved. Ready for construction sign-off.",
  approvalDate: "20 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:40 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 03:15 PM",
  workflowStageLabel: "Detailed Layout",

  timeline: [
    { label: "Site Planning Completed", date: "05 Jun 2024", status: "Completed" },
    { label: "Master Layout Completed", date: "07 Jun 2024", status: "Completed" },
    { label: "Shop Floor Layout Completed", date: "12 Jun 2024", status: "Completed" },
    { label: "Utility Layout Completed", date: "15 Jun 2024", status: "Completed" },
    { label: "Simulation Completed", date: "18 Jun 2024", status: "Completed" },
    { label: "Review & Approval", date: "In Progress", status: "In Progress" },
    { label: "Implementation", date: "Pending", status: "Pending" },
  ],

  auditTrail: [
    {
      id: "flog-001",
      timestamp: "18 Jun 2024 09:40 AM",
      user: "Rahul Sharma",
      action: "Created Factory Layout Project",
      description: "Initial creation of EV Charger Manufacturing Plant Layout (FLD-2024-0012).",
    },
    {
      id: "flog-002",
      timestamp: "18 Jun 2024 01:15 PM",
      user: "Rahul Sharma",
      action: "Uploaded Master Drawing",
      description: "Uploaded master_layout_v1.2.dwg.",
    },
    {
      id: "flog-003",
      timestamp: "19 Jun 2024 10:45 AM",
      user: "Vikram Singh",
      action: "Completed Digital Twin Simulation",
      description: "Material flow simulation run with 98% efficiency rating.",
    },
    {
      id: "flog-004",
      timestamp: "20 Jun 2024 03:15 PM",
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Factory Layout submitted for review board approval.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    },
  ],

  simulations: [
    {
      id: "sim-001",
      simulationType: "Material Flow Simulation",
      status: "Completed",
      resultSummary: "Material travel distance reduced by 23%. No AGV congestion detected.",
      passed: true,
      runDate: "18 Jun 2024",
    },
    {
      id: "sim-002",
      simulationType: "Throughput Capacity Simulation",
      status: "Completed",
      resultSummary: "Target 250,000 units/year throughput achievable at 82% line loading.",
      passed: true,
      runDate: "18 Jun 2024",
    },
    {
      id: "sim-003",
      simulationType: "Emergency Evacuation Simulation",
      status: "Completed",
      resultSummary: "Full shopfloor evacuation compliant within 2.5 minutes.",
      passed: true,
      runDate: "19 Jun 2024",
    },
  ],
};

let currentFactoryRecord = { ...DEFAULT_FACTORY_LAYOUT_RECORD };

export const getFactoryLayoutFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentFactoryRecord };
});

export const saveFactoryLayoutDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id?: string; input: Partial<FactoryLayoutFormInput> })
  .handler(async ({ data }) => {
    const updated = {
      ...currentFactoryRecord,
      ...data.input,
      lastModified: new Date().toISOString(),
      lastUpdated: new Date().toLocaleTimeString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const scores = calculateFactoryScores(updated);
    currentFactoryRecord = {
      ...updated,
      ...scores,
    };
    return { success: true, data: currentFactoryRecord };
  });

export const submitFactoryLayoutFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as string | undefined)
  .handler(async () => {
    currentFactoryRecord = {
      ...currentFactoryRecord,
      workflowStatus: "Under Review",
      lastUpdated: new Date().toLocaleString(),
    };
    currentFactoryRecord.auditTrail.unshift({
      id: `flog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Factory Layout submitted for executive board review.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    });
    return { success: true, data: currentFactoryRecord };
  });

export const reviewFactoryLayoutFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { id: string; decision: FactoryApprovalDecision; comments?: string }
  )
  .handler(async ({ data }) => {
    let nextStatus = currentFactoryRecord.workflowStatus;
    if (data.decision === "Approved") nextStatus = "Approved";
    else if (data.decision === "Revision Required") nextStatus = "Revision Required";
    else if (data.decision === "Rejected") nextStatus = "Draft";

    currentFactoryRecord = {
      ...currentFactoryRecord,
      workflowStatus: nextStatus,
      approvalDecision: data.decision,
      reviewComments: data.comments ?? currentFactoryRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString(),
    };

    currentFactoryRecord.auditTrail.unshift({
      id: `flog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Current User",
      action: `Review Decision: ${data.decision}`,
      description: data.comments || `Approval decision updated to ${data.decision}`,
      newStatus: nextStatus,
    });

    return { success: true, data: currentFactoryRecord };
  });
