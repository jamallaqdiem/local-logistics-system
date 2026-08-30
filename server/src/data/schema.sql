-- Extensions for secure UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ENUM creation 
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_priority') THEN
        CREATE TYPE order_priority AS ENUM ('normal', 'high');
    END IF;
END $$;

-- 2. Sequence for internal auto-generated IDs
CREATE SEQUENCE IF NOT EXISTS orders_id_seq START WITH 1011;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Composite Unique Constraint: Name (case-insensitive) + Phone
CREATE UNIQUE INDEX IF NOT EXISTS unique_customer_name_phone 
ON customers (LOWER(name), phone);

-- Orders Table (Default sequence attached directly)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('ORD-' || nextval('orders_id_seq')),
    external_order_id VARCHAR(100),
    customer VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    priority order_priority NOT NULL DEFAULT 'normal',
    tracking_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '45 minutes'),
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    last_update BIGINT NOT NULL DEFAULT extract(epoch from now())::bigint,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add customer_id FK to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INT REFERENCES customers(id) ON DELETE SET NULL;
-- Index for instant lookup on public customer tracking pages
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
-- Index for quick lookups of orders by saved customer
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
