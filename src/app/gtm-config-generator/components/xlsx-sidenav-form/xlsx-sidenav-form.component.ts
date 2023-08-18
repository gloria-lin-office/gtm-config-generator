import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventBusService } from '../../../services/event-bus/event-bus.service';
import { BehaviorSubject, Subscription, filter, tap } from 'rxjs';
import { ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { WebWorkerService } from '../../../services/web-worker/web-worker.service';
import { EditorService } from '../../services/editor/editor.service';
import {
  convertSpecStringToObject,
  filterGtmSpecsFromData,
  filterNonEmptyData,
} from './xlsx-helper';
import { DataRow } from '../../../interfaces/gtm-cofig-generator';

@Component({
  selector: 'app-xlsx-sidenav-form',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
  ],
  templateUrl: `./xlsx-sidenav-form.component.html`,
  styleUrls: ['./xlsx-sidenav-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class XlsxSidenavFormComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  file: File | undefined;
  dataSource: any[] = [
    {
      Name: 'Bill Clinton',
      Index: 42,
    },
    {
      Name: 'GeorgeW Bush',
      Index: 43,
    },
    {
      Name: 'Barack Obama',
      Index: 44,
    },
    {
      Name: 'Donald Trump',
      Index: 45,
    },
    {
      Name: 'Joseph Biden',
      Index: 46,
    },
  ];
  displayedDataSource: any[] = [];
  displayedColumns: string[] = Object.keys(this.dataSource[0]);

  fileName$ = new BehaviorSubject<string>('');
  worksheetNames$ = new BehaviorSubject<string[]>(['']);
  workbook$ = new BehaviorSubject<any>(null);

  form = this.fb.group({
    worksheetNames: [''],
    dataColumnName: ['dataLayer specs'],
  });

  scrollHeight$ = new BehaviorSubject<number>(0);

  constructor(
    private eventBusService: EventBusService,
    private fb: FormBuilder,
    private webWorkerService: WebWorkerService,
    private editorService: EditorService,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    this.eventBusService
      .on('toggleDrawer')
      .pipe(
        tap((file) => {
          this.toggleSidenav();
          this.loadXlsxFile(file);
        })
      )
      .subscribe();
    this.setInitialScrollTop();
  }

  toggleSidenav() {
    if (!this.sidenav) return;

    this.sidenav.toggle();

    // Check if sidenav is opened or closed and adjust body overflow accordingly.
    if (this.sidenav.opened) {
      document.body.style.overflow = 'hidden'; // This will disable scrolling.
    } else {
      document.body.style.overflow = 'auto'; // This will enable scrolling back.
    }
  }

  loadXlsxFile(file: File) {
    const fileName = file.name;
    this.fileName$.next(fileName);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.webWorkerService.postMessage('message', {
        action: 'readXlsx',
        data: e.target.result,
      });
      this.processXlsxData();
    };

    reader.readAsArrayBuffer(file);
  }

  processXlsxData() {
    this.webWorkerService
      .onMessage()
      .pipe(
        tap((data) => {
          if (data.action === 'readXlsx') {
            this.workbook$.next(data.workbook);
            this.worksheetNames$.next(data.sheetNames);
            this.dataSource = data.jsonData;
            this.displayedDataSource = filterNonEmptyData(this.dataSource);
            this.displayedColumns = Object.keys(this.displayedDataSource[0]);
          } else if (data.action === 'switchSheet') {
            this.displayedDataSource = filterNonEmptyData(data.jsonData);
            console.log('this.displayedDataSource', this.displayedDataSource);
            this.displayedColumns = Object.keys(this.displayedDataSource[0]);
          } else if (data.action === 'extractSpecs') {
            this.processAndSetSpecsContent(data.jsonData);
          }
        })
      )
      .subscribe();
  }

  switchToSelectedSheet(event: any) {
    const sheetName = event.target.value;
    this.workbook$
      .pipe(
        tap((workbook) => {
          this.webWorkerService.postMessage('message', {
            action: 'switchSheet',
            workbook,
            sheetName,
          });
        })
      )
      .subscribe();
  }

  retrieveSpecsFromSource() {
    const spec = this.form.get('dataColumnName')?.value;
    this.webWorkerService.postMessage('message', {
      action: 'extractSpecs',
      data: this.dataSource,
      spec,
    });
  }

  processAndSetSpecsContent(data: DataRow[]) {
    const gtmSpecs = filterGtmSpecsFromData(data);
    const cleanedGtmSpecs = gtmSpecs.map(convertSpecStringToObject);
    const events = cleanedGtmSpecs.filter((spec) => spec && spec.event);
    this.editorService.setContent('inputJson', JSON.stringify(events, null, 2));
  }

  setInitialScrollTop() {
    const observer = new MutationObserver(() => {
      const element = this.scrollContainer.nativeElement;
      if (element.scrollHeight > 0) {
        element.scrollTop = element.scrollHeight;
        observer.disconnect(); // Disconnect after setting scrollTop
      }
    });

    observer.observe(this.scrollContainer.nativeElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }
}
