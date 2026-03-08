import { createBookingService } from "../../src/modules/bookings/bookings.service"
import { PrismaClient } from "@prisma/client"

jest.mock("@prisma/client", () => {
  const mPrisma = { booking: { findFirst: jest.fn(), create: jest.fn() } }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

const prisma = new PrismaClient()

describe("Booking Service Unit Tests", () => {

  beforeEach(() => jest.clearAllMocks())

  it("should reject booking in the past", async () => {
    await expect(createBookingService({
      userId: 1, serviceId: 1,
      date: "2020-01-01", startTime: "10:00", endTime: "11:00"
    })).rejects.toThrow("Cannot book in the past")
  })

  it("should reject if end time is before start time", async () => {
    await expect(createBookingService({
      userId: 1, serviceId: 1,
      date: "2026-03-10", startTime: "11:00", endTime: "10:00"
    })).rejects.toThrow("Invalid time range")
  })

  it("should prevent double booking", async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 1 })
    await expect(createBookingService({
      userId: 1, serviceId: 1,
      date: "2026-03-10", startTime: "10:00", endTime: "11:00"
    })).rejects.toThrow("Time slot already booked")
  })

  it("should create booking when slot is available", async () => {
    prisma.booking.findFirst.mockResolvedValue(null)
    prisma.booking.create.mockResolvedValue({ id: 99, userId: 1, serviceId: 1 })

    const result = await createBookingService({
      userId: 1, serviceId: 1,
      date: "2026-03-10", startTime: "10:00", endTime: "11:00"
    })

    expect(prisma.booking.findFirst).toHaveBeenCalled()
    expect(prisma.booking.create).toHaveBeenCalled()
    expect(result).toHaveProperty("id", 99)
  })

  it("should reject overlapping bookings", async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 2 })
    await expect(createBookingService({
      userId: 1, serviceId: 1,
      date: "2026-03-10", startTime: "10:30", endTime: "11:30"
    })).rejects.toThrow("Time slot already booked")
  })
})