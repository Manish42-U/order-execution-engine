📋 Project Overview
A high-performance Decentralized Exchange (DEX) Order Execution Engine that processes market orders with real-time WebSocket updates, concurrent order processing, and intelligent DEX routing between Raydium and Meteora.

🎯 Features
⚡ Real-time Order Execution - Market order processing with instant execution

🔄 DEX Routing Intelligence - Automatically selects best price between Raydium and Meteora

📡 Live WebSocket Updates - Real-time order status tracking

🚀 Concurrent Processing - Handles 10+ orders simultaneously

🛡️ Slippage Protection - Configurable slippage tolerance

📊 Order History - Complete audit trail in PostgreSQL

🔄 Retry Logic - Exponential backoff with 3 retry attempts

📈 Queue Management - BullMQ with Redis for scalable processing

🏗️ System Architecture
text
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Client │────▶│ Fastify API │────▶│ BullMQ Queue│────▶│Order Processor│
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                    │                       │                    │
                    │                       │                    │
                    ▼                       ▼                    ▼
             ┌─────────────┐        ┌─────────────┐     ┌─────────────┐
             │ WebSocket   │        │   Redis     │     │  DEX Router │
             │  Updates    │        │  (Queue)    │     │(Raydium/Meteora)│
             └─────────────┘        └─────────────┘     └─────────────┘
                    │                                           │
                    │                                           │
                    ▼                                           ▼
             ┌─────────────┐                            ┌─────────────┐
             │   Client    │                            │ Transaction │
             │ (Real-time) │                            │  Execution  │
             └─────────────┘                            └─────────────┘
🚀 Quick Start
Prerequisites
Node.js 18+

Docker & Docker Compose

PostgreSQL 15+

Redis 7+

Installation
bash
# 1. Clone repository
git clone https://github.com/yourusername/order-execution-engine.git
cd order-execution-engine

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start services with Docker
docker-compose up -d

# 5. Run the application
npm run dev

# Server starts at: http://localhost:3000
Docker Setup (Recommended)
bash
# Complete setup with Docker
docker-compose up --build

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f app
📡 API Documentation
Base URL
text
http://localhost:3000  # Local
1. Create Order
http
POST /api/orders/execute
Content-Type: application/json

{
  "userId": "user-123",
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amount": 1.5,
  "slippage": 1.0
}
Response:

json
{
  "success": true,
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "message": "Order submitted successfully. Connect to WebSocket for updates."
}
2. WebSocket Real-time Updates
javascript
// Connect to WebSocket for order updates
const ws = new WebSocket('ws://localhost:3000/ws/{orderId}');

// Receive real-time status updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Status:', update.status);
  // Status flow: pending → routing → building → submitted → confirmed/failed
};
WebSocket Messages:

json
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "confirmed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "selectedDex": "raydium",
    "executionPrice": 98.50,
    "txHash": "0xfd5d4fa270b67f1a1088d620631ef41556a285f03640787e83d1a6da670cd371"
  }
}
3. Get Order Status
http
GET /api/orders/:orderId
Response:

json
{
  "success": true,
  "order": {
    "id": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
    "userId": "user-123",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": 1.5,
    "status": "confirmed",
    "selectedDex": "raydium",
    "executionPrice": 98.50,
    "txHash": "0xfd5d4fa270b67f1a1088d620631ef41556a285f03640787e83d1a6da670cd371",
    "createdAt": "2024-01-15T10:29:45.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
4. Health Check
http
GET /health
Response:

json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Order Execution Engine",
  "version": "1.0.0"
}
🔧 Configuration
Environment Variables (.env)
env
# Server
PORT=3000
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=order_engine
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# Queue Settings
MAX_CONCURRENT_ORDERS=10
MAX_RETRY_ATTEMPTS=3

# DEX Settings
MOCK_NETWORK_DELAY_MS=200
MOCK_EXECUTION_DELAY_MS=2500
Order Status Flow
text
1. pending    → Order received and queued
2. routing   → Comparing DEX prices (Raydium vs Meteora)
3. building  → Creating transaction
4. submitted → Transaction sent to network
5. confirmed → Transaction successful (includes txHash)
6. failed    → If any step fails (includes error)
🎯 Design Decisions
Why Market Order?
We implemented Market Order because:

Simplest to implement - No price monitoring required

Most common DEX order type - Immediate execution at best available price

Easily extendable - Can be extended to Limit and Sniper orders

DEX Routing Logic
The system intelligently routes orders using this algorithm:

typescript
1. Fetch quotes from both Raydium and Meteora
2. Calculate effective price: price * (1 - fee)
3. Compare effective prices
4. Select DEX with best effective price
5. Log routing decision for transparency
How to Extend to Other Order Types?
typescript
// 1. Limit Order Extension
- Add price monitoring service
- Store target price in order object
- Execute when market price reaches target

// 2. Sniper Order Extension  
- Add token launch detection
- Monitor new pool creation on DEXs
- Execute immediately on liquidity addition





ws://localhost:3000/ws/750c1645-ce8e-4ad7-a6c1-0c62e8e2bfbb









📋 AB TAK BANA HUA SAB KUCH:
✅ COMPLETE WORKING FEATURES:
1. ✅ Order Creation API (POST)
Endpoint: POST /api/orders/execute

Example Request:

bash
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john-doe-123",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": 2.5,
    "slippage": 1.0
  }'
