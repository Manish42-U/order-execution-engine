import WebSocket from "ws";
export declare const connectedClients: Record<string, Set<WebSocket>>;
/**
 * Add a WebSocket connection for a specific order
 */
export declare function addConnection(orderId: string, socket: WebSocket): void;
/**
 * Broadcast a message to all clients connected to a specific order
 */
export declare function broadcastOrderStatus(orderId: string, status: string, data?: Record<string, any>): void;
//# sourceMappingURL=wsManager.d.ts.map