import { Router } from "express";
import { getCustomers } from "../controllers/customers/getCustomers.controller";
import { createCustomer } from "../controllers/customers/createCustomer.controller";

const router = Router();

router.get("/", getCustomers);
router.post("/", createCustomer);

export default router;
