-- Your SQL goes here

CREATE TABLE post_tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    post INTEGER NOT NULL,
    tag INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post,tag),
    FOREIGN KEY(tag) REFERENCES tags(id),
    FOREIGN KEY(post) REFERENCES posts(id)
);

CREATE TRIGGER trigger_post_tags_insert
AFTER INSERT On post_tags
BEGIN
   INSERT INTO tag_bindings (kind, item_id, tag) 
        VALUES (2,NEW.post,NEW.tag);
END;

CREATE TRIGGER trigger_post_tags_delete
AFTER DELETE On post_tags
BEGIN
   DELETE FROM tag_bindings 
       WHERE kind = 2
         AND item_id = OLD.post
         AND tag = OLD.tag; 
END;
