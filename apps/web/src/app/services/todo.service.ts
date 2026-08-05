import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../interfaces';
import { API_BASE_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  readonly tasks = signal<Task[]>([]);

  getTasks(widgetId: string) {
    return this.http.get<Task[]>(`${API_BASE_URL}/widgets/${widgetId}/tasks`);
  }

  create(widgetId: string, text: string) {
    return this.http.post<Task>(`${API_BASE_URL}/widgets/${widgetId}/tasks`, {
      text,
    });
  }

  update(taskId: string, data: Partial<Task>) {
    return this.http.patch<Task>(`${API_BASE_URL}/tasks/${taskId}`, data);
  }

  delete(taskId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/tasks/${taskId}`);
  }

  reorder(widgetId: string, taskIds: string[]) {
    return this.http.post<void>(
      `${API_BASE_URL}/widgets/${widgetId}/tasks/reorder`,
      { taskIds }
    );
  }
}
