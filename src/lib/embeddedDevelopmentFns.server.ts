import { createServerFn } from "@tanstack/react-start";
import type {
  EmbeddedDevelopmentApprovalDecision,
  EmbeddedDevelopmentFormInput,
  EmbeddedDevelopmentRecord,
  EmbeddedDevelopmentStage,
  EmbeddedDevelopmentStatus,
} from "@/services/types";

/* ===========================================================================
   Embedded Systems Development — Server Functions & Workflow Engine
   ---------------------------------------------------------------------------
   Manages the 4-stage Embedded Systems Development lifecycle:
     Stage 1: Platform Configuration (MCU/SoC setup, BSP, bootloader, RTOS & task scheduling)
     Stage 2: Firmware Development (device drivers, middleware, application modules & code commit)
     Stage 3: Testing & Validation (automated build, static analysis, unit/integration & HIL testing)
     Stage 4: Engineering Review (Review Board decision: Approved / Approved with Conditions / Revision Required / Rejected)

   Upon 'Approved' decision:
     - Auto-creates & links downstream System Integration project (SI-2024-0089)
       and surfaces its ID to proceed to System Integration.
   =========================================================================== */

export function calculateEmbeddedDevelopmentScores(input: Partial<EmbeddedDevelopmentFormInput>) {
  // 1. Firmware Readiness (0-100)
  const firmwareReadiness = 88;

  // 2. Hardware Compatibility (0-100)
  const hardwareCompatibility = 90;

  // 3. Performance Score (0-100)
  const performanceScore = 87;

  // 4. Security Score (0-100)
  const securityScore = input.securityReadinessScore ?? 90;

  // Overall Embedded Score (/100)
  const overallEmbeddedScore = Math.round(
    firmwareReadiness * 0.25 +
      hardwareCompatibility * 0.25 +
      performanceScore * 0.25 +
      securityScore * 0.25
  );

  // AI Assessment Sub-scores (single source of truth with Panel 9)
  const aiFirmwareQualityScore = Math.min(99, Math.max(75, Math.round(overallEmbeddedScore * 1.02)));
  const aiCodeOptimization = 88;
  const aiMemoryOptimization = 89;
  const aiTimingAnalysis = 87;
  const aiOverallEmbeddedScore = overallEmbeddedScore;

  // Key Highlights dynamic list
  const highlights: string[] = [];
  highlights.push("Optimized task scheduling improves CPU utilization by 12%");
  highlights.push("Memory usage optimized, 18% more free SRAM");
  highlights.push("MISRA-C compliance score: 96%");
  highlights.push("Security enhanced with Secure Boot and Encryption");
  highlights.push("All critical modules passed HIL testing");

  return {
    summary: {
      overallEmbeddedScore,
      firmwareReadiness,
      hardwareCompatibility,
      performanceScore,
      securityScore,
      recommendation: "Proceed to Firmware Development",
    },
    aiAssessment: {
      aiOverallEmbeddedScore,
      aiFirmwareQualityScore,
      aiCodeOptimization,
      aiMemoryOptimization,
      aiTimingAnalysis,
    },
    keyHighlights: highlights,
  };
}

