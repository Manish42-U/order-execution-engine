"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOrder = executeOrder;
const database_1 = require("../ db/database");
const orderQueue_1 = require("../queue/orderQueue");
async function executeOrder(request, reply) {
    try {
        const body = request.body;
        // Validate required fields
        if (!body || !body.userId || !body.tokenIn || !body.tokenOut || !body.amount) {
            return reply.status(400).send({
                success: false,
                error: 'Missing required fields: userId, tokenIn, tokenOut, amount'
            });
        }
        const { userId, tokenIn, tokenOut, amount, slippage = 1.0 } = body;
        // Create order in database
        const order = await database_1.db.createOrder({
            userId,
            tokenIn,
            tokenOut,
            amount,
            slippage,
            orderType: 'market', // We chose market order
            status: 'pending'
        });
        // Add to processing queue
        await (0, orderQueue_1.addOrderToQueue)(order.id);
        console.log(`[API] Order created: ${order.id} for user ${userId}`);
        // Return orderId immediately (HTTP response)
        return reply.status(201).send({
            success: true,
            orderId: order.id,
            message: 'Order submitted successfully. Connect to WebSocket for updates.'
        });
    }
    catch (error) {
        console.error('[API] Error creating order:', error);
        return reply.status(500).send({
            success: false,
            error: 'Internal server error'
        });
    }
}
//# sourceMappingURL=order.controller.js.map