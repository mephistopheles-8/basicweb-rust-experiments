-- Your SQL goes here

CREATE TABLE gallery_tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    gallery INTEGER NOT NULL,
    tag INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gallery,tag),
    FOREIGN KEY(tag) REFERENCES tags(id),
    FOREIGN KEY(gallery) REFERENCES galleries(id)
);

CREATE TRIGGER trigger_gallery_tags_insert
AFTER INSERT On gallery_tags
BEGIN
   INSERT INTO tag_bindings (kind, item_id, tag) 
        VALUES (3,NEW.gallery,NEW.tag);
END;

CREATE TRIGGER trigger_gallery_tags_delete
AFTER DELETE On gallery_tags
BEGIN
   DELETE FROM tag_bindings 
       WHERE kind = 3 
         AND item_id = OLD.gallery 
         AND tag = OLD.tag; 
END;

CREATE TABLE gallery_item_tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    gallery_item INTEGER NOT NULL,
    tag INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gallery_item,tag),
    FOREIGN KEY(tag) REFERENCES tags(id),
    FOREIGN KEY(gallery_item) REFERENCES gallery_items(id)
);

CREATE TRIGGER trigger_gallery_item_tags_insert
AFTER INSERT On gallery_item_tags
BEGIN
   INSERT INTO tag_bindings (kind, item_id, tag) 
        VALUES (4,NEW.gallery_item,NEW.tag);
END;

CREATE TRIGGER trigger_gallery_item_tags_delete
AFTER DELETE On gallery_item_tags
BEGIN
   DELETE FROM tag_bindings 
       WHERE tag_bindings.kind = 4 
         AND tag_bindings.item_id = OLD.gallery 
         AND tag_bindings.tag = OLD.tag; 
END;
