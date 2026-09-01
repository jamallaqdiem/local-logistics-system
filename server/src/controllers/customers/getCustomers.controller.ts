import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { Customer } from "../../data/dataType";

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Retrieve list of saved B2B customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of saved customers ordered alphabetically
 *       500:
 *         description: Database query execution error
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Customer>(
      `SELECT 
        id, 
        name, 
        phone, 
        postcode, 
        address, 
        pickup_address AS "pickupAddress",
        created_at AS "createdAt" 
       FROM customers 
       ORDER BY name ASC`,
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch saved customer accounts" });
  }
};
