ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "stylistId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Booking_stylistId_fkey'
  ) THEN
    ALTER TABLE "Booking"
    ADD CONSTRAINT "Booking_stylistId_fkey"
    FOREIGN KEY ("stylistId") REFERENCES "Stylist"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
