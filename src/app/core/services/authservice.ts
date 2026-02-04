import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  constructor(private http: HttpClient) {}

  login(loginData: { email: string; password: string }): Observable<any> {
    // Replace '/api/login' with your actual login endpoint
    return this.http.post<any>('/api/login', loginData);
  }
}
