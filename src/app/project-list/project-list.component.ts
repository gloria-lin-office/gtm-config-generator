import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProjectComponent } from '../project/project.component';
import { Project } from '../interfaces/project';
import { ProjectRetrieverService } from 'src/services/project-retriever.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  imports: [CommonModule, MatGridListModule, ProjectComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectListComponent {
  projects$: Observable<Project[]> = new Observable<Project[]>();
  gridCols = 3;
  rowHeight = '210px';
  gutterSize = '25px';

  constructor(private projectRetrieverService: ProjectRetrieverService) {
    this.gridCols = this.getGridCols(window.innerWidth);
  }

  ngOnInit() {
    this.projects$ = this.projectRetrieverService.getProjects().pipe(
      map((projects) => {
        return projects;
      })
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number } }) {
    this.gridCols = this.getGridCols(event.target.innerWidth);
  }

  getGridCols(width: number) {
    const sizeTablet1 = parseInt(
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--screen-tablet1')
        .replace('px', '')
    );

    const sizeTablet3 = parseInt(
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--screen-tablet3')
        .replace('px', '')
    );
    if (width < sizeTablet1) {
      return 1;
    }
    if (width < sizeTablet3) {
      return 2;
    }
    return 3;
  }
}
