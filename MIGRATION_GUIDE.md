# Migration Guide: Monolith to Microservices

This guide explains how to migrate from the original monolithic e-commerce backend to the new microservices architecture.

## 🔄 Migration Overview

The original monolithic application has been decomposed into 6 independent microservices:

| Original Component | New Microservice | Port | Database |
|-------------------|------------------|------|----------|
| `controller/Auth.js` | Auth Service | 3001 | `auth-service` |
| `controller/User.js` | Product Service | 3002 | `product-service` |
| `controller/Admin.js` | Order Service | 3003 | `order-service` |
| `controller/Payment.js` | Payment Service | 3004 | N/A |
| `util/sendMail.js` | Notification Service | 3005 | N/A |
| `index.js` | API Gateway | 3000 | N/A |

## 📋 Migration Steps

### 1. **Backup Original Code**
```bash
# Create backup of original monolithic code
cp -r . ../simply-sensible-backend-monolith-backup
```

### 2. **Environment Variables Migration**

#### Original `.env` file:
```env
PORT=5000
DB_CONNECTION_URL=mongodb://localhost:27017/ecommerce
STRIPE_API_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
secretKey=your-secret-key-here
FRONTEND_HOST=http://localhost:3000
SENDGRID_API_KEY=your-sendgrid-api-key
MAIL=noreply@simplysensible.in
```

#### New Environment Files:

**Auth Service** (`services/auth-service/.env`):
```env
PORT=3001
DB_CONNECTION_URL=mongodb://localhost:27017/auth-service
secretKey=your-secret-key-here
FRONTEND_HOST=http://localhost:3000
```

**Product Service** (`services/product-service/.env`):
```env
PORT=3002
DB_CONNECTION_URL=mongodb://localhost:27017/product-service
FRONTEND_HOST=http://localhost:3000
```

**Order Service** (`services/order-service/.env`):
```env
PORT=3003
DB_CONNECTION_URL=mongodb://localhost:27017/order-service
PRODUCT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3005
FRONTEND_HOST=http://localhost:3000
```

**Payment Service** (`services/payment-service/.env`):
```env
PORT=3004
STRIPE_API_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
FRONTEND_HOST=http://localhost:3000
```

**Notification Service** (`services/notification-service/.env`):
```env
PORT=3005
SENDGRID_API_KEY=your-sendgrid-api-key
MAIL_FROM=noreply@simplysensible.in
EMAIL_USER=your-gmail-username
EMAIL_PASS=your-gmail-app-password
FRONTEND_HOST=http://localhost:3000
```

**API Gateway** (`services/api-gateway/.env`):
```env
PORT=3000
FRONTEND_HOST=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
NODE_ENV=development
```

### 3. **Database Migration**

#### Original Database Structure:
- Single database: `ecommerce`
- Collections: `users`, `products`, `orders`

#### New Database Structure:
- **Auth Service**: `auth-service` database with `users` collection
- **Product Service**: `product-service` database with `products` collection  
- **Order Service**: `order-service` database with `orders` collection

#### Migration Script:
```javascript
// migrate-data.js
const mongoose = require('mongoose');

// Connect to original database
const originalDB = mongoose.createConnection('mongodb://localhost:27017/ecommerce');

// Connect to new databases
const authDB = mongoose.createConnection('mongodb://localhost:27017/auth-service');
const productDB = mongoose.createConnection('mongodb://localhost:27017/product-service');
const orderDB = mongoose.createConnection('mongodb://localhost:27017/order-service');

async function migrateData() {
  try {
    // Migrate users
    const users = await originalDB.collection('users').find({}).toArray();
    await authDB.collection('users').insertMany(users);
    console.log('Users migrated successfully');

    // Migrate products
    const products = await originalDB.collection('products').find({}).toArray();
    await productDB.collection('products').insertMany(products);
    console.log('Products migrated successfully');

    // Migrate orders
    const orders = await originalDB.collection('orders').find({}).toArray();
    await orderDB.collection('orders').insertMany(orders);
    console.log('Orders migrated successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrateData();
```

### 4. **API Endpoint Changes**

