# Internal Wallet Service

A high-performance, transactional wallet service designed for gaming platforms and loyalty rewards systems. This service manages virtual currencies (Gold Coins, Diamonds, Loyalty Points) with enterprise-grade reliability, concurrency control, and auditability.

## 🏗️ Architecture Overview

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL 15 with ACID transactions
- **Architecture**: Ledger-based double-entry bookkeeping system
- **Concurrency**: Optimistic locking with deadlock detection and retry logic
- **Idempotency**: Transaction-level idempotency keys
- **Containerization**: Docker & Docker Compose
- **Rate Limiting**: Built-in rate limiting for API protection

### Key Features
✅ **Ledger-Based Architecture**: Double-entry bookkeeping for complete audit trails  
✅ **Concurrency Control**: Deadlock detection with automatic retry mechanisms  
✅ **Idempotency**: Safe transaction retries without duplicate processing  
✅ **ACID Compliance**: Data integrity guaranteed under all conditions  
✅ **High Performance**: Optimized for high-traffic scenarios  
✅ **Comprehensive Logging**: Structured logging with Winston  
✅ **Health Monitoring**: Built-in health checks and monitoring  
✅ **Container Ready**: Full Docker support with orchestration  

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### Option 1: Docker Setup (Recommended)

1. **Clone and Setup**
   ```bash
   git clone https://github.com/nevilsonani/Internal-Wallet-Service.git
   cd Internal-Wallet-Service
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Verify Installation**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Create database
   createdb wallet_service
   
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start Service**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📊 Database Schema

### Core Tables

#### Asset Types
Defines virtual currencies available in the system.
- Gold Coins (GC) - Primary gaming currency
- Diamonds (DIAM) - Premium currency
- Loyalty Points (LP) - Reward points

#### Wallets
User and system accounts holding balances.
- User wallets for individual players
- System treasury accounts for fund management

#### Transactions
Transaction records with idempotency protection.
- TOPUP: User purchases credits
- BONUS: System issues free credits
- SPEND: User spends credits

#### Transaction Entries
Double-entry ledger entries for complete audit trails.
- Every transaction creates corresponding DEBIT/CREDIT entries
- Balance snapshots for each entry

## 🔌 API Endpoints

### Health & System
- `GET /health` - Service health check
- `GET /api/wallet/health` - Wallet service health check

### Asset Management
- `GET /api/wallet/assets` - List all available asset types

### Wallet Operations
- `GET /api/wallet/balance?userId={userId}&assetTypeId={assetTypeId}` - Get wallet balance
- `GET /api/wallet/wallets/{userId}` - Get all wallets for a user
- `GET /api/wallet/history?userId={userId}&assetTypeId={assetTypeId}&limit={limit}&offset={offset}` - Transaction history

### Transactions
- `POST /api/wallet/topup` - Purchase/wallet top-up
- `POST /api/wallet/bonus` - Issue bonus/incentive credits
- `POST /api/wallet/spend` - Spend credits on purchases

## 📝 API Usage Examples

### Get Balance
```bash
curl "http://localhost:3000/api/wallet/balance?userId=user_001&assetTypeId=1"
```

### Get User Wallets
```bash
curl "http://localhost:3000/api/wallet/wallets/user_001"
```

### Top-up Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "topup_12345",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 100,
    "referenceId": "payment_12345",
    "description": "Purchase of 100 Gold Coins",
    "createdBy": "payment_system"
  }'
```

### Bonus Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/bonus \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "referral_bonus_001",
    "userId": "user_002",
    "assetTypeId": 1,
    "amount": 50,
    "referenceId": "referral_001",
    "description": "Referral bonus for inviting friend",
    "createdBy": "referral_system"
  }'
```

### Spend Transaction
```bash
curl -X POST http://localhost:3000/api/wallet/spend \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "purchase_67890",
    "userId": "user_001",
    "assetTypeId": 1,
    "amount": 25,
    "referenceId": "order_67890",
    "description": "Purchase of in-game item",
    "createdBy": "user_001"
  }'
```

## 🛡️ Concurrency & Reliability

### Concurrency Control Strategy

1. **Database-Level Locking**
   - `SELECT ... FOR UPDATE` locks wallets during transactions
   - Prevents race conditions on balance updates

2. **Deadlock Detection & Retry**
   - Automatic deadlock detection with exponential backoff
   - Configurable retry attempts (default: 3)
   - Transaction isolation level: READ COMMITTED

3. **Idempotency Protection**
   - Unique idempotency keys prevent duplicate transactions
   - Returns existing transaction results on retries
   - Safe for network failures and client retries

### Transaction Flow
1. Validate idempotency key
2. Lock wallets with `FOR UPDATE`
3. Validate business rules (sufficient balance, etc.)
4. Create transaction record
5. Update wallet balances
6. Create double-entry ledger records
7. Commit transaction

## 🔧 Configuration

### Environment Variables
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

### Database Connection Pool
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## 📈 Performance Considerations

### Database Indexes
- Primary keys on all tables
- Composite indexes on frequent queries
- Optimized for balance lookups and transaction history

### Rate Limiting
- Transaction endpoints: 100 requests/minute/IP
- Read endpoints: 1000 requests/minute/IP
- Prevents abuse and ensures fair usage

### Monitoring
- Structured JSON logging
- Request/response timing
- Error tracking and alerting
- Health check endpoints

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Load Testing
The service is designed to handle high concurrent loads. For load testing:
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 📁 Project Structure
```
Internal-Wallet-Service/
├── src/
│   ├── controllers/          # API controllers
│   ├── database/            # Database schemas and migrations
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── validators/          # Input validation
│   └── server.js            # Application entry point
├── logs/                    # Application logs
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker orchestration
├── package.json             # Node.js dependencies
├── setup.sh                 # Setup script
└── README.md               # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

2. **Deadlock Errors**
   - Normal under high concurrency
   - Automatically retried by the system
   - Monitor deadlock frequency

3. **Idempotency Key Conflicts**
   - Use unique keys per transaction
   - Include timestamp in key generation
   - Check existing transactions before retry

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm start
```

### Database Queries
```bash
# Connect to database
docker exec -it wallet-postgres psql -U wallet_user -d wallet_service

# View recent transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

# Check wallet balances
SELECT * FROM wallets ORDER BY user_id, asset_type_id;
```

## 🚀 Production Deployment

### Docker Compose Production
```bash
# Production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Setup
- Use PostgreSQL connection pooling
- Configure proper logging and monitoring
- Set up backup strategies
- Configure load balancer for horizontal scaling

### Security Considerations
- Use environment variables for secrets
- Enable SSL/TLS for database connections
- Implement API authentication
- Regular security updates


