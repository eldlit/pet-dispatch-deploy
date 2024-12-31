import { Router } from "express";
import { db } from "../db";
import { rides, insertRideSchema, drivers } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get all rides
router.get("/", async (req, res) => {
  try {
    const allRides = await db.select().from(rides);
    res.json(allRides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
});

// Get ride by ID
router.get("/:id", async (req, res) => {
  try {
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!ride.length) {
      return res.status(404).json({ message: "Ride not found" });
    }
    
    res.json(ride[0]);
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ message: "Error fetching ride" });
  }
});

// Create new ride
router.post("/", async (req, res) => {
  try {
    const newRide = insertRideSchema.parse(req.body);

    // If driver is assigned, check if they're available
    if (newRide.driverId) {
      const driver = await db
        .select()
        .from(drivers)
        .where(
          and(
            eq(drivers.id, newRide.driverId),
            eq(drivers.status, "available")
          )
        )
        .limit(1);

      if (!driver.length) {
        return res.status(400).json({ message: "Selected driver is not available" });
      }

      // Update driver status to on_ride
      await db
        .update(drivers)
        .set({ status: "on_ride" })
        .where(eq(drivers.id, newRide.driverId));
    }

    const inserted = await db.insert(rides).values(newRide).returning();
    res.status(201).json(inserted[0]);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({ message: "Invalid ride data", errors: error.errors });
    }
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Error creating ride" });
  }
});

// Update ride status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "in_progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, parseInt(req.params.id)))
      .limit(1);

    if (!ride.length) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // If ride is completed or cancelled, free up the driver
    if ((status === "completed" || status === "cancelled") && ride[0].driverId) {
      await db
        .update(drivers)
        .set({ status: "available" })
        .where(eq(drivers.id, ride[0].driverId));
    }

    const updated = await db
      .update(rides)
      .set({ status })
      .where(eq(rides.id, parseInt(req.params.id)))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating ride status:", error);
    res.status(500).json({ message: "Error updating ride status" });
  }
});

export default router;
