# E-Commerce Microservices Architecture

This project has been converted from a monolithic Node.js e-commerce backend to a microservices architecture. The system is now composed of multiple independent services that communicate with each other through HTTP APIs.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React)       │◄──►│   (Port 3000)   │◄──►│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │   Product    │ │   Order     │ │  Payment  │
        │   Service    │ │   Service   │ │  Service  │
        │ (Port 3002)  │ │(Port 3003)  │ │(Port 3004)│
        └──────────────┘ └─────────────┘ └───────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                        ┌───────▼──────┐
                        │ Notification │
                        │   Service    │
                        │ (Port 3005)  │
                        └──────────────┘
                                │
                        ┌───────▼──────┐
                        │   MongoDB    │
                        │  (Port 27017)│
                        └──────────────┘
```

## 🚀 Services

### 1. **API Gateway** (Port 3000)
- **Purpose**: Single entry point for all client requests
- **Responsibilities**:
  - Request routing to appropriate microservices
  - Authentication and authorization
  - Load balancing
  - CORS handling
  - Request/response transformation

### 2. **Authentication Service** (Port 3001)
- **Purpose**: User management and authentication
- **Responsibilities**:
  - User registration and login
  - JWT token generation and validation
  - User profile management
  - Admin user management
- **Database**: `auth-service` MongoDB database

### 3. **Product Service** (Port 3002)
- **Purpose**: Product catalog and inventory management
- **Responsibilities**:
  - Product CRUD operations
  - Inventory management
  - Product reviews
  - Cart price calculation
  - Stock updates
- **Database**: `product-service` MongoDB database

### 4. **Order Service** (Port 3003)
- **Purpose**: Order management and processing
- **Responsibilities**:
  - Order creation and management
  - Order status updates
  - Order history
  - Integration with Product and Notification services
- **Database**: `order-service` MongoDB database

### 5. **Payment Service** (Port 3004)
- **Purpose**: Payment processing
- **Responsibilities**:
  - Stripe payment integration
  - Payment intent creation
  - Payment confirmation
  - Refund processing
  - Payment history

### 6. **Notification Service** (Port 3005)
- **Purpose**: Email notifications
- **Responsibilities**:
  - Order confirmation emails
  - Order status update notifications
  - Welcome emails
  - SendGrid integration with Nodemailer fallback

## 🛠️ Technology Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB 6.0
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **Email**: SendGrid + Nodemailer
- **Containerization**: Docker & Docker Compose
- **API Gateway**: http-proxy-middleware

## 📋 Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- MongoDB (if running locally)
- Stripe account (for payment processing)
- SendGrid account (for email notifications)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simply-sensible-backend
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment files for each service
   cp services/auth-service/env.example services/auth-service/.env
   cp services/product-service/env.example services/product-service/.env
   cp services/order-service/env.example services/order-service/.env
   cp services/payment-service/env.example services/payment-service/.env
   cp services/notification-service/env.example services/notification-service/.env
   cp services/api-gateway/env.example services/api-gateway/.env
   ```

3. **Update environment variables**
   - Update the `.env` files with your actual values
   - Set up Stripe API keys
   - Set up SendGrid API key
   - Configure MongoDB connection strings

4. **Start all services**
   ```bash
   # For production
   docker-compose up -d
   
   # For development with hot reload
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Verify services are running**
   ```bash
   # Check API Gateway health
   curl http://localhost:3000/health
   
   # Check individual services
   curl http://localhost:3001/health  # Auth Service
   curl http://localhost:3002/health  # Product Service
   curl http://localhost:3003/health  # Order Service
   curl http://localhost:3004/health  # Payment Service
   curl http://localhost:3005/health  # Notification Service
   ```

### Manual Setup (Development)

1. **Install dependencies for each service**
   ```bash
   cd services/auth-service && npm install
   cd ../product-service && npm install
   cd ../order-service && npm install
   cd ../payment-service && npm install
   cd ../notification-service && npm install
   cd ../api-gateway && npm install
   ```

2. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or install MongoDB locally
   ```

