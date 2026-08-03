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
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  IndustrialDesignTabBar,
  type IndustrialDesignTabId,
} from "@/components/erp/IndustrialDesignTabBar";
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
import { industrialDesignService } from "@/services";
import type {
  IndustrialDesignApprovalDecision,
  IndustrialDesignFormInput,
  IndustrialDesignRecord,
  IndustrialDesignStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/industrial-design/new",
)({
  head: () => ({
    meta: [{ title: "Industrial Design Form · Magnertia ERP" }],
  }),
  component: IndustrialDesignFormPage,
});

/* ===========================================================================
   Score Gauge Component
   =========================================================================== */
function CircularScoreGauge({
  score,
  label = "DESIGN SCORE",
}: {
  score: number;
  label?: string;
}) {
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "text-emerald-500 stroke-emerald-500";
  if (score < 60) scoreColor = "text-amber-500 stroke-amber-500";
  if (score < 40) scoreColor = "text-rose-500 stroke-rose-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="42"
          className="stroke-muted/30 fill-none"
          strokeWidth="8"
        />
        <circle
          cx="56"
          cy="56"
          r="42"
          className={cn(
            "fill-none transition-all duration-1000 ease-out",
            scoreColor,
          )}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {score}
        </span>
        <span className="text-[9px] font-bold uppercase text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function IndustrialDesignFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Active Tab State
  const [activeTab, setActiveTab] =
    useState<IndustrialDesignTabId>("overview");

  // Dialog / Modal States
  const [renderModalOpen, setRenderModalOpen] = useState(false);
  const [cad3DModalOpen, setCad3DModalOpen] = useState(false);
  const [activeAuditModal, setActiveAuditModal] = useState<
    "audit" | "activity" | "change" | "workflow" | null
  >(null);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [versionCompareOpen, setVersionCompareOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewAttachmentsOpen, setViewAttachmentsOpen] = useState(false);

  // Fetch Record Query
  const { data: record, isLoading } = useQuery({
    queryKey: ["industrialDesignRecord"],
    queryFn: () => industrialDesignService.fetchRecord(),
  });

  // Local Form Input State
  const [formInput, setFormInput] = useState<IndustrialDesignFormInput | null>(
    null,
  );

  // Sync state when query returns
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: IndustrialDesignFormInput) =>
      industrialDesignService.saveDraft(input, record?.id),
    onSuccess: (data) => {
      queryClient.setQueryData(["industrialDesignRecord"], data);
      toast.success("Draft saved successfully", {
        description: `Industrial Design record ${data.designId} updated.`,
      });
    },
  });

  // Submit for Review Mutation
  const submitMutation = useMutation({
    mutationFn: () => industrialDesignService.submitForReview(record?.id),
    onSuccess: (data) => {
      queryClient.setQueryData(["industrialDesignRecord"], data);
      toast.success("Submitted for Executive Review", {
        description: `Industrial Design record ${data.designId} is now under board review.`,
      });
    },
  });

  // Review Decision Mutation
  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: IndustrialDesignApprovalDecision;
      comments?: string;
    }) =>
      industrialDesignService.reviewDecision({
        id: record?.id || "id-rec-0017",
        ...args,
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["industrialDesignRecord"], data);
      if (variables.decision === "approved") {
        toast.success("Industrial Design Approved!", {
          description: `Downstream Mechanical Design project ${data.linkedMechanicalDesignId || "MECH-2024-0042"} initialized. Industrial Designer notified to proceed.`,
        });
      } else {
        toast.info(`Review Decision Rendered: ${data.status}`, {
          description: `Design status set to ${data.status}.`,
        });
      }
    },
  });

  if (isLoading || !record || !formInput) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">
              Loading Industrial Design...
            </span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Field change helper
  const handleFieldChange = (
    field: keyof IndustrialDesignFormInput,
    value: unknown,
  ) => {
    setFormInput((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveDraft = () => {
    if (formInput) saveDraftMutation.mutate(formInput);
  };

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  const summary = record.summary;
  const aiAssessment = record.aiAssessment;
  const highlights = record.keyHighlights;

  return (
    <AppShell
      title="Industrial Design"
      breadcrumb={breadcrumb}
      description="Shape product aesthetics, ergonomics, CMF (Color, Material, Finish), and human-centered design."
      tabs={tabs}
    >
      <div className="space-y-6 pb-12">
        {/* ===========================================================================
            1. PAGE HEADER & BREADCRUMB
            =========================================================================== */}
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() => setVersionCompareOpen(true)}
              >
                <History className="h-3.5 w-3.5 mr-1.5" />
                Compare Versions
              </ErpButton>
            </div>

        {/* ===========================================================================
            2. RECORD HEADER BAR (TWO ROWS)
            =========================================================================== */}
        <div className="bg-white border-b border-border px-6 py-4 space-y-3 shadow-2xs">
          {/* Row 1: Primary Record Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Industrial Design ID
                </span>
                <span className="font-bold text-sm text-foreground">
                  {record.designId}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Form Code
                </span>
                <span className="font-medium text-foreground">
                  {record.formCode}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Design Project Name
                </span>
                <input
                  type="text"
                  value={formInput.designProjectName}
                  onChange={(e) =>
                    handleFieldChange("designProjectName", e.target.value)
                  }
                  className="font-semibold text-foreground border-b border-dashed border-primary/40 focus:border-primary focus:outline-none bg-transparent"
                />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Design Version
                </span>
                <span className="font-medium text-foreground">
                  {record.designVersion}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Workflow Status
                </span>
                <StatusBadge status={record.status} />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Created On
                </span>
                <span className="text-muted-foreground">
                  {record.createdOn}
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Draft
              </ErpButton>
              <ErpButton
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={
                  submitMutation.isPending || record.status === "Approved"
                }
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit for Review
              </ErpButton>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toast.info("Exporting Industrial Design data...")}
                  className="p-1.5 rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                  title="More Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Resolved Linked Records & Owner Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
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
                  {record.linkedArchitectureId}
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

              {/* Linked PRD Chip */}
              <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 text-indigo-800 rounded-md px-2.5 py-1 font-medium">
                <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Linked PRD:</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/development/research-innovation/prd/new",
                    })
                  }
                  className="font-bold underline hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                >
                  {record.linkedPrdId}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Downstream Mechanical Design Chip (if approved) */}
              {record.linkedMechanicalDesignId && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-2.5 py-1 font-medium animate-in fade-in duration-300">
                  <Box className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Mechanical Design:</span>
                  <span className="font-bold">
                    {record.linkedMechanicalDesignId}
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-semibold px-1.5 rounded">
                    Hand-off Active
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
              <div>
                <span>Business Unit:</span>{" "}
                <span className="font-semibold text-foreground">
                  {record.businessUnit}
                </span>
              </div>
              <div>
                <span>Industrial Designer:</span>{" "}
                <span className="font-semibold text-foreground">
                  {record.industrialDesignerName}
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

        {/* ===========================================================================
            3. TAB BAR
            =========================================================================== */}
        <IndustrialDesignTabBar
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />

        {/* ===========================================================================
            4. MAIN CONTENT AREA (OVERVIEW TAB OR PLACEHOLDERS) + STICKY SIDEBAR
            =========================================================================== */}
        <div className="px-6 py-6 max-w-[1600px] mx-auto w-full">
          {activeTab !== "overview" ? (
            /* Non-Overview Placeholder Tab View */
            <div className="bg-white rounded-xl border border-border p-12 text-center shadow-xs">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground capitalize">
                  {activeTab.replace("_", " ")} View
                </h3>
                <p className="text-sm text-muted-foreground">
                  This detailed view is linked to the primary Industrial Design
                  record ({record.designId}). Core design metrics and overall form
                  specifications are aggregated on the Overview tab.
                </p>
                <ErpButton
                  variant="outline"
                  onClick={() => setActiveTab("overview")}
                >
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
                    PANEL 1: Design Overview (with embedded EV Charger Render)
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Design Overview
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
                          Design Objective
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
                          Design Vision
                        </label>
                        <textarea
                          rows={2}
                          value={formInput.designVision}
                          onChange={(e) =>
                            handleFieldChange("designVision", e.target.value)
                          }
                          className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Product Category
                          </label>
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {formInput.productCategory}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Design Language
                          </label>
                          <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {formInput.designLanguage}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Target Users
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                          {formInput.targetUsers.map((user, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-white border border-border px-2.5 py-0.5 rounded-md text-xs font-medium text-foreground shadow-2xs"
                            >
                              <User className="h-3 w-3 text-primary" />
                              {user}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Embedded Render Image Panel (Matched to 2_5.png) */}
                    <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/60 relative overflow-hidden group">
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          Product Render
                        </span>
                        <button
                          type="button"
                          onClick={() => setRenderModalOpen(true)}
                          className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground border border-transparent hover:border-slate-200"
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
                          Concept Render • v1.0 Production Intent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: Form Factor & Ergonomics
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      Form Factor & Ergonomics
                    </h2>
                    <Ruler className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Form Factor
                      </label>
                      <input
                        type="text"
                        value={formInput.formFactor}
                        onChange={(e) =>
                          handleFieldChange("formFactor", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={formInput.dimensions}
                        onChange={(e) =>
                          handleFieldChange("dimensions", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Weight Target
                      </label>
                      <input
                        type="text"
                        value={formInput.weightTarget}
                        onChange={(e) =>
                          handleFieldChange("weightTarget", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Ergonomic Considerations
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.ergonomicConsiderations}
                        onChange={(e) =>
                          handleFieldChange(
                            "ergonomicConsiderations",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Accessibility Features
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.accessibilityFeatures}
                        onChange={(e) =>
                          handleFieldChange(
                            "accessibilityFeatures",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Human Factors Assessment
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.humanFactorsAssessment}
                        onChange={(e) =>
                          handleFieldChange(
                            "humanFactorsAssessment",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Ergonomic Readiness Score
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs">
                        {formInput.ergonomicScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Aesthetics & Branding
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Aesthetics & Branding
                    </h2>
                    <Palette className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Product Style
                      </label>
                      <input
                        type="text"
                        value={formInput.productStyle}
                        onChange={(e) =>
                          handleFieldChange("productStyle", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Color Palette
                      </label>
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-md border border-input">
                        {formInput.colorPalette.map((color, i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Surface Finish
                      </label>
                      <input
                        type="text"
                        value={formInput.surfaceFinish}
                        onChange={(e) =>
                          handleFieldChange("surfaceFinish", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Brand Identity Alignment
                      </label>
                      <input
                        type="text"
                        value={formInput.brandIdentityAlignment}
                        onChange={(e) =>
                          handleFieldChange(
                            "brandIdentityAlignment",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Logo Placement
                      </label>
                      <input
                        type="text"
                        value={formInput.logoPlacement}
                        onChange={(e) =>
                          handleFieldChange("logoPlacement", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Visual Appeal & Brand Score
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs">
                        {formInput.visualAppealScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Material Selection
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Material Selection
                    </h2>
                    <Layers3 className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Primary Material
                      </label>
                      <input
                        type="text"
                        value={formInput.primaryMaterial}
                        onChange={(e) =>
                          handleFieldChange("primaryMaterial", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Secondary Materials
                      </label>
                      <input
                        type="text"
                        value={formInput.secondaryMaterials}
                        onChange={(e) =>
                          handleFieldChange("secondaryMaterials", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Material Grade
                      </label>
                      <input
                        type="text"
                        value={formInput.materialGrade}
                        onChange={(e) =>
                          handleFieldChange("materialGrade", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Sustainability Rating
                      </label>
                      <div className="p-2 bg-slate-50 rounded-md border border-input flex items-center justify-between">
                        <StarRating rating={formInput.sustainabilityRatingStars} />
                        <span className="text-xs font-bold text-slate-700">
                          {formInput.sustainabilityRatingStars} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Recyclability (%)
                      </label>
                      <div className="p-2 bg-slate-50 rounded-md border border-input flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {formInput.recyclabilityPercent}% Recyclable
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Material Cost
                      </label>
                      <input
                        type="text"
                        value={formInput.materialCost}
                        onChange={(e) =>
                          handleFieldChange("materialCost", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Environmental Compliance
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.environmentalCompliance.map((comp, i) => (
                          <span
                            key={i}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Manufacturing Considerations
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Manufacturing Considerations
                    </h2>
                    <Factory className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Manufacturing Process
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.manufacturingProcess.map((proc, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold"
                          >
                            {proc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Assembly Method
                      </label>
                      <input
                        type="text"
                        value={formInput.assemblyMethod}
                        onChange={(e) =>
                          handleFieldChange("assemblyMethod", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        DFM Assessment
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.dfmAssessment}
                        onChange={(e) =>
                          handleFieldChange("dfmAssessment", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        DFA Assessment
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.dfaAssessment}
                        onChange={(e) =>
                          handleFieldChange("dfaAssessment", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Manufacturability Score
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs">
                        {formInput.manufacturabilityScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Prototype & Validation
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Prototype & Validation
                    </h2>
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Prototype Type
                      </label>
                      <input
                        type="text"
                        value={formInput.prototypeType}
                        onChange={(e) =>
                          handleFieldChange("prototypeType", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Prototype Status
                      </label>
                      <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {formInput.prototypeStatusBadge}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Iteration Number
                      </label>
                      <input
                        type="number"
                        value={formInput.designIterationNumber}
                        onChange={(e) =>
                          handleFieldChange(
                            "designIterationNumber",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Design Validation Score
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs">
                        {formInput.validationScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Sustainability & Compliance
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Sustainability & Compliance
                    </h2>
                    <Leaf className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Carbon Footprint Estimate
                      </label>
                      <input
                        type="text"
                        value={formInput.carbonFootprintEstimate}
                        onChange={(e) =>
                          handleFieldChange(
                            "carbonFootprintEstimate",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Energy Efficiency
                      </label>
                      <div className="p-2 bg-slate-50 rounded-md border border-input flex items-center justify-between">
                        <StarRating rating={formInput.energyEfficiencyStars} />
                        <span className="text-xs font-bold text-slate-700">
                          {formInput.energyEfficiencyStars} / 5 Stars
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Regulatory Standards
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.regulatoryStandards.map((std, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-semibold"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Compliance & Eco Score
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-xs">
                        {formInput.complianceScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: AI Industrial Design Assessment
                    ------------------------------------------------------------------- */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-sm border border-indigo-700/50">
                  <div className="flex items-center justify-between border-b border-indigo-700/40 pb-3 mb-4">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
                        8
                      </span>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      AI Industrial Design Assessment
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-indigo-200">
                        AI Overall Score:
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold px-3 py-0.5 rounded-full text-xs">
                        {aiAssessment.aiOverallDesignScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Design Quality
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {aiAssessment.aiDesignQualityScore} / 100
                      </span>
                    </div>
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Ergonomic Analysis
                      </span>
                      <span className="text-xs text-indigo-100 font-medium block">
                        {aiAssessment.aiErgonomicAssessment}
                      </span>
                    </div>
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Cost Optimization
                      </span>
                      <span className="text-xs text-emerald-300 font-medium block">
                        {aiAssessment.aiCostOptimization}
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: Attachments
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9
                      </span>
                      Attachments & Documentation
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="px-2.5 py-1 bg-primary text-primary-foreground rounded text-xs font-medium flex items-center gap-1 hover:bg-primary/90"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewAttachmentsOpen(true)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View All ({formInput.attachments.length})
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {formInput.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="p-2 rounded bg-slate-200/80 text-slate-700 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate block">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {att.size} • {att.uploadedAt}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              toast.success(`Downloading ${att.name}...`)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-slate-100"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Review & Approval Table & Decision
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
                      </span>
                      Review & Approval Board
                    </h2>
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Review Board Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Role</th>
                          <th className="p-3">Person</th>
                          <th className="p-3">Decision</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {formInput.reviewers.map((rev) => (
                          <tr key={rev.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-foreground">
                              {rev.role}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {rev.person}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  rev.decision === "Approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : rev.decision === "Revision Required"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {rev.decision === "Approved" && (
                                  <Check className="h-3 w-3" />
                                )}
                                {rev.decision}
                              </span>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {rev.status}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {rev.date || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approval Action Controls */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Execute Industrial Design Approval Decision
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Approval Decision
                        </label>
                        <select
                          value={record.approvalDecision || ""}
                          onChange={(e) => {
                            const val = e.target.value as IndustrialDesignApprovalDecision;
                            if (val) {
                              reviewMutation.mutate({
                                decision: val,
                                comments: formInput.reviewComments,
                              });
                            }
                          }}
                          className="w-full rounded-md border border-input bg-white px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="" disabled>
                            Select Decision...
                          </option>
                          <option value="approved">Approved</option>
                          <option value="approved_with_conditions">
                            Approved with Conditions
                          </option>
                          <option value="revision_required">
                            Revision Required
                          </option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-muted-foreground">
                            Review Comments
                          </label>
                          <span className="text-[10px] text-muted-foreground">
                            {formInput.reviewComments.length} / 2000 characters
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          maxLength={2000}
                          value={formInput.reviewComments}
                          onChange={(e) =>
                            handleFieldChange("reviewComments", e.target.value)
                          }
                          placeholder="Provide industrial design feedback or approval conditions..."
                          className="w-full rounded-md border border-input bg-white p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 11: System Information & Audit Logs
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        11
                      </span>
                      System Audit & Information
                    </h2>
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        Created By
                      </span>
                      <span className="font-medium text-foreground">
                        {record.industrialDesignerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        Created Date
                      </span>
                      <span className="font-medium text-foreground">
                        {record.createdOn}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        Last Modified By
                      </span>
                      <span className="font-medium text-foreground">
                        {record.industrialDesignerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        Last Modified Date
                      </span>
                      <span className="font-medium text-foreground">
                        {record.lastUpdated}
                      </span>
                    </div>
                  </div>

                  {/* Audit Logs Links */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveAuditModal("audit")}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span>Audit Trail</span>
                      <span className="text-primary font-bold">View Log →</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAuditModal("activity")}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span>Activity History</span>
                      <span className="text-primary font-bold">
                        View History →
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAuditModal("change")}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span>Change History</span>
                      <span className="text-primary font-bold">
                        View Changes →
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAuditModal("workflow")}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span>Workflow History</span>
                      <span className="text-primary font-bold">
                        View Workflow →
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ===========================================================================
                  RIGHT SIDEBAR PANEL (STICKY ON SCROLL)
                  =========================================================================== */}
              <div className="space-y-6">
                <div className="sticky top-4 space-y-6">
                  {/* Design Summary Score Gauge */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs text-center space-y-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Design Summary
                    </h3>
                    <CircularScoreGauge score={summary.overallDesignScore} />

                    {/* Breakdown Scores */}
                    <div className="space-y-2 text-left pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>User Experience</span>
                          <span className="font-bold text-foreground">
                            {summary.userExperience} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${summary.userExperience}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Manufacturability</span>
                          <span className="font-bold text-foreground">
                            {summary.manufacturability} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${summary.manufacturability}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Sustainability</span>
                          <span className="font-bold text-foreground">
                            {summary.sustainability} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${summary.sustainability}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Brand Alignment</span>
                          <span className="font-bold text-foreground">
                            {summary.brandAlignment} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${summary.brandAlignment}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Highlights Checklist */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Key Highlights
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium leading-tight">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Quick Actions
                    </h3>
                    <div className="space-y-2 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() =>
                          toast.success("Generating Industrial Design Report PDF...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        Generate Design Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setCad3DModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Box className="h-4 w-4 text-primary" />
                        View 3D Model
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Opening Concept Sketches PDF...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <PenTool className="h-4 w-4 text-primary" />
                        View Concept Sketches
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Opening Material Datasheets...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Layers3 className="h-4 w-4 text-primary" />
                        View Material Datasheets
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleMeetingOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        Schedule Design Review
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.success("Exporting Industrial Design Data...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Download className="h-4 w-4 text-primary" />
                        Export Design Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===========================================================================
          MODALS & DRAWERS
          =========================================================================== */}

      {/* 1. Product Render Fullscreen Modal */}
      <Dialog open={renderModalOpen} onOpenChange={setRenderModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-primary" />
              High-Res Product Render — {record.designId}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[450px]">
            <img
              src={formInput.productRenderUrl}
              alt="High-Res Product Render"
              className="max-h-[500px] w-auto object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. 3D Model STEP Viewer Modal */}
      <Dialog open={cad3DModalOpen} onOpenChange={setCad3DModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Box className="h-5 w-5 text-primary" />
              Interactive 3D CAD Viewer — {record.designId}
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-950 rounded-xl p-8 text-white min-h-[400px] flex flex-col items-center justify-center space-y-4 border border-slate-800">
            <Box className="h-16 w-16 text-primary animate-bounce" />
            <h3 className="text-base font-bold">
              3D STEP Model: 3D_Model.step (18.5 MB)
            </h3>
            <p className="text-xs text-slate-400 text-center max-w-md">
              Interactive 3D WebGL preview mode. Rotate, pan, and inspect assembly clearances for sheet metal enclosure.
            </p>
            <ErpButton
              variant="primary"
              onClick={() => toast.success("Downloading 3D_Model.step...")}
            >
              <Download className="h-4 w-4 mr-2" /> Download CAD STEP File
            </ErpButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Audit Trail Drawer / Modal */}
      <Dialog
        open={activeAuditModal !== null}
        onOpenChange={(open) => !open && setActiveAuditModal(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {activeAuditModal} Log — {record.designId}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {record.auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>{entry.action}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-slate-600">{entry.details}</p>
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-slate-100">
                  User: {entry.user}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Schedule Review Meeting Modal */}
      <Dialog
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Design Review Meeting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                defaultValue={`Design Review: ${formInput.designProjectName}`}
                className="w-full rounded border border-input p-2 text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                defaultValue="2026-07-31T14:00"
                className="w-full rounded border border-input p-2 text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <ErpButton
              variant="primary"
              onClick={() => {
                setScheduleMeetingOpen(false);
                toast.success("Design Review Meeting Scheduled!", {
                  description: "Invites sent to Design Board members.",
                });
              }}
            >
              Send Meeting Invites
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Compare Versions Modal */}
      <Dialog
        open={versionCompareOpen}
        onOpenChange={setVersionCompareOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Compare Industrial Design Versions
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-sm block">Version v0.9 (Initial Concept)</span>
              <p>Form Factor: Desk Top / Pedestal</p>
              <p>Primary Material: Plastic Composite</p>
              <p>Overall Design Score: 72/100</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="font-bold text-sm block text-emerald-900">
                Version v1.0 (Production Intent)
              </span>
              <p>Form Factor: Floor Standing</p>
              <p>Primary Material: Aluminum Alloy (AL-6061)</p>
              <p>Overall Design Score: 87/100</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
