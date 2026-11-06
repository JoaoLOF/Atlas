import db from './connection.js';

db.prepare(`
  INSERT OR IGNORE INTO units (
    id,
    name,
    abbreviation,
    active,
    created_at,
    updated_at
  )
  VALUES (
    1,
    'Unidade',
    'UN',
    1,
    datetime('now'),
    datetime('now')
  );
`).run();

db.prepare(`
  INSERT OR IGNORE INTO product_categories (
    id,
    name,
    description,
    active,
    created_at,
    updated_at
  )
  VALUES (
    1,
    'Categoria de teste',
    'Categoria criada para testar o cadastro de produtos',
    1,
    datetime('now'),
    datetime('now')
  );
`).run();

db.prepare(`
  INSERT OR IGNORE INTO users (
    id,
    username,
    password_hash,
    role,
    active,
    created_at,
    updated_at
  )
  VALUES (
    1,
    'admin',
    'TEMPORARIO',
    'ADMIN',
    1,
    datetime('now'),
    datetime('now')
  );
`).run();

console.log('Dados iniciais criados com sucesso.');