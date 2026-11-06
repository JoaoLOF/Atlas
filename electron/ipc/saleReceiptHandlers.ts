import { ipcMain } from 'electron';
import db from '../../database/connection.js';

type SaleReceiptItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

type CreateSaleReceiptData = {
  clientId: number;
  saleDate: string;
  createdBy: number;
  items: SaleReceiptItem[];
};

export function registerSaleReceiptHandlers() {
  ipcMain.handle('sale-receipts:list', () => {
    return db
      .prepare(`
        SELECT
          sale_receipts.id,
          sale_receipts.client_id,
          clients.name AS client_name,
          sale_receipts.sale_date,
          sale_receipts.created_by,
          sale_receipts.created_at,
          sale_receipts.updated_at
        FROM sale_receipts
        INNER JOIN clients
          ON clients.id = sale_receipts.client_id
        ORDER BY sale_receipts.sale_date DESC,
                 sale_receipts.id DESC;
      `)
      .all();
  });

  ipcMain.handle(
    'sale-receipts:create',
    (_event, data: CreateSaleReceiptData) => {
      const createSaleReceipt = db.transaction(
        (saleData: CreateSaleReceiptData) => {
          const getProduct = db.prepare(`
            SELECT
              id,
              name,
              current_stock
            FROM products
            WHERE id = @productId
              AND active = 1;
          `);

          const receiptResult = db
            .prepare(`
              INSERT INTO sale_receipts (
                client_id,
                sale_date,
                created_by,
                created_at,
                updated_at
              )
              VALUES (
                @clientId,
                @saleDate,
                @createdBy,
                datetime('now'),
                datetime('now')
              );
            `)
            .run(saleData);

          const saleReceiptId = Number(
            receiptResult.lastInsertRowid,
          );

          const insertItem = db.prepare(`
            INSERT INTO sale_receipts_items (
              sale_receipt_id,
              product_id,
              quantity,
              unit_price
            )
            VALUES (
              @saleReceiptId,
              @productId,
              @quantity,
              @unitPrice
            );
          `);

          const updateStock = db.prepare(`
            UPDATE products
            SET
              current_stock = current_stock - @quantity,
              updated_at = datetime('now')
            WHERE id = @productId;
          `);

          const insertStockMovement = db.prepare(`
            INSERT INTO stock_movements (
              product_id,
              movement_type,
              quantity,
              reference_type,
              reference_id,
              notes,
              created_by,
              created_at
            )
            VALUES (
              @productId,
              'EXIT',
              @quantity,
              'SALE_RECEIPT',
              @saleReceiptId,
              @notes,
              @createdBy,
              datetime('now')
            );
          `);

          for (const item of saleData.items) {
            const product = getProduct.get({
              productId: item.productId,
            }) as
              | {
                  id: number;
                  name: string;
                  current_stock: number;
                }
              | undefined;

            if (!product) {
              throw new Error(
                `Produto ${item.productId} não encontrado.`,
              );
            }

            if (item.quantity <= 0) {
              throw new Error(
                `A quantidade do produto ${product.name} deve ser maior que zero.`,
              );
            }

            if (item.unitPrice < 0) {
              throw new Error(
                `O preço do produto ${product.name} não pode ser negativo.`,
              );
            }

            if (product.current_stock < item.quantity) {
              throw new Error(
                `Estoque insuficiente para o produto ${product.name}.`,
              );
            }

            insertItem.run({
              saleReceiptId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            });

            updateStock.run({
              productId: item.productId,
              quantity: item.quantity,
            });

            insertStockMovement.run({
              productId: item.productId,
              quantity: item.quantity,
              saleReceiptId,
              notes: `Saída de mercadoria - Venda #${saleReceiptId}`,
              createdBy: saleData.createdBy,
            });
          }

          return {
            id: saleReceiptId,
            clientId: saleData.clientId,
            saleDate: saleData.saleDate,
            createdBy: saleData.createdBy,
            items: saleData.items,
          };
        },
      );

      return createSaleReceipt(data);
    },
  );
}