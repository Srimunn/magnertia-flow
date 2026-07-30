import { createServerFn } from "@tanstack/react-start";
import type {
  MobileDevelopmentApprovalDecision,
  MobileDevelopmentFormInput,
  MobileDevelopmentRecord,
  MobileDevelopmentStage,
  MobileDevelopmentStatus,
} from "@/services/types";

/* ===========================================================================
   Mobile App Development — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Mobile App Development lifecycle:
     Stage 1: Mobile Architecture & UI/UX (MVVM pattern, Flutter 3.19, Material 3 UI & offline storage design)
     Stage 2: Application Development (feature implementation, device APIs, push notifications, auth & REST/GraphQL integration)
     Stage 3: Testing & Deployment (automated CI/CD build, AAB/IPA generation, device testing & store readiness)
     Stage 4: Review & Release (Review Board decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Marks Google Play & Apple App Store internal statuses as 'Ready for Release' / 'Published'
     - Auto-creates & links downstream Mobile Operations & Support engagement (MO-2024-0089)
       and surfaces its ID to proceed to Production.
   =========================================================================== */

export function calculateMobileDevelopmentScores(input: Partial<MobileDevelopmentFormInput>) {
  // 1. Development Progress (0-100)
  const developmentProgress = 88;

  // 2. UI Readiness (0-100)
  const uiReadiness = input.uiReadinessScore ?? 92;

  // 3. Performance Readiness (0-100)
  const performanceReadiness = 87;

  // 4. Store Readiness (0-100)
  const storeReadiness = input.deviceIntegrationScore ?? 85;

  // Overall Mobile Score (/100)
  const overallMobileScore = Math.round(
    developmentProgress * 0.25 +
      uiReadiness * 0.25 +
      performanceReadiness * 0.25 +
      storeReadiness * 0.25
  );

  // AI Assessment Sub-scores (single source of truth with Panel 9)
  const aiCodeQualityScore = 89;
  const aiUiReview = uiReadiness;
  const aiPerformanceAnalysis = performanceReadiness;
  const aiSecurityReview = input.securityScore ?? 88;
  const aiCrashPrediction = 85;
  const aiUxSuggestions = 90;
  const aiOverallMobileScore = overallMobileScore;

  // Key Highlights dynamic list
  const highlights: string[] = [];
  highlights.push("Cross platform support (Android & iOS)");
  highlights.push("Offline mode with auto sync");
  highlights.push("Secure authentication implemented");
  highlights.push("Push notifications enabled");
  highlights.push("API integration completed");
  highlights.push("All critical and major tests passed");

  return {
    summary: {
      overallMobileScore,
      developmentProgress,
      uiReadiness,
      performanceReadiness,
      storeReadiness,
      recommendation: "Proceed to App Store Release",
    },
    aiAssessment: {
      aiOverallMobileScore,
      aiCodeQualityScore,
      aiUiReview,
      aiPerformanceAnalysis,
      aiSecurityReview,
      aiCrashPrediction,
      aiUxSuggestions,
    },
    keyHighlights: highlights,
  };
}

