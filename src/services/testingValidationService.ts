import {
  DEFAULT_RECORD,
  getTestingValidationFn,
  reviewTestingValidationFn,
  saveTestingValidationDraftFn,
  submitTestingValidationFn,
} from "@/lib/testingValidationFns.server";
import type {
  TestingApprovalDecision,
  TestingFormInput,
  TestingValidationRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<TestingValidationRecord> {
  try {
    const res = await getTestingValidationFn();
    return unwrap<TestingValidationRecord>(res);
  } catch (err) {
    console.warn("testingValidationService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<TestingFormInput>,
  id?: string
): Promise<TestingValidationRecord> {
  return unwrap<TestingValidationRecord>(
    await saveTestingValidationDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<TestingValidationRecord> {
  return unwrap<TestingValidationRecord>(await submitTestingValidationFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: TestingApprovalDecision;
  comments?: string;
}): Promise<TestingValidationRecord> {
  return unwrap<TestingValidationRecord>(await reviewTestingValidationFn({ data: args }));
}

export const testingValidationService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
