-- Add stylistId column safely
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stylistId" INTEGER;

-- Only create indexes if startTime and endTime exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='Booking' AND column_name='startTime'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='Booking' AND column_name='endTime'
    ) THEN
        CREATE INDEX IF NOT EXISTS "Booking_serviceId_startTime_endTime_idx"
        ON "Booking"("serviceId", "startTime", "endTime");

        CREATE INDEX IF NOT EXISTS "Booking_stylistId_startTime_endTime_idx"
        ON "Booking"("stylistId", "startTime", "endTime");
    END IF;
END $$;