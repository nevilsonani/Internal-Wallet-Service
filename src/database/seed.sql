-- Seed data for Wallet Service
-- This script initializes the database with sample data

-- Insert Asset Types
INSERT INTO asset_types (name, symbol, description, decimals) VALUES
('Gold Coins', 'GC', 'Primary gaming currency for purchases and rewards', 0),
('Diamonds', 'DIAM', 'Premium currency for exclusive items', 0),
('Loyalty Points', 'LP', 'Reward points for user engagement and referrals', 0)
ON CONFLICT (name) DO NOTHING;

-- Insert System Wallets (Treasury accounts)
INSERT INTO wallets (user_id, asset_type_id, wallet_type, balance) VALUES
('system_treasury', 1, 'SYSTEM', 1000000), -- Gold Coins Treasury
('system_treasury', 2, 'SYSTEM', 100000),  -- Diamonds Treasury
('system_treasury', 3, 'SYSTEM', 500000)   -- Loyalty Points Treasury
ON CONFLICT (user_id, asset_type_id) DO NOTHING;

-- Insert User Wallets with initial balances
INSERT INTO wallets (user_id, asset_type_id, wallet_type, balance) VALUES
('user_001', 1, 'USER', 1000),  -- User 1: 1000 Gold Coins
('user_001', 2, 'USER', 50),    -- User 1: 50 Diamonds
('user_001', 3, 'USER', 500),   -- User 1: 500 Loyalty Points
('user_002', 1, 'USER', 500),   -- User 2: 500 Gold Coins
('user_002', 2, 'USER', 25),    -- User 2: 25 Diamonds
('user_002', 3, 'USER', 250)    -- User 2: 250 Loyalty Points
ON CONFLICT (user_id, asset_type_id) DO NOTHING;

-- Sample transactions for demonstration
-- Transaction 1: User 1 receives a welcome bonus
INSERT INTO transactions (id, transaction_idempotency_key, transaction_type, reference_id, description, status, created_by, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'welcome_bonus_user_001', 'BONUS', 'welcome_001', 'Welcome bonus for new user registration', 'COMPLETED', 'system', CURRENT_TIMESTAMP)
ON CONFLICT (transaction_idempotency_key) DO NOTHING;

-- Transaction entries for welcome bonus
INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount, balance_after) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM wallets WHERE user_id = 'user_001' AND asset_type_id = 1), 'CREDIT', 500, 1500)
ON CONFLICT DO NOTHING;

-- Update wallet balance for user_001 Gold Coins after welcome bonus
UPDATE wallets SET balance = 1500 WHERE user_id = 'user_001' AND asset_type_id = 1;

-- Transaction 2: User 2 makes a purchase
INSERT INTO transactions (id, transaction_idempotency_key, transaction_type, reference_id, description, status, created_by, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'purchase_user_002', 'SPEND', 'order_12345', 'Purchase of in-game item', 'COMPLETED', 'user_002', CURRENT_TIMESTAMP)
ON CONFLICT (transaction_idempotency_key) DO NOTHING;

-- Transaction entries for purchase
INSERT INTO transaction_entries (transaction_id, wallet_id, entry_type, amount, balance_after) VALUES
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM wallets WHERE user_id = 'user_002' AND asset_type_id = 1), 'DEBIT', 100, 400)
ON CONFLICT DO NOTHING;

-- Update wallet balance for user_002 Gold Coins after purchase
UPDATE wallets SET balance = 400 WHERE user_id = 'user_002' AND asset_type_id = 1;