#### Original Endpoints:
```javascript
// Original monolithic endpoints
app.use("/", userRouter);           // Product-related routes
app.use("/user/auth", authRoute);   // Authentication routes
app.use("/admin", adminRouter);     // Admin routes
```

#### New Microservices Endpoints:
```javascript
// New microservices endpoints through API Gateway
app.use("/auth", authService);      // Authentication routes
app.use("/user", userService);      // User management routes
app.use("/products", productService); // Product routes
app.use("/orders", orderService);   // Order routes
app.use("/payments", paymentService); // Payment routes
app.use("/notifications", notificationService); // Notification routes
app.use("/admin", adminService);    // Admin routes
```

### 5. **Frontend Integration Changes**

#### Original Frontend API Calls:
```javascript
// Original API calls
const response = await fetch('http://localhost:5000/shop');
const authResponse = await fetch('http://localhost:5000/user/auth/signin');
```

#### New Frontend API Calls:
```javascript
// New API calls through API Gateway
const response = await fetch('http://localhost:3000/products');
const authResponse = await fetch('http://localhost:3000/auth/signin');
```

### 6. **Service Dependencies**

#### Original Dependencies:
- All services in one `package.json`
- Shared models and utilities
- Direct function calls between modules

#### New Dependencies:
- Each service has its own `package.json`
- HTTP API calls between services
- Shared utilities moved to individual services

## 🔧 Configuration Changes

### 1. **CORS Configuration**
- Original: Single CORS configuration in main app
- New: CORS configured in each service and API Gateway

### 2. **Database Connections**
- Original: Single MongoDB connection
- New: Separate MongoDB connections per service

### 3. **Error Handling**
- Original: Centralized error handling
- New: Service-specific error handling with API Gateway fallback

## 🚀 Deployment Changes

### Original Deployment:
```bash
# Single application deployment
npm install
npm start
```

### New Deployment:
```bash
# Microservices deployment
docker-compose up -d
# or
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 Performance Considerations

### Advantages of Microservices:
1. **Independent Scaling**: Each service can be scaled based on demand
2. **Fault Isolation**: Failure in one service doesn't affect others
3. **Technology Diversity**: Each service can use different technologies
4. **Team Independence**: Different teams can work on different services

### Potential Challenges:
1. **Network Latency**: Inter-service communication adds latency
2. **Data Consistency**: Distributed transactions are more complex
3. **Monitoring**: Need to monitor multiple services
4. **Deployment Complexity**: More complex deployment process

## 🔍 Testing Migration

### 1. **Unit Tests**
- Each service has its own test suite
- Run tests for each service independently

### 2. **Integration Tests**
- Test API Gateway routing
- Test inter-service communication
- Test end-to-end workflows

### 3. **Load Testing**
- Test individual service performance
- Test overall system performance
- Compare with original monolithic performance

## 📈 Monitoring and Logging

### Original Monitoring:
- Single application logs
- Single health check endpoint

### New Monitoring:
- Service-specific logs
- Individual health check endpoints
- Centralized logging (can be added)
- Service discovery and monitoring

## 🛠️ Troubleshooting

### Common Issues:

1. **Service Communication Errors**
   - Check service URLs in environment variables
   - Verify network connectivity between services
   - Check API Gateway routing configuration

2. **Database Connection Issues**
   - Verify MongoDB is running
   - Check database connection strings
   - Ensure proper database permissions

3. **Authentication Issues**
   - Verify JWT secret keys are consistent
   - Check token validation in API Gateway
   - Ensure proper CORS configuration

4. **Payment Integration Issues**
   - Verify Stripe API keys
   - Check payment service configuration
   - Test payment flow end-to-end

## 📚 Additional Resources

- [Microservices Architecture Patterns](https://microservices.io/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## 🆘 Support

If you encounter issues during migration:
1. Check the logs for each service
2. Verify environment variable configuration
3. Test individual services independently
4. Check API Gateway routing
5. Create an issue in the repository

---

**Note**: This migration maintains backward compatibility for most API endpoints through the API Gateway, making the transition smoother for existing frontend applications.
