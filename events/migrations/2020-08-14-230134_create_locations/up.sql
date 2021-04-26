-- Your SQL goes here

CREATE TABLE locations (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    postal TEXT,
    country TEXT,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_locations_update
AFTER UPDATE On locations
BEGIN
   UPDATE locations SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

