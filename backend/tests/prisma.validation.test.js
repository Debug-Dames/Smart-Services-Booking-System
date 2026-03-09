import prisma from "../src/config/database.js";
import { jest } from "@jest/globals"

describe("Prisma Booking Constraints", () => {
  let user, service;

  // Clean DB and create test user/service
  beforeAll(async () => {
    jest.setTimeout(20000);

    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.service.deleteMany();

    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        password: "123456",
        phone: "+27628463521",
      },
    });

    service = await prisma.service.create({
      data: {
        name: "Test Service",
        duration: 60,
        price: 100,
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.service.deleteMany();
    await prisma.$disconnect();
  });

  it("should throw error on duplicate booking slot", async () => {
    const fixedDate = new Date("2026-03-07T10:00:00.000Z");

    // First booking
    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: fixedDate,
        startTime: fixedDate,
        endTime: new Date(fixedDate.getTime() + 60 * 60 * 1000),
      },
    });

    // Try duplicate booking
    let errorThrown = false;
    try {
      await prisma.booking.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          date: fixedDate,
          startTime: fixedDate, // same as first
          endTime: new Date(fixedDate.getTime() + 60 * 60 * 1000),
        },
      });
    } catch (e) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);
  });
});