// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');

    if (token && expiry) {
      // Check if token has expired
      if (new Date().getTime() > parseInt(expiry)) {
        // Token has expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        this.router.navigate(['/login']);
        return next.handle(request);
      }

      // Token is valid, add it to request
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}