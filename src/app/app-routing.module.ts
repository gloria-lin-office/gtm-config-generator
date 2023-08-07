import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//TODO: after the home page is created, change the path to 'home'

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./gtm-config-generator/gtm-config-generator.module').then(
        (m) => m.GtmConfigGeneratorModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
