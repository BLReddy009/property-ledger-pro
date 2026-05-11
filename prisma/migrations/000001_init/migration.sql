-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER_ADMIN', 'ACCOUNTANT_MANAGER', 'READ_ONLY_VIEWER');

-- CreateEnum
CREATE TYPE "OccupancyStatus" AS ENUM ('OCCUPIED', 'VACANT', 'NOTICE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE');

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('PAID', 'PARTIALLY_PAID', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PERSONAL', 'BUILDING', 'CASH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ExpenseScope" AS ENUM ('FLAT', 'BUILDING');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('BILL', 'INVOICE', 'WARRANTY_CARD', 'AMC_CONTRACT', 'TENANT_AGREEMENT', 'REPAIR_PHOTO', 'RECEIPT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER_ADMIN',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "hasGenerator" BOOLEAN NOT NULL DEFAULT false,
    "hasWaterTanker" BOOLEAN NOT NULL DEFAULT false,
    "hasLift" BOOLEAN NOT NULL DEFAULT false,
    "hasSecurityStaff" BOOLEAN NOT NULL DEFAULT false,
    "hasMaintenanceStaff" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flat" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "tenantName" TEXT,
    "tenantPhone" TEXT,
    "tenantEmail" TEXT,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "securityDeposit" DECIMAL(12,2) NOT NULL,
    "leaseStart" TIMESTAMP(3),
    "leaseEnd" TIMESTAMP(3),
    "status" "OccupancyStatus" NOT NULL DEFAULT 'OCCUPIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "openingCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "accountId" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "expectedAmount" DECIMAL(12,2) NOT NULL,
    "receivedAmount" DECIMAL(12,2) NOT NULL,
    "lateFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "method" "PaymentMethod" NOT NULL,
    "transactionRef" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "status" "RentStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseRecord" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "accountId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "warranty" BOOLEAN NOT NULL DEFAULT false,
    "warrantyExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingExpense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "accountId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employeeName" TEXT,
    "role" TEXT,
    "salaryAmount" DECIMAL(12,2),
    "advancePaid" DECIMAL(12,2),
    "bonus" DECIMAL(12,2),
    "amount" DECIMAL(12,2) NOT NULL,
    "billMonth" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "method" "PaymentMethod" NOT NULL,
    "vendor" TEXT,
    "runningHours" DECIMAL(10,2),
    "renewalDate" TIMESTAMP(3),
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterTankerLog" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "accountId" TEXT,
    "vendorName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tankers" INTEGER NOT NULL,
    "litersSupplied" INTEGER NOT NULL,
    "costPerTanker" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterTankerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "flatId" TEXT,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "modelNumber" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchaseAmount" DECIMAL(12,2) NOT NULL,
    "vendorStore" TEXT,
    "warrantyStart" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "amcDetails" TEXT,
    "location" TEXT,
    "depreciationPct" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vendor" TEXT,
    "amount" DECIMAL(12,2),
    "servicedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ServiceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "flatId" TEXT,
    "rentPaymentId" TEXT,
    "expenseRecordId" TEXT,
    "buildingExpenseId" TEXT,
    "waterTankerLogId" TEXT,
    "assetId" TEXT,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Property_name_idx" ON "Property"("name");

-- CreateIndex
CREATE INDEX "Flat_tenantName_idx" ON "Flat"("tenantName");

-- CreateIndex
CREATE INDEX "Flat_status_idx" ON "Flat"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Flat_propertyId_flatNumber_key" ON "Flat"("propertyId", "flatNumber");

-- CreateIndex
CREATE INDEX "RentPayment_year_month_idx" ON "RentPayment"("year", "month");

-- CreateIndex
CREATE INDEX "RentPayment_status_idx" ON "RentPayment"("status");

-- CreateIndex
CREATE INDEX "ExpenseRecord_category_idx" ON "ExpenseRecord"("category");

-- CreateIndex
CREATE INDEX "ExpenseRecord_paymentDate_idx" ON "ExpenseRecord"("paymentDate");

-- CreateIndex
CREATE INDEX "BuildingExpense_type_idx" ON "BuildingExpense"("type");

-- CreateIndex
CREATE INDEX "BuildingExpense_dueDate_idx" ON "BuildingExpense"("dueDate");

-- CreateIndex
CREATE INDEX "WaterTankerLog_date_idx" ON "WaterTankerLog"("date");

-- CreateIndex
CREATE INDEX "Asset_productName_idx" ON "Asset"("productName");

-- CreateIndex
CREATE INDEX "Asset_warrantyExpiry_idx" ON "Asset"("warrantyExpiry");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_dueDate_idx" ON "Notification"("dueDate");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "Flat" ADD CONSTRAINT "Flat_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingExpense" ADD CONSTRAINT "BuildingExpense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingExpense" ADD CONSTRAINT "BuildingExpense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterTankerLog" ADD CONSTRAINT "WaterTankerLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterTankerLog" ADD CONSTRAINT "WaterTankerLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceHistory" ADD CONSTRAINT "ServiceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_rentPaymentId_fkey" FOREIGN KEY ("rentPaymentId") REFERENCES "RentPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_expenseRecordId_fkey" FOREIGN KEY ("expenseRecordId") REFERENCES "ExpenseRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_buildingExpenseId_fkey" FOREIGN KEY ("buildingExpenseId") REFERENCES "BuildingExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_waterTankerLogId_fkey" FOREIGN KEY ("waterTankerLogId") REFERENCES "WaterTankerLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
