"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderWorker = exports.orderQueue = void 0;
exports.addOrderToQueue = addOrderToQueue;
// src/queue/orderQueue.ts
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const OrderProcessor_1 = require("../services/OrderProcessor");
const connection = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null, // ✅ Required by BullMQ
});
exports.orderQueue = new bullmq_1.Queue('orders', {
    connection,
    defaultJobOptions: {
        attempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        backoff: { type: 'exponential', delay: 1000 },
    },
});
const orderProcessor = new OrderProcessor_1.OrderProcessor();
exports.orderWorker = new bullmq_1.Worker('orders', async (job) => {
    const { orderId } = job.data;
    console.log(`[Queue] Processing order ${orderId} (Job ID: ${job.id})`);
    await orderProcessor.processOrder(orderId);
}, {
    connection,
    concurrency: parseInt(process.env.MAX_CONCURRENT_ORDERS || '10'),
    limiter: { max: 100, duration: 60 * 1000 },
});
exports.orderWorker.on('completed', (job) => console.log(`[Queue] Job ${job.id} completed`));
exports.orderWorker.on('failed', (job, err) => console.error(`[Queue] Job ${job?.id} failed:`, err));
async function addOrderToQueue(orderId) {
    await exports.orderQueue.add('process-order', { orderId }, { jobId: orderId });
    console.log(`[Queue] Added order ${orderId} to processing queue`);
}
//# sourceMappingURL=orderQueue.js.map