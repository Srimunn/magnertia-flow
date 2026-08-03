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
import { Award, Plus } from "lucide-react";
import type { InitiativeCategory } from "@/services/types";

interface NewExcellenceInitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (initiative: {
    title: string;
    number: string;
    plant: string;
    unit: string;
    owner: string;
    category: InitiativeCategory;
    objective: string;
  }) => void;
}

const INITIATIVE_CATEGORIES: InitiativeCategory[] = [
  "Operational Excellence",
  "Lean Transformation",
  "Six Sigma",
  "Kaizen",
  "TPM",
  "Smart Manufacturing",
  "Industry 4.0",
  "Energy Excellence",
  "Sustainability",
  "Digital Transformation",
];

export const NewExcellenceInitiativeDialog: React.FC<NewExcellenceInitiativeDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState(`MEX-INIT-24-${Math.floor(100 + Math.random() * 900)}`);
  const [plant, setPlant] = useState("Plant-01");
  const [unit, setUnit] = useState("EVSE Manufacturing");
  const [owner, setOwner] = useState("Rahul Sharma");
  const [category, setCategory] = useState<InitiativeCategory>("Operational Excellence");
  const [objective, setObjective] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title,
      number,
      plant,
      unit,
      owner,
      category,
      objective,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">New Manufacturing Excellence Initiative</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Initiative Title *</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. OEE Optimization & Scrap Reduction Project"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Initiative Number *</label>
            <Input
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Initiative Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as InitiativeCategory)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INITIATIVE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <label className="text-xs font-semibold text-foreground">Business Unit</label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. EVSE Manufacturing"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Process Owner</label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">Business Objective</label>
            <Textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Quantifiable goals (OEE gains, cost reduction, quality improvements)..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="sm:col-span-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 bg-primary font-semibold">
              <Plus className="h-3.5 w-3.5" />
              Create Initiative
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
