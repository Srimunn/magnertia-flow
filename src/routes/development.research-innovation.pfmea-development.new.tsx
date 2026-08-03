import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { PfmeaHeader } from "@/components/erp/pfmea/PfmeaHeader";
import { PfmeaTabBar, type PfmeaTabType } from "@/components/erp/pfmea/PfmeaTabBar";
import { AddFailureModeModal } from "@/components/erp/pfmea/AddFailureModeModal";

import { OverviewTab } from "@/components/erp/pfmea/tabs/OverviewTab";
import { ProcessFunctionAnalysisTab } from "@/components/erp/pfmea/tabs/ProcessFunctionAnalysisTab";
import { FailureAnalysisTab } from "@/components/erp/pfmea/tabs/FailureAnalysisTab";
import { RecommendedActionsTab } from "@/components/erp/pfmea/tabs/RecommendedActionsTab";
import { ManufacturingValidationTab } from "@/components/erp/pfmea/tabs/ManufacturingValidationTab";
import { AiRiskAssessmentTab } from "@/components/erp/pfmea/tabs/AiRiskAssessmentTab";
import { SummaryTab } from "@/components/erp/pfmea/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/pfmea/tabs/ReviewApprovalTab";
import { AttachmentsTab } from "@/components/erp/pfmea/tabs/AttachmentsTab";
import { ActivityHistoryTab } from "@/components/erp/pfmea/tabs/ActivityHistoryTab";

import {
  fetchPfmeaRecord,
  savePfmeaDraft,
  submitPfmeaForReview,
  addFailureMode,
} from "@/services/pfmeaService";

export const Route = createFileRoute(
  "/development/research-innovation/pfmea-development/new",
)({
  component: PfmeaDevelopmentPage,
});

export function PfmeaDevelopmentPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PfmeaTabType>("overview");
  const [isAddFmModalOpen, setIsAddFmModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["pfmea-development-record"],
    queryFn: fetchPfmeaRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: savePfmeaDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["pfmea-development-record"], updated);
      toast.success("PFMEA Development Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitPfmeaForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["pfmea-development-record"], updated);
      toast.success("PFMEA Project submitted for Executive Board review!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  const addFmMutation = useMutation({
    mutationFn: addFailureMode,
    onSuccess: (updated) => {
      queryClient.setQueryData(["pfmea-development-record"], updated);
      toast.success("New failure mode added successfully!");
    },
    onError: (err: any) => toast.error(`Failed to add failure mode: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="PFMEA Development"
        breadcrumb={breadcrumb}
        tabs={tabs}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Process Failure Mode and Effects Analysis Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="PFMEA Development"
      breadcrumb={breadcrumb}
      description="Identify process failure modes, severity/occurrence/detection scoring, and risk mitigation actions."
      tabs={tabs}
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <PfmeaHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting PFMEA Worksheet to PDF...")}
          onNewPfmea={() => {
            setIsAddFmModalOpen(true);
          }}
        />

        {/* 10 Horizontal Navigation Tabs */}
        <PfmeaTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onNavigateTab={(t) => setActiveTab(t)}
              onAddFailureMode={() => setIsAddFmModalOpen(true)}
            />
          )}

          {activeTab === "functions" && (
            <ProcessFunctionAnalysisTab record={record} />
          )}

          {activeTab === "failure" && (
            <FailureAnalysisTab
              record={record}
              onAddFailureMode={() => setIsAddFmModalOpen(true)}
            />
          )}

          {activeTab === "actions" && (
            <RecommendedActionsTab record={record} />
          )}

          {activeTab === "validation" && (
            <ManufacturingValidationTab record={record} />
          )}

          {activeTab === "ai" && (
            <AiRiskAssessmentTab record={record} />
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
                toast.success(`PFMEA Board decision submitted: ${decision}`);
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

        {/* Add Failure Mode Modal */}
        <AddFailureModeModal
          isOpen={isAddFmModalOpen}
          onClose={() => setIsAddFmModalOpen(false)}
          onAdd={(fm) => addFmMutation.mutate(fm)}
          nextStepNo={record.failureModes.length + 1}
        />
      </div>
    </AppShell>
  );
}
