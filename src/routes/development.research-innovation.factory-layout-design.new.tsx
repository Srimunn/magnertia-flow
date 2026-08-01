import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Sparkles,
  CheckCircle2,
  FileText,
  Workflow,
  Info,
  ArrowRight,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

import {
  FactoryLayoutTabBar,
  type FactoryLayoutTabId,
} from "@/components/erp/factory-layout/FactoryLayoutTabBar";
import { FactoryLayoutHeader } from "@/components/erp/factory-layout/FactoryLayoutHeader";
import { FactoryOverviewSection } from "@/components/erp/factory-layout/FactoryOverviewSection";
import { LayoutPlanningSection } from "@/components/erp/factory-layout/LayoutPlanningSection";
import { InfrastructureSection } from "@/components/erp/factory-layout/InfrastructureSection";
import { MaterialFlowSection } from "@/components/erp/factory-layout/MaterialFlowSection";
import { UtilitySafetySection } from "@/components/erp/factory-layout/UtilitySafetySection";
import { FactoryPerformanceSection } from "@/components/erp/factory-layout/FactoryPerformanceSection";
import { AiFactoryAssessmentSection } from "@/components/erp/factory-layout/AiFactoryAssessmentSection";
import { DigitalTwinPanel } from "@/components/erp/factory-layout/DigitalTwinPanel";
import { FactoryLayoutSummarySection } from "@/components/erp/factory-layout/FactoryLayoutSummarySection";
import { FactoryAttachmentManager } from "@/components/erp/factory-layout/FactoryAttachmentManager";
import { FactoryApprovalSection } from "@/components/erp/factory-layout/FactoryApprovalSection";
import { FactoryActivityHistorySection } from "@/components/erp/factory-layout/FactoryActivityHistorySection";
import { FactoryActionBar } from "@/components/erp/factory-layout/FactoryActionBar";

import { factoryLayoutDesignService } from "@/services/factoryLayoutDesignService";
import type { FactoryLayoutFormInput, FactoryLayoutRecord } from "@/services/types";
import { FactoryLayoutMasterSchema } from "@/lib/validation/factoryLayoutSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
  "/development/research-innovation/factory-layout-design/new",
)({
  component: FactoryLayoutDesignNewPage,
});

function FactoryLayoutDesignNewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FactoryLayoutTabId>("overview");

  const { data: record, isLoading } = useQuery<FactoryLayoutRecord>({
    queryKey: ["factory-layout", "current"],
    queryFn: () => factoryLayoutDesignService.fetchRecord(),
  });

  const form = useForm<FactoryLayoutFormInput>({
    resolver: zodResolver(FactoryLayoutMasterSchema) as any,
    defaultValues: record || {},
  });

  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form]);

  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<FactoryLayoutFormInput>) =>
      factoryLayoutDesignService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["factory-layout", "current"], updated);
      toast.success("Draft saved successfully!");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => factoryLayoutDesignService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["factory-layout", "current"], updated);
      toast.success("Submitted for review!");
    },
  });

  const handleExportReport = () => {
    toast.success("Generating complete Factory Layout Design engineering PDF report...");
  };

  if (isLoading || !record) {
    return (
      <AppShell
        title="Factory Layout Design"
        breadcrumb="Development > Manufacturing Development > Factory Layout Design"
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading Factory Layout Design module data...
        </div>
      </AppShell>
    );
  }

  const currentRecordData = { ...record, ...form.watch() };

  return (
    <AppShell
      title="Factory Layout Design"
      breadcrumb="Development > Manufacturing Development > Factory Layout Design"
      description="CAD layout blueprints, material logistics flow, utility planning, digital twin simulation & EHS compliance."
    >
      <div className="space-y-4">

        <ResearchInnovationTabBar />

        <FactoryLayoutHeader
          record={currentRecordData as FactoryLayoutRecord}
          onSaveDraft={() => saveDraftMutation.mutate(form.getValues())}
          onSubmitForReview={() => submitMutation.mutate()}
          onExportReport={handleExportReport}
        />

        <FactoryLayoutTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {(activeTab === "overview" || activeTab === "summary") && (
              <FactoryOverviewSection form={form} />
            )}

            {(activeTab === "planning" || activeTab === "summary") && (
              <LayoutPlanningSection form={form} />
            )}

            {(activeTab === "infrastructure" || activeTab === "summary") && (
              <InfrastructureSection form={form} />
            )}

            {(activeTab === "logistics" || activeTab === "summary") && (
              <MaterialFlowSection form={form} />
            )}

            {(activeTab === "utilities_safety" || activeTab === "summary") && (
              <UtilitySafetySection form={form} />
            )}

            {(activeTab === "performance" || activeTab === "summary") && (
              <FactoryPerformanceSection form={form} />
            )}

            {(activeTab === "ai_assessment" || activeTab === "summary") && (
              <AiFactoryAssessmentSection form={form} />
            )}

            {(activeTab === "ai_assessment" || activeTab === "planning" || activeTab === "summary") && (
              <DigitalTwinPanel layoutId={record.id} />
            )}

            {activeTab === "summary" && <FactoryLayoutSummarySection form={form} />}

            {(activeTab === "summary" || activeTab === "overview") && (
              <FactoryAttachmentManager
                attachments={record.attachments}
                onAttachmentsChange={(atts) => {
                  queryClient.setQueryData(["factory-layout", "current"], {
                    ...record,
                    attachments: atts,
                  });
                }}
              />
            )}

            {(activeTab === "review_approval" || activeTab === "summary") && (
              <FactoryApprovalSection form={form} reviewers={record.reviewers} />
            )}

            {(activeTab === "activity_history" || activeTab === "summary") && (
              <FactoryActivityHistorySection activities={record.auditTrail} />
            )}
          </div>

          <div className="lg:col-span-4 space-y-5">
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Space utilization optimized: 78%</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Material travel distance reduced by 23%</span>
                </div>
                <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>AI predicts 12% throughput improvement</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>All safety norms and EHS compliant</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Digital twin simulation completed</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Ready for implementation & construction</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                {[
                  "Upload Layout Drawing",
                  "Run Digital Twin Simulation",
                  "Generate Material Flow Report",
                  "View Space Utilization Report",
                  "View Utility Layout",
                  "View Safety Plan",
                  "Export Factory Layout Report",
                ].map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toast.info(`Action triggered: ${act}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground transition-colors font-medium text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {act}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Workflow className="h-4 w-4 text-primary" />
                  Layout Milestone Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {record.timeline.map((m) => {
                  const isDone = m.status === "Completed";
                  const isInProgress = m.status === "In Progress";
                  return (
                    <div key={m.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isDone
                              ? "bg-emerald-500"
                              : isInProgress
                              ? "bg-blue-500 animate-pulse"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        />
                        <span
                          className={
                            isDone
                              ? "font-semibold text-foreground"
                              : isInProgress
                              ? "font-bold text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground"
                          }
                        >
                          {m.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {m.date}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-slate-500" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium text-foreground">{record.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created Date</span>
                  <span className="font-mono text-foreground">{record.createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Modified By</span>
                  <span className="font-medium text-foreground">{record.lastModifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Modified Date</span>
                  <span className="font-mono text-foreground">{record.lastModifiedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflow Stage</span>
                  <span className="font-semibold text-primary">{record.workflowStageLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono text-foreground">{record.layoutVersion}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

