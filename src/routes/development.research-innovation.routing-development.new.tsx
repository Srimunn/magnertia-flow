import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { RoutingHeader } from "@/components/erp/routing-development/RoutingHeader";
import { RoutingScoresHeader } from "@/components/erp/routing-development/RoutingScoresHeader";
import { RoutingTabBar, type RoutingTabType } from "@/components/erp/routing-development/RoutingTabBar";
import { AddOperationModal } from "@/components/erp/routing-development/AddOperationModal";

import { OverviewTab } from "@/components/erp/routing-development/tabs/OverviewTab";
import { OperationsTab } from "@/components/erp/routing-development/tabs/OperationsTab";
import { ResourcesTab } from "@/components/erp/routing-development/tabs/ResourcesTab";
import { ManufacturingValidationTab } from "@/components/erp/routing-development/tabs/ManufacturingValidationTab";
import { QualityComplianceTab } from "@/components/erp/routing-development/tabs/QualityComplianceTab";
import { CostAnalysisTab } from "@/components/erp/routing-development/tabs/CostAnalysisTab";
import { AiAssessmentTab } from "@/components/erp/routing-development/tabs/AiAssessmentTab";
import { SummaryTab } from "@/components/erp/routing-development/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/routing-development/tabs/ReviewApprovalTab";
import { AttachmentsTab } from "@/components/erp/routing-development/tabs/AttachmentsTab";
import { ActivityHistoryTab } from "@/components/erp/routing-development/tabs/ActivityHistoryTab";

import {
  fetchRoutingRecord,
  saveRoutingDraft,
  submitRoutingForReview,
  addRoutingOperation,
} from "@/services/routingDevelopmentService";

export const Route = createFileRoute(
  "/development/research-innovation/routing-development/new",
)({
  component: RoutingDevelopmentPage,
});

function RoutingDevelopmentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RoutingTabType>("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["routing-development-record"],
    queryFn: fetchRoutingRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveRoutingDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["routing-development-record"], updated);
      toast.success("Routing Development Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitRoutingForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["routing-development-record"], updated);
      toast.success("Routing submitted for Executive Board review!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  const addOpMutation = useMutation({
    mutationFn: addRoutingOperation,
    onSuccess: (updated) => {
      queryClient.setQueryData(["routing-development-record"], updated);
      toast.success("New manufacturing operation added to routing");
    },
    onError: (err: any) => toast.error(`Failed to add operation: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Routing Development"
        breadcrumb="Development > Manufacturing Development > Routing Development"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Routing Development Master Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Routing Development"
      breadcrumb="Development > Manufacturing Development > Routing Development"
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <RoutingHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting Routing Sheet to PDF...")}
          onNewRouting={() => {
            setIsAddModalOpen(true);
            toast.info("Creating new routing operation...");
          }}
        />

        {/* 6 Score Ring Gauges */}
        <RoutingScoresHeader record={record} />

        {/* 11 Horizontal Navigation Tabs */}
        <RoutingTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onAddOperation={() => setIsAddModalOpen(true)}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === "operations" && (
            <OperationsTab
              record={record}
              onAddOperation={() => setIsAddModalOpen(true)}
            />
          )}

          {activeTab === "resources" && (
            <ResourcesTab record={record} />
          )}

          {activeTab === "validation" && (
            <ManufacturingValidationTab record={record} />
          )}

          {activeTab === "quality" && (
            <QualityComplianceTab record={record} />
          )}

          {activeTab === "cost" && (
            <CostAnalysisTab record={record} />
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
                toast.success(`Review decision submitted: ${decision}`);
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

        {/* Add Operation Modal */}
        <AddOperationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(op) => addOpMutation.mutate(op)}
          nextSeq={record.operations.length + 1}
        />
      </div>
    </AppShell>
  );
}
