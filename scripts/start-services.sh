#!/bin/bash

# Start E-commerce Microservices
# This script starts all microservices in the correct order

echo "🚀 Starting E-commerce Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_service $port "$service_name"; then
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - waiting 2 seconds...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Start services using Docker Compose
echo -e "${BLUE}🐳 Starting services with Docker Compose...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start services
if [ "$1" = "dev" ]; then
    echo -e "${BLUE}🔧 Starting in development mode...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
else
    echo -e "${BLUE}🏭 Starting in production mode...${NC}"
    docker-compose up -d
fi

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"

# Check MongoDB first
wait_for_service 27017 "MongoDB"

# Check individual services
wait_for_service 3001 "Auth Service"
wait_for_service 3002 "Product Service"
wait_for_service 3003 "Order Service"
wait_for_service 3004 "Payment Service"
wait_for_service 3005 "Notification Service"
wait_for_service 3000 "API Gateway"

# Final health check
echo -e "${BLUE}🔍 Performing final health check...${NC}"

all_services_healthy=true

check_service 3000 "API Gateway" || all_services_healthy=false
check_service 3001 "Auth Service" || all_services_healthy=false
check_service 3002 "Product Service" || all_services_healthy=false
check_service 3003 "Order Service" || all_services_healthy=false
check_service 3004 "Payment Service" || all_services_healthy=false
check_service 3005 "Notification Service" || all_services_healthy=false

if [ "$all_services_healthy" = true ]; then
    echo -e "${GREEN}🎉 All services are running successfully!${NC}"
    echo -e "${BLUE}📋 Service URLs:${NC}"
    echo -e "   - API Gateway: http://localhost:3000"
    echo -e "   - Auth Service: http://localhost:3001"
    echo -e "   - Product Service: http://localhost:3002"
    echo -e "   - Order Service: http://localhost:3003"
    echo -e "   - Payment Service: http://localhost:3004"
    echo -e "   - Notification Service: http://localhost:3005"
    echo -e "${BLUE}🔍 Health Check: curl http://localhost:3000/health${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check the logs with: docker-compose logs${NC}"
    exit 1
fi
