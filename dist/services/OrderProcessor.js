"use strict";
// import { Order, OrderStatus } from '../types/order.types';
// import { DEXRouter } from './DEXRouter';
// import { db } from '../ db/database';
// import { broadcastOrderStatus } from '../ws/wsManager';
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = void 0;
const DEXRouter_1 = require("./DEXRouter");
const database_1 = require("../ db/database");
const wsManager_1 = require("../ws/wsManager");
class OrderProcessor {
    constructor() {
        this.dexRouter = new DEXRouter_1.DEXRouter();
    }
    async processOrder(orderId) {
        try {
            // Get order from database
            const order = await database_1.db.getOrder(orderId);
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            // 1. Pending → Routing
            await this.updateOrderStatus(orderId, 'routing');
            // 2. Get best quote from DEXs
            const bestQuote = await this.dexRouter.getBestQuote(order.tokenIn, order.tokenOut, order.amount);
            // Update order with selected DEX
            await database_1.db.updateOrder(orderId, {
                selectedDex: bestQuote.dex
            });
            // 3. Building transaction
            await this.updateOrderStatus(orderId, 'building');
            // Simulate transaction building delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // 4. Submitted to network
            await this.updateOrderStatus(orderId, 'submitted');
            // 5. Execute swap with retry logic
            const result = await this.executeWithRetry(() => this.dexRouter.executeSwap(bestQuote.dex, order), parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'));
            // 6. Confirmed
            await database_1.db.updateOrder(orderId, {
                status: 'confirmed',
                executionPrice: result.executedPrice,
                txHash: result.txHash
            });
            // ✅ FIX: Convert object to JSON string
            await this.updateOrderStatus(orderId, 'confirmed', {
                selectedDex: bestQuote.dex,
                executionPrice: result.executedPrice,
                txHash: result.txHash
            });
            console.log(`[Order Processor] Order ${orderId} completed successfully`);
        }
        catch (error) {
            console.error(`[Order Processor] Order ${orderId} failed:`, error);
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
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError ?? new Error('Retry failed: unknown error');
    }
    async updateOrderStatus(orderId, status, data) {
        // Update database
        await database_1.db.updateOrder(orderId, { status });
        // ✅ FIX: Create message object and stringify it
        const message = {
            orderId,
            status,
            timestamp: new Date(),
            data
        };
        // Send WebSocket update as JSON string
        (0, wsManager_1.broadcastOrderStatus)(orderId, JSON.stringify(message));
        console.log(`[Status Update] Order ${orderId}: ${status}`);
    }
}
exports.OrderProcessor = OrderProcessor;
//# sourceMappingURL=OrderProcessor.js.map