3. **Start services individually**
   ```bash
   # Terminal 1 - Auth Service
   cd services/auth-service && npm run dev
   
   # Terminal 2 - Product Service
   cd services/product-service && npm run dev
   
   # Terminal 3 - Order Service
   cd services/order-service && npm run dev
   
   # Terminal 4 - Payment Service
   cd services/payment-service && npm run dev
   
   # Terminal 5 - Notification Service
   cd services/notification-service && npm run dev
   
   # Terminal 6 - API Gateway
   cd services/api-gateway && npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/verify` - Token verification

### User Endpoints
- `GET /user/all` - Get all users (Admin only)
- `GET /user/:userId` - Get user by ID

### Product Endpoints
- `GET /products` - Get all products
- `GET /products/:productId` - Get product by ID
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)
- `POST /products/cart/calculate` - Calculate cart total
- `POST /products/stock/update` - Update stock
- `PUT /products/:productId/review` - Add product review

### Order Endpoints
- `POST /orders` - Create new order
- `GET /orders` - Get all orders (Admin only)
- `GET /orders/user/:customerId` - Get user orders
- `GET /orders/:orderId` - Get order by ID
- `PUT /orders/status` - Update order status (Admin only)
- `DELETE /orders/:orderId` - Delete order (Admin only)

### Payment Endpoints
- `POST /payments/create-intent` - Create payment intent
- `GET /payments/stripe-key` - Get Stripe public key
- `POST /payments/confirm` - Confirm payment
- `POST /payments/refund` - Process refund (Admin only)
- `GET /payments/history` - Get payment history

### Notification Endpoints
- `POST /notifications/order-confirmation` - Send order confirmation email
- `POST /notifications/order-status-update` - Send status update email
- `POST /notifications/welcome` - Send welcome email

## 🔧 Configuration

### Environment Variables

#### Auth Service
```env
PORT=3001
DB_CONNECTION_URL=mongodb://localhost:27017/auth-service
secretKey=your-secret-key-here
FRONTEND_HOST=http://localhost:3000
```

#### Product Service
```env
PORT=3002
DB_CONNECTION_URL=mongodb://localhost:27017/product-service
FRONTEND_HOST=http://localhost:3000
```

#### Order Service
```env
PORT=3003
DB_CONNECTION_URL=mongodb://localhost:27017/order-service
PRODUCT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3005
FRONTEND_HOST=http://localhost:3000
```

#### Payment Service
```env
PORT=3004
STRIPE_API_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
FRONTEND_HOST=http://localhost:3000
```

#### Notification Service
```env
PORT=3005
SENDGRID_API_KEY=your-sendgrid-api-key
MAIL_FROM=noreply@simplysensible.in
EMAIL_USER=your-gmail-username
EMAIL_PASS=your-gmail-app-password
FRONTEND_HOST=http://localhost:3000
```

#### API Gateway
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

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Scale a service
docker-compose up -d --scale product-service=3

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

## 🔍 Monitoring and Health Checks

Each service provides a health check endpoint at `/health`:

```bash
# Check all services
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Product Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Payment Service
curl http://localhost:3005/health  # Notification Service
```

## 🚀 Deployment

### Production Deployment

1. **Set up production environment variables**
2. **Use production Docker Compose configuration**
3. **Set up reverse proxy (Nginx)**
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

### Cloud Deployment

The services can be deployed to cloud platforms like:
- AWS (ECS, EKS)
- Google Cloud (GKE, Cloud Run)
- Azure (Container Instances, AKS)
- DigitalOcean (App Platform)

## 🔒 Security Considerations

- JWT tokens for authentication
- CORS configuration
- Input validation
- Rate limiting (can be added)
- HTTPS in production
- Environment variable security
- Database access controls

## 📈 Scalability

- Each service can be scaled independently
- Load balancing through API Gateway
- Database sharding per service
- Caching strategies (Redis can be added)
- Message queues for async processing

## 🧪 Testing

```bash
# Run tests for each service
cd services/auth-service && npm test
cd services/product-service && npm test
# ... and so on
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This microservices architecture provides better scalability, maintainability, and fault tolerance compared to the original monolithic structure. Each service can be developed, deployed, and scaled independently.