const DEFAULT_EMBEDDED_DEVELOPMENT_INPUT: EmbeddedDevelopmentFormInput = {
  // Panel 1: Embedded System Overview
  productName: "Smart EV Charger",
  embeddedSystemName: "Smart EV Charger Main Embedded Controller",
  developmentObjective:
    "Develop real-time, deterministic, secure embedded firmware & RTOS framework for Smart EV Charger controller.",
  firmwareScope:
    "Board Support Package (BSP), FreeRTOS kernel, CAN/Ethernet drivers, energy metering, safety state machine, and OTA engine.",
  applicableStandards: ["IEC 61851", "ISO 26262", "MISRA C", "AUTOSAR"],
  developmentMethodology: "RTOS-Based Development",
  developmentStatus: "In Progress",
  hardwareBoardImageUrl:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",

  // Panel 2: Hardware Platform
  microcontrollerSoc: "STM32H753BIT6 / ARM Cortex-M7",
  cpuArchitecture: "32-bit RISC ARMv7E-M",
  clockFrequency: "480 MHz",
  flashMemory: "2 MB On-Chip Flash",
  sram: "1 MB AXISRAM + 128 KB ITCM",
  externalMemory: "16 MB QSPI Flash",
  hardwareStatus: "Verified",
  hardwarePlatformDiagramUrl:
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",

  // Panel 3: Firmware Architecture
  firmwareArchitecture: "Layered Architecture",
  bootloader: "Secure Bootloader (AES-256 Verified)",
  bsp: "STM32H7 HAL / LL Drivers",
  deviceDrivers: "CAN FD, Ethernet MAC, SPI Flash, ADC, PWM, UART",
  middlewareComponents: "FreeRTOS, LwIP TCP/IP, MbedTLS, LittleFS",
  applicationModules: "Charger State Machine, Power Manager, Energy Metering, OTA Client",
  firmwareStatus: "Active",
  layeredArchitectureDiagramUrl:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",

  // Panel 4: RTOS & Task Management
  rtosPlatform: "FreeRTOS v10.4.3",
  numberOfTasks: 12,
  schedulingMethod: "Preemptive Priority-Based",
  taskPriorities: "High (3), Medium (6), Low (3)",
  interruptManagement: "Nested Vectored Interrupt Controller (NVIC)",
  memoryManagement: "Heap_4 (FreeRTOS Dynamic Allocation)",
  rtosStatus: "Running",
  taskDistribution: {
    high: 3,
    medium: 6,
    low: 3,
  },

  // Panel 5: Communication Interfaces
  interfacesList: [
    { name: "UART", checked: true },
    { name: "SPI", checked: true },
    { name: "I²C", checked: true },
    { name: "CAN / CAN FD", checked: true },
    { name: "USB", checked: true },
    { name: "Ethernet", checked: true },
  ],
  wirelessInterfaces: ["BLE", "Wi-Fi", "NFC"],

  // Panel 6: Functional Modules
  functionalModulesList: [
    { name: "Sensor Management", checked: true },
    { name: "Actuator Control", checked: true },
    { name: "Motor Control", checked: true },
    { name: "Power Management", checked: true },
    { name: "Safety Functions", checked: true },
    { name: "Diagnostic Functions", checked: true },
    { name: "OTA Update Support", checked: true },
  ],

  // Panel 7: Cybersecurity & Functional Safety
  secureBoot: "Active (Hardware Root of Trust)",
  firmwareEncryption: "AES-256 / SHA-256",
  secureKeyStorage: "Hardware Cryptographic Element (ATECC608A)",
  watchdogConfiguration: "Independent Watchdog (IWDG) & Window Watchdog (WWDG)",
  functionalSafetyStandards: ["ISO 26262 ASIL-B", "IEC 61508"],
  cybersecurityStandards: ["ISO/SAE 21434", "UNECE WP.29"],
  securityReadinessScore: 90,

  // Panel 8: Firmware Testing & Validation
  testItems: [
    { id: "test-1", name: "Unit Testing", status: "Completed", details: "MISRA-C Rule Checker Passed" },
    { id: "test-2", name: "Integration Testing", status: "Passed", details: "LwIP & CAN Bus Stack Verified" },
    { id: "test-3", name: "Hardware-in-the-Loop (HIL)", status: "Passed", details: "Fault Injection Testing Passed" },
    { id: "test-4", name: "Static Code Analysis", status: "Completed", details: "0 High Severity Defect Warnings" },
  ],
  codeCoverage: 92.4,
  testReportSummary: "480/480 Automated Tests Passed • HIL Verification Completed",
  validationScore: 88,

  // Panel 9 & 10 Initialized dynamically
  aiAssessment: {
    aiOverallEmbeddedScore: 88,
    aiFirmwareQualityScore: 90,
    aiCodeOptimization: 88,
    aiMemoryOptimization: 89,
    aiTimingAnalysis: 87,
  },
  summary: {
    overallEmbeddedScore: 88,
    firmwareReadiness: 88,
    hardwareCompatibility: 90,
    performanceScore: 87,
    securityScore: 90,
    recommendation: "Proceed to Firmware Development",
  },

  // Panel 11: Attachments
  attachments: [
    {
      id: "att-1",
      name: "Firmware_Source_Code.zip",
      typeIcon: "zip",
      size: "42.5 MB",
      category: "Source Code",
      fileType: "application/zip",
      url: "#",
      uploadedAt: "18 Jun 2024",
    },
    {
      id: "att-2",
      name: "System_Architecture_Diagram.pdf",
      typeIcon: "pdf",
      size: "2.1 MB",
      category: "Architecture",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "18 Jun 2024",
    },
    {
      id: "att-3",
      name: "RTOS_Configuration.pdf",
      typeIcon: "pdf",
      size: "1.6 MB",
      category: "RTOS Config",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "19 Jun 2024",
    },
    {
      id: "att-4",
      name: "Driver_Documentation.pdf",
      typeIcon: "pdf",
      size: "3.4 MB",
      category: "Drivers",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "19 Jun 2024",
    },
    {
      id: "att-5",
      name: "HIL_Test_Report.pdf",
      typeIcon: "pdf",
      size: "5.8 MB",
      category: "Test Report",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-6",
      name: "MISRA_Analysis.pdf",
      typeIcon: "pdf",
      size: "2.7 MB",
      category: "Static Analysis",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-7",
      name: "Security_Audit.pdf",
      typeIcon: "pdf",
      size: "4.2 MB",
      category: "Security",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
    {
      id: "att-8",
      name: "OTA_Specification.pdf",
      typeIcon: "pdf",
      size: "1.9 MB",
      category: "Specification",
      fileType: "application/pdf",
      url: "#",
      uploadedAt: "20 Jun 2024",
    },
  ],

  // Panel 12: Review & Approval Table
  reviewers: [
    {
      id: "rev-1",
      role: "Embedded Engineer",
      person: "Kavita Sharma",
      decision: "Approved",
      status: "Approved",
      date: "18 Jun 2024",
    },
    {
      id: "rev-2",
      role: "Electronics Engineer",
      person: "Rohit Nair",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-3",
      role: "Firmware Lead",
      person: "Rajesh Varma",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-4",
      role: "System Architect",
      person: "Suresh Menon",
      decision: "Approved",
      status: "Approved",
      date: "20 Jun 2024",
    },
    {
      id: "rev-5",
      role: "QA Engineer",
      person: "Neha Sharma",
      decision: "Pending",
      status: "Pending",
      date: null,
    },
    {
      id: "rev-6",
      role: "Engineering Manager",
      person: "Arun Kumar",
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

let currentEmbeddedDevelopmentRecord: EmbeddedDevelopmentRecord = {
  id: "emd-rec-2024-0017",
  developmentId: "EMD-2024-0017",
  formCode: "EMF-2024-25",
  developmentProjectName: "Smart EV Charger – Embedded Systems Development",
  firmwareVersion: "v1.0.0",
  status: "Under Review",
  currentStage: "engineering_review",
  currentStageLabel: "Stage 4: Engineering Review",
  createdOn: "18 Jun 2024 10:15 AM",

  linkedElectronicsDesignId: "EN-2024-0017",
  linkedElectronicsDesignTitle: "Smart EV Charger – Electronics Design",
  linkedElectricalDesignId: "ED-2024-0017",
  linkedElectricalDesignTitle: "Smart EV Charger – Electrical Design",
  linkedProductArchitectureId: "PA-2024-0017",
  linkedProductArchitectureTitle: "Smart EV Charger – System Architecture",
  linkedPrdId: "PRD-2024-0017",
  linkedPrdTitle: "Smart EV Charger – Product Requirements Document",
  linkedProductId: "PROD-2024-009",
  linkedProductName: "Smart EV Charger Pro",

  businessUnit: "Smart Mobility Division",
  embeddedEngineerId: "usr-kavita-sharma",
  embeddedEngineerName: "Kavita Sharma",
  embeddedEngineerAvatar:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  lastUpdated: "20 Jun 2024 04:25 PM",

  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  version: "1.0.0",

  stages: [
    {
      id: "platform_configuration",
      label: "Stage 1: Platform Configuration",
      stageNumber: 1,
      status: "completed",
      description: "Configure MCU/SoC, BSP, bootloader, RTOS & task scheduling",
    },
    {
      id: "firmware_development",
      label: "Stage 2: Firmware Development",
      stageNumber: 2,
      status: "completed",
      description: "Develop device drivers, middleware, application modules & version control",
    },
    {
      id: "testing_validation",
      label: "Stage 3: Testing & Validation",
      stageNumber: 3,
      status: "completed",
      description: "Automated build, static analysis, unit/integration & HIL testing",
    },
    {
      id: "engineering_review",
      label: "Stage 4: Engineering Review",
      stageNumber: 4,
      status: "in_progress",
      description: "Review Board approval & downstream System Integration project creation",
    },
  ],

  input: DEFAULT_EMBEDDED_DEVELOPMENT_INPUT,
  ...calculateEmbeddedDevelopmentScores(DEFAULT_EMBEDDED_DEVELOPMENT_INPUT),

  linkedSystemIntegrationId: null,
  approvalDecision: null,
  approvalDate: "2024-06-20",
  reviewComments: "",

  auditTrail: [
    {
      at: "18 Jun 2024 10:15 AM",
      actor: "Kavita Sharma",
      event: "Embedded Systems Development record created from approved Electronics Design EN-2024-0017, ED-2024-0017, PA-2024-0017, PRD-2024-0017",
      stage: "platform_configuration",
      status: "Draft",
    },
    {
      at: "19 Jun 2024 02:30 PM",
      actor: "Kavita Sharma",
      event: "Completed FreeRTOS task configuration and device driver integration",
      stage: "firmware_development",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 11:00 AM",
      actor: "Kavita Sharma",
      event: "Completed HIL automated testing (480/480 passed) and code coverage (92.4%)",
      stage: "testing_validation",
      status: "Draft",
    },
    {
      at: "20 Jun 2024 04:25 PM",
      actor: "Kavita Sharma",
      event: "Submitted Embedded Systems Development for Stage 4 Engineering Review Board",
      stage: "engineering_review",
      status: "Under Review",
    },
  ],
};

/** Get current Embedded Development Record */
export const getEmbeddedDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: EmbeddedDevelopmentRecord }> => {
    return { success: true, data: currentEmbeddedDevelopmentRecord };
  }
);

/** Save Draft */
export const saveEmbeddedDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<EmbeddedDevelopmentFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: EmbeddedDevelopmentRecord }> => {
    const updatedInput = { ...currentEmbeddedDevelopmentRecord.input, ...data.input };
    const scores = calculateEmbeddedDevelopmentScores(updatedInput);

    currentEmbeddedDevelopmentRecord = {
      ...currentEmbeddedDevelopmentRecord,
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
          actor: "Kavita Sharma",
          event: "Saved draft updates to Embedded Systems Development Form",
          stage: currentEmbeddedDevelopmentRecord.currentStage,
          status: currentEmbeddedDevelopmentRecord.status,
        },
        ...currentEmbeddedDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentEmbeddedDevelopmentRecord };
  });

