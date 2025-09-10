import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import orderRoutes from "./routes/order.js";
import { Check } from "./util/envCheck.js";

const app = express();

const corsOptions = {
  origin: [process.env.FRONTEND_HOST, "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));

app.options("*", cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_HOST);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

// Routes
app.use("/orders", orderRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ 
    service: "order-service", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

if (!Check.verifyEnvironment()) {
  throw Error("Please include all environment variables");
}

const PORT = process.env.PORT || 3003;
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;

mongoose
  .connect(DB_CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT} and Database connected successfully.`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });
