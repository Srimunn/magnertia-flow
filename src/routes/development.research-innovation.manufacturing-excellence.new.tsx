import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Sparkles, Gauge } from "lucide-react";

import { manufacturingExcellenceService } from "@/services";
import type { ManufacturingExcellenceRecord } from "@/services/types";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
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

function ManufacturingExcellencePage() {
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
        breadcrumb="Development → Manufacturing Development → Manufacturing Excellence"
        description="Govern continuous improvement, operational excellence, productivity, quality optimization, cost reduction, sustainability, and AI performance benchmarking."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Manufacturing Excellence Module...</p>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof ManufacturingExcellenceRecord, value: any) => {
    queryClient.setQueryData(["excellenceRecord"], {
      ...record,
      [field]: value,
    });
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(record);
  };

  const handleSubmitForApproval = () => {
    submitReviewMutation.mutate();
  };

  const handlePreview = () => {
    toast.info("Generating Manufacturing Excellence Report (PDF)...");
  };

  const handleCreateNewInitiative = (newInit: any) => {
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
      breadcrumb="Development → Manufacturing Development → Manufacturing Excellence"
      description="Govern continuous improvement, operational excellence, productivity, quality optimization, cost reduction, sustainability, and AI performance benchmarking."
      tabs={<ResearchInnovationTabBar />}
    >
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Header Bar */}
        <ExcellenceHeader
          record={record}
          onSaveDraft={handleSaveDraft}
          onSubmitForApproval={handleSubmitForApproval}
          onPreview={handlePreview}
          onNewInitiative={() => setIsNewDialogOpen(true)}
          isSubmitting={submitReviewMutation.isPending}
        />

        {/* Top Score Gauge Cards */}
        <ExcellenceTopBadges record={record} />

        {/* Workflow Process Stepper */}
        <ExcellenceWorkflowStepper currentStage={record.workflowStage} />

        {/* Sub-Tab Bar Navigation */}
        <ManufacturingExcellenceTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Sections based on Active Tab or Full Stack */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {(activeTab === "overview" || activeTab === "summary") && (
              <ExcellenceOverviewCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "assessment" || activeTab === "summary") && (
              <ExcellenceAssessmentCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "programs" || activeTab === "summary") && (
              <ExcellenceProgramsCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "smart" || activeTab === "summary") && (
              <ExcellenceSmartCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "quality" || activeTab === "summary") && (
              <ExcellenceQualityCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "sustainability" || activeTab === "summary") && (
              <ExcellenceSustainabilityCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "ai" || activeTab === "summary") && (
              <ExcellenceAiCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {activeTab === "summary" && (
              <ExcellenceSummaryCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "summary" || activeTab === "overview") && (
              <ExcellenceAttachmentsCard
                record={record}
                onUploadAttachment={handleUploadAttachment}
              />
            )}

            {(activeTab === "review" || activeTab === "summary") && (
              <ExcellenceReviewApprovalCard
                record={record}
                onDecisionChange={handleReviewDecision}
              />
            )}

            {(activeTab === "history" || activeTab === "summary") && (
              <ExcellenceSystemInfoCard record={record} />
            )}
          </div>

          {/* Right Column: AI Insights Panel & Quick KPI Snapshot Widgets */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ExcellenceAiInsightsPanel
              onViewFullAnalysis={() => setIsAiModalOpen(true)}
            />

            <ExcellenceKpiSnapshotCard
              record={record}
              onViewDashboard={() => setIsKpiModalOpen(true)}
            />

            <ExcellenceSummaryCard
              record={record}
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
                <div className="my-1 text-2xl font-black text-blue-600">{record.oeePercentage}%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+4.2% MoM</span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <span className="font-bold text-muted-foreground">First Pass Yield</span>
                <div className="my-1 text-2xl font-black text-emerald-600">{record.firstPassYield}%</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+1.8% MoM</span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <span className="font-bold text-muted-foreground">Customer PPM</span>
                <div className="my-1 text-2xl font-black text-rose-600">{record.customerPpm}</div>
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
