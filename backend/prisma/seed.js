// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create a test user
  const user = await prisma.user.upsert({
    where: { email: "testuser@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "testuser@example.com",
      password: "hashed_password" // in production, hash properly
    }
  });

  // 2️⃣ Create a test service
  const service = await prisma.service.upsert({
    where: { name: "Haircut" },
    update: {},
    create: {
      name: "Haircut",
      price: 150
    }
  });

  // 3️⃣ Create a test booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      serviceId: service.id,
      date: new Date("2026-03-02T00:00:00.000Z"),
      startTime: new Date("2026-03-02T10:00:00.000Z"),
      endTime: new Date("2026-03-02T11:00:00.000Z"),
      status: "pending"
    }
  });

  console.log("✅ Seed complete:", { user, service, booking });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });