import { apiRequest } from "./apiClient";

export function validateLoginSession(): Promise<{ valid: boolean }> {
  return apiRequest("/api/auth/session", () => ({ valid: true }));
}
