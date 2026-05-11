# Property Ledger Pro

Modern full-stack property finance platform for owners and apartment building managers.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- PostgreSQL with Prisma ORM
- Secure cookie sessions with signed JWTs, bcrypt password hashing, role-ready access control
- Recharts dashboards, PDF and Excel export helpers
- Local file uploads with cloud-storage-ready document records
- Docker-ready PostgreSQL and application setup

## Core Modules

- Dashboard with rent, pending dues, expense, profit, occupancy, reminders, and charts
- Properties and flat/unit management
- Rent collection with partial payments, late fees, discounts, payment method, account tracking, and status colors
- Flat-wise repair/service expenses with warranty and invoice support
- Building expenses for staff, EB/water bills, generator, AMC, and renewals
- Water tanker usage and cost trends
- Purchases, warranties, AMC, depreciation, and service history
- Reports with PDF, Excel, CSV API, and print-friendly mode
- Document storage for bills, invoices, warranty cards, contracts, agreements, photos, and receipts
- Settings for roles, currency, language readiness, backup/restore surface, and operational defaults

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL:

   ```bash
   docker compose up -d db
   ```

4. Run migrations and seed demo data:

   ```bash
   npm run prisma:migrate
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

Demo login:

- Email: `admin@propertyledger.pro`
- Password: `Demo@12345`

## Production Notes

- Set a strong `AUTH_SECRET`.
- Put uploaded documents in durable object storage such as S3, Azure Blob, or GCS for production.
- Restrict API routes by role before exposing sensitive write operations to larger teams.
- Add mail/SMS/WhatsApp providers for reminder delivery.
- Run `prisma migrate deploy` during deployment.

## GitHub And Live Deployment

This is a full-stack Next.js app with PostgreSQL, so it cannot run on GitHub Pages. Use GitHub for source code, then deploy the live app to Vercel, Railway, Render, or another Node.js hosting provider.

Recommended simple setup:

1. Create a PostgreSQL database on Neon, Supabase, Railway, or Render.
2. Copy the production database connection string.
3. Push this project to GitHub.
4. Import the GitHub repository into Vercel.
5. Add these environment variables in Vercel:

   ```bash
   DATABASE_URL="your-production-postgresql-url"
   AUTH_SECRET="a-long-random-production-secret"
   NEXT_PUBLIC_APP_NAME="Property Ledger Pro"
   UPLOAD_DIR="./uploads"
   ```

6. Run Prisma migration against the production database:

   ```bash
   npx prisma migrate deploy
   ```

7. Optionally seed demo data:

   ```bash
   npm run db:seed
   ```

For production file uploads, replace local `UPLOAD_DIR` storage with S3, Cloudinary, UploadThing, Azure Blob, or similar storage. Serverless hosts may delete local uploaded files between deployments.

### Push To GitHub

```bash
git init
git add .
git commit -m "Initial Property Ledger Pro app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/property-ledger-pro.git
git push -u origin main
```

## Docker

```bash
docker compose up --build
```

The app listens on `http://localhost:3000` and PostgreSQL on `localhost:5432`.
