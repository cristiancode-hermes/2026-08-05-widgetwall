import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Note } from '../interfaces';
import { API_BASE_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private http = inject(HttpClient);

  readonly notes = signal<Note[]>([]);

  getNotes(widgetId: string) {
    return this.http.get<Note[]>(`${API_BASE_URL}/widgets/${widgetId}/notes`);
  }

  create(widgetId: string, content: string) {
    return this.http.post<Note>(`${API_BASE_URL}/widgets/${widgetId}/notes`, {
      content,
    });
  }

  update(noteId: string, data: Partial<Note>) {
    return this.http.patch<Note>(`${API_BASE_URL}/notes/${noteId}`, data);
  }

  delete(noteId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/notes/${noteId}`);
  }
}
