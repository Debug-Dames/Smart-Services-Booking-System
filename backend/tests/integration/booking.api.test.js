import request from "supertest"
import { PrismaClient } from "@prisma/client"
import app from "../../src/app.js"

const prisma = new PrismaClient()
let user, service

beforeAll(async () => {
  user = await prisma.user.create({ data: { email: "testuser@example.com", name: "Test User" } })
  service = await prisma.service.create({ data: { name: "Haircut", duration: 60, price: 200 } })
})

afterAll(async () => {
  await prisma.booking.deleteMany()
  await prisma.user.deleteMany()
  await prisma.service.deleteMany()
  await prisma.$disconnect()
})

beforeEach(async () => await prisma.booking.deleteMany())

describe("Booking API Integration Tests", () => {

  it("should create a booking successfully", async () => {
    const res = await request(app).post("/bookings").send({
      userId: user.id, serviceId: service.id,
      date: "2026-03-10", startTime: "10:00", endTime: "11:00"
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty("id")
  })

  it("should reject duplicate booking", async () => {
    await prisma.booking.create({ data: { userId: user.id, serviceId: service.id, date: new Date("2026-03-10"), startTime: new Date("2026-03-10T10:00:00"), endTime: new Date("2026-03-10T11:00:00") } })
    const res = await request(app).post("/bookings").send({
      userId: user.id, serviceId: service.id,
      date: "2026-03-10", startTime: "10:00", endTime: "11:00"
    })
    expect(res.statusCode).toBe(409)
  })

  it("should return all bookings", async () => {
    await prisma.booking.create({ data: { userId: user.id, serviceId: service.id, date: new Date("2026-03-10"), startTime: new Date("2026-03-10T10:00:00"), endTime: new Date("2026-03-10T11:00:00") } })
    const res = await request(app).get("/bookings")
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
  })

  it("should update a booking", async () => {
    const booking = await prisma.booking.create({ data: { userId: user.id, serviceId: service.id, date: new Date("2026-03-10"), startTime: new Date("2026-03-10T10:00:00"), endTime: new Date("2026-03-10T11:00:00") } })
    const res = await request(app).put(`/bookings/${booking.id}`).send({ startTime: "12:00", endTime: "13:00" })
    expect(res.statusCode).toBe(200)
  })

  it("should delete a booking", async () => {
    const booking = await prisma.booking.create({ data: { userId: user.id, serviceId: service.id, date: new Date("2026-03-10"), startTime: new Date("2026-03-10T10:00:00"), endTime: new Date("2026-03-10T11:00:00") } })
    const res = await request(app).delete(`/bookings/${booking.id}`)
    expect(res.statusCode).toBe(200)
    const deleted = await prisma.booking.findUnique({ where: { id: booking.id } })
    expect(deleted).toBeNull()
  })
})