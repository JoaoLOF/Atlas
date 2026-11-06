import { ipcMain } from 'electron';
import db from '../../database/connection.js';
export function registerClientHandlers() {
    ipcMain.handle('clients:list', () => {
        return db
            .prepare(`
        SELECT
          id,
          name,
          identification,
          active
        FROM clients
        ORDER BY name;
      `)
            .all();
    });
    ipcMain.handle('clients:create', (_event, data) => {
        const result = db
            .prepare(`
          INSERT INTO clients (
            name,
            identification,
            active,
            created_at,
            updated_at
          )
          VALUES (
            @name,
            @identification,
            1,
            datetime('now'),
            datetime('now')
          );
        `)
            .run(data);
        return {
            id: Number(result.lastInsertRowid),
            name: data.name,
            identification: data.identification,
            active: true,
        };
    });
    ipcMain.handle('clients:deactivate', (_event, id) => {
        const result = db
            .prepare(`
          UPDATE clients
          SET
            active = 0,
            updated_at = datetime('now')
          WHERE id = @id
            AND active = 1;
        `)
            .run({ id });
        return result.changes > 0;
    });
}
