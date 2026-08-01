import { createServerFn } from "@tanstack/react-start";
import type {
  RoutingRecord,
  RoutingFormInput,
  RoutingOperation,
  RoutingApprovalDecision,
  RoutingRecommendation,
} from "@/services/types";

export const INITIAL_ROUTING_RECORD: RoutingRecord = {
  id: "rtg-rec-000123",
  routingId: "RTG-2024-000123",
  formCode: "RTD-2024-25",
  routingName: "Autonomous W-EVSE Manufacturing Routing",
  routingNumber: "RTG-AW-EVSE-001",
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  processOwner: "Rahul Sharma",
  routingVersion: "2.1",
  workflowStatus: "In Review",

  // Routing Overview
  productFamily: "Wireless EV Charging",
  productModel: "AW-EVSE-1000",
  manufacturingPlant: "Plant-01 (Pune High-Tech Facility)",
  productionLine: "EV Assembly Line 2",
  routingDescription: "Comprehensive manufacturing routing for Autonomous Wireless EVSE Station detailing 12 sequential operations across CNC cutting, press bending, MIG welding, powder coating, SMT assembly, sub-assemblies, and final automated testing.",
  lifecycleStage: "Routing Development",
  productionType: "Mass Production",
  priority: "High",

  // Scores
  routingReadinessScore: 88,
  resourceReadinessScore: 85,
  manufacturingReadinessScore: 90,
  qualityScore: 86,
  costScore: 82,
  overallReadinessScore: 87,

  // Operations Totals
  totalOperationsCount: 12,
  totalSetupTimeMins: 235,
  totalCycleTimeMins: 114.5,
  totalLabourCount: 18,

  // Operations List (Matching Image 2)
  operations: [
    {
      id: "op-10",
      seq: 1,
      operationNo: "OP-10",
      operationName: "Incoming Material Inspection",
      workCentre: "QC-01",
      machine: "Inspection Table",
      setupTimeMins: 15,
      cycleTimeMins: 5.0,
      labourCount: 1,
      status: "Active",
      description: "Verify raw metal sheets, fasteners, and electronic sub-assemblies against PO & CIPC standards.",
      inspectionPoint: true,
    },
    {
      id: "op-20",
      seq: 2,
      operationNo: "OP-20",
      operationName: "Enclosure Body Cutting",
      workCentre: "MC-01",
      machine: "CNC Laser Cutter",
      setupTimeMins: 20,
      cycleTimeMins: 8.5,
      labourCount: 1,
      status: "Active",
      description: "Laser cut AL 6061-T6 aluminum sheet for charger body shell and heatsink mounting bracket.",
    },
    {
      id: "op-30",
      seq: 3,
      operationNo: "OP-30",
      operationName: "Enclosure Bending",
      workCentre: "MC-02",
      machine: "CNC Press Brake",
      setupTimeMins: 25,
      cycleTimeMins: 10.0,
      labourCount: 1,
      status: "Active",
      description: "Multi-axis CNC bending of enclosure panels according to CAD drawing Rev 2.1.",
    },
    {
      id: "op-40",
      seq: 4,
      operationNo: "OP-40",
      operationName: "Enclosure Welding",
      workCentre: "MC-03",
      machine: "MIG Welding Station",
      setupTimeMins: 30,
      cycleTimeMins: 12.0,
      labourCount: 1,
      status: "Active",
      description: "Robotic MIG seam welding for weatherproof IP67 enclosure seal.",
      criticalOp: true,
      spcRequired: true,
    },
    {
      id: "op-50",
      seq: 5,
      operationNo: "OP-50",
      operationName: "Surface Grinding",
      workCentre: "MC-04",
      machine: "Grinding Machine",
      setupTimeMins: 15,
      cycleTimeMins: 7.0,
      labourCount: 1,
      status: "Active",
      description: "Deburring and surface smoothing prior to powder coating application.",
    },
    {
      id: "op-60",
      seq: 6,
      operationNo: "OP-60",
      operationName: "Powder Coating",
      workCentre: "MC-05",
      machine: "Powder Coating Line",
      setupTimeMins: 30,
      cycleTimeMins: 15.0,
      labourCount: 2,
      status: "Active",
      description: "Electrostatic polyester powder coating and 180°C thermal curing oven pass.",
    },
    {
      id: "op-70",
      seq: 7,
      operationNo: "OP-70",
      operationName: "PCB Assembly",
      workCentre: "MC-06",
      machine: "SMT Line",
      setupTimeMins: 20,
      cycleTimeMins: 6.0,
      labourCount: 2,
      status: "Active",
      description: "Surface Mount Technology pick & place + reflow soldering for 12-layer SiC Inverter board.",
      criticalOp: true,
      inspectionPoint: true,
      spcRequired: true,
    },
    {
      id: "op-80",
      seq: 8,
      operationNo: "OP-80",
      operationName: "Module Assembly",
      workCentre: "AS-01",
      machine: "Assembly Station-1",
      setupTimeMins: 10,
      cycleTimeMins: 9.0,
      labourCount: 2,
      status: "Active",
      description: "Mount Power Electronics Inverter, MCU Controller, and cooling fan into chassis.",
    },
    {
      id: "op-90",
      seq: 9,
      operationNo: "OP-90",
      operationName: "Sub Assembly",
      workCentre: "AS-02",
      machine: "Assembly Station-2",
      setupTimeMins: 15,
      cycleTimeMins: 10.0,
      labourCount: 2,
      status: "Active",
      description: "Install 85kHz resonant transmitter coil and robotic docking arm assembly.",
    },
    {
      id: "op-100",
      seq: 10,
      operationNo: "OP-100",
      operationName: "Final Assembly",
      workCentre: "AS-03",
      machine: "Assembly Station-3",
      setupTimeMins: 20,
      cycleTimeMins: 12.0,
      labourCount: 2,
      status: "Active",
      description: "Final mechanical integration, IP67 gasket sealing, and wire harness connection.",
    },
    {
      id: "op-110",
      seq: 11,
      operationNo: "OP-110",
      operationName: "Functional Testing",
      workCentre: "QC-02",
      machine: "Test Bench",
      setupTimeMins: 15,
      cycleTimeMins: 8.0,
      labourCount: 1,
      status: "Active",
      description: "Automated 22kW power transfer test, Hi-Pot insulation voltage check, and CAN bus diagnostics.",
      criticalOp: true,
      inspectionPoint: true,
    },
    {
      id: "op-120",
      seq: 12,
      operationNo: "OP-120",
      operationName: "Final Inspection & Packing",
      workCentre: "PK-01",
      machine: "Packing Station",
      setupTimeMins: 10,
      cycleTimeMins: 6.0,
      labourCount: 1,
      status: "Active",
      description: "Visual quality audit, barcode serial tagging, protective foam wrapping, and wooden crate boxing.",
    },
  ],

  // Resource Allocation
  requiredMachinesCount: 5,
  requiredToolsCount: 12,
  requiredFixturesCount: 8,
  requiredJigsCount: 4,
  requiredMachines: ["CNC Laser Cutter", "CNC Press Brake", "MIG Welding Station", "Powder Coating Line", "SMT Line"],
  requiredTools: ["Torque Wrench Set 5-25Nm", "Pneumatic Riveter", "ESD Soldering Station", "Digital Calipers"],
  requiredFixtures: ["Fixture-EVSE-Alignment-01", "Welding Positioner Fixture", "SMT Pallet Fixture"],
  requiredJigs: ["Robotic Calibration Jig", "Coil Winding Alignment Jig"],
  operatorSkillLevel: "Skilled",
  capacityRequirementUnitsPerDay: 250,
  resourceAvailability: true,

  // Manufacturing Validation
  bomReference: "BOM-AW-EVSE-001",
  workInstructionRef: "WI-AW-EVSE-001",
  sopRef: "SOP-AW-EVSE-002",
  inspectionPlanRef: "IP-AW-EVSE-001",
  processValidationStatus: true,
  validationNotes: "Pilot run completed successfully. 50 units produced with zero critical defects.",

  // Quality & Compliance
  criticalOperations: ["OP-40", "OP-70", "OP-110"],
  inspectionPointsCount: 12,
  inspectionPointsNotes: "12 Inspection Points Defined across raw material, SMT AOI, welding seam, and final 22kW test bench.",
  spcRequired: true,
  traceabilityRequired: true,
  regulatoryStandards: ["ISO 9001:2015", "ISO 14001:2015", "CE Mark", "IEC 61851-1", "IEC 61980-1"],
  qualityChecklistFile: "QC_Checklist.pdf",

  // Production Cost Analysis
  machineCost: 18450,
  labourCost: 12680,
  toolingCost: 6250,
  overheadCost: 5670,
  totalRoutingCost: 43050,
  targetCost: 45000,
  costVariance: 1950,

  // AI Routing Assessment
  aiAssessment: {
    healthScore: 84,
    routingOptimization: "Operation sequence is efficient. 8% overall throughput improvement possible.",
    bottleneckPrediction: "Welding (OP-40) may cause bottleneck at > 85% plant load. Recommend secondary MIG station.",
    cycleTimeOptimization: "Potential cycle time reduction of 6.2 minutes (5.4%) identified in Powder Coating cure cycle.",
    resourceOptimization: "Reduce 2 labour in PCB Assembly by integrating automated optical inspection (AOI) feeder.",
    productionRecommendation: "Overall routing is verified and optimized for Mass Production release.",
  },

  // Recommendations & Approvals
  recommendation: "Release for Production",
  approvalDecision: "Approved with Conditions",
  reviewers: [
    { role: "Manufacturing Engineer", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "Operation sequence and work centre allocations validated.", status: "Approved" },
    { role: "Production Engineer", person: "Vikram Singh", decision: "Approved", date: "19 Jun 2024", comments: "Setup & cycle times verified through time study.", status: "Approved" },
    { role: "Industrial Engineer", person: "Neha Reddy", decision: "Approved", date: "19 Jun 2024", comments: "Workstation ergonomics and line balancing approved.", status: "Approved" },
    { role: "Quality Manager", person: "Arun Kumar", decision: "Approved", date: "20 Jun 2024", comments: "Critical inspection points and SPC requirements confirmed.", status: "Approved" },
    { role: "Planning Manager", person: "Priya Nair", decision: "Approved", date: "21 Jun 2024", comments: "Capacity requirement 250 units/day scheduled.", status: "Approved" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved", date: "22 Jun 2024", comments: "Plant equipment and line 2 availability confirmed.", status: "Approved" },
    { role: "Engineering Head", person: "Sankaran R.", decision: "Approved with Conditions", date: "24 Jun 2024", comments: "Approved subject to OP-40 MIG welding load monitoring.", status: "Approved" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "25 Jun 2024", comments: "Final executive approval granted for production release.", status: "Approved" },
  ],

  attachments: [
    { id: "att-01", fileName: "routing_sheet.pdf", fileType: "PDF Document", documentType: "Routing Sheet", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "1.8 MB", status: "Active" },
    { id: "att-02", fileName: "process_flow.png", fileType: "PNG Image", documentType: "Process Flow Diagram", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "3.2 MB", status: "Active" },
    { id: "att-03", fileName: "bom_reference.pdf", fileType: "PDF Document", documentType: "BOM Reference", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "18 Jun 2024", fileSize: "2.4 MB", status: "Active" },
    { id: "att-04", fileName: "wi_documents.zip", fileType: "ZIP Archive", documentType: "Work Instructions", version: "1.0", uploadedBy: "Vikram Singh", uploadedDate: "19 Jun 2024", fileSize: "14.5 MB", status: "Active" },
    { id: "att-05", fileName: "sop_documents.pdf", fileType: "PDF Document", documentType: "SOP Documents", version: "2.0", uploadedBy: "Neha Reddy", uploadedDate: "19 Jun 2024", fileSize: "4.1 MB", status: "Active" },
    { id: "att-06", fileName: "inspection_plan.pdf", fileType: "PDF Document", documentType: "Inspection Plan", version: "1.2", uploadedBy: "Arun Kumar", uploadedDate: "20 Jun 2024", fileSize: "2.8 MB", status: "Active" },
    { id: "att-07", fileName: "time_study.xlsx", fileType: "Spreadsheet", documentType: "Time Study Report", version: "1.0", uploadedBy: "Neha Reddy", uploadedDate: "19 Jun 2024", fileSize: "1.1 MB", status: "Active" },
    { id: "att-08", fileName: "supporting_docs.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "20 Jun 2024", fileSize: "8.9 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  effectiveDate: "01 Jul 2024",
  nextReviewDate: "30 Jun 2025",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "01 Aug 2026 10:30 AM",
  workflowStage: "Review by Review Board",
  version: 2.1,

  auditTrail: [
    { id: "log-01", timestamp: "18 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create Routing Project", description: "Created Routing Development project RTG-2024-000123 for Autonomous W-EVSE.", stage: "Stage 1 - Routing Definition" },
    { id: "log-02", timestamp: "18 Jun 2024 11:30 AM", user: "Rahul Sharma", action: "Operation Sequencing", description: "Defined 12 manufacturing operations, assigned work centres, setup & cycle times.", stage: "Stage 1 - Routing Definition" },
    { id: "log-03", timestamp: "19 Jun 2024 02:15 PM", user: "Vikram Singh", action: "Resource Allocation", description: "Allocated 5 machines, 12 tools, 8 fixtures, and 4 jigs. Skill level set to Skilled.", stage: "Stage 2 - Resource Planning" },
    { id: "log-04", timestamp: "19 Jun 2024 04:45 PM", user: "AI Intelligence", action: "AI Routing Assessment", description: "Calculated Routing Health Score 84/100 and generated bottleneck predictions.", stage: "Stage 2 - Resource Planning" },
    { id: "log-05", timestamp: "20 Jun 2024 10:30 AM", user: "Arun Kumar", action: "Manufacturing Validation", description: "Validated BOM-AW-EVSE-001 link, WI-AW-EVSE-001 work instructions, and inspection plan.", stage: "Stage 3 - Manufacturing Validation" },
    { id: "log-06", timestamp: "22 Jun 2024 03:20 PM", user: "Neha Reddy", action: "Cost Analysis", description: "Calculated total routing cost ₹43,050 vs target ₹45,000. Favorable variance ₹1,950.", stage: "Stage 3 - Manufacturing Validation" },
    { id: "log-07", timestamp: "25 Jun 2024 05:00 PM", user: "Sankaran R.", action: "Executive Approval", description: "Routing Review Board completed evaluation. Recommendation set to Release for Production.", stage: "Stage 4 - Executive Review" },
    { id: "log-08", timestamp: "01 Jul 2024 09:00 AM", user: "MES System", action: "Enterprise Manufacturing Sync", description: "Routing published to MES, APS, Shop Floor Execution, and ERP Database.", stage: "Enterprise Manufacturing Repository" },
  ],
};

let currentRoutingRecordState: RoutingRecord = { ...INITIAL_ROUTING_RECORD };

export const getRoutingRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentRoutingRecordState };
});

