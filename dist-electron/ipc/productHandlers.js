import { ipcMain } from "electron";
import db from "../../database/connection.js";
export function registerProductHandlers() {
    ipcMain.handle("products:list", () => {
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
}
