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
    pickupAddress,
    pickupPhone,
    price,
    customerId,
    priority = "normal",
  } = req.body;

  if (!customer || !phone || !address) {
    return res
      .status(400)
      .json({ error: "Customer, phone, and address are required" });
  }

  try {
    let finalPickupAddress = pickupAddress;

    // Fall back to customer's default pickup address if not provided in payload
    if (!finalPickupAddress && customerId) {
      const customerRes = await pool.query(
        `SELECT pickup_address FROM customers WHERE id = $1`,
        [customerId],
      );
      finalPickupAddress = customerRes.rows[0]?.pickup_address || null;
    }

    const result = await pool.query(
      `INSERT INTO orders (
         id, customer, phone, address, pickup_address, pickup_phone, price, customer_id, priority, status
       )
       VALUES (
         COALESCE($1, 'ORD-' || nextval('orders_id_seq')), 
         $2, $3, $4, $5, $6, $7, $8, $9, 'pending'
       )
       RETURNING 
         id, 
         customer, 
         phone, 
         address, 
         pickup_address AS "pickupAddress",
         pickup_phone AS "pickupPhone",
         price::float AS "price",
         customer_id AS "customerId", 
         priority, 
         status, 
         tracking_token AS "trackingToken",
         estimated_delivery_time AS "estimatedDeliveryTime",
         is_cancelled AS "isCancelled",
         last_update AS "lastUpdate",
         created_at AS "createdAt"`,
      [
        id || null,
        customer,
        phone,
        address,
        finalPickupAddress || null,
        pickupPhone || null,
        price ?? 0.0,
        customerId || null,
        priority,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
