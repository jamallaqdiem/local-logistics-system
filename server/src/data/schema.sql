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

-- Orders Table Schema
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- Internal Order ID 
    external_order_id VARCHAR(100), -- Store original shop reference if applicable
    customer VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    priority order_priority NOT NULL DEFAULT 'normal',
    tracking_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'), -- Secure URL token
    estimated_delivery_time TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '45 minutes'),
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    last_update BIGINT NOT NULL DEFAULT extract(epoch from now())::bigint,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for instant lookup on public customer tracking pages
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