/** Advance Stage */
export const advanceEmbeddedDevelopmentStageFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; targetStage: EmbeddedDevelopmentStage }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: EmbeddedDevelopmentRecord }> => {
    const stageMap: Record<EmbeddedDevelopmentStage, { label: string; stageNumber: number }> = {
      platform_configuration: {
        label: "Stage 1: Platform Configuration",
        stageNumber: 1,
      },
      firmware_development: {
        label: "Stage 2: Firmware Development",
        stageNumber: 2,
      },
      testing_validation: {
        label: "Stage 3: Testing & Validation",
        stageNumber: 3,
      },
      engineering_review: {
        label: "Stage 4: Engineering Review",
        stageNumber: 4,
      },
    };

    const target = stageMap[data.targetStage];

    currentEmbeddedDevelopmentRecord = {
      ...currentEmbeddedDevelopmentRecord,
      currentStage: data.targetStage,
      currentStageLabel: target.label,
      stages: currentEmbeddedDevelopmentRecord.stages.map((stg) => {
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
          actor: "Kavita Sharma",
          event: `Advanced to ${target.label}`,
          stage: data.targetStage,
          status: currentEmbeddedDevelopmentRecord.status,
        },
        ...currentEmbeddedDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentEmbeddedDevelopmentRecord };
  });

