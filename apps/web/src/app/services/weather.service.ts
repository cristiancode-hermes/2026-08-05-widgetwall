import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.service';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  readonly weather = signal<WeatherData | null>(null);

  getWeather(widgetId: string, location: string, units: string) {
    return this.http.get<WeatherData>(
      `${API_BASE_URL}/widgets/${widgetId}/weather`,
      {
        params: { location, units },
      }
    );
  }
}