const DEFAULT_MOBILE_DEVELOPMENT_INPUT: MobileDevelopmentFormInput = {
  // Panel 1: Project Overview
  productName: "Smart EV Platform",
  mobileApplicationName: "Magnertia EV Charger",
  projectObjective:
    "Provide seamless EV charging experience with real-time monitoring, payments and analytics.",
  targetUsersTags: ["EV Owners", "Fleets", "Operators"],
  developmentStatus: "In Progress",
  appMockupImageUrl:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",

  // Panel 2: Architecture
  architecturePattern: "MVVM",
  mobileFramework: "Flutter 3.19",
  platform: ["Android", "iOS"],
  stateManagement: "Riverpod",
  navigationArchitecture: "GoRouter",
  offlineStrategy: "Local DB (SQLite) + Sync",
  architectureStatus: "Verified",
  mobileArchitectureDiagramUrl:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",

  // Panel 3: UI / UX Development
  uiFramework: "Material 3",
  designSystem: "Magnertia Design System",
  responsiveDesign: "Implemented",
  accessibilityCompliance: "WCAG 2.1 AA",
  themeSupport: "Light, Dark",
  localizationSupport: "Implemented",
  uiReadinessScore: 92,
  uiScreensPreviewUrl:
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80",

  // Panel 4: API & Backend Integration
  apiIntegrationList: [
    { name: "REST API", checked: true },
    { name: "GraphQL", checked: true },
    { name: "Authentication API", checked: true },
    { name: "Notification Service", checked: true },
    { name: "Payment Gateway", checked: true },
    { name: "ERP Integration", checked: true },
  ],
  integrationStatus: "Completed",
  totalApisIntegrated: 24,
  successfulCallsPct: "100%",
  lastSync: "20 Jun 2024 04:10 PM",

  // Panel 5: Device Features
  deviceCapabilitiesList: [
    { name: "Camera", checked: true },
    { name: "GPS", checked: true },
    { name: "Bluetooth", checked: true },
    { name: "NFC", checked: true },
    { name: "Biometrics", checked: true },
    { name: "QR / Barcode Scanner", checked: true },
  ],
  deviceIntegrationScore: 85,

  // Panel 6: Performance & Security
  authenticationMethod: "OAuth 2.0 + JWT",
  dataEncryption: "AES-256",
  offlineStorage: "Encrypted SQLite",
  apiSecurity: "OAuth + SSL Pinning",
  performanceOptimization: "Implemented",
  batteryOptimization: "Implemented",
  securityScore: 88,

  // Panel 7: Testing & Deployment
  testItems: [
    { id: "test-1", name: "Unit Testing", status: "Completed", details: "Flutter test suite 98% pass" },
    { id: "test-2", name: "Integration Testing", status: "Completed", details: "REST API contract tests passed" },
    { id: "test-3", name: "UI Testing", status: "Completed", details: "Patrol E2E UI tests green" },
    { id: "test-4", name: "Device Compatibility", status: "Completed", details: "Tested on 15 Android & 8 iOS models" },
    { id: "test-5", name: "Beta Testing", status: "In Progress", details: "500 TestFlight & Firebase Beta users" },
    { id: "test-6", name: "App Store Readiness", status: "Ready", details: "Store assets & privacy policy ready" },
  ],
  codeCoverage: 87.3,

  // Panel 8: App Store Release Management
  androidPackageName: "app-release.aab",
  androidPackageSize: "25.6 MB",
  iosPackageName: "MagnertiaEV.ipa",
  iosPackageSize: "120.4 MB",
  googlePlayStatus: "Ready for Release",
  appleAppStoreStatus: "Waiting for Review",
  versionCode: 120,
  releaseStatus: "Under Review",

  // Panel 9 & 10 Initialized dynamically
  aiAssessment: {
    aiOverallMobileScore: 88,
    aiCodeQualityScore: 89,
    aiUiReview: 92,
    aiPerformanceAnalysis: 87,
    aiSecurityReview: 88,
    aiCrashPrediction: 85,
    aiUxSuggestions: 90,
  },
  summary: {
    overallMobileScore: 88,
    developmentProgress: 88,
    uiReadiness: 92,
    performanceReadiness: 87,
    storeReadiness: 85,
    recommendation: "Proceed to App Store Release",
  },

  // Panel 11: Attachments
  attachments: [
    {
      id: "att-1",
      name: "Mobile_Architecture.pdf",
      typeIcon: "pdf",
      size: "2.4 MB",
      category: "Architecture",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-2",
      name: "UI_Mockups.zip",
      typeIcon: "zip",
      size: "18.7 MB",
      category: "Design",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-3",
      name: "Source_Code_Repo.zip",
      typeIcon: "zip",
      size: "1.9 MB",
      category: "Repository",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-4",
      name: "API_Documentation.pdf",
      typeIcon: "pdf",
      size: "2.1 MB",
      category: "API Docs",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-5",
      name: "Test_Reports.zip",
      typeIcon: "zip",
      size: "6.8 MB",
      category: "Test Suite",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
  ],

  // Panel 12: Review & Approval Table
  reviewers: [
    {
      id: "rev-1",
      role: "Mobile Architect",
      person: "Rahul Sharma",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-2",
      role: "Software Architect",
      person: "Ananya Iyer",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-3",
      role: "UI/UX Lead",
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
      role: "DevOps Engineer",
      person: "Rohit Nair",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-6",
      role: "Product Manager",
      person: "Arjun Patel",
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

let currentMobileDevelopmentRecord: MobileDevelopmentRecord = {
  id: "mad-rec-2024-0017",
  mobileId: "MAD-2024-0017",
  formCode: "MAF-2024-25",
  mobileProjectName: "Magnertia EV Charger App",
  mobileAppVersion: "v1.2.0",
  status: "Under Review",
  currentStage: "review_release",
  currentStageLabel: "Stage 4: Review & Release",
  createdOn: "18 Jun 2024 10:15 AM",

  linkedSoftwareDevelopmentId: "SWD-2024-0012",
  linkedSoftwareDevelopmentTitle: "Smart EV Management Platform",
  linkedProductArchitectureId: "PA-2024-0011",
  linkedProductArchitectureTitle: "Smart EV Charger – System Architecture",
  linkedPrdId: "PRD-2024-0009",
  linkedPrdTitle: "Smart EV Charger – Product Requirements Document",
  linkedProductRoadmapId: "RM-2024-0010",
  linkedProductRoadmapTitle: "Smart Mobility Platform Roadmap 2024",
  linkedProductId: "PROD-2024-009",
  linkedProductName: "Smart EV Platform",

  businessUnit: "EV Solutions",
  mobileArchitectId: "usr-rahul-sharma",
  mobileArchitectName: "Rahul Sharma",
  mobileArchitectAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  lastUpdated: "20 Jun 2024 04:25 PM",

  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  version: "1.2.0",

  stages: [
    {
      id: "mobile_architecture_uiux",
      label: "Stage 1: Mobile Architecture & UI/UX",
      stageNumber: 1,
      status: "completed",
      description: "Define MVVM architecture, Flutter 3.19 UI screens & offline storage",
    },
    {
      id: "application_development",
      label: "Stage 2: Application Development",
      stageNumber: 2,
      status: "completed",
      description: "Develop mobile features, device APIs, push notifications & REST/GraphQL integration",
    },
    {
      id: "testing_deployment",
      label: "Stage 3: Testing & Deployment",
      stageNumber: 3,
      status: "completed",
      description: "Execute CI/CD build, generate Android AAB & iOS IPA packages, and complete test suites",
    },
    {
      id: "review_release",
      label: "Stage 4: Review & Release",
      stageNumber: 4,
      status: "in_progress",
      description: "Review Board approval, internal store release publishing & Mobile Operations setup",
    },
  ],

  input: DEFAULT_MOBILE_DEVELOPMENT_INPUT,
  ...calculateMobileDevelopmentScores(DEFAULT_MOBILE_DEVELOPMENT_INPUT),

  linkedMobileOperationsId: null,
  approvalDecision: null,
  approvalDate: "2024-06-20",
  reviewComments: "",

  auditTrail: [
    {
      at: "18 Jun 2024 10:15 AM",
      actor: "Rahul Sharma",
      event: "Mobile App Development record created from approved Software Development SWD-2024-0012, PA-2024-0011, PRD-2024-0009, RM-2024-0010",
      stage: "mobile_architecture_uiux",
      status: "Draft",
    },
    {
      at: "19 Jun 2024 02:30 PM",
      actor: "Rahul Sharma",
      event: "Completed Flutter 3.19 feature development and REST/GraphQL API integration",
      stage: "application_development",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 11:00 AM",
      actor: "Rahul Sharma",
      event: "Generated app-release.aab and MagnertiaEV.ipa builds. Completed 87.3% test coverage",
      stage: "testing_deployment",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 04:25 PM",
      actor: "Rahul Sharma",
      event: "Submitted Mobile Application for Stage 4 Mobile App Review Board",
      stage: "review_release",
      status: "Under Review",
    },
  ],
};

/** Get current Mobile Development Record */
export const getMobileDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: MobileDevelopmentRecord }> => {
    return { success: true, data: currentMobileDevelopmentRecord };
  }
);

/** Save Draft */
export const saveMobileDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<MobileDevelopmentFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: MobileDevelopmentRecord }> => {
    const updatedInput = { ...currentMobileDevelopmentRecord.input, ...data.input };
    const scores = calculateMobileDevelopmentScores(updatedInput);

    currentMobileDevelopmentRecord = {
      ...currentMobileDevelopmentRecord,
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
          event: "Saved draft updates to Mobile App Development Form",
          stage: currentMobileDevelopmentRecord.currentStage,
          status: currentMobileDevelopmentRecord.status,
        },
        ...currentMobileDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMobileDevelopmentRecord };
  });

