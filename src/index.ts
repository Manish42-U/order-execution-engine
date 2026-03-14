import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import dotenv from 'dotenv';
import { orderRoutes } from './routes/order.routes';  // ✅ Remove .js extension
import { registerOrderWS } from './ws/order.ws';      // ✅ Remove .js extension
import { createTables } from './db/database';

dotenv.config();

const app = Fastify({ 
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
app.register(websocketPlugin);

// Register routes
app.register(orderRoutes);

// Register WebSocket routes
registerOrderWS(app);

const start = async () => {
  try {
    // Initialize database
    await createTables();
    
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
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();