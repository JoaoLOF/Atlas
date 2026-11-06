import fs from 'node:fs';
import path from 'node:path';
import db from './connection.js';

const migrationsPath = path.join(process.cwd(), 'database', 'migrations');

const migrationFiles = fs
  .readdirSync(migrationsPath)
  .filter((file) => file.endsWith('.sql'))
  .sort();

for (const file of migrationFiles) {
  const filePath = path.join(migrationsPath, file);
  const sql = fs.readFileSync(filePath, 'utf-8');

  db.exec(sql);

  console.log(`Migration executada: ${file}`);
}

console.log('Banco de dados atualizado com sucesso.');