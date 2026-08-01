import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Info,
  Layers,
  Paperclip,
  Printer,
  Save,
  Send,
  Sparkles,
  User,
  Workflow,
  Plus,
  ArrowRight,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";

import {
  JigDevelopmentTabBar,
  type JigDevelopmentTabId,
} from "@/components/erp/jig-development/JigDevelopmentTabBar";
import { JigDevelopmentHeader } from "@/components/erp/jig-development/JigDevelopmentHeader";
import { JigOverviewSection } from "@/components/erp/jig-development/JigOverviewSection";
import { JigDesignSection } from "@/components/erp/jig-development/JigDesignSection";
import { JigManufacturingSection } from "@/components/erp/jig-development/JigManufacturingSection";
import { JigValidationSection } from "@/components/erp/jig-development/JigValidationSection";
import { JigCommissioningSection } from "@/components/erp/jig-development/JigCommissioningSection";
import { JigPerformanceSection } from "@/components/erp/jig-development/JigPerformanceSection";
import { JigAiAssessmentSection } from "@/components/erp/jig-development/JigAiAssessmentSection";
import { JigSummarySection } from "@/components/erp/jig-development/JigSummarySection";
import { JigAttachmentManager } from "@/components/erp/jig-development/JigAttachmentManager";
import { JigApprovalSection } from "@/components/erp/jig-development/JigApprovalSection";
import { JigActivityHistorySection } from "@/components/erp/jig-development/JigActivityHistorySection";
import { JigActionBar } from "@/components/erp/jig-development/JigActionBar";

import { jigDevelopmentService } from "@/services/jigDevelopmentService";
import type { JigFormInput, JigRecord } from "@/services/types";
import { JigDevelopmentMasterSchema } from "@/lib/validation/jigDevelopmentSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/development/research-innovation/jig-development/new",
)({
  component: JigDevelopmentNewPage,
});

function JigDevelopmentNewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JigDevelopmentTabId>("overview");

  // TanStack Query for record retrieval
  const { data: record, isLoading } = useQuery<JigRecord>({
    queryKey: ["jig-development", "current"],
    queryFn: () => jigDevelopmentService.fetchRecord(),
  });

  // Central React Hook Form state
  const form = useForm<JigFormInput>({
    resolver: zodResolver(JigDevelopmentMasterSchema) as any,
    defaultValues: record || {},
  });


  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<JigFormInput>) =>
      jigDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["jig-development", "current"], updated);
      toast.success("Draft saved successfully!");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => jigDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["jig-development", "current"], updated);
      toast.success("Submitted for review!");
    },
  });

  const handleExportReport = () => {
    toast.success("Generating complete Jig Development engineering PDF report...");
  };

  if (isLoading || !record) {
    return (
      <AppShell title="Jig Development" breadcrumb="Development > Manufacturing Development > Jig Development">
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading Jig Development module data...
        </div>
      </AppShell>
    );
  }

  const currentRecordData = { ...record, ...form.watch() };

  return (
    <AppShell
      title="Jig Development"
      breadcrumb="Development > Manufacturing Development > Jig Development"
      description="Design, validation, manufacturing & lifecycle tracking for high-precision manufacturing jigs."
    >
      <div className="space-y-4">

        {/* Module Level Navigation Tab Bar */}
        <ResearchInnovationTabBar />

        {/* Executive Header Card */}
        <JigDevelopmentHeader
          record={currentRecordData as JigRecord}
          onSaveDraft={() => saveDraftMutation.mutate(form.getValues())}
          onSubmitForReview={() => submitMutation.mutate()}
          onExportReport={handleExportReport}
        />

        {/* Module Tab Navigation Bar */}
        <JigDevelopmentTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Primary Form / Tab Sections) */}
          <div className="lg:col-span-8 space-y-6">
            {(activeTab === "overview" || activeTab === "summary") && (
              <JigOverviewSection form={form} />
            )}

            {(activeTab === "design" || activeTab === "summary") && (
              <JigDesignSection form={form} />
            )}

            {(activeTab === "manufacturing" || activeTab === "summary") && (
              <JigManufacturingSection form={form} />
            )}

            {(activeTab === "validation" || activeTab === "summary") && (
              <JigValidationSection form={form} />
            )}

            {(activeTab === "commissioning" || activeTab === "summary") && (
              <JigCommissioningSection form={form} />
            )}

            {(activeTab === "performance" || activeTab === "summary") && (
              <JigPerformanceSection form={form} />
            )}

            {(activeTab === "ai_assessment" || activeTab === "summary") && (
              <JigAiAssessmentSection form={form} />
            )}

            {activeTab === "summary" && <JigSummarySection form={form} />}

            {(activeTab === "summary" || activeTab === "overview") && (
              <JigAttachmentManager
                attachments={record.attachments}
                onAttachmentsChange={(atts) => {
                  queryClient.setQueryData(["jig-development", "current"], {
                    ...record,
                    attachments: atts,
                  });
                }}
              />
            )}

            {(activeTab === "review_approval" || activeTab === "summary") && (
              <JigApprovalSection form={form} reviewers={record.reviewers} />
            )}

            {(activeTab === "activity_history" || activeTab === "summary") && (
              <JigActivityHistorySection activities={record.auditTrail} />
            )}
          </div>

          {/* Right Column: Quick Highlights, Actions, Timeline & System Info */}
          <div className="lg:col-span-4 space-y-5">
            {/* Key Highlights Card */}
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
                  <span>Design review score achieved: 88%</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Tool guidance accuracy: 0.025 mm</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Trial jig validation successful</span>
                </div>
                <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>AI predicts 500,000 cycles jig life</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Ready for installation & commissioning</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Icon Grid */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                {[
                  "Create Jig Concept",
                  "Upload CAD Model",
                  "Generate Manufacturing Plan",
                  "Run Jig Validation",
                  "Schedule Calibration",
                  "View Jig Life Dashboard",
                  "View Maintenance Plan",
                  "Export Jig Report",
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

            {/* Jig Timeline Progress */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Workflow className="h-4 w-4 text-primary" />
                  Jig Milestone Timeline
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

            {/* System Information Panel */}
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
                  <span className="font-mono text-foreground">{record.jigVersion}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

