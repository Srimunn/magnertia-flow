import { createServerFn } from "@tanstack/react-start";
import type {
  CybersecurityApprovalDecision,
  CybersecurityFormInput,
  CybersecurityRecord,
  CybersecurityStatus,
} from "@/services/types";

/* ===========================================================================
   Cybersecurity Engineering — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateCybersecurityScores(input: Partial<CybersecurityFormInput>) {
  const threatReadiness = 90;
  const architectureSecurity = 92;
  const secureDevelopment = 89;
  const compliance = 93;
  const monitoring = 91;

  const overallScore = Math.round(
    threatReadiness * 0.2 +
      architectureSecurity * 0.25 +
      secureDevelopment * 0.2 +
      compliance * 0.2 +
      monitoring * 0.15
  );

  return {
    threatReadinessScore: threatReadiness,
    architectureSecurityScore: architectureSecurity,
    secureDevelopmentScore: secureDevelopment,
    governanceScore: compliance,
    monitoringScore: monitoring,
    overallCybersecurityScore: overallScore,
  };
}

const DEFAULT_RECORD: CybersecurityRecord = {
  id: "cse-rec-0018",
  cybersecurityEngineeringId: "CSE-2024-0018",
  formCode: "CSEF-2024-25",
  securityProjectName: "Smart EV Charging Security",
  securityVersion: "v1.2.0",
  workflowStatus: "In Review",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Charger",
  linkedSoftwareDevId: "SWD-2024-0012",
  linkedCloudPlatformDevId: "CLD-2024-0001",
  linkedEmbeddedSystemsDevId: "EMD-2024-0013",
  linkedApiDevId: "API-2024-0011",
  linkedAiModelDevId: "AIMD-2024-0007",
  linkedIotDevId: "IOT-2024-0009",
  securityArchitectName: "Rahul Sharma",
  securityArchitectAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

  // Overview Data
  businessObjective:
    "Ensure secure-by-design engineering for EV charging platform.",
  securityScope:
    "Cloud, Mobile App, API, IoT Devices, Backend Services, Firmware",
  productCategory: "IoT Device",
  criticalityLevel: "High",
  targetDeployment: ["Production", "Cloud", "Edge", "Mobile"],
  developmentStatus: "In Progress",

  threatReadinessScore: 90,
  architectureSecurityScore: 92,
  iamReadinessScore: 90,
  secureDevelopmentScore: 89,
  validationScore: 93,
  monitoringScore: 91,
  governanceScore: 93,
  overallCybersecurityScore: 91,

  threatModelConfig: {
    method: "STRIDE",
    assetsIdentified: 24,
    attackSurface: "High",
    threatScenariosCount: 18,
    riskRating: "High",
    securityControlsProposed: 32,
    threatModelScore: 88,
  },

  architectureConfig: {
    securityArchitecture: "architecture_v1.2.pdf",
    zeroTrustApplied: true,
    networkSegmentation: "VPC Subnet & Micro-segmentation",
    secureCommunication: "TLS 1.3",
    encryptionStandard: "AES-256",
    keyManagement: "AWS KMS",
    architectureSecurityScore: 92,
  },

  iamConfig: {
    authenticationMethod: "OAuth 2.0 / OIDC",
    mfaEnabled: true,
    authorizationModel: "RBAC",
    roleBasedAccessControl: true,
    certificateManagement: "AWS ACM",
    secretsManagement: "HashiCorp Vault",
    iamReadinessScore: 90,
  },

  secureDevConfig: {
    secureCodingStandard: "OWASP ASVS",
    sastStatus: "Completed",
    scaStatus: "Completed",
    dependencyScanning: true,
    codeReviewCompleted: true,
    vulnerabilitiesFoundCount: 4,
    secureDevelopmentScore: 89,
  },

  testingConfig: {
    dastStatus: "Completed",
    penetrationTesting: "Completed",
    apiSecurityTesting: "Completed",
    firmwareSecurityTesting: "Completed",
    iotSecurityTesting: "Completed",
    complianceValidation: "Passed",
    validationScore: 93,
  },

  monitoringConfig: {
    siemPlatform: "Microsoft Sentinel",
    logManagement: "Azure Log Analytics",
    threatIntelligence: "Recorded Future",
    incidentResponsePlan: "incident_response_v1.0.pdf",
    vulnerabilityManagement: "Qualys VMDR",
    securityDashboardStatus: "Active 24/7",
    monitoringScore: 91,
  },

  complianceConfig: {
    applicableStandards: ["ISO 27001", "NIST CSF", "OWASP ASVS"],
    privacyCompliance: "GDPR",
    riskAssessmentFile: "risk_assessment_v1.pdf",
    auditSchedule: "Quarterly",
    complianceStatus: "Compliant",
    residualRisk: "Low",
    governanceScore: 93,
  },

  aiAssessment: {
    aiThreatDetectionScore: 92,
    aiVulnerabilityAnalysis: "Low risk detected across cloud APIs",
    aiSecurityRecommendationsCount: 12,
    aiComplianceReview: "Compliant with ISO 27001 & GDPR",
    aiRiskPrediction: "Low risk expected for next 90 days",
    aiOverallSecurityScore: 92,
  },

  readinessSummary: {
    threatReadiness: 90,
    architectureSecurityScore: 92,
    secureDevelopmentScore: 89,
    complianceScore: 93,
    overallCybersecurityScore: 91,
    recommendation: "Proceed to Production Release",
  },

  attachments: [
    {
      id: "att1",
      name: "threat_model_report.pdf",
      size: "2.4 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att2",
      name: "vulnerability_assessment.pdf",
      size: "3.6 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att3",
      name: "security_architecture.pdf",
      size: "3.1 MB",
      type: "PDF",
      uploadedBy: "Ananya Iyer",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att4",
      name: "compliance_checklist.pdf",
      size: "1.9 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att5",
      name: "risk_assessment.pdf",
      size: "2.2 MB",
      type: "PDF",
      uploadedBy: "Neha Verma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att6",
      name: "incident_response_plan.pdf",
      size: "2.0 MB",
      type: "PDF",
      uploadedBy: "Swati Patel",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att7",
      name: "penetration_test_report.pdf",
      size: "4.8 MB",
      type: "PDF",
      uploadedBy: "Rohit Nair",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att8",
      name: "security_audit_report.pdf",
      size: "2.7 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
  ],

  reviewers: [
    {
      role: "Security Architect",
      person: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Looks Good",
    },
    {
      role: "Software Architect",
      person: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Secure Design",
    },
    {
      role: "Cloud Architect",
      person: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Compliant",
    },
    {
      role: "Embedded Systems Lead",
      person: "Neha Verma",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      decision: "Approved with Conditions",
      date: "20 Jun 2024",
      comments: "Minor Issues",
    },
    {
      role: "QA Manager",
      person: "Rohit Nair",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Test Coverage OK",
    },
    {
      role: "Compliance Officer",
      person: "Swati Patel",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "All Good",
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
    "Overall security posture is good. Please remediate minor findings and re-run vulnerability scan.",

  auditTrail: [
    {
      id: "aud1",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Submitted for Review",
      details: "Submitted Cybersecurity Specification v1.2.0 to Security Review Board.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud2",
      timestamp: "20 Jun 2024 02:10 PM",
      user: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      action: "Updated SAST/SCA Scan",
      details: "Completed OWASP ASVS dependency and secret scan.",
      ipAddress: "192.168.1.112",
    },
    {
      id: "aud3",
      timestamp: "19 Jun 2024 11:45 AM",
      user: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      action: "Updated Threat Model",
      details: "Updated STRIDE threat scenarios and risk matrix.",
      ipAddress: "192.168.1.108",
    },
    {
      id: "aud4",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Created Record",
      details: "Initialized Cybersecurity Engineering Record CSE-2024-0018.",
      ipAddress: "192.168.1.104",
    },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: CybersecurityRecord = { ...DEFAULT_RECORD };

export const getCybersecurityEngineeringFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: CybersecurityRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveCybersecurityEngineeringDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<CybersecurityFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: CybersecurityRecord }> => {
    const input = data.input;
    const scores = calculateCybersecurityScores({ ...currentRecord, ...input });

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

export const submitCybersecurityEngineeringFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: CybersecurityRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewCybersecurityEngineeringFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: CybersecurityApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: CybersecurityRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<CybersecurityApprovalDecision, CybersecurityStatus> = {
      Approved: "Approved",
      "Approved with Conditions": "In Review",
      "Changes Requested": "Changes Requested",
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
