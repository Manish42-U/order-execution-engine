export interface OrderRequest {
    userId: string;
    tokenIn: string;
    tokenOut: string;
    amount: number;
    slippage?: number;
}
export interface Order {
    id: string;
    userId: string;
    tokenIn: string;
    tokenOut: string;
    amount: number;
    slippage: number;
    orderType: 'market' | 'limit' | 'sniper';
    status: OrderStatus;
    selectedDex?: 'raydium' | 'meteora';
    executionPrice?: number;
    txHash?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type OrderStatus = 'pending' | 'routing' | 'building' | 'submitted' | 'confirmed' | 'failed';
export interface WebSocketMessage {
    orderId: string;
    status: OrderStatus;
    timestamp: Date;
    data?: {
        selectedDex?: string;
        executionPrice?: number;
        txHash?: string;
        error?: string;
    };
}
export interface DEXQuote {
    price: number;
    fee: number;
    dex: 'raydium' | 'meteora';
}
//# sourceMappingURL=order.types.d.ts.map