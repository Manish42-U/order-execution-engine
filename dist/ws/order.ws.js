"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderWS = registerOrderWS;
const wsManager_1 = require("./wsManager");
function registerOrderWS(app) {
    app.get('/ws/:orderId', { websocket: true }, (connection, req) => {
        const { orderId } = req.params;
        if (!orderId) {
            connection.socket.close();
            return;
        }
        // Add WebSocket connection
        (0, wsManager_1.addConnection)(orderId, connection.socket);
        // Send initial connection message
        connection.socket.send(JSON.stringify({
            orderId,
            status: 'connected',
            timestamp: new Date(),
            message: 'WebSocket connection established for order updates'
        }));
        console.log(`[WebSocket] Client connected for order ${orderId}`);
        // Handle incoming messages
        connection.socket.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log(`[WebSocket] Received from order ${orderId}:`, data);
            }
            catch (error) {
                console.error(`[WebSocket] Error parsing message:`, error);
            }
        });
    });
}
//# sourceMappingURL=order.ws.js.map