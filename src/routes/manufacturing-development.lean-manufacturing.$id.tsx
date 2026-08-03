import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Plus,
  RefreshCw,
  Info,
  BookOpen,
} from "lucide-react";

import { leanManufacturingService } from "@/services/leanManufacturingService";
import type {
  LeanManufacturing,
  LeanApprovalDecision,
  RecommendationOption,
  WasteSeverityType,
  ActionPlanRow,
} from "@/lib/lean-manufacturing/types";
import {
  calculateWasteSeverityScore,
  calculateProcessEfficiencyScore,
  calculateOperationalScore,
  calculateContinuousImprovementScore,
  calculateOverallLeanReadiness,
  formatIndianCurrency,
} from "@/lib/lean-manufacturing/scoring";
import { AppShell } from "@/components/erp/AppShell";
import { LeanHeader } from "@/components/lean-manufacturing/LeanHeader";
import { LeanKpis } from "@/components/lean-manufacturing/LeanKpis";
import { LeanWastesGrid } from "@/components/lean-manufacturing/LeanWastesGrid";
import { LeanActionPlanTable } from "@/components/lean-manufacturing/LeanActionPlanTable";
import { LeanBeforeAfterTable } from "@/components/lean-manufacturing/LeanBeforeAfterTable";
import { LeanStandardWorkReleasePanel } from "@/components/lean-manufacturing/LeanStandardWorkReleasePanel";
import { LeanReviewTable } from "@/components/lean-manufacturing/LeanReviewTable";
import { LeanSummaryCard } from "@/components/lean-manufacturing/LeanSummaryCard";
import { LeanAiInsightsCard } from "@/components/lean-manufacturing/LeanAiInsightsCard";
import { LeanAttachmentsCard } from "@/components/lean-manufacturing/LeanAttachmentsCard";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/manufacturing-development/lean-manufacturing/$id")({
  head: () => ({
    meta: [{ title: "Lean Manufacturing Detail · Magnertia ERP" }],
  }),
  component: LeanManufacturingDetailPage,
});

type TabKey =
  | "overview"
  | "wastes"
  | "process"
  | "actionPlan"
  | "performance"
  | "kaizen"
  | "ai"
  | "summary"
  | "review"
  | "attachments"
  | "history";

function LeanManufacturingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Section Refs for sticky tab scrolling
  const sec1Ref = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec3Ref = useRef<HTMLDivElement>(null);
  const sec4Ref = useRef<HTMLDivElement>(null);
  const sec5Ref = useRef<HTMLDivElement>(null);
  const sec6Ref = useRef<HTMLDivElement>(null);
  const sec7Ref = useRef<HTMLDivElement>(null);
  const sec8Ref = useRef<HTMLDivElement>(null);
  const sec9Ref = useRef<HTMLDivElement>(null);
  const secAttachmentsRef = useRef<HTMLDivElement>(null);

  const { data: record, isLoading, refetch } = useQuery<LeanManufacturing>({
    queryKey: ["leanManufacturingRecord", id],
    queryFn: () => leanManufacturingService.fetchRecord(id),
  });

  const saveMutation = useMutation({
    mutationFn: (updated: LeanManufacturing) => leanManufacturingService.saveRecord(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(["leanManufacturingRecord", id], saved);
      toast.success("Draft saved successfully!");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, comments }: { decision: LeanApprovalDecision; comments: string }) =>
      leanManufacturingService.applyDecision(record!, decision, comments),
    onSuccess: (res) => {
      queryClient.setQueryData(["leanManufacturingRecord", id], res.record);
      toast.success(res.message);
    },
    onError: (err: any) => {
      toast.error("Failed to set decision", { description: err?.message });
    },
  });

  const standardWorkActionMutation = useMutation({
    mutationFn: (actionKey: "releaseStandardWork" | "deployNewStandards" | "initiateContinuousImprovement") =>
      leanManufacturingService.fireStandardWorkAction(record!, actionKey),
    onSuccess: (updated) => {
      queryClient.setQueryData(["leanManufacturingRecord", id], updated);
      toast.success("Standard Work action executed!");
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell title="Lean Manufacturing">
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Lean Manufacturing Record...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...record });
  };

  const handleSubmitForApproval = () => {
    const gateCheck = leanManufacturingService.checkGates(record);
    if (!gateCheck.canSubmit) {
      toast.error("Cannot submit for Executive Approval", {
        description: gateCheck.failingGates.join(" • "),
      });
      return;
    }
    const updated = { ...record, workflowStatus: "Under Review" as const };
    saveMutation.mutate(updated);
    toast.success("Submitted for Executive Approval!");
  };

  const handleDecisionChange = (decision: LeanApprovalDecision, comments: string) => {
    decisionMutation.mutate({ decision, comments });
  };

  const handleWasteChange = (wasteKey: string, checked: boolean, severity: WasteSeverityType) => {
    const updatedWastes = {
      ...record.wastes,
      [wasteKey]: { checked, severity },
    };
    const newWasteScore = calculateWasteSeverityScore(updatedWastes);
    saveMutation.mutate({
      ...record,
      wastes: updatedWastes as any,
      wasteSeverityScore: newWasteScore,
    });
  };

  const handleActionPlanUpdate = (index: number, updatedRow: ActionPlanRow) => {
    const newPlan = [...record.actionPlan];
    newPlan[index] = updatedRow;
    saveMutation.mutate({ ...record, actionPlan: newPlan, totalActivities: newPlan.length });
  };

  const handleAddActionRow = () => {
    const newRow: ActionPlanRow = {
      id: `act-${Date.now()}`,
      activity: "New Kaizen Improvement",
      leanTool: "Kaizen",
      owner: record.processOwner,
      status: "In Progress",
      dueDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    const newPlan = [...record.actionPlan, newRow];
    saveMutation.mutate({ ...record, actionPlan: newPlan, totalActivities: newPlan.length });
  };

  const handleDeleteActionRow = (index: number) => {
    const newPlan = record.actionPlan.filter((_, idx) => idx !== index);
    saveMutation.mutate({ ...record, actionPlan: newPlan, totalActivities: newPlan.length });
  };

  const scrollToSection = (tab: TabKey, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const wasteScore = calculateWasteSeverityScore(record.wastes);
  const procScore = calculateProcessEfficiencyScore({
    cycleTimeSec: record.currentCycleTimeSec,
    taktTimeSec: record.taktTimeSec,
    valueAddedRatio: record.valueAddedRatio,
    leadTimeHr: record.leadTimeHr,
  });
  const opsScore = calculateOperationalScore(record.performanceMetrics);
  const ciScore = calculateContinuousImprovementScore(record.kaizenActivities);

  const overallScore = calculateOverallLeanReadiness({
    processEfficiencyScore: procScore,
    operationalScore: opsScore,
    continuousImprovementScore: ciScore,
    aiLeanHealthScore: record.aiLeanHealthScore,
    wasteSeverityScore: wasteScore,
  });

  const isAuthorized =
    record.workflowStatus === "Approved — Continuous Improvement Active" || record.approvalDecision === "Approved";

  return (
    <TooltipProvider>
      <AppShell title="Lean Manufacturing">
        <div className="space-y-4">
          {/* Header Component */}
          <LeanHeader
            record={record}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            onDuplicate={() => toast.info("Record duplicated")}
            onExportPdf={() => toast.info("Exporting PDF report...")}
            onPrint={() => window.print()}
            onArchive={() => toast.warning("Record archived")}
            onCloneFollowup={() => toast.success("Cloned as Follow-up Kaizen Project!")}
          />

          {/* Sticky 11-Tab Bar */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview", ref: sec1Ref },
              { id: "wastes", label: "Waste Identification", ref: sec2Ref },
              { id: "process", label: "Process Analysis", ref: sec3Ref },
              { id: "actionPlan", label: "Action Plan", ref: sec4Ref },
              { id: "performance", label: "Performance", ref: sec5Ref },
              { id: "kaizen", label: "Kaizen", ref: sec6Ref },
              { id: "ai", label: "AI Assessment", ref: sec7Ref },
              { id: "summary", label: "Summary", ref: sec8Ref },
              { id: "review", label: "Review & Approval", ref: sec9Ref },
              { id: "attachments", label: "Attachments", ref: secAttachmentsRef },
              { id: "history", label: "Activity History", ref: sec9Ref },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id as TabKey, tab.ref)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-12 space-y-6">
            {/* Top 6 KPI Donut Strip (Includes inverted Waste Severity) */}
            <LeanKpis
              wasteSeverityScore={wasteScore}
              processEfficiencyScore={procScore}
              operationalScore={opsScore}
              continuousImprovementScore={ciScore}
              aiLeanHealthScore={record.aiLeanHealthScore}
              overallLeanReadiness={overallScore}
            />

            {/* Frozen Current State Snapshot Banner */}
            <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-foreground">
                  Current State Snapshot (Frozen at Creation): OEE {record.currentStateSnapshot?.mes?.oee}%, FPY {record.currentStateSnapshot?.qms?.fpy}%, Changeover {record.changeoverTimeMin} min.
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                Snapshotted: {record.currentStateSnapshot?.snapshotAt}
              </span>
            </div>

            {/* Main Layout: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Main Flow */}
              <div className="lg:col-span-2 space-y-6">
                {/* Section 1 — Lean Improvement Overview */}
                <div ref={sec1Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    1. Lean Improvement Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Improvement Category</label>
                        <select
                          value={record.improvementCategory}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, improvementCategory: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Productivity Improvement">Productivity Improvement</option>
                          <option value="Quality Improvement">Quality Improvement</option>
                          <option value="Cost Reduction">Cost Reduction</option>
                          <option value="Delivery Improvement">Delivery Improvement</option>
                          <option value="Safety Improvement">Safety Improvement</option>
                          <option value="Sustainability">Sustainability</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Lean Methodology</label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {record.leanMethodologies.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 rounded-full"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Improvement Objective</label>
                        <textarea
                          rows={2}
                          value={record.improvementObjective}
                          onChange={(e) => saveMutation.mutate({ ...record, improvementObjective: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Project Priority</label>
                        <select
                          value={record.projectPriority}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, projectPriority: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Improvement Timeline</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={record.timelineStart}
                            onChange={(e) => saveMutation.mutate({ ...record, timelineStart: e.target.value })}
                            className="p-1.5 bg-background border border-input rounded text-foreground font-semibold"
                          />
                          <input
                            type="date"
                            value={record.timelineEnd}
                            onChange={(e) => saveMutation.mutate({ ...record, timelineEnd: e.target.value })}
                            className="p-1.5 bg-background border border-input rounded text-foreground font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Project Status</span>
                        <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-full">
                          {record.projectStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-border">
                    <div>
                      <label className="text-muted-foreground font-semibold block mb-1">Current State Summary</label>
                      <textarea
                        rows={2}
                        value={record.currentStateSummary}
                        onChange={(e) => saveMutation.mutate({ ...record, currentStateSummary: e.target.value })}
                        className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground font-semibold block mb-1">Target State</label>
                      <textarea
                        rows={2}
                        value={record.targetState}
                        onChange={(e) => saveMutation.mutate({ ...record, targetState: e.target.value })}
                        className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2 — Waste Identification (8 Wastes) */}
                <div ref={sec2Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    2. Waste Identification (8 Wastes DOWNTIME Framework)
                  </h2>
                  <LeanWastesGrid
                    wastes={record.wastes}
                    score={wasteScore}
                    onChangeWaste={handleWasteChange}
                  />
                </div>

                {/* Section 3 — Process Analysis */}
                <div ref={sec3Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    3. Process Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Current Cycle Time</span>
                        <span className="font-bold text-foreground">{record.currentCycleTimeSec.toFixed(2)} sec</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Takt Time (Computed)</span>
                        <span className="font-bold text-foreground">{record.taktTimeSec.toFixed(2)} sec</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Lead Time</span>
                        <span className="font-bold text-foreground">{record.leadTimeHr.toFixed(2)} hr</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Changeover Time</span>
                        <span className="font-bold text-foreground">{record.changeoverTimeMin.toFixed(2)} min</span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Bottleneck Process</span>
                        <span className="font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                          {record.bottleneckProcess}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Value-Added Ratio</span>
                        <span className="font-bold text-emerald-600">{record.valueAddedRatio}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-200">
                      Process Efficiency Score: {procScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 4 — Lean Action Plan (Table) */}
                <div ref={sec4Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    4. Lean Action Plan
                  </h2>
                  <LeanActionPlanTable
                    actionPlan={record.actionPlan}
                    expectedCostSaving={record.expectedCostSaving}
                    onUpdateRow={handleActionPlanUpdate}
                    onAddRow={handleAddActionRow}
                    onDeleteRow={handleDeleteActionRow}
                    onCostSavingChange={(saving) => saveMutation.mutate({ ...record, expectedCostSaving: saving })}
                  />
                </div>

                {/* Section 5 — Operational Performance (Before/After Table) */}
                <div ref={sec5Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    5. Operational Performance (Before / After Comparison)
                  </h2>
                  <LeanBeforeAfterTable metrics={record.performanceMetrics} score={opsScore} />
                </div>

                {/* Section 6 — Continuous Improvement (Kaizen) */}
                <div ref={sec6Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    6. Continuous Improvement (Kaizen Activities)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {record.kaizenActivities.map((k, idx) => (
                      <div
                        key={k.id || idx}
                        className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border"
                      >
                        <span className="font-bold text-foreground">{k.name}</span>
                        <select
                          value={k.status}
                          onChange={(e) => {
                            const newK = [...record.kaizenActivities];
                            newK[idx].status = e.target.value as any;
                            const newCiScore = calculateContinuousImprovementScore(newK);
                            saveMutation.mutate({ ...record, kaizenActivities: newK, continuousImprovementScore: newCiScore });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                            k.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : k.status === "In Progress"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <span className="text-xs font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded border border-purple-200">
                      Continuous Improvement Score: {ciScore}/100
                    </span>
                  </div>
                </div>

                {/* Section 7 — AI Lean Assessment */}
                <div ref={sec7Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">7. AI Lean Assessment</h2>
                    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded">
                      AI Lean Health Score: {record.aiLeanHealthScore}/100
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Waste Detection</span>
                      <span className="text-muted-foreground">{record.aiWasteDetection}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Bottleneck Analysis</span>
                      <span className="text-muted-foreground">{record.aiBottleneckAnalysis}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Productivity Forecast</span>
                      <span className="text-muted-foreground">{record.aiProductivityForecast}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Process Optimization</span>
                      <span className="text-muted-foreground">{record.aiProcessOptimization}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Cost Reduction Suggestions</span>
                      <span className="text-muted-foreground">{record.aiCostReductionSuggestions}</span>
                    </div>
                  </div>
                </div>

                {/* Standard Work Release Panel */}
                <LeanStandardWorkReleasePanel
                  actions={record.standardWorkReleaseActions}
                  isAuthorized={isAuthorized}
                  onFireAction={(actionKey) => standardWorkActionMutation.mutate(actionKey)}
                />

                {/* Section 9 — Review & Approval (TABLE-based) */}
                <div ref={sec9Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    9. Review & Approval
                  </h2>
                  <LeanReviewTable
                    reviewers={record.reviewers}
                    currentDecision={record.approvalDecision}
                    comments={record.reviewComments}
                    approvalDate={record.approvalDate}
                    onDecisionChange={handleDecisionChange}
                  />
                </div>

                {/* System Information */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    System Information
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Created By</span>
                      <span className="font-semibold text-foreground">{record.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Created Date</span>
                      <span className="font-medium text-foreground">{record.createdDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Last Modified By</span>
                      <span className="font-semibold text-foreground">{record.lastModifiedBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Last Modified Date</span>
                      <span className="font-medium text-foreground">{record.lastUpdated}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Workflow Stage</span>
                      <span className="font-bold text-foreground">{record.projectStatus}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Version</span>
                      <span className="font-bold text-foreground">{record.version}</span>
                    </div>
                  </div>
                </div>

                {/* History Links Row (4 separate links per late house style) */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-muted-foreground border-t border-border">
                  <button onClick={() => toast.info("Opening Audit Trail drawer...")} className="hover:text-foreground hover:underline">
                    Audit Trail
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Activity History drawer...")} className="hover:text-foreground hover:underline">
                    Activity History
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Change History drawer...")} className="hover:text-foreground hover:underline">
                    Change History
                  </button>
                  <span>·</span>
                  <button onClick={() => toast.info("Opening Workflow History drawer...")} className="hover:text-foreground hover:underline">
                    Workflow History
                  </button>
                </div>
              </div>

              {/* Right Rail Sidebar Column (Float Cards) */}
              <div className="space-y-6">
                {/* AI Insights Card */}
                <LeanAiInsightsCard
                  onJumpToAiSection={() => scrollToSection("ai", sec7Ref)}
                />

                {/* Section 8 Summary Card */}
                <div ref={sec8Ref}>
                  <LeanSummaryCard
                    wasteSeverityScore={wasteScore}
                    processEfficiencyScore={procScore}
                    operationalScore={opsScore}
                    continuousImprovementScore={ciScore}
                    aiLeanHealthScore={record.aiLeanHealthScore}
                    expectedCostSaving={record.expectedCostSaving}
                    realizedCostSaving={record.realizedCostSaving}
                    recommendation={record.recommendation}
                    onRecommendationChange={(rec) => saveMutation.mutate({ ...record, recommendation: rec })}
                  />
                </div>

                {/* Attachments Card Strip */}
                <div ref={secAttachmentsRef}>
                  <LeanAttachmentsCard
                    attachments={record.attachments}
                    onJumpToAttachmentsTab={() => scrollToSection("attachments", secAttachmentsRef)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </TooltipProvider>
  );
}
