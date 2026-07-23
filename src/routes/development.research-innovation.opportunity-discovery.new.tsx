import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Save,
  Send,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Paperclip,
  UploadCloud,
  History as HistoryIcon,
  ShieldCheck,
  Compass,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { OpportunityTabBar, OPPORTUNITY_STATUS_LABEL } from "@/components/erp/OpportunityTabBar";
import { ErpButton } from "@/components/erp/Button";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
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
import { opportunityDiscoveryService } from "@/services";
import type {
  DiscoveryOpportunityRecord,
  ImpactLevel,
  OpportunityAttachment,
  OpportunityDecision,
  OpportunityFormInput,
  OpportunityLookups,
  OpportunityReviewStage,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/opportunity-discovery/new")({
  head: () => ({ meta: [{ title: "Opportunity Discovery Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: OpportunityFormPage,
});

/* --------------------------------- Defaults -------------------------------- */
const EMPTY: OpportunityFormInput = {
  name: "",
  information: {
    title: "",
    description: "",
    category: "",
    subCategory: "",
    source: "",
    businessUnit: "",
    department: "",
    productLine: "",
    strategicInitiative: "",
  },
  sourceIdentification: {
    linkedIdeaId: null,
    linkedIdeaCode: null,
    customerRequest: false,
    marketResearch: false,
    competitorAnalysis: false,
    technologyTrend: false,
    governmentPolicy: false,
    internalSuggestion: false,
    researchPublication: false,
    startupEcosystem: false,
  },
  customer: {
    targetCustomer: "",
    customerSegment: "",
    customerNeed: "",
    painPoints: "",
    customerExpectations: "",
    existingSolution: "",
    customerFeedback: "",
  },
  market: {
    industry: "",
    targetMarket: "",
    marketSize: 0,
    tam: 0,
    sam: 0,
    som: 0,
    growthRate: 0,
    marketMaturity: "",
    marketReadiness: "",
  },
  technology: {
    technologyDomain: "",
    emergingTechnology: "",
    technologyReadiness: "",
    existingTechnology: "",
    technologyGap: "",
    technologyTrend: "",
    technologyPartner: "",
  },
  competitive: {
    existingCompetitors: "",
    competitorProducts: "",
    marketLeader: "",
    competitiveAdvantage: "",
    marketGap: "",
    swotSummary: "",
  },
  business: { revenueOpportunity: 0, estimatedInvestment: 0, businessRisk: "Medium" },
  regulatoryESG: {
    regulatoryRequirement: "",
    applicableStandards: [],
    environmentalImpact: "Medium",
    socialImpact: "Medium",
    governanceImpact: "Medium",
  },
  attachments: [],
};

function recordToInput(r: DiscoveryOpportunityRecord): OpportunityFormInput {
  return {
    name: r.name,
    information: r.information,
    sourceIdentification: r.sourceIdentification,
    customer: r.customer,
    market: r.market,
    technology: r.technology,
    competitive: r.competitive,
    business: {
      revenueOpportunity: r.business.revenueOpportunity,
      estimatedInvestment: r.business.estimatedInvestment,
      businessRisk: r.business.businessRisk,
    },
    regulatoryESG: {
      regulatoryRequirement: r.regulatoryESG.regulatoryRequirement,
      applicableStandards: r.regulatoryESG.applicableStandards,
      environmentalImpact: r.regulatoryESG.environmentalImpact,
      socialImpact: r.regulatoryESG.socialImpact,
      governanceImpact: r.regulatoryESG.governanceImpact,
    },
    attachments: r.attachments,
  };
}

const SECTIONS = [
  { n: 1, id: "sec-1", label: "Opportunity Information" },
  { n: 2, id: "sec-2", label: "Source Identification" },
  { n: 3, id: "sec-3", label: "Customer Opportunity" },
  { n: 4, id: "sec-4", label: "Market Opportunity" },
  { n: 5, id: "sec-5", label: "Technology Opportunity" },
  { n: 6, id: "sec-6", label: "Competitive Analysis" },
  { n: 7, id: "sec-7", label: "Business Opportunity" },
  { n: 8, id: "sec-8", label: "Regulatory & ESG Assessment" },
  { n: 9, id: "sec-9", label: "AI Opportunity Analysis" },
  { n: 10, id: "sec-10", label: "Opportunity Evaluation" },
];

/* --------------------- Client preview of the server maths ------------------- */
/* Mirrors opportunityDiscoveryFns.server.ts so the gauges update live while
   editing. The server recomputes authoritatively on Submit. */
const IMPACT: Record<string, number> = { Low: 30, Medium: 60, High: 90 };
const MATURITY: Record<string, number> = {
  Emerging: 70,
  "Growth Stage": 90,
  Mature: 55,
  Declining: 20,
};
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const r0 = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
function parseTRL(label: string) {
  const m = (label || "").match(/TRL\s*(\d)/i);
  return m ? Math.max(1, Math.min(9, parseInt(m[1], 10))) : 4;
}

function computePreview(input: OpportunityFormInput) {
  const revenue = input.business.revenueOpportunity || 0;
  const investment = input.business.estimatedInvestment || 0;
  const profit = revenue - investment;
  const grossMargin = revenue > 0 ? r0((profit / revenue) * 100) : 0;
  const roi = investment > 0 ? r0((profit / investment) * 100) : 0;
  const paybackPeriod = revenue > 0 ? r0(investment / (revenue / 12)) : 0;

  const esgScore = clamp(
    r0(
      0.4 * (IMPACT[input.regulatoryESG.environmentalImpact] ?? 50) +
        0.3 * (IMPACT[input.regulatoryESG.socialImpact] ?? 50) +
        0.3 * (IMPACT[input.regulatoryESG.governanceImpact] ?? 50) +
        Math.min(10, input.regulatoryESG.applicableStandards.length * 2.5),
    ),
  );

  const tam = input.market.tam || 0;
  const tamScore = tam <= 0 ? 20 : clamp((Math.log10(tam) / 12) * 100);
  const growthScore = clamp((Math.min(input.market.growthRate || 0, 40) / 40) * 100);
  const readiness = IMPACT[input.market.marketReadiness] ?? 50;
  const maturity = MATURITY[input.market.marketMaturity] ?? 55;
  const aiMarketScore = clamp(
    r0(0.35 * tamScore + 0.25 * growthScore + 0.2 * readiness + 0.2 * maturity),
  );

  const trl = parseTRL(input.technology.technologyReadiness);
  const aiTechnologyScore = clamp(
    r0(
      (trl / 9) * 100 * 0.75 +
        (input.technology.technologyPartner && input.technology.technologyPartner !== "None"
          ? 10
          : 0) +
        (input.technology.technologyGap.trim() ? 10 : 0) +
        (input.technology.emergingTechnology.trim() ? 5 : 0),
    ),
  );

  const competitorCount = input.competitive.existingCompetitors
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const crowding = clamp(competitorCount * 15, 0, 75);
  const aiCompetitionScore = clamp(
    r0(
      45 +
        (input.competitive.competitiveAdvantage.trim() ? 30 : 0) +
        (input.competitive.marketGap.trim() ? 25 : 0) -
        crowding,
    ),
  );

  const aiRiskScore = clamp(
    r0(
      0.45 * (IMPACT[input.business.businessRisk] ?? 50) +
        (input.regulatoryESG.regulatoryRequirement.trim() ? 15 : 0) +
        ((9 - trl) / 9) * 40 +
        crowding * 0.15,
    ),
  );

  const aiOpportunityScore = clamp(
    r0(
      0.3 * aiMarketScore +
        0.25 * aiTechnologyScore +
        0.2 * aiCompetitionScore +
        0.25 * (100 - aiRiskScore),
    ),
  );

  const strategicAlignmentScore = clamp(
    r0(
      (input.information.strategicInitiative ? 70 : 40) +
        (input.information.productLine ? 15 : 0) +
        esgScore * 0.15,
    ),
  );
  const customerValueScore = clamp(
    r0(
      35 +
        (input.customer.customerNeed.trim() ? 20 : 0) +
        (input.customer.painPoints.trim() ? 20 : 0) +
        (input.customer.customerFeedback.trim() ? 15 : 0) +
        (input.customer.customerExpectations.trim() ? 10 : 0),
    ),
  );
  const businessScore = clamp(
    r0((clamp(roi, 0, 200) / 2) * 0.6 + (100 - (Math.min(paybackPeriod, 60) / 60) * 100) * 0.4),
  );
  const overallOpportunityScore = clamp(
    r0(
      0.2 * strategicAlignmentScore +
        0.2 * customerValueScore +
        0.2 * aiMarketScore +
        0.2 * aiTechnologyScore +
        0.2 * businessScore,
    ),
  );

  return {
    grossMargin,
    roi,
    paybackPeriod,
    esgScore,
    aiMarketScore,
    aiTechnologyScore,
    aiCompetitionScore,
    aiRiskScore,
    aiOpportunityScore,
    strategicAlignmentScore,
    customerValueScore,
    businessScore,
    overallOpportunityScore,
  };
}

function bandLabel(score: number) {
  if (score >= 75) return "High Potential Opportunity";
  if (score >= 55) return "Promising Opportunity";
  if (score >= 40) return "Moderate Opportunity";
  return "Early / Needs Work";
}
function scoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

/* ------------------------------ UI primitives ------------------------------ */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60";

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
function TextInput({
  value,
  onChange,
  placeholder,
  error,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      className={cn(
        INPUT,
        error ? "border-destructive" : "border-border",
        readOnly && "bg-muted/40",
      )}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  );
}
function TextArea({
  value,
  onChange,
  rows = 2,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  error?: boolean;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y", error ? "border-destructive" : "border-border")}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", prefix && "pl-7", suffix && "pr-8")}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
function Select({
  value,
  onChange,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: boolean;
}) {
  return (
    <select
      className={cn(INPUT, error ? "border-destructive" : "border-border")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white",
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>
      <span className="text-xs text-foreground">{label}</span>
    </label>
  );
}
function ChipMulti({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary/40",
            )}
          >
            {on && <Check className="mr-0.5 inline h-3 w-3" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}
function ImpactBadge({ level }: { level: ImpactLevel | string }) {
  const tone =
    level === "High"
      ? "bg-success/10 text-success"
      : level === "Medium"
        ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
        : "bg-muted text-muted-foreground";
  return <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", tone)}>{level}</span>;
}
function ScoreTile({
  label,
  value,
  suffix = "/100",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
      <div className="font-display text-base font-bold tabular text-foreground">
        {value}
        <span className="text-[10px] font-medium text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - clamp(value) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={rad} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={rad}
          fill="none"
          stroke={scoreColor(value)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .4s ease" }}
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

function Section({
  n,
  id,
  title,
  children,
  className,
  right,
}: {
  n: number;
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <section id={id} className={cn("card-soft scroll-mt-24 p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
            {n}
          </span>
          {title}
        </h3>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ================================== Page =================================== */
function OpportunityFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId } = Route.useSearch();

  const lookupsQuery = useQuery({
    queryKey: ["opportunities", "lookups"],
    queryFn: () => opportunityDiscoveryService.fetchLookups(),
  });
  const ideasQuery = useQuery({
    queryKey: ["opportunities", "linkable-ideas"],
    queryFn: () => opportunityDiscoveryService.fetchLinkableIdeas(),
  });
  const recordQuery = useQuery({
    queryKey: ["opportunities", "detail", editId],
    queryFn: () => opportunityDiscoveryService.fetchOpportunity(editId as string),
    enabled: !!editId,
  });
  const record = recordQuery.data;

  const [input, setInput] = useState<OpportunityFormInput>(EMPTY);
  const [oppId, setOppId] = useState<string | undefined>(undefined);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState<null | "draft" | "submit" | "review">(null);
  const [activeSection, setActiveSection] = useState("sec-1");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId && record && !seeded) {
      setInput(recordToInput(record));
      setOppId(record.id);
      setSeeded(true);
    }
  }, [editId, record, seeded]);

  const preview = useMemo(() => computePreview(input), [input]);
  const status = record?.status ?? "draft";
  const editable = status === "draft" || status === "revision_required";
  const L =
    lookupsQuery.data ??
    ({
      categories: [],
      sources: [],
      businessUnits: [],
      departments: [],
      productLines: [],
      strategicInitiatives: [],
      targetCustomers: [],
      customerSegments: [],
      industries: [],
      targetMarkets: [],
      marketMaturities: [],
      marketReadinessLevels: [],
      technologyDomains: [],
      emergingTechnologies: [],
      technologyReadinessLevels: [],
      technologyPartners: [],
      applicableStandards: [],
      attachmentCategories: [],
    } as OpportunityLookups);
  const subCategories =
    L.categories.find((c) => c.name === input.information.category)?.subCategories ?? [];

  function patch<K extends keyof OpportunityFormInput>(
    section: K,
    part: Partial<OpportunityFormInput[K]>,
  ) {
    setInput((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...part } }));
  }

  // Scroll-spy for the section nav.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [seeded, status]);

  const jumpTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }, []);

  /* --------------------------- Populate from Idea --------------------------- */
  const linkIdea = useCallback(
    (ideaId: string) => {
      const idea = ideasQuery.data?.find((i) => i.id === ideaId);
      if (!idea) {
        patch("sourceIdentification", { linkedIdeaId: null, linkedIdeaCode: null });
        return;
      }
      // Auto-pull the idea's details into the matching opportunity fields.
      setInput((prev) => ({
        ...prev,
        name: prev.name || idea.title,
        information: {
          ...prev.information,
          title: prev.information.title || idea.title,
          description: prev.information.description || idea.shortDescription,
          category: prev.information.category || idea.category,
          department: prev.information.department || idea.department,
          businessUnit: prev.information.businessUnit || idea.businessUnit,
          productLine: prev.information.productLine || idea.productLine,
        },
        sourceIdentification: {
          ...prev.sourceIdentification,
          linkedIdeaId: idea.id,
          linkedIdeaCode: idea.ideaCode,
        },
      }));
      toast.success(`Populated from ${idea.ideaCode}`);
    },
    [ideasQuery.data],
  );

  /* -------------------------------- Actions -------------------------------- */
  async function doSave() {
    setBusy("draft");
    try {
      const rec = await opportunityDiscoveryService.saveOpportunityDraft(input, oppId);
      setOppId(rec.id);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success(`Draft saved · ${rec.opportunityCode}`);
      if (!editId)
        navigate({
          to: "/development/research-innovation/opportunity-discovery/new",
          search: { id: rec.id },
        });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    setBusy("submit");
    try {
      const id =
        oppId ?? (await opportunityDiscoveryService.saveOpportunityDraft(input, undefined)).id;
      await opportunityDiscoveryService.saveOpportunityDraft(input, id);
      const rec = await opportunityDiscoveryService.submitOpportunity(id);
      setOppId(rec.id);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      if (rec.status === "revision_required") {
        toast.warning(rec.revisionNote ?? "Revision required.");
      } else {
        toast.success(
          `${rec.opportunityCode} submitted — AI analysis complete (${rec.aiAnalysis?.aiOpportunityScore}/100).`,
        );
      }
      navigate({
        to: "/development/research-innovation/opportunity-discovery/new",
        search: { id: rec.id },
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doReview(
    stage: OpportunityReviewStage,
    decision: OpportunityDecision,
    comments?: string,
  ) {
    setBusy("review");
    try {
      const rec = await opportunityDiscoveryService.reviewOpportunity({
        id: oppId!,
        stage,
        decision,
        comments,
      });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success(
        rec.feasibilityProjectCode
          ? `Approved — Feasibility Study ${rec.feasibilityProjectCode} created.`
          : `${stage}: ${decision}`,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: OpportunityAttachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${f.name}`,
      category: L.attachmentCategories[0] ?? "Documents",
      filename: f.name,
      fileType: (f.name.split(".").pop() ?? "FILE").toUpperCase(),
      uploadedBy: "Priya Sharma",
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(f), // session-scoped; metadata is what persists
    }));
    setInput((prev) => ({ ...prev, attachments: [...prev.attachments, ...added] }));
    toast.success(`${added.length} file(s) attached`);
  }

  /* -------------------------- Derived Key Highlights ------------------------- */
  const highlights = useMemo(() => {
    const h: { ok: boolean; text: string }[] = [];
    if (input.market.tam > 0)
      h.push({
        ok: preview.aiMarketScore >= 60,
        text: `High Market Potential (TAM: ${formatCurrency(input.market.tam, true)})`,
      });
    if (input.customer.customerNeed.trim())
      h.push({
        ok: preview.customerValueScore >= 60,
        text:
          preview.customerValueScore >= 60
            ? "Strong Customer Demand"
            : "Customer demand needs validation",
      });
    if (input.information.strategicInitiative)
      h.push({ ok: preview.strategicAlignmentScore >= 60, text: "High Strategic Alignment" });
    h.push({
      ok: preview.aiOpportunityScore >= 60,
      text: `AI Opportunity Score: ${preview.aiOpportunityScore}/100`,
    });
    if (preview.roi !== 0) h.push({ ok: preview.roi > 0, text: `Estimated ROI: ${preview.roi}%` });
    if (preview.paybackPeriod > 0)
      h.push({
        ok: preview.paybackPeriod <= 24,
        text: `Payback Period: ${preview.paybackPeriod} Months`,
      });
    if (preview.aiRiskScore >= 60)
      h.push({ ok: false, text: `Elevated risk (${preview.aiRiskScore}/100)` });
    return h.length ? h : [{ ok: false, text: "Fill the form to generate highlights" }];
  }, [input, preview]);

  const linkedIdea = ideasQuery.data?.find((i) => i.id === input.sourceIdentification.linkedIdeaId);

  if (editId && !seeded && recordQuery.isLoading) {
    return (
      <AppShell
        title="Opportunity Discovery"
        breadcrumb="Research & Innovation Development"
        tabs={<OpportunityTabBar />}
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
      title="Opportunity Discovery"
      breadcrumb="Research & Innovation Development"
      description="Opportunity Discovery Form"
      tabs={<OpportunityTabBar />}
    >
      <div className="space-y-5">
        {/* ---------------------------- Record header ---------------------------- */}
        <div className="card-soft p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Compass className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Opportunity ID
                  </div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {record?.opportunityCode ?? "OPP-—"}
                  </div>
                </div>
              </div>
              <Field label="Opportunity Name" required>
                <TextInput
                  value={input.name}
                  onChange={(v) => setInput((p) => ({ ...p, name: v }))}
                  readOnly={!editable}
                  placeholder="Name this opportunity"
                />
              </Field>
              <div>
                <span className="text-xs font-semibold text-foreground">Source Idea</span>
                <div className="mt-1">
                  {linkedIdea ? (
                    <Link
                      to="/development/research-innovation/idea-management/$ideaId"
                      params={{ ideaId: linkedIdea.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
                    >
                      {linkedIdea.ideaCode}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not linked</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">Workflow Status</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={OPPORTUNITY_STATUS_LABEL[status] ?? status} />
                  {record?.reviewStage && (
                    <span className="text-[11px] text-muted-foreground">{record.reviewStage}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                loading={busy === "draft"}
                disabled={!editable}
                onClick={doSave}
              >
                <Save className="h-4 w-4" /> Save Draft
              </ErpButton>
              <ErpButton
                size="sm"
                loading={busy === "submit"}
                disabled={!editable}
                onClick={doSubmit}
              >
                <Send className="h-4 w-4" /> Submit for Review
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
                  <DropdownMenuItem
                    onClick={async () => {
                      const rec = await opportunityDiscoveryService.saveOpportunityDraft(
                        { ...input, name: `${input.name} (Copy)` },
                        undefined,
                      );
                      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
                      toast.success(`Duplicated as ${rec.opportunityCode}`);
                      navigate({
                        to: "/development/research-innovation/opportunity-discovery/new",
                        search: { id: rec.id },
                      });
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const blob = new Blob(
                        [
                          JSON.stringify(
                            { code: record?.opportunityCode, input, scores: preview },
                            null,
                            2,
                          ),
                        ],
                        { type: "application/json" },
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${record?.opportunityCode ?? "opportunity"}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Exported opportunity JSON");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.message("Deleting opportunities isn't enabled yet.")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {record?.revisionNote && status === "revision_required" && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-[oklch(0.45_0.15_75)]">
              <span className="font-semibold">Update Required:</span> {record.revisionNote}
            </div>
          )}
        </div>

        {/* --------------------------- Section navigation -------------------------- */}
        <div className="card-soft sticky top-2 z-20 flex items-center gap-1 overflow-x-auto p-2">
          {SECTIONS.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                activeSection === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {s.n}. {s.label}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  SECTIONS.slice(6).some((s) => s.id === activeSection)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                More Sections <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SECTIONS.slice(6).map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => jumpTo(s.id)}>
                  {s.n}. {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* ------------------------------ Sections ------------------------------ */}
          <div className="grid min-w-0 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            <Section
              n={1}
              id="sec-1"
              title="Opportunity Information"
              className="lg:col-span-2 2xl:col-span-3"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="sm:col-span-2 xl:col-span-3">
                  <Field label="Opportunity Title" required>
                    <TextInput
                      value={input.information.title}
                      onChange={(v) => patch("information", { title: v })}
                      readOnly={!editable}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2 xl:col-span-3">
                  <Field label="Opportunity Description">
                    <TextArea
                      value={input.information.description}
                      onChange={(v) => patch("information", { description: v })}
                    />
                  </Field>
                </div>
                <Field label="Opportunity Category" required>
                  <Select
                    value={input.information.category}
                    onChange={(v) => patch("information", { category: v, subCategory: "" })}
                    options={L.categories.map((c) => c.name)}
                  />
                </Field>
                <Field label="Opportunity Sub Category">
                  <Select
                    value={input.information.subCategory}
                    onChange={(v) => patch("information", { subCategory: v })}
                    options={subCategories}
                  />
                </Field>
                <Field label="Opportunity Source">
                  <Select
                    value={input.information.source}
                    onChange={(v) => patch("information", { source: v })}
                    options={L.sources}
                  />
                </Field>
                <Field label="Business Unit">
                  <Select
                    value={input.information.businessUnit}
                    onChange={(v) => patch("information", { businessUnit: v })}
                    options={L.businessUnits}
                  />
                </Field>
                <Field label="Department" required>
                  <Select
                    value={input.information.department}
                    onChange={(v) => patch("information", { department: v })}
                    options={L.departments}
                  />
                </Field>
                <Field label="Product Line">
                  <Select
                    value={input.information.productLine}
                    onChange={(v) => patch("information", { productLine: v })}
                    options={L.productLines}
                  />
                </Field>
                <Field label="Strategic Initiative">
                  <Select
                    value={input.information.strategicInitiative}
                    onChange={(v) => patch("information", { strategicInitiative: v })}
                    options={L.strategicInitiatives}
                  />
                </Field>
                <Field label="Discovery Date">
                  <TextInput
                    value={
                      record
                        ? new Date(record.discoveryDate).toLocaleDateString("en-IN")
                        : new Date().toLocaleDateString("en-IN")
                    }
                    readOnly
                  />
                </Field>
                <Field label="Opportunity Owner">
                  <TextInput value={record?.owner ?? "Priya Sharma"} readOnly />
                </Field>
              </div>
            </Section>

            <Section n={2} id="sec-2" title="Source Identification">
              <div className="space-y-3">
                <Field label="Linked Idea">
                  <select
                    className={cn(INPUT, "border-border")}
                    value={input.sourceIdentification.linkedIdeaId ?? ""}
                    disabled={!editable}
                    onChange={(e) => linkIdea(e.target.value)}
                  >
                    <option value="">No linked idea</option>
                    {(ideasQuery.data ?? []).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.ideaCode} — {i.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <div>
                  <span className="text-xs font-semibold text-foreground">Discovery Sources</span>
                  <div className="mt-1 grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                    {(
                      [
                        ["customerRequest", "Customer Request"],
                        ["marketResearch", "Market Research"],
                        ["competitorAnalysis", "Competitor Analysis"],
                        ["technologyTrend", "Technology Trend"],
                        ["governmentPolicy", "Government Policy"],
                        ["internalSuggestion", "Internal Suggestion"],
                        ["researchPublication", "Research Publication"],
                        ["startupEcosystem", "Startup Ecosystem"],
                      ] as const
                    ).map(([key, label]) => (
                      <CheckRow
                        key={key}
                        label={label}
                        checked={input.sourceIdentification[key]}
                        onChange={(v) =>
                          patch("sourceIdentification", { [key]: v } as Partial<
                            OpportunityFormInput["sourceIdentification"]
                          >)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section n={3} id="sec-3" title="Customer Opportunity">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Target Customer" required>
                    <Select
                      value={input.customer.targetCustomer}
                      onChange={(v) => patch("customer", { targetCustomer: v })}
                      options={L.targetCustomers}
                    />
                  </Field>
                  <Field label="Customer Segment">
                    <Select
                      value={input.customer.customerSegment}
                      onChange={(v) => patch("customer", { customerSegment: v })}
                      options={L.customerSegments}
                    />
                  </Field>
                </div>
                <Field label="Customer Need" required>
                  <TextArea
                    value={input.customer.customerNeed}
                    onChange={(v) => patch("customer", { customerNeed: v })}
                  />
                </Field>
                <Field label="Pain Points">
                  <TextArea
                    value={input.customer.painPoints}
                    onChange={(v) => patch("customer", { painPoints: v })}
                  />
                </Field>
                <Field label="Customer Expectations">
                  <TextArea
                    value={input.customer.customerExpectations}
                    onChange={(v) => patch("customer", { customerExpectations: v })}
                  />
                </Field>
                <Field label="Existing Solution">
                  <TextArea
                    value={input.customer.existingSolution}
                    onChange={(v) => patch("customer", { existingSolution: v })}
                  />
                </Field>
                <Field label="Customer Feedback">
                  <TextArea
                    value={input.customer.customerFeedback}
                    onChange={(v) => patch("customer", { customerFeedback: v })}
                  />
                </Field>
              </div>
            </Section>

            <Section n={4} id="sec-4" title="Market Opportunity">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Industry" required>
                  <Select
                    value={input.market.industry}
                    onChange={(v) => patch("market", { industry: v })}
                    options={L.industries}
                  />
                </Field>
                <Field label="Target Market">
                  <Select
                    value={input.market.targetMarket}
                    onChange={(v) => patch("market", { targetMarket: v })}
                    options={L.targetMarkets}
                  />
                </Field>
                <Field label="Market Size">
                  <NumberInput
                    value={input.market.marketSize}
                    onChange={(v) => patch("market", { marketSize: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="TAM" required>
                  <NumberInput
                    value={input.market.tam}
                    onChange={(v) => patch("market", { tam: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="SAM">
                  <NumberInput
                    value={input.market.sam}
                    onChange={(v) => patch("market", { sam: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="SOM">
                  <NumberInput
                    value={input.market.som}
                    onChange={(v) => patch("market", { som: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="Growth Rate">
                  <NumberInput
                    value={input.market.growthRate}
                    onChange={(v) => patch("market", { growthRate: v })}
                    suffix="%"
                  />
                </Field>
                <Field label="Market Maturity">
                  <Select
                    value={input.market.marketMaturity}
                    onChange={(v) => patch("market", { marketMaturity: v })}
                    options={L.marketMaturities}
                  />
                </Field>
                <Field label="Market Readiness">
                  <Select
                    value={input.market.marketReadiness}
                    onChange={(v) => patch("market", { marketReadiness: v })}
                    options={L.marketReadinessLevels}
                  />
                </Field>
              </div>
            </Section>

            <Section n={5} id="sec-5" title="Technology Opportunity">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Technology Domain" required>
                  <Select
                    value={input.technology.technologyDomain}
                    onChange={(v) => patch("technology", { technologyDomain: v })}
                    options={L.technologyDomains}
                  />
                </Field>
                <Field label="Emerging Technology">
                  <Select
                    value={input.technology.emergingTechnology}
                    onChange={(v) => patch("technology", { emergingTechnology: v })}
                    options={L.emergingTechnologies}
                  />
                </Field>
                <Field label="Technology Readiness">
                  <Select
                    value={input.technology.technologyReadiness}
                    onChange={(v) => patch("technology", { technologyReadiness: v })}
                    options={L.technologyReadinessLevels}
                  />
                </Field>
                <Field label="Technology Partner">
                  <Select
                    value={input.technology.technologyPartner}
                    onChange={(v) => patch("technology", { technologyPartner: v })}
                    options={L.technologyPartners}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Existing Technology">
                    <TextArea
                      value={input.technology.existingTechnology}
                      onChange={(v) => patch("technology", { existingTechnology: v })}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Technology Gap">
                    <TextArea
                      value={input.technology.technologyGap}
                      onChange={(v) => patch("technology", { technologyGap: v })}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Technology Trend">
                    <TextArea
                      value={input.technology.technologyTrend}
                      onChange={(v) => patch("technology", { technologyTrend: v })}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section n={6} id="sec-6" title="Competitive Analysis">
              <div className="space-y-3">
                <Field label="Existing Competitors">
                  <TextArea
                    value={input.competitive.existingCompetitors}
                    onChange={(v) => patch("competitive", { existingCompetitors: v })}
                  />
                </Field>
                <Field label="Competitor Products">
                  <TextArea
                    value={input.competitive.competitorProducts}
                    onChange={(v) => patch("competitive", { competitorProducts: v })}
                  />
                </Field>
                <Field label="Market Leader" required>
                  <TextInput
                    value={input.competitive.marketLeader}
                    onChange={(v) => patch("competitive", { marketLeader: v })}
                  />
                </Field>
                <Field label="Competitive Advantage">
                  <TextArea
                    value={input.competitive.competitiveAdvantage}
                    onChange={(v) => patch("competitive", { competitiveAdvantage: v })}
                  />
                </Field>
                <Field label="Market Gap">
                  <TextArea
                    value={input.competitive.marketGap}
                    onChange={(v) => patch("competitive", { marketGap: v })}
                  />
                </Field>
                <Field label="SWOT Summary">
                  <TextArea
                    value={input.competitive.swotSummary}
                    onChange={(v) => patch("competitive", { swotSummary: v })}
                    rows={3}
                  />
                </Field>
              </div>
            </Section>

            <Section n={7} id="sec-7" title="Business Opportunity">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Revenue Opportunity" required>
                  <NumberInput
                    value={input.business.revenueOpportunity}
                    onChange={(v) => patch("business", { revenueOpportunity: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="Estimated Investment">
                  <NumberInput
                    value={input.business.estimatedInvestment}
                    onChange={(v) => patch("business", { estimatedInvestment: v })}
                    prefix="₹"
                  />
                </Field>
                <Field label="Business Risk">
                  <Select
                    value={input.business.businessRisk}
                    onChange={(v) => patch("business", { businessRisk: v as ImpactLevel })}
                    options={["Low", "Medium", "High"]}
                  />
                </Field>
                <div />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ScoreTile label="Gross Margin" value={preview.grossMargin} suffix="%" />
                <ScoreTile label="ROI" value={preview.roi} suffix="%" />
                <ScoreTile label="Payback" value={preview.paybackPeriod} suffix=" mo" />
              </div>
            </Section>

            <Section
              n={8}
              id="sec-8"
              title="Regulatory & ESG Assessment"
              right={
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {preview.esgScore}/100
                </span>
              }
            >
              <div className="space-y-3">
                <Field label="Regulatory Requirement">
                  <TextArea
                    value={input.regulatoryESG.regulatoryRequirement}
                    onChange={(v) => patch("regulatoryESG", { regulatoryRequirement: v })}
                  />
                </Field>
                <Field label="Applicable Standards">
                  <ChipMulti
                    options={L.applicableStandards}
                    selected={input.regulatoryESG.applicableStandards}
                    onToggle={(v) =>
                      patch("regulatoryESG", {
                        applicableStandards: input.regulatoryESG.applicableStandards.includes(v)
                          ? input.regulatoryESG.applicableStandards.filter((s) => s !== v)
                          : [...input.regulatoryESG.applicableStandards, v],
                      })
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Environmental Impact">
                    <Select
                      value={input.regulatoryESG.environmentalImpact}
                      onChange={(v) =>
                        patch("regulatoryESG", { environmentalImpact: v as ImpactLevel })
                      }
                      options={["Low", "Medium", "High"]}
                    />
                  </Field>
                  <Field label="Social Impact">
                    <Select
                      value={input.regulatoryESG.socialImpact}
                      onChange={(v) => patch("regulatoryESG", { socialImpact: v as ImpactLevel })}
                      options={["Low", "Medium", "High"]}
                    />
                  </Field>
                  <Field label="Governance Impact">
                    <Select
                      value={input.regulatoryESG.governanceImpact}
                      onChange={(v) =>
                        patch("regulatoryESG", { governanceImpact: v as ImpactLevel })
                      }
                      options={["Low", "Medium", "High"]}
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ImpactBadge level={input.regulatoryESG.environmentalImpact} />
                  <ImpactBadge level={input.regulatoryESG.socialImpact} />
                  <ImpactBadge level={input.regulatoryESG.governanceImpact} />
                </div>
              </div>
            </Section>

            <Section n={9} id="sec-9" title="AI Opportunity Analysis">
              <p className="mb-3 rounded-lg bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
                Computed from the market, technology, competitive and risk fields above —
                recalculated on every submit.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <ScoreTile
                  label="Market Score"
                  value={record?.aiAnalysis?.aiMarketScore ?? preview.aiMarketScore}
                />
                <ScoreTile
                  label="Technology Score"
                  value={record?.aiAnalysis?.aiTechnologyScore ?? preview.aiTechnologyScore}
                />
                <ScoreTile
                  label="Competition Score"
                  value={record?.aiAnalysis?.aiCompetitionScore ?? preview.aiCompetitionScore}
                />
                <ScoreTile
                  label="Risk Score"
                  value={record?.aiAnalysis?.aiRiskScore ?? preview.aiRiskScore}
                />
                <div className="col-span-2 sm:col-span-2">
                  <ScoreTile
                    label="Overall AI Score"
                    value={record?.aiAnalysis?.aiOpportunityScore ?? preview.aiOpportunityScore}
                  />
                </div>
              </div>
              <button
                onClick={() => setScoringOpen(true)}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                View AI Insights →
              </button>
            </Section>

            <Section
              n={10}
              id="sec-10"
              title="Opportunity Evaluation"
              right={
                record?.evaluation?.opportunityRank ? (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Rank #{record.evaluation.opportunityRank}
                  </span>
                ) : undefined
              }
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <ScoreTile
                  label="Strategic Alignment"
                  value={
                    record?.evaluation?.strategicAlignmentScore ?? preview.strategicAlignmentScore
                  }
                />
                <ScoreTile
                  label="Customer Value"
                  value={record?.evaluation?.customerValueScore ?? preview.customerValueScore}
                />
                <ScoreTile
                  label="Technology Score"
                  value={record?.evaluation?.technologyScore ?? preview.aiTechnologyScore}
                />
                <ScoreTile
                  label="Market Score"
                  value={record?.evaluation?.marketScore ?? preview.aiMarketScore}
                />
                <ScoreTile
                  label="Business Score"
                  value={record?.evaluation?.businessScore ?? preview.businessScore}
                />
                <ScoreTile
                  label="Overall Score"
                  value={
                    record?.evaluation?.overallOpportunityScore ?? preview.overallOpportunityScore
                  }
                />
              </div>
            </Section>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
            <div className="card-soft p-5 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall Opportunity Score
              </h4>
              <div className="mt-3 grid place-items-center">
                <ScoreRing
                  value={
                    record?.evaluation?.overallOpportunityScore ?? preview.overallOpportunityScore
                  }
                />
              </div>
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <StarRating
                  value={Math.max(
                    1,
                    Math.round(
                      (record?.evaluation?.overallOpportunityScore ??
                        preview.overallOpportunityScore) / 10,
                    ),
                  )}
                  readOnly
                  showValue={false}
                />
                <span className="text-xs font-bold text-success">
                  {bandLabel(
                    record?.evaluation?.overallOpportunityScore ?? preview.overallOpportunityScore,
                  )}
                </span>
                {record?.evaluation?.opportunityRank ? (
                  <span className="text-xs text-muted-foreground">
                    Rank{" "}
                    <span className="font-display text-base font-bold text-foreground">
                      #{record.evaluation.opportunityRank}
                    </span>
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Rank assigned after submit
                  </span>
                )}
                <button
                  onClick={() => setScoringOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View scoring details →
                </button>
              </div>
            </div>

            <div className="card-soft p-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Next Action
              </h4>
              <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {record?.nextAction ?? "Complete the form and Submit for Review"}
              </p>
            </div>

            {/* Reviewer actions — only when the record is genuinely under review */}
            {status === "under_review" && record?.reviewStage && (
              <div className="card-soft p-5">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reviewer Action
                </h4>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Stage: <span className="font-semibold text-foreground">{record.reviewStage}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {record.reviewStage === "Innovation Committee Review" ? (
                    <>
                      <ErpButton
                        size="sm"
                        loading={busy === "review"}
                        onClick={() => doReview(record.reviewStage!, "Approved")}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </ErpButton>
                      <ErpButton
                        size="sm"
                        variant="outline"
                        loading={busy === "review"}
                        onClick={() =>
                          doReview(
                            record.reviewStage!,
                            "Revision Required",
                            "Committee requested changes",
                          )
                        }
                      >
                        Revision
                      </ErpButton>
                      <ErpButton
                        size="sm"
                        variant="outline"
                        loading={busy === "review"}
                        onClick={() => doReview(record.reviewStage!, "On Hold")}
                      >
                        On Hold
                      </ErpButton>
                      <ErpButton
                        size="sm"
                        variant="destructive"
                        loading={busy === "review"}
                        onClick={() =>
                          doReview(record.reviewStage!, "Rejected", "Not aligned with portfolio")
                        }
                      >
                        Reject
                      </ErpButton>
                    </>
                  ) : (
                    <>
                      <ErpButton
                        size="sm"
                        loading={busy === "review"}
                        onClick={() => doReview(record.reviewStage!, "Approved")}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Validate & Forward
                      </ErpButton>
                      <ErpButton
                        size="sm"
                        variant="outline"
                        loading={busy === "review"}
                        onClick={() =>
                          doReview(record.reviewStage!, "Revision Required", "Needs more detail")
                        }
                      >
                        Revision
                      </ErpButton>
                      <ErpButton
                        size="sm"
                        variant="destructive"
                        loading={busy === "review"}
                        onClick={() => doReview(record.reviewStage!, "Rejected")}
                      >
                        Reject
                      </ErpButton>
                    </>
                  )}
                </div>
              </div>
            )}

            {status === "approved" && record?.feasibilityProjectCode && (
              <div className="card-soft border-success/30 bg-success/5 p-5">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-success">
                  Feasibility Study Created
                </h4>
                <p className="font-display text-lg font-bold text-foreground">
                  {record.feasibilityProjectCode}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Auto-created on Innovation Committee approval.
                </p>
              </div>
            )}

            <div className="card-soft p-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Highlights
              </h4>
              <ul className="space-y-1.5">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        h.ok ? "text-success" : "text-muted-foreground/50",
                      )}
                    />
                    <span className={h.ok ? "text-foreground" : "text-muted-foreground"}>
                      {h.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-soft p-5">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Attachments{" "}
                  {input.attachments.length > 0 && (
                    <span className="text-primary">({input.attachments.length})</span>
                  )}
                </h4>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs font-semibold text-primary hover:underline"
                  disabled={!editable}
                >
                  Upload
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
              {input.attachments.length === 0 ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={!editable}
                  className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed border-border py-5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  <UploadCloud className="h-5 w-5" /> Upload files
                </button>
              ) : (
                <ul className="space-y-1.5">
                  {input.attachments.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                      <a
                        href={a.url}
                        download={a.filename}
                        className="flex min-w-0 items-center gap-1.5 text-foreground hover:text-primary"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{a.filename}</span>
                      </a>
                      {editable && (
                        <button
                          onClick={() =>
                            setInput((p) => ({
                              ...p,
                              attachments: p.attachments.filter((x) => x.id !== a.id),
                            }))
                          }
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="Remove attachment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                  {input.attachments.length > 5 && (
                    <li className="pt-1 text-[11px] text-muted-foreground">
                      +{input.attachments.length - 5} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          </aside>
        </div>

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
          <FooterItem
            label="Workflow Stage"
            value={record?.reviewStage ?? OPPORTUNITY_STATUS_LABEL[status] ?? "Draft"}
          />
          <FooterItem label="Version" value={`${record?.version ?? 1}.0`} />
          <ErpButton size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
            <HistoryIcon className="h-4 w-4" /> View Activity History
          </ErpButton>
        </div>
      </div>

      {/* Activity history */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>
              {record?.opportunityCode ?? "Unsaved opportunity"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {(record?.auditTrail ?? []).length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No activity yet — save a draft to start the audit trail.
              </p>
            ) : (
              [...(record?.auditTrail ?? [])].reverse().map((a, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">{a.event}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                    {a.fromStatus && a.toStatus
                      ? ` · ${OPPORTUNITY_STATUS_LABEL[a.fromStatus]} → ${OPPORTUNITY_STATUS_LABEL[a.toStatus]}`
                      : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scoring details / AI insights */}
      <Dialog open={scoringOpen} onOpenChange={setScoringOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Scoring Details</DialogTitle>
            <DialogDescription>How this opportunity's scores were calculated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <ScoreTile
                label="Market"
                value={record?.aiAnalysis?.aiMarketScore ?? preview.aiMarketScore}
              />
              <ScoreTile
                label="Technology"
                value={record?.aiAnalysis?.aiTechnologyScore ?? preview.aiTechnologyScore}
              />
              <ScoreTile
                label="Competition"
                value={record?.aiAnalysis?.aiCompetitionScore ?? preview.aiCompetitionScore}
              />
              <ScoreTile
                label="Risk"
                value={record?.aiAnalysis?.aiRiskScore ?? preview.aiRiskScore}
              />
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-foreground">Recommendation</p>
              <p className="mt-1 text-muted-foreground">
                {record?.aiAnalysis?.aiRecommendation ??
                  "Submit for review to generate the recommendation."}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-foreground">Suggested Improvements</p>
              <p className="mt-1 text-muted-foreground">
                {record?.aiAnalysis?.aiSuggestedImprovements ??
                  "Submit for review to generate suggestions."}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-foreground">Suggested Markets</p>
              <p className="mt-1 text-muted-foreground">
                {record?.aiAnalysis?.aiSuggestedMarkets ?? "—"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
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
