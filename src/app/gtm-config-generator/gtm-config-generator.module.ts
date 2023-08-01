import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GtmConfigGeneratorRoutingModule } from './gtm-config-generator-routing.module';
import { MainPageComponent } from './components/main-page/main-page.component';
import { EditorComponent } from './components/editor/editor.component';
import { FunctionalCardComponent } from './components/functional-card/functional-card.component';

@NgModule({
  imports: [
    CommonModule,
    GtmConfigGeneratorRoutingModule,
    MainPageComponent,
    EditorComponent,
    FunctionalCardComponent,
  ],
  declarations: [],
})
export class GtmConfigGeneratorModule {}
