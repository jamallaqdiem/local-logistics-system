// server/src/controllers/orders/getOrderById.controller.ts
import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Order } from "../../data/dataType";

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
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer,
        phone, 
        address, 
        pickup_address AS "pickupAddress",
        pickup_phone AS "pickupPhone",
        price::float AS "price",
        status, 
        priority, 
        tracking_token AS "trackingToken",
        estimated_delivery_time AS "estimatedDeliveryTime",
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at AS "createdAt",
        customer_id AS "customerId"
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
};
