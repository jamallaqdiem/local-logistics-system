import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Order } from "../../data/dataType";
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
 *     BatchOrderInput:
 *       type: object
 *       required: [orders]
 *       properties:
 *         orders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateOrderInput'
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
export const createBatchOrders = async (req: Request, res: Response) => {
  const { orders } = req.body;

  if (!Array.isArray(orders) || orders.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid payload: orders array is required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const createdOrders: Order[] = [];

    for (const item of orders) {
      const { customer, phone, address, priority = "medium" } = item;

      const result = await client.query<Order>(
        `INSERT INTO orders (customer, phone, address, priority, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING 
           id, 
           customer, 
           phone, 
           address, 
           status, 
           priority, 
           is_cancelled AS "isCancelled", 
           last_update AS "lastUpdate", 
           created_at AS "createdAt"`,
        [customer, phone, address, priority],
      );

      createdOrders.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: `Successfully created ${createdOrders.length} orders`,
      data: createdOrders,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Batch Order Database Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to insert batch orders into database" });
  } finally {
    client.release();
  }
};
