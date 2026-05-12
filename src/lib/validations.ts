import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  role: z.enum(["OWNER_ADMIN", "ACCOUNTANT_MANAGER", "READ_ONLY_VIEWER", "TENANT"]).default("OWNER_ADMIN"),
  flatId: z.string().optional().or(z.literal(""))
});

export const createUserSchema = signupSchema.refine((input) => input.role !== "TENANT" || Boolean(input.flatId), {
  message: "Tenant users must be assigned to a flat.",
  path: ["flatId"]
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

export const propertySchema = z.object({
  name: z.string().min(2),
  address: z.string().min(4),
  floors: z.coerce.number().int().min(1),
  hasGenerator: z.boolean().default(false),
  hasWaterTanker: z.boolean().default(false),
  hasLift: z.boolean().default(false),
  hasSecurityStaff: z.boolean().default(false),
  hasMaintenanceStaff: z.boolean().default(false),
  notes: z.string().optional()
});

export const accountUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80)
});

export const flatSchema = z.object({
  propertyId: z.string(),
  flatNumber: z.string().min(1),
  tenantName: z.string().optional(),
  tenantPhone: z.string().optional(),
  tenantEmail: z.string().email().optional().or(z.literal("")),
  monthlyRent: z.coerce.number().min(0),
  securityDeposit: z.coerce.number().min(0),
  leaseStart: z.coerce.date().optional(),
  leaseEnd: z.coerce.date().optional(),
  agreementMonths: z.coerce.number().int().min(1).default(11),
  rentIncreasePct: z.coerce.number().min(0).max(100).default(5),
  status: z.enum(["OCCUPIED", "VACANT", "NOTICE", "MAINTENANCE"]).default("OCCUPIED"),
  notes: z.string().optional()
});

export const rentRevisionSchema = z.object({
  mode: z.enum(["PERCENT", "CUSTOM"]),
  percent: z.coerce.number().min(0).max(100).optional(),
  newRent: z.coerce.number().min(0).optional(),
  effectiveDate: z.coerce.date().default(() => new Date())
}).refine((input) => input.mode === "PERCENT" ? input.percent !== undefined : input.newRent !== undefined, {
  message: "Provide either a rent percentage or a custom rent amount."
});

export const vacateFlatSchema = z.object({
  vacatedAt: z.coerce.date().default(() => new Date()),
  includePaintingCleaning: z.coerce.boolean().default(true),
  includeEarlyVacatePenalty: z.coerce.boolean().default(false),
  pendingRent: z.coerce.number().min(0).default(0),
  deductions: z.array(z.object({
    title: z.string().min(2),
    amount: z.coerce.number().min(0),
    notes: z.string().optional()
  })).default([]),
  notes: z.string().optional()
});

export const rentPaymentSchema = z.object({
  flatId: z.string(),
  accountId: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
  expectedAmount: z.coerce.number().min(0),
  receivedAmount: z.coerce.number().min(0),
  lateFee: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
  transactionRef: z.string().optional(),
  receivedDate: z.coerce.date(),
  status: z.enum(["PAID", "PARTIALLY_PAID", "PENDING", "OVERDUE"]),
  notes: z.string().optional()
});

export const expenseRecordSchema = z.object({
  flatId: z.string().min(1),
  accountId: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  vendor: z.string().optional(),
  amount: z.coerce.number().min(0),
  paymentDate: z.coerce.date(),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
  warranty: z.coerce.boolean().default(false),
  warrantyExpiry: z.coerce.date().optional(),
  notes: z.string().optional()
});

export const buildingExpenseSchema = z.object({
  propertyId: z.string().min(1),
  accountId: z.string().optional().or(z.literal("")),
  type: z.string().min(2),
  title: z.string().min(2),
  employeeName: z.string().optional(),
  role: z.string().optional(),
  salaryAmount: z.coerce.number().min(0).optional(),
  advancePaid: z.coerce.number().min(0).optional(),
  bonus: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0),
  billMonth: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  paidDate: z.coerce.date().optional(),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
  vendor: z.string().optional(),
  runningHours: z.coerce.number().min(0).optional(),
  renewalDate: z.coerce.date().optional(),
  paid: z.coerce.boolean().default(true),
  notes: z.string().optional()
});

export const waterTankerSchema = z.object({
  propertyId: z.string().min(1),
  accountId: z.string().optional().or(z.literal("")),
  vendorName: z.string().min(2),
  date: z.coerce.date(),
  tankers: z.coerce.number().int().min(1),
  litersSupplied: z.coerce.number().int().min(1),
  costPerTanker: z.coerce.number().min(0),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
  paid: z.coerce.boolean().default(false)
});

export const assetSchema = z.object({
  propertyId: z.string().optional().or(z.literal("")),
  flatId: z.string().optional().or(z.literal("")),
  productName: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.coerce.date(),
  purchaseAmount: z.coerce.number().min(0),
  vendorStore: z.string().optional(),
  warrantyStart: z.coerce.date().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  amcDetails: z.string().optional(),
  location: z.string().optional(),
  depreciationPct: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional()
});
