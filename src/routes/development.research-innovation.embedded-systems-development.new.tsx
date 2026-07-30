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
  Microscope,
  Terminal,
  Code,
  LockKeyhole,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  EmbeddedDevelopmentTabBar,
  type EmbeddedDevelopmentTabId,
} from "@/components/erp/EmbeddedDevelopmentTabBar";
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
import { embeddedDevelopmentService } from "@/services";
import type {
  EmbeddedDevelopmentApprovalDecision,
  EmbeddedDevelopmentFormInput,
  EmbeddedDevelopmentRecord,
  EmbeddedDevelopmentStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/embedded-systems-development/new",
)({
  head: () => ({
    meta: [{ title: "Embedded Systems Development Form · Magnertia ERP" }],
  }),
  component: EmbeddedDevelopmentFormPage,
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

  let strokeColor = "stroke-emerald-600";
  let textColor = "text-emerald-700";
  let bgColor = "text-emerald-100";

  if (score >= 85) {
    strokeColor = "stroke-emerald-600";
    textColor = "text-emerald-700";
    bgColor = "text-emerald-100";
  } else if (score >= 70) {
    strokeColor = "stroke-blue-600";
    textColor = "text-blue-600";
    bgColor = "text-blue-100";
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
   Task Priority Donut Chart Component
   =========================================================================== */
function TaskPriorityDonutChart({
  high = 3,
  medium = 6,
  low = 3,
}: {
  high?: number;
  medium?: number;
  low?: number;
}) {
  const total = high + medium + low;
  const highPct = total > 0 ? (high / total) * 100 : 0;
  const medPct = total > 0 ? (medium / total) * 100 : 0;
  const lowPct = total > 0 ? (low / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border rounded-xl">
      <span className="text-[10px] font-bold text-slate-700 uppercase mb-2">
        Task Priority Distribution (12 Tasks)
      </span>
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
          {/* Background Circle */}
          <path
            className="text-slate-200 stroke-current"
            strokeWidth="4"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Low (emerald) */}
          <path
            className="text-emerald-500 stroke-current"
            strokeWidth="4"
            strokeDasharray={`${lowPct}, 100`}
            strokeDashoffset="0"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Medium (blue) */}
          <path
            className="text-blue-500 stroke-current"
            strokeWidth="4"
            strokeDasharray={`${medPct}, 100`}
            strokeDashoffset={`-${lowPct}`}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* High (rose) */}
          <path
            className="text-rose-500 stroke-current"
            strokeWidth="4"
            strokeDasharray={`${highPct}, 100`}
            strokeDashoffset={`-${lowPct + medPct}`}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-black text-slate-800">{total}</span>
          <span className="text-[9px] font-semibold text-slate-500">Tasks</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-semibold mt-2">
        <span className="flex items-center gap-1 text-rose-600">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          High ({high})
        </span>
        <span className="flex items-center gap-1 text-blue-600">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Med ({medium})
        </span>
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Low ({low})
        </span>
      </div>
    </div>
  );
}

/* ===========================================================================
   Main Embedded Systems Development Form Page
   =========================================================================== */
function EmbeddedDevelopmentFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EmbeddedDevelopmentTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sourceCodeModalOpen, setSourceCodeModalOpen] = useState(false);
  const [hardwareModalOpen, setHardwareModalOpen] = useState(false);
  const [hardwareDiagramModalOpen, setHardwareDiagramModalOpen] = useState(false);
  const [layeredDiagramModalOpen, setLayeredDiagramModalOpen] = useState(false);
  const [rtosConfigModalOpen, setRtosConfigModalOpen] = useState(false);
  const [taskManagementModalOpen, setTaskManagementModalOpen] = useState(false);
  const [testReportModalOpen, setTestReportModalOpen] = useState(false);
  const [staticAnalysisModalOpen, setStaticAnalysisModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["embedded-development-record"],
    queryFn: () => embeddedDevelopmentService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<EmbeddedDevelopmentFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<EmbeddedDevelopmentFormInput>) =>
      embeddedDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["embedded-development-record"], updated);
      toast.success("Embedded Systems Development draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => embeddedDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["embedded-development-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: EmbeddedDevelopmentApprovalDecision;
      comments?: string;
    }) => embeddedDevelopmentService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["embedded-development-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Embedded Development Approved! Auto-created downstream System Integration project SI-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: EmbeddedDevelopmentStage) =>
      embeddedDevelopmentService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["embedded-development-record"], updated);
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
              Loading Embedded Systems Development module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof EmbeddedDevelopmentFormInput, value: any) => {
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
                  Embedded Systems Development
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-primary">
                  Embedded Systems Development Form
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Microscope className="h-6 w-6 text-primary" />
                Embedded Systems Development
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Embedded Systems Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Embedded Development Draft EMF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Embedded Development
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
              <Workflow className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Embedded Systems Lifecycle
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {record.currentStageLabel}
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-400/30">
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
                        ? "bg-emerald-600 border-emerald-400 text-white shadow-sm ring-2 ring-emerald-400/50"
                        : isDone
                        ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                        isCurrent
                          ? "bg-white text-emerald-700"
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
                    Embedded Development ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {record.developmentId}
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
                    Development Project Name
                  </span>
                  <input
                    type="text"
                    value={record.developmentProjectName}
                    onChange={(e) =>
                      queryClient.setQueryData(
                        ["embedded-development-record"],
                        (prev: any) => ({
                          ...prev,
                          developmentProjectName: e.target.value,
                        })
                      )
                    }
                    className="font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[260px]"
                  />
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Firmware Version
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-2 py-0.5 rounded font-mono">
                    {record.firmwareVersion}
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
                  onClick={() => toast.info("Exporting Embedded Development package...")}
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
                {/* Linked Electronics Design Chip */}
                <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 text-indigo-800 rounded-md px-2.5 py-1 font-medium">
                  <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Linked Electronics Design:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/electronics-design/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-indigo-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedElectronicsDesignId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

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
                  <Layers className="h-3.5 w-3.5 text-purple-600" />
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

                {/* Downstream System Integration Banner if Approved */}
                {record.linkedSystemIntegrationId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream System Integration:</span>
                    <span className="underline font-black font-mono">
                      {record.linkedSystemIntegrationId}
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
                  <span>Embedded Engineer:</span>
                  <img
                    src={record.embeddedEngineerAvatar}
                    alt={record.embeddedEngineerName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.embeddedEngineerName}
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
        <EmbeddedDevelopmentTabBar
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
                    Embedded Systems Development Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Downstream System Integration project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedSystemIntegrationId}
                    </span>{" "}
                    has been auto-created & linked. Proceed to System Integration.
                  </p>
                </div>
              </div>
              <ErpButton
                size="sm"
                onClick={() =>
                  toast.info(
                    `Navigating to System Integration (${record.linkedSystemIntegrationId})...`
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Proceed to System Integration
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
                    <Microscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Embedded Development record ({record.developmentId}) • {record.developmentProjectName}
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
                  Detailed sub-views and interactive editors for <span className="font-bold capitalize">{activeTab.replace("_", " ")}</span> are linked to record {record.developmentId}.
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
                    PANEL 1: Embedded System Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Embedded System Overview
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.developmentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left/Middle text fields */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
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
                            Embedded System Name
                          </label>
                          <input
                            type="text"
                            value={formInput.embeddedSystemName}
                            onChange={(e) => handleFieldChange("embeddedSystemName", e.target.value)}
                            className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Development Objective
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.developmentObjective}
                          onChange={(e) => handleFieldChange("developmentObjective", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Firmware Scope
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.firmwareScope}
                          onChange={(e) => handleFieldChange("firmwareScope", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Development Methodology
                          </label>
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {formInput.developmentMethodology}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Applicable Standards
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-md border border-input">
                            {formInput.applicableStandards.map((std, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-white border border-border px-2 py-0.5 rounded text-xs font-bold text-slate-800 shadow-2xs"
                              >
                                <ShieldCheck className="h-3 w-3 text-primary" />
                                {std}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Embedded Board Render */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Evaluation Board Render
                        </span>
                        <button
                          type="button"
                          onClick={() => setHardwareModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setHardwareModalOpen(true)}
                        className="w-full h-56 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer relative group/img"
                      >
                        <img
                          src={formInput.hardwareBoardImageUrl}
                          alt="STM32 Evaluation Board"
                          className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        STM32H753BIT6 • Cortex-M7 Dev Board
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Hardware Platform (with Block Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Hardware Platform
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Hardware Status: {formInput.hardwareStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Microcontroller / SoC</span>
                        <input
                          type="text"
                          value={formInput.microcontrollerSoc}
                          onChange={(e) => handleFieldChange("microcontrollerSoc", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">CPU Architecture</span>
                        <input
                          type="text"
                          value={formInput.cpuArchitecture}
                          onChange={(e) => handleFieldChange("cpuArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Clock Frequency</span>
                        <input
                          type="text"
                          value={formInput.clockFrequency}
                          onChange={(e) => handleFieldChange("clockFrequency", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Flash Memory</span>
                        <input
                          type="text"
                          value={formInput.flashMemory}
                          onChange={(e) => handleFieldChange("flashMemory", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">SRAM</span>
                        <input
                          type="text"
                          value={formInput.sram}
                          onChange={(e) => handleFieldChange("sram", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">External Memory</span>
                        <input
                          type="text"
                          value={formInput.externalMemory}
                          onChange={(e) => handleFieldChange("externalMemory", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Hardware Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          SoC Block Diagram
                        </span>
                        <button
                          type="button"
                          onClick={() => setHardwareDiagramModalOpen(true)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div
                        onClick={() => setHardwareDiagramModalOpen(true)}
                        className="w-full h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={formInput.hardwarePlatformDiagramUrl}
                          alt="SoC Block Diagram"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1">
                        ARM Cortex-M7 • Memory Map & Peripherals
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Firmware Architecture (with Layered Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Firmware Architecture
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Firmware Status: {formInput.firmwareStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Firmware Architecture</span>
                        <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded">
                          {formInput.firmwareArchitecture}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Bootloader</span>
                        <input
                          type="text"
                          value={formInput.bootloader}
                          onChange={(e) => handleFieldChange("bootloader", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Board Support Package (BSP)</span>
                        <input
                          type="text"
                          value={formInput.bsp}
                          onChange={(e) => handleFieldChange("bsp", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Device Drivers</span>
                        <input
                          type="text"
                          value={formInput.deviceDrivers}
                          onChange={(e) => handleFieldChange("deviceDrivers", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Middleware Components</span>
                        <input
                          type="text"
                          value={formInput.middlewareComponents}
                          onChange={(e) => handleFieldChange("middlewareComponents", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Application Modules</span>
                        <input
                          type="text"
                          value={formInput.applicationModules}
                          onChange={(e) => handleFieldChange("applicationModules", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Layered Diagram Panel */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-emerald-400" />
                          Layered Architecture
                        </span>
                        <button type="button" onClick={() => setLayeredDiagramModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setLayeredDiagramModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.layeredArchitectureDiagramUrl} alt="Layered Architecture" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1">
                        Application • Middleware • HAL • HW
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: RTOS & Task Management (with Task Priority Donut Chart)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      RTOS & Task Management
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      RTOS Status: {formInput.rtosStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">RTOS Platform</span>
                        <input
                          type="text"
                          value={formInput.rtosPlatform}
                          onChange={(e) => handleFieldChange("rtosPlatform", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Active Tasks</span>
                        <input
                          type="number"
                          value={formInput.numberOfTasks}
                          onChange={(e) => handleFieldChange("numberOfTasks", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Scheduling Method</span>
                        <input
                          type="text"
                          value={formInput.schedulingMethod}
                          onChange={(e) => handleFieldChange("schedulingMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Task Priorities</span>
                        <input
                          type="text"
                          value={formInput.taskPriorities}
                          onChange={(e) => handleFieldChange("taskPriorities", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Interrupt Management</span>
                        <input
                          type="text"
                          value={formInput.interruptManagement}
                          onChange={(e) => handleFieldChange("interruptManagement", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Memory Management</span>
                        <input
                          type="text"
                          value={formInput.memoryManagement}
                          onChange={(e) => handleFieldChange("memoryManagement", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Donut Chart Box */}
                    <TaskPriorityDonutChart
                      high={formInput.taskDistribution.high}
                      medium={formInput.taskDistribution.medium}
                      low={formInput.taskDistribution.low}
                    />
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Communication Interfaces
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Communication Interfaces
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      6 Hardware Interfaces Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formInput.interfacesList.map((iface, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="font-semibold text-slate-800">{iface.name}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 stroke-[3]" /> Enabled
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block font-semibold mb-1">Wireless Interfaces</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formInput.wirelessInterfaces.map((w, i) => (
                          <span key={i} className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-2.5 py-1 rounded text-xs font-bold">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Functional Modules
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Functional Modules
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      7 Core Modules Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                    {formInput.functionalModulesList.map((mod, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{mod.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Cybersecurity & Functional Safety
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Cybersecurity & Functional Safety
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Security Score: {formInput.securityReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Secure Boot</span>
                        <input
                          type="text"
                          value={formInput.secureBoot}
                          onChange={(e) => handleFieldChange("secureBoot", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Firmware Encryption</span>
                        <input
                          type="text"
                          value={formInput.firmwareEncryption}
                          onChange={(e) => handleFieldChange("firmwareEncryption", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Secure Key Storage</span>
                        <input
                          type="text"
                          value={formInput.secureKeyStorage}
                          onChange={(e) => handleFieldChange("secureKeyStorage", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Watchdog Configuration</span>
                        <input
                          type="text"
                          value={formInput.watchdogConfiguration}
                          onChange={(e) => handleFieldChange("watchdogConfiguration", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Functional Safety Standards</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.functionalSafetyStandards.map((fs, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {fs}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Cybersecurity Standards</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.cybersecurityStandards.map((cs, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {cs}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Security Readiness Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Security Readiness Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.securityReadinessScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Secure Boot & Hardware AES Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Firmware Testing & Validation
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Firmware Testing & Validation
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Code Coverage: {formInput.codeCoverage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {formInput.testItems.map((test) => (
                          <div key={test.id} className="p-2.5 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-slate-800 block">{test.name}</span>
                              {test.details && <span className="text-[10px] text-slate-500">{test.details}</span>}
                            </div>
                            <StatusBadge status={test.status} />
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 bg-slate-100 rounded border font-medium text-slate-800">
                        <span>Test Summary: </span>
                        <span className="font-bold">{formInput.testReportSummary}</span>
                      </div>
                    </div>

                    {/* Validation Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Validation Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.validationScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Code Coverage {formInput.codeCoverage}% Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Embedded Development Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Embedded Development Assessment
                    </h2>
                    <span className="bg-emerald-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallEmbeddedScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Firmware Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiFirmwareQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Code Opt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCodeOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Memory Opt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiMemoryOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Timing Analysis</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiTimingAnalysis} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Development Summary (Kept in Sync with Sidebar)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Development Summary
                    </h2>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Recommendation: {record.summary.recommendation}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Firmware Readiness</span>
                        <span>{record.summary.firmwareReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${record.summary.firmwareReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Hardware Compatibility</span>
                        <span>{record.summary.hardwareCompatibility} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${record.summary.hardwareCompatibility}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Performance Score</span>
                        <span>{record.summary.performanceScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.performanceScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Security Score</span>
                        <span>{record.summary.securityScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.securityScore}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Embedded Score</span>
                      <span className="text-base text-emerald-700">{record.summary.overallEmbeddedScore} /100</span>
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
                      Embedded Systems Review Board
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
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as EmbeddedDevelopmentApprovalDecision)}
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
                          placeholder="Enter embedded review board comments..."
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
                        <span className="font-bold text-foreground">{record.embeddedEngineerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.embeddedEngineerName}</span>
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
                  {/* Overall Embedded Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Microscope className="h-4 w-4 text-primary" />
                      Overall Embedded Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallEmbeddedScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Firmware Readiness</span>
                        <span className="font-bold text-slate-800">{record.summary.firmwareReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Hardware Compatibility</span>
                        <span className="font-bold text-slate-800">{record.summary.hardwareCompatibility} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Performance</span>
                        <span className="font-bold text-slate-800">{record.summary.performanceScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Security</span>
                        <span className="font-bold text-slate-800">{record.summary.securityScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-emerald-700">
                        <span>Overall Score</span>
                        <span>{record.summary.overallEmbeddedScore} /100</span>
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
                        Generate Development Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceCodeModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Code className="h-4 w-4 text-amber-600" />
                        View Firmware Source Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setRtosConfigModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Terminal className="h-4 w-4 text-indigo-600" />
                        View RTOS Configuration
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskManagementModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        View Task Management
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestReportModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                        View Test Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaticAnalysisModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-rose-600" />
                        Run Static Code Analysis
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
                Embedded Systems Engineering Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.developmentId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.developmentProjectName}</span>
                <p className="text-slate-600">
                  Covers FreeRTOS v10.4.3 kernel, 12 active tasks, MISRA-C 96% compliance, 92.4% code coverage, Secure Boot, and HIL test validation.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Embedded Score: {record.summary.overallEmbeddedScore}/100</div>
                <div className="p-2 border rounded">Microcontroller: {formInput.microcontrollerSoc}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Embedded_Development_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hardware Board Modal */}
        <Dialog open={hardwareModalOpen} onOpenChange={setHardwareModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>STM32 Evaluation Board Hardware View</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.hardwareBoardImageUrl} alt="Board Render" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Hardware Diagram Modal */}
        <Dialog open={hardwareDiagramModalOpen} onOpenChange={setHardwareDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Hardware Platform / SoC Block Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.hardwarePlatformDiagramUrl} alt="Hardware Diagram" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Layered Architecture Modal */}
        <Dialog open={layeredDiagramModalOpen} onOpenChange={setLayeredDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Firmware Layered Architecture Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.layeredArchitectureDiagramUrl} alt="Layered Architecture" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Source Code Modal */}
        <Dialog open={sourceCodeModalOpen} onOpenChange={setSourceCodeModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-600" />
                Firmware Source Code Repository
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-emerald-400">// FreeRTOS Task Entry Point - Charger State Machine</div>
                <div>void vChargerTask(void *pvParameters) &#123;</div>
                <div className="pl-4">for(;;) &#123;</div>
                <div className="pl-8 text-blue-300">vTaskDelay(pdMS_TO_TICKS(10));</div>
                <div className="pl-8">EV_ProcessSafetyState();</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSourceCodeModalOpen(false)}>Close</ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Firmware_Source_Code.zip"); setSourceCodeModalOpen(false); }}>Download ZIP</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RTOS Config Modal */}
        <Dialog open={rtosConfigModalOpen} onOpenChange={setRtosConfigModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-600" />
                FreeRTOSConfig.h Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2 border rounded font-mono">#define configCPU_CLOCK_HZ (480000000UL)</div>
              <div className="p-2 border rounded font-mono">#define configTICK_RATE_HZ (1000)</div>
              <div className="p-2 border rounded font-mono">#define configMAX_PRIORITIES (32)</div>
              <div className="p-2 border rounded font-mono">#define configTOTAL_HEAP_SIZE ((size_t)(128 * 1024))</div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setRtosConfigModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Management Modal */}
        <Dialog open={taskManagementModalOpen} onOpenChange={setTaskManagementModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                RTOS Task Priority & Stack Usage
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2 border rounded flex justify-between font-semibold">
                <span>Safety_Task (Priority 28)</span>
                <span className="text-emerald-600">Stack Used: 420 / 1024 Bytes</span>
              </div>
              <div className="p-2 border rounded flex justify-between font-semibold">
                <span>CAN_Handler_Task (Priority 24)</span>
                <span className="text-emerald-600">Stack Used: 680 / 2048 Bytes</span>
              </div>
              <div className="p-2 border rounded flex justify-between font-semibold">
                <span>TCP_IP_Task (Priority 16)</span>
                <span className="text-emerald-600">Stack Used: 1450 / 4096 Bytes</span>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setTaskManagementModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Report Modal */}
        <Dialog open={testReportModalOpen} onOpenChange={setTestReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                HIL & Automated Test Execution
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                480 / 480 Tests Passed • 0 Test Failures • 92.4% Line Coverage
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setTestReportModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Static Analysis Modal */}
        <Dialog open={staticAnalysisModalOpen} onOpenChange={setStaticAnalysisModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
                MISRA C & Static Code Analysis Result
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-slate-50 border rounded font-semibold text-slate-800">
                MISRA C:2012 Compliance Score: 96% (0 Mandatory Rule Violations)
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setStaticAnalysisModalOpen(false)}>Close</ErpButton>
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
                Schedule Embedded Systems Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Kavita Sharma, Rohit Nair, Rajesh Varma, Suresh Menon" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Embedded Systems Review Meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
