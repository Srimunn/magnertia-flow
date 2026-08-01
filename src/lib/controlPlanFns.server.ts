import { createServerFn } from "@tanstack/react-start";
import type {
  ControlPlanRecord,
  ControlPlanFormInput,
  ControlPlanCharacteristic,
  ControlPlanApprovalDecision,
} from "@/services/types";

export const INITIAL_CONTROL_PLAN_RECORD: ControlPlanRecord = {
  id: "cp-rec-00056",
  controlPlanId: "CP-2024-00056",
  formCode: "CPDL-2024-25",
  controlPlanTitle: "Enclosure Assembly Control Plan",
  controlPlanNumber: "CP-ENCL-AW-001",
  version: 2.1,
  workflowStatus: "In Progress",

  // Form Information
  product: "Autonomous W-EVSE",
  productRevision: "REV-2.1",
  manufacturingProcess: "Enclosure Assembly",
  apqpRef: "APQP-AW-EVSE-001",
  pfmeaRef: "PFMEA-AW-EVSE-001",
  processOwner: "Rahul Sharma",

  // Control Plan Overview
  productFamily: "EV Charging Solutions",
  productModel: "EVSE-22KW-WALL",
  productionLine: "Line-02",
  workCentre: "WC-ENCL-01",
  processFlowRef: "PFD-ENCL-AW-001",
  routingRef: "RTG-ENCL-AW-001",
  controlPlanType: "Production",
  lifecycleStage: "Validation",
  priority: "High",

  // Readiness Scores (5 Rings)
  characteristicReadinessScore: 86,
  inspectionReadinessScore: 82,
  processControlScore: 88,
  validationScore: 80,
  aiHealthScore: 88,
  overallControlPlanReadinessScore: 84,

  // 8 Process & Product Characteristics (Matching Mockup Image)
  characteristics: [
    {
      id: "char-01",
      stepNo: 1,
      operationNo: "OP-10",
      processStep: "Incoming Material Inspection",
      productCharacteristic: "Material Thickness",
      processCharacteristic: "Material Conformance",
      specialCharacteristics: "SC-01",
      specification: "1.5 mm ± 0.1",
      controlMethod: "Dimensional Inspection",
      readinessScore: 90,
    },
    {
      id: "char-02",
      stepNo: 2,
      operationNo: "OP-20",
      processStep: "Enclosure Body Cutting",
      productCharacteristic: "Cut Length",
      processCharacteristic: "Cutting Accuracy",
      specialCharacteristics: "SC-02, SC-03",
      specification: "500 ± 0.5 mm",
      controlMethod: "Automated Inspection",
      readinessScore: 85,
    },
    {
      id: "char-03",
      stepNo: 3,
      operationNo: "OP-30",
      processStep: "Enclosure Bending",
      productCharacteristic: "Bend Angle",
      processCharacteristic: "Bend Accuracy",
      specialCharacteristics: "SC-03",
      specification: "90° ± 1°",
      controlMethod: "Dimensional Inspection",
      readinessScore: 80,
    },
    {
      id: "char-04",
      stepNo: 4,
      operationNo: "OP-40",
      processStep: "Enclosure Welding",
      productCharacteristic: "Weld Strength",
      processCharacteristic: "Weld Quality",
      specialCharacteristics: "SC-04",
      specification: "Min. 120 N/mm²",
      controlMethod: "SPC Monitoring",
      readinessScore: 85,
    },
    {
      id: "char-05",
      stepNo: 5,
      operationNo: "OP-50",
      processStep: "Surface Grinding",
      productCharacteristic: "Surface Roughness",
      processCharacteristic: "Surface Finish",
      specialCharacteristics: "SC-05",
      specification: "Ra ≤ 1.6 µm",
      controlMethod: "Dimensional Inspection",
      readinessScore: 82,
    },
    {
      id: "char-06",
      stepNo: 6,
      operationNo: "OP-60",
      processStep: "Powder Coating",
      productCharacteristic: "Coating Thickness",
      processCharacteristic: "Coating Uniformity",
      specialCharacteristics: "SC-06",
      specification: "60 ± 5 µm",
      controlMethod: "Sampling Inspection",
      readinessScore: 87,
    },
    {
      id: "char-07",
      stepNo: 7,
      operationNo: "OP-70",
      processStep: "PCB Assembly",
      productCharacteristic: "Solder Joint",
      processCharacteristic: "Solder Quality",
      specialCharacteristics: "SC-06",
      specification: "IPC-A-610 Class 2",
      controlMethod: "Visual Inspection",
      readinessScore: 90,
    },
    {
      id: "char-08",
      stepNo: 8,
      operationNo: "OP-80",
      processStep: "Final Assembly & Test",
      productCharacteristic: "Functional Test",
      processCharacteristic: "Final Functionality",
      specialCharacteristics: "SC-07",
      specification: "Pass / Fail",
      controlMethod: "Functional Test",
      readinessScore: 92,
    },
  ],

  // Control Plan Summary Table (Top 4 Operations)
  summaryRows: [
    {
      id: "sum-01",
      stepNo: 1,
      operationNo: "OP-10",
      characteristic: "Material Thickness",
      specification: "1.5 mm ± 0.1",
      controlMethod: "Dimensional Inspection",
      inspectionMethod: "Visual + Measuring",
      frequency: "Every Shift",
      sampleSize: "5",
      controlDevice: "Digital Caliper",
      responsePlan: "Segregate and notify QA",
      responsible: "Ravi Kumar",
    },
    {
      id: "sum-02",
      stepNo: 2,
      operationNo: "OP-40",
      characteristic: "Weld Strength",
      specification: "Min. 120 N/mm²",
      controlMethod: "SPC Monitoring",
      inspectionMethod: "Tensile Test",
      frequency: "Hourly",
      sampleSize: "3",
      controlDevice: "Tensile Tester",
      responsePlan: "Stop line and rework",
      responsible: "Neha Reddy",
    },
    {
      id: "sum-03",
      stepNo: 3,
      operationNo: "OP-60",
      characteristic: "Coating Thickness",
      specification: "60 ± 5 µm",
      controlMethod: "Sampling Inspection",
      inspectionMethod: "Thickness Gauge",
      frequency: "Every Shift",
      sampleSize: "5",
      controlDevice: "Coating Thickness Gauge",
      responsePlan: "Recoat if out of spec",
      responsible: "Vikram Singh",
    },
    {
      id: "sum-04",
      stepNo: 4,
      operationNo: "OP-80",
      characteristic: "Functional Test",
      specification: "Pass / Fail",
      controlMethod: "Functional Test",
      inspectionMethod: "Functional Test Station",
      frequency: "Every Shift",
      sampleSize: "100%",
      controlDevice: "Test Jig",
      responsePlan: "Rework / Replace",
      responsible: "Arun Kumar",
    },
  ],

  // Inspection & Monitoring Plan
  inspectionMethod: "Dimensional Inspection",
  measuringEquipment: "Digital Caliper - 300 mm",
  sampleSize: 5,
  inspectionFrequency: "Every Shift",
  msaRef: "MSA-ENCL-001",
  spcRequired: true,
  reactionPlan: "Stop line, segregate parts, notify QA. Perform root cause analysis and corrective action.",

  // Process Control
  workInstructionRef: "WI-ENCL-20",
  sopRef: "SOP-ENCL-05",
  controlDevice: "Torque Screwdriver",
  errorProofingPokaYoke: true,
  preventiveMaintenanceRequired: true,
  processValidationStatus: true,

  // Quality Verification
  incomingInspection: true,
  inProcessInspection: true,
  finalInspection: true,
  controlPlanAudit: "Planned",
  processCapabilityCpk: "1.67 / 1.45",
  ppapRef: "PPAP-AW-EVSE-001",

  // AI Assessment
  aiAssessment: {
    healthScore: 88,
    riskPrediction: "Low risk with 3 areas to watch.",
    processOptimization: "Reduce cycle time by 6.2%.",
    inspectionOptimization: "Optimize frequency for 2 operations.",
    defectPrediction: "Defect rate likely to reduce by 18%.",
    preventiveRecommendation: "Implement poka-yoke at OP-40 & OP-60.",
  },

  // Summary & Recommendation
  recommendation: "Approve Control Plan",

  // Review & Approvals (7 Roles)
  approvalDecision: "Approved with Conditions",
  reviewers: [
    { role: "Quality Engineer", person: "Rahul Sharma", decision: "Approved", date: "18 Jun 2024", comments: "Control plan characteristics and specifications verified.", status: "Approved" },
    { role: "Manufacturing Engineer", person: "Vikram Singh", decision: "Approved", date: "19 Jun 2024", comments: "Process controls and reaction plans aligned.", status: "Approved" },
    { role: "Process Engineer", person: "Neha Reddy", decision: "Approved", date: "19 Jun 2024", comments: "SOP and WI references confirmed.", status: "Approved" },
    { role: "Production Manager", person: "Priya Nair", decision: "Approved", date: "20 Jun 2024", comments: "Shift sample sizes and frequencies confirmed.", status: "Pending" },
    { role: "APQP Manager", person: "Rakesh Patel", decision: "Approved", date: "21 Jun 2024", comments: "APQP Phase 3 gate requirements met.", status: "Pending" },
    { role: "Plant Head", person: "Sankaran R.", decision: "Approved with Conditions", date: "24 Jun 2024", comments: "Pending poka-yoke installation at OP-60.", status: "Pending" },
    { role: "COO", person: "Sankaran R.", decision: "Approved", date: "25 Jun 2024", comments: "Executive approval pending production release.", status: "Pending" },
  ],

  // Attachments (9 Files)
  attachments: [
    { id: "att-cp-01", fileName: "Control Plan Worksheet.xlsx", fileType: "Excel Worksheet", documentType: "Control Plan Worksheet", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "01 Jul 2024", fileSize: "1.4 MB", status: "Active" },
    { id: "att-cp-02", fileName: "Process Flow Diagram.pdf", fileType: "PDF Document", documentType: "Process Flow Diagram", version: "2.1", uploadedBy: "Neha Reddy", uploadedDate: "25 Jun 2024", fileSize: "3.1 MB", status: "Active" },
    { id: "att-cp-03", fileName: "PFMEA Reference.pdf", fileType: "PDF Document", documentType: "PFMEA Reference", version: "2.1", uploadedBy: "Vikram Singh", uploadedDate: "25 Jun 2024", fileSize: "2.4 MB", status: "Active" },
    { id: "att-cp-04", fileName: "APQP Reference.pdf", fileType: "PDF Document", documentType: "APQP Reference", version: "2.1", uploadedBy: "Rahul Sharma", uploadedDate: "20 Jun 2024", fileSize: "1.9 MB", status: "Active" },
    { id: "att-cp-05", fileName: "Routing Sheet.pdf", fileType: "PDF Document", documentType: "Routing Sheet", version: "1.0", uploadedBy: "Arun Kumar", uploadedDate: "20 Jun 2024", fileSize: "2.2 MB", status: "Active" },
    { id: "att-cp-06", fileName: "Work Instructions.pdf", fileType: "PDF Document", documentType: "Work Instructions", version: "2.0", uploadedBy: "Vikram Singh", uploadedDate: "20 Jun 2024", fileSize: "4.5 MB", status: "Active" },
    { id: "att-cp-07", fileName: "SOP Documents.pdf", fileType: "PDF Document", documentType: "SOP Documents", version: "1.5", uploadedBy: "Neha Reddy", uploadedDate: "19 Jun 2024", fileSize: "3.6 MB", status: "Active" },
    { id: "att-cp-08", fileName: "MSA & SPC Reports.pdf", fileType: "PDF Document", documentType: "MSA & SPC Reports", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "22 Jun 2024", fileSize: "2.8 MB", status: "Active" },
    { id: "att-cp-09", fileName: "Supporting Documents.zip", fileType: "ZIP Archive", documentType: "Supporting Documents", version: "1.0", uploadedBy: "Rahul Sharma", uploadedDate: "20 Jun 2024", fileSize: "7.5 MB", status: "Active" },
  ],

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 09:15 AM",
  effectiveDate: "18 Jun 2024",
  nextReviewDate: "18 Dec 2024",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "01 Jul 2024 04:25 PM",
  workflowStage: "Review",
  distribution: ["Quality", "Manufacturing", "Process Engineering", "APQP"],

  auditTrail: [
    { id: "log-cp-01", timestamp: "18 Jun 2024 09:15 AM", user: "Rahul Sharma", action: "Create Control Plan Project", description: "Created Control Plan CP-2024-00056 for Enclosure Assembly.", stage: "Stage 1 - Process & Product Characteristics" },
    { id: "log-cp-02", timestamp: "19 Jun 2024 11:30 AM", user: "Vikram Singh", action: "Define Characteristics", description: "Defined 8 process & product characteristics across OP-10 to OP-80.", stage: "Stage 1 - Process & Product Characteristics" },
    { id: "log-cp-03", timestamp: "20 Jun 2024 02:15 PM", user: "Neha Reddy", action: "Inspection Planning", description: "Configured inspection methods, measuring equipment, and shift frequencies.", stage: "Stage 2 - Inspection Planning" },
    { id: "log-cp-04", timestamp: "21 Jun 2024 04:45 PM", user: "Arun Kumar", action: "Process Control Validation", description: "Validated shop floor controls, poka-yoke, and Cpk targets.", stage: "Stage 3 - Process Control Validation" },
    { id: "log-cp-05", timestamp: "01 Jul 2024 04:25 PM", user: "Rahul Sharma", action: "Submit for Board Review", description: "Submitted Control Plan for executive approval board sign-off.", stage: "Stage 4 - Executive Review" },
  ],
};

