import { ipcMain } from 'electron';
import db from '../../database/connection.js';

export function registerProductHandlers() {
  ipcMain.handle('products:list', () => {
    const products = db
      .prepare(`
        SELECT
          id,
          internal_code,
          name,
          barcode,
          sale_price,
          current_stock,
          minimum_stock,
          active
        FROM products
        ORDER BY name;
      `)
      .all();

    return products;
  });

  ipcMain.handle(
    'products:create',
    (
      _event,
      data: {
        internalCode: string;
        categoryId: number;
        unitId: number;
        name: string;
        description: string;
        barcode: string | null;
        salePrice: number;
        minimumStock: number;
      },
    ) => {
      const result = db
        .prepare(`
          INSERT INTO products (
            internal_code,
            category_id,
            unit_id,
            name,
            description,
            barcode,
            sale_price,
            current_stock,
            minimum_stock,
            active,
            created_at,
            updated_at
          )
          VALUES (
            @internalCode,
            @categoryId,
            @unitId,
            @name,
            @description,
            @barcode,
            @salePrice,
            0,
            @minimumStock,
            1,
            datetime('now'),
            datetime('now')
          );
        `)
        .run(data);

      return {
        id: result.lastInsertRowid,
        ...data,
        currentStock: 0,
        active: true,
      };
    },
  );
}