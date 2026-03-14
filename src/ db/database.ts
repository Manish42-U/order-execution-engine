


import { config } from 'dotenv';
config();

import { Pool } from 'pg';
import { Order } from '../types/order.types';

// const pool = new Pool({
//   host: process.env.POSTGRES_HOST,
//   port: parseInt(process.env.POSTGRES_PORT || '5432'),
//   database: process.env.POSTGRES_DB,
//   user: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD,
// });
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
      }
);

// Helper function for conversion
function dbRowToOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    tokenIn: row.token_in,
    tokenOut: row.token_out,
    amount: parseFloat(row.amount),
    orderType: row.order_type,
    slippage: parseFloat(row.slippage),
    status: row.status,
    selectedDex: row.selected_dex,
    executionPrice: row.execution_price ? parseFloat(row.execution_price) : undefined,
    txHash: row.tx_hash,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(100) NOT NULL,
        token_in VARCHAR(10) NOT NULL,
        token_out VARCHAR(10) NOT NULL,
        amount DECIMAL NOT NULL,
        order_type VARCHAR(20) DEFAULT 'market',
        slippage DECIMAL DEFAULT 1.0,
        status VARCHAR(20) DEFAULT 'pending',
        selected_dex VARCHAR(20),
        execution_price DECIMAL,
        tx_hash VARCHAR(100),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables created');
  } finally {
    client.release();
  }
}

export const db = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const result = await pool.query(`
      INSERT INTO orders (user_id, token_in, token_out, amount, order_type, slippage, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [order.userId, order.tokenIn, order.tokenOut, order.amount, order.orderType, order.slippage, order.status]);

    return dbRowToOrder(result.rows[0]);
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
      .join(', ');
    
    const values = [orderId, ...Object.values(updates)];
    
    const result = await pool.query(`
      UPDATE orders 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);
    
    return dbRowToOrder(result.rows[0]);
  },

  async getOrder(orderId: string): Promise<Order | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    
    if (!result.rows[0]) {
      return null;
    }
    
    const row = result.rows[0];
    
    return {
      id: row.id,
      userId: row.user_id || '',
      tokenIn: row.token_in || '',
      tokenOut: row.token_out || '',
      amount: parseFloat(row.amount || '0'),
      orderType: row.order_type || 'market',
      slippage: parseFloat(row.slippage || '1.0'),
      status: row.status || 'pending',
      selectedDex: row.selected_dex || undefined,
      executionPrice: row.execution_price ? parseFloat(row.execution_price) : undefined,
      txHash: row.tx_hash || undefined,
      errorMessage: row.error_message || undefined,
      createdAt: row.created_at || new Date(),
      updatedAt: row.updated_at || new Date()
    };
  } catch (error) {
    console.error('[Database] Error getting order:', error);
    return null;
  }
}
};
