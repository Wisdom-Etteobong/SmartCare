<div align="center">

# SmartCare

**A digital healthcare appointment management platform**

Find doctors, check real-time availability, and book appointments — all in one place.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://smartcare-app.up.railway.app/)
[![Node.js](https://img.shields.io/badge/Node.js-required-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-required-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Full--stack-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)

[Live Demo](https://smartcare-app.up.railway.app/) · [Features](#-key-features) · [Getting Started](#-getting-started) · [Tech Stack](#-tech-stack)

</div>

---

## Overview

SmartCare is a digital healthcare appointment management platform designed to make it easier for patients to find suitable doctors, check availability, and schedule appointments in advance. It implements **Role-Based Access Control (RBAC)** for guests, patients, doctors, and administrators, ensuring that each user has access to the appropriate features.

Doctors can manage their schedules and appointments, set convenient availability, and transfer or cancel appointments while providing reasons. SmartCare also provides timely notifications to keep users informed about bookings, changes, cancellations, and other important activities.

## Problems Solved

| Problem | SmartCare's Solution |
|---|---|
| Difficulty finding doctors and checking availability | Searchable doctor directory with real-time slots |
| Manual booking via calls or in-person visits | Self-service online booking flow |
| No real-time visibility into open slots | Dynamic slot generation engine |
| Doctors struggle to manage schedules | Dedicated doctor portal for availability & appointments |
| Poor communication on transfers/cancellations | Audit-tracked transfer workflow with reasons |
| Missed updates on appointment changes | In-app toast & notification system |
| Inadequate access control | JWT-based RBAC for guests, patients, doctors, admins |
| Admins can't easily manage users/activity | Centralized admin portal with analytics |
| Poor record organization and tracking | Structured clinical records & audit logs |

## Key Features

### 👤 Patients
- Protected and public routes based on authentication status
- Role-based access to authorized resources only
- New patient account registration
- Search doctors and view live availability
- Book, reschedule, and cancel appointments
- Receive real-time appointment notifications

### 👨‍⚕️ Doctors
- Dedicated doctor portal after authentication
- Manage appointments, availability, working hours, and breaks
- View and manage patient queues
- Record clinical notes, diagnoses, vitals, and prescriptions
- Transfer appointments to other available doctors
- Receive notifications for appointment updates

### 🛡️ Administrators
- Dedicated admin portal with elevated privileges
- Add and manage doctors (doctors cannot self-register)
- Manage patient, doctor, and admin accounts
- Manage doctor specialties, qualifications, rooms, and fees
- Monitor and manage appointments hospital-wide
- View hospital statistics and activity records

## Tech Stack

SmartCare is a full-stack, single-repository (monorepo) TypeScript application.

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router v6, Tailwind CSS, Lucide React icons |
| **Backend** | Express.js, Node.js, TypeScript (MVC architecture) |
| **Database** | MongoDB with Mongoose |
| **Shared Layer** | Shared TypeScript types package for roles, profiles, availability, appointments, and DTOs |

## Architecture Highlights

<details>
<summary><strong>Authentication, Authorization & Security</strong></summary>
<br>

- **JWT & RBAC** — token-based authentication for three roles (patient, doctor, admin), enforced via Express middleware at the route level
- **Healthcare Storage & PII Protection** — auth tokens live in `sessionStorage`; personal medical data stays in memory (never `localStorage`) to avoid lingering data on shared clinic devices
- **Two-Factor Authentication (2FA)** — OTP verification flow for doctor/admin accounts using short-lived temporary tokens *(in progress)*
- **Mandatory First-Login Password Change** — `mustChangePassword` flag forces staff to update credentials before accessing dashboards

</details>

<details>
<summary><strong>Doctor Availability & Real-Time Scheduling Engine</strong></summary>
<br>

- **Availability Modeling** — weekly schedule objects define working days, duty hours (e.g., 09:00–17:00), slot durations (e.g., 30 min), and breaks
- **Dynamic Slot Generation:**
  1. Calculate all theoretical slots within the doctor's shift window
  2. Filter out designated break intervals
  3. Cross-check existing bookings to flag taken slots
  4. Compare against current local time to disable past same-day slots
- **Unique Queue Tokens** — sequential identifiers (e.g., `#Q-101`) generated on booking for reception check-in

</details>

<details>
<summary><strong>🩺 Doctor Clinical Workstation</strong></summary>
<br>

- **Live Patient Queue Feed** — tabbed into *Today*, *Upcoming*, *Completed*, and *Transferred*
- **Clinical Records Management** — diagnostic notes, vitals (BP, pulse, temperature, weight), and itemized prescriptions
- **Patient Transfer Mechanism** — inter-doctor transfers with reasons and full audit trail

</details>

<details>
<summary><strong>Hospital Administrative Governance</strong></summary>
<br>

- **Executive Metrics & Analytics** — booking volume, confirmed/completed rates, department workload, revenue in ₦
- **Doctor Roster CRUD** — onboard doctors, adjust fees (min. ₦10,000), update qualifications, toggle active status
- **User & Appointment Audit Controls** — manage accounts, trigger password resets, review bookings and transfer logs

</details>

<details>
<summary><strong>UI & Experience Design</strong></summary>
<br>

- **High-Contrast, Accessible Theme** — medical-grade palette (teal, slate, emerald, amber), responsive across mobile/tablet/desktop
- **Localized Currency** — Nigerian Naira (₦) formatting across bookings, profiles, fees, and admin forms
- **In-App Toast & Notifications** — instant feedback for bookings, transfers, status changes, and clinical updates

</details>

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Wisdom-Etteobong/SmartCare.git
cd SmartCare

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open **[localhost:3000](http://localhost:3000)** in your browser.

### Remote Deployment

1. Clone the repository locally
2. Set up MongoDB and obtain the connection string
3. Create a [Railway](https://railway.app/) account using GitHub
4. Push the project to GitHub and connect the repo to Railway
5. Configure the required environment variables in Railway
6. Deploy the application and monitor the deployment logs
7. Access the app via the Railway-generated URL

## 🔗 Links & Demo Accounts

**Live app:** [smartcare-app.up.railway.app](https://smartcare-app.up.railway.app/)

> **Note:** These are demo credentials for evaluation purposes. Rotate or remove them before any production use.

| Role | Email | Password |
|---|---|---|
| 👤 Patient | *Create your own account* | — |
| 👨‍⚕️ Doctor | `robert.taylor@smartcare.org` | `Doctor2026!` |
| 🛡️ Admin | `admin@smartcare.org` | `Admin2026!` |

---

<div align="center">

Made with care for better healthcare access 💙

</div>
