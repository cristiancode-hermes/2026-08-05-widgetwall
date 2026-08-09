import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);
  protected baseUrl = API_BASE_URL;
}
