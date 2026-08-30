import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Order } from "../../data/dataType";

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
export const getOrders = async (req: Request, res: Response) => {
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
};
