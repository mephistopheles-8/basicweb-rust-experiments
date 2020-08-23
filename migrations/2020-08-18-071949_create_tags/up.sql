-- Your SQL goes here

CREATE TABLE tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag_bindings (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    kind INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    tag INTEGER NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kind,item_id,tag),
    FOREIGN KEY(tag) REFERENCES tags(id)
);
