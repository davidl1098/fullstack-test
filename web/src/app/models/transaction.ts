export enum TransactionType { Purchase = 1, Sale = 2 }

export interface TransactionListItem {
  id: number;
  date: string;
  type: TransactionType;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  detail?: string;
}

export interface TransactionUpsertDto {
  date?: string; 
  type: TransactionType;
  productId: number;
  quantity: number;
  unitPrice: number;
  detail?: string;
}
