import { DEXQuote, Order } from '../types/order.types';
export declare class DEXRouter {
    private basePrices;
    private sleep;
    private getBasePrice;
    private generateMockTxHash;
    getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DEXQuote>;
    getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DEXQuote>;
    getBestQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DEXQuote>;
    executeSwap(dex: 'raydium' | 'meteora', order: Order): Promise<{
        txHash: string;
        executedPrice: number;
    }>;
}
//# sourceMappingURL=DEXRouter.d.ts.map