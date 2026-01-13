const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows backend to read JSON data sent from frontend

// ===========================================
// 1. DROPDOWN DATA (Flowers, Vendors, Customers)
// ===========================================

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Success!', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Get all flowers for the dropdown
app.get('/flowers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM flowers ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Get all customers for the search bar
app.get('/customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Get all vendors for the dropdown
app.get('/vendors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vendors ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// ===========================================
// 2. DAILY TRANSACTIONS (The Core Features)
// ===========================================

// LOG A SALE (Outward to Customer)
app.post('/sales', async (req, res) => {
    try {
        // We receive the "Daily Rate" and "Unit" from the frontend here
        const { customer_id, flower_id, quantity, unit, rate_per_unit } = req.body;
        
        const newSale = await pool.query(
            `INSERT INTO sales (customer_id, flower_id, quantity, unit, rate_per_unit) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [customer_id, flower_id, quantity, unit, rate_per_unit]
        );

        res.json(newSale.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// LOG A PURCHASE (Inward from Vendor)
app.post('/purchases', async (req, res) => {
    try {
        const { vendor_id, flower_id, quantity, unit, rate_per_unit } = req.body;
        
        const newPurchase = await pool.query(
            `INSERT INTO purchases (vendor_id, flower_id, quantity, unit, rate_per_unit) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [vendor_id, flower_id, quantity, unit, rate_per_unit]
        );

        res.json(newPurchase.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.post('/add-party', async (req, res) => {
    try {
        const { type, name, location, phone } = req.body;
        const table = type === 'CUSTOMER' ? 'customers' : 'vendors';
        
        const newParty = await pool.query(
            `INSERT INTO ${table} (name, location, phone) VALUES ($1, $2, $3) RETURNING *`,
            [name, location, phone]
        );
        res.json(newParty.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error adding party");
    }
});

// 2. RECORD A PAYMENT (Money In / Money Out)
app.post('/payments', async (req, res) => {
    try {
        const { party_type, party_id, amount, transaction_type, method, date } = req.body;
        
        const newPayment = await pool.query(
            `INSERT INTO payments (party_type, party_id, amount, transaction_type, method, date) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [party_type, party_id, amount, transaction_type, method, date]
        );
        res.json(newPayment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error recording payment");
    }
});

// 3. GET VENDOR HISTORY
app.get('/vendor-history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                p.date,
                f.name as flower_name,
                p.quantity,
                p.unit,
                p.rate_per_unit,
                p.total_amount
            FROM purchases p
            JOIN flowers f ON p.flower_id = f.id
            WHERE p.vendor_id = $1
            ORDER BY p.date DESC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// 4. GET VENDOR BALANCE
app.get('/vendor-balance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Total we bought from them (Credit to them)
        const purchRes = await pool.query(
            'SELECT COALESCE(SUM(total_amount), 0) as total_bought FROM purchases WHERE vendor_id = $1', [id]
        );
        // Total we paid them (Debit from us)
        const payRes = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total_paid 
             FROM payments 
             WHERE party_id = $1 AND party_type = 'VENDOR'`,
            [id]
        );
        const totalBought = parseFloat(purchRes.rows[0].total_bought);
        const totalPaid = parseFloat(payRes.rows[0].total_paid);
        // Positive means we owe them
        res.json({ total_purchased: totalBought, total_paid: totalPaid, current_outstanding_balance: totalBought - totalPaid });
    } catch (err) { console.error(err); }
});

// ===========================================
// 3. FINANCIAL REPORTS (The Ledger)
// ===========================================

// GET CUSTOMER BALANCE (The "Big Number" on the screen)
// Formula: (Total Sales) - (Total Payments Received)
app.get('/customer-balance/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Calculate Total Debt (What they bought)
        const salesRes = await pool.query(
            'SELECT COALESCE(SUM(total_amount), 0) as total_debt FROM sales WHERE customer_id = $1',
            [id]
        );

        // 2. Calculate Total Paid (What they gave you)
        const payRes = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total_paid 
             FROM payments 
             WHERE party_id = $1 AND party_type = 'CUSTOMER' AND transaction_type = 'CREDIT'`,
            [id]
        );

        const totalDebt = parseFloat(salesRes.rows[0].total_debt);
        const totalPaid = parseFloat(payRes.rows[0].total_paid);
        const currentBalance = totalDebt - totalPaid;

        res.json({
            customer_id: id,
            total_purchased: totalDebt,
            total_paid: totalPaid,
            current_outstanding_balance: currentBalance
        });

    } catch (err) {
        console.error(err.message);
    }
});

// GET CUSTOMER HISTORY (Detailed list of sales)
app.get('/customer-history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                s.date,
                f.name as flower_name,
                s.quantity,
                s.unit,
                s.rate_per_unit,
                s.total_amount
            FROM sales s
            JOIN flowers f ON s.flower_id = f.id
            WHERE s.customer_id = $1
            ORDER BY s.date DESC
        `, [id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// // GET BALANCE SHEET (All Transactions Combined)
// app.get('/balance-sheet', async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 s.date, 
//                 'SALE' as type, 
//                 c.name as party_name,
//                 f.name as flower_name,
//                 s.quantity,
//                 s.unit,
//                 s.rate_per_unit,
//                 s.total_amount
//             FROM sales s
//             JOIN customers c ON s.customer_id = c.id
//             JOIN flowers f ON s.flower_id = f.id

//             UNION ALL

//             SELECT 
//                 p.date, 
//                 'PURCHASE' as type, 
//                 v.name as party_name,
//                 f.name as flower_name,
//                 p.quantity,
//                 p.unit,
//                 p.rate_per_unit,
//                 p.total_amount
//             FROM purchases p
//             JOIN vendors v ON p.vendor_id = v.id
//             JOIN flowers f ON p.flower_id = f.id

//             ORDER BY date DESC
//         `;
        
//         const result = await pool.query(query);
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server Error");
//     }
// });

// GET BALANCE SHEET (Sales + Customer Payments)
app.get('/balance-sheet', async (req, res) => {
    try {
        const query = `
            -- 1. SALES (Money Coming In / Debit to Customer)
            SELECT 
                s.date, 
                'SALE' as type, 
                c.name as party_name,
                f.name as flower_name,
                s.quantity,
                s.unit,
                s.rate_per_unit,
                s.total_amount
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN flowers f ON s.flower_id = f.id

            UNION ALL

            -- 2. PAYMENTS (Money Received / Credit to Customer)
            SELECT 
                p.date, 
                'PAYMENT' as type, 
                c.name as party_name,
                'Cash Received' as flower_name, -- Placeholder description
                0 as quantity,
                '-' as unit,
                0 as rate_per_unit,
                p.amount as total_amount
            FROM payments p
            JOIN customers c ON p.party_id = c.id
            WHERE p.party_type = 'CUSTOMER' 

            ORDER BY date DESC
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});