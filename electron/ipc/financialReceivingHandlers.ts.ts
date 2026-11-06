
import { ipcMain } from 'electron';
import db from '../../database/connection.js';

export function registerFinancialReceivingHandlers() {
  ipcMain.handle(
    'financial-receivings:create',
    (
      _event,
      data: {
        saleAccountId: number;
        receivingDate: string;
        principalAmount: number;
        receivedAmount: number;
        interestAmount: number;
        discountAmount: number;
        notes: string;
        createdBy: number;
      },
    ) => {
      if (data.receivedAmount <= 0) {
        throw new Error(
          'O valor recebido deve ser maior que zero.',
        );
      }

      if (
        data.principalAmount < 0 ||
        data.interestAmount < 0 ||
        data.discountAmount < 0
      ) {
        throw new Error(
          'Os valores de principal, juros e desconto não podem ser negativos.',
        );
      }

      if (
        data.receivedAmount !==
        data.principalAmount + data.interestAmount
      ) {
        throw new Error(
          'O valor recebido deve corresponder à soma do principal com os juros.',
        );
      }

      if (!data.receivingDate) {
        throw new Error(
          'A data do recebimento é obrigatória.',
        );
      }

      const createReceiving = db.transaction(() => {
        const account = db
          .prepare(`
            SELECT
              id,
              original_amount,
              status
            FROM sale_account
            WHERE id = @saleAccountId;
          `)
          .get({ saleAccountId: data.saleAccountId }) as
          | {
              id: number;
              original_amount: number;
              status: string;
            }
          | undefined;

        if (!account) {
          throw new Error(
            'Conta a receber não encontrada.',
          );
        }

        if (account.status === 'CANCELLED') {
          throw new Error(
            'Não é possível registrar recebimentos em uma conta cancelada.',
          );
        }

        const totalReceived = db
          .prepare(`
            SELECT
              COALESCE(
                SUM(principal_amount + discount_amount),
                0
              ) AS total_received
            FROM financial_receiving
            WHERE sale_account_id = @saleAccountId;
          `)
          .get({
            saleAccountId: data.saleAccountId,
          }) as {
            total_received: number;
          };

        const newTotalReceived =
          totalReceived.total_received +
          data.principalAmount +
          data.discountAmount;

        const balance =
          account.original_amount - newTotalReceived;

        if (balance < 0) {
          throw new Error(
            'O recebimento ultrapassa o saldo da conta.',
          );
        }

        const result = db
          .prepare(`
            INSERT INTO financial_receiving (
              sale_account_id,
              receiving_date,
              principal_amount,
              received_amount,
              interest_amount,
              discount_amount,
              notes,
              created_by,
              created_at
            )
            VALUES (
              @saleAccountId,
              @receivingDate,
              @principalAmount,
              @receivedAmount,
              @interestAmount,
              @discountAmount,
              @notes,
              @createdBy,
              datetime('now')
            );
          `)
          .run(data);

        const status =
          balance === 0
            ? 'PAID'
            : newTotalReceived > 0
              ? 'PARTIALLY_PAID'
              : 'OPEN';

        db.prepare(`
          UPDATE sale_account
          SET
            status = @status,
            updated_at = datetime('now')
          WHERE id = @id;
        `).run({
          status,
          id: data.saleAccountId,
        });

        return {
          id: Number(result.lastInsertRowid),
          balance,
          status,
        };
      });

      return createReceiving();
    },
  );

  ipcMain.handle(
    'financial-receivings:delete',
    (_event, data: { receivingId: number }) => {
      const deleteReceiving = db.transaction(() => {
        const receiving = db
          .prepare(`
            SELECT
              id,
              sale_account_id
            FROM financial_receiving
            WHERE id = @receivingId;
          `)
          .get({
            receivingId: data.receivingId,
          }) as
          | {
              id: number;
              sale_account_id: number;
            }
          | undefined;

        if (!receiving) {
          throw new Error(
            'Recebimento não encontrado.',
          );
        }

        const account = db
          .prepare(`
            SELECT
              id,
              original_amount
            FROM sale_account
            WHERE id = @id;
          `)
          .get({
            id: receiving.sale_account_id,
          }) as
          | {
              id: number;
              original_amount: number;
            }
          | undefined;

        if (!account) {
          throw new Error(
            'Conta a receber não encontrada.',
          );
        }

        db.prepare(`
          DELETE FROM financial_receiving
          WHERE id = @receivingId;
        `).run({
          receivingId: data.receivingId,
        });

        const totalReceived = db
          .prepare(`
            SELECT
              COALESCE(
                SUM(principal_amount + discount_amount),
                0
              ) AS total_received
            FROM financial_receiving
            WHERE sale_account_id = @saleAccountId;
          `)
          .get({
            saleAccountId: receiving.sale_account_id,
          }) as {
            total_received: number;
          };

        const balance =
          account.original_amount -
          totalReceived.total_received;

        const status =
          balance === 0
            ? 'PAID'
            : totalReceived.total_received > 0
              ? 'PARTIALLY_PAID'
              : 'OPEN';

        db.prepare(`
          UPDATE sale_account
          SET
            status = @status,
            updated_at = datetime('now')
          WHERE id = @id;
        `).run({
          status,
          id: receiving.sale_account_id,
        });

        return {
          status,
          balance,
        };
      });

      return deleteReceiving();
    },
  );
}
