import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import axios from "axios";

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

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3003";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005";

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token with auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/verify`, {
      headers: {
        Cookie: `token=${token}`
      }
    });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    service: "api-gateway", 
    status: "running",
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      product: PRODUCT_SERVICE_URL,
      order: ORDER_SERVICE_URL,
      payment: PAYMENT_SERVICE_URL,
      notification: NOTIFICATION_SERVICE_URL
    }
  });
});

// Authentication routes
app.use("/auth", createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/auth": "/auth"
  }
}));

// User routes (protected)
app.use("/user", authenticateToken, createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/user": "/user"
  }
}));

// Product routes
app.use("/products", createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/products": "/products"
  }
}));

// Order routes
app.use("/orders", createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/orders": "/orders"
  }
}));

// Payment routes
app.use("/payments", createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/payments": "/payments"
  }
}));

// Notification routes
app.use("/notifications", createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/notifications": "/notifications"
  }
}));

// Legacy routes for backward compatibility
app.use("/shop", createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/shop": "/products"
  }
}));

// Admin routes
app.use("/admin", authenticateToken, requireAdmin, createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/admin": "/user"
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("API Gateway Error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Service endpoints:");
  console.log(`- Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`- Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`- Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`- Payment Service: ${PAYMENT_SERVICE_URL}`);
  console.log(`- Notification Service: ${NOTIFICATION_SERVICE_URL}`);
});
