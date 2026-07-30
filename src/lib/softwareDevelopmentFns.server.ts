import { createServerFn } from "@tanstack/react-start";
import type {
  SoftwareDevelopmentApprovalDecision,
  SoftwareDevelopmentFormInput,
  SoftwareDevelopmentRecord,
  SoftwareDevelopmentStage,
  SoftwareDevelopmentStatus,
} from "@/services/types";

/* ===========================================================================
   Software Development — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Software Development lifecycle:
     Stage 1: Software Architecture & Planning (microservices design, tech stack config, modules setup)
     Stage 2: Development & Integration (backend microservices, frontend SPA, REST/GraphQL APIs & git commits)
     Stage 3: Testing & Deployment (automated CI/CD pipeline, SAST/DAST scanning, test execution & staging deployment)
     Stage 4: Engineering Review (Review Board decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates/links downstream System Integration project (SI-2024-0089)
       and surfaces its ID to proceed to System Integration.
   =========================================================================== */

export function calculateSoftwareDevelopmentScores(input: Partial<SoftwareDevelopmentFormInput>) {
  // 1. Development Progress (0-100)
  const developmentProgress = 88;

  // 2. Architecture Readiness (0-100)
  const architectureReadiness = input.technologyReadinessScore ?? 87;

  // 3. Testing Readiness (0-100)
  const testingReadiness = Math.round(input.codeCoverage ?? 87.5);

  // 4. Deployment Readiness (0-100)
  const deploymentReadiness = input.securityScore ?? 90;

  // Overall Software Score (/100)
  const overallSoftwareScore = Math.round(
    developmentProgress * 0.25 +
      architectureReadiness * 0.25 +
      testingReadiness * 0.25 +
      deploymentReadiness * 0.25
  );

  // AI Assessment Sub-scores (single source of truth with Panel 9)
  const aiCodeQualityScore = 88;
  const aiArchitectureAssessment = architectureReadiness;
  const aiPerformanceOptimization = 86;
  const aiSecurityAssessment = deploymentReadiness;
  const aiMaintainabilityAnalysis = 88;
  const aiTechnicalDebtAnalysis = 85;
  const aiOverallSoftwareScore = overallSoftwareScore;

  // Key Highlights dynamic list
  const highlights: string[] = [];
  highlights.push("Microservices architecture implemented");
  highlights.push("CI/CD pipeline with 95% automation");
  highlights.push(`Code coverage achieved ${testingReadiness}%`);
  highlights.push("Security score improved by 12%");
  highlights.push("All critical and major tests passed");

  return {
    summary: {
      overallSoftwareScore,
      developmentProgress,
      architectureReadiness,
      testingReadiness,
      deploymentReadiness,
      recommendation: "Proceed to System Integration",
    },
    aiAssessment: {
      aiOverallSoftwareScore,
      aiCodeQualityScore,
      aiArchitectureAssessment,
      aiPerformanceOptimization,
      aiSecurityAssessment,
      aiMaintainabilityAnalysis,
      aiTechnicalDebtAnalysis,
    },
    keyHighlights: highlights,
  };
}

