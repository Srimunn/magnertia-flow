import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Sparkles, Gauge } from "lucide-react";

import { manufacturingExcellenceService } from "@/services";
import type { ManufacturingExcellenceRecord } from "@/services/types";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import { ManufacturingExcellenceTabBar, type ExcellenceTabId } from "@/components/erp/ManufacturingExcellenceTabBar";
import { ExcellenceHeader } from "@/components/erp/manufacturingExcellence/ExcellenceHeader";
import { ExcellenceTopBadges } from "@/components/erp/manufacturingExcellence/ExcellenceTopBadges";
import { ExcellenceOverviewCard } from "@/components/erp/manufacturingExcellence/ExcellenceOverviewCard";
import { ExcellenceAssessmentCard } from "@/components/erp/manufacturingExcellence/ExcellenceAssessmentCard";
import { ExcellenceProgramsCard } from "@/components/erp/manufacturingExcellence/ExcellenceProgramsCard";
import { ExcellenceSmartCard } from "@/components/erp/manufacturingExcellence/ExcellenceSmartCard";
import { ExcellenceQualityCard } from "@/components/erp/manufacturingExcellence/ExcellenceQualityCard";
import { ExcellenceSustainabilityCard } from "@/components/erp/manufacturingExcellence/ExcellenceSustainabilityCard";
import { ExcellenceAiCard } from "@/components/erp/manufacturingExcellence/ExcellenceAiCard";
import { ExcellenceSummaryCard } from "@/components/erp/manufacturingExcellence/ExcellenceSummaryCard";
import { ExcellenceAttachmentsCard } from "@/components/erp/manufacturingExcellence/ExcellenceAttachmentsCard";
import { ExcellenceReviewApprovalCard } from "@/components/erp/manufacturingExcellence/ExcellenceReviewApprovalCard";
import { ExcellenceSystemInfoCard } from "@/components/erp/manufacturingExcellence/ExcellenceSystemInfoCard";
import { ExcellenceAiInsightsPanel } from "@/components/erp/manufacturingExcellence/ExcellenceAiInsightsPanel";
import { ExcellenceKpiSnapshotCard } from "@/components/erp/manufacturingExcellence/ExcellenceKpiSnapshotCard";
import { ExcellenceWorkflowStepper } from "@/components/erp/manufacturingExcellence/ExcellenceWorkflowStepper";
import { NewExcellenceInitiativeDialog } from "@/components/erp/manufacturingExcellence/NewExcellenceInitiativeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/development/research-innovation/manufacturing-excellence/new",
)({
  head: () => ({
    meta: [{ title: "Manufacturing Excellence Form · Magnertia ERP" }],
  }),
  component: ManufacturingExcellencePage,
});

