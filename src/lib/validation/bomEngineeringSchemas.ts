import { z } from "zod";

export const BomItemCategoryEnum = z.enum([
  "Raw Material",
  "Purchased Part",
  "Fabricated Part",
  "Sub-Assembly",
  "Assembly",
  "Fastener",
  "Electronic Component",
  "Packaging Material",
  "Consumable",
]);

export type BomItemCategoryType = z.infer<typeof BomItemCategoryEnum>;

export const BomMaterialGradeEnum = z.enum([
  "Mild Steel",
  "Stainless Steel",
  "Aluminium",
  "Copper",
  "Brass",
  "Plastic",
  "Rubber",
  "Composite",
  "PCB",
  "Electronic",
]);

export const BomManufacturingProcessEnum = z.enum([
  "Machining",
  "Fabrication",
  "Injection Moulding",
  "Casting",
  "Sheet Metal",
  "PCB Assembly",
  "Wire Harness",
  "Final Assembly",
  "Testing",
]);

export const BomMakeBuyEnum = z.enum(["Make", "Buy", "Outsource", "Hybrid"]);

export const BomLifecycleStageEnum = z.enum([
  "Prototype",
  "Engineering Validation",
  "Design Validation",
  "Pilot Production",
  "Mass Production",
  "Service",
  "Obsolete",
]);

export const BomRecommendationEnum = z.enum([
  "Approve BOM",
  "Update Components",
  "Optimize Cost",
  "Review Supply Risk",
  "Validate Manufacturing",
  "Release for Production",
]);

export const BomApprovalDecisionEnum = z.enum([
  "Approved",
  "Approved with Conditions",
  "Revision Required",
  "On Hold",
  "Rejected",
]);

export const BomItemNodeSchema = z.object({
  id: z.string(),
  partNumber: z.string().min(1, "Part Number is required"),
  description: z.string().min(1, "Description is required"),
  level: z.number().min(0),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  uom: z.string().min(1, "UOM is required"),
  itemCategory: BomItemCategoryEnum,
  makeBuy: BomMakeBuyEnum,
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  leadTimeDays: z.number().min(0),
  status: z.enum(["Approved", "Pending", "In Review", "Draft", "Rejected"]),
  referenceDesignator: z.string().optional(),
  alternatePart: z.string().optional(),
  completenessScore: z.number().min(0).max(100).optional(),
  materialGrade: BomMaterialGradeEnum.optional(),
  materialSpecification: z.string().optional(),
  manufacturer: z.string().optional(),
  approvedVendor: z.string().optional(),
  rohsReachCompliant: z.boolean().optional(),
  criticalComponent: z.boolean().optional(),
});

export const BomEngineeringFormSchema = z.object({
  bomName: z.string().min(2, "BOM Name is required"),
  bomNumber: z.string().min(2, "BOM Number is required"),
  product: z.string().min(1, "Product is required"),
  productRevision: z.string().min(1, "Product Revision is required"),
  bomType: z.enum([
    "Engineering BOM (EBOM)",
    "Manufacturing BOM (MBOM)",
    "Service BOM (SBOM)",
    "Sales BOM",
    "Configurable BOM",
    "Phantom BOM",
  ]),
  processOwner: z.string().min(1, "Process Owner is required"),
  productFamily: z.string().min(1, "Product Family is required"),
  productModel: z.string().min(1, "Product Model is required"),
  productVariant: z.string().min(1, "Product Variant is required"),
  assemblyLevel: z.number().min(0),
  parentAssembly: z.string(),
  bomDescription: z.string().min(5, "Description is required"),
  lifecycleStage: BomLifecycleStageEnum,
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  recommendation: BomRecommendationEnum,
});

export const BomApprovalSchema = z.object({
  decision: BomApprovalDecisionEnum,
  reviewerRole: z.string().min(1),
  comments: z.string().optional(),
});
