// Financial Management Service — shared payload types

export type DashboardQuery = {
  fiscalYear: string;
  companyId: string;
};

export type CashPosition = {
  cashBalance: number;
};

export type CurrentRatio = {
  currentRatio: number;
  currentRatioPY: number;
};

export type TrendPoint = {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
};

export type CashFlowLine = {
  label: string;
  value: number;
};

export type CashFlowSummary = {
  lines: CashFlowLine[];
  netCashFlow: number;
};

export type ExpenseSlice = {
  name: string;
  value: number;
  color: string;
};

export type AgingBucket = {
  bucket: string;
  amount: number;
  pct: number;
  color: string;
};

export type AgingReport = {
  total: number;
  buckets: AgingBucket[];
};

export type Transaction = {
  date: string;
  ref: string;
  description: string;
  amount: number;
};

export type InsightMetric = {
  label: string;
  value: string;
  deltaLabel: string;
  direction: "up" | "down";
  tone: "positive" | "negative";
};

export type FinancialInsights = {
  grossMargin: InsightMetric;
  operatingMargin: InsightMetric;
  expenseRatio: InsightMetric;
  dso: InsightMetric;
  dpo: InsightMetric;
  cashConversionCycle: InsightMetric;
};

export type DashboardData = {
  totalRevenue: number;
  totalExpenses: number;
  cashPosition: CashPosition;
  netProfit: number;
  currentRatio: CurrentRatio;
  revenueExpenseTrend: TrendPoint[];
  cashFlowSummary: CashFlowSummary;
  expenseDistribution: ExpenseSlice[];
  receivableAging: AgingReport;
  payableAging: AgingReport;
  recentTransactions: Transaction[];
  financialInsights: FinancialInsights;
};

// ---------------------------------------------------------------------------
// Transactions module
// ---------------------------------------------------------------------------

export type TransactionType = "Invoice" | "Payment" | "Journal Entry" | "Bill" | "Receipt";
export type TransactionStatus = "Posted" | "Approved" | "Pending";

// The canonical transaction record shape — mock-data.ts supplies rows shaped
// like this ("Database"); services never widen or reshape it.
export type TransactionRecord = {
  ref: string;
  date: string;
  description: string;
  type: TransactionType;
  account: string;
  amount: number;
  status: TransactionStatus;
  /** Customer (Invoice/Receipt) or vendor (Payment/Bill) name; absent for Journal Entry. */
  counterparty?: string;
  /** Absent for Journal Entry, which has no payment due date. */
  dueDate?: string;
};

export type TransactionKpiPeriod = {
  count: number;
  amount: number;
};

export type TransactionsKpis = {
  totalTransactions: number;
  totalAmount: number;
  transactionsToday: TransactionKpiPeriod;
  thisMonth: TransactionKpiPeriod;
  pendingApproval: TransactionKpiPeriod;
};

export type TransactionFilters = {
  search: string;
  type: TransactionType | "All Types";
  status: TransactionStatus | "All Statuses";
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type TransactionSearchResult = {
  rows: TransactionRecord[];
  total: number;
};

type TransactionDetailBase = {
  ref: string;
  type: TransactionType;
  date: string;
  description: string;
  account: string;
  amount: number;
  status: TransactionStatus;
};

export type InvoiceDetail = TransactionDetailBase & {
  source: "invoice";
  customer: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

export type PaymentDetail = TransactionDetailBase & {
  source: "payment";
  vendor: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

export type JournalDetail = TransactionDetailBase & {
  source: "journal";
  memo: string;
  debit: number;
  credit: number;
};

export type TransactionDetail = InvoiceDetail | PaymentDetail | JournalDetail;

export type TransactionUpdate = Partial<
  Pick<TransactionRecord, "description" | "status" | "dueDate">
>;

// ---------------------------------------------------------------------------
// General Ledger module
// ---------------------------------------------------------------------------

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
export type AccountStatus = "Active" | "Inactive";

// Canonical Chart of Accounts node shape — mock-data.ts supplies the tree
// ("Database"); services never reshape it. Net balance (debit - credit) is
// derived at render time, never stored, so it can never drift from its inputs.
export type AccountNode = {
  code: string;
  name: string;
  type: AccountType;
  group: string;
  normalBalance: "Debit" | "Credit";
  debit: number;
  credit: number;
  status: AccountStatus;
  openingBalance?: number;
  children?: AccountNode[];
};

export type LedgerKpis = {
  totalAccounts: number;
  totalDebits: number;
  totalCredits: number;
  netIncome: number;
  currentPeriod: string;
  periodStatus: "Open" | "Closed";
};

export type AccountFilters = {
  search: string;
  type: AccountType | "All Types";
  status: AccountStatus | "All Statuses";
  level: "All Levels" | "1" | "2" | "3";
};

export type AccountSummary = {
  code: string;
  name: string;
  status: AccountStatus;
  accountType: string;
  accountGroup: string;
  normalBalance: "Debit" | "Credit";
  currency: string;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  endingBalance: number;
};

export type AccountBalanceTrendPoint = {
  month: string;
  debit: number;
  credit: number;
  netBalance: number;
};

export type AccountDistributionSlice = {
  name: string;
  value: number;
  color: string;
};

export type LedgerJournalEntry = {
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export type TrialBalanceRow = {
  code: string;
  name: string;
  debit: number;
  credit: number;
};

export type TrialBalanceReport = {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
};

// ---------------------------------------------------------------------------
// General Ledger — Journal Entry & Approval Workflow (live, Postgres-backed)
// ---------------------------------------------------------------------------

export type JournalTypeValue = "Manual" | "Automatic" | "Recurring" | "Reversing";
export type JournalStatusValue = "Draft" | "Approved" | "Posted" | "Closed" | "Reversed";
export type ApprovalLevelName =
  "Accountant" | "Finance Manager" | "Financial Controller" | "CFO" | "CEO";
export type ApprovalStepStatusValue = "Pending" | "Approved" | "Rejected";

export type JournalLineInput = {
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  dimensions?: {
    costCenter?: string;
    profitCenter?: string;
    businessUnit?: string;
    project?: string;
    department?: string;
    product?: string;
    customer?: string;
    vendor?: string;
  };
};

export type ApprovalStepRecord = {
  level: ApprovalLevelName;
  approverName: string;
  status: ApprovalStepStatusValue;
  date: string | null;
};

export type CurrencyInfo = {
  transactionCurrency: string;
  baseCurrency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  foreignCurrencyGainLoss: number;
};

export type TaxInfo = {
  gstType: string;
  gstin: string;
  taxCode: string;
  taxAmount: number;
  reverseCharge: boolean;
  tds: number;
  tcs: number;
};

export type DocumentSlot = {
  status: "Attached" | "Not Attached";
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string; // base64-encoded file content, stored directly in MongoDB
  uploadedAt?: string;
};

export type SupportingDocumentsInfo = {
  journalVoucher: DocumentSlot;
  invoice: DocumentSlot;
  purchaseOrder: DocumentSlot;
  paymentVoucher: DocumentSlot;
  bankStatement: DocumentSlot;
  taxDocument: DocumentSlot;
  approvalRecord: DocumentSlot;
};

export type JournalMetadata = {
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  journalVersion: number;
  erpReferenceNumber: string;
  fiscalCalendar: string;
  auditTrail: boolean;
  digitalSignature: boolean;
  recordStatus: "Active" | "Archived";
};

export type JournalRecord = {
  id: string;
  journalNumber: string;
  voucherNumber: string | null;
  postingDate: string;
  accountingDate: string;
  fiscalYear: string;
  accountingPeriod: string;
  journalType: JournalTypeValue;
  status: JournalStatusValue;
  companyId: string | null;
  businessUnitId: string | null;
  divisionId: string | null;
  branchId: string | null;
  costCenterId: string | null;
  profitCenterId: string | null;
  projectId: string | null;
  departmentId: string | null;
  lines: JournalLineInput[];
  totalDebit: number;
  totalCredit: number;
  approvalSteps: ApprovalStepRecord[];
  createdAt: string;
  currencyInfo?: CurrencyInfo;
  taxInfo?: TaxInfo;
  supportingDocuments?: SupportingDocumentsInfo;
  metadataInfo?: JournalMetadata;
};

export type NewJournalInput = {
  voucherNumber?: string;
  postingDate: string;
  accountingDate: string;
  fiscalYear: string;
  accountingPeriod: string;
  journalType: JournalTypeValue;
  companyId?: string;
  businessUnitId?: string;
  divisionId?: string;
  branchId?: string;
  costCenterId?: string;
  profitCenterId?: string;
  projectId?: string;
  departmentId?: string;
  lines: JournalLineInput[];
  currencyInfo?: CurrencyInfo;
  taxInfo?: TaxInfo;
  supportingDocuments?: SupportingDocumentsInfo;
  metadataInfo?: JournalMetadata;
};

export type NewAccountInput = {
  code: string;
  name: string;
  parentAccountCode?: string | null;
  type: AccountType;
  group: string;
  currency: string;
  isActive: boolean;
};

// ---------------------------------------------------------------------------
// Accounts Payable module
// ---------------------------------------------------------------------------

export type InvoiceStatus = "Paid" | "Due Soon" | "Overdue" | "Canceled";

// Canonical payable invoice shape — mock-data.ts supplies rows shaped like
// this ("Database"); services never reshape it.
export type PayableInvoice = {
  invoiceNo: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  dueAmount: number;
  approved: boolean;
};

export type AccountsPayableKpis = {
  totalPayables: number;
  overdueAmount: number;
  overduePctOfTotal: number;
  dueWithin30Days: number;
  dueWithin30PctOfTotal: number;
  paidThisMonth: number;
  openInvoices: number;
};

export type InvoiceFilters = {
  search: string;
  status: InvoiceStatus | "All";
  page: number;
  pageSize: number;
};

export type InvoiceSearchResult = {
  rows: PayableInvoice[];
  total: number;
};

export type VendorProfile = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  status: "Active" | "Inactive";
};

export type TopVendor = {
  vendor: string;
  amount: number;
};

export type PaymentSummary = {
  totalPaid: number;
  averagePayment: number;
  totalPayments: number;
  discountsTaken: number;
};

export type NewInvoiceInput = {
  vendor: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
};

export type RecordPaymentInput = {
  invoiceNo: string;
  amount: number;
  paymentDate: string;
  method: string;
};

// ---------------------------------------------------------------------------
// Accounts Receivable module
// ---------------------------------------------------------------------------

// Broader than Accounts Payable's InvoiceStatus — AR has "Partially Paid"
// (part-settled invoices) and "Credit Memo" (its own record, filtered via
// the same status-driven tab bar as everything else). Deliberately its own
// type rather than widening AP's InvoiceStatus, since "Credit Memo" makes no
// sense as a payable status.
export type ReceivableInvoiceStatus =
  "Paid" | "Partially Paid" | "Due Soon" | "Overdue" | "Canceled" | "Credit Memo";

// Canonical receivable invoice shape — mock-data.ts supplies rows shaped
// like this ("Database"); services never reshape it.
export type ReceivableInvoice = {
  invoiceNo: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: ReceivableInvoiceStatus;
  dueAmount: number;
};

export type AccountsReceivableKpis = {
  totalReceivables: number;
  overdueAmount: number;
  overduePctOfTotal: number;
  dueWithin30Days: number;
  dueWithin30PctOfTotal: number;
  collectedThisMonth: number;
  openInvoices: number;
};

export type ReceivableInvoiceFilters = {
  search: string;
  status: ReceivableInvoiceStatus | "All";
  page: number;
  pageSize: number;
};

export type ReceivableInvoiceSearchResult = {
  rows: ReceivableInvoice[];
  total: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  status: "Active" | "Inactive";
};

export type TopCustomer = {
  customer: string;
  amount: number;
};

export type CollectionSummary = {
  billedAmount: number;
  collectedAmount: number;
  collectionPct: number;
  avgDaysToCollect: number;
};

export type ReceivableTrendPoint = {
  month: string;
  totalReceivables: number;
  collectedAmount: number;
};

export type NewReceivableInvoiceInput = {
  customer: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
};

export type ReceivePaymentInput = {
  invoiceNo: string;
  amount: number;
  paymentDate: string;
  method: string;
};

export type CreateCreditMemoInput = {
  customer: string;
  amount: number;
  reason: string;
};

// ---------------------------------------------------------------------------
// Cash & Bank module
// ---------------------------------------------------------------------------

export type BankAccountType = "Operating" | "Payroll" | "Collections" | "Petty Cash" | "Savings";
export type BankAccountStatus = "Active" | "Inactive";
export type ReconciliationStatus = "Reconciled" | "Partially Reconciled" | "Not Reconciled";

export type BankAccount = {
  id: string;
  name: string;
  bankName: string;
  type: BankAccountType;
  accountNo: string;
  currency: string;
  currentBalance: number;
  status: BankAccountStatus;
  reconciliationStatus: ReconciliationStatus;
  unreconciledAmount: number;
};

export type BankAccountFilters = {
  search: string;
  type: "All Types" | BankAccountType;
  status: "All Statuses" | BankAccountStatus;
  currency: "All Currency" | string;
};

export type CashTransactionType = "Inflow" | "Outflow";
export type CashTransactionStatus = "Posted" | "Cleared" | "Pending";

export type CashTransaction = {
  id: string;
  date: string;
  description: string;
  type: CashTransactionType;
  amount: number;
  bankAccountNo: string;
  reference: string;
  category: string;
  status: CashTransactionStatus;
};

export type CashReconciliationRecord = {
  id: string;
  accountNo: string;
  statementDate: string;
  statementBalance: number;
  ledgerBalance: number;
  unreconciledAmount: number;
  status: ReconciliationStatus;
  lastReconciledAt?: string;
};

export type ChequeStatus = "Cleared" | "Pending" | "Void";

export type ChequeRecord = {
  id: string;
  chequeNo: string;
  issueDate: string;
  payee: string;
  amount: number;
  bankAccountNo: string;
  status: ChequeStatus;
};

export type DepositStatus = "Cleared" | "Pending" | "Rejected";

export type DepositRecord = {
  id: string;
  depositNo: string;
  depositDate: string;
  source: string;
  amount: number;
  bankAccountNo: string;
  status: DepositStatus;
};

export type CashBankKpiDetail = {
  value: number;
  deltaPct: number;
  direction: "up" | "down";
  label: string;
};

export type CashBankKpis = {
  totalCashBalance: CashBankKpiDetail;
  operatingCash: CashBankKpiDetail;
  cashInflowMtd: CashBankKpiDetail;
  cashOutflowMtd: CashBankKpiDetail;
  netCashFlowMtd: CashBankKpiDetail;
};

export type CashPositionTrendPoint = {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
};

export type BankReconciliationSummary = {
  reconciledCount: number;
  partiallyReconciledCount: number;
  notReconciledCount: number;
  totalAccounts: number;
};

export type AccountSummaryStats = {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  totalBalanceUsd: number;
  totalBalanceBaseCurrency: number;
  unreconciledAmount: number;
};

export type CashBankDashboardData = {
  kpis: CashBankKpis;
  bankAccounts: BankAccount[];
  accountSummary: AccountSummaryStats;
  cashPositionTrend: CashPositionTrendPoint[];
  reconciliationSummary: BankReconciliationSummary;
};

export type NewBankAccountInput = {
  name: string;
  bankName: string;
  type: BankAccountType;
  accountNo: string;
  currency: string;
  initialBalance: number;
};

export type NewCashTransactionInput = {
  date: string;
  description: string;
  type: CashTransactionType;
  amount: number;
  bankAccountNo: string;
  category: string;
  reference: string;
};

// ---------------------------------------------------------------------------
// Fixed Assets module
// ---------------------------------------------------------------------------

export type FixedAssetCategory =
  "Building" | "Machinery" | "IT Equipment" | "Vehicles" | "Furniture" | "Others";

export type FixedAssetStatus = "Active" | "Maintenance" | "Fully Depreciated" | "Disposed";

export type FixedAsset = {
  id: string;
  assetCode: string;
  name: string;
  category: FixedAssetCategory;
  location: string;
  purchaseDate: string;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: FixedAssetStatus;
};

export type FixedAssetFilters = {
  search: string;
  category: "All Categories" | FixedAssetCategory;
  status: "All Statuses" | FixedAssetStatus;
  location: "All Locations" | string;
};

export type DepreciationRun = {
  id: string;
  date: string;
  period: string;
  assetsCount: number;
  totalDepreciation: number;
  method: string;
  status: "Posted" | "Draft";
  executedBy: string;
};

export type AssetCategoryCount = {
  name: string;
  count: number;
  percentage: number;
  cost: number;
  color: string;
};

export type FixedAssetKpis = {
  totalAssets: number;
  grossBookValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  assetsAddedThisYear: number;
};

export type FixedAssetSummaryStats = {
  fullyDepreciatedCount: number;
  fullyDepreciatedPct: number;
  maintenanceCount: number;
  maintenancePct: number;
  inUseCount: number;
  inUsePct: number;
  disposedCount: number;
  disposedNetBookValue: number;
};

export type FixedAssetDashboardData = {
  kpis: FixedAssetKpis;
  assets: FixedAsset[];
  categoryDistribution: AssetCategoryCount[];
  depreciationTrend: { month: string; depreciation: number }[];
  topAssets: { name: string; netBookValue: number }[];
  summaryStats: FixedAssetSummaryStats;
};

export type NewFixedAssetInput = {
  name: string;
  category: FixedAssetCategory;
  location: string;
  purchaseDate: string;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: string;
};

export type AssetDisposalInput = {
  assetCode: string;
  disposalDate: string;
  saleProceeds: number;
  disposalReason: string;
};

export type AssetTransferInput = {
  assetCode: string;
  transferDate: string;
  destinationLocation: string;
  authorizedBy: string;
};

export type AssetRevaluationInput = {
  assetCode: string;
  revaluationDate: string;
  newMarketValue: number;
  reason: string;
};

export type AssetCategoryRecord = {
  id: string;
  name: string;
  description: string;
  depMethod: string;
  usefulLife: number;
  assetAccount: string;
  depAccount: string;
};

export type AssetDisposalRecord = {
  id: string;
  assetCode: string;
  name: string;
  disposalDate: string;
  cost: number;
  accumulatedDepreciation: number;
  proceeds: number;
  gainLoss: number;
  status: string;
};

export type AssetRevaluationRecord = {
  id: string;
  assetCode: string;
  name: string;
  date: string;
  oldNBV: number;
  newNBV: number;
  adjustment: number;
  reason: string;
};

export type AssetTransferRecord = {
  id: string;
  assetCode: string;
  name: string;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  authorizedBy: string;
};

// ---------------------------------------------------------------------------
// Budgeting module
// ---------------------------------------------------------------------------

export type DepartmentBudget = {
  id: string;
  department: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  utilization: number;
};

export type CostCenterBudget = {
  id: string;
  costCenter: string;
  code: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  utilization: number;
};

export type ProjectBudget = {
  id: string;
  project: string;
  manager: string;
  budget: number;
  actual: number;
  variance: number;
  utilization: number;
  status: "On Track" | "At Risk" | "Over Budget";
};

export type BudgetVersion = {
  id: string;
  name: string;
  type: "Original" | "Revision" | "Forecast";
  status: "Active" | "Draft" | "Archived";
  totalBudget: number;
  createdBy: string;
  lastUpdated: string;
};

export type BudgetKpis = {
  totalBudget: number;
  totalActual: number;
  budgetUtilization: number;
  variance: number;
  activeBudgetsCount: number;
};

export type BudgetHealthSummary = {
  onTrackCount: number;
  onTrackPct: number;
  atRiskCount: number;
  atRiskPct: number;
  overBudgetCount: number;
  overBudgetPct: number;
};

export type BudgetDashboardData = {
  kpis: BudgetKpis;
  departments: DepartmentBudget[];
  costCenters: CostCenterBudget[];
  projects: ProjectBudget[];
  versions: BudgetVersion[];
  trend: { month: string; budget: number; actual: number; forecast: number }[];
  varianceByDept: { name: string; variance: number }[];
  health: BudgetHealthSummary;
};

export type NewBudgetInput = {
  name: string;
  totalBudget: number;
  type: BudgetVersion["type"];
  status: BudgetVersion["status"];
  createdBy: string;
};

export type NewBudgetVersionInput = {
  parentVersionId: string;
  name: string;
  type: BudgetVersion["type"];
  totalBudget: number;
  createdBy: string;
};

export type BudgetComparisonReport = {
  version1: BudgetVersion;
  version2: BudgetVersion;
  totalDifference: number;
  differencePct: number;
  departmentDifferences: {
    department: string;
    v1Amount: number;
    v2Amount: number;
    difference: number;
  }[];
};

// ---------------------------------------------------------------------------
// Financial Reporting module
// ---------------------------------------------------------------------------

export type ReportCategory =
  | "Financial Statements"
  | "Management Reports"
  | "Cash Flow Reports"
  | "Budget Reports"
  | "Tax Reports"
  | "Custom Reports";

export type ReportRecord = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: "Standard" | "Custom";
  lastModified: string;
  lastModifiedBy: string;
  isFavorite: boolean;
};

export type ReportFilters = {
  search: string;
  category: "All Reports" | ReportCategory;
  type: "All" | "Standard" | "Custom";
  dateRange: string;
  fromDate: string;
  toDate: string;
  companyId: string;
};

export type ReportScheduleRecord = {
  id: string;
  reportId: string;
  reportName: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  format: "PDF" | "XLSX" | "CSV";
  recipients: string;
  status: "Active" | "Paused";
  nextRun: string;
};

export type ReportShareRecord = {
  id: string;
  reportId: string;
  reportName: string;
  sharedWith: string;
  dateShared: string;
  accessLevel: "View" | "Edit";
};

export type RecentReportActivity = {
  id: string;
  reportName: string;
  activity: string;
  performedBy: string;
  timestamp: string;
};

export type FinancialPerformancePoint = {
  month: string;
  revenue: number;
  grossProfit: number;
  netIncome: number;
};

export type ReportCategoryCount = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type FinancialReportingKpis = {
  totalRevenue: number;
  totalRevenueDelta: number;
  grossProfit: number;
  grossProfitDelta: number;
  netIncome: number;
  netIncomeDelta: number;
  totalAssets: number;
  totalAssetsDelta: number;
  totalLiabilities: number;
  totalLiabilitiesDelta: number;
};

export type FinancialReportingDashboardData = {
  kpis: FinancialReportingKpis;
  reports: ReportRecord[];
  trend: FinancialPerformancePoint[];
  categoryDistribution: ReportCategoryCount[];
  activities: RecentReportActivity[];
  scheduled: ReportScheduleRecord[];
  shared: ReportShareRecord[];
};

export type NewReportInput = {
  name: string;
  description: string;
  category: ReportCategory;
  type: "Standard" | "Custom";
  templateId?: string;
};

export type NewReportScheduleInput = {
  reportId: string;
  frequency: ReportScheduleRecord["frequency"];
  format: ReportScheduleRecord["format"];
  recipients: string;
};

export type NewReportShareInput = {
  reportId: string;
  sharedWith: string;
  accessLevel: ReportShareRecord["accessLevel"];
  message?: string;
};

// ---------------------------------------------------------------------------
// Tax Management module
// ---------------------------------------------------------------------------

export type TaxObligation = {
  id: string;
  taxType: string;
  jurisdiction: string;
  period: string;
  dueDate: string;
  taxLiability: number;
  paid: number;
  payable: number;
  status: "Paid" | "Partially Paid" | "Due Soon" | "Pending";
};

export type TaxFiling = {
  id: string;
  taxType: string;
  period: string;
  filingDate: string;
  filedBy: string;
  returnAmount: number;
  acknowledgementNo: string;
  status: "Filed" | "Draft" | "Rejected";
};

export type TaxPayment = {
  id: string;
  taxType: string;
  period: string;
  paymentDate: string;
  bankAccount: string;
  amount: number;
  transactionRef: string;
  status: "Cleared" | "Processing";
};

export type TaxAuthority = {
  id: string;
  name: string;
  jurisdiction: string;
  taxType: string;
  portalUrl: string;
  contactPerson: string;
  email: string;
};

export type TaxReconciliation = {
  id: string;
  taxType: string;
  period: string;
  returnsLiability: number;
  booksLiability: number;
  difference: number;
  status: "Reconciled" | "Mismatched";
};

export type TaxFilters = {
  search: string;
  taxType: string;
  status: string;
  dueDate: string;
};

export type ComplianceSummary = {
  rate: number;
  onTrackCount: number;
  dueSoonCount: number;
  overdueCount: number;
};

export type TaxKpis = {
  totalTaxLiability: number;
  totalTaxLiabilityDelta: number;
  totalTaxPaid: number;
  totalTaxPaidDelta: number;
  taxPayable: number;
  upcomingFilings: number;
  complianceStatus: number;
};

export type TaxDashboardData = {
  kpis: TaxKpis;
  obligations: TaxObligation[];
  trend: { month: string; liability: number; paid: number }[];
  typeDistribution: { name: string; value: number; percentage: number; color: string }[];
  upcomingFilingsList: { name: string; period: string; dueDate: string; daysLeft: number }[];
  compliance: ComplianceSummary;
  filings: TaxFiling[];
  payments: TaxPayment[];
  authorities: TaxAuthority[];
  reconciliations: TaxReconciliation[];
};

export type NewFilingInput = {
  taxType: string;
  period: string;
  returnAmount: number;
  filedBy: string;
};

export type NewTaxPaymentInput = {
  taxType: string;
  period: string;
  bankAccount: string;
  amount: number;
  transactionRef: string;
};

// ---------------------------------------------------------------------------
// Cost Center module
// ---------------------------------------------------------------------------

export type CostCenterRecord = {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  actual: number;
  variance: number;
  utilization: number;
  status: "Active" | "Inactive";
  type: "Operational" | "Support" | "Administrative" | "Revenue-Generating";
  parentId?: string;
};

export type NewCostCenterInput = {
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  type: "Operational" | "Support" | "Administrative" | "Revenue-Generating";
  parentId?: string;
};

export type NewSubCostCenterInput = {
  parentId: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
};

export type CostCenterVarianceRecord = {
  costCenter: string;
  variance: number;
  percentage: number;
};

export type CostCenterKpis = {
  totalCostCenters: number;
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  budgetUtilization: number;
};

export type CostCenterHierarchyNode = {
  name: string;
  children?: CostCenterHierarchyNode[];
};

export type CostCenterDashboardData = {
  kpis: CostCenterKpis;
  costCenters: CostCenterRecord[];
  trend: { month: string; budget: number; actual: number; forecast: number }[];
  departmentSplits: { name: string; value: number; percentage: number; color: string }[];
  topVariances: CostCenterVarianceRecord[];
  hierarchy: CostCenterHierarchyNode;
  summary: {
    totalBudget: number;
    totalActual: number;
    totalCommitments: number;
    totalForecast: number;
    budgetUtilization: number;
  };
};

// ---------------------------------------------------------------------------
// Profitability Analysis module
// ---------------------------------------------------------------------------

export type ProfitabilityRecord = {
  code: string;
  name: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
};

export type ProfitabilityTrendPoint = {
  month: string;
  netProfit: number;
  netMargin: number;
};

export type RegionalProfitabilityPoint = {
  region: string;
  netMargin: number;
};

export type SalesChannelProfitabilityPoint = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type TopPerformer = {
  rank: number;
  name: string;
  netMargin: number;
  netProfit: number;
};

export type CostAllocationRule = {
  id: string;
  costCenter: string;
  allocationKey: "Headcount" | "Square Footage" | "Direct Revenue" | "Direct Expense";
  weight: number;
};

export type ProfitabilityDashboardData = {
  kpis: {
    revenueYTD: number;
    revenueYTDDelta: number;
    grossProfitYTD: number;
    grossProfitYTDDelta: number;
    grossMarginYTD: number;
    grossMarginYTDDelta: number;
    netProfitYTD: number;
    netProfitYTDDelta: number;
    netMarginYTD: number;
    netMarginYTDDelta: number;
  };
  dimensionData: ProfitabilityRecord[];
  trend: ProfitabilityTrendPoint[];
  regional: RegionalProfitabilityPoint[];
  salesChannels: SalesChannelProfitabilityPoint[];
  topPerformers: TopPerformer[];
  summary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    netMargin: number;
  };
  allocationRules: CostAllocationRule[];
};

// ---------------------------------------------------------------------------
// Consolidation module
// ---------------------------------------------------------------------------

export type ConsolidationRecord = {
  code: string;
  name: string;
  revenue: number;
  expenses: number;
  operatingProfit: number;
  netProfit: number;
  netMargin: number | null;
  status: "Consolidated" | "Included" | "Eliminated" | "Pending";
  isEliminationAdjustment?: boolean;
};

export type IntercompanyTransaction = {
  fromEntity: string;
  toEntity: string;
  amount: number;
  matched: boolean;
  ref: string;
  date: string;
};

export type ConsolidationTimelineMilestone = {
  name: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
};

export type ConsolidationProgressSummary = {
  dataCollected: string;
  intercompanyMatching: string;
  eliminations: string;
  consolidation: string;
  percentage: number;
};

export type AccountMappingRecord = {
  id: string;
  sourceAccount: string;
  targetAccount: string;
  entity: string;
};

export type EntityValidationResult = {
  id: string;
  checkName: string;
  status: "Passed" | "Warning" | "Failed";
  message: string;
};

export type ConsolidationDashboardData = {
  kpis: {
    totalEntities: number;
    consolidatedRevenueYTD: number;
    consolidatedRevenueYTDDelta: number;
    consolidatedNetProfitYTD: number;
    consolidatedNetProfitYTDDelta: number;
    eliminationEntriesYTD: number;
    eliminationEntriesCount: number;
    status: string;
  };
  summaryData: ConsolidationRecord[];
  progress: ConsolidationProgressSummary;
  timeline: ConsolidationTimelineMilestone[];
  intercompanyTrend: { month: string; value: number }[];
  topIntercompany: IntercompanyTransaction[];
  profitTrend: { month: string; netProfit: number; netMargin: number }[];
  mappings: AccountMappingRecord[];
  validations: EntityValidationResult[];
};

// ---------------------------------------------------------------------------
// Audit Trail module
// ---------------------------------------------------------------------------

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  activityType: "Create" | "Update" | "Delete" | "Approve" | "Run" | "Login" | "Logout" | "Export";
  description: string;
  referenceId: string;
  status: "Success" | "Failed" | "Warning";
  ipAddress: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, string | undefined>;
  };
};

export type SensitiveChangeRecord = {
  id: string;
  changeType: string;
  referenceId: string;
  timestamp: string;
  user: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
};

export type SecurityEventEntry = {
  id: string;
  eventName: string;
  user: string;
  timestamp: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Blocked" | "Flagged" | "Resolved";
  ipAddress: string;
};

export type ConfigurationLogEntry = {
  id: string;
  parameter: string;
  beforeValue: string;
  afterValue: string;
  user: string;
  timestamp: string;
};

export type AuditDashboardData = {
  kpis: {
    totalActivitiesYTD: number;
    totalActivitiesYTDDelta: number;
    uniqueUsersCount: number;
    uniqueUsersDelta: number;
    successfulActivitiesCount: number;
    successfulActivitiesDelta: number;
    failedActivitiesCount: number;
    failedActivitiesDelta: number;
    sensitiveChangesCount: number;
    sensitiveChangesDelta: number;
  };
  logs: AuditLogEntry[];
  activityTrend: { month: string; value: number }[];
  moduleSplits: { name: string; value: number; percentage: number; color: string }[];
  sensitiveChanges: SensitiveChangeRecord[];
  securityEvents: SecurityEventEntry[];
  configLogs: ConfigurationLogEntry[];
};

// ---------------------------------------------------------------------------
// Administration module (Company, Branch, Department, Role, User)
// ---------------------------------------------------------------------------

