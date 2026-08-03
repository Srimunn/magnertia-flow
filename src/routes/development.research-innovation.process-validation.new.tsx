import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ProcessValidationHeader } from "@/components/erp/processValidation/ProcessValidationHeader";
import { ProcessValidationTabBar, type ProcessValidationTabType } from "@/components/erp/processValidation/ProcessValidationTabBar";
import { AddValidationTrialModal } from "@/components/erp/processValidation/AddValidationTrialModal";

import { OverviewTab } from "@/components/erp/processValidation/tabs/OverviewTab";
import { ProcessInfoTab } from "@/components/erp/processValidation/tabs/ProcessInfoTab";
import { ValidationPlanTab } from "@/components/erp/processValidation/tabs/ValidationPlanTab";
import { CapabilityVerificationTab } from "@/components/erp/processValidation/tabs/CapabilityVerificationTab";
import { QualityVerificationTab } from "@/components/erp/processValidation/tabs/QualityVerificationTab";
import { EquipmentReadinessTab } from "@/components/erp/processValidation/tabs/EquipmentReadinessTab";
import { AiAssessmentTab } from "@/components/erp/processValidation/tabs/AiAssessmentTab";
import { SummaryTab } from "@/components/erp/processValidation/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/processValidation/tabs/ReviewApprovalTab";
import { AttachmentsTab } from "@/components/erp/processValidation/tabs/AttachmentsTab";
import { ActivityHistoryTab } from "@/components/erp/processValidation/tabs/ActivityHistoryTab";

import {
  fetchProcessValidationRecord,
  saveProcessValidationDraft,
  submitProcessValidationForReview,
  updateTrialRunSummary,
} from "@/services/processValidationService";

export const Route = createFileRoute(
  "/development/research-innovation/process-validation/new",
)({
  component: ProcessValidationPage,
});

export function ProcessValidationPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProcessValidationTabType>("overview");
  const [isLogTrialModalOpen, setIsLogTrialModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["process-validation-record"],
    queryFn: fetchProcessValidationRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveProcessValidationDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["process-validation-record"], updated);
      toast.success("Process Validation Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitProcessValidationForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["process-validation-record"], updated);
      toast.success("Process Validation package submitted for Review Board approval!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  const updateTrialMutation = useMutation({
    mutationFn: updateTrialRunSummary,
    onSuccess: (updated) => {
      queryClient.setQueryData(["process-validation-record"], updated);
      toast.success("Trial run production metrics updated successfully!");
    },
    onError: (err: any) => toast.error(`Failed to update trial run metrics: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Process Validation & PPAP"
        breadcrumb={breadcrumb}
        tabs={tabs}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Manufacturing Process Validation Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Process Validation & PPAP"
      breadcrumb={breadcrumb}
      description="Execute Production Part Approval Process (PPAP) submissions, dimensional reports, and customer approvals."
      tabs={tabs}
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <ProcessValidationHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting Process Validation Package...")}
          onNewValidation={() => {
            setIsLogTrialModalOpen(true);
          }}
        />

        {/* 10 Horizontal Navigation Tabs */}
        <ProcessValidationTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onNavigateTab={(t) => setActiveTab(t)}
              onLogTrialRun={() => setIsLogTrialModalOpen(true)}
            />
          )}

          {activeTab === "process" && (
            <ProcessInfoTab record={record} />
          )}

          {activeTab === "plan" && (
            <ValidationPlanTab
              record={record}
              onLogTrialRun={() => setIsLogTrialModalOpen(true)}
            />
          )}

          {activeTab === "capability" && (
            <CapabilityVerificationTab record={record} />
          )}

          {activeTab === "quality" && (
            <QualityVerificationTab record={record} />
          )}

          {activeTab === "equipment" && (
            <EquipmentReadinessTab record={record} />
          )}

          {activeTab === "ai" && (
            <AiAssessmentTab record={record} />
          )}

          {activeTab === "summary" && (
            <SummaryTab
              record={record}
              onUpdateRecommendation={(rec) =>
                saveDraftMutation.mutate({ recommendation: rec })
              }
            />
          )}

          {activeTab === "approval" && (
            <ReviewApprovalTab
              record={record}
              onReviewDecision={(decision, comments) => {
                saveDraftMutation.mutate({ approvalDecision: decision });
                toast.success(`Validation Board decision submitted: ${decision}`);
              }}
            />
          )}

          {activeTab === "attachments" && (
            <AttachmentsTab record={record} />
          )}

          {activeTab === "history" && (
            <ActivityHistoryTab record={record} />
          )}
        </div>

        {/* Add Validation Trial Modal */}
        <AddValidationTrialModal
          isOpen={isLogTrialModalOpen}
          onClose={() => setIsLogTrialModalOpen(false)}
          onUpdate={(summary) => updateTrialMutation.mutate(summary)}
          currentSummary={record.trialRunSummary}
        />
      </div>
    </AppShell>
  );
}
