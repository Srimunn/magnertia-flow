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
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  SoftwareDevelopmentTabBar,
  type SoftwareDevelopmentTabId,
} from "@/components/erp/SoftwareDevelopmentTabBar";
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
import { softwareDevelopmentService } from "@/services";
import type {
  SoftwareDevelopmentApprovalDecision,
  SoftwareDevelopmentFormInput,
  SoftwareDevelopmentRecord,
  SoftwareDevelopmentStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/software-development/new",
)({
  head: () => ({
    meta: [{ title: "Software Development Form · Magnertia ERP" }],
  }),
  component: SoftwareDevelopmentFormPage,
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
  let textColor = "text-blue-700";
  let bgColor = "text-blue-100";

  if (score >= 85) {
    strokeColor = "stroke-blue-600";
    textColor = "text-blue-700";
    bgColor = "text-blue-100";
  } else if (score >= 70) {
    strokeColor = "stroke-teal-600";
    textColor = "text-teal-600";
    bgColor = "text-teal-100";
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
   CI/CD Pipeline Stage Visualization Component
   =========================================================================== */
function CicdPipelineStages({
  stages,
}: {
  stages: { id: string; name: string; status: "completed" | "in_progress" | "pending" }[];
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl overflow-x-auto">
      {stages.map((stg, idx) => (
        <div key={stg.id} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-xs">
              <Check className="h-4 w-4 text-primary stroke-[3]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">{stg.name}</span>
          </div>
          {idx < stages.length - 1 && (
            <div className="h-[2px] w-8 bg-slate-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ===========================================================================
   Main Software Development Form Page
   =========================================================================== */
export function SoftwareDevelopmentFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SoftwareDevelopmentTabId>("overview");

  // Dialog / Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sourceCodeModalOpen, setSourceCodeModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [architectureDiagramModalOpen, setArchitectureDiagramModalOpen] = useState(false);
  const [apiDocsModalOpen, setApiDocsModalOpen] = useState(false);
  const [staticAnalysisModalOpen, setStaticAnalysisModalOpen] = useState(false);
  const [securityScanModalOpen, setSecurityScanModalOpen] = useState(false);
  const [testReportModalOpen, setTestReportModalOpen] = useState(false);
  const [newReleaseModalOpen, setNewReleaseModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["software-development-record"],
    queryFn: () => softwareDevelopmentService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<SoftwareDevelopmentFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<SoftwareDevelopmentFormInput>) =>
      softwareDevelopmentService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["software-development-record"], updated);
      toast.success("Software Development draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => softwareDevelopmentService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["software-development-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: SoftwareDevelopmentApprovalDecision;
      comments?: string;
    }) => softwareDevelopmentService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["software-development-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Software Development Approved! Auto-created/linked downstream System Integration project SI-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: SoftwareDevelopmentStage) =>
      softwareDevelopmentService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["software-development-record"], updated);
      toast.success("Advanced workflow stage successfully!");
    },
  });

  if (isLoading || !record || !formInput) {
    return (
      <AppShell
        title="Software Development"
        breadcrumb={breadcrumb}
        tabs={tabs}
      >
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading Software Development module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof SoftwareDevelopmentFormInput, value: any) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <AppShell
      title="Software Development"
      breadcrumb={breadcrumb}
      description="Develop core application software, microservices, algorithms, and backend enterprise services."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ErpButton
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Navigating to Software Development Repository...")
              }
            >
              <Database className="h-3.5 w-3.5 mr-1.5" />
              Browse Records
            </ErpButton>
            <ErpButton
              variant="primary"
              size="sm"
              onClick={() => {
                toast.success("Created new Software Development Draft SWF-2024-26");
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Software Project
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
                  Software Development Lifecycle
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
                    Software Development ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {record.softwareId}
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
                    Software Project Name
                  </span>
                  <input
                    type="text"
                    value={record.softwareProjectName}
                    onChange={(e) =>
                      queryClient.setQueryData(
                        ["software-development-record"],
                        (prev: any) => ({
                          ...prev,
                          softwareProjectName: e.target.value,
                        })
                      )
                    }
                    className="font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[260px]"
                  />
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
                    Software Version
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-2 py-0.5 rounded font-mono">
                    {record.softwareVersion}
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
                  onClick={() => toast.info("Exporting Software Development package...")}
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
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                  <Map className="h-3.5 w-3.5 text-blue-600" />
                  <span>Linked Product Roadmap:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/product-strategy/roadmaps" as any,
                      })
                    }
                    className="font-bold underline hover:text-blue-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedProductRoadmapId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked Firmware Development Chip */}
                <div className="flex items-center gap-1.5 bg-teal-50/80 border border-teal-200 text-teal-800 rounded-md px-2.5 py-1 font-medium">
                  <Terminal className="h-3.5 w-3.5 text-teal-600" />
                  <span>Linked Firmware Development:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/firmware-development/new" as any,
                      })
                    }
                    className="font-bold underline hover:text-teal-950 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    {record.linkedFirmwareDevelopmentId}
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
                  <span>Software Architect:</span>
                  <img
                    src={record.softwareArchitectAvatar}
                    alt={record.softwareArchitectName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.softwareArchitectName}
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
        <SoftwareDevelopmentTabBar
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
                    Software Development Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Downstream System Integration project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedSystemIntegrationId}
                    </span>{" "}
                    has been auto-created & linked (converging Firmware, Embedded, Electronics, and Software streams). Proceed to System Integration.
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
                    <Code className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Software Development record ({record.softwareId}) • {record.softwareProjectName}
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
                  Detailed sub-views and interactive editors for <span className="font-bold capitalize">{activeTab.replace("_", " ")}</span> are linked to record {record.softwareId}.
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
                    PANEL 1: Software Project Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Software Project Overview
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
                            Software Name
                          </label>
                          <input
                            type="text"
                            value={formInput.softwareName}
                            onChange={(e) => handleFieldChange("softwareName", e.target.value)}
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
                          Business Requirements
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.businessRequirements}
                          onChange={(e) => handleFieldChange("businessRequirements", e.target.value)}
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Functional Requirements
                          </label>
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded">
                            {formInput.functionalRequirements}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Non-functional Requirements
                          </label>
                          <span className="text-xs text-slate-700 font-medium block p-1 bg-slate-50 rounded border">
                            {formInput.nonFunctionalRequirements}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Laptop Image Panel */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Software Platform Stack
                        </span>
                        <button
                          type="button"
                          onClick={() => setTechStackModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setTechStackModalOpen(true)}
                        className="w-full h-56 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center cursor-pointer relative group/img"
                      >
                        <img
                          src={formInput.techStackImageUrl}
                          alt="Laptop & Tech Stack Render"
                          className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground pt-1 block">
                        React 18 • Spring Boot • Python • PostgreSQL
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Software Architecture (with System Diagram)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Software Architecture
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Architecture Status: {formInput.architectureStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Architecture Style</span>
                        <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded">
                          {formInput.architectureStyle}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Application Architecture</span>
                        <input
                          type="text"
                          value={formInput.applicationArchitecture}
                          onChange={(e) => handleFieldChange("applicationArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Backend Architecture</span>
                        <input
                          type="text"
                          value={formInput.backendArchitecture}
                          onChange={(e) => handleFieldChange("backendArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Frontend Architecture</span>
                        <input
                          type="text"
                          value={formInput.frontendArchitecture}
                          onChange={(e) => handleFieldChange("frontendArchitecture", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Microservices Count</span>
                        <input
                          type="number"
                          value={formInput.microservicesCount}
                          onChange={(e) => handleFieldChange("microservicesCount", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Middleware</span>
                        <input
                          type="text"
                          value={formInput.middleware}
                          onChange={(e) => handleFieldChange("middleware", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Architecture Diagram Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between">
                      <div className="w-full flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-blue-400" />
                          System Architecture Diagram
                        </span>
                        <button type="button" onClick={() => setArchitectureDiagramModalOpen(true)} className="p-1 text-slate-400 hover:text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div onClick={() => setArchitectureDiagramModalOpen(true)} className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer">
                        <img src={formInput.softwareArchitectureDiagramUrl} alt="Software Architecture" className="w-full h-full object-contain p-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1">
                        Web/Mobile → Gateway → Microservices → DB/Cloud
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Technology Stack
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Technology Stack
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Tech Readiness: {formInput.technologyReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Frontend Framework</span>
                        <input
                          type="text"
                          value={formInput.frontendFramework}
                          onChange={(e) => handleFieldChange("frontendFramework", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Backend Framework</span>
                        <input
                          type="text"
                          value={formInput.backendFramework}
                          onChange={(e) => handleFieldChange("backendFramework", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Programming Languages</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.programmingLanguages.map((lang, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Database</span>
                        <input
                          type="text"
                          value={formInput.database}
                          onChange={(e) => handleFieldChange("database", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Cloud Platform</span>
                        <input
                          type="text"
                          value={formInput.cloudPlatform}
                          onChange={(e) => handleFieldChange("cloudPlatform", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Container Platform</span>
                        <input
                          type="text"
                          value={formInput.containerPlatform}
                          onChange={(e) => handleFieldChange("containerPlatform", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Technology Readiness Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Technology Readiness Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.technologyReadinessScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        React 18 & Spring Boot 3.2
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: API & Integration
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      API & Integration
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      API Status: {formInput.apiStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formInput.apiTypesList.map((iface, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="font-semibold text-slate-800">{iface.name}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 stroke-[3]" /> Enabled
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">API Gateway</span>
                        <input
                          type="text"
                          value={formInput.apiGateway}
                          onChange={(e) => handleFieldChange("apiGateway", e.target.value)}
                          className="w-full rounded-md border border-input px-2 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Third-party APIs</span>
                        <div className="flex flex-wrap gap-1">
                          {formInput.thirdPartyApis.map((api, i) => (
                            <span key={i} className="bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {api}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">ERP Integration</span>
                        <input
                          type="text"
                          value={formInput.erpIntegration}
                          onChange={(e) => handleFieldChange("erpIntegration", e.target.value)}
                          className="w-full rounded-md border border-input px-2 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Database Design
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Database Design
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Database Score: {formInput.databaseReadinessScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Database Type</span>
                        <input
                          type="text"
                          value={formInput.databaseType}
                          onChange={(e) => handleFieldChange("databaseType", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Database Schema</span>
                        <button type="button" onClick={() => toast.info("Opening ER Diagram editor...")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-1">
                          {formInput.databaseSchemaLink} &rarr;
                        </button>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Master Tables</span>
                        <input
                          type="number"
                          value={formInput.masterTablesCount}
                          onChange={(e) => handleFieldChange("masterTablesCount", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Transaction Tables</span>
                        <input
                          type="number"
                          value={formInput.transactionTablesCount}
                          onChange={(e) => handleFieldChange("transactionTablesCount", Number(e.target.value))}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Data Retention Policy</span>
                        <input
                          type="text"
                          value={formInput.dataRetentionPolicy}
                          onChange={(e) => handleFieldChange("dataRetentionPolicy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Backup Strategy</span>
                        <input
                          type="text"
                          value={formInput.backupStrategy}
                          onChange={(e) => handleFieldChange("backupStrategy", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Database Readiness Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Database Readiness
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.databaseReadinessScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        100 Schema Tables Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: DevOps & CI/CD (with Pipeline Visualization & Environments)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      DevOps & CI/CD
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      DevOps Status: {formInput.devOpsStatus}
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold">Source Code Rep.</span>
                        <span className="font-bold text-slate-800">{formInput.sourceCodeRepository}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Branch Strategy</span>
                        <span className="font-bold text-slate-800">{formInput.branchStrategy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">CI/CD Platform</span>
                        <span className="font-bold text-slate-800">{formInput.cicdPlatform}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Build Pipeline</span>
                        <span className="font-medium text-slate-700">{formInput.buildPipeline}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Deployment Strat.</span>
                        <span className="font-bold text-slate-800">{formInput.deploymentStrategy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Monitoring</span>
                        <span className="font-medium text-slate-700">{formInput.monitoringPlatform}</span>
                      </div>
                    </div>

                    {/* Pipeline Stage Visualization */}
                    <CicdPipelineStages stages={formInput.pipelineStages} />

                    {/* Environments Row */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">Environments:</span>
                      <div className="flex items-center gap-2">
                        {formInput.environments.map((env, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "px-3 py-1 rounded text-xs font-bold border",
                              env.badgeColor || "bg-slate-100 text-slate-800 border-slate-300"
                            )}
                          >
                            {env.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Security & Compliance
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Security & Compliance
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
                        <span className="text-muted-foreground block font-semibold mb-1">Authorization Model</span>
                        <input
                          type="text"
                          value={formInput.authorizationModel}
                          onChange={(e) => handleFieldChange("authorizationModel", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-semibold text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Encryption Standard</span>
                        <input
                          type="text"
                          value={formInput.encryptionStandard}
                          onChange={(e) => handleFieldChange("encryptionStandard", e.target.value)}
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
                        <span className="text-muted-foreground block font-semibold mb-1">Secure Coding Standard</span>
                        <input
                          type="text"
                          value={formInput.secureCodingStandard}
                          onChange={(e) => handleFieldChange("secureCodingStandard", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Regulatory Compliance</span>
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded border">
                          {formInput.regulatoryComplianceTags.map((tag, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                              {tag}
                            </span>
                          ))}
                        </div>
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
                        OAuth 2.0 & AES-256 Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Testing & Quality Assurance
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Testing & Quality Assurance
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
                        87.5% Automated Coverage
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Software Development Assessment (Single Source of Truth)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Software Development Assessment
                    </h2>
                    <span className="bg-blue-600 text-white text-xs font-black px-3 py-0.5 rounded-full">
                      AI Overall: {record.aiAssessment.aiOverallSoftwareScore} /100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Code Quality</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiCodeQualityScore} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Architecture</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiArchitectureAssessment} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Performance</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiPerformanceOptimization} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Security Anal.</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiSecurityAssessment} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Maintainability</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiMaintainabilityAnalysis} /100</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-lg text-center">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Tech Debt</span>
                      <span className="text-lg font-black text-slate-800">{record.aiAssessment.aiTechnicalDebtAnalysis} /100</span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Software Release Summary (Kept in Sync with Sidebar)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Software Release Summary
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
                        <span>Architecture Readiness</span>
                        <span>{record.summary.architectureReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${record.summary.architectureReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Testing Readiness</span>
                        <span>{record.summary.testingReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${record.summary.testingReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Deployment Readiness</span>
                        <span>{record.summary.deploymentReadiness} /100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${record.summary.deploymentReadiness}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold text-slate-900">
                      <span>Overall Software Score</span>
                      <span className="text-base text-blue-700">{record.summary.overallSoftwareScore} /100</span>
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
                      Software Engineering Review Board
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
                          onChange={(e) => handleFieldChange("approvalDecision", e.target.value as SoftwareDevelopmentApprovalDecision)}
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
                          placeholder="Enter software review board comments..."
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
                        <span className="font-bold text-foreground">{record.softwareArchitectName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.softwareArchitectName}</span>
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
                  {/* Overall Software Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Code className="h-4 w-4 text-primary" />
                      Overall Software Score
                    </h3>

                    <CircularScoreGauge
                      score={record.summary.overallSoftwareScore}
                      label="Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Code Quality</span>
                        <span className="font-bold text-slate-800">{record.summary.developmentProgress} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Architecture</span>
                        <span className="font-bold text-slate-800">{record.summary.architectureReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Security</span>
                        <span className="font-bold text-slate-800">{record.summary.deploymentReadiness} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Performance</span>
                        <span className="font-bold text-slate-800">86 /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Test Coverage</span>
                        <span className="font-bold text-slate-800">{record.summary.testingReadiness}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-blue-700">
                        <span>Overall Score</span>
                        <span>{record.summary.overallSoftwareScore} /100</span>
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
                        Generate Software Report
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
                        API Documentation
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaticAnalysisModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        Run Static Code Analysis
                      </button>
                      <button
                        type="button"
                        onClick={() => setSecurityScanModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Lock className="h-4 w-4 text-rose-600" />
                        Run Security Scan
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
                Software Development Executive Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.softwareId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.softwareProjectName}</span>
                <p className="text-slate-600">
                  Covers Microservices architecture (12 services), React 18 frontend, Spring Boot 3.2 backend, 87.5% test coverage, and Blue-Green production deployment.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Software Score: {record.summary.overallSoftwareScore}/100</div>
                <div className="p-2 border rounded">Software Version: {record.softwareVersion}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Software_Development_Report.pdf"); setReportModalOpen(false); }}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tech Stack Modal */}
        <Dialog open={techStackModalOpen} onOpenChange={setTechStackModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Software Platform Stack & IDE View</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.techStackImageUrl} alt="Tech Stack Render" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Architecture Diagram Modal */}
        <Dialog open={architectureDiagramModalOpen} onOpenChange={setArchitectureDiagramModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Microservices Architecture Diagram</DialogTitle>
            </DialogHeader>
            <div className="h-[480px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img src={formInput.softwareArchitectureDiagramUrl} alt="Architecture Diagram" className="max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Source Code Modal */}
        <Dialog open={sourceCodeModalOpen} onOpenChange={setSourceCodeModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-600" />
                Software Source Code Repository
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                <div className="text-emerald-400">// Smart EV Management Microservice Controller</div>
                <div>@RestController</div>
                <div>@RequestMapping("/api/v1/fleet")</div>
                <div>public class FleetController &#123;</div>
                <div className="pl-4 text-blue-300">@GetMapping("/telemetry")</div>
                <div className="pl-4">public ResponseEntity&lt;List&lt;TelemetryDto&gt;&gt; getFleetTelemetry() &#123;</div>
                <div className="pl-8 text-emerald-300">return ResponseEntity.ok(telemetryService.getActiveData());</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSourceCodeModalOpen(false)}>Close</ErpButton>
              <ErpButton onClick={() => { toast.success("Downloaded Source_Code_Repository.zip"); setSourceCodeModalOpen(false); }}>Download Repository</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Docs Modal */}
        <Dialog open={apiDocsModalOpen} onOpenChange={setApiDocsModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-600" />
                Swagger / OpenAPI 3.0 Documentation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-2.5 bg-slate-50 border rounded font-mono text-slate-800">
                GET /api/v1/fleet/status — 200 OK (Kong Gateway Authenticated)
              </div>
              <div className="p-2.5 bg-slate-50 border rounded font-mono text-slate-800">
                POST /api/v1/charging/session — 201 Created (OAuth 2.0 JWT)
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setApiDocsModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Static Analysis Modal */}
        <Dialog open={staticAnalysisModalOpen} onOpenChange={setStaticAnalysisModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                SonarQube Static Code Analysis
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-slate-50 border rounded font-semibold text-slate-800">
                Code Quality Rating: A • Technical Debt: 2h 15m • 0 Critical Security Vulnerabilities
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setStaticAnalysisModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Security Scan Modal */}
        <Dialog open={securityScanModalOpen} onOpenChange={setSecurityScanModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-rose-600" />
                OWASP ZAP & SAST Security Scan Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                Security Score: 90/100 • GDPR & ISO 27001 Compliant • OAuth 2.0 JWT Active
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSecurityScanModalOpen(false)}>Close</ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Report Modal */}
        <Dialog open={testReportModalOpen} onOpenChange={setTestReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                Test Suite Execution Summary
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-xs py-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold">
                87.5% Automated Line Coverage • 1,240 / 1,240 Passed • 0 Regressions
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
                Create New Software Release
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Version Tag</label>
                <input type="text" defaultValue="v1.3.0-RC1" className="w-full border p-2 rounded font-mono font-bold" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Release Type</label>
                <select className="w-full border p-2 rounded">
                  <option>Minor Release</option>
                  <option>Major Release</option>
                  <option>Patch / Hotfix</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setNewReleaseModalOpen(false)}>Cancel</ErpButton>
              <ErpButton onClick={() => { toast.success("Created release candidate v1.3.0-RC1"); setNewReleaseModalOpen(false); }}>
                Build Docker Image & Deploy
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
                Schedule Software Review Board Meeting
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
              <ErpButton onClick={() => { toast.success("Software Review Board meeting scheduled."); setScheduleReviewModalOpen(false); }}>
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
