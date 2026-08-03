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
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  MechanicalDesignTabBar,
  type MechanicalDesignTabId,
} from "@/components/erp/MechanicalDesignTabBar";
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
import { mechanicalDesignService } from "@/services";
import type {
  MechanicalDesignApprovalDecision,
  MechanicalDesignFormInput,
  MechanicalDesignRecord,
  MechanicalDesignStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/mechanical-design/new",
)({
  head: () => ({
    meta: [{ title: "Mechanical Design Form · Magnertia ERP" }],
  }),
  component: MechanicalDesignFormPage,
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
    strokeColor = "stroke-emerald-600";
    textColor = "text-emerald-700";
    bgColor = "text-emerald-100";
  } else if (score >= 70) {
    strokeColor = "stroke-blue-600";
    textColor = "text-blue-700";
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
   Main Mechanical Design Form Page
   =========================================================================== */
export function MechanicalDesignFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MechanicalDesignTabId>("overview");

  // Dialog / Modal states for Quick Actions & System Info drawers
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [assemblyModalOpen, setAssemblyModalOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [renderModalOpen, setRenderModalOpen] = useState(false);
  const [feaModalOpen, setFeaModalOpen] = useState(false);
  const [systemLogModalOpen, setSystemLogModalOpen] = useState(false);
  const [scheduleReviewModalOpen, setScheduleReviewModalOpen] = useState(false);
  const [addPartModalOpen, setAddPartModalOpen] = useState(false);

  // Form field input for new part modal
  const [newPartInput, setNewPartInput] = useState({
    partNumber: "",
    partName: "",
    material: "Aluminum 6061",
    process: "CNC Machining",
    revision: "A",
  });

  // Query server data
  const { data: record, isLoading } = useQuery({
    queryKey: ["mechanical-design-record"],
    queryFn: () => mechanicalDesignService.fetchRecord(),
  });

  // Local state for live form fields
  const [formInput, setFormInput] = useState<MechanicalDesignFormInput | null>(
    null
  );

  // Sync state once data loads
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<MechanicalDesignFormInput>) =>
      mechanicalDesignService.saveDraft(input, record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mechanical-design-record"], updated);
      toast.success("Draft saved successfully.");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save draft"),
  });

  const submitMutation = useMutation({
    mutationFn: () => mechanicalDesignService.submitForReview(record?.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mechanical-design-record"], updated);
      toast.success("Submitted for Stage 4 Engineering Review Board!");
    },
    onError: (err: Error) => toast.error(err.message || "Submission failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: MechanicalDesignApprovalDecision;
      comments?: string;
    }) => mechanicalDesignService.reviewDecision({ id: record!.id, ...args }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["mechanical-design-record"], updated);
      if (variables.decision === "Approved") {
        toast.success(
          "Mechanical Design Approved! Auto-created Prototype Manufacturing project PM-2024-0089."
        );
      } else {
        toast.info(`Review Decision updated to '${variables.decision}'.`);
      }
    },
    onError: (err: Error) => toast.error(err.message || "Decision submission failed"),
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: MechanicalDesignStage) =>
      mechanicalDesignService.advanceStage(record!.id, targetStage),
    onSuccess: (updated) => {
      queryClient.setQueryData(["mechanical-design-record"], updated);
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
              Loading Mechanical Design module...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleFieldChange = (field: keyof MechanicalDesignFormInput, value: any) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddPart = () => {
    if (!newPartInput.partNumber || !newPartInput.partName) {
      toast.error("Please fill in Part Number and Part Name.");
      return;
    }
    const newPart = {
      id: `part-${Date.now()}`,
      partNumber: newPartInput.partNumber,
      partName: newPartInput.partName,
      material: newPartInput.material,
      process: newPartInput.process,
      revision: newPartInput.revision,
      status: "Draft" as const,
    };
    const updatedParts = [...formInput.topParts, newPart];
    handleFieldChange("topParts", updatedParts);
    setAddPartModalOpen(false);
    setNewPartInput({
      partNumber: "",
      partName: "",
      material: "Aluminum 6061",
      process: "CNC Machining",
      revision: "A",
    });
    toast.success(`Part ${newPart.partNumber} added to Part Design.`);
  };

  return (
    <AppShell
      title="Mechanical Design"
      breadcrumb={breadcrumb}
      description="Engineer 3D mechanical assemblies, structural components, tolerance stack-ups, and thermal enclosures."
      tabs={tabs}
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Navigating to Mechanical Design Repository...")
                }
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Browse Records
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Created new Mechanical Design Draft MDF-2024-26");
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Mechanical Design
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
                  Engineering Lifecycle Engine
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
                    Mechanical Design ID
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
                        ["mechanical-design-record"],
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
                  onClick={() => toast.info("Exporting Mechanical Design package...")}
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
                {/* Linked Industrial Design Chip */}
                <div className="flex items-center gap-1.5 bg-purple-50/80 border border-purple-200 text-purple-800 rounded-md px-2.5 py-1 font-medium">
                  <Palette className="h-3.5 w-3.5 text-purple-600" />
                  <span>Linked Industrial Design:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/industrial-design/new",
                      })
                    }
                    className="font-bold underline hover:text-purple-950 cursor-pointer flex items-center gap-1"
                  >
                    {record.linkedIndustrialDesignId}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked Product Architecture Chip */}
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                  <Cpu className="h-3.5 w-3.5 text-blue-600" />
                  <span>Linked Product Architecture:</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/development/research-innovation/product-architecture/new",
                      })
                    }
                    className="font-bold underline hover:text-blue-900 cursor-pointer flex items-center gap-1"
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
                        to: "/development/research-innovation/prd/new",
                      })
                    }
                    className="font-bold underline hover:text-emerald-950 cursor-pointer flex items-center gap-1"
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
                        to: "/development/research-innovation/product-strategy/overview",
                      })
                    }
                    className="font-bold underline hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    {record.linkedProductName}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Linked Downstream Prototype Manufacturing Project Banner if Approved */}
                {record.linkedPrototypeManufacturingId && (
                  <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md px-2.5 py-1 font-bold animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downstream Prototype Manufacturing:</span>
                    <span className="underline font-black">
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
                  <span>Mechanical Engineer:</span>
                  <img
                    src={record.mechanicalEngineerAvatar}
                    alt={record.mechanicalEngineerName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-foreground">
                    {record.mechanicalEngineerName}
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
        <MechanicalDesignTabBar
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
                    Mechanical Design Approved by Review Board
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Linked Prototype Manufacturing project{" "}
                    <span className="font-bold font-mono">
                      {record.linkedPrototypeManufacturingId}
                    </span>{" "}
                    has been auto-created. Proceed to Prototype Manufacturing.
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
            /* Detailed Functional Tab View for non-Overview tabs */
            <div className="bg-white rounded-xl border border-border p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Box className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {activeTab.replace("_", " ")} Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Linked to Mechanical Design record ({record.designId}) • {record.designProjectName}
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

              {/* Sub-view switcher based on selected tab */}
              {activeTab === "assembly_design" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border rounded-lg">
                      <span className="text-xs text-muted-foreground block">Assembly Name</span>
                      <span className="text-sm font-bold text-foreground">{formInput.assemblyName}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-lg">
                      <span className="text-xs text-muted-foreground block">Assembly Number</span>
                      <span className="text-sm font-bold text-foreground font-mono">{formInput.assemblyNumber}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-lg">
                      <span className="text-xs text-muted-foreground block">Total Components</span>
                      <span className="text-sm font-bold text-foreground">{formInput.numberOfComponents} parts</span>
                    </div>
                  </div>
                  <div className="border rounded-xl p-6 bg-slate-900 text-white flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
                    <img
                      src={formInput.assemblyExplodedViewUrl}
                      alt="Assembly 3D View"
                      className="max-h-72 object-contain opacity-80"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs">
                      <span>3D CAD Exploded Model • Assembly Revision 1.0</span>
                      <ErpButton size="sm" onClick={() => setAssemblyModalOpen(true)}>
                        <Maximize2 className="h-3.5 w-3.5 mr-1" /> View Interactive 3D CAD
                      </ErpButton>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "part_design" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">All Mechanical Component Parts</h4>
                    <ErpButton size="sm" onClick={() => setAddPartModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Add New Part
                    </ErpButton>
                  </div>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-border text-slate-700 font-semibold">
                        <tr>
                          <th className="p-3">Part Number</th>
                          <th className="p-3">Part Name</th>
                          <th className="p-3">Material Grade</th>
                          <th className="p-3">Manufacturing Process</th>
                          <th className="p-3">Revision</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {formInput.topParts.map((pt) => (
                          <tr key={pt.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-primary">{pt.partNumber}</td>
                            <td className="p-3 font-semibold text-slate-800">{pt.partName}</td>
                            <td className="p-3 text-slate-600">{pt.material}</td>
                            <td className="p-3 text-slate-600">{pt.process}</td>
                            <td className="p-3 font-mono">{pt.revision}</td>
                            <td className="p-3"><StatusBadge status={pt.status} /></td>
                            <td className="p-3 text-right">
                              <button type="button" className="text-primary hover:underline font-medium text-xs">
                                Edit Part
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "mechanism_design" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-foreground border-b pb-2">Kinematic & Dynamics Specs</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground block">Mechanism Name</span><span className="font-semibold">{formInput.mechanismName}</span></div>
                      <div><span className="text-muted-foreground block">Motion Type</span><span className="font-semibold">{formInput.motionType}</span></div>
                      <div><span className="text-muted-foreground block">Degrees of Freedom</span><span className="font-semibold">{formInput.degreesOfFreedom}</span></div>
                      <div><span className="text-muted-foreground block">Actuation Method</span><span className="font-semibold">{formInput.actuationMethod}</span></div>
                      <div><span className="text-muted-foreground block">Transmission Type</span><span className="font-semibold">{formInput.transmissionType}</span></div>
                      <div><span className="text-muted-foreground block">Safety Mechanism</span><span className="font-semibold">{formInput.safetyMechanism}</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center text-center">
                    <Cog className="h-12 w-12 text-primary animate-spin-slow mb-2" />
                    <h4 className="font-bold text-sm text-foreground">Reliability Target</h4>
                    <span className="text-3xl font-black text-emerald-600">{formInput.reliabilityTarget}%</span>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Linear cable management mechanism cycle tested for 100,000 actuations under peak operational load.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "materials_manufacturing" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-foreground border-b pb-2">Material Specification</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground block">Material Grade</span><span className="font-semibold">{formInput.materialGrade}</span></div>
                      <div><span className="text-muted-foreground block">Standard</span><span className="font-semibold">{formInput.materialStandard}</span></div>
                      <div><span className="text-muted-foreground block">Heat Treatment</span><span className="font-semibold">{formInput.heatTreatment}</span></div>
                      <div><span className="text-muted-foreground block">Surface Finish</span><span className="font-semibold">{formInput.surfaceFinish}</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-foreground border-b pb-2">Manufacturing & Cost</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground block">Tolerance Class</span><span className="font-semibold">{formInput.toleranceClass}</span></div>
                      <div><span className="text-muted-foreground block">GD&T Standard</span><span className="font-semibold">{formInput.gdtRequirement}</span></div>
                      <div className="col-span-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-950 font-bold">
                        <span>Est. Manufacturing Cost: </span>
                        <span className="text-base font-black text-emerald-700">{formInput.estManufacturingCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "engineering_analysis" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                      <h4 className="font-bold text-sm text-foreground border-b pb-2">Simulation Test Cases</h4>
                      <div className="space-y-2">
                        {formInput.engineeringAnalyses.map((ea) => (
                          <div key={ea.id} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                            <span className="font-semibold text-slate-800">{ea.name}</span>
                            <StatusBadge status={ea.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border rounded-xl p-4 bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase">von Mises Stress Plot</span>
                        <ErpButton size="sm" onClick={() => setFeaModalOpen(true)}>
                          <Maximize2 className="h-3 w-3 mr-1" /> View Plot
                        </ErpButton>
                      </div>
                      <img src={formInput.feaStressPlotUrl} alt="FEA plot" className="h-44 object-contain mx-auto" />
                      <div className="text-[10px] text-slate-400 mt-2 text-center">Peak stress 142 MPa &lt; Yield Limit 276 MPa (Safety Factor 1.94)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai_assessment" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-foreground">AI Engineering Optimization Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formInput.aiRecommendations.map((rec) => (
                      <div key={rec.id} className="p-4 rounded-xl border bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            {rec.title}
                          </span>
                          {rec.impactScore && (
                            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              {rec.impactScore}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-foreground">Engineering Attachments & Drawings</h4>
                    <ErpButton size="sm" onClick={() => toast.success("Upload attachment dialog opened.")}>
                      <Upload className="h-4 w-4 mr-1" /> Upload Attachment
                    </ErpButton>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {formInput.attachments.map((att) => (
                      <div key={att.id} className="p-3 border rounded-lg bg-slate-50/80 hover:bg-white transition-all flex items-center justify-between">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="h-6 w-6 text-primary shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-bold block text-foreground truncate">{att.name}</span>
                            <span className="text-[10px] text-muted-foreground">{att.size}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => toast.info(`Downloading ${att.name}...`)} className="p-1 hover:bg-slate-200 rounded text-slate-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "review_approval" && (
                <div className="space-y-6">
                  <h4 className="font-bold text-sm text-foreground">Engineering Review Board Sign-Off</h4>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-border text-slate-700 font-semibold">
                        <tr>
                          <th className="p-3">Role</th>
                          <th className="p-3">Person</th>
                          <th className="p-3">Decision</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {formInput.reviewers.map((rev) => (
                          <tr key={rev.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">{rev.role}</td>
                            <td className="p-3 text-slate-700">{rev.person}</td>
                            <td className="p-3"><StatusBadge status={rev.decision} /></td>
                            <td className="p-3 font-medium text-slate-600">{rev.status}</td>
                            <td className="p-3 text-slate-500">{rev.date || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border space-y-4 max-w-xl">
                    <h5 className="font-bold text-xs uppercase text-slate-700">Submit Review Board Decision</h5>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Approval Decision</label>
                      <select
                        value={formInput.approvalDecision || ""}
                        onChange={(e) => handleFieldChange("approvalDecision", e.target.value as MechanicalDesignApprovalDecision)}
                        className="w-full text-xs border border-input rounded-md p-2 bg-white"
                      >
                        <option value="">Select Decision</option>
                        <option value="Approved">Approved</option>
                        <option value="Approved with Conditions">Approved with Conditions</option>
                        <option value="Revision Required">Revision Required</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                        <label>Review Comments</label>
                        <span>{(formInput.reviewComments || "").length}/2000</span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={2000}
                        value={formInput.reviewComments || ""}
                        onChange={(e) => handleFieldChange("reviewComments", e.target.value)}
                        placeholder="Enter detailed engineering review comments..."
                        className="w-full text-xs border border-input rounded-md p-2 bg-white resize-none"
                      />
                    </div>
                    <ErpButton
                      size="sm"
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
                      Record Board Decision
                    </ErpButton>
                  </div>
                </div>
              )}

              {/* General Placeholder for other tabs */}
              {activeTab === "summary" && (
                <div className="p-6 bg-slate-50 rounded-xl border text-center space-y-3">
                  <h4 className="font-bold text-sm text-foreground">Mechanical Design Summary</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Overall Mechanical Design Readiness score is {record.summary.overallMechanicalDesignScore}/100 with all 4 engineering stages verified.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* OVERVIEW TAB CONTENT GRID + STICKY SIDEBAR */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* MAIN CONTENT PANELS (COL-SPAN 3) */}
              <div className="lg:col-span-3 space-y-6">
                {/* -------------------------------------------------------------------
                    PANEL 1: Mechanical Design Overview (with embedded render)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Mechanical Design Overview
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Status: {formInput.designStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left & Middle: Text Fields */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={formInput.productName}
                          onChange={(e) =>
                            handleFieldChange("productName", e.target.value)
                          }
                          className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Mechanical Design Objective
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.designObjective}
                          onChange={(e) =>
                            handleFieldChange("designObjective", e.target.value)
                          }
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Mechanical Design Scope
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.designScope}
                          onChange={(e) =>
                            handleFieldChange("designScope", e.target.value)
                          }
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
                          Design Standards
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                          {formInput.designStandards.map((std, idx) => (
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

                    {/* Right: Embedded Render Image Panel */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Product CAD Render
                        </span>
                        <button
                          type="button"
                          onClick={() => setRenderModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground border border-transparent hover:border-slate-200 cursor-pointer"
                          title="Open Fullscreen View"
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
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs gap-1.5">
                          <Maximize2 className="h-4 w-4" /> View High-Res CAD Render
                        </div>
                      </div>

                      <div className="w-full text-center pt-2">
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Mechanical Enclosure • v1.0 Production Intent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Assembly Design (with 3D exploded view image)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Assembly Design
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Assembly Status: {formInput.assemblyStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Assembly Name</span>
                        <input
                          type="text"
                          value={formInput.assemblyName}
                          onChange={(e) => handleFieldChange("assemblyName", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Assembly Number</span>
                        <input
                          type="text"
                          value={formInput.assemblyNumber}
                          onChange={(e) => handleFieldChange("assemblyNumber", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-mono font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Assembly Type</span>
                        <input
                          type="text"
                          value={formInput.assemblyType}
                          onChange={(e) => handleFieldChange("assemblyType", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Parent Assembly</span>
                        <input
                          type="text"
                          value={formInput.parentAssembly}
                          onChange={(e) => handleFieldChange("parentAssembly", e.target.value)}
                          className="w-full rounded-md border border-input px-3 py-1.5 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Number of Components</span>
                        <div className="p-2 bg-slate-100 rounded-md border border-slate-200 font-bold text-slate-800 text-sm">
                          {formInput.numberOfComponents} parts
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Assembly Weight</span>
                        <div className="p-2 bg-slate-100 rounded-md border border-slate-200 font-bold text-slate-800 text-sm">
                          {formInput.assemblyWeight}
                        </div>
                      </div>
                    </div>

                    {/* 3D Assembly View Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider self-start mb-2 flex items-center gap-1">
                        <Layers3 className="h-3.5 w-3.5 text-primary" />
                        3D Assembly View
                      </span>
                      <div className="w-full h-36 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative group">
                        <img
                          src={formInput.assemblyExplodedViewUrl}
                          alt="3D Assembly View"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAssemblyModalOpen(true)}
                        className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View 3D Assembly
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Part Design (Top Parts Table)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Part Design (Top Parts)
                    </h2>
                    <div className="flex items-center gap-2">
                      <ErpButton size="sm" variant="outline" onClick={() => setAddPartModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Part
                      </ErpButton>
                      <button
                        type="button"
                        onClick={() => setActiveTab("part_design")}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View All Parts &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-border text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2.5">Part Number</th>
                          <th className="p-2.5">Part Name</th>
                          <th className="p-2.5">Material</th>
                          <th className="p-2.5">Process</th>
                          <th className="p-2.5">Revision</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {formInput.topParts.map((part) => (
                          <tr key={part.id} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-mono font-bold text-primary">{part.partNumber}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{part.partName}</td>
                            <td className="p-2.5 text-slate-600">{part.material}</td>
                            <td className="p-2.5 text-slate-600">{part.process}</td>
                            <td className="p-2.5 font-mono font-medium">{part.revision}</td>
                            <td className="p-2.5"><StatusBadge status={part.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Mechanism Design
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Mechanism Design
                    </h2>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Reliability Target: {formInput.reliabilityTarget}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Mechanism Name</span>
                      <input
                        type="text"
                        value={formInput.mechanismName}
                        onChange={(e) => handleFieldChange("mechanismName", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Motion Type</span>
                      <input
                        type="text"
                        value={formInput.motionType}
                        onChange={(e) => handleFieldChange("motionType", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Degrees of Freedom</span>
                      <input
                        type="number"
                        value={formInput.degreesOfFreedom}
                        onChange={(e) => handleFieldChange("degreesOfFreedom", Number(e.target.value))}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Actuation Method</span>
                      <input
                        type="text"
                        value={formInput.actuationMethod}
                        onChange={(e) => handleFieldChange("actuationMethod", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Transmission Type</span>
                      <input
                        type="text"
                        value={formInput.transmissionType}
                        onChange={(e) => handleFieldChange("transmissionType", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Safety Mechanism</span>
                      <input
                        type="text"
                        value={formInput.safetyMechanism}
                        onChange={(e) => handleFieldChange("safetyMechanism", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block font-semibold mb-1">Reliability Target (%)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formInput.reliabilityTarget}
                        onChange={(e) => handleFieldChange("reliabilityTarget", Number(e.target.value))}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-emerald-700 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Material & Manufacturing
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Material & Manufacturing
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Est. Cost: {formInput.estManufacturingCost}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Material Grade</span>
                      <input
                        type="text"
                        value={formInput.materialGrade}
                        onChange={(e) => handleFieldChange("materialGrade", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-bold text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Material Standard</span>
                      <input
                        type="text"
                        value={formInput.materialStandard}
                        onChange={(e) => handleFieldChange("materialStandard", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Heat Treatment</span>
                      <input
                        type="text"
                        value={formInput.heatTreatment}
                        onChange={(e) => handleFieldChange("heatTreatment", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Surface Finish</span>
                      <input
                        type="text"
                        value={formInput.surfaceFinish}
                        onChange={(e) => handleFieldChange("surfaceFinish", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">Tolerance Class</span>
                      <input
                        type="text"
                        value={formInput.toleranceClass}
                        onChange={(e) => handleFieldChange("toleranceClass", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-semibold mb-1">GD&T Requirement</span>
                      <input
                        type="text"
                        value={formInput.gdtRequirement}
                        onChange={(e) => handleFieldChange("gdtRequirement", e.target.value)}
                        className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block font-semibold mb-1">Est. Manufacturing Cost</span>
                      <input
                        type="text"
                        value={formInput.estManufacturingCost}
                        onChange={(e) => handleFieldChange("estManufacturingCost", e.target.value)}
                        className="w-full rounded-md border border-emerald-300 px-2.5 py-1 font-black text-emerald-800 bg-emerald-50/60"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Engineering Analysis (with FEA visualization)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Engineering Analysis
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Simulation Status: {formInput.simulationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      {formInput.engineeringAnalyses.map((ea) => (
                        <div
                          key={ea.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <span className="font-semibold text-slate-800">{ea.name}</span>
                          <StatusBadge status={ea.status} />
                        </div>
                      ))}
                    </div>

                    {/* FEA stress plot image box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col items-center justify-between relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-blue-400" />
                          FEA Stress Visualization
                        </span>
                        <button
                          type="button"
                          onClick={() => setFeaModalOpen(true)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setFeaModalOpen(true)}
                        className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer relative"
                      >
                        <img
                          src={formInput.feaStressPlotUrl}
                          alt="FEA Stress Plot"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 pt-1.5 block">
                        von Mises Stress Plot • Margin of Safety 2.45
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Design Validation
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Design Validation
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Approval Status: {formInput.approvalStatusBadge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Design Verification Method</span>
                        <input
                          type="text"
                          value={formInput.designVerificationMethod}
                          onChange={(e) => handleFieldChange("designVerificationMethod", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Prototype Validation</span>
                        <input
                          type="text"
                          value={formInput.prototypeValidation}
                          onChange={(e) => handleFieldChange("prototypeValidation", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Test Results</span>
                        <input
                          type="text"
                          value={formInput.testResults}
                          onChange={(e) => handleFieldChange("testResults", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold mb-1">Design Issues</span>
                        <input
                          type="text"
                          value={formInput.designIssues}
                          onChange={(e) => handleFieldChange("designIssues", e.target.value)}
                          className="w-full rounded-md border border-input px-2.5 py-1 font-medium text-foreground bg-slate-50/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block font-semibold mb-1">Corrective Actions</span>
                        <textarea
                          rows={2}
                          value={formInput.correctiveActions}
                          onChange={(e) => handleFieldChange("correctiveActions", e.target.value)}
                          className="w-full rounded-md border border-input p-2 text-xs font-medium text-foreground bg-slate-50/50 resize-none"
                        />
                      </div>
                    </div>

                    {/* Computed Validation Score Tile */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Validation Score
                      </span>
                      <div className="text-3xl font-black text-emerald-700 my-1">
                        {formInput.validationScore}{" "}
                        <span className="text-xs font-semibold text-emerald-600">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        High Verification Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Attachments
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Attachments
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("attachments")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All Attachments &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {formInput.attachments.slice(0, 8).map((att) => (
                      <div
                        key={att.id}
                        className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {att.size}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toast.info(`Downloading ${att.name}...`)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Recommendations
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      AI Recommendations
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("ai_assessment")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All AI Recommendations &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formInput.aiRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-lg border border-blue-100 bg-blue-50/40 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            {rec.title}
                          </span>
                          {rec.impactScore && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {rec.impactScore}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Review & Approval Table & Form
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Review & Approval
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Engineering Review Board
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Reviewers Table (Col-span 2) */}
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

                    {/* Right: Decision Input Controls */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-muted-foreground mb-1">
                          Approval Decision
                        </label>
                        <select
                          value={formInput.approvalDecision || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "approvalDecision",
                              e.target.value as MechanicalDesignApprovalDecision
                            )
                          }
                          className="w-full rounded-md border border-input bg-white p-2 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                          onChange={(e) =>
                            handleFieldChange("reviewComments", e.target.value)
                          }
                          placeholder="Enter review comments..."
                          className="w-full rounded-md border border-input bg-white p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-muted-foreground mb-1">
                          Approval Date
                        </label>
                        <input
                          type="date"
                          value={formInput.approvalDate || ""}
                          onChange={(e) => handleFieldChange("approvalDate", e.target.value)}
                          className="w-full rounded-md border border-input bg-white p-2 font-medium text-foreground"
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
                    PANEL 11: System Information
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        11
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
                        <span className="font-bold text-foreground">{record.mechanicalEngineerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Created Date</span>
                        <span className="font-medium text-slate-700">{record.createdOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block font-semibold">Last Modified By</span>
                        <span className="font-bold text-foreground">{record.mechanicalEngineerName}</span>
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
                      <button
                        type="button"
                        onClick={() => setSystemLogModalOpen(true)}
                        className="text-xs font-bold text-primary hover:underline text-left flex items-center gap-1 cursor-pointer"
                      >
                        View Log &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setSystemLogModalOpen(true)}
                        className="text-xs font-bold text-primary hover:underline text-left flex items-center gap-1 cursor-pointer"
                      >
                        View History &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setSystemLogModalOpen(true)}
                        className="text-xs font-bold text-primary hover:underline text-left flex items-center gap-1 cursor-pointer"
                      >
                        View Changes &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setSystemLogModalOpen(true)}
                        className="text-xs font-bold text-primary hover:underline text-left flex items-center gap-1 cursor-pointer"
                      >
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
                  {/* AI Mechanical Design Score Gauge Box */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Mechanical Design Score
                    </h3>

                    <CircularScoreGauge
                      score={record.aiAssessment.aiOverallScore}
                      label="AI Overall Score"
                    />

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">AI Design Quality</span>
                        <span className="font-bold text-slate-800">{record.aiAssessment.aiDesignQuality} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">AI Manufacturability</span>
                        <span className="font-bold text-slate-800">{record.aiAssessment.aiManufacturability} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">AI Structural Assessment</span>
                        <span className="font-bold text-slate-800">{record.aiAssessment.aiStructuralAssessment} /100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">AI Cost Optimization</span>
                        <span className="font-bold text-slate-800">{record.aiAssessment.aiCostOptimization} /100</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t font-bold text-primary">
                        <span>AI Overall Score</span>
                        <span>{record.aiAssessment.aiOverallScore} /100</span>
                      </div>
                    </div>
                  </div>

                  {/* Design Summary Progress Bars */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Design Summary
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>Structural Readiness</span>
                          <span>{record.summary.structuralReadiness} /100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${record.summary.structuralReadiness}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>Manufacturability</span>
                          <span>{record.summary.manufacturability} /100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${record.summary.manufacturability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>Reliability</span>
                          <span>{record.summary.reliability} /100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${record.summary.reliability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>Simulation</span>
                          <span>{record.summary.simulation} /100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${record.summary.simulation}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-bold text-slate-900 mb-1">
                          <span>Overall Mechanical Design Score</span>
                          <span>{record.summary.overallMechanicalDesignScore} /100</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${record.summary.overallMechanicalDesignScore}%` }}
                          />
                        </div>
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
                        onClick={() => setAssemblyModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Box className="h-4 w-4 text-indigo-600" />
                        View 3D CAD Assembly
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
                        onClick={() => setSimulationModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-purple-600" />
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
                          toast.success("Exported Mechanical Design Data JSON package.");
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Share2 className="h-4 w-4 text-amber-600" />
                        Export Design Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleReviewModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all text-left cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 text-rose-600" />
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
            DIALOG / MODAL POPUPS FOR QUICK ACTIONS
            =========================================================================== */}

        {/* 1. Generate Design Report Modal */}
        <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Mechanical Design Engineering Report
              </DialogTitle>
              <DialogDescription>
                Generated executive summary report for record {record.designId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <span className="font-bold text-slate-900 block">{record.designProjectName}</span>
                <p className="text-slate-600">
                  Comprehensive mechanical design package covering 125 components, DFM analysis, structural FEA safety factor 2.45, and cable management mechanism specs.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="p-2 border rounded">Overall Design Score: {record.summary.overallMechanicalDesignScore}/100</div>
                <div className="p-2 border rounded">Est Cost: {formInput.estManufacturingCost}</div>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setReportModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton
                onClick={() => {
                  toast.success("Downloaded Mechanical_Design_Report.pdf");
                  setReportModalOpen(false);
                }}
              >
                <Download className="h-4 w-4 mr-1.5" /> Download PDF Report
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2. 3D Assembly CAD Viewer Modal */}
        <Dialog open={assemblyModalOpen} onOpenChange={setAssemblyModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-indigo-600" />
                3D CAD Interactive Assembly Viewer
              </DialogTitle>
              <DialogDescription>
                Assembly Model: {formInput.assemblyName} ({formInput.assemblyNumber}) • 125 Components
              </DialogDescription>
            </DialogHeader>

            <div className="h-[450px] bg-slate-950 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden text-white">
              <img
                src={formInput.assemblyExplodedViewUrl}
                alt="Interactive Exploded View"
                className="max-h-[380px] object-contain p-4 animate-pulse-slow"
              />
              <div className="absolute top-4 left-4 flex gap-2 text-xs">
                <span className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded">CAD Format: .STEP</span>
                <span className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded">Explosion Level: 45%</span>
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setAssemblyModalOpen(false)}>
                Close Viewer
              </ErpButton>
              <ErpButton onClick={() => toast.success("Exported STEP file 3D_CAD_Assembly.step")}>
                <Download className="h-4 w-4 mr-1.5" /> Export .STEP Model
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. View BOM Modal */}
        <Dialog open={bomModalOpen} onOpenChange={setBomModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Bill of Materials (BOM) — Top Parts
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 sticky top-0 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Part #</th>
                    <th className="p-2.5">Part Name</th>
                    <th className="p-2.5">Material</th>
                    <th className="p-2.5">Process</th>
                    <th className="p-2.5">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formInput.topParts.map((pt) => (
                    <tr key={pt.id}>
                      <td className="p-2.5 font-bold font-mono text-primary">{pt.partNumber}</td>
                      <td className="p-2.5 font-medium">{pt.partName}</td>
                      <td className="p-2.5">{pt.material}</td>
                      <td className="p-2.5">{pt.process}</td>
                      <td className="p-2.5 font-bold">1</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setBomModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton onClick={() => toast.success("Exported BOM.xlsx")}>
                <Download className="h-4 w-4 mr-1.5" /> Export Excel BOM
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 4. Simulation Report Modal */}
        <Dialog open={simulationModalOpen} onOpenChange={setSimulationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Engineering FEA & CAE Simulation Report
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <div className="grid grid-cols-2 gap-3">
                {formInput.engineeringAnalyses.map((ea) => (
                  <div key={ea.id} className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center">
                    <span className="font-semibold">{ea.name}</span>
                    <StatusBadge status={ea.status} />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setSimulationModalOpen(false)}>
                Close
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 5. Product CAD Render Fullscreen Modal */}
        <Dialog open={renderModalOpen} onOpenChange={setRenderModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>High-Resolution Product CAD Render</DialogTitle>
            </DialogHeader>
            <div className="h-[500px] bg-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img
                src={formInput.productRenderUrl}
                alt="Full Render"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* 6. FEA Plot Fullscreen Modal */}
        <Dialog open={feaModalOpen} onOpenChange={setFeaModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>FEA von Mises Stress Distribution Analysis</DialogTitle>
            </DialogHeader>
            <div className="h-[500px] bg-slate-950 rounded-xl p-4 flex items-center justify-center">
              <img
                src={formInput.feaStressPlotUrl}
                alt="Full FEA Plot"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* 7. Schedule Review Modal */}
        <Dialog open={scheduleReviewModalOpen} onOpenChange={setScheduleReviewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-600" />
                Schedule Mechanical Design Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Review Date & Time</label>
                <input type="datetime-local" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Attendees</label>
                <input type="text" defaultValue="Rahul Sharma, Vikram Singh, Arun Nair" className="w-full border p-2 rounded" />
              </div>
            </div>
            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setScheduleReviewModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                onClick={() => {
                  toast.success("Design Review Meeting scheduled & calendar invites sent.");
                  setScheduleReviewModalOpen(false);
                }}
              >
                Send Invites
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 8. System Log / Audit History Modal */}
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

        {/* 9. Add Part Modal */}
        <Dialog open={addPartModalOpen} onOpenChange={setAddPartModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Add Mechanical Component Part
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Part Number</label>
                <input
                  type="text"
                  placeholder="e.g. PRT-006"
                  value={newPartInput.partNumber}
                  onChange={(e) => setNewPartInput({ ...newPartInput, partNumber: e.target.value })}
                  className="w-full border p-2 rounded bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Part Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rear Mounting Bracket"
                  value={newPartInput.partName}
                  onChange={(e) => setNewPartInput({ ...newPartInput, partName: e.target.value })}
                  className="w-full border p-2 rounded bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Material</label>
                <input
                  type="text"
                  value={newPartInput.material}
                  onChange={(e) => setNewPartInput({ ...newPartInput, material: e.target.value })}
                  className="w-full border p-2 rounded bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Process</label>
                <input
                  type="text"
                  value={newPartInput.process}
                  onChange={(e) => setNewPartInput({ ...newPartInput, process: e.target.value })}
                  className="w-full border p-2 rounded bg-slate-50"
                />
              </div>
            </div>

            <DialogFooter>
              <ErpButton variant="outline" onClick={() => setAddPartModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={handleAddPart}>
                Add Part
              </ErpButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
