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
  ElectricalDesignTabBar,
  type ElectricalDesignTabId,
} from "@/components/erp/ElectricalDesignTabBar";
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
import { electricalDesignService } from "@/services";
import type {
  ElectricalDesignApprovalDecision,
  ElectricalDesignFormInput,
  ElectricalDesignRecord,
  ElectricalDesignStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/electrical-design/new",
)({
  head: () => ({
    meta: [{ title: "Electrical Design Form · Magnertia ERP" }],
  }),
  component: ElectricalDesignFormPage,
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

  let strokeColor = "stroke-blue-600";
  let textColor = "text-blue-600";
  let bgColor = "text-blue-100";

  if (score >= 85) {
    strokeColor = "stroke-blue-600";
    textColor = "text-blue-600";
    bgColor = "text-blue-100";
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
   Main Electrical Design Form Page
   =========================================================================== */
export function ElectricalDesignFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ElectricalDesignTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [schematicModalOpen, setSchematicModalOpen] = useState(false);
  const [singleLineModalOpen, setSingleLineModalOpen] = useState(false);
  const [pcbModalOpen, setPcbModalOpen] = useState(false);
  const [harnessModalOpen, setHarnessModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [renderModalOpen, setRenderModalOpen] = useState(false);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [thermalModalOpen, setThermalModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["electrical-design-record"],
    queryFn: () => electricalDesignService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<ElectricalDesignFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<ElectricalDesignFormInput>) =>
      electricalDesignService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electrical-design-record"], updated);
      toast.success("Electrical Design draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => electricalDesignService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electrical-design-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: ElectricalDesignApprovalDecision;
      comments?: string;
    }) => electricalDesignService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["electrical-design-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Electrical Design Approved! Auto-linked downstream Prototype Manufacturing project PM-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: ElectricalDesignStage) =>
      electricalDesignService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["electrical-design-record"], updated);
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
              Loading Electrical Design module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof ElectricalDesignFormInput, value: any) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <AppShell
      title="Electrical Design"
      breadcrumb={breadcrumb}
      description="Design high-voltage power distribution, schematics, cable harnesses, and power quality analysis."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Electrical Design Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Electrical Design Draft EDF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Electrical Design
              </ErpButton>
            </div>
          </div>

        {/* ===========================================================================
            2. WORKFLOW STAGE STEPPER (Sequence Diagram driven 4 Stages)
            =========================================================================== */}
        <div className="bg-slate-900 text-white px-6 py-3.5 shadow-md">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Electrical Engineering Lifecycle
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {record.currentStageLabel}
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-400/30">
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
                        ? "bg-blue-600 border-blue-400 text-white shadow-sm ring-2 ring-blue-400/50"
                        : isDone
                        ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                        isCurrent
                          ? "bg-white text-blue-700"
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
                    Electrical Design ID
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
                        ["electrical-design-record"],
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
                  onClick={() => toast.info("Exporting Electrical Design package...")}
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
                {/* Linked Mechanical Design Chip */}
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                  <Box className="h-3.5 w-3.5 text-blue-600" />
                  <span>Linked Mechanical Design:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/mechanical-design/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-blue-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedMechanicalDesignId}
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

                {/* Downstream Prototype Manufacturing Project Banner if Approved */}
                {record.linkedPrototypeManufacturingId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream Prototype Manufacturing:</span>
                    <span className="underline font-black font-mono">
                      {record.linkedPrototypeManufacturingId}
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
                  <span>Electrical Engineer:</span>
                  <img
                    src={record.electricalEngineerAvatar}
                    alt={record.electricalEngineerName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.electricalEngineerName}
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
        <ElectricalDesignTabBar
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
                    Electrical Design Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Downstream Prototype Manufacturing project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedPrototypeManufacturingId}
                    </span>{" "}
                    has been linked & initiated. Proceed to Prototype Manufacturing.
                  </p>
                </div>
              </div>
              <ErpButton
                size="sm"
                onClick={() =>
                  toast.info(
                    `Navigating to Prototype Manufacturing (${record.linkedPrototypeManufacturingId})...`
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Proceed to Prototype Manufacturing
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
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Electrical Design record ({record.designId}) • {record.designProjectName}
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
                    PANEL 1: Electrical Design Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Electrical Design Overview
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
                          Electrical Design Objective
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.electricalDesignObjective}
                          onChange={(e) => handleFieldChange("electricalDesignObjective", e.target.value)}
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

                    {/* Embedded Product CAD Render */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Product Render
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
                          alt="Smart EV Charger Render"
                          className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        EV Charging Station • Enclosure Render
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Electrical Architecture (with Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Electrical Architecture
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Architecture Status: {formInput.architectureStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Architecture Name</span>
                        <input
                          type="text"
                          value={formInput.electricalArchitectureName}
                          onChange={(e) => handleFieldChange("electricalArchitectureName", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">System Voltage</span>
                        <input
                          type="text"
                          value={formInput.systemVoltage}
                          onChange={(e) => handleFieldChange("systemVoltage", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Power Rating</span>
                        <input
                          type="text"
                          value={formInput.powerRating}
                          onChange={(e) => handleFieldChange("powerRating", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">AC/DC Configuration</span>
                        <input
                          type="text"
                          value={formInput.acDcConfiguration}
                          onChange={(e) => handleFieldChange("acDcConfiguration", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Power Distribution Topology</span>
                        <input
                          type="text"
                          value={formInput.powerDistributionTopology}
                          onChange={(e) => handleFieldChange("powerDistributionTopology", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Electrical Interfaces</span>
                        <input
                          type="text"
                          value={formInput.electricalInterfaces}
                          onChange={(e) => handleFieldChange("electricalInterfaces", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Architecture Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          Architecture Block Diagram
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
                          src={formInput.architectureDiagramUrl}
                          alt="Electrical Architecture Diagram"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1">
                        Block Diagram • Single Line & Distribution
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Power System Design
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Power System Design
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Target Efficiency: {formInput.powerEfficiencyTarget}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Power Source</span>
                      <input
                        type="text"
                        value={formInput.powerSource}
                        onChange={(e) => handleFieldChange("powerSource", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Power Supply Design</span>
                      <input
                        type="text"
                        value={formInput.powerSupplyDesign}
                        onChange={(e) => handleFieldChange("powerSupplyDesign", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Converter Type</span>
                      <input
                        type="text"
                        value={formInput.converterType}
                        onChange={(e) => handleFieldChange("converterType", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Inverter Specification</span>
                      <input
                        type="text"
                        value={formInput.inverterSpecification}
                        onChange={(e) => handleFieldChange("inverterSpecification", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block font-semibold mb-1">Transformer/Coil Specification</span>
                      <input
                        type="text"
                        value={formInput.transformerCoilSpecification}
                        onChange={(e) => handleFieldChange("transformerCoilSpecification", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Efficiency Target</span>
                      <input
                        type="text"
                        value={formInput.powerEfficiencyTarget}
                        onChange={(e) => handleFieldChange("powerEfficiencyTarget", e.target.value)}
                        className="w-full rounded-md border border-emerald-300 font-black text-emerald-700 bg-emerald-50/50 px-2.5 py-1"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Thermal Load</span>
                      <input
                        type="text"
                        value={formInput.thermalLoad}
                        onChange={(e) => handleFieldChange("thermalLoad", e.target.value)}
                        className="w-full rounded-md border border-input font-bold text-slate-800 bg-slate-50/50 px-2.5 py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Circuit & PCB Design (with PCB Image)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Circuit & PCB Design
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      PCB Status: {formInput.pcbStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">PCB Name</span>
                        <input
                          type="text"
                          value={formInput.pcbName}
                          onChange={(e) => handleFieldChange("pcbName", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">PCB Revision</span>
                        <input
                          type="text"
                          value={formInput.pcbRevision}
                          onChange={(e) => handleFieldChange("pcbRevision", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-mono font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">PCB Layer Count</span>
                        <input
                          type="number"
                          value={formInput.pcbLayerCount}
                          onChange={(e) => handleFieldChange("pcbLayerCount", Number(e.target.value))}
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
                      <div className="col-span-2">
                        <span className="text-muted-foreground block font-semibold mb-1">Major Components</span>
                        <input
                          type="text"
                          value={formInput.majorComponents}
                          onChange={(e) => handleFieldChange("majorComponents", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block font-semibold mb-1">Connector Types</span>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded border">
                          {formInput.connectorTypes.map((c, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PCB Board Render Panel */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <CircuitBoard className="h-3.5 w-3.5 text-primary" />
                          PCB Board Render
                        </span>
                        <button type="button" onClick={() => setPcbModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setPcbModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer">
                        <img src={formInput.pcbBoardImageUrl} alt="PCB Board" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1">
                        Control PCB • 6-Layer Board Stack-up
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Wiring & Harness Design (with Harness Image)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Wiring & Harness Design
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Harness Status: {formInput.harnessStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Harness Name</span>
                        <input
                          type="text"
                          value={formInput.harnessName}
                          onChange={(e) => handleFieldChange("harnessName", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Cable Type</span>
                        <input
                          type="text"
                          value={formInput.cableType}
                          onChange={(e) => handleFieldChange("cableType", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Wire Gauge</span>
                        <input
                          type="text"
                          value={formInput.wireGauge}
                          onChange={(e) => handleFieldChange("wireGauge", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Connector Standard</span>
                        <input
                          type="text"
                          value={formInput.connectorStandard}
                          onChange={(e) => handleFieldChange("connectorStandard", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block font-semibold mb-1">Routing Description</span>
                        <textarea
                          rows={2}
                          value={formInput.routingDescription}
                          onChange={(e) => handleFieldChange("routingDescription", e.target.value)}
                          className="w-full rounded-md border border-input p-2 text-xs font-medium text-foreground bg-slate-50/50 resize-none"
                        />
                      </div>
                    </div>

                    {/* Harness Image Panel */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Cable className="h-3.5 w-3.5 text-primary" />
                          Harness Assembly
                        </span>
                        <button type="button" onClick={() => setHarnessModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setHarnessModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer">
                        <img src={formInput.harnessImageUrl} alt="Wiring Harness" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        Power Cable Harness • {formInput.harnessLength}
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Protection & Safety
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Protection & Safety
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Safety Score: {formInput.electricalSafetyScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Fuse Specification</span>
                        <input
                          type="text"
                          value={formInput.fuseSpecification}
                          onChange={(e) => handleFieldChange("fuseSpecification", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Circuit Breaker</span>
                        <input
                          type="text"
                          value={formInput.circuitBreaker}
                          onChange={(e) => handleFieldChange("circuitBreaker", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Isolation Method</span>
                        <input
                          type="text"
                          value={formInput.isolationMethod}
                          onChange={(e) => handleFieldChange("isolationMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Earthing Method</span>
                        <input
                          type="text"
                          value={formInput.earthingMethod}
                          onChange={(e) => handleFieldChange("earthingMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Surge Protection</span>
                        <input
                          type="text"
                          value={formInput.surgeProtection}
                          onChange={(e) => handleFieldChange("surgeProtection", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Functional Safety Standards</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.functionalSafetyStandard.map((fs, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {fs}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Computed Safety Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Electrical Safety Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.electricalSafetyScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Galvanic Isolation & Protective Grounding Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: EMC / EMI & Compliance
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      EMC / EMI & Compliance
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.complianceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">EMC Standards</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.emcStandard.map((e, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">EMI Mitigation Strategy</span>
                        <input
                          type="text"
                          value={formInput.emiMitigationStrategy}
                          onChange={(e) => handleFieldChange("emiMitigationStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Shielding Method</span>
                        <input
                          type="text"
                          value={formInput.shieldingMethod}
                          onChange={(e) => handleFieldChange("shieldingMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Grounding Strategy</span>
                        <input
                          type="text"
                          value={formInput.groundingStrategy}
                          onChange={(e) => handleFieldChange("groundingStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block font-semibold mb-1">Test Plan</span>
                        <input
                          type="text"
                          value={formInput.testPlan}
                          onChange={(e) => handleFieldChange("testPlan", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Compliance Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Compliance Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.complianceScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        IEC 61000 Series Pre-compliant
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Simulation & Validation (with Thermal Heatmap)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Simulation & Validation
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Validation Status: {formInput.validationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        {formInput.simulations.map((sim) => (
                          <div key={sim.id} className="p-2.5 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <span className="font-semibold text-slate-800">{sim.name}</span>
                            <StatusBadge status={sim.status} />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-muted-foreground block font-semibold mb-1">Validation Method</span>
                          <span className="font-bold text-slate-800 block p-2 bg-slate-100 rounded border">
                            {formInput.validationMethod}
                          </span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Validation Score</span>
                          <span className="text-xl font-black text-emerald-700">{formInput.validationScore} /100</span>
                        </div>
                      </div>
                    </div>

                    {/* Thermal Heatmap Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-950 text-white flex flex-col items-center justify-between relative overflow-hidden group">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                          PCB Thermal Simulation Heatmap
                        </span>
                        <button type="button" onClick={() => setThermalModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setThermalModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.thermalHeatmapUrl} alt="Thermal Heatmap" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1 block">
                        Peak Thermal Load 450 W • Temp &lt; 78°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Electrical Design Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Electrical Design Assessment
                    </h2>
                    <span className="bg-blue-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallElectricalScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Design Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiDesignQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Power Opt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiPowerOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Circuit Review</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCircuitReview} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Thermal Assmt.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiThermalAssessment} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">EMC Rec.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiEmcRecommendations} /100</span>
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
                        <span>Power System Readiness</span>
                        <span>{record.summary.powerSystemReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${record.summary.powerSystemReadiness}%` }} />
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
                        <span>Electrical Safety Score</span>
                        <span>{record.summary.electricalSafetyScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.electricalSafetyScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Compliance Score</span>
                        <span>{record.summary.complianceScore} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.complianceScore}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Electrical Design Score</span>
                      <span className="text-base text-blue-700">{record.summary.overallElectricalDesignScore} /100</span>
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
                      Electrical Design Review Board
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
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as ElectricalDesignApprovalDecision)}
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
                          placeholder="Enter electrical review board comments..."
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
                        <span className="font-bold text-foreground">{record.electricalEngineerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.electricalEngineerName}</span>
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
                  {/* Overall Electrical Design Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Zap className="h-4 w-4 text-primary" />
                      Overall Electrical Design Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallElectricalDesignScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Power System Readiness</span>
                        <span className="font-bold text-slate-800">{record.summary.powerSystemReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Circuit Readiness</span>
                        <span className="font-bold text-slate-800">{record.summary.circuitReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Electrical Safety</span>
                        <span className="font-bold text-slate-800">{record.summary.electricalSafetyScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Compliance</span>
                        <span className="font-bold text-slate-800">{record.summary.complianceScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-primary">
                        <span>Overall Score</span>
                        <span>{record.summary.overallElectricalDesignScore} /100</span>
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
                        View Electrical Schematic
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleLineModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-indigo-600" />
                        View Single Line Diagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setPcbModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <CircuitBoard className="h-4 w-4 text-emerald-600" />
                        View PCB Design
                      </button>
                      <button
                        type="button"
                        onClick={() => setHarnessModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Cable className="h-4 w-4 text-purple-600" />
                        View Wiring Harness
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Flame className="h-4 w-4 text-rose-600" />
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
                          toast.success("Exported Electrical Design Data JSON package.");
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
                Electrical Design Engineering Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.designId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.designProjectName}</span>
                <p className="text-slate-600">
                  Covers PFC + LLC power supply topology, 6-layer control PCB, galvanic isolation safety score (88/100), and IEC 61000 EMC compliance.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Design Score: {record.summary.overallElectricalDesignScore}/100</div>
                <div className="p-2 border rounded">Power Rating: {formInput.powerRating}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Electrical_Design_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Architecture Diagram Modal */}
        <Dialog open={diagramModalOpen} onOpenChange={setDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Electrical Architecture Block Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.architectureDiagramUrl} alt="Diagram" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Render Fullscreen Modal */}
        <Dialog open={renderModalOpen} onOpenChange={setRenderModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Product CAD Enclosure Render</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.productRenderUrl} alt="Render" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* PCB Board Modal */}
        <Dialog open={pcbModalOpen} onOpenChange={setPcbModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Control PCB Board Stack-up & Component Layout</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.pcbBoardImageUrl} alt="PCB Board" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Harness Modal */}
        <Dialog open={harnessModalOpen} onOpenChange={setHarnessModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Main Power Cable Harness Specification</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.harnessImageUrl} alt="Wiring Harness" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Thermal Heatmap Modal */}
        <Dialog open={thermalModalOpen} onOpenChange={setThermalModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>PCB Thermal Simulation Infrared Heatmap</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-950 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.thermalHeatmapUrl} alt="Thermal Heatmap" className="max-h-full object-contain" />
            </div>
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
                Schedule Electrical Design Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Ananya Iyer, Rohit Nair, Priya Mehta, Vikram Singh" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Electrical Design Review Meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
