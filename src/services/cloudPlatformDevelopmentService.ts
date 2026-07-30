import {
  DEFAULT_RECORD,
  getCloudPlatformDevelopmentFn,
  reviewCloudPlatformDevelopmentFn,
  saveCloudPlatformDevelopmentDraftFn,
  submitCloudPlatformDevelopmentFn,
} from "@/lib/cloudPlatformDevelopmentFns.server";
import type {
  CloudPlatformApprovalDecision,
  CloudPlatformFormInput,
  CloudPlatformRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<CloudPlatformRecord> {
  try {
    const res = await getCloudPlatformDevelopmentFn();
    return unwrap<CloudPlatformRecord>(res);
  } catch (err) {
    console.warn("cloudPlatformDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<CloudPlatformFormInput>,
  id?: string
): Promise<CloudPlatformRecord> {
  return unwrap<CloudPlatformRecord>(
    await saveCloudPlatformDevelopmentDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<CloudPlatformRecord> {
  return unwrap<CloudPlatformRecord>(await submitCloudPlatformDevelopmentFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: CloudPlatformApprovalDecision;
  comments?: string;
}): Promise<CloudPlatformRecord> {
  return unwrap<CloudPlatformRecord>(await reviewCloudPlatformDevelopmentFn({ data: args }));
}

export const cloudPlatformDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
