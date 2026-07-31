import { createServerFn } from "@tanstack/react-start";
import type {
  IotApprovalDecision,
  IotFormInput,
  IotRecord,
  IotStatus,
} from "@/services/types";

/* ===========================================================================
   IoT Development — Server Functions & Connected-Device Engine
   =========================================================================== */

export function calculateIotScores(record: Partial<IotRecord>) {
  const hwScore = record.hardwareScore ?? 89;
  const connScore = record.connectivityScore ?? 92;
  const secScore = record.securityScore ?? 90;
  const depScore = record.deploymentScore ?? 92;
  const aiScore = record.aiOverallIotScore ?? 92;

  const overallScore = Math.round(
    hwScore * 0.2 + connScore * 0.25 + secScore * 0.25 + depScore * 0.15 + aiScore * 0.15
  );

  return {
    hardwareScore: hwScore,
    connectivityScore: connScore,
    securityScore: secScore,
    deploymentScore: depScore,
    aiOverallIotScore: aiScore,
    overallIotSolutionScore: overallScore,
  };
}

export const DEFAULT_IOT_RECORD: IotRecord = {
  id: "iot-rec-0009",
  iotDevelopmentId: "IOTD-2024-0009",
  formCode: "IOTF-2024-25",
  iotProjectName: "Smart EV Charging Network",
  solutionVersion: "v1.2.0",
  workflowStatus: "In Review",
  stage: 4,
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProduct: { id: "PRD-EV-CHARGER", name: "Smart EV Charger" },
  linkedEmbeddedDev: { id: "EMD-2024-0013", code: "EMD-2024-0013" },
  linkedCloudDev: { id: "CLD-2024-0001", code: "CLD-2024-0001" },
  linkedAiDev: { id: "AIMD-2024-0007", code: "AIMD-2024-0007" },
  linkedApiDev: { id: "API-2024-0011", code: "API-2024-0011" },

  iotArchitect: {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul.sharma@magnertia.com",
  },

  // Overview
  businessObjective: "Build a scalable IoT platform for monitoring and managing EV charging stations across regions.",
  iotUseCase: "Smart EV Charging",
  deploymentEnvironment: "Production",
  targetDevices: ["EV Charger", "Gateway", "Energy Meter", "+2"],
  businessOutcome: "Improve operational efficiency, reduce downtime and provide real-time analytics.",
  developmentStatus: "In Progress",

  // Device & Hardware Config
  deviceType: "Smart Charger",
  controllerPlatform: "ESP32",
  sensors: ["Temperature", "Voltage", "Current", "Energy Meter", "+2"],
  actuators: ["Relay", "Contactor", "LED Indicator"],
  gatewayType: "Industrial Gateway",
  deviceFirmwareVersion: "1.3.5",
  hardwareScore: 89,

  // Connectivity & Communication
  communicationProtocols: ["MQTT", "HTTPS", "Modbus", "Wi-Fi"],
  networkTechnology: "4G / LTE",
  messagingProtocol: "MQTT",
  cloudConnectivity: true,
  edgeComputingEnabled: true,
  offlineSynchronization: true,
  connectivityScore: 92,

  // Device Management Checklist
  deviceMgmtChecklist: [
    { id: "dm-1", label: "Device Registration", completed: true, sourceStream: "IoT Device Management" },
    { id: "dm-2", label: "Device Authentication (X.509 Certificate)", completed: true, sourceStream: "Security & IAM" },
    { id: "dm-3", label: "OTA Firmware Updates", completed: true, sourceStream: "Firmware Dev" },
    { id: "dm-4", label: "Remote Configuration", completed: true, sourceStream: "Cloud Services" },
    { id: "dm-5", label: "Device Health Monitoring", completed: true, sourceStream: "Analytics Engine" },
    { id: "dm-6", label: "Asset Tracking", completed: true, sourceStream: "Asset Registry" },
  ],
  deviceMgmtScore: 90,

  // Data Collection & Analytics Checklist
  dataCollectionChecklist: [
    { id: "dc-1", label: "Telemetry Collection", completed: true, sourceStream: "Telemetry Pipeline" },
    { id: "dc-2", label: "Event Streaming", completed: true, sourceStream: "Event Bus" },
    { id: "dc-3", label: "Real-Time Analytics", completed: true, sourceStream: "Stream Analytics" },
    { id: "dc-4", label: "Digital Twin Integration", completed: true, sourceStream: "Digital Twin Engine" },
  ],
  dataStoragePlatform: "Azure IoT Hub",
  dataRetentionPolicy: "365 Days",
  analyticsScore: 91,

  // Security & Compliance
  deviceIdentity: "X.509 Certificate",
  encryptionStandard: "TLS 1.3",
  secureBoot: true,
  certificateManagement: "AWS IoT CA",
  complianceStandards: ["ISO 27001", "IEC 62443", "GDPR"],
  vulnerabilityAssessment: "Completed",
  securityScore: 90,

  // Integration & Automation Checklist
  integrationChecklist: [
    { id: "ig-1", label: "ERP Integration", completed: true, sourceStream: "Core ERP" },
    { id: "ig-2", label: "API Integration", completed: true, sourceStream: "API Gateway" },
    { id: "ig-3", label: "AI Integration", completed: true, sourceStream: "AI Model Dev" },
    { id: "ig-4", label: "Notification Service", completed: true, sourceStream: "Notification Engine" },
    { id: "ig-5", label: "Workflow Automation", completed: true, sourceStream: "Process Automation" },
    { id: "ig-6", label: "Third-Party Integration", completed: true, sourceStream: "Partner APIs" },
  ],
  integrationScore: 93,

  // Deployment & Operations
  deploymentStrategy: "Hybrid",
  edgeDeployment: true,
  cloudDeployment: true,
  monitoringPlatform: "Grafana + Prometheus",
  alertManagement: "Email, SMS, Push",
  operationalStatus: "Operating",
  deploymentScore: 92,

  // AI Assessment
  aiConnectivityScore: 92,
  aiSecurityAssessment: 91,
  aiPerformanceAnalysis: 93,
  aiPredictiveMaintenance: 94,
  aiDeviceHealthReview: 91,
  aiOptimizationSuggestions: "Available",
  aiOverallIotScore: 92,

  // Summary & Gauges
  overallIotSolutionScore: 91,
  recommendation: "Proceed to Production",

  // Attachments
  attachments: [
    { id: "att-1", name: "device_architecture.pdf", size: "2.4 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Architecture" },
    { id: "att-2", name: "api_documentation.pdf", size: "1.6 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "API" },
    { id: "att-3", name: "network_topology.pdf", size: "1.8 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Network" },
    { id: "att-4", name: "security_assessment.pdf", size: "2.0 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Security" },
    { id: "att-5", name: "sensor_configuration.xlsx", size: "1.2 MB", type: "xlsx", uploadDate: "18 Jun 2024", category: "Hardware" },
    { id: "att-6", name: "deployment_guide.pdf", size: "1.9 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Deployment" },
    { id: "att-7", name: "firmware_documentation.pdf", size: "2.1 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Firmware" },
    { id: "att-8", name: "device_test_report.pdf", size: "1.5 MB", type: "pdf", uploadDate: "18 Jun 2024", category: "Testing" },
  ],

  // Reviewers Table
  reviewers: [
    { id: "rev-1", role: "IoT Architect", person: "Rahul Sharma", decision: "Approved", date: "20 Jun 2024", comments: "Looks Good", status: "Completed", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-2", role: "Embedded Engineer", person: "Neha Verma", decision: "Approved", date: "20 Jun 2024", comments: "Device OK", status: "Completed", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-3", role: "Cloud Architect", person: "Vikram Singh", decision: "Approved", date: "20 Jun 2024", comments: "Scalable", status: "Completed", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-4", role: "AI Engineer", person: "Ananya Iyer", decision: "Approved", date: "20 Jun 2024", comments: "AI Model Ready", status: "Completed", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-5", role: "Security Engineer", person: "Rohit Nair", decision: "Approved with Conditions", date: "20 Jun 2024", comments: "Minor Issues", status: "Completed", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-6", role: "Product Manager", person: "Pooja Mehta", decision: "Pending", date: "-", comments: "Pending Review", status: "Pending", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { id: "rev-7", role: "CTO", person: "Dr. Anil Patel", decision: "Pending", date: "-", comments: "Pending Review", status: "Pending", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
  ],
  approvalDecision: "Approved with Conditions",
  reviewComments: "Overall solution is good. Please address the minor security recommendations.",
  approvalDate: "20 Jun 2024",

  // System Information
  createdBy: "Rahul Sharma",
  createdDate: "18 Jun 2024 10:15 AM",
  lastModifiedBy: "Rahul Sharma",
  lastModifiedDate: "20 Jun 2024 04:25 PM",
  workflowStageLabel: "IoT Review",

  iotTimeline: [
    { id: "ms-1", title: "Review & Production Deployment", date: "20 Jun 2024 04:25 PM", completed: true, stageNumber: 4 },
    { id: "ms-2", title: "Telemetry & Analytics Active", date: "19 Jun 2024 02:15 PM", completed: true, stageNumber: 3 },
    { id: "ms-3", title: "Device Registration & Gateway Integration", date: "19 Jun 2024 10:30 AM", completed: true, stageNumber: 2 },
    { id: "ms-4", title: "Device & Connectivity Architecture Design", date: "18 Jun 2024 10:15 AM", completed: true, stageNumber: 1 },
  ],

  auditTrail: [
    { id: "aud-1", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", action: "IoT Project Created", details: "Project IOTD-2024-0009 created for Smart EV Charging Network.", ipAddress: "192.168.1.42" },
    { id: "aud-2", timestamp: "19 Jun 2024 10:30 AM", user: "Neha Verma", action: "Device X.509 Identity Registered", details: "Registered 1,000 ESP32 device identities with AWS IoT CA.", ipAddress: "192.168.1.55" },
    { id: "aud-3", timestamp: "19 Jun 2024 02:15 PM", user: "Ananya Iyer", action: "Telemetry Pipeline Enabled", details: "Azure IoT Hub telemetry streaming & AI predictive maintenance connected.", ipAddress: "192.168.1.88" },
    { id: "aud-4", timestamp: "20 Jun 2024 04:25 PM", user: "Rohit Nair", action: "Security Verification", details: "Recorded Approved with Conditions decision pending minor TLS certificate update.", ipAddress: "192.168.1.99" },
  ],
};

let memoryIotStore: IotRecord = { ...DEFAULT_IOT_RECORD };

export const getIotFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: memoryIotStore };
});

