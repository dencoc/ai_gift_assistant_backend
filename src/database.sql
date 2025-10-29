CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    name VARCHAR(50),
    surname VARCHAR(50),
    username VARCHAR(50) UNIQUE NOT NULL,
    birthdate DATE,
    gender VARCHAR(10),
    description TEXT,
    telegram_link VARCHAR(100),
    email_confirmed BOOLEAN DEFAULT false,
    telegram_link_confirmed BOOLEAN DEFAULT false,
    telegram_chat_id BIGINT,
    telegram_username VARCHAR(100),
    telegram_init_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    chat_id INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS photo (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS importance (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    importance_id INT REFERENCES importance(id) ON DELETE SET NULL,
    recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);


CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_surname ON users(surname);

CREATE INDEX idx_chats_sender_id ON chats(sender_id);
CREATE INDEX idx_chats_recipient_id ON chats(recipient_id);
CREATE INDEX idx_chats_title ON chats(title);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

CREATE INDEX idx_photo_user_id ON photo(user_id);
CREATE INDEX idx_photo_name ON photo(name);

CREATE UNIQUE INDEX idx_importance_name ON importance(name);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_importance_id ON events(importance_id);
CREATE INDEX idx_events_recipient ON events(recipient_id);