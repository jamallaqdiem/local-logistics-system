import { Router } from "express";
import { getOrders } from "../controllers/orders/getOrder.controller";
import { getOrderById } from "../controllers/orders/getOrderById.controller";
import { updateOrder } from "../controllers/orders/updateOrder.controller";
import { trackOrder } from "../controllers/orders/trackOrder.controller";
import { createOrder } from "../controllers/orders/createOrder.controllers";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "ORD-1004"
 *         customer:
 *           type: string
 *           example: "James Wilson"
 *         phone:
 *           type: string
 *           example: "+447700900001"
 *         address:
 *           type: string
 *           example: "105 Fawcett Road, Southsea, PO4 0DB"
 *         customerId:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         status:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *           example: "in_transit"
 *         priority:
 *           type: string
 *           enum: [normal, high]
 *           example: "high"
 *         isCancelled:
 *           type: boolean
 *           example: false
 *         lastUpdate:
 *           type: integer
 *           example: 1724888000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-28T23:44:00.000Z"
 *     CreateOrderInput:
 *       type: object
 *       required: [customer, phone, address]
 *       properties:
 *         customer:
 *           type: string
 *           example: "Havant Auto Repairs"
 *         phone:
 *           type: string
 *           example: "+447700900111"
 *         address:
 *           type: string
 *           example: "Unit 4, Park Road Ind Est, PO9 1SA"
 *         customerId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         priority:
 *           type: string
 *           enum: [normal, high]
 *           example: "normal"
 *     UpdateOrderInput:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *         priority:
 *           type: string
 *           enum: [normal, high]
 *         isCancelled:
 *           type: boolean
 *         lastUpdate:
 *           type: integer
 *         phone:
 *           type: string
 *           example: "+447700900001"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Order not found"
 */

// Routes mapped to individual controllers
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id", updateOrder);
router.get("/track/:token", trackOrder);
router.post("/", createOrder);

export default router;
