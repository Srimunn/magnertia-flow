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
  FileSpreadsheet,
  Download,
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
  MapPin,
  FileCheck,
  BrainCircuit,
  Bot,
  HelpCircle,
  Share2,
  Printer,
  Copy,
  Trash2,
  Map,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ProductStrategyTabBar } from "@/components/erp/ProductStrategyTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { StarRating } from "@/components/erp/StarRating";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { productStrategyService } from "@/services";
import { calculateProductStrategyScores } from "@/lib/productStrategyFns.server";
import type {
  ProductStrategyApprovalDecision,
  ProductStrategyFormInput,
  ProductStrategyRecord,
  ProductStrategyStage,
  ProductStrategyStatus,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/product-strategy/new",
)({
  head: () => ({ meta: [{ title: "Product Strategy Form · Magnertia ERP" }] }),
  component: ProductStrategyFormPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function TagInput({
  tags,
  onChange,
  placeholder = "Add tag and press Enter...",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-primary/70 hover:text-primary rounded-full focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-0 text-sm focus:outline-none min-w-[140px] px-1"
        />
      </div>
    </div>
  );
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

export function ProductStrategyFormPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Dialog States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCommercializationModal, setShowCommercializationModal] = useState(false);
  const [showBusinessPlanModal, setShowBusinessPlanModal] = useState(false);

  // Quick Action Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAIInsightsDrawer, setShowAIInsightsDrawer] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewDecisionModal, setShowReviewDecisionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Executive Review Decision Form State
  const [reviewDecisionChoice, setReviewDecisionChoice] = useState<ProductStrategyApprovalDecision>("approved");
  const [reviewComments, setReviewComments] = useState("");

  // Data Fetching
  const { data: record, isLoading } = useQuery({
    queryKey: ["productStrategyRecord"],
    queryFn: () => productStrategyService.fetchRecord(),
  });

  // Local Form Input State
  const [formInput, setFormInput] = useState<ProductStrategyFormInput | null>(null);

  // Sync state when record is loaded
  useEffect(() => {
    if (record && !formInput) {
      setFormInput(record.input);
    }
  }, [record, formInput]);

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: ProductStrategyFormInput) => productStrategyService.saveDraft(input, record?.id),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productStrategyRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success("Product strategy draft saved successfully.");
    },
    onError: (err: Error) => {
      toast.error(`Failed to save draft: ${err.message}`);
    },
  });

  // Advance Stage Mutation
  const advanceStageMutation = useMutation({
    mutationFn: (targetStage: ProductStrategyStage) =>
      productStrategyService.advanceStage(record?.id || "ps-record-0017", targetStage),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productStrategyRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success(`Stage advanced to ${updatedRecord.currentStageLabel}`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to advance stage: ${err.message}`);
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => productStrategyService.submitForReview(record?.id || "ps-record-0017"),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productStrategyRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      toast.success("Product strategy submitted for Executive Committee Review");
    },
    onError: (err: Error) => {
      toast.error(`Failed to submit for review: ${err.message}`);
    },
  });

  // Review Decision Mutation
  const reviewDecisionMutation = useMutation({
    mutationFn: () =>
      productStrategyService.reviewDecision({
        id: record?.id || "ps-record-0017",
        decision: reviewDecisionChoice,
        comments: reviewComments,
      }),
    onSuccess: (updatedRecord) => {
      queryClient.setQueryData(["productStrategyRecord"], updatedRecord);
      setFormInput(updatedRecord.input);
      setShowReviewDecisionModal(false);
      if (reviewDecisionChoice === "approved") {
        toast.success(`Strategy APPROVED! Linked Product Roadmap ${updatedRecord.linkedProductRoadmapId} auto-created.`);
        setShowRoadmapModal(true);
      } else if (reviewDecisionChoice === "revision_required") {
        toast.info("Strategy returned for Revision. Product Manager notified to update specific sections.");
      } else if (reviewDecisionChoice === "additional_investigation") {
        toast.info("Strategy returned for Additional Investigation. Gaps noted for market research.");
      } else if (reviewDecisionChoice === "rejected") {
        toast.error("Strategy REJECTED. Record archived and PM notified.");
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to submit committee decision: ${err.message}`);
    },
  });

  const handleInputChange = <K extends keyof ProductStrategyFormInput>(
    field: K,
    value: ProductStrategyFormInput[K]
  ) => {
    if (!formInput) return;
    setFormInput({ ...formInput, [field]: value });
  };

  const handleSaveDraft = () => {
    if (formInput) {
      saveDraftMutation.mutate(formInput);
    }
  };

  if (isLoading || !record || !formInput) {
    return (
      <AppShell
        title="Product Strategy"
        breadcrumb="Development > Research & Innovation Development > Product Strategy > Product Strategy Form"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const isEditable =
    record.status === "draft" ||
    record.status === "strategic_vision" ||
    record.status === "market_portfolio_strategy" ||
    record.status === "financial_innovation_strategy" ||
    record.status === "revision_required" ||
    record.status === "additional_investigation";

  const liveCalculated = calculateProductStrategyScores(formInput);
  const activeSidebarSummary = liveCalculated.sidebarSummary;
  const activeAiAssessment = liveCalculated.aiAssessment;
  const activeKeyMetrics = liveCalculated.keyMetrics;

  return (
    <AppShell
      title="Product Strategy"
      breadcrumb={breadcrumb}
      description="Formulate executive product strategy, market positioning, financial ROI, and strategic investment roadmap."
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
                {record.strategyId}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded bg-muted/60 text-muted-foreground">
                {record.formCode}
              </span>

              {/* Editable Strategy Name */}
              <input
                type="text"
                value={formInput.strategyName}
                onChange={(e) => handleInputChange("strategyName", e.target.value)}
                disabled={!isEditable}
                className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-foreground px-1 py-0.5 rounded transition-colors min-w-[280px]"
              />

              {/* Linked Product Chip */}
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{formInput.linkedProductName}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              {/* Linked Commercialization Plan Chip */}
              <button
                type="button"
                onClick={() => setShowCommercializationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>{formInput.linkedCommercializationCode}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>
            </div>

            {/* Date-Range Picker (Strategy Period) */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Strategy Period:</span>
              <span>{formInput.strategyPeriodStart} – {formInput.strategyPeriodEnd}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
            <div className="flex items-center flex-wrap gap-4">
              {/* Linked Business Plan Chip */}
              <button
                type="button"
                onClick={() => setShowBusinessPlanModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>{formInput.linkedBusinessPlanCode}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              {/* Business Unit */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Business Unit:</span>
                <span className="font-semibold text-foreground">{formInput.businessUnit}</span>
              </div>

              {/* Product Manager */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <img
                  src={record.productManagerAvatar}
                  alt={formInput.productManagerName}
                  className="w-5 h-5 rounded-full object-cover border border-primary/30"
                />
                <span className="text-muted-foreground">PM:</span>
                <span className="font-semibold text-foreground">{formInput.productManagerName}</span>
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-3 text-muted-foreground pl-2 border-l border-border">
                <span>Created: {record.dateCreated}</span>
                <span>Modified: {record.lastModified}</span>
              </div>

              {/* Status Badge */}
              <StatusBadge status={record.status} />

              {/* Surfaced Linked Product Roadmap ID if approved */}
              {record.linkedProductRoadmapId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <Map className="h-3.5 w-3.5" />
                  Roadmap: {record.linkedProductRoadmapId}
                </span>
              )}
            </div>

            {/* Right-aligned Header Actions */}
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
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

          {/* Workflow Stage Progress Bar (4 Stages) */}
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
        {/* MAIN BODY: 8 FORM SECTIONS + STICKY RIGHT SIDEBAR                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLUMNS: FORM SECTIONS 1 TO 8 */}
          <div className="lg:col-span-8 space-y-6">

            {/* SECTION 1: Product Vision */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-base font-bold text-foreground">Product Vision</h3>
                </div>
                <span className="text-xs text-muted-foreground">Strategic Intent & Core Identity</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Vision</label>
                  <textarea
                    rows={3}
                    value={formInput.productVision}
                    onChange={(e) => handleInputChange("productVision", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe the long-term vision of this product..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mission Statement</label>
                  <textarea
                    rows={2}
                    value={formInput.missionStatement}
                    onChange={(e) => handleInputChange("missionStatement", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Core mission of the product development effort..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Strategic Objectives</label>
                    <textarea
                      rows={3}
                      value={formInput.strategicObjectives}
                      onChange={(e) => handleInputChange("strategicObjectives", e.target.value)}
                      disabled={!isEditable}
                      className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Measurable objectives over the strategy period..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Value Proposition</label>
                    <textarea
                      rows={3}
                      value={formInput.valueProposition}
                      onChange={(e) => handleInputChange("valueProposition", e.target.value)}
                      disabled={!isEditable}
                      className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Primary value proposition for customers and partners..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Target Customers (Tags)</label>
                  <TagInput
                    tags={formInput.targetCustomers}
                    onChange={(tags) => handleInputChange("targetCustomers", tags)}
                    placeholder="Add target customer segment (e.g. Fleet Managers)..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Market Strategy */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-base font-bold text-foreground">Market Strategy</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Market Opportunity Score:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {activeSidebarSummary.marketReadiness}/100
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Market Segments (Tags)</label>
                  <TagInput
                    tags={formInput.marketSegments}
                    onChange={(tags) => handleInputChange("marketSegments", tags)}
                    placeholder="Add market segment..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Personas</label>
                  <textarea
                    rows={3}
                    value={formInput.customerPersonas}
                    onChange={(e) => handleInputChange("customerPersonas", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                    placeholder="Fleet Manager, Facility Manager, EV Owner, Government Operator details..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Journey</label>
                  <textarea
                    rows={2}
                    value={formInput.customerJourney}
                    onChange={(e) => handleInputChange("customerJourney", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Key customer touchpoints and deployment lifecycle..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Product Portfolio Strategy */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-base font-bold text-foreground">Product Portfolio Strategy</h3>
                </div>
                <span className="text-xs text-muted-foreground">Category Alignment & Positioning</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Category</label>
                  <select
                    value={formInput.productCategory}
                    onChange={(e) => handleInputChange("productCategory", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="EV Charging Infrastructure">EV Charging Infrastructure</option>
                    <option value="Battery Energy Storage">Battery Energy Storage</option>
                    <option value="Autonomous Fleet Systems">Autonomous Fleet Systems</option>
                    <option value="Grid Power Management">Grid Power Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Line</label>
                  <input
                    type="text"
                    value={formInput.productLine}
                    onChange={(e) => handleInputChange("productLine", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Growth Potential</label>
                  <div className="pt-1.5">
                    <StarRating
                      value={Math.round(formInput.growthPotential * 2)}
                      onChange={(v) => handleInputChange("growthPotential", v / 2)}
                      readOnly={!isEditable}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Portfolio Role</label>
                  <select
                    value={formInput.portfolioRole}
                    onChange={(e) => handleInputChange("portfolioRole", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Core Flagship Growth Engine">Core Flagship Growth Engine</option>
                    <option value="Strategic High-Growth Bet">Strategic High-Growth Bet</option>
                    <option value="Cash Generator / Stable Line">Cash Generator / Stable Line</option>
                    <option value="Emerging Prototype Innovation">Emerging Prototype Innovation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Lifecycle Stage</label>
                  <select
                    value={formInput.productLifecycleStage}
                    onChange={(e) => handleInputChange("productLifecycleStage", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Concept & Ideation">Concept & Ideation</option>
                    <option value="Development & Scaling">Development & Scaling</option>
                    <option value="Growth Phase">Growth Phase</option>
                    <option value="Maturity Phase">Maturity Phase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Portfolio Priority</label>
                  <select
                    value={formInput.portfolioPriority}
                    onChange={(e) => handleInputChange("portfolioPriority", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="P1 - Critical Priority">P1 - Critical Priority</option>
                    <option value="P2 - High Priority">P2 - High Priority</option>
                    <option value="P3 - Medium Priority">P3 - Medium Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: Innovation Strategy */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    4
                  </span>
                  <h3 className="text-base font-bold text-foreground">Innovation Strategy</h3>
                </div>
                <span className="text-xs text-muted-foreground">Technology & Sustainability Differentiation</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Emerging Technologies (Tags)</label>
                  <TagInput
                    tags={formInput.emergingTechnologies}
                    onChange={(tags) => handleInputChange("emergingTechnologies", tags)}
                    placeholder="Add technology (e.g. Edge Computing, V2G)..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">AI-based Innovations</label>
                  <textarea
                    rows={2}
                    value={formInput.aiBasedInnovations}
                    onChange={(e) => handleInputChange("aiBasedInnovations", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe specific AI/ML algorithms, cloud telemetry, or intelligent features..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Energy Strategy (Tags)</label>
                    <TagInput
                      tags={formInput.energyStrategy}
                      onChange={(tags) => handleInputChange("energyStrategy", tags)}
                      placeholder="Add energy strategy tag..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">ESG Alignment</label>
                    <div className="pt-2">
                      <StarRating
                        value={Math.round(formInput.esgAlignment * 2)}
                        onChange={(v) => handleInputChange("esgAlignment", v / 2)}
                        readOnly={!isEditable}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: Business Strategy */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    5
                  </span>
                  <h3 className="text-base font-bold text-foreground">Business Strategy</h3>
                </div>
                <span className="text-xs text-muted-foreground">Monetization & Competitive Advantage</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Business Model</label>
                  <select
                    value={formInput.businessModel}
                    onChange={(e) => handleInputChange("businessModel", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="B2B Enterprise + Hardware-as-a-Service (HaaS)">B2B Enterprise + HaaS</option>
                    <option value="B2C Direct Channel">B2C Direct Channel</option>
                    <option value="SaaS Hardware-plus-Software Suite">SaaS Hardware-plus-Software Suite</option>
                    <option value="Turnkey Operator Licensing">Turnkey Operator Licensing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Competitive Positioning</label>
                  <div className="pt-1.5">
                    <StarRating
                      value={Math.round(formInput.competitivePositioning * 2)}
                      onChange={(v) => handleInputChange("competitivePositioning", v / 2)}
                      readOnly={!isEditable}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Market Opportunity Size (TAM)</label>
                  <input
                    type="number"
                    value={formInput.marketOpportunitySize}
                    onChange={(e) => handleInputChange("marketOpportunitySize", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Revenue Model Details</label>
                  <textarea
                    rows={2}
                    value={formInput.revenueModel}
                    onChange={(e) => handleInputChange("revenueModel", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Key Partnerships (Tags)</label>
                  <TagInput
                    tags={formInput.keyPartnerships}
                    onChange={(tags) => handleInputChange("keyPartnerships", tags)}
                    placeholder="Add key ecosystem partner..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: Financial Strategy */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    6
                  </span>
                  <h3 className="text-base font-bold text-foreground">Financial Strategy</h3>
                </div>
                <span className="text-xs text-muted-foreground">Capex, Opex & 3-Year Projection</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Investment Budget (3 Years)</label>
                  <input
                    type="number"
                    value={formInput.investmentBudget3Y}
                    onChange={(e) => handleInputChange("investmentBudget3Y", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">{formatCurrency(formInput.investmentBudget3Y)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Development Cost</label>
                  <input
                    type="number"
                    value={formInput.developmentCost}
                    onChange={(e) => handleInputChange("developmentCost", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">{formatCurrency(formInput.developmentCost)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Revenue Forecast (3 Years)</label>
                  <input
                    type="number"
                    value={formInput.revenueForecast}
                    onChange={(e) => handleInputChange("revenueForecast", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">{formatCurrency(formInput.revenueForecast)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Gross Margin (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formInput.grossMargin}
                    onChange={(e) => handleInputChange("grossMargin", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Break-even Period (Months)</label>
                  <input
                    type="number"
                    value={formInput.breakevenPeriodMonths}
                    onChange={(e) => handleInputChange("breakevenPeriodMonths", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">ROI (Years)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formInput.roiYears}
                    onChange={(e) => handleInputChange("roiYears", Number(e.target.value))}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pricing Strategy</label>
                <textarea
                  rows={2}
                  value={formInput.pricingStrategy}
                  onChange={(e) => handleInputChange("pricingStrategy", e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* SECTION 7: Risk & Compliance */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    7
                  </span>
                  <h3 className="text-base font-bold text-foreground">Risk & Compliance</h3>
                </div>
                <span className="text-xs text-muted-foreground">Governance, Risk Ratings & Regulatory Audits</span>
              </div>

              {/* 5 Risk Star Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Technical Risk</label>
                  <StarRating
                    value={Math.round(formInput.technicalRisk * 2)}
                    onChange={(v) => handleInputChange("technicalRisk", v / 2)}
                    readOnly={!isEditable}
                    invert
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Market Risk</label>
                  <StarRating
                    value={Math.round(formInput.marketRisk * 2)}
                    onChange={(v) => handleInputChange("marketRisk", v / 2)}
                    readOnly={!isEditable}
                    invert
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Financial Risk</label>
                  <StarRating
                    value={Math.round(formInput.financialRisk * 2)}
                    onChange={(v) => handleInputChange("financialRisk", v / 2)}
                    readOnly={!isEditable}
                    invert
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Regulatory Risk</label>
                  <StarRating
                    value={Math.round(formInput.regulatoryRisk * 2)}
                    onChange={(v) => handleInputChange("regulatoryRisk", v / 2)}
                    readOnly={!isEditable}
                    invert
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Cyber Risk</label>
                  <StarRating
                    value={Math.round(formInput.cybersecurityRisk * 2)}
                    onChange={(v) => handleInputChange("cybersecurityRisk", v / 2)}
                    readOnly={!isEditable}
                    invert
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mitigation Strategy</label>
                  <textarea
                    rows={2}
                    value={formInput.mitigationStrategy}
                    onChange={(e) => handleInputChange("mitigationStrategy", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Compliance Status</label>
                  <select
                    value={formInput.complianceStatus}
                    onChange={(e) => handleInputChange("complianceStatus", e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Compliant & Pre-Certified">Compliant & Pre-Certified</option>
                    <option value="Under Regulatory Audit">Under Regulatory Audit</option>
                    <option value="Pending Interconnect Certification">Pending Interconnect Certification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Compliance Comment</label>
                <input
                  type="text"
                  value={formInput.complianceComment}
                  onChange={(e) => handleInputChange("complianceComment", e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* SECTION 8: AI Product Strategy Assessment */}
            <div className="card-soft p-5 bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    8
                  </span>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">AI Product Strategy Assessment</h3>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  Calculated Output Engine
                </span>
              </div>

              {/* 4 AI Score Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border shadow-2xs text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">AI Market Opportunity</span>
                  <span className="text-xl font-bold text-primary">{activeAiAssessment.aiMarketOpportunityScore}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border shadow-2xs text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">AI Differentiation</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeAiAssessment.aiProductDifferentiationScore}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border shadow-2xs text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">AI Revenue Prediction</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{activeAiAssessment.aiRevenuePredictionScore}/100</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border shadow-2xs text-center space-y-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">AI Competitive Position</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{activeAiAssessment.aiCompetitivePositionScore}/100</span>
                </div>
              </div>

              {/* Generated Text Blocks */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-card/80 border border-border/80">
                  <span className="font-semibold text-primary block mb-1">AI Strategic Recommendations:</span>
                  <p className="text-muted-foreground leading-relaxed">{activeAiAssessment.aiStrategicRecommendations}</p>
                </div>

                <div className="p-3 rounded-lg bg-card/80 border border-border/80">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">AI Emerging Opportunity:</span>
                  <p className="text-muted-foreground leading-relaxed">{activeAiAssessment.aiEmergingOpportunity}</p>
                </div>

                <div className="p-3 rounded-lg bg-card/80 border border-border/80">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">AI Risk Prediction:</span>
                  <p className="text-muted-foreground leading-relaxed">{activeAiAssessment.aiRiskPrediction}</p>
                </div>

                {/* AI Recommendation Callout */}
                <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-primary block">AI Recommendation</span>
                      <span className="text-sm font-bold text-foreground">{activeAiAssessment.aiRecommendation}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-primary text-primary-foreground">
                    Recommended Move
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: STICKY SIDEBAR PANEL */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

            {/* STRATEGY SUMMARY (Gauge + Breakdown) */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Strategy Summary</h3>
              
              <div className="flex flex-col items-center justify-center py-2">
                <CircularScoreGauge score={activeSidebarSummary.overallScore} />
                <span className="text-xs font-semibold text-foreground mt-2">Overall Strategy Score</span>
              </div>

              <div className="space-y-3 pt-2 border-t border-border/40 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-muted-foreground">Market Readiness</span>
                    <span className="text-foreground font-semibold">{activeSidebarSummary.marketReadiness}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${activeSidebarSummary.marketReadiness}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-muted-foreground">Innovation Score</span>
                    <span className="text-foreground font-semibold">{activeSidebarSummary.innovationScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeSidebarSummary.innovationScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-muted-foreground">Financial Score</span>
                    <span className="text-foreground font-semibold">{activeSidebarSummary.financialScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeSidebarSummary.financialScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-muted-foreground">Strategic Score</span>
                    <span className="text-foreground font-semibold">{activeSidebarSummary.strategicScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeSidebarSummary.strategicScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* KEY METRICS (6 Tiles) */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Key Metrics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">TAM</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(activeKeyMetrics.tam)}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Projected Revenue</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(activeKeyMetrics.projectedRevenue)}</span>
                  <span className="text-[9px] text-muted-foreground block">{activeKeyMetrics.timeframe}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Gross Margin</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{activeKeyMetrics.grossMargin}%</span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Expected ROI</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{activeKeyMetrics.expectedRoi}%</span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Break-even</span>
                  <span className="text-sm font-bold text-foreground">{activeKeyMetrics.breakevenMonths} Mos</span>
                </div>

                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-[10px] text-primary uppercase font-bold block">Status Callout</span>
                  <span className="text-xs font-bold text-foreground leading-tight block truncate" title={activeKeyMetrics.aiRecommendation}>
                    {activeKeyMetrics.aiRecommendation}
                  </span>
                </div>
              </div>
            </div>

            {/* RECOMMENDATION CALLOUT */}
            <div className="card-soft p-4 bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Committee Action Recommendation
                </span>
              </div>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {record.status === "approved"
                  ? "Strategy Approved! Product Manager is authorized to proceed to Product Development and publish the Product Roadmap."
                  : record.status === "executive_review"
                  ? "Under Executive Committee Review. All stage criteria passed with overall score " + activeSidebarSummary.overallScore + "/100."
                  : "Complete required form sections and advance to Stage 4 for committee evaluation."}
              </p>
            </div>

            {/* QUICK ACTIONS (6 Actions + Audit Trail) */}
            <div className="card-soft p-5 bg-card border border-border/80 rounded-xl space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Quick Actions</h3>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Generate Strategy Report</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAIInsightsDrawer(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>AI Strategy Insights</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowRoadmapModal(true)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors text-left font-medium",
                    record.linkedProductRoadmapId
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-background hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-blue-500" />
                    <span>
                      {record.linkedProductRoadmapId
                        ? `Product Roadmap (${record.linkedProductRoadmapId})`
                        : "Create Product Roadmap"}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowFinancialModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-amber-500" />
                    <span>Financial Projection Model</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMarketModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>Market Research Summary</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span>Schedule Review Meeting</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-indigo-500" />
                    <span>Audit Trail & Governance Log</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIALOGS & POPUPS FOR LINKED RECORDS                                      */}
      {/* ========================================================================= */}

      {/* Linked Product Dialog */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Linked Product: Smart EV Charger Pro</span>
            </DialogTitle>
            <DialogDescription>Product Master Record (PRD-1001)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Product Code:</span>
              <span className="font-semibold text-foreground">PRD-1001</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-semibold text-foreground">EV Charging Infrastructure</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Power Rating:</span>
              <span className="font-semibold text-foreground">240 kW Dual Dispenser</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Uptime SLA:</span>
              <span className="font-semibold text-emerald-600">99.8% Guaranteed</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Lifecycle Status:</span>
              <StatusBadge status="active" />
            </div>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowProductModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Commercialization Plan Dialog */}
      <Dialog open={showCommercializationModal} onOpenChange={setShowCommercializationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              <span>Commercialization Plan: CMP-2024-0015</span>
            </DialogTitle>
            <DialogDescription>Commercialization & Go-To-Market Master Record</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Plan ID:</span>
              <span className="font-semibold text-foreground">CMP-2024-0015</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Target Launch Date:</span>
              <span className="font-semibold text-foreground">15 Nov 2024</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Commercialization Manager:</span>
              <span className="font-semibold text-foreground">Rohit Verma</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status="approved" />
            </div>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowCommercializationModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Business Plan Dialog */}
      <Dialog open={showBusinessPlanModal} onOpenChange={setShowBusinessPlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <span>Business Plan: BP-2024-0002</span>
            </DialogTitle>
            <DialogDescription>Corporate Strategic Business Plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Plan ID:</span>
              <span className="font-semibold text-foreground">BP-2024-0002</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Business Division:</span>
              <span className="font-semibold text-foreground">Smart EV Infrastructure</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Target IRR:</span>
              <span className="font-semibold text-emerald-600">28.4%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status="approved" />
            </div>
          </div>
          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowBusinessPlanModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* QUICK ACTION MODALS                                                       */}
      {/* ========================================================================= */}

      {/* Strategy Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Product Strategy Executive Report</span>
            </DialogTitle>
            <DialogDescription>Generated Summary for Board & Strategy Committee</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs max-h-96 overflow-y-auto p-3 border rounded-lg bg-muted/20">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h4 className="font-bold text-sm">{record.strategyName}</h4>
                <p className="text-muted-foreground">{record.strategyId} | {record.formCode}</p>
              </div>
              <StatusBadge status={record.status} />
            </div>
            <div>
              <span className="font-bold block mb-1">1. Product Vision & Mission</span>
              <p className="text-muted-foreground">{formInput.productVision}</p>
            </div>
            <div>
              <span className="font-bold block mb-1">2. Market Opportunity</span>
              <p className="text-muted-foreground">TAM: {formatCurrency(record.keyMetrics.tam)} | Target Segments: {formInput.marketSegments.join(", ")}</p>
            </div>
            <div>
              <span className="font-bold block mb-1">3. Financial Highlights</span>
              <p className="text-muted-foreground">Revenue Forecast: {formatCurrency(record.keyMetrics.projectedRevenue)} | Gross Margin: {record.keyMetrics.grossMargin}% | Break-even: {record.keyMetrics.breakevenMonths} months</p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <ErpButton variant="outline" size="sm" className="gap-1.5">
                <Printer className="h-4 w-4" /> Print
              </ErpButton>
              <ErpButton variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Export PDF
              </ErpButton>
            </div>
            <ErpButton variant="primary" size="sm" onClick={() => setShowReportModal(false)}>
              Done
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Strategy Insights Drawer */}
      <Drawer open={showAIInsightsDrawer} onOpenChange={setShowAIInsightsDrawer}>
        <DrawerContent className="p-6 space-y-4 max-w-xl mx-auto">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span>AI Deep-Dive Strategy Insights</span>
            </DrawerTitle>
            <DrawerDescription>AI recommendations derived from continuous market telemetry & competitive benchmarks.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
              <span className="font-bold text-primary block">Market Expansion Lead</span>
              <p className="text-muted-foreground">{record.aiAssessment.aiStrategicRecommendations}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">SaaS Upsell Monetization</span>
              <p className="text-muted-foreground">{record.aiAssessment.aiEmergingOpportunity}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">DISCOM Approval Mitigation</span>
              <p className="text-muted-foreground">{record.aiAssessment.aiRiskPrediction}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <ErpButton variant="primary" size="sm" onClick={() => setShowAIInsightsDrawer(false)}>
              Close Insights
            </ErpButton>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Product Roadmap Modal */}
      <Dialog open={showRoadmapModal} onOpenChange={setShowRoadmapModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              <span>Linked Product Roadmap</span>
            </DialogTitle>
            <DialogDescription>
              {record.linkedProductRoadmapId
                ? `Roadmap Record: ${record.linkedProductRoadmapId}`
                : "Roadmap creation is enabled upon Committee Approval."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            {record.linkedProductRoadmapId ? (
              <>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Product Roadmap <span className="font-bold">{record.linkedProductRoadmapId}</span> is active and published to Development teams.
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Q3 2024: Alpha Prototype Verification & DISCOM Grid Pilot</p>
                  <p>• Q4 2024: OCPP 2.0.1 Cloud Integration & Beta Fleet Deployment</p>
                  <p>• Q1 2025: Commercial Production Launch (150 Units)</p>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                Product Strategy is currently in <span className="font-bold">{record.status}</span> status. Submit to Executive Review Committee and gain Approval to automatically generate the Product Roadmap.
              </div>
            )}
          </div>

          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowRoadmapModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Financial Model Modal */}
      <Dialog open={showFinancialModal} onOpenChange={setShowFinancialModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-500" />
              <span>Financial Projection Model (3-Year Horizon)</span>
            </DialogTitle>
            <DialogDescription>Investment vs Revenue Forecast Breakdown</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">3Y Capex</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(formInput.investmentBudget3Y)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Dev Opex</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(formInput.developmentCost)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">3Y Revenue</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(formInput.revenueForecast)}</span>
              </div>
            </div>

            <table className="w-full border-collapse text-left border">
              <thead>
                <tr className="bg-muted text-muted-foreground border-b">
                  <th className="p-2">Financial Metric</th>
                  <th className="p-2">Year 1</th>
                  <th className="p-2">Year 2</th>
                  <th className="p-2">Year 3</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2 font-medium">Revenue Target</td>
                  <td className="p-2">₹12.5 Cr</td>
                  <td className="p-2">₹24.0 Cr</td>
                  <td className="p-2 font-bold text-emerald-600">₹31.5 Cr</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Hardware Units Shipped</td>
                  <td className="p-2">150 Units</td>
                  <td className="p-2">450 Units</td>
                  <td className="p-2 font-bold">900 Units</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Gross Margin (%)</td>
                  <td className="p-2">38.0%</td>
                  <td className="p-2">42.5%</td>
                  <td className="p-2 font-bold text-blue-600">45.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <ErpButton variant="primary" size="sm" onClick={() => setShowFinancialModal(false)}>
              Done
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Market Research Modal */}
      <Dialog open={showMarketModal} onOpenChange={setShowMarketModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>Market Research Summary</span>
            </DialogTitle>
            <DialogDescription>TAM / SAM / SOM Breakdown</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-2.5 rounded-lg bg-muted/40 flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Total Addressable Market (TAM):</span>
              <span className="font-bold text-foreground">{formatCurrency(formInput.marketOpportunitySize)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Serviceable Addressable Market (SAM):</span>
              <span className="font-bold text-foreground">{formatCurrency(formInput.marketOpportunitySize * 0.4)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex justify-between items-center">
              <span className="font-bold text-primary">Serviceable Obtainable Market (SOM):</span>
              <span className="font-bold text-primary">{formatCurrency(formInput.marketOpportunitySize * 0.15)}</span>
            </div>
          </div>

          <DialogFooter>
            <ErpButton variant="outline" size="sm" onClick={() => setShowMarketModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Review Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-500" />
              <span>Schedule Strategy Committee Review</span>
            </DialogTitle>
            <DialogDescription>Invite Executive Committee Members for Stage 4 Evaluation</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Meeting Date & Time</label>
              <input
                type="datetime-local"
                defaultValue="2024-05-02T10:00"
                className="w-full p-2 rounded border bg-background"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Attendees</label>
              <div className="p-2 rounded border bg-muted/20 space-y-1">
                <p>• CTO & Head of R&D</p>
                <p>• VP of Product Management</p>
                <p>• Chief Commercial Officer</p>
                <p>• Lead Product Manager (Vikram Sharma)</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <ErpButton variant="primary" size="sm" onClick={() => setShowScheduleModal(false)}>
              Send Calendar Invites
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Executive Committee Decision Modal (Stage 4 Core Functional Engine) */}
      <Dialog open={showReviewDecisionModal} onOpenChange={setShowReviewDecisionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Executive Committee Strategy Decision</span>
            </DialogTitle>
            <DialogDescription>
              Evaluate Product Strategy {record.strategyId} and issue official committee decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-foreground mb-2">Select Outcome:</label>
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
                  <span className="text-[10px] text-muted-foreground mt-1">Auto-creates Product Roadmap PRM-2024-XXXX</span>
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
                    <span>2. Revision Required</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">Returns to PM for updates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewDecisionChoice("additional_investigation")}
                  className={cn(
                    "p-3 rounded-lg border text-left flex flex-col justify-between transition-all",
                    reviewDecisionChoice === "additional_investigation"
                      ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/30"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <History className="h-4 w-4 text-blue-600" />
                    <span>3. Investigation</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">Returns for further market research</span>
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
                  <span className="text-[10px] text-muted-foreground mt-1">Archives strategy record</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-muted-foreground mb-1">Committee Comments & Feedback</label>
              <textarea
                rows={3}
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

      {/* Audit Trail & Governance Log Dialog */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              <span>Audit Trail & Governance Log</span>
            </DialogTitle>
            <DialogDescription>
              Complete immutable event history for Product Strategy {record.strategyId}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1 pt-2">
            {record.auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border border-border bg-card/60 space-y-1"
              >
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
            <ErpButton variant="primary" size="sm" onClick={() => setShowAuditModal(false)}>
              Close
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}
