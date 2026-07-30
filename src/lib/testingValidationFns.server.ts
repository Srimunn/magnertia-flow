import { createServerFn } from "@tanstack/react-start";
import type {
  TestingApprovalDecision,
  TestingFormInput,
  TestingValidationRecord,
  TestingStatus,
} from "@/services/types";

/* ===========================================================================
   Testing & Validation — Server Functions & Quality Engine
   =========================================================================== */

export function calculateQualityScores(input: Partial<TestingFormInput>) {
  const functional = 90;
  const reliability = 92;
  const compliance = 93;
  const validation = 89;

  const overallScore = Math.round(
    functional * 0.25 + reliability * 0.25 + compliance * 0.25 + validation * 0.25
  );

  return {
    functionalScore: functional,
    reliabilityScore: reliability,
    complianceScore: compliance,
    validationScore: validation,
    overallQualityScore: overallScore,
  };
}

const DEFAULT_RECORD: TestingValidationRecord = {
  id: "tv-rec-0075",
  testingValidationId: "TV-2024-0075",
  formCode: "TVF-2024-25",
  testProjectName: "Smart EV Charger Validation",
  testVersion: "v1.2.0",
  workflowStatus: "In Progress",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Charger AC 7kW",
  linkedPrototypeId: "PRT-2024-0032",
  linkedSimulationId: "SIM-2024-0061",
  testEngineerName: "Rahul Sharma",
  testEngineerAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  qaEngineerName: "Nisha Verma",
  qaEngineerAvatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  testEnvironment: "Laboratory",
  developmentStage: "Prototype Validation",
  priority: "High",

  productName: "Smart EV Charger AC 7kW",
  testObjective:
    "Validate product performance, safety, reliability and compliance as per IEC 61851 & applicable standards.",
  productCategory: "EV Charging System",
  testScope: "Hardware, Firmware, Software, Safety, EMC, Environment",

  functionalScore: 90,
  reliabilityScore: 92,
  complianceScore: 93,
  validationScore: 89,
  overallQualityScore: 91,

  planningConfig: {
    testStrategy: "System Testing",
    testPlanFile: "test_plan_v1.2.pdf",
    testCasesFile: "test_cases_v1.2.xlsx",
    acceptanceCriteria: "Defined",
    resourceAllocation: "Team of 5 | Lab - 2 Shifts",
    planningScore: 92,
  },

  prototypeEquipmentConfig: {
    prototypeVersion: "PRT-2024-0032",
    equipmentUsedCount: 7,
    testLaboratory: "Magnertia EV Lab - Coimbatore",
    environmentalConditions: "25°C, 60% RH",
    calibrationCertificateFile: "calibration_jun24.pdf",
    equipmentReadiness: "Ready",
    readinessScore: 94,
    equipmentList: [
      {
        id: "eq1",
        equipmentId: "EQ-OSC-04",
        name: "Keysight 4-Channel Oscilloscope",
        model: "InfiniiVision 3000G",
        calibrationStatus: "Validated",
        calibrationExpiry: "15 Oct 2024",
        assignedLab: "EV Engineering Lab",
      },
      {
        id: "eq2",
        equipmentId: "EQ-PWR-02",
        name: "Yokogawa Precision Power Analyzer",
        model: "WT5000",
        calibrationStatus: "Validated",
        calibrationExpiry: "20 Dec 2024",
        assignedLab: "EV Engineering Lab",
      },
      {
        id: "eq3",
        equipmentId: "EQ-THM-01",
        name: "FLIR Thermal Imaging Camera",
        model: "T865",
        calibrationStatus: "Validated",
        calibrationExpiry: "05 Nov 2024",
        assignedLab: "EV Engineering Lab",
      },
    ],
  },

  functionalConfig: {
    functionalTestStatus: "Passed",
    electricalTestStatus: "Passed",
    mechanicalTestStatus: "Passed",
    firmwareTestStatus: "Passed",
    softwareTestStatus: "Passed",
    passFailSummary: "24 / 24 Passed",
    functionalScore: 90,
    testCases: [
      {
        id: "tc1",
        testCaseId: "TC-FUNC-001",
        title: "Power-On Sequence & Self-Test",
        category: "Functional",
        status: "Passed",
        expectedResult: "Boot completed within 2.5s without errors",
        actualResult: "Passed (Booted in 2.1s)",
        executionTime: "45s",
        testerName: "Rahul Sharma",
      },
      {
        id: "tc2",
        testCaseId: "TC-FUNC-002",
        title: "Charging Session Initialization",
        category: "Functional",
        status: "Passed",
        expectedResult: "CP/PP handshakes within 150ms",
        actualResult: "Passed (120ms response time)",
        executionTime: "2m",
        testerName: "Nisha Verma",
      },
      {
        id: "tc3",
        testCaseId: "TC-FUNC-003",
        title: "Charging Current Regulation (32A)",
        category: "Functional",
        status: "Passed",
        expectedResult: "Current stability ±0.5A under 7kW load",
        actualResult: "Passed (31.9A ±0.2A)",
        executionTime: "15m",
        testerName: "Rahul Sharma",
      },
      {
        id: "tc4",
        testCaseId: "TC-SAFE-001",
        title: "Emergency Stop Circuit Trip",
        category: "Safety",
        status: "Passed",
        expectedResult: "Relay trips within 20ms of button press",
        actualResult: "Passed (14ms trip time)",
        executionTime: "1m",
        testerName: "Nisha Verma",
      },
    ],
  },

  performanceConfig: {
    performanceTestStatus: "Passed",
    loadTestStatus: "Passed",
    thermalTestStatus: "Passed",
    efficiencyTestStatus: "Passed",
    enduranceTestStatus: "Passed",
    reliabilityTestStatus: "Passed",
    mtbfEstimate: "12,500 Hrs",
    reliabilityScore: 92,
  },

  safetyComplianceConfig: {
    electricalSafetyStatus: "Passed",
    emcEmiTestStatus: "Passed",
    ipRatingTestStatus: "Passed (IP54)",
    environmentalTestStatus: "Passed",
    cybersecurityValidationStatus: "Passed",
    regulatoryStandards: [
      "IEC 61851",
      "IEC 62196",
      "IEC 61000",
      "IEC 60529",
      "IEC 62443",
    ],
    complianceScore: 93,
  },

  resultsConfig: {
    testResultsFile: "test_results_v1.2.pdf",
    defectsIdentifiedCount: 3,
    criticalIssuesCount: 0,
    validationReportFile: "validation_report_v1.2.pdf",
    prototypeCorrelationPct: 95,
    customerRequirementCompliancePct: 96,
    validationScore: 89,
    defectsList: [
      {
        id: "def1",
        defectId: "DEF-2024-001",
        title: "Minor LED status flicker on cold boot (-10°C)",
        severity: "Minor",
        status: "Resolved",
        detectedIn: "Cold Chamber Test",
        assignedTo: "Software Team",
      },
      {
        id: "def2",
        defectId: "DEF-2024-002",
        title: "Thermal sensor reporting 1.5°C offset near 70°C load",
        severity: "Minor",
        status: "In Progress",
        detectedIn: "Thermal Chamber",
        assignedTo: "Hardware Team",
      },
      {
        id: "def3",
        defectId: "DEF-2024-003",
        title: "GUI font rendering overlap on 4.3 inch display",
        severity: "Trivial",
        status: "Resolved",
        detectedIn: "UI/UX Test",
        assignedTo: "UI Team",
      },
    ],
  },

  aiAssessment: {
    aiTestAnalysis: "All test cases executed as per plan.",
    aiDefectPrediction: "Low risk of major defects.",
    aiReliabilityPrediction: "High reliability expected in field use.",
    aiComplianceAssessment: "Standards compliance confirmed.",
    aiImprovementSuggestions:
      "Improve heat sink design for better long-term performance.",
    aiValidationScore: 91,
  },

  readinessSummary: {
    functionalScore: 90,
    reliabilityScore: 92,
    complianceScore: 93,
    validationScore: 89,
    overallQualityScore: 91,
    recommendation: "Proceed to Product Certification",
  },

  attachments: [
    {
      id: "att1",
      name: "test_plan_v1.2.pdf",
      size: "2.4 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att2",
      name: "test_cases_v1.2.xlsx",
      size: "1.8 MB",
      type: "XLSX",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att3",
      name: "lab_report_emc.pdf",
      size: "3.1 MB",
      type: "PDF",
      uploadedBy: "Nisha Verma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att4",
      name: "calibration_jun24.pdf",
      size: "2.0 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att5",
      name: "validation_report_v1.2.pdf",
      size: "2.6 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att6",
      name: "defect_log_v1.2.pdf",
      size: "1.4 MB",
      type: "PDF",
      uploadedBy: "Nisha Verma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att7",
      name: "safety_report.pdf",
      size: "2.3 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att8",
      name: "ai_assessment_v1.2.pdf",
      size: "2.1 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
  ],

  reviewers: [
    {
      role: "Test Engineer",
      person: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "All tests completed",
    },
    {
      role: "QA Engineer",
      person: "Nisha Verma",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "No critical issues",
    },
    {
      role: "Compliance Officer",
      person: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Standards met",
    },
    {
      role: "R&D Head",
      person: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      decision: "Pending",
      date: "-",
      comments: "Pending Review",
    },
    {
      role: "CTO",
      person: "Dr. Anil Patel",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      decision: "Pending",
      date: "-",
      comments: "Pending Review",
    },
  ],

  approvalDecision: "Approved with Conditions",
  approvalDate: "20 Jun 2024",
  reviewComments:
    "Minor improvements suggested in thermal management. All safety and functional tests passed.",

  auditTrail: [
    {
      id: "aud1",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Submitted for Review",
      details: "Submitted Testing & Validation Record TV-2024-0075 to QA Review Board.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud2",
      timestamp: "20 Jun 2024 02:10 PM",
      user: "Nisha Verma",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      action: "Completed Functional & Safety Test",
      details: "24 functional test cases executed; 100% pass rate achieved.",
      ipAddress: "192.168.1.112",
    },
    {
      id: "aud3",
      timestamp: "19 Jun 2024 11:45 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Calibrated Equipment Verified",
      details: "Verified 7 laboratory instruments in Magnertia EV Lab.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud4",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Created Record",
      details: "Initialized Testing & Validation Record TV-2024-0075.",
      ipAddress: "192.168.1.104",
    },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: TestingValidationRecord = { ...DEFAULT_RECORD };

export const getTestingValidationFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: TestingValidationRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveTestingValidationDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<TestingFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: TestingValidationRecord }> => {
    const input = data.input;
    const scores = calculateQualityScores({ ...currentRecord, ...input });

    currentRecord = {
      ...currentRecord,
      ...input,
      ...scores,
      lastModified: new Date().toISOString(),
      lastUpdated:
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    return { success: true, data: currentRecord };
  });

export const submitTestingValidationFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: TestingValidationRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewTestingValidationFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: TestingApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: TestingValidationRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<TestingApprovalDecision, TestingStatus> = {
      Approved: "Approved",
      "Approved with Conditions": "In Review",
      "Revision Required": "Changes Requested",
      "On Hold": "In Review",
      Rejected: "Archived",
      Pending: "In Review",
    };

    currentRecord = {
      ...currentRecord,
      approvalDecision: decision,
      reviewComments: comments ?? currentRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      workflowStatus: statusMap[decision] ?? currentRecord.workflowStatus,
      lastModified: new Date().toISOString(),
    };

    return { success: true, data: currentRecord };
  });
