// src/stores/auth.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import {
  AuthState,
  LoginResponse,
  RegisterResponse,
  User
} from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
  user: null,
  isAuthenticated: false,
}),

  actions: {
  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post<LoginResponse>(
        // local
        'http://localhost:8080/api/auth/login',
        // deploy
        // 'https://dreamlab-ai.online/api/auth/login',
          { username, password }
      );

      if (response.data && response.data.username) {
    this.user = {
      username: response.data.username
    };
    this.isAuthenticated = true;

    // Store auth state in localStorage
    localStorage.setItem('user', JSON.stringify(this.user));

    return { success: true };
  } else {
    return {
      success: false,
      message: response.data.message || 'Login failed'
    };
  }
} catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
},

  async register(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post<RegisterResponse>(
        // local
        // 'http://localhost:8080/api/auth/register',
        //  deploy
        'https://dreamlab-ai.online/api/auth/register',
          { username, password }
      );

      if (response.data && response.data.success) {
    return {
      success: true,
      message: response.data.message
    };
  } else {
    return {
      success: false,
      message: response.data.message || 'Registration failed'
    };
  }
} catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
},

  async checkAuthStatus(): Promise<boolean> {
    try {
      // Check if we have user in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser) as User;
        this.isAuthenticated = true;

        // Verify with backend
        // local
        // const response = await axios.get<LoginResponse>('http://localhost:8080/api/auth/status');
        // deploy
        const response = await axios.get<LoginResponse>('https://dreamlab-ai.online/api/auth/status');
        if (response.data && response.data.username) {
          return true;
        } else {
          this.logout();
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      this.logout();
      return false;
    }
  },

    logout(): void {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('user');
  }
}
});
