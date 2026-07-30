import { createServerFn } from "@tanstack/react-start";
import type {
  CloudPlatformApprovalDecision,
  CloudPlatformFormInput,
  CloudPlatformRecord,
  CloudPlatformStatus,
} from "@/services/types";

/* ===========================================================================
   Cloud Platform Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateCloudPlatformScores(input: Partial<CloudPlatformFormInput>) {
  const architecture = 88;
  const security = 90;
  const infrastructure = 87;
  const operations = 88;
  const performance = 92;

  const overallScore = Math.round(
    architecture * 0.25 +
      security * 0.25 +
      infrastructure * 0.2 +
      operations * 0.15 +
      performance * 0.15
  );

  return {
    architectureReadinessScore: architecture,
    securityScore: security,
    infrastructureReadinessScore: infrastructure,
    operationsReadinessScore: operations,
    performanceScore: performance,
    overallCloudPlatformScore: overallScore,
  };
}

const DEFAULT_RECORD: CloudPlatformRecord = {
  id: "cld-rec-0001",
  cloudPlatformDevelopmentId: "CLD-2024-0001",
  formCode: "CLD-F-2024-25",
  cloudProjectName: "Magnertia Cloud Platform",
  platformVersion: "v2.1.0",
  workflowStatus: "In Review",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedSoftwareDevId: "SWD-2024-0012",
  linkedMobileDevId: "MAD-2024-0005",
  linkedEmbeddedDevId: "EMD-2024-0003",
  linkedProductArchitectureId: "PA-2024-0011",
  linkedProductId: "Smart EV Platform",
  businessUnit: "EV Solutions",
  cloudArchitectName: "Rahul Sharma",
  cloudArchitectAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

  // Overview Data
  platformName: "Magnertia Cloud Platform",
  platformObjective:
    "Build a secure, scalable and highly available cloud platform for EV charging ecosystem.",
  businessPurpose:
    "Enable scalable backend services, IoT connectivity, analytics and AI capabilities.",
  targetUsers: ["EV Users", "Fleet Operators", "Partners"],
  supportedProducts: "4 Products",
  slaTarget: "99.95%",
  developmentStatus: "In Progress",

  architectureReadinessScore: 88,
  securityScore: 90,
  infrastructureReadinessScore: 87,
  operationsReadinessScore: 88,
  performanceScore: 92,
  overallCloudPlatformScore: 89,

  architectureConfig: {
    architectureStyle: "Microservices",
    deploymentModel: "Hybrid Cloud",
    computePlatform: "Kubernetes (EKS)",
    storageArchitecture: "Object Storage + Block Storage",
    networkTopology: "VPC, Subnets, NAT, VPN, CDN",
    loadBalancers: "Application Load Balancer",
    apiGateway: "Kong API Gateway",
    serviceMesh: "Istio Service Mesh",
    drStrategy: "Multi Region - Active Passive",
    architectureStatus: "Designed",
    architectureReadinessScore: 88,
  },

  servicesConfig: {
    apiGateway: "Kong Gateway v3.4",
    authenticationService: "OAuth2.0 / Keycloak",
    authorizationService: "RBAC + OPA Policies",
    notificationService: "AWS SNS / Firebase Push",
    messagingQueue: "Apache Kafka / RabbitMQ",
    objectStorage: "AWS S3 Multi-AZ",
    fileStorage: "EFS Shared Volume",
    iotDeviceServices: "AWS IoT Core",
    secretsManagement: "HashiCorp Vault",
    serviceDiscovery: "Consul / Kubernetes CoreDNS",
    serviceReadinessScore: 92,
    servicesList: [
      { name: "API Gateway", category: "Routing & Security", status: "Active", provider: "Kong", score: 95 },
      { name: "Authentication Service", category: "Identity", status: "Active", provider: "Keycloak", score: 92 },
      { name: "Notification Service", category: "Messaging", status: "Active", provider: "AWS SNS", score: 90 },
      { name: "Messaging Queue", category: "Event Stream", status: "Active", provider: "Kafka", score: 94 },
      { name: "File Storage", category: "Storage", status: "Active", provider: "AWS S3 / EFS", score: 91 },
      { name: "IoT Device Management", category: "Edge IoT", status: "Active", provider: "AWS IoT Core", score: 89 },
    ],
  },

  dataPlatformConfig: {
    primaryDatabase: "PostgreSQL (Aurora)",
    cachePlatform: "Redis Cluster",
    dataWarehouse: "Amazon Redshift",
    backupStrategy: "Automated Daily Backup",
    disasterRecovery: "Multi Region - Active Passive",
    replicationStrategy: "Cross-Region Streaming",
    storageAnalytics: "Databricks Delta Lake",
    dataRetentionPolicy: "90 Days (Hot), 1 Year (Cold)",
    dbScalingStrategy: "Read Replica + Auto Scaling",
    dataPlatformScore: 88,
  },

  securityConfig: {
    identityProvider: "Keycloak",
    authenticationMethod: "OAuth 2.0 + MFA",
    authorizationModel: "RBAC + Fine-grained ABAC",
    oauthProtocol: "OAuth2.0 / OpenID Connect",
    oidcProvider: "Okta / Keycloak",
    rbacPolicy: "Granular Role Mapping",
    encryptionStandard: "AES-256 (At Rest) / TLS 1.3 (In Transit)",
    secretsManager: "AWS Secrets Manager",
    certificateManagement: "Let's Encrypt / Cert-Manager",
    complianceStandards: ["ISO 27001", "SOC 2", "GDPR", "PCI DSS"],
    securityScore: 90,
  },

  devOpsConfig: {
    infrastructureAsCode: "Terraform + Terragrunt",
    containerPlatform: "Docker Container Runtime",
    kubernetesCluster: "Kubernetes (EKS v1.28)",
    cicdPipeline: "GitHub Actions + ArgoCD",
    containerRegistry: "AWS ECR Private",
    monitoringPlatform: "Prometheus + Grafana",
    loggingPlatform: "Elastic Stack (ELK)",
    terraformVersion: "v1.6.2",
    gitOpsTool: "ArgoCD v2.9",
    deploymentStatus: "Deployed",
    infrastructureReadinessScore: 91,
  },

  scalabilityMetrics: {
    autoScalingStrategy: "Horizontal Pod Autoscaler (HPA)",
    loadBalancingType: "Application Load Balancer (ALB)",
    cdnIntegration: "CloudFront CDN",
    highAvailability: "Multi AZ (3 Availability Zones)",
    performanceBenchmark: "> 10K TPS Tested",
    capacityPlanning: "500K Active Connected Users",
    latencyAvgMs: 14.2,
    throughputTps: 12500,
    scalabilityScore: 92,
  },

  monitoringConfig: {
    applicationMonitoring: "Datadog / APM Tracing",
    infrastructureMonitoring: "Prometheus + Grafana",
    alertManagement: "PagerDuty Integration",
    incidentResponsePlan: "Defined SLA & Playbooks",
    slaMonitoring: "Enabled (99.95% Target)",
    operationalDashboard: "Live Grafana Cloud",
    uptime30DaysPct: 99.98,
    activeAlertsCount: 2,
    incidentsCount: 1,
    operationsReadinessScore: 88,
  },

  aiAssessment: {
    aiArchitectureScore: 88,
    aiCostOptimizationScore: 90,
    aiPerformanceOptimizationScore: 87,
    aiSecurityAssessmentScore: 91,
    aiCapacityPredictionScore: 89,
    aiReliabilityAnalysisScore: 89,
    aiOverallCloudScore: 89,
    aiSuggestions: [
      "Enable Graviton3 instances to reduce EC2 compute costs by ~18%.",
      "Upgrade Kubernetes cluster nodes to v1.29 for enhanced security patch level.",
      "Implement Redis Cluster read-replicas in secondary Availability Zone.",
    ],
  },

  readinessSummary: {
    architectureReadiness: 88,
    securityReadiness: 90,
    infrastructureReadiness: 87,
    operationsReadiness: 88,
    performanceReadiness: 92,
    overallCloudPlatformScore: 89,
    recommendation: "Proceed to Stage 3 Production Deployment",
    riskSummary: "Low overall risk. Monitoring and alerting configured.",
  },

  attachments: [
    {
      id: "att1",
      name: "Cloud_Architecture_Diagram.pdf",
      size: "2.4 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att2",
      name: "Infrastructure_Diagram.vsdx",
      size: "1.8 MB",
      type: "VSDX",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att3",
      name: "API_Documentation.pdf",
      size: "3.1 MB",
      type: "PDF",
      uploadedBy: "Ananya Iyer",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att4",
      name: "Terraform_Code.zip",
      size: "4.6 MB",
      type: "ZIP",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att5",
      name: "Deployment_Guide.pdf",
      size: "2.2 MB",
      type: "PDF",
      uploadedBy: "Neha Verma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att6",
      name: "Security_Assessment.pdf",
      size: "1.9 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att7",
      name: "Monitoring_Dashboard.png",
      size: "1.2 MB",
      type: "PNG",
      uploadedBy: "Rohit Nair",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att8",
      name: "DR_Plan.pdf",
      size: "2.7 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
  ],

  reviewers: [
    {
      role: "Cloud Architect",
      person: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Looks Good",
    },
    {
      role: "DevOps Lead",
      person: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "CI/CD Verified",
    },
    {
      role: "Security Architect",
      person: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Compliant",
    },
    {
      role: "Infrastructure Engineer",
      person: "Neha Verma",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Infra Stable",
    },
    {
      role: "Product Manager",
      person: "Renit Nair",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
  reviewComments: "Platform architecture is stable. Ensure secondary DR failover dry-run is documented.",

  auditTrail: [
    {
      id: "aud1",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Submitted for Review",
      details: "Submitted Cloud Platform Specification v2.1.0 to Architecture Review Board.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud2",
      timestamp: "20 Jun 2024 02:10 PM",
      user: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      action: "Updated Infrastructure Config",
      details: "Configured EKS Cluster v1.28 with ArgoCD GitOps integration.",
      ipAddress: "192.168.1.112",
    },
    {
      id: "aud3",
      timestamp: "19 Jun 2024 11:45 AM",
      user: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      action: "Updated Security Policy",
      details: "Configured OAuth 2.0 / Keycloak and AWS Secrets Manager policies.",
      ipAddress: "192.168.1.108",
    },
    {
      id: "aud4",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Created Record",
      details: "Initialized Cloud Platform Development Record CLD-2024-0001.",
      ipAddress: "192.168.1.104",
    },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: CloudPlatformRecord = { ...DEFAULT_RECORD };

export const getCloudPlatformDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: CloudPlatformRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveCloudPlatformDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<CloudPlatformFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: CloudPlatformRecord }> => {
    const input = data.input;
    const scores = calculateCloudPlatformScores({ ...currentRecord, ...input });

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

export const submitCloudPlatformDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: CloudPlatformRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewCloudPlatformDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: CloudPlatformApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: CloudPlatformRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<CloudPlatformApprovalDecision, CloudPlatformStatus> = {
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
