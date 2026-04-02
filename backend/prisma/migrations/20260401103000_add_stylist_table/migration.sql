CREATE TABLE IF NOT EXISTS "Stylist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "specialty" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'Available',
    "workingHours" TEXT NOT NULL DEFAULT '09:00 - 17:00',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "services" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stylist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Stylist_email_key" ON "Stylist"("email");
