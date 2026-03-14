"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const dotenv_1 = __importDefault(require("dotenv"));
const order_routes_1 = require("./routes/order.routes"); // ✅ Remove .js extension
const order_ws_1 = require("./ws/order.ws"); // ✅ Remove .js extension
const database_1 = require("./db/database");
dotenv_1.default.config();
const app = (0, fastify_1.default)({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        }
    }
});
// Register WebSocket plugin
app.register(websocket_1.default);
// Register routes
app.register(order_routes_1.orderRoutes);
// Register WebSocket routes
(0, order_ws_1.registerOrderWS)(app);
const start = async () => {
    try {
        // Initialize database
        await (0, database_1.createTables)();
        const PORT = parseInt(process.env.PORT || '3000');
        await app.listen({
            port: PORT,
            host: '0.0.0.0'
        });
        console.log(`
    🚀 Order Execution Engine Started!
    📍 Port: ${PORT}
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    
    📝 Available Endpoints:
    POST   /api/orders/execute  - Submit new order
    GET    /api/orders/:orderId - Get order status
    GET    /health             - Health check
    GET    /ws/:orderId        - WebSocket for real-time updates
    
    ⚡ WebSocket Flow:
    1. POST /api/orders/execute to create order
    2. GET /ws/{orderId} to connect WebSocket
    3. Receive real-time status updates
    
    📊 System Configuration:
    - Max Concurrent Orders: ${process.env.MAX_CONCURRENT_ORDERS || 10}
    - Max Retry Attempts: ${process.env.MAX_RETRY_ATTEMPTS || 3}
    - Orders per minute: 100
    `);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map