/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import type { ObjectId } from "mongodb";
import type {
  AccountNode,
  AccountType,
  ApprovalLevelName,
  ApprovalStepStatusValue,
  JournalRecord,
  NewAccountInput,
  NewJournalInput,
  LedgerKpis,
  TrialBalanceReport,
  LedgerJournalEntry,
  AccountSummary,
  CurrencyInfo,
  TaxInfo,
  SupportingDocumentsInfo,
  JournalMetadata,
} from "@/services/types";

// Dynamically imported inside each handler (not a top-level import) so that
// the mongodb driver never ends up reachable from the client bundle — only
// the RPC stub that createServerFn compiles for the client should remain
// there. A static top-level import here previously leaked mongodb into the
// browser bundle, crashing with "Class extends value undefined".
async function getAccountsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getAccountsCollection();
}
async function getJournalsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getJournalsCollection();
}
async function getSettingsCollection() {
  const mod = await import("./mongodb.server");
  return mod.getSettingsCollection();
}
async function newObjectId(id: string) {
  const mod = await import("./mongodb.server");
  return new mod.ObjectId(id);
}

export const CURRENT_USER = "Priya Sharma";
const CEO_THRESHOLD = 1_00_00_000; // ₹1 Crore

const BASE_APPROVAL_LEVELS: ApprovalLevelName[] = [
  "Accountant",
  "Finance Manager",
  "Financial Controller",
  "CFO",
];

const LEVEL_ORDER: ApprovalLevelName[] = [
  "Accountant",
  "Finance Manager",
  "Financial Controller",
  "CFO",
  "CEO",
];

const NORMAL_BALANCE: Record<AccountType, "Debit" | "Credit"> = {
  Asset: "Debit",
  Expense: "Debit",
  Liability: "Credit",
  Equity: "Credit",
  Revenue: "Credit",
};

interface AccountDoc {
  _id?: ObjectId;
  code: string;
  name: string;
  type: AccountType;
  group: string;
  currency: string;
  isActive: boolean;
  parentAccountCode: string | null;
  openingBalance: number;
  debit?: number;
  credit?: number;
}

// Automatically seed Chart of Accounts if empty
async function seedChartOfAccounts() {
  const accountsColl = await getAccountsCollection();
  const count = await accountsColl.countDocuments();
  if (count > 0) return;

  console.log("MongoDB Chart of Accounts collection is empty. Seeding default accounts...");
  const { chartOfAccounts } = await import("./mock-data");

  const docs: AccountDoc[] = [];
  interface SeedAccountItem {
    code: string;
    name: string;
    type: AccountType;
    group?: string;
    status?: string;
    openingBalance?: number;
    children?: SeedAccountItem[];
  }
  const walk = (list: SeedAccountItem[], parentCode: string | null) => {
    for (const item of list) {
      docs.push({
        code: item.code,
        name: item.name,
        type: item.type,
        group: item.group || "Other",
        currency: "INR",
        isActive: item.status === "Active",
        parentAccountCode: parentCode,
        openingBalance: item.openingBalance || 0,
      });
      if (item.children && item.children.length > 0) {
        walk(item.children, item.code);
      }
    }
  };
  walk(chartOfAccounts as unknown as SeedAccountItem[], null);
  await accountsColl.insertMany(docs);
  console.log(`Successfully seeded ${docs.length} accounts to MongoDB!`);
}

// Convert DB Journal document to typed client record
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapeJournal(doc: any): JournalRecord {
  if (!doc) throw new Error("Journal not found.");
  return {
    id: doc._id.toString(),
    journalNumber: doc.journalNumber,
    voucherNumber: doc.voucherNumber ?? null,
    postingDate: doc.postingDate instanceof Date ? doc.postingDate.toISOString() : doc.postingDate,
    accountingDate:
      doc.accountingDate instanceof Date ? doc.accountingDate.toISOString() : doc.accountingDate,
    fiscalYear: doc.fiscalYear,
    accountingPeriod: doc.accountingPeriod,
    journalType: doc.journalType,
    status: doc.status,
    companyId: doc.companyId ?? null,
    businessUnitId: doc.businessUnitId ?? null,
    divisionId: doc.divisionId ?? null,
    branchId: doc.branchId ?? null,
    costCenterId: doc.costCenterId ?? null,
    profitCenterId: doc.profitCenterId ?? null,
    projectId: doc.projectId ?? null,
    departmentId: doc.departmentId ?? null,
    lines: doc.lines || [],
    totalDebit: doc.totalDebit || 0,
    totalCredit: doc.totalCredit || 0,
    approvalSteps: doc.approvalSteps || [],
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    currencyInfo: doc.currencyInfo,
    taxInfo: doc.taxInfo,
    supportingDocuments: doc.supportingDocuments,
    metadataInfo: doc.metadataInfo,
  };
}

