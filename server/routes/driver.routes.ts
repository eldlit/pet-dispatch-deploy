import { Router } from "express";
import { db } from "../db";
import { drivers, insertDriverSchema } from "../../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all drivers
router.get("/", async (req, res) => {
  try {
    const allDrivers = await db.select().from(drivers);
    res.json(allDrivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Error fetching drivers" });
  }
});

// Get driver by ID
router.get("/:id", async (req, res) => {
  try {
    const driver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!driver.length) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json(driver[0]);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Error fetching driver" });
  }
});

// Create new driver
router.post("/", async (req, res) => {
  try {
    const newDriver = insertDriverSchema.parse(req.body);
    const inserted = await db.insert(drivers).values(newDriver).returning();
    res.status(201).json(inserted[0]);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({ message: "Invalid driver data", errors: error.errors });
    }
    console.error("Error creating driver:", error);
    res.status(500).json({ message: "Error creating driver" });
  }
});

// Update driver status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "on_ride", "offline"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await db
      .update(drivers)
      .set({ status })
      .where(eq(drivers.id, parseInt(req.params.id)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ message: "Error updating driver status" });
  }
});

export default router;
