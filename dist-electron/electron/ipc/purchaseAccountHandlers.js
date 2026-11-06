import { ipcMain } from 'electron';
import db from '../../database/connection.js';
export function registerPurchaseAccountHandlers() {
    ipcMain.handle('purchase-accounts:list', () => {
        return db
            .prepare(`
        SELECT
          purchase_account.id,
          purchase_account.supplier_id,
          suppliers.trade_name AS supplier_name,
          purchase_account.purchase_receipt_id,
          purchase_receipts.invoice_number,
          purchase_account.description,
          purchase_account.original_amount,
          purchase_account.due_date,
          purchase_account.status,
          purchase_account.created_by,
          purchase_account.created_at,
          purchase_account.updated_at
        FROM purchase_account
        INNER JOIN suppliers
          ON suppliers.id = purchase_account.supplier_id
        INNER JOIN purchase_receipts
          ON purchase_receipts.id = purchase_account.purchase_receipt_id
        ORDER BY purchase_account.due_date ASC,
                 purchase_account.id DESC;
      `)
            .all();
    });
    ipcMain.handle('purchase-accounts:get-by-id', (_event, id) => {
        const account = db
            .prepare(`
          SELECT
            purchase_account.id,
            purchase_account.supplier_id,
            suppliers.trade_name AS supplier_name,
            purchase_account.purchase_receipt_id,
            purchase_receipts.invoice_number,
            purchase_account.description,
            purchase_account.original_amount,
            purchase_account.due_date,
            purchase_account.status,
            purchase_account.created_by,
            purchase_account.created_at,
            purchase_account.updated_at
          FROM purchase_account
          INNER JOIN suppliers
            ON suppliers.id = purchase_account.supplier_id
          INNER JOIN purchase_receipts
            ON purchase_receipts.id = purchase_account.purchase_receipt_id
          WHERE purchase_account.id = @id;
        `)
            .get({ id });
        if (!account) {
            return null;
        }
        const payments = db
            .prepare(`
          SELECT
            id,
            payment_date,
            paid_amount,
            interest_amount,
            discount_amount,
            payment_method,
            notes,
            created_by,
            created_at
          FROM financial_payments
          WHERE purchase_account_id = @id
          ORDER BY payment_date DESC,
                   id DESC;
        `)
            .all({ id });
        return {
            ...account,
            payments,
        };
    });
    ipcMain.handle('purchase-accounts:create', (_event, data) => {
        if (data.originalAmount <= 0) {
            throw new Error('O valor original deve ser maior que zero.');
        }
        if (!data.dueDate) {
            throw new Error('A data de vencimento é obrigatória.');
        }
        const receipt = db
            .prepare(`
          SELECT
            id,
            supplier_id
          FROM purchase_receipts
          WHERE id = @id;
        `)
            .get({ id: data.purchaseReceiptId });
        if (!receipt) {
            throw new Error('Entrada de mercadorias não encontrada.');
        }
        if (receipt.supplier_id !== data.supplierId) {
            throw new Error('O fornecedor informado não corresponde à entrada.');
        }
        const result = db
            .prepare(`
          INSERT INTO purchase_account (
            supplier_id,
            purchase_receipt_id,
            description,
            original_amount,
            due_date,
            status,
            created_by,
            created_at,
            updated_at
          )
          VALUES (
            @supplierId,
            @purchaseReceiptId,
            @description,
            @originalAmount,
            @dueDate,
            'OPEN',
            @createdBy,
            datetime('now'),
            datetime('now')
          );
        `)
            .run(data);
        return {
            id: Number(result.lastInsertRowid),
            ...data,
            status: 'OPEN',
        };
    });
}
