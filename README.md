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


