# Start E-commerce Microservices
# This PowerShell script starts all microservices in the correct order

Write-Host "🚀 Starting E-commerce Microservices..." -ForegroundColor Blue

# Function to check if a service is running
function Test-Service {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $ServiceName is running on port $Port" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ $ServiceName is not running on port $Port" -ForegroundColor Red
        return $false
    }
    return $false
}

# Function to wait for a service to be ready
function Wait-ForService {
    param(
        [int]$Port,
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        if (Test-Service -Port $Port -ServiceName $ServiceName) {
            return $true
        }
        
        Write-Host "   Attempt $attempt/$MaxAttempts - waiting 2 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start after $MaxAttempts attempts" -ForegroundColor Red
    return $false
}

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Start services
if ($args[0] -eq "dev") {
    Write-Host "🔧 Starting in development mode..." -ForegroundColor Blue
    docker-compose -f docker-compose.dev.yml up -d
}
else {
    Write-Host "🏭 Starting in production mode..." -ForegroundColor Blue
    docker-compose up -d
}

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Blue

# Check MongoDB first
Wait-ForService -Port 27017 -ServiceName "MongoDB"

# Check individual services
Wait-ForService -Port 3001 -ServiceName "Auth Service"
Wait-ForService -Port 3002 -ServiceName "Product Service"
Wait-ForService -Port 3003 -ServiceName "Order Service"
Wait-ForService -Port 3004 -ServiceName "Payment Service"
Wait-ForService -Port 3005 -ServiceName "Notification Service"
Wait-ForService -Port 3000 -ServiceName "API Gateway"

# Final health check
Write-Host "🔍 Performing final health check..." -ForegroundColor Blue

$allServicesHealthy = $true

if (-not (Test-Service -Port 3000 -ServiceName "API Gateway")) { $allServicesHealthy = $false }
if (-not (Test-Service -Port 3001 -ServiceName "Auth Service")) { $allServicesHealthy = $false }
if (-not (Test-Service -Port 3002 -ServiceName "Product Service")) { $allServicesHealthy = $false }
if (-not (Test-Service -Port 3003 -ServiceName "Order Service")) { $allServicesHealthy = $false }
if (-not (Test-Service -Port 3004 -ServiceName "Payment Service")) { $allServicesHealthy = $false }
if (-not (Test-Service -Port 3005 -ServiceName "Notification Service")) { $allServicesHealthy = $false }

if ($allServicesHealthy) {
    Write-Host "🎉 All services are running successfully!" -ForegroundColor Green
    Write-Host "📋 Service URLs:" -ForegroundColor Blue
    Write-Host "   - API Gateway: http://localhost:3000" -ForegroundColor White
    Write-Host "   - Auth Service: http://localhost:3001" -ForegroundColor White
    Write-Host "   - Product Service: http://localhost:3002" -ForegroundColor White
    Write-Host "   - Order Service: http://localhost:3003" -ForegroundColor White
    Write-Host "   - Payment Service: http://localhost:3004" -ForegroundColor White
    Write-Host "   - Notification Service: http://localhost:3005" -ForegroundColor White
    Write-Host "🔍 Health Check: curl http://localhost:3000/health" -ForegroundColor Blue
}
else {
    Write-Host "❌ Some services failed to start. Check the logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
