import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  constructor(private http: HttpClient) {}

  login(loginData: { email?: string; password?: string; Email?: string; Password?: string }): Observable<any> {
    return this.http.post<any>('https://localhost:7051/api/Auth/login', loginData);
  }

  register(registerData: any): Observable<any> {
    return this.http.post<any>('https://localhost:7051/api/Auth/register', registerData);
  }
}
