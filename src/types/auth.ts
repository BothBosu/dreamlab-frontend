// src/types/auth.ts
export interface User {
  username: string;
  profilePicture?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  username: string | null;
  profilePicture?: string;
  success: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  profilePicture?: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthStore {
  login(username: string, password: string): Promise<{ success: boolean; message?: string }>;
  register(username: string, password: string, profilePicture?: string): Promise<{ success: boolean; message?: string }>;
  checkAuthStatus(): Promise<void>;
  logout(): void;
  updateProfilePicture(profilePicture: string): void;
}
