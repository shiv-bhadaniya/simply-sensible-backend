import express from "express";
import {
  AdmindAddNewProduct,
  deleteProduct,
  fetchAllOrders,
  fetchAllUsers,
  updateOrderStatus,
} from "../controller/Admin.js";
import { isAuthenticateUser, userIsAdmin } from "../middlerware/Auth.js";

const router = express.Router();

router.post("/create/product", userIsAdmin, AdmindAddNewProduct);
router.get("/alluser", isAuthenticateUser, userIsAdmin, fetchAllUsers);
router.get("/allorders", isAuthenticateUser, userIsAdmin, fetchAllOrders);
router.delete(
  "/product/delete/:id",
  isAuthenticateUser,
  userIsAdmin,
  deleteProduct,
);
router.put(
  "/order/edit/status",
  isAuthenticateUser,
  userIsAdmin,
  updateOrderStatus,
);

export default router;
