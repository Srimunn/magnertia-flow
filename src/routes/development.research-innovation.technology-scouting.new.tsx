import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  Bell,
  Brain,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Landmark,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Radar,
  Save,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  TechScoutingPageTabBar,
  TechScoutingStageTracker,
  TECH_SCOUTING_STATUS_LABEL,
} from "@/components/erp/TechScoutingTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
import { ErpButton } from "@/components/erp/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { technologyScoutingService } from "@/services";
import type {
  TechnologyScoutingRecord,
  TechScoutingApprovalDecision,
  TechScoutingFormInput,
  TechScoutingStage,
  TechScoutingStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/technology-scouting/new")({
  head: () => ({ meta: [{ title: "Technology Scouting Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: TechScoutingFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: TechScoutingStatus[] = [
  "identified",
  "under_evaluation",
  "technical_review",
  "business_review",
  "ip_review",
];
const STAGE_LABEL: Record<TechScoutingStage, string> = {
  identification: "Technology Identification",
  technical_assessment: "Technical Assessment",
  market_assessment: "Market Assessment",
  ip_risk_assessment: "IP & Risk Assessment",
};

const EMPTY: TechScoutingFormInput = {
  technologyScout: "Rohit Verma",
  businessUnit: "",
  department: "",
  scoutingDate: new Date().toISOString().slice(0, 10),
  linkedOpportunityId: null,
  info: {
    technologyName: "",
    technologyCategory: "",
    technologySubcategory: "",
    technologyDomain: "",
    technologyDescription: "",
    keywords: [],
    technologyMaturity: "",
    trl: "",
  },
  source: {
    sourceType: "",
    organizationName: "",
    country: "",
    website: "",
    contactPerson: "",
    publicationReference: "",
    sourceReliability: 6,
  },
  market: {
    industry: "",
    targetMarket: "",
    marketTrend: "",
    adoptionLevel: "",
    marketGrowthRate: 0,
    marketSize: 0,
    competitorsUsingTechnology: "",
  },
  technical: {
    coreTechnology: "",
    keyFeatures: "",
    technicalAdvantages: "",
    technicalLimitations: "",
    requiredInfrastructure: "",
    integrationComplexity: "",
    compatibility: 6,
  },
  ip: {
    patentAvailable: false,
    patentNumber: "",
    patentOwner: "",
    ipStatus: "",
    freedomToOperate: "",
    licensingAvailability: "",
  },
  business: {
    businessOpportunity: "",
    potentialApplications: "",
    strategicFit: 6,
    revenuePotential: 0,
    investmentEstimate: 0,
    timeToCommercialization: 2,
  },
  risk: {
    technologyRisk: 4,
    marketRisk: 4,
    regulatoryRisk: 4,
    supplyChainRisk: 4,
    cybersecurityRisk: 4,
  },
  attachments: [],
  technologyOwner: "",
  targetProject: "",
  followUpDate: "",
  recommendedAction: "",
};

function recordToInput(r: TechnologyScoutingRecord): TechScoutingFormInput {
  return {
    technologyScout: r.technologyScout,
    businessUnit: r.businessUnit,
    department: r.department,
    scoutingDate: r.scoutingDate,
    linkedOpportunityId: r.linkedOpportunityId,
    info: r.info,
    source: r.source,
    market: r.market,
    technical: r.technical,
    ip: r.ip,
    business: r.business,
    risk: r.risk,
    attachments: r.attachments,
    technologyOwner: r.decision.technologyOwner,
    targetProject: r.decision.targetProject,
    followUpDate: r.decision.followUpDate,
    recommendedAction: r.decision.recommendedAction,
  };
}

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
function TextInput(p: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange?.(e.target.value)}
    />
  );
}
function TextArea(p: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y border-border")}
      rows={p.rows ?? 2}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange(e.target.value)}
    />
  );
}
function NumberInput(p: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
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
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-7", p.suffix && "pr-8")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
      {p.suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {p.suffix}
        </span>
      )}
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
function Toggle(p: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={p.value}
      disabled={p.disabled}
      onClick={() => p.onChange(!p.value)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
        p.value ? "bg-primary" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          p.value ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
function KeywordInput(p: {
  selected: string[];
  suggestions: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = (kw: string) => {
    const v = kw.trim();
    if (!v || p.selected.includes(v)) return;
    p.onChange([...p.selected, v]);
    setDraft("");
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {p.selected.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
          >
            {kw}
            {!p.disabled && (
              <button
                type="button"
                className="text-primary/60 hover:text-primary"
                onClick={() => p.onChange(p.selected.filter((k) => k !== kw))}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {p.selected.length === 0 && (
          <span className="text-xs text-muted-foreground">No keywords yet</span>
        )}
      </div>
      {!p.disabled && (
        <div className="flex gap-1.5">
          <input
            className={cn(INPUT, "border-border")}
            placeholder="Add keyword and press Enter…"
            value={draft}
            list="ts-keyword-suggestions"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
          />
          <datalist id="ts-keyword-suggestions">
            {p.suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}
function SectionCard(p: { n: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-soft space-y-3 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
          {p.n}
        </span>
        {p.title}
      </h3>
      {p.children}
    </section>
  );
}
function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={rad} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={rad}
          fill="none"
          stroke={color}
          strokeWidth="8"
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
function AIScoreRow({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-success" : value >= 45 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">/100</span>
      </span>
    </div>
  );
}

function riskLevelOf(risk: TechScoutingFormInput["risk"]): "Low" | "Moderate" | "High" {
  const avg =
    (risk.technologyRisk +
      risk.marketRisk +
      risk.regulatoryRisk +
      risk.supplyChainRisk +
      risk.cybersecurityRisk) /
    5;
  if (avg >= 6.5) return "High";
  if (avg >= 4) return "Moderate";
  return "Low";
}

/* ================================== Page ================================== */
function TechScoutingFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["technology-scouting", "lookups"],
    queryFn: () => technologyScoutingService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["technology-scouting", "record", id],
    queryFn: () => technologyScoutingService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["technology-scouting", "source-opportunities"],
    queryFn: () => technologyScoutingService.fetchSourceOpportunities(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<TechScoutingFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: TechScoutingStatus = record?.status ?? "identified";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "identification";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<TechScoutingApprovalDecision>("Approved");
  const [reviewNextAction, setReviewNextAction] = useState("Conduct Feasibility Study");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Research Papers");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["technology-scouting"] });

  const saveMut = useMutation({
    mutationFn: () => technologyScoutingService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(
        record ? "Scouting record saved." : `Technology Scouting ${r.scoutingId} created.`,
      );
      if (!record) {
        navigate({
          to: "/development/research-innovation/technology-scouting/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => technologyScoutingService.completeStage(record!.id, currentStage),
    onSuccess: (r) => {
      invalidate();
      toast.success(
        `${STAGE_LABEL[currentStage]} completed — AI analysis updated (score ${r.decision.overallTechnologyScore}/100).`,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => technologyScoutingService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Technology evaluation submitted for executive review.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      technologyScoutingService.review({
        id: record!.id,
        decision: reviewDecision,
        nextAction: reviewNextAction,
        comments: reviewComments || undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "approved")
        toast.success("Technology approved and added to the Innovation Portfolio.");
      else if (r.status === "monitoring") toast.success("Technology added to the watchlist.");
      else if (r.status === "rejected") toast.success("Technology rejected and archived.");
      else toast.success("Further evaluation requested — record reopened.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const monitorMut = useMutation({
    mutationFn: () => technologyScoutingService.runMonitoringScan(record!.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(`Monitoring scan complete — ${r.monitoring.alerts.length} alert(s) tracked.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const closeMut = useMutation({
    mutationFn: () => technologyScoutingService.closeRecord(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Scouting record closed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    monitorMut.isPending ||
    closeMut.isPending;

  const set = <K extends keyof TechScoutingFormInput>(key: K, value: TechScoutingFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setInfo = (patch: Partial<TechScoutingFormInput["info"]>) =>
    setForm((f) => ({ ...f, info: { ...f.info, ...patch } }));
  const setSource = (patch: Partial<TechScoutingFormInput["source"]>) =>
    setForm((f) => ({ ...f, source: { ...f.source, ...patch } }));
  const setMarket = (patch: Partial<TechScoutingFormInput["market"]>) =>
    setForm((f) => ({ ...f, market: { ...f.market, ...patch } }));
  const setTechnical = (patch: Partial<TechScoutingFormInput["technical"]>) =>
    setForm((f) => ({ ...f, technical: { ...f.technical, ...patch } }));
  const setIP = (patch: Partial<TechScoutingFormInput["ip"]>) =>
    setForm((f) => ({ ...f, ip: { ...f.ip, ...patch } }));
  const setBusiness = (patch: Partial<TechScoutingFormInput["business"]>) =>
    setForm((f) => ({ ...f, business: { ...f.business, ...patch } }));
  const setRisk = (patch: Partial<TechScoutingFormInput["risk"]>) =>
    setForm((f) => ({ ...f, risk: { ...f.risk, ...patch } }));

  const applySourceOpportunity = (oppId: string) => {
    const opp = (sourcesQuery.data ?? []).find((o) => o.id === oppId);
    set("linkedOpportunityId", oppId || null);
    if (!opp) return;
    setForm((f) => ({
      ...f,
      linkedOpportunityId: oppId,
      info: {
        ...f.info,
        technologyName: f.info.technologyName || opp.emergingTechnology || opp.name,
        technologyDescription: f.info.technologyDescription || opp.description,
        technologyDomain: f.info.technologyDomain || opp.technologyDomain,
      },
      market: {
        ...f.market,
        industry: f.market.industry || opp.industry,
        targetMarket: f.market.targetMarket || opp.targetMarket,
        marketSize: f.market.marketSize || opp.marketSize,
        marketGrowthRate: f.market.marketGrowthRate || opp.growthRate,
      },
    }));
    toast.success(`Context loaded from ${opp.opportunityCode}.`);
  };

  const addAttachment = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "file";
    set("attachments", [
      ...form.attachments,
      {
        id: crypto.randomUUID(),
        category: attachCategory,
        filename: file.name,
        fileType: ext,
        uploadedBy: form.technologyScout || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const downloadReport = () => {
    if (!record) return;
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.scoutingId}-scouting-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Scouting report downloaded.");
  };

  const liveRiskLevel = riskLevelOf(form.risk);
  const ai = record?.aiAnalysis ?? null;
  const decision = record?.decision ?? null;
  const overall = decision?.overallTechnologyScore ?? 0;
  const potentialLabel =
    overall >= 70 ? "High Potential" : overall >= 50 ? "Medium Potential" : "Early Signal";

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Technology Scouting"
        breadcrumb="Research & Innovation Development · Technology Scouting"
        description="Technology Scouting Form"
        tabs={<TechScoutingPageTabBar />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Technology Scouting"
      breadcrumb="Research & Innovation Development · Technology Scouting"
      description="Technology Scouting Form"
      tabs={<TechScoutingPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Scouting ID">
              <TextInput value={record?.scoutingId ?? "Auto-generated"} disabled />
            </Field>
            <Field label="Technology Scout" required>
              <Select
                value={form.technologyScout}
                onChange={(v) => set("technologyScout", v)}
                options={lookups?.scouts ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Business Unit" required>
              <Select
                value={form.businessUnit}
                onChange={(v) => set("businessUnit", v)}
                options={lookups?.businessUnits ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Department" required>
              <Select
                value={form.department}
                onChange={(v) => set("department", v)}
                options={lookups?.departments ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Scouting Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.scoutingDate}
                disabled={!editable}
                onChange={(e) => set("scoutingDate", e.target.value)}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Technology Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={TECH_SCOUTING_STATUS_LABEL[status]} />
              </div>
              <span className="block text-[10px] text-muted-foreground">Workflow-driven</span>
            </div>
          </div>

          {!record && (
            <div className="mt-3 grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Technology Opportunity (optional — prefills context)">
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedOpportunityId ?? ""}
                  onChange={(e) => applySourceOpportunity(e.target.value)}
                >
                  <option value="">Standalone scouting (external source)</option>
                  {(sourcesQuery.data ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.opportunityCode} — {o.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  Creating retrieves knowledge, research, patent, market, vendor and strategy
                  context automatically.
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  {record.linkedOpportunityCode && (
                    <span className="mr-3">
                      Source: <span className="font-semibold">{record.linkedOpportunityCode}</span>
                    </span>
                  )}
                  Next action: <span className="font-semibold">{record.nextAction}</span>
                </>
              ) : (
                "Fill the sections below, then create the scouting record to start Stage 1."
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editable && (
                <ErpButton onClick={() => saveMut.mutate()} disabled={busy}>
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {record ? "Save Draft" : "Create Technology Scouting"}
                </ErpButton>
              )}
              {record && editable && !allStagesDone && (
                <ErpButton variant="outline" onClick={() => stageMut.mutate()} disabled={busy}>
                  {stageMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Complete {STAGE_LABEL[currentStage]}
                </ErpButton>
              )}
              {record && editable && allStagesDone && (
                <ErpButton onClick={() => submitMut.mutate()} disabled={busy}>
                  {submitMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Technology Evaluation
                </ErpButton>
              )}
              {record && status === "executive_review" && (
                <ErpButton onClick={() => setReviewOpen(true)} disabled={busy}>
                  <Landmark className="h-4 w-4" /> Record Executive Decision
                </ErpButton>
              )}
              {record && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["approved", "monitoring"].includes(status) && (
                      <DropdownMenuItem onClick={() => monitorMut.mutate()}>
                        <Radar className="h-4 w-4" /> Run Monitoring Scan
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={downloadReport}>
                      <Download className="h-4 w-4" /> Download Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {["approved", "monitoring", "rejected"].includes(status) && (
                      <DropdownMenuItem onClick={() => closeMut.mutate()}>
                        <Archive className="h-4 w-4" /> Close Record
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* --------------------------- Status tracker --------------------------- */}
        <TechScoutingStageTracker status={status} />

        {/* ---------------------------- Status banners --------------------------- */}
        {record && status === "executive_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Executive Technology Review
                </div>
                <div className="text-xs text-muted-foreground">
                  Innovation Director and CTO decide: approve, monitor, request further evaluation,
                  or reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Executive Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && ["approved", "monitoring"].includes(status) && (
          <div className="card-soft space-y-2 border-l-4 border-l-primary p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Bell className="h-4 w-4 text-primary" /> Continuous Technology Monitoring
                <span className="text-xs font-normal text-muted-foreground">
                  {record.monitoring.lastCheckedAt
                    ? `Last scan ${new Date(record.monitoring.lastCheckedAt).toLocaleString("en-IN")}`
                    : "No scan yet"}
                </span>
              </div>
              <ErpButton variant="outline" onClick={() => monitorMut.mutate()} disabled={busy}>
                {monitorMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Radar className="h-4 w-4" />
                )}
                Run Monitoring Scan
              </ErpButton>
            </div>
            {record.monitoring.alerts.length > 0 ? (
              <ul className="grid gap-1.5 md:grid-cols-2">
                {record.monitoring.alerts.slice(0, 4).map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                    <span>
                      <span className="font-semibold text-foreground">{a.type}:</span>{" "}
                      <span className="text-muted-foreground">{a.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Run a scan to surface technology updates, new competitors, patent alerts and market
                alerts.
              </p>
            )}
          </div>
        )}
        {record && record.reviewComments && ["under_evaluation"].includes(status) && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Review feedback: </span>
            <span className="text-muted-foreground">{record.reviewComments}</span>
          </div>
        )}

        {/* ------------------------------ Main grid ------------------------------ */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_330px]">
          {/* Form sections */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionCard n={1} title="Technology Information">
              <Field label="Technology Name" required>
                <TextInput
                  value={form.info.technologyName}
                  onChange={(v) => setInfo({ technologyName: v })}
                  disabled={!editable}
                  placeholder="e.g. Solid-State Battery Technology"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Technology Category" required>
                  <Select
                    value={form.info.technologyCategory}
                    onChange={(v) => setInfo({ technologyCategory: v })}
                    options={lookups?.technologyCategories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Technology Subcategory" required>
                  <Select
                    value={form.info.technologySubcategory}
                    onChange={(v) => setInfo({ technologySubcategory: v })}
                    options={lookups?.technologySubcategories ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Technology Domain" required>
                <Select
                  value={form.info.technologyDomain}
                  onChange={(v) => setInfo({ technologyDomain: v })}
                  options={lookups?.technologyDomains ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Technology Description" required>
                <TextArea
                  value={form.info.technologyDescription}
                  onChange={(v) => setInfo({ technologyDescription: v })}
                  rows={3}
                  disabled={!editable}
                />
              </Field>
              <Field label="Keywords" required>
                <KeywordInput
                  selected={form.info.keywords}
                  suggestions={lookups?.keywordSuggestions ?? []}
                  onChange={(v) => setInfo({ keywords: v })}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Technology Maturity" required>
                  <Select
                    value={form.info.technologyMaturity}
                    onChange={(v) => setInfo({ technologyMaturity: v })}
                    options={lookups?.technologyMaturities ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Technology Readiness Level (TRL)" required>
                  <Select
                    value={form.info.trl}
                    onChange={(v) => setInfo({ trl: v })}
                    options={lookups?.trlLevels ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n={2} title="Source Information">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Source Type" required>
                  <Select
                    value={form.source.sourceType}
                    onChange={(v) => setSource({ sourceType: v })}
                    options={lookups?.sourceTypes ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Organization Name" required>
                  <TextInput
                    value={form.source.organizationName}
                    onChange={(v) => setSource({ organizationName: v })}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country" required>
                  <Select
                    value={form.source.country}
                    onChange={(v) => setSource({ country: v })}
                    options={lookups?.countries ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Website" required>
                  <TextInput
                    value={form.source.website}
                    onChange={(v) => setSource({ website: v })}
                    disabled={!editable}
                    placeholder="https://…"
                  />
                </Field>
              </div>
              <Field label="Contact Person" required>
                <Select
                  value={form.source.contactPerson}
                  onChange={(v) => setSource({ contactPerson: v })}
                  options={lookups?.contactPersons ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Publication / Patent Reference" required>
                <TextInput
                  value={form.source.publicationReference}
                  onChange={(v) => setSource({ publicationReference: v })}
                  disabled={!editable}
                />
              </Field>
              <Field label="Source Reliability" required>
                <StarRating
                  value={form.source.sourceReliability}
                  onChange={(v) => setSource({ sourceReliability: v })}
                  readOnly={!editable}
                  aria-label="Source reliability"
                />
              </Field>
            </SectionCard>

            <SectionCard n={3} title="Market Intelligence">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Industry" required>
                  <Select
                    value={form.market.industry}
                    onChange={(v) => setMarket({ industry: v })}
                    options={lookups?.industries ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Target Market" required>
                  <Select
                    value={form.market.targetMarket}
                    onChange={(v) => setMarket({ targetMarket: v })}
                    options={lookups?.targetMarkets ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Market Trend" required>
                  <Select
                    value={form.market.marketTrend}
                    onChange={(v) => setMarket({ marketTrend: v })}
                    options={lookups?.marketTrends ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Adoption Level" required>
                  <Select
                    value={form.market.adoptionLevel}
                    onChange={(v) => setMarket({ adoptionLevel: v })}
                    options={lookups?.adoptionLevels ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Market Growth Rate" required>
                  <NumberInput
                    value={form.market.marketGrowthRate}
                    onChange={(v) => setMarket({ marketGrowthRate: v })}
                    suffix="%"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Market Size" required>
                  <NumberInput
                    value={form.market.marketSize}
                    onChange={(v) => setMarket({ marketSize: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Competitors Using Technology" required>
                <TextArea
                  value={form.market.competitorsUsingTechnology}
                  onChange={(v) => setMarket({ competitorsUsingTechnology: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            <SectionCard n={4} title="Technical Assessment">
              <Field label="Core Technology" required>
                <TextArea
                  value={form.technical.coreTechnology}
                  onChange={(v) => setTechnical({ coreTechnology: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Key Features" required>
                <TextArea
                  value={form.technical.keyFeatures}
                  onChange={(v) => setTechnical({ keyFeatures: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Technical Advantages" required>
                <TextArea
                  value={form.technical.technicalAdvantages}
                  onChange={(v) => setTechnical({ technicalAdvantages: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Technical Limitations" required>
                <TextArea
                  value={form.technical.technicalLimitations}
                  onChange={(v) => setTechnical({ technicalLimitations: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Required Infrastructure" required>
                <TextArea
                  value={form.technical.requiredInfrastructure}
                  onChange={(v) => setTechnical({ requiredInfrastructure: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 items-end gap-3">
                <Field label="Integration Complexity" required>
                  <Select
                    value={form.technical.integrationComplexity}
                    onChange={(v) => setTechnical({ integrationComplexity: v })}
                    options={lookups?.integrationComplexities ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Compatibility" required>
                  <StarRating
                    value={form.technical.compatibility}
                    onChange={(v) => setTechnical({ compatibility: v })}
                    readOnly={!editable}
                    aria-label="Compatibility"
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n={5} title="Intellectual Property">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Patent Available</span>
                <Toggle
                  value={form.ip.patentAvailable}
                  onChange={(v) => setIP({ patentAvailable: v })}
                  disabled={!editable}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Patent Number">
                  <TextInput
                    value={form.ip.patentNumber}
                    onChange={(v) => setIP({ patentNumber: v })}
                    disabled={!editable || !form.ip.patentAvailable}
                  />
                </Field>
                <Field label="Patent Owner">
                  <TextInput
                    value={form.ip.patentOwner}
                    onChange={(v) => setIP({ patentOwner: v })}
                    disabled={!editable || !form.ip.patentAvailable}
                  />
                </Field>
              </div>
              <Field label="IP Status" required>
                <Select
                  value={form.ip.ipStatus}
                  onChange={(v) => setIP({ ipStatus: v })}
                  options={lookups?.ipStatuses ?? []}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Freedom to Operate (FTO)" required>
                  <Select
                    value={form.ip.freedomToOperate}
                    onChange={(v) => setIP({ freedomToOperate: v })}
                    options={lookups?.ftoOptions ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Licensing Availability" required>
                  <Select
                    value={form.ip.licensingAvailability}
                    onChange={(v) => setIP({ licensingAvailability: v })}
                    options={lookups?.licensingOptions ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n={6} title="Business Assessment">
              <Field label="Business Opportunity" required>
                <TextArea
                  value={form.business.businessOpportunity}
                  onChange={(v) => setBusiness({ businessOpportunity: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Potential Applications" required>
                <TextArea
                  value={form.business.potentialApplications}
                  onChange={(v) => setBusiness({ potentialApplications: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Strategic Fit" required>
                <StarRating
                  value={form.business.strategicFit}
                  onChange={(v) => setBusiness({ strategicFit: v })}
                  readOnly={!editable}
                  aria-label="Strategic fit"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Revenue Potential" required>
                  <NumberInput
                    value={form.business.revenuePotential}
                    onChange={(v) => setBusiness({ revenuePotential: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Investment Estimate" required>
                  <NumberInput
                    value={form.business.investmentEstimate}
                    onChange={(v) => setBusiness({ investmentEstimate: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Time to Commercialization" required>
                <NumberInput
                  value={form.business.timeToCommercialization}
                  onChange={(v) => setBusiness({ timeToCommercialization: v })}
                  suffix="yrs"
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            <SectionCard n={7} title="Risk Assessment">
              {(
                [
                  ["Technology Risk", "technologyRisk"],
                  ["Market Risk", "marketRisk"],
                  ["Regulatory Risk", "regulatoryRisk"],
                  ["Supply Chain Risk", "supplyChainRisk"],
                  ["Cybersecurity Risk", "cybersecurityRisk"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                  <StarRating
                    value={form.risk[key]}
                    onChange={(v) => setRisk({ [key]: v })}
                    readOnly={!editable}
                    invert
                    size="sm"
                    aria-label={label}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-bold text-foreground">Overall Risk Level</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset",
                    liveRiskLevel === "High" &&
                      "bg-destructive/10 text-destructive ring-destructive/20",
                    liveRiskLevel === "Moderate" &&
                      "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/25",
                    liveRiskLevel === "Low" && "bg-success/10 text-success ring-success/20",
                  )}
                >
                  {liveRiskLevel}
                </span>
              </div>
            </SectionCard>

            <SectionCard n={8} title="Attachments">
              {form.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No documents attached yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {form.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-foreground">
                            {a.filename}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {a.category} · {a.fileType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {editable && (
                        <button
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            set(
                              "attachments",
                              form.attachments.filter((x) => x.id !== a.id),
                            )
                          }
                          aria-label={`Remove ${a.filename}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {editable && (
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <select
                    className={cn(INPUT, "border-border !w-auto flex-1")}
                    value={attachCategory}
                    onChange={(e) => setAttachCategory(e.target.value)}
                  >
                    {(lookups?.attachmentCategories ?? []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ErpButton variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" /> Attach
                  </ErpButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) addAttachment(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
              {form.attachments.length > 0 && (
                <p className="text-[11px] font-semibold text-primary">
                  View All Attachments ({form.attachments.length})
                </p>
              )}
            </SectionCard>

            <SectionCard n={9} title="Review & Approval" className="md:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {(record?.reviewers ?? []).map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.role}</div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold",
                          r.status === "reviewed" ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        {r.status === "reviewed"
                          ? `Reviewed${r.date ? ` · ${new Date(r.date).toLocaleDateString("en-IN")}` : ""}`
                          : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
                {!record && (
                  <p className="text-xs text-muted-foreground sm:col-span-2 xl:col-span-4">
                    Reviewers (R&D Manager, Technical Reviewer, Innovation Director, CTO) are
                    assigned when the record is created.
                  </p>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Approval Decision">
                  <TextInput value={record?.approvalDecision ?? "Pending"} disabled />
                </Field>
                <Field label="Next Action">
                  <TextInput value={record?.reviewNextAction ?? "—"} disabled />
                </Field>
                <Field label="Review Comments">
                  <TextInput value={record?.reviewComments ?? "—"} disabled />
                </Field>
                <Field label="Approval Date">
                  <TextInput
                    value={
                      record?.approvalDate
                        ? new Date(record.approvalDate).toLocaleDateString("en-IN")
                        : "— / — / ——"
                    }
                    disabled
                  />
                </Field>
              </div>
              <p className="text-[11px] text-muted-foreground">
                The decision is recorded through the Executive Review dialog once all four
                assessment stages are complete and the evaluation is submitted.
              </p>
            </SectionCard>

            <SectionCard n={10} title="System Information" className="md:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Created By
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record?.createdBy ?? "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {record ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Last Modified By
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record?.lastModifiedBy ?? "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {record ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Workflow Stage
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status={TECH_SCOUTING_STATUS_LABEL[status]} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Version
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record ? `${record.version}.0` : "—"}
                  </div>
                  <button
                    className="text-[11px] font-semibold text-primary hover:underline"
                    onClick={() => setHistoryOpen(true)}
                  >
                    View Full Activity History
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Overall Technology Score</h3>
              {record ? (
                <>
                  <div className="flex items-center gap-4">
                    <ScoreRing value={overall} />
                    <div className="space-y-1.5">
                      <div
                        className={cn(
                          "text-sm font-bold",
                          overall >= 70
                            ? "text-success"
                            : overall >= 50
                              ? "text-[#F59E0B]"
                              : "text-muted-foreground",
                        )}
                      >
                        {potentialLabel}
                      </div>
                      <StarRating
                        value={Math.round(overall / 10)}
                        readOnly
                        size="sm"
                        showValue={false}
                      />
                      <div className="text-xs text-muted-foreground">
                        Priority Ranking{" "}
                        <span className="font-bold text-foreground">
                          {decision?.priorityRanking ? `#${decision.priorityRanking}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Create the record to compute the score from the assessment data.
                </p>
              )}
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Brain className="h-4 w-4 text-primary" /> AI Technology Analysis
              </h3>
              {ai ? (
                <>
                  <div className="space-y-2">
                    <AIScoreRow label="AI Technology Score" value={ai.aiTechnologyScore} />
                    <AIScoreRow label="AI Innovation Score" value={ai.aiInnovationScore} />
                    <AIScoreRow label="AI Market Potential" value={ai.aiMarketPotential} />
                    <AIScoreRow
                      label="AI Technical Feasibility"
                      value={ai.aiTechnicalFeasibility}
                    />
                    <AIScoreRow label="AI Strategic Alignment" value={ai.aiStrategicAlignment} />
                    <AIScoreRow
                      label="AI Competitive Advantage"
                      value={ai.aiCompetitiveAdvantage}
                    />
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendation
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ai.recommendation}
                    </p>
                  </div>
                  <button
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => setInsightsOpen(true)}
                  >
                    View AI Insights →
                  </button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI scores are generated when the record is created and refreshed as each
                  assessment stage completes.
                </p>
              )}
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Decision Summary</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Technology Score</span>
                <span className="tabular font-bold text-foreground">
                  {record ? `${overall} /100` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Priority Ranking</span>
                <span className="tabular font-bold text-foreground">
                  {decision?.priorityRanking ? decision.priorityRanking : "—"}
                </span>
              </div>
              <Field label="Recommended Action">
                <Select
                  value={form.recommendedAction}
                  onChange={(v) => set("recommendedAction", v)}
                  options={lookups?.recommendedActions ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Technology Owner" required>
                <Select
                  value={form.technologyOwner}
                  onChange={(v) => set("technologyOwner", v)}
                  options={lookups?.scouts ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Target Project">
                <Select
                  value={form.targetProject}
                  onChange={(v) => set("targetProject", v)}
                  options={lookups?.targetProjects ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Follow-up Date">
                <input
                  type="date"
                  className={cn(INPUT, "border-border")}
                  value={form.followUpDate}
                  disabled={!editable}
                  onChange={(e) => set("followUpDate", e.target.value)}
                />
              </Field>
              {record?.addedToPortfolioAt && (
                <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                  ✓ Added to Innovation Portfolio
                </div>
              )}
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Eye className="h-4 w-4 text-primary" /> Activity Timeline
              </h3>
              {record && record.auditTrail.length > 0 ? (
                <ul className="space-y-2.5">
                  {[...record.auditTrail]
                    .slice(-4)
                    .reverse()
                    .map((a, i) => (
                      <li key={i} className="relative pl-4">
                        <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="text-xs font-semibold leading-snug text-foreground">
                          {a.event}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          by {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Actions on this record appear here automatically.
                </p>
              )}
              {record && (
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => setHistoryOpen(true)}
                >
                  View Full Activity History →
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* --------------------------- Executive Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Executive Technology Review</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.info.technologyName || record.scoutingId} — score ${overall}/100, risk ${record.overallRiskLevel}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as TechScoutingApprovalDecision)}
                options={lookups?.approvalDecisions ?? []}
              />
            </Field>
            <Field label="Next Action">
              <Select
                value={reviewNextAction}
                onChange={setReviewNextAction}
                options={lookups?.nextActions ?? []}
              />
            </Field>
            <Field label="Review Comments">
              <TextArea value={reviewComments} onChange={setReviewComments} rows={3} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <ErpButton variant="outline" onClick={() => setReviewOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending}>
                {reviewMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Record Decision
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ History dialog ------------------------------ */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>
              {record ? `${record.scoutingId} — full audit trail.` : ""}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {record &&
              [...record.auditTrail].reverse().map((a, i) => (
                <li key={i} className="rounded-lg bg-muted/40 px-3 py-2">
                  <div className="text-xs font-semibold text-foreground">{a.event}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                    {a.stage ? ` · ${STAGE_LABEL[a.stage]}` : ""}
                  </div>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ AI Insights dialog ------------------------------ */}
      <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Insights</DialogTitle>
            <DialogDescription>
              Stage-by-stage outputs generated from the assessment data.
            </DialogDescription>
          </DialogHeader>
          {ai && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-bold text-foreground">Technology Classification</div>
                <p className="text-xs text-muted-foreground">
                  {ai.technologyClassification || "—"}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Emerging Trend Analysis</div>
                <p className="text-xs text-muted-foreground">{ai.emergingTrendAnalysis || "—"}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Technical Feasibility</div>
                <p className="text-xs text-muted-foreground">
                  Complexity {ai.technicalComplexity} · Integration {ai.integrationDifficulty} ·
                  Infrastructure: {ai.infrastructureRequirements}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Market Validation</div>
                <p className="text-xs text-muted-foreground">
                  Market opportunity score {ai.marketOpportunityScore}/100 · Competitive advantage{" "}
                  {ai.competitiveAdvantageBand} · Est. market{" "}
                  {formatCurrency(form.market.marketSize, true)}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Patent Landscape</div>
                <p className="text-xs text-muted-foreground">{ai.patentLandscape || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Recommendation</div>
                <p className="text-xs text-muted-foreground">{ai.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
