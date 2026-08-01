import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

import {
  WorkInstructionTabBar,
  type WorkInstructionTabId,
} from "@/components/erp/work-instruction/WorkInstructionTabBar";
import { WorkInstructionHeader } from "@/components/erp/work-instruction/WorkInstructionHeader";
import { WorkInstructionOverviewSection } from "@/components/erp/work-instruction/WorkInstructionOverviewSection";
import { StepByStepInstructionBuilder } from "@/components/erp/work-instruction/StepByStepInstructionBuilder";
import { ToolsMaterialsSection } from "@/components/erp/work-instruction/ToolsMaterialsSection";
import { QualityRequirementsSection } from "@/components/erp/work-instruction/QualityRequirementsSection";
import { SafetyComplianceSection } from "@/components/erp/work-instruction/SafetyComplianceSection";
import { TrainingCompetencySection } from "@/components/erp/work-instruction/TrainingCompetencySection";
import { AiWorkInstructionSection } from "@/components/erp/work-instruction/AiWorkInstructionSection";
import { WorkInstructionSummarySection } from "@/components/erp/work-instruction/WorkInstructionSummarySection";
import { WorkInstructionAttachmentManager } from "@/components/erp/work-instruction/WorkInstructionAttachmentManager";
import { WorkInstructionApprovalSection } from "@/components/erp/work-instruction/WorkInstructionApprovalSection";
import { WorkInstructionActivityHistorySection } from "@/components/erp/work-instruction/WorkInstructionActivityHistorySection";
import { WorkInstructionActionBar } from "@/components/erp/work-instruction/WorkInstructionActionBar";

import { workInstructionDevelopmentService } from "@/services/workInstructionDevelopmentService";
import type { WorkInstructionFormInput, WorkInstructionRecord } from "@/services/types";
import { WorkInstructionMasterSchema } from "@/lib/validation/workInstructionSchemas";

export const Route = createFileRoute(
  "/development/research-innovation/work-instruction-development/new",
)({
  component: WorkInstructionDevelopmentNewPage,
});

function WorkInstructionDevelopmentNewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkInstructionTabId>("overview");

  const { data: record, isLoading } = useQuery<WorkInstructionRecord>({
    queryKey: ["work-instruction", "current"],
    queryFn: () => workInstructionDevelopmentService.fetchRecord(),
  });

  const form = useForm<WorkInstructionFormInput>({
    resolver: zodResolver(WorkInstructionMasterSchema) as any,
    defaultValues: record || {},
  });

  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form]);

  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<WorkInstructionFormInput>) =>
      workInstructionDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["work-instruction", "current"], updated);
      toast.success("Work Instruction draft saved successfully!");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => workInstructionDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["work-instruction", "current"], updated);
      toast.success("Submitted for approval!");
    },
  });

  const handleExportReport = () => {
    toast.success("Generating complete Work Instruction PDF document...");
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="Work Instruction Development"
        breadcrumb="Development > Manufacturing Development > Work Instruction Development"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading Work Instruction Development module data...
        </div>
      </AppShell>
    );
  }

  const currentRecordData = { ...record, ...form.watch() };

  return (
    <AppShell
      title="Work Instruction Development"
      breadcrumb="Development > Manufacturing Development > Work Instruction Development"
      description="Author, review and control shop floor assembly work instructions with step sequencing, visual guides, quality checkpoints & AI risk validation."
    >
      <div className="space-y-4">

        <ResearchInnovationTabBar />

        <WorkInstructionHeader
          record={currentRecordData as WorkInstructionRecord}
          onSaveDraft={() => saveDraftMutation.mutate(form.getValues())}
          onSubmitForApproval={() => submitMutation.mutate()}
          onExportReport={handleExportReport}
        />

        <WorkInstructionTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="space-y-6">
          {(activeTab === "overview" || activeTab === "summary") && (
            <WorkInstructionOverviewSection
              form={form}
              record={currentRecordData as WorkInstructionRecord}
              onNavigateTab={(tab) => setActiveTab(tab as WorkInstructionTabId)}
            />
          )}

          {(activeTab === "operation_details" || activeTab === "summary") && (
            <StepByStepInstructionBuilder form={form} />
          )}

          {(activeTab === "tools_materials" || activeTab === "summary") && (
            <ToolsMaterialsSection form={form} />
          )}

          {(activeTab === "quality_requirements" || activeTab === "summary") && (
            <QualityRequirementsSection form={form} />
          )}

          {(activeTab === "safety_compliance" || activeTab === "summary") && (
            <SafetyComplianceSection form={form} />
          )}

          {(activeTab === "training_competency" || activeTab === "summary") && (
            <TrainingCompetencySection form={form} />
          )}

          {(activeTab === "ai_assessment" || activeTab === "summary") && (
            <AiWorkInstructionSection form={form} />
          )}

          {activeTab === "summary" && <WorkInstructionSummarySection form={form} />}

          {(activeTab === "summary" || activeTab === "overview") && (
            <WorkInstructionAttachmentManager
              attachments={record.attachments}
              onAttachmentsChange={(atts) => {
                queryClient.setQueryData(["work-instruction", "current"], {
                  ...record,
                  attachments: atts,
                });
              }}
            />
          )}

          {(activeTab === "review_approval" || activeTab === "summary") && (
            <WorkInstructionApprovalSection form={form} reviewers={record.reviewers} />
          )}

          {(activeTab === "activity_history" || activeTab === "summary") && (
            <WorkInstructionActivityHistorySection activities={record.auditTrail} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
