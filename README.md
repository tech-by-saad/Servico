<div align="center">

# ⚡ Servico
### *Connecting Service Seekers with Verified Local Professionals*

![NodeJS](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Executive Overview

**Servico** is a full-stack, dual-sided service marketplace engineered to bridge the gap between clients and local service providers. Built using the **MERN** stack (MongoDB, Express, React, Node.js) with **Vite**, the platform provides dynamic service discovery, real-time client-provider messaging, automated booking state management, user reviews, and comprehensive administrative oversight.

---

## 📸 Platform Preview

> *Add high-resolution screenshots or demo GIFs below to display the live UI to evaluators.*

| Customer Dashboard | Service Provider Portal | Real-Time Chat System |
|---|---|---|
| `![Dashboard Banner](https://via.placeholder.com/400x250?text=Customer+Dashboard)` | `![Provider Portal](https://via.placeholder.com/400x250?text=Provider+Portal)` | `![Messaging System](https://via.placeholder.com/400x250?text=Chat+Interface)` |

---

## ✨ Core System Modules & Features

### 👤 1. Authentication & Multi-Role Authorization
* **JWT Access Security:** Encrypted session management using `authMiddleware.js` and `bcrypt` password hashing.
* **Role-Based Views:** Tailored dashboards for **Clients**, **Service Providers**, and **System Administrators**.
* **Password Recovery:** Secure token-based password reset handled by `passwordController.js`.

### 🛠️ 2. Service Catalog & Provider Profiles
* **Dynamic Listings:** Service creation, category tagging, pricing setup, and image uploads managed via `uploadMiddleware.js`.
* **Provider Portfolios:** Verified profile pages (`ProviderProfile.js`) showcasing services, ratings, and bios.

### 📅 3. End-to-End Booking Lifecycle Engine
* **State Machine Logic:** Real-time updates tracking bookings through 5 explicit states: `Pending` ➔ `Accepted` ➔ `In-Progress` ➔ `Completed` ➔ `Cancelled`.
* **Interactive Notifications:** Instant alerts triggered by `notificationController.js` upon booking updates.

### 💬 4. In-App Communication & Feedback
* **Messaging Subsystem:** Direct client-to-provider messaging (`Chat.js`, `Message.js`, `chatController.js`).
* **Audited Reviews:** Post-service rating and feedback loop (`Review.js`) calculating aggregate scores for provider profiles.

### 🛡️ 5. Administrative Control Suite
* **Platform Management:** Centralized dashboard (`adminController.js`) to verify provider credentials, inspect bookings, and moderate reviews.

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React (Vite), JavaScript (ES6+) |
| **State & Navigation** | Context API (`/context`), Custom React Hooks (`/hooks`), React Router |
| **Styling & Assets** | Modern CSS3, App-level styling modules |
| **Backend Runtime** | Node.js, Express.js REST API |
| **Database & ORM** | MongoDB Atlas, Mongoose Schema ODM |
| **Security & Middleware** | JSON Web Tokens (JWT), Bcrypt, Multer (`uploadMiddleware.js`) |

---

## 📂 Repository Directory Structure

```text
Servico/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets & favicon
│   └── src/
│       ├── api/                 # Axios / API request wrappers
│       ├── components/          # Reusable UI components (Navbar, Modals, Cards)
│       ├── config/              # Application environment & route constants
│       ├── context/             # React Context Providers (Auth, Notifications)
│       ├── hooks/               # Custom utility hooks
│       ├── pages/               # Views (Home, Services, Booking, Chat, Admin)
│       ├── App.css              # Main application styling
│       ├── App.jsx              # Root layout & route switcher
│       ├── index.css            # Base stylesheet
│       └── main.jsx             # Virtual DOM entry point
│   ├── eslint.config.js         # Linting configuration
│   ├── index.html               # Single-page HTML template
│   └── package.json
│
└── server/                      # Backend REST API Server (Node.js + Express)
    ├── config/
    │   └── db.js                # MongoDB Mongoose connection client
    ├── controllers/             # Business logic execution layer
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── bookingController.js
    │   ├── chatController.js
    │   ├── notificationController.js
    │   ├── passwordController.js
    │   ├── providerController.js
    │   ├── reviewController.js
    │   ├── serviceController.js
    │   └── userController.js
    ├── middlewares/             # Custom Express middlewares
    │   ├── authMiddleware.js    # JWT authorization validator
    │   └── uploadMiddleware.js  # File upload / storage handling
    ├── models/                  # Mongoose data structures
    │   ├── Booking.js
    │   ├── Chat.js
    │   ├── Message.js
    │   ├── Notification.js
    │   ├── ProviderProfile.js
    │   ├── Review.js
    │   ├── Service.js
    │   └── User.js
    ├── routes/                  # Express RESTful API endpoints
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── bookingRoutes.js
    │   ├── chatRoutes.js
    │   ├── notificationRoutes.js
    │   ├── passwordRoutes.js
    │   ├── providerRoutes.js
    │   ├── reviewRoutes.js
    │   ├── serviceRoutes.js
    │   └── userRoutes.js
    ├── uploads/                 # Static media file directory
    └── utils/                   # Shared backend utility functions
