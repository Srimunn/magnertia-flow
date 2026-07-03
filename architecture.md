# Magnertia ERP — Architecture Pattern

Extracted from the Financial Management Dashboard sequence diagram. This defines the
`services/` layer convention for **all** modules in the ERP suite, not just Financial
Management — new modules should add their own `services/*Service.ts` files following
the same shape.

## Service boundaries (from the sequence diagram)

| Diagram participant                  | Role                                                                                                                                                                             | Maps to                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Finance Manager                      | Actor                                                                                                                                                                            | N/A (the user)                                                           |
| Financial Dashboard                  | UI/frontend                                                                                                                                                                      | `src/routes/index.tsx` + `AppShell`                                      |
| Authentication                       | Session validation                                                                                                                                                               | `services/authenticationService.ts`                                      |
| Financial Management Service         | **Orchestrator** — fans out to the domain services below, assembles the response                                                                                                 | `services/financialManagementService.ts`                                 |
| Revenue Service                      | Total revenue                                                                                                                                                                    | `services/revenueService.ts`                                             |
| Expense Service                      | Total expenses                                                                                                                                                                   | `services/expenseService.ts`                                             |
| Cash & Bank                          | Cash position                                                                                                                                                                    | `services/cashBankService.ts`                                            |
| General Ledger                       | Net profit, journal/transaction history                                                                                                                                          | `services/generalLedgerService.ts`                                       |
| Accounts Receivable                  | Outstanding receivables + aging                                                                                                                                                  | `services/accountsReceivableService.ts`                                  |
| Accounts Payable                     | Outstanding payables + aging                                                                                                                                                     | `services/accountsPayableService.ts`                                     |
| Analytics Engine                     | Derived/aggregate metrics: current ratio, trend, cash flow summary, expense distribution, financial insights (margins, DSO/DPO/CCC), account balance trend, account distribution | `services/analyticsEngineService.ts`                                     |
| Chart of Accounts                    | Account master data — search/filter/hierarchy queries, distinct from General Ledger Service's KPI/summary work                                                                   | `services/chartOfAccountsService.ts`                                     |
| Vendor Management                    | Vendor master data — profile lookups, distinct from Accounts Payable Service's invoice/liability work                                                                            | `services/vendorManagementService.ts`                                    |
| Payment Service                      | Payment processing — recording payments, paid-to-date figures, distinct from Accounts Payable Service's invoice lifecycle                                                        | `services/paymentService.ts`                                             |
| Customer Management                  | Customer master data — profile lookups, the AR mirror of Vendor Management                                                                                                       | `services/customerManagementService.ts`                                  |
| Receipt & Collection Service         | Receipt processing — recording payments received, collected-to-date figures, the AR mirror of Payment Service                                                                    | `services/receiptCollectionService.ts`                                   |
| Reporting Engine / Reporting Service | Document & export generation (Excel/PDF/CSV)                                                                                                                                     | `services/reportingEngineService.ts` — see naming note below             |
| Database                             | Underlying data source                                                                                                                                                           | `src/lib/mock-data.ts` today; a real DB/API behind each service tomorrow |

Every arrow in the diagram becomes one exported async function on the corresponding
service. The **Financial Management Service is the only thing the UI calls** — domain
services are never imported directly by a route, mirroring the diagram where the
Finance Manager/Dashboard never talks to Revenue Service, Cash & Bank, etc. directly.

**`financialManagementService.ts` is a shared, multi-module orchestrator, not
one-per-page.** The Transactions module's sequence diagram names its orchestrator
"Financial Management Service" too — same name, same file. It exports one function per
page (`loadDashboardData()`, `loadTransactionsData()`, ...), each doing its own
`Promise.all` fan-out. Don't create a second orchestrator file per module just because a
new diagram draws its own box for it — check whether the diagram's orchestrator role is
actually the same shared service before assuming it's new.

## Folder structure

