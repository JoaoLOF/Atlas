import { ipcMain } from 'electron';
import db from '../../database/connection.js';

export function registerStockMovementHandlers() {
  ipcMain.handle('stock-movements:list', () => {
    return db
      .prepare(`
        SELECT
          stock_movements.id,
          stock_movements.product_id,
          products.name AS product_name,
          stock_movements.movement_type,
          stock_movements.quantity,
          stock_movements.reference_type,
          stock_movements.reference_id,
          stock_movements.notes,
          stock_movements.created_by,
          stock_movements.created_at
        FROM stock_movements
        INNER JOIN products
          ON products.id = stock_movements.product_id
        ORDER BY stock_movements.created_at DESC,
                 stock_movements.id DESC;
      `)
      .all();
  });

  ipcMain.handle(
    'stock-movements:list-by-product',
    (_event, productId: number) => {
      return db
        .prepare(`
          SELECT
            stock_movements.id,
            stock_movements.product_id,
            products.name AS product_name,
            stock_movements.movement_type,
            stock_movements.quantity,
            stock_movements.reference_type,
            stock_movements.reference_id,
            stock_movements.notes,
            stock_movements.created_by,
            stock_movements.created_at
          FROM stock_movements
          INNER JOIN products
            ON products.id = stock_movements.product_id
          WHERE stock_movements.product_id = @productId
          ORDER BY stock_movements.created_at DESC,
                   stock_movements.id DESC;
        `)
        .all({ productId });
    },
  );
}