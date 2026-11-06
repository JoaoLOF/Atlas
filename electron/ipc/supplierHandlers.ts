import { ipcMain } from 'electron';
import db from '../../database/connection.js';

export function registerSupplierHandlers() {
  ipcMain.handle('suppliers:list', () => {
    return db
      .prepare(`
        SELECT
          id,
          trade_name,
          tax_id,
          active
        FROM suppliers
        ORDER BY trade_name;
      `)
      .all();
  });

  ipcMain.handle(
    'suppliers:create',
    (_event, data: {
      tradeName: string;
      taxId: string;
    }) => {
      const result = db
        .prepare(`
          INSERT INTO suppliers (
            trade_name,
            tax_id,
            active,
            created_at,
            updated_at
          )
          VALUES (
            @tradeName,
            @taxId,
            1,
            datetime('now'),
            datetime('now')
          );
        `)
        .run(data);

      return {
        id: Number(result.lastInsertRowid),
        trade_name: data.tradeName,
        tax_id: data.taxId,
        active: true,
      };
    },
  );

  ipcMain.handle(
    'suppliers:deactivate',
    (_event, id: number) => {
      const result = db
        .prepare(`
          UPDATE suppliers
          SET
            active = 0,
            updated_at = datetime('now')
          WHERE id = @id
            AND active = 1;
        `)
        .run({ id });

      return result.changes > 0;
    },
  );
}