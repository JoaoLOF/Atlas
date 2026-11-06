PRAGMA foreign_keys = ON;

CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    trade_name TEXT NOT NULL,
    tax_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY,
    trade_name TEXT NOT NULL,
    tax_id TEXT UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    internal_code TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    sale_price DECIMAL,
    current_stock DECIMAL NOT NULL DEFAULT 0,
    minimum_stock DECIMAL NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE purchase_receipts (
    id INTEGER PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    invoice_number TEXT,
    receipt_date TEXT,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id),

    UNIQUE (supplier_id, invoice_number)
);

CREATE TABLE purchase_receipts_items (
    id INTEGER PRIMARY KEY,
    purchase_receipt_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL NOT NULL,
    unit_cost DECIMAL NOT NULL,

    FOREIGN KEY (purchase_receipt_id) REFERENCES purchase_receipts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE purchase_account (
    id INTEGER PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    purchase_receipt_id INTEGER NOT NULL,
    description TEXT,
    original_amount DECIMAL NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (purchase_receipt_id) REFERENCES purchase_receipts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE financial_payments (
    id INTEGER PRIMARY KEY,
    purchase_account_id INTEGER NOT NULL,
    payment_date TEXT,
    paid_amount DECIMAL NOT NULL,
    interest_amount DECIMAL NOT NULL DEFAULT 0,
    discount_amount DECIMAL NOT NULL DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (purchase_account_id) REFERENCES purchase_account(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    action TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE inventory_adjustments (
    id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    expected_quantity DECIMAL NOT NULL,
    actual_quantity DECIMAL NOT NULL,
    difference DECIMAL NOT NULL,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE clients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    identification TEXT UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_receipts (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL,
    sale_date TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE sale_receipts_items (
    id INTEGER PRIMARY KEY,
    sale_receipt_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL NOT NULL,
    unit_price DECIMAL NOT NULL,

    FOREIGN KEY (sale_receipt_id) REFERENCES sale_receipts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE sale_account (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL,
    sale_receipt_id INTEGER NOT NULL,
    description TEXT,
    original_amount DECIMAL NOT NULL,
    issue_date TEXT,
    due_date TEXT,
    status TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (sale_receipt_id) REFERENCES sale_receipts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE financial_receiving (
    id INTEGER PRIMARY KEY,
    sale_account_id INTEGER NOT NULL,
    receiving_date TEXT NOT NULL,
    principal_amount DECIMAL NOT NULL,
    received_amount DECIMAL NOT NULL,
    interest_amount DECIMAL NOT NULL DEFAULT 0,
    discount_amount DECIMAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sale_account_id) REFERENCES sale_account(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);