const DEFAULT_SOFTWARE_DEVELOPMENT_INPUT: SoftwareDevelopmentFormInput = {
  // Panel 1: Software Project Overview
  productName: "Smart EV Platform",
  softwareName: "Smart EV Management System",
  developmentObjective:
    "Develop a scalable, secure and high performance platform for EV fleet management and analytics.",
  businessRequirements:
    "Real-time monitoring, analytics, alerts, reporting, user management and integration with EV devices.",
  functionalRequirements: "28 Modules",
  nonFunctionalRequirements: "High Availability, Scalability, Security, Performance, Usability",
  developmentStatus: "In Progress",
  techStackImageUrl:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",

  // Panel 2: Software Architecture
  architectureStyle: "Microservices",
  applicationArchitecture: "3-Tier Architecture",
  backendArchitecture: "Microservices with REST APIs",
  frontendArchitecture: "SPA with React",
  microservicesCount: 12,
  middleware: "Spring Cloud, Kafka, Redis",
  architectureStatus: "Verified",
  softwareArchitectureDiagramUrl:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",

  // Panel 3: Technology Stack
  frontendFramework: "React 18",
  backendFramework: "Spring Boot 3.2",
  programmingLanguages: ["Java", "TypeScript", "Python"],
  database: "PostgreSQL 15",
  cloudPlatform: "AWS",
  containerPlatform: "Docker / Kubernetes",
  technologyReadinessScore: 92,

  // Panel 4: API & Integration
  apiTypesList: [
    { name: "REST API", checked: true },
    { name: "GraphQL API", checked: true },
    { name: "WebSocket", checked: true },
  ],
  apiGateway: "Kong Gateway",
  thirdPartyApis: ["Stripe", "SendGrid", "Twilio", "Google Maps"],
  erpIntegration: "Magnertia ERP, SAP, Salesforce",
  apiStatus: "Active",

  // Panel 5: Database Design
  databaseType: "PostgreSQL",
  databaseSchemaLink: "Link to ER Diagram",
  masterTablesCount: 32,
  transactionTablesCount: 68,
  dataRetentionPolicy: "7 Years",
  backupStrategy: "Daily Incremental, Weekly Full",
  databaseReadinessScore: 90,

  // Panel 6: DevOps & CI/CD
  sourceCodeRepository: "GitHub",
  branchStrategy: "GitFlow",
  cicdPlatform: "GitHub Actions",
  buildPipeline: "Build, Test, Scan, Package",
  deploymentStrategy: "Blue-Green Deployment",
  monitoringPlatform: "Prometheus + Grafana",
  devOpsStatus: "Running",
  pipelineStages: [
    { id: "stage-1", name: "Code Commit", status: "completed" },
    { id: "stage-2", name: "Build", status: "completed" },
    { id: "stage-3", name: "Test", status: "completed" },
    { id: "stage-4", name: "Scan", status: "completed" },
    { id: "stage-5", name: "Deploy", status: "completed" },
  ],
  environments: [
    { name: "Dev", active: true },
    { name: "QA", active: true },
    { name: "Staging", active: true },
    { name: "Production", active: true, badgeColor: "bg-emerald-600 text-white" },
  ],

  // Panel 7: Security & Compliance
  authenticationMethod: "OAuth 2.0 + JWT",
  authorizationModel: "Role Based Access Control (RBAC)",
  encryptionStandard: "AES-256",
  apiSecurity: "Rate Limiting, IP Whitelisting, WAF",
  secureCodingStandard: "OWASP, SonarQube, SAST",
  regulatoryComplianceTags: ["GDPR", "ISO 27001", "SOC 2"],
  securityScore: 90,

  // Panel 8: Testing & Quality Assurance
  testItems: [
    { id: "test-1", name: "Unit Testing", status: "Completed", details: "JUnit & Jest test suites passed" },
    { id: "test-2", name: "Integration Testing", status: "Completed", details: "REST & Microservices contracts verified" },
    { id: "test-3", name: "System Testing", status: "Completed", details: "End-to-End user journeys passed" },
    { id: "test-4", name: "Performance Testing", status: "Completed", details: "JMeter load test: 10k req/sec" },
    { id: "test-5", name: "Security Testing", status: "Completed", details: "OWASP ZAP vulnerability scan clean" },
    { id: "test-6", name: "User Acceptance Testing", status: "In Progress", details: "Beta fleet management validation" },
  ],
  codeCoverage: 87.5,

  // Panel 9 & 10 Initialized dynamically
  aiAssessment: {
    aiOverallSoftwareScore: 88,
    aiCodeQualityScore: 88,
    aiArchitectureAssessment: 87,
    aiPerformanceOptimization: 86,
    aiSecurityAssessment: 90,
    aiMaintainabilityAnalysis: 88,
    aiTechnicalDebtAnalysis: 85,
  },
  summary: {
    overallSoftwareScore: 88,
    developmentProgress: 88,
    architectureReadiness: 87,
    testingReadiness: 88,
    deploymentReadiness: 90,
    recommendation: "Proceed to System Integration",
  },

  // Panel 11: Attachments
  attachments: [
    {
      id: "att-1",
      name: "Software_Architecture_Diagram.pdf",
      typeIcon: "pdf",
      size: "2.4 MB",
      category: "Architecture",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-2",
      name: "API_Documentation.pdf",
      typeIcon: "pdf",
      size: "1.8 MB",
      category: "API Docs",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-3",
      name: "Database_Design.pdf",
      typeIcon: "pdf",
      size: "2.1 MB",
      category: "Database",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-4",
      name: "Test_Reports.zip",
      typeIcon: "zip",
      size: "4.6 MB",
      category: "Test Suite",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-5",
      name: "Source_Code_Repository.zip",
      typeIcon: "zip",
      size: "512 MB",
      category: "Repository",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-6",
      name: "Deployment_Guide.pdf",
      typeIcon: "pdf",
      size: "1.3 MB",
      category: "DevOps",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-7",
      name: "Release_Notes_v1.2.0.pdf",
      typeIcon: "pdf",
      size: "0.9 MB",
      category: "Release",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-8",
      name: "User_Documentation.pdf",
      typeIcon: "pdf",
      size: "3.2 MB",
      category: "User Guide",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
  ],

  // Panel 12: Review & Approval Table
  reviewers: [
    {
      id: "rev-1",
      role: "Software Architect",
      person: "Rahul Sharma",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-2",
      role: "Development Lead",
      person: "Ananya Iyer",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-3",
      role: "DevOps Engineer",
      person: "Vikram Singh",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-4",
      role: "QA Manager",
      person: "Neha Verma",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-5",
      role: "Cybersecurity Lead",
      person: "Arjun Patel",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-6",
      role: "Product Manager",
      person: "Rohit Nair",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-7",
      role: "CTO",
      person: "Dr. Anil Patel",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
  ],
  approvalDecision: null,
  reviewComments: "",
  approvalDate: "2024-06-20",
};

let currentSoftwareDevelopmentRecord: SoftwareDevelopmentRecord = {
  id: "swd-rec-2024-0017",
  softwareId: "SWD-2024-0017",
  formCode: "SWF-2024-25",
  softwareProjectName: "Smart EV Management Platform",
  softwareVersion: "v1.2.0",
  status: "Under Review",
  currentStage: "engineering_review",
  currentStageLabel: "Stage 4: Engineering Review",
  createdOn: "18 Jun 2024 10:15 AM",

  linkedProductArchitectureId: "PA-2024-0017",
  linkedProductArchitectureTitle: "Smart EV Charger – System Architecture",
  linkedPrdId: "PRD-2024-0017",
  linkedPrdTitle: "Smart EV Charger – Product Requirements Document",
  linkedProductRoadmapId: "RM-2024-0012",
  linkedProductRoadmapTitle: "Smart Mobility Platform Roadmap 2024",
  linkedFirmwareDevelopmentId: "FWD-2024-0017",
  linkedFirmwareDevelopmentTitle: "Smart EV Charger – Firmware Development",
  linkedProductId: "PROD-2024-009",
  linkedProductName: "Smart EV Platform",

  businessUnit: "Smart Mobility Division",
  softwareArchitectId: "usr-rahul-sharma",
  softwareArchitectName: "Rahul Sharma",
  softwareArchitectAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  lastUpdated: "20 Jun 2024 04:25 PM",

  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  version: "1.2.0",

  stages: [
    {
      id: "software_architecture_planning",
      label: "Stage 1: Software Architecture & Planning",
      stageNumber: 1,
      status: "completed",
      description: "Define microservices, tech stack & application module specifications",
    },
    {
      id: "development_integration",
      label: "Stage 2: Development & Integration",
      stageNumber: 2,
      status: "completed",
      description: "Develop backend microservices, React SPA, REST/GraphQL APIs & database schema",
    },
    {
      id: "testing_deployment",
      label: "Stage 3: Testing & Deployment",
      stageNumber: 3,
      status: "completed",
      description: "Execute CI/CD build, automated SAST/DAST testing & deployment packages",
    },
    {
      id: "engineering_review",
      label: "Stage 4: Engineering Review",
      stageNumber: 4,
      status: "in_progress",
      description: "Review Board approval & downstream System Integration project creation/linking",
    },
  ],

  input: DEFAULT_SOFTWARE_DEVELOPMENT_INPUT,
  ...calculateSoftwareDevelopmentScores(DEFAULT_SOFTWARE_DEVELOPMENT_INPUT),

  linkedSystemIntegrationId: null,
  approvalDecision: null,
  approvalDate: "2024-06-20",
  reviewComments: "",

  auditTrail: [
    {
      at: "18 Jun 2024 10:15 AM",
      actor: "Rahul Sharma",
      event: "Software Development record created from approved Product Architecture PA-2024-0017, PRD-2024-0017, RM-2024-0012, FWD-2024-0017",
      stage: "software_architecture_planning",
      status: "Draft",
    },
    {
      at: "19 Jun 2024 02:30 PM",
      actor: "Rahul Sharma",
      event: "Completed 12 microservices development and API Gateway integration",
      stage: "development_integration",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 11:00 AM",
      actor: "Rahul Sharma",
      event: "Completed CI/CD automated deployment to staging and 87.5% code coverage validation",
      stage: "testing_deployment",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 04:25 PM",
      actor: "Rahul Sharma",
      event: "Submitted Software Release for Stage 4 Engineering Review Board",
      stage: "engineering_review",
      status: "Under Review",
    },
  ],
};

/** Get current Software Development Record */
export const getSoftwareDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: SoftwareDevelopmentRecord }> => {
    return { success: true, data: currentSoftwareDevelopmentRecord };
  }
);

