import { memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, BrainCircuit, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatSignedCurrency, allTransactions } from "@/lib/mock-data";
import { Coins, Percent } from "lucide-react";
import type { WidgetContentProps } from "../../types";
import {
  apCountOptions,
  apTotalOptions,
  arCountOptions,
  arTotalOptions,
  bankAccountsOptions,
  dashboardDataOptions,
  journalsOptions,
  ledgerDashboardOptions,
  unwrapLedger,
} from "../../data/queries";

/* ===========================================================================
   Finance Overview panel widgets
   ---------------------------------------------------------------------------
   The Overview page's panels, moved here near-verbatim. Each now fetches its
   own slice through the canonical query keys, so any of them can be placed on
   the Dashboard (or any other page) and still work.
   =========================================================================== */

/* ---------- AP / AR KPIs ----------
   These read two sources (the outstanding total, plus an open-invoice count for
   the caption), which the single-query StatCard factory can't express — so they
   are written out rather than generated, to keep the caption the page had. */
export const PendingPayablesWidget = memo(function PendingPayablesWidget({
  instance,
}: WidgetContentProps) {
  const { data: total, isLoading } = useQuery(apTotalOptions());
  const { data: count } = useQuery(apCountOptions());
  if (isLoading) return <Skeleton className="h-[104px] rounded-xl" />;
  return (
    <StatCard
      label={instance.customTitle ?? "Pending Payments (AP)"}
      value={total ? formatCurrency(total, true) : "—"}
      neutralText={`${count ?? 0} invoices outstanding`}
      iconBg="bg-orange-500/10"
      iconColor="text-orange-500"
      icon={<Coins className="h-5 w-5" />}
    />
  );
});

export const PendingReceivablesWidget = memo(function PendingReceivablesWidget({
  instance,
}: WidgetContentProps) {
  const { data: total, isLoading } = useQuery(arTotalOptions());
  const { data: count } = useQuery(arCountOptions());
  if (isLoading) return <Skeleton className="h-[104px] rounded-xl" />;
  return (
    <StatCard
      label={instance.customTitle ?? "Pending Receivables (AR)"}
      value={total ? formatCurrency(total, true) : "—"}
      neutralText={`${count ?? 0} invoices outstanding`}
      iconBg="bg-cyan-500/10"
      iconColor="text-cyan-500"
      icon={<Percent className="h-5 w-5" />}
    />
  );
});

