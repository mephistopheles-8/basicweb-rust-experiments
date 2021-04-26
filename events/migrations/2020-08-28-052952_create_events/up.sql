-- Your SQL goes here

CREATE TABLE events (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    location INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    timezone TEXT NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(location) REFERENCES locations(id)
);

CREATE TRIGGER trigger_events_update
AFTER UPDATE On events
BEGIN
   UPDATE events SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