/** Save Draft */
export const saveSoftwareDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<SoftwareDevelopmentFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: SoftwareDevelopmentRecord }> => {
    const updatedInput = { ...currentSoftwareDevelopmentRecord.input, ...data.input };
    const scores = calculateSoftwareDevelopmentScores(updatedInput);

    currentSoftwareDevelopmentRecord = {
      ...currentSoftwareDevelopmentRecord,
      input: updatedInput,
      ...scores,
      lastUpdated: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastModified: new Date().toISOString(),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: "Saved draft updates to Software Development Form",
          stage: currentSoftwareDevelopmentRecord.currentStage,
          status: currentSoftwareDevelopmentRecord.status,
        },
        ...currentSoftwareDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentSoftwareDevelopmentRecord };
  });

/** Advance Stage */
export const advanceSoftwareDevelopmentStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: SoftwareDevelopmentStage }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: SoftwareDevelopmentRecord }> => {
    const stageMap: Record<SoftwareDevelopmentStage, { label: string; stageNumber: number }> = {
      software_architecture_planning: {
        label: "Stage 1: Software Architecture & Planning",
        stageNumber: 1,
      },
      development_integration: {
        label: "Stage 2: Development & Integration",
        stageNumber: 2,
      },
      testing_deployment: {
        label: "Stage 3: Testing & Deployment",
        stageNumber: 3,
      },
      engineering_review: {
        label: "Stage 4: Engineering Review",
        stageNumber: 4,
      },
    };

    const target = stageMap[data.targetStage];

    currentSoftwareDevelopmentRecord = {
      ...currentSoftwareDevelopmentRecord,
      currentStage: data.targetStage,
      currentStageLabel: target.label,
      stages: currentSoftwareDevelopmentRecord.stages.map((stg) => {
        if (stg.stageNumber < target.stageNumber) return { ...stg, status: "completed" };
        if (stg.stageNumber === target.stageNumber) return { ...stg, status: "in_progress" };
        return { ...stg, status: "pending" };
      }),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: `Advanced to ${target.label}`,
          stage: data.targetStage,
          status: currentSoftwareDevelopmentRecord.status,
        },
        ...currentSoftwareDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentSoftwareDevelopmentRecord };
  });

