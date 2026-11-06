export async function createFinancialPayment(data: {
  purchaseAccountId: number;
  paymentDate: string;
  paidAmount: number;
  interestAmount: number;
  discountAmount: number;
  paymentMethod: string;
  notes: string;
  createdBy: number;
}) {
  return window.api.financialPayments.create(data);
}

export async function deleteFinancialPayment(
  paymentId: number,
) {
  return window.api.financialPayments.delete(
    paymentId,
  );
}