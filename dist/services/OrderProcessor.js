"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = void 0;
const DEXRouter_1 = require("./DEXRouter");
const wsManager_1 = require("../ws/wsManager");
const database_1 = require("../ db/database");
class OrderProcessor {
    constructor() {
        this.dexRouter = new DEXRouter_1.DEXRouter();
    }
    async processOrder(orderId) {
        console.log(`[OrderProcessor] 🚀 START processing order: ${orderId}`);
        try {
            // Get order from database
            const order = await database_1.db.getOrder(orderId);
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
            const bestQuote = await this.dexRouter.getBestQuote(order.tokenIn, order.tokenOut, order.amount);
            console.log(`[OrderProcessor] Selected DEX: ${bestQuote.dex}`);
            // Update order with selected DEX
            await database_1.db.updateOrder(orderId, {
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
            const result = await this.executeWithRetry(() => this.dexRouter.executeSwap(bestQuote.dex, order), parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'));
            // 6. Confirmed
            console.log(`[OrderProcessor] Step 4: confirmed`);
            await database_1.db.updateOrder(orderId, {
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
        }
        catch (error) {
            console.error(`[OrderProcessor] ❌ Order ${orderId} failed:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            await database_1.db.updateOrder(orderId, {
                status: 'failed',
                errorMessage
            });
            await this.updateOrderStatus(orderId, 'failed', {
                error: errorMessage
            });
        }
    }
    async executeWithRetry(fn, maxRetries) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
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
    async updateOrderStatus(orderId, status, data) {
        try {
            // Update database
            await database_1.db.updateOrder(orderId, { status });
            // Create WebSocket message
            const message = {
                orderId,
                status,
                timestamp: new Date(),
                data
            };
            // Send WebSocket update
            (0, wsManager_1.broadcastOrderStatus)(orderId, message);
            console.log(`[Status Update] Order ${orderId}: ${status}`);
            // Add small delay between status updates for demo visibility
            if (status !== 'confirmed' && status !== 'failed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        catch (error) {
            console.error(`[Status Update] Failed to update status for ${orderId}:`, error);
        }
    }
}
exports.OrderProcessor = OrderProcessor;
//# sourceMappingURL=OrderProcessor.js.map