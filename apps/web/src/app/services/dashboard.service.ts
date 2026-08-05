import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dashboard } from '../interfaces';
import { API_BASE_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  readonly dashboards = signal<Dashboard[]>([]);

  getAll() {
    return this.http.get<Dashboard[]>(`${API_BASE_URL}/dashboards`);
  }

  create(name: string) {
    return this.http.post<Dashboard>(`${API_BASE_URL}/dashboards`, { name });
  }

  getById(id: string) {
    return this.http.get<Dashboard>(`${API_BASE_URL}/dashboards/${id}`);
  }

  getBySlug(slug: string) {
    return this.http.get<Dashboard>(`${API_BASE_URL}/dashboards/slug/${slug}`);
  }

  update(id: string, data: Partial<Dashboard>) {
    return this.http.patch<Dashboard>(`${API_BASE_URL}/dashboards/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${API_BASE_URL}/dashboards/${id}`);
  }
}
