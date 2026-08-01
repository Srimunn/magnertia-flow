import { createServerFn } from "@tanstack/react-start";
import type {
  AssemblyLineApprovalDecision,
  AssemblyLineFormInput,
  AssemblyLineRecord,
  AssemblyLineStatus,
} from "@/services/types";

/* ===========================================================================
   Assembly Line Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateAssemblyLineScores(record: Partial<AssemblyLineRecord>) {
  const layoutScore = record.layoutDesignScore ?? 88;
  const workstationScore = record.workstationReadinessScore ?? 86;
  const validationScore = record.validationScore ?? 85;
  const automationScore = record.automationScore ?? 87;
  const performanceScore = record.performanceScore ?? 86;
  const aiScore = record.aiReadinessScore ?? 88;

  // Weighted score calculations
  const overallScore = Math.round(
    layoutScore * 0.25 +
      workstationScore * 0.15 +
      validationScore * 0.20 +
      automationScore * 0.20 +
      performanceScore * 0.20
  );

  return {
    layoutDesignScore: layoutScore,
    workstationReadinessScore: workstationScore,
    validationScore,
    automationScore,
    performanceScore,
    aiReadinessScore: aiScore,
    overallAssemblyReadiness: overallScore,
  };
}

export const DEFAULT_ASSEMBLY_LINE_RECORD: AssemblyLineRecord = {
  id: "proc-asm-rec-0045",
  assemblyLineId: "ALD-2024-0045",
  formCode: "ALDF-2024-25",
  projectName: "Smart EV Charger Assembly Line",
  assemblyLineVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 3, // Stage 3: Validation / Line Balancing
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-7KW", name: "Smart EV Charger AC 7kW" },
  linkedProductionEngineering: { id: "proc-eng-rec-0056", code: "PE-2024-0038" },
  assemblyLineEngineer: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },
  manufacturingPlant: "Magnertia Plant - 01",
  productionLine: "EV Charger Assembly Line - A",
  nextReviewDate: "25 Jun 2024",

  productFamily: "EV Chargers",
  assemblyLineType: "Semi-Automated",
  productionObjective: "To assemble EV chargers with high quality, optimized cycle time and zero-defect delivery.",
  developmentStage: "Line Balancing",
  priority: "High",

  // Section 2: Layout Design
  factoryLayout: "factory_layout.pdf",
  assemblyLineLayout: "line_layout.pdf",
  workstationLayoutFile: "workstation_layout.pdf",
  materialFlowDiagram: "material_flow.pdf",
  lineConfiguration: "U-Shaped Line",
  numberOfWorkstations: 12,
  layoutDesignScore: 88,

  // Section 3: Workstations
  workstationList: "workstation_list.pdf",
  workInstructions: "swi_ev_charger.pdf",
  cycleTimePerStation: 82, // seconds
  operatorRequirement: 18, // Nos
  machineAllocation: ["Screwdriver Station", "Test Station", "Soldering Station"],
  ergonomicAssessment: "ergonomics_report.pdf",
  workstationReadinessScore: 86,

  // Section 4: Line Balancing
  taktTime: 90, // seconds
  lineBalancingCompleted: true,
  bottleneckAnalysis: "bottleneck_analysis.pdf",
  pilotLineRun: true,
  throughputValidation: true,
  validationRemarks: "Pilot run successful. All stations within takt time. Throughput achieved 261 units/day.",
  validationChecklist: [
    { id: "v-1", label: "Takt Time Compliance Check", completed: true, sourceStream: "Industrial Engineering" },
    { id: "v-2", label: "Station Idle Time Audit", completed: true, sourceStream: "Line Control" },
    { id: "v-3", label: "Pilot Run Throughput Check", completed: true, sourceStream: "Manufacturing" },
    { id: "v-4", label: "Ergonomics & Safety Staging", completed: true, sourceStream: "EHS Board" },
  ],
  validationScore: 85,

  // Section 5: Automation & Quality
  automationLevel: "Semi-Automated",
  robotStations: 2,
  visionInspection: true,
  pokaYoke: true,
  inlineTesting: true,
  qualityGates: "Incoming, In-process, Final Test, Packaging Inspection",
  automationScore: 87,

  // Section 6: Performance
  plannedOutput: 250, // Units/Day
  lineCapacity: 260, // Units/Day
  oeeTarget: 85, // percentage
  yieldTarget: 98.5, // percentage
  scrapTarget: 1.0, // percentage
  overallEfficiency: 82.6, // percentage
  performanceScore: 86,
  kpiTrend: [
    { period: "Run 1", oee: 78.5, yieldRate: 96.0, defectRate: 1.5, throughput: 230 },
    { period: "Run 2", oee: 81.2, yieldRate: 97.4, defectRate: 1.1, throughput: 245 },
    { period: "Run 3", oee: 82.6, yieldRate: 98.7, defectRate: 0.8, throughput: 261 },
  ],

  // Section 7: AI Assessment
  aiLineOptimization: "Workstations can be optimized to reduce idle time by 6%.",
  aiBottleneckPrediction: "Station 7 likely bottleneck at peak demand.",
  aiResourceUtilization: "Operator utilization 92% (Optimal).",
  aiMaintenanceSuggestions: "Check soldering station for vibration anomaly.",
  aiProductivityRecommendations: "Add Pick-to-Light at Station 5 & 8.",
  aiReadinessScore: 88,

  overallAssemblyReadiness: 87,
  recommendation: "Approve Line for Production",

  attachments: [
    { id: "a-1", name: "factory_layout.pdf", size: "2.4 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-2", name: "assembly_line_drawings.pdf", size: "3.6 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-3", name: "work_instructions.pdf", size: "3.1 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-4", name: "line_balancing_report.pdf", size: "1.8 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-5", name: "pilot_run_report.pdf", size: "1.5 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-6", name: "quality_plan.pdf", size: "2.2 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-7", name: "ai_assessment_report.pdf", size: "2.4 MB", type: "PDF Document", uploadDate: "18 Jun 2024" },
    { id: "a-8", name: "supporting_documents.zip", size: "4.2 MB", type: "ZIP Archive", uploadDate: "18 Jun 2024" },
  ],

  reviewers: [
    { id: "rev-1", role: "Assembly Line Engineer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Pilot run successful.", status: "Completed" },
    { id: "rev-2", role: "Production Manager", person: "Naresh Verma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Balanced line.", status: "Completed" },
    { id: "rev-3", role: "Manufacturing Manager", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "All criteria met. Assembly line is ready for mass production.", status: "Completed" },
    { id: "rev-4", role: "Quality Manager", person: "Amit Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80", decision: "Approved", date: "18 Jun 2024", comments: "Quality targets met.", status: "Completed" },
    { id: "rev-5", role: "Industrial Engg. Manager", person: "Neha Reddy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80", decision: "Pending", date: "", comments: "Line can be optimized.", status: "In Progress" },
    { id: "rev-6", role: "Plant Head", person: "Arun Kumar", decision: "Pending", date: "", comments: "Review in progress.", status: "Pending" },
    { id: "rev-7", role: "COO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Awaiting final review.", status: "Pending" },
    { id: "rev-8", role: "CEO", person: "Sankaran R.", decision: "Pending", date: "", comments: "Final approval.", status: "Pending" },
  ],
  approvalDecision: "Approved",
  reviewComments: "All criteria met. Assembly line is ready for mass production.",
  approvalDate: "18 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "Review & Approval",

  timeline: [
    { id: "m1", title: "Line Layout Design", date: "05 Jun 2024", completed: true, stageNumber: 1 },
    { id: "m2", title: "Workstation Planning", date: "07 Jun 2024", completed: true, stageNumber: 2 },
    { id: "m3", title: "Pilot Line Run", date: "12 Jun 2024", completed: true, stageNumber: 3 },
    { id: "m4", title: "Line Balancing", date: "14 Jun 2024", completed: true, stageNumber: 4 },
    { id: "m5", title: "Quality Validation", date: "17 Jun 2024", completed: true, stageNumber: 5 },
    { id: "m6", title: "Review & Approval", date: "18 Jun 2024", completed: false, stageNumber: 6 },
  ],
  auditTrail: [
    { id: "a-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "Form Initialized", details: "Assembly Line Development record created under ALD-2024-0045.", ipAddress: "192.168.1.102" },
    { id: "a-2", timestamp: "18 Jun 2024 11:30 AM", user: "Rahul Sharma", action: "Layout Uploaded", details: "factory_layout.pdf added.", ipAddress: "192.168.1.102" },
    { id: "a-3", timestamp: "19 Jun 2024 02:15 PM", user: "Vikram Singh", action: "QMS Review", details: "Quality checklist validated for Pilot Run.", ipAddress: "192.168.1.115" },
    { id: "a-4", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", action: "Form Submitted", details: "Record submitted for board review.", ipAddress: "192.168.1.102" },
  ],
};

let activeRecordStore: AssemblyLineRecord = { ...DEFAULT_ASSEMBLY_LINE_RECORD };

export const getAssemblyLineFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: AssemblyLineRecord }> => {
    return { success: true, data: activeRecordStore };
  }
);

export const saveAssemblyLineDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<AssemblyLineFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: AssemblyLineRecord }> => {
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
    const calculated = calculateAssemblyLineScores(activeRecordStore);
    activeRecordStore = {
      ...activeRecordStore,
      ...calculated,
    };

    return { success: true, data: activeRecordStore };
  });

export const submitAssemblyLineFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: AssemblyLineRecord }> => {
    activeRecordStore = {
      ...activeRecordStore,
      workflowStatus: "In Review",
      lastUpdated: new Date().toLocaleString(),
    };

    return { success: true, data: activeRecordStore };
  });

export const reviewAssemblyLineFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: AssemblyLineApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: AssemblyLineRecord }> => {
    const { decision, comments } = data;

    let finalStatus: AssemblyLineStatus = "In Review";
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

    // Update the Assembly Line Engineer reviewer record as a mock demonstration
    activeRecordStore.reviewers = activeRecordStore.reviewers.map((rev) => {
      if (rev.role === "Assembly Line Engineer") {
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