export const saveIotDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<IotFormInput> }) => data)
  .handler(async ({ data }) => {
    const updated = {
      ...memoryIotStore,
      ...data.input,
      lastModifiedDate: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      lastUpdated: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    memoryIotStore = updated;
    return { success: true, data: memoryIotStore };
  });

export const submitIotFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async () => {
    const updated: IotRecord = {
      ...memoryIotStore,
      workflowStatus: "In Review",
      stage: 4,
      workflowStageLabel: "Review & Production Deployment (Stage 4)",
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Rahul Sharma",
          action: "Submitted IoT Solution for Production Deployment Review",
          details: "IoT Solution submitted to Architecture Review Board for Production authorization.",
        },
        ...memoryIotStore.auditTrail,
      ],
    };
    memoryIotStore = updated;
    return { success: true, data: memoryIotStore };
  });

export const reviewIotFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: IotApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    let nextStatus: IotStatus = "In Review";
    let nextStage: 1 | 2 | 3 | 4 = memoryIotStore.stage;
    let nextStageLabel = memoryIotStore.workflowStageLabel;

    if (data.decision === "Approved") {
      nextStatus = "Production";
      nextStage = 4;
      nextStageLabel = "Live Production Monitoring Active";
    } else if (data.decision === "Approved with Conditions") {
      nextStatus = "Approved with Conditions";
      nextStage = 4;
      nextStageLabel = "Approved with Minor Security Conditions";
    } else if (data.decision === "Revision Required") {
      nextStatus = "Revision Required";
      nextStage = 2;
      nextStageLabel = "Device Architecture Revision Required";
    } else if (data.decision === "Rejected") {
      nextStatus = "Rejected";
      nextStage = 4;
      nextStageLabel = "Closed & Archived";
    }

    const newReviewers = memoryIotStore.reviewers.map((rev) => {
      if (rev.role === "IoT Architect" || rev.role === "CTO" || rev.role === "Security Engineer") {
        return {
          ...rev,
          decision: data.decision,
          comments: data.comments || rev.comments,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: "Completed" as const,
        };
      }
      return rev;
    });

    const updated: IotRecord = {
      ...memoryIotStore,
      workflowStatus: nextStatus,
      stage: nextStage,
      workflowStageLabel: nextStageLabel,
      approvalDecision: data.decision,
      reviewComments: data.comments || memoryIotStore.reviewComments,
      approvalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      reviewers: newReviewers,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Rahul Sharma",
          action: `Architecture Decision: ${data.decision}`,
          details: `IoT Architecture Review Board recorded '${data.decision}' decision. Production Status: ${data.decision === "Approved" ? "PRODUCTION LIVE" : "IN REVIEW"}`,
        },
        ...memoryIotStore.auditTrail,
      ],
    };

    memoryIotStore = updated;
    return { success: true, data: memoryIotStore };
  });

