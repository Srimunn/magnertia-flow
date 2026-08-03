import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Plus } from "lucide-react";
import type { SmartFactoryLevel, Industry40Maturity } from "@/services/types";

interface NewSmartFactoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: {
    title: string;
    projectNumber: string;
    plant: string;
    zone: string;
    manager: string;
    level: SmartFactoryLevel;
    maturity: Industry40Maturity;
    vision: string;
  }) => void;
}

export const NewSmartFactoryDialog: React.FC<NewSmartFactoryDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [projectNumber, setProjectNumber] = useState(`SF-TRN-24-${Math.floor(100 + Math.random() * 900)}`);
  const [plant, setPlant] = useState("Plant-01");
  const [zone, setZone] = useState("EVSE Assembly Zone");
  const [manager, setManager] = useState("Vikram Singh");
  const [level, setLevel] = useState<SmartFactoryLevel>("Intelligent Factory");
  const [maturity, setMaturity] = useState<Industry40Maturity>("Intelligent");
  const [vision, setVision] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title,
      projectNumber,
      plant,
      zone,
      manager,
      level,
      maturity,
      vision,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">New Smart Factory Project</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Project Title *</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. EVSE Assembly Line Smart Transformation"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Project Number *</label>
            <Input
              required
              value={projectNumber}
              onChange={(e) => setProjectNumber(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Manufacturing Plant</label>
            <Input
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              placeholder="e.g. Plant-01"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Factory Zone</label>
            <Input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. EVSE Assembly Zone"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Project Manager</label>
            <Input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Vikram Singh"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Smart Factory Level</label>
            <Select value={level} onValueChange={(v) => setLevel(v as SmartFactoryLevel)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Digital Factory" className="text-xs">Digital Factory</SelectItem>
                <SelectItem value="Connected Factory" className="text-xs">Connected Factory</SelectItem>
                <SelectItem value="Intelligent Factory" className="text-xs">Intelligent Factory</SelectItem>
                <SelectItem value="Autonomous Factory" className="text-xs">Autonomous Factory</SelectItem>
                <SelectItem value="Lights-Out Factory" className="text-xs">Lights-Out Factory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Industry 4.0 Maturity</label>
            <Select value={maturity} onValueChange={(v) => setMaturity(v as Industry40Maturity)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Initial" className="text-xs">Initial</SelectItem>
                <SelectItem value="Managed" className="text-xs">Managed</SelectItem>
                <SelectItem value="Connected" className="text-xs">Connected</SelectItem>
                <SelectItem value="Intelligent" className="text-xs">Intelligent</SelectItem>
                <SelectItem value="Autonomous" className="text-xs">Autonomous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Factory Vision & Objective</label>
            <Textarea
              rows={2}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="High-level vision for this smart factory initiative..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="sm:col-span-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 bg-primary font-semibold">
              <Plus className="h-3.5 w-3.5" />
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
