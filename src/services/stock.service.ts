import { api, ApiResponse } from './api';
import { StockMovement } from './types';

export const stockService = {
  async getAll(): Promise<ApiResponse<StockMovement[]>> {
    return api.get<StockMovement[]>('/stock-movements');
  },

  async getByProduct(productId: string): Promise<ApiResponse<StockMovement[]>> {
    return api.get<StockMovement[]>(`/stock-movements/product/${productId}`);
  },

  async create(movement: Omit<StockMovement, 'id' | 'created_at'>): Promise<ApiResponse<StockMovement>> {
    return api.post<StockMovement>('/stock-movements', movement);
  },
};
