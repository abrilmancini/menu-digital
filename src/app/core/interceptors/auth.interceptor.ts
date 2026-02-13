import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Authservice } from '../services/authservice';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authservice = inject(Authservice);
  const router = inject(Router);
  const isAuthEndpoint = req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register');

  const token = authservice.getToken();
  const authReq = !isAuthEndpoint && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint) {
        authservice.clearToken();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
