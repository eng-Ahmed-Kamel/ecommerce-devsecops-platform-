import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
	APP_INITIALIZER,
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart-service';

function initApp(auth: AuthService, cart: CartService): () => Promise<void> {
  return () =>
    new Promise<void>((resolve) => {
      auth.getMe().subscribe({
        next: (res) => {
          if (res?.status === 'success') {
            auth.setCurrentUser(res.user);
            // Load cart from backend only when logged in
            cart.loadFromBackend();
          }
          resolve();
        },
        error: () => resolve(),
      });
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService, CartService],
      multi: true,
    },
  ],
};
