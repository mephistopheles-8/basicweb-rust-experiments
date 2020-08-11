-- Your SQL goes here
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password BLOB NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    code TEXT, /* Verification code */
    permissions INTEGER NOT NULL DEFAULT 0
);
