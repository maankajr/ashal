# Ashal — Multi-Vendor E-Commerce Marketplace

Ashal is a production-grade multi-vendor e-commerce platform featuring customer storefronts, dedicated vendor hubs, an administrative governance portal, and transactional order splitting.

---

## 🏛 Architecture Overview

Ashal is organized as a decoupled client-server monorepo:

```text
ashal/
├── client/          # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── api/        # Axios API clients
│   │   ├── components/ # Reusable UI components & layouts
│   │   ├── pages/      # Storefront, Vendor Portal, & Admin Portal
│   │   └── store/      # React Context (Auth, Cart, Wishlist)
└── server/          # Backend RESTful API (Express 5 + Mongoose)
    ├── src/
    │   ├── config/     # Database, CORS configuration
    │   ├── controllers/# Request/response orchestration
    │   ├── middleware/ # Auth, RBAC, Rate limiting, Uploads, Validation
    │   ├── models/     # Mongoose Schemas & indexes
    │   ├── routes/     # Express route definitions
    │   ├── services/   # Pure business logic & database transactions
    │   └── utils/      # Emailing, Slugification, Auth cookies, Errors
    └── tests/          # Vitest + Supertest integration test suite
```

### Backend Design Pattern: 3-Tier Layered Architecture
* **Routes (`src/routes/`):** Define HTTP endpoints, map middleware (authentication guards, rate limiting, Multer file upload filters), and route requests to controllers.
* **Controllers (`src/controllers/`):** Extract and validate request parameters/bodies, invoke domain services, and return standardized JSON responses via helper utilities.
* **Services (`src/services/`):** Encapsulate all database mutations, multi-document ACID transactions, business validation, and third-party integrations (Nodemailer, ImageKit).

---

## 🛠 Tech Stack

### Frontend (`client/`)
* **Framework:** React 19 + Vite 8
* **Routing:** React Router 7 (with `React.lazy()` + `Suspense` code-splitting for vendor/admin portals)
* **Styling:** Tailwind CSS + Vanilla CSS utilities
* **State Management:** React Context API (`AuthContext`, `CartContext`, `WishlistContext`)
* **HTTP Client:** Axios with cookie credentials and centralized error parsing

### Backend (`server/`)
* **Runtime:** Node.js (ES Modules, Node 18+)
* **Framework:** Express 5
* **Database & ODM:** MongoDB with Mongoose 9
* **Security & Auth:** `helmet` (HTTP headers), in-memory sliding-window IP rate limiting, JWT authentication with rotated `httpOnly` cookies (`ashal_access` & `ashal_refresh`), `bcryptjs` password hashing
* **File Uploads:** Multer (memory storage) + ImageKit Node SDK
* **Email:** Nodemailer (SMTP transport with safe non-blocking async dispatch)
* **Testing:** Vitest + Supertest

---

## ⚠️ Prerequisites & Database Requirement

* **Node.js:** v18.0.0 or higher
* **MongoDB Replica Set Requirement:**
  > [!IMPORTANT]
  > Ashal uses **MongoDB multi-document ACID transactions** during checkout to atomically decrement product stock, clear customer carts, create parent orders, and split sub-orders per vendor.
  > **MongoDB transactions require a Replica Set.** If you are running a local standalone MongoDB instance without replica set mode enabled, checkout transactions will fail. Use **MongoDB Atlas** (which is a replica set by default) or configure your local MongoDB instance as a single-node replica set (`mongod --replSet rs0`).

---

## ⚙️ Environment Configuration

### 1. Backend Configuration (`server/.env`)
Create `server/.env` based on `server/.env.example`:

```env
NODE_ENV=development
PORT=5000

# MongoDB (Must be a replica set or MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ashal?retryWrites=true&w=majority

# JWT Access Token (Short-lived, stored in httpOnly cookie)
JWT_SECRET=your_jwt_access_secret_key_here
JWT_EXPIRES_IN=15m

# JWT Refresh Token (Long-lived with database hash verification & rotation)
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# ImageKit (For Vendor Product & User Avatar uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Email (Nodemailer SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM="Ashal Marketplace <noreply@ashal.com>"

# URLs & CORS
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. Frontend Configuration (`client/.env`)
Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Running Locally

Run both services in separate terminal windows:

### Terminal 1: Backend API
```powershell
cd server
npm install
npm run dev
```
*API will start on `http://localhost:5000` with hot-reloading.*

### Terminal 2: Frontend Client
```powershell
cd client
npm install
npm run dev
```
*Frontend will launch on `http://localhost:5173`.*

---

## 🌱 Demo Data Seeding & Cleanup

### Seed Demo Marketplace Data
To populate sample categories, verified vendors, products, and admin accounts:
```powershell
cd server
npm run seed:demo
```

**Pre-seeded Demo Accounts:**
* **Admin:** `demo-admin@ashal.com` / `AdminPass123!`
* **Vendor:** `demo-vendor@ashal.com` / `VendorPass123!`
* **Customer:** `demo-customer@ashal.com` / `CustomerPass123!`

### Clean Non-Admin Test Users
```powershell
cd server
node scripts/clear-non-admin-users.js
```

---

## 🧪 Testing Suite

Ashal includes integration tests using **Vitest** and **Supertest**:

```powershell
cd server
npm test
```

### Test Coverage Focus Areas:
1. **Checkout ACID Transactions:** Multi-vendor cart checkout, automatic store sub-order splitting, stock decrements, and atomic database rollbacks on insufficient stock.
2. **Auth Lifecycle:** Registration, login, access/refresh cookie issuance, refresh rotation, logout cookie clearing, and token revocation.
3. **Vendor Cross-Tenant Isolation:** Enforces that vendors can only read/mutate their own store's catalog and orders, returning `403 Forbidden` / `404 Not Found` for unauthorized cross-store access.
4. **Verified Buyer Review Eligibility:** Ensures only authenticated customers with a completed/delivered sub-order for a specific product can submit reviews and prevents duplicate reviews.

---

## 👥 Roles & Capabilities

| Capability | Customer | Vendor | Admin |
| :--- | :---: | :---: | :---: |
| Browse Public Catalog & Stores | ✅ | ✅ | ✅ |
| Manage Personal Cart & Wishlist | ✅ | ❌ | ❌ |
| Place Orders & Track Status | ✅ | ❌ | ❌ |
| Review Products (Verified Buyers) | ✅ | ❌ | ❌ |
| Manage Store Profile & Branding | ❌ | ✅ | ❌ |
| Manage Inventory & Products | ❌ | ✅ (Own store) | ✅ (All) |
| Manage Sub-Orders & Fulfillment | ❌ | ✅ (Own store) | ✅ (All) |
| Manage Marketplace Categories / Taxonomy | ❌ | ❌ | ✅ |
| Approve / Suspend Stores & Users | ❌ | ❌ | ✅ |
| Resolve Contact Inquiries | ❌ | ❌ | ✅ |

---

## 📌 Known Limitations & Roadmap

* **Payment Gateway:** Currently operates using a Cash on Delivery (COD) workflow. Direct credit card processing (Stripe / PayPal) is planned for future iterations.
* **Password Reset:** Self-service email reset tokens are not yet wired; password changes require authenticated session on `/profile` or administrator script execution.
* **Rate Limiting:** Built-in rate limiter is in-memory per Node process. For horizontal multi-node scaling, Redis-backed rate limiting (`ioredis`) is recommended.
* **Email Delivery:** If SMTP credentials are not supplied, emails are logged in development mode without interrupting request workflows.
