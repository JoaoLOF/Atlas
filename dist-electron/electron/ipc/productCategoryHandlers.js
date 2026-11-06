import { ipcMain } from 'electron';
import db from '../../database/connection.js';
export function registerProductCategoryHandlers() {
    ipcMain.handle('product-categories:list', () => {
        return db
            .prepare(`
        SELECT
          id,
          name,
          description,
          active
        FROM product_categories
        ORDER BY name;
      `)
            .all();
    });
    ipcMain.handle('product-categories:create', (_event, data) => {
        const result = db
            .prepare(`
          INSERT INTO product_categories (
            name,
            description,
            active,
            created_at,
            updated_at
          )
          VALUES (
            @name,
            @description,
            1,
            datetime('now'),
            datetime('now')
          );
        `)
            .run(data);
        return {
            id: Number(result.lastInsertRowid),
            name: data.name,
            description: data.description,
            active: true,
        };
    });
    ipcMain.handle('product-categories:deactivate', (_event, id) => {
        const result = db
            .prepare(`
          UPDATE product_categories
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
