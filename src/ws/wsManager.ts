

import WebSocket from 'ws';

// Store connections by orderId
const connections = new Map<string, WebSocket>();

export function addConnection(orderId: string, socket: WebSocket): void {
  console.log(`[WS Manager] Adding connection for ${orderId}`);
  
  // Remove existing connection if any
  const existing = connections.get(orderId);
  if (existing && existing.readyState === WebSocket.OPEN) {
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

export function broadcastOrderStatus(orderId: string, data: any): void {
  const socket = connections.get(orderId);
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log(`[WS Manager] No active WebSocket for ${orderId}`);
    return;
  }
  
  try {
    socket.send(JSON.stringify(data));
    console.log(`[WS Manager] Sent update to ${orderId}:`, data.status);
  } catch (err) {
    console.error(`[WS Manager] Send failed for ${orderId}:`, err);
    connections.delete(orderId);
  }
}