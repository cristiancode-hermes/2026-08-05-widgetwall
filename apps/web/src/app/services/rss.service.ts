import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.service';

export interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

export interface RssFeedData {
  feedTitle: string;
  items: RssFeedItem[];
}

@Injectable({ providedIn: 'root' })
export class RssService {
  private http = inject(HttpClient);

  readonly feed = signal<RssFeedData | null>(null);

  getFeed(widgetId: string, feedUrl: string, maxItems: number) {
    return this.http.get<RssFeedData>(
      `${API_BASE_URL}/widgets/${widgetId}/rss`,
      {
        params: { feedUrl, maxItems: String(maxItems) },
      }
    );
  }
}
