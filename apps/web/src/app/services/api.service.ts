import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const API_BASE_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);
  protected baseUrl = API_BASE_URL;
}
