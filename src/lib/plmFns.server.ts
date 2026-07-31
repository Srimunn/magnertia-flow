import { createServerFn } from "@tanstack/react-start";
import type {
  PlmApprovalDecision,
  PlmFormInput,
  PlmRecord,
  PlmStatus,
} from "@/services/types";

/* ===========================================================================
   Product Lifecycle Management (PLM) — Server Functions & Digital Thread
   =========================================================================== */

export function calculatePlmScores(record: Partial<PlmRecord>) {
  const engScore = record.engineeringScore ?? 91;
  const mfgScore = record.manufacturingScore ?? 90;
  const srvScore = record.serviceScore ?? 88;
  const riskScore = record.riskScore ?? 72;

  const overallHealth = Math.round(
    engScore * 0.3 + mfgScore * 0.3 + srvScore * 0.25 + (100 - riskScore * 0.2) * 0.15
  );

  return {
    engineeringScore: engScore,
    manufacturingScore: mfgScore,
    serviceScore: srvScore,
    riskScore: riskScore,
    overallProductHealthScore: overallHealth,
  };
}

export const DEFAULT_PLM_RECORD: PlmRecord = {
  id: "plm-rec-0021",
  plmId: "PLM-2024-0021",
  formCode: "PLMF-2024-25",
  plmProjectName: "Smart EV Charger PLM",
  productVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 2,
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-18T11:20:00Z",
  lastUpdated: "18 Jun 2024 11:20 AM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  productOwner: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  lifecycleManager: {
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    email: "ananya.iyer@magnertia.com",
  },
  businessUnit: "EV Solutions",
  productCategory: "AC EV Charger",
  productFamily: "EV Chargers",
  productPriority: "High",

  // Section 1: Overview
  productName: "Smart EV Charger AC 7kW",
  lifecycleStage: "Manufacturing",
  productStatus: "Active",
  productDescription: "Smart AC EV Charger with OCPP 1.6J, Wi-Fi, 4G, RFID and Mobile App.",

  // Section 2: Product Configuration Management
  productConfigurationId: "CFG-SMART-AC-7KW",
  bomVersion: "BOM-7KW-V1.2",
  hardwareVersion: "HW-1.2.0",
  firmwareVersion: "FW-1.2.0",
  softwareVersion: "SW-1.2.0",
  configurationBaseline: "Baseline v1.2",
  configurationScore: 92,

  // Section 3: Engineering Lifecycle Checklist
  engineeringChecklist: [
    { id: "eng-1", label: "Requirements Approved", completed: true, sourceStream: "Product Requirements" },
    { id: "eng-2", label: "Design Completed", completed: true, sourceStream: "Product Architecture" },
    { id: "eng-3", label: "Simulation Completed", completed: true, sourceStream: "Simulation & Analysis" },
    { id: "eng-4", label: "Prototype Approved", completed: true, sourceStream: "Prototype Development" },
    { id: "eng-5", label: "Testing Completed", completed: true, sourceStream: "Testing & Validation" },
    { id: "eng-6", label: "Certification Completed", completed: true, sourceStream: "Certification Readiness" },
  ],
  engineeringScore: 91,

  // Section 4: Manufacturing Lifecycle Checklist
  manufacturingChecklist: [
    { id: "mfg-1", label: "Manufacturing Release", completed: true, sourceStream: "Manufacturing Eng" },
    { id: "mfg-2", label: "Supplier Approved", completed: true, sourceStream: "Supply Chain" },
    { id: "mfg-3", label: "Production Started", completed: true, sourceStream: "Industrialization" },
    { id: "mfg-4", label: "Quality Approved", completed: true, sourceStream: "Quality Management" },
    { id: "mfg-5", label: "Inventory Available", completed: true, sourceStream: "Warehouse & Inventory" },
    { id: "mfg-6", label: "Distribution Ready", completed: true, sourceStream: "Logistics" },
  ],
  manufacturingScore: 90,

  // Section 5: Service & Support Lifecycle Checklist
  serviceChecklist: [
    { id: "srv-1", label: "Service Manual Available", completed: true, sourceStream: "Product Documentation" },
    { id: "srv-2", label: "Spare Parts Available", completed: true, sourceStream: "Spare Parts Management" },
    { id: "srv-3", label: "Warranty Active", completed: true, sourceStream: "Warranty & Support" },
    { id: "srv-4", label: "AMC Available", completed: true, sourceStream: "Customer Service" },
    { id: "srv-5", label: "Field Support Ready", completed: true, sourceStream: "Field Operations" },
  ],
  serviceScore: 88,

  // Section 6: Change & Obsolescence Management
  ecrNumber: "ECR-2024-0125",
  ecoNumber: "ECO-2024-0098",
  revisionNumber: "R2",
  productChangeSummary: "Improved thermal design, new connector and firmware update.",
  obsolescenceRisk: "Medium",
  endOfLifePlan: "Planned for FY2031",
  riskScore: 72,

  // Section 7: AI Lifecycle Assessment
  aiProductHealthAnalysis: "Good",
  aiLifecyclePrediction: "Healthy (5.2 Years)",
  aiObsolescencePrediction: "Low Risk",
  aiReliabilityForecast: "High Reliability",
  aiImprovementSuggestions: "3 Suggestions available for thermal component life.",
  aiLifecycleScore: 89,

  // Section 8: Summary & Gauges
  overallProductHealthScore: 88,
  recommendation: "Continue Lifecycle",

  // Section 9: Attachments Grid
  attachments: [
    { id: "att-1", name: "product_master_file_v1.2.pdf", size: "3.6 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Master" },
    { id: "att-2", name: "manufacturing_records_v1.2.pdf", size: "9.2 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Manufacturing" },
    { id: "att-3", name: "configuration_package_v1.2.zip", size: "12.4 MB", type: "zip", uploadDate: "18 Jun 2024", category: "Configuration" },
    { id: "att-4", name: "service_documentation_v1.2.pdf", size: "4.8 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Service" },
    { id: "att-5", name: "product_documentation_v1.2.zip", size: "8.5 MB", type: "zip", uploadDate: "18 Jun 2024", category: "Documentation" },
    { id: "att-6", name: "ai_lifecycle_report_v1.2.pdf", size: "2.2 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "AI Report" },
    { id: "att-7", name: "engineering_records_v1.2.zip", size: "18.7 MB", type: "zip", uploadDate: "18 Jun 2024", category: "Engineering" },
    { id: "att-8", name: "supporting_documents.zip", size: "7.1 MB", type: "zip", uploadDate: "18 Jun 2024", category: "General" },
  ],

  // Section 10: Review & Approval Table
  reviewers: [
    { id: "rev-1", role: "Product Manager", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "All good", status: "Completed", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-2", role: "Engineering Manager", person: "Nisha Verma", decision: "Approved", date: "18 Jun 2024", comments: "Well documented", status: "Completed", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-3", role: "Manufacturing Manager", person: "Vikram Singh", decision: "Approved", date: "18 Jun 2024", comments: "Production ready", status: "Completed", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-4", role: "Quality Manager", person: "Amit Patel", decision: "Approved", date: "18 Jun 2024", comments: "Quality OK", status: "Completed", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-5", role: "Service Manager", person: "Ananya Iyer", decision: "Approved", date: "18 Jun 2024", comments: "Support ready", status: "Completed", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-6", role: "CTO", person: "Dr. Anil Patel", decision: "Pending", date: "-", comments: "Review in progress", status: "Pending", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-7", role: "COO", person: "Arun Kumar", decision: "Pending", date: "-", comments: "-", status: "Pending", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-8", role: "CEO", person: "Sankaran R.", decision: "Pending", date: "-", comments: "-", status: "Pending", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" },
  ],
  approvalDecision: "Approved",
  reviewComments: "Product lifecycle is aligned and ready to proceed.",
  approvalDate: "18 Jun 2024",

  // Section 11: System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "18 Jun 2024 11:20 AM",
  workflowStageLabel: "Manufacturing",

  // Lifecycle Stage Progress (12 Stages)
  stageProgress: [
    { id: "sp-1", name: "Ideation", status: "Completed", stageNumber: 1 },
    { id: "sp-2", name: "Requirements", status: "Completed", stageNumber: 1 },
    { id: "sp-3", name: "Design", status: "Completed", stageNumber: 1 },
    { id: "sp-4", name: "Engineering", status: "Completed", stageNumber: 1 },
    { id: "sp-5", name: "Prototype", status: "Completed", stageNumber: 1 },
    { id: "sp-6", name: "Testing & Validation", status: "Completed", stageNumber: 1 },
    { id: "sp-7", name: "Certification", status: "Completed", stageNumber: 1 },
    { id: "sp-8", name: "Manufacturing", status: "In Progress", stageNumber: 2 },
    { id: "sp-9", name: "Market Launch", status: "Pending", stageNumber: 2 },
    { id: "sp-10", name: "Active Service", status: "Pending", stageNumber: 3 },
    { id: "sp-11", name: "End-of-Life", status: "Pending", stageNumber: 4 },
    { id: "sp-12", name: "Product Retirement", status: "Pending", stageNumber: 4 },
  ],

  // Milestones Timeline
  lifecycleTimeline: [
    { id: "ms-1", title: "Manufacturing Release", date: "18 Jun 2024 09:30 AM", completed: true, stageNumber: 2 },
    { id: "ms-2", title: "Engineering Review", date: "17 Jun 2024 02:15 PM", completed: true, stageNumber: 1 },
    { id: "ms-3", title: "Design Freeze", date: "15 Jun 2024 11:20 AM", completed: true, stageNumber: 1 },
    { id: "ms-4", title: "Prototype Approval", date: "12 Jun 2024 03:45 PM", completed: true, stageNumber: 1 },
    { id: "ms-5", title: "Requirements Approval", date: "08 Jun 2024 10:10 AM", completed: true, stageNumber: 1 },
  ],

  auditTrail: [
    { id: "aud-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "PLM Project Created", details: "PLM Project PLM-2024-0021 created for Smart EV Charger AC 7kW.", ipAddress: "192.168.1.42" },
    { id: "aud-2", timestamp: "18 Jun 2024 10:30 AM", user: "Ananya Iyer", action: "Configuration Baseline Locked", details: "Configuration baseline Locked: Baseline v1.2 (BOM-7KW-V1.2).", ipAddress: "192.168.1.50" },
    { id: "aud-3", timestamp: "18 Jun 2024 11:00 AM", user: "Nisha Verma", action: "ECR/ECO Linked", details: "Linked ECR-2024-0125 & ECO-2024-0098 revision R2 to PLM thread.", ipAddress: "192.168.1.55" },
    { id: "aud-4", timestamp: "18 Jun 2024 11:20 AM", user: "Vikram Singh", action: "Stage 2 Manufacturing Verified", details: "Manufacturing & Service lifecycle readiness verified at 90% and 88%.", ipAddress: "192.168.1.18" },
  ],
};

let memoryPlmStore: PlmRecord = { ...DEFAULT_PLM_RECORD };

export const getPlmFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: memoryPlmStore };
});

