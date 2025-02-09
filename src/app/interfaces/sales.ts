// src/app/interfaces/sales.interface.ts
export interface SaleItem {
    id: string;
    itemName: string;
    sellingPrice: number;
    quantity: number;
  }
  
  export interface Sale {
    id: string;
    items: SaleItem[];
    customerName: string;
    paymentMode: string;
    createOn: string;
    createdBy: string;
    amountPaid: number;
    change: number;
    total: number;
  }
  
  export interface ProcessedSale {
    productCode: string;
    productName: string;
    customerName: string;
    quantity: number;
    sellingPrice: number;
    totalAmount: number;
    paymentMode: string;
    date: string;
    createdBy: string;
    saleId: string;
  }