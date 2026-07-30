import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  FileCode,
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
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { CommercializationPageTabBar, COMMERCIALIZATION_STATUS_LABEL } from "@/components/erp/CommercializationTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { ErpButton } from "@/components/erp/Button";
import { StarRating } from "@/components/erp/StarRating";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { commercializationService } from "@/services";
import type {
  CommercializationApprovalDecision,
  CommercializationFormInput,
  CommercializationRecord,
  CommercializationStage,
  CommercializationStatus,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/commercialization-planning/new",
)({
  head: () => ({ meta: [{ title: "Commercialization Planning Form · Magnertia ERP" }] }),
  component: CommercializationFormPage,
});

function formatCurrency(val: number): string {
  if (!val || isNaN(val)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function calculateCountdownDays(targetDateStr: string): { days: number; text: string; state: "normal" | "urgent" | "past" } {
  if (!targetDateStr) return { days: 0, text: "No Target Set", state: "normal" };
  const target = new Date(targetDateStr).getTime();
  const today = new Date().getTime();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)} days overdue`, state: "past" };
  } else if (diffDays <= 30) {
    return { days: diffDays, text: `In ${diffDays} days (Target Near)`, state: "urgent" };
  } else {
    return { days: diffDays, text: `In ${diffDays} days`, state: "normal" };
  }
}

function TagInput({
  tags,
  onChange,
  placeholder,
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 min-h-[38px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground border border-border"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder || "Add tag & press Enter..."}
          className="flex-1 min-w-[120px] bg-transparent text-xs outline-none px-1"
        />
      </div>
    </div>
  );
}

function CommercializationFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = Route.useSearch();
  const recordId = search?.id || "cmp-record-0021";

  // Data fetching
  const lookupsQuery = useQuery({
    queryKey: ["commercialization-planning", "lookups"],
    queryFn: () => commercializationService.fetchLookups(),
  });

  const recordQuery = useQuery({
    queryKey: ["commercialization-planning", "record", recordId],
    queryFn: () => commercializationService.fetchRecord(recordId),
  });

  const record = recordQuery.data;

  // Form State
  const [form, setForm] = useState<CommercializationFormInput>({
    commercializationProject: "Autonomous Docking System Commercialization Plan",
    businessUnit: "Smart Mobility Division",
    commercializationManager: "Rohit Verma",
    launchTargetDate: "2024-11-15",
    linkedProductId: "prd-1001",
    linkedTechnologyId: "tec-0032",
    linkedPatentId: "pat-0123",
    linkedBusinessCaseId: "bc-0045",

    productOverview: {
      productName: "Autonomous EV Docking System Pro",
      productCategory: "Automotive & Charging Infrastructure",
      productDescription:
        "A next-generation autonomous robotic EV charging interface featuring AI vision alignment, 98.2% cycle reliability, and climate-proof enclosure for commercial fleet depots.",
      targetIndustry: "Electric Mobility / EV Infrastructure",
      targetCustomers: ["EV Charging Operators", "Fleet Owners", "Automotive OEMs"],
      valueProposition:
        "Reduces EV docking time by 75% and eliminates human plug-in error with sub-centimeter automated vision alignment.",
      competitiveAdvantage:
        "Patented multi-sensor fusion algorithms, climate-proof vision enclosure, and modular retrofitting capability for existing charging stations.",
    },

    marketAnalysis: {
      tamAmount: 450000000,
      samAmount: 180000000,
      somAmount: 65000000,
      customerSegments:
        "Commercial EV fleet operators, public highway fast-charging networks, municipal transit depots, and logistics hubs.",
      competitorAnalysis:
        "Primary competitors offer manual plug-in systems or 1st-gen inductive pads with lower efficiency and higher thermal loss.",
      marketEntryStrategy: "Direct Enterprise Sales + OEM Licensing",
      demandForecast5Yr: 185000000,
    },

    productReadiness: {
      inheritedTrl: "TRL 6 – Technology Demonstrated in Relevant Environment",
      inheritedMrl: "MRL 4 – Laboratory Capability Demonstrated",
      certificationStatus: "Fully Certified",
      regulatoryCompliance: "ISO 26262 & CE Compliant",
      productValidationStatus: "Field Validated",
      productionReadiness: "Pilot Line Ready",
      launchReadinessScore: 82,
    },

    manufacturingSupplyChain: {
      manufacturingStrategy: "Contract Manufacturing (CM)",
      productionCapacityAnnual: "2,500 Units / Year",
      contractManufacturer: "Flextronics Mobility Division",
      keySuppliers: ["Texas Instruments", "Sony Semiconductor", "Bosch Auto"],
      procurementStatus: "Component Sourced",
      inventoryReadiness: "Safety Stock Established",
      distributionNetwork:
        "Regional logistics hubs in Delhi NCR, Bengaluru, and Stuttgart. Direct shipping to OEM assembly lines.",
    },

    financialPlanning: {
      initialInvestment: 45000000,
      manufacturingCostPerUnit: 180000,
      sellingPricePerUnit: 350000,
      revenueProjection5Yr: 245000000,
      breakEvenPeriodMonths: 18,
      grossMarginPct: 48.57,
      roiPct: 185,
    },

    salesMarketing: {
      salesModel: "B2B Enterprise Direct",
      pricingStrategy: "Value-Based Pricing",
      marketingChannels: ["Industry Expos", "Digital ABM", "Executive Summits", "White Papers"],
      distributionChannels: ["Direct Sales Force", "OEM System Integrators", "Certified Distributors"],
      brandingStrategy:
        "Position as premier ultra-reliable autonomous charging interface for EV infrastructure.",
      launchCampaign:
        "Global unveiling at EV Tech Expo followed by 3 pilot deployment showcases with lead fleet customers.",
      customerSupportStrategy:
        "24/7 SLA-backed telemetry monitoring, remote diagnostics, and on-site field maintenance within 4 hours.",
    },

    partnerships: {
      strategicPartners: ["Tata Motors", "ABB E-Mobility"],
      technologyPartners: ["NVIDIA Automotive", "Qualcomm"],
      manufacturingPartners: ["Foxconn Industrial", "Flex"],
      channelPartners: ["Siemens Energy", "Schneider Electric"],
      governmentSupport: ["FAME II Grant", "MeitY R&D Scheme"],
      investors: ["Sequoia Climate Tech", "CleanEnergy Ventures"],
      partnershipStatus: "MoU Executed",
    },

    riskAssessment: {
      technicalRisk: 2,
      marketRisk: 2,
      financialRisk: 3,
      operationalRisk: 2,
      regulatoryRisk: 2,
      overallRiskScore: 32,
      riskMitigationPlan:
        "Mitigating supply chain risks via multi-sourcing, manufacturing risks via Tier-1 CM partner, and regulatory risks via pre-certified modular subassemblies.",
    },

    attachments: [],
    reviewComments: "",
  });

  // Sync form when record data arrives
  useEffect(() => {
    if (record) {
      setForm({
        commercializationProject: record.commercializationProject,
        businessUnit: record.businessUnit,
        commercializationManager: record.commercializationManager,
        launchTargetDate: record.launchTargetDate,
        linkedProductId: record.linkedProductId,
        linkedTechnologyId: record.linkedTechnologyId,
        linkedPatentId: record.linkedPatentId,
        linkedBusinessCaseId: record.linkedBusinessCaseId,
        productOverview: record.productOverview,
        marketAnalysis: record.marketAnalysis,
        productReadiness: record.productReadiness,
        manufacturingSupplyChain: record.manufacturingSupplyChain,
        financialPlanning: record.financialPlanning,
        salesMarketing: record.salesMarketing,
        partnerships: record.partnerships,
        riskAssessment: record.riskAssessment,
        attachments: record.attachments,
        approvalDecision: record.approvalDecision,
        reviewComments: record.reviewComments || "",
        approvalDate: record.approvalDate || "",
      });
    }
  }, [record]);

  // Derived financial calculations (Gross Margin % & ROI %)
  const derivedFinancials = useMemo(() => {
    const cost = form.financialPlanning.manufacturingCostPerUnit || 1;
    const price = form.financialPlanning.sellingPricePerUnit || 1;
    const inv = form.financialPlanning.initialInvestment || 1;
    const rev = form.financialPlanning.revenueProjection5Yr || 0;

    const margin = price > 0 ? Number((((price - cost) / price) * 100).toFixed(2)) : 0;
    const roi = inv > 0 ? Math.round((((rev - inv) / inv) * 100)) : 0;

    return { grossMarginPct: margin, roiPct: roi };
  }, [form.financialPlanning]);

  // Derived overall score calculation (single source of truth for Section 10 & Sidebar)
  const derivedScores = useMemo(() => {
    const pScore = form.productReadiness.launchReadinessScore || 82;
    const mScore = 88;
    const fScore = Math.min(98, Math.max(50, Math.round(derivedFinancials.grossMarginPct * 1.2 + derivedFinancials.roiPct / 10)));
    const cScore = Math.round((pScore + mScore + fScore) / 3);

    const ra = form.riskAssessment;
    const riskAvg = (ra.technicalRisk + ra.marketRisk + ra.financialRisk + ra.operationalRisk + ra.regulatoryRisk) / 5;
    const rawRiskScore = Math.round((riskAvg / 5) * 60 + 10); // 32
    const riskControlScore = 100 - rawRiskScore; // 68% Safety Contribution

    const overallLaunchReadiness = Math.round(
      pScore * 0.3 + mScore * 0.25 + fScore * 0.25 + riskControlScore * 0.2,
    );

    return {
      productReadinessScore: pScore,
      marketReadinessScore: mScore,
      financialReadinessScore: fScore,
      commercializationScore: cScore,
      riskControlScore,
      rawRiskScore,
      overallLaunchReadiness,
      aiMarketOpportunityScore: Math.min(99, Math.round(mScore * 1.02)),
      aiLaunchReadinessScore: overallLaunchReadiness,
      aiRevenueForecast5Yr: Math.round(form.financialPlanning.revenueProjection5Yr * 1.09),
    };
  }, [form.productReadiness.launchReadinessScore, form.riskAssessment, form.financialPlanning.revenueProjection5Yr, derivedFinancials]);

  // Countdown timer for target launch date
  const countdown = useMemo(() => calculateCountdownDays(form.launchTargetDate), [form.launchTargetDate]);

  // Modals & Drawers state
  const [activePreviewModal, setActivePreviewModal] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecisionChoice, setReviewDecisionChoice] = useState<CommercializationApprovalDecision>("Approved");
  const [reviewCommentsInput, setReviewCommentsInput] = useState("");
  const [activeDrawer, setActiveDrawer] = useState<"audit" | "activity" | "change" | "workflow" | null>(null);
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (input: CommercializationFormInput) => commercializationService.saveDraft(input, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialization-planning"] });
    },
  });

  const completeStageMutation = useMutation({
    mutationFn: (stage: CommercializationStage) => commercializationService.completeStage(recordId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialization-planning"] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => commercializationService.submitForReview(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialization-planning"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (args: { decision: CommercializationApprovalDecision; comments?: string; approvalDate?: string }) =>
      commercializationService.reviewDecision({ id: recordId, ...args }),
    onSuccess: () => {
      setShowReviewModal(false);
      queryClient.invalidateQueries({ queryKey: ["commercialization-planning"] });
    },
  });

  const currentStatus = record?.status || "executive_review";
  const lookups = lookupsQuery.data;

  return (
    <AppShell
      breadcrumb="Development > Research & Innovation Development > Commercialization Planning > Commercialization Planning Form"
      title="Commercialization Planning"
      description="Plan go-to-market, financials, and launch readiness."
      topbarActions={
        <div className="flex items-center gap-2">
          <ErpButton
            variant="outline"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate(form)}
            aria-label="Save Draft"
            title="Save Draft"
          >
            <Save className="h-4 w-4" />
          </ErpButton>
          <ErpButton
            variant="primary"
            loading={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            aria-label="Submit for Review"
            title="Submit for Review"
          >
            <Send className="h-4 w-4" />
          </ErpButton>
        </div>
      }
      tabs={<InnovationAreaTabs sub={<CommercializationPageTabBar />} />}
    >
      {/* Record Header Bar (Two Rows) */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-xs space-y-3">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary">
                {record?.commercializationPlanId || "CMP-2024-0021"}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {record?.formCode || "CMP-2024-15"}
              </span>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Resolved Linked Record Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActivePreviewModal("project")}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="max-w-[180px] truncate">{form.commercializationProject}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewModal("product")}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
              >
                <span>{record?.linkedProductCode || "PRD-1001"}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewModal("technology")}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
              >
                <span>{record?.linkedTechnologyCode || "TEC-2024-0032"}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewModal("patent")}
                className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
              >
                <span>{record?.linkedPatentCode || "PAT-2024-0123"}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewModal("business_case")}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
              >
                <span>{record?.linkedBusinessCaseCode || "BC-2024-0045"}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={COMMERCIALIZATION_STATUS_LABEL[currentStatus] || currentStatus} />
            {record?.linkedProductLaunchProjectCode && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Launch Project: {record.linkedProductLaunchProjectCode}
              </span>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{form.businessUnit}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Manager:</span>
              <span className="font-semibold text-foreground">{form.commercializationManager}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Launch Target:</span>
              <input
                type="date"
                value={form.launchTargetDate}
                onChange={(e) => setForm((prev) => ({ ...prev, launchTargetDate: e.target.value }))}
                className="font-mono text-xs font-bold text-foreground bg-muted/50 rounded px-1.5 py-0.5 border border-input focus:outline-none"
              />
            </div>
          </div>

          {/* Workflow Stage Progress Pills */}
          <div className="flex items-center gap-1">
            {(record?.stages || []).map((st, idx) => (
              <div key={st.stage} className="flex items-center gap-1">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold transition-all",
                    st.completed
                      ? "bg-emerald-100 text-emerald-800"
                      : st.active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {idx + 1}. {st.label}
                </span>
                {idx < (record?.stages.length || 0) - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Sections (Left 2/3) + Sticky Sidebar (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Sections Container */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Product Overview */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Product Overview</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
                <input
                  type="text"
                  value={form.productOverview.productName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, productName: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Category *</label>
                <select
                  value={form.productOverview.productCategory}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, productCategory: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.productCategories || []).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Product Description *</label>
              <textarea
                rows={2}
                value={form.productOverview.productDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productOverview: { ...prev.productOverview, productDescription: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Target Industry *</label>
                <input
                  type="text"
                  value={form.productOverview.targetIndustry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, targetIndustry: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Target Customers *</label>
                <TagInput
                  tags={form.productOverview.targetCustomers}
                  onChange={(newTags) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, targetCustomers: newTags },
                    }))
                  }
                  placeholder="Add customer segment..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Value Proposition *</label>
                <textarea
                  rows={2}
                  value={form.productOverview.valueProposition}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, valueProposition: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Competitive Advantage *</label>
                <textarea
                  rows={2}
                  value={form.productOverview.competitiveAdvantage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productOverview: { ...prev.productOverview, competitiveAdvantage: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Market Analysis */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Market Analysis</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Total Addressable Market (TAM)</label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    value={form.marketAnalysis.tamAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        marketAnalysis: { ...prev.marketAnalysis, tamAmount: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatCurrency(form.marketAnalysis.tamAmount)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Serviceable Market (SAM)</label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    value={form.marketAnalysis.samAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        marketAnalysis: { ...prev.marketAnalysis, samAmount: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatCurrency(form.marketAnalysis.samAmount)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Obtainable Market (SOM)</label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    value={form.marketAnalysis.somAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        marketAnalysis: { ...prev.marketAnalysis, somAmount: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatCurrency(form.marketAnalysis.somAmount)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Customer Segments</label>
                <textarea
                  rows={2}
                  value={form.marketAnalysis.customerSegments}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      marketAnalysis: { ...prev.marketAnalysis, customerSegments: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Competitor Analysis</label>
                <textarea
                  rows={2}
                  value={form.marketAnalysis.competitorAnalysis}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      marketAnalysis: { ...prev.marketAnalysis, competitorAnalysis: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Market Entry Strategy</label>
                <select
                  value={form.marketAnalysis.marketEntryStrategy}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      marketAnalysis: { ...prev.marketAnalysis, marketEntryStrategy: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.marketEntryStrategies || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Demand Forecast (5 Years)</label>
                <input
                  type="number"
                  value={form.marketAnalysis.demandForecast5Yr}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      marketAnalysis: { ...prev.marketAnalysis, demandForecast5Yr: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(form.marketAnalysis.demandForecast5Yr)}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Product Readiness (Upstream-derived TRL & MRL) */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Product Readiness</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
                Score: {derivedScores.productReadinessScore}/100
              </span>
            </div>

            {/* Upstream Derived Readiness Badges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg bg-secondary/40 p-3 border border-border">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Technology Readiness Level (TRL)
                </div>
                <div className="inline-flex items-center gap-2 rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{form.productReadiness.inheritedTrl}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Inherited read-only from upstream TRL Assessment record TRL-2024-0087
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Manufacturing Readiness Level (MRL)
                </div>
                <div className="inline-flex items-center gap-2 rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-900 border border-blue-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                  <span>{form.productReadiness.inheritedMrl}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Inherited read-only from upstream MRL Assessment record MRL-2024-0042
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Certification Status</label>
                <select
                  value={form.productReadiness.certificationStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productReadiness: { ...prev.productReadiness, certificationStatus: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.certificationStatuses || []).map((cs) => (
                    <option key={cs} value={cs}>
                      {cs}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Regulatory Compliance</label>
                <select
                  value={form.productReadiness.regulatoryCompliance}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productReadiness: { ...prev.productReadiness, regulatoryCompliance: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.regulatoryCompliances || []).map((rc) => (
                    <option key={rc} value={rc}>
                      {rc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Validation Status</label>
                <select
                  value={form.productReadiness.productValidationStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productReadiness: { ...prev.productReadiness, productValidationStatus: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.productValidationStatuses || []).map((pvs) => (
                    <option key={pvs} value={pvs}>
                      {pvs}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Production Readiness</label>
                <select
                  value={form.productReadiness.productionReadiness}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      productReadiness: { ...prev.productReadiness, productionReadiness: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.productionReadinesses || []).map((pr) => (
                    <option key={pr} value={pr}>
                      {pr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 4: Manufacturing & Supply Chain */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Manufacturing & Supply Chain
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Manufacturing Strategy</label>
                <select
                  value={form.manufacturingSupplyChain.manufacturingStrategy}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: {
                        ...prev.manufacturingSupplyChain,
                        manufacturingStrategy: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.manufacturingStrategies || []).map((ms) => (
                    <option key={ms} value={ms}>
                      {ms}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Annual Production Capacity</label>
                <input
                  type="text"
                  value={form.manufacturingSupplyChain.productionCapacityAnnual}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: {
                        ...prev.manufacturingSupplyChain,
                        productionCapacityAnnual: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Contract Manufacturer</label>
                <input
                  type="text"
                  value={form.manufacturingSupplyChain.contractManufacturer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: {
                        ...prev.manufacturingSupplyChain,
                        contractManufacturer: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Key Suppliers</label>
                <TagInput
                  tags={form.manufacturingSupplyChain.keySuppliers}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: { ...prev.manufacturingSupplyChain, keySuppliers: tags },
                    }))
                  }
                  placeholder="Add supplier..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Procurement Status</label>
                <select
                  value={form.manufacturingSupplyChain.procurementStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: {
                        ...prev.manufacturingSupplyChain,
                        procurementStatus: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.procurementStatuses || []).map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Inventory Readiness</label>
                <select
                  value={form.manufacturingSupplyChain.inventoryReadiness}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturingSupplyChain: {
                        ...prev.manufacturingSupplyChain,
                        inventoryReadiness: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.inventoryReadinesses || []).map((ir) => (
                    <option key={ir} value={ir}>
                      {ir}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Distribution Network</label>
              <textarea
                rows={2}
                value={form.manufacturingSupplyChain.distributionNetwork}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    manufacturingSupplyChain: {
                      ...prev.manufacturingSupplyChain,
                      distributionNetwork: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Card 5: Financial Planning (Computed Gross Margin & ROI) */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  5
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Financial Planning</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
                  Gross Margin: {derivedFinancials.grossMarginPct}%
                </span>
                <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-800 border border-blue-200">
                  Expected ROI: {derivedFinancials.roiPct}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Initial Investment</label>
                <input
                  type="number"
                  value={form.financialPlanning.initialInvestment}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      financialPlanning: {
                        ...prev.financialPlanning,
                        initialInvestment: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(form.financialPlanning.initialInvestment)}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Mfg Cost (Per Unit)</label>
                <input
                  type="number"
                  value={form.financialPlanning.manufacturingCostPerUnit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      financialPlanning: {
                        ...prev.financialPlanning,
                        manufacturingCostPerUnit: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(form.financialPlanning.manufacturingCostPerUnit)}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Selling Price (Per Unit)</label>
                <input
                  type="number"
                  value={form.financialPlanning.sellingPricePerUnit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      financialPlanning: {
                        ...prev.financialPlanning,
                        sellingPricePerUnit: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(form.financialPlanning.sellingPricePerUnit)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Plan Revenue Projection (5 Years)
                </label>
                <input
                  type="number"
                  value={form.financialPlanning.revenueProjection5Yr}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      financialPlanning: {
                        ...prev.financialPlanning,
                        revenueProjection5Yr: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(form.financialPlanning.revenueProjection5Yr)}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Break-even Period (Months)</label>
                <input
                  type="number"
                  value={form.financialPlanning.breakEvenPeriodMonths}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      financialPlanning: {
                        ...prev.financialPlanning,
                        breakEvenPeriodMonths: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                />
              </div>

              {/* Computed Gross Margin & ROI Badges */}
              <div className="rounded-md bg-secondary/60 p-2 border border-border space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Gross Margin:</span>
                  <span className="font-mono font-bold text-emerald-700">{derivedFinancials.grossMarginPct}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Expected ROI:</span>
                  <span className="font-mono font-bold text-blue-700">{derivedFinancials.roiPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Sales & Marketing Strategy */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  6
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Sales & Marketing Strategy
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sales Model</label>
                <select
                  value={form.salesMarketing.salesModel}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, salesModel: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.salesModels || []).map((sm) => (
                    <option key={sm} value={sm}>
                      {sm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Pricing Strategy</label>
                <select
                  value={form.salesMarketing.pricingStrategy}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, pricingStrategy: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.pricingStrategies || []).map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Marketing Channels</label>
                <TagInput
                  tags={form.salesMarketing.marketingChannels}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, marketingChannels: tags },
                    }))
                  }
                  placeholder="Add marketing channel..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Distribution Channels</label>
                <TagInput
                  tags={form.salesMarketing.distributionChannels}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, distributionChannels: tags },
                    }))
                  }
                  placeholder="Add distribution channel..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Branding Strategy</label>
                <textarea
                  rows={2}
                  value={form.salesMarketing.brandingStrategy}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, brandingStrategy: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Launch Campaign</label>
                <textarea
                  rows={2}
                  value={form.salesMarketing.launchCampaign}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, launchCampaign: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Customer Support Strategy</label>
                <textarea
                  rows={2}
                  value={form.salesMarketing.customerSupportStrategy}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      salesMarketing: { ...prev.salesMarketing, customerSupportStrategy: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 7: Partnerships & Ecosystem */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  7
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Partnerships & Ecosystem
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <select
                  value={form.partnerships.partnershipStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, partnershipStatus: e.target.value },
                    }))
                  }
                  className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {(lookups?.partnershipStatuses || []).map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Strategic Partners</label>
                <TagInput
                  tags={form.partnerships.strategicPartners}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, strategicPartners: tags },
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Technology Partners</label>
                <TagInput
                  tags={form.partnerships.technologyPartners}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, technologyPartners: tags },
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Manufacturing Partners</label>
                <TagInput
                  tags={form.partnerships.manufacturingPartners}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, manufacturingPartners: tags },
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Channel Partners</label>
                <TagInput
                  tags={form.partnerships.channelPartners}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, channelPartners: tags },
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Government Support</label>
                <TagInput
                  tags={form.partnerships.governmentSupport}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, governmentSupport: tags },
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Investors</label>
                <TagInput
                  tags={form.partnerships.investors}
                  onChange={(tags) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerships: { ...prev.partnerships, investors: tags },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Card 8: Risk Assessment (Polarity Labeled) */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  8
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Risk Assessment</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-800 border border-amber-200">
                  Overall Risk Score: {derivedScores.rawRiskScore}/100 (Lower is Better)
                </span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
                  Safety Control: {derivedScores.riskControlScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Technical Risk</label>
                <StarRating
                  value={form.riskAssessment.technicalRisk * 2}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      riskAssessment: { ...prev.riskAssessment, technicalRisk: Math.max(1, Math.round(val / 2)) },
                    }))
                  }
                  showValue={false}
                  invert={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Market Risk</label>
                <StarRating
                  value={form.riskAssessment.marketRisk * 2}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      riskAssessment: { ...prev.riskAssessment, marketRisk: Math.max(1, Math.round(val / 2)) },
                    }))
                  }
                  showValue={false}
                  invert={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Financial Risk</label>
                <StarRating
                  value={form.riskAssessment.financialRisk * 2}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      riskAssessment: { ...prev.riskAssessment, financialRisk: Math.max(1, Math.round(val / 2)) },
                    }))
                  }
                  showValue={false}
                  invert={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Operational Risk</label>
                <StarRating
                  value={form.riskAssessment.operationalRisk * 2}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      riskAssessment: { ...prev.riskAssessment, operationalRisk: Math.max(1, Math.round(val / 2)) },
                    }))
                  }
                  showValue={false}
                  invert={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Regulatory Risk</label>
                <StarRating
                  value={form.riskAssessment.regulatoryRisk * 2}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      riskAssessment: { ...prev.riskAssessment, regulatoryRisk: Math.max(1, Math.round(val / 2)) },
                    }))
                  }
                  showValue={false}
                  invert={true}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Risk Mitigation Plan</label>
              <textarea
                rows={2}
                value={form.riskAssessment.riskMitigationPlan}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    riskAssessment: { ...prev.riskAssessment, riskMitigationPlan: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Card 9: AI Commercialization Assessment */}
          <div className="card-soft p-5 space-y-4 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  9
                </span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">
                    AI Commercialization Assessment
                  </h3>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                AI Readiness Score: {derivedScores.aiLaunchReadinessScore}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/80 bg-background/80 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Market Opportunity</div>
                <div className="mt-1 font-mono text-lg font-bold text-emerald-600">
                  {derivedScores.aiMarketOpportunityScore}/100
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/80 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">AI Revenue Forecast</div>
                <div className="mt-1 font-mono text-xs font-bold text-primary">
                  {formatCurrency(derivedScores.aiRevenueForecast5Yr)}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">AI Independent Model</div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/80 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Customer Adoption</div>
                <div className="mt-1 font-mono text-lg font-bold text-blue-600">76%</div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/80 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Competitive Position</div>
                <div className="mt-1 font-mono text-lg font-bold text-purple-600">84/100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border/80 bg-background/60 p-3 space-y-1">
                <div className="text-xs font-bold text-foreground">AI Growth Strategy</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {record?.aiAnalytics.aiGrowthStrategy ||
                    "Accelerate B2B enterprise partnerships and expand OEM co-development. Target 15% market penetration within 24 months."}
                </p>
              </div>

              <div className="rounded-md border border-border/80 bg-background/60 p-3 space-y-1">
                <div className="text-xs font-bold text-foreground">AI Recommendations</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {record?.aiAnalytics.aiRecommendations ||
                    "Proceed to product launch with pilot fleet partners. Establish regional service support hubs prior to Q4 volume shipment."}
                </p>
              </div>
            </div>
          </div>

          {/* Card 10: Commercialization Summary */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  10
                </span>
                <h3 className="font-display text-base font-bold text-foreground">
                  Commercialization Summary
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-md border border-border bg-card p-3 text-center">
                <div className="text-[11px] text-muted-foreground">Product Readiness</div>
                <div className="mt-1 font-mono text-base font-bold text-foreground">
                  {derivedScores.productReadinessScore}/100
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-3 text-center">
                <div className="text-[11px] text-muted-foreground">Market Readiness</div>
                <div className="mt-1 font-mono text-base font-bold text-foreground">
                  {derivedScores.marketReadinessScore}/100
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-3 text-center">
                <div className="text-[11px] text-muted-foreground">Financial Readiness</div>
                <div className="mt-1 font-mono text-base font-bold text-foreground">
                  {derivedScores.financialReadinessScore}/100
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-3 text-center">
                <div className="text-[11px] text-muted-foreground">Risk Control</div>
                <div className="mt-1 font-mono text-base font-bold text-emerald-700">
                  {derivedScores.riskControlScore}%
                </div>
              </div>

              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-center sm:col-span-1 col-span-2">
                <div className="text-[11px] font-bold text-primary">Overall Launch Score</div>
                <div className="mt-1 font-mono text-lg font-extrabold text-primary">
                  {derivedScores.overallLaunchReadiness}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Recommended Action</label>
                <select
                  value={record?.summary.recommendedAction || "Proceed to Product Launch"}
                  onChange={() => {}}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  {(lookups?.recommendedActions || []).map((ra) => (
                    <option key={ra} value={ra}>
                      {ra}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Recommendation Context</label>
                <div className="mt-1 rounded-md border border-emerald-200 bg-emerald-50/50 p-2 text-xs font-semibold text-emerald-900">
                  Proceed to Product Launch (Launch Readiness: {derivedScores.overallLaunchReadiness}/100)
                </div>
              </div>
            </div>
          </div>

          {/* Card 11: Attachments */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  11
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Attachments</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionModal("upload")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload New File
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(form.attachments || []).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {att.fileType === "PDF" ? (
                      <FileText className="h-5 w-5 text-red-500 shrink-0" />
                    ) : att.fileType === "XLSX" ? (
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <FileCode className="h-5 w-5 text-blue-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground" title={att.fileName}>
                        {att.fileName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{att.fileSize}</div>
                    </div>
                  </div>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${att.fileName}`);
                    }}
                    className="text-muted-foreground hover:text-primary p-1 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Card 12: Review & Approval */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  12
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Review & Approval</h3>
              </div>

              <ErpButton variant="primary" onClick={() => setShowReviewModal(true)}>
                Perform Executive Review
              </ErpButton>
            </div>

            {/* 5-Row Reviewer Decision Log */}
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Person</th>
                    <th className="p-2.5">Decision</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(record?.reviewRows || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2.5 font-bold text-foreground">{row.role}</td>
                      <td className="p-2.5 text-foreground">{row.person}</td>
                      <td className="p-2.5 font-semibold text-emerald-700">{row.decision}</td>
                      <td className="p-2.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Executive Decision Summary if completed */}
            {record?.approvalDecision && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Executive Decision: {record.approvalDecision}</span>
                  <span className="font-mono">{record.approvalDate}</span>
                </div>
                {record.reviewComments && (
                  <p className="text-xs text-emerald-800 italic">"{record.reviewComments}"</p>
                )}
              </div>
            )}
          </div>

          {/* Card 13: System Information & History Links */}
          <div className="card-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  13
                </span>
                <h3 className="font-display text-base font-bold text-foreground">System Information</h3>
              </div>
              <StatusBadge status={COMMERCIALIZATION_STATUS_LABEL[currentStatus] || currentStatus} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
              <div>
                <div className="text-muted-foreground">Created By:</div>
                <div className="font-semibold text-foreground">{record?.createdBy || "Rohit Verma"}</div>
                <div className="text-[10px] text-muted-foreground">{record?.createdAt}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Last Modified By:</div>
                <div className="font-semibold text-foreground">{record?.lastModifiedBy || "Rohit Verma"}</div>
                <div className="text-[10px] text-muted-foreground">{record?.updatedAt}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Workflow Stage:</div>
                <div className="font-bold text-primary">{record?.currentStageLabel}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Version:</div>
                <div className="font-mono font-bold text-foreground">v{record?.version || "1.0"}</div>
              </div>
            </div>

            {/* 4 Separate History Drawer Links */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveDrawer("audit")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-primary" />
                  <span>Audit Trail</span>
                </div>
                <span className="text-[10px] font-bold text-primary">View Log</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawer("activity")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  <span>Activity History</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600">View History</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawer("change")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  <span>Change History</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600">View Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawer("workflow")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-600" />
                  <span>Workflow History</span>
                </div>
                <span className="text-[10px] font-bold text-purple-600">View Workflow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel (Sticky on Scroll) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Overall Commercialization Score Donut Gauge */}
            <div className="card-soft p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Overall Commercialization Score
                </h3>
                <span className="font-mono text-xs font-bold text-primary">
                  {derivedScores.overallLaunchReadiness}/100
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative grid h-32 w-32 place-items-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/30"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeDasharray={`${derivedScores.overallLaunchReadiness}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-2xl font-extrabold text-foreground">
                      {derivedScores.overallLaunchReadiness}%
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Launch Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Contributing Breakdown List */}
              <div className="space-y-2 border-t border-border pt-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Product Readiness</span>
                  <span className="font-mono font-bold text-foreground">
                    {derivedScores.productReadinessScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Market Readiness</span>
                  <span className="font-mono font-bold text-foreground">
                    {derivedScores.marketReadinessScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Financial Readiness</span>
                  <span className="font-mono font-bold text-foreground">
                    {derivedScores.financialReadinessScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Risk Control / Safety</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {derivedScores.riskControlScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Assessment Score</span>
                  <span className="font-mono font-bold text-primary">
                    {derivedScores.aiLaunchReadinessScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Target Countdown Box */}
            <div className="card-soft p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Target Launch Countdown
                </span>
                <span className="font-mono font-bold text-foreground">
                  {form.launchTargetDate}
                </span>
              </div>
              <div
                className={cn(
                  "rounded-md p-2.5 text-center font-mono text-sm font-extrabold border transition-colors",
                  countdown.state === "past"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : countdown.state === "urgent"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200",
                )}
              >
                {countdown.text}
              </div>
            </div>

            {/* Financial Highlights Callouts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card-soft p-3 text-center space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground">Expected ROI</div>
                <div className="font-mono text-lg font-extrabold text-emerald-600">
                  {derivedFinancials.roiPct}%
                </div>
                <div className="text-[9px] text-muted-foreground">Synced live with Sec 5</div>
              </div>

              <div className="card-soft p-3 text-center space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground">5-Yr Projected Rev</div>
                <div className="font-mono text-xs font-bold text-primary truncate" title={formatCurrency(form.financialPlanning.revenueProjection5Yr)}>
                  {formatCurrency(form.financialPlanning.revenueProjection5Yr)}
                </div>
                <div className="text-[9px] text-muted-foreground">Plan Revenue Figure</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="card-soft p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground border-b border-border pb-2">
                Quick Actions
              </h4>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveActionModal("report")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Generate Commercialization Report
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("gtm")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Create Go-to-Market Plan
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("financial")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-emerald-600" />
                    Financial Projection Model
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("market")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-purple-600" />
                    Market Research Summary
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("ai")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    AI Commercialization Insights
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("upload")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Upload Supporting Documents
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionModal("meeting")}
                  className="w-full flex items-center justify-between rounded-md p-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Schedule Review Meeting
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolved Linked Record Preview Modals */}
      <Dialog open={!!activePreviewModal} onOpenChange={() => setActivePreviewModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              {activePreviewModal === "project" && "Commercialization Project Context"}
              {activePreviewModal === "product" && "Linked Product Details (PRD-1001)"}
              {activePreviewModal === "technology" && "Linked Technology Details (TEC-2024-0032)"}
              {activePreviewModal === "patent" && "Linked Patent Details (PAT-2024-0123)"}
              {activePreviewModal === "business_case" && "Linked Business Case (BC-2024-0045)"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Contextual details resolved from Magnertia ERP upstream databases.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {activePreviewModal === "project" && (
              <div className="space-y-2">
                <div className="font-bold text-foreground">{form.commercializationProject}</div>
                <div className="text-muted-foreground">
                  Manager: <span className="font-semibold text-foreground">{form.commercializationManager}</span>
                </div>
                <div className="text-muted-foreground">
                  Business Unit: <span className="font-semibold text-foreground">{form.businessUnit}</span>
                </div>
              </div>
            )}

            {activePreviewModal === "product" && (
              <div className="space-y-2">
                <div className="font-bold text-foreground">PRD-1001 · Smart EV Charger Pro</div>
                <div className="text-muted-foreground">Category: Automotive & Charging Infrastructure</div>
                <div className="text-muted-foreground">Stage: Pilot Production Ready</div>
                <div className="rounded bg-muted p-2 font-mono text-[11px]">
                  Spec: Dual 150kW CCS2, AI Vision Docking Interface, ISO 26262 Compliant
                </div>
              </div>
            )}

            {activePreviewModal === "technology" && (
              <div className="space-y-2">
                <div className="font-bold text-foreground">TEC-2024-0032 · Autonomous EV Docking Core</div>
                <div className="text-muted-foreground font-semibold text-emerald-700">TRL Level: TRL 6</div>
                <div className="text-muted-foreground">Domain: Robotics & Automation</div>
                <div className="rounded bg-muted p-2 text-[11px]">
                  Evidence: 300+ docking cycles completed with 97% success rate in pilot plant.
                </div>
              </div>
            )}

            {activePreviewModal === "patent" && (
              <div className="space-y-2">
                <div className="font-bold text-foreground">PAT-2024-0123 · Multi-Sensor Vision Docking Interface</div>
                <div className="text-muted-foreground font-semibold text-purple-700">Status: Patent Granted</div>
                <div className="text-muted-foreground">Filing Date: 12 Jan 2024</div>
                <div className="rounded bg-muted p-2 text-[11px]">
                  Claims: System and method for automated EV charger alignment using thermal vision and laser range sensors.
                </div>
              </div>
            )}

            {activePreviewModal === "business_case" && (
              <div className="space-y-2">
                <div className="font-bold text-foreground">BC-2024-0045 · Autonomous Charger Commercial Case</div>
                <div className="text-muted-foreground">Target ROI: 185% over 5 years</div>
                <div className="text-muted-foreground">Initial Capex: ₹ 4.50 Cr</div>
                <div className="rounded bg-muted p-2 text-[11px]">
                  Approved by Strategic Investment Board on 05 Mar 2024.
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Perform Executive Review Decision Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Perform Executive Review Decision
            </DialogTitle>
            <DialogDescription className="text-xs">
              Execute decision for Commercialization Plan CMP-2024-0021. Upon approval, a linked Product Launch Project will be auto-created.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Review Outcome Decision *</label>
              <select
                value={reviewDecisionChoice}
                onChange={(e) => setReviewDecisionChoice(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="Approved">Approved (Auto-create Product Launch Project)</option>
                <option value="Approved with Conditions">Approved with Conditions</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                <label>Review Board Comments & Feedback</label>
                <span className="font-mono text-[10px]">
                  {reviewCommentsInput.length} / 2000
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={2000}
                value={reviewCommentsInput}
                onChange={(e) => setReviewCommentsInput(e.target.value)}
                placeholder="Enter formal executive review comments and conditions..."
                className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <ErpButton variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                variant="primary"
                loading={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    decision: reviewDecisionChoice,
                    comments: reviewCommentsInput,
                  })
                }
              >
                Execute Review Decision
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Drawers (Audit, Activity, Change, Workflow) */}
      <Drawer open={!!activeDrawer} onOpenChange={() => setActiveDrawer(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
            <DrawerHeader className="px-0">
              <DrawerTitle className="text-base font-bold flex items-center gap-2">
                {activeDrawer === "audit" && <History className="h-5 w-5 text-primary" />}
                {activeDrawer === "activity" && <Activity className="h-5 w-5 text-blue-600" />}
                {activeDrawer === "change" && <FileText className="h-5 w-5 text-amber-600" />}
                {activeDrawer === "workflow" && <Layers className="h-5 w-5 text-purple-600" />}
                {activeDrawer === "audit" && "Audit Trail Log"}
                {activeDrawer === "activity" && "Activity History Log"}
                {activeDrawer === "change" && "Change History Log"}
                {activeDrawer === "workflow" && "Workflow History Log"}
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                Comprehensive record timeline for Commercialization Plan CMP-2024-0021
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(record?.auditTrail || []).map((aud) => (
                <div key={aud.id} className="flex gap-3 text-xs border-b border-border/60 pb-2.5">
                  <div className="font-mono text-muted-foreground w-36 shrink-0">{aud.timestamp}</div>
                  <div>
                    <span className="font-bold text-foreground">{aud.actor}: </span>
                    <span className="text-muted-foreground">{aud.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Quick Action Modals */}
      <Dialog open={!!activeActionModal} onOpenChange={() => setActiveActionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {activeActionModal === "report" && "Generate Commercialization Report"}
              {activeActionModal === "gtm" && "Create Go-to-Market Plan"}
              {activeActionModal === "financial" && "Financial Projection Model"}
              {activeActionModal === "market" && "Market Research Summary"}
              {activeActionModal === "ai" && "AI Commercialization Insights"}
              {activeActionModal === "upload" && "Upload Supporting Document"}
              {activeActionModal === "meeting" && "Schedule Review Meeting"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <p className="text-muted-foreground">
              Executing workflow action for record <strong>CMP-2024-0021</strong> ({form.commercializationProject}).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <ErpButton variant="outline" onClick={() => setActiveActionModal(null)}>
                Close
              </ErpButton>
              <ErpButton
                variant="primary"
                onClick={() => {
                  alert("Action completed successfully.");
                  setActiveActionModal(null);
                }}
              >
                Confirm Action
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
