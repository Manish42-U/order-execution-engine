import { Order } from '../types/order.types';
export declare function createTables(): Promise<void>;
export declare const db: {
    createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;
    updateOrder(orderId: string, updates: Partial<Order>): Promise<Order>;
    getOrder(orderId: string): Promise<Order | null>;
};
//# sourceMappingURL=database.d.ts.map