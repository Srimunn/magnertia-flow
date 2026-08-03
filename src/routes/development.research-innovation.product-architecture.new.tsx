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
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  ProductArchitectureTabBar,
  type ProductArchitectureTabId,
} from "@/components/erp/ProductArchitectureTabBar";
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
import { productArchitectureService } from "@/services";
import type {
  ProductArchitectureApprovalDecision,
  ProductArchitectureFormInput,
  ProductArchitectureRecord,
  ProductArchitectureStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/product-architecture/new",
)({
  head: () => ({
    meta: [{ title: "Product Architecture Form · Magnertia ERP" }],
  }),
  component: ProductArchitectureFormPage,
});

/* ===========================================================================
   Score Gauge Component
   =========================================================================== */
function CircularScoreGauge({
  score,
  label = "ARCHITECTURE SCORE",
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

export function ProductArchitectureFormPage({
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
    useState<ProductArchitectureTabId>("overview");

  // Dialog / Modal States
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [activeAuditModal, setActiveAuditModal] = useState<
    "audit" | "activity" | "change" | "workflow" | null
  >(null);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [versionCompareOpen, setVersionCompareOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewAttachmentsOpen, setViewAttachmentsOpen] = useState(false);

  // Fetch Record Query
  const { data: record, isLoading } = useQuery({
    queryKey: ["productArchitectureRecord"],
    queryFn: () => productArchitectureService.fetchRecord(),
  });

  // Local Form Input State
  const [formInput, setFormInput] = useState<ProductArchitectureFormInput | null>(
    null,
  );

  // Sync state when query returns
  if (record && !formInput) {
    setFormInput(record.input);
  }

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: ProductArchitectureFormInput) =>
      productArchitectureService.saveDraft(input, record?.id),
    onSuccess: (data) => {
      queryClient.setQueryData(["productArchitectureRecord"], data);
      toast.success("Draft saved successfully", {
        description: `Architecture record ${data.architectureId} updated.`,
      });
    },
  });

  // Submit for Review Mutation
  const submitMutation = useMutation({
    mutationFn: () => productArchitectureService.submitForReview(record?.id),
    onSuccess: (data) => {
      queryClient.setQueryData(["productArchitectureRecord"], data);
      toast.success("Submitted for Executive Review", {
        description: `Architecture record ${data.architectureId} is now under board review.`,
      });
    },
  });

  // Review Decision Mutation (Approve / Reject / Revision)
  const reviewMutation = useMutation({
    mutationFn: (args: {
      decision: ProductArchitectureApprovalDecision;
      comments?: string;
    }) =>
      productArchitectureService.reviewDecision({
        id: record?.id || "pa-rec-0017",
        ...args,
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["productArchitectureRecord"], data);
      if (variables.decision === "approved") {
        toast.success("Product Architecture Approved!", {
          description: `Downstream System Design project ${data.linkedSystemDesignId || "SYS-2024-0092"} initialized. System Architect notified to proceed.`,
        });
      } else {
        toast.info(`Review Decision Rendered: ${data.status}`, {
          description: `Architecture status set to ${data.status}.`,
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
              Loading Product Architecture...
            </span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Field change helper
  const handleFieldChange = (
    field: keyof ProductArchitectureFormInput,
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
      title="Product Architecture"
      breadcrumb={breadcrumb}
      description="Architect multi-layer system boundaries, hardware interfaces, software stack, and module partitioning."
      tabs={tabs}
    >
      <div className="space-y-6 pb-12">
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
                  Architecture ID
                </span>
                <span className="font-bold text-sm text-foreground">
                  {record.architectureId}
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
                  Architecture Name
                </span>
                <input
                  type="text"
                  value={formInput.architectureName}
                  onChange={(e) =>
                    handleFieldChange("architectureName", e.target.value)
                  }
                  className="font-semibold text-foreground border-b border-dashed border-primary/40 focus:border-primary focus:outline-none bg-transparent"
                />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Version
                </span>
                <span className="font-medium text-foreground">
                  {record.architectureVersion}
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
                  onClick={() => toast.info("Exporting Product Architecture data...")}
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
              {/* Linked PRD Chip */}
              <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-800 rounded-md px-2.5 py-1 font-medium">
                <ClipboardCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Linked PRD:</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/development/research-innovation/prd/new",
                    })
                  }
                  className="font-bold underline hover:text-blue-900 cursor-pointer flex items-center gap-1"
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

              {/* Linked Roadmap Chip */}
              <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 text-indigo-800 rounded-md px-2.5 py-1 font-medium">
                <Map className="h-3.5 w-3.5 text-indigo-600" />
                <span>Linked Product Roadmap:</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/development/research-innovation/product-roadmap/new",
                    })
                  }
                  className="font-bold underline hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                >
                  {record.linkedRoadmapName}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Downstream System Design Chip (if approved) */}
              {record.linkedSystemDesignId && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-2.5 py-1 font-medium animate-in fade-in duration-300">
                  <Workflow className="h-3.5 w-3.5 text-emerald-600" />
                  <span>System Design:</span>
                  <span className="font-bold">{record.linkedSystemDesignId}</span>
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
                <span>System Architect:</span>{" "}
                <span className="font-semibold text-foreground">
                  {record.systemArchitectName}
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
        <ProductArchitectureTabBar
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
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground capitalize">
                  {activeTab.replace("_", " ")} Specifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  This detailed specification view is linked to the primary Product
                  Architecture record ({record.architectureId}). All core metrics
                  and overall system design are aggregated on the Overview tab.
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
                    PANEL 1: Product Architecture Overview
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      Product Architecture Overview
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Style:
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {formInput.architectureStyle}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Architecture Style
                      </label>
                      <input
                        type="text"
                        value={formInput.architectureStyle}
                        onChange={(e) =>
                          handleFieldChange("architectureStyle", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Architecture Vision
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.architectureVision}
                        onChange={(e) =>
                          handleFieldChange("architectureVision", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Architecture Objective
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.architectureObjective}
                        onChange={(e) =>
                          handleFieldChange(
                            "architectureObjective",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Architecture Scope
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.architectureScope}
                        onChange={(e) =>
                          handleFieldChange("architectureScope", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Design Principles
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.designPrinciples.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white border border-border px-2.5 py-1 rounded-md text-xs font-medium text-foreground shadow-2xs"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Overall Architecture Diagram
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-blue-100 text-blue-700">
                            <FileCode className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block text-foreground">
                              {formInput.overallDiagramName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formInput.overallDiagramSize} • Image Blueprint
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDiagramModalOpen(true)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Diagram
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toast.success(
                                `Downloading ${formInput.overallDiagramName}...`,
                              )
                            }
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs"
                            title="Download File"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 2: System Architecture
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      System Architecture
                    </h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Status: {formInput.architectureStatusBadge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        System Name
                      </label>
                      <input
                        type="text"
                        value={formInput.systemName}
                        onChange={(e) =>
                          handleFieldChange("systemName", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Architecture Status
                      </label>
                      <input
                        type="text"
                        value={formInput.architectureStatusBadge}
                        onChange={(e) =>
                          handleFieldChange(
                            "architectureStatusBadge",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        System Components
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.systemComponents}
                        onChange={(e) =>
                          handleFieldChange("systemComponents", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Subsystems
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.subsystems}
                        onChange={(e) =>
                          handleFieldChange("subsystems", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* System Diagram Embedded Viewer Card */}
                    <div className="md:col-span-2 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-primary" />
                          System Architecture Diagram
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDiagramModalOpen(true)}
                            className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground border border-transparent hover:border-slate-200"
                            title="Open Fullscreen"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toast.success("Downloading diagram...")
                            }
                            className="p-1 hover:bg-white rounded text-muted-foreground hover:text-foreground border border-transparent hover:border-slate-200"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div
                        onClick={() => setDiagramModalOpen(true)}
                        className="h-36 rounded-md bg-white border border-slate-200 flex flex-col items-center justify-center p-3 cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-slate-50/50 to-indigo-50/30 group-hover:opacity-80 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                          <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Workflow className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            Interactive System Architecture Diagram
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Click to view functional block layout & interfaces
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        External Interfaces
                      </label>
                      <input
                        type="text"
                        value={formInput.externalInterfaces}
                        onChange={(e) =>
                          handleFieldChange("externalInterfaces", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Internal Interfaces
                      </label>
                      <input
                        type="text"
                        value={formInput.internalInterfaces}
                        onChange={(e) =>
                          handleFieldChange("internalInterfaces", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 3: Hardware Architecture
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      Hardware Architecture
                    </h2>
                    <HardDrive className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Hardware Platform
                      </label>
                      <input
                        type="text"
                        value={formInput.hardwarePlatform}
                        onChange={(e) =>
                          handleFieldChange("hardwarePlatform", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Processing Unit
                      </label>
                      <input
                        type="text"
                        value={formInput.processingUnit}
                        onChange={(e) =>
                          handleFieldChange("processingUnit", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Sensors
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.sensors.map((sensor, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {sensor}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Actuators
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.actuators.map((act, i) => (
                          <span
                            key={i}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Power Electronics
                      </label>
                      <input
                        type="text"
                        value={formInput.powerElectronics}
                        onChange={(e) =>
                          handleFieldChange("powerElectronics", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Communication Interfaces
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.communicationInterfaces.map((iface, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {iface}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Hardware Constraints
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.hardwareConstraints}
                        onChange={(e) =>
                          handleFieldChange(
                            "hardwareConstraints",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 4: Software Architecture
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        4
                      </span>
                      Software Architecture
                    </h2>
                    <CodeIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Software Platform
                      </label>
                      <input
                        type="text"
                        value={formInput.softwarePlatform}
                        onChange={(e) =>
                          handleFieldChange("softwarePlatform", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Operating System
                      </label>
                      <input
                        type="text"
                        value={formInput.operatingSystem}
                        onChange={(e) =>
                          handleFieldChange("operatingSystem", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Firmware Components
                      </label>
                      <input
                        type="text"
                        value={formInput.firmwareComponents}
                        onChange={(e) =>
                          handleFieldChange(
                            "firmwareComponents",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Middleware
                      </label>
                      <input
                        type="text"
                        value={formInput.middleware}
                        onChange={(e) =>
                          handleFieldChange("middleware", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Application Modules
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.applicationModules}
                        onChange={(e) =>
                          handleFieldChange(
                            "applicationModules",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        APIs & Services
                      </label>
                      <input
                        type="text"
                        value={formInput.apisAndServices}
                        onChange={(e) =>
                          handleFieldChange("apisAndServices", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Software Constraints
                      </label>
                      <input
                        type="text"
                        value={formInput.softwareConstraints}
                        onChange={(e) =>
                          handleFieldChange(
                            "softwareConstraints",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 5: Data & Communication Architecture
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        5
                      </span>
                      Data & Communication Architecture
                    </h2>
                    <Radio className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Data Flow
                      </label>
                      <input
                        type="text"
                        value={formInput.dataFlow}
                        onChange={(e) =>
                          handleFieldChange("dataFlow", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Database Technology
                      </label>
                      <input
                        type="text"
                        value={formInput.databaseTechnology}
                        onChange={(e) =>
                          handleFieldChange("databaseTechnology", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Communication Protocols
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.communicationProtocols.map((proto, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded text-xs font-semibold"
                          >
                            {proto}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Cloud Integration
                      </label>
                      <input
                        type="text"
                        value={formInput.cloudIntegration}
                        onChange={(e) =>
                          handleFieldChange("cloudIntegration", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Edge Computing Mode
                      </label>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-input">
                        <span className="text-xs font-medium text-foreground">
                          Edge Anomaly Detection & Buffering
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleFieldChange(
                              "edgeComputing",
                              !formInput.edgeComputing,
                            )
                          }
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            formInput.edgeComputing
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              formInput.edgeComputing
                                ? "translate-x-4.5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 6: Integration & Interoperability
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        6
                      </span>
                      Integration & Interoperability
                    </h2>
                    <Workflow className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        External Systems
                      </label>
                      <input
                        type="text"
                        value={formInput.externalSystems}
                        onChange={(e) =>
                          handleFieldChange("externalSystems", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        ERP Integration
                      </label>
                      <input
                        type="text"
                        value={formInput.erpIntegration}
                        onChange={(e) =>
                          handleFieldChange("erpIntegration", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        API Gateway
                      </label>
                      <input
                        type="text"
                        value={formInput.apiGateway}
                        onChange={(e) =>
                          handleFieldChange("apiGateway", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Standards Compliance
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-md border border-input">
                        {formInput.standardsCompliance.map((std, i) => (
                          <span
                            key={i}
                            className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 7: Security & Compliance Architecture
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        7
                      </span>
                      Security & Compliance Architecture
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Security Risk Score:
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded text-xs">
                        {formInput.securityRiskScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Security Architecture
                      </label>
                      <input
                        type="text"
                        value={formInput.securityArchitecture}
                        onChange={(e) =>
                          handleFieldChange(
                            "securityArchitecture",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Authentication Method
                      </label>
                      <input
                        type="text"
                        value={formInput.authenticationMethod}
                        onChange={(e) =>
                          handleFieldChange(
                            "authenticationMethod",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Authorization Model
                      </label>
                      <input
                        type="text"
                        value={formInput.authorizationModel}
                        onChange={(e) =>
                          handleFieldChange("authorizationModel", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Encryption Standard
                      </label>
                      <input
                        type="text"
                        value={formInput.encryptionStandard}
                        onChange={(e) =>
                          handleFieldChange(
                            "encryptionStandard",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Cybersecurity Controls
                      </label>
                      <textarea
                        rows={2}
                        value={formInput.cybersecurityControls}
                        onChange={(e) =>
                          handleFieldChange(
                            "cybersecurityControls",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 p-2 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 8: Scalability & Performance
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        8
                      </span>
                      Scalability & Performance
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Performance Score:
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded text-xs">
                        {formInput.performanceScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Expected Users / Devices
                      </label>
                      <input
                        type="text"
                        value={formInput.expectedUsersDevices}
                        onChange={(e) =>
                          handleFieldChange(
                            "expectedUsersDevices",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Throughput Target
                      </label>
                      <input
                        type="text"
                        value={formInput.throughput}
                        onChange={(e) =>
                          handleFieldChange("throughput", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Latency Target
                      </label>
                      <input
                        type="text"
                        value={formInput.latencyTarget}
                        onChange={(e) =>
                          handleFieldChange("latencyTarget", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Availability Target
                      </label>
                      <input
                        type="text"
                        value={formInput.availabilityTarget}
                        onChange={(e) =>
                          handleFieldChange(
                            "availabilityTarget",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md border border-input bg-slate-50/50 px-3 py-1.5 text-xs text-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 9: AI Architecture Assessment
                    ------------------------------------------------------------------- */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-sm border border-indigo-700/50">
                  <div className="flex items-center justify-between border-b border-indigo-700/40 pb-3 mb-4">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
                        9
                      </span>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      AI Architecture Assessment
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-indigo-200">
                        AI Overall Score:
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold px-3 py-0.5 rounded-full text-xs">
                        {aiAssessment.aiOverallArchitectureScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Quality
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {aiAssessment.aiArchitectureQuality} / 100
                      </span>
                    </div>
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Scalability
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {aiAssessment.aiScalabilityScore} / 100
                      </span>
                    </div>
                    <div className="bg-indigo-950/60 rounded-lg p-3 border border-indigo-800/40 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">
                        AI Security
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {aiAssessment.aiSecurityAssessment} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-indigo-100">
                    <div className="flex items-start gap-2 bg-indigo-950/40 p-2.5 rounded border border-indigo-800/30">
                      <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-300 block">
                          AI Recommendation:
                        </span>
                        {aiAssessment.aiTechnologyRecommendation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 10: Attachments
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        10
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
                    PANEL 11: Review & Approval Table & Decision
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        11
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
                      Execute Architecture Approval Decision
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Approval Decision
                        </label>
                        <select
                          value={record.approvalDecision || ""}
                          onChange={(e) => {
                            const val = e.target.value as ProductArchitectureApprovalDecision;
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
                            {formInput.reviewComments.length} / 500 characters
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={formInput.reviewComments}
                          onChange={(e) =>
                            handleFieldChange("reviewComments", e.target.value)
                          }
                          placeholder="Provide architectural feedback or approval conditions..."
                          className="w-full rounded-md border border-input bg-white p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------------
                    PANEL 12: System Information & Audit Logs
                    ------------------------------------------------------------------- */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        12
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
                        {record.systemArchitectName}
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
                        {record.systemArchitectName}
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
                  {/* Architecture Summary Score Gauge */}
                  <div className="bg-white rounded-xl border border-border p-5 shadow-xs text-center space-y-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Architecture Summary
                    </h3>
                    <CircularScoreGauge
                      score={summary.overallArchitectureScore}
                    />

                    {/* Breakdown Scores */}
                    <div className="space-y-2 text-left pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Functional Coverage</span>
                          <span className="font-bold text-foreground">
                            {summary.functionalCoverage} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${summary.functionalCoverage}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Technical Readiness</span>
                          <span className="font-bold text-foreground">
                            {summary.technicalReadiness} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${summary.technicalReadiness}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Security Readiness</span>
                          <span className="font-bold text-foreground">
                            {summary.securityReadiness} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${summary.securityReadiness}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                          <span>Integration Readiness</span>
                          <span className="font-bold text-foreground">
                            {summary.integrationReadiness} / 100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${summary.integrationReadiness}%` }}
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
                          toast.success("Generating Architecture Report PDF...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        Generate Architecture Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagramModalOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Layers className="h-4 w-4 text-primary" />
                        View Architecture Diagram
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Opening Interface Control Document...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <FileCode className="h-4 w-4 text-primary" />
                        View Interface Document
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.success("Exporting Architecture Data (JSON/XLSX)...")
                        }
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Download className="h-4 w-4 text-primary" />
                        Export Architecture Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleMeetingOpen(true)}
                        className="w-full flex items-center gap-2.5 p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        Schedule Review Meeting
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

      {/* 1. Fullscreen Diagram Viewer Modal */}
      <Dialog open={diagramModalOpen} onOpenChange={setDiagramModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Workflow className="h-5 w-5 text-primary" />
              System Architecture Diagram — {record.architectureId}
            </DialogTitle>
            <DialogDescription>
              High-resolution functional block blueprint & interface mapping.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-950 rounded-xl p-8 text-white min-h-[400px] flex flex-col items-center justify-center space-y-6 relative overflow-hidden border border-slate-800">
            {/* Visual Diagram Representation */}
            <div className="w-full max-w-2xl border border-slate-700 rounded-lg p-6 bg-slate-900/90 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="font-bold text-sm text-blue-400">
                  Cloud Telemetry Pipeline (AWS IoT)
                </span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  MQTT / HTTPS
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-xs font-semibold">
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  Edge Anomaly Engine
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  STM32H7 Control Unit
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  OCPP 1.6J Protocol Core
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-300">
                <span>Power Module: AC-DC PFC + Isolated DC-DC</span>
                <span>Security: Secure Boot + TLS 1.3</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.success("Diagram downloaded")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Blueprint PNG
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Audit Trail Drawer / Modal */}
      <Dialog
        open={activeAuditModal !== null}
        onOpenChange={(open) => !open && setActiveAuditModal(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {activeAuditModal} Log — {record.architectureId}
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

      {/* 3. Schedule Meeting Modal */}
      <Dialog
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Architecture Review Meeting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                defaultValue={`Review: ${formInput.architectureName}`}
                className="w-full rounded border border-input p-2 text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                defaultValue="2026-07-30T10:00"
                className="w-full rounded border border-input p-2 text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <ErpButton
              variant="primary"
              onClick={() => {
                setScheduleMeetingOpen(false);
                toast.success("Review Meeting Scheduled!", {
                  description: "Invites sent to Architecture Board members.",
                });
              }}
            >
              Send Meeting Invites
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Compare Versions Modal */}
      <Dialog
        open={versionCompareOpen}
        onOpenChange={setVersionCompareOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Compare Version History
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-sm block">Version v0.9 (Draft)</span>
              <p>Style: Monolithic Prototype</p>
              <p>Hardware: STM32F4 MCU</p>
              <p>Overall Score: 74/100</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="font-bold text-sm block text-emerald-900">
                Version v1.0 (Active)
              </span>
              <p>Style: Microservices Architecture</p>
              <p>Hardware: STM32H7 MCU</p>
              <p>Overall Score: 87/100</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
