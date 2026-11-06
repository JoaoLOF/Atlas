import { ipcMain } from 'electron';
import db from '../../database/connection.js';

export function registerSaleAccountHandlers() {
  ipcMain.handle('sale-accounts:list', () => {
    return db
      .prepare(`
        SELECT
          sale_account.id,
          sale_account.client_id,
          clients.name AS client_name,
          sale_account.sale_receipt_id,
          sale_account.description,
          sale_account.original_amount,
          sale_account.issue_date,
          sale_account.due_date,
          sale_account.status,
          sale_account.created_by,
          sale_account.created_at,
          sale_account.updated_at
        FROM sale_account
        INNER JOIN clients
          ON clients.id = sale_account.client_id
        INNER JOIN sale_receipts
          ON sale_receipts.id = sale_account.sale_receipt_id
        ORDER BY sale_account.due_date ASC,
                 sale_account.id DESC;
      `)
      .all();
  });

  ipcMain.handle(
    'sale-accounts:get-by-id',
    (_event, id: number) => {
      const account = db
        .prepare(`
          SELECT
            sale_account.id,
            sale_account.client_id,
            clients.name AS client_name,
            sale_account.sale_receipt_id,
            sale_account.description,
            sale_account.original_amount,
            sale_account.issue_date,
            sale_account.due_date,
            sale_account.status,
            sale_account.created_by,
            sale_account.created_at,
            sale_account.updated_at
          FROM sale_account
          INNER JOIN clients
            ON clients.id = sale_account.client_id
          INNER JOIN sale_receipts
            ON sale_receipts.id = sale_account.sale_receipt_id
          WHERE sale_account.id = @id;
        `)
        .get({ id });

      if (!account) {
        return null;
      }

      const receivings = db
        .prepare(`
          SELECT
            id,
            receiving_date,
            principal_amount,
            received_amount,
            interest_amount,
            discount_amount,
            notes,
            created_by,
            created_at
          FROM financial_receiving
          WHERE sale_account_id = @id
          ORDER BY receiving_date DESC,
                   id DESC;
        `)
        .all({ id });

      return {
        ...account,
        receivings,
      };
    },
  );

  ipcMain.handle(
    'sale-accounts:create',
    (
      _event,
      data: {
        clientId: number;
        saleReceiptId: number;
        description: string;
        originalAmount: number;
        issueDate: string;
        dueDate: string;
        createdBy: number;
      },
    ) => {
      if (data.originalAmount <= 0) {
        throw new Error(
          'O valor original deve ser maior que zero.',
        );
      }

      if (!data.issueDate) {
        throw new Error(
          'A data de emissão é obrigatória.',
        );
      }

      if (!data.dueDate) {
        throw new Error(
          'A data de vencimento é obrigatória.',
        );
      }

      const receipt = db
        .prepare(`
          SELECT
            id,
            client_id
          FROM sale_receipts
          WHERE id = @id;
        `)
        .get({ id: data.saleReceiptId }) as
        | {
            id: number;
            client_id: number;
          }
        | undefined;

      if (!receipt) {
        throw new Error(
          'Venda não encontrada.',
        );
      }

      if (receipt.client_id !== data.clientId) {
        throw new Error(
          'O cliente informado não corresponde à venda.',
        );
      }

      const result = db
        .prepare(`
          INSERT INTO sale_account (
            client_id,
            sale_receipt_id,
            description,
            original_amount,
            issue_date,
            due_date,
            status,
            created_by,
            created_at,
            updated_at
          )
          VALUES (
            @clientId,
            @saleReceiptId,
            @description,
            @originalAmount,
            @issueDate,
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
    },
  );
}