// Build the Account Tree structure for UI
function buildAccountTree(accounts: AccountDoc[]): AccountNode[] {
  const nodeByCode = new Map<string, AccountNode>();
  for (const a of accounts) {
    nodeByCode.set(a.code, {
      code: a.code,
      name: a.name,
      type: a.type,
      group: a.group,
      normalBalance: NORMAL_BALANCE[a.type],
      debit: a.debit || 0,
      credit: a.credit || 0,
      status: a.isActive ? "Active" : "Inactive",
      openingBalance: a.openingBalance,
    });
  }

  const roots: AccountNode[] = [];
  for (const a of accounts) {
    const node = nodeByCode.get(a.code)!;
    if (a.parentAccountCode) {
      const parent = nodeByCode.get(a.parentAccountCode);
      if (parent) {
        parent.children = parent.children ? [...parent.children, node] : [node];
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// Get accounts with real calculations based on posted/approved journals
export async function getAccountsWithCalculations(): Promise<AccountDoc[]> {
  const accountsColl = await getAccountsCollection();
  const journalsColl = await getJournalsCollection();

  await seedChartOfAccounts();

  const accounts = (await accountsColl.find({}).toArray()) as unknown as AccountDoc[];
  const postedJournals = await journalsColl
    .find({ status: { $in: ["Posted", "Approved"] } })
    .toArray();

  const balanceByCode = new Map<string, { debit: number; credit: number }>();
  for (const journal of postedJournals) {
    for (const line of journal.lines || []) {
      const current = balanceByCode.get(line.accountCode) || { debit: 0, credit: 0 };
      current.debit += Number(line.debit) || 0;
      current.credit += Number(line.credit) || 0;
      balanceByCode.set(line.accountCode, current);
    }
  }

  for (const account of accounts) {
    const balances = balanceByCode.get(account.code) || { debit: 0, credit: 0 };
    account.debit = balances.debit;
    account.credit = balances.credit;
  }

  return accounts;
}

/* ===========================================================================
   API Server Functions
   =========================================================================== */

// Retrieve full accounts tree
export const getAccountsTreeFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const accounts = await getAccountsWithCalculations();
    return { success: true, data: buildAccountTree(accounts) };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to fetch accounts tree" };
  }
});

// Create new Account
export const createAccountFn = createServerFn({ method: "POST" })
  .validator((d: NewAccountInput) => d)
  .handler(async ({ data }) => {
    try {
      const accountsColl = await getAccountsCollection();
      const existing = await accountsColl.findOne({ code: data.code });
      if (existing) {
        throw new Error(`Account code ${data.code} already exists.`);
      }

      const doc: AccountDoc = {
        code: data.code,
        name: data.name,
        type: data.type,
        group: data.group,
        currency: data.currency || "INR",
        isActive: data.isActive,
        parentAccountCode: data.parentAccountCode || null,
        openingBalance: 0,
      };

      await accountsColl.insertOne(doc);
      return {
        success: true,
        data: {
          code: doc.code,
          name: doc.name,
          type: doc.type,
          group: doc.group,
          normalBalance: NORMAL_BALANCE[doc.type],
          debit: 0,
          credit: 0,
          status: doc.isActive ? "Active" : "Inactive",
          openingBalance: 0,
        } as AccountNode,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Update Account
export const updateAccountFn = createServerFn({ method: "POST" })
  .validator((d: { code: string; patch: Partial<NewAccountInput> }) => d)
  .handler(async ({ data }) => {
    try {
      const accountsColl = await getAccountsCollection();
      const existing = await accountsColl.findOne({ code: data.code });
      if (!existing) {
        throw new Error(`Account code ${data.code} not found.`);
      }

      await accountsColl.updateOne(
        { code: data.code },
        {
          $set: {
            name: data.patch.name ?? existing.name,
            type: data.patch.type ?? existing.type,
            group: data.patch.group ?? existing.group,
            currency: data.patch.currency ?? existing.currency,
            isActive: data.patch.isActive ?? existing.isActive,
            parentAccountCode:
              data.patch.parentAccountCode === undefined
                ? existing.parentAccountCode
                : data.patch.parentAccountCode,
          },
        },
      );

      const updated = await accountsColl.findOne({ code: data.code });
      return {
        success: true,
        data: {
          code: updated!.code,
          name: updated!.name,
          type: updated!.type as AccountType,
          group: updated!.group,
          normalBalance: NORMAL_BALANCE[updated!.type as AccountType],
          debit: 0,
          credit: 0,
          status: updated!.isActive ? "Active" : "Inactive",
          openingBalance: updated!.openingBalance,
        } as AccountNode,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Fetch all Journals
export const getJournalsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const journalsColl = await getJournalsCollection();
    const docs = await journalsColl.find({}).sort({ createdAt: -1 }).toArray();
    return { success: true, data: docs.map((d: any) => shapeJournal(d)) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});

// Fetch single Journal by ID
export const getJournalFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const journalsColl = await getJournalsCollection();
      const doc = await journalsColl.findOne({ _id: await newObjectId(id) });
      if (!doc) throw new Error("Journal entry not found.");
      return { success: true, data: shapeJournal(doc) };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Create new Journal
export const createJournalFn = createServerFn({ method: "POST" })
  .validator((d: NewJournalInput) => d)
  .handler(async ({ data }) => {
    try {
      const journalsColl = await getJournalsCollection();
      const accountsColl = await getAccountsCollection();

      const totalDebit = data.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
      const totalCredit = data.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
      if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
        throw new Error("Total debit must equal total credit.");
      }
      if (data.lines.length < 2) {
        throw new Error("A journal entry requires at least two lines.");
      }

      // Verify account codes
      const codes = data.lines.map((l) => l.accountCode);
      const dbAccounts = await accountsColl.find({ code: { $in: codes } }).toArray();
      const existingCodes = new Set(dbAccounts.map((a: any) => a.code));
      for (const code of codes) {
        if (!existingCodes.has(code)) {
          throw new Error(`Account code ${code} does not exist in Chart of Accounts.`);
        }
      }

      const journalCount = await journalsColl.countDocuments();
      const journalNumber = `JE-${String(journalCount + 1).padStart(5, "0")}`;

      const levels: ApprovalLevelName[] =
        totalDebit > CEO_THRESHOLD ? [...BASE_APPROVAL_LEVELS, "CEO"] : BASE_APPROVAL_LEVELS;

      const approvalSteps = levels.map((level) => ({
        level,
        approverName: CURRENT_USER,
        status: "Pending" as ApprovalStepStatusValue,
        date: null,
      }));

      // Auto-calculate Tax amount if a tax code/rate is provided
      const finalTaxInfo = data.taxInfo;
      if (finalTaxInfo && finalTaxInfo.taxCode) {
        const match = finalTaxInfo.taxCode.match(/(\d+)%/);
        if (match) {
          const rate = parseFloat(match[1]);
          finalTaxInfo.taxAmount = Math.round(totalDebit * (rate / 100) * 100) / 100;
        }
      }

      // Currency calculations
      const finalCurrencyInfo = data.currencyInfo;
      if (finalCurrencyInfo) {
        const rate = Number(finalCurrencyInfo.exchangeRate) || 1;
        if (finalCurrencyInfo.transactionCurrency !== finalCurrencyInfo.baseCurrency) {
          finalCurrencyInfo.foreignCurrencyGainLoss =
            finalCurrencyInfo.foreignCurrencyGainLoss || 0;
        } else {
          finalCurrencyInfo.exchangeRate = 1;
          finalCurrencyInfo.foreignCurrencyGainLoss = 0;
        }
      }

      // Setup metadata
      const finalMetadata: JournalMetadata = {
        createdBy: CURRENT_USER,
        createdDate: new Date().toISOString(),
        lastModifiedBy: CURRENT_USER,
        lastModifiedDate: new Date().toISOString(),
        journalVersion: 1,
        erpReferenceNumber: data.voucherNumber || `ERP-REF-${Date.now().toString().slice(-6)}`,
        fiscalCalendar: data.fiscalYear,
        auditTrail: data.metadataInfo?.auditTrail ?? true,
        digitalSignature: data.metadataInfo?.digitalSignature ?? true,
        recordStatus: "Active",
      };

      const doc = {
        journalNumber,
        voucherNumber: data.voucherNumber || null,
        postingDate: new Date(data.postingDate),
        accountingDate: new Date(data.accountingDate),
        fiscalYear: data.fiscalYear,
        accountingPeriod: data.accountingPeriod,
        journalType: data.journalType,
        status: "Draft",
        companyId: data.companyId || null,
        businessUnitId: data.businessUnitId || null,
        divisionId: data.divisionId || null,
        branchId: data.branchId || null,
        costCenterId: data.costCenterId || null,
        profitCenterId: data.profitCenterId || null,
        projectId: data.projectId || null,
        departmentId: data.departmentId || null,
        lines: data.lines,
        totalDebit,
        totalCredit,
        approvalSteps,
        createdAt: new Date(),
        currencyInfo: finalCurrencyInfo,
        taxInfo: finalTaxInfo,
        supportingDocuments: data.supportingDocuments || {
          journalVoucher: { status: "Not Attached" },
          invoice: { status: "Not Attached" },
          purchaseOrder: { status: "Not Attached" },
          paymentVoucher: { status: "Not Attached" },
          bankStatement: { status: "Not Attached" },
          taxDocument: { status: "Not Attached" },
          approvalRecord: { status: "Not Attached" },
        },
        metadataInfo: finalMetadata,
      };

      const result = await journalsColl.insertOne(doc);
      return { success: true, data: shapeJournal({ ...doc, _id: result.insertedId }) };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Handle approval steps
export const approveJournalStepFn = createServerFn({ method: "POST" })
  .validator(
    (d: { journalId: string; level: ApprovalLevelName; decision: "Approved" | "Rejected" }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const journalsColl = await getJournalsCollection();
      const journalObjectId = await newObjectId(data.journalId);
      const journalDb = await journalsColl.findOne({ _id: journalObjectId });
      if (!journalDb) throw new Error("Journal not found.");
      const journal = shapeJournal(journalDb);

      const steps = journal.approvalSteps || [];
      const stepIdx = steps.findIndex((s) => s.level === data.level);
      if (stepIdx === -1) throw new Error("Approval level not found in approval chain.");

      steps[stepIdx].status = data.decision;
      steps[stepIdx].date = new Date().toISOString();

      let nextStatus = journal.status;
      if (data.decision === "Rejected") {
        nextStatus = "Draft";
        for (const step of steps) {
          step.status = "Pending";
          step.date = null;
        }
      } else {
        const allApproved = steps.every((s) => s.status === "Approved");
        if (allApproved) {
          nextStatus = "Posted";
        }
      }

      await journalsColl.updateOne(
        { _id: journalObjectId },
        {
          $set: {
            approvalSteps: steps,
            status: nextStatus,
            "metadataInfo.lastModifiedDate": new Date().toISOString(),
            "metadataInfo.lastModifiedBy": CURRENT_USER,
          },
        },
      );

      const updated = await journalsColl.findOne({ _id: journalObjectId });
      return { success: true, data: shapeJournal(updated) };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Get Live Dashboard KPI data (Total accounts, debits, credits, net income, plus AI intelligence scores)
export const getLedgerDashboardDataFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const accounts = await getAccountsWithCalculations();
    const journalsColl = await getJournalsCollection();

    const totalAccounts = accounts.length;

    const journalsDb = await journalsColl.find({}).toArray();
    const journals = journalsDb.map(shapeJournal);
    const postedJournals = journals.filter((j: any) => j.status === "Posted");

    let totalDebits = 0;
    let totalCredits = 0;
    let revenueSum = 0;
    let expenseSum = 0;

    for (const journal of postedJournals) {
      totalDebits += journal.totalDebit || 0;
      totalCredits += journal.totalCredit || 0;
      for (const line of journal.lines || []) {
        const acc = accounts.find((a) => a.code === line.accountCode);
        if (acc) {
          if (acc.type === "Revenue") {
            revenueSum += Number(line.credit) - Number(line.debit);
          } else if (acc.type === "Expense") {
            expenseSum += Number(line.debit) - Number(line.credit);
          }
        }
      }
    }

    const netIncome = revenueSum - expenseSum;

    const totalEntries = journals.length;
    const postedCount = postedJournals.length;
    const pendingCount = journals.filter(
      (j: any) => j.status === "Draft" && j.approvalSteps.some((s: any) => s.status === "Pending"),
    ).length;

    const trialBalanceDiff = Math.abs(totalDebits - totalCredits);

    let healthScore = 100;
    if (trialBalanceDiff > 0) healthScore -= 40;
    if (pendingCount > 0) healthScore -= Math.min(15, pendingCount * 2);
    healthScore = Math.max(0, healthScore);

    const totalSteps = journals.reduce(
      (sum: number, j: any) => sum + (j.approvalSteps || []).length,
      0,
    );
    const rejectedSteps = journals.reduce(
      (sum: number, j: any) =>
        sum + (j.approvalSteps || []).filter((s: any) => s.status === "Rejected").length,
      0,
    );
    const accuracyScore =
      totalSteps > 0 ? Math.round(((totalSteps - rejectedSteps) / totalSteps) * 100) : 100;

    const manualCount = journals.filter((j: any) => j.journalType === "Manual").length;
    const riskScore = totalEntries > 0 ? Math.round((manualCount / totalEntries) * 80) : 10;

    let fraudScore = 5;
    const seenLines = new Set<string>();
    for (const j of journals) {
      for (const l of j.lines || []) {
        const key = `${l.accountCode}-${l.debit}-${l.credit}`;
        if (seenLines.has(key)) {
          fraudScore += 8;
        } else {
          seenLines.add(key);
        }
        if (l.debit > 0 && l.debit % 10000 === 0) fraudScore += 1;
      }
    }
    fraudScore = Math.min(100, fraudScore);

    let closingReadiness = 90;
    if (trialBalanceDiff > 0) closingReadiness -= 50;
    if (pendingCount > 0) closingReadiness -= 20;

    const aiRecommendations: string[] = [];
    if (trialBalanceDiff > 0) {
      aiRecommendations.push(
        `Critical: Trial Balance has a mismatch of ₹${trialBalanceDiff.toLocaleString()}. Please review Journal lines.`,
      );
    } else {
      aiRecommendations.push("General Ledger is perfectly balanced and correct.");
    }
    if (pendingCount > 0) {
      aiRecommendations.push(
        `There are ${pendingCount} journal entries pending approvals in the workflow chain.`,
      );
    }
    if (fraudScore > 30) {
      aiRecommendations.push(
        "Risk Alert: Identified duplicate lines in ledger entries. Perform audit trail scan.",
      );
    }
    if (closingReadiness >= 80) {
      aiRecommendations.push(
        "Ready for Financial Period Closing. Standard year-end checklist can be initiated.",
      );
    }

    return {
      success: true,
      data: {
        kpis: {
          totalAccounts,
          totalDebits,
          totalCredits,
          netIncome,
          currentPeriod: "Jul 2026",
          periodStatus: "Open",
          totalJournalEntries: totalEntries,
          postedJournals: postedCount,
          pendingJournals: pendingCount,
          trialBalanceDifference: trialBalanceDiff,
          revenue: revenueSum,
          expenses: expenseSum,
          netProfit: netIncome,
        },
        aiIntelligence: {
          ledgerHealthScore: healthScore,
          journalAccuracyScore: accuracyScore,
          financialRiskScore: riskScore,
          fraudDetectionScore: fraudScore,
          closingReadinessScore: Math.max(0, closingReadiness),
          aiRecommendations: aiRecommendations.join(" | "),
        },
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to load dashboard data" };
  }
});

// Fetch transaction activity history for a specific account code
export const getAccountActivityFn = createServerFn({ method: "POST" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    try {
      const accounts = await getAccountsWithCalculations();
      const journalsColl = await getJournalsCollection();

      const account = accounts.find((a) => a.code === code);
      if (!account) return { success: true, data: [] };

      const postedJournalsDb = await journalsColl
        .find({ status: { $in: ["Posted", "Approved"] } })
        .sort({ postingDate: 1 })
        .toArray();
      const postedJournals = postedJournalsDb.map(shapeJournal);

      const entries: LedgerJournalEntry[] = [];
      let runningBalance = account.openingBalance;

      for (const journal of postedJournals) {
        for (const line of journal.lines || []) {
          if (line.accountCode === code) {
            const isDebit = account.type === "Asset" || account.type === "Expense";
            const debVal = Number(line.debit) || 0;
            const credVal = Number(line.credit) || 0;
            if (isDebit) {
              runningBalance += debVal - credVal;
            } else {
              runningBalance += credVal - debVal;
            }
            entries.push({
              date:
                journal.postingDate instanceof Date
                  ? (journal.postingDate as Date).toISOString().slice(0, 10)
                  : String(journal.postingDate).slice(0, 10),
              ref: journal.journalNumber,
              description: line.description || journal.journalNumber,
              debit: debVal,
              credit: credVal,
              balance: runningBalance,
            });
          }
        }
      }

      return { success: true, data: entries };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

// Fetch Trial Balance report
export const getTrialBalanceReportFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const accounts = await getAccountsWithCalculations();
    const leafAccounts = accounts.filter((a) => {
      const isParent = accounts.some((other) => other.parentAccountCode === a.code);
      return !isParent;
    });

    const rows = leafAccounts.map((a) => ({
      code: a.code,
      name: a.name,
      debit: a.debit || 0,
      credit: a.credit || 0,
    }));

    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

    return {
      success: true,
      data: { rows, totalDebit, totalCredit } as TrialBalanceReport,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});

// Load/Save Integration Settings (Section K)
export const getIntegrationSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const settingsColl = await getSettingsCollection();
    const settings = await settingsColl.findOne({
      _id: "integration_settings" as unknown as ObjectId,
    });

    const defaultSettings = {
      accountsPayable: "Connected",
      accountsReceivable: "Connected",
      banking: "Connected",
      inventory: "Not Connected",
      manufacturing: "Not Connected",
      payroll: "Connected",
      fixedAssets: "Not Connected",
      projects: "Not Connected",
      taxManagement: "Connected",
      erpIntegration: "Connected",
    };

    if (!settings) {
      await settingsColl.updateOne(
        { _id: "integration_settings" as unknown as ObjectId },
        { $set: defaultSettings },
        { upsert: true },
      );
      return { success: true, data: defaultSettings };
    }

    return {
      success: true,
      data: {
        accountsPayable: (settings.accountsPayable as string) || "Not Connected",
        accountsReceivable: (settings.accountsReceivable as string) || "Not Connected",
        banking: (settings.banking as string) || "Not Connected",
        inventory: (settings.inventory as string) || "Not Connected",
        manufacturing: (settings.manufacturing as string) || "Not Connected",
        payroll: (settings.payroll as string) || "Not Connected",
        fixedAssets: (settings.fixedAssets as string) || "Not Connected",
        projects: (settings.projects as string) || "Not Connected",
        taxManagement: (settings.taxManagement as string) || "Not Connected",
        erpIntegration: (settings.erpIntegration as string) || "Not Connected",
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});

export const updateIntegrationSettingsFn = createServerFn({ method: "POST" })
  .validator((d: Record<string, string>) => d)
  .handler(async ({ data }) => {
    try {
      const settingsColl = await getSettingsCollection();
      const { _id, ...patch } = data;
      await settingsColl.updateOne(
        { _id: "integration_settings" as unknown as ObjectId },
        { $set: patch },
        { upsert: true },
      );
      const updated = await settingsColl.findOne({
        _id: "integration_settings" as unknown as ObjectId,
      });
      if (!updated) return { success: false, error: "Settings not saved" };
      return {
        success: true,
        data: {
          accountsPayable: (updated.accountsPayable as string) || "Not Connected",
          accountsReceivable: (updated.accountsReceivable as string) || "Not Connected",
          banking: (updated.banking as string) || "Not Connected",
          inventory: (updated.inventory as string) || "Not Connected",
          manufacturing: (updated.manufacturing as string) || "Not Connected",
          payroll: (updated.payroll as string) || "Not Connected",
          fixedAssets: (updated.fixedAssets as string) || "Not Connected",
          projects: (updated.projects as string) || "Not Connected",
          taxManagement: (updated.taxManagement as string) || "Not Connected",
          erpIntegration: (updated.erpIntegration as string) || "Not Connected",
        },
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });
