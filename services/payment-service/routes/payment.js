import express from "express";
import {
  createPaymentIntent,
  getStripeApiKey,
  confirmPayment,
  refundPayment,
  getPaymentHistory,
} from "../controllers/paymentController.js";

const router = express.Router();

// Public routes
router.post("/create-intent", createPaymentIntent);
router.get("/stripe-key", getStripeApiKey);
router.post("/confirm", confirmPayment);
router.get("/history", getPaymentHistory);

// Admin routes
router.post("/refund", refundPayment);

export default router;
