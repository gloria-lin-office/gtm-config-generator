import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import(
        './feature-modules/gtm-config-generator/gtm-config-generator.module'
      ).then((m) => m.GtmConfigGeneratorModule),
  },
];
