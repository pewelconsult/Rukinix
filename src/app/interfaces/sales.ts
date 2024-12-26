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
  }
  
  export interface ProcessedSale {
    productCode: string;
    productName: string;
    customerName: string;
    quantity: number;
    totalAmount: number;
    paymentMode: string;
    date: string;
  }