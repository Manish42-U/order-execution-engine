"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectedClients = void 0;
exports.addConnection = addConnection;
exports.broadcastOrderStatus = broadcastOrderStatus;
const ws_1 = __importDefault(require("ws"));
// Track WebSocket connections by orderId
exports.connectedClients = {};
/**
 * Add a WebSocket connection for a specific order
 */
function addConnection(orderId, socket) {
    if (!exports.connectedClients[orderId]) {
        exports.connectedClients[orderId] = new Set();
    }
    exports.connectedClients[orderId].add(socket);
    // Clean up on socket close
    socket.on("close", () => {
        exports.connectedClients[orderId].delete(socket);
        if (exports.connectedClients[orderId].size === 0) {
            delete exports.connectedClients[orderId];
        }
    });
}
/**
 * Broadcast a message to all clients connected to a specific order
 */
function broadcastOrderStatus(orderId, status, data) {
    const msg = JSON.stringify({
        orderId,
        status,
        timestamp: new Date(),
        data,
    });
    const sockets = exports.connectedClients[orderId];
    if (!sockets)
        return;
    sockets.forEach((ws) => {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.send(msg);
        }
    });
}
//# sourceMappingURL=wsManager.js.map