/** Advance Stage */
export const advanceMobileDevelopmentStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: MobileDevelopmentStage }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: MobileDevelopmentRecord }> => {
    const stageMap: Record<MobileDevelopmentStage, { label: string; stageNumber: number }> = {
      mobile_architecture_uiux: {
        label: "Stage 1: Mobile Architecture & UI/UX",
        stageNumber: 1,
      },
      application_development: {
        label: "Stage 2: Application Development",
        stageNumber: 2,
      },
      testing_deployment: {
        label: "Stage 3: Testing & Deployment",
        stageNumber: 3,
      },
      review_release: {
        label: "Stage 4: Review & Release",
        stageNumber: 4,
      },
    };

    const target = stageMap[data.targetStage];

    currentMobileDevelopmentRecord = {
      ...currentMobileDevelopmentRecord,
      currentStage: data.targetStage,
      currentStageLabel: target.label,
      stages: currentMobileDevelopmentRecord.stages.map((stg) => {
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
          status: currentMobileDevelopmentRecord.status,
        },
        ...currentMobileDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMobileDevelopmentRecord };
  });

/** Submit for Review */
export const submitMobileDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: MobileDevelopmentRecord }> => {
    currentMobileDevelopmentRecord = {
      ...currentMobileDevelopmentRecord,
      status: "Under Review",
      currentStage: "review_release",
      currentStageLabel: "Stage 4: Review & Release",
      stages: currentMobileDevelopmentRecord.stages.map((stg) =>
        stg.id === "review_release" ? { ...stg, status: "in_progress" } : { ...stg, status: "completed" }
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
          event: "Submitted Mobile Application for Stage 4 Mobile App Review Board",
          stage: "review_release",
          status: "Under Review",
        },
        ...currentMobileDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMobileDevelopmentRecord };
  });

