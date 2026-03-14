// src/queue/orderQueue.ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { OrderProcessor } from '../services/OrderProcessor';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // ✅ Required by BullMQ
});

export const orderQueue = new Queue('orders', {
  connection,
  defaultJobOptions: {
    attempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
    backoff: { type: 'exponential', delay: 1000 },
  },
});

const orderProcessor = new OrderProcessor();

export const orderWorker = new Worker(
  'orders',
  async (job) => {
    const { orderId } = job.data;
    console.log(`[Queue] Processing order ${orderId} (Job ID: ${job.id})`);
    await orderProcessor.processOrder(orderId);
  },
  {
    connection,
    concurrency: parseInt(process.env.MAX_CONCURRENT_ORDERS || '10'),
    limiter: { max: 100, duration: 60 * 1000 },
  }
);

orderWorker.on('completed', (job) => console.log(`[Queue] Job ${job.id} completed`));
orderWorker.on('failed', (job, err) => console.error(`[Queue] Job ${job?.id} failed:`, err));

export async function addOrderToQueue(orderId: string): Promise<void> {
  await orderQueue.add('process-order', { orderId }, { jobId: orderId });
  console.log(`[Queue] Added order ${orderId} to processing queue`);
}
