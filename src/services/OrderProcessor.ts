
import { Order, OrderStatus, WebSocketMessage } from '../types/order.types';
import { DEXRouter } from './DEXRouter';
import { broadcastOrderStatus } from '../ws/wsManager';
 import { db } from '../db/database';

export class OrderProcessor {
  private dexRouter = new DEXRouter();

  async processOrder(orderId: string): Promise<void> {
    console.log(`[OrderProcessor] 🚀 START processing order: ${orderId}`);
    
    try {
      // Get order from database
      const order = await db.getOrder(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      console.log(`[OrderProcessor] Order data:`, {
        userId: order.userId,
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amount: order.amount
      });

      // 1. Pending → Routing
      console.log(`[OrderProcessor] Step 1: routing`);
      await this.updateOrderStatus(orderId, 'routing');
      
      // 2. Get best quote from DEXs
      console.log(`[OrderProcessor] Getting DEX quotes...`);
      const bestQuote = await this.dexRouter.getBestQuote(
        order.tokenIn,
        order.tokenOut,
        order.amount
      );

      console.log(`[OrderProcessor] Selected DEX: ${bestQuote.dex}`);

      // Update order with selected DEX
      await db.updateOrder(orderId, {
        selectedDex: bestQuote.dex
      });

      // 3. Building transaction
      console.log(`[OrderProcessor] Step 2: building`);
      await this.updateOrderStatus(orderId, 'building');

      // Simulate transaction building delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Submitted to network
      console.log(`[OrderProcessor] Step 3: submitted`);
      await this.updateOrderStatus(orderId, 'submitted');

      // 5. Execute swap with retry logic
      console.log(`[OrderProcessor] Executing swap on ${bestQuote.dex}...`);
      const result = await this.executeWithRetry(
        () => this.dexRouter.executeSwap(bestQuote.dex, order),
        parseInt(process.env.MAX_RETRY_ATTEMPTS || '3')
      );

      // 6. Confirmed
      console.log(`[OrderProcessor] Step 4: confirmed`);
      await db.updateOrder(orderId, {
        status: 'confirmed',
        executionPrice: result.executedPrice,
        txHash: result.txHash
      });

      await this.updateOrderStatus(orderId, 'confirmed', {
        selectedDex: bestQuote.dex,
        executionPrice: result.executedPrice,
        txHash: result.txHash
      });

      console.log(`[OrderProcessor] ✅ Order ${orderId} completed successfully`);

    } catch (error) {
      console.error(`[OrderProcessor] ❌ Order ${orderId} failed:`, error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      await db.updateOrder(orderId, {
        status: 'failed',
        errorMessage
      });

      await this.updateOrderStatus(orderId, 'failed', {
        error: errorMessage
      });
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`[Retry] Attempt ${attempt} failed: ${error}`);

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[Retry] Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error('Retry failed: unknown error');
  }

  private async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Update database
      await db.updateOrder(orderId, { status });

      // Create WebSocket message
      const message: WebSocketMessage = {
        orderId,
        status,
        timestamp: new Date(),
        data
      };

      // Send WebSocket update
      broadcastOrderStatus(orderId, message);

      console.log(`[Status Update] Order ${orderId}: ${status}`);
      
      // Add small delay between status updates for demo visibility
      if (status !== 'confirmed' && status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`[Status Update] Failed to update status for ${orderId}:`, error);
    }
  }
}