export const advanceIotStageFn = createServerFn({ method: "POST" })
  .validator((data: { targetStage: 1 | 2 | 3 | 4 }) => data)
  .handler(async ({ data }) => {
    let nextStatus: IotStatus = memoryIotStore.workflowStatus;
    let stageLabel = "Device & Connectivity Design";
    if (data.targetStage === 1) {
      nextStatus = "Device & Connectivity Design";
      stageLabel = "Device & Connectivity Design (Stage 1)";
    } else if (data.targetStage === 2) {
      nextStatus = "Device Registration & Integration";
      stageLabel = "Device Registration & Integration (Stage 2)";
    } else if (data.targetStage === 3) {
      nextStatus = "Telemetry & Analytics";
      stageLabel = "Telemetry & Analytics (Stage 3)";
    } else if (data.targetStage === 4) {
      nextStatus = "In Review";
      stageLabel = "Review & Production Deployment (Stage 4)";
    }

    const updated: IotRecord = {
      ...memoryIotStore,
      stage: data.targetStage,
      workflowStatus: nextStatus,
      workflowStageLabel: stageLabel,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-GB"),
          user: "Rahul Sharma",
          action: `Advanced to Stage ${data.targetStage}`,
          details: `IoT workflow stage set to Stage ${data.targetStage}: ${stageLabel}`,
        },
        ...memoryIotStore.auditTrail,
      ],
    };
    memoryIotStore = updated;
    return { success: true, data: memoryIotStore };
  });

