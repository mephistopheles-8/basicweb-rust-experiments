-- Your SQL goes here

CREATE TABLE gallery_posts (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    gallery INTEGER NOT NULL,
    post INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(gallery) REFERENCES galleries(id),
    FOREIGN KEY(post) REFERENCES posts(id)
);

CREATE TRIGGER trigger_gallery_posts_update
AFTER UPDATE On gallery_posts
BEGIN
   UPDATE gallery_posts SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE gallery_item_posts (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    gallery_item INTEGER NOT NULL,
    post INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(gallery_item) REFERENCES gallery_items(id),
    FOREIGN KEY(post) REFERENCES posts(id)
);


CREATE TRIGGER trigger_gallery_item_posts_update
AFTER UPDATE On gallery_item_posts
BEGIN
   UPDATE gallery_item_posts SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
