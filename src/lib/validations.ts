import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  role: z.enum(["OWNER_ADMIN", "ACCOUNTANT_MANAGER", "READ_ONLY_VIEWER"]).default("OWNER_ADMIN")
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
  status: z.enum(["OCCUPIED", "VACANT", "NOTICE", "MAINTENANCE"]).default("OCCUPIED"),
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
