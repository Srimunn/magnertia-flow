import { createServerFn } from "@tanstack/react-start";
import type {
  ProductArchitectureApprovalDecision,
  ProductArchitectureFormInput,
  ProductArchitectureRecord,
  ProductArchitectureStage,
  ProductArchitectureStatus,
} from "@/services/types";

/* ===========================================================================
   Product Architecture — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Product Architecture lifecycle:
     Stage 1: Architecture Definition (Vision, boundaries, principles, AI readiness)
     Stage 2: HW & SW Architecture (Controllers, sensors, firmware, APIs, AI optimization)
     Stage 3: Security & Integration (Cybersecurity, risk score, reliability, AI risk)
     Stage 4: Executive Review (Decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates / links downstream System Design project (e.g. SYS-2024-0092)
       and surfaces its ID to proceed to Detailed Engineering Design.
   =========================================================================== */

export function calculateProductArchitectureScores(input: Partial<ProductArchitectureFormInput>) {
  // 1. Functional Coverage (0-100)
  const componentsCount = input.systemComponents ? input.systemComponents.split(",").length : 4;
  const functionalCoverage = Math.min(100, Math.max(70, Math.round(72 + componentsCount * 4)));

  // 2. Technical Readiness (0-100)
  const hwSwPresent = (input.hardwarePlatform ? 15 : 0) + (input.softwarePlatform ? 15 : 0) + (input.processingUnit ? 10 : 0);
  const technicalReadiness = Math.min(100, Math.max(70, Math.round(55 + hwSwPresent * 0.7)));

  // 3. Security Readiness (0-100)
  const securityRiskScore = input.securityRiskScore ?? 92;
  const securityReadiness = Math.min(100, Math.max(65, Math.round(securityRiskScore * 0.95 + 4)));

  // 4. Integration Readiness (0-100)
  const protocolsCount = input.communicationProtocols?.length || 4;
  const standardsCount = input.standardsCompliance?.length || 4;
  const integrationReadiness = Math.min(100, Math.max(68, Math.round(60 + protocolsCount * 3.5 + standardsCount * 3)));

  // 5. Performance Score (0-100)
  const performanceScore = input.performanceScore ?? 88;

  // Overall Architecture Score (/100)
  const overallArchitectureScore = Math.round(
    functionalCoverage * 0.25 +
      technicalReadiness * 0.25 +
      securityReadiness * 0.2 +
      integrationReadiness * 0.15 +
      performanceScore * 0.15
  );

  // AI Quality Sub-scores
  const aiArchitectureQuality = Math.min(99, Math.max(75, Math.round(overallArchitectureScore * 0.98 + 3)));
  const aiScalabilityScore = Math.min(98, Math.max(72, Math.round(overallArchitectureScore * 0.96 + 3)));
  const aiSecurityAssessment = Math.min(99, Math.max(78, Math.round(securityReadiness * 0.98 + 2)));
  const aiOverallArchitectureScore = Math.round(
    aiArchitectureQuality * 0.4 + aiScalabilityScore * 0.3 + aiSecurityAssessment * 0.3
  );

  // Derived Key Highlights Checklist (dynamic from input data)
  const highlights: string[] = [];

  if (input.architectureStyle) {
    highlights.push(`${input.architectureStyle} based scalable architecture`);
  } else {
    highlights.push("Microservices based scalable architecture");
  }

  if (input.edgeComputing) {
    highlights.push("Edge + Cloud hybrid deployment");
  } else if (input.cloudIntegration) {
    highlights.push(`Cloud integrated with ${input.cloudIntegration.split(",")[0] || "AWS IoT"}`);
  } else {
    highlights.push("Edge + Cloud hybrid deployment");
  }

  if (input.standardsCompliance && input.standardsCompliance.length > 0) {
    highlights.push(`Compliant with ${input.standardsCompliance.slice(0, 2).join(", ")}`);
  } else {
    highlights.push("Compliant with IEC 61851, OCPP 1.6J");
  }

  if (input.securityArchitecture || input.encryptionStandard) {
    highlights.push(
      `${input.securityArchitecture || "Security by Design"} with ${input.encryptionStandard || "end-to-end encryption"}`
    );
  } else {
    highlights.push("Security by Design with end-to-end encryption");
  }

  return {
    summary: {
      overallArchitectureScore,
      functionalCoverage,
      technicalReadiness,
      securityReadiness,
      integrationReadiness,
      performanceScore,
    },
    aiAssessment: {
      aiOverallArchitectureScore,
      aiArchitectureQuality,
      aiScalabilityScore,
      aiSecurityAssessment,
      aiTechnologyRecommendation: input.aiAssessment?.aiTechnologyRecommendation || "Use Edge AI for Anomaly Detection",
      aiIntegrationAssessment: input.aiAssessment?.aiIntegrationAssessment || "Seamless with Cloud & ERP",
      aiRiskAnalysis: input.aiAssessment?.aiRiskAnalysis || "Low Risk",
    },
    keyHighlights: highlights,
  };
}

