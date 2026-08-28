import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import orderRoutes from "./routes/orders.routes";
import { startEscalationWorker } from "./services/escalation";

const app = express();
const PORT = process.env.PORT || 3000;

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
