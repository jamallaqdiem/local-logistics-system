# 🏗️ Local Logistics System — Project Structure & Architecture

This guide explains the architecture, directory tree, and file organization for the **Local Logistics System** monorepo. The application is divided into two main microservices: the **Client** (React frontend) and the **Server** (Node.js/Express backend).

---

## 🏢 1. The Client (`/client`)

The frontend is a single-page React application powered by **Vite**, **TypeScript**, **Tailwind CSS**, **Leaflet Maps**, and **Socket.io-Client**.

### **`src/api/`**

Contains encapsulated HTTP request functions using **Axios**.

- `axios.ts`: Configures the base Axios client instance with central `baseURL` configuration.
- `api.orders.ts`: CRUD functions for fetching, updating, advancing, and cancelling orders.
- `api.orderEscalation.ts`: API helper for manually triggering or testing priority escalations.

### **`src/components/`**

Reusable UI components that compose the views.

- `DriverView.tsx`: Active delivery task list optimized for drivers on shift.
- `OrderCard.tsx`: Order summary card with real-time operational details and quick-action buttons.
- `OrderModal.tsx`: Comprehensive overlay modal for dispatchers to update status, alter priority, or manage order cancellations.
- `OrderTimeline.tsx`: Visual multi-step progress indicator tracking order lifecycle stages.
- `SearchBar.tsx`: Controlled text search input filtering by customer name or order ID.
- `StatusFilter.tsx`: Dynamic tab selection bar filtering orders by state (`All`, `Pending`, `In-Transit`, `Delivered`, `Cancelled`).

### **`src/pages/`**

Top-level application views mounted by React Router.

- `DispatchPage.tsx`: Central Command & Control Center providing dispatcher metrics, SLA health status, real-time filtering, and order management.
- `DriverPage.tsx`: Streamlined, mobile-friendly shift portal for drivers to update order delivery statuses on the go.
- `CustomerTracking.tsx`: Publicly accessible customer tracking view featuring live updates via Socket.io and interactive map markers via React-Leaflet.

### **`src/types/`**

- `order.ts`: Central TypeScript definitions (`Order`, `OrderStatus`, `OrderPriority`, etc.) shared across frontend components.

### **Root Client Files**

- `App.tsx`: Sets up client-side routing (`/dispatch`, `/driver`, `/track/:trackingToken`).
- `main.tsx`: React DOM root mounting script.
- `index.css`: Global styles and Tailwind CSS imports.
- `vite.config.ts`: Vite build tool configuration.

---

## ⚙️ 2. The Server (`/server`)

The backend microservice handles data persistence in **PostgreSQL**, real-time WebSocket communication via **Socket.io**, background worker processes, and transactional SMS notifications via **Twilio**.

### **`src/data/`**

Database layer managing connection pooling and schema definitions.

- `connection.ts`: Manages PostgreSQL connection pools using the `pg` library.
- `dataType.ts`: Server-side TypeScript interfaces mapping database queries and table models.
- `schema.sql`: PostgreSQL database DDL initialization script containing table schemas and initial seed data.

### **`src/routes/`**

REST API route controllers.

- `orders.routes.ts`: Defines endpoint paths and request handlers (`GET /api/orders`, `PATCH /api/orders/:id`, `GET /api/orders/track/:trackingToken`).

### **`src/services/`**

Background engines and third-party API integrations.

- `escalation.ts`: Polling background worker (`setInterval`) running atomic database updates every 3 minutes to auto-escalate idle orders (>30 minutes in `'pending'`) to `'high'` priority.
- `notification.ts`: Twilio API integration dispatching tracking links to customer phone numbers (includes fallback console logging for dev mode).

### **Root Server Files**

- `server.ts` / `app.ts`: Core application entry point. Configures Express middleware, initializes HTTP & Socket.io server instances, handles rooms (`join_tracking`), and launches the escalation worker.
- `swagger.ts`: Generates live OpenAPI documentation served at `/api-docs`.
- `docker-compose.yml`: Container configuration for running local PostgreSQL database instances.

---

## 📦 3. Global Configuration & Environment Rules

- `.env`: Holds local environment variables (port numbers, DB credentials, Twilio API keys). **Never commit to Git.**
- `.env.example`: Safe template showing required environment keys for new setups.
- `tsconfig.json`: TypeScript compiler rules ensuring uniform strict typing rules across the codebase.
- `.gitignore`: Excludes heavy assets, secret keys, build output folders (`dist`), and `node_modules` from Git tracking.
