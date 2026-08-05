import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../interfaces';
import { API_BASE_URL } from './api.service';

export const TOKEN_KEY = 'widgetwall-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);

  login(usernameOrEmail: string, password: string) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
      usernameOrEmail,
      password,
    });
  }

  register(username: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
    });
  }

  getProfile() {
    return this.http.get<User>(`${API_BASE_URL}/auth/profile`);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
