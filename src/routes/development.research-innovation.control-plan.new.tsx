import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ControlPlanHeader } from "@/components/erp/controlPlan/ControlPlanHeader";
import { ControlPlanTabBar, type ControlPlanTabType } from "@/components/erp/controlPlan/ControlPlanTabBar";
import { AddCharacteristicModal } from "@/components/erp/controlPlan/AddCharacteristicModal";

import { OverviewTab } from "@/components/erp/controlPlan/tabs/OverviewTab";
import { CharacteristicsTab } from "@/components/erp/controlPlan/tabs/CharacteristicsTab";
import { InspectionPlanningTab } from "@/components/erp/controlPlan/tabs/InspectionPlanningTab";
import { ProcessControlTab } from "@/components/erp/controlPlan/tabs/ProcessControlTab";
import { QualityVerificationTab } from "@/components/erp/controlPlan/tabs/QualityVerificationTab";
import { AiAssessmentTab } from "@/components/erp/controlPlan/tabs/AiAssessmentTab";
import { SummaryTab } from "@/components/erp/controlPlan/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/controlPlan/tabs/ReviewApprovalTab";
import { AttachmentsTab } from "@/components/erp/controlPlan/tabs/AttachmentsTab";
import { ActivityHistoryTab } from "@/components/erp/controlPlan/tabs/ActivityHistoryTab";

import {
  fetchControlPlanRecord,
  saveControlPlanDraft,
  submitControlPlanForReview,
  addCharacteristic,
} from "@/services/controlPlanService";

export const Route = createFileRoute(
  "/development/research-innovation/control-plan/new",
)({
  component: ControlPlanDevelopmentPage,
});

function ControlPlanDevelopmentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ControlPlanTabType>("overview");
  const [isAddCharModalOpen, setIsAddCharModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["control-plan-development-record"],
    queryFn: fetchControlPlanRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveControlPlanDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["control-plan-development-record"], updated);
      toast.success("Control Plan Development Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitControlPlanForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["control-plan-development-record"], updated);
      toast.success("Control Plan submitted for Executive Board review!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  const addCharMutation = useMutation({
    mutationFn: addCharacteristic,
    onSuccess: (updated) => {
      queryClient.setQueryData(["control-plan-development-record"], updated);
      toast.success("New process & product characteristic added successfully!");
    },
    onError: (err: any) => toast.error(`Failed to add characteristic: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Control Plan Development"
        breadcrumb="Development > Manufacturing Development > Control Plan Development"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Manufacturing Process Control Plan Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Control Plan Development"
      breadcrumb="Development > Manufacturing Development > Control Plan Development"
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <ControlPlanHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting Control Plan Worksheet to Excel/PDF...")}
          onNewControlPlan={() => {
            setIsAddCharModalOpen(true);
          }}
        />

        {/* 10 Horizontal Navigation Tabs */}
        <ControlPlanTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onNavigateTab={(t) => setActiveTab(t)}
              onAddCharacteristic={() => setIsAddCharModalOpen(true)}
            />
          )}

          {activeTab === "characteristics" && (
            <CharacteristicsTab
              record={record}
              onAddCharacteristic={() => setIsAddCharModalOpen(true)}
            />
          )}

          {activeTab === "inspection" && (
            <InspectionPlanningTab record={record} />
          )}

          {activeTab === "control" && (
            <ProcessControlTab record={record} />
          )}

          {activeTab === "verification" && (
            <QualityVerificationTab record={record} />
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
                toast.success(`Control Plan Board decision submitted: ${decision}`);
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

        {/* Add Characteristic Modal */}
        <AddCharacteristicModal
          isOpen={isAddCharModalOpen}
          onClose={() => setIsAddCharModalOpen(false)}
          onAdd={(char) => addCharMutation.mutate(char)}
          nextStepNo={record.characteristics.length + 1}
        />
      </div>
    </AppShell>
  );
}
