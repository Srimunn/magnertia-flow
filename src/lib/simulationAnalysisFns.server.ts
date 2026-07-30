import { createServerFn } from "@tanstack/react-start";
import type {
  SimulationApprovalDecision,
  SimulationFormInput,
  SimulationRecord,
  SimulationStatus,
} from "@/services/types";

/* ===========================================================================
   Simulation & Analysis — Server Functions & CAE Workflow Engine
   =========================================================================== */

export function calculateSimulationScores(input: Partial<SimulationFormInput>) {
  const modelReadiness = 90;
  const configuration = 93;
  const analysisCompletion = 95;
  const validation = 93;
  const optimization = 89;
  const aiEngineering = 92;

  const overallScore = Math.round(
    modelReadiness * 0.2 +
      configuration * 0.15 +
      analysisCompletion * 0.2 +
      validation * 0.2 +
      optimization * 0.15 +
      aiEngineering * 0.1
  );

  return {
    modelReadinessScore: modelReadiness,
    configurationScore: configuration,
    boundaryConditionScore: 92,
    analysisCompletionScore: analysisCompletion,
    validationScore: validation,
    optimizationScore: optimization,
    aiEngineeringScore: aiEngineering,
    overallSimulationScore: overallScore,
  };
}

const DEFAULT_RECORD: SimulationRecord = {
  id: "sim-rec-0027",
  simulationId: "SIM-2024-0027",
  formCode: "SIMF-2024-25",
  simulationProjectName: "W-EVSE Thermal & Structural Analysis",
  simulationVersion: "v2.1.0",
  workflowStatus: "In Progress",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Autonomous W-EVSE",
  linkedMechanicalDevId: "MECH-2024-0015",
  linkedElectricalDevId: "ELEC-2024-0012",
  linkedElectronicsDevId: "ELEC-2024-0018",
  linkedEmbeddedDevId: "EMBD-2024-0011",
  simulationEngineerName: "Rahul Sharma",
  simulationEngineerAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

  // Overview Data
  simulationType: "Multi-Physics Simulation",
  engineeringDomain: "Thermal + Structural",
  simulationPurpose:
    "Validate thermal performance and structural integrity of W-EVSE housing under operating conditions.",
  developmentStage: "Design Validation",
  projectPriority: "High",
  solver: "ANSYS Mechanical",
  analysisType: "Transient Thermal + Static Structural",

  modelReadinessScore: 90,
  configurationScore: 93,
  boundaryConditionScore: 92,
  analysisCompletionScore: 95,
  validationScore: 93,
  optimizationScore: 89,
  aiEngineeringScore: 92,
  overallSimulationScore: 91,

  modelPrepConfig: {
    cadModel: "W-EVSE_Housing_v2.step",
    materialLibrary: "Aluminium 6061-T6",
    meshStrategy: "Tetrahedral",
    totalElements: "1,245,876",
    meshQuality: "0.92 (Excellent)",
    meshPreviewStatus: "Mesh Verified",
    modelCompletenessScore: 90,
  },

  boundaryConditionsConfig: {
    loadConditions: ["Weight", "Mounting Load", "Wind Load"],
    constraints: "Fixed Support (Base)",
    environmentalConditions: "Ambient: 45 °C, Convection: 25 W/m²K",
    operatingScenario: "Continuous Operation (Max Load)",
    boundaryValidationStatus: "Validated",
    boundaryConditionScore: 92,
  },

  configurationConfig: {
    solverType: "ANSYS Mechanical",
    solverVersion: "2024 R1",
    analysisMethod: "Transient Thermal + Static Structural",
    timeStep: "0.02 sec",
    convergenceCriteria: "Energy (1e-6)",
    computingPlatform: "HPC Cluster (GPU)",
    configurationScore: 93,
  },

  analysisCategoriesConfig: {
    structuralAnalysisStatus: "Completed",
    thermalAnalysisStatus: "Completed",
    cfdAnalysisStatus: "Completed",
    electromagneticAnalysisStatus: "Not Required",
    dynamicAnalysisStatus: "Completed",
    fatigueAnalysisStatus: "Not Required",
    multiPhysicsAnalysisStatus: "Completed",
    analysisCompletionScore: 95,
  },

  resultsConfig: {
    maxStressVonMises: "78.6 MPa",
    maxDisplacement: "0.42 mm",
    maxTemperature: "78.4 °C",
    heatTransferCoefficient: "25 W/m²K",
    efficiencyPrediction: "94.2%",
    correlationWithPrototype: "96.3%",
    validationScore: 93,
  },

  optimizationConfig: {
    designOptimization: "Completed",
    topologyOptimization: "Not Required",
    weightReductionPct: 8.7,
    performanceImprovementPct: 11.3,
    costOptimizationPct: 6.4,
    optimizationRecommendations:
      "Add ribs near mounting region, Optimize fin geometry for better thermal dissipation.",
    optimizationScore: 89,
    iterationsData: [
      { iteration: "Iter 1", weightKg: 2.45, maxTempC: 86.2 },
      { iteration: "Iter 2", weightKg: 2.32, maxTempC: 83.5 },
      { iteration: "Iter 3", weightKg: 2.28, maxTempC: 81.1 },
      { iteration: "Iter 4", weightKg: 2.24, maxTempC: 79.2 },
      { iteration: "Iter 5", weightKg: 2.21, maxTempC: 78.4 },
    ],
  },

  aiAssessment: {
    aiSimulationReview: "Model accurate with high confidence.",
    aiDesignValidation: "All critical zones validated successfully.",
    aiPerformancePrediction: "Thermal margin is sufficient (18.6 °C).",
    aiFailurePrediction: "Low risk of thermal stress failure.",
    aiOptimizationSuggestions: "Improve airflow path and fin spacing.",
    aiEngineeringScore: 92,
  },

  readinessSummary: {
    modelReadiness: 90,
    simulationAccuracy: 92,
    validationScore: 93,
    optimizationScore: 89,
    overallSimulationScore: 91,
    recommendation: "Proceed to Prototype Development",
  },

  attachments: [
    {
      id: "att1",
      name: "cad_model_step.zip",
      size: "12.4 MB",
      type: "ZIP",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att2",
      name: "mesh_report.pdf",
      size: "2.1 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att3",
      name: "solver_configuration.pdf",
      size: "1.6 MB",
      type: "PDF",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att4",
      name: "engineering_report.pdf",
      size: "3.7 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att5",
      name: "validation_report.pdf",
      size: "2.8 MB",
      type: "PDF",
      uploadedBy: "Ananya Iyer",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att6",
      name: "optimization_report.pdf",
      size: "1.9 MB",
      type: "PDF",
      uploadedBy: "Rohit Nair",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att7",
      name: "ai_assessment_report.pdf",
      size: "2.4 MB",
      type: "PDF",
      uploadedBy: "Rahul Sharma",
      date: "20 Jun 2024",
      url: "#",
    },
    {
      id: "att8",
      name: "simulation_results.h5",
      size: "35.6 MB",
      type: "H5",
      uploadedBy: "Vikram Singh",
      date: "20 Jun 2024",
      url: "#",
    },
  ],

  reviewers: [
    {
      role: "Simulation Engineer",
      person: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Looks Good",
    },
    {
      role: "Mechanical Engineer",
      person: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Accurate Results",
    },
    {
      role: "Electrical Engineer",
      person: "Ananya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      decision: "Approved",
      date: "20 Jun 2024",
      comments: "Verified",
    },
    {
      role: "CAE Lead",
      person: "Anansiya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      decision: "Approved with Conditions",
      date: "20 Jun 2024",
      comments: "Minor changes",
    },
    {
      role: "QA Manager",
      person: "Rohit Nair",
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
  reviewComments:
    "Overall results are good. Please optimize the rib design near the mounting region.",

  auditTrail: [
    {
      id: "aud1",
      timestamp: "20 Jun 2024 04:25 PM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Submitted for Review",
      details: "Submitted W-EVSE Thermal & Structural Analysis v2.1.0 to CAE review board.",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud2",
      timestamp: "20 Jun 2024 02:10 PM",
      user: "Vikram Singh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      action: "Completed ANSYS Solver Execution",
      details: "Solved 1.2M elements transient thermal & structural FEA.",
      ipAddress: "192.168.1.108",
    },
    {
      id: "aud3",
      timestamp: "19 Jun 2024 11:45 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Imported CAD & Generated Mesh",
      details: "Imported W-EVSE_Housing_v2.step (Tetrahedral mesh, 0.92 quality).",
      ipAddress: "192.168.1.104",
    },
    {
      id: "aud4",
      timestamp: "18 Jun 2024 10:15 AM",
      user: "Rahul Sharma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      action: "Created Project",
      details: "Initialized Simulation Project Record SIM-2024-0027.",
      ipAddress: "192.168.1.104",
    },
  ],

  digitalTwinStatus: "Synced",
  digitalTwinLastUpdated: "20 Jun 2024 04:20 PM",
};

export { DEFAULT_RECORD };

let currentRecord: SimulationRecord = { ...DEFAULT_RECORD };

export const getSimulationAnalysisFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: SimulationRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveSimulationAnalysisDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<SimulationFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: SimulationRecord }> => {
    const input = data.input;
    const scores = calculateSimulationScores({ ...currentRecord, ...input });

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

export const submitSimulationAnalysisFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: SimulationRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewSimulationAnalysisFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: SimulationApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: SimulationRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<SimulationApprovalDecision, SimulationStatus> = {
      Approved: "Approved",
      "Approved with Conditions": "In Review",
      "Revision Required": "Changes Requested",
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
