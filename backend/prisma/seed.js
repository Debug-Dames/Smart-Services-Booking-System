import prisma from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "customer",
      userId: 1,
    },
  });

  await prisma.service.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Haircut",
      description: "Standard haircut service",
      price: 100,
      duration: 60,
    },
  });

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
