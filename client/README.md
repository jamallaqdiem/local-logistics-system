````markdown
# 📦 Local Logistics System — Web Client Portal

A modern, dynamic React frontend built with **Vite**, **TypeScript**, **Tailwind CSS**, **Leaflet Maps**, and **Socket.io-Client**. The client features three distinct user interfaces: a Dispatcher Logistics Command Dashboard, a Driver Operational Portal, and a Customer Real-Time Tracking Page.

---

## 🏗️ Folder Structure Hierarchy

```text
client/
├── public/              # Static assets and icons
├── src/
│   ├── api/             # Encapsulated API Service Layer
│   │   ├── api.orderEscalation.ts # Dedicated priority escalation HTTP methods
│   │   ├── api.orders.ts          # CRUD order HTTP requests
│   │   └── axios.ts               # Base Axios client instance configuration
│   ├── components/      # Modular UI Components
│   │   ├── DriverView.tsx         # Responsive list of active assigned tasks for drivers
│   │   ├── OrderCard.tsx          # Summary order component with quick action handlers
│   │   ├── OrderModal.tsx         # Detailed modal for lifecycle updates & priority toggles
│   │   ├── OrderTimeline.tsx      # Visual step progress tracking indicator
│   │   ├── SearchBar.tsx          # Real-time search filter input
│   │   └── StatusFilter.tsx       # Tab navigation row for order statuses
│   ├── pages/           # Application Route Views
│   │   ├── CustomerTracking.tsx   # Public WebSocket-enabled live map tracking portal
│   │   ├── DispatchPage.tsx       # Dispatcher Command & Control center with live health metrics
│   │   └── DriverPage.tsx         # Simplified mobile-ready task view for drivers
│   ├── types/           # Global TypeScript Interface Definitions
│   │   └── order.ts               # Data types (Order, OrderStatus, OrderPriority, etc.)
│   ├── App.tsx          # React Router route structure and fallbacks
│   ├── index.css        # Tailwind CSS imports and utility overrides
│   └── main.tsx         # Application entry point and DOM root mounting
├── index.html           # HTML template container
├── package.json         # Dependencies, scripts, and dev tools
├── tsconfig.json        # TypeScript compiler options
└── vite.config.ts       # Vite bundler & dev server configuration

⚡ Key Features & Views
🎛️ 1. Dispatcher Command Center (/dispatch)
Real-Time Operational Metrics: Live total order counters, high-priority alert triggers, delivered success rates, and dynamic SLA system health warnings.

Multi-Stage Filtering Pipeline: Search by Customer Name or Order ID, combined with tab filters (All, Pending, In-Transit, Delivered, Cancelled).

SLA Health Monitor: Minute-by-minute recalculation of idle orders (>20 minutes without updates) triggering visual system overload alerts.

🚚 2. Driver Portal (/driver)
Streamlined interface optimized for drivers on shift.

Single-tap status advancement (pending -> in_transit -> delivered).

📍 3. Customer Live Tracker (/track/:trackingToken)
Public, keyless access page protected by unique UUID tokens.

Interactive map using React-Leaflet and OpenStreetMap tiles.

Dynamic state synchronization via Socket.io—updates automatically push map markers and status indicators without page reloads.

🛠️ Setup & Installation

1. Environment Configuration
Create a .env file in the root of client/:
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

2. Install Dependencies
npm install

3. Start Vite Development Server
npm run dev

Access the client UI in your browser at http://localhost:5173.
```
````
