import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const authGuard: CanActivateFn = () => {
  const authservice = inject(Authservice);
  const router = inject(Router);
  const isAuthenticated = authservice.isAuthenticated();

  if (!isAuthenticated) {
    authservice.clearToken();
  }

  return isAuthenticated ? true : router.createUrlTree(['/login']);
};
