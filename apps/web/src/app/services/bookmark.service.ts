import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bookmark } from '../interfaces';
import { API_BASE_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private http = inject(HttpClient);

  readonly bookmarks = signal<Bookmark[]>([]);

  getBookmarks(widgetId: string) {
    return this.http.get<Bookmark[]>(
      `${API_BASE_URL}/widgets/${widgetId}/bookmarks`
    );
  }

  create(widgetId: string, data: { title: string; url: string }) {
    return this.http.post<Bookmark>(
      `${API_BASE_URL}/widgets/${widgetId}/bookmarks`,
      data
    );
  }

  update(bookmarkId: string, data: Partial<Bookmark>) {
    return this.http.patch<Bookmark>(
      `${API_BASE_URL}/bookmarks/${bookmarkId}`,
      data
    );
  }

  delete(bookmarkId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/bookmarks/${bookmarkId}`);
  }
}
