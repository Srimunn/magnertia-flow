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
} from "lucide-react";

import { pilotProductionService } from "@/services/pilotProductionService";
import type { PilotProductionRecord, ApprovalDecision } from "@/lib/pilot-production/types";
import { calculateReadinessScore, calculateOverallPilotReadiness, calculateRecommendation } from "@/lib/pilot-production/scoring";
import { AppShell } from "@/components/erp/AppShell";
import { PilotProductionHeader } from "@/components/pilot-production/PilotProductionHeader";
import { PilotProductionKpis } from "@/components/pilot-production/PilotProductionKpis";
import { PilotProductionTrendChart } from "@/components/pilot-production/PilotProductionTrendChart";
import { PilotProductionReviewTable } from "@/components/pilot-production/PilotProductionReviewTable";
import { PilotProductionSummaryCard } from "@/components/pilot-production/PilotProductionSummaryCard";
import { PilotProductionAiInsightsCard } from "@/components/pilot-production/PilotProductionAiInsightsCard";
import { PilotProductionAttachmentsCard } from "@/components/pilot-production/PilotProductionAttachmentsCard";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/manufacturing-development/pilot-production/$id")({
  head: () => ({
    meta: [{ title: "Pilot Production Detail · Magnertia ERP" }],
  }),
  component: PilotProductionDetailPage,
});

type TabKey =
  | "overview"
  | "planning"
  | "execution"
  | "quality"
  | "performance"
  | "readiness"
  | "ai"
  | "summary"
  | "review"
  | "history";

