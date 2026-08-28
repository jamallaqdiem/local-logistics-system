import { Router } from "express";
import type { Request, Response } from "express";
import { pool } from "../data/connection";
import { Order, UpdateOrderInput } from "../data/dataType";

const router = Router();

// GET /api/orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer, 
        address, 
        status, 
        priority, 
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at 
       FROM orders 
       ORDER BY created_at DESC`,
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders from database" });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Order>(
      `SELECT 
        id, 
        customer, 
        address, 
        status, 
        priority, 
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate", 
        created_at 
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
        address, 
        status, 
        priority, 
        is_cancelled AS "isCancelled", 
        last_update AS "lastUpdate"
    `;

    const result = await pool.query<Order>(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
