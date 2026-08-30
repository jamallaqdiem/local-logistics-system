import type { Request, Response } from "express";
import { pool } from "../../data/connection";
import { CreateCustomerInput, Customer } from "../../data/dataType";

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Save a new B2B trade customer account
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, postcode, address]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               postcode:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer account created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 */
export const createCustomer = async (req: Request, res: Response) => {
  const { name, phone, postcode, address }: CreateCustomerInput = req.body;

  if (
    !name?.trim() ||
    !phone?.trim() ||
    !postcode?.trim() ||
    !address?.trim()
  ) {
    return res
      .status(400)
      .json({ error: "Name, phone, postcode, and address are required" });
  }

  try {
    const result = await pool.query<Customer>(
      `INSERT INTO customers (name, phone, postcode, address) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, phone, postcode, address, created_at AS "createdAt"`,
      [name, phone, postcode, address],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to save customer account" });
  }
};
