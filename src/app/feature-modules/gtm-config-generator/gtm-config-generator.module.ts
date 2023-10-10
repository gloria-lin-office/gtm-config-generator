import { NgModule } from '@angular/core';
import { GtmConfigGeneratorRoutingModule } from './gtm-config-generator-routing.module';
import { MainPageComponent } from './components/main-page/main-page.component';
import { EditorComponent } from './components/editor/editor.component';
import { FunctionalCardComponent } from './components/functional-card/functional-card.component';
import { ArticleComponent } from './components/article/article.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ConversionSuccessDialogComponent } from './components/conversion-success-dialog/conversion-success-dialog.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { XlsxSidenavComponent } from './components/xlsx-sidenav/xlsx-sidenav.component';
import { EventBusService } from '../../services/event-bus/event-bus.service';
import { AdvancedExpansionPanelComponent } from './components/advanced-expansion-panel/advanced-expansion-panel.component';

@NgModule({
  imports: [
    GtmConfigGeneratorRoutingModule,
    MainPageComponent,
    EditorComponent,
    FunctionalCardComponent,
    ArticleComponent,
    FooterComponent,
    ErrorDialogComponent,
    ConversionSuccessDialogComponent,
    FileUploadDialogComponent,
    XlsxSidenavComponent,
    AdvancedExpansionPanelComponent,
  ],
  providers: [EventBusService],
  declarations: [],
})
export class GtmConfigGeneratorModule {}
