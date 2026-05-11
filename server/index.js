import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

const orders = [
  {
    id: "ORD-7721",
    customer: "The Portsmouth Bakery",
    address: "12 High St, PO1 2LP",
    status: "pending",
    amount: "£34.50",
    priority: "high",
    lastUpdate: 1775925833523,
    time: "10:15 AM",
  },
  {
    id: "ORD-8832",
    customer: "Southsea Florals",
    address: "45 Palmerston Rd, PO5 3QQ",
    status: "in-transit",
    amount: "£12.00",
    priority: "normal",
    lastUpdate: 1775925833523,
    time: "10:15 AM",
  },

  {
    id: "ORD-9910",
    customer: "Gunwharf Gift Shop",
    address: "Unit 12, Gunwharf Quays, PO1 3TZ",
    status: "delivered",
    amount: "£85.00",
    priority: "low",
    lastUpdate: 1775925833523,
    time: "08:30 AM",
  },
];

app.use(cors());
app.use(express.json());

app.get("/api/orders/", (req, res) => {
  res.status(200).json(orders);
  console.log("good to start");
});

app.listen(PORT, () => console.log(`The server is running in ${PORT}`));
