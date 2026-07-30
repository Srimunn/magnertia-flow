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
  Server,
  Cloud,
  Globe,
  DatabaseZap,
  LayoutGrid,
  ActivitySquare,
  Smartphone,
  Tablet,
  Wifi,
  QrCode,
  Camera,
  Navigation,
  Bluetooth,
  Fingerprint,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  MobileDevelopmentTabBar,
  type MobileDevelopmentTabId,
} from "@/components/erp/MobileDevelopmentTabBar";
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
import { mobileDevelopmentService } from "@/services";
import type {
  MobileDevelopmentApprovalDecision,
  MobileDevelopmentFormInput,
  MobileDevelopmentRecord,
  MobileDevelopmentStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/mobile-app-development/new",
)({
  head: () => ({
    meta: [{ title: "Mobile App Development Form · Magnertia ERP" }],
  }),
  component: MobileDevelopmentFormPage,
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

  let strokeColor = "stroke-cyan-600";
  let textColor = "text-cyan-700";
  let bgColor = "text-cyan-100";

  if (score >= 85) {
    strokeColor = "stroke-cyan-600";
    textColor = "text-cyan-700";
    bgColor = "text-cyan-100";
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
   Main Mobile App Development Form Page
   =========================================================================== */
function MobileDevelopmentFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MobileDevelopmentTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sourceCodeModalOpen, setSourceCodeModalOpen] = useState(false);
  const [appMockupModalOpen, setAppMockupModalOpen] = useState(false);
  const [architectureDiagramModalOpen, setArchitectureDiagramModalOpen] = useState(false);
  const [uiPreviewModalOpen, setUiPreviewModalOpen] = useState(false);
  const [apiDocsModalOpen, setApiDocsModalOpen] = useState(false);
  const [crashAnalyticsModalOpen, setCrashAnalyticsModalOpen] = useState(false);
  const [appStoreStatusModalOpen, setAppStoreStatusModalOpen] = useState(false);
  const [testReportModalOpen, setTestReportModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["mobile-development-record"],
    queryFn: () => mobileDevelopmentService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<MobileDevelopmentFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<MobileDevelopmentFormInput>) =>
      mobileDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mobile-development-record"], updated);
      toast.success("Mobile App Development draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => mobileDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mobile-development-record"], updated);
      toast.success("Submitted for Stage 4 Mobile App Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: MobileDevelopmentApprovalDecision;
      comments?: string;
    }) => mobileDevelopmentService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["mobile-development-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Mobile Application Approved & Published! Auto-created downstream Mobile Operations engagement MO-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: MobileDevelopmentStage) =>
      mobileDevelopmentService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mobile-development-record"], updated);
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
              Loading Mobile App Development module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof MobileDevelopmentFormInput, value: any) => {
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
                  Mobile App Development
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-primary">
                  Mobile App Development Form
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Mobile App Development
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Mobile App Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Mobile App Development Draft MAF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Mobile Project
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
              <Workflow className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mobile App Lifecycle Engine
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {record.currentStageLabel}
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded border border-cyan-400/30">
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
                        ? "bg-cyan-600 border-cyan-400 text-white shadow-sm ring-2 ring-cyan-400/50"
                        : isDone
                        ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                        isCurrent
                          ? "bg-white text-cyan-700"
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
                    Mobile App Development ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {record.mobileId}
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
                    Mobile Project Name
                  </span>
                  <input
                    type="text"
                    value={record.mobileProjectName}
                    onChange={(e) =>
                      queryClient.setQueryData(
                        ["mobile-development-record"],
                        (prev: any) => ({
                          ...prev,
                          mobileProjectName: e.target.value,
                        })
                      )
                    }
                    className="font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[260px]"
                  />
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Mobile App Version
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-2 py-0.5 rounded font-mono">
                    {record.mobileAppVersion}
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
                  onClick={() => toast.info("Exporting Mobile App Development package...")}
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
                {/* Linked Software Development Chip */}
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                  <Code className="h-3.5 w-3.5 text-blue-600" />
                  <span>Linked Software Development:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/software-development/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-blue-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedSoftwareDevelopmentId}
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

                {/* Linked Product Roadmap Chip */}
                <div className="flex items-center gap-1.5 bg-teal-50/80 border border-teal-200 text-teal-800 rounded-md px-2.5 py-1 font-medium">
                  <Map className="h-3.5 w-3.5 text-teal-600" />
                  <span>Linked Product Roadmap:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/product-strategy/roadmaps" as any,
                      })
                    }
                    className="font-bold underline hover:text-teal-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedProductRoadmapId}
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

                {/* Downstream Mobile Operations Banner if Approved */}
                {record.linkedMobileOperationsId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream Mobile Operations:</span>
                    <span className="underline font-black font-mono">
                      {record.linkedMobileOperationsId}
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
                  <span>Mobile Architect:</span>
                  <img
                    src={record.mobileArchitectAvatar}
                    alt={record.mobileArchitectName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.mobileArchitectName}
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
        <MobileDevelopmentTabBar
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
                    Mobile Application Approved & Published to App Stores
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Google Play & Apple App Store packages published. Downstream Mobile Operations & Support engagement{" "}
                    <span className="font-bold font-mono">
                      {record.linkedMobileOperationsId}
                    </span>{" "}
                    has been auto-created & enabled. Proceed to Production.
                  </p>
                </div>
              </div>
              <ErpButton
                size="sm"
                onClick={() =>
                  toast.info(
                    `Navigating to Mobile Operations (${record.linkedMobileOperationsId})...`
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Proceed to Production
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
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Mobile App Development record ({record.mobileId}) • {record.mobileProjectName}
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
                  Detailed sub-views and interactive editors for <span className="font-bold capitalize">{activeTab.replace("_", " ")}</span> are linked to record {record.mobileId}.
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
                    PANEL 1: Project Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Project Overview
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
                            Mobile Application Name
                          </label>
                          <input
                            type="text"
                            value={formInput.mobileApplicationName}
                            onChange={(e) => handleFieldChange("mobileApplicationName", e.target.value)}
                            className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Project Objective
                        </label>
                        <textarea
                          rows={3}
                          value={formInput.projectObjective}
                          onChange={(e) => handleFieldChange("projectObjective", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="pt-1">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Target Users
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-md border border-input">
                          {formInput.targetUsersTags.map((userTag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-white border border-border px-2.5 py-1 rounded text-xs font-bold text-slate-800 shadow-2xs"
                            >
                              <User className="h-3 w-3 text-primary" />
                              {userTag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Phone Mockup Frame */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          EV Charger Mobile App View
                        </span>
                        <button
                          type="button"
                          onClick={() => setAppMockupModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setAppMockupModalOpen(true)}
                        className="w-full h-64 rounded-[2rem] overflow-hidden bg-slate-950 border-4 border-slate-800 shadow-lg flex items-center justify-center cursor-pointer relative group/img"
                      >
                        <img
                          src={formInput.appMockupImageUrl}
                          alt="Mobile App Frame Mockup"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        Flutter 3.19 • Dark Charging Dashboard
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Architecture (with Layer Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Architecture
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Architecture Status: {formInput.architectureStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Architecture Pattern</span>
                        <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded">
                          {formInput.architecturePattern}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Mobile Framework</span>
                        <input
                          type="text"
                          value={formInput.mobileFramework}
                          onChange={(e) => handleFieldChange("mobileFramework", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Target Platforms</span>
                        <div className="flex gap-2">
                          {formInput.platform.map((p, i) => (
                            <span key={i} className="bg-slate-100 border border-slate-300 font-bold px-2.5 py-1 rounded text-slate-800">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">State Management</span>
                        <input
                          type="text"
                          value={formInput.stateManagement}
                          onChange={(e) => handleFieldChange("stateManagement", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Navigation Architecture</span>
                        <input
                          type="text"
                          value={formInput.navigationArchitecture}
                          onChange={(e) => handleFieldChange("navigationArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Offline Strategy</span>
                        <input
                          type="text"
                          value={formInput.offlineStrategy}
                          onChange={(e) => handleFieldChange("offlineStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Architecture Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-cyan-400" />
                          Mobile Layer Architecture
                        </span>
                        <button type="button" onClick={() => setArchitectureDiagramModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setArchitectureDiagramModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.mobileArchitectureDiagramUrl} alt="Mobile Architecture" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1">
                        Presentation → State → Domain → Data
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: UI / UX Development (with Screens Preview Panel)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      UI / UX Development
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      UI Score: {formInput.uiReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">UI Framework</span>
                        <input
                          type="text"
                          value={formInput.uiFramework}
                          onChange={(e) => handleFieldChange("uiFramework", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Design System</span>
                        <input
                          type="text"
                          value={formInput.designSystem}
                          onChange={(e) => handleFieldChange("designSystem", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Responsive Design</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                          {formInput.responsiveDesign}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Accessibility</span>
                        <span className="inline-block bg-slate-100 border text-slate-800 text-xs font-bold px-2 py-0.5 rounded">
                          {formInput.accessibilityCompliance}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Theme Support</span>
                        <span className="font-semibold text-slate-800">{formInput.themeSupport}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Localization</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                          {formInput.localizationSupport}
                        </span>
                      </div>
                    </div>

                    {/* UI Readiness Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        UI Readiness Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.uiReadinessScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Material 3 & WCAG 2.1 AA
                      </span>
                    </div>

                    {/* UI Screens Preview Panel */}
                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-700 uppercase">UI Screens Preview</span>
                      <div onClick={() => setUiPreviewModalOpen(true)} className="w-full h-28 rounded-lg overflow-hidden bg-white border cursor-pointer">
                        <img src={formInput.uiScreensPreviewUrl} alt="UI Mockup Gallery" className="w-full h-full object-cover" />
                      </div>
                      <button type="button" onClick={() => setUiPreviewModalOpen(true)} className="text-[11px] font-bold text-primary hover:underline">
                        View Screens &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: API & Backend Integration
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      API & Backend Integration
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Integration: {formInput.integrationStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formInput.apiIntegrationList.map((iface, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="font-semibold text-slate-800">{iface.name}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 stroke-[3]" /> Integrated
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 border-t font-medium text-slate-700">
                      <div>Total APIs Integrated: <strong className="text-slate-900 font-bold">{formInput.totalApisIntegrated}</strong></div>
                      <div>Successful Calls: <strong className="text-emerald-700 font-bold">{formInput.successfulCallsPct}</strong></div>
                      <div>Last Sync: <strong className="text-slate-900">{formInput.lastSync}</strong></div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Device Features
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Device Features
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Device Score: {formInput.deviceIntegrationScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formInput.deviceCapabilitiesList.map((dev, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {dev.name === "Camera" && <Camera className="h-3.5 w-3.5 text-primary" />}
                            {dev.name === "GPS" && <Navigation className="h-3.5 w-3.5 text-primary" />}
                            {dev.name === "Bluetooth" && <Bluetooth className="h-3.5 w-3.5 text-primary" />}
                            {dev.name === "Biometrics" && <Fingerprint className="h-3.5 w-3.5 text-primary" />}
                            {dev.name === "QR / Barcode Scanner" && <QrCode className="h-3.5 w-3.5 text-primary" />}
                            {dev.name}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 stroke-[3]" /> Enabled
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Device Integration Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Device Integration Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.deviceIntegrationScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        6 Hardware APIS Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Performance & Security
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Performance & Security
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Security Score: {formInput.securityScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Authentication Method</span>
                        <input
                          type="text"
                          value={formInput.authenticationMethod}
                          onChange={(e) => handleFieldChange("authenticationMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Data Encryption</span>
                        <input
                          type="text"
                          value={formInput.dataEncryption}
                          onChange={(e) => handleFieldChange("dataEncryption", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Offline Storage</span>
                        <input
                          type="text"
                          value={formInput.offlineStorage}
                          onChange={(e) => handleFieldChange("offlineStorage", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">API Security</span>
                        <input
                          type="text"
                          value={formInput.apiSecurity}
                          onChange={(e) => handleFieldChange("apiSecurity", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Performance Optimization</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                          {formInput.performanceOptimization}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Battery Optimization</span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                          {formInput.batteryOptimization}
                        </span>
                      </div>
                    </div>

                    {/* Security Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Security Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.securityScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        SSL Pinning & AES-256
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Testing & Deployment
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Testing & Deployment
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Test Coverage: {formInput.codeCoverage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formInput.testItems.map((test) => (
                          <div key={test.id} className="p-2.5 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-slate-800 block">{test.name}</span>
                            </div>
                            <StatusBadge status={test.status} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Coverage Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Test Coverage
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.codeCoverage}{" "}
                        <span className="text-xs font-semibold text-emerald-600">%</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        87.3% Automated Coverage
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: App Store Release Management
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      App Store Release Management
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Release Status: {formInput.releaseStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-700 uppercase">Android Package (AAB)</span>
                      <div className="flex items-center gap-2 my-1">
                        <Package className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-mono font-bold text-xs text-foreground block truncate">{formInput.androidPackageName}</span>
                          <span className="text-[10px] text-muted-foreground">{formInput.androidPackageSize}</span>
                        </div>
                      </div>
                      <ErpButton size="sm" variant="outline" className="w-full" onClick={() => toast.info(`Downloading ${formInput.androidPackageName}...`)}>
                        <Download className="h-3 w-3 mr-1" /> Download AAB
                      </ErpButton>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-700 uppercase">iOS Package (IPA)</span>
                      <div className="flex items-center gap-2 my-1">
                        <Package className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-mono font-bold text-xs text-foreground block truncate">{formInput.iosPackageName}</span>
                          <span className="text-[10px] text-muted-foreground">{formInput.iosPackageSize}</span>
                        </div>
                      </div>
                      <ErpButton size="sm" variant="outline" className="w-full" onClick={() => toast.info(`Downloading ${formInput.iosPackageName}...`)}>
                        <Download className="h-3 w-3 mr-1" /> Download IPA
                      </ErpButton>
                    </div>

                    <div className="md:col-span-2 space-y-2 p-3 bg-slate-50 rounded-xl border">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Google Play Status:</span>
                        <StatusBadge status={formInput.googlePlayStatus} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Apple App Store Status:</span>
                        <StatusBadge status={formInput.appleAppStoreStatus} />
                      </div>
                      <div className="flex justify-between items-center font-mono">
                        <span className="font-semibold text-slate-700 font-sans">Version Code:</span>
                        <span className="font-bold text-slate-900">{formInput.versionCode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Mobile Development Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Mobile Development Assessment
                    </h2>
                    <span className="bg-cyan-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallMobileScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Code Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCodeQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">UI Review</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiUiReview} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Performance</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiPerformanceAnalysis} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Security Review</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiSecurityReview} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Crash Predict</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCrashPrediction} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">UX Suggestions</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiUxSuggestions} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Mobile Release Summary (Kept in Sync with Sidebar)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Mobile Release Summary
                    </h2>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Recommendation: {record.summary.recommendation}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Development Progress</span>
                        <span>{record.summary.developmentProgress} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${record.summary.developmentProgress}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>UI Readiness</span>
                        <span>{record.summary.uiReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${record.summary.uiReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Performance Readiness</span>
                        <span>{record.summary.performanceReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.performanceReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Store Readiness</span>
                        <span>{record.summary.storeReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.storeReadiness}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Mobile Score</span>
                      <span className="text-base text-cyan-700">{record.summary.overallMobileScore} /100</span>
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
                      Mobile App Review Board
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
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as MobileDevelopmentApprovalDecision)}
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
                          placeholder="Enter mobile review board comments..."
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
                        <span className="font-bold text-foreground">{record.mobileArchitectName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.mobileArchitectName}</span>
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
                  {/* Overall Mobile App Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-primary" />
                      Overall Mobile App Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallMobileScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">UI / UX</span>
                        <span className="font-bold text-slate-800">{record.summary.uiReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Performance</span>
                        <span className="font-bold text-slate-800">{record.summary.performanceReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Security</span>
                        <span className="font-bold text-slate-800">{record.input.securityScore} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Test Coverage</span>
                        <span className="font-bold text-slate-800">85 /100</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-cyan-700">
                        <span>Overall Score</span>
                        <span>{record.summary.overallMobileScore} /100</span>
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
                        Generate Mobile Report
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
                        onClick={() => setApiDocsModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Globe className="h-4 w-4 text-teal-600" />
                        View API Documentation
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestReportModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                        Run Test Cases
                      </button>
                      <button
                        type="button"
                        onClick={() => setCrashAnalyticsModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <ActivitySquare className="h-4 w-4 text-rose-600" />
                        View Crash Analytics
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppStoreStatusModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Package className="h-4 w-4 text-emerald-600" />
                        View App Store Status
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
                Mobile Application Executive Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.mobileId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.mobileProjectName}</span>
                <p className="text-slate-600">
                  Covers Flutter 3.19 cross-platform app, MVVM architecture, Riverpod state management, offline SQLite sync, Material 3 design, 87.3% test coverage, and app store release candidate v1.2.0.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Mobile Score: {record.summary.overallMobileScore}/100</div>
                <div className="p-2 border rounded">Mobile App Version: {record.mobileAppVersion}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Mobile_App_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Mockup Modal */}
        <Dialog open={appMockupModalOpen} onOpenChange={setAppMockupModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Magnertia EV Charger App Frame View</DialogTitle>
            </DialogHeader>
            <div className="h-[520px] bg-slate-950 rounded-xl p-4 flex items-center justify-center border border-slate-800">
              <img src={formInput.appMockupImageUrl} alt="App Mockup" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Architecture Diagram Modal */}
        <Dialog open={architectureDiagramModalOpen} onOpenChange={setArchitectureDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mobile App Layer Architecture Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.mobileArchitectureDiagramUrl} alt="Architecture Diagram" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* UI Preview Modal */}
        <Dialog open={uiPreviewModalOpen} onOpenChange={setUiPreviewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>UI Screens Preview & Material 3 Mockups</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-white rounded-xl p-4 flex items-center justify-center border">
              <img src={formInput.uiScreensPreviewUrl} alt="UI Screens Preview" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Source Code Modal */}
        <Dialog open={sourceCodeModalOpen} onOpenChange={setSourceCodeModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-600" />
                Flutter Source Code Repository
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-emerald-400">// EV Charger Dashboard Widget - Flutter 3.19</div>
                <div>class ChargingDashboardWidget extends ConsumerWidget &#123;</div>
                <div className="pl-4">@override</div>
                <div className="pl-4">Widget build(BuildContext context, WidgetRef ref) &#123;</div>
                <div className="pl-8 text-blue-300">final state = ref.watch(chargingSessionProvider);</div>
                <div className="pl-8 text-emerald-300">return Scaffold(body: SessionCard(state: state));</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSourceCodeModalOpen(false)}>Close</ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Source_Code_Repo.zip"); setSourceCodeModalOpen(false); }}>Download Repository</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Docs Modal */}
        <Dialog open={apiDocsModalOpen} onOpenChange={setApiDocsModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-600" />
                Mobile API Endpoint Specifications
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2.5 bg-slate-50 border rounded font-mono text-slate-800">
                POST /api/v1/mobile/auth/login — OAuth 2.0 JWT Token
              </div>
              <div className="p-2.5 bg-slate-50 border rounded font-mono text-slate-800">
                GET /api/v1/mobile/chargers/nearby — GPS Location Search
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setApiDocsModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Crash Analytics Modal */}
        <Dialog open={crashAnalyticsModalOpen} onOpenChange={setCrashAnalyticsModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-rose-600" />
                Firebase Crashlytics & Analytics Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                Crash-free Users: 99.8% • 0 Fatal Exceptions in v1.2.0-RC2 • ANR Rate &lt; 0.01%
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setCrashAnalyticsModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Store Status Modal */}
        <Dialog open={appStoreStatusModalOpen} onOpenChange={setAppStoreStatusModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                App Store Publishing Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Google Play Console</span>
                  <span className="text-slate-500 font-mono">app-release.aab (25.6 MB)</span>
                </div>
                <StatusBadge status={formInput.googlePlayStatus} />
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Apple App Store Connect</span>
                  <span className="text-slate-500 font-mono">MagnertiaEV.ipa (120.4 MB)</span>
                </div>
                <StatusBadge status={formInput.appleAppStoreStatus} />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setAppStoreStatusModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Report Modal */}
        <Dialog open={testReportModalOpen} onOpenChange={setTestReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-600" />
                Mobile Test Execution Summary
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                87.3% Automated Line Coverage • Flutter Unit & Integration Tests Passed
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setTestReportModalOpen(false)}>Close</ErpButton>
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
                Schedule Mobile App Review Board Meeting
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Rahul Sharma, Ananya Iyer, Vikram Singh, Neha Verma" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Mobile App Review Board meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