/** Review Board Decision */
export const reviewMobileDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: MobileDevelopmentApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: MobileDevelopmentRecord }> => {
    let newStatus: MobileDevelopmentStatus = "Under Review";
    let linkedMobileOpsId: string | null = currentMobileDevelopmentRecord.linkedMobileOperationsId ?? null;
    let eventMessage = "";

    if (data.decision === "Approved") {
      newStatus = "Approved";
      linkedMobileOpsId = "MO-2024-0089";
      eventMessage = "Review Board Approved Mobile Application. Marked Google Play & Apple App Store as Published. Auto-created downstream Mobile Operations & Support engagement MO-2024-0089. Mobile Architect notified: 'Proceed to Production'.";
    } else if (data.decision === "Approved with Conditions") {
      newStatus = "Approved with Conditions";
      eventMessage = "Review Board Approved with Conditions. Developer notified: 'Improve Mobile Application'. Record remains editable.";
    } else if (data.decision === "Revision Required") {
      newStatus = "Revision Required";
      eventMessage = "Review Board requested revisions. Developer notified: 'Reassess UI, Performance & Security'. Returned to Testing & Deployment stage.";
    } else if (data.decision === "Rejected") {
      newStatus = "Rejected";
      eventMessage = "Review Board Rejected Mobile Application. Project archived. Developer notified: 'Close Mobile Development'.";
    }

    const updatedReviewers = currentMobileDevelopmentRecord.input.reviewers.map((rev) => {
      if (rev.role === "Mobile Architect" || rev.role === "Software Architect") {
        return {
          ...rev,
          decision: data.decision === "Approved" || data.decision === "Approved with Conditions" ? ("Approved" as const) : ("Rejected" as const),
          status: data.decision,
          date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };
      }
      return rev;
    });

    currentMobileDevelopmentRecord = {
      ...currentMobileDevelopmentRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: new Date().toLocaleDateString("en-CA"),
      reviewComments: data.comments || "",
      linkedMobileOperationsId: linkedMobileOpsId,
      stages: currentMobileDevelopmentRecord.stages.map((stg) => {
        if (data.decision === "Approved" || data.decision === "Approved with Conditions") {
          return { ...stg, status: "completed" };
        }
        if (data.decision === "Revision Required" && stg.id === "review_release") {
          return { ...stg, status: "pending" };
        }
        return stg;
      }),
      currentStage:
        data.decision === "Revision Required"
          ? "testing_deployment"
          : "review_release",
      input: {
        ...currentMobileDevelopmentRecord.input,
        approvalDecision: data.decision,
        reviewComments: data.comments || "",
        approvalDate: new Date().toLocaleDateString("en-CA"),
        googlePlayStatus: data.decision === "Approved" ? "Published" : currentMobileDevelopmentRecord.input.googlePlayStatus,
        appleAppStoreStatus: data.decision === "Approved" ? "Published" : currentMobileDevelopmentRecord.input.appleAppStoreStatus,
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
          actor: "Lead Mobile Architect (Review Board)",
          event: eventMessage,
          stage: currentMobileDevelopmentRecord.currentStage,
          status: newStatus,
        },
        ...currentMobileDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentMobileDevelopmentRecord };
  });
