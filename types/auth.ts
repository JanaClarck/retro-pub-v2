export type UserRole = 'admin' | 'user';

export interface AdminUser {
  uid: string;
  email: string | null;
  role: 'admin';
}

export interface AdminCheckResponse {
  isAdmin: boolean;
  user: AdminUser | null;
}

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
} 