export const toggleIotChecklistFn = createServerFn({ method: "POST" })
  .validator((data: { section: "deviceMgmt" | "dataCollection" | "integration"; itemId: string }) => data)
  .handler(async ({ data }) => {
    let dmList = [...memoryIotStore.deviceMgmtChecklist];
    let dcList = [...memoryIotStore.dataCollectionChecklist];
    let igList = [...memoryIotStore.integrationChecklist];

    if (data.section === "deviceMgmt") {
      dmList = dmList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    } else if (data.section === "dataCollection") {
      dcList = dcList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    } else if (data.section === "integration") {
      igList = igList.map((item) => (item.id === data.itemId ? { ...item, completed: !item.completed } : item));
    }

    const dmScore = Math.round((dmList.filter((c) => c.completed).length / dmList.length) * 100);
    const dcScore = Math.round((dcList.filter((c) => c.completed).length / dcList.length) * 100);
    const igScore = Math.round((igList.filter((c) => c.completed).length / igList.length) * 100);

    const overallScore = Math.round(
      memoryIotStore.hardwareScore * 0.2 +
        memoryIotStore.connectivityScore * 0.25 +
        memoryIotStore.securityScore * 0.25 +
        memoryIotStore.deploymentScore * 0.15 +
        memoryIotStore.aiOverallIotScore * 0.15
    );

    const updated: IotRecord = {
      ...memoryIotStore,
      deviceMgmtChecklist: dmList,
      dataCollectionChecklist: dcList,
      integrationChecklist: igList,
      deviceMgmtScore: dmScore,
      analyticsScore: dcScore,
      integrationScore: igScore,
      overallIotSolutionScore: overallScore,
    };

    memoryIotStore = updated;
    return { success: true, data: memoryIotStore };
  });
