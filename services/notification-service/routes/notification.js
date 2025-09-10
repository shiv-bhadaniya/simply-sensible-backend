import express from "express";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendWelcomeEmail,
} from "../controllers/notificationController.js";

const router = express.Router();

// Public routes
router.post("/order-confirmation", sendOrderConfirmationEmail);
router.post("/order-status-update", sendOrderStatusUpdateEmail);
router.post("/welcome", sendWelcomeEmail);

export default router;
