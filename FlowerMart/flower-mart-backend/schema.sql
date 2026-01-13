-- 1. Reset (Be careful: this deletes old data!)
DROP TABLE IF EXISTS payments, sales, purchases, flowers, customers, vendors CASCADE;

-- 2. Create Tables
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flowers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    vendor_id INT REFERENCES vendors(id),
    flower_id INT REFERENCES flowers(id),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate_per_unit DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * rate_per_unit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    customer_id INT REFERENCES customers(id),
    flower_id INT REFERENCES flowers(id),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate_per_unit DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * rate_per_unit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    party_type VARCHAR(10) CHECK (party_type IN ('VENDOR', 'CUSTOMER')),
    party_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERT DUMMY DATA (So your app isn't empty)
INSERT INTO flowers (name) VALUES 
('Rose'), ('Jasmine'), ('Marigold'), ('Lily'), ('Orchid');

INSERT INTO vendors (name, location) VALUES 
('Abbas Sec', 'Secunderabad'), 
('Ghous Auto', 'Hyderabad'),
('Arif Decoration', 'Kurnool');

INSERT INTO customers (name, location) VALUES 
('Anwar NGM', 'Nalgonda'), 
('Babu JDCL', 'Jadcherla'),
('CASH SALE', 'Counter');