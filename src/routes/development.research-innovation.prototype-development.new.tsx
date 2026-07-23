import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  FileCog,
  FileText,
  Landmark,
  Loader2,
  MoreHorizontal,
  Rocket,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  PrototypeDevPageTabBar,
  PROTOTYPE_STATUS_LABEL,
} from "@/components/erp/PrototypeDevTabBar";
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
import { prototypeDevService } from "@/services";
import type {
  PrototypeApprovalDecision,
  PrototypeFormInput,
  PrototypeProjectRecord,
  PrototypeStage,
  PrototypeStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/prototype-development/new")({
  head: () => ({ meta: [{ title: "Prototype Development Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: PrototypeFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: PrototypeStatus[] = [
  "draft",
  "engineering_design",
  "prototype_manufacturing",
  "testing_validation",
  "engineering_review",
  "approved_with_conditions",
  "revision_required",
];
const STAGE_LABEL: Record<PrototypeStage, string> = {
  engineering_design: "Engineering Design",
  prototype_manufacturing: "Prototype Manufacturing",
  testing_validation: "Testing & Validation",
  engineering_review: "Engineering Review",
};
const PROGRESS_PHASES = ["Design", "Manufacturing", "Testing", "Validation", "Review"];
const PHASES_DONE: Record<PrototypeStatus, number> = {
  draft: 0,
  engineering_design: 1,
  prototype_manufacturing: 2,
  testing_validation: 3,
  engineering_review: 4,
  approved: 5,
  approved_with_conditions: 4,
  revision_required: 2,
  rejected: 5,
  archived: 5,
};

const EMPTY: PrototypeFormInput = {
  prototypeName: "",
  businessUnit: "Smart Mobility",
  department: "R&D Engineering",
  prototypeOwner: "Rohit Verma",
  developmentStartDate: new Date().toISOString().slice(0, 10),
  targetCompletion: "",
  linkedPocId: null,
  overview: {
    prototypeCategory: "Integrated System Prototype",
    prototypeType: "Engineering Prototype",
    engineeringDiscipline: [],
    designObjective: "",
    successCriteria: "",
    prototypeObjective: "",
    productDescription: "",
  },
  architecture: {
    systemArchitecture: "",
    mechanicalDesign: "",
    electricalDesign: "",
    electronicsDesign: "",
    embeddedSoftware: "",
    firmwareVersion: "v1.2",
    communicationProtocols: [],
    systemInterfaces: "",
  },
  engineering: {
    designFiles: [],
    materialSpecification: "",
    designStandards: [],
  },
  manufacturing: {
    manufacturingMethod: "CNC Machining + PCB Assembly",
    prototypeQuantity: 5,
    manufacturingPartner: "TechFab Solutions Pvt. Ltd.",
    fabricationStatus: "Completed",
    assemblyStatus: "Completed",
    qualityInspection: "In Progress",
    manufacturingCost: 0,
  },
  testing: {
    functionalTest: 9,
    performanceTest: 8,
    reliabilityTest: 8,
    safetyTest: 9,
    emcEmiTest: 7,
    environmentalTest: 7,
    complianceTest: 8,
    validationSummary: "",
  },
  improvements: {
    designIssues: "",
    rootCause: "",
    engineeringChanges: "",
    designOptimization: "",
    lessonsLearned: "",
    futureImprovements: "",
  },
  commercial: {
    manufacturingReadinessLevel: "MRL 6 – Prototype Manufacturing Demonstrated",
    technologyReadinessLevel: "TRL 6 – Prototype Demonstration",
    costOptimization: 7,
    productionScalability: 7,
    serviceability: 7,
    customerDemonstrationReady: true,
  },
  attachments: [],
  recommendation: "",
};

function recordToInput(r: PrototypeProjectRecord): PrototypeFormInput {
  return {
    prototypeName: r.prototypeName,
    businessUnit: r.businessUnit,
    department: r.department,
    prototypeOwner: r.prototypeOwner,
    developmentStartDate: r.developmentStartDate,
    targetCompletion: r.targetCompletion,
    linkedPocId: r.linkedPocId,
    overview: r.overview,
    architecture: r.architecture,
    engineering: r.engineering,
    manufacturing: r.manufacturing,
    testing: r.testing,
    improvements: r.improvements,
    commercial: r.commercial,
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
function ProgressRing({ value, size = 128 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#0a3c75" : "#f59e0b";
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
          <div className="font-display text-2xl font-bold tabular text-foreground">{value}%</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Overall Progress
          </div>
        </div>
      </div>
    </div>
  );
}
function ScoreTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={cn("rounded-lg border p-3", tone)}>
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold tabular text-foreground">
        {value}
        <span className="text-[10px] font-normal text-muted-foreground"> /100</span>
      </div>
    </div>
  );
}
function AIScoreRow({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">/100</span>
      </span>
    </div>
  );
}
function StarRow({
  label,
  value,
  onChange,
  editable,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  editable: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <StarRating
        value={value}
        onChange={onChange}
        readOnly={!editable}
        size="sm"
        aria-label={label}
      />
    </div>
  );
}
function StatusPill({ value }: { value: string }) {
  return <StatusBadge status={value} />;
}

/* ================================== Page ================================== */
function PrototypeFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["prototype-development", "lookups"],
    queryFn: () => prototypeDevService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["prototype-development", "record", id],
    queryFn: () => prototypeDevService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["prototype-development", "approved-pocs"],
    queryFn: () => prototypeDevService.fetchApprovedPocs(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<PrototypeFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: PrototypeStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "engineering_design";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<PrototypeApprovalDecision>("Approved");
  const [reviewNextAction, setReviewNextAction] = useState("Proceed to Engineering Validation");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("CAD Files");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["prototype-development"] });

  const saveMut = useMutation({
    mutationFn: () => prototypeDevService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(record ? "Prototype saved." : `Prototype ${r.prototypeId} created.`);
      if (!record) {
        navigate({
          to: "/development/research-innovation/prototype-development/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => prototypeDevService.completeStage(record!.id, currentStage),
    onSuccess: () => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed — AI assessment updated.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => prototypeDevService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Prototype package submitted to the Engineering Review Committee.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      prototypeDevService.review({
        id: record!.id,
        decision: reviewDecision,
        nextAction: reviewNextAction,
        comments: reviewComments || undefined,
        conditions: reviewDecision === "Approved with Conditions" ? reviewComments : undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "approved")
        toast.success(
          `Approved — Engineering Validation ${r.engineeringValidationCode} auto-created.`,
        );
      else if (r.status === "approved_with_conditions")
        toast.success("Approved with modifications — implement design changes.");
      else if (r.status === "rejected") toast.success("Prototype rejected and archived.");
      else toast.success("Revision required — update design & manufacture again.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => prototypeDevService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Prototype report generated — scores refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof PrototypeFormInput>(key: K, value: PrototypeFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setOverview = (patch: Partial<PrototypeFormInput["overview"]>) =>
    setForm((f) => ({ ...f, overview: { ...f.overview, ...patch } }));
  const setArch = (patch: Partial<PrototypeFormInput["architecture"]>) =>
    setForm((f) => ({ ...f, architecture: { ...f.architecture, ...patch } }));
  const setEng = (patch: Partial<PrototypeFormInput["engineering"]>) =>
    setForm((f) => ({ ...f, engineering: { ...f.engineering, ...patch } }));
  const setMfg = (patch: Partial<PrototypeFormInput["manufacturing"]>) =>
    setForm((f) => ({ ...f, manufacturing: { ...f.manufacturing, ...patch } }));
  const setTest = (patch: Partial<PrototypeFormInput["testing"]>) =>
    setForm((f) => ({ ...f, testing: { ...f.testing, ...patch } }));
  const setImp = (patch: Partial<PrototypeFormInput["improvements"]>) =>
    setForm((f) => ({ ...f, improvements: { ...f.improvements, ...patch } }));
  const setComm = (patch: Partial<PrototypeFormInput["commercial"]>) =>
    setForm((f) => ({ ...f, commercial: { ...f.commercial, ...patch } }));

  const applyPoc = (pocId: string) => {
    const poc = (sourcesQuery.data ?? []).find((p) => p.id === pocId);
    set("linkedPocId", pocId || null);
    if (!poc) return;
    setForm((f) => ({
      ...f,
      linkedPocId: pocId,
      prototypeName: f.prototypeName || poc.pocTitle,
      businessUnit: poc.businessUnit || f.businessUnit,
      department: poc.department || f.department,
      prototypeOwner: poc.projectManager || f.prototypeOwner,
      overview: {
        ...f.overview,
        designObjective: f.overview.designObjective || poc.objective,
        prototypeObjective: f.overview.prototypeObjective || poc.objective,
        productDescription: f.overview.productDescription || poc.proposedSolution,
      },
      commercial: {
        ...f.commercial,
        technologyReadinessLevel:
          poc.technologyReadinessLevel && poc.technologyReadinessLevel.startsWith("TRL")
            ? poc.technologyReadinessLevel.replace(" - ", " – ")
            : f.commercial.technologyReadinessLevel,
      },
    }));
    toast.success(`Context loaded from ${poc.pocCode}.`);
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
        uploadedBy: form.prototypeOwner || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const ai = record?.aiAssessment ?? null;
  const summary = record?.summary ?? null;
  const progress = record?.progressPercentage ?? 12;
  const phasesDone = PHASES_DONE[status];

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Prototype Development"
        breadcrumb="Research & Innovation Development · Prototype Development"
        description="Prototype Development Form"
        tabs={<PrototypeDevPageTabBar />}
      >
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Prototype Development"
      breadcrumb="Research & Innovation Development · Prototype Development"
      description="Prototype Development Form"
      tabs={<PrototypeDevPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Prototype ID">
              <TextInput value={record?.prototypeId ?? "Auto"} disabled />
            </Field>
            <Field label="Form Code">
              <TextInput value={record?.formCode ?? "Auto"} disabled />
            </Field>
            <Field label="Prototype Name" required>
              <TextInput
                value={form.prototypeName}
                onChange={(v) => set("prototypeName", v)}
                disabled={!editable}
                placeholder="e.g. Autonomous EV Wireless Charging Dock"
              />
            </Field>
            <LinkChip label="Linked PoC" code={record?.linkedPocCode} />
            <LinkChip label="Linked Feasibility Study" code={record?.linkedFeasibilityStudyCode} />
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Workflow Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={PROTOTYPE_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Business Unit">
              <Select
                value={form.businessUnit}
                onChange={(v) => set("businessUnit", v)}
                options={lookups?.businessUnits ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Department">
              <Select
                value={form.department}
                onChange={(v) => set("department", v)}
                options={lookups?.departments ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Prototype Owner">
              <Select
                value={form.prototypeOwner}
                onChange={(v) => set("prototypeOwner", v)}
                options={lookups?.prototypeOwners ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Development Start Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.developmentStartDate}
                disabled={!editable}
                onChange={(e) => set("developmentStartDate", e.target.value)}
              />
            </Field>
            <Field label="Prototype Version">
              <TextInput value={record?.prototypeVersion ?? "1.0"} disabled />
            </Field>
            <Field label="Target Completion">
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.targetCompletion}
                disabled={!editable}
                onChange={(e) => set("targetCompletion", e.target.value)}
              />
            </Field>
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Approved PoC (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedPocId ?? ""}
                  onChange={(e) => applyPoc(e.target.value)}
                >
                  <option value="">Select an approved PoC…</option>
                  {(sourcesQuery.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pocCode} — {p.pocTitle}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  A prototype can only be created from an approved PoC. CAD/PDM, BOM, procurement
                  and IP context is retrieved automatically.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  Next action: <span className="font-semibold">{record.nextAction}</span>
                </>
              ) : (
                "Select an approved PoC, fill the sections, then create the prototype to start Stage 1."
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
                  {record ? "Save Draft" : "Create Prototype"}
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
                  Submit for Review
                </ErpButton>
              )}
              {record && status === "engineering_review" && (
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
                    <DropdownMenuItem onClick={() => reportMut.mutate()}>
                      <FileText className="h-4 w-4" /> Generate Prototype Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                      <Activity className="h-4 w-4" /> View Activity History
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
        {record && status === "engineering_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Engineering Review Committee Decision
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve (auto-creates Engineering Validation), approve with modifications, request
                  revision, or reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "approved_with_conditions" && record.reviewConditions && (
          <div className="card-soft border-l-4 border-l-accent p-4 text-sm">
            <span className="font-bold text-foreground">Design changes required: </span>
            <span className="text-muted-foreground">{record.reviewConditions}</span>
          </div>
        )}
        {record && status === "revision_required" && record.reviewComments && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Review feedback: </span>
            <span className="text-muted-foreground">{record.reviewComments}</span>
          </div>
        )}
        {record && status === "approved" && record.engineeringValidationCode && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <Rocket className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">
              Engineering Validation {record.engineeringValidationCode} auto-created.
            </span>
            <span className="text-muted-foreground">Project Manager notified.</span>
          </div>
        )}

        {/* ------------------------------ Main grid ------------------------------ */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {/* 1 — Prototype Overview */}
            <SectionCard n={1} title="Prototype Overview">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prototype Category" required>
                  <Select
                    value={form.overview.prototypeCategory}
                    onChange={(v) => setOverview({ prototypeCategory: v })}
                    options={lookups?.prototypeCategories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Prototype Type" required>
                  <Select
                    value={form.overview.prototypeType}
                    onChange={(v) => setOverview({ prototypeType: v })}
                    options={lookups?.prototypeTypes ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Engineering Discipline" required>
                <TagMulti
                  options={lookups?.engineeringDisciplines ?? []}
                  selected={form.overview.engineeringDiscipline}
                  onToggle={(v) =>
                    setOverview({
                      engineeringDiscipline: form.overview.engineeringDiscipline.includes(v)
                        ? form.overview.engineeringDiscipline.filter((x) => x !== v)
                        : [...form.overview.engineeringDiscipline, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Design Objective" required>
                <TextArea
                  value={form.overview.designObjective}
                  onChange={(v) => setOverview({ designObjective: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Develop and validate an autonomous wireless charging dock prototype for EVs with high efficiency and safety."
                />
              </Field>
              <Field label="Success Criteria" required>
                <TextArea
                  value={form.overview.successCriteria}
                  onChange={(v) => setOverview({ successCriteria: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="≥ 90% charging efficiency, ≤ 2 cm alignment accuracy, full safety compliance, 1000-cycle stability."
                />
              </Field>
            </SectionCard>

            {/* 2 — Product Architecture */}
            <SectionCard n={2} title="Product Architecture">
              <Field label="System Architecture" required>
                <TextArea
                  value={form.architecture.systemArchitecture}
                  onChange={(v) => setArch({ systemArchitecture: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Modular architecture with power electronics, control unit, and communication interface."
                />
              </Field>
              <Field label="Mechanical Design" required>
                <TextArea
                  value={form.architecture.mechanicalDesign}
                  onChange={(v) => setArch({ mechanicalDesign: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Electrical Design" required>
                <TextArea
                  value={form.architecture.electricalDesign}
                  onChange={(v) => setArch({ electricalDesign: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Embedded Software" required>
                <TextArea
                  value={form.architecture.embeddedSoftware}
                  onChange={(v) => setArch({ embeddedSoftware: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Real-time controller using FreeRTOS for alignment, communication and safety."
                />
              </Field>
              <Field label="Communication Protocols" required>
                <TagMulti
                  options={lookups?.communicationProtocols ?? []}
                  selected={form.architecture.communicationProtocols}
                  onToggle={(v) =>
                    setArch({
                      communicationProtocols: form.architecture.communicationProtocols.includes(v)
                        ? form.architecture.communicationProtocols.filter((x) => x !== v)
                        : [...form.architecture.communicationProtocols, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 3 — Engineering Design */}
            <SectionCard n={3} title="Engineering Design">
              <div className="space-y-1.5">
                {form.engineering.designFiles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    CAD/PDM design files are attached when the prototype is created.
                  </p>
                ) : (
                  form.engineering.designFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate text-xs font-semibold text-foreground">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{f.sizeLabel}</span>
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Field label="Material Specification" required>
                <TextArea
                  value={form.engineering.materialSpecification}
                  onChange={(v) => setEng({ materialSpecification: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Aluminum 6061, Copper, FR-4 PCB, ABS Plastic, Neodymium Magnets, etc."
                />
              </Field>
              <Field label="Design Standards" required>
                <TagMulti
                  options={lookups?.designStandards ?? []}
                  selected={form.engineering.designStandards}
                  onToggle={(v) =>
                    setEng({
                      designStandards: form.engineering.designStandards.includes(v)
                        ? form.engineering.designStandards.filter((x) => x !== v)
                        : [...form.engineering.designStandards, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 4 — Prototype Manufacturing */}
            <SectionCard n={4} title="Prototype Manufacturing">
              <Field label="Manufacturing Method" required>
                <Select
                  value={form.manufacturing.manufacturingMethod}
                  onChange={(v) => setMfg({ manufacturingMethod: v })}
                  options={lookups?.manufacturingMethods ?? []}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prototype Quantity" required>
                  <NumberInput
                    value={form.manufacturing.prototypeQuantity}
                    onChange={(v) => setMfg({ prototypeQuantity: v })}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Manufacturing Partner">
                  <Select
                    value={form.manufacturing.manufacturingPartner}
                    onChange={(v) => setMfg({ manufacturingPartner: v })}
                    options={lookups?.manufacturingPartners ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="space-y-2 rounded-lg bg-muted/30 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Fabrication Status</span>
                  {editable ? (
                    <select
                      className="rounded border border-border bg-white px-2 py-0.5 text-xs"
                      value={form.manufacturing.fabricationStatus}
                      onChange={(e) => setMfg({ fabricationStatus: e.target.value })}
                    >
                      {(lookups?.fabricationStatuses ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill value={form.manufacturing.fabricationStatus} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Assembly Status</span>
                  {editable ? (
                    <select
                      className="rounded border border-border bg-white px-2 py-0.5 text-xs"
                      value={form.manufacturing.assemblyStatus}
                      onChange={(e) => setMfg({ assemblyStatus: e.target.value })}
                    >
                      {(lookups?.assemblyStatuses ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill value={form.manufacturing.assemblyStatus} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Quality Inspection</span>
                  {editable ? (
                    <select
                      className="rounded border border-border bg-white px-2 py-0.5 text-xs"
                      value={form.manufacturing.qualityInspection}
                      onChange={(e) => setMfg({ qualityInspection: e.target.value })}
                    >
                      {(lookups?.qualityInspectionStatuses ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill value={form.manufacturing.qualityInspection} />
                  )}
                </div>
              </div>
              <Field label="Manufacturing Cost" required>
                <NumberInput
                  value={form.manufacturing.manufacturingCost}
                  onChange={(v) => setMfg({ manufacturingCost: v })}
                  prefix="₹"
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 5 — Testing & Validation */}
            <SectionCard n={5} title="Testing & Validation">
              <div className="space-y-2">
                <StarRow
                  label="Functional Test"
                  value={form.testing.functionalTest}
                  onChange={(v) => setTest({ functionalTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="Performance Test"
                  value={form.testing.performanceTest}
                  onChange={(v) => setTest({ performanceTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="Reliability Test"
                  value={form.testing.reliabilityTest}
                  onChange={(v) => setTest({ reliabilityTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="Safety Test"
                  value={form.testing.safetyTest}
                  onChange={(v) => setTest({ safetyTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="EMC/EMI Test"
                  value={form.testing.emcEmiTest}
                  onChange={(v) => setTest({ emcEmiTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="Environmental Test"
                  value={form.testing.environmentalTest}
                  onChange={(v) => setTest({ environmentalTest: v })}
                  editable={editable}
                />
                <StarRow
                  label="Compliance Test"
                  value={form.testing.complianceTest}
                  onChange={(v) => setTest({ complianceTest: v })}
                  editable={editable}
                />
              </div>
              <Field label="Validation Summary" required>
                <TextArea
                  value={form.testing.validationSummary}
                  onChange={(v) => setTest({ validationSummary: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Prototype meets key functional and performance requirements. Minor EMI tuning and thermal optimization required."
                />
              </Field>
            </SectionCard>

            {/* 6 — Design Improvements */}
            <SectionCard n={6} title="Design Improvements">
              <Field label="Design Issues" required>
                <TextArea
                  value={form.improvements.designIssues}
                  onChange={(v) => setImp({ designIssues: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Minor heating in coil module and EMI noise."
                />
              </Field>
              <Field label="Root Cause" required>
                <TextArea
                  value={form.improvements.rootCause}
                  onChange={(v) => setImp({ rootCause: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="High switching losses and ground loop noise."
                />
              </Field>
              <Field label="Engineering Changes" required>
                <TextArea
                  value={form.improvements.engineeringChanges}
                  onChange={(v) => setImp({ engineeringChanges: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Upgraded MOSFETs, improved heat sink design, optimized grounding."
                />
              </Field>
              <Field label="Design Optimization" required>
                <TextArea
                  value={form.improvements.designOptimization}
                  onChange={(v) => setImp({ designOptimization: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Improved coil alignment, cooling path, and EMI filter."
                />
              </Field>
              <Field label="Lessons Learned" required>
                <TextArea
                  value={form.improvements.lessonsLearned}
                  onChange={(v) => setImp({ lessonsLearned: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Early EMI simulation and thermal analysis improves design efficiency."
                />
              </Field>
              <Field label="Future Improvements" required>
                <TextArea
                  value={form.improvements.futureImprovements}
                  onChange={(v) => setImp({ futureImprovements: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Optimize weight, reduce cost, enhance scalability."
                />
              </Field>
            </SectionCard>

            {/* 7 — Commercial Readiness */}
            <SectionCard n={7} title="Commercial Readiness">
              <Field label="Manufacturing Readiness Level (MRL)" required>
                <Select
                  value={form.commercial.manufacturingReadinessLevel}
                  onChange={(v) => setComm({ manufacturingReadinessLevel: v })}
                  options={lookups?.manufacturingReadinessLevels ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Technology Readiness Level (TRL)">
                <Select
                  value={form.commercial.technologyReadinessLevel}
                  onChange={(v) => setComm({ technologyReadinessLevel: v })}
                  options={lookups?.technologyReadinessLevels ?? []}
                  disabled={!editable}
                />
              </Field>
              <div className="space-y-2">
                <StarRow
                  label="Cost Optimization"
                  value={form.commercial.costOptimization}
                  onChange={(v) => setComm({ costOptimization: v })}
                  editable={editable}
                />
                <StarRow
                  label="Production Scalability"
                  value={form.commercial.productionScalability}
                  onChange={(v) => setComm({ productionScalability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Serviceability"
                  value={form.commercial.serviceability}
                  onChange={(v) => setComm({ serviceability: v })}
                  editable={editable}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">
                  Customer Demonstration Ready
                </span>
                <Toggle
                  value={form.commercial.customerDemonstrationReady}
                  onChange={(v) => setComm({ customerDemonstrationReady: v })}
                  disabled={!editable}
                />
              </div>
            </SectionCard>

            {/* 8 — AI Engineering Assessment */}
            <SectionCard
              n={8}
              title="AI Engineering Assessment"
              accent="bg-[#7c5cff]/10 text-[#7c5cff]"
            >
              {ai ? (
                <>
                  <div className="space-y-2">
                    <AIScoreRow label="AI Design Quality Score" value={ai.aiDesignQualityScore} />
                    <AIScoreRow label="AI Manufacturing Score" value={ai.aiManufacturingScore} />
                    <AIScoreRow label="AI Reliability Score" value={ai.aiReliabilityScore} />
                    <AIScoreRow label="AI Compliance Score" value={ai.aiComplianceScore} />
                    <AIScoreRow label="AI Risk Score" value={ai.aiRiskScore} />
                    <AIScoreRow label="AI Readiness Score" value={ai.aiReadinessScore} />
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendations
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ai.recommendations}
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
                  AI assessment is generated on creation and refreshed as each stage completes.
                </p>
              )}
            </SectionCard>

            {/* 9 — Prototype Summary */}
            <SectionCard n={9} title="Prototype Summary" accent="bg-[#22C55E]/10 text-[#22C55E]">
              {summary ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <ScoreTile
                      label="Engineering Score"
                      value={summary.engineeringScore}
                      tone="border-[#3B82F6]/20 bg-[#3B82F6]/5"
                    />
                    <ScoreTile
                      label="Validation Score"
                      value={summary.validationScore}
                      tone="border-[#22C55E]/20 bg-[#22C55E]/5"
                    />
                    <ScoreTile
                      label="Manufacturing Score"
                      value={summary.manufacturingScore}
                      tone="border-[#F59E0B]/20 bg-[#F59E0B]/5"
                    />
                    <ScoreTile
                      label="Commercial Readiness"
                      value={summary.commercialReadinessScore}
                      tone="border-[#7c5cff]/20 bg-[#7c5cff]/5"
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-primary/5 p-3 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">
                      Overall Prototype Score
                    </div>
                    <div className="font-display text-2xl font-bold tabular text-foreground">
                      {summary.overallPrototypeScore}
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
                  The summary scores are computed once the prototype is created.
                </p>
              )}
            </SectionCard>

            {/* 9 — Attachments (repeated numbering per screenshot) */}
            <SectionCard n={9} title="Attachments" className="lg:col-span-2 2xl:col-span-3">
              <div className="flex flex-wrap gap-2">
                {form.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">
                        {a.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{a.category}</div>
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
                  </div>
                ))}
                {editable && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-white px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" /> Upload File / drag & drop
                  </button>
                )}
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
              {editable && (
                <select
                  className={cn(INPUT, "border-border max-w-xs")}
                  value={attachCategory}
                  onChange={(e) => setAttachCategory(e.target.value)}
                >
                  {(lookups?.attachmentCategories ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </SectionCard>

            {/* 11 — Review & Approval */}
            <SectionCard n={11} title="Review & Approval" className="lg:col-span-2 2xl:col-span-3">
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
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
                  <p className="text-xs text-muted-foreground sm:col-span-3 xl:col-span-5">
                    Reviewers are assigned when the prototype is created.
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
            </SectionCard>

            {/* 12 — System Information */}
            <SectionCard n={12} title="System Information" className="lg:col-span-2 2xl:col-span-3">
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
                    <StatusBadge status={PROTOTYPE_STATUS_LABEL[status]} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Version
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record ? `${record.prototypeVersion}` : "—"}
                  </div>
                  <button
                    className="text-[11px] font-semibold text-primary hover:underline"
                    onClick={() => setHistoryOpen(true)}
                  >
                    View Activity History
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Prototype Progress</h3>
              <div className="flex items-center gap-4">
                <ProgressRing value={record ? progress : 12} />
                <ul className="flex-1 space-y-1.5">
                  {PROGRESS_PHASES.map((phase, i) => {
                    const done = i < phasesDone;
                    const active = i === phasesDone && status !== "approved";
                    return (
                      <li key={phase} className="flex items-center gap-2 text-xs">
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : active ? (
                          <Circle className="h-3.5 w-3.5 shrink-0 fill-primary/20 text-primary" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>
                          {phase}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Key Scores</h3>
              <div className="grid grid-cols-2 gap-2">
                <ScoreTile
                  label="Engineering Score"
                  value={summary?.engineeringScore ?? 0}
                  tone="border-[#3B82F6]/20 bg-[#3B82F6]/5"
                />
                <ScoreTile
                  label="Validation Score"
                  value={summary?.validationScore ?? 0}
                  tone="border-[#22C55E]/20 bg-[#22C55E]/5"
                />
                <ScoreTile
                  label="Manufacturing Score"
                  value={summary?.manufacturingScore ?? 0}
                  tone="border-[#F59E0B]/20 bg-[#F59E0B]/5"
                />
                <ScoreTile
                  label="Commercial Readiness"
                  value={summary?.commercialReadinessScore ?? 0}
                  tone="border-[#7c5cff]/20 bg-[#7c5cff]/5"
                />
              </div>
              <div className="rounded-lg border border-border bg-primary/5 p-3 text-center">
                <div className="text-[10px] font-semibold text-muted-foreground">
                  Overall Prototype Score
                </div>
                <div className="font-display text-2xl font-bold tabular text-foreground">
                  {summary?.overallPrototypeScore ?? 0}
                  <span className="text-sm text-muted-foreground"> /100</span>
                </div>
              </div>
            </div>

            <div className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
              <QuickAction
                icon={<Upload className="h-4 w-4" />}
                label="Upload Document"
                onClick={() => {
                  if (!editable) return toast.error("Prototype is locked in this status.");
                  fileInputRef.current?.click();
                }}
                disabled={!record}
              />
              <QuickAction
                icon={<FileCog className="h-4 w-4" />}
                label="Create Engineering Change"
                onClick={() => toast.success("Engineering change request drafted.")}
                disabled={!record}
              />
              <QuickAction
                icon={<CalendarCheck className="h-4 w-4" />}
                label="Schedule Testing"
                onClick={() => toast.success("Testing schedule opened.")}
                disabled={!record}
              />
              <QuickAction
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Quality Inspection"
                onClick={() => toast.success("Quality inspection checklist opened.")}
                disabled={!record}
              />
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="Generate Prototype Report"
                onClick={() => reportMut.mutate()}
                disabled={!record || busy}
              />
              <QuickAction
                icon={<Landmark className="h-4 w-4" />}
                label="Request Approval"
                onClick={() => {
                  if (!allStagesDone)
                    return toast.error("Complete all stages before requesting approval.");
                  submitMut.mutate();
                }}
                disabled={!record || status === "engineering_review" || status === "approved"}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* --------------------------- Committee Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Engineering Review Committee</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.prototypeName || record.prototypeId} — overall ${summary?.overallPrototypeScore ?? 0}/100.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as PrototypeApprovalDecision)}
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
            <Field
              label={
                reviewDecision === "Approved with Conditions" ? "Design Changes" : "Review Comments"
              }
            >
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
              {record ? `${record.prototypeId} — full audit trail.` : ""}
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
            <DialogTitle>AI Engineering Insights</DialogTitle>
            <DialogDescription>
              Computed from the section data — single source of truth.
            </DialogDescription>
          </DialogHeader>
          {ai && summary && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <MiniScore label="Engineering" value={summary.engineeringScore} />
                <MiniScore label="Validation" value={summary.validationScore} />
                <MiniScore label="Manufacturing" value={summary.manufacturingScore} />
                <MiniScore label="Commercial Readiness" value={summary.commercialReadinessScore} />
                <MiniScore label="Overall Prototype" value={summary.overallPrototypeScore} />
                <MiniScore label="AI Readiness" value={ai.aiReadinessScore} />
              </div>
              <div className="text-xs text-muted-foreground">
                Recommendation:{" "}
                <span className="font-bold text-foreground">{summary.recommendation}</span>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Manufacturability Analysis</div>
                <p className="text-xs text-muted-foreground">{ai.manufacturabilityAnalysis}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Risk Assessment</div>
                <p className="text-xs text-muted-foreground">{ai.riskAssessment}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Cost Analysis</div>
                <p className="text-xs text-muted-foreground">{ai.costAnalysis}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Design Optimization</div>
                <p className="text-xs text-muted-foreground">{ai.designOptimizationSuggestions}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function LinkChip({ label, code }: { label: string; code: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-foreground">{label}</span>
      <div className="flex h-[38px] items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
        {code ? code : <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
function MiniScore({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-2.5 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("tabular text-xs font-bold", color)}>{value}</span>
    </div>
  );
}
function QuickAction(p: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        p.highlight
          ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
          : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span className={cn(p.highlight ? "text-primary" : "text-muted-foreground")}>{p.icon}</span>
      {p.label}
    </button>
  );
}