const DEFAULT_EXCELLENCE_RECORD: ManufacturingExcellenceRecord = {
  id: "mex-rec-2024-00045",
  manufacturingExcellenceId: "MEX-2024-00045",
  formCode: "MEXF-2024-25",
  initiativeTitle: "OEE Improvement & Cost Optimization Initiative",
  initiativeNumber: "MEX-INIT-24-001",
  version: 1.0,
  workflowStatus: "In Progress",
  startDate: "05 May 2024",
  targetCompletion: "30 Nov 2024",

  manufacturingPlant: "Plant-01",
  businessUnit: "EVSE Manufacturing",
  processOwner: "Rahul Sharma",

  initiativeCategory: "Operational Excellence",
  businessObjective: "Improve overall equipment effectiveness, reduce production cost and enhance quality.",
  currentPerformance: "OEE 72%, High downtime, Defects 1.8%, High energy cost.",
  targetPerformance: "OEE 85%, Downtime < 5%, Defects < 0.5%, Cost reduction 12%.",
  improvementStrategy: "Lean, TPM, AI analytics, predictive maintenance and automation.",
  expectedBusinessBenefits: "Higher productivity, lower cost, better quality and sustainability.",
  priority: "High",
  initiativeStatus: "Implementation",

  oeePercentage: 72.65,
  productivityIndex: 78,
  qualityPerformance: 83,
  deliveryPerformance: 80,
  costEfficiency: 75,
  safetyPerformance: 90,
  sustainabilityAssessmentScore: 82,
  operationalExcellenceScore: 86,

  leanManufacturing: true,
  sixSigmaProject: true,
  kaizenInitiative: true,
  tpmProgram: true,
  fiveSImplementation: true,
  valueStreamMapping: true,
  standardWork: true,
  improvementScore: 85,

  smartFactoryIntegration: true,
  aiManufacturingAnalytics: true,
  roboticsOptimization: true,
  iiotConnectivity: true,
  digitalTwin: true,
  predictiveMaintenance: true,
  energyOptimization: true,
  digitalExcellenceScore: 88,

  customerPpm: 120,
  firstPassYield: 96.40,
  processCapabilityCpk: "1.67",
  capaStatus: "In Progress",
  auditCompliance: 94.50,
  regulatoryCompliance: true,
  qualityExcellenceScore: 89,

  energyConsumption: 1.24,
  carbonEmissions: 0.68,
  waterConsumption: 2.35,
  wasteReduction: 18.60,
  recyclingRate: 72.30,
  esgCompliance: true,
  sustainabilityScore: 91,

  aiPerformanceInsights: "OEE optimization potential +12.35%",
  productivityForecast: "Positive trend expected in Q3",
  predictiveQuality: "First Pass Yield target 98.50% achievable",
  costOptimizationText: "Projected annual savings: ₹ 18.75 Lakhs",
  riskPredictionText: "Soldering temperature variance risk identified",
  aiRecommendations: "Expand TPM autonomous maintenance to Line-02",
  aiExcellenceScore: 93,

  overallManufacturingExcellenceScore: 89,
  recommendation: "Approve Excellence Initiative",

  attachments: [],
  manufacturingExcellenceManager: "Vikram Singh",
  productionManager: "Rahul Sharma",
  qualityManager: "Sneha Iyer",
  maintenanceManager: "Amit Patel",
  operationsManager: "Rohan Varma",
  plantHead: "Karan Mehta",
  coo: "Ananya Roy",
  cto: "Devraj Nair",
  ceo: "Siddharth Rao",
  reviewers: [
    { id: "rev-1", role: "Plant Head", person: "Karan Mehta", decision: "Approved", date: "10 May 2024" },
    { id: "rev-2", role: "Quality Manager", person: "Sneha Iyer", decision: "Approved", date: "12 May 2024" },
    { id: "rev-3", role: "Operations Manager", person: "Rohan Varma", decision: "Approved", date: "15 May 2024" },
  ],
  approvalDecision: "Approved",
  reviewComments: "Approved with condition to monitor soldering variance monthly.",
  approvalDate: "15 May 2024",

  createdBy: "Rahul Sharma",
  createdDate: "05 May 2024",
  lastModifiedBy: "Sneha Iyer",
  lastModifiedDate: "17 Jun 2024",
  workflowStage: "Board Approval",
  auditTrail: [
    { id: "aud-1", timestamp: "05 May 2024 10:30 AM", user: "Rahul Sharma", action: "Initiative Created", details: "Initial draft created." },
  ],
};

