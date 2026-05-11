DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TENANT' AND enumtypid = '"Role"'::regtype) THEN
    ALTER TYPE "Role" ADD VALUE 'TENANT';
  END IF;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "flatId" TEXT;

CREATE INDEX IF NOT EXISTS "User_flatId_idx" ON "User"("flatId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_flatId_fkey') THEN
ALTER TABLE "User"
ADD CONSTRAINT "User_flatId_fkey"
FOREIGN KEY ("flatId") REFERENCES "Flat"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
