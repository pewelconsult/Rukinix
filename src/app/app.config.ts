import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { logisLogoutInterceptor } from './interceptors/logis-logout.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([logisLogoutInterceptor])), 
            provideZoneChangeDetection({ eventCoalescing: true }), 
            provideRouter(routes)
  ]
};
