import { ipcMain } from "electron";
import db from "../../database/connection.js";

type PurchaseReceiptItem = {
  productId: number;
  quantity: number;
  unitCost: number;
};

type CreatePurchaseReceiptData = {
  supplierId: number;
  invoiceNumber: string;
  receiptDate: string;
  notes: string;
  createdBy: number;
  items: PurchaseReceiptItem[];
};

export function registerPurchaseReceiptHandlers() {
  ipcMain.handle("purchase-receipts:list", () => {
    return db
      .prepare(
        `
        SELECT
          purchase_receipts.id,
          purchase_receipts.supplier_id,
          suppliers.trade_name AS supplier_name,
          purchase_receipts.invoice_number,
          purchase_receipts.receipt_date,
          purchase_receipts.notes,
          purchase_receipts.created_by,
          purchase_receipts.created_at,
          purchase_receipts.updated_at
        FROM purchase_receipts
        INNER JOIN suppliers
          ON suppliers.id = purchase_receipts.supplier_id
        ORDER BY purchase_receipts.receipt_date DESC,
                 purchase_receipts.id DESC;
      `,
      )
      .all();
  });

  ipcMain.handle("purchase-receipts:get-by-id", (_event, id: number) => {
    const receipt = db
      .prepare(
        `
        SELECT
          purchase_receipts.id,
          purchase_receipts.supplier_id,
          suppliers.trade_name AS supplier_name,
          purchase_receipts.invoice_number,
          purchase_receipts.receipt_date,
          purchase_receipts.notes,
          purchase_receipts.created_by,
          purchase_receipts.created_at,
          purchase_receipts.updated_at
        FROM purchase_receipts
        INNER JOIN suppliers
          ON suppliers.id = purchase_receipts.supplier_id
        WHERE purchase_receipts.id = @id;
      `,
      )
      .get({ id });

    if (!receipt) {
      return null;
    }

    const items = db
      .prepare(
        `
        SELECT
          purchase_receipts_items.id,
          purchase_receipts_items.product_id,
          products.name AS product_name,
          purchase_receipts_items.quantity,
          purchase_receipts_items.unit_cost,
          (
            purchase_receipts_items.quantity *
            purchase_receipts_items.unit_cost
          ) AS total
        FROM purchase_receipts_items
        INNER JOIN products
          ON products.id = purchase_receipts_items.product_id
        WHERE purchase_receipts_items.purchase_receipt_id = @id
        ORDER BY purchase_receipts_items.id;
      `,
      )
      .all({ id });

    return {
      ...receipt,
      items,
    };
  });

  ipcMain.handle(
    "purchase-receipts:create",
    (_event, data: CreatePurchaseReceiptData) => {
      const createPurchaseReceipt = db.transaction(
        (receiptData: CreatePurchaseReceiptData) => {
          const receiptResult = db
            .prepare(
              `
              INSERT INTO purchase_receipts (
                supplier_id,
                invoice_number,
                receipt_date,
                notes,
                created_by,
                created_at,
                updated_at
              )
              VALUES (
                @supplierId,
                @invoiceNumber,
                @receiptDate,
                @notes,
                @createdBy,
                datetime('now'),
                datetime('now')
              );
            `,
            )
            .run(receiptData);

          const purchaseReceiptId = Number(receiptResult.lastInsertRowid);

          const insertItem = db.prepare(`
            INSERT INTO purchase_receipts_items (
              purchase_receipt_id,
              product_id,
              quantity,
              unit_cost
            )
            VALUES (
              @purchaseReceiptId,
              @productId,
              @quantity,
              @unitCost
            );
          `);

          const updateStock = db.prepare(`
            UPDATE products
            SET
              current_stock = current_stock + @quantity,
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
              'ENTRY',
              @quantity,
              'PURCHASE_RECEIPT',
              @purchaseReceiptId,
              @notes,
              @createdBy,
              datetime('now')
            );
          `);

          for (const item of receiptData.items) {
            insertItem.run({
              purchaseReceiptId,
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            });

            updateStock.run({
              productId: item.productId,
              quantity: item.quantity,
            });

            insertStockMovement.run({
              productId: item.productId,
              quantity: item.quantity,
              purchaseReceiptId,
              notes: `Entrada de mercadoria - NF ${receiptData.invoiceNumber}`,
              createdBy: receiptData.createdBy,
            });
          }

          return {
            id: purchaseReceiptId,
            supplierId: receiptData.supplierId,
            invoiceNumber: receiptData.invoiceNumber,
            receiptDate: receiptData.receiptDate,
            notes: receiptData.notes,
            createdBy: receiptData.createdBy,
            items: receiptData.items,
          };
        },
      );

      return createPurchaseReceipt(data);
    },
  );
}
