import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const logisLogoutInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  const expiry = localStorage.getItem('token_expiry');

  if (token && expiry) {
    const tokenIssueTime = localStorage.getItem('token_issue_time');
    let hasExpired = false;

    if (tokenIssueTime) {
      const issueTime = parseInt(tokenIssueTime);
      const expiryInMillis = convertExpiryToMilliseconds(expiry);
      hasExpired = new Date().getTime() > (issueTime + expiryInMillis);
    }

    if (hasExpired) {
      // Clear storage
      localStorage.clear();
      
      // Force navigation to login
      setTimeout(() => {
        router.navigate(['/login']);
      }, 0);

      // Return error observable
      return throwError(() => new Error('Token expired'));
    }

    // Token is valid, add it to request
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(modifiedReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.clear();
          setTimeout(() => {
            router.navigate(['/login']);
          }, 0);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

function convertExpiryToMilliseconds(expiry: string): number {
  const unit = expiry.slice(-1).toLowerCase();
  const value = parseInt(expiry.slice(0, -1));
  
  switch (unit) {
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 60 * 60 * 1000;
  }
}