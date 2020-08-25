-- Your SQL goes here

CREATE TABLE user_posts (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL,
    post INTEGER NOT NULL,
    permissions INTEGER NOT NULL,
    ord INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user,url),
    FOREIGN KEY(user) REFERENCES users(id),
    FOREIGN KEY(post) REFERENCES posts(id)
);

CREATE TRIGGER trigger_user_posts_update
AFTER UPDATE On user_posts
BEGIN
   UPDATE user_posts SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