const INITIAL_INPUT: ProductArchitectureFormInput = {
  architectureName: "Smart EV Charger Architecture",
  architectureVersion: "v1.0",
  businessUnit: "Smart Mobility Division",
  systemArchitectId: "usr-101",
  systemArchitectName: "Rohit Verma",
  systemArchitectAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",

  // Panel 1: Product Architecture Overview
  productName: "Smart EV Charger Pro",
  architectureVision: "Build a safe, intelligent, connected and scalable EV charging platform with high reliability and efficiency.",
  architectureObjective: "Create a modular architecture that enables smart charging, remote management, and future scalability.",
  architectureScope: "AC & DC charging, Payment, User Management, Monitoring, Analytics, OTA Updates.",
  designPrinciples: ["Modularity", "Scalability", "Security by Design", "Reliability", "High Performance", "Future Ready"],
  architectureStyle: "Microservices Architecture",
  overallDiagramName: "Overall_Architecture_v1.0.png",
  overallDiagramSize: "2.4 MB",

  // Panel 2: System Architecture
  systemName: "Smart EV Charging System",
  systemComponents: "Charging Unit, Control Unit, Communication Unit, User Interface, Cloud Platform",
  subsystems: "Power Subsystem, Control Subsystem, Communication Subsystem, User Subsystem, Safety Subsystem",
  functionalBlocks: "EV Interface, Power Conversion, Control & Monitoring, Communications, Payment, Analytics",
  externalInterfaces: "OCPP 1.6J, Payment Gateway, Grid Gateway",
  internalInterfaces: "CAN, UART, SPI, I2C, Ethernet, Wi-Fi",
  architectureStatusBadge: "Defined",
  systemDiagramUrl: "/diagrams/system_architecture.png",

  // Panel 3: Hardware Architecture
  hardwarePlatform: "ARM Cortex Based Controller",
  processingUnit: "STM32H7 Series MCU",
  sensors: ["Current Sensor", "Voltage Sensor", "Temp Sensor"],
  actuators: ["Relay", "Contactor", "Cooling Fan"],
  powerElectronics: "AC-DC PFC, DC-DC, Isolated Power Module",
  communicationInterfaces: ["Ethernet", "Wi-Fi", "4G LTE", "CAN", "RS485"],
  hardwareConstraints: "Operating Temp: -20°C to 70°C, IP65, EMI/EMC Compliant",

  // Panel 4: Software Architecture
  softwarePlatform: "Embedded Linux",
  operatingSystem: "Yocto Linux",
  firmwareComponents: "Bootloader, Device Drivers, BSP, RTOS",
  middleware: "Mosquitto MQTT, Nginx, Node-RED",
  applicationModules: "Charging Control, User Management, Payment, Monitoring, Analytics, OTA Topics",
  apisAndServices: "RESTful APIs, WebSocket, MQTT Topics",
  softwareConstraints: "Memory: 512MB, Storage: 8GB, Real-time Control",

  // Panel 5: Data & Communication Architecture
  dataFlow: "Device -> Edge -> Cloud -> Analytics -> App",
  dataSources: "Charger, EV, User App, Payment Gateway, Sensors",
  databaseTechnology: "PostgreSQL (Cloud)",
  communicationProtocols: ["OCPP 1.6J", "MQTT", "HTTPS", "WebSocket"],
  cloudIntegration: "AWS IoT Core, AWS Lambda, S3, RDS, CloudWatch",
  edgeComputing: true,
  dataSecurity: "TLS 1.3, AES-256, Secure Boot, Data Encryption",

  // Panel 6: Integration & Interoperability
  externalSystems: "EV, Payment Gateway, Utility, Fleet System",
  erpIntegration: "Magnertia ERP, CRM, Billing, Inventory",
  apiGateway: "Kong API Gateway",
  thirdPartyServices: "Stripe, Twilio, Google Maps, Email Service",
  standardsCompliance: ["IEC 61851", "ISO 15118", "OCPP 1.6J", "RoHS"],
  integrationRisks: "Network dependency, 3rd party API downtime",
  integrationStrategy: "Loose coupling, API-first, Event-driven",

  // Panel 7: Security & Compliance Architecture
  securityArchitecture: "Defense in Depth",
  authenticationMethod: "OAuth 2.0 + JWT",
  authorizationModel: "Role-Based Access Control (RBAC)",
  encryptionStandard: "AES-256 + TLS 1.3",
  regulatoryCompliance: ["IEC 61851", "ISO 27001", "GDPR"],
  cybersecurityControls: "Secure Boot, Firewall, IDS/IPS, OTA Signed Updates, Penetration Testing",
  securityRiskScore: 92,

  // Panel 8: Scalability & Performance
  expectedUsersDevices: "100,000+ Users / 50,000+ Chargers",
  throughput: "10,000 Messages / Sec",
  latencyTarget: "< 200 ms",
  availabilityTarget: "99.95 %",
  scalabilityStrategy: "Microservices, Auto Scaling, Load Balancer",
  disasterRecoveryPlan: "Multi-AZ Deployment, Daily Backup, Failover",
  performanceScore: 88,

  // Panel 9: AI Architecture Assessment
  aiAssessment: {
    aiOverallArchitectureScore: 89,
    aiArchitectureQuality: 89,
    aiScalabilityScore: 87,
    aiSecurityAssessment: 90,
    aiTechnologyRecommendation: "Use Edge AI for Anomaly Detection",
    aiIntegrationAssessment: "Seamless with Cloud & ERP",
    aiRiskAnalysis: "Low Risk",
  },

  // Panel 10: Attachments
  attachments: [
    { id: "att-1", name: "Architecture_Diagram.png", size: "2.4 MB", type: "png", uploadedAt: "18 Jun 2024" },
    { id: "att-2", name: "Hardware_Architecture.pdf", size: "2.1 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-3", name: "Block_Diagram.pdf", size: "1.8 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-4", name: "Software_Architecture.pdf", size: "3.3 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-5", name: "ICD_Document.pdf", size: "1.2 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-6", name: "Network_Diagram.png", size: "1.5 MB", type: "png", uploadedAt: "18 Jun 2024" },
    { id: "att-7", name: "Data_Flow_Diagram.pdf", size: "1.6 MB", type: "pdf", uploadedAt: "18 Jun 2024" },
    { id: "att-8", name: "Compliance_Documents.zip", size: "3.4 MB", type: "zip", uploadedAt: "18 Jun 2024" },
  ],

  // Panel 11: Review & Approval
  reviewers: [
    { id: "rev-1", role: "System Architect", person: "Rohit Verma", decision: "Approved", status: "Approved", date: "18 Jun 2024" },
    { id: "rev-2", role: "Product Owner", person: "Neha Sharma", decision: "Approved", status: "Approved", date: "18 Jun 2024" },
    { id: "rev-3", role: "Engineering Manager", person: "Vikram Singh", decision: "Approved", status: "Approved", date: "19 Jun 2024" },
    { id: "rev-4", role: "Security Lead", person: "Priya Nair", decision: "Pending", status: "Pending", date: "-" },
    { id: "rev-5", role: "QA Manager", person: "Arun Nair", decision: "Pending", status: "Pending", date: "-" },
    { id: "rev-6", role: "CTO", person: "Dr. Anil Patel", decision: "Pending", status: "Pending", date: "-" },
  ],
  approvalDecision: null,
  reviewComments: "",
  approvalDate: new Date().toISOString().split("T")[0],
};

