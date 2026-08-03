import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

import {
  CapacityPlanningTabBar,
  type CapacityPlanningTabId,
} from "@/components/erp/capacity-planning/CapacityPlanningTabBar";
import { CapacityPlanningHeader } from "@/components/erp/capacity-planning/CapacityPlanningHeader";
import { CapacityOverviewSection } from "@/components/erp/capacity-planning/CapacityOverviewSection";
import { CapacityAssessmentSection } from "@/components/erp/capacity-planning/CapacityAssessmentSection";
import { ResourcePlanningSection } from "@/components/erp/capacity-planning/ResourcePlanningSection";
import { BottleneckAnalysisSection } from "@/components/erp/capacity-planning/BottleneckAnalysisSection";
import { CapacitySimulationSection } from "@/components/erp/capacity-planning/CapacitySimulationSection";
import { CapacityPerformanceSection } from "@/components/erp/capacity-planning/CapacityPerformanceSection";
import { AiCapacityAssessmentSection } from "@/components/erp/capacity-planning/AiCapacityAssessmentSection";
import { CapacitySummarySection } from "@/components/erp/capacity-planning/CapacitySummarySection";
import { CapacityAttachmentManager } from "@/components/erp/capacity-planning/CapacityAttachmentManager";
import { CapacityApprovalSection } from "@/components/erp/capacity-planning/CapacityApprovalSection";
import { CapacityActivityHistorySection } from "@/components/erp/capacity-planning/CapacityActivityHistorySection";
import { CapacityActionBar } from "@/components/erp/capacity-planning/CapacityActionBar";

import { capacityPlanningService } from "@/services/capacityPlanningService";
import type { CapacityFormInput, CapacityPlanningRecord } from "@/services/types";
import { CapacityPlanningMasterSchema } from "@/lib/validation/capacityPlanningSchemas";

export const Route = createFileRoute(
  "/development/research-innovation/capacity-planning/new",
)({
  component: CapacityPlanningNewPage,
});

import { ManufacturingDevelopmentTabBar } from "@/components/erp/ManufacturingDevelopmentTabBar";

export function CapacityPlanningNewPage({
  breadcrumb = "Development > Manufacturing Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CapacityPlanningTabId>("overview");

  const { data: record, isLoading } = useQuery<CapacityPlanningRecord>({
    queryKey: ["capacity-planning", "current"],
    queryFn: () => capacityPlanningService.fetchRecord(),
  });

  const form = useForm<CapacityFormInput>({
    resolver: zodResolver(CapacityPlanningMasterSchema) as any,
    defaultValues: record || {},
  });

  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form]);

  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<CapacityFormInput>) =>
      capacityPlanningService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["capacity-planning", "current"], updated);
      toast.success("Draft saved successfully!");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => capacityPlanningService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["capacity-planning", "current"], updated);
      toast.success("Submitted for review!");
    },
  });

  const handleExportReport = () => {
    toast.success("Generating complete Capacity Planning engineering PDF report...");
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="Capacity Planning"
        breadcrumb={breadcrumb}
        tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Capacity Planning Master Record...
        </div>
      </AppShell>
    );
  }

  const currentRecordData = { ...record, ...form.watch() };

  return (
    <AppShell
      title="Capacity Planning"
      breadcrumb={breadcrumb}
      description="Calculate machine hours, shift availability, bottleneck constraints, line balancing, and throughput analysis."
      tabs={tabs ?? <ManufacturingDevelopmentTabBar />}
    >
      <div className="space-y-4">

        <CapacityPlanningHeader
          record={currentRecordData as CapacityPlanningRecord}
          onSaveDraft={() => saveDraftMutation.mutate(form.getValues())}
          onSubmitForReview={() => submitMutation.mutate()}
          onExportReport={handleExportReport}
        />

        <CapacityPlanningTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="space-y-6">
          {(activeTab === "overview" || activeTab === "summary") && (
            <CapacityOverviewSection form={form} record={currentRecordData as CapacityPlanningRecord} />
          )}

          {(activeTab === "assessment" || activeTab === "summary") && (
            <CapacityAssessmentSection form={form} />
          )}

          {(activeTab === "resource_planning" || activeTab === "summary") && (
            <ResourcePlanningSection form={form} />
          )}

          {(activeTab === "bottleneck_analysis" || activeTab === "summary") && (
            <BottleneckAnalysisSection form={form} />
          )}

          {(activeTab === "simulation" || activeTab === "summary") && (
            <CapacitySimulationSection form={form} />
          )}

          {(activeTab === "performance" || activeTab === "summary") && (
            <CapacityPerformanceSection form={form} />
          )}

          {(activeTab === "ai_assessment" || activeTab === "summary") && (
            <AiCapacityAssessmentSection form={form} />
          )}

          {activeTab === "summary" && <CapacitySummarySection form={form} />}

          {(activeTab === "summary" || activeTab === "overview") && (
            <CapacityAttachmentManager
              attachments={record.attachments}
              onAttachmentsChange={(atts) => {
                queryClient.setQueryData(["capacity-planning", "current"], {
                  ...record,
                  attachments: atts,
                });
              }}
            />
          )}

          {(activeTab === "review_approval" || activeTab === "summary") && (
            <CapacityApprovalSection form={form} reviewers={record.reviewers} />
          )}

          {(activeTab === "activity_history" || activeTab === "summary") && (
            <CapacityActivityHistorySection activities={record.auditTrail} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
