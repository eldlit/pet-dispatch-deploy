import { Router } from "express";
import { db } from "../db";
import { customers, insertCustomerSchema } from "../../db/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

const router = Router();

// Get all customers
router.get("/", async (req, res) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!customer.length) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer[0]);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
});

// Create new customer
router.post("/", async (req, res) => {
  try {
    const newCustomer = insertCustomerSchema.parse(req.body);
    const inserted = await db.insert(customers).values(newCustomer).returning();
    res.status(201).json(inserted[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
    }
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Error creating customer" });
  }
});

export default router;