let currentRecord: ProductArchitectureRecord = {
  id: "pa-rec-0017",
  architectureId: "PA-2024-0017",
  formCode: "PA-2024-25",
  architectureName: INITIAL_INPUT.architectureName,
  architectureVersion: INITIAL_INPUT.architectureVersion,
  status: "Under Review",
  currentStage: "executive_review",
  currentStageLabel: "Architecture Review",
  createdOn: "20 Apr 2024 10:15 AM",

  linkedPrdId: "PRD-2024-0017",
  linkedPrdTitle: "Smart EV Charger Pro PRD",
  linkedProductId: "prd-1001",
  linkedProductName: "Smart EV Charger Pro",
  linkedRoadmapId: "PRM-2024-0017",
  linkedRoadmapName: "EV Charger Roadmap 2024-27",

  businessUnit: INITIAL_INPUT.businessUnit,
  systemArchitectId: INITIAL_INPUT.systemArchitectId,
  systemArchitectName: INITIAL_INPUT.systemArchitectName,
  systemArchitectAvatar: INITIAL_INPUT.systemArchitectAvatar || "",
  lastUpdated: "18 Jun 2024 04:25 PM",

  dateCreated: "20 Apr 2024 10:15 AM",
  lastModified: "18 Jun 2024 04:25 PM",
  version: "v1.0",

  stages: [
    { stage: "architecture_definition", label: "Stage 1: Architecture Definition", completed: true, active: false, completedAt: "25 Apr 2024" },
    { stage: "hardware_software_architecture", label: "Stage 2: HW & SW Architecture", completed: true, active: false, completedAt: "10 May 2024" },
    { stage: "security_integration", label: "Stage 3: Security & Integration", completed: true, active: false, completedAt: "01 Jun 2024" },
    { stage: "executive_review", label: "Stage 4: Executive Review", completed: false, active: true },
  ],

  input: INITIAL_INPUT,
  ...calculateProductArchitectureScores(INITIAL_INPUT),

  linkedSystemDesignId: null,

  auditTrail: [
    { id: "aud-1", timestamp: "20 Apr 2024 10:15 AM", user: "Rohit Verma", action: "Record Created", details: "Architecture record created from approved PRD-2024-0017." },
    { id: "aud-2", timestamp: "25 Apr 2024 02:30 PM", user: "Rohit Verma", action: "Stage 1 Completed", details: "Architecture definition and principles finalized. AI Readiness score computed." },
    { id: "aud-3", timestamp: "10 May 2024 11:15 AM", user: "Rohit Verma", action: "Stage 2 Completed", details: "Hardware and Software architecture modules validated." },
    { id: "aud-4", timestamp: "01 Jun 2024 05:00 PM", user: "Priya Nair", action: "Stage 3 Completed", details: "Cybersecurity controls and risk scores verified." },
    { id: "aud-5", timestamp: "18 Jun 2024 04:25 PM", user: "Rohit Verma", action: "Submitted for Review", details: "Product Architecture submitted to Executive Architecture Review Board." },
  ],
};

