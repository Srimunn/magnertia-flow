import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Download,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Layers,
  Target,
  Zap,
  Map,
  Award,
  Paperclip,
  Eye,
  Check,
  ClipboardCheck,
  Cpu,
  ShieldAlert,
  UserCheck,
  FileSpreadsheet,
  FileCode,
  Info,
  Clock,
  ChevronRight,
  TrendingUp,
  Maximize2,
  Share2,
  Printer,
  FileCheck,
  User,
  ShieldCheck,
  Radio,
  HardDrive,
  Database,
  Lock,
  Workflow,
  Plus,
  ArrowRight,
  Palette,
  Box,
  Star,
  Ruler,
  Weight,
  PenTool,
  Factory,
  CheckSquare,
  Leaf,
  Layers3,
  Wrench,
  Cog,
  FileArchive,
  ArrowUpRight,
  PlusCircle,
  BarChart3,
  CheckCircle,
  HelpCircle,
  Search,
  Flame,
  Shield,
  Cable,
  CircuitBoard,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  ElectronicsDesignTabBar,
  type ElectronicsDesignTabId,
} from "@/components/erp/ElectronicsDesignTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { electronicsDesignService } from "@/services";
import type {
  ElectronicsDesignApprovalDecision,
  ElectronicsDesignFormInput,
  ElectronicsDesignRecord,
  ElectronicsDesignStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/electronics-design/new",
)({
  head: () => ({
    meta: [{ title: "Electronics Design Form · Magnertia ERP" }],
  }),
  component: ElectronicsDesignFormPage,
});

/* ===========================================================================
   Score Gauge Component (Circular Gauge / 100)
   =========================================================================== */
function CircularScoreGauge({
  score,
  label = "Overall Score",
  size = 110,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = "stroke-indigo-600";
  let textColor = "text-indigo-600";
  let bgColor = "text-indigo-100";

  if (score >= 85) {
    strokeColor = "stroke-indigo-600";
    textColor = "text-indigo-600";
    bgColor = "text-indigo-100";
  } else if (score >= 70) {
    strokeColor = "stroke-emerald-600";
    textColor = "text-emerald-700";
    bgColor = "text-emerald-100";
  } else {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-700";
    bgColor = "text-amber-100";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={bgColor}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("transition-all duration-1000 ease-out", strokeColor)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={cn("text-2xl font-black tracking-tight", textColor)}>
            {score}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">/100</span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-bold text-slate-700">{label}</span>
      )}
    </div>
  );
}

/* ===========================================================================
   Main Electronics Design Form Page
   =========================================================================== */
function ElectronicsDesignFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ElectronicsDesignTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [schematicModalOpen, setSchematicModalOpen] = useState(false);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [componentListModalOpen, setComponentListModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [renderModalOpen, setRenderModalOpen] = useState(false);
  const [stackupModalOpen, setStackupModalOpen] = useState(false);
  const [waveformModalOpen, setWaveformModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["electronics-design-record"],
    queryFn: () => electronicsDesignService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<ElectronicsDesignFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ElectronicsDesignFormInput>) =>
      electronicsDesignService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electronics-design-record"], updated);
      toast.success("Electronics Design draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => electronicsDesignService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electronics-design-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: ElectronicsDesignApprovalDecision;
      comments?: string;
    }) => electronicsDesignService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["electronics-design-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Electronics Design Approved! Auto-created downstream PCB Layout Design project PCB-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: ElectronicsDesignStage) =>
      electronicsDesignService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electronics-design-record"], updated);
      toast.success("Advanced workflow stage successfully!");
    },
  });

  if (isLoading || !record || !formInput) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading Electronics Design module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof ElectronicsDesignFormInput, value: any) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 pb-16">
        {/* ===========================================================================
            1. PAGE HEADER & BREADCRUMB
            =========================================================================== */}
        <div className="bg-white border-b border-border px-6 py-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <span>Development</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span>Product Development</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-foreground">
                  Electronics Design
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-primary">
                  Electronics Design Form
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Cpu className="h-6 w-6 text-primary" />
                Electronics Design
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Electronics Design Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Electronics Design Draft EDF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Electronics Design
              </ErpButton>
            </div>
          </div>
        </div>

        {/* ===========================================================================
            2. WORKFLOW STAGE STEPPER (Sequence Diagram driven 4 Stages)
            =========================================================================== */}
        <div className="bg-slate-900 text-white px-6 py-3.5 shadow-md">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Electronics Engineering Lifecycle
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {record.currentStageLabel}
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded border border-indigo-400/30">
                    {record.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {record.stages.map((stg) => {
                const isCurrent = stg.id === record.currentStage;
                const isDone = stg.status === "completed";
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => advanceStageMutation.mutate(stg.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap",
                      isCurrent
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-sm ring-2 ring-indigo-400/50"
                        : isDone
                        ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                        isCurrent
                          ? "bg-white text-indigo-700"
                          : isDone
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-700 text-slate-300"
                      )}
                    >
                      {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : stg.stageNumber}
                    </span>
                    <span>{stg.label.split(": ")[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===========================================================================
            3. RECORD HEADER BAR (Two Rows)
            =========================================================================== */}
        <div className="bg-white border-b border-border px-6 py-4 shadow-xs">
          <div className="max-w-[1600px] mx-auto space-y-3">
            {/* Row 1: Primary Key Details & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Electronics Design ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {record.designId}
                  </span>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Form Code
                  </span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {record.formCode}
                  </span>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Design Project Name
                  </span>
                  <input
                    type="text"
                    value={record.designProjectName}
                    onChange={(e) =>
                      queryClient.setQueryData(
                        ["electronics-design-record"],
                        (prev: any) => ({
                          ...prev,
                          designProjectName: e.target.value,
                        })
                      )
                    }
                    className="font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[260px]"
                  />
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Design Version
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-2 py-0.5 rounded">
                    {record.designVersion}
                  </span>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Workflow Status
                  </span>
                  <StatusBadge status={record.status} />
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Created On
                  </span>
                  <span className="font-medium text-slate-600">
                    {record.createdOn}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <ErpButton
                  variant="outline"
                  size="sm"
                  loading={saveDraftMutation.isPending}
                  onClick={() => saveDraftMutation.mutate(formInput)}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Draft
                </ErpButton>

                <ErpButton
                  variant="primary"
                  size="sm"
                  loading={submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Submit for Review
                </ErpButton>

                <button
                  type="button"
                  onClick={() => toast.info("Exporting Electronics Design package...")}
                  className="p-1.5 rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                  title="More Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Resolved Linked Records & Owner Chips */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Linked Electrical Design Chip */}
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  <span>Linked Electrical Design:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/electrical-design/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-blue-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedElectricalDesignId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked Product Architecture Chip */}
                <div className="flex items-center gap-1.5 bg-purple-50/80 border border-purple-200 text-purple-800 rounded-md px-2.5 py-1 font-medium">
                  <Cpu className="h-3.5 w-3.5 text-purple-600" />
                  <span>Linked Product Architecture:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/product-architecture/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-purple-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedProductArchitectureId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked PRD Chip */}
                <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-md px-2.5 py-1 font-medium">
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Linked PRD:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/prd/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-emerald-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedPrdId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked Product Chip */}
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 font-medium">
                  <Target className="h-3.5 w-3.5 text-slate-500" />
                  <span>Linked Product:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/product-strategy/overview" as any,
                      })
                    }
                    className="font-bold underline hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    {record.linkedProductName}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Downstream PCB Layout Design Banner if Approved */}
                {record.linkedPcbLayoutId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream PCB Layout Design:</span>
                    <span className="underline font-black font-mono">
                      {record.linkedPcbLayoutId}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side Metadata */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <div>
                  <span>Business Unit:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {record.businessUnit}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Electronics Engineer:</span>
                  <img
                    src={record.electronicsEngineerAvatar}
                    alt={record.electronicsEngineerName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.electronicsEngineerName}
                  </span>
                </div>
                <div>
                  <span>Last Updated:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {record.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===========================================================================
            4. TAB BAR
            =========================================================================== */}
        <ElectronicsDesignTabBar
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />

        {/* Notification Banner when Approved */}
        {record.status === "Approved" && (
          <div className="max-w-[1600px] mx-auto px-6 pt-4">
            <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4 flex items-center justify-between text-emerald-900 shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">
                    Electronics Design Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Downstream PCB Layout Design project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedPcbLayoutId}
                    </span>{" "}
                    has been auto-created & linked. Proceed to PCB Layout Design.
                  </p>
                </div>
              </div>
              <ErpButton
                size="sm"
                onClick={() =>
                  toast.info(
                    `Navigating to PCB Layout Design (${record.linkedPcbLayoutId})...`
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Proceed to PCB Layout Design
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </ErpButton>
            </div>
          </div>
        )}

        {/* ===========================================================================
            5. MAIN CONTENT AREA (OVERVIEW TAB OR PLACEHOLDERS) + STICKY SIDEBAR
            =========================================================================== */}
        <div className="px-6 py-6 max-w-[1600px] mx-auto w-full">
          {activeTab !== "overview" ? (
            /* Non-Overview Placeholder / Sub-view */
            <div className="bg-white rounded-xl border border-border p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Electronics Design record ({record.designId}) • {record.designProjectName}
                    </p>
                  </div>
                </div>
                <ErpButton
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                >
                  <ArrowRight className="h-4 w-4 mr-1.5 rotate-180" />
                  Back to Overview Dashboard
                </ErpButton>
              </div>

              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-sm font-medium">
                  Detailed sub-views and interactive editors for <span className="font-bold capitalize">{activeTab.replace("_", " ")}</span> are linked to record {record.designId}.
                </p>
                <ErpButton variant="outline" onClick={() => setActiveTab("overview")}>
                  Return to Overview Dashboard
                </ErpButton>
              </div>
            </div>
          ) : (
            /* OVERVIEW TAB CONTENT GRID + STICKY SIDEBAR */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* MAIN CONTENT PANELS (COL-SPAN 3) */}
              <div className="lg:col-span-3 space-y-6">
                {/* -------------------------------------------------------------------
                    PANEL 1: Electronics Design Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Electronics Design Overview
                    </h2>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.designStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left/Middle text fields */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={formInput.productName}
                          onChange={(e) => handleFieldChange("productName", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Electronics Design Objective
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.electronicsDesignObjective}
                          onChange={(e) => handleFieldChange("electronicsDesignObjective", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Design Scope
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.designScope}
                          onChange={(e) => handleFieldChange("designScope", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Design Methodology
                          </label>
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {formInput.designMethodology}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Product Category
                          </label>
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {formInput.productCategory}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Applicable Standards
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                          {formInput.applicableStandards.map((std, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-white border border-border px-2.5 py-0.5 rounded-md text-xs font-bold text-slate-800 shadow-2xs"
                            >
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              {std}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Embedded Product/PCB Image */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Product / PCB Render
                        </span>
                        <button
                          type="button"
                          onClick={() => setRenderModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setRenderModalOpen(true)}
                        className="w-full h-56 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer relative group/img"
                      >
                        <img
                          src={formInput.productRenderUrl}
                          alt="Smart EV Charger Electronics Render"
                          className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        EV Charging Station • Controller Board
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Electronic System Architecture (with Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Electronic System Architecture
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Architecture Status: {formInput.architectureStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">System Name</span>
                        <input
                          type="text"
                          value={formInput.electronicSystemName}
                          onChange={(e) => handleFieldChange("electronicSystemName", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Functional Blocks</span>
                        <input
                          type="text"
                          value={formInput.functionalBlocks}
                          onChange={(e) => handleFieldChange("functionalBlocks", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Board Architecture</span>
                        <input
                          type="text"
                          value={formInput.boardArchitecture}
                          onChange={(e) => handleFieldChange("boardArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Signal Interfaces</span>
                        <input
                          type="text"
                          value={formInput.signalInterfaces}
                          onChange={(e) => handleFieldChange("signalInterfaces", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Power Domains</span>
                        <input
                          type="text"
                          value={formInput.powerDomains}
                          onChange={(e) => handleFieldChange("powerDomains", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Communication Interfaces</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.communicationInterfaces.map((c, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* System Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          Electronic System Diagram
                        </span>
                        <button
                          type="button"
                          onClick={() => setDiagramModalOpen(true)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div
                        onClick={() => setDiagramModalOpen(true)}
                        className="w-full h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={formInput.systemDiagramUrl}
                          alt="Electronic System Diagram"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1">
                        System Architecture • Functional Blocks
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Component Selection
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Component Selection
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Lifecycle: {formInput.componentLifecycleStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Microcontroller / MCU</span>
                      <input
                        type="text"
                        value={formInput.microcontrollerProcessor}
                        onChange={(e) => handleFieldChange("microcontrollerProcessor", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Memory Devices</span>
                      <input
                        type="text"
                        value={formInput.memoryDevices}
                        onChange={(e) => handleFieldChange("memoryDevices", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Power Devices</span>
                      <input
                        type="text"
                        value={formInput.powerDevices}
                        onChange={(e) => handleFieldChange("powerDevices", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Passive Components</span>
                      <input
                        type="text"
                        value={formInput.passiveComponents}
                        onChange={(e) => handleFieldChange("passiveComponents", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Sensors</span>
                      <input
                        type="text"
                        value={formInput.sensors}
                        onChange={(e) => handleFieldChange("sensors", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Communication Modules</span>
                      <input
                        type="text"
                        value={formInput.communicationModules}
                        onChange={(e) => handleFieldChange("communicationModules", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Circuit Design (with Circuit Schematic)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Circuit Design
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Circuit Status: {formInput.circuitStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Circuit Name</span>
                        <input
                          type="text"
                          value={formInput.circuitName}
                          onChange={(e) => handleFieldChange("circuitName", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Circuit Category</span>
                        <input
                          type="text"
                          value={formInput.circuitCategory}
                          onChange={(e) => handleFieldChange("circuitCategory", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Input Voltage</span>
                        <input
                          type="text"
                          value={formInput.inputVoltage}
                          onChange={(e) => handleFieldChange("inputVoltage", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Output Voltage</span>
                        <input
                          type="text"
                          value={formInput.outputVoltage}
                          onChange={(e) => handleFieldChange("outputVoltage", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Operating Frequency</span>
                        <input
                          type="text"
                          value={formInput.operatingFrequency}
                          onChange={(e) => handleFieldChange("operatingFrequency", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Current Rating</span>
                        <input
                          type="text"
                          value={formInput.currentRating}
                          onChange={(e) => handleFieldChange("currentRating", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Circuit Schematic Panel */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-indigo-400" />
                          Circuit Schematic
                        </span>
                        <button type="button" onClick={() => setSchematicModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setSchematicModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.circuitSchematicUrl} alt="Circuit Schematic" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1">
                        CAD Schematic • Mixed Signal Circuit
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: PCB Design Preparation (with Stack-up Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      PCB Design Preparation
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      PCB Readiness: {formInput.pcbReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">PCB Type</span>
                        <input
                          type="text"
                          value={formInput.pcbType}
                          onChange={(e) => handleFieldChange("pcbType", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Estimated Layer Count</span>
                        <input
                          type="number"
                          value={formInput.estimatedLayerCount}
                          onChange={(e) => handleFieldChange("estimatedLayerCount", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Board Dimensions</span>
                        <input
                          type="text"
                          value={formInput.boardDimensions}
                          onChange={(e) => handleFieldChange("boardDimensions", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">High-Speed Signal Design</span>
                        <input
                          type="text"
                          value={formInput.highSpeedSignalDesign}
                          onChange={(e) => handleFieldChange("highSpeedSignalDesign", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Placement Strategy</span>
                        <input
                          type="text"
                          value={formInput.componentPlacementStrategy}
                          onChange={(e) => handleFieldChange("componentPlacementStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Thermal Management</span>
                        <input
                          type="text"
                          value={formInput.thermalManagementMethod}
                          onChange={(e) => handleFieldChange("thermalManagementMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Stack-up Diagram Box & Score Tile */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between text-center">
                      <div className="w-full flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase">PCB Stackup</span>
                        <button type="button" onClick={() => setStackupModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Maximize2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div onClick={() => setStackupModalOpen(true)} className="w-full h-24 rounded border bg-white overflow-hidden flex items-center justify-center cursor-pointer mb-2">
                        <img src={formInput.pcbStackupDiagramUrl} alt="PCB Stackup" className="max-h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Readiness Score</span>
                      <div className="text-2xl font-black text-emerald-700">{formInput.pcbReadinessScore} /100</div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Embedded Hardware Interfaces
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Embedded Hardware Interfaces
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.hardwareInterfaceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">GPIO Interfaces</span>
                        <input
                          type="text"
                          value={formInput.gpioInterfaces}
                          onChange={(e) => handleFieldChange("gpioInterfaces", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">ADC / DAC Interfaces</span>
                        <input
                          type="text"
                          value={formInput.adcDacInterfaces}
                          onChange={(e) => handleFieldChange("adcDacInterfaces", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">PWM Outputs</span>
                        <input
                          type="text"
                          value={formInput.pwmOutputs}
                          onChange={(e) => handleFieldChange("pwmOutputs", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Bus Interfaces</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.busInterfaces.map((b, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">CAN Interface</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded">
                          {formInput.canInterfaceStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Ethernet Interface</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded">
                          {formInput.ethernetInterfaceStatus}
                        </span>
                      </div>
                    </div>

                    {/* Hardware Interface Score Tile */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                        Hardware Interface Score
                      </span>
                      <div className="text-3xl font-black text-indigo-700 my-1">
                        {formInput.hardwareInterfaceScore}{" "}
                        <span className="text-xs font-semibold text-indigo-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-700">
                        All Bus & PHY Signals Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Signal Integrity & Reliability
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Signal Integrity & Reliability
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Reliability Score: {formInput.reliabilityScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Signal Integrity Analysis</span>
                        <input
                          type="text"
                          value={formInput.signalIntegrityAnalysis}
                          onChange={(e) => handleFieldChange("signalIntegrityAnalysis", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Power Integrity Analysis</span>
                        <input
                          type="text"
                          value={formInput.powerIntegrityAnalysis}
                          onChange={(e) => handleFieldChange("powerIntegrityAnalysis", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Noise Reduction Strategy</span>
                        <input
                          type="text"
                          value={formInput.noiseReductionStrategy}
                          onChange={(e) => handleFieldChange("noiseReductionStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Clock Distribution</span>
                        <input
                          type="text"
                          value={formInput.clockDistribution}
                          onChange={(e) => handleFieldChange("clockDistribution", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Reliability Target</span>
                        <input
                          type="text"
                          value={formInput.reliabilityTarget}
                          onChange={(e) => handleFieldChange("reliabilityTarget", e.target.value)}
                          className="w-full rounded-md border border-emerald-300 font-black text-emerald-700 bg-emerald-50/50 px-2.5 py-1"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">MTBF Target</span>
                        <input
                          type="text"
                          value={formInput.mtbfTarget}
                          onChange={(e) => handleFieldChange("mtbfTarget", e.target.value)}
                          className="w-full rounded-md border border-input font-bold text-slate-800 bg-slate-50/50 px-2.5 py-1"
                        />
                      </div>
                    </div>

                    {/* Computed Reliability Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Reliability Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.reliabilityScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        MTBF &gt; 100,000 hrs Target Met
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Design Verification & Testing (with Waveform Plot)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Design Verification & Testing
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Verification Score: {formInput.verificationScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        {formInput.verifications.map((ver) => (
                          <div key={ver.id} className="p-2.5 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <span className="font-semibold text-slate-800">{ver.name}</span>
                            <StatusBadge status={ver.status} />
                          </div>
                        ))}
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center mt-2">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Verification Score</span>
                        <span className="text-xl font-black text-emerald-700">{formInput.verificationScore} /100</span>
                      </div>
                    </div>

                    {/* Waveform Visualization Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-950 text-white flex flex-col items-center justify-between relative overflow-hidden group">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-indigo-400" />
                          Simulation Waveform Plot
                        </span>
                        <button type="button" onClick={() => setWaveformModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setWaveformModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.waveformPlotUrl} alt="Simulation Waveform" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1 block">
                        Oscilloscope Plot • 500 MHz Signal Trace
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Electronics Design Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Electronics Design Assessment
                    </h2>
                    <span className="bg-indigo-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallElectronicsScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Design Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiDesignQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Comp. Opt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiComponentOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Circuit Review</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCircuitReview} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Signal Integrity</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiSignalIntegrityAnalysis} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Thermal Rec.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiThermalRecommendations} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Reliability Pred.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiReliabilityPrediction} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Design Summary (Kept in Sync with Sidebar)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Design Summary
                    </h2>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Recommendation: {record.summary.recommendation}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Architecture Readiness</span>
                        <span>{record.summary.architectureReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${record.summary.architectureReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Circuit Readiness</span>
                        <span>{record.summary.circuitReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${record.summary.circuitReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Hardware Interface Score</span>
                        <span>{record.summary.hardwareInterfaceScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.hardwareInterfaceScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Reliability Score</span>
                        <span>{record.summary.reliabilityScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.reliabilityScore}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Electronics Design Score</span>
                      <span className="text-base text-indigo-700">{record.summary.overallElectronicsDesignScore} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 11: Attachments
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        11
                      </span>
                      Attachments
                    </h2>
                    <button type="button" onClick={() => setActiveTab("attachments")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      View All Attachments &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {formInput.attachments.slice(0, 8).map((att) => (
                      <div key={att.id} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-xs text-foreground block truncate">{att.name}</span>
                            <span className="text-[10px] text-muted-foreground block">{att.size}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => toast.info(`Downloading ${att.name}...`)} className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 12: Review & Approval Table & Form
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        12
                      </span>
                      Review & Approval
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Electronics Design Review Board
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Reviewers Table (Col-span 2) */}
                    <div className="lg:col-span-2 overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-border text-slate-700 font-semibold">
                          <tr>
                            <th className="p-2.5">Role</th>
                            <th className="p-2.5">Person</th>
                            <th className="p-2.5">Decision</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {formInput.reviewers.map((rev) => (
                            <tr key={rev.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-semibold text-slate-800">{rev.role}</td>
                              <td className="p-2.5 text-slate-700">{rev.person}</td>
                              <td className="p-2.5"><StatusBadge status={rev.decision} /></td>
                              <td className="p-2.5 font-medium text-slate-600">{rev.status}</td>
                              <td className="p-2.5 text-slate-500">{rev.date || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Decision Input Controls */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-muted-foreground mb-1">Approval Decision</label>
                        <select
                          value={formInput.approvalDecision || ""}
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as ElectronicsDesignApprovalDecision)}
                          className="w-full rounded-md border border-input bg-white p-2 font-semibold text-foreground"
                        >
                          <option value="">Select Decision</option>
                          <option value="Approved">Approved</option>
                          <option value="Approved with Conditions">Approved with Conditions</option>
                          <option value="Revision Required">Revision Required</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-muted-foreground mb-1">
                          <label>Review Comments</label>
                          <span>{(formInput.reviewComments || "").length}/2000</span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={2000}
                          value={formInput.reviewComments || ""}
                          onChange={(e) => handleFieldChange("reviewComments", e.target.value)}
                          placeholder="Enter electronics review board comments..."
                          className="w-full rounded-md border border-input bg-white p-2 text-foreground resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-muted-foreground mb-1">Approval Date</label>
                        <input
                          type="date"
                          value={formInput.approvalDate || ""}
                          onChange={(e) => handleFieldChange("approvalDate", e.target.value)}
                          className="w-full rounded-md border border-input bg-white p-2 text-foreground"
                        />
                      </div>

                      <ErpButton
                        size="sm"
                        className="w-full"
                        loading={reviewMutation.isPending}
                        onClick={() => {
                          if (!formInput.approvalDecision) {
                            toast.error("Please select an Approval Decision.");
                            return;
                          }
                          reviewMutation.mutate({
                            decision: formInput.approvalDecision,
                            comments: formInput.reviewComments,
                          });
                        }}
                      >
                        Submit Board Decision
                      </ErpButton>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 13: System Information
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        13
                      </span>
                      System Information
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground font-mono">
                      Audit Ref: {record.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created By</span>
                        <span className="font-bold text-foreground">{record.electronicsEngineerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.electronicsEngineerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified Date</span>
                        <span className="font-medium text-slate-700">{record.lastUpdated}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Workflow Stage</span>
                        <StatusBadge status={record.currentStageLabel.split(": ")[1]} />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Version</span>
                        <span className="font-bold font-mono text-foreground">v{record.version}</span>
                      </div>
                    </div>

                    {/* History links */}
                    <div className="flex flex-col justify-center space-y-1.5 border-l border-slate-200 pl-4">
                      <button type="button" onClick={() => setSystemLogModalOpen(true)} className="text-xs font-bold text-primary hover:underline text-left cursor-pointer">
                        View Log &rarr;
                      </button>
                      <button type="button" onClick={() => setSystemLogModalOpen(true)} className="text-xs font-bold text-primary hover:underline text-left cursor-pointer">
                        View History &rarr;
                      </button>
                      <button type="button" onClick={() => setSystemLogModalOpen(true)} className="text-xs font-bold text-primary hover:underline text-left cursor-pointer">
                        View Changes &rarr;
                      </button>
                      <button type="button" onClick={() => setSystemLogModalOpen(true)} className="text-xs font-bold text-primary hover:underline text-left cursor-pointer">
                        View Workflow &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===========================================================================
                  RIGHT SIDEBAR PANEL (STICKY ON SCROLL)
                  =========================================================================== */}
              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-6 space-y-6">
                  {/* Overall Electronics Design Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Cpu className="h-4 w-4 text-primary" />
                      Overall Electronics Design Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallElectronicsDesignScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Architecture Readiness</span>
                        <span className="font-bold text-slate-800">{record.summary.architectureReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Circuit Readiness</span>
                        <span className="font-bold text-slate-800">{record.summary.circuitReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Hardware Interface</span>
                        <span className="font-bold text-slate-800">{record.summary.hardwareInterfaceScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Reliability</span>
                        <span className="font-bold text-slate-800">{record.summary.reliabilityScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-indigo-700">
                        <span>Overall Score</span>
                        <span>{record.summary.overallElectronicsDesignScore} /100</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Highlights Dynamic Checklist */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Key Highlights
                    </h3>
                    <div className="space-y-2 text-xs">
                      {record.keyHighlights.map((hl, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions List */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Quick Actions
                    </h3>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setReportModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        Generate Design Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchematicModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Zap className="h-4 w-4 text-amber-600" />
                        View Electronic Schematics
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagramModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Cpu className="h-4 w-4 text-indigo-600" />
                        View Block Diagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setBomModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        View BOM
                      </button>
                      <button
                        type="button"
                        onClick={() => setComponentListModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <CircuitBoard className="h-4 w-4 text-purple-600" />
                        View Component List
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-rose-600" />
                        View Simulation Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
                          const downloadAnchor = document.createElement("a");
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `${record.designId}_export.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                          toast.success("Exported Electronics Design Data JSON package.");
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Share2 className="h-4 w-4 text-slate-600" />
                        Export Design Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleReviewModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Schedule Design Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===========================================================================
            MODALS FOR QUICK ACTIONS & IMAGES
            =========================================================================== */}

        {/* Report Modal */}
        <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Electronics Design Engineering Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.designId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.designProjectName}</span>
                <p className="text-slate-600">
                  Covers MCU ARM Cortex-M7 controller, 6-layer PCB stackup, 500 MHz signal integrity, MTBF target (&gt;100,000 hrs), and IPC-A-610 compliance.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Design Score: {record.summary.overallElectronicsDesignScore}/100</div>
                <div className="p-2 border rounded">Microcontroller: {formInput.microcontrollerProcessor}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Electronics_Design_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* System Diagram Modal */}
        <Dialog open={diagramModalOpen} onOpenChange={setDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Electronic System Architecture Block Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.systemDiagramUrl} alt="Diagram" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Render Modal */}
        <Dialog open={renderModalOpen} onOpenChange={setRenderModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Product / PCB Controller Render</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.productRenderUrl} alt="Render" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Circuit Schematic Modal */}
        <Dialog open={schematicModalOpen} onOpenChange={setSchematicModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>CAD Circuit Schematic View</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.circuitSchematicUrl} alt="Circuit Schematic" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* PCB Stackup Modal */}
        <Dialog open={stackupModalOpen} onOpenChange={setStackupModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>6-Layer PCB Stackup Cross-Section Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.pcbStackupDiagramUrl} alt="PCB Stackup" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Waveform Modal */}
        <Dialog open={waveformModalOpen} onOpenChange={setWaveformModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Digital & Analog Oscilloscope Simulation Waveforms</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-950 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.waveformPlotUrl} alt="Simulation Waveform" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* BOM Modal */}
        <Dialog open={bomModalOpen} onOpenChange={setBomModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Electronics Bill of Materials (BOM)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded border space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Total Line Items: 142</span>
                  <span>Estimated Unit BOM Cost: $42.50</span>
                </div>
                <p className="text-slate-600">Includes MCU, PMIC, CAN PHY, Ethernet Transceiver, Resistors, Capacitors & Connectors.</p>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setBomModalOpen(false)}>Close</ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded BOM.xlsx"); setBomModalOpen(false); }}>Download Excel</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Component List Modal */}
        <Dialog open={componentListModalOpen} onOpenChange={setComponentListModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircuitBoard className="h-5 w-5 text-purple-600" />
                Component Library Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2 border rounded font-semibold text-slate-800">MCU: STM32H753BIT6 (ARM Cortex-M7, 480 MHz)</div>
              <div className="p-2 border rounded font-semibold text-slate-800">CAN PHY: ISO1050 Isolated Transceiver</div>
              <div className="p-2 border rounded font-semibold text-slate-800">Ethernet PHY: KSZ8081RND 10/100 MII/RMII</div>
              <div className="p-2 border rounded font-semibold text-slate-800">PMIC: TPS65218D0 Power Management IC</div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setComponentListModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Simulation Modal */}
        <Dialog open={simulationModalOpen} onOpenChange={setSimulationModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-600" />
                Simulation Analysis Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                Signal Integrity: 0 Crosstalk Warnings (Passed)
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                Power Integrity: PDN Impedance &lt; 0.1Ω up to 500 MHz (Passed)
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSimulationModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* System Log Modal */}
        <Dialog open={systemLogModalOpen} onOpenChange={setSystemLogModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Audit Trail & Workflow History
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto space-y-3 text-xs">
              {record.auditTrail.map((log, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-slate-50 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{log.actor}</span>
                    <span className="text-slate-500 font-normal">{log.at}</span>
                  </div>
                  <p className="text-slate-700">{log.event}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Review Modal */}
        <Dialog open={scheduleReviewModalOpen} onOpenChange={setScheduleReviewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Schedule Electronics Design Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Rohit Nair, Ananya Iyer, Kavita Sharma, Suresh Menon" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Electronics Design Review Meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
