-- Your SQL goes here

CREATE TABLE secret_questions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT 1
);

INSERT INTO secret_questions (id,question,active) VALUES
  (1, "Where is the city where you grew up?", 1)
, (2, "What is your mother's maiden name?", 1)
, (3, "What was the name of your elementary school?", 1)
, (4, "What is your best friend's first name?", 1)
, (5, "What is your father's middle name?", 1)
, (6, "What is your favorite food?", 1)
, (7, "In which city was your father born?", 1)
, (8, "What is your favorite quote?", 1)
, (9, "What was the name of your first pet?", 1);


CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    handle TEXT UNIQUE,
    password TEXT NOT NULL,
    secret0_question INTEGER NOT NULL,
    secret0_answer TEXT NOT NULL,
    secret1_question INTEGER NOT NULL,
    secret1_answer TEXT NOT NULL,
    secret2_question INTEGER NOT NULL,
    secret2_answer TEXT NOT NULL,
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
