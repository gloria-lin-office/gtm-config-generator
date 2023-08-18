import { Component } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { FunctionalCardComponent } from '../functional-card/functional-card.component';
import { ArticleComponent } from '../article/article.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { XlsxSidenavFormComponent } from '../xlsx-sidenav-form/xlsx-sidenav-form.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    EditorComponent,
    FunctionalCardComponent,
    ArticleComponent,
    FooterComponent,
    CommonModule,
    MatSidenavModule,
    XlsxSidenavFormComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  exampleInputJson = ['Please input your JSON data or try JS object here'];
}