```
src/services/
  types.ts                        # shared payload types (DashboardData, DashboardQuery, ...)
  apiClient.ts                    # mock/live seam (see below)
  authenticationService.ts        # validateLoginSession()
  revenueService.ts               # calculateTotalRevenue()
  expenseService.ts               # calculateTotalExpenses()
  cashBankService.ts              # fetchCashBalance()
  generalLedgerService.ts         # calculateNetProfit(), fetchLatestTransactions(),
                                   # retrieveJournalEntry(), calculateTotalAccounts(),
                                   # calculateTotalDebits/Credits(), calculateNetIncome(),
                                   # retrieveAccountSummary(), fetchTransactionHistory(),
                                   # generateTrialBalance(), ...
  chartOfAccountsService.ts       # queryAccounts()
  accountsReceivableService.ts    # fetchOutstandingReceivables(), retrieveInvoiceInformation(),
                                   # calculateTotalReceivables(), calculateOverdueAmount(),
                                   # retrieveInvoiceList(), saveInvoice(), createCreditMemo(),
                                   # notifyCustomer(), ...
  accountsPayableService.ts       # fetchOutstandingPayables(), retrievePaymentInformation(),
                                   # calculateTotalPayables(), calculateOverdueAmount(),
                                   # retrieveInvoiceList(), saveInvoice(), updateApprovalStatus(), ...
  vendorManagementService.ts      # fetchVendorInformation()
  paymentService.ts               # retrievePaidAmount(), processPayment()
  customerManagementService.ts    # fetchCustomerInformation()
  receiptCollectionService.ts     # retrieveCollectionAmount(), recordReceipt()
  analyticsEngineService.ts       # calculateCurrentRatio(), generateRevenueExpenseTrend(),
                                   # generateCashFlowSummary(), generateExpenseDistribution(),
                                   # calculateFinancialInsights(), generateAccountBalanceTrend(),
                                   # generateAccountDistribution(), generateApAgingSummary(),
                                   # calculateTopVendors(), generatePaymentSummary(),
                                   # generateArAgingSummary(), generateReceivableTrend(),
                                   # calculateTopCustomers(), generateCollectionSummary()
  transactionService.ts           # searchTransactions(), fetchTransactionDetails(),
                                   # updateTransaction(), notifyCustomerOrSupplier(), ...
  approvalWorkflowService.ts      # fetchPendingApprovals()
  reportingEngineService.ts       # generateInvoiceDocument(), generateExport(), generateLedgerExport(),
                                   # generateAccountsPayableExport(), generateAccountsReceivableExport(),
                                   # generateCustomerStatement()
  financialManagementService.ts   # loadDashboardData(), loadTransactionsData(),
                                   # loadGeneralLedgerDashboard(), loadAccountsPayableDashboard(),
                                   # loadAccountsReceivableDashboard() — shared orchestrator
  index.ts                        # barrel export
```

Each domain service file is named `<boundary>Service.ts` and exports plain async
functions — no classes, no DI container. This keeps them trivially callable from
`financialManagementService.ts` and, later, from a real backend route handler if this
logic ever moves server-side.

### Orchestration mirrors the diagram's `par` fragments

`loadDashboardData()` doesn't call every service one-by-one — it groups them exactly
like the three `par` blocks in the diagram, using `Promise.all` per group:

