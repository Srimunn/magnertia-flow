import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, FileText, CheckCircle2, Clock, ShieldCheck, AlertCircle, Paperclip, MessageSquare } from "lucide-react";

import { pilotProductionService } from "@/services";
import type { PilotProductionRecord } from "@/services/types";
import { AppShell } from "@/components/erp/AppShell";
import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
import { PilotProductionHeader } from "@/components/erp/pilotProduction/PilotProductionHeader";
import { PilotProductionTopBadges } from "@/components/erp/pilotProduction/PilotProductionTopBadges";
import { PilotProductionTabBar, type PilotProductionTabId } from "@/components/erp/PilotProductionTabBar";
import { PilotProductionOverviewCard } from "@/components/erp/pilotProduction/PilotProductionOverviewCard";
import { PilotProductionPlanningCard } from "@/components/erp/pilotProduction/PilotProductionPlanningCard";
import { PilotProductionExecutionCard } from "@/components/erp/pilotProduction/PilotProductionExecutionCard";
import { PilotProductionQualityCard } from "@/components/erp/pilotProduction/PilotProductionQualityCard";
import { PilotProductionPerformanceCard } from "@/components/erp/pilotProduction/PilotProductionPerformanceCard";
import { PilotProductionReadinessCard } from "@/components/erp/pilotProduction/PilotProductionReadinessCard";
import { PilotProductionAiCard } from "@/components/erp/pilotProduction/PilotProductionAiCard";
import { PilotProductionSummaryCard } from "@/components/erp/pilotProduction/PilotProductionSummaryCard";
import { PilotProductionAiInsightsPanel } from "@/components/erp/pilotProduction/PilotProductionAiInsightsPanel";
import { PilotProductionDocumentLinksCard } from "@/components/erp/pilotProduction/PilotProductionDocumentLinksCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/development/research-innovation/pilot-production/new",
)({
  head: () => ({
    meta: [{ title: "Pilot Production Form · Magnertia ERP" }],
  }),
  component: PilotProductionNewPage,
});

function PilotProductionNewPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PilotProductionTabId>("overview");

  // Data Fetching
  const { data: record, isLoading } = useQuery<PilotProductionRecord>({
    queryKey: ["pilotProductionRecord"],
    queryFn: () => pilotProductionService.fetchRecord(),
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<PilotProductionRecord>) => pilotProductionService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["pilotProductionRecord"], updated);
      toast.success("Draft saved successfully!", { description: "Pilot Production batch parameters updated." });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", { description: err?.message || "An error occurred." });
    },
  });

  // Submit Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: () => pilotProductionService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["pilotProductionRecord"], updated);
      toast.success("Submitted for Executive Review!", { description: "Review board notifications sent." });
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        title="Pilot Production"
        breadcrumb="Development → Manufacturing Development"
        description="Govern pilot production batch planning, trial runs, quality verification, process performance, and AI-driven readiness."
        tabs={<ResearchInnovationTabBar />}
      >
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Pilot Production Module...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({ ...record });
  };

  const handleSubmitForReview = () => {
    submitReviewMutation.mutate();
  };

  const handleExport = () => {
    toast.success("Exporting Pilot Production Report (PDF)...");
  };

  const handleNewPilot = () => {
    toast.info("Creating new Pilot Production batch...");
  };

  return (
    <AppShell
      title="Pilot Production"
      breadcrumb="Development → Manufacturing Development"
      description="Govern pilot production batch planning, trial runs, quality verification, process performance, and AI-driven readiness."
      tabs={<ResearchInnovationTabBar />}
    >
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased space-y-4 pb-16">
        
        {/* Top Header Card */}
        <PilotProductionHeader
          record={record}
          onSaveDraft={handleSaveDraft}
          onSubmitForReview={handleSubmitForReview}
          onExport={handleExport}
          onNewPilot={handleNewPilot}
        />

        {/* Top KPI Gauge Badges */}
        <PilotProductionTopBadges record={record} />

        {/* Tab Navigation Bar */}
        <PilotProductionTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Tab Content */}
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-2">
          
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionOverviewCard record={record} />
                <PilotProductionExecutionCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionAiInsightsPanel aiAssessment={record.aiAssessment} />
                <PilotProductionDocumentLinksCard attachments={record.attachments} />
              </div>
            </div>
          )}

          {/* Tab 2: Design */}
          {activeTab === "design" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionOverviewCard record={record} />
                <PilotProductionPlanningCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionAiInsightsPanel aiAssessment={record.aiAssessment} />
              </div>
            </div>
          )}

          {/* Tab 3: Resources */}
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionPlanningCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionReadinessCard record={record} />
              </div>
            </div>
          )}

          {/* Tab 4: Validation */}
          {activeTab === "validation" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionQualityCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionReadinessCard record={record} />
              </div>
            </div>
          )}

          {/* Tab 5: Standardization */}
          {activeTab === "standardization" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionQualityCard record={record} />
                <PilotProductionDocumentLinksCard attachments={record.attachments} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionSummaryCard record={record} />
              </div>
            </div>
          )}

          {/* Tab 6: Performance */}
          {activeTab === "performance" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionPerformanceCard record={record} />
                <PilotProductionExecutionCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionAiCard record={record} />
              </div>
            </div>
          )}

          {/* Tab 7: AI Assessment */}
          {activeTab === "ai_assessment" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionAiCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionAiInsightsPanel aiAssessment={record.aiAssessment} />
              </div>
            </div>
          )}

          {/* Tab 8: Summary */}
          {activeTab === "summary" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-4">
                <PilotProductionSummaryCard record={record} />
                <PilotProductionReadinessCard record={record} />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <PilotProductionAiInsightsPanel aiAssessment={record.aiAssessment} />
              </div>
            </div>
          )}

          {/* Tab 9: Attachments */}
          {activeTab === "attachments" && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Pilot Production Attachments ({record.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="divide-y divide-border/60">
                  {record.attachments.map((att) => (
                    <div key={att.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {att.documentType} • v{att.version} • {att.fileSize} • Uploaded by {att.uploadedBy} on {att.uploadedDate}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {att.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 10: Review & Approval */}
          {activeTab === "review_approval" && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Review Board Approvals (7 Governance Roles)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="divide-y divide-border/60">
                  {record.reviewers.map((rev, idx) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rev.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {rev.person} • {rev.date || "Pending"}
                        </p>
                        {rev.comments && (
                          <p className="text-xs italic text-slate-600 dark:text-slate-400 mt-1">"{rev.comments}"</p>
                        )}
                      </div>
                      <Badge
                        className={
                          rev.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }
                      >
                        {rev.status} ({rev.decision})
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 11: System Information */}
          {activeTab === "system_info" && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  System Audit Trail & Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-border/60">
                  <div>
                    <span className="text-muted-foreground block">Created By</span>
                    <span className="font-semibold">{record.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Created Date</span>
                    <span className="font-semibold">{record.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Last Modified By</span>
                    <span className="font-semibold">{record.lastModifiedBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Last Modified Date</span>
                    <span className="font-semibold">{record.lastModifiedDate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Audit Log</h4>
                  <div className="space-y-2">
                    {record.auditTrail.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-md border border-border/60 bg-white dark:bg-slate-900 flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{log.action}</p>
                          <p className="text-muted-foreground">{log.description}</p>
                          {log.stage && <p className="text-[11px] text-primary font-medium">{log.stage}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-medium">{log.user}</p>
                          <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </AppShell>
  );
}
