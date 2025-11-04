-- Таблица для предметов на маркете
CREATE TABLE IF NOT EXISTS market_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    seller_username VARCHAR(100) NOT NULL,
    is_sold BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для сообщений в чатах
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    market_item_id INTEGER NOT NULL REFERENCES market_items(id),
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_market_items_user_id ON market_items(user_id);
CREATE INDEX idx_market_items_is_sold ON market_items(is_sold);
CREATE INDEX idx_chat_messages_market_item_id ON chat_messages(market_item_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);