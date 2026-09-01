import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Order } from "../../data/dataType";

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
export const trackOrder = async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer, 
        address, 
        pickup_address AS "pickupAddress",
        pickup_phone AS "pickupPhone",
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
};