// 1. Get Record
export const getProductArchitectureFn = createServerFn({ method: "GET" }).handler(async () => {
  return { success: true, data: currentRecord };
});

// 2. Save Draft
export const saveProductArchitectureDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: ProductArchitectureFormInput }) => data)
  .handler(async ({ data }) => {
    const scores = calculateProductArchitectureScores(data.input);
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    currentRecord = {
      ...currentRecord,
      architectureName: data.input.architectureName || currentRecord.architectureName,
      architectureVersion: data.input.architectureVersion || currentRecord.architectureVersion,
      businessUnit: data.input.businessUnit || currentRecord.businessUnit,
      systemArchitectName: data.input.systemArchitectName || currentRecord.systemArchitectName,
      lastUpdated: now,
      lastModified: now,
      input: data.input,
      ...scores,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: data.input.systemArchitectName || "Rohit Verma",
          action: "Saved Draft",
          details: "Architecture specification draft saved.",
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 3. Advance Stage
export const advanceProductArchitectureStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: ProductArchitectureStage }) => data)
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    let statusLabel: ProductArchitectureStatus = "Architecture Definition";
    let stageLabel = "Stage 1: Architecture Definition";

    if (data.targetStage === "hardware_software_architecture") {
      statusLabel = "HW & SW Architecture";
      stageLabel = "Stage 2: HW & SW Architecture";
    } else if (data.targetStage === "security_integration") {
      statusLabel = "Security & Integration";
      stageLabel = "Stage 3: Security & Integration";
    } else if (data.targetStage === "executive_review") {
      statusLabel = "Under Review";
      stageLabel = "Stage 4: Executive Review";
    }

    const updatedStages = currentRecord.stages.map((s) => {
      if (s.stage === data.targetStage) {
        return { ...s, active: true, completed: false };
      }
      return { ...s, active: false };
    });

    currentRecord = {
      ...currentRecord,
      status: statusLabel,
      currentStage: data.targetStage,
      currentStageLabel: stageLabel,
      lastUpdated: now,
      lastModified: now,
      stages: updatedStages,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: currentRecord.systemArchitectName,
          action: "Stage Advanced",
          details: `Advanced workflow stage to ${stageLabel}.`,
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 4. Submit for Review
export const submitProductArchitectureFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async () => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    currentRecord = {
      ...currentRecord,
      status: "Under Review",
      currentStage: "executive_review",
      currentStageLabel: "Architecture Review Board",
      lastUpdated: now,
      lastModified: now,
      stages: currentRecord.stages.map((s) =>
        s.stage === "executive_review" ? { ...s, active: true, completed: false } : { ...s, active: false, completed: true }
      ),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: currentRecord.systemArchitectName,
          action: "Submitted for Review",
          details: "Architecture record submitted to Executive Board for final approval decision.",
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });

