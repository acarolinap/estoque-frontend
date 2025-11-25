// src/services/productService.ts
import { api } from "./api";

export async function getProducts() {
  const response = await api.get("/products"); // ou /api/products
  return response.data;
}
