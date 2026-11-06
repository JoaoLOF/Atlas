import { ipcMain } from "electron";
import db from "../../database/connection.js";
export function registerFinancialPaymentHandlers() {
    ipcMain.handle("financial-payments:create", (_event, data) => {
        if (data.paidAmount <= 0) {
            throw new Error("O valor pago deve ser maior que zero.");
        }
        if (data.interestAmount < 0) {
            throw new Error("O valor dos juros não pode ser negativo.");
        }
        if (data.discountAmount < 0) {
            throw new Error("O valor do desconto não pode ser negativo.");
        }
        if (!data.paymentDate) {
            throw new Error("A data do pagamento é obrigatória.");
        }
        if (!data.paymentMethod.trim()) {
            throw new Error("A forma de pagamento é obrigatória.");
        }
        const transaction = db.transaction(() => {
            const account = db
                .prepare(`
            SELECT
              id,
              original_amount,
              status
            FROM purchase_account
            WHERE id = @id;
          `)
                .get({
                id: data.purchaseAccountId,
            });
            if (!account) {
                throw new Error("Conta a pagar não encontrada.");
            }
            if (account.status === "CANCELLED") {
                throw new Error("Não é possível realizar pagamento de uma conta cancelada.");
            }
            const result = db
                .prepare(`
            SELECT
              COALESCE(
                SUM(
                  paid_amount
                  - interest_amount
                  + discount_amount
                ),
                0
              ) AS total_paid
            FROM financial_payments
            WHERE purchase_account_id = @purchaseAccountId;
          `)
                .get({
                purchaseAccountId: data.purchaseAccountId,
            });
            const currentTotalPaid = Number(result.total_paid);
            const paymentContribution = data.paidAmount - data.interestAmount + data.discountAmount;
            const newTotalPaid = currentTotalPaid + paymentContribution;
            const balance = Number(account.original_amount) - newTotalPaid;
            if (balance < 0) {
                throw new Error("O pagamento ultrapassa o saldo da conta.");
            }
            const payment = db
                .prepare(`
            INSERT INTO financial_payments (
              purchase_account_id,
              payment_date,
              paid_amount,
              interest_amount,
              discount_amount,
              payment_method,
              notes,
              created_by,
              created_at
            )
            VALUES (
              @purchaseAccountId,
              @paymentDate,
              @paidAmount,
              @interestAmount,
              @discountAmount,
              @paymentMethod,
              @notes,
              @createdBy,
              datetime('now')
            );
          `)
                .run({
                purchaseAccountId: data.purchaseAccountId,
                paymentDate: data.paymentDate,
                paidAmount: data.paidAmount,
                interestAmount: data.interestAmount,
                discountAmount: data.discountAmount,
                paymentMethod: data.paymentMethod.trim(),
                notes: data.notes?.trim() || null,
                createdBy: data.createdBy,
            });
            let status = "PARTIALLY_PAID";
            if (balance === 0) {
                status = "PAID";
            }
            if (newTotalPaid === 0) {
                status = "OPEN";
            }
            db.prepare(`
          UPDATE purchase_account
          SET
            status = @status,
            updated_at = datetime('now')
          WHERE id = @id;
        `).run({
                status,
                id: data.purchaseAccountId,
            });
            return {
                id: Number(payment.lastInsertRowid),
                status,
                balance,
            };
        });
        return transaction();
    });
    ipcMain.handle("financial-payments:delete", (_event, data) => {
        const transaction = db.transaction(() => {
            const payment = db
                .prepare(`
          SELECT
            id,
            purchase_account_id
          FROM financial_payments
          WHERE id = @id;
        `)
                .get({
                id: data.paymentId,
            });
            if (!payment) {
                throw new Error("Pagamento não encontrado.");
            }
            db.prepare(`
        DELETE FROM financial_payments
        WHERE id = @id;
      `).run({
                id: data.paymentId,
            });
            const account = db
                .prepare(`
          SELECT
            original_amount
          FROM purchase_account
          WHERE id = @id;
        `)
                .get({
                id: payment.purchase_account_id,
            });
            if (!account) {
                throw new Error("Conta a pagar não encontrada.");
            }
            const result = db
                .prepare(`
          SELECT
            COALESCE(
              SUM(
                paid_amount
                - interest_amount
                + discount_amount
              ),
              0
            ) AS total_paid
          FROM financial_payments
          WHERE purchase_account_id = @purchaseAccountId;
        `)
                .get({
                purchaseAccountId: payment.purchase_account_id,
            });
            const totalPaid = Number(result.total_paid);
            const balance = Number(account.original_amount) - totalPaid;
            let status = "OPEN";
            if (balance === 0) {
                status = "PAID";
            }
            else if (totalPaid > 0) {
                status = "PARTIALLY_PAID";
            }
            db.prepare(`
        UPDATE purchase_account
        SET
          status = @status,
          updated_at = datetime('now')
        WHERE id = @id;
      `).run({
                status,
                id: payment.purchase_account_id,
            });
            return {
                status,
                balance,
            };
        });
        return transaction();
    });
}