export type CompanyRecord = {
  id: string;
  code: string;
  name: string;
  taxId: string;
  status: "Active" | "Inactive";
  branchCount: number;
  createdDate: string;
};

export type NewCompanyInput = {
  code: string;
  name: string;
  taxId: string;
};

export type BranchRecord = {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName: string;
  city: string;
  status: "Active" | "Inactive";
  departmentCount: number;
};

export type NewBranchInput = {
  code: string;
  name: string;
  companyId: string;
  city: string;
};

export type DepartmentRecord = {
  id: string;
  code: string;
  name: string;
  companyId: string;
  branchId: string;
  branchName: string;
  head: string;
  employeeCount: number;
  status: "Active" | "Inactive";
};

export type NewDepartmentInput = {
  code: string;
  name: string;
  branchId: string;
  head: string;
};

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
  usersAssignedCount: number;
  status: "Active" | "Inactive";
};

export type NewRoleInput = {
  name: string;
  description: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  branchName: string;
  department: string;
  role: string;
  status: "Active" | "Inactive" | "Locked";
  lastLogin: string;
};

export type NewUserInput = {
  name: string;
  email: string;
  department: string;
  role: string;
};

export type LoginHistoryEntry = {
  id: string;
  user: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: "Success" | "Failed";
};

export type AdminHomeDashboardData = {
  kpis: {
    activeUsersCount: number;
    branchCount: number;
    loginsToday: number;
  };
  companies: CompanyRecord[];
  recentLogins: LoginHistoryEntry[];
  activityTrend: { date: string; logins: number }[];
  usersByDepartment: { name: string; value: number; color: string }[];
  userStatusSummary: { activeCount: number; inactiveCount: number };
};

// ---------------------------------------------------------------------------
// Regulatory Compliance Management module
// ---------------------------------------------------------------------------

export type ComplianceStatus = "Compliant" | "Non-Compliant" | "Pending Review" | "Overdue";

export type ComplianceRecord = {
  id: string;
  regulationName: string;
  framework: string;
  owner: string;
  status: ComplianceStatus;
  dueDate: string;
  lastReviewed: string;
};

export type NewComplianceRecordInput = {
  regulationName: string;
  framework: string;
  owner: string;
  dueDate: string;
};

export type ChecklistItem = {
  id: string;
  regulationName: string;
  framework: string;
  checklistItem: string;
  completed: boolean;
  verifiedBy: string;
  verifiedDate: string;
};

export type RegulatoryDocument = {
  id: string;
  regulationName: string;
  documentName: string;
  uploadedBy: string;
  uploadDate: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
};

export type ComplianceDashboardData = {
  kpis: {
    complianceScore: number;
  };
  records: ComplianceRecord[];
  recentDocuments: RegulatoryDocument[];
  scoreTrend: { month: string; score: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  frameworkBreakdown: { name: string; value: number; color: string }[];
};

// ---------------------------------------------------------------------------
// Manufacturing (MRP) module
// ---------------------------------------------------------------------------

export type BomStatus = "Draft" | "Active" | "Obsolete";

export type BomRecord = {
  id: string;
  productName: string;
  productCode: string;
  version: string;
  componentCount: number;
  status: BomStatus;
  lastUpdated: string;
};

export type NewBomInput = {
  productName: string;
  productCode: string;
  version: string;
};

export type RoutingRecord = {
  id: string;
  productName: string;
  productCode: string;
  workCenter: string;
  sequence: number;
  operationName: string;
  standardTimeMins: number;
  status: "Active" | "Inactive";
};

export type NewRoutingInput = {
  productName: string;
  productCode: string;
  workCenter: string;
  operationName: string;
  standardTimeMins: number;
};

export type WorkOrderStatus = "Planned" | "In Progress" | "Completed" | "On Hold";
export type QcStatus = "Passed" | "Failed" | "Pending";

export type WorkOrderRecord = {
  id: string;
  workOrderNo: string;
  productName: string;
  productCode: string;
  quantity: number;
  workCenter: string;
  startDate: string;
  dueDate: string;
  status: WorkOrderStatus;
  qcStatus: QcStatus;
};

export type NewWorkOrderInput = {
  productName: string;
  productCode: string;
  quantity: number;
  workCenter: string;
  dueDate: string;
};

export type QcInspectionEntry = {
  id: string;
  workOrderNo: string;
  productName: string;
  inspector: string;
  inspectionDate: string;
  qcStatus: QcStatus;
  notes: string;
};

export type ManufacturingDashboardData = {
  kpis: {
    onTimeProductionPct: number;
  };
  bomRecords: BomRecord[];
  workOrders: WorkOrderRecord[];
  recentQcInspections: QcInspectionEntry[];
  productionTrend: { date: string; unitsProduced: number }[];
  workOrdersByStatus: { name: string; value: number; color: string }[];
  qcPassRateSummary: { passedCount: number; failedCount: number; pendingCount: number };
};

// ---------------------------------------------------------------------------
// CRM module
// ---------------------------------------------------------------------------

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
// Lightweight reference field only (not a ticket/case system) — see the
// module's "Customer Support" note. "None" = no support involvement.
export type SupportStatus = "None" | "Open" | "Resolved";

export type LeadRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  assignedTo: string;
  createdDate: string;
  supportStatus: SupportStatus;
};

export type NewLeadInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
};

export type OpportunityStage =
  "Prospecting" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";

export type OpportunityRecord = {
  id: string;
  name: string;
  accountName: string;
  contactName: string;
  stage: OpportunityStage;
  value: number;
  assignedTo: string;
  closeDate: string;
  supportStatus: SupportStatus;
};

export type NewOpportunityInput = {
  name: string;
  accountName: string;
  contactName: string;
  value: number;
  closeDate: string;
};

export type CrmDashboardData = {
  kpis: {
    totalLeads: number;
    totalContacts: number;
    totalOpportunities: number;
    wonDeals: number;
  };
  leads: LeadRecord[];
  opportunities: OpportunityRecord[];
  conversionRateTrend: { month: string; rate: number }[];
  opportunitiesByStage: { name: string; value: number; color: string }[];
  leadStatusBreakdown: { name: string; value: number; color: string }[];
};

// ---------------------------------------------------------------------------
// Government Scheme Management module
// ---------------------------------------------------------------------------

export type SchemeStatus = "Active" | "Inactive" | "Expired";

export type SchemeRecord = {
  id: string;
  name: string;
  department: string;
  grantAmountRange: string;
  eligibilityCriteria: string;
  applicationDeadline: string;
  status: SchemeStatus;
};

export type NewSchemeInput = {
  name: string;
  department: string;
  grantAmountRange: string;
  eligibilityCriteria: string;
  applicationDeadline: string;
};

export type ApplicationStage =
  "Scheme Search" | "Eligibility" | "DPR" | "Approval" | "Submission" | "Monitoring";

export type ApplicationRecord = {
  id: string;
  applicationNo: string;
  schemeName: string;
  department: string;
  grantAmount: number;
  stage: ApplicationStage;
  assignedTo: string;
  submittedDate: string;
  lastUpdated: string;
};

export type NewApplicationInput = {
  schemeName: string;
  department: string;
  grantAmount: number;
  assignedTo: string;
};

export type GovSchemeDashboardData = {
  kpis: {
    totalApplied: number;
    approved: number;
    pending: number;
  };
  schemes: SchemeRecord[];
  applications: ApplicationRecord[];
  grantsAppliedTrend: { month: string; count: number }[];
  applicationsByScheme: { name: string; value: number; color: string }[];
  applicationsByStage: { name: string; value: number; color: string }[];
};

// ---------------------------------------------------------------------------
// Legal Firms Management module
// ---------------------------------------------------------------------------

export type LegalCaseStage =
  "Requirement" | "Assign Law Firm" | "Opinion" | "Documentation" | "Closure";

export type LegalFirmRecord = {
  id: string;
  name: string;
  primaryPracticeArea: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  rating: number;
  casesCount: number;
  totalSpend: number;
};

export type LegalCaseRecord = {
  id: string;
  caseNo: string;
  title: string;
  description: string;
  stage: LegalCaseStage;
  priority: "High" | "Medium" | "Low";
  assignedFirmId?: string;
  assignedFirmName?: string;
  department: string;
  filedDate: string;
  closedDate?: string;
  spendAmount: number;
  lastUpdated: string;
  status: "Active" | "Closed" | "Pending";
};

export type LegalCaseHistoryRecord = {
  id: string;
  caseId: string;
  caseNo: string;
  caseTitle: string;
  action: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
};

export type NewLegalCaseInput = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  assignedFirmId?: string;
  department: string;
};

