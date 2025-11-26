import { api, ApiResponse } from './api';
import { Product } from './types';

export const productService = {
  async getAll(): Promise<ApiResponse<Product[]>> {
    return api.get<Product[]>('/products');
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    return api.get<Product>(`/products/${id}`);
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Product>> {
    return api.post<Product>('/products', product);
  },

  async update(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return api.put<Product>(`/products/${id}`, product);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/products/${id}`);
  },
};
