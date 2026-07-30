import {
  DEFAULT_RECORD,
  getCertificationReadinessFn,
  reviewCertificationReadinessFn,
  saveCertificationReadinessDraftFn,
  submitCertificationReadinessFn,
} from "@/lib/certificationReadinessFns.server";
import type {
  CertificationApprovalDecision,
  CertificationFormInput,
  CertificationReadinessRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<CertificationReadinessRecord> {
  try {
    const res = await getCertificationReadinessFn();
    return unwrap<CertificationReadinessRecord>(res);
  } catch (err) {
    console.warn("certificationReadinessService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<CertificationFormInput>,
  id?: string
): Promise<CertificationReadinessRecord> {
  return unwrap<CertificationReadinessRecord>(
    await saveCertificationReadinessDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<CertificationReadinessRecord> {
  return unwrap<CertificationReadinessRecord>(await submitCertificationReadinessFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: CertificationApprovalDecision;
  comments?: string;
}): Promise<CertificationReadinessRecord> {
  return unwrap<CertificationReadinessRecord>(await reviewCertificationReadinessFn({ data: args }));
}

export const certificationReadinessService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
