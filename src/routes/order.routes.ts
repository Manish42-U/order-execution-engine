import { FastifyInstance } from 'fastify';
import { executeOrder } from '../controllers/order.controller';

export async function orderRoutes(app: FastifyInstance) {
  app.post('/api/orders/execute', executeOrder);
  
  // Additional REST endpoints
  app.get('/api/orders/:orderId', async (request, reply) => {
    try {
      const { orderId } = request.params as { orderId: string };
      const order = await (await import('../db/database.js')).db.getOrder(orderId);
      
      if (!order) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Order not found' 
        });
      }
      
      return reply.send({ 
        success: true, 
        order 
      });
    } catch (error) {
      return reply.status(500).send({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  app.get('/health', async (_, reply) => {
    return reply.send({ 
      status: 'OK', 
      timestamp: new Date(),
      service: 'Order Execution Engine'
    });
  });
}