import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirigir según su estado
  if (authService.isAuthenticated()) {
    router.navigate(['/menu']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