```ts
// financialManagementService.ts (shape, not full code)
export async function loadDashboardData(query: DashboardQuery): Promise<DashboardData> {
  const [totalRevenue, totalExpenses, cashPosition, netProfit, currentRatio] = await Promise.all([
    revenueService.calculateTotalRevenue(query),
    expenseService.calculateTotalExpenses(query),
    cashBankService.fetchCashBalance(query),
    generalLedgerService.calculateNetProfit(query),
    analyticsEngineService.calculateCurrentRatio(query),
  ]); // -- [KPI Summary] --

  const [revenueExpenseTrend, cashFlowSummary, expenseDistribution] = await Promise.all([
    analyticsEngineService.generateRevenueExpenseTrend(query),
    analyticsEngineService.generateCashFlowSummary(query),
    analyticsEngineService.generateExpenseDistribution(query),
  ]); // -- [Revenue Analytics] / [Cash Flow Summary] / [Expense Distribution] --

  const [receivableAging, payableAging, recentTransactions] = await Promise.all([
    accountsReceivableService.fetchOutstandingReceivables(query),
    accountsPayableService.fetchOutstandingPayables(query),
    generalLedgerService.fetchLatestTransactions(query),
  ]); // -- [Receivable Aging] / [Payable Aging] / [Recent Transactions] --

  const financialInsights = await analyticsEngineService.calculateFinancialInsights(query); // final sequential step

  return {
    totalRevenue,
    totalExpenses,
    cashPosition,
    netProfit,
    currentRatio,
    revenueExpenseTrend,
    cashFlowSummary,
    expenseDistribution,
    receivableAging,
    payableAging,
    recentTransactions,
    financialInsights,
  };
}
```

This is worth preserving even against mock data: it documents _which calls are
independent_ so that swapping in real network calls later doesn't accidentally
serialize things that the backend team already parallelized.

## Mock → live seam

**Approach: a single `apiClient.ts` with a mock/live switch, not per-service flags.**
One switch is easier to reason about than N — you either have a backend running or you
don't, there's no realistic scenario where Revenue Service is "live" while Cash & Bank
is "mock."

```ts
// services/apiClient.ts
const USE_MOCK = import.meta.env.VITE_API_MODE !== "live"; // default: mock
const MOCK_LATENCY_MS = 150; // fake network latency so loading states are real, not instant

export async function apiRequest<T>(endpoint: string, mockResolver: () => T): Promise<T> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
    return mockResolver();
  }
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Request to ${endpoint} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
```

Every service function calls `apiRequest(endpoint, mockResolver)` where `endpoint` is
the _real_ future REST path and `mockResolver` is a closure over `mock-data.ts`:

```ts
// services/revenueService.ts
export function calculateTotalRevenue(query: DashboardQuery) {
  return apiRequest(
    `/api/financial/revenue/total?fy=${query.fiscalYear}&company=${query.companyId}`,
    () => dashKpis.totalRevenue,
  );
}
```

To go live later: implement the REST endpoint and set `VITE_API_MODE=live` in the env —
**no call-site changes** in `financialManagementService.ts` or in routes, because the
function signature and return shape never change. The mock latency also means
loading/skeleton states built against the mock today will keep working once real
network latency replaces the fake `setTimeout`.

## Data flow into the UI

`src/routes/index.tsx` calls `financialManagementService.loadDashboardData(query)`
through a single TanStack Query hook (React Query is already wired up in
`__root.tsx` via `QueryClientProvider` but currently unused — this is the intended
consumer):

```ts
const { data, isLoading } = useQuery({
  queryKey: ["dashboard", "financial-management", fiscalYear, companyId],
  queryFn: () => loadDashboardData({ fiscalYear, companyId }),
});
```

This gives caching, refetch-on-"Refresh"-click, and loading/error states for free, and
keeps the route component focused on layout — it never imports `mock-data.ts` directly
once this is wired up.

## Service naming drift across diagrams

Different modules' sequence diagrams don't always use the same label for the same
boundary — Transactions' export participant is "Reporting Engine", General Ledger's is
"Reporting Service". Same responsibility (generate a downloadable file from Database
data), so both map to `services/reportingEngineService.ts` (`generateExport()` for
Transactions, `generateLedgerExport()` for General Ledger). When a new diagram
introduces a participant whose _responsibility_ matches an existing service but the
_name_ doesn't, treat it as the same service and add a function — don't fork a
same-purpose file just because the diagram author used different words. Only create a
new file when the responsibility itself is new (like Chart of Accounts was for General
Ledger — a genuinely distinct boundary, not a rename).

## Reusing domain services across modules