// 5. Review Decision & System Design Hand-off
export const reviewProductArchitectureFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: ProductArchitectureApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    let newStatus: ProductArchitectureStatus = "Under Review";
    let systemDesignId: string | null = currentRecord.linkedSystemDesignId || null;

    if (data.decision === "approved") {
      newStatus = "Approved";
      // Auto-create / link downstream System Design project as specified in sequence diagram
      if (!systemDesignId) {
        systemDesignId = "SYS-2024-0092";
      }
    } else if (data.decision === "approved_with_conditions") {
      newStatus = "Approved with Conditions";
    } else if (data.decision === "revision_required") {
      newStatus = "Revision Required";
    } else if (data.decision === "rejected") {
      newStatus = "Rejected";
    }

    const updatedReviewers = currentRecord.input.reviewers.map((r) => {
      if (r.role === "CTO" || r.role === "System Architect") {
        return {
          ...r,
          decision:
            data.decision === "approved"
              ? ("Approved" as const)
              : data.decision === "revision_required"
              ? ("Revision Required" as const)
              : data.decision === "rejected"
              ? ("Rejected" as const)
              : ("Approved" as const),
          status: "Completed",
          date: now.split(" ")[0],
        };
      }
      return r;
    });

    currentRecord = {
      ...currentRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: now.split(" ")[0],
      reviewComments: data.comments || currentRecord.reviewComments,
      linkedSystemDesignId: systemDesignId,
      lastUpdated: now,
      lastModified: now,
      input: {
        ...currentRecord.input,
        reviewers: updatedReviewers,
        approvalDecision: data.decision,
        reviewComments: data.comments || currentRecord.input.reviewComments,
        approvalDate: now.split(" ")[0],
      },
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: "Executive Review Board",
          action: `Decision: ${newStatus}`,
          details:
            data.decision === "approved"
              ? `Product Architecture approved. System Design project ${systemDesignId} created and linked.`
              : `Review decision rendered: ${newStatus}. Comments: ${data.comments || "None"}.`,
        },
        ...currentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentRecord };
  });
