import React from "react";
import { Cpu, Wrench, Archive, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import type { RoboticsDeploymentReleaseActions } from "@/lib/robotics-integration/types";

interface RoboticsDeploymentReleasePanelProps {
  actions: RoboticsDeploymentReleaseActions;
  isAuthorized: boolean;
  onFireAction: (
    actionKey:
      | "releaseRoboticProductionCell"
      | "registerRoboticAssets"
      | "archiveRobotPrograms"
      | "markProductionDeploymentApproved"
  ) => void;
}

export const RoboticsDeploymentReleasePanel: React.FC<RoboticsDeploymentReleasePanelProps> = ({
  actions,
  isAuthorized,
  onFireAction,
}) => {
  const allFired =
    !!actions.releaseRoboticProductionCell &&
    !!actions.registerRoboticAssets &&
    !!actions.archiveRobotPrograms &&
    !!actions.markProductionDeploymentApproved;

  return (
    <div className="bg-card text-card-foreground border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-4 bg-gradient-to-br from-emerald-500/5 via-card to-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Robotics Deployment Release Panel</h3>
            <p className="text-xs text-muted-foreground">
              Authorize robotic production cell release, asset registration with PM plan, and program archiving.
            </p>
          </div>
        </div>
        {allFired ? (
          <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Robotic Production Cell Active
          </span>
        ) : isAuthorized ? (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300">
            Deployment Authorized — Ready for Release
          </span>
        ) : (
          <span className="px-3 py-1 bg-muted text-muted-foreground font-semibold text-xs rounded-full flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Locked until Executive Approval
          </span>
        )}
      </div>

      {/* 4 Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Action 1: Release Robotic Production Cell */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-foreground">1. Release Robotic Cell</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Notify MES that Robot Cell is production-ready.</p>
          {actions.releaseRoboticProductionCell ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.releaseRoboticProductionCell.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("releaseRoboticProductionCell")}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
            >
              Release Robot Cell
            </button>
          )}
        </div>

        {/* Action 2: Register Robotic Assets */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-foreground">2. Register Robotic Assets</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Register robot, EOAT, vision in Maintenance with PM plan.</p>
          {actions.registerRoboticAssets ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.registerRoboticAssets.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("registerRoboticAssets")}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
            >
              Register Assets & PM
            </button>
          )}
        </div>

        {/* Action 3: Archive Robot Programs */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-foreground">3. Archive Programs</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Freeze robot code in Enterprise Robotics Repository.</p>
          {actions.archiveRobotPrograms ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.archiveRobotPrograms.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("archiveRobotPrograms")}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
            >
              Archive Robot Programs
            </button>
          )}
        </div>

        {/* Action 4: Mark Production Deployment Approved */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-foreground">4. Approve Deployment</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Set official deployment approval timestamp.</p>
          {actions.markProductionDeploymentApproved ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.markProductionDeploymentApproved.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("markProductionDeploymentApproved")}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded text-xs transition-colors"
            >
              Approve Deployment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
