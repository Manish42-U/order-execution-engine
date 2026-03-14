"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateOrderStatus = simulateOrderStatus;
async function simulateOrderStatus(ws, orderId) {
    const statuses = ["pending", "routing", "building", "submitted", "confirmed"];
    for (const status of statuses) {
        ws.send(JSON.stringify({ orderId, status }));
        await new Promise(res => setTimeout(res, 1000)); // 1 second delay
    }
}
//# sourceMappingURL=orderStatus.service.js.map