let currentControlPlanRecordState: ControlPlanRecord = { ...INITIAL_CONTROL_PLAN_RECORD };

export const getControlPlanRecordFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentControlPlanRecordState };
});

export const saveControlPlanDraftFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { input: ControlPlanFormInput })
  .handler(async ({ data }) => {
    currentControlPlanRecordState = {
      ...currentControlPlanRecordState,
      ...data.input,
      lastModifiedBy: "Current User",
      lastModifiedDate: new Date().toLocaleString(),
      workflowStatus: "Draft",
    };
    return { success: true, data: currentControlPlanRecordState };
  });

export const submitControlPlanFn = createServerFn({ method: "POST" }).handler(async () => {
  currentControlPlanRecordState = {
    ...currentControlPlanRecordState,
    workflowStatus: "In Review",
    workflowStage: "Review",
    lastModifiedBy: "Current User",
    lastModifiedDate: new Date().toLocaleString(),
  };
  return { success: true, data: currentControlPlanRecordState };
});

export const addCharacteristicFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Omit<ControlPlanCharacteristic, "id">)
  .handler(async ({ data }) => {
    const newChar: ControlPlanCharacteristic = {
      ...data,
      id: `char-${Date.now()}`,
    };
    const updatedChars = [...currentControlPlanRecordState.characteristics, newChar];
    currentControlPlanRecordState = {
      ...currentControlPlanRecordState,
      characteristics: updatedChars,
      lastModifiedDate: new Date().toLocaleString(),
    };
    return { success: true, data: currentControlPlanRecordState };
  });
