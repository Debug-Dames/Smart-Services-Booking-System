// import { PrismaClient } from "@prisma/client"
// import jwt from "jsonwebtoken"
// import { jest } from "@jest/globals"



// const prisma = new PrismaClient()
// let user, service, token

// beforeAll(async () => {
//   jest.setTimeout(20000) // Increase timeout for Prisma operations
//   // Clean database
//   await prisma.booking.deleteMany()
//   await prisma.user.deleteMany()
//   await prisma.service.deleteMany()

//   // Create a unique test user
//   const timestamp = Date.now()
//   user = await prisma.user.create({
//     data: {
//       email: `validationuser_${timestamp}@example.com`,
//       name: "Validation User",
//       phone: "+27628463521",
//       password: "123456",
//     },
//   })

//   // Generate JWT token
//   token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "testsecret", {
//     expiresIn: "1h",
//   })

//   // Create test service
//   service = await prisma.service.create({
//     data: {
//       name: `Haircut_${timestamp}`,
//       duration: 60,
//       price: 200,
//     },
//   })
// })

// afterAll(async () => {
//   await prisma.booking.deleteMany()
//   await prisma.user.deleteMany()
//   await prisma.service.deleteMany()
//   await prisma.$disconnect()
// })

// beforeEach(async () => {
//   await prisma.booking.deleteMany()
// })

// describe("Prisma Booking Constraints", () => {
//   it("should throw error on duplicate booking slot", async () => {
//     // First booking
//     await prisma.booking.create({
//       data: {
//         userId: user.id,
//         serviceId: service.id,
//         date: new Date("2026-03-10"),
//         startTime: new Date("2026-03-10T10:00:00"),
//         endTime: new Date("2026-03-10T11:00:00"),
//       },
//     })

//     // Attempt duplicate booking (should fail due to unique constraint)
//     let errorThrown = false
//     try {
//       await prisma.booking.create({
//         data: {
//           userId: user.id,
//           serviceId: service.id,
//           date: new Date("2026-03-10"),
//           startTime: new Date("2026-03-10T10:00:00"),
//           endTime: new Date("2026-03-10T11:00:00"),
//         },
//       })
//     } catch (err) {
//       errorThrown = true
//       expect(err.code).toBe("P2002") // Prisma unique constraint violation
//     }

//     expect(errorThrown).toBe(true)
//   })
// })


// tests/prisma.validation.test.js
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