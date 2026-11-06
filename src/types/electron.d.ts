export {};

declare global {
  interface Window {
    api: {
      test: () => Promise<string>;

      products: {
        list: () => Promise<
          {
            id: number;
            internal_code: string;
            name: string;
            barcode: string | null;
            sale_price: number;
            current_stock: number;
            minimum_stock: number;
            active: boolean;
          }[]
        >;

        create: (data: {
          internalCode: string;
          categoryId: number;
          unitId: number;
          name: string;
          description: string;
          barcode: string | null;
          salePrice: number;
          minimumStock: number;
        }) => Promise<{
          id: number | bigint;
          internalCode: string;
          categoryId: number;
          unitId: number;
          name: string;
          description: string;
          barcode: string | null;
          salePrice: number;
          currentStock: number;
          minimumStock: number;
          active: boolean;
        }>;
      };

      productCategories: {
        list: () => Promise<
          {
            id: number;
            name: string;
            description: string;
            active: boolean;
          }[]
        >;

        create: (data: { name: string; description: string }) => Promise<{
          id: number;
          name: string;
          description: string;
          active: boolean;
        }>;

        deactivate: (id: number) => Promise<boolean>;
      };

      units: {
        list: () => Promise<
          {
            id: number;
            name: string;
            abbreviation: string;
            active: boolean;
          }[]
        >;

        create: (data: { name: string; abbreviation: string }) => Promise<{
          id: number;
          name: string;
          abbreviation: string;
          active: boolean;
        }>;

        deactivate: (id: number) => Promise<boolean>;
      };

      suppliers: {
        list: () => Promise<
          Array<{
            id: number;
            trade_name: string;
            tax_id: string;
            active: boolean;
          }>
        >;

        create: (data: { tradeName: string; taxId: string }) => Promise<{
          id: number;
          trade_name: string;
          tax_id: string;
          active: boolean;
        }>;

        deactivate: (id: number) => Promise<boolean>;
      };

      purchaseReceipts: {
        list: () => Promise<
          {
            id: number;
            supplier_id: number;
            supplier_name: string;
            invoice_number: string;
            receipt_date: string;
            notes: string;
            created_by: number;
            created_at: string;
            updated_at: string;
          }[]
        >;

        create: (data: {
          supplierId: number;
          invoiceNumber: string;
          receiptDate: string;
          notes: string;
          createdBy: number;
          items: {
            productId: number;
            quantity: number;
            unitCost: number;
          }[];
        }) => Promise<{
          id: number;
          supplierId: number;
          invoiceNumber: string;
          receiptDate: string;
          notes: string;
          createdBy: number;
          items: {
            productId: number;
            quantity: number;
            unitCost: number;
          }[];
        }>;

        getById: (id: number) => Promise<{
          id: number;
          supplier_id: number;
          supplier_name: string;
          invoice_number: string;
          receipt_date: string;
          notes: string;
          created_by: number;
          created_at: string;
          updated_at: string;
          items: {
            id: number;
            product_id: number;
            product_name: string;
            quantity: number;
            unit_cost: number;
            total: number;
          }[];
        } | null>;
      };

      stockMovements: {
        list: () => Promise<
          {
            id: number;
            product_id: number;
            product_name: string;
            movement_type: string;
            quantity: number;
            reference_type: string | null;
            reference_id: number | null;
            notes: string | null;
            created_by: number;
            created_at: string;
          }[]
        >;

        listByProduct: (productId: number) => Promise<
          {
            id: number;
            product_id: number;
            product_name: string;
            movement_type: string;
            quantity: number;
            reference_type: string | null;
            reference_id: number | null;
            notes: string | null;
            created_by: number;
            created_at: string;
          }[]
        >;
      };

      clients: {
        list: () => Promise<
          {
            id: number;
            name: string;
            identification: string;
            active: boolean;
          }[]
        >;

        create: (data: { name: string; identification: string }) => Promise<{
          id: number;
          name: string;
          identification: string;
          active: boolean;
        }>;

        deactivate: (id: number) => Promise<boolean>;
      };

      saleReceipts: {
        list: () => Promise<
          {
            id: number;
            client_id: number;
            client_name: string;
            sale_date: string;
            created_by: number;
            created_at: string;
            updated_at: string;
          }[]
        >;

        create: (data: {
          clientId: number;
          saleDate: string;
          createdBy: number;
          items: {
            productId: number;
            quantity: number;
            unitPrice: number;
          }[];
        }) => Promise<{
          id: number;
          clientId: number;
          saleDate: string;
          createdBy: number;
          items: {
            productId: number;
            quantity: number;
            unitPrice: number;
          }[];
        }>;
      };

      purchaseAccounts: {
        list: () => Promise<any[]>;

        getById: (id: number) => Promise<any>;

        create: (data: {
          supplierId: number;
          purchaseReceiptId: number;
          description: string;
          originalAmount: number;
          dueDate: string;
          createdBy: number;
        }) => Promise<any>;
      };

      financialPayments: {
        create: (data: {
          purchaseAccountId: number;
          paymentDate: string;
          paidAmount: number;
          interestAmount: number;
          discountAmount: number;
          paymentMethod: string;
          notes: string;
          createdBy: number;
        }) => Promise<{
          id: number;
          status: string;
          balance: number;
        }>;

        delete: (paymentId: number) => Promise<{
          status: string;
          balance: number;
        }>;
      };
    };
  }
}