function PilotProductionDetailPage() {
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
  const sec10Ref = useRef<HTMLDivElement>(null);

  const { data: record, isLoading, refetch } = useQuery<PilotProductionRecord>({
    queryKey: ["pilotProductionRecord", id],
    queryFn: () => pilotProductionService.fetchRecord(id),
  });

  const saveMutation = useMutation({
    mutationFn: (updated: PilotProductionRecord) => pilotProductionService.saveRecord(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(["pilotProductionRecord", id], saved);
      toast.success("Draft saved successfully!");
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, comments }: { decision: ApprovalDecision; comments: string }) =>
      pilotProductionService.applyDecision(record!, decision, comments),
    onSuccess: (res) => {
      queryClient.setQueryData(["pilotProductionRecord", id], res.record);
      toast.success(res.message);
      if (res.newChildRecord) {
        toast.info(`Created repeat pilot record: ${res.newChildRecord.id}`);
      }
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell title="Pilot Production">
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading Pilot Production Record...</p>
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...record });
  };

  const handleSubmitForReview = () => {
    const updated = { ...record, workflowStatus: "Under Review" as const };
    saveMutation.mutate(updated);
    toast.success("Submitted for Executive Review!");
  };

  const handleDecisionChange = (decision: ApprovalDecision, comments: string) => {
    decisionMutation.mutate({ decision, comments });
  };

  const scrollToSection = (tab: TabKey, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const calculatedReadiness = calculateReadinessScore({
    equipmentReadiness: record.equipmentReadiness,
    toolingReadiness: record.toolingReadiness,
    operatorReadiness: record.operatorReadiness,
    materialReadiness: record.materialReadiness,
    safetyReadiness: record.safetyReadiness,
    documentationComplete: record.documentationComplete,
  });

  const calculatedOverall = calculateOverallPilotReadiness({
    productionScore: record.productionScore,
    qualityScore: record.qualityScore,
    performanceScore: record.performanceScore,
    readinessScore: calculatedReadiness,
    aiHealthScore: record.aiProductionHealthScore,
  });

  const calculatedRec = calculateRecommendation(
    calculatedOverall,
    record.qualityScore,
    record.aiProductionHealthScore
  );

  return (
    <TooltipProvider>
      <AppShell title="Pilot Production">
        <div className="space-y-4">
          {/* Header Component */}
          <PilotProductionHeader
            record={record}
            onSaveDraft={handleSaveDraft}
            onSubmitForReview={handleSubmitForReview}
            onDuplicate={() => toast.info("Record duplicated")}
            onExportPdf={() => toast.info("Exporting PDF report...")}
            onPrint={() => window.print()}
            onArchive={() => toast.warning("Record archived")}
          />

          {/* Sticky Tab Bar (10 Tabs) */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview", ref: sec1Ref },
              { id: "planning", label: "Production Planning", ref: sec2Ref },
              { id: "execution", label: "Production Execution", ref: sec3Ref },
              { id: "quality", label: "Quality Verification", ref: sec4Ref },
              { id: "performance", label: "Process Performance", ref: sec5Ref },
              { id: "readiness", label: "Production Readiness", ref: sec6Ref },
              { id: "ai", label: "AI Assessment", ref: sec7Ref },
              { id: "summary", label: "Summary", ref: sec8Ref },
              { id: "review", label: "Review & Approval", ref: sec10Ref },
              { id: "history", label: "Activity History", ref: sec10Ref },
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
            {/* Top KPI Donut Strip (7 cards) */}
            <PilotProductionKpis
              plannedQuantity={record.plannedQuantity}
              actualQuantity={record.actualQuantity}
              oee={record.oee}
              fpy={record.fpy}
              defectRate={record.defectRate}
              overallReadiness={calculatedOverall}
              aiHealthScore={record.aiProductionHealthScore}
            />

            {/* Main Layout: 2 Columns on Desktop (Main Flow + Right Rail Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Numbered Sections */}
              <div className="lg:col-span-2 space-y-6">
                {/* Section 1 — Pilot Production Overview */}
                <div ref={sec1Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    1. Pilot Production Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Pilot Objective</label>
                        <textarea
                          rows={2}
                          value={record.pilotObjective}
                          onChange={(e) => saveMutation.mutate({ ...record, pilotObjective: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Production Scope</label>
                        <textarea
                          rows={2}
                          value={record.productionScope}
                          onChange={(e) => saveMutation.mutate({ ...record, productionScope: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Production Location</label>
                        <select
                          value={record.productionLocation}
                          onChange={(e) => saveMutation.mutate({ ...record, productionLocation: e.target.value })}
                          className="w-full p-2 bg-background border border-input rounded-md text-foreground"
                        >
                          <option value="Plant-01">Plant-01</option>
                          <option value="Plant-02">Plant-02</option>
                          <option value="Plant-03">Plant-03</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Pilot Team</label>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {record.pilotTeam.slice(0, 4).map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full font-bold text-foreground text-[10px]"
                            >
                              <User className="w-3 h-3 text-muted-foreground" />
                              {m.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          ))}
                          {record.pilotTeam.length > 4 && (
                            <span className="px-2 py-1 bg-accent rounded-full font-bold text-muted-foreground text-[10px]">
                              +{record.pilotTeam.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Process Owner</label>
                        <div className="flex items-center gap-2 p-2 bg-muted/40 rounded border border-border">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-foreground">{record.processOwner}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Production Schedule</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={record.scheduleStart}
                            onChange={(e) => saveMutation.mutate({ ...record, scheduleStart: e.target.value })}
                            className="p-1.5 bg-background border border-input rounded text-foreground"
                          />
                          <input
                            type="date"
                            value={record.scheduleEnd}
                            onChange={(e) => saveMutation.mutate({ ...record, scheduleEnd: e.target.value })}
                            className="p-1.5 bg-background border border-input rounded text-foreground"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Lifecycle Stage</label>
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold rounded-full">
                          {record.lifecycleStage}
                        </span>
                      </div>
                      <div>
                        <label className="text-muted-foreground font-semibold block mb-1">Priority</label>
                        <select
                          value={record.priority}
                          onChange={(e) =>
                            saveMutation.mutate({ ...record, priority: e.target.value as any })
                          }
                          className="w-full p-2 bg-background border border-input rounded-md text-foreground"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 — Production Planning */}
                <div ref={sec2Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    2. Production Planning
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Production Order</span>
                        <a
                          href={`/production-planning/production-order/${record.productionOrderRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded font-bold text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          {record.productionOrderRef} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">BOM Reference</span>
                        <a
                          href={`/manufacturing-development/bom-engineering/${record.bomReference}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                        >
                          {record.bomReference} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Routing Reference</span>
                        <a
                          href={`/manufacturing-development/routing-development/${record.routingReference}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded font-bold text-purple-700 dark:text-purple-300 hover:underline"
                        >
                          {record.routingReference} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-muted-foreground font-semibold block">Planned Quantity</span>
                          <span className="font-extrabold text-foreground text-sm">
                            {record.plannedQuantity.toLocaleString()} Units
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-semibold block">Actual Quantity</span>
                          <span className="font-extrabold text-foreground text-sm">
                            {record.actualQuantity.toLocaleString()} Units
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground font-semibold">Material Availability</span>
                          {!record.materialAvailabilityAuto && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                              (manual)
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300">
                          {record.materialAvailability} ✓
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Machine Allocation</span>
                        <div className="flex flex-wrap gap-1.5">
                          {record.machineAllocations.map((wc, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-muted rounded border border-border font-bold text-foreground"
                            >
                              {wc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">Operator Assignment</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded font-bold text-foreground border border-border">
                          {record.operatorAssignment} ↗
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 — Production Execution */}
                <div ref={sec3Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    3. Production Execution
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Col */}
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Production Start</span>
                        <span className="font-semibold text-foreground">{record.productionStart}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Production End</span>
                        <span className="font-semibold text-foreground">{record.productionEnd}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Production Status</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          {record.productionStatus}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Machine Utilization</span>
                        <span className="font-bold text-foreground">{record.machineUtilization}%</span>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Cycle Time</span>
                        <span className="font-bold text-foreground">{record.cycleTimeMinutes} Min</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Throughput</span>
                        <span className="font-bold text-foreground">{record.throughputUnitsPerHour} Units/Hour</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Downtime</span>
                        <span className="font-bold text-foreground">{record.downtimeHours} Hours</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-help underline decoration-dotted">
                              OEE (%)
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Availability x Performance x Quality</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">{record.oee}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4 — Quality Verification */}
                <div ref={sec4Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    4. Quality Verification
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Left Col: 3 Inspection Gates */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                        Inspection Gates
                      </h3>
                      {[
                        { label: "Incoming Quality Inspection", passed: record.incomingInspectionPassed, auto: record.incomingInspectionAuto },
                        { label: "In-Process Inspection", passed: record.inProcessInspectionPassed, auto: record.inProcessInspectionAuto },
                        { label: "Final Inspection", passed: record.finalInspectionPassed, auto: record.finalInspectionAuto },
                      ].map((gate, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={gate.passed} readOnly className="rounded text-primary" />
                            <span className="font-bold text-foreground">{gate.label}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Passed
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Right Col: Quality Metrics */}
                    <div className="space-y-2.5">
                      <h3 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                        Quality Metrics
                      </h3>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Defect Rate</span>
                        <span className="font-bold text-rose-600">{record.defectRate}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">First Pass Yield (FPY)</span>
                        <span className="font-bold text-emerald-600">{record.fpy}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Scrap Rate</span>
                        <span className="font-bold text-foreground">{record.scrapRate}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Rework Rate</span>
                        <span className="font-bold text-foreground">{record.reworkRate}%</span>
                      </div>
                      <div className="flex justify-between items-center py-1 pt-2">
                        <span className="font-bold text-foreground">Quality Score</span>
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold rounded">
                          {record.qualityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5 — Process Performance */}
                <div ref={sec5Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    5. Process Performance
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* SPC/MSA Metrics */}
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Cp</span>
                        <span className="font-bold text-foreground">{record.cp}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Cpk</span>
                        <span className="font-bold text-foreground">{record.cpk}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">SPC Status</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
                          {record.spcStatus}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">MSA Status</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
                          {record.msaStatus}
                        </span>
                      </div>
                    </div>

                    {/* Rolled-up scores */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Process Stability</span>
                        <span className="font-bold text-foreground">{record.processStabilityScore}/100 Good</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Control Plan Compliance</span>
                        <a
                          href={`/manufacturing-development/control-plan-development/${record.controlPlanRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                        >
                          Compliant ↗
                        </a>
                      </div>
                      <div className="flex justify-between items-center py-1 pt-2">
                        <span className="font-bold text-foreground">Performance Score</span>
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold rounded">
                          {record.performanceScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div className="pt-3 border-t border-border">
                    <span className="text-xs font-bold text-foreground block mb-2">Process Stability Trend</span>
                    <PilotProductionTrendChart data={record.stabilityTrend} />
                  </div>
                </div>

                {/* Section 6 — Production Readiness */}
                <div ref={sec6Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    6. Production Readiness
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
                    {/* 6 Checkboxes */}
                    <div className="space-y-2.5">
                      {[
                        { label: "Equipment Readiness", checked: record.equipmentReadiness, auto: record.equipmentReadinessAuto },
                        { label: "Tooling Readiness", checked: record.toolingReadiness, auto: record.toolingReadinessAuto },
                        { label: "Operator Readiness", checked: record.operatorReadiness, auto: record.operatorReadinessAuto },
                        { label: "Material Readiness", checked: record.materialReadiness, auto: record.materialReadinessAuto },
                        { label: "Safety Readiness", checked: record.safetyReadiness, auto: record.safetyReadinessAuto },
                        { label: "Documentation Complete", checked: record.documentationComplete, auto: record.documentationCompleteAuto },
                      ].map((chk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={chk.checked} readOnly className="rounded text-primary" />
                            <span className="font-semibold text-foreground">{chk.label}</span>
                            {!chk.auto && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[9px] px-1 py-0.2 bg-muted text-muted-foreground rounded cursor-help">
                                    (manual)
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Auto-derivation will activate once upstream module ships.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <span className="text-emerald-600 font-bold">Ready ✓</span>
                        </div>
                      ))}
                    </div>

                    {/* Circular Gauge */}
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-border rounded-xl text-center space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Production Readiness Score
                      </span>
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-card shadow-inner">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {calculatedReadiness}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        Good
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 7 — AI Production Assessment */}
                <div ref={sec7Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-sm font-bold text-foreground">7. AI Production Assessment</h2>
                    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded">
                      AI Health Score: {record.aiProductionHealthScore}/100
                    </span>
                  </div>

                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Productivity Analysis</span>
                      <span className="text-muted-foreground">{record.aiProductivityAnalysis}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Quality Prediction</span>
                      <span className="text-muted-foreground">{record.aiQualityPrediction}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Bottleneck Detection</span>
                      <span className="text-muted-foreground">{record.aiBottleneckDetection}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Downtime Analysis</span>
                      <span className="text-muted-foreground">{record.aiDowntimeAnalysis}</span>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <span className="font-bold text-foreground min-w-[180px]">AI Optimization Recommendations</span>
                      <span className="text-muted-foreground">{record.aiOptimizationRecommendations}</span>
                    </div>
                  </div>
                </div>

                {/* Section 10 — Review & Approval (TABLE-based) */}
                <div ref={sec10Ref} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    10. Review & Approval
                  </h2>
                  <PilotProductionReviewTable
                    reviewers={record.reviewers}
                    currentDecision={record.approvalDecision}
                    comments={record.reviewComments}
                    approvalDate={record.approvalDate}
                    onDecisionChange={handleDecisionChange}
                  />
                </div>

                {/* Section 11 — System Information */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    11. System Information
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
                      <span className="font-bold text-foreground">{record.lifecycleStage}</span>
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
                <PilotProductionAiInsightsCard
                  onJumpToAiSection={() => scrollToSection("ai", sec7Ref)}
                />

                {/* Section 8 Aggregate Summary Card */}
                <div ref={sec8Ref}>
                  <PilotProductionSummaryCard
                    productionScore={record.productionScore}
                    qualityScore={record.qualityScore}
                    performanceScore={record.performanceScore}
                    readinessScore={calculatedReadiness}
                    aiHealthScore={record.aiProductionHealthScore}
                  />
                </div>

                {/* Section 9 Attachments Card */}
                <PilotProductionAttachmentsCard attachments={record.attachments} />
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </TooltipProvider>
  );
}
