import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WidgetInstance } from '../interfaces';
import { API_BASE_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private http = inject(HttpClient);

  readonly widgets = signal<WidgetInstance[]>([]);

  getWidgets(dashboardId: string) {
    return this.http.get<WidgetInstance[]>(
      `${API_BASE_URL}/dashboards/${dashboardId}/widgets`
    );
  }

  create(
    dashboardId: string,
    data: { type: string; title?: string; size: string; config?: any }
  ) {
    return this.http.post<WidgetInstance>(
      `${API_BASE_URL}/dashboards/${dashboardId}/widgets`,
      data
    );
  }

  update(widgetId: string, data: Partial<WidgetInstance>) {
    return this.http.patch<WidgetInstance>(
      `${API_BASE_URL}/widgets/${widgetId}`,
      data
    );
  }

  delete(widgetId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/widgets/${widgetId}`);
  }

  reorder(dashboardId: string, widgetIds: string[]) {
    return this.http.post<void>(
      `${API_BASE_URL}/dashboards/${dashboardId}/widgets/reorder`,
      { widgetIds }
    );
  }
}
