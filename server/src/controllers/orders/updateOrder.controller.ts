import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Order, UpdateOrderInput } from "../../data/dataType";
import { sendTrackingSMS } from "../../services/notifications";
import { io } from "../../app";

// Expand UpdateOrderInput inline or via type definitions to support dynamic updates

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update order status, priority, price, pickup address, or phone number
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
 *       404:
 *         description: Order not found
 *       500:
 *         description: Database error
 */
export const updateOrder = async (req: Request, res: Response) => {
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
    if (updates.pickupAddress !== undefined) {
      fields.push(`pickup_address = $${queryIndex++}`);
      values.push(updates.pickupAddress);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${queryIndex++}`);
      values.push(updates.price);
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
        pickup_address AS "pickupAddress",
        price::float AS "price",
        status, 
        priority, 
        tracking_token AS "trackingToken",
        estimated_delivery_time AS "estimatedDeliveryTime",
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate",
        created_at AS "createdAt",
        customer_id AS "customerId"
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
};
