

--  ENUM creation 
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
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    priority order_priority NOT NULL DEFAULT 'normal',
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    last_update BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



