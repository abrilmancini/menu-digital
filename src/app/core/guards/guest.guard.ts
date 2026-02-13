import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const guestGuard: CanActivateFn = () => {
  const authservice = inject(Authservice);
  const router = inject(Router);
  const isAuthenticated = authservice.isAuthenticated();

  if (!isAuthenticated) {
    authservice.clearToken();
  }

  return isAuthenticated ? router.createUrlTree(['/dashboard']) : true;
};
