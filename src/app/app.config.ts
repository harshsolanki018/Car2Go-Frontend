import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL, DATA_STORE_MODE } from './core/services/app-data-store';
import { AuthService } from './core/services/auth';
import { environment } from '../environments/environment';

function initializeAuthSession(auth: AuthService): () => Promise<void> {
  return () => auth.ensureSessionLoaded();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    { provide: DATA_STORE_MODE, useValue: 'api' },
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthSession,
      deps: [AuthService],
      multi: true,
    },
  ],
};
