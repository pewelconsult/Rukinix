import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const managerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
    const userRole = localStorage.getItem('user_role');
  
    if (userRole === 'Manager') {
      return true;
    }
  
    // If not admin, redirect to home page or unauthorized page
    router.navigate(['/pointofslae']); // or '/unauthorized' or wherever you want
    return false;
};
