import { createServerFn } from "@tanstack/react-start";
import type {
  CapacityApprovalDecision,
  CapacityAttachment,
  CapacityFormInput,
  CapacityPlanningRecord,
  CapacityReviewer,
} from "@/services/types";

/* ===========================================================================
   Capacity Planning — Server Functions & Calculation Engine
   =========================================================================== */

export function calculateCapacityReadinessScore(record: Partial<CapacityPlanningRecord>) {
  const assessment = record.assessmentScore ?? 88;
  const resource = record.resourceScore ?? 86;
  const bottleneck = record.bottleneckScore ?? 85;
  const simulation = record.simulationScore ?? 86;
  const performance = record.performanceScore ?? 84;

  const overallScore = Math.round(
    assessment * 0.25 +
      resource * 0.25 +
      bottleneck * 0.20 +
      simulation * 0.15 +
      performance * 0.15
  );

  return {
    assessmentScore: assessment,
    resourceScore: resource,
    bottleneckScore: bottleneck,
    simulationScore: simulation,
    performanceScore: performance,
    overallCapacityReadiness: overallScore,
  };
}

export const DEFAULT_CAPACITY_PLANNING_RECORD: CapacityPlanningRecord = {
  id: "proc-cap-rec-00027",
  planningId: "CP-2024-00027",
  formCode: "CPF-2024-25",
  projectName: "EV Charger Production Capacity Plan",
  planningVersion: "v1.2.0",
  workflowStatus: "In Progress",
  stage: 2, // Capacity Assessment
  createdOn: "18 Jun 2024 09:30 AM",
  dateCreated: "2024-06-18T09:30:00Z",
  lastModified: "2024-06-20T14:15:00Z",
  lastUpdated: "20 Jun 2024 02:15 PM",

  plantName: "Magnertia Plant - 01",
  businessUnit: "EV Charger Division",
  engineerName: "Rahul Sharma",
  engineerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  planningPeriod: "Jul 2024 - Jun 2025",
  developmentStage: "Capacity Assessment",
  nextReviewDate: "25 Jun 2024",

  // Key KPI Numbers
  demandForecastUnits: 120000,
  plannedProductionUnits: 118000,
  capacityUtilization: 78,
  oeePercentage: 82,
  bottleneckCount: 2,

  // Section 2: Assessment
  availableMachineHours: 4200,
  availableLabourHours: 8500,
  productionLineCapacity: 125000,
  workstationCapacity: 122000,
  equipmentUtilization: 82,
  assessmentScore: 88,

  // Section 3: Resource Planning
  allocatedMachines: 68,
  totalMachines: 80,
  allocatedWorkforce: 320,
  totalWorkforce: 360,
  materialAvailability: 94,
  toolAvailability: 95,
  utilityAvailability: 100,
  shiftPattern: "3 Shifts / Day (24x7)",
  resourceScore: 86,

  // Section 4: Bottlenecks
  bottlenecks: [
    {
      id: "btn-001",
      workstation: "WS-40",
      equipment: "Coil Winding Machine",
      constraint: "Machine Capacity",
      impact: "High",
      rootCause: "High cycle time during winding phase",
      improvementActions: "Add 1 parallel automated winder",
      estimatedGain: "+15% line throughput",
    },
    {
      id: "btn-002",
      workstation: "WS-70",
      equipment: "Testing Station",
      constraint: "Labour Capacity",
      impact: "High",
      rootCause: "Manual high-voltage test sequence",
      improvementActions: "Automate test rig software",
      estimatedGain: "+12% testing capacity",
    },
    {
      id: "btn-003",
      workstation: "WS-20",
      equipment: "PCB Assembly",
      constraint: "Machine Capacity",
      impact: "Medium",
      rootCause: "SMT feeder reloading delay",
      improvementActions: "Implement dual-feeder trolley",
      estimatedGain: "+8% SMT speed",
    },
  ],
  bottleneckScore: 85,

  // Section 5: Simulation
  digitalTwinEnabled: true,
  activeScenario: "Peak Demand (Q3)",
  simulationScore: 86,

  // Section 6: Performance
  lineEfficiency: 85,
  deliveryPerformance: 94,
  costPerUnit: 1420,
  performanceScore: 84,

  // Section 7: AI Capacity Assessment
  aiDemandForecastInsight: "Q3 demand will increase by 18% based on market trend vectors.",
  aiCapacityOptimization: "Increase Line 3 shifts for +12% capacity headroom.",
  aiBottleneckPrediction: "WS-40 may become critical in Aug 2024 under peak load.",
  aiExpansionRecommendation: "Add 1 Testing Station to reduce testing bottleneck.",
  aiWorkforceOptimization: "Reallocate 15 operators to Line 3 during shift 2.",
  aiCapacityScore: 88,

  overallCapacityReadiness: 87,
  recommendation: "Approve Capacity Plan",

  attachments: [
    {
      id: "catt-001",
      fileName: "capacity_calculation_sheet.xlsx",
      fileType: "xlsx",
      documentType: "Calculation Sheet",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "120 KB",
      status: "Active",
    },
    {
      id: "catt-002",
      fileName: "production_forecast.xlsx",
      fileType: "xlsx",
      documentType: "Demand Forecast",
      version: "v1.2",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "18 Jun 2024",
      fileSize: "85 KB",
      status: "Active",
    },
    {
      id: "catt-003",
      fileName: "simulation_report.pdf",
      fileType: "pdf",
      documentType: "Simulation Report",
      version: "v1.0",
      uploadedBy: "Vikram Singh",
      uploadedDate: "19 Jun 2024",
      fileSize: "2.4 MB",
      status: "Active",
    },
    {
      id: "catt-004",
      fileName: "bottleneck_analysis.pdf",
      fileType: "pdf",
      documentType: "Bottleneck Analysis",
      version: "v1.1",
      uploadedBy: "Amit Patel",
      uploadedDate: "19 Jun 2024",
      fileSize: "1.8 MB",
      status: "Active",
    },
    {
      id: "catt-005",
      fileName: "resource_plan.xlsx",
      fileType: "xlsx",
      documentType: "Resource Plan",
      version: "v1.0",
      uploadedBy: "Rahul Sharma",
      uploadedDate: "20 Jun 2024",
      fileSize: "110 KB",
      status: "Active",
    },
  ],

  reviewers: [
    {
      role: "Capacity Planning Engineer",
      person: "Rahul Sharma",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Plan prepared",
      status: "Approved",
    },
    {
      role: "Production Manager",
      person: "Naresh Verma",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Capacity feasible",
      status: "Approved",
    },
    {
      role: "Manufacturing Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      date: "19 Jun 2024",
      comments: "Machines available",
      status: "Approved",
    },
    {
      role: "Industrial Engineer",
      person: "Amit Patel",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Layout valid",
      status: "Approved",
    },
    {
      role: "Supply Chain Manager",
      person: "Priya Nair",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Material available",
      status: "Approved",
    },
    {
      role: "Plant Head",
      person: "Neha Reddy",
      decision: "Pending",
      date: "-",
      comments: "Under review",
      status: "Pending",
    },
    {
      role: "COO",
      person: "Arun Kumar",
      decision: "Pending",
      date: "-",
      comments: "Awaiting review",
      status: "Pending",
    },
    {
      role: "CEO",
      person: "Sankaran R.",
      decision: "Pending",
      date: "-",
      comments: "Awaiting approval",
      status: "Pending",
    },
  ],

  approvalDecision: "Approved",
  reviewComments: "Capacity planning model verified for EV Charger Division. Recommended for production ramp-up.",
  approvalDate: "20 Jun 2024",

  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:30 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 02:15 PM",
  workflowStageLabel: "Capacity Assessment",

  timeline: [
    { label: "Demand Assessment Completed", date: "05 Jun 2024", status: "Completed" },
    { label: "Resource Allocation Completed", date: "10 Jun 2024", status: "Completed" },
    { label: "Bottleneck Analysis Completed", date: "14 Jun 2024", status: "Completed" },
    { label: "Simulation Completed", date: "18 Jun 2024", status: "Completed" },
    { label: "Review & Approval", date: "In Progress", status: "In Progress" },
    { label: "Ramp-up Execution", date: "Pending", status: "Pending" },
  ],

  auditTrail: [
    {
      id: "clog-001",
      timestamp: "18 Jun 2024 09:30 AM",
      user: "Rahul Sharma",
      action: "Created Capacity Plan",
      description: "Initial creation of EV Charger Production Capacity Plan (CP-2024-00027).",
    },
    {
      id: "clog-002",
      timestamp: "18 Jun 2024 02:15 PM",
      user: "Rahul Sharma",
      action: "Updated Demand Forecast",
      description: "Updated demand forecast to 120,000 units for Jul 2024 - Jun 2025.",
    },
    {
      id: "clog-003",
      timestamp: "19 Jun 2024 11:30 AM",
      user: "Vikram Singh",
      action: "Ran Digital Twin Capacity Simulation",
      description: "Peak Demand (Q3) scenario completed with score 86/100.",
    },
    {
      id: "clog-004",
      timestamp: "20 Jun 2024 02:15 PM",
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Capacity plan submitted for executive review board.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    },
  ],

  simulations: [
    {
      id: "csim-001",
      scenarioName: "Peak Demand (Q3)",
      simulationScore: 86,
      expansionRequirement: "Recommended (+1 Testing Rig)",
      passed: true,
      runDate: "18 Jun 2024",
    },
    {
      id: "csim-002",
      scenarioName: "Base Case (100% Demand)",
      simulationScore: 92,
      expansionRequirement: "None Required",
      passed: true,
      runDate: "17 Jun 2024",
    },
  ],
};

