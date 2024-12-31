import { Router } from "express";
import customerRoutes from "./customer.routes";
import driverRoutes from "./driver.routes";
import rideRoutes from "./ride.routes";

const router = Router();

// API Routes
router.use("/api/customers", customerRoutes);
router.use("/api/drivers", driverRoutes);
router.use("/api/rides", rideRoutes);

export const registerRoutes = (app: any) => {
  app.use(router);
};

export default router;
