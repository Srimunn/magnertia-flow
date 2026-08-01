import {
  DEFAULT_FIXTURE_RECORD,
  getFixtureFn,
  reviewFixtureFn,
  saveFixtureDraftFn,
  submitFixtureFn,
} from "@/lib/fixtureDevelopmentFns.server";
import type {
  FixtureApprovalDecision,
  FixtureFormInput,
  FixtureRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<FixtureRecord> {
  try {
    const res = await getFixtureFn();
    return unwrap<FixtureRecord>(res);
  } catch (err) {
    console.warn("fixtureDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_FIXTURE_RECORD;
  }
}

export async function saveDraft(
  input: Partial<FixtureFormInput>,
  id?: string
): Promise<FixtureRecord> {
  return unwrap<FixtureRecord>(
    await saveFixtureDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<FixtureRecord> {
  return unwrap<FixtureRecord>(await submitFixtureFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: FixtureApprovalDecision;
  comments?: string;
}): Promise<FixtureRecord> {
  return unwrap<FixtureRecord>(await reviewFixtureFn({ data: args }));
}

export const fixtureDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
