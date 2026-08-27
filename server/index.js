import express from "express";
import cors from "cors";
import "dotenv/config";
import createOrderRouter from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 3000;

const orders = [
  {
    id: "ORD-1001",
    customer: "The Sourdough Social",
    address: "12 Baker St",
    status: "pending",
    priority: "high",
    lastUpdate: Date.now() - 1000 * 60 * 25,
  },
  {
    id: "ORD-1002",
    customer: "Portsmouth Pier Coffee",
    address: "88 South Quay",
    status: "in_transit",
    priority: "normal",
    lastUpdate: Date.now() - 1000 * 60 * 5,
  },
  {
    id: "ORD-1003",
    customer: "Green Leaf Salads",
    address: "44 Garden Lane",
    status: "delivered",
    priority: "normal",
    lastUpdate: Date.now() - 1000 * 60 * 2,
  },
  {
    id: "ORD-1004",
    customer: "Tech Hub Canteen",
    address: "Level 4, Innovation Square",
    status: "pending",
    priority: "high",
    lastUpdate: Date.now() - 1000 * 60 * 1,
  },
  {
    id: "ORD-1005",
    customer: "Blue Harbour Bistro",
    address: "19 Marine Parade",
    status: "in_transit",
    priority: "high",
  },
  {
    id: "ORD-1006",
    customer: "The Vintage Tea Room",
    address: "7 Old High St",
    status: "pending",
    priority: "normal",
  },
  {
    id: "ORD-1007",
    customer: "Victory Gym Shakes",
    address: "Dockyard Unit 4",
    status: "delivered",
    priority: "low",
  },
  {
    id: "ORD-1008",
    customer: "Sunrise Daycare",
    address: "102 Sunny Side Rd",
    status: "pending",
    priority: "high",
  },
  {
    id: "ORD-1009",
    customer: "Oceanic Library Café",
    address: "Central Library Wing",
    status: "in_transit",
    priority: "normal",
  },
  {
    id: "ORD-1010",
    customer: "Railway Station Kiosk",
    address: "Platform 2, Main Terminus",
    status: "pending",
    priority: "high",
  },
];

app.use(cors());
app.use(express.json());

app.get("/api/orders/", (req, res) => {
  res.status(200).json(orders);
  console.log("good to start");
});

app.use("/api/orders", createOrderRouter(orders));

app.listen(PORT, () => console.log(`The server is running in ${PORT}`));