When a new module's sequence diagram delegates to a service that already exists
(Accounts Receivable, Accounts Payable, General Ledger, Authentication, ...), **add a
function to the existing service file** — don't create a second file for the same
boundary. The Transactions module reused all four of these and only added genuinely new
boundaries: `transactionService.ts` (the module's primary domain service — search,
detail lookup, edit, reminders), `approvalWorkflowService.ts`, and
`reportingEngineService.ts` (document/export generation). A service being reused across
modules is expected — service boundaries are backend-shaped, not page-shaped.

When a service needs to branch by a discriminant the diagram shows as an `alt` fragment
(e.g. Transaction Service dispatching to AR/AP/GL depending on transaction type), put
the branch in the delegating service, not the UI:

```ts
// transactionService.ts
export function fetchTransactionDetails(ref: string) {
  const row = allTransactions.find((t) => t.ref === ref);
  if (row.type === "Invoice" || row.type === "Receipt") {
    return accountsReceivableService.retrieveInvoiceInformation(ref);
  }
  if (row.type === "Payment" || row.type === "Bill") {
    return accountsPayableService.retrievePaymentInformation(ref);
  }
  return generalLedgerService.retrieveJournalEntry(ref);
}
```

## Write operations (mutations)

The Dashboard module was read-only; Transactions introduced the first writes (Edit
Transaction, Send Reminder, Export, View Invoice — all defined as explicit steps in its
sequence diagram). Pattern: `useMutation` in the route, calling a service function that
still goes through `apiRequest` (so it respects the same mock/live seam), then on
success both `queryClient.invalidateQueries({ queryKey: [...] })` to refetch affected
`useQuery` data and `toast.success(...)` (sonner, mounted once in `__root.tsx`) to
confirm the action. Don't hand-update local component state to reflect a write — let the
invalidated query refetch be the source of truth, same as a real API would require.

