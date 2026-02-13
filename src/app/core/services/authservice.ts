import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  private apiUrl = 'https://localhost:7051/api/Auth';

  constructor(private http: HttpClient) {}

  login(loginData: { email?: string; password?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }

  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registerData);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = Number(payload?.exp);
      if (!Number.isFinite(exp)) return true;
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }
}
