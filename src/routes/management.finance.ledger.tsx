import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calculator,
  CalendarClock,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Pencil,
  Check,
  X as XIcon,
  ShieldCheck,
  FileText,
  DollarSign,
  Percent,
  BrainCircuit,
  Settings,
  Link,
  BookOpen,
  UserCheck,
  Upload,
  FileCheck2,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { FinanceTabBar } from "@/components/erp/FinanceTabBar";
import { CardHeader } from "@/components/erp/CardHeader";
import { FilterButton, FilterSelect } from "@/components/erp/FilterButton";
import { PaginationFooter } from "@/components/erp/PaginationFooter";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { TreeTable, type TreeColumn } from "@/components/erp/TreeTable";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { chartOfAccountsService, generalLedgerService, journalEntryService } from "@/services";
import type {
  AccountFilters,
  AccountNode,
  AccountType,
  ApprovalLevelName,
  JournalLineInput,
  JournalRecord,
  JournalTypeValue,
  NewAccountInput,
  NewJournalInput,
  CurrencyInfo,
  TaxInfo,
  SupportingDocumentsInfo,
  DocumentSlot,
  JournalMetadata,
  LedgerJournalEntry,
  TrialBalanceReport,
  AccountSummary,
} from "@/services/types";

export const Route = createFileRoute("/management/finance/ledger")({
  head: () => ({ meta: [{ title: "General Ledger · Magnertia" }] }),
  component: GeneralLedgerPage,
});

const JOURNAL_STEPS: {
  key: "general" | "lines" | "currency" | "documents";
  label: string;
  sub: string;
}[] = [
  { key: "general", label: "General & Org", sub: "Sections A, B" },
  { key: "lines", label: "Lines & Dimensions", sub: "Sections D, E" },
  { key: "currency", label: "Currency & Tax", sub: "Sections F, G" },
  { key: "documents", label: "Documents & Settings", sub: "Sections J, N" },
];

const TYPE_OPTIONS: { label: string; value: AccountFilters["type"] }[] = [
  { label: "All Types", value: "All Types" },
  { label: "Asset", value: "Asset" },
  { label: "Liability", value: "Liability" },
  { label: "Equity", value: "Equity" },
  { label: "Revenue", value: "Revenue" },
  { label: "Expense", value: "Expense" },
];

const STATUS_OPTIONS: { label: string; value: AccountFilters["status"] }[] = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "All Statuses", value: "All Statuses" },
];

const LEVEL_OPTIONS: { label: string; value: AccountFilters["level"] }[] = [
  { label: "All Levels", value: "All Levels" },
  { label: "Level 1", value: "1" },
  { label: "Level 2", value: "2" },
  { label: "Level 3", value: "3" },
];

const DEFAULT_FILTERS: AccountFilters = {
  search: "",
  type: "All Types",
  status: "Active",
  level: "All Levels",
};

const JOURNAL_TYPE_OPTIONS: JournalTypeValue[] = ["Manual", "Automatic", "Recurring", "Reversing"];
const ACCOUNT_TYPE_OPTIONS: AccountType[] = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const LEVEL_ORDER: ApprovalLevelName[] = [
  "Accountant",
  "Finance Manager",
  "Financial Controller",
  "CFO",
  "CEO",
];

const DEFAULT_NEW_ACCOUNT: NewAccountInput = {
  code: "",
  name: "",
  parentAccountCode: null,
  type: "Asset",
  group: "",
  currency: "INR",
  isActive: true,
};

function emptyLine(): JournalLineInput {
  return {
    accountCode: "",
    accountName: "",
    description: "",
    debit: 0,
    credit: 0,
    dimensions: {
      costCenter: "",
      profitCenter: "",
      businessUnit: "",
      project: "",
      department: "",
      product: "",
      customer: "",
      vendor: "",
    },
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultNewJournal(): NewJournalInput {
  return {
    voucherNumber: "",
    postingDate: todayIso(),
    accountingDate: todayIso(),
    fiscalYear: "FY 2026-27",
    accountingPeriod: "Jul 2026",
    journalType: "Manual",
    companyId: "Magnertia Motors",
    businessUnitId: "EV Division",
    divisionId: "Manufacturing Division",
    branchId: "Chennai Plant",
    costCenterId: "CC-101",
    profitCenterId: "PC-501",
    projectId: "PROJ-EV9",
    departmentId: "R&D Department",
    lines: [emptyLine(), emptyLine()],
    currencyInfo: {
      transactionCurrency: "INR",
      baseCurrency: "INR",
      exchangeRate: 1,
      exchangeRateDate: todayIso(),
      foreignCurrencyGainLoss: 0,
    },
    taxInfo: {
      gstType: "CGST/SGST",
      gstin: "33AAAAA1111A1Z1",
      taxCode: "GST-18%",
      taxAmount: 0,
      reverseCharge: false,
      tds: 0,
      tcs: 0,
    },
    supportingDocuments: {
      journalVoucher: { status: "Not Attached" },
      invoice: { status: "Not Attached" },
      purchaseOrder: { status: "Not Attached" },
      paymentVoucher: { status: "Not Attached" },
      bankStatement: { status: "Not Attached" },
      taxDocument: { status: "Not Attached" },
      approvalRecord: { status: "Not Attached" },
    },
    metadataInfo: {
      createdBy: "Priya Sharma",
      createdDate: todayIso(),
      lastModifiedBy: "Priya Sharma",
      lastModifiedDate: todayIso(),
      journalVersion: 1,
      erpReferenceNumber: "",
      fiscalCalendar: "Standard Calendar",
      auditTrail: true,
      digitalSignature: true,
      recordStatus: "Active",
    },
  };
}

function countAllNodes(nodes: AccountNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + (n.children ? countAllNodes(n.children) : 0), 0);
}

function flattenTree(nodes: AccountNode[]): AccountNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenTree(n.children) : [])]);
}

type LedgerTab = "chart" | "journal-entry" | "approval" | "reports";

function GeneralLedgerPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AccountFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAccountCode, setSelectedAccountCode] = useState("1120");
  const [activeTab, setActiveTab] = useState<LedgerTab>("chart");
  const [reportSubTab, setReportSubTab] = useState<"trial" | "activity">("trial");

  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [editingAccountCode, setEditingAccountCode] = useState<string | null>(null);
  const [newAccountInput, setNewAccountInput] = useState<NewAccountInput>(DEFAULT_NEW_ACCOUNT);

  const [createJournalOpen, setCreateJournalOpen] = useState(false);
  const [newJournalInput, setNewJournalInput] = useState<NewJournalInput>(defaultNewJournal());
  const [journalDetail, setJournalDetail] = useState<JournalRecord | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<"Pending Approval" | "Approved" | "All">(
    "Pending Approval",
  );

  // Simulation Role for Approval Queue
  const [simulatedRole, setSimulatedRole] = useState<ApprovalLevelName>("Accountant");

  // Create Journal Dialog tab
  const [journalFormTab, setJournalFormTab] = useState<
    "general" | "lines" | "currency" | "documents"
  >("general");

  // Queries

  const accountsQuery = useQuery({
    queryKey: ["ledger", "accounts-live", filters],
    queryFn: () => chartOfAccountsService.queryAccountsLive(filters),
  });

  const allAccountsQuery = useQuery({
    queryKey: ["ledger", "accounts-live-all"],
    queryFn: () => chartOfAccountsService.fetchAccountsTree(),
  });

  const flatAccounts = useMemo(
    () => flattenTree(allAccountsQuery.data ?? []),
    [allAccountsQuery.data],
  );

  const journalsQuery = useQuery({
    queryKey: ["ledger", "journals"],
    queryFn: () => journalEntryService.fetchJournals(),
  });

  const trialBalanceQuery = useQuery({
    queryKey: ["ledger", "trial-balance"],
    queryFn: () =>
      generalLedgerService.generateTrialBalance({ fiscalYear: "FY 2026-27", companyId: "all" }),
  });

  const activityQuery = useQuery({
    queryKey: ["ledger", "account-activity", selectedAccountCode],
    queryFn: () => generalLedgerService.fetchTransactionHistory(selectedAccountCode),
  });

  const summaryQuery = useQuery({
    queryKey: ["ledger", "account-summary", selectedAccountCode],
    queryFn: () => generalLedgerService.retrieveAccountSummary(selectedAccountCode),
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: chartOfAccountsService.createAccount,
    onSuccess: (created) => {
      toast.success(`Account created: ${created.code} — ${created.name}`);
      setAccountFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create account."),
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ code, patch }: { code: string; patch: Partial<NewAccountInput> }) =>
      chartOfAccountsService.updateAccount(code, patch),
    onSuccess: (updated) => {
      toast.success(`Account updated: ${updated.code} — ${updated.name}`);
      setAccountFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update account."),
  });

  const createJournalMutation = useMutation({
    mutationFn: journalEntryService.createJournal,
    onSuccess: (created) => {
      toast.success(`Journal entry ${created.journalNumber} saved as Draft.`);
      setCreateJournalOpen(false);
      setNewJournalInput(defaultNewJournal());
      setJournalFormTab("general");
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create journal entry."),
  });

  const approveStepMutation = useMutation({
    mutationFn: (vars: {
      journalId: string;
      level: ApprovalLevelName;
      decision: "Approved" | "Rejected";
    }) => journalEntryService.approveJournalStep(vars.journalId, vars.level, vars.decision),
    onSuccess: (updated, vars) => {
      toast.success(
        vars.decision === "Approved"
          ? `${vars.level} approved.`
          : `${vars.level} rejected — journal returned to Draft.`,
      );
      setJournalDetail(updated);
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to record approval decision."),
  });

  function updateFilters(patch: Partial<AccountFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function openCreateAccount() {
    setEditingAccountCode(null);
    setNewAccountInput(DEFAULT_NEW_ACCOUNT);
    setAccountFormOpen(true);
  }

  function openEditAccount(row: AccountNode) {
    setEditingAccountCode(row.code);
    setNewAccountInput({
      code: row.code,
      name: row.name,
      parentAccountCode: null,
      type: row.type,
      group: row.group,
      currency: "INR",
      isActive: row.status === "Active",
    });
    setAccountFormOpen(true);
  }

  function handleAccountFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newAccountInput.code || !newAccountInput.name || !newAccountInput.group) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editingAccountCode) {
      updateAccountMutation.mutate({
        code: editingAccountCode,
        patch: {
          name: newAccountInput.name,
          type: newAccountInput.type,
          group: newAccountInput.group,
          isActive: newAccountInput.isActive,
          parentAccountCode: newAccountInput.parentAccountCode || null,
        },
      });
    } else {
      createAccountMutation.mutate({ ...newAccountInput, currency: "INR" });
    }
  }

  // Journal Entry modal helper handlers
  function updateLine(index: number, patch: Partial<JournalLineInput>) {
    setNewJournalInput((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  }

  function updateLineDimension(index: number, dimension: string, value: string) {
    setNewJournalInput((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => {
        if (i === index) {
          const dims = { ...l.dimensions, [dimension]: value };
          return { ...l, dimensions: dims };
        }
        return l;
      }),
    }));
  }

  function addLine() {
    setNewJournalInput((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  }

  function removeLine(index: number) {
    setNewJournalInput((prev) => ({
      ...prev,
      lines: prev.lines.length > 2 ? prev.lines.filter((_, i) => i !== index) : prev.lines,
    }));
  }

  const journalTotalDebit = newJournalInput.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const journalTotalCredit = newJournalInput.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const journalBalanced =
    Math.round(journalTotalDebit * 100) === Math.round(journalTotalCredit * 100);

  // Auto tax rate application helper
  const handleTaxCodeChange = (taxCode: string) => {
    const match = taxCode.match(/(\d+)%/);
    let taxAmount = 0;
    if (match) {
      const rate = parseFloat(match[1]);
      taxAmount = Math.round(journalTotalDebit * (rate / 100) * 100) / 100;
    }
    setNewJournalInput((p) => ({
      ...p,
      taxInfo: {
        ...p.taxInfo!,
        taxCode,
        taxAmount,
      },
    }));
  };

  // Auto exchange rate application helper
  const handleCurrencyChange = (currency: string) => {
    let rate = 1;
    if (currency === "USD") rate = 83.5;
    else if (currency === "EUR") rate = 91.2;
    else if (currency === "GBP") rate = 105.8;

    setNewJournalInput((p) => ({
      ...p,
      currencyInfo: {
        ...p.currencyInfo!,
        transactionCurrency: currency,
        exchangeRate: rate,
      },
    }));
  };

  function handleCreateJournalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newJournalInput.postingDate ||
      !newJournalInput.accountingDate ||
      !newJournalInput.accountingPeriod
    ) {
      toast.error("Please fill in Posting Date, Accounting Date and Accounting Period.");
      return;
    }
    const validLines = newJournalInput.lines.filter(
      (l) => l.accountCode && (l.debit > 0 || l.credit > 0),
    );
    if (validLines.length < 2) {
      toast.error("Add at least two lines with an account and a debit or credit amount.");
      return;
    }
    if (!journalBalanced) {
      toast.error("Total Debit must equal Total Credit before submitting.");
      return;
    }
    createJournalMutation.mutate({ ...newJournalInput, lines: validLines });
  }

  const allAccounts = accountsQuery.data ?? [];
  const totalAccountCount = countAllNodes(allAccounts);
  const pageStart = (page - 1) * pageSize;
  const pagedAccounts = allAccounts.slice(pageStart, pageStart + pageSize);

  const columns: TreeColumn<AccountNode>[] = [
    {
      key: "code",
      header: "Account Code",
      align: "left",
      cell: (row, depth) => (
        <span
          className={
            depth === 0
              ? "font-bold text-foreground"
              : depth === 1
                ? "font-semibold text-foreground"
                : "text-foreground"
          }
        >
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Account Name",
      cell: (row, depth) => (
        <span
          className={
            depth === 0
              ? "font-bold text-foreground"
              : depth === 1
                ? "font-semibold text-foreground"
                : "text-foreground"
          }
        >
          {row.name}
        </span>
      ),
    },
    {
      key: "type",
      header: "Account Type",
      cell: (row) => <span className="text-muted-foreground">{row.type}</span>,
    },
    {
      key: "debit",
      header: "Debit (YTD)",
      align: "right",
      cell: (row) => (
        <span className="tabular text-foreground">{formatCurrency(row.debit, true)}</span>
      ),
    },
    {
      key: "credit",
      header: "Credit (YTD)",
      align: "right",
      cell: (row) => (
        <span className="tabular text-foreground">{formatCurrency(row.credit, true)}</span>
      ),
    },
    {
      key: "net",
      header: "Net Balance",
      align: "right",
      cell: (row) => {
        const net = row.debit - row.credit;
        return (
          <span
            className={`font-semibold tabular ${net < 0 ? "text-[#EF4444]" : "text-foreground"}`}
          >
            {net < 0 ? `(${formatCurrency(Math.abs(net), true)})` : formatCurrency(net, true)}
          </span>
        );
      },
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditAccount(row);
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Edit account"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  const approvalQueueJournals = (journalsQuery.data ?? []).filter((j) => {
    if (approvalFilter === "Pending Approval") return j.status === "Draft";
    if (approvalFilter === "Approved") return j.status === "Approved" || j.status === "Posted";
    return true;
  });

  // Recharts trend data calculator
  const composedTrendData = useMemo(() => {
    if (!journalsQuery.data || journalsQuery.data.length === 0) {
      return [
        { month: "Apr 26", revenue: 0, expenses: 0, netProfit: 0 },
        { month: "May 26", revenue: 0, expenses: 0, netProfit: 0 },
        { month: "Jun 26", revenue: 0, expenses: 0, netProfit: 0 },
        { month: "Jul 26", revenue: 0, expenses: 0, netProfit: 0 },
      ];
    }

    // Map journals to months
    const months = ["Apr 26", "May 26", "Jun 26", "Jul 26"];
    const records = months.map((m) => ({ month: m, revenue: 0, expenses: 0, netProfit: 0 }));

    for (const journal of journalsQuery.data) {
      if (journal.status !== "Posted") continue;
      const monthStr = journal.accountingPeriod; // e.g. "Jul 2026"
      const matchMonth = months.find((m) => monthStr.includes(m.slice(0, 3)));
      if (matchMonth) {
        const record = records.find((r) => r.month === matchMonth)!;
        for (const line of journal.lines) {
          const acc = flatAccounts.find((a) => a.code === line.accountCode);
          if (acc) {
            if (acc.type === "Revenue") {
              record.revenue += Number(line.credit) - Number(line.debit);
            } else if (acc.type === "Expense") {
              record.expenses += Number(line.debit) - Number(line.credit);
            }
          }
        }
      }
    }

    records.forEach((r) => {
      r.netProfit = r.revenue - r.expenses;
    });

    return records;
  }, [journalsQuery.data, flatAccounts]);

  const dbError =
    accountsQuery.error?.message ||
    allAccountsQuery.error?.message ||
    journalsQuery.error?.message ||
    trialBalanceQuery.error?.message ||
    activityQuery.error?.message ||
    summaryQuery.error?.message;

  if (dbError) {
    return (
      <AppShell
        title="Finance"
        breadcrumb="Management"
        description="View and analyze all enterprise balances, entries, and workflow controls in your general ledger."
        tabs={<FinanceTabBar />}
      >
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <BrainCircuit className="h-12 w-12 text-destructive mx-auto mb-4 animate-pulse" />
          <h3 className="text-[16px] font-bold text-foreground mb-2">
            Database Connection Required
          </h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{dbError}</p>
          <div className="rounded-lg bg-card border border-border p-4 text-[13px] text-left space-y-2">
            <p className="font-semibold text-foreground">How to configure MongoDB Atlas:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
              <li>
                Open your project local{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">.env</code>{" "}
                file.
              </li>
              <li>
                Replace the{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
                  &lt;db_password&gt;
                </code>{" "}
                placeholder in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
                  MONGODB_URI
                </code>{" "}
                variable with your database password.
              </li>
              <li>
                Save the file and refresh the page. The system will automatically seed default
                ledger data and run calculations.
              </li>
            </ol>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Finance"
      breadcrumb="Management"
      description="View and analyze all enterprise balances, entries, and workflow controls in your general ledger."
      tabs={<FinanceTabBar />}
    >
      {/* 6 Tabs Navigation Header */}
      <div className="mb-4 flex flex-col items-stretch justify-between gap-4 border-b border-border bg-card p-4 rounded-xl xl:flex-row xl:items-center">
        <div className="flex flex-wrap gap-2">
          <TabsButton
            active={activeTab === "chart"}
            onClick={() => setActiveTab("chart")}
            icon={<Landmark className="h-4 w-4" />}
            label="Chart of Accounts"
          />
          <TabsButton
            active={activeTab === "journal-entry"}
            onClick={() => setActiveTab("journal-entry")}
            icon={<FileText className="h-4 w-4" />}
            label="Journal Entries"
          />
          <TabsButton
            active={activeTab === "approval"}
            onClick={() => setActiveTab("approval")}
            icon={<UserCheck className="h-4 w-4" />}
            label="Approval Workflow"
          />
          <TabsButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            icon={<BookOpen className="h-4 w-4" />}
            label="Financial Reports"
          />
        </div>

        {/* Global Toolbar */}
        <div className="flex shrink-0 items-center gap-2 self-end xl:self-auto">
          {activeTab === "chart" && (
            <ErpButton size="md" onClick={openCreateAccount}>
              <Plus className="h-4 w-4" />
              <span>New Account</span>
            </ErpButton>
          )}
          {activeTab === "journal-entry" && (
            <ErpButton size="md" onClick={() => setCreateJournalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>New Journal Entry</span>
            </ErpButton>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50">
                <Download className="h-4 w-4 text-muted-foreground" />
                Export
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success("Exported Trial Balance CSV")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Exported Ledger XLSX")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Exported Audit PDF")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content grid split */}
      <div className="grid gap-4">
        {/* ==========================================
            TAB: CHART OF ACCOUNTS
            ========================================== */}
        {activeTab === "chart" && (
          <div className="card-soft overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  placeholder="Search accounts…"
                  className="w-full rounded-md border border-border bg-card py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <FilterSelect
                value={filters.type}
                onChange={(v) => updateFilters({ type: v as AccountFilters["type"] })}
                options={TYPE_OPTIONS}
              />
              <FilterSelect
                value={filters.status}
                onChange={(v) => updateFilters({ status: v as AccountFilters["status"] })}
                options={STATUS_OPTIONS}
              />
              <FilterSelect
                value={filters.level}
                onChange={(v) => updateFilters({ level: v as AccountFilters["level"] })}
                options={LEVEL_OPTIONS}
              />
              <button
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setPage(1);
                }}
                className="text-[12px] font-medium text-primary hover:underline ml-2"
              >
                Clear All
              </button>
            </div>

            {accountsQuery.isLoading ? (
              <div className="h-[240px] animate-pulse bg-muted/40" />
            ) : pagedAccounts.length === 0 ? (
              <EmptyState
                title="No accounts found"
                description="Try adjusting your search or filters, or create a new account."
              />
            ) : (
              <div className="overflow-x-auto">
                <TreeTable
                  columns={columns}
                  data={pagedAccounts}
                  getId={(row) => row.code}
                  getChildren={(row) => row.children}
                  expandColumnKey="code"
                  selectedId={selectedAccountCode}
                  onSelectRow={(row) => setSelectedAccountCode(row.code)}
                />
              </div>
            )}

            <PaginationFooter
              page={page}
              pageSize={pageSize}
              total={totalAccountCount}
              entityLabel="accounts"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}

        {/* ==========================================
            TAB: JOURNAL ENTRIES
            ========================================== */}
        {activeTab === "journal-entry" && (
          <div className="card-soft p-4">
            <JournalEntryTable
              journals={journalsQuery.data}
              loading={journalsQuery.isLoading}
              onRowClick={setJournalDetail}
            />
          </div>
        )}

        {/* ==========================================
            TAB: APPROVAL WORKFLOW
            ========================================== */}
        {activeTab === "approval" && (
          <div className="card-soft p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <FilterSelect
                value={approvalFilter}
                onChange={(v) => setApprovalFilter(v as typeof approvalFilter)}
                options={[
                  { label: "Pending Approval", value: "Pending Approval" },
                  { label: "Approved/Posted", value: "Approved" },
                  { label: "All Journals", value: "All" },
                ]}
              />

              {/* Role Simulation Selector */}
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
                <span className="text-[12px] font-semibold text-primary">
                  Simulate Approver Role:
                </span>
                <select
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value as ApprovalLevelName)}
                  className="rounded border border-primary/20 bg-background px-2 py-0.5 text-xs text-foreground font-semibold focus:outline-none"
                >
                  {LEVEL_ORDER.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ApprovalQueueTable
              journals={approvalQueueJournals}
              loading={journalsQuery.isLoading}
              onRowClick={setJournalDetail}
            />
          </div>
        )}

        {/* ==========================================
            TAB: FINANCIAL REPORTS (Trial Balance & Activity)
            ========================================== */}
        {activeTab === "reports" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            {/* Main Report Table Container */}
            <div className="card-soft p-5">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportSubTab("trial")}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all",
                      reportSubTab === "trial"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    Trial Balance Sheet
                  </button>
                  <button
                    onClick={() => setReportSubTab("activity")}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all",
                      reportSubTab === "activity"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    Account Transaction History
                  </button>
                </div>
              </div>

              {reportSubTab === "trial" && (
                <TrialBalanceView
                  report={trialBalanceQuery.data}
                  loading={trialBalanceQuery.isLoading}
                />
              )}

              {reportSubTab === "activity" && (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Select Ledger Account:
                    </span>
                    <select
                      value={selectedAccountCode}
                      onChange={(e) => setSelectedAccountCode(e.target.value)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground focus:outline-none"
                    >
                      {flatAccounts.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AccountActivityView
                    accountCode={selectedAccountCode}
                    entries={activityQuery.data}
                    loading={activityQuery.isLoading}
                  />
                </div>
              )}
            </div>

            {/* Sidebar Account Summary details (highly useful for context) */}
            <div className="space-y-4">
              <AccountSummaryCard summary={summaryQuery.data} loading={summaryQuery.isLoading} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center text-[11px] text-muted-foreground">
        All amounts are in INR &nbsp;|&nbsp; Data powered by Live MongoDB Cluster
      </div>

      {/* ==========================================
          DIALOG: CREATE / EDIT ACCOUNT
          ========================================== */}
      <Dialog open={accountFormOpen} onOpenChange={setAccountFormOpen}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingAccountCode ? "Edit Account" : "New Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccountCode
                ? `Update details for account ${editingAccountCode}.`
                : "Add a new account to the Chart of Accounts."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountFormSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Account Code *
                </label>
                <input
                  required
                  disabled={!!editingAccountCode}
                  value={newAccountInput.code}
                  onChange={(e) => setNewAccountInput((p) => ({ ...p, code: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Account Type *
                </label>
                <select
                  value={newAccountInput.type}
                  onChange={(e) =>
                    setNewAccountInput((p) => ({ ...p, type: e.target.value as AccountType }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  {ACCOUNT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Account Name *
              </label>
              <input
                required
                value={newAccountInput.name}
                onChange={(e) => setNewAccountInput((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Account Group *
              </label>
              <input
                required
                placeholder="e.g. Current Assets"
                value={newAccountInput.group}
                onChange={(e) => setNewAccountInput((p) => ({ ...p, group: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Parent Account
              </label>
              <select
                value={newAccountInput.parentAccountCode ?? ""}
                onChange={(e) =>
                  setNewAccountInput((p) => ({
                    ...p,
                    parentAccountCode: e.target.value || null,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">None (top level)</option>
                {flatAccounts
                  .filter((a) => a.code !== editingAccountCode)
                  .map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </option>
                  ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-foreground">
              <input
                type="checkbox"
                checked={newAccountInput.isActive}
                onChange={(e) => setNewAccountInput((p) => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              Active
            </label>
            <DialogFooter>
              <ErpButton
                type="submit"
                disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
              >
                {editingAccountCode ? "Save Changes" : "Create Account"}
              </ErpButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DIALOG: CREATE JOURNAL ENTRY (STAGING MODAL)
          ========================================== */}
      <Dialog open={createJournalOpen} onOpenChange={setCreateJournalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Journal Entry</DialogTitle>
            <DialogDescription>
              Submit journal lines. Total Debits and Total Credits must balance.
            </DialogDescription>
          </DialogHeader>

          {/* Step progress */}
          <div className="mb-5 flex items-center border-b border-border pb-4">
            {JOURNAL_STEPS.map((step, i) => {
              const currentIndex = JOURNAL_STEPS.findIndex((s) => s.key === journalFormTab);
              const isActive = journalFormTab === step.key;
              const isPast = currentIndex > i;
              return (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => setJournalFormTab(step.key)}
                    className="flex items-center gap-2.5"
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isPast
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="hidden text-left sm:block">
                      <span
                        className={cn(
                          "block text-[12px] font-semibold",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">{step.sub}</span>
                    </span>
                  </button>
                  {i < JOURNAL_STEPS.length - 1 && (
                    <div
                      className={cn("mx-2 h-px flex-1", isPast ? "bg-success/40" : "bg-border")}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCreateJournalSubmit} className="space-y-4">
            {/* STEP 1: General & Org */}
            {journalFormTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Field label="Voucher Number">
                    <input
                      value={newJournalInput.voucherNumber}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({ ...p, voucherNumber: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    />
                  </Field>
                  <Field label="Posting Date *">
                    <input
                      type="date"
                      required
                      value={newJournalInput.postingDate}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({ ...p, postingDate: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    />
                  </Field>
                  <Field label="Accounting Date *">
                    <input
                      type="date"
                      required
                      value={newJournalInput.accountingDate}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({ ...p, accountingDate: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    />
                  </Field>
                  <Field label="Fiscal Year">
                    <input
                      value={newJournalInput.fiscalYear}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({ ...p, fiscalYear: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    />
                  </Field>
                  <Field label="Accounting Period *">
                    <input
                      required
                      placeholder="e.g. Jul 2026"
                      value={newJournalInput.accountingPeriod}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({ ...p, accountingPeriod: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    />
                  </Field>
                  <Field label="Journal Type">
                    <select
                      value={newJournalInput.journalType}
                      onChange={(e) =>
                        setNewJournalInput((p) => ({
                          ...p,
                          journalType: e.target.value as JournalTypeValue,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
                    >
                      {JOURNAL_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Organization Information (Section B)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Field label="Company">
                      <OrgInput
                        value={newJournalInput.companyId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, companyId: v }))}
                      />
                    </Field>
                    <Field label="Business Unit">
                      <OrgInput
                        value={newJournalInput.businessUnitId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, businessUnitId: v }))}
                      />
                    </Field>
                    <Field label="Division">
                      <OrgInput
                        value={newJournalInput.divisionId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, divisionId: v }))}
                      />
                    </Field>
                    <Field label="Branch">
                      <OrgInput
                        value={newJournalInput.branchId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, branchId: v }))}
                      />
                    </Field>
                    <Field label="Cost Center">
                      <OrgInput
                        value={newJournalInput.costCenterId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, costCenterId: v }))}
                      />
                    </Field>
                    <Field label="Profit Center">
                      <OrgInput
                        value={newJournalInput.profitCenterId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, profitCenterId: v }))}
                      />
                    </Field>
                    <Field label="Project">
                      <OrgInput
                        value={newJournalInput.projectId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, projectId: v }))}
                      />
                    </Field>
                    <Field label="Department">
                      <OrgInput
                        value={newJournalInput.departmentId ?? ""}
                        onChange={(v) => setNewJournalInput((p) => ({ ...p, departmentId: v }))}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("lines")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow hover:bg-primary/95"
                  >
                    Next: Lines & Dimensions
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Lines & Dimensions */}
            {journalFormTab === "lines" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Journal Lines (Section D & E)
                  </h4>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    + Add Line
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="p-2 text-left font-medium">GL Account</th>
                        <th className="p-2 text-left font-medium">Description</th>
                        <th className="p-2 text-left font-medium">Dimensions (Line Level)</th>
                        <th className="p-2 text-right font-medium">Debit (INR)</th>
                        <th className="p-2 text-right font-medium">Credit (INR)</th>
                        <th className="p-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {newJournalInput.lines.map((line, i) => (
                        <tr key={i} className="hover:bg-muted/10">
                          <td className="p-2">
                            <select
                              value={line.accountCode}
                              onChange={(e) => {
                                const acc = flatAccounts.find((a) => a.code === e.target.value);
                                updateLine(i, {
                                  accountCode: e.target.value,
                                  accountName: acc?.name ?? "",
                                });
                              }}
                              className="w-full min-w-[150px] rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:border-primary focus:outline-none"
                            >
                              <option value="">Select account…</option>
                              {flatAccounts.map((a) => (
                                <option key={a.code} value={a.code}>
                                  {a.code} — {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              value={line.description}
                              onChange={(e) => updateLine(i, { description: e.target.value })}
                              className="w-full min-w-[120px] rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:border-primary focus:outline-none"
                            />
                          </td>
                          {/* Dimensions fields */}
                          <td className="p-2">
                            <div className="grid grid-cols-2 gap-1.5 min-w-[200px]">
                              <input
                                placeholder="Product"
                                value={line.dimensions?.product ?? ""}
                                onChange={(e) => updateLineDimension(i, "product", e.target.value)}
                                className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[11px] focus:outline-none"
                              />
                              <input
                                placeholder="Customer"
                                value={line.dimensions?.customer ?? ""}
                                onChange={(e) => updateLineDimension(i, "customer", e.target.value)}
                                className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[11px] focus:outline-none"
                              />
                              <input
                                placeholder="Vendor"
                                value={line.dimensions?.vendor ?? ""}
                                onChange={(e) => updateLineDimension(i, "vendor", e.target.value)}
                                className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[11px] focus:outline-none"
                              />
                              <input
                                placeholder="Project"
                                value={line.dimensions?.project ?? ""}
                                onChange={(e) => updateLineDimension(i, "project", e.target.value)}
                                className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[11px] focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.debit || ""}
                              onChange={(e) =>
                                updateLine(i, { debit: Number(e.target.value) || 0, credit: 0 })
                              }
                              className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-right tabular text-foreground focus:border-primary"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.credit || ""}
                              onChange={(e) =>
                                updateLine(i, { credit: Number(e.target.value) || 0, debit: 0 })
                              }
                              className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-right tabular text-foreground focus:border-primary"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(i)}
                              disabled={newJournalInput.lines.length <= 2}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-30"
                            >
                              <XIcon className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        className={cn(
                          "border-t-2 font-bold",
                          journalBalanced
                            ? "border-border bg-muted/10"
                            : "border-destructive/40 bg-destructive/5",
                        )}
                      >
                        <td className="p-2 text-foreground" colSpan={3}>
                          Total
                        </td>
                        <td className="p-2 text-right tabular text-foreground">
                          {formatCurrency(journalTotalDebit)}
                        </td>
                        <td className="p-2 text-right tabular text-foreground">
                          {formatCurrency(journalTotalCredit)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {!journalBalanced && (
                  <p className="mt-1.5 text-[12px] font-semibold text-destructive">
                    Total Debit and Total Credit must match in standard Double-Entry Accounting.
                  </p>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("general")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted/50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("currency")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow hover:bg-primary/95"
                  >
                    Next: Currency & Tax
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Currency & Tax */}
            {journalFormTab === "currency" && (
              <div className="space-y-4">
                {/* Currency details */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Currency Information (Section F)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Field label="Transaction Currency">
                      <select
                        value={newJournalInput.currencyInfo?.transactionCurrency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      >
                        <option value="INR">INR (Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (Pound)</option>
                      </select>
                    </Field>
                    <Field label="Base Currency">
                      <input
                        value="INR"
                        disabled
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-[13px] text-foreground opacity-60"
                      />
                    </Field>
                    <Field label="Exchange Rate">
                      <input
                        type="number"
                        step="0.0001"
                        value={newJournalInput.currencyInfo?.exchangeRate}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            currencyInfo: {
                              ...p.currencyInfo!,
                              exchangeRate: Number(e.target.value) || 1,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      />
                    </Field>
                    <Field label="Exchange Rate Date">
                      <input
                        type="date"
                        value={newJournalInput.currencyInfo?.exchangeRateDate}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            currencyInfo: { ...p.currencyInfo!, exchangeRateDate: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      />
                    </Field>
                  </div>
                  {newJournalInput.currencyInfo?.transactionCurrency !== "INR" && (
                    <div className="mt-3 text-xs font-semibold text-primary">
                      Base currency equivalents will be calculated: ₹
                      {(
                        journalTotalDebit * (newJournalInput.currencyInfo?.exchangeRate || 1)
                      ).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Tax details */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tax Information (Section G)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Field label="GST Type">
                      <select
                        value={newJournalInput.taxInfo?.gstType}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            taxInfo: { ...p.taxInfo!, gstType: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      >
                        <option value="CGST/SGST">CGST/SGST (Intrastate)</option>
                        <option value="IGST">IGST (Interstate)</option>
                        <option value="UTGST">UTGST (Union Territory)</option>
                        <option value="Exempt">Exempt</option>
                      </select>
                    </Field>
                    <Field label="GSTIN">
                      <input
                        value={newJournalInput.taxInfo?.gstin}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            taxInfo: { ...p.taxInfo!, gstin: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      />
                    </Field>
                    <Field label="Tax Code (Rate)">
                      <select
                        value={newJournalInput.taxInfo?.taxCode}
                        onChange={(e) => handleTaxCodeChange(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none"
                      >
                        <option value="GST-18%">GST 18%</option>
                        <option value="GST-12%">GST 12%</option>
                        <option value="GST-5%">GST 5%</option>
                        <option value="Exempt">Exempt 0%</option>
                      </select>
                    </Field>
                    <Field label="Tax Amount (Auto-calc)">
                      <input
                        type="number"
                        disabled
                        value={newJournalInput.taxInfo?.taxAmount}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-[13px] text-foreground opacity-60"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mt-3">
                    <label className="flex items-center gap-2 text-[13px]">
                      <input
                        type="checkbox"
                        checked={newJournalInput.taxInfo?.reverseCharge}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            taxInfo: { ...p.taxInfo!, reverseCharge: e.target.checked },
                          }))
                        }
                        className="h-4 w-4 rounded border-border"
                      />
                      Reverse Charge Applicable
                    </label>
                    <Field label="TDS (%)">
                      <input
                        type="number"
                        value={newJournalInput.taxInfo?.tds}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            taxInfo: { ...p.taxInfo!, tds: Number(e.target.value) || 0 },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </Field>
                    <Field label="TCS (%)">
                      <input
                        type="number"
                        value={newJournalInput.taxInfo?.tcs}
                        onChange={(e) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            taxInfo: { ...p.taxInfo!, tcs: Number(e.target.value) || 0 },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("lines")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted/50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("documents")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow hover:bg-primary/95"
                  >
                    Next: Supporting Documents
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Supporting Documents & Metadata settings */}
            {journalFormTab === "documents" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Documents checklist */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Supporting Documents (Section J)
                    </h4>
                    <p className="mb-3 text-[11px] text-muted-foreground">
                      Attach a file for each document type that applies. Max 3 MB per file.
                    </p>
                    <div className="space-y-2">
                      <FileUploadRow
                        label="Journal Voucher"
                        slot={newJournalInput.supportingDocuments?.journalVoucher}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: {
                              ...p.supportingDocuments!,
                              journalVoucher: slot,
                            },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Invoice"
                        slot={newJournalInput.supportingDocuments?.invoice}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: { ...p.supportingDocuments!, invoice: slot },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Purchase Order (PO)"
                        slot={newJournalInput.supportingDocuments?.purchaseOrder}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: { ...p.supportingDocuments!, purchaseOrder: slot },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Payment Voucher"
                        slot={newJournalInput.supportingDocuments?.paymentVoucher}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: {
                              ...p.supportingDocuments!,
                              paymentVoucher: slot,
                            },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Bank Statement"
                        slot={newJournalInput.supportingDocuments?.bankStatement}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: { ...p.supportingDocuments!, bankStatement: slot },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Tax Document"
                        slot={newJournalInput.supportingDocuments?.taxDocument}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: { ...p.supportingDocuments!, taxDocument: slot },
                          }))
                        }
                      />
                      <FileUploadRow
                        label="Approval Record"
                        slot={newJournalInput.supportingDocuments?.approvalRecord}
                        onChange={(slot) =>
                          setNewJournalInput((p) => ({
                            ...p,
                            supportingDocuments: {
                              ...p.supportingDocuments!,
                              approvalRecord: slot,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Metadata and audit parameters */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Metadata Parameters (Section N)
                    </h4>
                    <div className="space-y-4">
                      <Field label="Created By">
                        <input
                          disabled
                          value="Priya Sharma"
                          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-[13px] text-foreground opacity-60"
                        />
                      </Field>
                      <Field label="Fiscal Calendar Mode">
                        <input
                          disabled
                          value="Standard EV Fiscal Calendar"
                          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-[13px] text-foreground opacity-60"
                        />
                      </Field>
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-2.5 text-[13px]">
                          <input
                            type="checkbox"
                            checked={newJournalInput.metadataInfo?.auditTrail}
                            onChange={(e) =>
                              setNewJournalInput((p) => ({
                                ...p,
                                metadataInfo: { ...p.metadataInfo!, auditTrail: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 rounded border-border"
                          />
                          <div>
                            <span className="font-semibold block">Audit Trail Logs Enabled</span>
                            <span className="text-[11px] text-muted-foreground">
                              Log modifications and deletions.
                            </span>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 text-[13px]">
                          <input
                            type="checkbox"
                            checked={newJournalInput.metadataInfo?.digitalSignature}
                            onChange={(e) =>
                              setNewJournalInput((p) => ({
                                ...p,
                                metadataInfo: {
                                  ...p.metadataInfo!,
                                  digitalSignature: e.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 rounded border-border"
                          />
                          <div>
                            <span className="font-semibold block">
                              Cryptographic Digital Signature
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Sign postings with local EV keys.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setJournalFormTab("currency")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted/50"
                  >
                    Back
                  </button>
                  <ErpButton
                    type="submit"
                    disabled={!journalBalanced || createJournalMutation.isPending}
                  >
                    Save as Draft Entry
                  </ErpButton>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DIALOG: JOURNAL DETAIL / APPROVAL LOG (A-N DETAILED DISPLAY)
          ========================================== */}
      <Dialog open={!!journalDetail} onOpenChange={(open) => !open && setJournalDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card border border-border text-foreground">
          {journalDetail && (
            <JournalDetailDetailedView
              journal={journalDetail}
              simulatedRole={simulatedRole}
              onDecision={(level, decision) =>
                approveStepMutation.mutate({ journalId: journalDetail.id, level, decision })
              }
              deciding={approveStepMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ===========================================================================
   Sub Components and Helpers
   =========================================================================== */

function TabsButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AiScoreBall({
  label,
  value,
  inverse = false,
}: {
  label: string;
  value: number;
  inverse?: boolean;
}) {
  const isHealthy = inverse ? value < 30 : value > 75;
  const colorClass = isHealthy ? "text-[#22C55E]" : "text-destructive";
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/20 border border-border/40">
      <span className={cn("text-2xl font-bold font-display", colorClass)}>{value}%</span>
      <span className="text-[10px] text-muted-foreground font-medium text-center mt-1">
        {label}
      </span>
    </div>
  );
}

function IntegrationRow({
  label,
  connected,
  onChange,
}: {
  label: string;
  connected: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <StatusBadge status={connected ? "Active" : "Inactive"} />
        <button
          onClick={() => onChange(!connected)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all",
            connected
              ? "bg-[#EF4444]/10 text-[#EF4444] ring-[#EF4444]/25 hover:bg-[#EF4444]/20"
              : "bg-success/10 text-success ring-success/25 hover:bg-success/20",
          )}
        >
          {connected ? "Disconnect" : "Connect Module"}
        </button>
      </div>
    </div>
  );
}

function ModuleDesc({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-border/40 pb-2">
      <div className="font-bold text-foreground">{title}</div>
      <div className="text-muted-foreground text-[12px] mt-0.5 leading-relaxed">{desc}</div>
    </div>
  );
}

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FileUploadRow({
  label,
  slot,
  onChange,
}: {
  label: string;
  slot: DocumentSlot | undefined;
  onChange: (slot: DocumentSlot) => void;
}) {
  const attached = slot?.status === "Attached";

  function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`${file.name} is larger than 3 MB. Choose a smaller file.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.slice(result.indexOf(",") + 1);
      onChange({
        status: "Attached",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: base64,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => toast.error(`Failed to read ${file.name}.`);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <FileCheck2
          className={cn("h-4 w-4 shrink-0", attached ? "text-success" : "text-muted-foreground/50")}
        />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">{label}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {attached
              ? `${slot?.fileName} · ${formatFileSize(slot?.fileSize ?? 0)}`
              : "No file attached"}
          </div>
        </div>
      </div>
      {attached ? (
        <button
          type="button"
          onClick={() => onChange({ status: "Not Attached" })}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <XIcon className="h-3.5 w-3.5" />
          Remove
        </button>
      ) : (
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted/50">
          <Upload className="h-3.5 w-3.5" />
          Choose File
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

/* ---------- small form field wrappers ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function OrgInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
    />
  );
}

/* ---------- Journal Entry tab ---------- */
function JournalEntryTable({
  journals,
  loading,
  onRowClick,
}: {
  journals?: JournalRecord[];
  loading: boolean;
  onRowClick: (j: JournalRecord) => void;
}) {
  if (loading) return <div className="h-[200px] animate-pulse rounded-xl bg-muted/40" />;
  if (!journals || journals.length === 0) {
    return (
      <EmptyState
        title="No journal entries yet"
        description="Create your first journal entry to get started."
      />
    );
  }
  return (
    <DataTable<JournalRecord>
      data={journals}
      onRowClick={onRowClick}
      columns={[
        {
          key: "journalNumber",
          header: "Journal Number",
          cell: (r) => <span className="font-semibold text-foreground">{r.journalNumber}</span>,
        },
        {
          key: "postingDate",
          header: "Posting Date",
          cell: (r) => <span className="text-muted-foreground">{r.postingDate.slice(0, 10)}</span>,
        },
        {
          key: "journalType",
          header: "Type",
          cell: (r) => <span className="text-muted-foreground">{r.journalType}</span>,
        },
        {
          key: "totalDebit",
          header: "Total Debit",
          align: "right",
          cell: (r) => (
            <span className="tabular text-foreground">{formatCurrency(r.totalDebit)}</span>
          ),
        },
        {
          key: "totalCredit",
          header: "Total Credit",
          align: "right",
          cell: (r) => (
            <span className="tabular text-foreground">{formatCurrency(r.totalCredit)}</span>
          ),
        },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      mobileCard={(r) => (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{r.journalNumber}</div>
            <div className="text-xs text-muted-foreground">{r.postingDate.slice(0, 10)}</div>
          </div>
          <StatusBadge status={r.status} />
        </div>
      )}
    />
  );
}

/* ---------- Approval Workflow tab ---------- */
function ApprovalQueueTable({
  journals,
  loading,
  onRowClick,
}: {
  journals: JournalRecord[];
  loading: boolean;
  onRowClick: (j: JournalRecord) => void;
}) {
  if (loading) return <div className="h-[200px] animate-pulse rounded-xl bg-muted/40" />;
  if (journals.length === 0) {
    return <EmptyState title="Nothing here" description="No journal entries match this filter." />;
  }
  return (
    <DataTable<JournalRecord>
      data={journals}
      onRowClick={onRowClick}
      columns={[
        {
          key: "journalNumber",
          header: "Journal Number",
          cell: (r) => <span className="font-semibold text-foreground">{r.journalNumber}</span>,
        },
        {
          key: "totalDebit",
          header: "Total Debit",
          align: "right",
          cell: (r) => (
            <span className="tabular text-foreground">{formatCurrency(r.totalDebit)}</span>
          ),
        },
        {
          key: "nextApprover",
          header: "Next Approver",
          cell: (r) => {
            const next = r.approvalSteps.find((s) => s.status === "Pending");
            return (
              <span className="text-muted-foreground">{next ? next.level : "Fully Approved"}</span>
            );
          },
        },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      mobileCard={(r) => (
        <div className="flex items-center justify-between">
          <div className="font-semibold">{r.journalNumber}</div>
          <StatusBadge status={r.status} />
        </div>
      )}
    />
  );
}

/* ---------- Detailed Journal Display including A to N specifications ---------- */
function JournalDetailDetailedView({
  journal,
  simulatedRole,
  onDecision,
  deciding,
}: {
  journal: JournalRecord;
  simulatedRole: ApprovalLevelName;
  onDecision: (level: ApprovalLevelName, decision: "Approved" | "Rejected") => void;
  deciding: boolean;
}) {
  const hasRejection = journal.approvalSteps.some((s) => s.status === "Rejected");
  const firstPendingIndex = journal.approvalSteps.findIndex((s) => s.status === "Pending");
  const rejectedStep = journal.approvalSteps.find((s) => s.status === "Rejected");
  const nextPendingStep = journal.approvalSteps.find((s) => s.status === "Pending");

  // Determine if the currently simulated role can approve
  const currentLevelIsPending = nextPendingStep && nextPendingStep.level === simulatedRole;
  const simulatedCanAction = !hasRejection && currentLevelIsPending;

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-3">
          <DialogTitle className="text-lg font-bold text-foreground">
            Journal Voucher: {journal.journalNumber}
          </DialogTitle>
          <StatusBadge status={journal.status} />
        </div>
        <DialogDescription>
          {journal.journalType} entry · Posted Date: {journal.postingDate.slice(0, 10)}
        </DialogDescription>
      </DialogHeader>

      {/* Specification Grids split */}
      <div className="grid gap-4 md:grid-cols-2 border-y border-border py-4 my-2 text-[12.5px]">
        {/* Section A: Ledger Information */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            A. Ledger Information
          </h4>
          <SummaryRow label="GL Transaction ID" value={journal.id} />
          <SummaryRow label="Voucher Number" value={journal.voucherNumber || "—"} />
          <SummaryRow label="Posting Date" value={journal.postingDate.slice(0, 10)} />
          <SummaryRow label="Accounting Date" value={journal.accountingDate.slice(0, 10)} />
          <SummaryRow label="Fiscal Year" value={journal.fiscalYear} />
          <SummaryRow label="Accounting Period" value={journal.accountingPeriod} />
          <SummaryRow label="Journal Type" value={journal.journalType} />
        </div>

        {/* Section B: Organization Information */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            B. Organization Information
          </h4>
          <SummaryRow label="Company" value={journal.companyId || "—"} />
          <SummaryRow label="Business Unit" value={journal.businessUnitId || "—"} />
          <SummaryRow label="Division" value={journal.divisionId || "—"} />
          <SummaryRow label="Branch" value={journal.branchId || "—"} />
          <SummaryRow label="Cost Center" value={journal.costCenterId || "—"} />
          <SummaryRow label="Profit Center" value={journal.profitCenterId || "—"} />
          <SummaryRow label="Project" value={journal.projectId || "—"} />
          <SummaryRow label="Department" value={journal.departmentId || "—"} />
        </div>

        {/* Section F: Currency Info */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            F. Currency Information
          </h4>
          <SummaryRow
            label="Transaction Currency"
            value={journal.currencyInfo?.transactionCurrency || "INR"}
          />
          <SummaryRow label="Base Currency" value={journal.currencyInfo?.baseCurrency || "INR"} />
          <SummaryRow
            label="Exchange Rate"
            value={journal.currencyInfo?.exchangeRate?.toString() || "1"}
          />
          <SummaryRow
            label="Exchange Rate Date"
            value={journal.currencyInfo?.exchangeRateDate?.slice(0, 10) || "—"}
          />
          <SummaryRow
            label="Foreign Gain/Loss (INR)"
            value={formatCurrency(journal.currencyInfo?.foreignCurrencyGainLoss || 0)}
          />
        </div>

        {/* Section G: Tax Info */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            G. Tax Information
          </h4>
          <SummaryRow label="GST Type" value={journal.taxInfo?.gstType || "—"} />
          <SummaryRow label="GSTIN" value={journal.taxInfo?.gstin || "—"} />
          <SummaryRow label="Tax Code" value={journal.taxInfo?.taxCode || "—"} />
          <SummaryRow label="Tax Amount" value={formatCurrency(journal.taxInfo?.taxAmount || 0)} />
          <SummaryRow
            label="Reverse Charge"
            value={journal.taxInfo?.reverseCharge ? "Yes" : "No"}
          />
          <SummaryRow label="TDS (%)" value={journal.taxInfo?.tds?.toString() || "0"} />
          <SummaryRow label="TCS (%)" value={journal.taxInfo?.tcs?.toString() || "0"} />
        </div>

        {/* Section J: Supporting Documents Status */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            J. Supporting Documents
          </h4>
          <DocumentSummaryRow
            label="Journal Voucher"
            slot={journal.supportingDocuments?.journalVoucher}
          />
          <DocumentSummaryRow label="Invoice" slot={journal.supportingDocuments?.invoice} />
          <DocumentSummaryRow
            label="Purchase Order"
            slot={journal.supportingDocuments?.purchaseOrder}
          />
          <DocumentSummaryRow
            label="Payment Voucher"
            slot={journal.supportingDocuments?.paymentVoucher}
          />
          <DocumentSummaryRow
            label="Bank Statement"
            slot={journal.supportingDocuments?.bankStatement}
          />
          <DocumentSummaryRow
            label="Tax Document"
            slot={journal.supportingDocuments?.taxDocument}
          />
          <DocumentSummaryRow
            label="Approval Record"
            slot={journal.supportingDocuments?.approvalRecord}
          />
        </div>

        {/* Section N: Metadata & Compliance */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-primary uppercase text-[10px] tracking-wider">
            N. Metadata
          </h4>
          <SummaryRow label="Created By" value={journal.metadataInfo?.createdBy || "—"} />
          <SummaryRow
            label="Created Date"
            value={journal.metadataInfo?.createdDate?.slice(0, 10) || "—"}
          />
          <SummaryRow
            label="Last Modified By"
            value={journal.metadataInfo?.lastModifiedBy || "—"}
          />
          <SummaryRow
            label="Last Modified Date"
            value={journal.metadataInfo?.lastModifiedDate?.slice(0, 10) || "—"}
          />
          <SummaryRow
            label="Journal Version"
            value={journal.metadataInfo?.journalVersion?.toString() || "1"}
          />
          <SummaryRow
            label="ERP Reference #"
            value={journal.metadataInfo?.erpReferenceNumber || "—"}
          />
          <SummaryRow
            label="Audit Trail"
            value={journal.metadataInfo?.auditTrail ? "Enabled" : "Disabled"}
          />
          <SummaryRow
            label="Digital Signature"
            value={journal.metadataInfo?.digitalSignature ? "Enabled" : "Disabled"}
          />
        </div>
      </div>

      {/* Section D & E: Lines table details */}
      <div className="mt-3">
        <h4 className="mb-2 font-bold text-primary uppercase text-[10px] tracking-wider">
          D & E. Journal Entry Details
        </h4>
        <table className="w-full text-[12.5px] border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <th className="p-2 text-left font-medium">Account</th>
              <th className="p-2 text-left font-medium">Description</th>
              <th className="p-2 text-left font-medium">Dimensions (Product/Customer/Vendor)</th>
              <th className="p-2 text-right font-medium">Debit</th>
              <th className="p-2 text-right font-medium">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {journal.lines.map((l, i) => (
              <tr key={i}>
                <td className="p-2 text-foreground">
                  {l.accountCode} — {l.accountName}
                </td>
                <td className="p-2 text-muted-foreground">{l.description || "—"}</td>
                <td className="p-2">
                  <div className="text-[11px] space-y-0.5 text-muted-foreground">
                    {l.dimensions?.product && (
                      <div>
                        Product:{" "}
                        <span className="font-semibold text-foreground">
                          {l.dimensions.product}
                        </span>
                      </div>
                    )}
                    {l.dimensions?.customer && (
                      <div>
                        Customer:{" "}
                        <span className="font-semibold text-foreground">
                          {l.dimensions.customer}
                        </span>
                      </div>
                    )}
                    {l.dimensions?.vendor && (
                      <div>
                        Vendor:{" "}
                        <span className="font-semibold text-foreground">{l.dimensions.vendor}</span>
                      </div>
                    )}
                    {l.dimensions?.project && (
                      <div>
                        Project:{" "}
                        <span className="font-semibold text-foreground">
                          {l.dimensions.project}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 text-right tabular text-foreground">
                  {l.debit > 0 ? formatCurrency(l.debit) : "—"}
                </td>
                <td className="p-2 text-right tabular text-foreground">
                  {l.credit > 0 ? formatCurrency(l.credit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold bg-muted/10">
              <td className="p-2 text-foreground" colSpan={3}>
                Total
              </td>
              <td className="p-2 text-right tabular text-foreground">
                {formatCurrency(journal.totalDebit)}
              </td>
              <td className="p-2 text-right tabular text-foreground">
                {formatCurrency(journal.totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Section H: Approval Chain status log */}
      <div className="mt-4 pt-3 border-t border-border">
        <h4 className="mb-2 font-bold text-primary uppercase text-[10px] tracking-wider">
          H. Approval Workflow Chain
        </h4>
        {hasRejection && rejectedStep && (
          <div className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-[12px] text-destructive font-semibold">
            Rejected at {rejectedStep.level} by {rejectedStep.approverName} — entry returned to
            Draft.
          </div>
        )}

        <ul className="space-y-2">
          {journal.approvalSteps.map((step, i) => {
            const isTargetPending = step.status === "Pending" && i === firstPendingIndex;
            const canApprove = isTargetPending && step.level === simulatedRole;

            return (
              <li
                key={step.level}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div>
                  <div className="text-[13px] font-semibold text-foreground">
                    {step.level}{" "}
                    {step.level === simulatedRole && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-1.5 font-bold">
                        You (Simulated)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Approver: {step.approverName}
                    {step.date ? ` · Approved on ${step.date.slice(0, 10)}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTargetPending ? (
                    canApprove ? (
                      <>
                        <button
                          disabled={deciding}
                          onClick={() => onDecision(step.level, "Approved")}
                          className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2.5 py-1.5 text-[12px] font-semibold text-success ring-1 ring-inset ring-success/25 hover:bg-success/25"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          disabled={deciding}
                          onClick={() => onDecision(step.level, "Rejected")}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2.5 py-1.5 text-[12px] font-semibold text-destructive ring-1 ring-inset ring-destructive/25 hover:bg-destructive/25"
                        >
                          <XIcon className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Waiting for {step.level}…
                      </span>
                    )
                  ) : (
                    <StatusBadge status={step.status} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

/* ---------- Account Summary ---------- */
function AccountSummaryCard({
  summary,
  loading,
}: {
  summary: AccountSummary | null | undefined;
  loading: boolean;
}) {
  if (loading || !summary) {
    return (
      <div className="card-soft p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-primary/10" />
      </div>
    );
  }
  return (
    <div className="card-soft p-5">
      <h3 className="mb-1 font-display text-[15px] font-semibold text-foreground">
        Account Summary
      </h3>
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-[14px] font-bold text-foreground">
          {summary.code} - {summary.name}
        </span>
        <StatusBadge status={summary.status} />
      </div>
      <dl className="space-y-2 text-[13px]">
        <SummaryRow label="Account Type" value={summary.accountType} />
        <SummaryRow label="Account Group" value={summary.accountGroup} />
        <SummaryRow label="Normal Balance" value={summary.normalBalance} />
        <SummaryRow label="Currency" value={summary.currency} />
        <SummaryRow label="Opening Balance" value={formatCurrency(summary.openingBalance)} />
        <div className="pt-1 text-muted-foreground">Period Activity</div>
        <SummaryRow label="Debit" value={formatCurrency(summary.periodDebit)} indent />
        <SummaryRow label="Credit" value={formatCurrency(summary.periodCredit)} indent />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <dt className="text-muted-foreground">Ending Balance (YTD)</dt>
          <dd className="font-bold text-[#22C55E] tabular">
            {formatCurrency(summary.endingBalance)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({ label, value, indent }: { label: string; value: string; indent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <dt className={`text-muted-foreground ${indent ? "pl-3" : ""}`}>{label}</dt>
      <dd className="font-semibold text-foreground tabular max-w-[180px] truncate" title={value}>
        {value}
      </dd>
    </div>
  );
}

function DocumentSummaryRow({ label, slot }: { label: string; slot?: DocumentSlot }) {
  const attached = slot?.status === "Attached";
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <dt className="text-muted-foreground">{label}</dt>
      {attached && slot?.fileData ? (
        <a
          href={`data:${slot.fileType || "application/octet-stream"};base64,${slot.fileData}`}
          download={slot.fileName}
          className="inline-flex max-w-[180px] items-center gap-1 truncate font-semibold text-primary hover:underline"
          title={slot.fileName}
        >
          <Download className="h-3 w-3 shrink-0" />
          <span className="truncate">{slot.fileName}</span>
        </a>
      ) : (
        <dd className="font-medium text-muted-foreground">Not Attached</dd>
      )}
    </div>
  );
}

/* ---------- Account Activity ---------- */
function AccountActivityView({
  accountCode,
  entries,
  loading,
}: {
  accountCode: string;
  entries?: LedgerJournalEntry[];
  loading: boolean;
}) {
  if (loading) return <div className="h-[200px] animate-pulse rounded bg-muted/40" />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        title="No activity"
        description={`No journal activity found for account ${accountCode}.`}
      />
    );
  }
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <th className="pb-2 text-left font-medium">Date</th>
          <th className="pb-2 text-left font-medium">Reference</th>
          <th className="pb-2 text-left font-medium">Description</th>
          <th className="pb-2 text-right font-medium">Debit</th>
          <th className="pb-2 text-right font-medium">Credit</th>
          <th className="pb-2 text-right font-medium">Balance</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {entries.map((e) => (
          <tr key={e.ref} className="hover:bg-muted/10">
            <td className="py-2.5 text-muted-foreground">{e.date}</td>
            <td className="py-2.5 font-medium text-primary">{e.ref}</td>
            <td className="py-2.5 text-foreground">{e.description}</td>
            <td className="py-2.5 text-right tabular text-foreground">
              {e.debit > 0 ? formatCurrency(e.debit) : "—"}
            </td>
            <td className="py-2.5 text-right tabular text-foreground">
              {e.credit > 0 ? formatCurrency(e.credit) : "—"}
            </td>
            <td className="py-2.5 text-right font-semibold tabular text-foreground">
              {formatCurrency(e.balance)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- Trial Balance ---------- */
function TrialBalanceView({ report, loading }: { report?: TrialBalanceReport; loading: boolean }) {
  if (loading || !report) return <div className="h-[200px] animate-pulse rounded bg-muted/40" />;
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <th className="pb-2 text-left font-medium">Account Code</th>
          <th className="pb-2 text-left font-medium">Account Name</th>
          <th className="pb-2 text-right font-medium">Debit (YTD)</th>
          <th className="pb-2 text-right font-medium">Credit (YTD)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {report.rows.map((r) => (
          <tr key={r.code} className="hover:bg-muted/10">
            <td className="py-2.5 font-medium text-foreground">{r.code}</td>
            <td className="py-2.5 text-foreground">{r.name}</td>
            <td className="py-2.5 text-right tabular text-foreground">
              {r.debit > 0 ? formatCurrency(r.debit, true) : "—"}
            </td>
            <td className="py-2.5 text-right tabular text-foreground">
              {r.credit > 0 ? formatCurrency(r.credit, true) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-border font-bold">
          <td className="py-3 text-foreground" colSpan={2}>
            Total
          </td>
          <td className="py-3 text-right tabular text-foreground">
            {formatCurrency(report.totalDebit, true)}
          </td>
          <td className="py-3 text-right tabular text-foreground">
            {formatCurrency(report.totalCredit, true)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
