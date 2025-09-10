import express from "express";
import { signin, signup, verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.get("/verify", verifyToken);

export default router;
