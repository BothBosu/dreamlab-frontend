// src/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username,
          password
        });

        if (response.data && response.data.username) {
          this.user = {
            username: response.data.username
          };
          this.isAuthenticated = true;

          // Store auth state in localStorage (optional)
          localStorage.setItem('user', JSON.stringify(this.user));

          return { success: true };
        } else {
          return {
            success: false,
            message: response.data.message || 'Login failed'
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Login failed'
        };
      }
    },

    async checkAuthStatus() {
      try {
        // Check if we have user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
          this.isAuthenticated = true;

          // Verify with backend
          const response = await axios.get('http://localhost:8080/api/auth/status');
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

    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('user');
    }
  }
});
