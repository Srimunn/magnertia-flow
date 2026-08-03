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
  GitBranch,
  Play,
  Package,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  FirmwareDevelopmentTabBar,
  type FirmwareDevelopmentTabId,
} from "@/components/erp/FirmwareDevelopmentTabBar";
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
import { firmwareDevelopmentService } from "@/services";
import type {
  FirmwareDevelopmentApprovalDecision,
  FirmwareDevelopmentFormInput,
  FirmwareDevelopmentRecord,
  FirmwareDevelopmentStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/firmware-development/new",
)({
  head: () => ({
    meta: [{ title: "Firmware Development Form · Magnertia ERP" }],
  }),
  component: FirmwareDevelopmentFormPage,
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

  let strokeColor = "stroke-teal-600";
  let textColor = "text-teal-700";
  let bgColor = "text-teal-100";

  if (score >= 85) {
    strokeColor = "stroke-teal-600";
    textColor = "text-teal-700";
    bgColor = "text-teal-100";
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
   Main Firmware Development Form Page
   =========================================================================== */
export function FirmwareDevelopmentFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FirmwareDevelopmentTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sourceCodeModalOpen, setSourceCodeModalOpen] = useState(false);
  const [mcuChipModalOpen, setMcuChipModalOpen] = useState(false);
  const [layeredDiagramModalOpen, setLayeredDiagramModalOpen] = useState(false);
  const [buildPipelineModalOpen, setBuildPipelineModalOpen] = useState(false);
  const [staticAnalysisModalOpen, setStaticAnalysisModalOpen] = useState(false);
  const [testReportModalOpen, setTestReportModalOpen] = useState(false);
  const [newReleaseModalOpen, setNewReleaseModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["firmware-development-record"],
    queryFn: () => firmwareDevelopmentService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<FirmwareDevelopmentFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<FirmwareDevelopmentFormInput>) =>
      firmwareDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["firmware-development-record"], updated);
      toast.success("Firmware Development draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => firmwareDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["firmware-development-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: FirmwareDevelopmentApprovalDecision;
      comments?: string;
    }) => firmwareDevelopmentService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["firmware-development-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Firmware Development Approved! Auto-created downstream Hardware Bring-up project HB-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: FirmwareDevelopmentStage) =>
      firmwareDevelopmentService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["firmware-development-record"], updated);
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
              Loading Firmware Development module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof FirmwareDevelopmentFormInput, value: any) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <AppShell
      title="Firmware Development"
      breadcrumb={breadcrumb}
      description="Build embedded C/C++ firmware, bootloaders, OTA update packages, and flash images."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Firmware Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Firmware Development Draft FWF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Firmware Project
              </ErpButton>
            </div>
          </div>

        {/* ===========================================================================
            2. WORKFLOW STAGE STEPPER (Sequence Diagram driven 4 Stages)
            =========================================================================== */}
        <div className="bg-slate-900 text-white px-6 py-3.5 shadow-md">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-teal-400" />
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Firmware Lifecycle Engine
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {record.currentStageLabel}
                  <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded border border-teal-400/30">
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
                        ? "bg-teal-600 border-teal-400 text-white shadow-sm ring-2 ring-teal-400/50"
                        : isDone
                        ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                        isCurrent
                          ? "bg-white text-teal-700"
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
                    Firmware Development ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {record.firmwareId}
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
                    Firmware Project Name
                  </span>
                  <input
                    type="text"
                    value={record.firmwareProjectName}
                    onChange={(e) =>
                      queryClient.setQueryData(
                        ["firmware-development-record"],
                        (prev: any) => ({
                          ...prev,
                          firmwareProjectName: e.target.value,
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
                  onClick={() => toast.info("Exporting Firmware Development package...")}
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
                {/* Linked Embedded Development Chip */}
                <div className="flex items-center gap-1.5 bg-teal-50/80 border border-teal-200 text-teal-800 rounded-md px-2.5 py-1 font-medium">
                  <Microscope className="h-3.5 w-3.5 text-teal-600" />
                  <span>Linked Embedded Development:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/embedded-systems-development/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-teal-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedEmbeddedDevelopmentId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

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

                {/* Downstream Hardware Bring-up Banner if Approved */}
                {record.linkedHardwareBringupId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream Hardware Bring-up:</span>
                    <span className="underline font-black font-mono">
                      {record.linkedHardwareBringupId}
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
                  <span>Firmware Lead:</span>
                  <img
                    src={record.firmwareLeadAvatar}
                    alt={record.firmwareLeadName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.firmwareLeadName}
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
        <FirmwareDevelopmentTabBar
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
                    Firmware Development Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Downstream Hardware Bring-up project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedHardwareBringupId}
                    </span>{" "}
                    has been auto-created & linked. Proceed to Hardware Bring-up.
                  </p>
                </div>
              </div>
              <ErpButton
                size="sm"
                onClick={() =>
                  toast.info(
                    `Navigating to Hardware Bring-up (${record.linkedHardwareBringupId})...`
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Proceed to Hardware Bring-up
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
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Firmware Development record ({record.firmwareId}) • {record.firmwareProjectName}
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
                  Detailed sub-views and interactive editors for <span className="font-bold capitalize">{activeTab.replace("_", " ")}</span> are linked to record {record.firmwareId}.
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
                    PANEL 1: Firmware Project Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Firmware Project Overview
                    </h2>
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
                            Firmware Name
                          </label>
                          <input
                            type="text"
                            value={formInput.firmwareName}
                            onChange={(e) => handleFieldChange("firmwareName", e.target.value)}
                            className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Firmware Objective
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.firmwareObjective}
                          onChange={(e) => handleFieldChange("firmwareObjective", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Development Scope
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.developmentScope}
                          onChange={(e) => handleFieldChange("developmentScope", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Supported Hardware
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-md border border-input">
                            {formInput.supportedHardware.map((hw, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-white border border-border px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-800 shadow-2xs"
                              >
                                <Cpu className="h-3 w-3 text-primary" />
                                {hw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Programming Languages
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-md border border-input">
                            {formInput.programmingLanguage.map((lang, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-white border border-border px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-800 shadow-2xs"
                              >
                                <Code className="h-3 w-3 text-emerald-600" />
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MCU / Chip Image Panel */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Target MCU / SoC Render
                        </span>
                        <button
                          type="button"
                          onClick={() => setMcuChipModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setMcuChipModalOpen(true)}
                        className="w-full h-56 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer relative group/img"
                      >
                        <img
                          src={formInput.mcuChipImageUrl}
                          alt="STM32 Target MCU Chip"
                          className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        STM32H743ZI • ARM Cortex-M7 Target
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Firmware Architecture (with Layered Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Firmware Architecture
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Architecture Status: {formInput.architectureStatus}
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
                        <span className="text-muted-foreground block font-semibold mb-1">Bootloader Version</span>
                        <input
                          type="text"
                          value={formInput.bootloaderVersion}
                          onChange={(e) => handleFieldChange("bootloaderVersion", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">HAL Version</span>
                        <input
                          type="text"
                          value={formInput.halVersion}
                          onChange={(e) => handleFieldChange("halVersion", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">BSP Version</span>
                        <input
                          type="text"
                          value={formInput.bspVersion}
                          onChange={(e) => handleFieldChange("bspVersion", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Middleware Stack</span>
                        <input
                          type="text"
                          value={formInput.middlewareStack}
                          onChange={(e) => handleFieldChange("middlewareStack", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Application Framework</span>
                        <input
                          type="text"
                          value={formInput.applicationFramework}
                          onChange={(e) => handleFieldChange("applicationFramework", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Layered Architecture Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-teal-400" />
                          Layered Architecture Diagram
                        </span>
                        <button type="button" onClick={() => setLayeredDiagramModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setLayeredDiagramModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.layeredArchitectureDiagramUrl} alt="Layered Architecture" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1">
                        Application • Middleware • HAL • BSP
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Software Modules Table
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Software Modules
                    </h2>
                    <button type="button" onClick={() => setActiveTab("modules")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      View All Modules ({formInput.modules.length}) &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-border text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2.5">Module Name</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Owner</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Complexity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {formInput.modules.map((mod) => (
                          <tr key={mod.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold font-mono text-slate-900">{mod.name}</td>
                            <td className="p-2.5 font-medium text-slate-600">{mod.category}</td>
                            <td className="p-2.5 text-slate-700">{mod.owner}</td>
                            <td className="p-2.5"><StatusBadge status={mod.status} /></td>
                            <td className="p-2.5 font-bold text-slate-800">{mod.complexity} /100</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Communication Stack
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Communication Stack
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Protocol Stack: {formInput.protocolStackStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formInput.communicationInterfacesList.map((iface, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="font-semibold text-slate-800">{iface.name}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 stroke-[3]" /> Enabled
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block font-semibold mb-1">Wireless Protocol Stacks</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formInput.wirelessTags.map((w, i) => (
                          <span key={i} className="bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1 rounded text-xs font-bold">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Diagnostics & Safety
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Diagnostics & Safety
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Diagnostic Score: {formInput.diagnosticReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Self-Test Functions</span>
                        <input
                          type="text"
                          value={formInput.selfTestFunctions}
                          onChange={(e) => handleFieldChange("selfTestFunctions", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">DTC Support Count</span>
                        <input
                          type="number"
                          value={formInput.dtcSupportCount}
                          onChange={(e) => handleFieldChange("dtcSupportCount", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Fault Handling</span>
                        <input
                          type="text"
                          value={formInput.faultHandling}
                          onChange={(e) => handleFieldChange("faultHandling", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Watchdog Strategy</span>
                        <input
                          type="text"
                          value={formInput.watchdogStrategy}
                          onChange={(e) => handleFieldChange("watchdogStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Error Recovery</span>
                        <input
                          type="text"
                          value={formInput.errorRecovery}
                          onChange={(e) => handleFieldChange("errorRecovery", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Functional Safety</span>
                        <input
                          type="text"
                          value={formInput.functionalSafetyText}
                          onChange={(e) => handleFieldChange("functionalSafetyText", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-emerald-800 bg-emerald-50/50"
                        />
                      </div>
                    </div>

                    {/* Diagnostic Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Diagnostic Readiness Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.diagnosticReadinessScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {formInput.dtcSupportCount} Active DTCs Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Cybersecurity
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Cybersecurity
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Security Score: {formInput.securityScore}/100
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
                        <span className="text-muted-foreground block font-semibold mb-1">Firmware Signing</span>
                        <input
                          type="text"
                          value={formInput.firmwareSigning}
                          onChange={(e) => handleFieldChange("firmwareSigning", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Secure OTA Update</span>
                        <input
                          type="text"
                          value={formInput.secureOtaUpdate}
                          onChange={(e) => handleFieldChange("secureOtaUpdate", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Encryption Method</span>
                        <input
                          type="text"
                          value={formInput.encryptionMethod}
                          onChange={(e) => handleFieldChange("encryptionMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Authentication Method</span>
                        <input
                          type="text"
                          value={formInput.authenticationMethod}
                          onChange={(e) => handleFieldChange("authenticationMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Vulnerability Assessment</span>
                        <input
                          type="text"
                          value={formInput.vulnerabilityAssessment}
                          onChange={(e) => handleFieldChange("vulnerabilityAssessment", e.target.value)}
                          className="w-full rounded-md border border-emerald-300 font-bold text-emerald-800 bg-emerald-50/50 px-2.5 py-1"
                        />
                      </div>
                    </div>

                    {/* Security Score Tile */}
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                        Security Score
                      </span>
                      <div className="text-3xl font-black text-teal-700 my-1">
                        {formInput.securityScore}{" "}
                        <span className="text-xs font-semibold text-teal-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700">
                        RSA-2048 & TLS 1.3 Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Testing & QA
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Testing & QA
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Test Status: {formInput.testStatus}
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
                      <div className="p-2.5 bg-slate-100 rounded border font-medium text-slate-800 flex justify-between">
                        <span>Code Coverage: <strong className="text-emerald-700">{formInput.codeCoverage}%</strong></span>
                        <span>Memory Analysis: <strong className="text-slate-900">{formInput.memoryLeakAnalysis}</strong></span>
                      </div>
                    </div>

                    {/* Test Coverage Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Test Coverage
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {Math.round(formInput.codeCoverage)}{" "}
                        <span className="text-xs font-semibold text-emerald-600">%</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        MISRA-C 98% Compliance
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Release Management
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Release Management
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.releaseStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Release Type</span>
                        <input
                          type="text"
                          value={formInput.releaseType}
                          onChange={(e) => handleFieldChange("releaseType", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Build Number</span>
                        <input
                          type="text"
                          value={formInput.buildNumber}
                          onChange={(e) => handleFieldChange("buildNumber", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Git Commit Reference</span>
                        <input
                          type="text"
                          value={formInput.gitCommitReference}
                          onChange={(e) => handleFieldChange("gitCommitReference", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Release Date</span>
                        <input
                          type="date"
                          value={formInput.releaseDate}
                          onChange={(e) => handleFieldChange("releaseDate", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* OTA Package Card */}
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-700 uppercase">Signed OTA Package</span>
                      <div className="flex items-center gap-2 my-1">
                        <Package className="h-5 w-5 text-teal-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-mono font-bold text-xs text-foreground block truncate">{formInput.otaPackageName}</span>
                          <span className="text-[10px] text-muted-foreground">{formInput.otaPackageSize}</span>
                        </div>
                      </div>
                      <ErpButton size="sm" variant="outline" className="w-full" onClick={() => toast.info(`Downloading ${formInput.otaPackageName}...`)}>
                        <Download className="h-3 w-3 mr-1" /> Download Package
                      </ErpButton>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Firmware Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Firmware Assessment
                    </h2>
                    <span className="bg-teal-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallFirmwareScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Code Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCodeQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Performance</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiPerformanceOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Memory Opt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiMemoryOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Security Anal.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiSecurityAnalysis} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Bug Prediction</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiBugPrediction} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Maintainability</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiMaintainabilityScore} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Firmware Summary (Kept in Sync with Sidebar)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Firmware Summary
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
                        <span>Code Quality</span>
                        <span>{record.summary.codeQuality} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${record.summary.codeQuality}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Security Readiness</span>
                        <span>{record.summary.securityReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.securityReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Test Coverage</span>
                        <span>{record.summary.testCoverage} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.testCoverage}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Firmware Score</span>
                      <span className="text-base text-teal-700">{record.summary.overallFirmwareScore} /100</span>
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
                      Firmware Design Review Board
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
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as FirmwareDevelopmentApprovalDecision)}
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
                          placeholder="Enter firmware review board comments..."
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
                        <span className="font-bold text-foreground">{record.firmwareLeadName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.firmwareLeadName}</span>
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
                        View Audit Trail &rarr;
                      </button>
                      <button type="button" onClick={() => setSystemLogModalOpen(true)} className="text-xs font-bold text-primary hover:underline text-left cursor-pointer">
                        View Activity History &rarr;
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
                  {/* Overall Firmware Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Terminal className="h-4 w-4 text-primary" />
                      Overall Firmware Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallFirmwareScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Code Quality</span>
                        <span className="font-bold text-slate-800">{record.summary.codeQuality} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Performance</span>
                        <span className="font-bold text-slate-800">{record.summary.firmwareReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Security</span>
                        <span className="font-bold text-slate-800">{record.summary.securityReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Test Coverage</span>
                        <span className="font-bold text-slate-800">{record.summary.testCoverage}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-teal-700">
                        <span>Overall Score</span>
                        <span>{record.summary.overallFirmwareScore} /100</span>
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
                        Generate Firmware Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceCodeModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Code className="h-4 w-4 text-amber-600" />
                        View Source Code Repository
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuildPipelineModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Play className="h-4 w-4 text-indigo-600" />
                        Run Build Pipeline
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
                        onClick={() => setTestReportModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                        View Test Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewReleaseModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Package className="h-4 w-4 text-emerald-600" />
                        Create New Release
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
                Firmware Development Engineering Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.firmwareId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.firmwareProjectName}</span>
                <p className="text-slate-600">
                  Covers FreeRTOS kernel tasks, LwIP TCP/IP stack, MbedTLS security, MISRA-C 98% compliance, 94.6% test coverage, and release candidate v2.1.0-RC2.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Firmware Score: {record.summary.overallFirmwareScore}/100</div>
                <div className="p-2 border rounded">Firmware Version: {record.firmwareVersion}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Firmware_Development_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MCU Chip Modal */}
        <Dialog open={mcuChipModalOpen} onOpenChange={setMcuChipModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Target MCU / SoC Chip View</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.mcuChipImageUrl} alt="MCU Chip Render" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Layered Diagram Modal */}
        <Dialog open={layeredDiagramModalOpen} onOpenChange={setLayeredDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Firmware Layered Architecture Stack</DialogTitle>
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
                Firmware Source Code Repository (commit 8f3a91b)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-emerald-400">// EV Charger Firmware Application - Main Loop</div>
                <div>int main(void) &#123;</div>
                <div className="pl-4">HAL_Init();</div>
                <div className="pl-4">SystemClock_Config();</div>
                <div className="pl-4">MX_GPIO_Init();</div>
                <div className="pl-4 text-blue-300">vTaskStartScheduler();</div>
                <div>&#125;</div>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSourceCodeModalOpen(false)}>Close</ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Source_Code_Archive.zip"); setSourceCodeModalOpen(false); }}>Download Repository</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Build Pipeline Modal */}
        <Dialog open={buildPipelineModalOpen} onOpenChange={setBuildPipelineModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-indigo-600" />
                CI/CD Automated Build Pipeline
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold flex justify-between">
                <span>Build #1428: PASSED</span>
                <span>Compilation Time: 42s</span>
              </div>
              <div className="p-2 border rounded font-mono">Output: SmartEV_v2.1.0_signed.bin (2.4 MB)</div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setBuildPipelineModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Static Analysis Modal */}
        <Dialog open={staticAnalysisModalOpen} onOpenChange={setStaticAnalysisModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
                Static Analysis & MISRA-C Compliance Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-slate-50 border rounded font-semibold text-slate-800">
                MISRA C:2012 Compliance Score: 98% (0 High Severity Warnings)
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setStaticAnalysisModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Report Modal */}
        <Dialog open={testReportModalOpen} onOpenChange={setTestReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                Automated Test Execution Summary
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                Code Coverage: 94.6% • Unit Tests: Passed • Integration Tests: Passed
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setTestReportModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Release Modal */}
        <Dialog open={newReleaseModalOpen} onOpenChange={setNewReleaseModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Create New Firmware Release
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Release Version Tag</label>
                <input type="text" defaultValue="v2.2.0-RC1" className="w-full border p-2 rounded font-mono font-bold" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Release Type</label>
                <select className="w-full border p-2 rounded">
                  <option>Release Candidate</option>
                  <option>Production Release</option>
                  <option>Hotfix Patch</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setNewReleaseModalOpen(false)}>Cancel</ErpButton>
              <ErpButton onClick={() => { toast.success("Created new release candidate v2.2.0-RC1"); setNewReleaseModalOpen(false); }}>
                Build & Sign Package
              </ErpButton>
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
                Schedule Firmware Design Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Rajesh Varma, Kavita Sharma, Rohit Nair, Neha Sharma" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Firmware Design Review Meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
