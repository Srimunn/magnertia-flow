import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  History,
  Landmark,
  Loader2,
  MoreHorizontal,
  ScrollText,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PatentMgmtPageTabBar, PATENT_STATUS_LABEL } from "@/components/erp/PatentMgmtTabBar";
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
import { patentMgmtService } from "@/services";
import type {
  PatentApprovalDecision,
  PatentDeadlineTone,
  PatentFormInput,
  PatentRecord,
  PatentStage,
  PatentStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/ip-development/patent-management/new")({
  head: () => ({ meta: [{ title: "Patent Management Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: PatentFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: PatentStatus[] = [
  "draft",
  "preparation",
  "filing",
  "examination",
  "granted",
  "commercialization",
  "revision_required",
];
const STAGE_LABEL: Record<PatentStage, string> = {
  preparation: "Patent Preparation",
  filing: "Patent Filing",
  examination: "Patent Examination",
  grant: "Patent Grant",
  commercialization: "Commercialization",
};

const EMPTY: PatentFormInput = {
  patentTitle: "",
  technologyDomain: "Robotics & Automation",
  inventors: [],
  patentManager: "Rohit Verma",
  filingDate: new Date().toISOString().slice(0, 10),
  targetGrantDate: "",
  linkedIpRecordId: null,
  information: {
    abstract: "",
    patentType: "Utility Patent",
    technologyArea: "Robotics & Automation",
    industrySector: "Automotive",
    keywords: [],
    patentStatus: "Draft",
  },
  inventorInfo: {
    leadInventor: "Arjun Mehta",
    coInventors: [],
    organization: "Magnertia R&D Center",
    ownership: "Company Owned",
    assignmentAgreement: true,
    ndaSigned: true,
  },
  filing: {
    filingRoute: "PCT Filing",
    filingCountries: [],
    patentOffice: "World Intellectual Property Organization (WIPO)",
    filingAttorney: "LexOrbis IP Services",
    filingCost: 0,
    filingReceipt: null,
    priorityDate: "",
    publicationDate: "",
  },
  prosecution: {
    examiner: "",
    officeAction: "None",
    officeActionDate: "",
    responseDueDate: "",
    responseSubmitted: false,
    amendmentRequired: false,
    currentStage: "Pre-Filing",
  },
  grant: {
    grantNumber: "",
    grantDate: "",
    expiryDate: "",
    patentTerm: 20,
    renewalFrequency: "Every 2 Years",
    renewalCostNext: 0,
  },
  international: {
    pctFiled: true,
    pctNumber: "",
    nationalPhaseCountries: [],
    epFiling: true,
    usFiling: true,
    indiaFiling: true,
    otherJurisdictions: [],
  },
  commercialization: {
    licensingStatus: "Under Negotiation",
    licensee: "",
    royaltyModel: "Running Royalty",
    annualRoyalty: 0,
    technologyTransfer: true,
    strategicImportance: 8,
    commercialValue: 0,
  },
  attachments: [],
  recommendation: "",
};

function recordToInput(r: PatentRecord): PatentFormInput {
  return {
    patentTitle: r.patentTitle,
    technologyDomain: r.technologyDomain,
    inventors: r.inventors,
    patentManager: r.patentManager,
    filingDate: r.filingDate,
    targetGrantDate: r.targetGrantDate,
    linkedIpRecordId: r.linkedIpRecordId,
    information: r.information,
    inventorInfo: r.inventorInfo,
    filing: r.filing,
    prosecution: r.prosecution,
    grant: r.grant,
    international: r.international,
    commercialization: r.commercialization,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
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
  placeholder?: string;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y border-border")}
      rows={p.rows ?? 2}
      value={p.value}
      disabled={p.disabled}
      placeholder={p.placeholder}
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
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {p.prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-6", p.suffix && "pr-9")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
      {p.suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
function DateInput(p: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type="date"
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange(e.target.value)}
    />
  );
}
function YesNo(p: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {(
        [
          ["Yes", true],
          ["No", false],
        ] as const
      ).map(([label, val]) => (
        <label
          key={label}
          className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
        >
          <input
            type="radio"
            className="h-3.5 w-3.5 accent-primary"
            checked={p.value === val}
            disabled={p.disabled}
            onChange={() => p.onChange(val)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
function TagMulti(p: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.options.map((o) => {
        const on = p.selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            disabled={p.disabled}
            onClick={() => p.onToggle(o)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-60",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary/40",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
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
        <input
          className={cn(INPUT, "border-border")}
          placeholder="Add keyword and press Enter…"
          value={draft}
          list="patent-keyword-suggestions"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
      )}
      <datalist id="patent-keyword-suggestions">
        {p.suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
function SectionCard(p: {
  n: number;
  title: string;
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <section className={cn("card-soft space-y-3 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold",
            p.accent ?? "bg-primary/10 text-primary",
          )}
        >
          {p.n}
        </span>
        {p.title}
      </h3>
      {p.children}
    </section>
  );
}
/** Score row (label + /100 value). `invert` flips the colour semantics
 *  (litigation risk: lower is better). */
function ScoreRow({
  label,
  value,
  unit = "/100",
  invert = false,
}: {
  label: string;
  value: number;
  unit?: string;
  invert?: boolean;
}) {
  const good = invert ? value <= 35 : value >= 70;
  const mid = invert ? value <= 60 : value >= 50;
  const color = good ? "text-success" : mid ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}
function FileCard(p: { name: string; sizeLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground">{p.name}</div>
          <div className="text-[10px] text-muted-foreground">{p.sizeLabel}</div>
        </div>
      </div>
      <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </div>
  );
}
const TONE_CLASS: Record<PatentDeadlineTone, string> = {
  overdue: "text-destructive",
  due: "text-destructive",
  soon: "text-[#F59E0B]",
  ok: "text-success",
  none: "text-muted-foreground",
};
function LinkChip({ label, code }: { label: string; code: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-foreground">{label}</span>
      <div className="flex h-[38px] items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
        {code ? (
          <>
            {code} <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

/* ================================== Page ================================== */
function PatentFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["patent-management", "lookups"],
    queryFn: () => patentMgmtService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["patent-management", "record", id],
    queryFn: () => patentMgmtService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["patent-management", "approved-ip"],
    queryFn: () => patentMgmtService.fetchApprovedIpRecords(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<PatentFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: PatentStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "preparation";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState<
    null | "audit" | "activity" | "change" | "workflow"
  >(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<PatentApprovalDecision>("Approved");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Patent Specification");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["patent-management"] });

  const saveMut = useMutation({
    mutationFn: () => patentMgmtService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(record ? "Patent saved." : `Patent ${r.patentId} created.`);
      if (!record)
        navigate({ to: "/development/ip-development/patent-management/new", search: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => patentMgmtService.completeStage(record!.id, currentStage),
    onSuccess: (r) => {
      invalidate();
      if (currentStage === "examination" && r.portfolioEntryCode)
        toast.success(`Patent granted — Portfolio entry ${r.portfolioEntryCode} created.`);
      else if (currentStage === "grant" && r.licensingRecordCode)
        toast.success(`Licensing opportunity ${r.licensingRecordCode} created.`);
      else toast.success(`${STAGE_LABEL[currentStage]} completed.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const respondMut = useMutation({
    mutationFn: () => patentMgmtService.submitOfficeActionResponse(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Office Action response submitted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const renewMut = useMutation({
    mutationFn: () => patentMgmtService.payRenewalFee(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Renewal fee paid.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => patentMgmtService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Submitted for executive review.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      patentMgmtService.review({
        id: record!.id,
        decision: reviewDecision,
        comments: reviewComments || undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "active") toast.success("Patent approved — Patent Successfully Managed.");
      else if (r.status === "commercialization")
        toast.success("Approved with recommendations — improve licensing strategy.");
      else if (r.status === "closed") toast.success("Patent abandoned and closed.");
      else toast.success("Revision required — strengthen patent claims.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const refreshMut = useMutation({
    mutationFn: () => patentMgmtService.refresh(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Portfolio report generated — analytics refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    respondMut.isPending ||
    renewMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    refreshMut.isPending;

  const set = <K extends keyof PatentFormInput>(key: K, value: PatentFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setInfo = (patch: Partial<PatentFormInput["information"]>) =>
    setForm((f) => ({ ...f, information: { ...f.information, ...patch } }));
  const setInv = (patch: Partial<PatentFormInput["inventorInfo"]>) =>
    setForm((f) => ({ ...f, inventorInfo: { ...f.inventorInfo, ...patch } }));
  const setFiling = (patch: Partial<PatentFormInput["filing"]>) =>
    setForm((f) => ({ ...f, filing: { ...f.filing, ...patch } }));
  const setPros = (patch: Partial<PatentFormInput["prosecution"]>) =>
    setForm((f) => ({ ...f, prosecution: { ...f.prosecution, ...patch } }));
  const setGrant = (patch: Partial<PatentFormInput["grant"]>) =>
    setForm((f) => ({ ...f, grant: { ...f.grant, ...patch } }));
  const setIntl = (patch: Partial<PatentFormInput["international"]>) =>
    setForm((f) => ({ ...f, international: { ...f.international, ...patch } }));
  const setComm = (patch: Partial<PatentFormInput["commercialization"]>) =>
    setForm((f) => ({ ...f, commercialization: { ...f.commercialization, ...patch } }));

  const applyIp = (ipId: string) => {
    const ip = (sourcesQuery.data ?? []).find((r) => r.id === ipId);
    set("linkedIpRecordId", ipId || null);
    if (!ip) return;
    setForm((f) => ({
      ...f,
      linkedIpRecordId: ipId,
      patentTitle: f.patentTitle || ip.inventionTitle,
      technologyDomain: ip.technologyDomain || f.technologyDomain,
      inventors: f.inventors.length
        ? f.inventors
        : [ip.leadInventor, ...ip.coInventors].filter(Boolean),
      information: {
        ...f.information,
        abstract: f.information.abstract || ip.abstract,
        technologyArea: ip.technologyArea || f.information.technologyArea,
        industrySector: ip.industrySector || f.information.industrySector,
        keywords: f.information.keywords.length ? f.information.keywords : ip.keywords,
      },
      inventorInfo: {
        ...f.inventorInfo,
        leadInventor: ip.leadInventor || f.inventorInfo.leadInventor,
        coInventors: f.inventorInfo.coInventors.length
          ? f.inventorInfo.coInventors
          : ip.coInventors,
      },
    }));
    toast.success(`Context loaded from ${ip.ipRecordCode}.`);
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
        uploadedBy: form.patentManager || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const ai = record?.aiAnalytics ?? null;
  const summary = record?.summary ?? null;
  const deadlines = record?.deadlines ?? null;
  const renewalDueOrOverdue =
    deadlines?.renewalState === "Due" || deadlines?.renewalState === "Overdue";
  const responseAlert =
    !!record &&
    !form.prosecution.responseSubmitted &&
    (deadlines?.responseDueTone === "due" ||
      deadlines?.responseDueTone === "overdue" ||
      deadlines?.responseDueTone === "soon");

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Patent Management"
        breadcrumb="Development · IP Development · Patent Management"
        description="Patent Management Form"
        tabs={<PatentMgmtPageTabBar />}
      >
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  const historyKind = historyOpen;
  const historyEntries = record
    ? record.auditTrail.filter((a) => (historyKind ? (a.kind ?? "audit") === historyKind : true))
    : [];

  return (
    <AppShell
      title="Patent Management"
      breadcrumb="Development · IP Development · Patent Management"
      description="Patent Management Form"
      tabs={<PatentMgmtPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          {/* Row 1 */}
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
            <Field label="Patent ID">
              <TextInput value={record?.patentId ?? "Auto"} disabled />
            </Field>
            <Field label="Patent Number">
              <TextInput value={record?.patentNumber || "—"} disabled />
            </Field>
            <Field label="Application Number">
              <TextInput value={record?.applicationNumber || "—"} disabled />
            </Field>
            <Field label="Patent Title" required>
              <TextInput
                value={form.patentTitle}
                onChange={(v) => set("patentTitle", v)}
                disabled={!editable}
                placeholder="e.g. Autonomous Docking System for Electric Vehicles"
              />
            </Field>
            <LinkChip label="Linked IP Record" code={record?.linkedIpRecordCode} />
            <LinkChip label="Linked Product" code={record?.linkedProductCode} />
            <Field label="Patent Family">
              <TextInput value={record?.patentFamily ?? "Auto"} disabled />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Workflow Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={PATENT_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Technology Domain">
              <Select
                value={form.technologyDomain}
                onChange={(v) => set("technologyDomain", v)}
                options={lookups?.technologyDomains ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Inventor(s)">
              <div className="flex flex-wrap gap-1">
                {form.inventors.length ? (
                  <>
                    {form.inventors.slice(0, 4).map((inv) => (
                      <span
                        key={inv}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
                        title={inv}
                      >
                        {inv
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                    ))}
                    {form.inventors.length > 4 && (
                      <span className="flex h-7 items-center rounded-full bg-muted px-2 text-[10px] font-bold text-muted-foreground">
                        +{form.inventors.length - 4}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </Field>
            <Field label="Patent Manager">
              <Select
                value={form.patentManager}
                onChange={(v) => set("patentManager", v)}
                options={lookups?.patentManagers ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Filing Date">
              <DateInput
                value={form.filingDate}
                onChange={(v) => set("filingDate", v)}
                disabled={!editable}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Next Action</span>
              <div
                className={cn(
                  "flex h-[38px] items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold",
                  responseAlert || renewalDueOrOverdue
                    ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-border bg-muted/30 text-foreground",
                )}
              >
                {(responseAlert || renewalDueOrOverdue) && (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                )}
                {record?.nextAction ?? "Create the patent to begin"}
              </div>
            </div>
            <Field label="Target Grant Date">
              <DateInput
                value={form.targetGrantDate}
                onChange={(v) => set("targetGrantDate", v)}
                disabled={!editable}
              />
            </Field>
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Approved IP Record (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedIpRecordId ?? ""}
                  onChange={(e) => applyIp(e.target.value)}
                >
                  <option value="">Select an approved IP record…</option>
                  {(sourcesQuery.data ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.ipRecordCode} — {r.inventionTitle}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  A patent can only be created from an approved IP record. The invention disclosure
                  and patent draft are retrieved automatically.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  Stage: <span className="font-semibold">{STAGE_LABEL[currentStage]}</span>
                </>
              ) : (
                "Select an approved IP record, fill the sections, then create the patent to start Preparation."
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editable && (
                <ErpButton variant="outline" onClick={() => saveMut.mutate()} disabled={busy}>
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {record ? "Save Draft" : "Create Patent"}
                </ErpButton>
              )}
              {record && responseAlert && (
                <ErpButton variant="outline" onClick={() => respondMut.mutate()} disabled={busy}>
                  {respondMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  Respond to Office Action
                </ErpButton>
              )}
              {record && renewalDueOrOverdue && (
                <ErpButton variant="outline" onClick={() => renewMut.mutate()} disabled={busy}>
                  {renewMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  Pay Renewal Fee
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
              {record && editable && allStagesDone && !record.submittedForReview && (
                <ErpButton onClick={() => submitMut.mutate()} disabled={busy}>
                  {submitMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit for Review
                </ErpButton>
              )}
              {record && record.submittedForReview && (
                <ErpButton onClick={() => setReviewOpen(true)} disabled={busy}>
                  <Landmark className="h-4 w-4" /> Record Committee Decision
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
                    <DropdownMenuItem onClick={() => refreshMut.mutate()}>
                      <FileText className="h-4 w-4" /> Generate Portfolio Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setInsightsOpen(true)}>
                      <Brain className="h-4 w-4" /> View AI Insights
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------- Status banners --------------------------- */}
        {record && record.submittedForReview && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Patent Review Committee Decision
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve, approve with recommendations, request revision, or abandon.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "active" && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">Patent Active — Successfully Managed.</span>
            {record.portfolioEntryCode && (
              <span className="text-muted-foreground">
                Portfolio entry {record.portfolioEntryCode} · Licensing{" "}
                {record.licensingRecordCode ?? "—"}.
              </span>
            )}
          </div>
        )}
        {record && status === "revision_required" && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Revision requested: </span>
            <span className="text-muted-foreground">
              {record.reviewComments || "Strengthen patent claims / update documentation."}
            </span>
          </div>
        )}

        {/* =================== ROW 1: sections 1–5 (5 columns) =================== */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {/* 1 — Patent Information */}
          <SectionCard n={1} title="Patent Information">
            <Field label="Patent Title" required>
              <TextInput
                value={form.patentTitle}
                onChange={(v) => set("patentTitle", v)}
                disabled={!editable}
              />
            </Field>
            <Field label="Abstract" required>
              <TextArea
                value={form.information.abstract}
                onChange={(v) => setInfo({ abstract: v })}
                rows={4}
                disabled={!editable}
                placeholder="A docking system enabling autonomous alignment and wireless power transfer…"
              />
            </Field>
            <Field label="Patent Type" required>
              <Select
                value={form.information.patentType}
                onChange={(v) => setInfo({ patentType: v })}
                options={lookups?.patentTypes ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Technology Area" required>
              <Select
                value={form.information.technologyArea}
                onChange={(v) => setInfo({ technologyArea: v })}
                options={lookups?.technologyAreas ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Industry Sector" required>
              <Select
                value={form.information.industrySector}
                onChange={(v) => setInfo({ industrySector: v })}
                options={lookups?.industrySectors ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Keywords" required>
              <KeywordInput
                selected={form.information.keywords}
                suggestions={lookups?.keywordSuggestions ?? []}
                onChange={(v) => setInfo({ keywords: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Patent Status">
              <Select
                value={form.information.patentStatus}
                onChange={(v) => setInfo({ patentStatus: v })}
                options={lookups?.patentStatuses ?? []}
                disabled={!editable}
              />
            </Field>
          </SectionCard>

          {/* 2 — Inventor Information */}
          <SectionCard n={2} title="Inventor Information">
            <Field label="Lead Inventor" required>
              <Select
                value={form.inventorInfo.leadInventor}
                onChange={(v) => setInv({ leadInventor: v })}
                options={lookups?.inventors ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Co-Inventors">
              <TagMulti
                options={lookups?.inventors ?? []}
                selected={form.inventorInfo.coInventors}
                onToggle={(v) =>
                  setInv({
                    coInventors: form.inventorInfo.coInventors.includes(v)
                      ? form.inventorInfo.coInventors.filter((x) => x !== v)
                      : [...form.inventorInfo.coInventors, v],
                  })
                }
                disabled={!editable}
              />
            </Field>
            <Field label="Organization" required>
              <Select
                value={form.inventorInfo.organization}
                onChange={(v) => setInv({ organization: v })}
                options={lookups?.organizations ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Ownership" required>
              <Select
                value={form.inventorInfo.ownership}
                onChange={(v) => setInv({ ownership: v })}
                options={lookups?.ownerships ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Assignment Agreement" required>
              <YesNo
                value={form.inventorInfo.assignmentAgreement}
                onChange={(v) => setInv({ assignmentAgreement: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="NDA Signed" required>
              <YesNo
                value={form.inventorInfo.ndaSigned}
                onChange={(v) => setInv({ ndaSigned: v })}
                disabled={!editable}
              />
            </Field>
          </SectionCard>

          {/* 3 — Patent Filing */}
          <SectionCard n={3} title="Patent Filing">
            <Field label="Filing Route" required>
              <Select
                value={form.filing.filingRoute}
                onChange={(v) => setFiling({ filingRoute: v })}
                options={lookups?.filingRoutes ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Filing Country" required>
              <TagMulti
                options={lookups?.filingCountries ?? []}
                selected={form.filing.filingCountries}
                onToggle={(v) =>
                  setFiling({
                    filingCountries: form.filing.filingCountries.includes(v)
                      ? form.filing.filingCountries.filter((x) => x !== v)
                      : [...form.filing.filingCountries, v],
                  })
                }
                disabled={!editable}
              />
            </Field>
            <Field label="Patent Office" required>
              <Select
                value={form.filing.patentOffice}
                onChange={(v) => setFiling({ patentOffice: v })}
                options={lookups?.patentOffices ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Filing Attorney" required>
              <Select
                value={form.filing.filingAttorney}
                onChange={(v) => setFiling({ filingAttorney: v })}
                options={lookups?.filingAttorneys ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Filing Cost" required>
              <NumberInput
                value={form.filing.filingCost}
                onChange={(v) => setFiling({ filingCost: v })}
                prefix="₹"
                disabled={!editable}
              />
            </Field>
            {form.filing.filingReceipt ? (
              <FileCard
                name={form.filing.filingReceipt.name}
                sizeLabel={form.filing.filingReceipt.sizeLabel}
              />
            ) : (
              <FileCard name="Filing_Receipt.pdf" sizeLabel="1.2 MB" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <Field label="Priority Date">
                <DateInput
                  value={form.filing.priorityDate}
                  onChange={(v) => setFiling({ priorityDate: v })}
                  disabled={!editable}
                />
              </Field>
              <Field label="Publication Date">
                <DateInput
                  value={form.filing.publicationDate}
                  onChange={(v) => setFiling({ publicationDate: v })}
                  disabled={!editable}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 4 — Patent Prosecution */}
          <SectionCard n={4} title="Patent Prosecution">
            <Field label="Examiner">
              <TextInput
                value={form.prosecution.examiner}
                onChange={(v) => setPros({ examiner: v })}
                disabled={!editable}
                placeholder="Dr. Michael Anderson"
              />
            </Field>
            <Field label="Office Action">
              <Select
                value={form.prosecution.officeAction}
                onChange={(v) => setPros({ officeAction: v })}
                options={lookups?.officeActions ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Office Action Date">
              <DateInput
                value={form.prosecution.officeActionDate}
                onChange={(v) => setPros({ officeActionDate: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Response Due Date">
              <DateInput
                value={form.prosecution.responseDueDate}
                onChange={(v) => setPros({ responseDueDate: v })}
                disabled={!editable}
              />
            </Field>
            {deadlines && deadlines.responseDueTone !== "none" && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-semibold",
                  TONE_CLASS[deadlines.responseDueTone],
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {deadlines.responseDaysLeft !== null && deadlines.responseDaysLeft < 0
                  ? `Response overdue by ${Math.abs(deadlines.responseDaysLeft)} day(s)`
                  : `Response due in ${deadlines.responseDaysLeft} day(s)`}
              </div>
            )}
            <Field label="Response Submitted">
              <YesNo
                value={form.prosecution.responseSubmitted}
                onChange={(v) => setPros({ responseSubmitted: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Amendment Required">
              <YesNo
                value={form.prosecution.amendmentRequired}
                onChange={(v) => setPros({ amendmentRequired: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Current Stage">
              <Select
                value={form.prosecution.currentStage}
                onChange={(v) => setPros({ currentStage: v })}
                options={lookups?.prosecutionStages ?? []}
                disabled={!editable}
              />
            </Field>
          </SectionCard>

          {/* 5 — Patent Grant */}
          <SectionCard n={5} title="Patent Grant">
            <Field label="Grant Number">
              <TextInput
                value={form.grant.grantNumber}
                onChange={(v) => setGrant({ grantNumber: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Grant Date">
              <DateInput
                value={form.grant.grantDate}
                onChange={(v) => setGrant({ grantDate: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Expiry Date">
              <DateInput
                value={form.grant.expiryDate}
                onChange={(v) => setGrant({ expiryDate: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Patent Term (Years)">
              <NumberInput
                value={form.grant.patentTerm}
                onChange={(v) => setGrant({ patentTerm: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Renewal Frequency" required>
              <Select
                value={form.grant.renewalFrequency}
                onChange={(v) => setGrant({ renewalFrequency: v })}
                options={lookups?.renewalFrequencies ?? []}
                disabled={!editable}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Renewal Status</span>
              <div className="flex h-[38px] items-center">
                {deadlines && deadlines.renewalState !== "N/A" ? (
                  <StatusBadge status={deadlines.renewalState} />
                ) : (
                  <span className="text-xs text-muted-foreground">— (set after grant)</span>
                )}
              </div>
              {deadlines?.renewalDaysLeft != null &&
                deadlines.renewalState !== "N/A" &&
                deadlines.renewalState !== "Paid" && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      deadlines.renewalDaysLeft < 0
                        ? "text-destructive"
                        : deadlines.renewalDaysLeft <= 60
                          ? "text-[#F59E0B]"
                          : "text-muted-foreground",
                    )}
                  >
                    {deadlines.renewalDaysLeft < 0
                      ? `Overdue by ${Math.abs(deadlines.renewalDaysLeft)}d`
                      : `Due in ${deadlines.renewalDaysLeft}d`}
                  </span>
                )}
            </div>
            <Field label="Renewal Cost (Next)">
              <NumberInput
                value={form.grant.renewalCostNext}
                onChange={(v) => setGrant({ renewalCostNext: v })}
                prefix="₹"
                disabled={!editable}
              />
            </Field>
          </SectionCard>
        </div>

        {/* =================== ROW 2: sections 6–10 (5 columns) ================== */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {/* 6 — International Protection */}
          <SectionCard n={6} title="International Protection">
            <Field label="PCT Filed" required>
              <YesNo
                value={form.international.pctFiled}
                onChange={(v) => setIntl({ pctFiled: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="PCT Number">
              <TextInput
                value={form.international.pctNumber}
                onChange={(v) => setIntl({ pctNumber: v })}
                disabled={!editable}
                placeholder="PCT/IN2026/050123"
              />
            </Field>
            <Field label="National Phase Countries">
              <TagMulti
                options={lookups?.jurisdictions ?? []}
                selected={form.international.nationalPhaseCountries}
                onToggle={(v) =>
                  setIntl({
                    nationalPhaseCountries: form.international.nationalPhaseCountries.includes(v)
                      ? form.international.nationalPhaseCountries.filter((x) => x !== v)
                      : [...form.international.nationalPhaseCountries, v],
                  })
                }
                disabled={!editable}
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="EP Filing">
                <YesNo
                  value={form.international.epFiling}
                  onChange={(v) => setIntl({ epFiling: v })}
                  disabled={!editable}
                />
              </Field>
              <Field label="US Filing">
                <YesNo
                  value={form.international.usFiling}
                  onChange={(v) => setIntl({ usFiling: v })}
                  disabled={!editable}
                />
              </Field>
              <Field label="India Filing">
                <YesNo
                  value={form.international.indiaFiling}
                  onChange={(v) => setIntl({ indiaFiling: v })}
                  disabled={!editable}
                />
              </Field>
            </div>
            <Field label="Other Jurisdictions">
              <TagMulti
                options={lookups?.jurisdictions ?? []}
                selected={form.international.otherJurisdictions}
                onToggle={(v) =>
                  setIntl({
                    otherJurisdictions: form.international.otherJurisdictions.includes(v)
                      ? form.international.otherJurisdictions.filter((x) => x !== v)
                      : [...form.international.otherJurisdictions, v],
                  })
                }
                disabled={!editable}
              />
            </Field>
          </SectionCard>

          {/* 7 — Commercialization */}
          <SectionCard n={7} title="Commercialization">
            <Field label="Licensing Status">
              <Select
                value={form.commercialization.licensingStatus}
                onChange={(v) => setComm({ licensingStatus: v })}
                options={lookups?.licensingStatuses ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Licensee">
              <TextInput
                value={form.commercialization.licensee}
                onChange={(v) => setComm({ licensee: v })}
                disabled={!editable}
                placeholder="PowerCharge Solutions Pvt. Ltd."
              />
            </Field>
            <Field label="Royalty Model">
              <Select
                value={form.commercialization.royaltyModel}
                onChange={(v) => setComm({ royaltyModel: v })}
                options={lookups?.royaltyModels ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Annual Royalty">
              <NumberInput
                value={form.commercialization.annualRoyalty}
                onChange={(v) => setComm({ annualRoyalty: v })}
                prefix="₹"
                disabled={!editable}
              />
            </Field>
            <Field label="Technology Transfer">
              <YesNo
                value={form.commercialization.technologyTransfer}
                onChange={(v) => setComm({ technologyTransfer: v })}
                disabled={!editable}
              />
            </Field>
            <Field label="Strategic Importance">
              <StarRating
                value={form.commercialization.strategicImportance}
                onChange={(v) => setComm({ strategicImportance: v })}
                readOnly={!editable}
                aria-label="Strategic importance"
              />
            </Field>
            <Field label="Commercial Value">
              <NumberInput
                value={form.commercialization.commercialValue}
                onChange={(v) => setComm({ commercialValue: v })}
                prefix="₹"
                disabled={!editable}
              />
            </Field>
          </SectionCard>

          {/* 8 — AI Patent Analytics */}
          <SectionCard n={8} title="AI Patent Analytics" accent="bg-[#7c5cff]/10 text-[#7c5cff]">
            {ai ? (
              <>
                <div className="space-y-2">
                  <ScoreRow label="AI Patent Strength Score" value={ai.patentStrengthScore} />
                  <ScoreRow label="AI Claim Quality Score" value={ai.claimQualityScore} />
                  <ScoreRow label="AI Litigation Risk" value={ai.litigationRisk} invert />
                  <ScoreRow label="AI Licensing Potential" value={ai.licensingPotential} />
                  <ScoreRow label="AI Commercial Score" value={ai.commercialScore} />
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="mb-1 text-[11px] font-bold text-foreground">
                    AI Renewal Recommendation
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {ai.renewalRecommendation}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="mb-1 text-[11px] font-bold text-foreground">
                    AI Portfolio Recommendation
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {ai.portfolioRecommendation}
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
                AI analytics are generated on creation and refreshed as each stage completes.
              </p>
            )}
          </SectionCard>

          {/* 9 — Patent Summary */}
          <SectionCard n={9} title="Patent Summary" accent="bg-[#22C55E]/10 text-[#22C55E]">
            {summary ? (
              <>
                <div className="space-y-2">
                  <ScoreRow label="Legal Score" value={summary.legalScore} />
                  <ScoreRow label="Patent Strength Score" value={summary.patentStrengthScore} />
                  <ScoreRow label="Commercial Score" value={summary.commercialScore} />
                  <ScoreRow label="Portfolio Score" value={summary.portfolioScore} />
                </div>
                <div className="rounded-lg border border-border bg-primary/5 p-3 text-center">
                  <div className="text-[10px] font-semibold text-muted-foreground">
                    Overall Patent Score
                  </div>
                  <div className="font-display text-2xl font-bold tabular text-foreground">
                    {summary.overallPatentScore}
                    <span className="text-sm text-muted-foreground"> /100</span>
                  </div>
                </div>
                <Field label="Recommendation" required>
                  <Select
                    value={form.recommendation}
                    onChange={(v) => set("recommendation", v)}
                    options={lookups?.recommendations ?? []}
                    disabled={!editable}
                  />
                </Field>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                The summary scores are computed once the patent is created.
              </p>
            )}
          </SectionCard>

          {/* 10 — Attachments */}
          <SectionCard n={10} title="Attachments">
            <div className="grid grid-cols-1 gap-1.5">
              {form.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No documents attached yet.</p>
              ) : (
                form.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate text-[11px] font-semibold text-foreground">
                        {a.filename}
                      </span>
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
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {editable && (
              <div className="space-y-2 border-t border-border pt-2">
                <select
                  className={cn(INPUT, "border-border")}
                  value={attachCategory}
                  onChange={(e) => setAttachCategory(e.target.value)}
                >
                  {(lookups?.attachmentCategories ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ErpButton
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Upload File
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
            <button className="text-[11px] font-semibold text-primary hover:underline">
              View All Attachments →
            </button>
          </SectionCard>
        </div>

        {/* =================== ROW 3: sections 11–12 (2 cols) =================== */}
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          {/* 11 — Review & Approval TABLE */}
          <SectionCard n={11} title="Review & Approval">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-1.5 pr-3 font-semibold">Role</th>
                    <th className="py-1.5 pr-3 font-semibold">Person</th>
                    <th className="py-1.5 pr-3 font-semibold">Decision</th>
                    <th className="py-1.5 pr-3 font-semibold">Comments</th>
                    <th className="py-1.5 pr-3 font-semibold">Status</th>
                    <th className="py-1.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(record?.reviewRows ?? initialReviewPreview()).map((r) => (
                    <tr key={r.role} className="border-b border-border/60">
                      <td className="py-2 pr-3 text-xs font-semibold text-foreground">{r.role}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{r.person}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            r.decision === "Approved"
                              ? "bg-success/10 text-success"
                              : "bg-warning/15 text-[oklch(0.45_0.15_75)]",
                          )}
                        >
                          {r.decision}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {r.comments || "—"}
                      </td>
                      <td
                        className={cn(
                          "py-2 pr-3 text-xs font-semibold",
                          r.status === "Reviewed" ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        {r.status}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3">
              <Field label="Approval Decision" required>
                <TextInput value={record?.approvalDecision ?? "Pending"} disabled />
              </Field>
              <Field label="Review Comments">
                <div>
                  <TextInput value={record?.reviewComments ?? "—"} disabled />
                  <div className="mt-0.5 text-right text-[10px] text-muted-foreground">
                    {(record?.reviewComments ?? "").length}/3000
                  </div>
                </div>
              </Field>
              <Field label="Approval Date" required>
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
          </SectionCard>

          {/* 12 — System Information */}
          <SectionCard n={12} title="System Information">
            <div className="grid grid-cols-2 gap-3">
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
                  Modified By
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
                  <StatusBadge status={PATENT_STATUS_LABEL[status]} />
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Version
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {record ? `${record.version}.0` : "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <HistoryLink
                icon={<History className="h-3.5 w-3.5" />}
                label="Audit Trail"
                sub="View Log"
                onClick={() => setHistoryOpen("audit")}
                disabled={!record}
              />
              <HistoryLink
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Activity History"
                sub="View History"
                onClick={() => setHistoryOpen("activity")}
                disabled={!record}
              />
              <HistoryLink
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Change History"
                sub="View Changes"
                onClick={() => setHistoryOpen("change")}
                disabled={!record}
              />
              <HistoryLink
                icon={<GitBranch className="h-3.5 w-3.5" />}
                label="Workflow History"
                sub="View Workflow"
                onClick={() => setHistoryOpen("workflow")}
                disabled={!record}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* --------------------------- Committee Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Patent Review Committee</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.patentTitle || record.patentId} — overall ${summary?.overallPatentScore ?? 0}/100.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as PatentApprovalDecision)}
                options={lookups?.approvalDecisions ?? []}
              />
            </Field>
            <Field label="Review Comments">
              <TextArea
                value={reviewComments}
                onChange={(v) => setReviewComments(v.slice(0, 3000))}
                rows={3}
              />
            </Field>
            <div className="text-right text-[10px] text-muted-foreground">
              {reviewComments.length}/3000
            </div>
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

      {/* ------------------------------ History dialogs (4 distinct) ------------------------------ */}
      <Dialog open={historyOpen !== null} onOpenChange={(o) => !o && setHistoryOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {historyKind === "audit" && "Audit Trail"}
              {historyKind === "activity" && "Activity History"}
              {historyKind === "change" && "Change History"}
              {historyKind === "workflow" && "Workflow History"}
            </DialogTitle>
            <DialogDescription>
              {record
                ? `${record.patentId} — ${historyEntries.length} entr${historyEntries.length === 1 ? "y" : "ies"}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {historyEntries.length === 0 && (
              <li className="text-xs text-muted-foreground">No entries in this view yet.</li>
            )}
            {[...historyEntries].reverse().map((a, i) => (
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
            <DialogTitle>AI Patent Insights</DialogTitle>
            <DialogDescription>
              Computed from the section data — single source of truth for the Patent Summary.
            </DialogDescription>
          </DialogHeader>
          {ai && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-[#7c5cff]/10 p-3">
                <Sparkles className="h-4 w-4 text-[#7c5cff]" />
                <span className="text-xs">
                  Grant probability{" "}
                  <span className="font-bold text-foreground">{ai.grantProbability}%</span> ·
                  Portfolio importance{" "}
                  <span className="font-bold text-foreground">{ai.portfolioImportance}</span>
                </span>
              </div>
              <AIBlock label="Novelty Assessment" text={ai.noveltyAssessment} />
              <AIBlock label="Inventive Step Analysis" text={ai.inventiveStepAnalysis} />
              <AIBlock label="Suggested Claim Improvements" text={ai.suggestedClaimImprovements} />
              <AIBlock label="Objection Analysis" text={ai.objectionAnalysis} />
              <AIBlock label="Suggested Responses" text={ai.suggestedResponses} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function initialReviewPreview() {
  return [
    {
      role: "Patent Manager",
      person: "Rohit Verma",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
    {
      role: "Patent Attorney",
      person: "Neha Sharma",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
    {
      role: "Legal Counsel",
      person: "Amitabh Singh",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
    {
      role: "R&D Director",
      person: "Vikram Singh",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
    {
      role: "CTO",
      person: "Arjun Mehta",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
    {
      role: "CEO",
      person: "Sanjay Kapoor",
      decision: "Pending" as const,
      comments: "",
      status: "Pending" as const,
      date: null,
    },
  ];
}
function AIBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs font-bold text-foreground">{label}</div>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
function HistoryLink(p: {
  icon: ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <span className="text-muted-foreground">{p.icon}</span>
        {p.label}
      </span>
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
        {p.sub}
        <ScrollText className="h-3 w-3" />
      </span>
    </button>
  );
}