Mock writes (`transactionService.updateTransaction`) mutate the shared mock-data array
in place inside the mock resolver, which is enough to make edits persist for the rest of
the session without a real backend — this is fine for mock mode but obviously isn't
what the live branch will do (a real `PATCH` request doesn't need this).

## Mock pagination

Search/filter/paginate endpoints (`transactionService.searchTransactions`,
`chartOfAccountsService.queryAccounts`, `accountsPayableService.retrieveInvoiceList`)
return a real `total` computed from the actual filtered mock data, not a hardcoded
headline number — even though the KPI row also shows a "Total Transactions"/"Total
Accounts"/"Open Invoices" count, that KPI is a separate, independent mock constant
(`transactionsKpisRaw.totalTransactions`, `ledgerKpisRaw.totalAccounts`,
`apKpisRaw.openInvoices`) matching the reference mockup's headline figure, decoupled
from the small mock dataset actually backing the table. Don't try to make the two
numbers match by faking the list's total — a pagination UI that promises more pages than
it can actually serve is worse than one that's honestly smaller than the mockup's
example number. This is the shared `PaginationFooter` component's contract: always pass
it a real, honest `total`.

The same headline-vs-derived split applies to sidebar summary panels, not just
pagination: Accounts Payable's Aging Summary, Top Vendors, and Payment Summary are fixed
mock constants matching the mockup exactly (`apAgingSummary`, `apTopVendors`,
`apPaymentSummary`) — same treatment as Dashboard's `expenseDistribution` or General
Ledger's `accountDistribution`. But a per-record drill-down value, like a vendor's
`outstandingBalance` in the Invoice Details dialog's Vendor Information section, _is_
derived live from `payableInvoices` (`vendorManagementService.fetchVendorInformation`)
— because that number needs to stay correct as invoices get paid during the session,
where a fixed constant would silently go stale. Rule of thumb: **fixed constant for a
summary panel that only needs to look right on load; live derivation for anything a
mutation in this session should visibly change.**

## When two mockups disagree on the same fact

The Dashboard mockup shows Net Profit = $4.32M; the General Ledger mockup shows Net
Income = $24.32M — the same accounting concept, independently generated, disagreeing by
6x. Rather than silently picking one or forcing a fake reconciliation, each module keeps
its own independent mock constant (`dashKpis.netProfit`, `ledgerKpisRaw.netIncome`) and
this file notes the discrepancy so it isn't mistaken for a bug later. If a future module
needs a _real_, cross-module-consistent net income figure, that's a deliberate call to
make then (pick a source of truth and derive from it) — don't default to "just make the
numbers match" without knowing which number the rest of the app should follow.

Same call applies to entity identity, not just numbers: Accounts Payable's mockup shows
INV-10034 / Acme Corp. as a vendor invoice (Magnertia owes Acme Corp.), while the same
reference number and company already exist in Transactions/Dashboard as an Accounts
Receivable invoice (Acme Corp. as customer, Magnertia is owed). `payableInvoices` in
`mock-data.ts` is a fully independent dataset from `allTransactions` — don't merge them
or rename one Acme Corp. to disambiguate. Different modules' mockups were generated
independently and reusing a placeholder name/number across them doesn't imply a shared
underlying record. Accounts Receivable's own mockup does this a third time
(INV-20034 / Acme Corp., a different amount again) — `receivableInvoices` is independent
from both `payableInvoices` and `allTransactions`. Expect this to keep happening as more
modules ship; it's not something to "fix" once and for all.

## Module-scoped status types, not one shared enum

Accounts Payable's `InvoiceStatus` (`Paid | Due Soon | Overdue | Canceled`) and Accounts
Receivable's `ReceivableInvoiceStatus` (`Paid | Partially Paid | Due Soon | Overdue |
Canceled | Credit Memo`) are deliberately separate types, even though they overlap
heavily and both apply to something called an "invoice." AR's mockup has states (Partially
Paid, Credit Memo) that make no sense on a payable — a bill to a vendor is never "partially
paid" as a distinct workflow state in this app's model, and there's no such thing as a
payable credit memo here. Don't widen one module's status union to cover another's
mockup; give the new module its own type, the way `TransactionStatus`, `AccountStatus`,
`InvoiceStatus`, and `ReceivableInvoiceStatus` already coexist as separate, module-scoped
enums in `services/types.ts`.

## Stub vs. build for actions with no defined flow

Not every button in a mockup has a corresponding sequence-diagram flow. Transactions'
"+ New Transaction" had no Create flow defined anywhere in its diagram, so it's a
disabled/toast stub (see that module's build notes). Accounts Payable's "+ New Invoice"
_is_ backed by an explicit diagram flow (`Create Vendor Invoice → Save Invoice → Insert
Invoice Record`), so it's fully built (`accountsPayableService.saveInvoice()`, a real
`Dialog` form, cache invalidation on success). Same goes for Record Payment and Approve
Invoice. The rule: **build what the diagram defines, stub what it doesn't** — don't
infer a plausible-looking create/edit flow from the UI alone, and don't leave a
diagram-defined flow as a stub just because an earlier module's equivalent button
happened to be one. Check each new module's diagram independently.

## Mock data must satisfy its own invariants, even when the mockup doesn't

The General Ledger mockup's own numbers don't fully reconcile (a parent account's shown
Credit YTD doesn't always equal the sum of its visible children — likely rounding or
missing rows in the source mockup). Rather than "fixing" numbers the mockup displays
(which would break pixel fidelity), `chartOfAccounts` in `mock-data.ts` reproduces every
visible mockup figure exactly, and only the accounts _not_ shown in the mockup (Equity,
Revenue, Expenses — cut off below the fold) are original, sized so that the debit and
credit sides balance exactly across the whole chart of accounts. That balance is a real
invariant a trial balance must hold; the mockup's own header-vs-children rounding is not
— know which numbers are load-bearing (must balance) versus cosmetic (must match the
pixels) before deciding whether to preserve or reconcile them.
