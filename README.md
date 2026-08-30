# 🚚 Local Logistics System

A real-time logistics management platform designed to track order lifecycles, automate SLA priority escalations, and provide live customer delivery tracking via interactive maps and WebSockets.

---

## 🏗️ Project Structure & Documentation

- [`client/`](./client/README.md) — React + TypeScript + Vite + Tailwind CSS frontend
- [`server/`](./server/README.md) — Node.js + Express + TypeScript + PostgreSQL + Socket.io backend
- [Project Structure Guide](./STRUCTURE.md) — Detailed breakdown of directories, files, and architectural decisions

---

## ⚡ Key Features

- **Dispatcher Command Center (`/dispatch`)**: Real-time operational metrics, search and status filtering, SLA health overload alerts, and dynamic priority management.
- **Driver Operational Portal (`/driver`)**: Streamlined task list for drivers to advance delivery lifecycle states (`pending` $\rightarrow$ `in_transit` $\rightarrow$ `delivered`).
- **Customer Live Tracking (`/track/:trackingToken`)**: Keyless real-time tracking page featuring dynamic state sync via **Socket.io** and interactive map integration with **React-Leaflet**.
- **Automated SLA Escalation Worker**: Polling background service that auto-escalates stale orders (`pending` for >30 mins) to `high` priority.
- **OpenAPI / Swagger Documentation**: Interactive API testing playground hosted live at `/api-docs`.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, React-Leaflet, Socket.io-Client
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (`pg`), Socket.io, Twilio SMS API, Swagger / OpenAPI
- **Database & Infrastructure:** PostgreSQL, Docker Compose

---

## 🚀 Quick Start (Local Setup)

### 1. Database Setup

```bash
# Start PostgreSQL container
docker-compose up -d
```
