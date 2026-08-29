-- Ensure extensions exist for secure UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reset table for a fresh test set
DROP TABLE IF EXISTS orders;

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

-- Table Creation
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
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

CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);

-- Insert 10 Fake Orders
INSERT INTO orders (id, external_order_id, customer, phone, address, status, priority, estimated_delivery_time, last_update) 
VALUES
  ('ORD-1001', 'SHOP-901', 'James Wilson', '+447700900001', '105 Fawcett Road, Southsea, PO4 0DB', 'pending', 'high', CURRENT_TIMESTAMP + INTERVAL '30 minutes', extract(epoch from now())::bigint),
  ('ORD-1002', 'SHOP-902', 'Rachel Green', '+447700900002', '38 Highland Road, Southsea, PO4 9AH', 'in_transit', 'high', CURRENT_TIMESTAMP + INTERVAL '15 minutes', extract(epoch from now())::bigint),
  ('ORD-1003', 'SHOP-903', 'Michael Brown', '+447700900003', '12 Copnor Road, Portsmouth, PO3 5BA', 'pending', 'normal', CURRENT_TIMESTAMP + INTERVAL '45 minutes', extract(epoch from now())::bigint),
  ('ORD-1004', 'SHOP-904', 'Sarah Jenkins', '+447700900004', '88 Albert Road, Southsea, PO5 2SN', 'in_transit', 'normal', CURRENT_TIMESTAMP + INTERVAL '20 minutes', extract(epoch from now())::bigint),
  ('ORD-1005', 'SHOP-905', 'David Miller', '+447700900005', '142 Commercial Road, Portsmouth, PO1 1EJ', 'delivered', 'normal',  CURRENT_TIMESTAMP - INTERVAL '10 minutes', extract(epoch from now())::bigint),
  ('ORD-1006', 'SHOP-906', 'Emma Watson', '+447700900006', '5 Waterloo Road, Portsmouth, PO1 3AE', 'pending', 'normal',  CURRENT_TIMESTAMP + INTERVAL '50 minutes', extract(epoch from now())::bigint),
  ('ORD-1007', 'SHOP-907', 'Liam Taylor', '+447700900007', '71 Palmerston Road, Southsea, PO5 3PP', 'in_transit', 'high',  CURRENT_TIMESTAMP + INTERVAL '10 minutes', extract(epoch from now())::bigint),
  ('ORD-1008', 'SHOP-908', 'Olivia Davies', '+447700900008', '29 London Road, Portsmouth, PO2 0BQ', 'delivered', 'normal',  CURRENT_TIMESTAMP - INTERVAL '25 minutes', extract(epoch from now())::bigint),
  ('ORD-1009', 'SHOP-909', 'Noah Evans', '+447700900009', '94 Elm Grove, Southsea, PO5 1HB', 'cancelled', 'normal',  CURRENT_TIMESTAMP, extract(epoch from now())::bigint),
  ('ORD-1010', 'SHOP-910', 'Sophie Smith', '+447700900010', '203 Fratton Road, Portsmouth, PO1 5HH', 'pending', 'high',  CURRENT_TIMESTAMP + INTERVAL '35 minutes', extract(epoch from now())::bigint);
