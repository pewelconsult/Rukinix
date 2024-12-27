import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = localStorage.getItem('user_role');

  if (userRole === 'Admin') {
    return true;
  }

  // If not admin, redirect to home page or unauthorized page
  router.navigate(['/']); // or '/unauthorized' or wherever you want
  return false;
};