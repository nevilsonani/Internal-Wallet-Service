# Wallet Service API - Postman cURL Commands

## 🚀 Start the Project

### Option 1: Docker (Recommended)
```bash
cd Internal-Wallet-Service
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup
```bash
cd Internal-Wallet-Service

# Install dependencies
npm install

# Setup database (requires PostgreSQL running locally)
npm run migrate
npm run seed

# Start the service
npm start
```

### Option 3: Docker Compose
```bash
cd Internal-Wallet-Service
docker-compose up --build -d
```

---

## 📋 API Endpoints - cURL Commands

### Base URL
```
http://localhost:3000/api/wallet
```

---

## 🔍 Health & System Checks

### 1. Service Health Check
```bash
curl -X GET http://localhost:3000/health
```

### 2. Wallet Service Health Check
```bash
curl -X GET http://localhost:3000/api/wallet/health
```

---

## 📊 Asset Management

### 3. Get All Asset Types
```bash
curl -X GET http://localhost:3000/api/wallet/assets \
  -H "Content-Type: application/json"
```

---

## 💰 Wallet Operations

### 4. Get Wallet Balance
```bash
curl -X GET "http://localhost:3000/api/wallet/balance?userId=user_001&assetTypeId=1" \
  -H "Content-Type: application/json"
```

### 5. Get All Wallets for User
```bash
curl -X GET http://localhost:3000/api/wallet/wallets/user_001 \
  -H "Content-Type: application/json"
```

### 6. Get Transaction History
```bash
curl -X GET "http://localhost:3000/api/wallet/history?userId=user_001&limit=10&offset=0" \
  -H "Content-Type: application/json"
```

---

## 💸 Transaction Operations

### 7. Wallet Top-up (Purchase)
```bash
curl -X POST http://localhost:3000/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "topup_payment_001",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 100,
    "referenceId": "payment_gateway_12345",
    "description": "Purchase of 100 Gold Coins",
    "createdBy": "payment_system"
  }'
```

### 8. Bonus/Incentive Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/bonus \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "referral_bonus_001",
    "userId": "user_002",
    "assetTypeId": 1,
    "amount": 50,
    "referenceId": "referral_program_001",
    "description": "Welcome bonus for new user referral",
    "createdBy": "referral_system"
  }'
```

### 9. Spend/Purchase Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/spend \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "purchase_item_001",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 25,
    "referenceId": "order_67890",
    "description": "Purchase of Legendary Sword",
    "createdBy": "user_001"
  }'
```

---

## 🧪 Testing & Validation

### 10. Test Idempotency (Same Request Multiple Times)
```bash
# First request
curl -X POST http://localhost:3000/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "idempotency_test_001",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 75,
    "referenceId": "test_payment_001",
    "description": "Test idempotency transaction",
    "createdBy": "test_system"
  }'

# Second request (should return same result)
curl -X POST http://localhost:3000/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "idempotency_test_001",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 75,
    "referenceId": "test_payment_001",
    "description": "Test idempotency transaction",
    "createdBy": "test_system"
  }'
```

### 11. Insufficient Balance Test (Should Fail)
```bash
curl -X POST http://localhost:3000/api/wallet/spend \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "insufficient_balance_test",
    "userId": "user_002",
    "assetTypeId": 1,
    "amount": 10000,
    "referenceId": "test_order_fail",
    "description": "Test insufficient balance",
    "createdBy": "test_system"
  }'
```

### 12. Invalid Asset Type Test (Should Fail)
```bash
curl -X GET "http://localhost:3000/api/wallet/balance?userId=user_001&assetTypeId=999" \
  -H "Content-Type: application/json"
```

---

## 📈 Advanced Examples

### 13. Diamond Currency Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "diamond_purchase_001",
    "userId": "user_001",
    "assetTypeId": 2,
    "amount": 10,
    "referenceId": "premium_payment_001",
    "description": "Purchase of 10 Diamonds",
    "createdBy": "payment_system"
  }'
```

### 14. Loyalty Points Bonus
```bash
curl -X POST http://localhost:3000/api/wallet/bonus \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "daily_login_bonus",
    "userId": "user_002",
    "assetTypeId": 3,
    "amount": 25,
    "referenceId": "daily_reward_001",
    "description": "Daily login bonus",
    "createdBy": "reward_system"
  }'
```

### 15. Get Transaction History with Pagination
```bash
curl -X GET "http://localhost:3000/api/wallet/history?userId=user_001&assetTypeId=1&limit=5&offset=0" \
  -H "Content-Type: application/json"
```

---

## 🔧 Environment Setup

### Create .env file
```bash
cp .env.example .env
```

### .env Configuration
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet_service
DB_USER=wallet_user
DB_PASSWORD=wallet_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

---

## 📝 Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "COMPLETED",
    "message": "Transaction completed successfully",
    "entries": [
      {
        "userId": "user_001",
        "entryType": "CREDIT",
        "amount": 100,
        "balanceAfter": 1600
      },
      {
        "userId": "system_treasury",
        "entryType": "DEBIT",
        "amount": 100,
        "balanceAfter": 999900
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Insufficient balance"
}
```

---

## 🚀 Quick Test Sequence

1. **Start the service**
2. **Check health**: `curl http://localhost:3000/health`
3. **Get assets**: `curl http://localhost:3000/api/wallet/assets`
4. **Check balance**: `curl "http://localhost:3000/api/wallet/balance?userId=user_001&assetTypeId=1"`
5. **Do a top-up**: Use command #7
6. **Check new balance**: Use command #4 again
7. **Do a spend**: Use command #9
8. **Check final balance**: Use command #4 again
9. **View history**: Use command #6

---

## 📱 Postman Import

You can import these commands into Postman by:
1. Copy each cURL command
2. In Postman: Import > Raw Text > Paste cURL command
3. Save to collection "Wallet Service API"

Or use the `examples/api-examples.http` file with REST Client extensions in VS Code.
