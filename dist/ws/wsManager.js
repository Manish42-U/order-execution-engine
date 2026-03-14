"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addConnection = addConnection;
exports.broadcastOrderStatus = broadcastOrderStatus;
const ws_1 = __importDefault(require("ws"));
// Store connections by orderId
const connections = new Map();
function addConnection(orderId, socket) {
    console.log(`[WS Manager] Adding connection for ${orderId}`);
    // Remove existing connection if any
    const existing = connections.get(orderId);
    if (existing && existing.readyState === ws_1.default.OPEN) {
        existing.close();
    }
    // Store new connection
    connections.set(orderId, socket);
    // Clean up on close
    socket.on('close', () => {
        console.log(`[WS Manager] Connection removed for ${orderId}`);
        connections.delete(orderId);
    });
    socket.on('error', (err) => {
        console.error(`[WS Manager] Error for ${orderId}:`, err);
        connections.delete(orderId);
    });
}
function broadcastOrderStatus(orderId, data) {
    const socket = connections.get(orderId);
    if (!socket || socket.readyState !== ws_1.default.OPEN) {
        console.log(`[WS Manager] No active WebSocket for ${orderId}`);
        return;
    }
    try {
        socket.send(JSON.stringify(data));
        console.log(`[WS Manager] Sent update to ${orderId}:`, data.status);
    }
    catch (err) {
        console.error(`[WS Manager] Send failed for ${orderId}:`, err);
        connections.delete(orderId);
    }
}
//# sourceMappingURL=wsManager.js.map