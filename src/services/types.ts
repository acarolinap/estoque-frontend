export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;

  size?: string;      
  packaging?: string; 

  size_id?: number;
  packaging_id?: number;

  created_at?: string;
  products?: Product[];
}

export interface Size {
  id: string;
  name: string;
  created_at?: string;
}

export interface Packaging {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category_id: string;
  size_id?: string | null;
  packaging_id?: string | null;
  cost_price?: number;
  sale_price?: number;
  price?: number;
  current_stock?: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
  sizes?: Size;
  packagings?: Packaging;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string | null;
  date: string;
  movement_type?: string;
  created_at?: string;
  products?: Product;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
