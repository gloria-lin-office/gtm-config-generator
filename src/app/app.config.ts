import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { SharedModule } from './shared.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // required
    provideHttpClient(), // required
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()), // if routers are used
    importProvidersFrom(SharedModule),
  ],
};