export const savePlmDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<PlmFormInput> }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...memoryPlmStore,
      ...data.input,
      lastModifiedDate: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    memoryPlmStore = updated;
    return { success: true, data: memoryPlmStore };
  });

export const submitPlmFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async () => {
    const updated: PlmRecord = {
      ...memoryPlmStore,
      workflowStatus: "Executive Review",
      stage: 4,
      workflowStageLabel: "Executive Review (Stage 4)",
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Rahul Sharma",
          action: "Submitted PLM Report for Executive Board Review",
          details: "Product Digital Thread & Lifecycle report submitted to Executive Board for decision.",
        },
        ...memoryPlmStore.auditTrail,
      ],
    };
    memoryPlmStore = updated;
    return { success: true, data: memoryPlmStore };
  });

export const reviewPlmFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: PlmApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    let nextStatus: PlmStatus = "Executive Review";
    let nextStage: 1 | 2 | 3 | 4 = memoryPlmStore.stage;
    let nextStageLabel = memoryPlmStore.workflowStageLabel;

    if (data.decision === "Approved") {
      nextStatus = "Approved";
      nextStage = 4;
      nextStageLabel = "Product Lifecycle Continued & Active";
    } else if (data.decision === "Approved with Conditions") {
      nextStatus = "Approved with Conditions";
      nextStage = 4;
      nextStageLabel = "Approved with Minor Improvements";
    } else if (data.decision === "Revision Required") {
      nextStatus = "Revision Required";
      nextStage = 2;
      nextStageLabel = "Engineering Review Required";
    } else if (data.decision === "End-of-Life Approved") {
      nextStatus = "End-of-Life Approved";
      nextStage = 4;
      nextStageLabel = "End-of-Life Initiated & Planned Retirement";
    } else if (data.decision === "Rejected") {
      nextStatus = "Rejected";
      nextStage = 4;
      nextStageLabel = "Closed & Archived";
    }

    const newReviewers = memoryPlmStore.reviewers.map((rev) => {
      if (rev.role === "CTO" || rev.role === "CEO" || rev.role === "COO") {
        return {
          ...rev,
          decision: data.decision,
          comments: data.comments || rev.comments,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: "Completed" as const,
        };
      }
      return rev;
    });

    const updated: PlmRecord = {
      ...memoryPlmStore,
      workflowStatus: nextStatus,
      stage: nextStage,
      workflowStageLabel: nextStageLabel,
      approvalDecision: data.decision,
      reviewComments: data.comments || memoryPlmStore.reviewComments,
      approvalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      reviewers: newReviewers,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Sankaran R.",
          action: `Executive Review Decision: ${data.decision}`,
          details: `Executive Board recorded '${data.decision}' decision for product digital thread.`,
        },
        ...memoryPlmStore.auditTrail,
      ],
    };

    memoryPlmStore = updated;
    return { success: true, data: memoryPlmStore };
  });

