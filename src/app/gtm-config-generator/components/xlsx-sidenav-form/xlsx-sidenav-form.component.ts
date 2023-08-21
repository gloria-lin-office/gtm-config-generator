import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventBusService } from '../../../services/event-bus/event-bus.service';
import { BehaviorSubject, tap } from 'rxjs';
import { ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { setInitialScrollTop } from './dom-helper';

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

  dataColumnNameString = 'dataLayer specs';
  isPreviewing = true;
  isRenderingJson = false;

  form = this.fb.group({
    worksheetNames: [''],
    dataColumnName: [this.dataColumnNameString, Validators.required],
  });

  scrollHeight$ = new BehaviorSubject<number>(0);

  constructor(
    private eventBusService: EventBusService,
    private fb: FormBuilder,
    private webWorkerService: WebWorkerService,
    private editorService: EditorService,
    private dialog: MatDialog
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
    setInitialScrollTop(this.scrollContainer);
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
            this.displayedColumns = Object.keys(this.displayedDataSource[0]);
            this.dataSource = data.jsonData;
          } else if (data.action === 'previewData') {
            console.log(data.jsonData, ' from previewData');
            const events = this.processSpecs(data.jsonData);
            const eventsData = events.map((event) => {
              return {
                spec: JSON.parse(JSON.stringify(event, null, 2)),
              };
            });
            this.isRenderingJson = true;
            this.displayedDataSource = eventsData;
            this.displayedColumns = ['spec'];
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
    let titleName;
    try {
      titleName = this.form.get('dataColumnName')?.value;
      console.log('data source: ', this.dataSource);
      this.webWorkerService.postMessage('message', {
        action: 'extractSpecs',
        data: this.dataSource,
        titleName,
      });
    } catch (error) {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: `Failed to extract specs from the title: ${titleName}`,
        },
      });
    }
  }

  processSpecs(data: DataRow[]) {
    const gtmSpecs = filterGtmSpecsFromData(data);
    console.log(gtmSpecs, ' gtmSpecs from processSpecs');
    const cleanedGtmSpecs = gtmSpecs.map((spec) => {
      try {
        return convertSpecStringToObject(spec);
      } catch (error) {
        this.dialog.open(ErrorDialogComponent, {
          data: {
            message: `Failed to parse the following spec: ${spec}`,
          },
        });
      }
    });
    return cleanedGtmSpecs.filter((spec) => spec && spec.event);
  }

  processAndSetSpecsContent(data: DataRow[]) {
    const events = this.processSpecs(data);
    console.log(events, ' from processAndSetSpecsContent');
    this.editorService.setContent('inputJson', JSON.stringify(events, null, 2));
  }

  previewData() {
    let titleName;
    try {
      titleName = this.form.get('dataColumnName')?.value;
      this.webWorkerService.postMessage('message', {
        action: 'previewData',
        data: this.displayedDataSource,
        titleName,
      });
    } catch (error) {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: `Failed to preview specs from the title: ${titleName}`,
        },
      });
    }
  }
}