export function ManufacturingExcellencePage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ExcellenceTabId>("overview");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);

  // Data Fetching
  const { data: record, isLoading } = useQuery<ManufacturingExcellenceRecord>({
    queryKey: ["excellenceRecord"],
    queryFn: () => manufacturingExcellenceService.fetchRecord(),
  });
  const safeRecord = record ?? DEFAULT_EXCELLENCE_RECORD;

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ManufacturingExcellenceRecord>) =>
      manufacturingExcellenceService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["excellenceRecord"], updated);
      toast.success("Draft saved successfully!", {
        description: "Manufacturing Excellence initiative parameters and scores updated.",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", {
        description: err?.message || "An error occurred while saving.",
      });
    },
  });

  // Submit for Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: () => manufacturingExcellenceService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["excellenceRecord"], updated);
      toast.success("Submitted for Executive Board Review!", {
        description: "Review notifications sent to all 9 authorization roles.",
      });
    },
  });

  // Review Decision Mutation
  const reviewDecisionMutation = useMutation({
    mutationFn: (args: {
      decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected";
      comments: string;
    }) => manufacturingExcellenceService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["excellenceRecord"], updated);
      toast.success("Executive Board Review Decision Recorded!", {
        description: `Initiative status updated to ${updated.workflowStatus}.`,
      });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Manufacturing Excellence"
        breadcrumb={breadcrumb ?? "Development > Manufacturing Development"}
        tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Manufacturing Excellence Master Record...
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof ManufacturingExcellenceRecord, value: any) => {
    if (!record) {
      toast.error("Cannot update field: record not loaded.");
      return;
    }
    queryClient.setQueryData(["excellenceRecord"], {
      ...record,
      [field]: value,
    });
  };

  const handleSaveDraft = () => {
    if (!record) {
      toast.error("Cannot save draft: record not loaded.");
      return;
    }
    saveDraftMutation.mutate(record);
  };

  const handleSubmitForApproval = () => {
    if (!record) {
      toast.error("Cannot submit for approval: record not loaded.");
      return;
    }
    submitReviewMutation.mutate();
  };

  const handlePreview = () => {
    toast.info("Generating Manufacturing Excellence Report (PDF)...");
  };

  const handleCreateNewInitiative = (newInit: any) => {
    if (!record) {
      toast.error("Cannot create initiative: record not loaded.");
      return;
    }
    const created: ManufacturingExcellenceRecord = {
      ...record,
      id: `mex-rec-${Date.now()}`,
      manufacturingExcellenceId: `MEX-2024-${Math.floor(10000 + Math.random() * 90000)}`,
      formCode: "MEXF-2024-25",
      initiativeTitle: newInit.title,
      initiativeNumber: newInit.number,
      manufacturingPlant: newInit.plant,
      businessUnit: newInit.unit,
      processOwner: newInit.owner,
      initiativeCategory: newInit.category,
      businessObjective: newInit.objective,
      workflowStatus: "In Progress",
      version: 1.0,
      startDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };

    queryClient.setQueryData(["excellenceRecord"], created);
    toast.success("New Excellence Initiative Created!", {
      description: `Initiative ID ${created.manufacturingExcellenceId} initialized.`,
    });
  };

  const handleUploadAttachment = async (fileInfo: {
    name: string;
    type: string;
    size: number;
    documentType: string;
  }) => {
    if (!record) {
      toast.error("Cannot upload attachment: record not loaded.");
      return;
    }
    const newAtt = await manufacturingExcellenceService.uploadAttachment(fileInfo);
    const updated = {
      ...record,
      attachments: [newAtt, ...record.attachments],
    };
    queryClient.setQueryData(["excellenceRecord"], updated);
    toast.success("Attachment Uploaded", {
      description: `${fileInfo.name} attached under ${fileInfo.documentType}.`,
    });
  };

  const handleReviewDecision = (
    decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected",
    comments: string
  ) => {
    reviewDecisionMutation.mutate({ decision, comments });
  };

  return (
    <AppShell
      title="Manufacturing Excellence"
      breadcrumb={breadcrumb ?? "Development > Manufacturing Development"}
      description="Govern continuous improvement, operational excellence, productivity, quality optimization, cost reduction, sustainability, and AI performance benchmarking."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Header Bar */}
        <ExcellenceHeader
          record={safeRecord}
          onSaveDraft={handleSaveDraft}
          onSubmitForApproval={handleSubmitForApproval}
          onPreview={handlePreview}
          onNewInitiative={() => setIsNewDialogOpen(true)}
          isSubmitting={submitReviewMutation.isPending}
        />

        {/* Top Score Gauge Cards */}
        <ExcellenceTopBadges record={safeRecord} />

        {/* Workflow Process Stepper */}
        <ExcellenceWorkflowStepper currentStage={safeRecord.workflowStage} />

        {/* Sub-Tab Bar Navigation */}
        <ManufacturingExcellenceTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Sections based on Active Tab or Full Stack */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {(activeTab === "overview" || activeTab === "summary") && (
              <ExcellenceOverviewCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "assessment" || activeTab === "summary") && (
              <ExcellenceAssessmentCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "programs" || activeTab === "summary") && (
              <ExcellenceProgramsCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "smart" || activeTab === "summary") && (
              <ExcellenceSmartCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "quality" || activeTab === "summary") && (
              <ExcellenceQualityCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "sustainability" || activeTab === "summary") && (
              <ExcellenceSustainabilityCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "ai" || activeTab === "summary") && (
              <ExcellenceAiCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {activeTab === "summary" && (
              <ExcellenceSummaryCard
                record={safeRecord}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "summary" || activeTab === "overview") && (
              <ExcellenceAttachmentsCard
                record={safeRecord}
                onUploadAttachment={handleUploadAttachment}
              />
            )}

            {(activeTab === "review" || activeTab === "summary") && (
              <ExcellenceReviewApprovalCard
                record={safeRecord}
                onDecisionChange={handleReviewDecision}
              />
            )}

            {(activeTab === "history" || activeTab === "summary") && (
              <ExcellenceSystemInfoCard record={safeRecord} />
            )}
          </div>

          {/* Right Column: AI Insights Panel & Quick KPI Snapshot Widgets */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ExcellenceAiInsightsPanel
              onViewFullAnalysis={() => setIsAiModalOpen(true)}
            />

            <ExcellenceKpiSnapshotCard
              record={safeRecord}
              onViewDashboard={() => setIsKpiModalOpen(true)}
            />

            <ExcellenceSummaryCard
              record={safeRecord}
              onChange={handleFieldChange}
            />
          </div>
        </div>
      </div>

      {/* New Initiative Dialog */}
      <NewExcellenceInitiativeDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onCreate={handleCreateNewInitiative}
      />

      {/* Full AI Analysis Modal */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-bold">
                Full AI Manufacturing Excellence Analysis
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2 text-xs">
            <div className="rounded-lg bg-primary/10 p-3.5 dark:bg-primary/20">
              <h4 className="font-bold text-primary">
                AI Continuous Improvement Recommendation
              </h4>
              <p className="mt-1 text-muted-foreground">
                AI Manufacturing Intelligence recommends expanding TPM autonomous maintenance coverage across Line-02 and initiating a Six Sigma DMAIC project on soldering temperature variance to eliminate 0.4% defect rate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">OEE Gains Potential</span>
                <div className="mt-1 text-xl font-black text-emerald-600">+12.35%</div>
                <span className="text-[10px] text-muted-foreground">Target 85.00% achievable</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Projected Cost Savings</span>
                <div className="mt-1 text-xl font-black text-blue-600">₹ 18.75 Lakhs</div>
                <span className="text-[10px] text-muted-foreground">Annualized savings</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">FPY Yield Target</span>
                <div className="mt-1 text-xl font-black text-cyan-600">98.50%</div>
                <span className="text-[10px] text-muted-foreground">Current 96.40%</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Carbon Intensity Reduction</span>
                <div className="mt-1 text-[11px] font-black text-purple-600">0.68 tCO2e/Unit</div>
                <span className="text-[10px] text-muted-foreground">-14.2% ESG impact</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setIsAiModalOpen(false)}>
                Close Analysis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Dashboard Modal */}
      <Dialog open={isKpiModalOpen} onOpenChange={setIsKpiModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-lg font-bold">
                Enterprise KPI Performance Dashboard
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <span className="font-bold text-muted-foreground">Current OEE</span>
                <div className="my-1 text-2xl font-black text-blue-600">{safeRecord.oeePercentage}%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+4.2% MoM</span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <span className="font-bold text-muted-foreground">First Pass Yield</span>
                <div className="my-1 text-2xl font-black text-emerald-600">{safeRecord.firstPassYield}%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+1.8% MoM</span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <span className="font-bold text-muted-foreground">Customer PPM</span>
                <div className="my-1 text-2xl font-black text-rose-600">{safeRecord.customerPpm}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">-120 PPM MoM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="font-bold text-foreground">Operational Benchmark Comparison</span>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>Plant OEE Performance</span>
                    <span>72.65% (World Class Target: 85%)</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-blue-600" style={{ width: "72.65%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>Audit & ESG Compliance</span>
                    <span>94.50%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-emerald-600" style={{ width: "94.5%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setIsKpiModalOpen(false)}>
                Close Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