export const advancePlmStageFn = createServerFn({ method: "POST" })
  .validator((data: { targetStage: 1 | 2 | 3 | 4 }) => data)
  .handler(async ({ data }) => {
    let nextStatus: PlmStatus = memoryPlmStore.workflowStatus;
    let stageLabel = "Product Configuration Management";
    if (data.targetStage === 1) {
      nextStatus = "Product Configuration Management";
      stageLabel = "Product Configuration Management (Stage 1)";
    } else if (data.targetStage === 2) {
      nextStatus = "Lifecycle Assessment";
      stageLabel = "Lifecycle Assessment (Stage 2)";
    } else if (data.targetStage === 3) {
      nextStatus = "Engineering Change Management";
      stageLabel = "Engineering Change Management (Stage 3)";
    } else if (data.targetStage === 4) {
      nextStatus = "Executive Review";
      stageLabel = "Executive Review (Stage 4)";
    }

    const updated: PlmRecord = {
      ...memoryPlmStore,
      stage: data.targetStage,
      workflowStatus: nextStatus,
      workflowStageLabel: stageLabel,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Rahul Sharma",
          action: `Advanced to Stage ${data.targetStage}`,
          details: `PLM workflow stage set to Stage ${data.targetStage}: ${stageLabel}`,
        },
        ...memoryPlmStore.auditTrail,
      ],
    };
    memoryPlmStore = updated;
    return { success: true, data: memoryPlmStore };
  });

