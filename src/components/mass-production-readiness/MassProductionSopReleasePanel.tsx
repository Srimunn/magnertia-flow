import React from "react";
import { Rocket, Package, Truck, Box, CheckCircle2, Lock } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { SopActionState } from "@/lib/mass-production-readiness/types";

interface MassProductionSopReleasePanelProps {
  sopActions: SopActionState;
  isAuthorized: boolean;
  onFireAction: (
    actionKey: "releaseProductionOrders" | "authorizeSupplierDeliveries" | "releaseProductionMaterials" | "releaseSop"
  ) => void;
}

export const MassProductionSopReleasePanel: React.FC<MassProductionSopReleasePanelProps> = ({
  sopActions,
  isAuthorized,
  onFireAction,
}) => {
  const allFired =
    !!sopActions.releaseProductionOrders &&
    !!sopActions.authorizeSupplierDeliveries &&
    !!sopActions.releaseProductionMaterials &&
    !!sopActions.releaseSop;

  return (
    <TooltipProvider>
      <div className="bg-card text-card-foreground border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-4 bg-gradient-to-br from-emerald-500/5 via-card to-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">SOP Release Panel (Start of Production)</h3>
              <p className="text-xs text-muted-foreground">
                Executive launch controls authorizing mass manufacturing side-effects.
              </p>
            </div>
          </div>
          {allFired ? (
            <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> SOP Active — Mass Production Live
            </span>
          ) : isAuthorized ? (
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300">
              Mass Production Authorized
            </span>
          ) : (
            <span className="px-3 py-1 bg-muted text-muted-foreground font-semibold text-xs rounded-full flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Locked until Executive Approval
            </span>
          )}
        </div>

        {/* 4 Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Action 1: Release Production Orders */}
          <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-foreground">1. Release Production Orders</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Activate draft Production Orders in Production Planning.</p>
            {sopActions.releaseProductionOrders ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                ✓ Fired {sopActions.releaseProductionOrders.firedAt}
              </span>
            ) : (
              <button
                disabled={!isAuthorized}
                onClick={() => onFireAction("releaseProductionOrders")}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
              >
                Release Orders
              </button>
            )}
          </div>

          {/* Action 2: Authorize Supplier Deliveries */}
          <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-foreground">2. Authorize Supplier Deliveries</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Send delivery release signal to Supply Chain Management.</p>
            {sopActions.authorizeSupplierDeliveries ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                ✓ Fired {sopActions.authorizeSupplierDeliveries.firedAt}
              </span>
            ) : (
              <button
                disabled={!isAuthorized}
                onClick={() => onFireAction("authorizeSupplierDeliveries")}
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
              >
                Authorize Deliveries
              </button>
            )}
          </div>

          {/* Action 3: Release Production Materials */}
          <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-foreground">3. Release Production Materials</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Move raw materials from staged to allocated in Inventory.</p>
            {sopActions.releaseProductionMaterials ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                ✓ Fired {sopActions.releaseProductionMaterials.firedAt}
              </span>
            ) : (
              <button
                disabled={!isAuthorized}
                onClick={() => onFireAction("releaseProductionMaterials")}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
              >
                Release Materials
              </button>
            )}
          </div>

          {/* Action 4: Release SOP */}
          <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-foreground">4. Release SOP (Start of Production)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Set Production Program to Mass Production Active.</p>
            {sopActions.releaseSop ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                ✓ Fired {sopActions.releaseSop.firedAt}
              </span>
            ) : (
              <button
                disabled={!isAuthorized}
                onClick={() => onFireAction("releaseSop")}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded text-xs transition-colors"
              >
                Release Start of Prod
              </button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
