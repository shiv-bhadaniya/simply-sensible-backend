import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { isAuthenticateUser, userIsAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/all", isAuthenticateUser, userIsAdmin, getAllUsers);
router.get("/:userId", getUserById);

export default router;
