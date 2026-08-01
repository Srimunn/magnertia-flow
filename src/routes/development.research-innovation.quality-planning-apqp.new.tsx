import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ApqpHeader } from "@/components/erp/apqp/ApqpHeader";
import { ApqpTabBar, type ApqpTabType } from "@/components/erp/apqp/ApqpTabBar";
import { AddApqpProjectModal } from "@/components/erp/apqp/AddApqpProjectModal";

import { OverviewTab } from "@/components/erp/apqp/tabs/OverviewTab";
import { PhasePlanningTab } from "@/components/erp/apqp/tabs/PhasePlanningTab";
import { DesignInputsTab } from "@/components/erp/apqp/tabs/DesignInputsTab";
import { ManufacturingValidationTab } from "@/components/erp/apqp/tabs/ManufacturingValidationTab";
import { SupplierQualityTab } from "@/components/erp/apqp/tabs/SupplierQualityTab";
import { RiskAssessmentTab } from "@/components/erp/apqp/tabs/RiskAssessmentTab";
import { AiAssessmentTab } from "@/components/erp/apqp/tabs/AiAssessmentTab";
import { SummaryTab } from "@/components/erp/apqp/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/apqp/tabs/ReviewApprovalTab";
import { AttachmentsTab } from "@/components/erp/apqp/tabs/AttachmentsTab";
import { ActivityHistoryTab } from "@/components/erp/apqp/tabs/ActivityHistoryTab";

import {
  fetchApqpRecord,
  saveApqpDraft,
  submitApqpForReview,
} from "@/services/apqpService";

export const Route = createFileRoute(
  "/development/research-innovation/quality-planning-apqp/new",
)({
  component: ApqpQualityPlanningPage,
});

function ApqpQualityPlanningPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ApqpTabType>("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["apqp-quality-planning-record"],
    queryFn: fetchApqpRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveApqpDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["apqp-quality-planning-record"], updated);
      toast.success("APQP Quality Planning Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitApqpForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["apqp-quality-planning-record"], updated);
      toast.success("APQP Project submitted for Executive Board review!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Quality Planning (APQP)"
        breadcrumb="Development > Manufacturing Development > Quality Planning (APQP)"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Quality Planning (APQP) Master Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Quality Planning (APQP)"
      breadcrumb="Development > Manufacturing Development > Quality Planning (APQP)"
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <ApqpHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting APQP Quality Plan to PDF...")}
          onNewProject={() => {
            setIsAddModalOpen(true);
          }}
        />

        {/* 11 Horizontal Navigation Tabs */}
        <ApqpTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === "phases" && (
            <PhasePlanningTab record={record} />
          )}

          {activeTab === "inputs" && (
            <DesignInputsTab record={record} />
          )}

          {activeTab === "validation" && (
            <ManufacturingValidationTab record={record} />
          )}

          {activeTab === "supplier" && (
            <SupplierQualityTab record={record} />
          )}

          {activeTab === "risk" && (
            <RiskAssessmentTab record={record} />
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
                toast.success(`APQP Gate decision submitted: ${decision}`);
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

        {/* Add APQP Project Modal */}
        <AddApqpProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(input) => saveDraftMutation.mutate(input)}
        />
      </div>
    </AppShell>
  );
}
