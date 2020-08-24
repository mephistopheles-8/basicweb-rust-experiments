-- Your SQL goes here

CREATE TABLE user_galleries (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL,
    gallery INTEGER NOT NULL,
    permissions INTEGER NOT NULL,
    ord INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user,url),
    FOREIGN KEY(user) REFERENCES users(id),
    FOREIGN KEY(gallery) REFERENCES galleries(id)
);

CREATE TRIGGER trigger_user_galleries_update
AFTER UPDATE On user_galleries
BEGIN
   UPDATE user_galleries SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE user_gallery_items (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL,
    gallery_item INTEGER NOT NULL,
    permissions INTEGER NOT NULL,
    ord INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user,url),
    FOREIGN KEY(user) REFERENCES users(id),
    FOREIGN KEY(gallery_item) REFERENCES gallery_items(id)
);


CREATE TRIGGER trigger_user_gallery_items_update
AFTER UPDATE On user_gallery_items
BEGIN
   UPDATE user_gallery_items SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
