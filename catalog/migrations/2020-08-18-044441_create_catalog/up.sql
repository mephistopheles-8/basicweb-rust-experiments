-- Your SQL goes here

CREATE TABLE catalogs (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    kind INTEGER NOT NULL,
    status INTEGER NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_catalogs_update
AFTER UPDATE On catalogs
BEGIN
   UPDATE catalogs SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE products (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    catalog INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_int INTEGER NOT NULL,
    price_frac INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status INTEGER NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(catalog) REFERENCES catalogs(id)
);

CREATE TRIGGER trigger_products_update
AFTER UPDATE On products
BEGIN
   UPDATE products SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE transactions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    product INTEGER NOT NULL,
    txn_code TEXT NOT NULL,
    name TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    postal TEXT,
    email TEXT,
    phone TEXT,
    last4 TEXT,
    payment_method TEXT,
    amount_int INTEGER NOT NULL,
    amount_frac INTEGER NOT NULL,
    currency TEXT NOT NULL,
    uuid BLOB NOT NULL UNIQUE,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product) REFERENCES products(id)
);

CREATE TRIGGER trigger_transactions_update
AFTER UPDATE On transactions
BEGIN
   UPDATE transactions SET updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;


