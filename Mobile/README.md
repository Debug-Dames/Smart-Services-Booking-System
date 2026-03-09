# 💇‍♀️ Dames Salon — Mobile App

> A luxury beauty booking experience built with React Native & Expo.

---

## Overview

Dames Salon is a mobile application that allows clients to discover services, book appointments, manage their upcoming and past bookings, and enjoy a seamless luxury salon experience — all from their phone.

The app is built with **React Native (Expo)** and uses a custom design system centered around a navy-blue and platinum color palette.

---

## Screens

### Onboarding
| Screen | File | Description |
|--------|------|-------------|
| Splash | `src/screens/SplashScreen.tsx` | Animated brand intro that auto-navigates to Login after a short sequence |
| Login | `src/screens/auth/LoginScreen.tsx` | Email & password sign-in with social login options |
| Sign Up | `src/screens/auth/SignupScreen.tsx` | Account creation with live inline validation and password strength meter |

### Main App
| Screen | File | Description |
|--------|------|-------------|
| Home | `src/screens/home/HomeScreen.tsx` | Dashboard showing next appointment, service quick-book, special offers, and upcoming bookings |
| Booking | `src/screens/booking/BookingScreen.tsx` | 3-step multi-step booking flow (Service → Date & Time → Confirm) |
| Booking Success | `src/screens/booking/BookingSuccessScreen.tsx` | Animated confirmation screen shown after a booking is placed |
| My Bookings | `src/screens/bookings/MyBookingsScreen.tsx` | Full booking history with filter tabs (Upcoming / Completed / Cancelled) |

---

## Project Structure

```
src/
├── contants/
│   └── colors.ts               # Global color tokens (light & dark themes)
├── screens/
│   ├── SplashScreen.tsx
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── booking/
│   │   ├── BookingScreen.tsx
│   │   └── BookingSuccessScreen.tsx
│   └── bookings/
│       └── MyBookingsScreen.tsx
```

---

## Navigation Flow

```
SplashScreen
     │
     └──▶ LoginScreen ◀──────────────────┐
               │                         │
               ▼                         │
          SignupScreen ──────────────────┘
               │
               ▼
          HomeScreen
          ┌────┴──────────────────┐
          ▼                       ▼
     BookingScreen          MyBookingsScreen
          │
          ▼
   BookingSuccessScreen
     ┌────┴────────────┐
     ▼                 ▼
MyBookingsScreen    HomeScreen
```

Navigation uses `navigation.replace` for the splash-to-login transition (so the user can't back-navigate to the splash), and `navigation.navigate` between all other screens. The `BookingScreen` passes the full booking object to `BookingSuccessScreen` via `route.params`.

---

## Design System

### Colors (`src/contants/colors.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#1952A6` | Buttons, active states, links |
| `primaryHover` | `#143F82` | Button press states |
| `navyDark` | `#22274C` | Hero backgrounds, dark panels |
| `lavenderLight` | `#BDC2DB` | Borders, inactive indicators |
| `platinum` | `#D4CACE` | Subtle dividers |
| `mutedText` | `#6B6F8E` | Secondary labels, placeholders |
| `background` | `#F5F6FA` | Screen backgrounds |
| `card` | `#FFFFFF` | Card surfaces |
| `textPrimary` | `#22274C` | Headings and body text |
| `textSecondary` | `#6B6F8E` | Supporting text |

Both `Colors.light` and `Colors.dark` variants are defined. All screens currently use `Colors.light`.

### Animations

All screens use a shared `FadeIn` wrapper component that combines `opacity` and `translateY` animations with configurable `delay` props for staggered entrances. No third-party animation libraries are required — everything uses React Native's built-in `Animated` API.

---

## Key Features

### Splash Screen
- 5-stage sequential animation: monogram → logo → divider line draw → tagline → loading dots
- Fades out before navigating, avoiding a hard cut
- Auto-navigates to Login after the sequence completes

### Login
- Floating label inputs that animate the placeholder up when focused
- Password show/hide toggle
- "Forgot password?" link
- Google and Facebook social login buttons
- Staggered section entrance animations

### Sign Up
- All floating label fields with live validation on blur
- Colour-coded error messages beneath invalid fields
- Password strength bar (Weak / Fair / Good / Strong) based on length, uppercase, numbers, and symbols
- Terms & Privacy checkbox — the Create Account button stays disabled until all fields are valid and the box is checked

### Home
- Personalized greeting and next appointment hero card
- Horizontally scrollable service pill quick-selectors
- Horizontally scrollable special offer cards
- Upcoming appointments list with stylist and time info

### Booking (3-Step Flow)
- **Step 1 — Service:** 2-column grid of service cards with emoji, name, duration, and price. Selected card turns navy
- **Step 2 — Date & Time:** Horizontally scrollable stylist avatars with colored initials, 14-day scrollable week strip date picker, and a time slot grid marking unavailable slots
- **Step 3 — Confirm:** Summary card with full booking details, price breakdown, and a Confirm Booking CTA
- Animated progress bar and step indicator across all steps
- Next button is disabled until required selections are made on each step

### Booking Success
- 3-stage animated checkmark ring (outer ring → inner circle → checkmark)
- Full booking summary card with CONFIRMED badge
- Navigates to My Bookings or back to Home

### My Bookings
- Filter tabs: Upcoming, Completed, Cancelled — with live counts
- Each card shows service, stylist, date, time, duration, and price
- Color-coded status badge and left accent bar per booking
- Upcoming bookings have Cancel (with confirmation alert) and Reschedule actions
- Completed bookings have a Book Again button
- Empty state with a Book a Service CTA when a tab has no results

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or the Expo Go app on a physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dames-salon.git
cd dames-salon

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on a Device
- **iOS Simulator:** Press `i` in the Expo CLI terminal
- **Android Emulator:** Press `a` in the Expo CLI terminal
- **Physical device:** Scan the QR code with the Expo Go app

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `react-native` | Core mobile framework |
| `expo` | Development toolchain and native modules |
| `@react-navigation/native` | Screen navigation |
| `@react-navigation/stack` | Stack navigator for screen transitions |
| `@expo/vector-icons` | Icon library (Ionicons) |

---

## Roadmap / Future Screens

- [ ] Profile & account settings screen
- [ ] Notifications screen
- [ ] Stylist detail/bio screen
- [ ] Payment & checkout screen
- [ ] Reviews & ratings
- [ ] Dark mode support (tokens already defined in `Colors.dark`)

---

## Notes

- The `src/contants/colors.ts` file has a typo in the folder name (`contants` instead of `constants`) — this is intentional to match the existing import paths throughout the project. If you rename the folder, update all import references.
- All booking data is currently mocked locally. Connect to your backend API by replacing the static arrays in `BookingScreen.tsx` and `MyBookingsScreen.tsx` with API calls.