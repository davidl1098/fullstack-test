export interface Product {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  imageUrl?: string | null;
  price: number;
  stock: number;
  rowVersion?: string;
}
