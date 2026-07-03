import { apiRequest } from "./apiClient";
import {
  mockAuditLogs,
  mockSensitiveChanges,
  mockSecurityEvents,
  mockConfigurationLogs,
} from "@/lib/mock-data";
import type {
  AuditLogEntry,
  SensitiveChangeRecord,
  SecurityEventEntry,
  ConfigurationLogEntry,
  DashboardQuery,
} from "./types";

export function fetchAuditLogs(query: DashboardQuery): Promise<AuditLogEntry[]> {
  return apiRequest(`/api/financial/audit/logs?fy=${query.fiscalYear}`, () => mockAuditLogs);
}

export function fetchLogDetails(id: string): Promise<AuditLogEntry | null> {
  return apiRequest(
    `/api/financial/audit/logs/${id}`,
    () => mockAuditLogs.find((l) => l.id === id) || null,
  );
}

export function fetchSecurityEvents(query: DashboardQuery): Promise<SecurityEventEntry[]> {
  return apiRequest(
    `/api/financial/audit/security?fy=${query.fiscalYear}`,
    () => mockSecurityEvents,
  );
}

export function fetchConfigurationLogs(query: DashboardQuery): Promise<ConfigurationLogEntry[]> {
  return apiRequest(
    `/api/financial/audit/config?fy=${query.fiscalYear}`,
    () => mockConfigurationLogs,
  );
}

export function fetchRecentSensitiveChanges(
  query: DashboardQuery,
): Promise<SensitiveChangeRecord[]> {
  return apiRequest(
    `/api/financial/audit/sensitive?fy=${query.fiscalYear}`,
    () => mockSensitiveChanges,
  );
}
