# Smart Salon Booking System — Backend

A backend API for managing salon services, bookings, and users.  
Built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**, with a focus on reliability and automated tests.

---

## 📑 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features
- User authentication & authorization
- Manage salon services (CRUD)
- Bookings with unique slot constraints
- Prevent duplicate bookings for the same user/service/time
- Automated unit, integration, and Prisma validation tests

---

## 🛠 Tech Stack
- **Node.js & Express**
- **Prisma ORM**
- **PostgreSQL**
- **Jest & Supertest** for testing
- **dotenv** for environment management

---

## 🚀 Getting Started

Clone the repository:
```bash
git clone <repo-url>
cd smart-salon-backend


Install dependencies:
npm install


Set up environment variables:
cp .env.example .env


Update .env with your database credentials.

🔑 Environment Variables
- DATABASE_URL — PostgreSQL connection string
- PORT — Backend port (default: 5000)
- JWT_SECRET — Secret key for JWT authentication

🗄 Database Setup
1️⃣ Generate Prisma client
npx prisma generate


2️⃣ Apply migrations (first setup or schema drift):
npx prisma migrate reset


This will:
- Drop existing tables
- Recreate schema based on migrations
- Seed database if prisma/seed.js or seed.ts exists
3️⃣ Verify database schema:
\d "Booking"


Expected columns: id, date, status, userId, serviceId, createdAt, startTime, endTime
Unique constraint:
@@unique([userId, serviceId, date, startTime])



🖥 Running the Server
npm run dev


You should see:
✅ Database connected successfully
🚀 Backend running on http://localhost:5000



🧪 Running Tests
npm test


Runs unit tests, integration tests, and Prisma validations.
If tests fail due to schema drift, reset database:
npx prisma migrate reset



📡 API Endpoints
Example endpoints (extend as needed):
- POST /api/auth/register — Create a new user
- POST /api/auth/login — Authenticate user
- GET /api/services — List all services
- POST /api/bookings — Create a booking
- GET /api/bookings — List all bookings

🛠 Troubleshooting
- Column does not exist → Run npx prisma migrate reset to sync database.
- Database connection fails → Check DATABASE_URL and ensure PostgreSQL server is running.
- Duplicate booking test fails → Ensure Booking table has unique constraint on (userId, serviceId, date, startTime).
