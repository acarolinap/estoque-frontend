import { api, ApiResponse } from './api';
import { AuthCredentials, AuthResponse, User } from './types';

export const authService = {
  async signIn(credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data) {
      api.setToken(response.data.token);
    }
    
    return response;
  },

  async signUp(credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    
    if (response.data) {
      api.setToken(response.data.token);
    }
    
    return response;
  },

  async signOut(): Promise<void> {
    api.setToken(null);
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me');
  },

  isAuthenticated(): boolean {
    return api.getToken() !== null;
  }
};
