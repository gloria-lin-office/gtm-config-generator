import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarComponent } from '../bar/bar.component';
import { HeaderComponent } from '../header/header.component';
import { ProjectListComponent } from '../project-list/project-list.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  imports: [CommonModule, BarComponent, HeaderComponent, ProjectListComponent],
})
export class MainPageComponent {}
