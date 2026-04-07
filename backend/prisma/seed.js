import prisma from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  const adminHashedPassword = await bcrypt.hash("Admin@1234", 10);
  const now = new Date();

  await prisma.user.upsert({
    where: { email: "admin@smartservices.com" },
    update: {
      name: "System Admin",
      password: adminHashedPassword,
      phone: "+10000000001",
      updatedAt: now,
      role: "ADMIN",
    },
    create: {
      name: "System Admin",
      email: "admin@smartservices.com",
      password: adminHashedPassword,
      phone: "+10000000001",
      updatedAt: now,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      name: "Test User",
      password: hashedPassword,
      phone: "+10000000000",
      updatedAt: now,
      role: "CUSTOMER",
    },
    create: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      phone: "+10000000000",
      updatedAt: now,
      role: "CUSTOMER",
    },
  });

  const haircut = await prisma.service.findFirst({
    where: {
      name: {
        equals: "Haircut",
        mode: "insensitive",
      },
    },
  });

  if (haircut) {
    await prisma.service.update({
      where: { id: haircut.id },
      data: {
        description: "Standard haircut service",
        price: 100,
        duration: 60,
      },
    });
  } else {
    await prisma.service.create({
      data: {
        name: "Haircut",
        description: "Standard haircut service",
        price: 100,
        duration: 60,
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
