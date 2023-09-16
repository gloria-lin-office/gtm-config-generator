import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainPageComponent } from './components/main-page/main-page.component';

import { ProjectRetrieverService } from './services/project-retriever/project-retriever.service';
import { WebWorkerService } from './services/web-worker/web-worker.service';
import { MatDialogModule } from '@angular/material/dialog'; // for lazy loading module to work, this import must be here

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MainPageComponent,
    MatDialogModule,
  ],
  providers: [ProjectRetrieverService, WebWorkerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
