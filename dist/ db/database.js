"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.createTables = createTables;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.POSTGRES_URL,
});
async function createTables() {
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
    }
    finally {
        client.release();
    }
}
exports.db = {
    async createOrder(order) {
        const result = await pool.query(`
      INSERT INTO orders (user_id, token_in, token_out, amount, order_type, slippage, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [order.userId, order.tokenIn, order.tokenOut, order.amount, order.orderType, order.slippage, order.status]);
        return result.rows[0];
    },
    async updateOrder(orderId, updates) {
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
        return result.rows[0];
    },
    async getOrder(orderId) {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        return result.rows[0] || null;
    },
};
//# sourceMappingURL=database.js.map