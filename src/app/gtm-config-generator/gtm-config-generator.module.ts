import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GtmConfigGeneratorRoutingModule } from './gtm-config-generator-routing.module';
import { MainPageComponent } from './components/main-page/main-page.component';
import { EditorComponent } from './components/editor/editor.component';
import { FunctionalCardComponent } from './components/functional-card/functional-card.component';
import { MeasurementIdTableComponent } from './components/measurement-id-table/measurement-id-table.component';
import { ArticleComponent } from './components/article/article.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    GtmConfigGeneratorRoutingModule,
    MainPageComponent,
    EditorComponent,
    FunctionalCardComponent,
    MeasurementIdTableComponent,
    ArticleComponent,
    FooterComponent,
  ],
  declarations: [],
})
export class GtmConfigGeneratorModule {}