Response:

json
{
  "success": true,
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "message": "Order submitted successfully. Connect to WebSocket for updates."
}
2. ✅ Get Order Status API (GET)
Endpoint: GET /api/orders/:orderId

Example Request:

bash
curl http://localhost:3000/api/orders/94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955
Response:

json
{
  "success": true,
  "order": {
    "id": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
    "userId": "john-doe-123",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": 2.5,
    "status": "confirmed",
    "selectedDex": "raydium",
    "executionPrice": 98.75,
    "txHash": "0xfd5d4fa270b67f1a1088d620631ef41556a285f03640787e83d1a6da670cd371",
    "createdAt": "2024-01-15T11:14:04.438Z",
    "updatedAt": "2024-01-15T11:14:07.532Z"
  }
}
3. ✅ Health Check API (GET)
Endpoint: GET /health

Example Request:

bash
curl http://localhost:3000/health
Response:

json
{
  "status": "OK",
  "timestamp": "2024-01-15T11:15:00.000Z",
  "service": "Order Execution Engine"
}
4. ✅ WebSocket Real-time Updates (GET)
Endpoint: GET /ws/:orderId (WebSocket protocol)

Example Connection:

bash
# Install wscat if not installed
npm install -g wscat

# Connect to WebSocket with orderId
wscat -c "ws://localhost:3000/ws/94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955"
WebSocket Messages You Receive:

json
// 1. Connection Established
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "connected",
  "timestamp": "2024-01-15T11:14:04.438Z",
  "message": "Ready to receive order status updates"
}

// 2. Status Update: Routing
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "routing",
  "timestamp": "2024-01-15T11:14:05.000Z",
  "data": null
}

// 3. Status Update: Building
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "building",
  "timestamp": "2024-01-15T11:14:05.500Z",
  "data": null
}

// 4. Status Update: Submitted
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "submitted",
  "timestamp": "2024-01-15T11:14:06.000Z",
  "data": null
}

// 5. Status Update: Confirmed ✅
{
  "orderId": "94c6d1d0-a7fd-4e60-8d25-8f0ebee2d955",
  "status": "confirmed",
  "timestamp": "2024-01-15T11:14:07.532Z",
  "data": {
    "selectedDex": "raydium",
    "executionPrice": 98.75,
    "txHash": "0xfd5d4fa270b67f1a1088d620631ef41556a285f03640787e83d1a6da670cd371"
  }
}
🎯 COMPLETE WORKFLOW EXAMPLE:
Step-by-Step Complete Test:
Step 1: Start the Server
bash
cd order-execution-engine
npm run dev

# Output:
# ✅ Database tables created
# 🚀 Order Execution Engine Started!
# 📍 Port: 3000
Step 2: Create an Order (Terminal 1)
bash
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-trader",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": 3.0,
    "slippage": 0.5
  }'

# Save the orderId from response: "orderId": "abc123-def456"
Step 3: Connect WebSocket (Terminal 2)
bash
# Use the orderId from Step 2
wscat -c "ws://localhost:3000/ws/abc123-def456"

# You'll immediately see:
# {"orderId":"abc123-def456","status":"connected","timestamp":"...","message":"Ready to receive order status updates"}
Step 4: Watch Real-time Updates
In Terminal 2 (WebSocket), you'll see live updates every 1-2 seconds:

text
{"orderId":"abc123-def456","status":"routing","timestamp":"...","data":null}
{"orderId":"abc123-def456","status":"building","timestamp":"...","data":null}
{"orderId":"abc123-def456","status":"submitted","timestamp":"...","data":null}
{"orderId":"abc123-def456","status":"confirmed","timestamp":"...","data":{"selectedDex":"raydium","executionPrice":99.25,"txHash":"0x..."}}
Step 5: Check Order Status (Terminal 3)
bash
curl http://localhost:3000/api/orders/abc123-def456

# Response shows complete order details with final status
🔧 SERVER LOGS (What You See in npm run dev Terminal):
text
✅ Database tables created
🚀 Order Execution Engine Started!
📍 Port: 3000

[API] Order created: abc123-def456 for user test-trader
[Queue] Added order abc123-def456 to processing queue
[Queue] Processing order abc123-def456 (Job ID: abc123-def456)
[Status Update] Order abc123-def456: pending
[Status Update] Order abc123-def456: routing

[DEX Router] Getting quotes for SOL → USDC (3.0)
[DEX Router] Selected Raydium. Price: 99.5, Effective: 99.2015
[DEX Router] Routing Decision:
  - Raydium: $99.5 (0.3% fee) → Effective: $99.2015
  - Meteora: $98.8 (0.2% fee) → Effective: $98.6024
  - Selected: RAYDIUM

[Status Update] Order abc123-def456: building
[Status Update] Order abc123-def456: submitted

[DEX Router] Executing swap on RAYDIUM
[DEX Router] Swap executed:
  - DEX: raydium
  - TX Hash: 0xfd5d4fa270b67f1a1088d620631ef41556a285f03640787e83d1a6da670cd371
  - Executed Price: $99.25

[Status Update] Order abc123-def456: confirmed
[Order Processor] Order abc123-def456 completed successfully
[Queue] Job abc123-def456 completed