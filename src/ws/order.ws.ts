

import { FastifyInstance } from 'fastify';
import { addConnection } from './wsManager';

export function registerOrderWS(app: FastifyInstance) {
  console.log('[WebSocket] Initializing with Fastify WebSocket');
  
  // Register the WebSocket route
  app.register(async function (fastify) {
    fastify.get('/ws/:orderId', { websocket: true }, async (connection, req) => {
      const { socket } = connection;
      const request = req as any;
      
      console.log('[WebSocket] Connection attempt received');
      
      // DEBUG: Log everything
      console.log('[WebSocket] DEBUG - Request object structure:', {
        hasRaw: !!request?.raw,
        rawKeys: request?.raw ? Object.keys(request.raw) : [],
        hasParams: !!request?.params,
        params: request?.params,
        url: request?.url,
        originalUrl: request?.originalUrl,
        path: request?.path,
        pathParams: request?.pathParams
      });
      
      // Try to get orderId from various sources
      let orderId: string | undefined;
      
      // Source 1: From the path parameters (most reliable)
      if (request?.params?.orderId) {
        orderId = request.params.orderId;
        console.log('[WebSocket] Got orderId from params:', orderId);
      }
      
      // Source 2: From the URL path
      if (!orderId) {
        // Try to get the URL from various places
        const possibleUrl = request?.raw?.url || request?.url || request?.originalUrl;
        if (possibleUrl) {
          const match = possibleUrl.match(/\/ws\/([^\/\?]+)/);
          if (match) {
            orderId = match[1];
            console.log('[WebSocket] Got orderId from URL:', orderId);
          }
        }
      }
      
      // Source 3: From path parameters if URL parsing didn't work
      if (!orderId && request?.pathParams) {
        orderId = (request.pathParams as any).orderId;
        console.log('[WebSocket] Got orderId from pathParams:', orderId);
      }
      
      console.log('[WebSocket] Final orderId:', orderId);
      
      if (!orderId) {
        console.error('[WebSocket] Failed to extract orderId');
        socket.close(1008, 'Invalid order ID');
        return;
      }
      
      // SUCCESS - We have orderId
      console.log(`[WebSocket] 🎉 Successfully connected for order: ${orderId}`);
      
      // Store connection
      addConnection(orderId, socket);
      
      // Send connection confirmation
      setTimeout(() => {
        if (socket.readyState === 1) { // OPEN
          socket.send(JSON.stringify({
            orderId,
            status: 'connected',
            timestamp: new Date().toISOString(),
            message: 'Ready to receive order status updates'
          }));
        }
      }, 100);
      
      // Event handlers
      socket.on('message', (data) => {
        console.log(`[WebSocket ${orderId}] Message:`, data.toString());
      });
      
      socket.on('error', (error) => {
        console.error(`[WebSocket ${orderId}] Error:`, error);
      });
      
      socket.on('close', () => {
        console.log(`[WebSocket ${orderId}] Disconnected`);
      });
    });
  });
}