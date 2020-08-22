-- Your SQL goes here

CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    code TEXT, /* Verification code */
    pubkey TEXT UNIQUE, /* Verification url key */
    permissions INTEGER NOT NULL DEFAULT 0,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_users_update
AFTER UPDATE On users
BEGIN
   UPDATE users SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
