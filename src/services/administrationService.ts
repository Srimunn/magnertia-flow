import * as companyService from "./companyService";
import * as branchService from "./branchService";
import * as userService from "./userService";
import type { AdminHomeDashboardData } from "./types";

export async function loadAdministrationHomeData(): Promise<AdminHomeDashboardData> {
  const [companies, branches, recentLogins, activityTrend, usersByDepartment, userStatusSummary] =
    await Promise.all([
      companyService.fetchCompanies(),
      branchService.fetchBranches(),
      userService.fetchLoginHistory(),
      userService.fetchUserActivityTrend(),
      userService.fetchUsersByDepartment(),
      userService.fetchUserStatusSummary(),
    ]);

  return {
    kpis: {
      activeUsersCount: userStatusSummary.activeCount,
      branchCount: branches.length,
      loginsToday: activityTrend[activityTrend.length - 1]?.logins ?? 0,
    },
    companies,
    recentLogins: recentLogins.slice(0, 5),
    activityTrend,
    usersByDepartment,
    userStatusSummary,
  };
}
