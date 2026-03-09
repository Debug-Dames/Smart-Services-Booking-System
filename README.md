# Smart-Services-Booking-System



A modern booking platform for salons, enabling customers to view services, make appointments, and manage their accounts. Built with React + Vite (frontend), Node/Express (backend), and PostgreSQL (database).

---

## 🌍 Environment Strategy

Development

Runs locally

Uses Docker

Uses local PostgreSQL

Debug logging enabled

Testing (CI)

Runs in GitHub Actions

Uses temporary PostgreSQL service

Runs automated tests

No real data

Production

Backend deployed to Render

Frontend deployed to Vercel

Uses production PostgreSQL

Secrets stored in dashboards

### Branching Model (Gitflow-Based)

This project uses a structured Gitflow branching strategy to ensure proper separation between development and production environments, supporting multiple parallel features.

---

### 🟢 Production Environment

**Branch:** `main`

- Contains stable, production-ready code for the live platform  
- Only fully tested features are merged into this branch  
- Protected branch (no direct commits allowed)  
- Triggers production deployment via CI/CD pipeline  

Represents the live Smart Salon Booking Platform available to customers and staff.

---

### 🟡 Development Environment

**Branch:** `develop`

- Integration branch for completed features  
- All feature branches are merged into `develop`  
- Used for system-wide testing before release  
- Runs automated tests via GitHub Actions  

Represents the staging/development environment.

---

### 🔵 Feature Branches

Feature branches are created from `develop` and merged back after testing:

#### `feature/services`
- Implements salon services listing (haircuts, styling, spa, etc.)  
- Developed independently to avoid conflicts  
- Merged into `develop` via pull request  

#### `feature/booking`
- Implements booking system logic  
- Handles creating, editing, and managing customer bookings  
- Integrated with salon service and staff availability  
- Merged into `develop` after testing  

#### `feature/auth`
- Implements authentication functionality  
- Includes customer and staff login/registration  
- Secured and tested before merging into `develop`  

---
💇‍♀️ Dames  Salon Booking System

A full‑stack web application that allows customers to book salon
services online, manage appointments, and enables administrators to
manage services and bookings.

Built with React, Node.js, Express, Prisma, and PostgreSQL.

------------------------------------------------------------------------

## 📌 Features

### Customer

-   Register and login
-   View available salon services
-   Book appointments
-   View booking history
-   Manage profile

### Admin

-   Manage services
-   View all bookings
-   Manage users
-   Monitor appointments

------------------------------------------------------------------------

## 🏗 Project Structure

    Smart-Services-Booking-System
    │
    ├── frontend
    │   ├── src
    │   ├── public
    │   └── package.json
    │
    ├── backend
    │   ├── src
    │   │   ├── controllers
    │   │   ├── routes
    │   │   ├── middleware
    │   │   └── server.js
    │   ├── prisma
    │   │   └── schema.prisma
    │   └── package.json
    │
    └── README.md

------------------------------------------------------------------------

## ⚙️ Technologies Used

### Frontend

-   React
-   Axios
-   React Router

### Backend

-   Node.js
-   Express.js
-   Prisma ORM

### Database

-   PostgreSQL

### Deployment

-   Vercel
-   GitHub

------------------------------------------------------------------------

## 🖥 Prerequisites

Make sure the following are installed:

-   Node.js (v18 or later)
-   npm
-   PostgreSQL

Check installation:

    node -v
    npm -v

------------------------------------------------------------------------

## 🔧 Environment Variables

Create a `.env` file inside the **backend** folder:

    DATABASE_URL="postgresql://username:password@localhost:5432/salon_db"
    JWT_SECRET="your-secret-key"
    PORT=5000

Create a `.env` file inside the **frontend** folder:

    VITE_API_URL=http://localhost:5000/api

------------------------------------------------------------------------

## 📦 Installation

Clone the repository:

    git clone https://github.com/yourusername/smart-salon-booking-system.git

Navigate to the project folder:

    cd smart-salon-booking-system

------------------------------------------------------------------------

## ▶️ Run Backend

Navigate to backend folder:

    cd backend

Install dependencies:

    npm install

Generate Prisma client:

    npx prisma generate

Run database migration:

    npx prisma migrate dev

Start backend server:

    npm run dev

Backend will run on:

    http://localhost:5000

------------------------------------------------------------------------

## ▶️ Run Frontend

Open a new terminal and go to frontend folder:

    cd frontend

Install dependencies:

    npm install

Run the frontend:

    npm run dev

Frontend will run on:

    http://localhost:5173

------------------------------------------------------------------------

## 🔁 CI/CD

This project supports CI/CD using GitHub and Vercel.

Features include: - Automatic preview deployments - Pull request build
checks - Continuous integration workflows

------------------------------------------------------------------------

## 📡 API Endpoints

### Authentication

    POST /api/auth/register
    POST /api/auth/login

### Bookings

    POST /api/bookings
    GET /api/bookings
    GET /api/bookings/:id

### Services

    GET /api/services
    POST /api/services

------------------------------------------------------------------------




