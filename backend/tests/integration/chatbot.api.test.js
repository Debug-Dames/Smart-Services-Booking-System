import request from "supertest";
import app from "../../src/app.js";

describe("Chatbot API", () => {

  test("should return booking flow for salon service", async () => {
    // Step 1: user starts booking
    let res = await request(app)
      .post("/api/chatbot")
      .send({ message: "Book hair appointment" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBeDefined();
    // Bot asks which service to book
    expect(res.body.response).toMatch(/which service|service would you like/i);

    // Step 2: user confirms service selection
    res = await request(app)
      .post("/api/chatbot")
      .send({ message: "Precision Haircut" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBeDefined();
    // Bot now asks for date
    expect(res.body.response).toMatch(/date|YYYY-MM-DD/i);

    // Step 3: user provides date
    res = await request(app)
      .post("/api/chatbot")
      .send({ message: "2026-03-30" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBeDefined();
    // Bot asks for time
    expect(res.body.response).toMatch(/time|HH:mm/i);

    // Step 4: user provides time
    res = await request(app)
      .post("/api/chatbot")
      .send({ message: "10:00" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBeDefined();
    // Bot confirms booking
    expect(res.body.response).toMatch(/appointment|booked/i);
  });

  test("should return fallback for unknown message", async () => {
    const res = await request(app)
      .post("/api/chatbot")
      .send({ message: "random text 123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBeDefined();
    expect(res.body.response).toMatch(/sorry|help|understand/i);
  });

});