let currentCapacityRecord = { ...DEFAULT_CAPACITY_PLANNING_RECORD };

export const getCapacityPlanningFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentCapacityRecord };
});

export const saveCapacityDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id?: string; input: Partial<CapacityFormInput> })
  .handler(async ({ data }) => {
    const updated = {
      ...currentCapacityRecord,
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
    const scores = calculateCapacityReadinessScore(updated);
    currentCapacityRecord = {
      ...updated,
      ...scores,
    };
    return { success: true, data: currentCapacityRecord };
  });

export const submitCapacityFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as string | undefined)
  .handler(async () => {
    currentCapacityRecord = {
      ...currentCapacityRecord,
      workflowStatus: "Under Review",
      lastUpdated: new Date().toLocaleString(),
    };
    currentCapacityRecord.auditTrail.unshift({
      id: `clog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Rahul Sharma",
      action: "Submitted for Review",
      description: "Capacity plan submitted for executive review board.",
      prevStatus: "In Progress",
      newStatus: "Under Review",
    });
    return { success: true, data: currentCapacityRecord };
  });

export const reviewCapacityFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { id: string; decision: CapacityApprovalDecision; comments?: string }
  )
  .handler(async ({ data }) => {
    let nextStatus = currentCapacityRecord.workflowStatus;
    if (data.decision === "Approved") nextStatus = "Approved";
    else if (data.decision === "Revision Required") nextStatus = "Revision Required";
    else if (data.decision === "Rejected") nextStatus = "Draft";

    currentCapacityRecord = {
      ...currentCapacityRecord,
      workflowStatus: nextStatus,
      approvalDecision: data.decision,
      reviewComments: data.comments ?? currentCapacityRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString(),
    };

    currentCapacityRecord.auditTrail.unshift({
      id: `clog-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: "Current User",
      action: `Review Decision: ${data.decision}`,
      description: data.comments || `Approval decision updated to ${data.decision}`,
      newStatus: nextStatus,
    });

    return { success: true, data: currentCapacityRecord };
  });
