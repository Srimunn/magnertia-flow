import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Save,
  Download,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Briefcase,
  Gauge,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Wallet,
  Users2,
  ClipboardList,
  Map as MapIcon,
  History as HistoryIcon,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/erp/AppShell";
import {
  PortfolioPageTabBar,
  PortfolioInnerTabs,
  PORTFOLIO_STATUS_LABEL,
} from "@/components/erp/PortfolioTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { innovationPortfolioService } from "@/services";
import type {
  ExecutiveDecision,
  FundingDecision,
  PortfolioFormInput,
  PortfolioLookups,
  PortfolioProjectRow,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/innovation-portfolio/new")({
  head: () => ({ meta: [{ title: "Innovation Portfolio Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string; tab?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: PortfolioFormPage,
});

/* --------------------------------- Defaults -------------------------------- */
const EMPTY: PortfolioFormInput = {
  portfolioName: "",
  portfolioManager: "Priya Sharma",
  businessUnit: "",
  department: "",
  financialYear: "2026-27",
  portfolioCategory: "",
  portfolioObjective: "",
  strategicTheme: "",
  innovationFocus: [],
  portfolioDescription: "",
  innovationType: "",
  technologyDomain: [],
  industry: "",
  market: "",
  customerSegment: "",
  corporateObjectiveAlignment: 70,
  strategicInitiativeAlignment: 70,
  businessGoalAlignment: 70,
  esgGoalAlignment: 70,
  approvedBudget: 0,
  equipmentAvailability: "",
  laboratoryAvailability: "",
  technologyRisk: 5,
  marketRisk: 5,
  financialRisk: 5,
  regulatoryRisk: 5,
  operationalRisk: 5,
  attachments: [],
};

/* ------------------------------ UI primitives ------------------------------ */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
function TextInput(p: { value: string; onChange?: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange?.(e.target.value)}
    />
  );
}
function NumberInput(p: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {p.prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {p.prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-7")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
    </div>
  );
}
function Select(p: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange(e.target.value)}
    >
      <option value="">Select…</option>
      {p.options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function StageBadge({ stage }: { stage: string }) {
  const tone: Record<string, string> = {
    Ideas: "bg-[#3B82F6]/10 text-[#3B82F6]",
    Opportunities: "bg-[#7C5CFF]/10 text-[#7C5CFF]",
    "Design Thinking": "bg-[#22C55E]/10 text-[#22C55E]",
    "Problem Validation": "bg-[#F59E0B]/10 text-[#F59E0B]",
    "Feasibility Study": "bg-primary/10 text-primary",
  };
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-bold",
        tone[stage] ?? "bg-muted text-muted-foreground",
      )}
    >
      {stage}
    </span>
  );
}
function ScoreRing({ value, size = 128 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={rad} fill="none" stroke="var(--muted)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={rad}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-bold tabular text-foreground">{value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/100</div>
        </div>
      </div>
    </div>
  );
}
function AlignBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold tabular text-primary">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="card-soft flex items-center gap-3 p-4">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", color)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-medium text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

/* ================================== Page =================================== */
function PortfolioFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId, tab } = Route.useSearch();

  const lookupsQuery = useQuery({
    queryKey: ["innovation-portfolio", "lookups"],
    queryFn: () => innovationPortfolioService.fetchLookups(),
  });
  const portfolioQuery = useQuery({
    queryKey: ["innovation-portfolio", "detail", editId],
    queryFn: () => innovationPortfolioService.fetchPortfolio(editId as string),
    enabled: !!editId,
  });
  const record = portfolioQuery.data;

  const [input, setInput] = useState<PortfolioFormInput>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<ExecutiveDecision>("Approved");
  const [reviewFunding, setReviewFunding] = useState<FundingDecision>("Fully Funded");
  const [reviewPriority, setReviewPriority] = useState("High");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId && record && !seeded) {
      setInput({
        portfolioName: record.portfolioName,
        portfolioManager: record.portfolioManager,
        businessUnit: record.businessUnit,
        department: record.department,
        financialYear: record.financialYear,
        portfolioCategory: record.portfolioCategory,
        portfolioObjective: record.portfolioObjective,
        strategicTheme: record.strategicTheme,
        innovationFocus: record.innovationFocus,
        portfolioDescription: record.portfolioDescription,
        innovationType: record.innovationType,
        technologyDomain: record.technologyDomain,
        industry: record.industry,
        market: record.market,
        customerSegment: record.customerSegment,
        corporateObjectiveAlignment: record.corporateObjectiveAlignment,
        strategicInitiativeAlignment: record.strategicInitiativeAlignment,
        businessGoalAlignment: record.businessGoalAlignment,
        esgGoalAlignment: record.esgGoalAlignment,
        approvedBudget: record.financials.approvedBudget,
        equipmentAvailability: record.equipmentAvailability,
        laboratoryAvailability: record.laboratoryAvailability,
        technologyRisk: record.risk.technologyRisk,
        marketRisk: record.risk.marketRisk,
        financialRisk: record.risk.financialRisk,
        regulatoryRisk: record.risk.regulatoryRisk,
        operationalRisk: record.risk.operationalRisk,
        attachments: record.attachments,
      });
      setSeeded(true);
    }
  }, [editId, record, seeded]);

  const L: PortfolioLookups = lookupsQuery.data ?? {
    categories: [],
    strategicThemes: [],
    innovationFocusAreas: [],
    innovationTypes: [],
    technologyDomains: [],
    industries: [],
    markets: [],
    customerSegments: [],
    equipmentAvailability: [],
    laboratoryAvailability: [],
    executiveDecisions: [],
    fundingDecisions: [],
    priorities: [],
    managers: [],
    businessUnits: [],
    departments: [],
    financialYears: [],
    attachmentCategories: [],
  };

  const status = record?.status ?? "draft";
  const editable = ["draft", "revision_required"].includes(status);
  const activeInnerTab = (tab as string) ?? "overview";

  function patch(part: Partial<PortfolioFormInput>) {
    setInput((prev) => ({ ...prev, ...part }));
  }

  async function doSave() {
    setBusy("save");
    try {
      const rec = await innovationPortfolioService.saveDraft(input, record?.id);
      queryClient.invalidateQueries({ queryKey: ["innovation-portfolio"] });
      toast.success(
        `Saved · ${rec.portfolioId} — ${rec.projects.totalActiveProjects} project(s) rolled up.`,
      );
      if (!editId)
        navigate({
          to: "/development/research-innovation/innovation-portfolio/new",
          search: { id: rec.id },
        });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doRefresh() {
    if (!record) return;
    setBusy("refresh");
    try {
      await innovationPortfolioService.refresh(record.id);
      queryClient.invalidateQueries({ queryKey: ["innovation-portfolio"] });
      toast.success("Portfolio KPIs and AI analytics refreshed.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doSubmit() {
    if (!record) {
      toast.error("Save the portfolio first.");
      return;
    }
    setBusy("submit");
    try {
      await innovationPortfolioService.saveDraft(input, record.id);
      await innovationPortfolioService.submitForReview(record.id);
      queryClient.invalidateQueries({ queryKey: ["innovation-portfolio"] });
      toast.success("Submitted for executive portfolio review.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doReview() {
    if (!record) return;
    setBusy("review");
    try {
      const rec = await innovationPortfolioService.review({
        id: record.id,
        decision: reviewDecision,
        fundingDecision: reviewFunding,
        priority: reviewPriority,
        comments:
          reviewDecision !== "Approved" ? `${reviewDecision} by executive review` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["innovation-portfolio"] });
      setReviewOpen(false);
      toast.success(
        rec.status === "active"
          ? "Portfolio Activated — budget and resources released."
          : `${reviewDecision}`,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doResolveBudget(decision: FundingDecision) {
    if (!record) return;
    setBusy("budget");
    try {
      await innovationPortfolioService.resolveBudgetReview(record.id, decision);
      queryClient.invalidateQueries({ queryKey: ["innovation-portfolio"] });
      toast.success(`Budget decision recorded: ${decision}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (editId && !seeded && portfolioQuery.isLoading) {
    return (
      <AppShell
        title="Innovation Portfolio"
        breadcrumb="Research & Innovation Development"
        tabs={<InnovationAreaTabs sub={<PortfolioPageTabBar />} />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Innovation Portfolio"
      breadcrumb="Research & Innovation Development"
      description="Balance and prioritize the innovation portfolio across projects."
      tabs={<InnovationAreaTabs sub={<PortfolioPageTabBar />} />}
    >
      <div className="space-y-5">
        {/* ---------------------------- Record header ---------------------------- */}
        <div className="card-soft p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-3 xl:grid-cols-7">
              <HeaderCell label="Portfolio ID" value={record?.portfolioId ?? "—"} />
              <div className="xl:col-span-2">
                <Field label="Portfolio Name" required>
                  <TextInput
                    value={input.portfolioName}
                    onChange={(v) => patch({ portfolioName: v })}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <HeaderCell label="Portfolio Code" value={record?.portfolioCode ?? "—"} />
              <Field label="Portfolio Manager">
                <Select
                  value={input.portfolioManager}
                  onChange={(v) => patch({ portfolioManager: v })}
                  options={L.managers}
                  disabled={!editable}
                />
              </Field>
              <Field label="Business Unit">
                <Select
                  value={input.businessUnit}
                  onChange={(v) => patch({ businessUnit: v })}
                  options={L.businessUnits}
                  disabled={!editable}
                />
              </Field>
              <div>
                <Field label="Financial Year">
                  <Select
                    value={input.financialYear}
                    onChange={(v) => patch({ financialYear: v })}
                    options={L.financialYears}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={PORTFOLIO_STATUS_LABEL[status] ?? status} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob(
                    [
                      JSON.stringify(
                        {
                          code: record?.portfolioCode,
                          input,
                          kpi: record?.kpiDashboard,
                          ai: record?.aiAnalytics,
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: "application/json" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${record?.portfolioCode ?? "portfolio"}-report.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Report downloaded");
                }}
              >
                <Download className="h-4 w-4" /> Download Report
              </ErpButton>
              <ErpButton size="sm" loading={busy === "save"} disabled={!editable} onClick={doSave}>
                <Save className="h-4 w-4" /> {record ? "Save Portfolio" : "Create Portfolio"}
              </ErpButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={!record} onClick={doRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Rollup & AI
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!editable || !record} onClick={doSubmit}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Submit for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.message("Deleting portfolios isn't enabled yet.")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!record && (
            <div className="mt-4 grid gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3 sm:grid-cols-3">
              <Field label="Portfolio Category" required>
                <Select
                  value={input.portfolioCategory}
                  onChange={(v) => patch({ portfolioCategory: v })}
                  options={L.categories}
                />
              </Field>
              <Field label="Strategic Theme">
                <Select
                  value={input.strategicTheme}
                  onChange={(v) => patch({ strategicTheme: v })}
                  options={L.strategicThemes}
                />
              </Field>
              <Field label="Innovation Type">
                <Select
                  value={input.innovationType}
                  onChange={(v) => patch({ innovationType: v })}
                  options={L.innovationTypes}
                />
              </Field>
              <div className="sm:col-span-3">
                <p className="text-[11px] text-muted-foreground">
                  Click <strong>Create Portfolio</strong> to roll up approved Ideas, qualified
                  Opportunities, validated Design Thinking projects and validated Problems into this
                  portfolio.
                </p>
              </div>
            </div>
          )}

          {status === "under_review" && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
              <p className="text-xs font-semibold text-foreground">
                Awaiting Executive Portfolio Review
              </p>
              <ErpButton size="sm" onClick={() => setReviewOpen(true)}>
                Record Executive Decision
              </ErpButton>
            </div>
          )}
          {status === "budget_review" && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <p className="mb-2 text-xs font-semibold text-[oklch(0.45_0.15_75)]">
                Additional Budget Required — awaiting Finance Management decision.
              </p>
              <div className="flex flex-wrap gap-2">
                {L.fundingDecisions.map((f) => (
                  <ErpButton
                    key={f}
                    size="sm"
                    variant="outline"
                    loading={busy === "budget"}
                    onClick={() => doResolveBudget(f as FundingDecision)}
                  >
                    {f}
                  </ErpButton>
                ))}
              </div>
            </div>
          )}
          {record?.reviewNotes && status === "revision_required" && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-[oklch(0.45_0.15_75)]">
              <span className="font-semibold">Review note:</span> {record.reviewNotes}
            </div>
          )}
        </div>

        {/* --------------------------- In-page tab bar --------------------------- */}
        <PortfolioInnerTabs active={activeInnerTab as "overview"} id={record?.id ?? editId} />

        {!record ? (
          <div className="card-soft grid place-items-center px-6 py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Create the portfolio to see the rolled-up Overview.
            </p>
          </div>
        ) : activeInnerTab !== "overview" ? (
          <PlaceholderTab tab={activeInnerTab} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* ------------------------------ Overview main ------------------------------ */}
            <div className="min-w-0 space-y-5">
              {/* KPI strip */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                  label="Total Projects"
                  value={record.projects.totalActiveProjects.toString()}
                  neutralText="Rolled up live"
                  icon={<Briefcase className="h-5 w-5" />}
                  iconBg="bg-primary/10"
                  iconColor="text-primary"
                />
                <StatCard
                  label="Total Budget"
                  value={formatCurrency(record.financials.approvedBudget, true)}
                  neutralText="Approved"
                  icon={<Wallet className="h-5 w-5" />}
                  iconBg="bg-[#3B82F6]/10"
                  iconColor="text-[#3B82F6]"
                />
                <StatCard
                  label="Budget Utilized"
                  value={formatCurrency(record.financials.budgetUtilized, true)}
                  neutralText={`${record.financials.approvedBudget > 0 ? Math.round((record.financials.budgetUtilized / record.financials.approvedBudget) * 100) : 0}% utilization`}
                  icon={<Gauge className="h-5 w-5" />}
                  iconBg="bg-[#22C55E]/10"
                  iconColor="text-[#22C55E]"
                />
                <StatCard
                  label="Est. Revenue Pipeline"
                  value={formatCurrency(record.financials.estimatedRevenue, true)}
                  neutralText={`ROI ${record.financials.estimatedROI}%`}
                  icon={<Sparkles className="h-5 w-5" />}
                  iconBg="bg-[#F59E0B]/10"
                  iconColor="text-[#F59E0B]"
                />
                <StatCard
                  label="Overall Portfolio Score"
                  value={`${record.aiAnalytics?.healthScore ?? 0}/100`}
                  neutralText={
                    record.aiAnalytics?.healthScore != null && record.aiAnalytics.healthScore >= 70
                      ? "High Performing"
                      : record.aiAnalytics && record.aiAnalytics.healthScore >= 45
                        ? "Developing"
                        : "Needs Attention"
                  }
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  iconBg="bg-[#7C5CFF]/10"
                  iconColor="text-[#7C5CFF]"
                />
                <StatCard
                  label="Success Rate"
                  value={`${record.performance.successRate}%`}
                  neutralText="To Feasibility Study"
                  icon={<ClipboardList className="h-5 w-5" />}
                  iconBg="bg-[#22C55E]/10"
                  iconColor="text-[#22C55E]"
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {/* Composition donut */}
                <div className="card-soft p-5">
                  <CardHeader title="Portfolio Composition" />
                  {record.composition.length === 0 ? (
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                      No projects yet
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-col items-center gap-4">
                      <div className="relative h-[120px] w-[120px] shrink-0">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={record.composition}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={34}
                              outerRadius={54}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {record.composition.map((s) => (
                                <Cell key={s.name} fill={s.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                          <div>
                            <div className="font-display text-lg font-bold text-foreground">
                              {record.projects.totalActiveProjects}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                              Projects
                            </div>
                          </div>
                        </div>
                      </div>
                      <ul className="w-full space-y-1 text-[11px]">
                        {record.composition.map((s) => {
                          const pct = record.projects.totalActiveProjects
                            ? Math.round((s.value / record.projects.totalActiveProjects) * 100)
                            : 0;
                          return (
                            <li key={s.name} className="flex items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-1.5 truncate text-muted-foreground">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: s.color }}
                                />
                                {s.name}
                              </span>
                              <span className="shrink-0 font-semibold tabular text-foreground">
                                {pct}% ({s.value})
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => toast.message("Full breakdown view coming soon.")}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    View full breakdown →
                  </button>
                </div>

                {/* Stage funnel */}
                <div className="card-soft p-5">
                  <CardHeader title="Projects by Stage" />
                  <div className="mt-3 space-y-1.5">
                    {record.funnel.map((f, i) => {
                      const maxCount = Math.max(1, record.funnel[0]?.count ?? 1);
                      const width = Math.max(12, Math.round((f.count / maxCount) * 100));
                      return (
                        <div key={f.stage} className="flex items-center gap-2">
                          <div className="h-7 flex-1 overflow-hidden rounded-md bg-muted">
                            <div
                              className="flex h-full items-center rounded-md px-2 text-[11px] font-bold text-white"
                              style={{
                                width: `${width}%`,
                                background:
                                  COMPOSITION_FUNNEL_COLORS[i % COMPOSITION_FUNNEL_COLORS.length],
                              }}
                            >
                              {f.count}
                            </div>
                          </div>
                          <span className="w-28 shrink-0 text-[11px] text-muted-foreground">
                            {f.stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    to="/development/research-innovation/innovation-portfolio/new"
                    search={{ id: record.id, tab: "projects" }}
                    className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Go to Projects →
                  </Link>
                </div>

                {/* Investment vs Return */}
                <div className="card-soft p-5">
                  <CardHeader title="Investment vs Return" />
                  <div className="mt-3 h-[170px] w-full">
                    <ResponsiveContainer>
                      <ComposedChart
                        data={record.investmentReturn}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis
                          dataKey="year"
                          stroke="#9CA3AF"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatCurrency(v, true)}
                          width={50}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 11,
                          }}
                          formatter={(v: number) => formatCurrency(v)}
                        />
                        <Bar
                          dataKey="investment"
                          fill="#8B5CF6"
                          radius={[4, 4, 0, 0]}
                          name="Investment"
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Est. Revenue"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <button
                    onClick={() => toast.message("Full financial analysis coming soon.")}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    View Financial Analysis →
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                {/* Top active projects */}
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Top Active Projects</h3>
                    <span className="text-xs text-muted-foreground">
                      {record.projects.rows.length} shown
                    </span>
                  </div>
                  {record.projects.rows.length === 0 ? (
                    <div className="card-soft grid place-items-center py-10 text-center text-xs text-muted-foreground">
                      No projects rolled up yet.
                    </div>
                  ) : (
                    <DataTable<PortfolioProjectRow>
                      data={record.projects.rows.slice(0, 5)}
                      columns={[
                        {
                          key: "id",
                          header: "Project",
                          cell: (r) => (
                            <div>
                              <span className="block font-semibold text-foreground">{r.title}</span>
                              <span className="text-xs text-muted-foreground">{r.moduleCode}</span>
                            </div>
                          ),
                        },
                        {
                          key: "stage",
                          header: "Stage",
                          cell: (r) => <StageBadge stage={r.stage} />,
                        },
                        {
                          key: "category",
                          header: "Category",
                          cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
                        },
                        {
                          key: "budget",
                          header: "Budget",
                          align: "right",
                          cell: (r) => (
                            <span className="tabular text-foreground">
                              {formatCurrency(r.budget, true)}
                            </span>
                          ),
                        },
                        {
                          key: "progress",
                          header: "Progress",
                          cell: (r) => (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${r.progress}%` }}
                                />
                              </div>
                              <span className="text-[11px] tabular text-muted-foreground">
                                {r.progress}%
                              </span>
                            </div>
                          ),
                        },
                        {
                          key: "score",
                          header: "Score",
                          align: "center",
                          cell: (r) => (
                            <span className="font-bold tabular text-foreground">
                              {r.overallScore}
                            </span>
                          ),
                        },
                        {
                          key: "owner",
                          header: "Owner",
                          cell: (r) => <span className="text-muted-foreground">{r.owner}</span>,
                        },
                      ]}
                      mobileCard={(r) => (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{r.title}</div>
                            <div className="text-xs text-muted-foreground">{r.moduleCode}</div>
                          </div>
                          <StageBadge stage={r.stage} />
                        </div>
                      )}
                    />
                  )}
                  <Link
                    to="/development/research-innovation/innovation-portfolio/new"
                    search={{ id: record.id, tab: "projects" }}
                    className="inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    View All Projects →
                  </Link>
                </div>

                {/* Risk distribution */}
                <div className="card-soft p-5">
                  <CardHeader title="Risk Distribution" />
                  <div className="mt-3 flex flex-col items-center gap-4">
                    <div className="relative h-[130px] w-[130px] shrink-0">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={record.risk.distribution}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={36}
                            outerRadius={56}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {record.risk.distribution.map((s) => (
                              <Cell key={s.name} fill={s.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                        <div>
                          <div className="font-display text-lg font-bold text-foreground">
                            {record.projects.totalActiveProjects}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            Projects
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul className="w-full space-y-1 text-[11px]">
                      {record.risk.distribution.map((s) => {
                        const pct = record.projects.totalActiveProjects
                          ? Math.round((s.value / record.projects.totalActiveProjects) * 100)
                          : 0;
                        return (
                          <li key={s.name} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: s.color }}
                              />
                              {s.name}
                            </span>
                            <span className="font-semibold tabular text-foreground">
                              {s.value} ({pct}%)
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <button
                    onClick={() => toast.message("Risk register coming soon.")}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    View Risk Register →
                  </button>
                </div>
              </div>

              {/* Bottom metric strip */}
              {record.kpiDashboard && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <MetricTile
                    icon={Sparkles}
                    label="Innovation Velocity"
                    value={`${record.kpiDashboard.innovationVelocity}/100`}
                    sub={record.kpiDashboard.innovationVelocity >= 60 ? "High" : "Developing"}
                    color="bg-primary/10 text-primary"
                  />
                  <MetricTile
                    icon={Gauge}
                    label="Average TRL"
                    value={`${record.kpiDashboard.averageTRL}/9`}
                    sub="Developing"
                    color="bg-[#3B82F6]/10 text-[#3B82F6]"
                  />
                  <MetricTile
                    icon={ClipboardList}
                    label="Portfolio ROI"
                    value={`${record.kpiDashboard.portfolioROI}%`}
                    sub={record.kpiDashboard.portfolioROI >= 20 ? "Good" : "Building"}
                    color="bg-[#22C55E]/10 text-[#22C55E]"
                  />
                  <MetricTile
                    icon={Briefcase}
                    label="Innovation Index"
                    value={`${record.kpiDashboard.innovationIndex}/100`}
                    sub={record.kpiDashboard.innovationIndex >= 70 ? "High" : "Developing"}
                    color="bg-[#F59E0B]/10 text-[#F59E0B]"
                  />
                  <MetricTile
                    icon={MapIcon}
                    label="Commercialization Readiness"
                    value={`${record.kpiDashboard.commercializationReadiness}%`}
                    sub="On Track"
                    color="bg-[#7C5CFF]/10 text-[#7C5CFF]"
                  />
                  <MetricTile
                    icon={ShieldAlert}
                    label="ESG Impact Score"
                    value={`${record.kpiDashboard.esgImpactScore}/100`}
                    sub="Good"
                    color="bg-[#22C55E]/10 text-[#22C55E]"
                  />
                </div>
              )}
            </div>

            {/* ------------------------------- Sidebar ------------------------------- */}
            <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
              <div className="card-soft p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    AI Portfolio Insights
                  </h4>
                </div>
                {record.aiAnalytics ? (
                  <>
                    <div className="flex items-center gap-4">
                      <ScoreRing value={record.aiAnalytics.healthScore} size={96} />
                      <dl className="min-w-0 flex-1 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">AI Health Score</dt>
                          <dd className="font-bold text-foreground">
                            {record.aiAnalytics.healthScore}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">AI Growth Potential</dt>
                          <dd className="font-bold text-foreground">
                            {record.aiAnalytics.growthPotential}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">AI Risk Level</dt>
                          <dd className="font-bold text-foreground">
                            {record.aiAnalytics.riskLevel}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">AI ROI Potential</dt>
                          <dd className="font-bold text-foreground">
                            {record.aiAnalytics.roiPotential}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="mt-3 rounded-lg border border-border p-3">
                      <p className="text-[11px] font-bold text-foreground">AI Recommendation</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {record.aiAnalytics.recommendation}
                      </p>
                    </div>
                    <button
                      onClick={() => setHistoryOpen(true)}
                      className="mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      View AI Insights →
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Save the portfolio to generate AI insights.
                  </p>
                )}
              </div>

              <div className="card-soft p-5">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Strategic Alignment
                </h4>
                <div className="space-y-3">
                  <AlignBar
                    label="Corporate Objectives"
                    value={input.corporateObjectiveAlignment}
                  />
                  <AlignBar
                    label="Strategic Initiatives"
                    value={input.strategicInitiativeAlignment}
                  />
                  <AlignBar label="Business Goals" value={input.businessGoalAlignment} />
                  <AlignBar label="ESG Goals" value={input.esgGoalAlignment} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs font-bold text-foreground">Overall Alignment Score</span>
                  <span className="font-display text-lg font-bold text-primary">
                    {record.alignmentScore}
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </span>
                </div>
                {editable && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(
                      [
                        "corporateObjectiveAlignment",
                        "strategicInitiativeAlignment",
                        "businessGoalAlignment",
                        "esgGoalAlignment",
                      ] as const
                    ).map((k) => (
                      <label key={k} className="text-[10px] text-muted-foreground">
                        {k.replace("Alignment", "")}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={input[k]}
                          onChange={(e) =>
                            patch({ [k]: Number(e.target.value) } as Partial<PortfolioFormInput>)
                          }
                          className="w-full"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-soft p-5">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </h4>
                <div className="space-y-1">
                  <QuickAction
                    icon={Briefcase}
                    label="Add Project to Portfolio"
                    onClick={() =>
                      toast.message(
                        "Projects are rolled up automatically from the pipeline modules.",
                      )
                    }
                  />
                  <QuickAction
                    icon={Wallet}
                    label="Allocate Budget"
                    disabled={status !== "under_review" && status !== "active"}
                    onClick={() =>
                      status === "under_review"
                        ? setReviewOpen(true)
                        : toast.success("Budget already allocated for this active portfolio.")
                    }
                  />
                  <QuickAction
                    icon={Users2}
                    label="Resource Planning"
                    onClick={() => toast.message("Resource planning isn't wired to a backend yet.")}
                  />
                  <QuickAction
                    icon={ShieldAlert}
                    label="Risk Assessment"
                    onClick={() =>
                      toast.message("Detailed risk assessment isn't wired to a backend yet.")
                    }
                  />
                  <QuickAction
                    icon={ClipboardList}
                    label="Generate Portfolio Report"
                    onClick={doRefresh}
                  />
                  <QuickAction
                    icon={MapIcon}
                    label="Portfolio Roadmap"
                    onClick={() => fileRef.current?.click()}
                  />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={() => toast.success("Roadmap attached (metadata only).")}
                />
              </div>
            </aside>
          </div>
        )}

        {/* -------------------------------- Footer -------------------------------- */}
        <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
          <FooterItem
            label="Created By"
            value={record?.createdBy ?? "Priya Sharma"}
            sub={record ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}
          />
          <FooterItem
            label="Last Modified By"
            value={record?.lastModifiedBy ?? "—"}
            sub={record ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}
          />
          <FooterItem label="Workflow Stage" value={PORTFOLIO_STATUS_LABEL[status] ?? status} />
          <FooterItem label="Version" value={`${record?.version ?? 1}.0`} />
          <ErpButton size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
            <HistoryIcon className="h-4 w-4" /> View Activity History
          </ErpButton>
        </div>
      </div>

      {/* Activity / AI insights dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>{record?.portfolioId ?? "Unsaved portfolio"}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {(record?.auditTrail ?? []).length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              [...(record?.auditTrail ?? [])].reverse().map((a, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">{a.event}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Executive review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Executive Portfolio Review</DialogTitle>
            <DialogDescription>{record?.portfolioId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Executive Decision">
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as ExecutiveDecision)}
                options={L.executiveDecisions}
              />
            </Field>
            <Field label="Funding Decision">
              <Select
                value={reviewFunding}
                onChange={(v) => setReviewFunding(v as FundingDecision)}
                options={L.fundingDecisions}
              />
            </Field>
            <Field label="Portfolio Priority">
              <Select value={reviewPriority} onChange={setReviewPriority} options={L.priorities} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <ErpButton variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton loading={busy === "review"} onClick={doReview}>
              Record Decision
            </ErpButton>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

const COMPOSITION_FUNNEL_COLORS = ["#0a3c75", "#3b82f6", "#22c55e", "#f59e0b", "#7c5cff"];

function PlaceholderTab({ tab }: { tab: string }) {
  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
  return (
    <div className="card-soft grid place-items-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-foreground">{label}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        This tab isn't built yet — the Overview tab covers the data this module rolls up today.
      </p>
    </div>
  );
}
function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Briefcase;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-primary" /> {label}
    </button>
  );
}
function HeaderCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}
function FooterItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
