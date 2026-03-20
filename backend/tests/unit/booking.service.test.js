   import { jest } from "@jest/globals"
// Create mock functions
const mockBooking = {
  findFirst: jest.fn(),
  create: jest.fn()
}

// Mock the database module
jest.unstable_mockModule("../../src/config/database.js", () => ({
  default: { booking: mockBooking }
}))

// Dynamic import of the service after mocking
let createBooking
let prisma
beforeAll(async () => {
  prisma = (await import("../../src/config/database.js")).default
  createBooking = (await import("../../src/modules/bookings/bookings.service.js")).createBooking
})

describe("Booking Service Unit Tests", () => {
  beforeEach(() => jest.clearAllMocks())

  it("should reject booking in the past", async () => {
    await expect(createBooking({
      userId: 1, serviceId: 1,
      date: "2020-03-18", startTime: "10:00", endTime: "11:00"
    })).rejects.toThrow("Cannot book in the past")
  })

  it("should reject if end time is before start time", async () => {
    await expect(createBooking({
      userId: 1, serviceId: 1,
      date: "2026-03-18", startTime: "11:00", endTime: "10:00"
    })).rejects.toThrow("Invalid time range")
  })

  it("should prevent double booking", async () => {
    mockBooking.findFirst.mockResolvedValue({ id: 1 })
    await expect(createBooking({
      userId: 1, serviceId: 1,
      date: "2026-03-18", startTime: "10:00", endTime: "11:00"
    })).rejects.toThrow("Time slot already booked")
  })

  it("should create booking when slot is available", async () => {
    mockBooking.findFirst.mockResolvedValue(null)
    mockBooking.create.mockResolvedValue({ id: 99, userId: 1, serviceId: 1 })

    const result = await createBooking({
      userId: 1, serviceId: 1,
      date: "2026-03-18", startTime: "10:00", endTime: "11:00"
    })

    expect(prisma.booking.findFirst).toHaveBeenCalled()
    expect(prisma.booking.create).toHaveBeenCalled()
    expect(result).toHaveProperty("id", 99)
  })

  it("should reject overlapping bookings", async () => {
    mockBooking.findFirst.mockResolvedValue({ id: 2 })
    await expect(createBooking({
      userId: 1, serviceId: 1,
      date: "2026-03-18", startTime: "10:30", endTime: "11:30"
    })).rejects.toThrow("Time slot already booked")
  })
})
