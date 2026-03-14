import { WebSocket } from "ws";

export async function simulateOrderStatus(ws: WebSocket, orderId: string) {
  const statuses = ["pending", "routing", "building", "submitted", "confirmed"];

  for (const status of statuses) {
    ws.send(JSON.stringify({ orderId, status }));
    await new Promise(res => setTimeout(res, 1000)); // 1 second delay
  }
}
