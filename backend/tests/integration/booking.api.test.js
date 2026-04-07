
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import "../setupTests.js";
import { env } from "../../src/config/env.js";
import prisma from "../../src/config/database.js";

let user, service, token;

beforeAll(async () => {
  // Clean DB
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();

  // Create test user
  user = await prisma.user.create({
    data: {
      email: `testuser_${Date.now()}@example.com`,
      name: "Test User",
      phone: "+27628463521",
      password: "123456",
    },
  });

  // JWT token
  token = jwt.sign({ id: user.id }, env.JWT_SECRET || "testsecret", {
    expiresIn: "1h",
  });

  // Create service
  service = await prisma.service.create({
    data: {
      name: "Haircut",
      duration: 60,
      price: 200,
    },
  });
});

afterAll(async () => {
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.booking.deleteMany();
});

describe("Booking API Integration Tests (no stylist)", () => {
  const lockSlot = async (start, end) => {
    const res = await request(app)
      .post("/bookings/lock")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serviceId: service.id,
        startTime: start,
        endTime: end,
      });
    expect(res.statusCode).toBe(201);
    return res.body.lockToken;
  };

  it("should create a booking successfully", async () => {
    const start = "2026-03-10T10:00:00";
    const end = "2026-03-10T11:00:00";

    await lockSlot(start, end);

    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: user.id,
        serviceId: service.id,
        date: "2026-03-10",
        startTime: start,
        endTime: end,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should reject duplicate booking", async () => {
    // First booking
    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: new Date("2026-03-18"),
        startTime: new Date("2026-03-18T10:10:00"),
        endTime: new Date("2026-03-18T11:10:00"),
      },
    });

    // Try creating duplicate
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: user.id,
        serviceId: service.id,
        date: "2026-03-18",
        startTime: "2026-03-18T10:10:00",
        endTime: "2026-03-18T11:10:00",
      });

    expect(res.statusCode).toBe(409);
  });

  it("should return all bookings", async () => {
    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: new Date("2026-03-18"),
        startTime: new Date("2026-03-18T10:10:00"),
        endTime: new Date("2026-03-18T11:10:00"),
      },
    });

    const res = await request(app)
      .get("/bookings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should update a booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: new Date("2026-03-18"),
        startTime: new Date("2026-03-18T10:10:00"),
        endTime: new Date("2026-03-18T11:10:00"),
      },
    });

    const res = await request(app)
      .put(`/bookings/${booking.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startTime: "2026-03-18T12:10:00",
        endTime: "2026-03-18T13:10:00",
      });

    expect(res.statusCode).toBe(200);
  });

  it("should delete a booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        date: new Date("2026-03-18"),
        startTime: new Date("2026-03-18T10:10:00"),
        endTime: new Date("2026-03-18T11:10:00"),
      },
    });

    const res = await request(app)
      .delete(`/bookings/${booking.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const deleted = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(deleted).toBeNull();
  });
});