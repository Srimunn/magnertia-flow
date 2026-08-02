import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Paperclip, Network, HardDrive, Shield } from "lucide-react";
import type { CloudPlatformOption, SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryInfrastructureCardProps {
  record: SmartFactoryDevelopmentRecord;
  onChange: (field: keyof SmartFactoryDevelopmentRecord, value: any) => void;
  isEditing?: boolean;
}

const CLOUD_PLATFORMS: CloudPlatformOption[] = [
  "AWS IoT",
  "Microsoft Azure IoT",
  "Google Cloud",
  "Siemens Insights Hub",
  "PTC ThingWorx",
  "Private Cloud",
];

export const SmartFactoryInfrastructureCard: React.FC<SmartFactoryInfrastructureCardProps> = ({
  record,
  onChange,
  isEditing = true,
}) => {
  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => {
    const colors = {
      M: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200",
      A: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
      I: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
      C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
      W: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
    };
    return (
      <span
        title={tooltip}
        className={`ml-1.5 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase border ${colors[type]}`}
      >
        {type}
      </span>
    );
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">
            2. Digital Infrastructure
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Score:</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {record.infrastructureReadinessScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        {/* Network Architecture File */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Network Architecture
            <MaicwBadge type="M" tooltip="Mandatory File Attachment" />
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="flex-1 truncate font-medium">{record.networkArchitectureFile || "Network_Architecture.pdf"}</span>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => alert("Downloading Network Architecture file...")}
            >
              View
            </button>
          </div>
        </div>

        {/* Edge Computing Platform */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Edge Computing Platform
            <MaicwBadge type="I" tooltip="Information / Lookup" />
          </label>
          {isEditing ? (
            <Input
              value={record.edgeComputingPlatform}
              onChange={(e) => onChange("edgeComputingPlatform", e.target.value)}
              placeholder="e.g. Dell Edge Gateway 5000"
              className="h-9 text-xs"
            />
          ) : (
            <span className="text-xs font-medium text-foreground">{record.edgeComputingPlatform}</span>
          )}
        </div>

        {/* Cloud Platform */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Cloud Platform
            <MaicwBadge type="I" tooltip="Information / Lookup" />
          </label>
          {isEditing ? (
            <Select
              value={record.cloudPlatform}
              onValueChange={(val) => onChange("cloudPlatform", val as CloudPlatformOption)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Cloud Platform" />
              </SelectTrigger>
              <SelectContent>
                {CLOUD_PLATFORMS.map((cp) => (
                  <SelectItem key={cp} value={cp} className="text-xs">
                    {cp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs font-medium text-foreground">{record.cloudPlatform}</span>
          )}
        </div>

        {/* Data Center Architecture File */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Data Center Architecture
            <MaicwBadge type="M" tooltip="Mandatory File Attachment" />
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs">
            <HardDrive className="h-4 w-4 text-purple-600" />
            <span className="flex-1 truncate font-medium">{record.dataCenterArchitectureFile || "DataCenter_Arch.pdf"}</span>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => alert("Downloading Data Center Architecture file...")}
            >
              View
            </button>
          </div>
        </div>

        {/* Cybersecurity Architecture File */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Cybersecurity Architecture
            <MaicwBadge type="M" tooltip="Mandatory File Attachment" />
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="flex-1 truncate font-medium">{record.cybersecurityArchitectureFile || "Cyber_Arch.pdf"}</span>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => alert("Downloading Cybersecurity Architecture file...")}
            >
              View
            </button>
          </div>
        </div>

        {/* Checkbox Controls: Industrial Ethernet & 5G Connectivity */}
        <div className="flex flex-wrap gap-6 pt-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="industrialEthernet"
              checked={record.industrialEthernet}
              onCheckedChange={(checked) => onChange("industrialEthernet", !!checked)}
            />
            <label htmlFor="industrialEthernet" className="cursor-pointer text-xs font-medium text-foreground">
              Industrial Ethernet
              <MaicwBadge type="W" tooltip="Workflow Checkbox" />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="wifi5gConnectivity"
              checked={record.wifi5gConnectivity}
              onCheckedChange={(checked) => onChange("wifi5gConnectivity", !!checked)}
            />
            <label htmlFor="wifi5gConnectivity" className="cursor-pointer text-xs font-medium text-foreground">
              Wi-Fi / 5G Connectivity
              <MaicwBadge type="W" tooltip="Workflow Checkbox" />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
