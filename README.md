# Business-sales-application
Web application for businesses to logging daily stock, tracking business sales and generating bills, monthly balance sheets and reports.

# 🌸 Sri Lakshmi Flower Mart - Digital Ledger App

A full-stack web application designed to digitize the daily operations of a wholesale flower business. This system replaces manual paper ledgers with a modern digital interface to track daily stock, manage vendor/customer credits, record payments, and generate financial reports.

![App Screenshot](https://via.placeholder.com/800x400?text=App+Screenshot+Here)
*(Add your actual screenshots in the repository and update this link)*

## 🚀 Features

- **Daily Entry Dashboard:** Log daily Inward (Purchases) and Outward (Sales) stock with variable rates and units.
- **Digital Ledger:** Track outstanding balances (Credits & Debits) for all Customers and Vendors.
- **Payment Tracking:** Record cash received from customers or paid to vendors.
- **PDF Bill Generation:** Download professional transaction history bills for customers.
- **Balance Sheet:** View monthly business performance (Sales vs. Payments Received).
- **User Management:** Add new Customers and Vendors via a quick popup interface.
- **Responsive Design:** Optimized for large screens and tablets.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons, jsPDF
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Tools:** VS Code, Postman (for API testing)

---

## ⚙️ Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or use a cloud provider like Neon.tech)

### 2. Database Setup
1. Open your SQL tool (like pgAdmin, DBeaver, or VS Code SQLTools).
2. Create a new database (e.g., `flowermart`).
3. Run the following SQL commands to create the necessary tables:

```sql
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100), 
    location VARCHAR(100), 
    phone VARCHAR(20)
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100), 
    location VARCHAR(100), 
    phone VARCHAR(20)
);

CREATE TABLE flowers (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50)
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY, 
    date DATE DEFAULT CURRENT_DATE, 
    vendor_id INT, 
    flower_id INT, 
    quantity DECIMAL(10,2), 
    unit VARCHAR(20), 
    rate_per_unit DECIMAL(12,2), 
    total_amount DECIMAL(12,2)
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY, 
    date DATE DEFAULT CURRENT_DATE, 
    customer_id INT, 
    flower_id INT, 
    quantity DECIMAL(10,2), 
    unit VARCHAR(20), 
    rate_per_unit DECIMAL(12,2), 
    total_amount DECIMAL(12,2)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY, 
    date DATE, 
    party_type VARCHAR(10), 
    party_id INT, 
    amount DECIMAL(12,2), 

    transaction_type VARCHAR(10), 
    method VARCHAR(50)
);
```
## Backend - setup
Navigate to the backend folder, install dependencies, and configure the database connection.
```
cd flower-mart-backend
npm install
```
## Create a file named .env in the flower-mart-backend folder and add your database credentials:
```
# Replace user, password, and dbname with your actual local details
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/flowermart
PORT=5000
```
## Frontend Setup
Navigate to the frontend folder and install dependencies.
```
cd flower-mart-frontend
npm install
```

## ▶️ How to Run the Application
You need to run the Backend and Frontend in two separate terminals.

# Terminal 1: Start Backend
```
cd flower-mart-backend
node server.js
```
You should see: ✅ Database connected successfully
# Terminal 2: Start Frontend
```
cd flower-mart-frontend
npm run dev
```
Open the link shown (usually http://localhost:5173) in your browser.


## Future Improvements
# Authentication: Add Login/Signup for secure Admin access.
# WhatsApp Integration: Automatically send PDF bills to customers via WhatsApp.
# Analytics Dashboard: Visual charts for monthly sales and profit trends.
# Stock Inventory: Automatic tracking of current stock levels and wastage.

## 👤 Author
# Built with ❤️ by [SRAVAN SULIGE].
