import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Sparkles, X, CheckCircle2 } from "lucide-react";

import { smartFactoryDevelopmentService } from "@/services";
import type { SmartFactoryDevelopmentRecord } from "@/services/types";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import { SmartFactoryTabBar, type SmartFactoryTabId } from "@/components/erp/SmartFactoryTabBar";
import { SmartFactoryHeader } from "@/components/erp/smartFactory/SmartFactoryHeader";
import { SmartFactoryTopBadges } from "@/components/erp/smartFactory/SmartFactoryTopBadges";
import { SmartFactoryOverviewCard } from "@/components/erp/smartFactory/SmartFactoryOverviewCard";
import { SmartFactoryInfrastructureCard } from "@/components/erp/smartFactory/SmartFactoryInfrastructureCard";
import { SmartFactorySystemsCard } from "@/components/erp/smartFactory/SmartFactorySystemsCard";
import { SmartFactoryAiCard } from "@/components/erp/smartFactory/SmartFactoryAiCard";
import { SmartFactoryAutomationCard } from "@/components/erp/smartFactory/SmartFactoryAutomationCard";
import { SmartFactoryOperationsCard } from "@/components/erp/smartFactory/SmartFactoryOperationsCard";
import { SmartFactoryValidationCard } from "@/components/erp/smartFactory/SmartFactoryValidationCard";
import { SmartFactorySummaryCard } from "@/components/erp/smartFactory/SmartFactorySummaryCard";
import { SmartFactoryAttachmentsCard } from "@/components/erp/smartFactory/SmartFactoryAttachmentsCard";
import { SmartFactoryReviewApprovalCard } from "@/components/erp/smartFactory/SmartFactoryReviewApprovalCard";
import { SmartFactorySystemInfoCard } from "@/components/erp/smartFactory/SmartFactorySystemInfoCard";
import { SmartFactoryAiInsightsPanel } from "@/components/erp/smartFactory/SmartFactoryAiInsightsPanel";
import { SmartFactoryWorkflowStepper } from "@/components/erp/smartFactory/SmartFactoryWorkflowStepper";
import { NewSmartFactoryDialog } from "@/components/erp/smartFactory/NewSmartFactoryDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/development/research-innovation/smart-factory-development/new",
)({
  head: () => ({
    meta: [{ title: "Smart Factory Development Form · Magnertia ERP" }],
  }),
  component: SmartFactoryDevelopmentPage,
});

export function SmartFactoryDevelopmentPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SmartFactoryTabId>("overview");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Data Fetching
  const { data: record, isLoading } = useQuery<SmartFactoryDevelopmentRecord>({
    queryKey: ["smartFactoryRecord"],
    queryFn: () => smartFactoryDevelopmentService.fetchRecord(),
  });

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<SmartFactoryDevelopmentRecord>) =>
      smartFactoryDevelopmentService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["smartFactoryRecord"], updated);
      toast.success("Draft Saved Successfully!", {
        description: "Smart Factory Development project parameters updated.",
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: () => smartFactoryDevelopmentService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["smartFactoryRecord"], updated);
      toast.success("Submitted for Executive Board Review!", {
        description: "Stakeholders and plant directors notified.",
      });
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: ({
      decision,
      comments,
    }: {
      decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected";
      comments?: string;
    }) => smartFactoryDevelopmentService.reviewDecision({ decision, comments: comments || "" }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["smartFactoryRecord"], updated);
      toast.success("Review Decision Recorded!", {
        description: `Status updated to ${updated.workflowStatus}.`,
      });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Smart Factory Development"
        breadcrumb={breadcrumb}
        tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Smart Factory Development Master Record...
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof SmartFactoryDevelopmentRecord, value: any) => {
    queryClient.setQueryData(["smartFactoryRecord"], {
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
    toast.info("Generating Smart Factory Blueprint PDF Preview...", {
      description: "Compiling IoT node topology and Industry 4.0 architecture.",
    });
  };

  const handleCreateNewProject = (newProj: any) => {
    const created: SmartFactoryDevelopmentRecord = {
      ...record,
      id: `sf-rec-${Date.now()}`,
      smartFactoryProjectId: `SFP-2024-${Math.floor(10000 + Math.random() * 90000)}`,
      formCode: "SFPF-2024-25",
      smartFactoryProjectTitle: newProj.title,
      projectNumber: newProj.projectNumber,
      manufacturingPlant: newProj.plant,
      factoryZone: newProj.zone,
      projectManager: newProj.manager,
      smartFactoryLevel: newProj.level,
      industry40Maturity: newProj.maturity,
      factoryVision: newProj.vision,
      workflowStatus: "In Progress",
      version: 1.0,
      startDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };

    queryClient.setQueryData(["smartFactoryRecord"], created);
    toast.success("New Smart Factory Project Created!", {
      description: `Project ID ${created.smartFactoryProjectId} initialized.`,
    });
  };

  const handleUploadAttachment = async (fileInfo: {
    name: string;
    type: string;
    size: number;
    documentType: string;
  }) => {
    const newAtt = await smartFactoryDevelopmentService.uploadAttachment(fileInfo);
    const updated = {
      ...record,
      attachments: [newAtt, ...record.attachments],
    };
    queryClient.setQueryData(["smartFactoryRecord"], updated);
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
      title="Smart Factory Development"
      breadcrumb={breadcrumb}
      description="Govern Industry 4.0 transformation through IIoT, Cyber-Physical Systems, Digital Twins, AI, and MES."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Header Bar */}
        <SmartFactoryHeader
          record={record}
          onSaveDraft={handleSaveDraft}
          onSubmitForApproval={handleSubmitForApproval}
          onPreview={handlePreview}
          onNewProject={() => setIsNewDialogOpen(true)}
          isSubmitting={submitReviewMutation.isPending}
        />

        {/* Top Score Gauge Cards */}
        <SmartFactoryTopBadges record={record} />

        {/* Industry 4.0 Interactive Workflow Stepper */}
        <SmartFactoryWorkflowStepper currentStage={record.workflowStage} />

        {/* Tab Bar Navigation */}
        <SmartFactoryTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Form Sections based on Active Tab or Full Stack */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {(activeTab === "overview" || activeTab === "summary") && (
              <SmartFactoryOverviewCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "infrastructure" || activeTab === "summary") && (
              <SmartFactoryInfrastructureCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "systems" || activeTab === "summary") && (
              <SmartFactorySystemsCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "ai" || activeTab === "summary") && (
              <SmartFactoryAiCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "automation" || activeTab === "summary") && (
              <SmartFactoryAutomationCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "operations" || activeTab === "summary") && (
              <SmartFactoryOperationsCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "validation" || activeTab === "summary") && (
              <SmartFactoryValidationCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {activeTab === "summary" && (
              <SmartFactorySummaryCard
                record={record}
                onChange={handleFieldChange}
              />
            )}

            {(activeTab === "summary" || activeTab === "overview") && (
              <SmartFactoryAttachmentsCard
                record={record}
                onUploadAttachment={handleUploadAttachment}
              />
            )}

            {(activeTab === "review" || activeTab === "summary") && (
              <SmartFactoryReviewApprovalCard
                record={record}
                onDecisionChange={handleReviewDecision}
              />
            )}

            {(activeTab === "history" || activeTab === "summary") && (
              <SmartFactorySystemInfoCard record={record} />
            )}
          </div>

          {/* Right Column: AI Insights Panel & Action Summary */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SmartFactoryAiInsightsPanel
              onViewFullAnalysis={() => setIsAiModalOpen(true)}
            />

            <SmartFactorySummaryCard
              record={record}
              onChange={handleFieldChange}
            />
          </div>
        </div>
      </div>

      {/* New Project Dialog */}
      <NewSmartFactoryDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onCreate={handleCreateNewProject}
      />

      {/* Full AI Analysis Modal */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              <DialogTitle className="text-lg font-bold">
                Full AI Smart Factory Analysis & Simulation
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2 text-xs">
            <div className="rounded-lg bg-pink-50/60 p-3.5 dark:bg-pink-950/20">
              <h4 className="font-bold text-pink-900 dark:text-pink-300">
                AI Autonomous Recommendation Summary
              </h4>
              <p className="mt-1 text-pink-800 dark:text-pink-400">
                The AI Manufacturing Intelligence engine has analyzed shop floor telemetry from 142 IIoT sensors, 12 PLC controllers, 8 AGV/AMRs, and the Digital Twin model.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Robot Line Balance Efficiency</span>
                <div className="mt-1 text-xl font-black text-emerald-600">94.2%</div>
                <span className="text-[10px] text-muted-foreground">+8.6% gain predicted</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Digital Twin Model Fidelity</span>
                <div className="mt-1 text-xl font-black text-blue-600">98.7%</div>
                <span className="text-[10px] text-muted-foreground">Physics simulation aligned</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Annual Energy Optimization</span>
                <div className="mt-1 text-xl font-black text-purple-600">₹ 12.4 Lakhs</div>
                <span className="text-[10px] text-muted-foreground">Peak shaving active</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="font-bold text-foreground">Defect Reduction Potential</span>
                <div className="mt-1 text-xl font-black text-amber-600">18.4%</div>
                <span className="text-[10px] text-muted-foreground">Vision AI enabled</span>
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
    </AppShell>
  );
}