export const saveRoutingDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: RoutingFormInput })
  .handler(async ({ data }) => {
    currentRoutingRecordState = {
      ...currentRoutingRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentRoutingRecordState };
  });

export const submitRoutingFn = createServerFn({ method: "POST" }).handler(async () => {
  currentRoutingRecordState = {
    ...currentRoutingRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review by Review Board",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentRoutingRecordState };
});

export const addRoutingOperationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Omit<RoutingOperation, "id">)
  .handler(async ({ data }) => {
    const newOp: RoutingOperation = {
      ...data,
      id: `op-${Date.now()}`,
    };
    const updatedOps = [...currentRoutingRecordState.operations, newOp];
    const newTotalSetup = updatedOps.reduce((acc, curr) => acc + curr.setupTimeMins, 0);
    const newTotalCycle = updatedOps.reduce((acc, curr) => acc + curr.cycleTimeMins, 0);
    const newTotalLabour = updatedOps.reduce((acc, curr) => acc + curr.labourCount, 0);

    currentRoutingRecordState = {
      ...currentRoutingRecordState,
      operations: updatedOps,
      totalOperationsCount: updatedOps.length,
      totalSetupTimeMins: newTotalSetup,
      totalCycleTimeMins: newTotalCycle,
      totalLabourCount: newTotalLabour,
      lastModifiedDate: new Date().toLocaleString(),
    };

    return { success: true, data: currentRoutingRecordState };
  });