export const togglePlmChecklistFn = createServerFn({ method: "POST" })
  .validator((data: { section: "engineering" | "manufacturing" | "service"; itemId: string }) => data)
  .handler(async ({ data }) => {
    let engList = [...memoryPlmStore.engineeringChecklist];
    let mfgList = [...memoryPlmStore.manufacturingChecklist];
    let srvList = [...memoryPlmStore.serviceChecklist];

    if (data.section === "engineering") {
      engList = engList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    } else if (data.section === "manufacturing") {
      mfgList = mfgList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    } else if (data.section === "service") {
      srvList = srvList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    }

    const engScore = Math.round((engList.filter((c) => c.completed).length / engList.length) * 100);
    const mfgScore = Math.round((mfgList.filter((c) => c.completed).length / mfgList.length) * 100);
    const srvScore = Math.round((srvList.filter((c) => c.completed).length / srvList.length) * 100);
    const overallHealth = Math.round(
      engScore * 0.3 + mfgScore * 0.3 + srvScore * 0.25 + (100 - memoryPlmStore.riskScore * 0.2) * 0.15
    );

    const updated: PlmRecord = {
      ...memoryPlmStore,
      engineeringChecklist: engList,
      manufacturingChecklist: mfgList,
      serviceChecklist: srvList,
      engineeringScore: engScore,
      manufacturingScore: mfgScore,
      serviceScore: srvScore,
      overallProductHealthScore: overallHealth,
    };

    memoryPlmStore = updated;
    return { success: true, data: memoryPlmStore };
  });
