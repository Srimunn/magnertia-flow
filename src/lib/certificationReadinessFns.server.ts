import { createServerFn } from "@tanstack/react-start";
import type {
  CertificationApprovalDecision,
  CertificationFormInput,
  CertificationReadinessRecord,
  CertificationStatus,
} from "@/services/types";

/* ===========================================================================
   Certification Readiness — Server Functions & Compliance Engine
   =========================================================================== */

export function calculateReadinessScores(input: Partial<CertificationFormInput>) {
  const doc = 88;
  const testing = 90;
  const compliance = 84;
  const lab = 85;
  const ai = 89;

  const overall = Math.round(
    doc * 0.2 + testing * 0.25 + compliance * 0.25 + lab * 0.15 + ai * 0.15
  );

  return {
    documentationScore: doc,
    testingScore: testing,
    complianceScore: compliance,
    laboratoryScore: lab,
    aiScore: ai,
    overallReadinessScore: overall,
    certificationProbabilityPct: 92,
  };
}

const DEFAULT_RECORD: CertificationReadinessRecord = {
  id: "cr-rec-0041",
  certificationReadinessId: "CR-2024-0041",
  formCode: "CRF-2024-25",
  certificationProjectName: "Smart EV Charger Certification",
  certificationVersion: "v1.2.0",
  workflowStatus: "In Progress",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Charger AC 7kW",
  linkedTestingId: "TV-2024-0075",
  complianceManagerName: "Rahul Sharma",
  complianceManagerAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  certificationCoordinatorName: "Ananya Iyer",
  certificationCoordinatorAvatar:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  targetMarkets: ["India", "EU", "USA"],
  regulatoryAuthorities: ["BIS", "IEC", "CE", "FCC"],
  developmentStage: "Prototype Validation",
  priority: "High",

  productCategory: "EV Charger",
  certificationObjective: "Obtain mandatory certifications for global market launch.",

  documentationScore: 88,
  testingScore: 90,
  complianceScore: 84,
  laboratoryScore: 85,
  aiScore: 89,
  overallReadinessScore: 88,
  certificationProbabilityPct: 92,

  standardsList: [
    {
      id: "std1",
      code: "IEC 61851-1",
      title: "Electric vehicle conductive charging system - General requirements",
      category: "Mandatory Standard",
      region: "Global / IEC",
      status: "Compliant",
      gapAnalysis: "Satisfied (0 Gaps)",
    },
    {
      id: "std2",
      code: "IEC 62196-2",
      title: "Plugs, socket-outlets, vehicle connectors and vehicle inlets",
      category: "Mandatory Standard",
      region: "Global / IEC",
      status: "Compliant",
      gapAnalysis: "Satisfied (0 Gaps)",
    },
    {
      id: "std3",
      code: "IEC 61000-6-3",
      title: "Electromagnetic compatibility (EMC) - Emission standard",
      category: "Mandatory Standard",
      region: "Global / IEC",
      status: "In Progress",
      gapAnalysis: "1 Minor Gap",
    },
    {
      id: "std4",
      code: "ISO 26262",
      title: "Road vehicles - Functional safety ASIL-B",
      category: "Mandatory Standard",
      region: "Global / ISO",
      status: "Compliant",
      gapAnalysis: "Satisfied (0 Gaps)",
    },
  ],

  documentsList: [
    {
      id: "doc1",
      docName: "Technical File",
      category: "Technical Documentation",
      status: "Uploaded",
      owner: "Rahul Sharma",
      expiryDate: "31 Dec 2026",
      fileName: "technical_file_v1.2.pdf",
    },
    {
      id: "doc2",
      docName: "Design Documents & BOM",
      category: "Engineering Drawings",
      status: "Uploaded",
      owner: "Vikram Singh",
      expiryDate: "31 Dec 2026",
      fileName: "boms_drawings.zip",
    },
    {
      id: "doc3",
      docName: "Risk Assessment Report",
      category: "Safety Documentation",
      status: "Uploaded",
      owner: "Rahul Sharma",
      expiryDate: "31 Dec 2026",
      fileName: "risk_assessment_v1.2.pdf",
    },
    {
      id: "doc4",
      docName: "User & Installation Manual",
      category: "User Documentation",
      status: "Uploaded",
      owner: "Ananya Iyer",
      expiryDate: "31 Dec 2026",
      fileName: "user_manual_v1.0.pdf",
    },
    {
      id: "doc5",
      docName: "Declaration of Conformity (CE)",
      category: "Legal Declaration",
      status: "Uploaded",
      owner: "Rahul Sharma",
      expiryDate: "31 Dec 2026",
      fileName: "declaration_ce.pdf",
    },
  ],

  labConfig: {
    id: "lab1",
    labName: "TÜV Rheinland",
    contactPerson: "Mr. Peter Klaus",
    scope: "EMC, Safety, Performance, Environmental",
    sampleSubmissionDate: "25 Jun 2024",
    plannedCertificationDate: "20 Aug 2024",
    status: "Scheduled",
  },

  complianceConfig: {
    nonConformitiesCount: 2,
    criticalFindingsCount: 1,
    correctiveActionsStatus: "View Actions",
    preventiveActionsStatus: "View Actions",
    capaStatus: "In Progress",
    complianceScore: 84,
  },

  aiAssessment: {
    aiStandardsReview: "Completed",
    aiDocumentationReview: "Completed",
    aiRiskAssessment: "Low Risk",
    aiCertificationPrediction: "High Probability",
    aiImprovementSuggestions: "3 Suggestions",
    aiReadinessScore: 89,
  },

  readinessSummary: {
    documentationScore: 88,
    testingScore: 90,
    complianceScore: 84,
    laboratoryScore: 85,
    aiScore: 89,
    overallReadinessScore: 88,
    certificationProbabilityPct: 92,
    recommendation: "Ready for Certification Submission",
  },

  attachments: [
    {
      id: "att1",
      name: "technical_file_v1.2.pdf",
      size: "3.2 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att2",
      name: "test_reports_bundle.pdf",
      size: "5.6 MB",
      type: "PDF",
      uploadedBy: "Nisha Verma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att3",
      name: "compliance_matrix.xlsx",
      size: "1.8 MB",
      type: "XLSX",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att4",
      name: "risk_assessment_v1.2.pdf",
      size: "2.4 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att5",
      name: "user_manual_v1.0.pdf",
      size: "4.1 MB",
      type: "PDF",
      uploadedBy: "Ananya Iyer",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att6",
      name: "declaration_ce.pdf",
      size: "1.2 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att7",
      name: "boms_drawings.zip",
      size: "6.7 MB",
      type: "ZIP",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att8",
      name: "ai_assessment_report.pdf",
      size: "2.9 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
  ],

  reviewers: [
    {
      role: "Compliance Manager",
      person: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "All good",
    },
    {
      role: "Quality Manager",
      person: "Nisha Verma",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Minor suggestions",
    },
    {
      role: "R&D Manager",
      person: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "18 Jun 2024",
      comments: "Ready to proceed",
    },
    {
      role: "Certification Coordinator",
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
    {
      role: "CEO",
      person: "Sankaranarayanan R.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      decision: "Pending",
      date: "-",
      comments: "Pending Review",
    },
  ],

  approvalDecision: "Approved with Conditions",
  approvalDate: "20 Jun 2024",
  reviewComments: "Please close the remaining CAPAs and update the risk assessment.",

  auditTrail: [
    {
      id: "aud1",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Submitted for Review",
      details: "Submitted Certification Readiness Record CR-2024-0041 to Compliance Board.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud2",
      timestamp: "20 Jun 2024 02:10 PM",
      user: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      action: "Scheduled Lab Testing",
      details: "Booked TÜV Rheinland lab testing slot for 25 Jun 2024.",
      ipAddress: "192.168.1.118",
    },
    {
      id: "aud3",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Created Record",
      details: "Initialized Certification Readiness Record CR-2024-0041.",
      ipAddress: "192.168.1.104",
    },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: CertificationReadinessRecord = { ...DEFAULT_RECORD };

export const getCertificationReadinessFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: CertificationReadinessRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveCertificationReadinessDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<CertificationFormInput> }) => data)
  .handler(
    async ({ data }): Promise<{ success: boolean; data: CertificationReadinessRecord }> => {
      const input = data.input;
      const scores = calculateReadinessScores({ ...currentRecord, ...input });

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
    }
  );

export const submitCertificationReadinessFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: CertificationReadinessRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewCertificationReadinessFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: CertificationApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(
    async ({ data }): Promise<{ success: boolean; data: CertificationReadinessRecord }> => {
      const { decision, comments } = data;
      const statusMap: Record<CertificationApprovalDecision, CertificationStatus> = {
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
    }
  );
