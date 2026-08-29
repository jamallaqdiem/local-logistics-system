import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import orderRoutes from "./routes/orders.routes";
import { startEscalationWorker } from "./services/escalation";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup Socket.io
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

io.on("connection", (socket) => {
  // Join customer to room based on tracking token
  socket.on("join_tracking", (trackingToken: string) => {
    socket.join(trackingToken);
    console.log(`[SOCKET] Client joined tracking room: ${trackingToken}`);
  });

  socket.on("disconnect", () => {
    console.log("[SOCKET] Client disconnected");
  });
});

// Global Middleware
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/orders", orderRoutes);

// Server Listener
app.listen(PORT, () => {
  startEscalationWorker();
  console.log(`The server is running on port ${PORT}`);
});
