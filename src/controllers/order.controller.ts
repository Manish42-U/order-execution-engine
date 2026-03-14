

import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderRequest } from '../types/order.types';
import { OrderProcessor } from '../services/OrderProcessor';
 import { db } from '../db/database';

export async function executeOrder(
  request: FastifyRequest<{ Body: OrderRequest }>,
  reply: FastifyReply
) {
  try {
    const body = request.body;

    if (!body || !body.userId || !body.tokenIn || !body.tokenOut || !body.amount) {
      return reply.status(400).send({ 
        success: false,
        error: 'Missing required fields: userId, tokenIn, tokenOut, amount' 
      });
    }

    const { userId, tokenIn, tokenOut, amount, slippage = 1.0 } = body;

    // Create order in database
    const order = await db.createOrder({
      userId,
      tokenIn,
      tokenOut,
      amount,
      slippage,
      orderType: 'market',
      status: 'pending'
    });

    console.log(`[API] ✅ Order created: ${order.id} for user ${userId}`);

    // ✅ IMMEDIATE PROCESSING
    console.log(`[API] 🚀 IMMEDIATELY starting order processing: ${order.id}`);
    const orderProcessor = new OrderProcessor();
    
    // Don't wait for it - process in background
    orderProcessor.processOrder(order.id).catch(error => {
      console.error(`[API] Processing failed for ${order.id}:`, error);
    });

    // Return orderId immediately
    return reply.status(201).send({ 
      success: true,
      orderId: order.id,
      message: 'Order submitted successfully. Connect to WebSocket for updates.'
    });

  } catch (error) {
    console.error('[API] Error creating order:', error);
    return reply.status(500).send({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}