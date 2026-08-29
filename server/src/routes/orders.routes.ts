import { Router } from "express";
import type { Request, Response } from "express";
import { pool } from "../data/connection";
import { Order, UpdateOrderInput } from "../data/dataType";
import { sendTrackingSMS } from "../services/notifications";
import { io } from "../app";

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

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// GET /api/orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer,
        phone,
        address, 
        status, 
        priority, 
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at AS "createdAt"
       FROM orders 
       ORDER BY created_at DESC`,
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders from database" });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order ID
 *         example: "ORD-1004"
 *     responses:
 *       200:
 *         description: Order details object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer,
        phone, 
        address, 
        status, 
        priority, 
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at AS "createdAt" 
       FROM orders 
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update order status, priority, or phone number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "ORD-1004"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderInput'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: No valid fields provided for update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// PATCH /api/orders/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: UpdateOrderInput = req.body;

  try {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${queryIndex++}`);
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${queryIndex++}`);
      values.push(updates.priority);
    }
    if (updates.isCancelled !== undefined) {
      fields.push(`is_cancelled = $${queryIndex++}`);
      values.push(updates.isCancelled);
    }
    if (updates.lastUpdate !== undefined) {
      fields.push(`last_update = $${queryIndex++}`);
      values.push(updates.lastUpdate);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${queryIndex++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    values.push(id);
    const queryText = `
      UPDATE orders 
      SET ${fields.join(", ")} 
      WHERE id = $${queryIndex} 
      RETURNING 
        id, 
        customer, 
        phone,
        address, 
        status, 
        priority, 
        tracking_token AS "trackingToken",
        estimated_delivery_time AS "estimatedDeliveryTime",
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate"
    `;

    const result = await pool.query<Order>(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = result.rows[0];

    // Trigger SMS notification if status moves to in_transit
    if (updates.status === "in_transit" && updatedOrder.phone) {
      sendTrackingSMS(
        updatedOrder.phone,
        updatedOrder.trackingToken,
        updatedOrder.customer,
      );
    }

    // Broadcast live update to listening clients via WebSockets
    if (io) {
      io.to(updatedOrder.trackingToken).emit("order_updated", updatedOrder);
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

/**
 * @swagger
 * /orders/track/{token}:
 *   get:
 *     summary: Get public order details by secure tracking token
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: "6fe62b1082f1fcf11bd6c50"
 *     responses:
 *       200:
 *         description: Order details for customer tracking
 *       404:
 *         description: Invalid tracking token
 */
router.get("/track/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer, 
        address, 
        status, 
        priority, 
        tracking_token AS "trackingToken",
        estimated_delivery_time AS "estimatedDeliveryTime",
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at AS "createdAt"
       FROM orders 
       WHERE tracking_token = $1`,
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid tracking token" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching order by tracking token:", error);
    res.status(500).json({ error: "Failed to fetch tracking information" });
  }
});

export default router;
