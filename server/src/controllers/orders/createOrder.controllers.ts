// server/src/controllers/orders/createOrder.controller.ts
import type { Request, Response } from "express";
import { pool } from "../../data/connection";

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new dispatch order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Dispatch order created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 */
export const createOrder = async (req: Request, res: Response) => {
  const {
    id,
    customer,
    phone,
    address,
    customerId,
    priority = "normal",
  } = req.body;

  if (!customer || !phone || !address) {
    return res
      .status(400)
      .json({ error: "Customer, phone, and address are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders (id, customer, phone, address, customer_id, priority, status)
       VALUES (COALESCE($1, 'ORD-' || nextval('orders_id_seq')), $2, $3, $4, $5, $6, 'pending')
       RETURNING id, customer, phone, address, customer_id AS "customerId", priority, status, created_at AS "createdAt"`,
      [id || null, customer, phone, address, customerId || null, priority],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
