import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  calculateCartPrice,
  updateStock,
  addProductReview,
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.post("/cart/calculate", calculateCartPrice);
router.put("/:productId/review", addProductReview);

// Admin routes (these will be protected by API Gateway)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/stock/update", updateStock);

export default router;
