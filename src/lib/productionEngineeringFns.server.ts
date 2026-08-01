import { createServerFn } from "@tanstack/react-start";
import type {
  ProductionEngineeringApprovalDecision,
  ProductionEngineeringFormInput,
  ProductionEngineeringRecord,
  ProductionEngineeringStatus,
} from "@/services/types";

/* ===========================================================================
   Production Engineering — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateProductionEngineeringScores(record: Partial<ProductionEngineeringRecord>) {
  const designScore = record.designReadinessScore ?? 88;
  const resourceScore = record.resourceReadinessScore ?? 85;
  const validationScore = record.validationScore ?? 85;
  const qualityScore = record.qualityScore ?? 84;
  const performanceScore = record.performanceScore ?? 89;
  const aiScore = record.aiEngineeringScore ?? 87;

  // Weighted score calculations
  const overallScore = Math.round(
    designScore * 0.25 +
      resourceScore * 0.15 +
      validationScore * 0.20 +
      qualityScore * 0.20 +
      performanceScore * 0.20
  );

  return {
    designReadinessScore: designScore,
    resourceReadinessScore: resourceScore,
    validationScore,
    qualityScore,
    performanceScore,
    aiEngineeringScore: aiScore,
    overallProductionReadiness: overallScore,
  };
}

export const DEFAULT_PRODUCTION_ENGINEERING_RECORD: ProductionEngineeringRecord = {
  id: "proc-eng-rec-0056",
  productionEngineeringId: "PE-2024-0056",
  formCode: "PEF-2024-25",
  projectName: "Smart EV Charger Production",
  productionVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 3, // Stage 3: Validation
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  linkedProcessDevelopment: { id: "proc-dev-rec-0042", code: "PD-2024-0038" },
  productionEngineer: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  manufacturingPlant: "Magneria Plant - 01",
  productionLine: "EV Charger Assembly Line - A",
  nextReviewDate: "25 Jun 2024",

  productName: "Smart EV Charger AC 7kW",
  manufacturingProcess: "Electronics Assembly",
  productionObjective: "Mass production of AC 7kW EV Charger with high quality, zero-defect and on-time delivery.",
  developmentStage: "Pilot Production",
  productionPriority: "High",
  businessReadiness: 87,

  // Section 2: Design
  routingSheet: "routing_sheet.pdf",
  operationSequence: "operation_sequence.pdf",
  workstationLayout: "workstation_layout.pdf",
  processParameters: "Solder Temp: 240°C, Screw Torque: 1.2 N.m, Test Voltage: 220V, Insulation: 1000V DC",
  standardCycleTime: 18.5, // Min/Unit
  layoutPreview: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
  versionControl: "v1.2.0 (Active)",
  designReadinessScore: 88,

  // Section 3: Resources
  machinesRequired: "PCB Assembly Line, ICT Test Station, Functional Test Station, Screwdriver Station",
  toolingRequired: "Soldering Iron, Torque Wrench, Crimping Tool",
  fixturesRequired: "PCB Fixture, Enclosure Fixture, Test Jig",
  workforceRequirement: "24 Persons/Shift",
  utilityRequirements: "Electricity (3 Phase), Compressed Air, Nitrogen, ESD, Lighting, Cooling",
  productionCapacity: 250, // Units/Day
  equipmentAvailability: "92% Available",
  capacityPlanning: "Sufficient for 250 units/day target.",
  resourceAllocation: "Shift schedule and work orders mapped.",
  resourceReadinessScore: 85,

  // Section 4: Validation
  pilotProduction: "Pilot run successfully completed.",
  trialRun: "3 runs of 50 units completed.",
  firstArticleInspection: "Passed",
  processCapability: 1.67, // Cp/Cpk
  lineBalancing: "Completed (92.5% line balance efficiency).",
  validationRemarks: "Pilot run successful. Quality and dimensions within specification.",
  correctiveActions: "Adjusted torque profile on Station 4 screwdriver.",
  validationChecklist: [
    { id: "val-1", label: "Pilot Run Completed", completed: true, sourceStream: "Manufacturing" },
    { id: "val-2", label: "First Article Inspection (FAI)", completed: true, sourceStream: "Quality Control" },
    { id: "val-3", label: "Process Capability (Cp/Cpk)", completed: true, sourceStream: "Industrial Engineering" },
    { id: "val-4", label: "Line Balancing Completed", completed: true, sourceStream: "Planning" },
  ],
  validationScore: 85,

  // Section 5: Quality & Safety
  controlPlan: "control_plan.pdf",
  pfmea: "pfmea_ev_charger.pdf",
  riskAssessment: "risk_assessment.pdf",
  safetyAssessment: "safety_assessment.pdf",
  pokaYoke: "Mechanical guides for socket connector insertion.",
  qualityGates: "IQC, IPQC, FQC, OQC, Final Test",
  inspectionPlans: "Standard visual and functional checks.",
  complianceStatus: "Compliant with ISO 9001 and CE standards.",
  qualityScore: 84,

  // Section 6: Performance
  plannedOutput: 250, // Units/Day
  oeeTarget: 85, // percentage
  yieldTarget: 98.5, // percentage
  scrapTarget: 1.0, // percentage
  throughputTarget: 15, // Units/Hour
  cycleTime: 18.5,
  downtimeAnalysis: "No significant downtime recorded during trial runs.",
  performanceScore: 89,
  kpiTrend: [
    { period: "Day 1", cycleTime: 19.8, oee: 82.0, yieldRate: 97.2, defectRate: 1.2, throughput: 13.5 },
    { period: "Day 2", cycleTime: 19.2, oee: 84.1, yieldRate: 98.0, defectRate: 0.9, throughput: 14.2 },
    { period: "Day 3", cycleTime: 18.5, oee: 86.2, yieldRate: 98.6, defectRate: 0.7, throughput: 15.1 },
  ],

  // Section 7: AI Assessment
  aiBottleneckAnalysis: "Station 3 (Enclosure assembly) is a minor bottleneck.",
  aiCapacityOptimization: "Could increase capacity to 280 units/day with collaborative robot.",
  aiPredictiveMaintenance: "Station 4 pneumatic cylinder shows signs of friction increase. Maintenance advised in 15 days.",
  aiLineBalancingRecommendations: "Move task 4.2 from Station 3 to Station 4 to balance cycle times.",
  aiProductionRiskPrediction: "Low risk of line stoppages.",
  aiQualityPrediction: "Yield expected to stabilize at 98.7% for next batch.",
  aiThroughputOptimization: "Potential 5% speed increase at screw station.",
  aiEngineeringScore: 87,

  overallProductionReadiness: 87,
  recommendation: "Approve Mass Production",

  attachments: [
    { id: "att-1", name: "manufacturing_layout.pdf", size: "2.4 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-2", name: "routing_sheet.pdf", size: "1.6 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-3", name: "sop_documents.pdf", size: "3.2 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-4", name: "pilot_run_report.pdf", size: "2.1 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-5", name: "pfmea_report.pdf", size: "1.9 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-6", name: "control_plan.pdf", size: "1.4 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-7", name: "ai_assessment_report.pdf", size: "1.5 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "att-8", name: "supporting_documents.zip", size: "3.6 MB", type: "ZIP Archive", uploadDate: "18 Jun 2024" },
  ],

  reviewers: [
    { id: "rev-1", role: "Production Engineer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Pilot run successful. Ready for mass production.", status: "Completed" },
    { id: "rev-2", role: "Manufacturing Manager", person: "Naresh Verma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Ready for review.", status: "Completed" },
    { id: "rev-3", role: "Quality Manager", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Quality targets met.", status: "Completed" },
    { id: "rev-4", role: "Maintenance Manager", person: "Anil Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Maintenance plan ready.", status: "Completed" },
    { id: "rev-5", role: "Industrial Engineering Manager", person: "Neha Reddy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80", decision: "Pending", date: "", comments: "Line balance optimized.", status: "In Progress" },
    { id: "rev-6", role: "Plant Head", person: "Arun Kumar", decision: "Pending", date: "", comments: "Review in progress.", status: "Pending" },
    { id: "rev-7", role: "COO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final approval.", status: "Pending" },
    { id: "rev-8", role: "CEO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final board.", status: "Pending" },
  ],
  approvalDecision: "Approved",
  reviewComments: "Parameters acceptable. Ready for mass production.",
  approvalDate: "18 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "Review & Approval",

  timeline: [
    { id: "m1", title: "Process Design Completed", date: "05 Jun 2024", completed: true, stageNumber: 1 },
    { id: "m2", title: "Resource Planning Completed", date: "07 Jun 2024", completed: true, stageNumber: 2 },
    { id: "m3", title: "Pilot Production Completed", date: "12 Jun 2024", completed: true, stageNumber: 3 },
    { id: "m4", title: "FAI & Validation Completed", date: "14 Jun 2024", completed: true, stageNumber: 4 },
    { id: "m5", title: "Review & Approval", date: "18 Jun 2024", completed: false, stageNumber: 5 },
    { id: "m6", title: "Mass Production Release", date: "24 Jun 2024", completed: false, stageNumber: 6 },
  ],
  auditTrail: [
    { id: "a-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "Form Initialized", details: "Production Engineering record created under PE-2024-0056.", ipAddress: "192.168.1.102" },
    { id: "a-2", timestamp: "18 Jun 2024 11:30 AM", user: "Rahul Sharma", action: "Design Uploaded", details: "Routing sheets and workstations layouts added.", ipAddress: "192.168.1.102" },
    { id: "a-3", timestamp: "19 Jun 2024 02:15 PM", user: "Vikram Singh", action: "QMS Review", details: "Quality checklist validated for FAI.", ipAddress: "192.168.1.115" },
    { id: "a-4", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", action: "Form Submitted", details: "Record submitted for executive review board.", ipAddress: "192.168.1.102" },
  ],
};

let activeRecordStore: ProductionEngineeringRecord = { ...DEFAULT_PRODUCTION_ENGINEERING_RECORD };

export const getProductionEngineeringFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: ProductionEngineeringRecord }> => {
    return { success: true, data: activeRecordStore };
  }
);

export const saveProductionEngineeringDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<ProductionEngineeringFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: ProductionEngineeringRecord }> => {
    const { input } = data;
    const { ...rest } = input;

    // Apply changes
    activeRecordStore = {
      ...activeRecordStore,
      ...rest,
      lastModified: new Date().toISOString(),
      lastUpdated: new Date().toLocaleString(),
    };

    // Recalculate scores
    const calculated = calculateProductionEngineeringScores(activeRecordStore);
    activeRecordStore = {
      ...activeRecordStore,
      ...calculated,
    };

    return { success: true, data: activeRecordStore };
  });

export const submitProductionEngineeringFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: ProductionEngineeringRecord }> => {
    activeRecordStore = {
      ...activeRecordStore,
      workflowStatus: "In Review",
      lastUpdated: new Date().toLocaleString(),
    };

    return { success: true, data: activeRecordStore };
  });

export const reviewProductionEngineeringFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: ProductionEngineeringApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: ProductionEngineeringRecord }> => {
    const { decision, comments } = data;

    let finalStatus: ProductionEngineeringStatus = "In Review";
    if (decision === "Approved") {
      finalStatus = "Approved";
    } else if (decision === "Changes Requested") {
      finalStatus = "Changes Requested";
    } else if (decision === "Rejected") {
      finalStatus = "Rejected";
    }

    activeRecordStore = {
      ...activeRecordStore,
      approvalDecision: decision,
      reviewComments: comments || "",
      workflowStatus: finalStatus,
      approvalDate: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleString(),
    };

    // Update the Production Engineer reviewer record as a mock demonstration
    activeRecordStore.reviewers = activeRecordStore.reviewers.map((rev) => {
      if (rev.role === "Production Engineer") {
        return {
          ...rev,
          decision,
          comments: comments || "Reviewed.",
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: "Completed" as const,
        };
      }
      return rev;
    });

    return { success: true, data: activeRecordStore };
  });
