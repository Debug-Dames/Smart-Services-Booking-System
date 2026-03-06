ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "stylistId" INTEGER;

CREATE INDEX IF NOT EXISTS "Booking_serviceId_startTime_endTime_idx"
ON "Booking"("serviceId", "startTime", "endTime");

CREATE INDEX IF NOT EXISTS "Booking_stylistId_startTime_endTime_idx"
ON "Booking"("stylistId", "startTime", "endTime");
