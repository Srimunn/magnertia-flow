import {
  getJournalsFn,
  getJournalFn,
  createJournalFn,
  approveJournalStepFn,
} from "@/lib/generalLedgerFns.server";
import type {
  ApprovalLevelName,
  ApprovalStepStatusValue,
  JournalRecord,
  NewJournalInput,
} from "./types";

// Live, Postgres-backed Journal Entry + Approval Workflow (General Ledger
// module). No mock fallback — this module is meant to be live now, unlike
// every other module in the app.

export async function fetchJournals(): Promise<JournalRecord[]> {
  const res = await getJournalsFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}

export async function fetchJournal(id: string): Promise<JournalRecord> {
  const res = await getJournalFn({ data: id });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}

export async function createJournal(input: NewJournalInput): Promise<JournalRecord> {
  const res = await createJournalFn({ data: input });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}

export async function approveJournalStep(
  journalId: string,
  level: ApprovalLevelName,
  decision: Extract<ApprovalStepStatusValue, "Approved" | "Rejected">,
): Promise<JournalRecord> {
  const res = await approveJournalStepFn({ data: { journalId, level, decision } });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}
