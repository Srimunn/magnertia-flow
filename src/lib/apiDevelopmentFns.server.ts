import { createServerFn } from "@tanstack/react-start";
import type {
  ApiDevelopmentApprovalDecision,
  ApiDevelopmentFormInput,
  ApiDevelopmentRecord,
  ApiDevelopmentStatus,
} from "@/services/types";

/* ===========================================================================
   API Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateApiDevelopmentScores(input: Partial<ApiDevelopmentFormInput>) {
  const designReadiness = 92;
  const securityReadiness = 90;
  const testingReadiness = 88;
  const deploymentReadiness = 89;
  const operationalScore = 89;

  const overallApiScore = Math.round(
    designReadiness * 0.25 +
      securityReadiness * 0.25 +
      testingReadiness * 0.2 +
      deploymentReadiness * 0.15 +
      operationalScore * 0.15
  );

  return {
    designReadinessScore: designReadiness,
    securityScore: securityReadiness,
    validationScore: testingReadiness,
    deploymentReadinessScore: deploymentReadiness,
    operationalScore,
    overallApiScore: overallApiScore,
  };
}

const DEFAULT_RECORD: ApiDevelopmentRecord = {
  id: "api-rec-0017",
  apiDevelopmentId: "API-2024-0017",
  formCode: "APF-2024-25",
  apiProjectName: "EV Charging APIs",
  apiVersion: "v2.1.0",
  workflowStatus: "In Review",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Platform",
  linkedSoftwareDevId: "SWD-2024-0012",
  linkedCloudPlatformId: "CLD-2024-0001",
  linkedMobileAppDevId: "MAD-2024-0005",
  linkedEmbeddedSystemsDevId: "EMD-2024-0004",
  apiArchitectName: "Rahul Sharma",
  apiArchitectAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  businessUnit: "EV Mobility Division",

  // Overview Data
  apiName: "EV Charger APIs",
  businessObjective: "Provide secure and scalable APIs for EV charging operations.",
  functionalDescription: "APIs for station discovery, session management, payments, user authentication and reporting.",
  consumerApplications: ["Mobile App", "Web App", "Partner Portal", "Fleet Management", "Third-Party Apps"],
  apiCategory: "Business API",
  deploymentEnvironment: "Production",
  developmentStatus: "In Progress",

  designReadinessScore: 92,
  securityScore: 90,
  integrationScore: 88,
  documentationScore: 90,
  validationScore: 88,
  deploymentReadinessScore: 89,
  operationalScore: 89,
  aiOverallScore: 89,
  overallApiScore: 89,

  endpoints: [
    {
      id: "ep-1",
      method: "GET",
      path: "/api/v2/chargers",
      name: "List Charging Stations",
      description: "Search and filter nearby available EV charging stations with real-time telemetry.",
      authRequired: true,
      status: "Stable",
      requestSchemaName: "request-schema.json",
      requestSchemaSize: "18.4 KB",
      responseSchemaName: "response-schema.json",
      responseSchemaSize: "21.7 KB",
      sampleResponse: JSON.stringify(
        {
          status: "success",
          data: [
            {
              id: "CH612345",
              name: "EV Charger 01",
              status: "available",
              powerKw: 150,
              connectorType: "CCS2",
            },
          ],
        },
        null,
        2
      ),
    },
    {
      id: "ep-2",
      method: "POST",
      path: "/api/v2/sessions/start",
      name: "Start Charging Session",
      description: "Initiate remote charging session for validated RFID or mobile app token.",
      authRequired: true,
      status: "Stable",
      requestSchemaName: "start-session-req.json",
      requestSchemaSize: "12.1 KB",
      responseSchemaName: "start-session-res.json",
      responseSchemaSize: "14.5 KB",
      sampleResponse: JSON.stringify(
        {
          status: "success",
          sessionId: "SESS-99812",
          startedAt: "2024-06-20T16:30:00Z",
          initialKw: 0,
        },
        null,
        2
      ),
    },
    {
      id: "ep-3",
      method: "POST",
      path: "/api/v2/payments/checkout",
      name: "Process Charging Payment",
      description: "Process instant card, UPI or wallet payment for completed charging session.",
      authRequired: true,
      status: "Stable",
      requestSchemaName: "payment-req.json",
      requestSchemaSize: "15.8 KB",
      responseSchemaName: "payment-res.json",
      responseSchemaSize: "19.2 KB",
      sampleResponse: JSON.stringify(
        {
          status: "success",
          transactionId: "TXN-88741",
          amount: 450.0,
          currency: "INR",
        },
        null,
        2
      ),
    },
  ],

  securityPolicy: {
    authMethod: "OAuth 2.0",
    authorizationModel: "RBAC",
    tokenExpiryMinutes: 60,
    apiKeyManagement: true,
    rbacEnabled: true,
    rateLimit: "1000 requests / hour",
    securityScore: 90,
  },

  integrationConfig: {
    primaryDataSource: "PostgreSQL",
    databaseConnection: "Direct Connect",
    erpIntegration: true,
    cloudIntegration: true,
    thirdPartyIntegration: true,
    webhookIntegration: true,
    integrationScore: 88,
  },

  documentationInfo: {
    openApiSpecName: "ev-api-openapi.yaml",
    openApiSpecSize: "38.5 KB",
    swaggerDocName: "swagger-ui.html",
    swaggerDocSize: "1.2 KB",
    sampleRequestsName: "sample-requests.json",
    sampleRequestsSize: "12.6 KB",
    sampleResponsesName: "sample-responses.json",
    sampleResponsesSize: "15.2 KB",
    errorCodesCount: 32,
    sdkLanguages: ["JavaScript", "Python", "Java"],
    documentationScore: 90,
  },

  testSummary: {
    unitTesting: "Completed",
    integrationTesting: "Completed",
    loadTesting: "Completed",
    securityTesting: "Completed",
    contractTesting: "Completed",
    testCoveragePercentage: 87.3,
    validationScore: 88,
  },

  deploymentConfig: {
    cicdPipeline: "GitHub Actions",
    apiGateway: "Kong Gateway",
    environment: "Production",
    versionStrategy: "URI Versioning",
    deprecationPolicy: "12 Months",
    releaseStatus: "Deployed",
    deploymentReadinessScore: 89,
  },

  monitoringSummary: {
    apiMonitoringTool: "Prometheus + Grafana",
    requestAnalyticsEnabled: true,
    errorMonitoringEnabled: true,
    latencyMonitoringEnabled: true,
    slaMonitoringEnabled: true,
    usageDashboardEnabled: true,
    operationalScore: 89,
    requestTrend7Days: [
      { day: "14 Jun", requests: 12500 },
      { day: "15 Jun", requests: 18200 },
      { day: "16 Jun", requests: 14100 },
      { day: "17 Jun", requests: 22400 },
      { day: "18 Jun", requests: 19800 },
      { day: "19 Jun", requests: 24500 },
      { day: "20 Jun", requests: 26100 },
    ],
  },

  aiAssessment: {
    aiApiDesignScore: 90,
    aiSecurityReview: 91,
    aiPerformanceAnalysis: 88,
    aiScalabilityAnalysis: 89,
    aiDocumentationReview: 90,
    aiImprovementSuggestionsCount: 4,
    aiOverallScore: 89,
    recommendations: [
      "Implement Response Compression (gzip/brotli) to reduce payload size by 32%.",
      "Add Redis distributed cache layer for GET /chargers endpoint to reduce DB load.",
      "Enforce Strict OAuth 2.0 Scope validation on Session Start endpoints.",
      "Include Rate-Limit-Remaining headers in API Gateway response headers.",
    ],
  },

  readinessSummary: {
    designReadiness: 92,
    securityReadiness: 90,
    testingReadiness: 88,
    deploymentReadiness: 89,
    overallApiScore: 89,
    recommendation: "Proceed to Production Deployment",
  },

  attachments: [
    { id: "att1", name: "API_Architecture_Diagram.pdf", size: "2.4 MB", type: "PDF", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att2", name: "openapi-spec.yaml", size: "38.5 KB", type: "YAML", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att3", name: "postman_collection.json", size: "912 KB", type: "JSON", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att4", name: "sequence_diagram.png", size: "1.0 MB", type: "PNG", uploadedBy: "Ananya Iyer", date: "20 Jun 2024", url: "#" },
    { id: "att5", name: "api_test_report.pdf", size: "1.7 MB", type: "PDF", uploadedBy: "Rohit Nair", date: "20 Jun 2024", url: "#" },
  ],

  reviewers: [
    { role: "API Architect", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Looks Good" },
    { role: "Software Architect", person: "Ananya Iyer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Well Designed" },
    { role: "Cloud Architect", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Compliant" },
    { role: "Security Architect", person: "Neha Verma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", decision: "Approved with Conditions", date: "20 Jun 2024", comments: "Rate limit to be reviewed" },
    { role: "QA Manager", person: "Rohit Nair", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Test Coverage Good" },
    { role: "CTO", person: "Dr. Anil Patel", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", decision: "Pending", date: "20 Jun 2024", comments: "Pending Review" },
  ],

  approvalDecision: "Approved with Conditions",
  approvalDate: "20 Jun 2024",
  reviewComments: "Overall API looks good. Please review rate limiting policy and error code mapping.",

  auditTrail: [
    { id: "aud1", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Submitted for Review", details: "Submitted EV Charging APIs v2.1.0 to architecture review board.", ipAddress: "192.168.1.104" },
    { id: "aud2", timestamp: "20 Jun 2024 02:10 PM", user: "Neha Verma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", action: "Security Audit Completed", details: "Verified OAuth 2.0 RBAC policy and API Gateway rate limits.", ipAddress: "192.168.1.112" },
    { id: "aud3", timestamp: "19 Jun 2024 11:45 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Uploaded OpenAPI Spec", details: "Uploaded ev-api-openapi.yaml and Postman Collection.", ipAddress: "192.168.1.104" },
    { id: "aud4", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Created Project", details: "Initialized API Development Record API-2024-0017.", ipAddress: "192.168.1.104" },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: ApiDevelopmentRecord = { ...DEFAULT_RECORD };

export const getApiDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: ApiDevelopmentRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveApiDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<ApiDevelopmentFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: ApiDevelopmentRecord }> => {
    const input = data.input;
    const scores = calculateApiDevelopmentScores({ ...currentRecord, ...input });

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

export const submitApiDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: ApiDevelopmentRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewApiDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: ApiDevelopmentApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: ApiDevelopmentRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<ApiDevelopmentApprovalDecision, ApiDevelopmentStatus> = {
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