export type NewLegalFirmInput = {
  name: string;
  primaryPracticeArea: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type LegalFirmDashboardData = {
  kpis: {
    totalCases: number;
    activeCases: number;
    underOpinion: number;
    inDocumentation: number;
    closedCases: number;
  };
  cases: LegalCaseRecord[];
  firms: LegalFirmRecord[];
  history: LegalCaseHistoryRecord[];
  casesTrend: { month: string; count: number }[];
  casesByStage: { name: string; value: number; color: string }[];
  firmAllocation: { name: string; value: number; color: string }[];
};

/* ===========================================================================
   Idea Management (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   Data model for the innovation pipeline. AI Evaluation (Section 13) is
   intentionally excluded here — no AI score/recommendation fields exist on any
   type below, and the workflow skips the AI Preliminary Evaluation step.
   All scores below are CALCULATED from the manually-entered ratings.
   =========================================================================== */

/** Workflow stage = the idea's current status. Real transitions are recorded
 *  in `IdeaRecord.workflow`, not just this label. */
export type IdeaStatus =
  | "Draft"
  | "Submitted"
  | "Initial Screening"
  | "Technical Review"
  | "Business Review"
  | "Patentability Review"
  | "Innovation Committee Review"
  | "Approved"
  | "Revision Required"
  | "On Hold"
  | "Rejected"
  | "Archived"
  | "Converted to Feasibility Study";

/** The reviewer roles that act at each review stage (simulated — no real RBAC
 *  engine yet). "Employee" and "System" are non-reviewer actors. */
export type IdeaReviewerRole =
  | "Department Manager"
  | "Technical Reviewer"
  | "Business Reviewer"
  | "IP & Patent Team"
  | "Innovation Committee";

export type IdeaActorRole = IdeaReviewerRole | "Employee" | "System";

export type IdeaPriority = "Low" | "Medium" | "High" | "Critical";

/** Decision a reviewer can record at their stage. */
export type IdeaDecision =
  | "Pending"
  | "Forwarded"
  | "Returned for Correction"
  | "Approved"
  | "Revision Required"
  | "On Hold"
  | "Rejected";

/** One real state-change record (IDEA_WORKFLOW). */
export interface IdeaWorkflowEntry {
  fromStatus: IdeaStatus | null;
  toStatus: IdeaStatus;
  action: string;
  actorRole: IdeaActorRole;
  actorName: string;
  comment?: string;
  at: string;
}

/** One reviewer decision at a review stage (IDEA_APPROVALS). */
export interface IdeaApproval {
  stage: IdeaStatus;
  role: IdeaReviewerRole;
  decision: IdeaDecision;
  reviewer: string;
  date: string | null;
  comment?: string;
}

/** Activity / comments feed (IDEA_HISTORY). */
export interface IdeaHistoryEntry {
  at: string;
  actor: string;
  actorRole: IdeaActorRole;
  action: string;
  detail?: string;
}

/** Automatic ERP activity record (IDEA_AUDIT_LOG). */
export interface IdeaAuditEntry {
  at: string;
  actor: string;
  event: string;
}

/** File metadata only for now — mock URL, no real cloud storage (IDEA_ATTACHMENTS). */
export type IdeaAttachmentCategory =
  | "Sketches"
  | "Drawings"
  | "Images"
  | "CAD Files"
  | "Documents"
  | "Research Papers"
  | "Patent Documents"
  | "Videos"
  | "Presentations";

export interface IdeaAttachment {
  id: string;
  category: IdeaAttachmentCategory;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** Section 1 — Basic Information (IDEA_MASTER core). */
export interface IdeaBasic {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  subCategory: string;
  businessUnit: string;
  department: string;
  productLine: string;
  project: string;
  strategicInitiative: string;
  innovationTheme: string;
  teamMembers: string[];
}

/** Section 2 — Idea Classification (IDEA_CATEGORY). */
export interface IdeaClassification {
  innovationType: string;
  innovationLevel: string;
  technologyArea: string[];
  industry: string;
  applicationArea: string;
  marketSegment: string;
  customerType: string;
  productCategory: string;
  internalExternal: string;
  openInnovation: boolean;
}

/** Section 3 — Problem Statement. */
export interface IdeaProblem {
  existingProblem: string;
  currentSolution: string;
  painPoints: string;
  rootCause: string;
  opportunityDescription: string;
  customerNeed: string;
  evidenceAvailable: boolean;
}

/** Section 4 — Proposed Solution. */
export interface IdeaSolution {
  proposedSolution: string;
  uniqueValueProposition: string;
  keyFeatures: string;
  technologyUsed: string[];
  noveltyDescription: string;
  competitiveAdvantage: string;
  expectedBenefits: string;
}

/** Section 5 — Innovation Assessment (ratings 1–10). */
export interface IdeaInnovation {
  technicalNovelty: number;
  businessValue: number;
  customerValue: number;
  strategicAlignment: number;
  scalability: number;
  sustainability: number;
  complexity: number;
  riskLevel: number;
}

/** Section 6 — Business Impact. */
export interface IdeaBusinessImpact {
  expectedRevenue: number;
  costSaving: number;
  timeSaving: number;
  productivityImprovement: number;
  qualityImprovement: number;
  customerSatisfactionImpact: number;
  marketExpansionPotential: number;
  competitiveDifferentiation: number;
}

/** Section 7 — Technical Feasibility. */
export interface IdeaTechnical {
  technologyReadinessLevel: string;
  technologyAvailability: string;
  requiredRnD: boolean;
  prototypeRequired: boolean;
  estimatedDevelopmentTime: number;
  estimatedDevelopmentCost: number;
  requiredResources: string;
  requiredSkills: string;
}

/** Section 8 — Intellectual Property. Workflow-driven fields (patentSearchStatus,
 *  ipRisk, patentRecommendation) are filled by the IP & Patent Team at review. */
export interface IdeaIP {
  patentable: boolean;
  patentSearchCompleted: boolean;
  existingPatentReferences: string[];
  tradeSecret: boolean;
  copyrightApplicable: boolean;
  trademarkApplicable: boolean;
  ipComments: string;
  patentSearchStatus: string | null;
  ipRisk: string | null;
  patentRecommendation: string | null;
}

/** Section 9 — Market Opportunity. */
export interface IdeaMarket {
  targetMarket: string;
  marketSize: number;
  tam: number;
  sam: number;
  som: number;
  marketGrowthRate: number;
  customerDemand: number;
  competitorAvailability: string;
  marketReadiness: number;
}

/** Section 10 — Risk Assessment (ratings 1–10). */
export interface IdeaRisk {
  technicalRisk: number;
  financialRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
  operationalRisk: number;
  supplyChainRisk: number;
}

/** Section 11 — ESG Assessment (ratings 1–10). */
export interface IdeaESG {
  environmentalImpact: number;
  energyEfficiency: number;
  carbonReduction: number;
  wasteReduction: number;
  socialImpact: number;
  governanceImpact: number;
}

/** Section 12 — Financial Estimation. Manual inputs + calculated outputs. */
export interface IdeaFinancials {
  estimatedInvestment: number;
  fundingRequired: number;
  // Calculated (C):
  expectedROI: number;
  paybackPeriod: number;
  estimatedProfitMargin: number;
  estimatedBreakEven: number;
}

/** ERP Calculations (IDEA_SCORES). All derived from manual ratings — 0..100. */
export interface IdeaScores {
  overallInnovationScore: number;
  technicalFeasibilityScore: number;
  businessFeasibilityScore: number;
  marketOpportunityScore: number;
  riskScore: number;
  esgScore: number;
  overallEvaluationScore: number;
  ideaRanking: string;
}

/** The editable (M) payload the wizard submits. A/C/W fields are server-owned. */
export interface IdeaFormInput {
  basic: IdeaBasic;
  classification: IdeaClassification;
  problem: IdeaProblem;
  solution: IdeaSolution;
  innovation: IdeaInnovation;
  businessImpact: IdeaBusinessImpact;
  technical: IdeaTechnical;
  ip: Omit<IdeaIP, "patentSearchStatus" | "ipRisk" | "patentRecommendation">;
  market: IdeaMarket;
  risk: IdeaRisk;
  esg: IdeaESG;
  financials: Pick<IdeaFinancials, "estimatedInvestment" | "fundingRequired">;
  attachments: IdeaAttachment[];
}

/** The full persisted idea document. */
export interface IdeaRecord {
  id: string;
  ideaCode: string; // A — e.g. IDEA-00001
  status: IdeaStatus; // W
  priority: IdeaPriority; // W
  version: number; // A
  submittedBy: string; // I (logged-in employee)
  dateSubmitted: string | null; // A — set on Submit
  createdAt: string; // A
  updatedAt: string; // A

  basic: IdeaBasic;
  classification: IdeaClassification;
  problem: IdeaProblem;
  solution: IdeaSolution;
  innovation: IdeaInnovation;
  businessImpact: IdeaBusinessImpact;
  technical: IdeaTechnical;
  ip: IdeaIP;
  market: IdeaMarket;
  risk: IdeaRisk;
  esg: IdeaESG;
  financials: IdeaFinancials;
  scores: IdeaScores;
  attachments: IdeaAttachment[];

  workflow: IdeaWorkflowEntry[];
  approvals: IdeaApproval[];
  history: IdeaHistoryEntry[];
  auditLog: IdeaAuditEntry[];

  feasibilityProjectId: string | null; // set when Approved
}

/** Compact row for dashboard/list tables. */
export type IdeaListRow = {
  id: string;
  ideaCode: string;
  title: string;
  status: IdeaStatus;
  category: string;
  department: string;
  technologyArea: string[];
  overallEvaluationScore: number;
  ideaRanking: string;
  priority: IdeaPriority;
  submittedBy: string;
  dateSubmitted: string | null;
  updatedAt: string;
  expectedRevenue: number;
  costSaving: number;
  patentable: boolean;
};

export interface IdeaNotification {
  id: string;
  ideaId: string | null;
  ideaCode: string | null;
  title: string;
  body: string;
  role: IdeaActorRole | "All";
  read: boolean;
  createdAt: string;
}

/** Lookup options (I — imported; mock data until HRM/CRM/Product/Patent exist). */
export interface IdeaLookups {
  categories: { name: string; subCategories: string[] }[];
  businessUnits: string[];
  departments: string[];
  productLines: string[];
  projects: string[];
  strategicInitiatives: string[];
  innovationThemes: string[];
  employees: string[];
  innovationTypes: string[];
  innovationLevels: string[];
  technologyAreas: string[];
  industries: string[];
  applicationAreas: string[];
  marketSegments: string[];
  customerTypes: string[];
  productCategories: string[];
  technologyReadinessLevels: string[];
  existingPatents: string[];
}

export interface IdeaDashboard {
  kpis: {
    totalIdeas: number;
    ideasThisMonth: number;
    approvalRate: number;
    rejectionRate: number;
    averageInnovationScore: number;
    patentableIdeas: number;
    estimatedRevenuePipeline: number;
    estimatedCostSavings: number;
    portfolioRiskIndex: number;
    esgImpactScore: number;
    averageReviewTimeDays: number;
    convertedToFeasibility: number;
  };
  rows: IdeaListRow[];
  pipelineTrend: { month: string; submitted: number; approved: number }[];
  byDepartment: { name: string; value: number; color: string }[];
  byTechnologyArea: { name: string; value: number; color: string }[];
  byStatus: { name: string; value: number; color: string }[];
}

export interface FeasibilityProjectRecord {
  id: string;
  projectCode: string;
  ideaId: string;
  ideaCode: string;
  title: string;
  createdAt: string;
  status: string;
}

/* ===========================================================================
   Opportunity Discovery (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   Turns a validated Idea into a qualified opportunity. Upstream = Idea
   Management; downstream = Feasibility Study. Every "AI" score below is a
   DETERMINISTIC calculation over the entered fields — no LLM involved.
   =========================================================================== */

export type OpportunityStatus =
  "draft" | "under_review" | "revision_required" | "approved" | "on_hold" | "rejected" | "archived";

/** Sequential functional review stages once an opportunity is qualified. */
export type OpportunityReviewStage =
  "Initial Review" | "Market Validation" | "Business Validation" | "Innovation Committee Review";

export type OpportunityDecision =
  "Approved" | "Revision Required" | "On Hold" | "Rejected" | "Forwarded";

export type OpportunityPriority = "Low" | "Medium" | "High" | "Critical";
export type ImpactLevel = "Low" | "Medium" | "High";

/** Section 1 — Opportunity Information. */
export interface OpportunityInformation {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  source: string;
  businessUnit: string;
  department: string;
  productLine: string;
  strategicInitiative: string;
}

/** Section 2 — Source Identification (linked idea + discovery triggers). */
export interface OpportunitySourceIdentification {
  linkedIdeaId: string | null;
  linkedIdeaCode: string | null;
  customerRequest: boolean;
  marketResearch: boolean;
  competitorAnalysis: boolean;
  technologyTrend: boolean;
  governmentPolicy: boolean;
  internalSuggestion: boolean;
  researchPublication: boolean;
  startupEcosystem: boolean;
}

/** Section 3 — Customer Opportunity. */
export interface OpportunityCustomer {
  targetCustomer: string;
  customerSegment: string;
  customerNeed: string;
  painPoints: string;
  customerExpectations: string;
  existingSolution: string;
  customerFeedback: string;
}

/** Section 4 — Market Opportunity. */
export interface OpportunityMarket {
  industry: string;
  targetMarket: string;
  marketSize: number;
  tam: number;
  sam: number;
  som: number;
  growthRate: number;
  marketMaturity: string;
  marketReadiness: string;
}

/** Section 5 — Technology Opportunity. */
export interface OpportunityTechnology {
  technologyDomain: string;
  emergingTechnology: string;
  technologyReadiness: string;
  existingTechnology: string;
  technologyGap: string;
  technologyTrend: string;
  technologyPartner: string;
}

/** Section 6 — Competitive Analysis. */
export interface OpportunityCompetitive {
  existingCompetitors: string;
  competitorProducts: string;
  marketLeader: string;
  competitiveAdvantage: string;
  marketGap: string;
  swotSummary: string;
}

/** Section 7 — Business Opportunity (manual inputs + calculated outputs). */
export interface OpportunityBusiness {
  revenueOpportunity: number;
  estimatedInvestment: number;
  businessRisk: ImpactLevel;
  // Calculated (C):
  grossMargin: number;
  roi: number;
  paybackPeriod: number;
}

/** Section 8 — Regulatory & ESG Assessment. */
export interface OpportunityRegulatoryESG {
  regulatoryRequirement: string;
  applicableStandards: string[];
  environmentalImpact: ImpactLevel;
  socialImpact: ImpactLevel;
  governanceImpact: ImpactLevel;
  // Calculated (C):
  esgScore: number;
}

/** Section 9 — AI Opportunity Analysis (computed from the fields above). */
export interface OpportunityAIAnalysis {
  aiMarketScore: number;
  aiTechnologyScore: number;
  aiCompetitionScore: number;
  aiRiskScore: number;
  aiOpportunityScore: number;
  aiRecommendation: string;
  aiSuggestedMarkets: string;
  aiSuggestedImprovements: string;
}

/** Section 10 — Opportunity Evaluation (all calculated). */
export interface OpportunityEvaluation {
  strategicAlignmentScore: number;
  customerValueScore: number;
  technologyScore: number;
  marketScore: number;
  businessScore: number;
  overallOpportunityScore: number;
  opportunityRank: number;
}

export interface OpportunityAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** Review & Approval (workflow-driven). */
export interface OpportunityReview {
  stage: OpportunityReviewStage;
  reviewer: string;
  decision: OpportunityDecision | "Pending";
  comments: string;
  date: string | null;
}

export interface OpportunityAuditEntry {
  at: string;
  actor: string;
  event: string;
  fromStatus?: OpportunityStatus;
  toStatus?: OpportunityStatus;
}

/** The editable (M) payload the form submits. */
export interface OpportunityFormInput {
  name: string;
  information: OpportunityInformation;
  sourceIdentification: OpportunitySourceIdentification;
  customer: OpportunityCustomer;
  market: OpportunityMarket;
  technology: OpportunityTechnology;
  competitive: OpportunityCompetitive;
  business: Pick<
    OpportunityBusiness,
    "revenueOpportunity" | "estimatedInvestment" | "businessRisk"
  >;
  regulatoryESG: Omit<OpportunityRegulatoryESG, "esgScore">;
  attachments: OpportunityAttachment[];
}

/** The full persisted opportunity document.
 *  Named `Discovery*` because CRM already owns `OpportunityRecord` — module
 *  scoped types stay separate per the architecture convention. */
export interface DiscoveryOpportunityRecord {
  id: string;
  opportunityCode: string; // A — OPP-YYYY-00001
  name: string;
  status: OpportunityStatus; // W
  reviewStage: OpportunityReviewStage | null; // W
  priority: OpportunityPriority; // W
  nextAction: string; // W (computed)
  version: number; // A
  owner: string; // I
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  discoveryDate: string; // A

  information: OpportunityInformation;
  sourceIdentification: OpportunitySourceIdentification;
  customer: OpportunityCustomer;
  market: OpportunityMarket;
  technology: OpportunityTechnology;
  competitive: OpportunityCompetitive;
  business: OpportunityBusiness;
  regulatoryESG: OpportunityRegulatoryESG;
  aiAnalysis: OpportunityAIAnalysis | null; // populated on submit
  evaluation: OpportunityEvaluation | null; // populated on submit
  attachments: OpportunityAttachment[];

  reviews: OpportunityReview[];
  auditTrail: OpportunityAuditEntry[];
  revisionNote: string | null;
  feasibilityProjectId: string | null;
  feasibilityProjectCode: string | null;
}

/** Compact row for the opportunity register. */
export type OpportunityListRow = {
  id: string;
  opportunityCode: string;
  name: string;
  status: OpportunityStatus;
  reviewStage: OpportunityReviewStage | null;
  category: string;
  department: string;
  owner: string;
  overallScore: number;
  opportunityRank: number;
  revenueOpportunity: number;
  linkedIdeaCode: string | null;
  updatedAt: string;
};

/* ===========================================================================
   Design Thinking (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   Upstream = an APPROVED Opportunity Discovery record (which itself carries the
   source Idea); downstream = Problem Validation. The 5 design-thinking stages
   are real state — a later stage cannot be worked before its predecessor has
   started. Every "AI" output is a deterministic function of the entered data.
   =========================================================================== */

export type DesignThinkingStatus =
  | "draft"
  | "in_progress"
  | "under_review"
  | "revision_required"
  | "approved"
  | "rejected"
  | "archived";

export type DesignThinkingStage = "empathize" | "define" | "ideate" | "prototype" | "test";
export type DesignStageStatus = "completed" | "in_progress" | "pending";

export interface DesignStageState {
  stage: DesignThinkingStage;
  status: DesignStageStatus;
  startedAt: string | null;
  completedAt: string | null;
}

/** Stage 1 — Empathize (Customer Understanding). */
export interface DTEmpathize {
  customerType: string;
  targetPersona: string;
  userJourney: string;
  customerGoals: string;
  painPoints: string;
  frustrations: string;
  existingWorkaround: string;
  customerQuotes: string[];
  observationNotes: string;
  interviewSummary: string;
}

/** Stage 2 — Define (Problem Definition). */
export interface DTDefine {
  problemStatement: string;
  rootCause: string;
  customerNeed: string;
  opportunityStatement: string;
  designChallenge: string;
  businessImpact: string;
  successCriteria: string;
}

/** Stage 3 — Ideate (Solution Brainstorming). */
export interface DTIdeate {
  brainstormSession: string;
  totalIdeasGenerated: number;
  selectedIdea: string;
  alternativeSolutions: string[];
  innovationLevel: string;
  technologyUsed: string[];
  estimatedCustomerValue: number; // 1..10
  estimatedBusinessValue: number; // 1..10
}

/** Stage 4 — Prototype (Prototype Planning). */
export interface DTPrototype {
  prototypeType: string;
  prototypeObjective: string;
  prototypeDescription: string;
  prototypeVersion: string; // A
  materialsRequired: string;
  estimatedCost: number;
  estimatedDuration: number; // days
  prototypeOwner: string;
}

/** Stage 5 — Test (User Validation). */
export interface DTTest {
  testParticipants: number;
  testingMethod: string;
  customerFeedback: string;
  positiveFeedback: string;
  improvementSuggestions: string;
  satisfactionScore: number; // 1..10 (displayed /5 as stars)
  testResult: string;
  recommendation: string;
}

/** Section 6 — Innovation Assessment. All calculated, /10. */
export interface DTAssessment {
  customerValueScore: number;
  innovationScore: number;
  technicalFeasibility: number;
  businessFeasibility: number;
  marketPotential: number;
  esgImpact: number;
  overallDesignScore: number;
}

/** Section 7 — AI Design Thinking Assistant. Generated, never hand-entered. */
export interface DTAIAssistant {
  personaAnalysis: string;
  painPointAnalysis: string;
  suggestedIdeas: string;
  alternativeSolutions: string;
  prototypeSuggestions: string;
  riskAnalysis: string;
  aiOpportunityScore: number; // /100
  recommendation: string;
  generatedAt: string;
}

export interface DTAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface DTAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: DesignThinkingStage;
  fromStatus?: DesignThinkingStatus;
  toStatus?: DesignThinkingStatus;
}

/** The editable payload the form submits. */
export interface DesignThinkingFormInput {
  projectName: string;
  workshopDate: string;
  facilitator: string;
  businessUnit: string;
  department: string;
  linkedOpportunityId: string | null;
  empathize: DTEmpathize;
  define: DTDefine;
  ideate: DTIdeate;
  prototype: DTPrototype;
  test: DTTest;
  attachments: DTAttachment[];
}

export interface DesignThinkingRecord {
  id: string;
  formCode: string; // A — DT-2026-00125
  designThinkingId: string; // A — DT-000125
  projectName: string;
  workshopDate: string;
  facilitator: string;
  businessUnit: string;
  department: string;

  status: DesignThinkingStatus; // W
  currentStage: DesignThinkingStage; // W
  stages: DesignStageState[]; // W
  version: number;

  // Linked upstream records (resolved, not free text).
  linkedOpportunityId: string | null;
  linkedOpportunityCode: string | null;
  linkedIdeaId: string | null;
  linkedIdeaCode: string | null;

  empathize: DTEmpathize;
  define: DTDefine;
  ideate: DTIdeate;
  prototype: DTPrototype;
  test: DTTest;
  assessment: DTAssessment | null;
  aiAssistant: DTAIAssistant | null;
  attachments: DTAttachment[];

  reviewComments: string | null;
  nextAction: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: DTAuditEntry[];

  problemValidationId: string | null;
  problemValidationCode: string | null;
}

export type DesignThinkingListRow = {
  id: string;
  formCode: string;
  designThinkingId: string;
  projectName: string;
  status: DesignThinkingStatus;
  currentStage: DesignThinkingStage;
  facilitator: string;
  linkedOpportunityCode: string | null;
  linkedIdeaCode: string | null;
  overallDesignScore: number;
  updatedAt: string;
};

/** The linked Opportunity summary shown in "Opportunity At A Glance". */
export interface DTOpportunityGlance {
  opportunityId: string;
  opportunityCode: string;
  name: string;
  category: string;
  marketPotential: string;
  strategicInitiative: string;
  overallOpportunityScore: number;
  ideaId: string | null;
  ideaCode: string | null;
}

/* ===========================================================================
   Problem Validation (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   Verifies a problem is real, significant and worth solving before Feasibility
   Study. Upstream = an approved Design Thinking project (which carries the
   Opportunity + Idea); downstream = Feasibility Study. Five validation stages
   are real state; each stage's AI output is deterministic (no LLM). Section 8
   (AI) and Section 9 (Summary) are a single computed source shared with the
   sidebar — never duplicated static values.
   =========================================================================== */

export type ProblemValidationStatus =
  | "draft"
  | "in_progress"
  | "under_review"
  | "more_research_required"
  | "revision_required"
  | "validated"
  | "validation_failed"
  | "archived";

export type PVStage =
  | "problem_definition"
  | "customer_validation"
  | "market_validation"
  | "technical_validation"
  | "business_validation";

export type PVStageStatus = "completed" | "in_progress" | "pending";

export interface PVStageState {
  stage: PVStage;
  status: PVStageStatus;
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Problem Information. */
export interface PVProblemInfo {
  problemTitle: string;
  problemDescription: string;
  problemCategory: string;
  problemSubCategory: string;
  industry: string;
  customerSegment: string;
  businessArea: string;
  geographicRegion: string;
  problemSource: string;
  problemOwner: string;
}

/** Section 2 — Customer Validation. */
export interface PVCustomerValidation {
  targetCustomer: string;
  customerPersona: string;
  numberOfInterviews: number;
  surveyResponses: number;
  observationSessions: number;
  customerPainLevel: number; // 1..10 (shown /5 as stars)
  customerQuotes: string[];
}

/** Section 3 — Problem Evidence. */
export interface PVProblemEvidence {
  existingSolution: string;
  currentProcess: string;
  rootCause: string;
  supportingData: string;
  fieldNotes: string;
}

/** Section 4 — Impact Assessment. */
export interface PVImpactAssessment {
  customerImpact: number; // rating 1..10
  financialImpact: number; // currency
  timeLoss: number; // hrs/month
  productivityLoss: number; // %
  qualityImpact: number; // rating
  safetyImpact: number; // rating
  environmentalImpact: number; // rating
  regulatoryImpact: number; // rating
}

/** Section 5 — Market Validation. */
export interface PVMarketValidation {
  customersAffected: number;
  marketSize: number;
  growthRate: number;
  frequencyOfProblem: string;
  existingCompetitors: string;
  marketGap: string;
}

/** Section 6 — Technical Validation. */
export interface PVTechnicalValidation {
  technicalChallenge: string;
  existingTechnologies: string;
  technologyGap: string;
  technologyReadiness: string;
  technicalComplexity: string;
  requiredExpertise: string[];
}

/** Section 7 — Business Validation. */
export interface PVBusinessValidation {
  revenueOpportunity: number;
  costSavingOpportunity: number;
  strategicAlignment: number; // rating 1..10
  businessPriority: string;
  investmentJustification: string;
}

/** Section 8 — AI Problem Validation (computed, /100). */
export interface PVAIValidation {
  problemSeverityScore: number;
  customerValidationScore: number;
  marketValidationScore: number;
  businessValueScore: number;
  technicalComplexityScore: number;
  overallValidationScore: number;
  recommendation: string;
  suggestedImprovements: string[];
  generatedAt: string;
}

export type PVValidationDecision =
  | "Under Review"
  | "Validated"
  | "Partially Validated"
  | "More Research Required"
  | "Revision Required"
  | "Validation Failed"
  | "Put on Hold";

/** Section 9 — Validation Summary (calculated, single source w/ section 8). */
export interface PVSummary {
  problemSeverity: number;
  customerDemandScore: number;
  marketOpportunityScore: number;
  technicalFeasibilityScore: number;
  businessPotentialScore: number;
  overallValidationScore: number;
  validationDecision: PVValidationDecision;
}

export interface PVReviewer {
  role: string;
  name: string;
  status: "approved" | "pending";
}

export interface PVAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface PVAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: PVStage;
  fromStatus?: ProblemValidationStatus;
  toStatus?: ProblemValidationStatus;
}

/** The editable payload the form submits. */
export interface ProblemValidationFormInput {
  validationLead: string;
  validationDate: string;
  businessUnit: string;
  department: string;
  linkedDesignThinkingId: string | null;
  problemInfo: PVProblemInfo;
  customerValidation: PVCustomerValidation;
  problemEvidence: PVProblemEvidence;
  impactAssessment: PVImpactAssessment;
  marketValidation: PVMarketValidation;
  technicalValidation: PVTechnicalValidation;
  businessValidation: PVBusinessValidation;
  attachments: PVAttachment[];
}

export interface ProblemValidationRecord2 {
  id: string;
  formCode: string; // A — PV-2026-00078
  problemValidationId: string; // A — PV-00078
  status: ProblemValidationStatus; // W
  currentStage: PVStage; // W
  stages: PVStageState[];
  version: number;

  project: string;
  validationLead: string;
  validationDate: string;
  businessUnit: string;
  department: string;

  // Linked upstream records (resolved).
  linkedDesignThinkingId: string | null;
  linkedDesignThinkingCode: string | null;
  linkedOpportunityId: string | null;
  linkedOpportunityCode: string | null;
  linkedIdeaId: string | null;
  linkedIdeaCode: string | null;

  problemInfo: PVProblemInfo;
  customerValidation: PVCustomerValidation;
  problemEvidence: PVProblemEvidence;
  impactAssessment: PVImpactAssessment;
  marketValidation: PVMarketValidation;
  technicalValidation: PVTechnicalValidation;
  businessValidation: PVBusinessValidation;
  aiValidation: PVAIValidation | null;
  summary: PVSummary | null;
  attachments: PVAttachment[];
  reviewers: PVReviewer[];

  validationRank: number;
  reviewComments: string | null;
  approvalDate: string | null;
  nextAction: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: PVAuditEntry[];

  feasibilityProjectId: string | null;
  feasibilityProjectCode: string | null;
}

export type ProblemValidationListRow = {
  id: string;
  formCode: string;
  problemValidationId: string;
  problemTitle: string;
  status: ProblemValidationStatus;
  currentStage: PVStage;
  validationLead: string;
  linkedDesignThinkingCode: string | null;
  overallValidationScore: number;
  validationRank: number;
  updatedAt: string;
};

/** Linked-records summary for the header + creation prefill. */
export interface PVDesignThinkingGlance {
  designThinkingId: string;
  designThinkingCode: string;
  projectName: string;
  opportunityId: string | null;
  opportunityCode: string | null;
  ideaId: string | null;
  ideaCode: string | null;
}

/* ===========================================================================
   Innovation Portfolio (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   The executive rollup layer over the whole innovation pipeline. A portfolio
   doesn't hold its own project data — it aggregates live counts/scores from
   Idea Management, Opportunity Discovery, Design Thinking and Problem
   Validation each time it's viewed/refreshed, plus its own budget/resource/
   risk inputs. Every "AI"/computed value is deterministic (no LLM).
   =========================================================================== */

export type PortfolioStatus =
  | "draft"
  | "under_review"
  | "active"
  | "revision_required"
  | "budget_review"
  | "rejected"
  | "archived";

export type ImpactRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** The editable (M) portfolio-level payload. */
export interface PortfolioFormInput {
  portfolioName: string;
  portfolioManager: string;
  businessUnit: string;
  department: string;
  financialYear: string;
  portfolioCategory: string;
  portfolioObjective: string;
  strategicTheme: string;
  innovationFocus: string[];
  portfolioDescription: string;
  innovationType: string;
  technologyDomain: string[];
  industry: string;
  market: string;
  customerSegment: string;
  // Strategic alignment (0-100 each, manually set by portfolio manager).
  corporateObjectiveAlignment: number;
  strategicInitiativeAlignment: number;
  businessGoalAlignment: number;
  esgGoalAlignment: number;
  // Financial inputs (M).
  approvedBudget: number;
  // Resource inputs (M).
  equipmentAvailability: string;
  laboratoryAvailability: string;
  // Risk inputs (M, 1..10 each).
  technologyRisk: number;
  marketRisk: number;
  financialRisk: number;
  regulatoryRisk: number;
  operationalRisk: number;
  attachments: PortfolioAttachment[];
}

export interface PortfolioAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** One row rolled up from an upstream pipeline module. */
export type PortfolioProjectRow = {
  id: string;
  moduleCode: string; // IDEA-…, OPP-…, DT-…, PV-…
  title: string;
  stage:
    | "Ideas"
    | "Opportunities"
    | "Technology Scouting"
    | "Design Thinking"
    | "Problem Validation"
    | "Feasibility Study";
  category: string;
  budget: number;
  progress: number; // 0..100, derived from stage/status
  overallScore: number; // 0..100
  owner: string;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
};

/** Section — Innovation Projects (rolled up, count = C). */
export interface PortfolioProjectRollup {
  linkedIdeaIds: string[];
  linkedOpportunityIds: string[];
  linkedDesignThinkingIds: string[];
  linkedProblemValidationIds: string[];
  /** Approved Technology Scouting records handed off into the portfolio.
   *  Optional: portfolios created before the Technology Scouting module lack it. */
  linkedTechnologyScoutingIds?: string[];
  totalActiveProjects: number;
  rows: PortfolioProjectRow[];
}

/** Portfolio Composition — by innovation type. */
export type PortfolioSlice = { name: string; value: number; color: string };

/** Projects by Stage — funnel. */
export type PortfolioFunnelStage = { stage: string; count: number };

/** Investment vs Return, by financial year. */
export type PortfolioInvestmentPoint = { year: string; investment: number; revenue: number };

/** Financial portfolio (mostly calculated). */
export interface PortfolioFinancials {
  approvedBudget: number;
  budgetUtilized: number;
  remainingBudget: number;
  estimatedRevenue: number;
  estimatedROI: number;
  npv: number;
  irr: number;
  paybackPeriod: number;
}

/** Resource portfolio (calculated). */
export interface PortfolioResources {
  totalEmployees: number;
  internalExperts: number;
  externalConsultants: number;
  resourceAdequacy: number; // /100
}

/** Risk portfolio (calculated). */
export interface PortfolioRisk {
  technologyRisk: number;
  marketRisk: number;
  financialRisk: number;
  regulatoryRisk: number;
  operationalRisk: number;
  portfolioRiskScore: number; // /100
  distribution: PortfolioSlice[]; // Low/Moderate/High/Critical across rows
}

/** Innovation Performance (calculated). */
export interface PortfolioPerformance {
  totalIdeas: number;
  opportunities: number;
  designThinkingProjects: number;
  validatedProblems: number;
  feasibilityStudies: number;
  successRate: number; // %
}

/** AI Portfolio Analytics — generated, deterministic. */
export interface PortfolioAIAnalytics {
  healthScore: number; // /100
  growthPotential: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  roiPotential: "Low" | "Medium" | "High";
  investmentRecommendation: string;
  riskPrediction: string;
  resourceOptimization: string;
  projectPrioritization: string;
  recommendation: string;
  generatedAt: string;
}

/** KPI Dashboard — the bottom metric strip (calculated). */
export interface PortfolioKPIDashboard {
  innovationIndex: number; // /100
  portfolioValue: number;
  innovationVelocity: number; // /100
  averageTRL: number; // /9
  portfolioROI: number; // %
  innovationMaturity: number; // /100
  commercializationReadiness: number; // %
  esgImpactScore: number; // /100
}

export interface PortfolioAuditEntry {
  at: string;
  actor: string;
  event: string;
  fromStatus?: PortfolioStatus;
  toStatus?: PortfolioStatus;
}

export type ExecutiveDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "Deferred" | "Rejected";
export type FundingDecision =
  | "Fully Funded"
  | "Partially Funded"
  | "Additional Budget Required"
  | "External Funding Required"
  | "Not Approved";

export interface PortfolioReviewer {
  role: string;
  name: string;
  status: "approved" | "pending";
}

/** The full persisted portfolio document. */
export interface InnovationPortfolioRecord {
  id: string;
  portfolioId: string; // A — IP-2026-00032
  portfolioCode: string; // A — <initials>-2026-25
  status: PortfolioStatus; // W
  version: number;

  portfolioName: string;
  portfolioManager: string;
  businessUnit: string;
  department: string;
  financialYear: string;
  portfolioCategory: string;
  portfolioObjective: string;
  strategicTheme: string;
  innovationFocus: string[];
  portfolioDescription: string;
  innovationType: string;
  technologyDomain: string[];
  industry: string;
  market: string;
  customerSegment: string;

  projects: PortfolioProjectRollup;
  composition: PortfolioSlice[];
  funnel: PortfolioFunnelStage[];
  investmentReturn: PortfolioInvestmentPoint[];

  financials: PortfolioFinancials;
  resources: PortfolioResources;
  risk: PortfolioRisk;
  performance: PortfolioPerformance;
  aiAnalytics: PortfolioAIAnalytics | null;
  kpiDashboard: PortfolioKPIDashboard | null;

  corporateObjectiveAlignment: number;
  strategicInitiativeAlignment: number;
  businessGoalAlignment: number;
  esgGoalAlignment: number;
  alignmentScore: number; // C — average

  equipmentAvailability: string;
  laboratoryAvailability: string;
  attachments: PortfolioAttachment[];

  reviewers: PortfolioReviewer[];
  executiveDecision: ExecutiveDecision | null;
  fundingDecision: FundingDecision | null;
  portfolioPriority: string | null;
  reviewNotes: string | null;
  approvalDate: string | null;
  nextAction: string;

  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: PortfolioAuditEntry[];
}

export type PortfolioListRow = {
  id: string;
  portfolioId: string;
  portfolioCode: string;
  portfolioName: string;
  status: PortfolioStatus;
  portfolioManager: string;
  financialYear: string;
  totalProjects: number;
  overallScore: number;
  updatedAt: string;
};

export interface PortfolioLookups {
  categories: string[];
  strategicThemes: string[];
  innovationFocusAreas: string[];
  innovationTypes: string[];
  technologyDomains: string[];
  industries: string[];
  markets: string[];
  customerSegments: string[];
  equipmentAvailability: string[];
  laboratoryAvailability: string[];
  executiveDecisions: string[];
  fundingDecisions: string[];
  priorities: string[];
  managers: string[];
  businessUnits: string[];
  departments: string[];
  financialYears: string[];
  attachmentCategories: string[];
}

export interface ProblemValidationLookups {
  problemCategories: string[];
  problemSubCategories: string[];
  industries: string[];
  customerSegments: string[];
  businessAreas: string[];
  geographicRegions: string[];
  problemSources: string[];
  targetCustomers: string[];
  frequencies: string[];
  technologyReadinessLevels: string[];
  technicalComplexities: string[];
  businessPriorities: string[];
  validationDecisions: string[];
  nextActions: string[];
  expertise: string[];
  validationLeads: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
}

export interface DesignThinkingLookups {
  customerTypes: string[];
  testingMethods: string[];
  prototypeTypes: string[];
  innovationLevels: string[];
  testResults: string[];
  recommendations: string[];
  technologies: string[];
  facilitators: string[];
  projects: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
}

export interface ProblemValidationRecord {
  id: string;
  projectCode: string;
  designThinkingId: string;
  designThinkingCode: string;
  title: string;
  createdAt: string;
  status: string;
}

export interface OpportunityLookups {
  categories: { name: string; subCategories: string[] }[];
  sources: string[];
  businessUnits: string[];
  departments: string[];
  productLines: string[];
  strategicInitiatives: string[];
  targetCustomers: string[];
  customerSegments: string[];
  industries: string[];
  targetMarkets: string[];
  marketMaturities: string[];
  marketReadinessLevels: string[];
  technologyDomains: string[];
  emergingTechnologies: string[];
  technologyReadinessLevels: string[];
  technologyPartners: string[];
  applicableStandards: string[];
  attachmentCategories: string[];
}

/* ===========================================================================
   Technology Scouting (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   One record per scouted technology. Embeds the 4 assessment stages
   (Identification → Technical → Market → IP & Risk), the AI Technology
   Analysis, the Decision Summary, reviewers, monitoring alerts and the audit
   trail. The 9-step tracker is driven by `status`, the 4 stages by `stages`.
   =========================================================================== */

export type TechScoutingStatus =
  | "identified"
  | "under_evaluation"
  | "technical_review"
  | "business_review"
  | "ip_review"
  | "executive_review"
  | "approved"
  | "monitoring"
  | "rejected"
  | "closed";

export type TechScoutingStage =
  "identification" | "technical_assessment" | "market_assessment" | "ip_risk_assessment";

export interface TechScoutingStageState {
  stage: TechScoutingStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Technology Information. */
export interface TechScoutingInfo {
  technologyName: string;
  technologyCategory: string;
  technologySubcategory: string;
  technologyDomain: string;
  technologyDescription: string;
  keywords: string[];
  technologyMaturity: string;
  trl: string;
}

/** Section 2 — Source Information. */
export interface TechScoutingSource {
  sourceType: string;
  organizationName: string;
  country: string;
  website: string;
  contactPerson: string;
  publicationReference: string;
  sourceReliability: number; // 1..5 stars
}

/** Section 3 — Market Intelligence. */
export interface TechScoutingMarket {
  industry: string;
  targetMarket: string;
  marketTrend: string;
  adoptionLevel: string;
  marketGrowthRate: number; // %
  marketSize: number; // currency
  competitorsUsingTechnology: string;
}

/** Section 4 — Technical Assessment. */
export interface TechScoutingTechnical {
  coreTechnology: string;
  keyFeatures: string;
  technicalAdvantages: string;
  technicalLimitations: string;
  requiredInfrastructure: string;
  integrationComplexity: string;
  compatibility: number; // 1..5 stars
}

/** Section 5 — Intellectual Property. */
export interface TechScoutingIP {
  patentAvailable: boolean;
  patentNumber: string;
  patentOwner: string;
  ipStatus: string;
  freedomToOperate: string;
  licensingAvailability: string;
}

/** Section 6 — Business Assessment. */
export interface TechScoutingBusiness {
  businessOpportunity: string;
  potentialApplications: string;
  strategicFit: number; // 1..5 stars
  revenuePotential: number;
  investmentEstimate: number;
  timeToCommercialization: number; // years
}

/** Section 7 — Risk Assessment (each 1..5 stars; overall level is computed). */
export interface TechScoutingRisk {
  technologyRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
  supplyChainRisk: number;
  cybersecurityRisk: number;
}

export type TechScoutingRiskLevel = "Low" | "Moderate" | "High";

/** Section 8 — Attachments (same shape as the portfolio module attachments). */
export interface TechScoutingAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** AI Technology Analysis — all computed server-side from the entered data
 *  and stage completions; never hardcoded and no LLM involved. */
export interface TechScoutingAIAnalysis {
  aiTechnologyScore: number; // /100
  aiInnovationScore: number;
  aiMarketPotential: number;
  aiTechnicalFeasibility: number;
  aiStrategicAlignment: number;
  aiCompetitiveAdvantage: number;
  recommendation: string;
  /** Stage 1 outputs */
  technologyClassification: string;
  emergingTrendAnalysis: string;
  /** Stage 2 outputs */
  technicalComplexity: string;
  integrationDifficulty: string;
  infrastructureRequirements: string;
  /** Stage 3 outputs */
  marketOpportunityScore: number;
  competitiveAdvantageBand: string;
  /** Stage 4 outputs */
  patentLandscape: string;
  generatedAt: string;
}

/** Decision Summary — score/rank computed, action/owner/dates workflow-set. */
export interface TechScoutingDecision {
  overallTechnologyScore: number; // /100
  priorityRanking: number; // 1 = best across all records
  recommendedAction: string;
  technologyOwner: string;
  targetProject: string;
  followUpDate: string;
}

export type TechScoutingAlertType =
  "Technology Update" | "New Competitor" | "Patent Alert" | "Market Alert";

export interface TechScoutingAlert {
  type: TechScoutingAlertType;
  message: string;
  at: string;
}

/** Continuous monitoring state (populated once approved / on the watchlist). */
export interface TechScoutingMonitoring {
  watchlisted: boolean;
  lastCheckedAt: string | null;
  alerts: TechScoutingAlert[];
}

export interface TechScoutingReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type TechScoutingApprovalDecision =
  "Approved" | "Monitor Technology" | "Conduct Further Evaluation" | "Rejected";

export interface TechScoutingAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: TechScoutingStage;
  fromStatus?: TechScoutingStatus;
  toStatus?: TechScoutingStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface TechScoutingFormInput {
  technologyScout: string;
  businessUnit: string;
  department: string;
  scoutingDate: string;
  linkedOpportunityId?: string | null;
  info: TechScoutingInfo;
  source: TechScoutingSource;
  market: TechScoutingMarket;
  technical: TechScoutingTechnical;
  ip: TechScoutingIP;
  business: TechScoutingBusiness;
  risk: TechScoutingRisk;
  attachments: TechScoutingAttachment[];
  technologyOwner: string;
  targetProject: string;
  followUpDate: string;
  recommendedAction: string;
}

export interface TechnologyScoutingRecord {
  id: string;
  scoutingId: string; // TS-2026-0001
  status: TechScoutingStatus;
  currentStage: TechScoutingStage;
  stages: TechScoutingStageState[];
  version: number;
  technologyScout: string;
  businessUnit: string;
  department: string;
  scoutingDate: string;
  linkedOpportunityId: string | null;
  linkedOpportunityCode: string | null;
  linkedOpportunityName: string | null;
  info: TechScoutingInfo;
  source: TechScoutingSource;
  market: TechScoutingMarket;
  technical: TechScoutingTechnical;
  ip: TechScoutingIP;
  business: TechScoutingBusiness;
  risk: TechScoutingRisk;
  overallRiskLevel: TechScoutingRiskLevel;
  aiAnalysis: TechScoutingAIAnalysis;
  decision: TechScoutingDecision;
  monitoring: TechScoutingMonitoring;
  attachments: TechScoutingAttachment[];
  reviewers: TechScoutingReviewer[];
  approvalDecision: TechScoutingApprovalDecision | null;
  reviewNextAction: string | null;
  reviewComments: string | null;
  approvalDate: string | null;
  nextAction: string; // computed workflow hint
  addedToPortfolioAt: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: TechScoutingAuditEntry[];
}

export type TechScoutingListRow = {
  id: string;
  scoutingId: string;
  technologyName: string;
  technologyCategory: string;
  status: TechScoutingStatus;
  currentStage: TechScoutingStage;
  technologyScout: string;
  overallTechnologyScore: number;
  priorityRanking: number;
  trl: string;
  updatedAt: string;
};

export interface TechScoutingLookups {
  technologyCategories: string[];
  technologySubcategories: string[];
  technologyDomains: string[];
  technologyMaturities: string[];
  trlLevels: string[];
  sourceTypes: string[];
  countries: string[];
  contactPersons: string[];
  industries: string[];
  targetMarkets: string[];
  marketTrends: string[];
  adoptionLevels: string[];
  integrationComplexities: string[];
  ipStatuses: string[];
  ftoOptions: string[];
  licensingOptions: string[];
  recommendedActions: string[];
  nextActions: string[];
  approvalDecisions: string[];
  scouts: string[];
  businessUnits: string[];
  departments: string[];
  targetProjects: string[];
  attachmentCategories: string[];
  keywordSuggestions: string[];
}

/* ===========================================================================
   Research Management (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   One record per research project. Embeds the 4 execution stages
   (Research Planning → Resource Planning → Research Execution → Review &
   Approval), the milestone checklist (single source of truth for progress),
   AI Research Analytics, KPIs, reviewers and the audit trail. The header
   badge is driven by `status`; the sidebar progress gauge by `milestones`.
   =========================================================================== */

export type ResearchStatus =
  | "planning"
  | "resource_planning"
  | "in_progress"
  | "under_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type ResearchStage =
  "research_planning" | "resource_planning" | "research_execution" | "review_approval";

export interface ResearchStageState {
  stage: ResearchStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** A milestone in the plan. `completed` drives the Research Progress %. The
 *  first six map to the sidebar's fixed progress checklist. */
export interface ResearchMilestone {
  id: string;
  label: string;
  targetDate: string;
  completed: boolean;
}

/** Section 1 — Research Overview. */
export interface ResearchOverview {
  researchObjective: string;
  linkedInnovationPortfolioId: string | null;
  researchDomain: string;
  technologyDomain: string;
  strategicTheme: string;
  keywords: string[];
  expectedOutcome: string;
}

/** Section 2 — Research Planning. */
export interface ResearchPlanning {
  researchMethodology: string;
  startDate: string;
  endDate: string;
  estimatedDuration: string; // computed label e.g. "24 Months"
  milestones: ResearchMilestone[];
}

/** Section 3 — Literature Review. */
export interface ResearchLiterature {
  papersReviewed: number;
  patentsReviewed: number;
  standardsReviewed: number;
  researchGap: string;
  literatureSummary: string;
}

/** Section 4 — Experimental Design. */
export interface ResearchExperimental {
  testMethod: string;
  laboratory: string;
  equipmentRequired: string;
  safetyRequirements: string;
}

/** Section 5 — Research Resources. */
export interface ResearchResources {
  researchTeam: string[];
  universities: string[];
  budgetApproved: number;
  budgetUtilized: number;
  // remainingBudget is computed = approved - utilized
}

/** Section 6 — Research Outputs. */
export interface ResearchOutputs {
  prototypeGenerated: boolean;
  publications: number;
  patentOpportunities: number;
  technologyDeveloped: string;
}

export type ResearchTRL =
  | "TRL 1 - Basic Principles"
  | "TRL 2 - Technology Concept"
  | "TRL 3 - Experimental Proof"
  | "TRL 4 - Validated in Lab"
  | "TRL 5 - Validated in Relevant Environment"
  | "TRL 6 - Demonstrated in Relevant Environment"
  | "TRL 7 - System Prototype Demonstration"
  | "TRL 8 - System Complete & Qualified"
  | "TRL 9 - Proven in Operations";

/** Section 8 — Risk Assessment (each 1..10 star rating; band is computed). */
export interface ResearchRisk {
  technicalRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
  supplyChainRisk: number;
}

export type ResearchCommercialPotential = "Low" | "Medium" | "High";

/** Section 9 — Commercialization. */
export interface ResearchCommercialization {
  marketSize: number;
  commercialPotential: ResearchCommercialPotential;
  licensingOpportunity: boolean;
  startupOpportunity: boolean;
}

export interface ResearchAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** AI Research Analytics — all computed server-side; no LLM, no hardcoding. */
export interface ResearchAIAnalytics {
  aiNoveltyScore: number; // /10
  aiTechnicalMerit: number;
  aiCommercialPotential: number;
  aiPublicationPotential: number;
  aiPatentPotential: number;
  researchImpactScore: number; // /10, composite
  recommendation: string;
  /** Stage 1 outputs */
  researchCompletenessScore: number; // /100
  literatureGapAnalysis: string;
  noveltyAssessment: string;
  /** Stage 2 outputs */
  resourceOptimization: string;
  budgetOptimization: string;
  riskAssessment: string;
  /** Stage 3 outputs */
  progressAnalysis: string;
  researchQualityScore: number; // /100
  generatedAt: string;
}

/** Key Research KPIs — derived from the sections, not re-entered. */
export interface ResearchKPIs {
  researchImpactScore: number; // /10
  trl: ResearchTRL;
  trlNumber: number;
  publications: number;
  patentOpportunities: number;
}

export interface ResearchReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type ResearchApprovalDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected";

export interface ResearchActivityEntry {
  at: string;
  actor: string;
  event: string;
  stage?: ResearchStage;
  fromStatus?: ResearchStatus;
  toStatus?: ResearchStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface ResearchFormInput {
  researchTitle: string;
  researchCategory: string;
  researchType: string;
  businessUnit: string;
  department: string;
  principalInvestigator: string;
  linkedOpportunityId?: string | null;
  linkedTechnologyScoutingId?: string | null;
  overview: ResearchOverview;
  planning: ResearchPlanning;
  literature: ResearchLiterature;
  experimental: ResearchExperimental;
  resources: ResearchResources;
  outputs: ResearchOutputs;
  trl: ResearchTRL;
  risk: ResearchRisk;
  commercialization: ResearchCommercialization;
  attachments: ResearchAttachment[];
  productDevelopmentRecommendation: string;
}

export interface ResearchManagementRecord {
  id: string;
  researchId: string; // RES-2026-0001
  researchCode: string; // system-generated short code
  status: ResearchStatus;
  currentStage: ResearchStage;
  currentPhase: string;
  stages: ResearchStageState[];
  version: number;
  researchTitle: string;
  researchCategory: string;
  researchType: string;
  businessUnit: string;
  department: string;
  principalInvestigator: string;
  linkedOpportunityId: string | null;
  linkedOpportunityCode: string | null;
  linkedTechnologyScoutingId: string | null;
  linkedTechnologyScoutingCode: string | null;
  linkedInnovationPortfolioId: string | null;
  linkedInnovationPortfolioCode: string | null;
  overview: ResearchOverview;
  planning: ResearchPlanning;
  literature: ResearchLiterature;
  experimental: ResearchExperimental;
  resources: ResearchResources;
  outputs: ResearchOutputs;
  trl: ResearchTRL;
  risk: ResearchRisk;
  commercialization: ResearchCommercialization;
  productDevelopmentRecommendation: string;
  progressPercentage: number; // computed from milestones
  aiAnalytics: ResearchAIAnalytics;
  kpis: ResearchKPIs;
  attachments: ResearchAttachment[];
  reviewers: ResearchReviewer[];
  approvalDecision: ResearchApprovalDecision | null;
  reviewNextAction: string | null;
  reviewComments: string | null;
  reviewConditions: string | null;
  approvalDate: string | null;
  nextAction: string;
  feasibilityProjectId: string | null;
  feasibilityProjectCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: ResearchActivityEntry[];
}

export type ResearchListRow = {
  id: string;
  researchId: string;
  researchCode: string;
  researchTitle: string;
  researchCategory: string;
  status: ResearchStatus;
  currentPhase: string;
  principalInvestigator: string;
  progressPercentage: number;
  researchImpactScore: number;
  trlNumber: number;
  updatedAt: string;
};

export interface ResearchLookups {
  researchCategories: string[];
  researchTypes: string[];
  researchDomains: string[];
  technologyDomains: string[];
  strategicThemes: string[];
  researchMethodologies: string[];
  testMethods: string[];
  laboratories: string[];
  currentPhases: string[];
  trlLevels: string[];
  productDevelopmentRecommendations: string[];
  approvalDecisions: string[];
  nextActions: string[];
  principalInvestigators: string[];
  researchTeamMembers: string[];
  universities: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
  keywordSuggestions: string[];
  milestoneTemplates: string[];
}

/* ===========================================================================
   Feasibility Study (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   The primary investment-decision gate. One record per full feasibility study,
   created from a validated Problem. Embeds the 5 evaluation stages (Technical →
   Market → Financial → Operational → Compliance & Risk), the 11 section shapes,
   the AI Feasibility Assessment, the Decision Summary, reviewers and the audit
   trail. Distinct from FeasibilityProjectRecord (the lightweight FSP breadcrumb
   auto-created by Problem Validation / Research Management approval).
   =========================================================================== */

export type FeasibilityStatus =
  | "draft"
  | "technical_feasibility"
  | "market_feasibility"
  | "financial_feasibility"
  | "operational_feasibility"
  | "compliance_risk"
  | "under_review"
  | "approved"
  | "conditional_approval"
  | "revision_required"
  | "rejected"
  | "archived";

export type FeasibilityStage =
  "technical" | "market" | "financial" | "operational" | "compliance_risk";

export interface FeasibilityStageState {
  stage: FeasibilityStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Executive Summary. */
export interface FSExecutiveSummary {
  studyObjective: string;
  businessNeed: string;
  opportunityDescription: string;
  expectedBenefits: string;
  keyAssumptions: string;
}

export type FeasibilityTRL =
  | "TRL 1 - Basic Principles"
  | "TRL 2 - Technology Concept"
  | "TRL 3 - Experimental Proof"
  | "TRL 4 - Validated in Lab"
  | "TRL 5 - Validated in Relevant Environment"
  | "TRL 6 - Demonstrated in Relevant Environment"
  | "TRL 7 - System Prototype Demonstration"
  | "TRL 8 - System Complete & Qualified"
  | "TRL 9 - Proven in Operations";

/** Section 2 — Technical Feasibility. */
export interface FSTechnical {
  technologyDescription: string;
  trl: FeasibilityTRL;
  technologyMaturity: string;
  technicalComplexity: string; // Low | Medium | High
  requiredTechnologies: string[];
  engineeringChallenges: string;
  prototypeRequired: boolean;
  infrastructureAvailability: string;
}

/** Section 3 — Market Feasibility. */
export interface FSMarket {
  targetMarket: string;
  customerSegment: string;
  tam: number;
  sam: number;
  som: number;
  marketGrowthRate: number; // %
  customerDemand: number; // 1..10 stars
  competitivePosition: number; // 1..10 stars
}

/** Section 4 — Financial Feasibility (calculated fields recomputed server-side). */
export interface FSFinancial {
  estimatedDevelopmentCost: number;
  capex: number;
  opex: number;
  opexAnnual: number;
  revenueForecast: number; // Yr 5
  // Calculated (C):
  grossMargin: number; // %
  ebitda: number; // %
  roi: number; // %
  npv: number;
  irr: number; // %
  paybackPeriod: number; // months
  breakEvenPoint: number; // months
}

/** Section 5 — Operational Feasibility (each 1..10 stars; score computed). */
export interface FSOperational {
  manufacturingCapability: number;
  supplyChainReadiness: number;
  resourceAvailability: number;
  vendorAvailability: number;
  facilityReadiness: number;
  scalability: number;
}

/** Section 6 — Legal & Regulatory Feasibility. */
export interface FSLegal {
  applicableRegulations: string;
  applicableStandards: string[];
  certificationRequired: string[];
  patentRisk: number; // 1..10 stars
  freedomToOperate: string;
}

/** Section 7 — Risk Assessment (each 1..10 stars; overall score computed). */
export interface FSRisk {
  technicalRisk: number;
  financialRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
  supplyChainRisk: number;
  cybersecurityRisk: number;
  esgRisk: number;
}

/** Section 8 — Resource Planning. */
export interface FSResources {
  projectTeam: string[];
  internalExperts: string[];
  externalExperts: string[];
  equipmentRequired: string;
  laboratoryRequired: string;
  timeline: number; // months
  // budgetRequired is computed = dev cost + capex + opex
}

export interface FSAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** Section 9 — AI Feasibility Assessment (computed; single source of truth,
 *  the sidebar AI summary reads the same object). */
export interface FSAIAssessment {
  aiTechnicalScore: number; // /100
  aiFinancialScore: number;
  aiMarketScore: number;
  aiOperationalScore: number;
  aiRiskScore: number;
  aiSuccessProbability: number; // %
  recommendation: string;
  suggestedImprovements: string;
  // AI Feasibility Assessment card also shows the six research-style scores:
  aiNoveltyScore: number; // /100
  aiTechnicalMerit: number;
  aiCommercialPotential: number;
  aiPublicationPotential: number;
  aiPatentPotential: number;
  aiResearchImpactScore: number;
  generatedAt: string;
}

export type FeasibilityPriority = "Strategic" | "Critical" | "High" | "Medium" | "Low";

/** Decision Summary — all scores computed; priority/action workflow-set. */
export interface FSDecisionSummary {
  technicalScore: number; // /100
  commercialScore: number;
  financialScore: number;
  operationalScore: number;
  strategicScore: number;
  overallFeasibilityScore: number;
  investmentPriority: FeasibilityPriority;
  recommendedAction: string;
}

/** Per-section computed scores (tiles on the form). */
export interface FSSectionScores {
  technicalFeasibilityScore: number;
  marketFeasibilityScore: number;
  operationalScore: number;
  complianceScore: number;
  overallRiskScore: number;
}

export interface FSReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type FSApprovalDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "Deferred" | "Rejected";

export type FSFundingApproval = "Pending" | "Approved" | "Rejected";

export interface FSAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: FeasibilityStage;
  fromStatus?: FeasibilityStatus;
  toStatus?: FeasibilityStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface FeasibilityFormInput {
  studyTitle: string;
  businessUnit: string;
  department: string;
  projectManager: string;
  studyDate: string;
  linkedProblemValidationId?: string | null;
  executiveSummary: FSExecutiveSummary;
  overallRecommendation: string;
  technical: FSTechnical;
  market: FSMarket;
  financial: FSFinancial;
  operational: FSOperational;
  legal: FSLegal;
  risk: FSRisk;
  resources: FSResources;
  attachments: FSAttachment[];
  investmentPriority: FeasibilityPriority;
  recommendedAction: string;
}

export interface FeasibilityStudyRecord {
  id: string;
  feasibilityId: string; // FS-2026-00125
  formCode: string; // FS-2026-25
  status: FeasibilityStatus;
  currentStage: FeasibilityStage;
  stages: FeasibilityStageState[];
  version: number;
  studyTitle: string;
  businessUnit: string;
  department: string;
  projectManager: string;
  studyDate: string;
  // Linked upstream records (resolved).
  linkedProblemValidationId: string | null;
  linkedProblemValidationCode: string | null;
  linkedPortfolioId: string | null;
  linkedPortfolioCode: string | null;
  linkedTechnologyScoutingId: string | null;
  linkedTechnologyScoutingCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  executiveSummary: FSExecutiveSummary;
  overallRecommendation: string;
  technical: FSTechnical;
  market: FSMarket;
  financial: FSFinancial;
  operational: FSOperational;
  legal: FSLegal;
  risk: FSRisk;
  resources: FSResources;
  budgetRequired: number; // computed
  sectionScores: FSSectionScores;
  aiAssessment: FSAIAssessment;
  decisionSummary: FSDecisionSummary;
  attachments: FSAttachment[];
  reviewers: FSReviewer[];
  approvalDecision: FSApprovalDecision | null;
  fundingApproval: FSFundingApproval;
  reviewComments: string | null;
  reviewConditions: string | null;
  approvalDate: string | null;
  nextAction: string;
  pocProjectId: string | null;
  pocProjectCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: FSAuditEntry[];
}

export type FeasibilityListRow = {
  id: string;
  feasibilityId: string;
  formCode: string;
  studyTitle: string;
  status: FeasibilityStatus;
  projectManager: string;
  overallFeasibilityScore: number;
  investmentPriority: FeasibilityPriority;
  linkedProblemValidationCode: string | null;
  updatedAt: string;
};

export interface FeasibilityLookups {
  technologyMaturities: string[];
  technicalComplexities: string[];
  trlLevels: string[];
  requiredTechnologies: string[];
  infrastructureAvailability: string[];
  targetMarkets: string[];
  customerSegments: string[];
  applicableStandards: string[];
  certifications: string[];
  freedomToOperate: string[];
  investmentPriorities: string[];
  recommendedActions: string[];
  overallRecommendations: string[];
  approvalDecisions: string[];
  fundingApprovals: string[];
  projectManagers: string[];
  teamMembers: string[];
  internalExperts: string[];
  externalExperts: string[];
  laboratories: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
}

/* ===========================================================================
   Proof of Concept — PoC (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   The technical-validation gateway. One record per full PoC project, created
   from an approved Feasibility Study. Embeds the 5 build/test stages (Technical
   Implementation → Build & Integration → Experimental Testing → Commercial
   Assessment → Final Review), the section shapes, the AI PoC Assessment, the
   PoC Summary, reviewers and the audit trail. Distinct from PocProjectRecord's
   lightweight `proof_of_concept` breadcrumb (auto-created on FS approval).
   =========================================================================== */

export type PocStatus =
  | "draft"
  | "technical_implementation"
  | "build_integration"
  | "experimental_testing"
  | "commercial_assessment"
  | "final_review"
  | "approved"
  | "conditional_approval"
  | "revision_required"
  | "rejected"
  | "archived";

export type PocStage =
  | "technical_implementation"
  | "build_integration"
  | "experimental_testing"
  | "commercial_assessment"
  | "final_review";

export interface PocStageState {
  stage: PocStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — PoC Overview. */
export interface PocOverview {
  objective: string;
  problemBeingSolved: string;
  proposedSolution: string;
  successCriteria: string;
  scope: string;
  assumptions: string;
  constraints: string;
}

/** Section 2 — Technical Implementation. */
export interface PocTechnical {
  technologyStack: string[];
  hardwareComponents: string;
  softwareComponents: string;
  architecture: string;
  prototypeLevel: string;
  engineeringApproach: string;
  integrationRequirements: string;
}

/** Section 3 — Experimental Plan. */
export interface PocExperimental {
  experimentObjective: string;
  testMethod: string;
  testEnvironment: string;
  variables: string;
  performanceParameters: string;
  acceptanceCriteria: string;
  testScheduleStart: string;
  testScheduleEnd: string;
}

/** Section 4 — Resources. */
export interface PocResources {
  projectTeam: string[];
  technicalExperts: string[];
  laboratory: string;
  equipmentRequired: string;
  softwareTools: string[];
  budgetApproved: number;
  budgetUtilized: number;
  // remainingBudget computed = approved - utilized
}

/** Section 5 — Test Results (ratings 1..10; efficiency is %). */
export interface PocTestResults {
  functionalValidation: number;
  performanceValidation: number;
  reliability: number;
  efficiency: number; // %
  safetyValidation: number;
  complianceValidation: number;
  observations: string;
}

/** Section 6 — Issues & Improvements. */
export interface PocIssues {
  technicalIssues: string;
  rootCause: string;
  correctiveActions: string;
  lessonsLearned: string;
  improvementSuggestions: string;
}

/** Section 7 — Commercial Assessment (ratings 1..10). */
export interface PocCommercial {
  customerAcceptance: number;
  marketReadiness: number;
  scalability: number;
  manufacturingReadiness: number;
  commercialViability: number;
  goToMarketReadiness: number;
}

/** Section 8 — AI PoC Assessment (computed; single source of truth for the
 *  sidebar Key Scores + AI Success Probability). */
export interface PocAIAssessment {
  aiTechnicalScore: number; // /100
  aiPerformanceScore: number;
  aiReliabilityScore: number;
  aiCommercialScore: number;
  aiSuccessProbability: number; // %
  recommendations: string;
  improvementSuggestions: string;
  /** Stage outputs (deterministic). */
  architectureAssessment: string;
  designRisks: string;
  integrationStatus: string;
  readinessScore: number; // /100
  generatedAt: string;
}

export type PocTRL =
  | "TRL 4 - Validated in Lab"
  | "TRL 5 - Validated in Relevant Environment"
  | "TRL 6 - Demonstrated in Relevant Environment"
  | "TRL 7 - System Prototype Demonstration";

/** PoC Summary — computed scores + recommendation. */
export interface PocSummary {
  technicalScore: number; // /100
  performanceScore: number;
  commercialScore: number;
  riskScore: number; // /100 (higher = safer)
  overallPocScore: number;
  technologyReadinessLevel: PocTRL;
  recommendation: string;
}

export interface PocAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface PocReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type PocApprovalDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "On Hold" | "Rejected";

export interface PocAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: PocStage;
  fromStatus?: PocStatus;
  toStatus?: PocStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface PocFormInput {
  pocTitle: string;
  businessUnit: string;
  department: string;
  projectManager: string;
  pocStartDate: string;
  linkedFeasibilityStudyId?: string | null;
  overview: PocOverview;
  technical: PocTechnical;
  experimental: PocExperimental;
  resources: PocResources;
  testResults: PocTestResults;
  issues: PocIssues;
  commercial: PocCommercial;
  attachments: PocAttachment[];
  recommendation: string;
}

export interface PocProjectRecord {
  id: string;
  pocId: string; // POC-2026-0056
  formCode: string; // POC-2026-25
  status: PocStatus;
  currentStage: PocStage;
  currentStageLabel: string;
  stages: PocStageState[];
  progressPercentage: number;
  version: number;
  pocTitle: string;
  businessUnit: string;
  department: string;
  projectManager: string;
  pocStartDate: string;
  // Linked upstream records (resolved).
  linkedFeasibilityStudyId: string | null;
  linkedFeasibilityStudyCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  linkedTechnologyId: string | null;
  linkedTechnologyCode: string | null;
  overview: PocOverview;
  technical: PocTechnical;
  experimental: PocExperimental;
  resources: PocResources;
  testResults: PocTestResults;
  issues: PocIssues;
  commercial: PocCommercial;
  aiAssessment: PocAIAssessment;
  summary: PocSummary;
  attachments: PocAttachment[];
  reviewers: PocReviewer[];
  approvalDecision: PocApprovalDecision | null;
  reviewNextAction: string | null;
  reviewComments: string | null;
  reviewConditions: string | null;
  approvalDate: string | null;
  nextAction: string;
  prototypeProjectId: string | null;
  prototypeProjectCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: PocAuditEntry[];
}

export type PocListRow = {
  id: string;
  pocId: string;
  formCode: string;
  pocTitle: string;
  status: PocStatus;
  projectManager: string;
  progressPercentage: number;
  overallPocScore: number;
  aiSuccessProbability: number;
  linkedFeasibilityStudyCode: string | null;
  updatedAt: string;
};

export interface PocLookups {
  prototypeLevels: string[];
  engineeringApproaches: string[];
  testMethods: string[];
  testEnvironments: string[];
  technologyStack: string[];
  softwareTools: string[];
  laboratories: string[];
  recommendations: string[];
  approvalDecisions: string[];
  nextActions: string[];
  projectManagers: string[];
  teamMembers: string[];
  technicalExperts: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
}

/* ===========================================================================
   Prototype Development (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   The engineering-realization stage. One record per full prototype project,
   created from an approved PoC. Embeds the 4 engineering stages (Engineering
   Design → Prototype Manufacturing → Testing & Validation → Engineering
   Review), the section shapes, the AI Engineering Assessment, the Prototype
   Summary, reviewers and the audit trail. Distinct from the lightweight
   `prototype_development` breadcrumb (auto-created on PoC approval).
   =========================================================================== */

export type PrototypeStatus =
  | "draft"
  | "engineering_design"
  | "prototype_manufacturing"
  | "testing_validation"
  | "engineering_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type PrototypeStage =
  "engineering_design" | "prototype_manufacturing" | "testing_validation" | "engineering_review";

export interface PrototypeStageState {
  stage: PrototypeStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Prototype Overview. */
export interface PrototypeOverview {
  prototypeCategory: string;
  prototypeType: string;
  engineeringDiscipline: string[];
  designObjective: string;
  successCriteria: string;
  prototypeObjective: string;
  productDescription: string;
}

/** Section 2 — Product Architecture. */
export interface PrototypeArchitecture {
  systemArchitecture: string;
  mechanicalDesign: string;
  electricalDesign: string;
  electronicsDesign: string;
  embeddedSoftware: string;
  firmwareVersion: string;
  communicationProtocols: string[];
  systemInterfaces: string;
}

export interface PrototypeDesignFile {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string;
}

/** Section 3 — Engineering Design. */
export interface PrototypeEngineering {
  designFiles: PrototypeDesignFile[];
  materialSpecification: string;
  designStandards: string[];
}

/** Section 4 — Prototype Manufacturing. */
export interface PrototypeManufacturing {
  manufacturingMethod: string;
  prototypeQuantity: number;
  manufacturingPartner: string;
  fabricationStatus: string;
  assemblyStatus: string;
  qualityInspection: string;
  manufacturingCost: number;
}

/** Section 5 — Testing & Validation (ratings 1..10; score computed). */
export interface PrototypeTesting {
  functionalTest: number;
  performanceTest: number;
  reliabilityTest: number;
  safetyTest: number;
  emcEmiTest: number;
  environmentalTest: number;
  complianceTest: number;
  validationSummary: string;
}

/** Section 6 — Design Improvements. */
export interface PrototypeImprovements {
  designIssues: string;
  rootCause: string;
  engineeringChanges: string;
  designOptimization: string;
  lessonsLearned: string;
  futureImprovements: string;
}

/** Section 7 — Commercial Readiness. */
export interface PrototypeCommercial {
  manufacturingReadinessLevel: string;
  technologyReadinessLevel: string;
  costOptimization: number; // rating 1..10
  productionScalability: number;
  serviceability: number;
  customerDemonstrationReady: boolean;
}

/** Section 8 — AI Engineering Assessment (computed; single source of truth for
 *  section 9 + the sidebar Key Scores). */
export interface PrototypeAIAssessment {
  aiDesignQualityScore: number; // /100
  aiManufacturingScore: number;
  aiReliabilityScore: number;
  aiComplianceScore: number;
  aiRiskScore: number;
  aiReadinessScore: number;
  recommendations: string;
  /** Stage outputs (deterministic). */
  manufacturabilityAnalysis: string;
  riskAssessment: string;
  designOptimizationSuggestions: string;
  costAnalysis: string;
  improvementRecommendations: string;
  generatedAt: string;
}

/** Section 9 — Prototype Summary (computed scores + recommendation). */
export interface PrototypeSummary {
  engineeringScore: number; // /100
  validationScore: number;
  manufacturingScore: number;
  commercialReadinessScore: number;
  overallPrototypeScore: number;
  recommendation: string;
}

export interface PrototypeAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface PrototypeReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type PrototypeApprovalDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "On Hold" | "Rejected";

export interface PrototypeAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: PrototypeStage;
  fromStatus?: PrototypeStatus;
  toStatus?: PrototypeStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface PrototypeFormInput {
  prototypeName: string;
  businessUnit: string;
  department: string;
  prototypeOwner: string;
  developmentStartDate: string;
  targetCompletion: string;
  linkedPocId?: string | null;
  overview: PrototypeOverview;
  architecture: PrototypeArchitecture;
  engineering: PrototypeEngineering;
  manufacturing: PrototypeManufacturing;
  testing: PrototypeTesting;
  improvements: PrototypeImprovements;
  commercial: PrototypeCommercial;
  attachments: PrototypeAttachment[];
  recommendation: string;
}

export interface PrototypeProjectRecord {
  id: string;
  prototypeId: string; // PRD-2026-00078
  formCode: string; // PRD-2026-25
  status: PrototypeStatus;
  currentStage: PrototypeStage;
  currentStageLabel: string;
  stages: PrototypeStageState[];
  progressPercentage: number;
  prototypeVersion: string; // e.g. "1.2"
  version: number;
  prototypeName: string;
  businessUnit: string;
  department: string;
  prototypeOwner: string;
  developmentStartDate: string;
  targetCompletion: string;
  // Linked upstream records (resolved).
  linkedPocId: string | null;
  linkedPocCode: string | null;
  linkedFeasibilityStudyId: string | null;
  linkedFeasibilityStudyCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  overview: PrototypeOverview;
  architecture: PrototypeArchitecture;
  engineering: PrototypeEngineering;
  manufacturing: PrototypeManufacturing;
  testing: PrototypeTesting;
  improvements: PrototypeImprovements;
  commercial: PrototypeCommercial;
  aiAssessment: PrototypeAIAssessment;
  summary: PrototypeSummary;
  attachments: PrototypeAttachment[];
  reviewers: PrototypeReviewer[];
  approvalDecision: PrototypeApprovalDecision | null;
  reviewNextAction: string | null;
  reviewComments: string | null;
  reviewConditions: string | null;
  approvalDate: string | null;
  nextAction: string;
  engineeringValidationId: string | null;
  engineeringValidationCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: PrototypeAuditEntry[];
}

export type PrototypeListRow = {
  id: string;
  prototypeId: string;
  formCode: string;
  prototypeName: string;
  status: PrototypeStatus;
  prototypeOwner: string;
  progressPercentage: number;
  overallPrototypeScore: number;
  prototypeVersion: string;
  linkedPocCode: string | null;
  updatedAt: string;
};

export interface PrototypeLookups {
  prototypeCategories: string[];
  prototypeTypes: string[];
  engineeringDisciplines: string[];
  communicationProtocols: string[];
  designStandards: string[];
  manufacturingMethods: string[];
  fabricationStatuses: string[];
  assemblyStatuses: string[];
  qualityInspectionStatuses: string[];
  manufacturingReadinessLevels: string[];
  technologyReadinessLevels: string[];
  recommendations: string[];
  approvalDecisions: string[];
  nextActions: string[];
  manufacturingPartners: string[];
  prototypeOwners: string[];
  businessUnits: string[];
  departments: string[];
  attachmentCategories: string[];
}

/* ===========================================================================
   Experiment Management (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   The evidence-generation stage. One record per experiment, created from an
   approved Prototype. Embeds the 5 stages (Experiment Planning → Laboratory
   Preparation → Experiment Execution → Validation → Technical Review), the 12
   section shapes, the AI Experiment Assessment, the Experiment Summary,
   reviewers and the audit trail.
   =========================================================================== */

export type ExperimentStatus =
  | "draft"
  | "experiment_planning"
  | "laboratory_preparation"
  | "experiment_execution"
  | "validation"
  | "technical_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type ExperimentStage =
  | "experiment_planning"
  | "laboratory_preparation"
  | "experiment_execution"
  | "validation"
  | "technical_review";

export interface ExperimentStageState {
  stage: ExperimentStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Experiment Overview. */
export interface ExperimentOverview {
  objective: string;
  hypothesis: string;
  engineeringProblem: string;
  scope: string;
  expectedOutcome: string;
  successCriteria: string;
  priority: string; // Low | Medium | High
}

/** Section 2 — Experimental Design. */
export interface ExperimentDesign {
  experimentMethod: string;
  testProcedure: string;
  independentVariables: string;
  dependentVariables: string;
  controlledVariables: string;
  sampleSize: number;
  numberOfTrials: number;
  statisticalMethod: string;
}

/** Section 3 — Test Environment. */
export interface ExperimentEnvironment {
  testBench: string;
  equipmentUsed: string[];
  instrumentCalibration: boolean;
  environmentalConditions: string;
  softwareTools: string[];
  safetyChecklist: string;
}

/** Section 4 — Resource Planning. */
export interface ExperimentResources {
  projectTeam: string[];
  technicalExperts: string[];
  materialsRequired: string;
  budgetApproved: number;
  budgetUtilized: number;
  // remainingBudget computed = approved - utilized
  // experimentDuration computed from start/end dates
}

export interface ExperimentFile {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string;
}

/** Section 5 — Experimental Observations. */
export interface ExperimentObservations {
  trialNumber: number;
  totalTrials: number;
  observations: string;
  measurements: string; // key-value list as text
  anomalies: string;
  rawDataFiles: ExperimentFile[];
  imageFiles: ExperimentFile[];
  videoFiles: ExperimentFile[];
  sensorDataFiles: ExperimentFile[];
}

/** Section 6 — Data Analysis. */
export interface ExperimentDataAnalysis {
  dataProcessingMethod: string;
  statisticalAnalysis: string;
  performanceMetrics: string;
  varianceAnalysis: string;
  rootCauseAnalysis: string;
  interpretation: string;
  chartFiles: ExperimentFile[];
}

/** Section 7 — Validation Results (accuracy/precision %, ratings 1..10). */
export interface ExperimentValidation {
  objectiveAchieved: boolean;
  accuracy: number; // %
  precision: number; // %
  repeatability: number; // rating 1..10
  reliability: number;
  compliance: number;
  validationSummary: string;
}

/** Section 8 — AI Experiment Assessment (computed; single source of truth for
 *  section 9 + the sidebar Key Scores / AI confidence). */
export interface ExperimentAIAssessment {
  aiExperimentScore: number; // /100
  aiDataQualityScore: number; // /100
  aiConfidenceLevel: number; // %
  trendAnalysis: string;
  failurePrediction: string;
  optimizationSuggestions: string;
  recommendation: string;
  /** Stage outputs (deterministic). */
  experimentalDesignScore: number; // /100
  sampleSizeRecommendation: string;
  riskAssessment: string;
  statisticalConfidence: number; // %
  repeatabilityScore: number; // /100
  generatedAt: string;
}

/** Section 9 — Experiment Summary (computed scores + recommendation). */
export interface ExperimentSummary {
  technicalScore: number; // /100
  statisticalConfidence: number; // %
  validationScore: number; // /100
  overallExperimentScore: number; // /100
  recommendation: string;
}

export interface ExperimentAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface ExperimentReviewer {
  role: string;
  name: string;
  status: "reviewed" | "pending";
  date: string | null;
}

export type ExperimentApprovalDecision =
  "Approved" | "Approved with Conditions" | "Revision Required" | "On Hold" | "Rejected";

export interface ExperimentAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: ExperimentStage;
  fromStatus?: ExperimentStatus;
  toStatus?: ExperimentStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface ExperimentFormInput {
  experimentTitle: string;
  experimentCategory: string;
  laboratory: string;
  principalInvestigator: string;
  startDate: string;
  endDate: string;
  linkedPrototypeId?: string | null;
  overview: ExperimentOverview;
  design: ExperimentDesign;
  environment: ExperimentEnvironment;
  resources: ExperimentResources;
  observations: ExperimentObservations;
  dataAnalysis: ExperimentDataAnalysis;
  validation: ExperimentValidation;
  attachments: ExperimentAttachment[];
  recommendation: string;
}

export interface ExperimentProjectRecord {
  id: string;
  experimentId: string; // EXP-2026-0096
  formCode: string; // EXP-2026-25
  status: ExperimentStatus;
  currentStage: ExperimentStage;
  currentStageLabel: string;
  stages: ExperimentStageState[];
  progressPercentage: number;
  version: number;
  experimentTitle: string;
  experimentCategory: string;
  laboratory: string;
  principalInvestigator: string;
  startDate: string;
  endDate: string;
  // Linked upstream records (resolved).
  linkedPrototypeId: string | null;
  linkedPrototypeCode: string | null;
  linkedPocId: string | null;
  linkedPocCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  overview: ExperimentOverview;
  design: ExperimentDesign;
  environment: ExperimentEnvironment;
  resources: ExperimentResources;
  observations: ExperimentObservations;
  dataAnalysis: ExperimentDataAnalysis;
  validation: ExperimentValidation;
  aiAssessment: ExperimentAIAssessment;
  summary: ExperimentSummary;
  attachments: ExperimentAttachment[];
  reviewers: ExperimentReviewer[];
  approvalDecision: ExperimentApprovalDecision | null;
  reviewNextAction: string | null;
  reviewComments: string | null;
  reviewConditions: string | null;
  approvalDate: string | null;
  nextAction: string;
  engineeringValidationId: string | null;
  engineeringValidationCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: ExperimentAuditEntry[];
}

export type ExperimentListRow = {
  id: string;
  experimentId: string;
  formCode: string;
  experimentTitle: string;
  experimentCategory: string;
  status: ExperimentStatus;
  principalInvestigator: string;
  progressPercentage: number;
  overallExperimentScore: number;
  linkedPrototypeCode: string | null;
  updatedAt: string;
};

export interface ExperimentLookups {
  experimentCategories: string[];
  experimentMethods: string[];
  statisticalMethods: string[];
  dataProcessingMethods: string[];
  laboratories: string[];
  testBenches: string[];
  equipment: string[];
  softwareTools: string[];
  priorities: string[];
  recommendations: string[];
  approvalDecisions: string[];
  nextActions: string[];
  principalInvestigators: string[];
  teamMembers: string[];
  technicalExperts: string[];
  attachmentCategories: string[];
}

/* ===========================================================================
   Patent Management (Development → IP Development → Patent Management)
   ---------------------------------------------------------------------------
   One record per patent. Created from an approved IP record. Embeds the 5
   lifecycle stages (Preparation → Filing → Examination → Grant →
   Commercialization), the 12 section shapes, the AI Patent Analytics, the
   Patent Summary, the review table and the audit trail. Genuinely date-driven:
   Next Action, Response-Due alert and Renewal Status are all computed.
   =========================================================================== */

export type PatentStatus =
  | "draft"
  | "preparation"
  | "filing"
  | "examination"
  | "granted"
  | "commercialization"
  | "active"
  | "revision_required"
  | "abandoned"
  | "closed";

export type PatentStage =
  | "preparation"
  | "filing"
  | "examination"
  | "grant"
  | "commercialization";

export interface PatentStageState {
  stage: PatentStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Patent Information. */
export interface PatentInformation {
  abstract: string;
  patentType: string;
  technologyArea: string;
  industrySector: string;
  keywords: string[];
  patentStatus: string;
}

/** Section 2 — Inventor Information. */
export interface PatentInventors {
  leadInventor: string;
  coInventors: string[];
  organization: string;
  ownership: string;
  assignmentAgreement: boolean;
  ndaSigned: boolean;
}

export interface PatentFile {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string;
}

/** Section 3 — Patent Filing. */
export interface PatentFiling {
  filingRoute: string;
  filingCountries: string[];
  patentOffice: string;
  filingAttorney: string;
  filingCost: number;
  filingReceipt: PatentFile | null;
  priorityDate: string;
  publicationDate: string;
}

/** Section 4 — Patent Prosecution (Response Due Date is deadline-tracked). */
export interface PatentProsecution {
  examiner: string;
  officeAction: string;
  officeActionDate: string;
  responseDueDate: string;
  responseSubmitted: boolean;
  amendmentRequired: boolean;
  currentStage: string;
}

/** Section 5 — Patent Grant (Renewal Status derived from grant + frequency). */
export interface PatentGrant {
  grantNumber: string;
  grantDate: string;
  expiryDate: string;
  patentTerm: number; // years
  renewalFrequency: string;
  renewalCostNext: number;
}

/** Section 6 — International Protection. */
export interface PatentInternational {
  pctFiled: boolean;
  pctNumber: string;
  nationalPhaseCountries: string[];
  epFiling: boolean;
  usFiling: boolean;
  indiaFiling: boolean;
  otherJurisdictions: string[];
}

/** Section 7 — Commercialization. */
export interface PatentCommercialization {
  licensingStatus: string;
  licensee: string;
  royaltyModel: string;
  annualRoyalty: number;
  technologyTransfer: boolean;
  strategicImportance: number; // 1..10 stars
  commercialValue: number;
}

/** Section 8 — AI Patent Analytics (computed; single source of truth for
 *  section 9. Litigation risk: lower is better. No LLM, nothing hardcoded). */
export interface PatentAIAnalytics {
  patentStrengthScore: number; // /100
  claimQualityScore: number; // /100
  litigationRisk: number; // /100 (lower = better)
  licensingPotential: number; // /100
  commercialScore: number; // /100
  renewalRecommendation: string;
  portfolioRecommendation: string;
  /** Stage outputs. */
  noveltyAssessment: string;
  inventiveStepAnalysis: string;
  suggestedClaimImprovements: string;
  objectionAnalysis: string;
  suggestedResponses: string;
  grantProbability: number; // %
  portfolioImportance: string;
  generatedAt: string;
}

export type PatentRenewalState = "Upcoming" | "Due" | "Overdue" | "Paid" | "N/A";
export type PatentDeadlineTone = "ok" | "soon" | "due" | "overdue" | "none";

/** Computed deadline state (Response Due, Renewal, Target Grant, Expiry). */
export interface PatentDeadlines {
  responseDueTone: PatentDeadlineTone;
  responseDaysLeft: number | null;
  renewalState: PatentRenewalState;
  renewalDueDate: string | null;
  renewalDaysLeft: number | null;
  targetGrantTone: PatentDeadlineTone;
  targetGrantDaysLeft: number | null;
  expiryTone: PatentDeadlineTone;
  expiryDaysLeft: number | null;
}

/** Section 9 — Patent Summary (computed scores + recommendation). */
export interface PatentSummary {
  legalScore: number; // /100
  patentStrengthScore: number; // /100
  commercialScore: number; // /100
  portfolioScore: number; // /100
  overallPatentScore: number; // /100
  recommendation: string;
}

export interface PatentAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** Section 11 — Review & Approval TABLE row (not chips). */
export interface PatentReviewRow {
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected";
  comments: string;
  status: "Reviewed" | "Pending";
  date: string | null;
}

export type PatentApprovalDecision =
  | "Approved"
  | "Approved with Recommendations"
  | "Revision Required"
  | "Abandon Patent";

export interface PatentAuditEntry {
  at: string;
  actor: string;
  event: string;
  kind?: "audit" | "activity" | "change" | "workflow";
  stage?: PatentStage;
  fromStatus?: PatentStatus;
  toStatus?: PatentStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface PatentFormInput {
  patentTitle: string;
  technologyDomain: string;
  inventors: string[];
  patentManager: string;
  filingDate: string;
  targetGrantDate: string;
  linkedIpRecordId?: string | null;
  information: PatentInformation;
  inventorInfo: PatentInventors;
  filing: PatentFiling;
  prosecution: PatentProsecution;
  grant: PatentGrant;
  international: PatentInternational;
  commercialization: PatentCommercialization;
  attachments: PatentAttachment[];
  recommendation: string;
}

export interface PatentRecord {
  id: string;
  patentId: string; // PAT-2026-0125
  patentNumber: string; // IN202641012345
  applicationNumber: string;
  formCode: string;
  status: PatentStatus;
  currentStage: PatentStage;
  currentStageLabel: string;
  stages: PatentStageState[];
  patentFamily: string;
  version: number;
  patentTitle: string;
  technologyDomain: string;
  inventors: string[];
  patentManager: string;
  filingDate: string;
  targetGrantDate: string;
  // Linked upstream records (resolved).
  linkedIpRecordId: string | null;
  linkedIpRecordCode: string | null;
  linkedProductId: string | null;
  linkedProductCode: string | null;
  information: PatentInformation;
  inventorInfo: PatentInventors;
  filing: PatentFiling;
  prosecution: PatentProsecution;
  grant: PatentGrant;
  international: PatentInternational;
  commercialization: PatentCommercialization;
  aiAnalytics: PatentAIAnalytics;
  summary: PatentSummary;
  deadlines: PatentDeadlines;
  nextAction: string;
  submittedForReview: boolean;
  attachments: PatentAttachment[];
  reviewRows: PatentReviewRow[];
  approvalDecision: PatentApprovalDecision | null;
  reviewComments: string | null;
  approvalDate: string | null;
  portfolioEntryId: string | null;
  portfolioEntryCode: string | null;
  licensingRecordId: string | null;
  licensingRecordCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: PatentAuditEntry[];
}

export type PatentListRow = {
  id: string;
  patentId: string;
  patentNumber: string;
  patentTitle: string;
  status: PatentStatus;
  patentManager: string;
  overallPatentScore: number;
  nextAction: string;
  renewalState: PatentRenewalState;
  responseDueTone: PatentDeadlineTone;
  updatedAt: string;
};

export interface PatentLookups {
  patentTypes: string[];
  technologyAreas: string[];
  technologyDomains: string[];
  industrySectors: string[];
  patentStatuses: string[];
  ownerships: string[];
  organizations: string[];
  filingRoutes: string[];
  filingCountries: string[];
  patentOffices: string[];
  filingAttorneys: string[];
  officeActions: string[];
  prosecutionStages: string[];
  renewalFrequencies: string[];
  licensingStatuses: string[];
  royaltyModels: string[];
  recommendations: string[];
  approvalDecisions: string[];
  patentManagers: string[];
  inventors: string[];
  jurisdictions: string[];
  keywordSuggestions: string[];
  attachmentCategories: string[];
}

// ---------------------------------------------------------------------------
// TRL Assessment module
// ---------------------------------------------------------------------------

export type TrlLevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TrlStatus =
  | "draft"
  | "technology_assessment"
  | "technical_validation"
  | "demonstration_review"
  | "risk_commercial_assessment"
  | "executive_review"
  | "approved"
  | "approved_with_improvements"
  | "revision_required"
  | "rejected"
  | "archived";

export type TrlStage =
  | "technology_assessment"
  | "technical_validation"
  | "demonstration_review"
  | "risk_commercial_assessment"
  | "executive_review";

export type TrlApprovalDecision = "Approved" | "Approved with Improvements" | "Revision Required" | "Rejected";

export interface TrlStageState {
  stage: TrlStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TrlTechnologyInfo {
  technologyName: string;
  technologyDomain: string;
  technologyDescription: string;
  productCategory: string;
  applicationArea: string[];
  innovationType: string;
  strategicImportance: number; // 1-5 stars
}

export interface TrlCurrentAssessment {
  currentTrlLevel: TrlLevelNumber;
  previousTrlLevel: TrlLevelNumber;
  targetTrlLevel: TrlLevelNumber;
  assessmentMethod: string;
  assessmentEvidence: string;
  assessmentScore: number; // /100
  confidenceLevel: number; // %
}

export interface TrlTechnicalValidation {
  scientificValidation: number; // 1-5 stars
  laboratoryValidation: number; // 1-5 stars
  prototypeValidation: number; // 1-5 stars
  systemIntegration: number; // 1-5 stars
  functionalDemonstration: number; // 1-5 stars
  environmentalValidation: number; // 1-5 stars
  validationEvidence: string;
}

export interface TrlTechnologyDemonstration {
  demonstrationEnvironment: string;
  testResults: string;
  performanceMetrics: string;
  reliabilityResults: string;
  safetyAssessment: number; // 1-5 stars
  complianceStatus: string;
  demonstrationOutcome: string;
}

export interface TrlRiskAssessment {
  technicalRisk: number; // 1-5 stars
  manufacturingRisk: number; // 1-5 stars
  supplyChainRisk: number; // 1-5 stars
  regulatoryRisk: number; // 1-5 stars
  commercialRisk: number; // 1-5 stars
  overallRiskScore: number; // /100 (lower is better)
  riskMitigationPlan: string;
}

export interface TrlCommercialReadiness {
  mrlLevel: number; // 1-10 (MRL 3)
  marketReadiness: number; // 1-5 stars
  customerValidation: number; // 1-5 stars
  investmentReadiness: number; // 1-5 stars
  businessReadiness: number; // 1-5 stars
  commercialPotential: number; // 1-5 stars
  goToMarketStatus: string;
}

export interface TrlAIAssessment {
  aiTechnologyScore: number; // /100
  aiReadinessPrediction: "On Track" | "Needs Attention" | "At Risk";
  aiTechnicalGapAnalysis: string;
  aiDevelopmentRoadmap: string;
  aiRiskPrediction: string;
  aiRecommendation: string;
  aiEstimatedTimeToNextTrl: string;
}

export interface TrlSummary {
  overallTechnicalScore: number; // /100
  validationScore: number; // /100
  commercialScore: number; // /100
  riskScore: number; // /100 (Polarity explicit: 32 Risk / 68 Safety Control)
  finalTrlScore: number; // /100
  recommendedTrlLevel: string; // e.g. "TRL 6"
  recommendation: string;
}

export interface TrlAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface TrlReviewRow {
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Revision Required" | "Rejected";
  status: "Approved" | "In Review" | "Pending" | "Revision Requested";
  date: string;
}

export interface TrlAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  kind?: "audit" | "activity" | "change" | "workflow";
  stage?: TrlStage;
  fromStatus?: TrlStatus;
  toStatus?: TrlStatus;
}

export interface TrlFormInput {
  assessmentTitle: string;
  businessUnit: string;
  assessmentTeam: string[];
  assessmentDate: string;
  linkedTechnologyId?: string | null;
  linkedResearchProjectId?: string | null;
  linkedPrototypeId?: string | null;
  linkedProductId?: string | null;
  technologyInfo: TrlTechnologyInfo;
  currentAssessment: TrlCurrentAssessment;
  technicalValidation: TrlTechnicalValidation;
  technologyDemonstration: TrlTechnologyDemonstration;
  riskAssessment: TrlRiskAssessment;
  commercialReadiness: TrlCommercialReadiness;
  attachments: TrlAttachment[];
  recommendationOverride?: string;
}

export interface TrlAssessmentRecord {
  id: string;
  trlAssessmentId: string; // e.g. TRL-2024-0087
  formCode: string; // e.g. TRL-2024-25
  assessmentTitle: string;
  status: TrlStatus;
  currentStage: TrlStage;
  currentStageLabel: string;
  stages: TrlStageState[];
  version: string;
  businessUnit: string;
  assessmentTeam: string[];
  assessmentDate: string;
  // Linked records (resolved)
  linkedTechnologyId: string | null;
  linkedTechnologyCode: string | null;
  linkedResearchProjectId: string | null;
  linkedResearchProjectCode: string | null;
  linkedPrototypeId: string | null;
  linkedPrototypeCode: string | null;
  linkedProductId: string | null;
  linkedProductCode: string | null;
  // Form sections
  technologyInfo: TrlTechnologyInfo;
  currentAssessment: TrlCurrentAssessment;
  technicalValidation: TrlTechnicalValidation;
  technologyDemonstration: TrlTechnologyDemonstration;
  riskAssessment: TrlRiskAssessment;
  commercialReadiness: TrlCommercialReadiness;
  aiAssessment: TrlAIAssessment;
  summary: TrlSummary;
  attachments: TrlAttachment[];
  reviewRows: TrlReviewRow[];
  approvalDecision: TrlApprovalDecision | null;
  reviewComments: string | null;
  approvalDate: string | null;
  // Created MRL linkage if approved
  linkedMrlAssessmentId?: string | null;
  linkedMrlAssessmentCode?: string | null;
  // System info
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: TrlAuditEntry[];
}

export type TrlListRow = {
  id: string;
  trlAssessmentId: string;
  assessmentTitle: string;
  technologyName: string;
  currentTrlLevel: number;
  targetTrlLevel: number;
  status: TrlStatus;
  finalTrlScore: number;
  recommendedTrlLevel: string;
  updatedAt: string;
};

export interface TrlLookups {
  technologyDomains: string[];
  productCategories: string[];
  applicationAreas: string[];
  innovationTypes: string[];
  assessmentMethods: string[];
  demonstrationEnvironments: string[];
  complianceStatuses: string[];
  goToMarketStatuses: string[];
  businessUnits: string[];
  recommendations: string[];
  trlLevels: { level: number; descriptor: string }[];
  mrlLevels: { level: number; descriptor: string }[];
}

// ---------------------------------------------------------------------------
// Commercialization Planning module
// ---------------------------------------------------------------------------

export type CommercializationStatus =
  | "draft"
  | "product_readiness"
  | "manufacturing_supply_chain"
  | "sales_marketing_planning"
  | "executive_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type CommercializationStage =
  | "product_readiness"
  | "manufacturing_supply_chain"
  | "sales_marketing_planning"
  | "executive_review";

export type CommercializationApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface CommercializationStageState {
  stage: CommercializationStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface CommercializationProductOverview {
  productName: string;
  productCategory: string;
  productDescription: string;
  targetIndustry: string;
  targetCustomers: string[];
  valueProposition: string;
  competitiveAdvantage: string;
}

export interface CommercializationMarketAnalysis {
  tamAmount: number; // TAM currency
  samAmount: number; // SAM currency
  somAmount: number; // SOM currency
  customerSegments: string;
  competitorAnalysis: string;
  marketEntryStrategy: string;
  demandForecast5Yr: number; // Currency
}

export interface CommercializationProductReadiness {
  inheritedTrl: string; // e.g. "TRL 6 – Technology Demonstrated in Relevant Environment"
  inheritedMrl: string; // e.g. "MRL 4 – Pilot Line Capability"
  certificationStatus: string;
  regulatoryCompliance: string;
  productValidationStatus: string;
  productionReadiness: string;
  launchReadinessScore: number; // /100
}

export interface CommercializationManufacturingSupplyChain {
  manufacturingStrategy: string;
  productionCapacityAnnual: string; // e.g. "2,500 Units / Year"
  contractManufacturer: string;
  keySuppliers: string[];
  procurementStatus: string;
  inventoryReadiness: string;
  distributionNetwork: string;
}

export interface CommercializationFinancialPlanning {
  initialInvestment: number;
  manufacturingCostPerUnit: number;
  sellingPricePerUnit: number;
  revenueProjection5Yr: number;
  breakEvenPeriodMonths: number;
  grossMarginPct: number; // computed: ((price - cost)/price)*100
  roiPct: number; // computed
}

export interface CommercializationSalesMarketing {
  salesModel: string;
  pricingStrategy: string;
  marketingChannels: string[];
  distributionChannels: string[];
  brandingStrategy: string;
  launchCampaign: string;
  customerSupportStrategy: string;
}

export interface CommercializationPartnerships {
  strategicPartners: string[];
  technologyPartners: string[];
  manufacturingPartners: string[];
  channelPartners: string[];
  governmentSupport: string[];
  investors: string[];
  partnershipStatus: string;
}

export interface CommercializationRiskAssessment {
  technicalRisk: number; // 1-5 stars
  marketRisk: number; // 1-5 stars
  financialRisk: number; // 1-5 stars
  operationalRisk: number; // 1-5 stars
  regulatoryRisk: number; // 1-5 stars
  overallRiskScore: number; // /100 (lower is better)
  riskMitigationPlan: string;
}

export interface CommercializationAIAnalytics {
  aiMarketOpportunityScore: number; // /100
  aiLaunchReadinessScore: number; // /100
  aiRevenueForecast5Yr: number; // currency
  aiCustomerAdoptionPredictionPct: number; // %
  aiCompetitivePositionScore: number; // /100
  aiGrowthStrategy: string;
  aiRecommendations: string;
}

export interface CommercializationSummary {
  productReadinessScore: number; // /100
  marketReadinessScore: number; // /100
  financialReadinessScore: number; // /100
  commercializationScore: number; // /100
  riskControlScore: number; // /100 (100 - riskScore)
  overallLaunchReadiness: number; // /100
  recommendedAction: string;
  recommendationText: string;
}

export interface CommercializationAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface CommercializationReviewRow {
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Revision Required" | "Rejected";
  status: "Approved" | "In Review" | "Pending" | "Revision Requested";
  date: string;
}

export interface CommercializationAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  kind?: "audit" | "activity" | "change" | "workflow";
  stage?: CommercializationStage;
  fromStatus?: CommercializationStatus;
  toStatus?: CommercializationStatus;
}

export interface CommercializationFormInput {
  commercializationProject: string;
  businessUnit: string;
  commercializationManager: string;
  launchTargetDate: string;
  linkedProductId?: string | null;
  linkedTechnologyId?: string | null;
  linkedPatentId?: string | null;
  linkedBusinessCaseId?: string | null;
  productOverview: CommercializationProductOverview;
  marketAnalysis: CommercializationMarketAnalysis;
  productReadiness: CommercializationProductReadiness;
  manufacturingSupplyChain: CommercializationManufacturingSupplyChain;
  financialPlanning: CommercializationFinancialPlanning;
  salesMarketing: CommercializationSalesMarketing;
  partnerships: CommercializationPartnerships;
  riskAssessment: CommercializationRiskAssessment;
  attachments: CommercializationAttachment[];
  approvalDecision?: CommercializationApprovalDecision | null;
  reviewComments?: string;
  approvalDate?: string;
}

export interface CommercializationRecord {
  id: string;
  commercializationPlanId: string; // e.g. CMP-2024-0021
  formCode: string; // e.g. CMP-2024-15
  commercializationProject: string;
  status: CommercializationStatus;
  currentStage: CommercializationStage;
  currentStageLabel: string;
  stages: CommercializationStageState[];
  version: string;
  businessUnit: string;
  commercializationManager: string;
  launchTargetDate: string; // YYYY-MM-DD
  // Linked upstream records (resolved)
  linkedProductId: string | null;
  linkedProductCode: string | null;
  linkedTechnologyId: string | null;
  linkedTechnologyCode: string | null;
  linkedPatentId: string | null;
  linkedPatentCode: string | null;
  linkedBusinessCaseId: string | null;
  linkedBusinessCaseCode: string | null;
  // Form sections 1-10
  productOverview: CommercializationProductOverview;
  marketAnalysis: CommercializationMarketAnalysis;
  productReadiness: CommercializationProductReadiness;
  manufacturingSupplyChain: CommercializationManufacturingSupplyChain;
  financialPlanning: CommercializationFinancialPlanning;
  salesMarketing: CommercializationSalesMarketing;
  partnerships: CommercializationPartnerships;
  riskAssessment: CommercializationRiskAssessment;
  aiAnalytics: CommercializationAIAnalytics;
  summary: CommercializationSummary;
  // Form sections 11-13
  attachments: CommercializationAttachment[];
  reviewRows: CommercializationReviewRow[];
  approvalDecision: CommercializationApprovalDecision | null;
  reviewComments: string | null;
  approvalDate: string | null;
  // Auto-created product launch project if approved
  linkedProductLaunchProjectId?: string | null;
  linkedProductLaunchProjectCode?: string | null;
  // Audit & system info
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: CommercializationAuditEntry[];
}

export type CommercializationListRow = {
  id: string;
  commercializationPlanId: string;
  commercializationProject: string;
  productName: string;
  status: CommercializationStatus;
  overallLaunchReadiness: number;
  roiPct: number;
  launchTargetDate: string;
  updatedAt: string;
};

export interface CommercializationLookups {
  productCategories: string[];
  targetIndustries: string[];
  marketEntryStrategies: string[];
  certificationStatuses: string[];
  regulatoryCompliances: string[];
  productValidationStatuses: string[];
  productionReadinesses: string[];
  manufacturingStrategies: string[];
  procurementStatuses: string[];
  inventoryReadinesses: string[];
  salesModels: string[];
  pricingStrategies: string[];
  partnershipStatuses: string[];
  businessUnits: string[];
  commercializationManagers: string[];
  recommendedActions: string[];
}



/* ===========================================================================
   Continuous Innovation (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   CYCLICAL: one record per improvement cycle, scoped to a Review Period and
   ordered per product. A product accumulates many cycles over time; approval
   spawns the next product release + roadmap entry, which seeds the following
   cycle. Embeds the 4 stages (Opportunity ID → Planning → Implementation &
   Monitoring → Executive Review), the 12 sections, the AI assessment, and
   TWO distinct aggregates: Innovation Health (live gauge) and Overall
   Innovation Score (summary) — sharing one AI Innovation Score value.
   =========================================================================== */

export type CIStatus =
  | "draft"
  | "opportunity_identification"
  | "innovation_planning"
  | "implementation_monitoring"
  | "executive_review"
  | "approved"
  | "approved_with_improvements"
  | "revision_required"
  | "rejected"
  | "archived";

export type CIStage =
  | "opportunity_identification"
  | "innovation_planning"
  | "implementation_monitoring"
  | "executive_review";

export interface CIStageState {
  stage: CIStage;
  status: "pending" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

/** Section 1 — Innovation Overview. */
export interface CIOverview {
  innovationTheme: string;
  improvementObjective: string;
  currentProductVersion: string;
  improvementCategory: string;
  strategicAlignment: number; // 1..10 stars
  businessPriority: string;
  expectedBusinessOutcome: string;
}

/** Section 2 — Feedback & Opportunity Analysis. The two counts are DERIVED
 *  from CRM/service context, not typed. */
export interface CIFeedback {
  feedbackRecordsAnalyzed: number; // derived
  serviceTicketsAnalyzed: number; // derived
  marketIntelligence: string;
  competitorBenchmark: string;
  emergingTechnologies: string;
  improvementOpportunities: string;
  // opportunityScore is computed
}

/** Section 3 — Innovation Planning. */
export interface CIPlanning {
  innovationType: string;
  improvementScope: string;
  targetKpis: string;
  resourceRequirements: string;
  estimatedBudget: number;
  expectedTimeline: string;
  targetReleaseVersion: string;
}

export interface CIMilestone {
  id: string;
  label: string;
  targetDate: string;
  completed: boolean;
}

/** Section 4 — Implementation Strategy. Milestones drive the Execution Score. */
export interface CIImplementation {
  developmentApproach: string;
  responsibleTeam: string[];
  milestones: CIMilestone[];
  riskAssessment: string;
  deploymentStrategy: string;
  rolloutPlan: string;
}

/** Section 5 — Performance Measurement (period-scoped). */
export interface CIPerformance {
  productivityImprovement: number; // %
  costReduction: number;
  revenueGrowth: number;
  customerSatisfaction: number; // 1..10 stars
  productQualityImprovement: number;
  sustainabilityImpact: number;
  kpiAchievement: number; // %
}

/** Section 6 — Lessons Learned. */
export interface CILessons {
  successFactors: string;
  challenges: string;
  rootCauseAnalysis: string;
  bestPractices: string;
  knowledgeAssetsCreated: string;
  futureRecommendations: string;
}

/** Section 7 — Innovation Portfolio. */
export interface CIPortfolio {
  portfolioCategory: string;
  strategicValue: number; // 1..10 stars
  technologyImpact: number;
  businessImpact: number;
  esgContribution: number;
  portfolioPriority: string;
  // innovationScore is computed
}

/** Section 8 — AI Continuous Innovation Assessment (computed; single source of
 *  truth. AI Innovation Score === sidebar "AI Assessment" contributor). */
export interface CIAIAssessment {
  aiInnovationScore: number; // /100
  customerInsight: string;
  marketTrendAnalysis: string;
  predictiveImprovement: string;
  riskPrediction: string;
  roadmapShortTerm: string;
  roadmapMidTerm: string;
  roadmapLongTerm: string;
  estimatedBusinessValue: number;
  generatedAt: string;
}

/** Section 9 — Innovation Summary (computed). Overall Innovation Score is a
 *  DISTINCT aggregate from the sidebar Innovation Health. */
export interface CISummary {
  productImprovementScore: number; // /100
  customerValueScore: number;
  businessValueScore: number;
  innovationMaturityScore: number;
  overallInnovationScore: number;
  recommendation: string;
}

/** Computed section-2 opportunity score + section-7 innovation score tiles. */
export interface CIComputedScores {
  opportunityScore: number; // /100 (section 2)
  innovationScore: number; // /100 (section 7)
}

/** Sidebar Innovation Health — a live gauge distinct from Overall Innovation
 *  Score. AI Assessment contributor === section 8 aiInnovationScore. */
export interface CIHealth {
  innovationHealthScore: number; // %
  opportunityScore: number; // %
  executionScore: number; // % (from milestone completion)
  impactScore: number; // %
  aiAssessment: number; // % === CIAIAssessment.aiInnovationScore
}

export interface CIAttachment {
  id: string;
  category: string;
  filename: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/** Section 11 — Review & Approval TABLE row (not chips). */
export interface CIReviewRow {
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected";
  status: "Approved" | "In Review" | "Pending";
  date: string | null;
}

export type CIApprovalDecision =
  | "Approved"
  | "Approved with Improvements"
  | "Revision Required"
  | "Rejected";

export interface CIAuditEntry {
  at: string;
  actor: string;
  event: string;
  kind?: "audit" | "activity" | "change" | "workflow";
  stage?: CIStage;
  fromStatus?: CIStatus;
  toStatus?: CIStatus;
}

/** Everything the form edits directly (computed fields excluded). */
export interface CIFormInput {
  innovationInitiative: string;
  businessUnit: string;
  innovationManager: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  linkedProductId?: string | null;
  overview: CIOverview;
  feedback: CIFeedback;
  planning: CIPlanning;
  implementation: CIImplementation;
  performance: CIPerformance;
  lessons: CILessons;
  portfolio: CIPortfolio;
  attachments: CIAttachment[];
  recommendation: string;
}

export interface ContinuousInnovationRecord {
  id: string;
  cycleId: string; // INN-2026-0187
  formCode: string; // INN-2026-25
  status: CIStatus;
  currentStage: CIStage;
  currentStageLabel: string;
  stages: CIStageState[];
  version: number;
  cycleNumber: number; // 1-based sequence within the product
  innovationInitiative: string;
  businessUnit: string;
  innovationManager: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  // Linked records (resolved).
  linkedProductId: string | null;
  linkedProductCode: string | null;
  linkedProductName: string | null;
  linkedCommercializationPlanId: string | null;
  linkedCommercializationPlanCode: string | null;
  linkedCustomerFeedbackId: string | null;
  linkedCustomerFeedbackCode: string | null;
  linkedImprovementProjectId: string | null;
  linkedImprovementProjectCode: string | null;
  // Prior cycle in the product sequence (for navigation).
  previousCycleId: string | null;
  previousCycleCode: string | null;
  overview: CIOverview;
  feedback: CIFeedback;
  planning: CIPlanning;
  implementation: CIImplementation;
  performance: CIPerformance;
  lessons: CILessons;
  portfolio: CIPortfolio;
  computedScores: CIComputedScores;
  aiAssessment: CIAIAssessment;
  summary: CISummary;
  health: CIHealth;
  keyInsights: string[];
  attachments: CIAttachment[];
  reviewRows: CIReviewRow[];
  approvalDecision: CIApprovalDecision | null;
  reviewComments: string | null;
  approvalDate: string | null;
  nextReleaseId: string | null;
  nextReleaseCode: string | null;
  roadmapEntryId: string | null;
  roadmapEntryCode: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  updatedAt: string;
  auditTrail: CIAuditEntry[];
}

export type CIListRow = {
  id: string;
  cycleId: string;
  formCode: string;
  innovationInitiative: string;
  status: CIStatus;
  innovationManager: string;
  linkedProductName: string | null;
  cycleNumber: number;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallInnovationScore: number;
  innovationHealthScore: number;
  updatedAt: string;
};

/** A product's approved-source-of-record for creating cycles. */
export interface CIProductGlance {
  id: string;
  productCode: string;
  productName: string;
  currentVersion: string;
  commercializationPlanId: string | null;
  commercializationPlanCode: string | null;
  customerFeedbackId: string | null;
  customerFeedbackCode: string | null;
  improvementProjectId: string | null;
  improvementProjectCode: string | null;
  feedbackRecords: number;
  serviceTickets: number;
  marketGrowthRate: number;
  revenue: number;
  businessUnit: string;
}

export interface CILookups {
  innovationThemes: string[];
  improvementCategories: string[];
  businessPriorities: string[];
  innovationTypes: string[];
  improvementScopes: string[];
  expectedTimelines: string[];
  developmentApproaches: string[];
  deploymentStrategies: string[];
  portfolioCategories: string[];
  portfolioPriorities: string[];
  recommendations: string[];
  approvalDecisions: string[];
  innovationManagers: string[];
  teamMembers: string[];
  businessUnits: string[];
  attachmentCategories: string[];
  milestoneTemplates: string[];
}

/* ===========================================================================
   Product Strategy — PS (Development → Strategic Planning Module)
   ---------------------------------------------------------------------------
   Strategic Planning module in Development, distinct from pipeline modules.
   Manages the 4-stage Product Strategy lifecycle:
     Stage 1: Strategic Vision
     Stage 2: Market & Portfolio Strategy
     Stage 3: Financial & Innovation Strategy
     Stage 4: Executive Review (Decision: Approved / Revision Required / Additional Investigation / Rejected)

   Upon 'Approved' decision:
     - Auto-creates linked Product Roadmap (e.g. PRM-2024-0042)
       and surfaces its ID.
   =========================================================================== */

export type ProductStrategyStage =
  | "strategic_vision"
  | "market_portfolio_strategy"
  | "financial_innovation_strategy"
  | "executive_review";

export type ProductStrategyStatus =
  | "draft"
  | "strategic_vision"
  | "market_portfolio_strategy"
  | "financial_innovation_strategy"
  | "executive_review"
  | "approved"
  | "revision_required"
  | "additional_investigation"
  | "rejected"
  | "archived";

export type ProductStrategyApprovalDecision =
  | "approved"
  | "revision_required"
  | "additional_investigation"
  | "rejected";

export interface ProductStrategyStageInfo {
  stage: ProductStrategyStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface ProductStrategyFormInput {
  // Header editable fields
  strategyName: string;
  linkedProductId: string;
  linkedProductName: string;
  linkedCommercializationId: string;
  linkedCommercializationCode: string;
  linkedBusinessPlanId: string;
  linkedBusinessPlanCode: string;
  strategyPeriodStart: string;
  strategyPeriodEnd: string;
  businessUnit: string;
  productManagerId: string;
  productManagerName: string;

  // 1. Product Vision
  productVision: string;
  missionStatement: string;
  strategicObjectives: string;
  valueProposition: string;
  targetCustomers: string[];

  // 2. Market Strategy
  marketSegments: string[];
  customerPersonas: string;
  customerJourney: string;

  // 3. Product Portfolio Strategy
  productCategory: string;
  productLine: string;
  growthPotential: number; // 1-5 stars
  portfolioRole: string;
  productLifecycleStage: string;
  portfolioPriority: string;

  // 4. Innovation Strategy
  emergingTechnologies: string[];
  aiBasedInnovations: string;
  energyStrategy: string[];
  esgAlignment: number; // 1-5 stars

  // 5. Business Strategy
  businessModel: string;
  revenueModel: string;
  keyPartnerships: string[];
  competitivePositioning: number; // 1-5 stars
  marketOpportunitySize: number; // TAM currency

  // 6. Financial Strategy
  investmentBudget3Y: number;
  developmentCost: number;
  revenueForecast: number;
  grossMargin: number; // %
  breakevenPeriodMonths: number;
  roiYears: number;
  pricingStrategy: string;

  // 7. Risk & Compliance
  technicalRisk: number; // 1-5 stars
  marketRisk: number; // 1-5 stars
  financialRisk: number; // 1-5 stars
  regulatoryRisk: number; // 1-5 stars
  cybersecurityRisk: number; // 1-5 stars
  mitigationStrategy: string;
  complianceStatus: string;
  complianceComment: string;
}

export interface ProductStrategyAIAssessment {
  aiMarketOpportunityScore: number; // /100
  aiProductDifferentiationScore: number; // /100
  aiRevenuePredictionScore: number; // /100
  aiCompetitivePositionScore: number; // /100
  aiStrategicRecommendations: string;
  aiEmergingOpportunity: string;
  aiRiskPrediction: string;
  aiRecommendation: string;
}

export interface ProductStrategySidebarSummary {
  overallScore: number; // /100
  marketReadiness: number; // /100
  innovationScore: number; // /100
  financialScore: number; // /100
  strategicScore: number; // /100
}

export interface ProductStrategyKeyMetrics {
  tam: number;
  projectedRevenue: number;
  timeframe: string;
  grossMargin: number;
  expectedRoi: number;
  breakevenMonths: number;
  aiRecommendation: string;
}

export interface ProductStrategyAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ProductStrategyRecord {
  id: string;
  strategyId: string; // e.g. PS-2024-0017
  formCode: string; // e.g. PS-2024-08
  strategyName: string;
  status: ProductStrategyStatus;
  currentStage: ProductStrategyStage;
  currentStageLabel: string;

  linkedProductId: string;
  linkedProductName: string;
  linkedCommercializationId: string;
  linkedCommercializationCode: string;
  linkedBusinessPlanId: string;
  linkedBusinessPlanCode: string;

  strategyPeriodStart: string;
  strategyPeriodEnd: string;
  businessUnit: string;
  productManagerId: string;
  productManagerName: string;
  productManagerAvatar: string;

  dateCreated: string;
  lastModified: string;

  stages: ProductStrategyStageInfo[];
  input: ProductStrategyFormInput;
  aiAssessment: ProductStrategyAIAssessment;
  sidebarSummary: ProductStrategySidebarSummary;
  keyMetrics: ProductStrategyKeyMetrics;

  linkedProductRoadmapId?: string | null;
  approvalDecision?: ProductStrategyApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: ProductStrategyAuditEntry[];
}

/* ===========================================================================
   Product Roadmap Types
   =========================================================================== */

export type ProductRoadmapStatus =
  | "draft"
  | "roadmap_planning"
  | "resource_technology_planning"
  | "risk_business_assessment"
  | "executive_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type ProductRoadmapStage =
  | "roadmap_planning"
  | "resource_technology_planning"
  | "risk_business_assessment"
  | "executive_review";

export type ProductRoadmapApprovalDecision =
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected";

export interface ProductRoadmapStageInfo {
  stage: ProductRoadmapStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface ProductRoadmapReleaseItem {
  id: string;
  version: string;
  releaseName: string;
  targetDate: string;
  startMonthIdx: number; // 0-11 for 2024 window
  durationMonths: number;
  status: "completed" | "in_progress" | "upcoming" | "planned";
  priority: "P1 - Critical" | "P2 - High" | "P3 - Medium";
  color: string;
}

export interface ProductRoadmapFeatureItem {
  id: string;
  featureName: string;
  category: string;
  valueStars: number; // 1-5
  priority: "P1" | "P2" | "P3";
  status: "in_progress" | "planned" | "under_review" | "completed";
}

export interface ProductRoadmapTechItem {
  id: string;
  initiative: string;
  area: string;
  readiness: "High" | "Medium" | "Low";
  timeline: string;
}

export interface ProductRoadmapResourceBudgetItem {
  year: string;
  budgetPlanned: number;
  budgetUtilized: number;
  utilizationPct: number;
}

export interface ProductRoadmapMilestoneItem {
  id: string;
  milestoneName: string;
  targetDate: string;
  dependency: string;
  status: "completed" | "in_progress" | "pending";
}

export interface ProductRoadmapRiskItem {
  strategicRisk: number; // 1-5 stars
  technicalRisk: number; // 1-5 stars
  marketRisk: number; // 1-5 stars
  financialRisk: number; // 1-5 stars
  overallScore: number; // /100
  mitigationStrategy: string;
}

export interface ProductRoadmapReviewerItem {
  id: string;
  role: string;
  name: string;
  decision: "Approved" | "Pending" | "Revision Required";
  status: string;
  date?: string;
}

export interface ProductRoadmapAttachmentItem {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "pptx" | "xlsx" | "doc";
  uploadedAt: string;
}

export interface ProductRoadmapAIInsights {
  aiReleasePriorityScore: number; // /100
  aiRevenueForecast: number;
  aiRoadmapConfidenceScore: number; // /100
  aiRecommendations: string[];
}

export interface ProductRoadmapSidebarSummary {
  overallScore: number; // /100
  strategicProgress: number; // /100
  productReadiness: number; // /100
  innovationProgress: number; // /100
  budgetHealth: number; // /100
}

export interface ProductRoadmapBusinessImpact {
  projectedRevenue: number;
  revenueYoYDelta: string;
  grossMarginPct: number;
  marginYoYDelta: string;
  marketSharePct: number;
  marketShareYoYDelta: string;
}

export interface ProductRoadmapAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ProductRoadmapFormInput {
  roadmapName: string;
  linkedStrategyId: string;
  linkedStrategyName: string;
  linkedProductId: string;
  linkedProductName: string;
  productLine: string;
  businessUnit: string;
  productManagerId: string;
  productManagerName: string;
  roadmapPeriodStart: string;
  roadmapPeriodEnd: string;

  // Panel 1: Vision Alignment (inherited)
  productVision: string;
  targetMarket: string[];
  valueProposition: string;
  strategicAlignmentScore: number; // /100

  // Panel 2 & 3: Releases
  releases: ProductRoadmapReleaseItem[];

  // Panel 4: Top Features
  features: ProductRoadmapFeatureItem[];

  // Panel 5: Technology Roadmap
  techInitiatives: ProductRoadmapTechItem[];

  // Panel 6: Resource & Budget Metrics
  devBudget: number;
  rdBudget: number;
  plannedInvestment: number;
  budgetUtilizationPct: number;
  resourceBudgetHistory: ProductRoadmapResourceBudgetItem[];

  // Panel 7: Milestones & Dependencies
  milestones: ProductRoadmapMilestoneItem[];

  // Panel 8: Risk Management
  risks: ProductRoadmapRiskItem;

  // Panel 9: Attachments
  attachments: ProductRoadmapAttachmentItem[];

  // Panel 10: Review & Approval
  reviewers: ProductRoadmapReviewerItem[];
  approvalDecision: ProductRoadmapApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface ProductRoadmapRecord {
  id: string;
  roadmapId: string; // e.g. PRM-2024-0017
  formCode: string; // e.g. PRM-2024-08
  roadmapName: string;
  status: ProductRoadmapStatus;
  currentStage: ProductRoadmapStage;
  currentStageLabel: string;

  linkedStrategyId: string;
  linkedStrategyName: string;
  linkedProductId: string;
  linkedProductName: string;
  productLine: string;
  businessUnit: string;
  productManagerId: string;
  productManagerName: string;
  productManagerAvatar: string;
  roadmapPeriodStart: string;
  roadmapPeriodEnd: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: ProductRoadmapStageInfo[];
  input: ProductRoadmapFormInput;
  aiInsights: ProductRoadmapAIInsights;
  sidebarSummary: ProductRoadmapSidebarSummary;
  businessImpact: ProductRoadmapBusinessImpact;

  linkedReleasePlanId?: string | null;
  approvalDecision?: ProductRoadmapApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: ProductRoadmapAuditEntry[];
}

/* ===========================================================================
   Product Requirements Document (PRD) Types
   =========================================================================== */

export type PrdStatus =
  | "draft"
  | "product_definition"
  | "functional_ux_requirements"
  | "technical_requirements"
  | "executive_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type PrdStage =
  | "product_definition"
  | "functional_ux_requirements"
  | "technical_requirements"
  | "executive_review";

export type PrdApprovalDecision =
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected";

export interface PrdStageInfo {
  stage: PrdStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface PrdBusinessReqItem {
  id: string;
  title: string;
  priority: "P1 - Critical" | "P2 - High" | "P3 - Medium";
  status: "approved" | "under_review" | "draft";
}

export interface PrdFunctionalReqItem {
  id: string;
  featureStory: string;
  priority: "P1" | "P2" | "P3";
  status: "approved" | "under_review" | "draft";
}

export interface PrdMilestoneItem {
  milestone: string;
  plannedDate: string;
  status: "completed" | "in_progress" | "pending";
}

export interface PrdRiskItem {
  riskType: string;
  riskLevel: "High" | "Medium" | "Low";
  scoreStars: number; // 1-5
}

export interface PrdReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Revision Required";
  status: string;
  date?: string;
}

export interface PrdAttachmentItem {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "zip" | "vsdx" | "xlsx" | "fig";
  uploadedAt: string;
}

export interface PrdAIQualityScore {
  overallAiQualityScore: number; // /100
  requirementCompleteness: number; // /100
  requirementConsistency: number; // /100
  riskAssessment: number; // /100
  scopeValidation: number; // /100
  aiConfidenceScore: number; // /100
  aiInsightsSummary: string;
}

export interface PrdReadinessSummary {
  overallPrdScore: number; // /100
  businessReadiness: number; // /100
  functionalCompleteness: number; // /100
  technicalReadiness: number; // /100
  qualityReadiness: number; // /100
}

export interface PrdAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface PrdFormInput {
  prdTitle: string;
  prdVersion: string;
  linkedProductId: string;
  linkedProductName: string;
  linkedRoadmapId: string;
  linkedRoadmapName: string;
  linkedReleaseId: string;
  linkedReleaseName: string;
  businessUnit: string;
  productOwnerId: string;
  productOwnerName: string;
  plannedReleaseDate: string;

  // Panel 1: Product Overview
  productName: string;
  productVision: string;
  businessObjective: string;
  problemStatement: string;
  productScope: string;
  outOfScope: string;
  successCriteria: string;

  // Panel 2: Quick Info
  productLine: string;
  category: string;
  targetMarket: string;
  primaryUsers: string;
  lastUpdated: string;
  nextReviewDate: string;

  // Panels 6-9 Lists
  businessRequirements: PrdBusinessReqItem[];
  functionalRequirements: PrdFunctionalReqItem[];
  milestones: PrdMilestoneItem[];
  risks: PrdRiskItem[];

  // Panel 10: Attachments
  attachments: PrdAttachmentItem[];

  // Panel 11: Reviewers & Approval
  reviewers: PrdReviewerItem[];
  approvalDecision: PrdApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface PrdRecord {
  id: string;
  prdId: string; // e.g. PRD-2024-0017
  formCode: string; // e.g. PRD-2024-08
  prdTitle: string;
  prdVersion: string;
  status: PrdStatus;
  currentStage: PrdStage;
  currentStageLabel: string;
  createdOn: string;

  linkedProductId: string;
  linkedProductName: string;
  linkedRoadmapId: string;
  linkedRoadmapName: string;
  linkedReleaseId: string;
  linkedReleaseName: string;

  businessUnit: string;
  productOwnerId: string;
  productOwnerName: string;
  productOwnerAvatar: string;
  plannedReleaseDate: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: PrdStageInfo[];
  input: PrdFormInput;
  aiQuality: PrdAIQualityScore;
  readinessSummary: PrdReadinessSummary;
  keyHighlights: string[];

  linkedSystemDesignId?: string | null;
  approvalDecision?: PrdApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: PrdAuditEntry[];
}

/* ===========================================================================
   Product Architecture Types
   =========================================================================== */

export type ProductArchitectureStage =
  | "draft"
  | "architecture_definition"
  | "hardware_software_architecture"
  | "security_integration"
  | "executive_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type ProductArchitectureStatus =
  | "Draft"
  | "Architecture Definition"
  | "HW & SW Architecture"
  | "Security & Integration"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type ProductArchitectureApprovalDecision =
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected";

export interface ProductArchitectureStageInfo {
  stage: ProductArchitectureStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface ProductArchitectureReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Revision Required" | "Rejected";
  status: string;
  date?: string;
}

export interface ProductArchitectureAttachmentItem {
  id: string;
  name: string;
  size: string;
  type: "png" | "pdf" | "zip" | "doc" | "vsdx";
  uploadedAt: string;
  url?: string;
}

export interface ProductArchitectureAIQualityScore {
  aiOverallArchitectureScore: number; // /100
  aiArchitectureQuality: number; // /100
  aiScalabilityScore: number; // /100
  aiSecurityAssessment: number; // /100
  aiTechnologyRecommendation: string;
  aiIntegrationAssessment: string;
  aiRiskAnalysis: string;
}

export interface ProductArchitectureReadinessSummary {
  overallArchitectureScore: number; // /100
  functionalCoverage: number; // /100
  technicalReadiness: number; // /100
  securityReadiness: number; // /100
  integrationReadiness: number; // /100
  performanceScore: number; // /100
}

export interface ProductArchitectureAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ProductArchitectureFormInput {
  architectureName: string;
  architectureVersion: string;
  businessUnit: string;
  systemArchitectId: string;
  systemArchitectName: string;
  systemArchitectAvatar?: string;

  // Panel 1: Product Architecture Overview
  productName: string;
  architectureVision: string;
  architectureObjective: string;
  architectureScope: string;
  designPrinciples: string[];
  architectureStyle: string;
  overallDiagramName: string;
  overallDiagramSize: string;

  // Panel 2: System Architecture
  systemName: string;
  systemComponents: string;
  subsystems: string;
  functionalBlocks: string;
  externalInterfaces: string;
  internalInterfaces: string;
  architectureStatusBadge: string;
  systemDiagramUrl: string;

  // Panel 3: Hardware Architecture
  hardwarePlatform: string;
  processingUnit: string;
  sensors: string[];
  actuators: string[];
  powerElectronics: string;
  communicationInterfaces: string[];
  hardwareConstraints: string;

  // Panel 4: Software Architecture
  softwarePlatform: string;
  operatingSystem: string;
  firmwareComponents: string;
  middleware: string;
  applicationModules: string;
  apisAndServices: string;
  softwareConstraints: string;

  // Panel 5: Data & Communication Architecture
  dataFlow: string;
  dataSources: string;
  databaseTechnology: string;
  communicationProtocols: string[];
  cloudIntegration: string;
  edgeComputing: boolean;
  dataSecurity: string;

  // Panel 6: Integration & Interoperability
  externalSystems: string;
  erpIntegration: string;
  apiGateway: string;
  thirdPartyServices: string;
  standardsCompliance: string[];
  integrationRisks: string;
  integrationStrategy: string;

  // Panel 7: Security & Compliance Architecture
  securityArchitecture: string;
  authenticationMethod: string;
  authorizationModel: string;
  encryptionStandard: string;
  regulatoryCompliance: string[];
  cybersecurityControls: string;
  securityRiskScore: number; // /100

  // Panel 8: Scalability & Performance
  expectedUsersDevices: string;
  throughput: string;
  latencyTarget: string;
  availabilityTarget: string;
  scalabilityStrategy: string;
  disasterRecoveryPlan: string;
  performanceScore: number; // /100

  // Panel 9: AI Architecture Assessment
  aiAssessment: ProductArchitectureAIQualityScore;

  // Panel 10: Attachments
  attachments: ProductArchitectureAttachmentItem[];

  // Panel 11: Review & Approval
  reviewers: ProductArchitectureReviewerItem[];
  approvalDecision: ProductArchitectureApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface ProductArchitectureRecord {
  id: string;
  architectureId: string; // e.g. PA-2024-0017
  formCode: string; // e.g. PA-2024-25
  architectureName: string;
  architectureVersion: string;
  status: ProductArchitectureStatus;
  currentStage: ProductArchitectureStage;
  currentStageLabel: string;
  createdOn: string;

  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;
  linkedRoadmapId: string;
  linkedRoadmapName: string;

  businessUnit: string;
  systemArchitectId: string;
  systemArchitectName: string;
  systemArchitectAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: ProductArchitectureStageInfo[];
  input: ProductArchitectureFormInput;
  aiAssessment: ProductArchitectureAIQualityScore;
  summary: ProductArchitectureReadinessSummary;
  keyHighlights: string[];

  linkedSystemDesignId?: string | null;
  approvalDecision?: ProductArchitectureApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: ProductArchitectureAuditEntry[];
}

/* ===========================================================================
   Industrial Design Types
   =========================================================================== */

export type IndustrialDesignStage =
  | "draft"
  | "concept_design"
  | "material_manufacturing_design"
  | "prototype_validation"
  | "executive_review"
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected"
  | "archived";

export type IndustrialDesignStatus =
  | "Draft"
  | "Concept Design"
  | "Material & Mfg Design"
  | "Prototype Validation"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type IndustrialDesignApprovalDecision =
  | "approved"
  | "approved_with_conditions"
  | "revision_required"
  | "rejected";

export interface IndustrialDesignStageInfo {
  stage: IndustrialDesignStage;
  label: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface IndustrialDesignReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Revision Required" | "Rejected";
  status: string;
  date?: string;
}

export interface IndustrialDesignAttachmentItem {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "step" | "png" | "zip" | "doc" | "xlsx";
  uploadedAt: string;
  url?: string;
}

export interface IndustrialDesignAIDesignScore {
  aiOverallDesignScore: number; // /100
  aiDesignQualityScore: number; // /100
  aiErgonomicAssessment: string;
  aiMaterialRecommendation: string;
  aiManufacturingSuggestions: string;
  aiSustainabilityAnalysis: string;
  aiCostOptimization: string;
}

export interface IndustrialDesignReadinessSummary {
  overallDesignScore: number; // /100
  userExperience: number; // /100
  manufacturability: number; // /100
  sustainability: number; // /100
  brandAlignment: number; // /100
  overallDesign: number; // /100
}

export interface IndustrialDesignAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface IndustrialDesignFormInput {
  designProjectName: string;
  designVersion: string;
  businessUnit: string;
  industrialDesignerId: string;
  industrialDesignerName: string;
  industrialDesignerAvatar?: string;

  // Panel 1: Design Overview
  productName: string;
  designObjective: string;
  designVision: string;
  productCategory: string;
  targetUsers: string[];
  designLanguage: string;
  designStatus: string;
  productRenderUrl: string;

  // Panel 2: Form Factor & Ergonomics
  formFactor: string;
  dimensions: string;
  weightTarget: string;
  ergonomicConsiderations: string;
  accessibilityFeatures: string;
  humanFactorsAssessment: string;
  ergonomicScore: number; // /100

  // Panel 3: Aesthetics & Branding
  productStyle: string;
  colorPalette: string[];
  surfaceFinish: string;
  brandIdentityAlignment: string;
  logoPlacement: string;
  uiDisplayIntegration: string;
  visualAppealScore: number; // /100

  // Panel 4: Material Selection
  primaryMaterial: string;
  secondaryMaterials: string;
  materialGrade: string;
  sustainabilityRatingStars: number; // 1-5
  recyclabilityPercent: number;
  environmentalCompliance: string[];
  materialCost: string;

  // Panel 5: Manufacturing Considerations
  manufacturingProcess: string[];
  assemblyMethod: string;
  dfmAssessment: string;
  dfaAssessment: string;
  toolingRequirements: string;
  manufacturingConstraints: string;
  manufacturabilityScore: number; // /100

  // Panel 6: Prototype & Validation
  prototypeType: string;
  prototypeStatusBadge: string;
  userTestingResults: string;
  designValidation: string;
  identifiedImprovements: string;
  designIterationNumber: number;
  validationScore: number; // /100

  // Panel 7: Sustainability & Compliance
  ecoDesignStrategy: string;
  carbonFootprintEstimate: string;
  energyEfficiencyStars: number; // 1-5
  packagingDesign: string;
  regulatoryStandards: string[];
  sustainabilityNotes: string;
  complianceScore: number; // /100

  // Panel 8: AI Industrial Design Assessment
  aiAssessment: IndustrialDesignAIDesignScore;

  // Panel 9: Attachments
  attachments: IndustrialDesignAttachmentItem[];

  // Panel 10: Review & Approval
  reviewers: IndustrialDesignReviewerItem[];
  approvalDecision: IndustrialDesignApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface IndustrialDesignRecord {
  id: string;
  designId: string; // e.g. ID-2024-0017
  formCode: string; // e.g. IDF-2024-25
  designProjectName: string;
  designVersion: string;
  status: IndustrialDesignStatus;
  currentStage: IndustrialDesignStage;
  currentStageLabel: string;
  createdOn: string;

  linkedArchitectureId: string; // e.g. PA-2024-0017
  linkedArchitectureTitle: string;
  linkedProductId: string;
  linkedProductName: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;

  businessUnit: string;
  industrialDesignerId: string;
  industrialDesignerName: string;
  industrialDesignerAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: IndustrialDesignStageInfo[];
  input: IndustrialDesignFormInput;
  aiAssessment: IndustrialDesignAIDesignScore;
  summary: IndustrialDesignReadinessSummary;
  keyHighlights: string[];

  linkedMechanicalDesignId?: string | null;
  approvalDecision?: IndustrialDesignApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: IndustrialDesignAuditEntry[];
}

/* ===========================================================================
   Mechanical Design Module Interfaces
   =========================================================================== */

export type MechanicalDesignStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type MechanicalDesignStage =
  | "mechanical_engineering_design"
  | "material_manufacturing_validation"
  | "simulation_validation"
  | "engineering_review";

export type MechanicalDesignApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface MechanicalDesignStageInfo {
  id: MechanicalDesignStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface MechanicalDesignTopPartItem {
  id: string;
  partNumber: string;
  partName: string;
  material: string;
  process: string;
  revision: string;
  status: "Approved" | "In Progress" | "Under Review" | "Draft";
}

export interface MechanicalEngineeringAnalysisItem {
  id: string;
  name: string;
  status: "Completed" | "In Progress" | "Pending";
}

export interface MechanicalDesignAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface MechanicalDesignReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface MechanicalDesignAIRecommendationItem {
  id: string;
  iconType: "material" | "dimension" | "rib" | "cost" | "general";
  title: string;
  description: string;
  impactScore?: string;
}

export interface MechanicalDesignAIMechanicalScore {
  aiOverallScore: number; // /100
  aiDesignQuality: number; // /100
  aiManufacturability: number; // /100
  aiStructuralAssessment: number; // /100
  aiCostOptimization: number; // /100
}

export interface MechanicalDesignReadinessSummary {
  overallMechanicalDesignScore: number; // /100
  structuralReadiness: number; // /100
  manufacturability: number; // /100
  reliability: number; // /100
  simulation: number; // /100
}

export interface MechanicalDesignAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: MechanicalDesignStage;
  status?: MechanicalDesignStatus;
}

export interface MechanicalDesignFormInput {
  // Panel 1: Mechanical Design Overview
  productName: string;
  designObjective: string;
  designScope: string;
  designStandards: string[];
  designMethodology: string;
  productCategory: string;
  designStatus: string;
  productRenderUrl: string;

  // Panel 2: Assembly Design
  assemblyName: string;
  assemblyNumber: string;
  assemblyType: string;
  parentAssembly: string;
  numberOfComponents: number;
  assemblyWeight: string;
  assemblyStatus: string;
  assemblyExplodedViewUrl: string;

  // Panel 3: Part Design (Top Parts)
  topParts: MechanicalDesignTopPartItem[];

  // Panel 4: Mechanism Design
  mechanismName: string;
  motionType: string;
  degreesOfFreedom: number;
  actuationMethod: string;
  transmissionType: string;
  safetyMechanism: string;
  reliabilityTarget: number; // e.g. 98.00%

  // Panel 5: Material & Manufacturing
  materialGrade: string;
  materialStandard: string;
  heatTreatment: string;
  surfaceFinish: string;
  toleranceClass: string;
  gdtRequirement: string;
  estManufacturingCost: string;

  // Panel 6: Engineering Analysis
  engineeringAnalyses: MechanicalEngineeringAnalysisItem[];
  simulationStatus: string;
  feaStressPlotUrl: string;

  // Panel 7: Design Validation
  designVerificationMethod: string;
  prototypeValidation: string;
  testResults: string;
  designIssues: string;
  correctiveActions: string;
  validationScore: number; // /100
  approvalStatusBadge: string;

  // Panel 8: Attachments
  attachments: MechanicalDesignAttachmentItem[];

  // Panel 9: AI Recommendations
  aiRecommendations: MechanicalDesignAIRecommendationItem[];

  // Panel 10: Review & Approval
  reviewers: MechanicalDesignReviewerItem[];
  approvalDecision: MechanicalDesignApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface MechanicalDesignRecord {
  id: string;
  designId: string; // e.g. MD-2024-0017
  formCode: string; // e.g. MDF-2024-25
  designProjectName: string;
  designVersion: string;
  status: MechanicalDesignStatus;
  currentStage: MechanicalDesignStage;
  currentStageLabel: string;
  createdOn: string;

  linkedIndustrialDesignId: string; // e.g. ID-2024-0012
  linkedIndustrialDesignTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  mechanicalEngineerId: string;
  mechanicalEngineerName: string;
  mechanicalEngineerAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: MechanicalDesignStageInfo[];
  input: MechanicalDesignFormInput;
  aiAssessment: MechanicalDesignAIMechanicalScore;
  summary: MechanicalDesignReadinessSummary;
  keyHighlights: string[];

  linkedPrototypeManufacturingId?: string | null;
  approvalDecision?: MechanicalDesignApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: MechanicalDesignAuditEntry[];
}

/* ===========================================================================
   Electrical Design Module Interfaces
   =========================================================================== */

export type ElectricalDesignStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type ElectricalDesignStage =
  | "electrical_architecture"
  | "circuit_pcb_design"
  | "simulation_validation"
  | "engineering_review";

export type ElectricalDesignApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface ElectricalDesignStageInfo {
  id: ElectricalDesignStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface ElectricalDesignSimulationItem {
  id: string;
  name: string;
  status: "Completed" | "In Progress" | "Pending";
}

export interface ElectricalDesignAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface ElectricalDesignReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface ElectricalDesignAIElectricalScore {
  aiOverallElectricalScore: number; // /100
  aiDesignQualityScore: number; // /100
  aiPowerOptimization: number; // /100
  aiCircuitReview: number; // /100
  aiThermalAssessment: number; // /100
  aiEmcRecommendations: number; // /100
  aiReliabilityPrediction: number; // /100
}

export interface ElectricalDesignReadinessSummary {
  overallElectricalDesignScore: number; // /100
  powerSystemReadiness: number; // /100
  circuitReadiness: number; // /100
  electricalSafetyScore: number; // /100
  complianceScore: number; // /100
  recommendation: string;
}

export interface ElectricalDesignAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: ElectricalDesignStage;
  status?: ElectricalDesignStatus;
}

export interface ElectricalDesignFormInput {
  // Panel 1: Electrical Design Overview
  productName: string;
  electricalDesignObjective: string;
  designScope: string;
  applicableStandards: string[];
  designMethodology: string;
  productCategory: string;
  designStatus: string;
  productRenderUrl: string;

  // Panel 2: Electrical Architecture
  electricalArchitectureName: string;
  systemVoltage: string;
  powerRating: string;
  acDcConfiguration: string;
  powerDistributionTopology: string;
  electricalInterfaces: string;
  architectureStatus: string;
  architectureDiagramUrl: string;

  // Panel 3: Power System Design
  powerSource: string;
  powerSupplyDesign: string;
  converterType: string;
  inverterSpecification: string;
  transformerCoilSpecification: string;
  powerEfficiencyTarget: string;
  thermalLoad: string;

  // Panel 4: Circuit & PCB Design
  pcbName: string;
  pcbRevision: string;
  pcbLayerCount: number;
  circuitCategory: string;
  majorComponents: string;
  connectorTypes: string[];
  pcbStatus: string;
  pcbBoardImageUrl: string;

  // Panel 5: Wiring & Harness Design
  harnessName: string;
  cableType: string;
  wireGauge: string;
  connectorStandard: string;
  routingDescription: string;
  harnessLength: string;
  harnessStatus: string;
  harnessImageUrl: string;

  // Panel 6: Protection & Safety
  fuseSpecification: string;
  circuitBreaker: string;
  isolationMethod: string;
  earthingMethod: string;
  surgeProtection: string;
  functionalSafetyStandard: string[];
  electricalSafetyScore: number; // /100

  // Panel 7: EMC / EMI & Compliance
  emcStandard: string[];
  emiMitigationStrategy: string;
  shieldingMethod: string;
  groundingStrategy: string;
  complianceStatus: string;
  testPlan: string;
  complianceScore: number; // /100

  // Panel 8: Simulation & Validation
  simulations: ElectricalDesignSimulationItem[];
  validationMethod: string;
  validationStatus: string;
  validationScore: number; // /100
  thermalHeatmapUrl: string;

  // Panel 9: AI Assessment (kept in sync)
  aiAssessment: ElectricalDesignAIElectricalScore;

  // Panel 10: Design Summary (kept in sync)
  summary: ElectricalDesignReadinessSummary;

  // Panel 11: Attachments
  attachments: ElectricalDesignAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: ElectricalDesignReviewerItem[];
  approvalDecision: ElectricalDesignApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface ElectricalDesignRecord {
  id: string;
  designId: string; // e.g. ED-2024-0017
  formCode: string; // e.g. EDF-2024-25
  designProjectName: string;
  designVersion: string;
  status: ElectricalDesignStatus;
  currentStage: ElectricalDesignStage;
  currentStageLabel: string;
  createdOn: string;

  linkedMechanicalDesignId: string; // e.g. MD-2024-0017
  linkedMechanicalDesignTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  electricalEngineerId: string;
  electricalEngineerName: string;
  electricalEngineerAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: ElectricalDesignStageInfo[];
  input: ElectricalDesignFormInput;
  aiAssessment: ElectricalDesignAIElectricalScore;
  summary: ElectricalDesignReadinessSummary;
  keyHighlights: string[];

  linkedPrototypeManufacturingId?: string | null;
  approvalDecision?: ElectricalDesignApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: ElectricalDesignAuditEntry[];
}

/* ===========================================================================
   Electronics Design Module Interfaces
   =========================================================================== */

export type ElectronicsDesignStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type ElectronicsDesignStage =
  | "electronic_system_architecture"
  | "component_selection_circuit_design"
  | "verification_simulation"
  | "engineering_review";

export type ElectronicsDesignApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface ElectronicsDesignStageInfo {
  id: ElectronicsDesignStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface ElectronicsDesignVerificationItem {
  id: string;
  name: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending";
}

export interface ElectronicsDesignAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface ElectronicsDesignReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface ElectronicsDesignAIElectronicsScore {
  aiOverallElectronicsScore: number; // /100
  aiDesignQualityScore: number; // /100
  aiComponentOptimization: number; // /100
  aiCircuitReview: number; // /100
  aiSignalIntegrityAnalysis: number; // /100
  aiThermalRecommendations: number; // /100
  aiReliabilityPrediction: number; // /100
}

export interface ElectronicsDesignReadinessSummary {
  overallElectronicsDesignScore: number; // /100
  architectureReadiness: number; // /100
  circuitReadiness: number; // /100
  hardwareInterfaceScore: number; // /100
  reliabilityScore: number; // /100
  recommendation: string;
}

export interface ElectronicsDesignAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: ElectronicsDesignStage;
  status?: ElectronicsDesignStatus;
}

export interface ElectronicsDesignFormInput {
  // Panel 1: Electronics Design Overview
  productName: string;
  electronicsDesignObjective: string;
  designScope: string;
  applicableStandards: string[];
  designMethodology: string;
  productCategory: string;
  designStatus: string;
  productRenderUrl: string;

  // Panel 2: Electronic System Architecture
  electronicSystemName: string;
  functionalBlocks: string;
  boardArchitecture: string;
  signalInterfaces: string;
  communicationInterfaces: string[];
  powerDomains: string;
  architectureStatus: string;
  systemDiagramUrl: string;

  // Panel 3: Component Selection
  microcontrollerProcessor: string;
  memoryDevices: string;
  powerDevices: string;
  passiveComponents: string;
  sensors: string;
  communicationModules: string;
  componentLifecycleStatus: string;

  // Panel 4: Circuit Design
  circuitName: string;
  circuitCategory: string;
  inputVoltage: string;
  outputVoltage: string;
  operatingFrequency: string;
  currentRating: string;
  circuitStatus: string;
  circuitSchematicUrl: string;

  // Panel 5: PCB Design Preparation
  pcbType: string;
  estimatedLayerCount: number;
  boardDimensions: string;
  componentPlacementStrategy: string;
  thermalManagementMethod: string;
  highSpeedSignalDesign: string;
  pcbStackupDiagramUrl: string;
  pcbReadinessScore: number; // /100

  // Panel 6: Embedded Hardware Interfaces
  gpioInterfaces: string;
  adcDacInterfaces: string;
  pwmOutputs: string;
  canInterfaceStatus: string;
  ethernetInterfaceStatus: string;
  busInterfaces: string[];
  hardwareInterfaceStatus: string;
  hardwareInterfaceScore: number; // /100

  // Panel 7: Signal Integrity & Reliability
  signalIntegrityAnalysis: string;
  powerIntegrityAnalysis: string;
  noiseReductionStrategy: string;
  clockDistribution: string;
  reliabilityTarget: string;
  mtbfTarget: string;
  reliabilityScore: number; // /100

  // Panel 8: Design Verification & Testing
  verifications: ElectronicsDesignVerificationItem[];
  verificationScore: number; // /100
  waveformPlotUrl: string;

  // Panel 9: AI Assessment
  aiAssessment: ElectronicsDesignAIElectronicsScore;

  // Panel 10: Design Summary
  summary: ElectronicsDesignReadinessSummary;

  // Panel 11: Attachments
  attachments: ElectronicsDesignAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: ElectronicsDesignReviewerItem[];
  approvalDecision: ElectronicsDesignApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface ElectronicsDesignRecord {
  id: string;
  designId: string; // e.g. EN-2024-0017
  formCode: string; // e.g. EDF-2024-25
  designProjectName: string;
  designVersion: string;
  status: ElectronicsDesignStatus;
  currentStage: ElectronicsDesignStage;
  currentStageLabel: string;
  createdOn: string;

  linkedElectricalDesignId: string; // e.g. ED-2024-0017
  linkedElectricalDesignTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  electronicsEngineerId: string;
  electronicsEngineerName: string;
  electronicsEngineerAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: ElectronicsDesignStageInfo[];
  input: ElectronicsDesignFormInput;
  aiAssessment: ElectronicsDesignAIElectronicsScore;
  summary: ElectronicsDesignReadinessSummary;
  keyHighlights: string[];

  linkedPcbLayoutId?: string | null;
  approvalDecision?: ElectronicsDesignApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: ElectronicsDesignAuditEntry[];
}

/* ===========================================================================
   Embedded Systems Development Module Interfaces
   =========================================================================== */

export type EmbeddedDevelopmentStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type EmbeddedDevelopmentStage =
  | "platform_configuration"
  | "firmware_development"
  | "testing_validation"
  | "engineering_review";

export type EmbeddedDevelopmentApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface EmbeddedDevelopmentStageInfo {
  id: EmbeddedDevelopmentStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface EmbeddedDevelopmentTestItem {
  id: string;
  name: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending";
  details?: string;
}

export interface EmbeddedDevelopmentAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface EmbeddedDevelopmentReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface EmbeddedDevelopmentAIEmbeddedScore {
  aiOverallEmbeddedScore: number; // /100
  aiFirmwareQualityScore: number; // /100
  aiCodeOptimization: number; // /100
  aiMemoryOptimization: number; // /100
  aiTimingAnalysis: number; // /100
}

export interface EmbeddedDevelopmentReadinessSummary {
  overallEmbeddedScore: number; // /100
  firmwareReadiness: number; // /100
  hardwareCompatibility: number; // /100
  performanceScore: number; // /100
  securityScore: number; // /100
  recommendation: string;
}

export interface EmbeddedDevelopmentAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: EmbeddedDevelopmentStage;
  status?: EmbeddedDevelopmentStatus;
}

export interface EmbeddedDevelopmentFormInput {
  // Panel 1: Embedded System Overview
  productName: string;
  embeddedSystemName: string;
  developmentObjective: string;
  firmwareScope: string;
  applicableStandards: string[];
  developmentMethodology: string;
  developmentStatus: string;
  hardwareBoardImageUrl: string;

  // Panel 2: Hardware Platform
  microcontrollerSoc: string;
  cpuArchitecture: string;
  clockFrequency: string;
  flashMemory: string;
  sram: string;
  externalMemory: string;
  hardwareStatus: string;
  hardwarePlatformDiagramUrl: string;

  // Panel 3: Firmware Architecture
  firmwareArchitecture: string;
  bootloader: string;
  bsp: string;
  deviceDrivers: string;
  middlewareComponents: string;
  applicationModules: string;
  firmwareStatus: string;
  layeredArchitectureDiagramUrl: string;

  // Panel 4: RTOS & Task Management
  rtosPlatform: string;
  numberOfTasks: number;
  schedulingMethod: string;
  taskPriorities: string;
  interruptManagement: string;
  memoryManagement: string;
  rtosStatus: string;
  taskDistribution: {
    high: number;
    medium: number;
    low: number;
  };

  // Panel 5: Communication Interfaces
  interfacesList: { name: string; checked: boolean }[];
  wirelessInterfaces: string[];

  // Panel 6: Functional Modules
  functionalModulesList: { name: string; checked: boolean }[];

  // Panel 7: Cybersecurity & Functional Safety
  secureBoot: string;
  firmwareEncryption: string;
  secureKeyStorage: string;
  watchdogConfiguration: string;
  functionalSafetyStandards: string[];
  cybersecurityStandards: string[];
  securityReadinessScore: number; // /100

  // Panel 8: Firmware Testing & Validation
  testItems: EmbeddedDevelopmentTestItem[];
  codeCoverage: number; // %
  testReportSummary: string;
  validationScore: number; // /100

  // Panel 9: AI Assessment
  aiAssessment: EmbeddedDevelopmentAIEmbeddedScore;

  // Panel 10: Development Summary
  summary: EmbeddedDevelopmentReadinessSummary;

  // Panel 11: Attachments
  attachments: EmbeddedDevelopmentAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: EmbeddedDevelopmentReviewerItem[];
  approvalDecision: EmbeddedDevelopmentApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface EmbeddedDevelopmentRecord {
  id: string;
  developmentId: string; // e.g. EMD-2024-0017
  formCode: string; // e.g. EMF-2024-25
  developmentProjectName: string;
  firmwareVersion: string;
  status: EmbeddedDevelopmentStatus;
  currentStage: EmbeddedDevelopmentStage;
  currentStageLabel: string;
  createdOn: string;

  linkedElectronicsDesignId: string; // e.g. EN-2024-0017
  linkedElectronicsDesignTitle: string;
  linkedElectricalDesignId: string; // e.g. ED-2024-0017
  linkedElectricalDesignTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  embeddedEngineerId: string;
  embeddedEngineerName: string;
  embeddedEngineerAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: EmbeddedDevelopmentStageInfo[];
  input: EmbeddedDevelopmentFormInput;
  aiAssessment: EmbeddedDevelopmentAIEmbeddedScore;
  summary: EmbeddedDevelopmentReadinessSummary;
  keyHighlights: string[];

  linkedSystemIntegrationId?: string | null;
  approvalDecision?: EmbeddedDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: EmbeddedDevelopmentAuditEntry[];
}

/* ===========================================================================
   Firmware Development Module Interfaces
   =========================================================================== */

export type FirmwareDevelopmentStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type FirmwareDevelopmentStage =
  | "firmware_architecture_implementation"
  | "communication_security"
  | "testing_release"
  | "engineering_review";

export type FirmwareDevelopmentApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface FirmwareDevelopmentStageInfo {
  id: FirmwareDevelopmentStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface FirmwareModuleItem {
  id: string;
  name: string;
  category: string;
  owner: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending";
  complexity: number; // /100
}

export interface FirmwareDevelopmentTestItem {
  id: string;
  name: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending";
  details?: string;
}

export interface FirmwareDevelopmentAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface FirmwareDevelopmentReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface FirmwareDevelopmentAIFirmwareScore {
  aiOverallFirmwareScore: number; // /100
  aiCodeQualityScore: number; // /100
  aiPerformanceOptimization: number; // /100
  aiMemoryOptimization: number; // /100
  aiSecurityAnalysis: number; // /100
  aiBugPrediction: number; // /100
  aiMaintainabilityScore: number; // /100
}

export interface FirmwareDevelopmentReadinessSummary {
  overallFirmwareScore: number; // /100
  firmwareReadiness: number; // /100
  codeQuality: number; // /100
  securityReadiness: number; // /100
  testCoverage: number; // /100
  recommendation: string;
}

export interface FirmwareDevelopmentAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: FirmwareDevelopmentStage;
  status?: FirmwareDevelopmentStatus;
}

export interface FirmwareDevelopmentFormInput {
  // Panel 1: Firmware Project Overview
  productName: string;
  firmwareName: string;
  firmwareObjective: string;
  developmentScope: string;
  supportedHardware: string[];
  programmingLanguage: string[];
  developmentStatus: string;
  mcuChipImageUrl: string;

  // Panel 2: Firmware Architecture
  firmwareArchitecture: string;
  bootloaderVersion: string;
  halVersion: string;
  bspVersion: string;
  middlewareStack: string;
  applicationFramework: string;
  architectureStatus: string;
  layeredArchitectureDiagramUrl: string;

  // Panel 3: Software Modules
  modules: FirmwareModuleItem[];

  // Panel 4: Communication Stack
  communicationInterfacesList: { name: string; checked: boolean }[];
  wirelessTags: string[];
  protocolStackStatus: string;

  // Panel 5: Diagnostics & Safety
  selfTestFunctions: string;
  dtcSupportCount: number;
  faultHandling: string;
  watchdogStrategy: string;
  errorRecovery: string;
  functionalSafetyText: string;
  diagnosticReadinessScore: number; // /100

  // Panel 6: Cybersecurity
  secureBoot: string;
  firmwareSigning: string;
  secureOtaUpdate: string;
  encryptionMethod: string;
  authenticationMethod: string;
  vulnerabilityAssessment: string;
  securityScore: number; // /100

  // Panel 7: Testing & QA
  testItems: FirmwareDevelopmentTestItem[];
  codeCoverage: number; // %
  memoryLeakAnalysis: string;
  testStatus: string;

  // Panel 8: Release Management
  releaseType: string;
  buildNumber: string;
  gitCommitReference: string;
  releaseNotesUrl: string;
  otaPackageName: string;
  otaPackageSize: string;
  releaseDate: string;
  releaseStatus: string;

  // Panel 9: AI Assessment
  aiAssessment: FirmwareDevelopmentAIFirmwareScore;

  // Panel 10: Firmware Summary
  summary: FirmwareDevelopmentReadinessSummary;

  // Panel 11: Attachments
  attachments: FirmwareDevelopmentAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: FirmwareDevelopmentReviewerItem[];
  approvalDecision: FirmwareDevelopmentApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface FirmwareDevelopmentRecord {
  id: string;
  firmwareId: string; // e.g. FWD-2024-0017
  formCode: string; // e.g. FWF-2024-25
  firmwareProjectName: string;
  firmwareVersion: string;
  status: FirmwareDevelopmentStatus;
  currentStage: FirmwareDevelopmentStage;
  currentStageLabel: string;
  createdOn: string;

  linkedEmbeddedDevelopmentId: string; // e.g. EMD-2024-0017
  linkedEmbeddedDevelopmentTitle: string;
  linkedElectronicsDesignId: string; // e.g. EN-2024-0017
  linkedElectronicsDesignTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  firmwareLeadId: string;
  firmwareLeadName: string;
  firmwareLeadAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: FirmwareDevelopmentStageInfo[];
  input: FirmwareDevelopmentFormInput;
  aiAssessment: FirmwareDevelopmentAIFirmwareScore;
  summary: FirmwareDevelopmentReadinessSummary;
  keyHighlights: string[];

  linkedHardwareBringupId?: string | null;
  approvalDecision?: FirmwareDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: FirmwareDevelopmentAuditEntry[];
}

/* ===========================================================================
   Software Development Module Interfaces
   =========================================================================== */

export type SoftwareDevelopmentStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type SoftwareDevelopmentStage =
  | "software_architecture_planning"
  | "development_integration"
  | "testing_deployment"
  | "engineering_review";

export type SoftwareDevelopmentApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface SoftwareDevelopmentStageInfo {
  id: SoftwareDevelopmentStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface SoftwareDevelopmentTestItem {
  id: string;
  name: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending";
  details?: string;
}

export interface SoftwareDevelopmentAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface SoftwareDevelopmentReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface SoftwareDevelopmentAISoftwareScore {
  aiOverallSoftwareScore: number; // /100
  aiCodeQualityScore: number; // /100
  aiArchitectureAssessment: number; // /100
  aiPerformanceOptimization: number; // /100
  aiSecurityAssessment: number; // /100
  aiMaintainabilityAnalysis: number; // /100
  aiTechnicalDebtAnalysis: number; // /100
}

export interface SoftwareDevelopmentReadinessSummary {
  overallSoftwareScore: number; // /100
  developmentProgress: number; // /100
  architectureReadiness: number; // /100
  testingReadiness: number; // /100
  deploymentReadiness: number; // /100
  recommendation: string;
}

export interface SoftwareDevelopmentAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: SoftwareDevelopmentStage;
  status?: SoftwareDevelopmentStatus;
}

export interface SoftwareDevelopmentFormInput {
  // Panel 1: Software Project Overview
  productName: string;
  softwareName: string;
  developmentObjective: string;
  businessRequirements: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  developmentStatus: string;
  techStackImageUrl: string;

  // Panel 2: Software Architecture
  architectureStyle: string;
  applicationArchitecture: string;
  backendArchitecture: string;
  frontendArchitecture: string;
  microservicesCount: number;
  middleware: string;
  architectureStatus: string;
  softwareArchitectureDiagramUrl: string;

  // Panel 3: Technology Stack
  frontendFramework: string;
  backendFramework: string;
  programmingLanguages: string[];
  database: string;
  cloudPlatform: string;
  containerPlatform: string;
  technologyReadinessScore: number; // /100

  // Panel 4: API & Integration
  apiTypesList: { name: string; checked: boolean }[];
  apiGateway: string;
  thirdPartyApis: string[];
  erpIntegration: string;
  apiStatus: string;

  // Panel 5: Database Design
  databaseType: string;
  databaseSchemaLink: string;
  masterTablesCount: number;
  transactionTablesCount: number;
  dataRetentionPolicy: string;
  backupStrategy: string;
  databaseReadinessScore: number; // /100

  // Panel 6: DevOps & CI/CD
  sourceCodeRepository: string;
  branchStrategy: string;
  cicdPlatform: string;
  buildPipeline: string;
  deploymentStrategy: string;
  monitoringPlatform: string;
  devOpsStatus: string;
  pipelineStages: { id: string; name: string; status: "completed" | "in_progress" | "pending" }[];
  environments: { name: string; active: boolean; badgeColor?: string }[];

  // Panel 7: Security & Compliance
  authenticationMethod: string;
  authorizationModel: string;
  encryptionStandard: string;
  apiSecurity: string;
  secureCodingStandard: string;
  regulatoryComplianceTags: string[];
  securityScore: number; // /100

  // Panel 8: Testing & Quality Assurance
  testItems: SoftwareDevelopmentTestItem[];
  codeCoverage: number; // %

  // Panel 9: AI Assessment
  aiAssessment: SoftwareDevelopmentAISoftwareScore;

  // Panel 10: Software Release Summary
  summary: SoftwareDevelopmentReadinessSummary;

  // Panel 11: Attachments
  attachments: SoftwareDevelopmentAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: SoftwareDevelopmentReviewerItem[];
  approvalDecision: SoftwareDevelopmentApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface SoftwareDevelopmentRecord {
  id: string;
  softwareId: string; // e.g. SWD-2024-0017
  formCode: string; // e.g. SWF-2024-25
  softwareProjectName: string;
  softwareVersion: string;
  status: SoftwareDevelopmentStatus;
  currentStage: SoftwareDevelopmentStage;
  currentStageLabel: string;
  createdOn: string;

  linkedProductArchitectureId: string; // e.g. PA-2024-0017
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0017
  linkedPrdTitle: string;
  linkedProductRoadmapId: string; // e.g. RM-2024-0012
  linkedProductRoadmapTitle: string;
  linkedFirmwareDevelopmentId: string; // e.g. FWD-2024-0017
  linkedFirmwareDevelopmentTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  softwareArchitectId: string;
  softwareArchitectName: string;
  softwareArchitectAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: SoftwareDevelopmentStageInfo[];
  input: SoftwareDevelopmentFormInput;
  aiAssessment: SoftwareDevelopmentAISoftwareScore;
  summary: SoftwareDevelopmentReadinessSummary;
  keyHighlights: string[];

  linkedSystemIntegrationId?: string | null;
  approvalDecision?: SoftwareDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: SoftwareDevelopmentAuditEntry[];
}

/* ===========================================================================
   Mobile App Development Module Interfaces
   =========================================================================== */

export type MobileDevelopmentStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected"
  | "Archived";

export type MobileDevelopmentStage =
  | "mobile_architecture_uiux"
  | "application_development"
  | "testing_deployment"
  | "review_release";

export type MobileDevelopmentApprovalDecision =
  | "Approved"
  | "Approved with Conditions"
  | "Revision Required"
  | "Rejected";

export interface MobileDevelopmentStageInfo {
  id: MobileDevelopmentStage;
  label: string;
  stageNumber: number;
  status: "completed" | "in_progress" | "pending";
  description: string;
}

export interface MobileDevelopmentTestItem {
  id: string;
  name: string;
  status: "Completed" | "Passed" | "In Progress" | "Pending" | "Ready";
  details?: string;
}

export interface MobileDevelopmentAttachmentItem {
  id: string;
  name: string;
  typeIcon: string;
  size: string;
  category: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface MobileDevelopmentReviewerItem {
  id: string;
  role: string;
  person: string;
  decision: "Approved" | "Pending" | "Rejected" | "Revision Required";
  status: string;
  date: string | null;
}

export interface MobileDevelopmentAIMobileScore {
  aiOverallMobileScore: number; // /100
  aiCodeQualityScore: number; // /100
  aiUiReview: number; // /100
  aiPerformanceAnalysis: number; // /100
  aiSecurityReview: number; // /100
  aiCrashPrediction: number; // /100
  aiUxSuggestions: number; // /100
}

export interface MobileDevelopmentReadinessSummary {
  overallMobileScore: number; // /100
  developmentProgress: number; // /100
  uiReadiness: number; // /100
  performanceReadiness: number; // /100
  storeReadiness: number; // /100
  recommendation: string;
}

export interface MobileDevelopmentAuditEntry {
  at: string;
  actor: string;
  event: string;
  stage?: MobileDevelopmentStage;
  status?: MobileDevelopmentStatus;
}

export interface MobileDevelopmentFormInput {
  // Panel 1: Project Overview
  productName: string;
  mobileApplicationName: string;
  projectObjective: string;
  targetUsersTags: string[];
  developmentStatus: string;
  appMockupImageUrl: string;

  // Panel 2: Architecture
  architecturePattern: string;
  mobileFramework: string;
  platform: string[];
  stateManagement: string;
  navigationArchitecture: string;
  offlineStrategy: string;
  architectureStatus: string;
  mobileArchitectureDiagramUrl: string;

  // Panel 3: UI / UX Development
  uiFramework: string;
  designSystem: string;
  responsiveDesign: string;
  accessibilityCompliance: string;
  themeSupport: string;
  localizationSupport: string;
  uiReadinessScore: number; // /100
  uiScreensPreviewUrl: string;

  // Panel 4: API & Backend Integration
  apiIntegrationList: { name: string; checked: boolean }[];
  integrationStatus: string;
  totalApisIntegrated: number;
  successfulCallsPct: string;
  lastSync: string;

  // Panel 5: Device Features
  deviceCapabilitiesList: { name: string; checked: boolean }[];
  deviceIntegrationScore: number; // /100

  // Panel 6: Performance & Security
  authenticationMethod: string;
  dataEncryption: string;
  offlineStorage: string;
  apiSecurity: string;
  performanceOptimization: string;
  batteryOptimization: string;
  securityScore: number; // /100

  // Panel 7: Testing & Deployment
  testItems: MobileDevelopmentTestItem[];
  codeCoverage: number; // %

  // Panel 8: App Store Release Management
  androidPackageName: string;
  androidPackageSize: string;
  iosPackageName: string;
  iosPackageSize: string;
  googlePlayStatus: string;
  appleAppStoreStatus: string;
  versionCode: number;
  releaseStatus: string;

  // Panel 9: AI Assessment
  aiAssessment: MobileDevelopmentAIMobileScore;

  // Panel 10: Mobile Release Summary
  summary: MobileDevelopmentReadinessSummary;

  // Panel 11: Attachments
  attachments: MobileDevelopmentAttachmentItem[];

  // Panel 12: Review & Approval
  reviewers: MobileDevelopmentReviewerItem[];
  approvalDecision: MobileDevelopmentApprovalDecision | null;
  reviewComments: string;
  approvalDate: string;
}

export interface MobileDevelopmentRecord {
  id: string;
  mobileId: string; // e.g. MAD-2024-0017
  formCode: string; // e.g. MAF-2024-25
  mobileProjectName: string;
  mobileAppVersion: string;
  status: MobileDevelopmentStatus;
  currentStage: MobileDevelopmentStage;
  currentStageLabel: string;
  createdOn: string;

  linkedSoftwareDevelopmentId: string; // e.g. SWD-2024-0012
  linkedSoftwareDevelopmentTitle: string;
  linkedProductArchitectureId: string; // e.g. PA-2024-0011
  linkedProductArchitectureTitle: string;
  linkedPrdId: string; // e.g. PRD-2024-0009
  linkedPrdTitle: string;
  linkedProductRoadmapId: string; // e.g. RM-2024-0010
  linkedProductRoadmapTitle: string;
  linkedProductId: string;
  linkedProductName: string;

  businessUnit: string;
  mobileArchitectId: string;
  mobileArchitectName: string;
  mobileArchitectAvatar: string;
  lastUpdated: string;

  dateCreated: string;
  lastModified: string;
  version: string;

  stages: MobileDevelopmentStageInfo[];
  input: MobileDevelopmentFormInput;
  aiAssessment: MobileDevelopmentAIMobileScore;
  summary: MobileDevelopmentReadinessSummary;
  keyHighlights: string[];

  linkedMobileOperationsId?: string | null;
  approvalDecision?: MobileDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;

  auditTrail: MobileDevelopmentAuditEntry[];
}

/* ===========================================================================
   API Development Module Interfaces & Types
   =========================================================================== */

export type ApiDevelopmentStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";

export type ApiDevelopmentApprovalDecision = "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Pending";

export type ApiEndpoint = {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  name: string;
  description: string;
  authRequired: boolean;
  status: "Stable" | "Beta" | "Deprecated";
  requestSchemaName: string;
  requestSchemaSize: string;
  responseSchemaName: string;
  responseSchemaSize: string;
  sampleResponse: string;
};

export type ApiSecurityPolicy = {
  authMethod: string;
  authorizationModel: string;
  tokenExpiryMinutes: number;
  apiKeyManagement: boolean;
  rbacEnabled: boolean;
  rateLimit: string;
  securityScore: number;
};

export type ApiIntegrationConfig = {
  primaryDataSource: string;
  databaseConnection: string;
  erpIntegration: boolean;
  cloudIntegration: boolean;
  thirdPartyIntegration: boolean;
  webhookIntegration: boolean;
  integrationScore: number;
};

export type ApiDocumentationInfo = {
  openApiSpecName: string;
  openApiSpecSize: string;
  swaggerDocName: string;
  swaggerDocSize: string;
  sampleRequestsName: string;
  sampleRequestsSize: string;
  sampleResponsesName: string;
  sampleResponsesSize: string;
  errorCodesCount: number;
  sdkLanguages: string[];
  documentationScore: number;
};

export type ApiTestSummary = {
  unitTesting: "Completed" | "In Progress" | "Pending";
  integrationTesting: "Completed" | "In Progress" | "Pending";
  loadTesting: "Completed" | "In Progress" | "Pending";
  securityTesting: "Completed" | "In Progress" | "Pending";
  contractTesting: "Completed" | "In Progress" | "Pending";
  testCoveragePercentage: number;
  validationScore: number;
};

export type ApiDeploymentConfig = {
  cicdPipeline: string;
  apiGateway: string;
  environment: string;
  versionStrategy: string;
  deprecationPolicy: string;
  releaseStatus: string;
  deploymentReadinessScore: number;
};

export type ApiMonitoringSummary = {
  apiMonitoringTool: string;
  requestAnalyticsEnabled: boolean;
  errorMonitoringEnabled: boolean;
  latencyMonitoringEnabled: boolean;
  slaMonitoringEnabled: boolean;
  usageDashboardEnabled: boolean;
  operationalScore: number;
  requestTrend7Days: { day: string; requests: number }[];
};

export type ApiAiAssessment = {
  aiApiDesignScore: number;
  aiSecurityReview: number;
  aiPerformanceAnalysis: number;
  aiScalabilityAnalysis: number;
  aiDocumentationReview: number;
  aiImprovementSuggestionsCount: number;
  aiOverallScore: number;
  recommendations: string[];
};

export type ApiReadinessSummary = {
  designReadiness: number;
  securityReadiness: number;
  testingReadiness: number;
  deploymentReadiness: number;
  overallApiScore: number;
  recommendation: string;
};

export type ApiAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type ApiReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: ApiDevelopmentApprovalDecision;
  date: string;
  comments: string;
};

export type ApiAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type ApiDevelopmentFormInput = {
  apiName: string;
  businessObjective: string;
  functionalDescription: string;
  apiCategory: string;
  deploymentEnvironment: string;
  apiStyle: string;
  protocol: string;
  endpointStructure: string;
  uriNamingConvention: string;
  authMethod: string;
  authorizationModel: string;
  tokenExpiryMinutes: number;
  rateLimit: string;
  primaryDataSource: string;
  databaseConnection: string;
  cicdPipeline: string;
  apiGateway: string;
  versionStrategy: string;
  deprecationPolicy: string;
  recommendation: string;
};

export type ApiDevelopmentRecord = {
  id: string;
  apiDevelopmentId: string; // e.g. API-2024-0017
  formCode: string; // e.g. APF-2024-25
  apiProjectName: string; // e.g. EV Charging APIs
  apiVersion: string; // e.g. v2.1.0
  workflowStatus: ApiDevelopmentStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Smart EV Platform
  linkedSoftwareDevId: string; // e.g. SWD-2024-0012
  linkedCloudPlatformId: string; // e.g. CLD-2024-0001
  linkedMobileAppDevId: string; // e.g. MAD-2024-0005
  linkedEmbeddedSystemsDevId: string; // e.g. EMD-2024-0004
  apiArchitectName: string;
  apiArchitectAvatar: string;
  businessUnit: string;

  // Overview Card Data
  apiName: string;
  businessObjective: string;
  functionalDescription: string;
  consumerApplications: string[];
  apiCategory: string;
  deploymentEnvironment: string;
  developmentStatus: string;

  // Section Scores & Sub-Objects
  designReadinessScore: number;
  securityScore: number;
  integrationScore: number;
  documentationScore: number;
  validationScore: number;
  deploymentReadinessScore: number;
  operationalScore: number;
  aiOverallScore: number;
  overallApiScore: number;

  endpoints: ApiEndpoint[];
  securityPolicy: ApiSecurityPolicy;
  integrationConfig: ApiIntegrationConfig;
  documentationInfo: ApiDocumentationInfo;
  testSummary: ApiTestSummary;
  deploymentConfig: ApiDeploymentConfig;
  monitoringSummary: ApiMonitoringSummary;
  aiAssessment: ApiAiAssessment;
  readinessSummary: ApiReadinessSummary;
  attachments: ApiAttachment[];
  reviewers: ApiReviewer[];
  approvalDecision?: ApiDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: ApiAuditEntry[];
};

/* ===========================================================================
   AI Model Development Module Interfaces & Types
   =========================================================================== */

export type AiModelStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";

export type AiModelApprovalDecision = "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Pending";

export type AiDatasetConfig = {
  datasetName: string;
  datasetSource: string;
  datasetSize: string;
  dataFormat: string;
  trainDataset: string;
  valDataset: string;
  testDataset: string;
  dataQualityScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  uniqueness: number;
};

export type AiFeatureConfig = {
  selectionMethod: string;
  extraction: string;
  scaling: string;
  preprocessing: string;
  missingValueStrategy: string;
  featureReadinessScore: number;
};

export type AiArchitectureConfig = {
  aiCategory: string;
  modelType: string;
  framework: string;
  language: string;
  hyperparameters: string;
  modelDesignScore: number;
};

export type AiTrainingMetrics = {
  strategy: string;
  optimizer: string;
  lossFunction: string;
  batchSize: number;
  epochs: number;
  gpuUtilization: string;
  trainingStatus: string;
  trainingScore: number;
  learningCurve: { epoch: number; trainLoss: number; valLoss: number }[];
};

export type AiEvaluationMetrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: number[][];
  evaluationScore: number;
};

export type AiGovernancePolicy = {
  explainabilityMethod: string;
  biasDetection: string;
  fairnessAssessment: string;
  privacyCompliance: string;
  ethicalReview: string;
  riskClassification: string;
  governanceScore: number;
};

export type AiMlopsDeployment = {
  platform: string;
  containerization: string;
  registry: string;
  cicdPipeline: string;
  monitoringPlatform: string;
  inferenceEndpoint: string;
  deploymentStatus: string;
  deploymentReadinessScore: number;
};

export type AiModelAssessmentInfo = {
  aiPerformanceScore: number;
  aiRobustnessReview: string;
  aiSecurityReview: string;
  aiDriftPrediction: string;
  aiOptimizationSuggestions: string;
  aiExplainabilityReview: string;
  aiOverallScore: number;
};

export type AiReadinessSummaryInfo = {
  datasetReadiness: number;
  modelReadiness: number;
  deploymentReadiness: number;
  governanceReadiness: number;
  overallAiModelScore: number;
  recommendation: string;
};

export type AiAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type AiReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: AiModelApprovalDecision;
  date: string;
  comments: string;
};

export type AiAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type AiModelFormInput = {
  aiProjectName: string;
  businessObjective: string;
  aiUseCase: string;
  problemStatement: string;
  expectedBusinessOutcome: string;
  developmentStatus: string;
  datasetName: string;
  modelType: string;
  framework: string;
  hyperparameters: string;
  deploymentPlatform: string;
  inferenceEndpoint: string;
  recommendation: string;
};

export type AiModelRecord = {
  id: string;
  aiModelDevelopmentId: string; // e.g. AIMD-2024-0018
  formCode: string; // e.g. AMDF-2024-25
  aiProjectName: string; // e.g. EV Demand Forecasting Model
  modelVersion: string; // e.g. v1.2.0
  workflowStatus: AiModelStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Smart EV Platform
  linkedCloudPlatformId: string; // e.g. CLD-2024-0001
  linkedDataEngineeringId: string; // e.g. DE-2024-0005
  linkedSoftwareDevId: string; // e.g. SWD-2024-0012
  linkedApiDevId: string; // e.g. API-2024-0017
  aiLeadEngineerName: string;
  aiLeadEngineerAvatar: string;
  businessUnit: string;

  // Overview Card Data
  businessObjective: string;
  aiUseCase: string;
  targetUsers: string[];
  problemStatement: string;
  expectedBusinessOutcome: string;
  developmentStatus: string;

  // Section Scores & Sub-Objects
  datasetReadinessScore: number;
  featureReadinessScore: number;
  modelDesignScore: number;
  trainingScore: number;
  evaluationScore: number;
  governanceScore: number;
  deploymentReadinessScore: number;
  aiOverallScore: number;
  overallAiModelScore: number;

  datasetConfig: AiDatasetConfig;
  featureConfig: AiFeatureConfig;
  architectureConfig: AiArchitectureConfig;
  trainingMetrics: AiTrainingMetrics;
  evaluationMetrics: AiEvaluationMetrics;
  governancePolicy: AiGovernancePolicy;
  mlopsDeployment: AiMlopsDeployment;
  aiAssessment: AiModelAssessmentInfo;
  readinessSummary: AiReadinessSummaryInfo;
  attachments: AiAttachment[];
  reviewers: AiReviewer[];
  approvalDecision?: AiModelApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: AiAuditEntry[];
};

// ---------------------------------------------------------------------------
// Cloud Platform Development Module Types
// ---------------------------------------------------------------------------

export type CloudPlatformStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type CloudPlatformApprovalDecision = "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Pending";

export type CloudArchitectureConfig = {
  architectureStyle: string;
  deploymentModel: string;
  computePlatform: string;
  storageArchitecture: string;
  networkTopology: string;
  loadBalancers: string;
  apiGateway: string;
  serviceMesh: string;
  drStrategy: string;
  architectureStatus: string;
  architectureReadinessScore: number;
};

export type CloudServiceItem = {
  name: string;
  category: string;
  status: "Active" | "Configured font-semibold" | "Pending";
  provider: string;
  score: number;
};

export type CloudServicesConfig = {
  apiGateway: string;
  authenticationService: string;
  authorizationService: string;
  notificationService: string;
  messagingQueue: string;
  objectStorage: string;
  fileStorage: string;
  iotDeviceServices: string;
  secretsManagement: string;
  serviceDiscovery: string;
  serviceReadinessScore: number;
  servicesList: CloudServiceItem[];
};

export type CloudDatabaseConfig = {
  primaryDatabase: string;
  cachePlatform: string;
  dataWarehouse: string;
  backupStrategy: string;
  disasterRecovery: string;
  replicationStrategy: string;
  storageAnalytics: string;
  dataRetentionPolicy: string;
  dbScalingStrategy: string;
  dataPlatformScore: number;
};

export type CloudSecurityConfig = {
  identityProvider: string;
  authenticationMethod: string;
  authorizationModel: string;
  oauthProtocol: string;
  oidcProvider: string;
  rbacPolicy: string;
  encryptionStandard: string;
  secretsManager: string;
  certificateManagement: string;
  complianceStandards: string[];
  securityScore: number;
};

export type CloudDevOpsConfig = {
  infrastructureAsCode: string;
  containerPlatform: string;
  kubernetesCluster: string;
  cicdPipeline: string;
  containerRegistry: string;
  monitoringPlatform: string;
  loggingPlatform: string;
  terraformVersion: string;
  gitOpsTool: string;
  deploymentStatus: string;
  infrastructureReadinessScore: number;
};

export type CloudScalabilityMetrics = {
  autoScalingStrategy: string;
  loadBalancingType: string;
  cdnIntegration: string;
  highAvailability: string;
  performanceBenchmark: string;
  capacityPlanning: string;
  latencyAvgMs: number;
  throughputTps: number;
  scalabilityScore: number;
};

export type CloudMonitoringConfig = {
  applicationMonitoring: string;
  infrastructureMonitoring: string;
  alertManagement: string;
  incidentResponsePlan: string;
  slaMonitoring: string;
  operationalDashboard: string;
  uptime30DaysPct: number;
  activeAlertsCount: number;
  incidentsCount: number;
  operationsReadinessScore: number;
};

export type CloudAiAssessmentInfo = {
  aiArchitectureScore: number;
  aiCostOptimizationScore: number;
  aiPerformanceOptimizationScore: number;
  aiSecurityAssessmentScore: number;
  aiCapacityPredictionScore: number;
  aiReliabilityAnalysisScore: number;
  aiOverallCloudScore: number;
  aiSuggestions: string[];
};

export type CloudReadinessSummaryInfo = {
  architectureReadiness: number;
  securityReadiness: number;
  infrastructureReadiness: number;
  operationsReadiness: number;
  performanceReadiness: number;
  overallCloudPlatformScore: number;
  recommendation: string;
  riskSummary: string;
};

export type CloudAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type CloudReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: CloudPlatformApprovalDecision;
  date: string;
  comments: string;
};

export type CloudAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type CloudPlatformFormInput = {
  cloudProjectName: string;
  businessPurpose: string;
  platformObjective: string;
  targetUsers: string[];
  deploymentModel: string;
  computePlatform: string;
  primaryDatabase: string;
  identityProvider: string;
  containerPlatform: string;
  recommendation: string;
};

export type CloudPlatformRecord = {
  id: string;
  cloudPlatformDevelopmentId: string; // e.g. CLD-2024-0001
  formCode: string; // e.g. CLD-F-2024-25
  cloudProjectName: string; // e.g. Magnertia Cloud Platform
  platformVersion: string; // e.g. v2.1.0
  workflowStatus: CloudPlatformStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedSoftwareDevId: string; // e.g. SWD-2024-0012
  linkedMobileDevId: string; // e.g. MAD-2024-0005
  linkedEmbeddedDevId: string; // e.g. EMD-2024-0003
  linkedProductArchitectureId: string; // e.g. PA-2024-0011
  linkedProductId: string; // e.g. Smart EV Platform
  businessUnit: string;
  cloudArchitectName: string;
  cloudArchitectAvatar: string;

  // Overview Card Data
  platformName: string;
  platformObjective: string;
  businessPurpose: string;
  targetUsers: string[];
  supportedProducts: string;
  slaTarget: string;
  developmentStatus: string;

  // Section Scores & Configs
  architectureReadinessScore: number;
  securityScore: number;
  infrastructureReadinessScore: number;
  operationsReadinessScore: number;
  performanceScore: number;
  overallCloudPlatformScore: number;

  architectureConfig: CloudArchitectureConfig;
  servicesConfig: CloudServicesConfig;
  dataPlatformConfig: CloudDatabaseConfig;
  securityConfig: CloudSecurityConfig;
  devOpsConfig: CloudDevOpsConfig;
  scalabilityMetrics: CloudScalabilityMetrics;
  monitoringConfig: CloudMonitoringConfig;
  aiAssessment: CloudAiAssessmentInfo;
  readinessSummary: CloudReadinessSummaryInfo;
  attachments: CloudAttachment[];
  reviewers: CloudReviewer[];
  approvalDecision?: CloudPlatformApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: CloudAuditEntry[];
};

// ---------------------------------------------------------------------------
// Cybersecurity Engineering Module Types
// ---------------------------------------------------------------------------

export type CybersecurityStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type CybersecurityApprovalDecision = "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Pending";

export type CybersecurityThreatModelConfig = {
  method: string; // e.g. STRIDE
  assetsIdentified: number;
  attackSurface: string; // e.g. High
  threatScenariosCount: number;
  riskRating: string; // e.g. High
  securityControlsProposed: number;
  threatModelScore: number; // e.g. 88
};

export type CybersecurityArchitectureConfig = {
  securityArchitecture: string; // e.g. architecture_v1.2.pdf
  zeroTrustApplied: boolean;
  networkSegmentation: string;
  secureCommunication: string; // e.g. TLS 1.3
  encryptionStandard: string; // e.g. AES-256
  keyManagement: string; // e.g. AWS KMS
  architectureSecurityScore: number; // e.g. 92
};

export type CybersecurityIamConfig = {
  authenticationMethod: string; // e.g. OAuth 2.0 / OIDC
  mfaEnabled: boolean;
  authorizationModel: string; // e.g. RBAC
  roleBasedAccessControl: boolean;
  certificateManagement: string; // e.g. AES ACM
  secretsManagement: string; // e.g. HashiCorp Vault
  iamReadinessScore: number; // e.g. 90
};

export type CybersecuritySecureDevConfig = {
  secureCodingStandard: string; // e.g. OWASP ASVS
  sastStatus: string; // e.g. Completed
  scaStatus: string; // e.g. Completed
  dependencyScanning: boolean;
  codeReviewCompleted: boolean;
  vulnerabilitiesFoundCount: number; // e.g. 4
  secureDevelopmentScore: number; // e.g. 89
};

export type CybersecurityTestingConfig = {
  dastStatus: string; // e.g. Completed
  penetrationTesting: string; // e.g. Completed
  apiSecurityTesting: string; // e.g. Completed
  firmwareSecurityTesting: string; // e.g. Completed
  iotSecurityTesting: string; // e.g. Completed
  complianceValidation: string; // e.g. Passed
  validationScore: number; // e.g. 93
};

export type CybersecurityMonitoringConfig = {
  siemPlatform: string; // e.g. Microsoft Sentinel
  logManagement: string; // e.g. Azure Log Analytics
  threatIntelligence: string; // e.g. Recorded Future
  incidentResponsePlan: string; // e.g. incident_response_v1.0.pdf
  vulnerabilityManagement: string; // e.g. Qualys VMDR
  securityDashboardStatus: string;
  monitoringScore: number; // e.g. 91
};

export type CybersecurityComplianceConfig = {
  applicableStandards: string[]; // e.g. ["ISO 27001", "NIST CSF", "OWASP ASVS"]
  privacyCompliance: string; // e.g. GDPR
  riskAssessmentFile: string; // e.g. risk_assessment_v1.pdf
  auditSchedule: string; // e.g. Quarterly
  complianceStatus: string; // e.g. Compliant
  residualRisk: string; // e.g. Low
  governanceScore: number; // e.g. 93
};

export type CybersecurityAiAssessmentInfo = {
  aiThreatDetectionScore: number; // 92
  aiVulnerabilityAnalysis: string; // Low risk detected
  aiSecurityRecommendationsCount: number; // 12
  aiComplianceReview: string; // Compliant
  aiRiskPrediction: string; // Low risk for next 90 days
  aiOverallSecurityScore: number; // 92
};

export type CybersecurityReadinessSummaryInfo = {
  threatReadiness: number; // 90
  architectureSecurityScore: number; // 92
  secureDevelopmentScore: number; // 89
  complianceScore: number; // 93
  overallCybersecurityScore: number; // 91
  recommendation: string; // Proceed to Production
};

export type CybersecurityAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type CybersecurityReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: CybersecurityApprovalDecision;
  date: string;
  comments: string;
};

export type CybersecurityAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type CybersecurityFormInput = {
  securityProjectName: string;
  businessObjective: string;
  securityScope: string;
  productCategory: string;
  criticalityLevel: string;
  targetDeployment: string[];
  recommendation: string;
};

export type CybersecurityRecord = {
  id: string;
  cybersecurityEngineeringId: string; // e.g. CSE-2024-0018
  formCode: string; // e.g. CSEF-2024-25
  securityProjectName: string; // e.g. Smart EV Charging Security
  securityVersion: string; // e.g. v1.2.0
  workflowStatus: CybersecurityStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Smart EV Charger
  linkedSoftwareDevId: string; // e.g. SWD-2024-0012
  linkedCloudPlatformDevId: string; // e.g. CLD-2024-0001
  linkedEmbeddedSystemsDevId: string; // e.g. EMD-2024-0013
  linkedApiDevId: string; // e.g. API-2024-0011
  linkedAiModelDevId: string; // e.g. AIMD-2024-0007
  linkedIotDevId: string; // e.g. IOT-2024-0009
  securityArchitectName: string;
  securityArchitectAvatar: string;

  // Overview Card Data
  businessObjective: string;
  securityScope: string;
  productCategory: string;
  criticalityLevel: string;
  targetDeployment: string[];
  developmentStatus: string;

  // Section Scores & Sub-Objects
  threatReadinessScore: number;
  architectureSecurityScore: number;
  iamReadinessScore: number;
  secureDevelopmentScore: number;
  validationScore: number;
  monitoringScore: number;
  governanceScore: number;
  overallCybersecurityScore: number;

  threatModelConfig: CybersecurityThreatModelConfig;
  architectureConfig: CybersecurityArchitectureConfig;
  iamConfig: CybersecurityIamConfig;
  secureDevConfig: CybersecuritySecureDevConfig;
  testingConfig: CybersecurityTestingConfig;
  monitoringConfig: CybersecurityMonitoringConfig;
  complianceConfig: CybersecurityComplianceConfig;
  aiAssessment: CybersecurityAiAssessmentInfo;
  readinessSummary: CybersecurityReadinessSummaryInfo;
  attachments: CybersecurityAttachment[];
  reviewers: CybersecurityReviewer[];
  approvalDecision?: CybersecurityApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: CybersecurityAuditEntry[];
};

// ---------------------------------------------------------------------------
// Simulation & Analysis Module Types
// ---------------------------------------------------------------------------

export type SimulationStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type SimulationApprovalDecision = "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected" | "Pending";

export type SimulationModelPrepConfig = {
  cadModel: string; // e.g. W-EVSE_Housing_v2.step
  materialLibrary: string; // e.g. Aluminium 6061-T6
  meshStrategy: string; // e.g. Tetrahedral
  totalElements: string; // e.g. 1,245,876
  meshQuality: string; // e.g. 0.92 (Excellent)
  meshPreviewStatus: string;
  modelCompletenessScore: number; // 90
};

export type SimulationBoundaryConditionsConfig = {
  loadConditions: string[]; // e.g. ["Weight", "Mounting Load", "Wind Load"]
  constraints: string; // e.g. Fixed Support (Base)
  environmentalConditions: string; // e.g. Ambient: 45 °C, Convection: 25 W/m²K
  operatingScenario: string; // e.g. Continuous Operation (Max Load)
  boundaryValidationStatus: string; // e.g. Validated
  boundaryConditionScore: number; // 92
};

export type SimulationConfigurationConfig = {
  solverType: string; // e.g. ANSYS Mechanical
  solverVersion: string; // e.g. 2024 R1
  analysisMethod: string; // e.g. Transient Thermal + Static Structural
  timeStep: string; // e.g. 0.02 sec
  convergenceCriteria: string; // e.g. Energy (1e-6)
  computingPlatform: string; // e.g. HPC Cluster (GPU)
  configurationScore: number; // 93
};

export type SimulationAnalysisCategoriesConfig = {
  structuralAnalysisStatus: string; // Completed
  thermalAnalysisStatus: string; // Completed
  cfdAnalysisStatus: string; // Completed
  electromagneticAnalysisStatus: string; // Not Required
  dynamicAnalysisStatus: string; // Completed
  fatigueAnalysisStatus: string; // Not Required
  multiPhysicsAnalysisStatus: string; // Completed
  analysisCompletionScore: number; // 95
};

export type SimulationResultsConfig = {
  maxStressVonMises: string; // e.g. 78.6 MPa
  maxDisplacement: string; // e.g. 0.42 mm
  maxTemperature: string; // e.g. 78.4 °C
  heatTransferCoefficient: string; // e.g. 25 W/m²K
  efficiencyPrediction: string; // e.g. 94.2%
  correlationWithPrototype: string; // e.g. 96.3%
  validationScore: number; // 93
};

export type SimulationOptimizationConfig = {
  designOptimization: string; // Completed
  topologyOptimization: string; // Not Required
  weightReductionPct: number; // 8.7%
  performanceImprovementPct: number; // 11.3%
  costOptimizationPct: number; // 6.4%
  optimizationRecommendations: string; // e.g. Add ribs near mounting region, Optimize fin geometry for better thermal dissipation.
  optimizationScore: number; // 89
  iterationsData: { iteration: string; weightKg: number; maxTempC: number }[];
};

export type SimulationAiAssessmentInfo = {
  aiSimulationReview: string; // Model accurate with high confidence.
  aiDesignValidation: string; // All critical zones validated successfully.
  aiPerformancePrediction: string; // Thermal margin is sufficient (18.6 °C).
  aiFailurePrediction: string; // Low risk of thermal stress failure.
  aiOptimizationSuggestions: string; // Improve airflow path and fin spacing.
  aiEngineeringScore: number; // 92
};

export type SimulationReadinessSummaryInfo = {
  modelReadiness: number; // 90
  simulationAccuracy: number; // 92
  validationScore: number; // 93
  optimizationScore: number; // 89
  overallSimulationScore: number; // 91
  recommendation: string; // Proceed to Prototype Development
};

export type SimulationAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type SimulationReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: SimulationApprovalDecision;
  date: string;
  comments: string;
};

export type SimulationAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type SimulationFormInput = {
  simulationProjectName: string;
  simulationType: string;
  engineeringDomain: string;
  simulationPurpose: string;
  operatingScenario: string;
  targetProduct: string;
  recommendation: string;
};

export type SimulationRecord = {
  id: string;
  simulationId: string; // e.g. SIM-2024-0027
  formCode: string; // e.g. SIMF-2024-25
  simulationProjectName: string; // e.g. W-EVSE Thermal & Structural Analysis
  simulationVersion: string; // e.g. v2.1.0
  workflowStatus: SimulationStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Autonomous W-EVSE
  linkedMechanicalDevId: string; // e.g. MECH-2024-0015
  linkedElectricalDevId: string; // e.g. ELEC-2024-0012
  linkedElectronicsDevId: string; // e.g. ELEC-2024-0018
  linkedEmbeddedDevId: string; // e.g. EMBD-2024-0011
  simulationEngineerName: string;
  simulationEngineerAvatar: string;

  // Overview Data
  simulationType: string;
  engineeringDomain: string;
  simulationPurpose: string;
  developmentStage: string;
  projectPriority: string;
  solver: string;
  analysisType: string;

  // Section Scores & Sub-Objects
  modelReadinessScore: number;
  configurationScore: number;
  boundaryConditionScore: number;
  analysisCompletionScore: number;
  validationScore: number;
  optimizationScore: number;
  aiEngineeringScore: number;
  overallSimulationScore: number;

  modelPrepConfig: SimulationModelPrepConfig;
  boundaryConditionsConfig: SimulationBoundaryConditionsConfig;
  configurationConfig: SimulationConfigurationConfig;
  analysisCategoriesConfig: SimulationAnalysisCategoriesConfig;
  resultsConfig: SimulationResultsConfig;
  optimizationConfig: SimulationOptimizationConfig;
  aiAssessment: SimulationAiAssessmentInfo;
  readinessSummary: SimulationReadinessSummaryInfo;
  attachments: SimulationAttachment[];
  reviewers: SimulationReviewer[];
  approvalDecision?: SimulationApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: SimulationAuditEntry[];

  // Digital Twin status
  digitalTwinStatus: string;
  digitalTwinLastUpdated: string;
};

// ---------------------------------------------------------------------------
// UI/UX Development Module Types
// ---------------------------------------------------------------------------

export type UiUxDevelopmentStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type UiUxDevelopmentApprovalDecision = "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Pending";

export type UiUxUserPersona = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  age: number;
  location: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  techSavviness: number;
  quote: string;
};

export type UiUxWireframeScreen = {
  id: string;
  title: string;
  category?: string;
  screenType?: string;
  fidelity?: string;
  responsiveBreakpoints?: string[];
  status: string;
  previewUrl: string;
  notes?: string;
  type?: string;
  screenFlow?: string;
  version?: string;
};

export type UiUxAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy?: string;
  date: string;
  url?: string;
  version?: string;
};

export type UiUxWcagAudit = {
  id: string;
  criterion?: string;
  level?: string;
  status: string;
  impact?: string;
  notes?: string;
  criteria?: string;
  wcagLevel?: string;
};

export type UiUxReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: UiUxDevelopmentApprovalDecision;
  date: string;
  comments: string;
};

export type UiUxAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type UiUxDevelopmentFormInput = {
  uiUxProjectName: string;
  productName: string;
  projectObjective: string;
  businessGoals: string;
  targetPlatforms: string[];
  designStatus: string;
  researchReadinessScore?: number;
  uxReadinessScore?: number;
  uiReadinessScore?: number;
  accessibilityScore?: number;
  developmentReadinessScore?: number;
  overallDesignScore?: number;
  lastUpdated?: string;
};

export type UiUxDevelopmentRecord = {
  id: string;
  uiUxDevelopmentId: string;
  formCode: string;
  uiUxProjectName: string;
  designVersion: string;
  workflowStatus: UiUxDevelopmentStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;
  linkedPrdId: string;
  linkedPrdTitle: string;
  linkedSoftwareDevId: string;
  linkedSoftwareDevTitle: string;
  linkedMobileAppDevId: string;
  linkedMobileAppDevTitle: string;
  linkedProductArchitectureId: string;
  linkedProductArchitectureTitle: string;
  linkedProductId: string;
  linkedProductName: string;
  businessUnit: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;

  // Overview
  productName: string;
  projectObjective: string;
  businessGoals: string;
  targetPlatforms: string[];
  designStatus: string;

  // Research
  researchMethods: string[];
  personasCount: number;
  userJourneysCount: number;
  painPointsCount: number;
  customerFeedbackCount: number;
  customerFeedbackScore: number;
  competitorsAnalyzed: number;
  personas: UiUxUserPersona[];
  painPoints?: (string | { id: string; issue: string; severity: string; category: string; impact: string })[];
  competitors?: any[];

  // Information Architecture & UX
  informationArchitectureNodesCount: number;
  userFlowsCount: number;
  wireframesCount: number;
  interactivePrototypesCount: number;
  wireframeScreens: UiUxWireframeScreen[];
  sitemapPages?: number | any[];

  // Design System & UI
  colorPaletteCount: number;
  typographyStylesCount: number;
  reusableComponentsCount: number;
  designTokensCount: number;
  figmaLibrarySynced: boolean;
  figmaLibraryVersion: string;

  // Accessibility & Usability
  wcagComplianceLevel: string;
  wcagPassRatePct: number;
  usabilityScore: number;
  accessibilityAuditsCount: number;
  wcagAudits: UiUxWcagAudit[];

  // Handoff & Dev Readiness
  handoffStatus: string;
  assetExportFormat: string[];
  componentSpecsDocumented: boolean;

  // AI Design Assessment
  aiDesignReview: string;
  aiAccessibilityCheck: string;
  aiUsabilityPrediction: string;

  // Scores & Helper Properties
  researchReadinessScore: number;
  uxReadinessScore: number;
  uiReadinessScore: number;
  accessibilityScore: number;
  developmentReadinessScore: number;
  overallDesignScore: number;

  architectureReadinessScore?: number;
  uxScore?: number;
  visualDesignScore?: number;
  designSystemVersion?: string;
  userSatisfactionScore?: number;
  aiOverallDesignScore?: number;
  aiUxScore?: number;
  aiAccessibilityReview?: number | string;
  aiConsistencyAnalysis?: number | string;
  aiUserJourneyAnalysis?: number | string;
  aiVisualDesignReview?: number | string;
  aiSuggestions?: string[];
  recommendation?: string;
  userJourneys?: { id: string; title: string; satisfactionScore: number; steps: string[]; keyTakeaway: string }[];
  wireframes?: UiUxWireframeScreen[];

  attachments: UiUxAttachment[];
  reviewers: UiUxReviewer[];
  approvalDecision?: UiUxDevelopmentApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: UiUxAuditEntry[];
};

// ---------------------------------------------------------------------------
// Testing & Validation Module Types
// ---------------------------------------------------------------------------

export type TestingStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type TestingApprovalDecision = "Approved" | "Approved with Conditions" | "Revision Required" | "On Hold" | "Rejected" | "Pending";

export type TestCaseRecord = {
  id: string;
  testCaseId: string; // e.g. TC-FUNC-001
  title: string; // e.g. Charging Session Initialization
  category: string; // e.g. Functional
  status: string; // e.g. Passed, Running, Failed, Ready
  expectedResult: string;
  actualResult: string;
  executionTime: string;
  testerName: string;
};

export type EquipmentRecord = {
  id: string;
  equipmentId: string; // e.g. EQ-OSC-04
  name: string; // e.g. Keysight 4-Channel Oscilloscope
  model: string; // e.g. InfiniiVision 3000G
  calibrationStatus: string; // e.g. Validated, Expiry Warning
  calibrationExpiry: string; // e.g. 15 Oct 2024
  assignedLab: string;
};

export type DefectRecord = {
  id: string;
  defectId: string; // e.g. DEF-2024-003
  title: string;
  severity: string; // e.g. Minor, Major, Critical
  status: string; // e.g. Open, In Progress, Resolved
  detectedIn: string;
  assignedTo: string;
};

export type TestingPlanningConfig = {
  testStrategy: string; // e.g. System & Regression Testing
  testPlanFile: string; // e.g. test_plan_v1.2.pdf
  testCasesFile: string; // e.g. test_cases_v1.2.xlsx
  acceptanceCriteria: string; // e.g. Defined (IEC 61851-1 Compliant)
  resourceAllocation: string; // e.g. Team of 5 | Lab - 2 Shifts
  planningScore: number; // 92
};

export type TestingPrototypeEquipmentConfig = {
  prototypeVersion: string; // e.g. PRT-2024-0032
  equipmentUsedCount: number; // 7 Selected
  testLaboratory: string; // e.g. Magnertia EV Lab - Coimbatore
  environmentalConditions: string; // e.g. 25°C, 60% RH
  calibrationCertificateFile: string; // e.g. calibration_jun24.pdf
  equipmentReadiness: string; // Ready
  readinessScore: number; // 94
  equipmentList: EquipmentRecord[];
};

export type TestingFunctionalConfig = {
  functionalTestStatus: string; // Passed
  electricalTestStatus: string; // Passed
  mechanicalTestStatus: string; // Passed
  firmwareTestStatus: string; // Passed
  softwareTestStatus: string; // Passed
  passFailSummary: string; // 24 / 24 Passed
  functionalScore: number; // 90
  testCases: TestCaseRecord[];
};

export type TestingPerformanceConfig = {
  performanceTestStatus: string; // Passed
  loadTestStatus: string; // Passed
  thermalTestStatus: string; // Passed
  efficiencyTestStatus: string; // Passed
  enduranceTestStatus: string; // Passed
  reliabilityTestStatus: string; // Passed
  mtbfEstimate: string; // 12,500 Hrs
  reliabilityScore: number; // 92
};

export type TestingSafetyComplianceConfig = {
  electricalSafetyStatus: string; // Passed
  emcEmiTestStatus: string; // Passed
  ipRatingTestStatus: string; // Passed (IP54)
  environmentalTestStatus: string; // Passed
  cybersecurityValidationStatus: string; // Passed
  regulatoryStandards: string[]; // ["IEC 61851", "IEC 62196", "IEC 61000", "IEC 60529", "IEC 62443"]
  complianceScore: number; // 93
};

export type TestingResultsConfig = {
  testResultsFile: string; // test_results_v1.2.pdf
  defectsIdentifiedCount: number; // 3
  criticalIssuesCount: number; // 0
  validationReportFile: string; // validation_report_v1.2.pdf
  prototypeCorrelationPct: number; // 95%
  customerRequirementCompliancePct: number; // 96%
  validationScore: number; // 89
  defectsList: DefectRecord[];
};

export type TestingAiAssessmentInfo = {
  aiTestAnalysis: string; // All test cases executed as per plan.
  aiDefectPrediction: string; // Low risk of major defects.
  aiReliabilityPrediction: string; // High reliability expected in field use.
  aiComplianceAssessment: string; // Standards compliance confirmed.
  aiImprovementSuggestions: string; // Improve heat sink design for better long-term performance.
  aiValidationScore: number; // 91
};

export type TestingSummaryInfo = {
  functionalScore: number; // 90
  reliabilityScore: number; // 92
  complianceScore: number; // 93
  validationScore: number; // 89
  overallQualityScore: number; // 91
  recommendation: string; // Proceed to Product Certification
};

export type TestingAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type TestingReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: TestingApprovalDecision;
  date: string;
  comments: string;
};

export type TestingAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type TestingFormInput = {
  testProjectName: string;
  testObjective: string;
  testScope: string;
  testEnvironment: string;
  priority: string;
  recommendation: string;
};

export type TestingValidationRecord = {
  id: string;
  testingValidationId: string; // e.g. TV-2024-0075
  formCode: string; // e.g. TVF-2024-25
  testProjectName: string; // e.g. Smart EV Charger Validation
  testVersion: string; // e.g. v1.2.0
  workflowStatus: TestingStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Smart EV Charger AC 7kW
  linkedPrototypeId: string; // e.g. PRT-2024-0032
  linkedSimulationId: string; // e.g. SIM-2024-0061
  testEngineerName: string;
  testEngineerAvatar: string;
  qaEngineerName: string;
  qaEngineerAvatar: string;
  testEnvironment: string;
  developmentStage: string;
  priority: string;

  // Overview Data
  productName: string;
  testObjective: string;
  productCategory: string;
  testScope: string;

  // Scores & Configurations
  functionalScore: number;
  reliabilityScore: number;
  complianceScore: number;
  validationScore: number;
  overallQualityScore: number;

  planningConfig: TestingPlanningConfig;
  prototypeEquipmentConfig: TestingPrototypeEquipmentConfig;
  functionalConfig: TestingFunctionalConfig;
  performanceConfig: TestingPerformanceConfig;
  safetyComplianceConfig: TestingSafetyComplianceConfig;
  resultsConfig: TestingResultsConfig;
  aiAssessment: TestingAiAssessmentInfo;
  readinessSummary: TestingSummaryInfo;
  attachments: TestingAttachment[];
  reviewers: TestingReviewer[];
  approvalDecision?: TestingApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: TestingAuditEntry[];
};

// ---------------------------------------------------------------------------
// Certification Readiness Module Types
// ---------------------------------------------------------------------------

export type CertificationStatus = "In Progress" | "In Review" | "Approved" | "Changes Requested" | "Archived";
export type CertificationApprovalDecision = "Approved" | "Approved with Conditions" | "Revision Required" | "On Hold" | "Rejected" | "Pending";

export type StandardRecord = {
  id: string;
  code: string; // e.g. IEC 61851-1
  title: string; // e.g. Electric vehicle conductive charging system - General requirements
  category: string; // e.g. Mandatory Standard
  region: string; // e.g. Global / IEC
  status: string; // e.g. Compliant, In Progress
  gapAnalysis: string; // e.g. Satisfied (0 Gaps)
};

export type DocReadinessRecord = {
  id: string;
  docName: string; // e.g. Technical File
  category: string; // e.g. Technical Documentation
  status: string; // e.g. Uploaded, Under Review, Missing
  owner: string;
  expiryDate: string;
  fileName: string;
};

export type LabReadinessRecord = {
  id: string;
  labName: string; // e.g. TÜV Rheinland
  contactPerson: string; // e.g. Mr. Peter Klaus
  scope: string; // e.g. EMC, Safety, Performance, Environmental
  sampleSubmissionDate: string; // e.g. 25 Jun 2024
  plannedCertificationDate: string; // e.g. 20 Aug 2024
  status: string; // e.g. Scheduled, Booking Confirmed
};

export type ComplianceAssessmentConfig = {
  nonConformitiesCount: number; // 2
  criticalFindingsCount: number; // 1
  correctiveActionsStatus: string; // View Actions
  preventiveActionsStatus: string; // View Actions
  capaStatus: string; // In Progress
  complianceScore: number; // 84
};

export type AiComplianceAssessmentInfo = {
  aiStandardsReview: string; // Completed
  aiDocumentationReview: string; // Completed
  aiRiskAssessment: string; // Low Risk
  aiCertificationPrediction: string; // High Probability
  aiImprovementSuggestions: string; // 3 Suggestions
  aiReadinessScore: number; // 89
};

export type CertificationSummaryInfo = {
  documentationScore: number; // 88
  testingScore: number; // 90
  complianceScore: number; // 84
  laboratoryScore: number; // 85
  aiScore: number; // 89
  overallReadinessScore: number; // 88
  certificationProbabilityPct: number; // 92%
  recommendation: string; // Ready for Certification Submission
};

export type CertificationAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  date: string;
  url: string;
};

export type CertificationReviewer = {
  role: string;
  person: string;
  avatar: string;
  decision: CertificationApprovalDecision;
  date: string;
  comments: string;
};

export type CertificationAuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type CertificationFormInput = {
  certificationProjectName: string;
  certificationObjective: string;
  targetMarket: string;
  regulatoryAuthority: string;
  priority: string;
  recommendation: string;
};

export type CertificationReadinessRecord = {
  id: string;
  certificationReadinessId: string; // e.g. CR-2024-0041
  formCode: string; // e.g. CRF-2024-25
  certificationProjectName: string; // e.g. Smart EV Charger Certification
  certificationVersion: string; // e.g. v1.2.0
  workflowStatus: CertificationStatus;
  createdOn: string;
  dateCreated: string;
  lastModified: string;
  lastUpdated: string;

  // Linked references
  linkedProductId: string; // e.g. Smart EV Charger AC 7kW
  linkedTestingId: string; // e.g. TV-2024-0075
  complianceManagerName: string;
  complianceManagerAvatar: string;
  certificationCoordinatorName: string;
  certificationCoordinatorAvatar: string;
  targetMarkets: string[]; // ["India", "EU", "USA"]
  regulatoryAuthorities: string[]; // ["BIS", "IEC", "CE", "FCC"]
  developmentStage: string; // e.g. Prototype Validation
  priority: string; // High

  // Overview Data
  productCategory: string; // e.g. EV Charger
  certificationObjective: string;

  // Scores & Configurations
  documentationScore: number;
  testingScore: number;
  complianceScore: number;
  laboratoryScore: number;
  aiScore: number;
  overallReadinessScore: number;
  certificationProbabilityPct: number;

  standardsList: StandardRecord[];
  documentsList: DocReadinessRecord[];
  labConfig: LabReadinessRecord;
  complianceConfig: ComplianceAssessmentConfig;
  aiAssessment: AiComplianceAssessmentInfo;
  readinessSummary: CertificationSummaryInfo;
  attachments: CertificationAttachment[];
  reviewers: CertificationReviewer[];
  approvalDecision?: CertificationApprovalDecision | null;
  approvalDate?: string | null;
  reviewComments?: string | null;
  auditTrail: CertificationAuditEntry[];
};





















