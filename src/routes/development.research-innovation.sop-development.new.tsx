import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

import {
  SopTabBar,
  type SopTabId,
} from "@/components/erp/sop-development/SopTabBar";
import { SopHeader } from "@/components/erp/sop-development/SopHeader";
import { SopOverviewSection } from "@/components/erp/sop-development/SopOverviewSection";
import { ProcedureBuilderSection } from "@/components/erp/sop-development/ProcedureBuilderSection";
import { ResourcesRequirementsSection } from "@/components/erp/sop-development/ResourcesRequirementsSection";
import { QualityComplianceSection } from "@/components/erp/sop-development/QualityComplianceSection";
import { RiskSafetySection } from "@/components/erp/sop-development/RiskSafetySection";
import { TrainingImplementationSection } from "@/components/erp/sop-development/TrainingImplementationSection";
import { AiSopAssessmentSection } from "@/components/erp/sop-development/AiSopAssessmentSection";
import { SopSummarySection } from "@/components/erp/sop-development/SopSummarySection";
import { SopAttachmentManager } from "@/components/erp/sop-development/SopAttachmentManager";
import { SopApprovalSection } from "@/components/erp/sop-development/SopApprovalSection";
import { SopActivityHistorySection } from "@/components/erp/sop-development/SopActivityHistorySection";

import { sopDevelopmentService } from "@/services/sopDevelopmentService";
import type { SopFormInput, SopRecord } from "@/services/types";
import { SopMasterSchema } from "@/lib/validation/sopSchemas";

export const Route = createFileRoute(
  "/development/research-innovation/sop-development/new",
)({
  component: SopDevelopmentNewPage,
});

function SopDevelopmentNewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SopTabId>("overview");

  const { data: record, isLoading } = useQuery<SopRecord>({
    queryKey: ["sop-development", "current"],
    queryFn: () => sopDevelopmentService.fetchRecord(),
  });

  const form = useForm<SopFormInput>({
    resolver: zodResolver(SopMasterSchema) as any,
    defaultValues: record || {},
  });

  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form]);

  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<SopFormInput>) =>
      sopDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["sop-development", "current"], updated);
      toast.success("SOP draft saved successfully!");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => sopDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["sop-development", "current"], updated);
      toast.success("Submitted for executive review!");
    },
  });

  const handleExportReport = () => {
    toast.success("Generating complete Standard Operating Procedure (SOP) PDF document...");
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="SOP Development"
        breadcrumb="Development > Manufacturing Development > SOP Development"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading Standard Operating Procedure (SOP) module data...
        </div>
      </AppShell>
    );
  }

  const currentRecordData = { ...record, ...form.watch() };

  return (
    <AppShell
      title="SOP Development"
      breadcrumb="Development > Manufacturing Development > SOP Development"
      description="Author, review, control & distribute Standard Operating Procedures across manufacturing operations with interactive process flow diagrams & ISO compliance audits."
    >
      <div className="space-y-4">
        <ResearchInnovationTabBar />

        <SopHeader
          record={currentRecordData as SopRecord}
          onSaveDraft={() => saveDraftMutation.mutate(form.getValues())}
          onSubmitForApproval={() => submitMutation.mutate()}
          onExportReport={handleExportReport}
        />

        <SopTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="space-y-6">
          {(activeTab === "overview" || activeTab === "summary") && (
            <SopOverviewSection
              form={form}
              record={currentRecordData as SopRecord}
              onNavigateTab={(tab) => setActiveTab(tab as SopTabId)}
            />
          )}

          {(activeTab === "procedure_definition" || activeTab === "summary") && (
            <ProcedureBuilderSection form={form} />
          )}

          {(activeTab === "resources_requirements" || activeTab === "summary") && (
            <ResourcesRequirementsSection form={form} />
          )}

          {(activeTab === "quality_compliance" || activeTab === "summary") && (
            <QualityComplianceSection form={form} />
          )}

          {(activeTab === "risk_safety" || activeTab === "summary") && (
            <RiskSafetySection form={form} />
          )}

          {(activeTab === "training_implementation" || activeTab === "summary") && (
            <TrainingImplementationSection form={form} />
          )}

          {(activeTab === "ai_assessment" || activeTab === "summary") && (
            <AiSopAssessmentSection form={form} />
          )}

          {activeTab === "summary" && <SopSummarySection form={form} />}

          {(activeTab === "summary" || activeTab === "overview") && (
            <SopAttachmentManager
              attachments={record.attachments}
              onAttachmentsChange={(atts) => {
                queryClient.setQueryData(["sop-development", "current"], {
                  ...record,
                  attachments: atts,
                });
              }}
            />
          )}

          {(activeTab === "review_approval" || activeTab === "summary") && (
            <SopApprovalSection form={form} reviewers={record.reviewers} />
          )}

          {(activeTab === "activity_history" || activeTab === "summary") && (
            <SopActivityHistorySection activities={record.auditTrail} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
