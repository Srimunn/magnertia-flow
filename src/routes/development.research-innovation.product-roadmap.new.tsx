import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Send,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  User,
  Building2,
  FileText,
  Download,
  Upload,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Layers,
  ArrowRight,
  Calculator,
  ShieldAlert,
  Briefcase,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
  PieChart,
  Award,
  Zap,
  Map,
  FileCheck,
  BrainCircuit,
  Paperclip,
  Eye,
  Trash2,
  FileSpreadsheet,
  Check,
  BarChart2,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AppShell } from "@/components/erp/AppShell";
import { ProductRoadmapTabBar, type ProductRoadmapTabId } from "@/components/erp/ProductRoadmapTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { StarRating } from "@/components/erp/StarRating";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { productRoadmapService } from "@/services";
import { calculateProductRoadmapScores } from "@/lib/productRoadmapFns.server";
import type {
  ProductRoadmapApprovalDecision,
  ProductRoadmapFormInput,
  ProductRoadmapRecord,
  ProductRoadmapStage,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/product-roadmap/new",
)({
  head: () => ({ meta: [{ title: "Product Roadmap Form · Magnertia ERP" }] }),
  component: ProductRoadmapFormPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function CircularScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "text-emerald-500 stroke-emerald-500";
  if (score < 60) scoreColor = "text-amber-500 stroke-amber-500";
  if (score < 40) scoreColor = "text-rose-500 stroke-rose-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle cx="56" cy="56" r="42" className="stroke-muted/30 fill-none" strokeWidth="8" />
        <circle
          cx="56"
          cy="56"
          r="42"
          className={cn("fill-none transition-all duration-1000 ease-out", scoreColor)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-foreground">{score}</span>
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

export function ProductRoadmapFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ProductRoadmapTabId>("overview");
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  // Linked Record Dialog States
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showReleasePlanModal, setShowReleasePlanModal] = useState(false);

  // Quick Action Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewDecisionModal, setShowReviewDecisionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // Committee Review Decision Form State
  const [reviewDecisionChoice, setReviewDecisionChoice] = useState<ProductRoadmapApprovalDecision>("approved");
  const [reviewComments, setReviewComments] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery({
    queryKey: ["productRoadmapRecord"],
    queryFn: () => productRoadmapService.fetchRecord(),
  });

  // Local Form Input State
  const [formInput, setFormInput] = useState<ProductRoadmapFormInput | null>(null);

  // Sync state when record is loaded
  useEffect(() => {
    if (record && !formInput) {
      setFormInput(record.input);
    }
  }, [record, formInput]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (input: ProductRoadmapFormInput) => productRoadmapService.saveDraft(input, record?.id),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productRoadmapRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success("Product roadmap draft saved successfully.");
    },
  });

  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: ProductRoadmapStage) =>
      productRoadmapService.advanceStage(record?.id || "prm-record-0017", targetStage),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productRoadmapRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success(`Stage advanced to ${updatedRecord.currentStageLabel}`);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => productRoadmapService.submitForReview(record?.id || "prm-record-0017"),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productRoadmapRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success("Product roadmap submitted for Executive Review");
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: () =>
      productRoadmapService.reviewDecision({
        id: record?.id || "prm-record-0017",
        decision: reviewDecisionChoice,
        comments: reviewComments,
      }),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productRoadmapRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      setShowReviewDecisionModal(false);
      if (reviewDecisionChoice === "approved" || reviewDecisionChoice === "approved_with_conditions") {
        toast.success(`Roadmap APPROVED! Release Plan ${updatedRecord.linkedReleasePlanId} auto-created.`);
        setShowReleasePlanModal(true);
      } else {
        toast.info(`Committee decision recorded: ${reviewDecisionChoice}`);
      }
    },
  });

  const handleInputChange = <K extends keyof ProductRoadmapFormInput>(
    field: K,
    value: ProductRoadmapFormInput[K]
  ) => {
    if (!formInput) return;
    setFormInput({ ...formInput, [field]: value });
  };

  if (isLoading || !record || !formInput) {
    return (
      <AppShell
        title="Product Roadmap"
        breadcrumb={breadcrumb}
        tabs={tabs}
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const isEditable =
    record.status === "draft" ||
    record.status === "roadmap_planning" ||
    record.status === "resource_technology_planning" ||
    record.status === "risk_business_assessment" ||
    record.status === "revision_required";

  const liveCalculated = calculateProductRoadmapScores(formInput);
  const activeSidebarSummary = liveCalculated.sidebarSummary;
  const activeBusinessImpact = liveCalculated.businessImpact;
  const activeAiInsights = liveCalculated.aiInsights;

  const monthsList = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  return (
    <AppShell
      title="Product Roadmap"
      breadcrumb={breadcrumb}
      description="Track product milestones, release horizons, feature dependencies, and strategic delivery schedules."
      tabs={tabs}
    >
      <div className="space-y-6 pb-12">
        {/* ========================================================================= */}
        {/* 2. RECORD HEADER BAR (Two Rows)                                           */}
        {/* ========================================================================= */}
        <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-muted text-muted-foreground">
                {record.roadmapId}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded bg-muted/60 text-muted-foreground">
                {record.formCode}
              </span>

              {/* Editable Roadmap Name */}
              <input
                type="text"
                value={formInput.roadmapName}
                onChange={(e) => handleInputChange("roadmapName", e.target.value)}
                disabled={!isEditable}
                className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-foreground px-1 py-0.5 rounded transition-colors min-w-[320px]"
              />

              {/* Linked Product Strategy Chip */}
              <button
                type="button"
                onClick={() => setShowStrategyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Target className="h-3.5 w-3.5" />
                <span>Strategy: {formInput.linkedStrategyId}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              {/* Linked Product Chip */}
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{formInput.linkedProductName}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>
            </div>

            {/* Product Line */}
            <div className="text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
              Product Line: <span className="text-foreground">{formInput.productLine}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>BU:</span>
                <span className="font-semibold text-foreground">{formInput.businessUnit}</span>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <img
                  src={record.productManagerAvatar}
                  alt={formInput.productManagerName}
                  className="w-5 h-5 rounded-full object-cover border border-primary/30"
                />
                <span className="text-muted-foreground">PM:</span>
                <span className="font-semibold text-foreground">{formInput.productManagerName}</span>
              </div>

              {/* Roadmap Period Date Picker */}
              <div className="flex items-center gap-2 text-muted-foreground pl-2 border-l border-border">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Period:</span>
                <span className="font-medium text-foreground">{formInput.roadmapPeriodStart} – {formInput.roadmapPeriodEnd}</span>
              </div>

              <StatusBadge status={record.status} />

              {/* Surfaced Linked Release Plan ID */}
              {record.linkedReleasePlanId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <Layers className="h-3.5 w-3.5" />
                  Release Plan: {record.linkedReleasePlanId}
                </span>
              )}
            </div>

            {/* Right-aligned Actions */}
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() => saveDraftMutation.mutate(formInput)}
                disabled={saveDraftMutation.isPending}
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{saveDraftMutation.isPending ? "Saving..." : "Save Draft"}</span>
              </ErpButton>

              {record.status === "executive_review" ? (
                <ErpButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowReviewDecisionModal(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Award className="h-4 w-4" />
                  <span>Committee Review</span>
                </ErpButton>
              ) : (
                <ErpButton
                  variant="primary"
                  size="sm"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit for Review</span>
                </ErpButton>
              )}

              <button
                type="button"
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border bg-background hover:bg-muted"
                title="Overflow Menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Workflow Stage Progress Bar */}
          <div className="pt-3 border-t border-border/50">
            <div className="grid grid-cols-4 gap-2">
              {record.stages.map((stg, idx) => {
                const stageNum = idx + 1;
                return (
                  <button
                    key={stg.stage}
                    type="button"
                    onClick={() => advanceStageMutation.mutate(stg.stage)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs",
                      stg.active
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : stg.completed
                        ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                        stg.active
                          ? "bg-primary text-primary-foreground"
                          : stg.completed
                          ? "bg-emerald-500 text-white"
                          : "bg-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {stg.completed ? "✓" : stageNum}
                    </span>
                    <div className="truncate">
                      <div className="truncate font-medium">{stg.label}</div>
                      {stg.completedAt && (
                        <div className="text-[10px] opacity-75">Done {stg.completedAt}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB CONTROLS & MAIN DASHBOARD CONTENT                                      */}
        {/* ========================================================================= */}
        {activeTab !== "overview" ? (
          <div className="card-soft p-12 bg-card border border-border/80 rounded-xl text-center space-y-4 shadow-sm">
            <Layers className="h-12 w-12 text-primary mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">
              {activeTab === "releases" && "Releases & Timeline Detail View"}
              {activeTab === "features" && "Feature Backlog & Prioritization Matrix"}
              {activeTab === "tech" && "Technology Readiness & R&D Initiatives"}
              {activeTab === "milestones" && "Project Milestones & Dependency Graph"}
              {activeTab === "budget" && "Resource Capacity & Budget Allocation Model"}
              {activeTab === "risks" && "Risk Evaluation & Mitigation Log"}
              {activeTab === "ai_insights" && "AI Deep-Dive Portfolio Recommendations"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This tab is configured in deep-linkable preview mode. Switch back to <strong>Roadmap Overview</strong> to view all 11 combined dashboard panels.
            </p>
            <ErpButton variant="primary" size="sm" onClick={() => setActiveTab("overview")}>
              Return to Roadmap Overview
            </ErpButton>
          </div>
        ) : (
          /* ROADMAP OVERVIEW TAB (11 Functional Panels + Sticky Sidebar) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLUMNS: 11 OVERVIEW PANELS */}
            <div className="lg:col-span-8 space-y-6">

              {/* PANEL 1: Product Vision Alignment */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-base font-bold text-foreground">Product Vision Alignment</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Strategic Alignment:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {formInput.strategicAlignmentScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Product Vision (Inherited from {formInput.linkedStrategyId})
                    </label>
                    <textarea
                      rows={2}
                      value={formInput.productVision}
                      onChange={(e) => handleInputChange("productVision", e.target.value)}
                      disabled={!isEditable}
                      className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Value Proposition</label>
                    <textarea
                      rows={2}
                      value={formInput.valueProposition}
                      onChange={(e) => handleInputChange("valueProposition", e.target.value)}
                      disabled={!isEditable}
                      className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL 2: Product Roadmap Timeline (Gantt-style) */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between border-b border-border/50 pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-base font-bold text-foreground">Product Roadmap Timeline</h3>
                  </div>

                  {/* Year Filter Selector */}
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    {["2024", "2025", "2026", "2027"].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                          selectedYear === yr
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Gantt Timeline */}
                <div className="space-y-3 pt-2 overflow-x-auto">
                  {/* Timeline Header Months */}
                  <div className="grid grid-cols-12 gap-1 border-b pb-2 text-[10px] font-bold text-muted-foreground uppercase text-center min-w-[600px]">
                    {monthsList.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>

                  {/* Timeline Rows */}
                  <div className="space-y-3 min-w-[600px] pt-1">
                    {formInput.releases.map((rel) => (
                      <div key={rel.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rel.color }}></span>
                            {rel.version} — {rel.releaseName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">Target: {rel.targetDate}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1 h-6 bg-muted/30 rounded-lg p-0.5 relative">
                          <div
                            className="h-full rounded-md flex items-center px-2 text-[10px] font-bold text-white shadow-2xs truncate"
                            style={{
                              gridColumnStart: rel.startMonthIdx + 1,
                              gridColumnEnd: `span ${rel.durationMonths}`,
                              backgroundColor: rel.color,
                            }}
                          >
                            {rel.releaseName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PANEL 3: Release Planning Table */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </span>
                    <h3 className="text-base font-bold text-foreground">Release Planning</h3>
                  </div>
                  <button type="button" onClick={() => setActiveTab("releases")} className="text-xs font-semibold text-primary hover:underline">
                    View All Releases
                  </button>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <th className="p-2.5">Version</th>
                      <th className="p-2.5">Release Name</th>
                      <th className="p-2.5">Target Date</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formInput.releases.map((rel) => (
                      <tr key={rel.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-bold text-primary">{rel.version}</td>
                        <td className="p-2.5 font-medium text-foreground">{rel.releaseName}</td>
                        <td className="p-2.5 text-muted-foreground">{rel.targetDate}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            {rel.priority}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <StatusBadge status={rel.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PANEL 4: Top Features */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      4
                    </span>
                    <h3 className="text-base font-bold text-foreground">Top Features ({formInput.features.length})</h3>
                  </div>
                  <button type="button" onClick={() => setActiveTab("features")} className="text-xs font-semibold text-primary hover:underline">
                    View Feature Backlog
                  </button>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <th className="p-2.5">Feature Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Value Rating</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formInput.features.map((feat) => (
                      <tr key={feat.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium text-foreground">{feat.featureName}</td>
                        <td className="p-2.5 text-muted-foreground">{feat.category}</td>
                        <td className="p-2.5">
                          <StarRating value={feat.valueStars * 2} readOnly size="sm" />
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600">
                            {feat.priority}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <StatusBadge status={feat.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PANEL 5: Technology Roadmap */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      5
                    </span>
                    <h3 className="text-base font-bold text-foreground">Technology Roadmap ({formInput.techInitiatives.length})</h3>
                  </div>
                  <button type="button" onClick={() => setActiveTab("tech")} className="text-xs font-semibold text-primary hover:underline">
                    View Tech Initiatives
                  </button>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <th className="p-2.5">Initiative</th>
                      <th className="p-2.5">Area</th>
                      <th className="p-2.5">Readiness</th>
                      <th className="p-2.5">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formInput.techInitiatives.map((tech) => (
                      <tr key={tech.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium text-foreground">{tech.initiative}</td>
                        <td className="p-2.5 text-muted-foreground">{tech.area}</td>
                        <td className="p-2.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              tech.readiness === "High"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {tech.readiness} Readiness
                          </span>
                        </td>
                        <td className="p-2.5 text-muted-foreground font-mono">{tech.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PANEL 6: Resource & Budget (Chart + Metrics) */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      6
                    </span>
                    <h3 className="text-base font-bold text-foreground">Resource & Budget Allocation</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Financial Model Sync</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Recharts Combo Chart */}
                  <div className="md:col-span-2 h-56 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={formInput.resourceBudgetHistory}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar yAxisId="left" dataKey="budgetPlanned" name="Budget Planned" fill="#0A3C75" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="budgetUtilized" name="Budget Utilized" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="utilizationPct" name="Utilization %" stroke="#F59E0B" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Budget Metrics List */}
                  <div className="space-y-3 text-xs bg-muted/20 p-3 rounded-lg border border-border/60">
                    <div className="p-2 rounded bg-card border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Development Budget</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(formInput.devBudget)}</span>
                    </div>

                    <div className="p-2 rounded bg-card border">
                      <span className="text-[10px] text-muted-foreground block font-medium">R&D Investment</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(formInput.rdBudget)}</span>
                    </div>

                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-600 font-medium block">Utilization Rate</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formInput.budgetUtilizationPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 7: Milestones & Dependencies */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      7
                    </span>
                    <h3 className="text-base font-bold text-foreground">Milestones & Dependencies ({formInput.milestones.length})</h3>
                  </div>
                  <button type="button" onClick={() => setActiveTab("milestones")} className="text-xs font-semibold text-primary hover:underline">
                    View Milestones
                  </button>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <th className="p-2.5">Milestone Name</th>
                      <th className="p-2.5">Target Date</th>
                      <th className="p-2.5">Dependency</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formInput.milestones.map((ms) => (
                      <tr key={ms.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium text-foreground">{ms.milestoneName}</td>
                        <td className="p-2.5 text-muted-foreground">{ms.targetDate}</td>
                        <td className="p-2.5 text-primary font-medium">{ms.dependency}</td>
                        <td className="p-2.5">
                          <StatusBadge status={ms.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PANEL 8: Risk Management */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      8
                    </span>
                    <h3 className="text-base font-bold text-foreground">Risk Management</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Overall Risk Score:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {formInput.risks.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border border-border/60">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Strategic Risk</label>
                    <StarRating value={formInput.risks.strategicRisk * 2} readOnly invert size="sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Technical Risk</label>
                    <StarRating value={formInput.risks.technicalRisk * 2} readOnly invert size="sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Market Risk</label>
                    <StarRating value={formInput.risks.marketRisk * 2} readOnly invert size="sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Financial Risk</label>
                    <StarRating value={formInput.risks.financialRisk * 2} readOnly invert size="sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mitigation Strategy</label>
                  <textarea
                    rows={2}
                    value={formInput.risks.mitigationStrategy}
                    onChange={(e) =>
                      handleInputChange("risks", { ...formInput.risks, mitigationStrategy: e.target.value })
                    }
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* PANEL 9: Attachments */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      9
                    </span>
                    <h3 className="text-base font-bold text-foreground">Attachments & Governance Artifacts</h3>
                  </div>
                  <ErpButton variant="outline" size="sm" className="gap-1 text-xs">
                    <Upload className="h-3.5 w-3.5" /> Upload File
                  </ErpButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {formInput.attachments.map((att) => (
                    <div key={att.id} className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col justify-between space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate" title={att.name}>{att.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>{att.size}</span>
                        <div className="flex gap-1">
                          <button type="button" className="p-1 hover:text-primary"><Eye className="h-3 w-3" /></button>
                          <button type="button" className="p-1 hover:text-primary"><Download className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PANEL 10: Review & Approval Matrix */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      10
                    </span>
                    <h3 className="text-base font-bold text-foreground">Executive Review & Approval Matrix</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">5 Key Sign-Off Roles</span>
                </div>

                {/* 5 Executive Reviewers Table */}
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <th className="p-2.5">Executive Role</th>
                      <th className="p-2.5">Person</th>
                      <th className="p-2.5">Decision</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formInput.reviewers.map((rev) => (
                      <tr key={rev.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-bold text-foreground">{rev.role}</td>
                        <td className="p-2.5 text-muted-foreground">{rev.name}</td>
                        <td className="p-2.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              rev.decision === "Approved"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {rev.decision}
                          </span>
                        </td>
                        <td className="p-2.5 text-muted-foreground">{rev.status}</td>
                        <td className="p-2.5 text-muted-foreground font-mono">{rev.date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Review Form Controls */}
                <div className="space-y-3 pt-2 border-t text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Approval Decision</label>
                      <select
                        value={formInput.approvalDecision || "approved"}
                        onChange={(e) => handleInputChange("approvalDecision", e.target.value as ProductRoadmapApprovalDecision)}
                        disabled={!isEditable}
                        className="w-full p-2.5 text-xs rounded-lg border border-border bg-background"
                      >
                        <option value="approved">Approved (Proceed to Product Development)</option>
                        <option value="approved_with_conditions">Approved with Conditions</option>
                        <option value="revision_required">Revision Required</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Approval Date</label>
                      <input
                        type="date"
                        value={formInput.approvalDate}
                        onChange={(e) => handleInputChange("approvalDate", e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-2 text-xs rounded-lg border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-medium text-muted-foreground">Review Comments</label>
                      <span className="text-[10px] text-muted-foreground">{formInput.reviewComments.length} / 2000 chars</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={formInput.reviewComments}
                      onChange={(e) => handleInputChange("reviewComments", e.target.value)}
                      disabled={!isEditable}
                      className="w-full p-2.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL 11: System Information */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      11
                    </span>
                    <h3 className="text-base font-bold text-foreground">System Information & Governance Audit</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Version {record.version}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Created By</span>
                    <span className="font-semibold text-foreground">{formInput.productManagerName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Date Created</span>
                    <span className="font-semibold text-foreground">{record.dateCreated}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Last Modified</span>
                    <span className="font-semibold text-foreground">{record.lastModified}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Stage</span>
                    <StatusBadge status={record.status} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 text-xs border-t">
                  <button type="button" onClick={() => setShowAuditModal(true)} className="flex items-center gap-1 text-primary hover:underline font-medium">
                    <History className="h-3.5 w-3.5" /> Audit Trail (View Log)
                  </button>
                  <button type="button" onClick={() => setShowActivityModal(true)} className="flex items-center gap-1 text-primary hover:underline font-medium">
                    <Activity className="h-3.5 w-3.5" /> Activity History
                  </button>
                  <button type="button" onClick={() => setShowWorkflowModal(true)} className="flex items-center gap-1 text-primary hover:underline font-medium">
                    <Layers className="h-3.5 w-3.5" /> Workflow History
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT 4 COLUMNS: STICKY SIDEBAR PANEL */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

              {/* OVERALL ROADMAP SCORE */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Overall Roadmap Score</h3>

                <div className="flex flex-col items-center justify-center py-2">
                  <CircularScoreGauge score={activeSidebarSummary.overallScore} />
                  <span className="text-xs font-semibold text-foreground mt-2">Weighted Execution Score</span>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-muted-foreground">Strategic Progress</span>
                      <span className="text-foreground font-semibold">{activeSidebarSummary.strategicProgress}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${activeSidebarSummary.strategicProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-muted-foreground">Product Readiness</span>
                      <span className="text-foreground font-semibold">{activeSidebarSummary.productReadiness}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeSidebarSummary.productReadiness}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-muted-foreground">Innovation Progress</span>
                      <span className="text-foreground font-semibold">{activeSidebarSummary.innovationProgress}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeSidebarSummary.innovationProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-muted-foreground">Budget Health</span>
                      <span className="text-foreground font-semibold">{activeSidebarSummary.budgetHealth}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeSidebarSummary.budgetHealth}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS IMPACT */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Business Impact (Target Year)</h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/30 border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Projected Revenue</span>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(activeBusinessImpact.projectedRevenue)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">{activeBusinessImpact.revenueYoYDelta}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Gross Margin %</span>
                    <div className="text-base font-bold text-foreground">{activeBusinessImpact.grossMarginPct}%</div>
                    <span className="text-[10px] text-blue-600 font-semibold">{activeBusinessImpact.marginYoYDelta}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Target Market Share</span>
                    <div className="text-base font-bold text-primary">{activeBusinessImpact.marketSharePct}%</div>
                    <span className="text-[10px] text-primary font-semibold">{activeBusinessImpact.marketShareYoYDelta}</span>
                  </div>
                </div>
              </div>

              {/* AI INSIGHTS */}
              <div className="card-soft p-5 bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">AI Roadmap Insights</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-card border text-xs">
                    <span className="text-[10px] text-muted-foreground block">AI Release Priority</span>
                    <span className="text-lg font-bold text-primary">{activeAiInsights.aiReleasePriorityScore}/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border text-xs">
                    <span className="text-[10px] text-muted-foreground block">AI Confidence Score</span>
                    <span className="text-lg font-bold text-emerald-600">{activeAiInsights.aiRoadmapConfidenceScore}/100</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-primary block">AI Key Recommendations:</span>
                  {activeAiInsights.aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-2 rounded bg-card/80 border text-muted-foreground leading-relaxed flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-3 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Quick Actions</h3>

                <div className="space-y-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Generate Roadmap Report</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReleasePlanModal(true)}
                    disabled={record.status !== "approved" && record.status !== "approved_with_conditions"}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg border font-medium transition-colors",
                      record.linkedReleasePlanId
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : record.status === "approved" || record.status === "approved_with_conditions"
                        ? "border-border bg-background hover:bg-muted text-foreground"
                        : "border-border/50 bg-muted/40 text-muted-foreground cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-500" />
                      <span>
                        {record.linkedReleasePlanId
                          ? `Release Plan (${record.linkedReleasePlanId})`
                          : "Create Release Plan"}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("features")}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>View Feature Backlog</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-rose-500" />
                      <span>Schedule Review Meeting</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* DIALOGS */}
      {/* Linked Strategy Dialog */}
      <Dialog open={showStrategyModal} onOpenChange={setShowStrategyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Linked Product Strategy: {formInput.linkedStrategyId}</span>
            </DialogTitle>
            <DialogDescription>Product Strategy Master Record</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Strategy Name:</span>
              <span className="font-semibold text-foreground">{formInput.linkedStrategyName}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Strategy Status:</span>
              <StatusBadge status="approved" />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Alignment Score:</span>
              <span className="font-bold text-emerald-600">{formInput.strategicAlignmentScore}/100</span>
            </div>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowStrategyModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Release Plan Dialog */}
      <Dialog open={showReleasePlanModal} onOpenChange={setShowReleasePlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-500" />
              <span>Linked Release Plan</span>
            </DialogTitle>
            <DialogDescription>
              {record.linkedReleasePlanId
                ? `Release Plan Record: ${record.linkedReleasePlanId}`
                : "Release Plan is auto-created upon Executive Approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            {record.linkedReleasePlanId ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Release Plan <span className="font-bold">{record.linkedReleasePlanId}</span> is active and published to Development teams.
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                Product Roadmap is currently in <span className="font-bold">{record.status}</span> status. Submit to Executive Committee and gain Approval to automatically generate the Release Plan.
              </div>
            )}
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowReleasePlanModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Committee Decision Modal */}
      <Dialog open={showReviewDecisionModal} onOpenChange={setShowReviewDecisionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Executive Committee Roadmap Decision</span>
            </DialogTitle>
            <DialogDescription>
              Evaluate Product Roadmap {record.roadmapId} and issue official committee decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewDecisionChoice("approved")}
                className={cn(
                  "p-3 rounded-lg border text-left flex flex-col justify-between transition-all",
                  reviewDecisionChoice === "approved"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>1. Approved</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Auto-creates Release Plan RLP-2024-XXXX</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecisionChoice("approved_with_conditions")}
                className={cn(
                  "p-3 rounded-lg border text-left flex flex-col justify-between transition-all",
                  reviewDecisionChoice === "approved_with_conditions"
                    ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/30"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>2. Conditions</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Approved with Priority updates</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecisionChoice("revision_required")}
                className={cn(
                  "p-3 rounded-lg border text-left flex flex-col justify-between transition-all",
                  reviewDecisionChoice === "revision_required"
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/30"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>3. Revision</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Returns for budget/feature updates</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecisionChoice("rejected")}
                className={cn(
                  "p-3 rounded-lg border text-left flex flex-col justify-between transition-all",
                  reviewDecisionChoice === "rejected"
                    ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-500/30"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <X className="h-4 w-4 text-rose-600" />
                  <span>4. Rejected</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Archives roadmap record</span>
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-medium text-muted-foreground">Committee Comments & Notes</label>
                <span className="text-[10px] text-muted-foreground">{reviewComments.length} / 2000</span>
              </div>
              <textarea
                rows={3}
                maxLength={2000}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter executive review notes, conditions, or required changes..."
                className="w-full p-2.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowReviewDecisionModal(false)}>
              Cancel
            </ErpButton>
            <ErpButton
              variant="primary"
              size="sm"
              onClick={() => reviewDecisionMutation.mutate()}
              disabled={reviewDecisionMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Submit Committee Decision
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Modal */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              <span>Audit Trail & Governance Log</span>
            </DialogTitle>
            <DialogDescription>Complete immutable event history for Product Roadmap {record.roadmapId}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1 pt-2">
            {record.auditTrail.map((entry) => (
              <div key={entry.id} className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                <div className="flex justify-between items-center text-muted-foreground font-mono text-[11px]">
                  <span>{entry.timestamp}</span>
                  <span className="font-semibold text-foreground">{entry.user}</span>
                </div>
                <div className="font-bold text-primary">{entry.action}</div>
                <p className="text-muted-foreground leading-relaxed">{entry.details}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <ErpButton variant="primary" size="sm" onClick={() => setShowAuditModal(false)}>Close</ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity History Modal */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Activity History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs pt-2">
            <p className="text-muted-foreground">• 2024-04-26: Submitted for Executive Review by Vikram Sharma.</p>
            <p className="text-muted-foreground">• 2024-04-24: Risk Assessment score calculated (32/100).</p>
            <p className="text-muted-foreground">• 2024-04-22: Roadmap Planning stage completed.</p>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowActivityModal(false)}>Close</ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow History Modal */}
      <Dialog open={showWorkflowModal} onOpenChange={setShowWorkflowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              <span>Workflow History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs pt-2">
            <p className="text-muted-foreground">• Stage 1 (Roadmap Planning): Completed 2024-04-22</p>
            <p className="text-muted-foreground">• Stage 2 (Resource & Technology): Completed 2024-04-24</p>
            <p className="text-muted-foreground">• Stage 3 (Risk & Business): Completed 2024-04-26</p>
            <p className="text-muted-foreground font-bold text-primary">• Stage 4 (Executive Review): Currently Active</p>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowWorkflowModal(false)}>Close</ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
