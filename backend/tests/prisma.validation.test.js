import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

describe("Prisma Booking Constraints", () => {

  afterAll(async () => {
    await prisma.booking.deleteMany()
    await prisma.$disconnect()
  })

  it("should throw error on duplicate booking slot", async () => {
    await prisma.booking.create({
      data: {
        userId: 1, serviceId: 1,
        date: new Date("2026-03-10"),
        startTime: new Date("2026-03-10T10:00:00"),
        endTime: new Date("2026-03-10T11:00:00")
      }
    })

    await expect(prisma.booking.create({
      data: {
        userId: 2, serviceId: 1,
        date: new Date("2026-03-10"),
        startTime: new Date("2026-03-10T10:00:00"),
        endTime: new Date("2026-03-10T11:00:00")
      }
    })).rejects.toThrow()
  })
})