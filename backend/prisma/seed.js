import prisma from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  const now = new Date();

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
  await prisma.service.upsert({
  where: { name: "Haircut" },
  update: {},
  create: {
    name: "Haircut",
    description: "Standard haircut service",
    price: 100,
    duration: 60,
  },
 } );

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
