import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    return true; 
  } else {
    // Redirect to login page
    window.location.href = '/login'; 
    return false; 
  }
};