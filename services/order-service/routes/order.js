import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// Public routes
router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/user/:customerId", getUserOrders);
router.get("/:orderId", getOrderById);

// Admin routes (these will be protected by API Gateway)
router.put("/status", updateOrderStatus);
router.delete("/:orderId", deleteOrder);

export default router;