/* ---------- Revenue, Expenses & Profitability Trend ---------- */
export const TrendComposedWidget = memo(function TrendComposedWidget() {
  const { data, isLoading } = useQuery(dashboardDataOptions());
  if (isLoading || !data) return <Skeleton className="h-[350px] rounded-xl" />;

  return (
    <div className="card-soft p-5">
      <CardHeader title="Revenue, Expenses & Profitability Trend" />
      <div className="mb-3 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#EF4444]" /> Expenses
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-success">
          <span className="h-1 w-3 rounded-full bg-success" /> Net Income Trend
        </span>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={data.revenueExpenseTrend}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            barCategoryGap={10}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1_00_000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => formatCurrency(v, true)}
            />
            <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} />
            <Line
              type="monotone"
              dataKey="netProfit"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#22C55E", strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

/* ---------- Cash Flow Summary (YTD) ---------- */
export const CashFlowSummaryWidget = memo(function CashFlowSummaryWidget() {
  const { data, isLoading } = useQuery(dashboardDataOptions());
  if (isLoading || !data) return <Skeleton className="h-[350px] rounded-xl" />;

  return (
    <div className="card-soft flex flex-col justify-between p-5">
      <div>
        <CardHeader title="Cash Flow Summary (YTD)" />
        <div className="mt-3 divide-y divide-border/60">
          {data.cashFlowSummary.lines.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3 text-[13px]">
              <span className="text-muted-foreground">{row.label}</span>
              <span
                className={`font-semibold tabular ${row.value < 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}
              >
                {formatSignedCurrency(row.value, true)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <span className="block text-xs text-muted-foreground">Net Cash Flow Balance</span>
          <span className="font-display text-2xl font-bold text-success tabular">
            {formatCurrency(data.cashFlowSummary.netCashFlow, true)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
          <ArrowUpRight className="h-3 w-3" /> Strong Inflows
        </span>
      </div>
    </div>
  );
});

/* ---------- Bank Account Balances ---------- */
export const BankBalancesWidget = memo(function BankBalancesWidget() {
  const { data: bankAccounts, isLoading } = useQuery(bankAccountsOptions());
  if (isLoading || !bankAccounts) return <Skeleton className="h-[350px] rounded-xl" />;

  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="card-soft p-5">
      <CardHeader
        title="Bank Account Balances"
        right={
          <span className="text-xs text-muted-foreground">
            Total: {formatCurrency(totalBankBalance, true)}
          </span>
        }
      />
      <div className="mt-4 space-y-4">
        {bankAccounts.map((acc) => {
          const pct = totalBankBalance > 0 ? (acc.currentBalance / totalBankBalance) * 100 : 0;
          return (
            <div key={acc.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {acc.name} ({acc.bankName})
                </span>
                <span className="font-semibold text-foreground tabular">
                  {formatCurrency(acc.currentBalance, true)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Acc No: {acc.accountNo}</span>
                <span>{pct.toFixed(1)}% of reserves</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ---------- Monthly Net Income Progression ---------- */
export const NetIncomeAreaWidget = memo(function NetIncomeAreaWidget() {
  const { data, isLoading } = useQuery(dashboardDataOptions());
  if (isLoading || !data) return <Skeleton className="h-[250px] rounded-xl" />;

  return (
    <div className="card-soft p-5">
      <CardHeader title="Monthly Net Income Progression" />
      <div className="mt-3 h-[180px] w-full">
        <ResponsiveContainer>
          <AreaChart
            data={data.revenueExpenseTrend}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1_00_000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => formatCurrency(v, true)}
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              stroke="#F59E0B"
              fill="rgba(245, 158, 11, 0.1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

/* ---------- Financial Operations Ledger (5 tabs) ---------- */
type InsightsTab = "journals" | "transactions" | "payments" | "receipts" | "approvals";

const OPS_TABS: { id: InsightsTab; label: string }[] = [
  { id: "journals", label: "Journal Entries" },
  { id: "transactions", label: "Transactions" },
  { id: "payments", label: "Payments (AP)" },
  { id: "receipts", label: "Receipts (AR)" },
  { id: "approvals", label: "Pending Approvals" },
];

export const OperationsLedgerWidget = memo(function OperationsLedgerWidget() {
  const [activeTab, setActiveTab] = useState<InsightsTab>("journals");
  const { data: journalsData, isLoading } = useQuery(journalsOptions());

  if (isLoading) return <Skeleton className="h-[320px] rounded-xl" />;

  const journals = Array.isArray(journalsData) ? journalsData : [];
  const recentJournals = journals.slice(0, 5);
  const recentTransactions = allTransactions.slice(0, 5);
  const recentPayments = allTransactions.filter((t) => t.type === "Payment").slice(0, 5);
  const recentReceipts = allTransactions.filter((t) => t.type === "Receipt").slice(0, 5);
  const pendingApprovals = journals.filter((j) => j.status === "Draft").slice(0, 5);

  return (
    <div className="card-soft p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2">
        <h3 className="font-display text-[15px] font-semibold text-foreground">
          Financial Operations Ledger
        </h3>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
          {OPS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[220px] overflow-x-auto">
        {activeTab === "journals" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2">Voucher No</th>
                <th className="py-2">Posting Date</th>
                <th className="py-2">Type</th>
                <th className="py-2 text-right">Debit</th>
                <th className="py-2 text-right">Credit</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJournals.map((j) => (
                <tr key={j.id} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2.5 font-semibold text-primary">{j.journalNumber}</td>
                  <td className="py-2.5 text-muted-foreground">{j.postingDate.slice(0, 10)}</td>
                  <td className="py-2.5 font-medium text-foreground">{j.journalType}</td>
                  <td className="py-2.5 text-right tabular text-foreground">
                    {formatCurrency(j.totalDebit)}
                  </td>
                  <td className="py-2.5 text-right tabular text-foreground">
                    {formatCurrency(j.totalCredit)}
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={j.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "transactions" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2">Ref ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">Counterparty</th>
                <th className="py-2">Account</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.ref} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2.5 font-semibold text-primary">{t.ref}</td>
                  <td className="py-2.5 text-muted-foreground">{t.date}</td>
                  <td className="py-2.5 font-medium text-foreground">{t.counterparty || "—"}</td>
                  <td className="py-2.5 text-muted-foreground">{t.account}</td>
                  <td className="py-2.5 text-right font-bold tabular text-foreground">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "payments" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2">Payment Ref</th>
                <th className="py-2">Date</th>
                <th className="py-2">Vendor</th>
                <th className="py-2">Account</th>
                <th className="py-2 text-right">Outflow Amount</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.ref} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2.5 font-semibold text-primary">{p.ref}</td>
                  <td className="py-2.5 text-muted-foreground">{p.date}</td>
                  <td className="py-2.5 font-medium text-foreground">{p.counterparty || "—"}</td>
                  <td className="py-2.5 text-muted-foreground">{p.account}</td>
                  <td className="py-2.5 text-right font-semibold tabular text-destructive">
                    {formatCurrency(Math.abs(p.amount))}
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "receipts" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2">Receipt Ref</th>
                <th className="py-2">Date</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Account</th>
                <th className="py-2 text-right">Inflow Amount</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReceipts.map((r) => (
                <tr key={r.ref} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2.5 font-semibold text-primary">{r.ref}</td>
                  <td className="py-2.5 text-muted-foreground">{r.date}</td>
                  <td className="py-2.5 font-medium text-foreground">{r.counterparty || "—"}</td>
                  <td className="py-2.5 text-muted-foreground">{r.account}</td>
                  <td className="py-2.5 text-right font-semibold tabular text-success">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "approvals" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2">Voucher No</th>
                <th className="py-2">Type</th>
                <th className="py-2">Created By</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-right">Next Stage</th>
                <th className="py-2 text-right">Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((j) => {
                const nextStep = j.approvalSteps.find((s) => s.status === "Pending");
                return (
                  <tr key={j.id} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-2.5 font-semibold text-primary">{j.journalNumber}</td>
                    <td className="py-2.5 text-muted-foreground">{j.journalType}</td>
                    <td className="py-2.5 font-medium text-foreground">
                      {j.metadataInfo?.createdBy ?? "—"}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular text-foreground">
                      {formatCurrency(j.totalDebit)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-warning">
                      {nextStep ? nextStep.level : "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-600">
                        Pending Review
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No entries waiting for approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

/* ---------- System Alerts & Warnings ---------- */
function AlertRow({
  type,
  title,
  desc,
}: {
  type: "warning" | "info" | "success";
  title: string;
  desc: string;
}) {
  const bg =
    type === "warning"
      ? "bg-amber-500/10 border-amber-500/30"
      : type === "success"
        ? "bg-success/10 border-success/30"
        : "bg-blue-500/10 border-blue-500/30";
  const text =
    type === "warning" ? "text-amber-700" : type === "success" ? "text-success" : "text-blue-700";
  return (
    <div className={`rounded-lg border p-3 text-xs leading-relaxed ${bg}`}>
      <div className={`font-bold ${text}`}>{title}</div>
      <div className="mt-0.5 text-muted-foreground">{desc}</div>
    </div>
  );
}

function PredictionRow({
  month,
  flow,
  amount,
}: {
  month: string;
  flow: "positive" | "negative";
  amount: number;
}) {
  const color = flow === "positive" ? "text-success" : "text-destructive";
  const Arrow = flow === "positive" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
      <span className="font-medium text-muted-foreground">{month}</span>
      <div className="flex items-center gap-1.5 font-bold tabular">
        <Arrow className={`h-3 w-3 ${color}`} />
        <span className={color}>{formatCurrency(Math.abs(amount), true)}</span>
      </div>
    </div>
  );
}

export const SystemAlertsWidget = memo(function SystemAlertsWidget() {
  const { data: ledgerRes, isLoading } = useQuery(ledgerDashboardOptions());
  if (isLoading) return <Skeleton className="h-[350px] rounded-xl" />;
  const kpis = unwrapLedger(ledgerRes)?.kpis;

  return (
    <div className="card-soft p-5">
      <CardHeader title="System Alerts & Warnings" />
      <div className="mt-3 space-y-3">
        <AlertRow
          type="warning"
          title="Trial Balance Offset Risk"
          desc={
            !kpis
              ? "Unable to retrieve trial balance difference. Check database connection."
              : kpis.trialBalanceDifference === 0
                ? "General Ledger is perfectly aligned."
                : `Mismatch of ₹${kpis.trialBalanceDifference.toLocaleString()} in debit/credit calculations.`
          }
        />
        <AlertRow
          type="info"
          title="Payroll Budget Watch"
          desc="Payroll account has utilized 92% of standard monthly forecast."
        />
        <AlertRow
          type="success"
          title="Period close checklist"
          desc="August closure checklist is 82% ready. Ready to initialize."
        />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
          3-Month Cash Flow Prediction
        </h4>
        <div className="space-y-2">
          <PredictionRow month="August 2026" flow="positive" amount={2240000} />
          <PredictionRow month="September 2026" flow="positive" amount={1890000} />
          <PredictionRow month="October 2026" flow="negative" amount={-450000} />
        </div>
      </div>
    </div>
  );
});

/* ---------- AI Financial Intelligence Center ---------- */
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 p-4">
      <span className={`font-display text-2xl font-bold ${colorClass}`}>{value}%</span>
      <span className="mt-1 text-center text-[10px] font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export const AiIntelligenceWidget = memo(function AiIntelligenceWidget() {
  const { data: ledgerRes, isLoading } = useQuery(ledgerDashboardOptions());
  if (isLoading) return <Skeleton className="h-[220px] rounded-xl" />;
  const aiIntel = unwrapLedger(ledgerRes)?.aiIntelligence;

  return (
    <div className="card-soft p-5">
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 animate-pulse text-primary" />
          <div>
            <h3 className="font-display text-[15px] font-semibold text-foreground">
              AI Financial Intelligence Center
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time ledger audit, fraud assessment, and closing prediction checks.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> Core Engine Active
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <AiScoreBall label="Ledger Health" value={aiIntel?.ledgerHealthScore ?? 100} />
        <AiScoreBall label="Journal Accuracy" value={aiIntel?.journalAccuracyScore ?? 100} />
        <AiScoreBall label="Financial Risk" value={aiIntel?.financialRiskScore ?? 0} inverse />
        <AiScoreBall label="Fraud Detection" value={aiIntel?.fraudDetectionScore ?? 0} inverse />
        <AiScoreBall label="Close Readiness" value={aiIntel?.closingReadinessScore ?? 100} />
      </div>

      {aiIntel?.aiRecommendations && (
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-[13px] leading-relaxed text-foreground">
          <strong className="font-bold text-primary">AI Analytics Recommendations: </strong>
          <div className="mt-1 flex flex-wrap gap-2 text-muted-foreground">
            {aiIntel.aiRecommendations.split("|").map((rec, i) => (
              <span key={i} className="block w-full">
                • {rec.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
