import { api, ApiResponse } from './api';
import { Category, Size, Packaging } from './types';

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return api.get<Category[]>('/categories');
  },

  async getById(id: string): Promise<ApiResponse<Category>> {
    return api.get<Category>(`/categories/${id}`);
  },

  async create(category: Omit<Category, 'id' | 'created_at'>): Promise<ApiResponse<Category>> {
    return api.post<Category>('/categories', category);
  },

  async update(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    return api.put<Category>(`/categories/${id}`, category);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/categories/${id}`);
  },
};

export const sizeService = {
  async getAll(): Promise<ApiResponse<Size[]>> {
    return api.get<Size[]>('/sizes');
  },

  async create(size: Omit<Size, 'id' | 'created_at'>): Promise<ApiResponse<Size>> {
    return api.post<Size>('/sizes', size);
  },

  async update(id: string, size: Partial<Size>): Promise<ApiResponse<Size>> {
    return api.put<Size>(`/sizes/${id}`, size);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/sizes/${id}`);
  },
};

export const packagingService = {
  async getAll(): Promise<ApiResponse<Packaging[]>> {
    return api.get<Packaging[]>('/packagings');
  },

  async create(packaging: Omit<Packaging, 'id' | 'created_at'>): Promise<ApiResponse<Packaging>> {
    return api.post<Packaging>('/packagings', packaging);
  },

  async update(id: string, packaging: Partial<Packaging>): Promise<ApiResponse<Packaging>> {
    return api.put<Packaging>(`/packagings/${id}`, packaging);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/packagings/${id}`);
  },
};