/** Submit for Review */
export const submitSoftwareDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: SoftwareDevelopmentRecord }> => {
    currentSoftwareDevelopmentRecord = {
      ...currentSoftwareDevelopmentRecord,
      status: "Under Review",
      currentStage: "engineering_review",
      currentStageLabel: "Stage 4: Engineering Review",
      stages: currentSoftwareDevelopmentRecord.stages.map((stg) =>
        stg.id === "engineering_review" ? { ...stg, status: "in_progress" } : { ...stg, status: "completed" }
      ),
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Rahul Sharma",
          event: "Submitted Software Release for Stage 4 Engineering Review Board",
          stage: "engineering_review",
          status: "Under Review",
        },
        ...currentSoftwareDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentSoftwareDevelopmentRecord };
  });

/** Review Board Decision */
export const reviewSoftwareDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: SoftwareDevelopmentApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: SoftwareDevelopmentRecord }> => {
    let newStatus: SoftwareDevelopmentStatus = "Under Review";
    let linkedSystemIntegrationId: string | null = currentSoftwareDevelopmentRecord.linkedSystemIntegrationId ?? null;
    let eventMessage = "";

    if (data.decision === "Approved") {
      newStatus = "Approved";
      linkedSystemIntegrationId = "SI-2024-0089";
      eventMessage = "Review Board Approved Software Development. Auto-created/linked downstream System Integration project SI-2024-0089 (converging Embedded, Firmware, Electronics, and Software streams). Software Architect notified: 'Proceed to System Integration'.";
    } else if (data.decision === "Approved with Conditions") {
      newStatus = "Approved with Conditions";
      eventMessage = "Review Board Approved with Conditions. Software Architect notified: 'Improve Software'. Record remains editable.";
    } else if (data.decision === "Revision Required") {
      newStatus = "Revision Required";
      eventMessage = "Review Board requested revisions. Software Architect notified: 'Reassess Architecture & Testing'. Returned to Testing & Deployment stage.";
    } else if (data.decision === "Rejected") {
      newStatus = "Rejected";
      eventMessage = "Review Board Rejected Software Development. Project archived. Software Architect notified: 'Close Software Development'.";
    }

    const updatedReviewers = currentSoftwareDevelopmentRecord.input.reviewers.map((rev) => {
      if (rev.role === "Software Architect" || rev.role === "Development Lead") {
        return {
          ...rev,
          decision: data.decision === "Approved" || data.decision === "Approved with Conditions" ? ("Approved" as const) : ("Rejected" as const),
          status: data.decision,
          date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };
      }
      return rev;
    });

    currentSoftwareDevelopmentRecord = {
      ...currentSoftwareDevelopmentRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: new Date().toLocaleDateString("en-CA"),
      reviewComments: data.comments || "",
      linkedSystemIntegrationId,
      stages: currentSoftwareDevelopmentRecord.stages.map((stg) => {
        if (data.decision === "Approved" || data.decision === "Approved with Conditions") {
          return { ...stg, status: "completed" };
        }
        if (data.decision === "Revision Required" && stg.id === "engineering_review") {
          return { ...stg, status: "pending" };
        }
        return stg;
      }),
      currentStage:
        data.decision === "Revision Required"
          ? "testing_deployment"
          : "engineering_review",
      input: {
        ...currentSoftwareDevelopmentRecord.input,
        approvalDecision: data.decision,
        reviewComments: data.comments || "",
        approvalDate: new Date().toLocaleDateString("en-CA"),
        reviewers: updatedReviewers,
      },
      auditTrail: [
        {
          at: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          actor: "Lead Software Architect (Review Board)",
          event: eventMessage,
          stage: currentSoftwareDevelopmentRecord.currentStage,
          status: newStatus,
        },
        ...currentSoftwareDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentSoftwareDevelopmentRecord };
  });
