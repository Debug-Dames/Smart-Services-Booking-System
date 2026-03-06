import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

describe("Prisma Booking Constraints", () => {
  let user, service

  beforeAll(async () => {
    // Clean DB
    await prisma.booking.deleteMany()
    await prisma.user.deleteMany()
    await prisma.service.deleteMany()

    // Create test user
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        phone: "+27628463521",
        password: "123456",
      },
    })

    // Create test service
    service = await prisma.service.create({
      data: {
        name: "Haircut",
        duration: 60,
        price: 150,
      },
    })
  })

  afterAll(async () => {
    await prisma.booking.deleteMany()
    await prisma.user.deleteMany()
    await prisma.service.deleteMany()
    await prisma.$disconnect()
  })

  it("should throw error on duplicate booking slot", async () => {
    // First booking
    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: new Date("2026-03-10"),
        startTime: new Date("2026-03-10T10:00:00"),
        endTime: new Date("2026-03-10T11:00:00"),
      },
    })

    // Duplicate booking should fail due to unique constraint
    await expect(
      prisma.booking.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          date: new Date("2026-03-10"),
          startTime: new Date("2026-03-10T10:00:00"),
          endTime: new Date("2026-03-10T11:00:00"),
        },
      })
    ).rejects.toThrow()
  })
})