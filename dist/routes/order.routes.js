"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const order_controller_1 = require("../controllers/order.controller");
async function orderRoutes(app) {
    app.post('/api/orders/execute', order_controller_1.executeOrder);
    // Additional REST endpoints
    app.get('/api/orders/:orderId', async (request, reply) => {
        try {
            const { orderId } = request.params;
            const order = await (await Promise.resolve().then(() => __importStar(require('../db/database.js')))).db.getOrder(orderId);
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
        }
        catch (error) {
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
//# sourceMappingURL=order.routes.js.map