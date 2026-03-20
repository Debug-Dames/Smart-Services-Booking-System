import request from "supertest";
import app from "../../src/app.js";

describe("Chatbot API", () => {

 test("should return booking response for salon service", async () => {
  const res = await request(app)
    .post("/api/chatbot")
    .send({ message: "Book hair appointment" });

  expect(res.statusCode).toBe(200);
  expect(res.body.response).toBeDefined();
  expect(res.body.response).toMatch(/date|YYYY-MM-DD/i);
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