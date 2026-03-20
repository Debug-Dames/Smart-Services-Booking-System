import request from "supertest";
import app from "../../src/app.js";// adjust path if needed

describe("AI Chatbot Interaction Tests", () => {

  // ✅ Message Processing Test
  test("Should suggest booking when user says 'Book cleaning service'", async () => {
    const response = await request(app)
      .post("/api/chatbot") // adjust endpoint if different
      .send({ message: "Book cleaning service" });

    expect(response.statusCode).toBe(200);
    expect(response.body.response).toBeDefined();
    expect(response.body.response.toLowerCase()).toMatch(/book|schedule|service/);
  });

  // ❌ Error Handling Test (Fallback Response)
  test("Should return fallback response for random text", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "asdhjasdhj123" });

    expect(response.statusCode).toBe(200);
    expect(response.body.response).toBeDefined();
    expect(response.body.response.toLowerCase()).toMatch(/sorry|understand|help/);
  });

  // 🔗 Integration Test (Frontend → Backend)
  test("Should successfully connect to chatbot API", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "Hello" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("response");
  });

});
