import { createServerFn } from "@tanstack/react-start";
import type {
  AiModelApprovalDecision,
  AiModelFormInput,
  AiModelRecord,
  AiModelStatus,
} from "@/services/types";

/* ===========================================================================
   AI Model Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateAiModelDevelopmentScores(input: Partial<AiModelFormInput>) {
  const datasetReadiness = 87;
  const modelReadiness = 90;
  const deploymentReadiness = 89;
  const governanceReadiness = 91;
  const performanceScore = 93;

  const overallAiModelScore = Math.round(
    datasetReadiness * 0.2 +
      modelReadiness * 0.25 +
      deploymentReadiness * 0.2 +
      governanceReadiness * 0.15 +
      performanceScore * 0.2
  );

  return {
    datasetReadinessScore: datasetReadiness,
    featureReadinessScore: 88,
    modelDesignScore: modelReadiness,
    trainingScore: 91,
    evaluationScore: 91,
    governanceScore: governanceReadiness,
    deploymentReadinessScore: deploymentReadiness,
    aiOverallScore: 92,
    overallAiModelScore: overallAiModelScore,
  };
}

const DEFAULT_RECORD: AiModelRecord = {
  id: "aimd-rec-0018",
  aiModelDevelopmentId: "AIMD-2024-0018",
  formCode: "AMDF-2024-25",
  aiProjectName: "EV Demand Forecasting Model",
  modelVersion: "v1.2.0",
  workflowStatus: "In Review",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Platform",
  linkedCloudPlatformId: "CLD-2024-0001",
  linkedDataEngineeringId: "DE-2024-0005",
  linkedSoftwareDevId: "SWD-2024-0012",
  linkedApiDevId: "API-2024-0017",
  aiLeadEngineerName: "Rahul Sharma",
  aiLeadEngineerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  businessUnit: "EV Mobility Division",

  // Overview Card Data
  businessObjective: "Predict short-term demand for EV charging stations using historical usage, weather, and calendar data.",
  aiUseCase: "Forecasting",
  targetUsers: ["Operations Team", "Data Analysts"],
  problemStatement: "Accurate demand prediction is needed to optimize station availability and reduce operational costs.",
  expectedBusinessOutcome: "15% reduction in idle stations and improved customer satisfaction.",
  developmentStatus: "In Progress",

  datasetReadinessScore: 87,
  featureReadinessScore: 88,
  modelDesignScore: 90,
  trainingScore: 91,
  evaluationScore: 91,
  governanceScore: 90,
  deploymentReadinessScore: 89,
  aiOverallScore: 92,
  overallAiModelScore: 90,

  datasetConfig: {
    datasetName: "EV_Usage_Historical",
    datasetSource: "Data Lake",
    datasetSize: "2.4 TB",
    dataFormat: "Parquet",
    trainDataset: "ev_train.parquet",
    valDataset: "ev_val.parquet",
    testDataset: "ev_test.parquet",
    dataQualityScore: 87,
    completeness: 92,
    consistency: 84,
    accuracy: 85,
    timeliness: 86,
    uniqueness: 89,
  },

  featureConfig: {
    selectionMethod: "Recursive Feature Elimination",
    extraction: "Time, Weather, Location, Usage Patterns",
    scaling: "Standard Scaler",
    preprocessing: "Outlier Removal, Encoding, Normalization",
    missingValueStrategy: "Median Imputation",
    featureReadinessScore: 88,
  },

  architectureConfig: {
    aiCategory: "Machine Learning",
    modelType: "XGBoost",
    framework: "Scikit-learn",
    language: "Python",
    hyperparameters: "Max Depth: 8, Learning Rate: 0.05, N Estimators: 500, Subsample: 0.8",
    modelDesignScore: 89,
  },

  trainingMetrics: {
    strategy: "Supervised Learning",
    optimizer: "Adam",
    lossFunction: "RMSE",
    batchSize: 256,
    epochs: 200,
    gpuUtilization: "NVIDIA A100 (80GB) - 90%",
    trainingStatus: "Completed",
    trainingScore: 91,
    learningCurve: [
      { epoch: 1, trainLoss: 0.85, valLoss: 0.92 },
      { epoch: 50, trainLoss: 0.45, valLoss: 0.52 },
      { epoch: 100, trainLoss: 0.28, valLoss: 0.35 },
      { epoch: 150, trainLoss: 0.18, valLoss: 0.24 },
      { epoch: 200, trainLoss: 0.12, valLoss: 0.19 },
    ],
  },

  evaluationMetrics: {
    accuracy: 92.4,
    precision: 91.7,
    recall: 90.8,
    f1Score: 91.2,
    rocAuc: 0.94,
    confusionMatrix: [
      [812, 32, 6],
      [41, 489, 28],
      [7, 25, 525],
    ],
    evaluationScore: 91,
  },

  governancePolicy: {
    explainabilityMethod: "SHAP",
    biasDetection: "No Significant Bias",
    fairnessAssessment: "Demographic parity satisfied for all groups.",
    privacyCompliance: "GDPR",
    ethicalReview: "Completed",
    riskClassification: "Medium",
    governanceScore: 90,
  },

  mlopsDeployment: {
    platform: "Kubernetes",
    containerization: "Docker",
    registry: "MLflow",
    cicdPipeline: "GitHub Actions",
    monitoringPlatform: "Prometheus + Grafana",
    inferenceEndpoint: "https://api.magnertia.com/v1/ev-demand/v1/predict",
    deploymentStatus: "Deployed",
    deploymentReadinessScore: 89,
  },

  aiAssessment: {
    aiPerformanceScore: 93,
    aiRobustnessReview: "Strong robustness across different conditions.",
    aiSecurityReview: "No critical vulnerabilities identified.",
    aiDriftPrediction: "Low drift expected for next 30 days.",
    aiOptimizationSuggestions: "Tune learning rate and add holiday features.",
    aiExplainabilityReview: "Model is well explained using SHAP values.",
    aiOverallScore: 92,
  },

  readinessSummary: {
    datasetReadiness: 87,
    modelReadiness: 90,
    deploymentReadiness: 89,
    governanceReadiness: 91,
    overallAiModelScore: 90,
    recommendation: "Proceed to Production Deployment",
  },

  attachments: [
    { id: "att1", name: "dataset_documentation.pdf", size: "2.4 MB", type: "PDF", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att2", name: "feature_engineering_report.pdf", size: "1.8 MB", type: "PDF", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att3", name: "model_architecture.png", size: "3.1 MB", type: "PNG", uploadedBy: "Ananya Iyer", date: "20 Jun 2024", url: "#" },
    { id: "att4", name: "training_logs.pdf", size: "4.5 MB", type: "PDF", uploadedBy: "Vikram Singh", date: "20 Jun 2024", url: "#" },
    { id: "att5", name: "evaluation_report.pdf", size: "2.0 MB", type: "PDF", uploadedBy: "Rohit Nair", date: "20 Jun 2024", url: "#" },
    { id: "att6", name: "model_card.pdf", size: "1.6 MB", type: "PDF", uploadedBy: "Rahul Sharma", date: "20 Jun 2024", url: "#" },
    { id: "att7", name: "deployment_guide.pdf", size: "2.2 MB", type: "PDF", uploadedBy: "Vikram Singh", date: "20 Jun 2024", url: "#" },
    { id: "att8", name: "risk_assessment_report.pdf", size: "1.9 MB", type: "PDF", uploadedBy: "Neha Verma", date: "20 Jun 2024", url: "#" },
  ],

  reviewers: [
    { role: "AI Lead Engineer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Looks Good" },
    { role: "Data Scientist", person: "Ananya Iyer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Excellent Model" },
    { role: "MLOps Engineer", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Deployment Ready" },
    { role: "Cloud Architect", person: "Neha Verma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Infrastructure OK" },
    { role: "Software Architect", person: "Rohit Nair", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", decision: "Approved with Conditions", date: "20 Jun 2024", comments: "Add more tests" },
    { role: "Product Manager", person: "Pooja Mehta", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", decision: "Pending", date: "20 Jun 2024", comments: "Pending Review" },
    { role: "CTO", person: "Dr. Anil Patel", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", decision: "Pending", date: "20 Jun 2024", comments: "Pending Review" },
  ],

  approvalDecision: "Approved with Conditions",
  approvalDate: "20 Jun 2024",
  reviewComments: "Overall model is good. Please improve explainability and add more test cases.",

  auditTrail: [
    { id: "aud1", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Submitted for Review", details: "Submitted EV Demand Forecasting Model v1.2.0 to AI review board.", ipAddress: "192.168.1.104" },
    { id: "aud2", timestamp: "20 Jun 2024 02:10 PM", user: "Ananya Iyer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", action: "Updated Model Training", details: "Completed 200 epochs of XGBoost training on NVIDIA A100 GPU.", ipAddress: "192.168.1.112" },
    { id: "aud3", timestamp: "19 Jun 2024 11:45 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Uploaded Datasets", details: "Uploaded EV_Usage_Historical dataset (2.4 TB Parquet).", ipAddress: "192.168.1.104" },
    { id: "aud4", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Created Project", details: "Initialized AI Model Development Record AIMD-2024-0018.", ipAddress: "192.168.1.104" },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: AiModelRecord = { ...DEFAULT_RECORD };

export const getAiModelDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: AiModelRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveAiModelDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<AiModelFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: AiModelRecord }> => {
    const input = data.input;
    const scores = calculateAiModelDevelopmentScores({ ...currentRecord, ...input });

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

export const submitAiModelDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: AiModelRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewAiModelDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: AiModelApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: AiModelRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<AiModelApprovalDecision, AiModelStatus> = {
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
