# 🚚 Local Logistics System — Server API & Worker Engine

A high-performance backend microservice built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **Socket.io**. It powers real-time order tracking, dynamic SLA priority escalation, transaction SMS dispatches via Twilio, and real-time bidirection web-socket channels.

---

## 🏗️ Folder Structure Hierarchy

```text
server/
├── data/
│   ├── connection.ts    # PostgreSQL pg.Pool connection lifecycle management
│   ├── dataType.ts      # TypeScript interfaces for DB schemas & query results
│   └── schema.sql       # DDL table creation scripts & initial seeds
├── routes/
│   └── orders.routes.ts # REST API routing definitions & controllers
├── services/
│   ├── escalation.ts   # Cron-like auto-escalation worker engine (SLA management)
│   └── notification.ts # Twilio SMS integration with safe local dev fallback
├── .env.example         # Template for required environment variables
├── app.ts               # HTTP server setup, Socket.io rooms, & startup orchestration
├── docker-compose.yml   # Containerized PostgreSQL database service definition
├── package.json         # Node dependencies & scripts
├── swagger.ts           # OpenAPI / Swagger specification configuration
└── tsconfig.json        # TypeScript compiler rules

⚡ Key Architecture & Features
Real-Time WebSockets (Socket.io):

Isolated tracking rooms (socket.join(trackingToken)).

Real-time push updates broadcast to active customer tracking portals on state changes.

Auto-Escalation Worker (services/escalation.ts):

Polling background worker (setInterval every 3 minutes).

Executes atomic UPDATE queries on stale 'pending' orders idle for 30+ minutes, elevating priority to 'high'.

Transactional SMS Service (services/notification.ts):

Twilio SDK integration for instant live delivery URL transmission.

Native fallback logging mode in dev environments when API credentials are omitted.

OpenAPI / Swagger Documentation:

Live interactive endpoint documentation served at /api-docs.

Database Layer:

Managed connection pool using pg driver connecting to a containerized PostgreSQL instance.

🛠️ Environment Variables Configuration
Create a .env file inside the server/ directory:
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=logistics_db

# Twilio SMS API Configuration (Optional for Dev Mode)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

🚀 Getting Started1.
1. Launch PostgreSQL with
 DockerBashdocker-compose up -d

2. Install Dependencies
npm install

3. Initialize Database Schema
psql -h localhost -U postgres -d logistics_db -f src/data/schema.sql

4. Start Development Serve
npm run dev

API Base Endpoint: http://localhost:3000/api/orders
Swagger API Docs: http://localhost:3000/api-docs
WebSocket Server: ws://localhost:3000
```