/** Submit for Review */
export const submitEmbeddedDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: EmbeddedDevelopmentRecord }> => {
    currentEmbeddedDevelopmentRecord = {
      ...currentEmbeddedDevelopmentRecord,
      status: "Under Review",
      currentStage: "engineering_review",
      currentStageLabel: "Stage 4: Engineering Review",
      stages: currentEmbeddedDevelopmentRecord.stages.map((stg) =>
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
          actor: "Kavita Sharma",
          event: "Submitted Embedded Systems Development for Stage 4 Engineering Review Board",
          stage: "engineering_review",
          status: "Under Review",
        },
        ...currentEmbeddedDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentEmbeddedDevelopmentRecord };
  });

/** Review Board Decision */
export const reviewEmbeddedDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: EmbeddedDevelopmentApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: EmbeddedDevelopmentRecord }> => {
    let newStatus: EmbeddedDevelopmentStatus = "Under Review";
    let linkedSystemIntegrationId: string | null = currentEmbeddedDevelopmentRecord.linkedSystemIntegrationId ?? null;
    let eventMessage = "";

    if (data.decision === "Approved") {
      newStatus = "Approved";
      linkedSystemIntegrationId = "SI-2024-0089";
      eventMessage = "Review Board Approved Embedded Systems Development. Auto-created downstream System Integration project SI-2024-0089. Embedded Engineer notified: 'Proceed to System Integration'.";
    } else if (data.decision === "Approved with Conditions") {
      newStatus = "Approved with Conditions";
      eventMessage = "Review Board Approved with Conditions. Embedded Engineer notified: 'Improve Firmware'. Record remains editable.";
    } else if (data.decision === "Revision Required") {
      newStatus = "Revision Required";
      eventMessage = "Review Board requested revisions. Embedded Engineer notified: 'Reassess Architecture & Firmware'. Returned to Testing & Validation stage.";
    } else if (data.decision === "Rejected") {
      newStatus = "Rejected";
      eventMessage = "Review Board Rejected Embedded Development. Record archived. Embedded Engineer notified: 'Close Embedded Development'.";
    }

    const updatedReviewers = currentEmbeddedDevelopmentRecord.input.reviewers.map((rev) => {
      if (rev.role === "Embedded Engineer" || rev.role === "Engineering Manager") {
        return {
          ...rev,
          decision: data.decision === "Approved" || data.decision === "Approved with Conditions" ? ("Approved" as const) : ("Rejected" as const),
          status: data.decision,
          date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };
      }
      return rev;
    });

    currentEmbeddedDevelopmentRecord = {
      ...currentEmbeddedDevelopmentRecord,
      status: newStatus,
      approvalDecision: data.decision,
      approvalDate: new Date().toLocaleDateString("en-CA"),
      reviewComments: data.comments || "",
      linkedSystemIntegrationId,
      stages: currentEmbeddedDevelopmentRecord.stages.map((stg) => {
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
          ? "testing_validation"
          : "engineering_review",
      input: {
        ...currentEmbeddedDevelopmentRecord.input,
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
          actor: "Lead Embedded Engineer (Review Board)",
          event: eventMessage,
          stage: currentEmbeddedDevelopmentRecord.currentStage,
          status: newStatus,
        },
        ...currentEmbeddedDevelopmentRecord.auditTrail,
      ],
    };

    return { success: true, data: currentEmbeddedDevelopmentRecord };
  });
