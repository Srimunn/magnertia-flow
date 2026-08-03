import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";
import { BomEngineeringHeader } from "@/components/erp/bom-engineering/BomEngineeringHeader";
import { BomScoresHeader } from "@/components/erp/bom-engineering/BomScoresHeader";
import { BomEngineeringTabBar, type BomTabType } from "@/components/erp/bom-engineering/BomEngineeringTabBar";
import { AddComponentModal } from "@/components/erp/bom-engineering/AddComponentModal";

import { OverviewTab } from "@/components/erp/bom-engineering/tabs/OverviewTab";
import { StructureTab } from "@/components/erp/bom-engineering/tabs/StructureTab";
import { MaterialComponentsTab } from "@/components/erp/bom-engineering/tabs/MaterialComponentsTab";
import { ManufacturingReadinessTab } from "@/components/erp/bom-engineering/tabs/ManufacturingReadinessTab";
import { QualityComplianceTab } from "@/components/erp/bom-engineering/tabs/QualityComplianceTab";
import { CostEngineeringTab } from "@/components/erp/bom-engineering/tabs/CostEngineeringTab";
import { AiAssessmentTab } from "@/components/erp/bom-engineering/tabs/AiAssessmentTab";
import { SummaryTab } from "@/components/erp/bom-engineering/tabs/SummaryTab";
import { ReviewApprovalTab } from "@/components/erp/bom-engineering/tabs/ReviewApprovalTab";
import { ActivityHistoryTab } from "@/components/erp/bom-engineering/tabs/ActivityHistoryTab";

import {
  fetchBomRecord,
  saveBomDraft,
  submitBomForReview,
  addBomComponent,
} from "@/services/bomEngineeringService";
import type { BomItemNode } from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/bom-engineering/new",
)({
  component: BomEngineeringPage,
});

export function BomEngineeringPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<BomTabType>("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["bom-engineering-record"],
    queryFn: fetchBomRecord,
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveBomDraft,
    onSuccess: (updated) => {
      queryClient.setQueryData(["bom-engineering-record"], updated);
      toast.success("BOM Engineering Draft saved successfully");
    },
    onError: (err: any) => toast.error(`Failed to save draft: ${err.message}`),
  });

  const submitMutation = useMutation({
    mutationFn: submitBomForReview,
    onSuccess: (updated) => {
      queryClient.setQueryData(["bom-engineering-record"], updated);
      toast.success("BOM Engineering submitted for Executive Board review!");
    },
    onError: (err: any) => toast.error(`Failed to submit: ${err.message}`),
  });

  const addComponentMutation = useMutation({
    mutationFn: addBomComponent,
    onSuccess: (updated) => {
      queryClient.setQueryData(["bom-engineering-record"], updated);
      toast.success("New BOM component added successfully");
    },
    onError: (err: any) => toast.error(`Failed to add component: ${err.message}`),
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="BOM Engineering"
        breadcrumb={breadcrumb}
        tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading BOM Engineering Master Record...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="BOM Engineering"
      breadcrumb={breadcrumb}
      description="Manage manufacturing bill of materials (MBOM), Phantom BOMs, component structures, effectivity dates, and alternate parts."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="space-y-0 min-h-screen bg-background text-foreground">
        {/* Top Header Bar */}
        <BomEngineeringHeader
          record={record}
          onSaveDraft={() => saveDraftMutation.mutate({})}
          onSubmitForReview={() => submitMutation.mutate()}
          onExport={() => toast.info("Exporting BOM to Excel/PDF...")}
          onNewBom={() => {
            setIsAddModalOpen(true);
            toast.info("Creating new BOM entry...");
          }}
        />

        {/* 6 Score Ring Gauges */}
        <BomScoresHeader record={record} />

        {/* 10 Horizontal Navigation Tabs */}
        <BomEngineeringTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Tab View Container */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              record={record}
              onAddComponent={() => setIsAddModalOpen(true)}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === "structure" && (
            <StructureTab
              record={record}
              onAddComponent={() => setIsAddModalOpen(true)}
            />
          )}

          {activeTab === "material" && (
            <MaterialComponentsTab record={record} />
          )}

          {activeTab === "manufacturing" && (
            <ManufacturingReadinessTab record={record} />
          )}

          {activeTab === "quality" && (
            <QualityComplianceTab record={record} />
          )}

          {activeTab === "cost" && (
            <CostEngineeringTab record={record} />
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

          {activeTab === "history" && (
            <ActivityHistoryTab record={record} />
          )}
        </div>

        {/* Add Component Modal */}
        <AddComponentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(item) => addComponentMutation.mutate(item)}
        />
      </div>
    </AppShell>
  );
}
