import bcrypt from "bcryptjs";
import { PrismaClient, PaymentMethod, RentStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@propertyledger.pro" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "admin@propertyledger.pro",
      passwordHash,
      role: Role.OWNER_ADMIN
    }
  });

  const property = await prisma.property.create({
    data: {
      name: "Green Heights Apartments",
      address: "MG Road, Bengaluru",
      floors: 6,
      hasGenerator: true,
      hasWaterTanker: true,
      hasLift: true,
      hasSecurityStaff: true,
      hasMaintenanceStaff: true,
      accounts: {
        create: [
          { name: "Personal Account", type: "PERSONAL", openingCash: 200000 },
          { name: "Building Account", type: "BUILDING", openingCash: 420000 },
          { name: "Cash in Hand", type: "CASH", openingCash: 25000 }
        ]
      },
      notifications: {
        create: [
          {
            title: "Lift AMC renewal",
            message: "Lift AMC contract renews next month.",
            type: "AMC_RENEWAL",
            dueDate: new Date("2026-06-15")
          },
          {
            title: "Warranty expiry",
            message: "Generator battery warranty expires in 28 days.",
            type: "WARRANTY_EXPIRY",
            dueDate: new Date("2026-06-08")
          }
        ]
      }
    },
    include: { accounts: true }
  });

  const flats = await Promise.all(
    [
      ["101", "Ravi Kumar", 28000],
      ["102", "Nisha Rao", 30000],
      ["201", "Arjun Mehta", 32000],
      ["202", "Vacant", 31000],
      ["301", "Priya Shah", 35000],
      ["302", "Deepak Jain", 33000]
    ].map(([flatNumber, tenantName, rent]) =>
      prisma.flat.create({
        data: {
          propertyId: property.id,
          flatNumber: String(flatNumber),
          tenantName: String(tenantName),
          tenantPhone: "+91 98765 43210",
          tenantEmail: `${String(tenantName).split(" ")[0].toLowerCase()}@example.com`,
          monthlyRent: Number(rent),
          securityDeposit: Number(rent) * 3,
          leaseStart: new Date("2025-04-01"),
          leaseEnd: new Date("2026-03-31"),
          status: tenantName === "Vacant" ? "VACANT" : "OCCUPIED"
        }
      })
    )
  );

  const buildingAccount = property.accounts.find((account) => account.type === "BUILDING");
  const cashAccount = property.accounts.find((account) => account.type === "CASH");

  await prisma.rentPayment.createMany({
    data: flats.slice(0, 5).map((flat, index) => ({
      flatId: flat.id,
      accountId: buildingAccount?.id,
      month: 5,
      year: 2026,
      expectedAmount: flat.monthlyRent,
      receivedAmount: index === 1 ? 18000 : flat.monthlyRent,
      lateFee: index === 4 ? 500 : 0,
      discount: 0,
      method: index % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.BANK_TRANSFER,
      receivedDate: new Date(`2026-05-${String(3 + index).padStart(2, "0")}`),
      status: index === 1 ? RentStatus.PARTIALLY_PAID : RentStatus.PAID,
      notes: index === 1 ? "Part payment, reminder scheduled" : "Paid on time"
    }))
  });

  await prisma.expenseRecord.createMany({
    data: [
      {
        flatId: flats[0].id,
        accountId: cashAccount?.id,
        category: "Plumbing",
        title: "Kitchen tap replacement",
        vendor: "AquaFix Services",
        amount: 2400,
        paymentDate: new Date("2026-05-02"),
        method: PaymentMethod.CASH,
        warranty: true,
        warrantyExpiry: new Date("2026-11-02")
      },
      {
        flatId: flats[2].id,
        accountId: buildingAccount?.id,
        category: "Electrical",
        title: "MCB service",
        vendor: "BrightSpark Electricals",
        amount: 3800,
        paymentDate: new Date("2026-05-05"),
        method: PaymentMethod.UPI,
        warranty: false
      }
    ]
  });

  await prisma.buildingExpense.createMany({
    data: [
      {
        propertyId: property.id,
        accountId: buildingAccount?.id,
        type: "Staff",
        title: "Security salary",
        employeeName: "Mahesh",
        role: "Security",
        salaryAmount: 22000,
        amount: 22000,
        paidDate: new Date("2026-05-01"),
        method: PaymentMethod.BANK_TRANSFER,
        paid: true
      },
      {
        propertyId: property.id,
        accountId: buildingAccount?.id,
        type: "Generator",
        title: "Diesel purchase",
        vendor: "City Fuels",
        amount: 14500,
        paidDate: new Date("2026-05-06"),
        method: PaymentMethod.UPI,
        runningHours: 18,
        paid: true
      },
      {
        propertyId: property.id,
        accountId: buildingAccount?.id,
        type: "Electricity",
        title: "Common area EB bill",
        amount: 18500,
        billMonth: "May 2026",
        dueDate: new Date("2026-05-20"),
        method: PaymentMethod.BANK_TRANSFER,
        paid: false
      }
    ]
  });

  await prisma.waterTankerLog.createMany({
    data: [
      {
        propertyId: property.id,
        accountId: buildingAccount?.id,
        vendorName: "Sri Lakshmi Tankers",
        date: new Date("2026-05-04"),
        tankers: 3,
        litersSupplied: 18000,
        costPerTanker: 1400,
        totalCost: 4200,
        method: PaymentMethod.UPI,
        paid: true
      },
      {
        propertyId: property.id,
        accountId: buildingAccount?.id,
        vendorName: "Sri Lakshmi Tankers",
        date: new Date("2026-05-10"),
        tankers: 4,
        litersSupplied: 24000,
        costPerTanker: 1450,
        totalCost: 5800,
        method: PaymentMethod.UPI,
        paid: false
      }
    ]
  });

  await prisma.asset.createMany({
    data: [
      {
        propertyId: property.id,
        productName: "Generator battery",
        category: "Generator",
        brand: "Exide",
        modelNumber: "GX-220",
        serialNumber: "EXG-99821",
        purchaseDate: new Date("2025-06-10"),
        purchaseAmount: 18500,
        vendorStore: "Power House",
        warrantyStart: new Date("2025-06-10"),
        warrantyExpiry: new Date("2026-06-10"),
        location: "Ground floor generator room",
        depreciationPct: 15
      },
      {
        flatId: flats[4].id,
        propertyId: property.id,
        productName: "Water motor",
        category: "Pump",
        brand: "Crompton",
        purchaseDate: new Date("2026-01-12"),
        purchaseAmount: 12400,
        vendorStore: "Metro Hardware",
        warrantyStart: new Date("2026-01-12"),
        warrantyExpiry: new Date("2028-01-12"),
        location: "Terrace pump room",
        depreciationPct: 10
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATA_CREATED",
      entity: "System",
      after: { property: property.name }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
