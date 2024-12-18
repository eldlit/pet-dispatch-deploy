import { Router } from "express";
import { db } from "../db";
import { drivers, insertDriverSchema } from "../../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
    
    // Parse JSON strings back to objects
    const driverData = {
      ...driver[0],
      weeklySchedule: driver[0].weeklySchedule ? JSON.parse(driver[0].weeklySchedule) : null,
      scheduleOverrides: driver[0].scheduleOverrides ? JSON.parse(driver[0].scheduleOverrides) : null,
    };
    
    res.json(driverData);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Error fetching driver" });
  }
});

// Create new driver
router.post("/", async (req, res) => {
  try {
    const newDriver = insertDriverSchema.parse({
      ...req.body,
      weeklySchedule: req.body.weeklySchedule ? JSON.stringify(req.body.weeklySchedule) : null,
      scheduleOverrides: req.body.scheduleOverrides ? JSON.stringify(req.body.scheduleOverrides) : null,
    });
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

// Update driver
router.put("/:id", async (req, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const updateData = {
      ...req.body,
      weeklySchedule: req.body.weeklySchedule ? JSON.stringify(req.body.weeklySchedule) : undefined,
      scheduleOverrides: req.body.scheduleOverrides ? JSON.stringify(req.body.scheduleOverrides) : undefined,
    };

    const updated = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ message: "Error updating driver" });
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

// Delete driver
router.delete("/:id", async (req, res) => {
  try {
    const driverId = parseInt(req.params.id);
    
    // Check if driver exists
    const driver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1);

    if (!driver.length) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Delete driver
    await db.delete(drivers).where(eq(drivers.id, driverId));
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ message: "Error deleting driver" });
  }
});

export default router;
