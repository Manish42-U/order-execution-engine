import { Queue, Worker } from 'bullmq';
export declare const orderQueue: Queue<any, any, string, any, any, string>;
export declare const orderWorker: Worker<any, any, string>;
export declare function addOrderToQueue(orderId: string): Promise<void>;
//# sourceMappingURL=orderQueue.d.ts.map