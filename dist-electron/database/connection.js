import Database from 'better-sqlite3';
import path from 'node:path';
const databasePath = path.join(process.cwd(), 'database', 'atlas.db');
const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
export default db;
