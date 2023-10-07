import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventBusService } from '../../../../services/event-bus/event-bus.service';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  filter,
  map,
  take,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
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
import { WebWorkerService } from '../../../../services/web-worker/web-worker.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { XlsxProcessService } from '../../services/xlsx-process/xlsx-process.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { CustomMatTableComponent } from '../custom-mat-table/custom-mat-table.component';

// TODO: refactor needed

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
    MatProgressSpinnerModule,
    ProgressSpinnerComponent,
    CustomMatTableComponent,
  ],
  templateUrl: `./xlsx-sidenav.component.html`,
  styleUrls: ['./xlsx-sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class XlsxSidenavComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  fileName$ = this.xlsxProcessService.fileName$ as Observable<string>;
  worksheetNames$ = this.xlsxProcessService.worksheetNames$ as Observable<
    string[]
  >;
  workbook$ = this.xlsxProcessService.workbook$ as Observable<any>;
  dataSource$ = this.xlsxProcessService.dataSource$ as Observable<any[]>;
  displayedDataSource$ = this.xlsxProcessService
    .displayedDataSource$ as Observable<any[]>;
  displayedColumns$ = this.xlsxProcessService.displayedColumns$ as Observable<
    string[]
  >;

  file: File | undefined;
  loading = true;
  dataColumnNameString = 'dataLayer Specs';
  form = this.fb.group({
    worksheetNames: [''],
    dataColumnName: [this.dataColumnNameString, Validators.required],
  });

  numTotalTags$ = this.xlsxProcessService.getNumTotalEvents();
  numParsedTags$ = this.xlsxProcessService.getNumParsedEvents();

  constructor(
    private eventBusService: EventBusService,
    private fb: FormBuilder,
    private webWorkerService: WebWorkerService,
    private dialog: MatDialog,
    public xlsxProcessService: XlsxProcessService
  ) {}

  ngAfterViewInit() {
    this.initEventBusListeners();
    this.isLoading().subscribe((val) => {
      console.log(val);
    });
  }

  toggleSidenav() {
    this.adjustBodyOverflow();
    this.isLoading().subscribe();
  }

  private adjustBodyOverflow() {
    if (!this.sidenav) return;
    this.sidenav.toggle();
    document.body.style.overflow = this.sidenav.opened ? 'hidden' : 'auto';
  }

  // Event bus listeners

  private initEventBusListeners() {
    this.eventBusService
      .on('toggleDrawer')
      .pipe(
        tap(async (file) => {
          this.toggleSidenav();
          await this.xlsxProcessService.loadXlsxFile(file);
        })
      )
      .subscribe();
  }

  // Event bus post messages

  switchToSelectedSheet(event: any) {
    const name = event.target.value;
    this.withWorkbookHandling(this.workbook$, 'switchSheet', name);
  }

  retrieveSpecsFromSource() {
    const name = this.form.get('dataColumnName')?.value as string;
    this.withDataHandling(this.dataSource$, 'extractSpecs', name);
  }

  previewData() {
    const name = this.form.get('dataColumnName')?.value as string;
    this.withDataHandling(this.displayedDataSource$, 'previewData', name);
  }

  onAction(action: string) {
    switch (action) {
      case 'close': {
        this.xlsxProcessService.setIsPreviewing(true);
        this.xlsxProcessService.setIsRenderingJson(false);
        this.xlsxProcessService.resetAllData();
        break;
      }
      case 'save': {
        this.retrieveSpecsFromSource();
        this.xlsxProcessService.setIsPreviewing(true);
        this.xlsxProcessService.setIsRenderingJson(false);
        this.xlsxProcessService.resetAllData();
        break;
      }

      case 'preview': {
        this.previewData();
        this.xlsxProcessService.setIsPreviewing(false);
        this.xlsxProcessService.setIsRenderingJson(true);
        break;
      }

      default: {
        break;
      }
    }
  }

  isLoading() {
    const spinningTime = 1;
    return combineLatest([
      timer(0, 500),
      this.xlsxProcessService.workbook$,
      this.xlsxProcessService.dataSource$,
      this.xlsxProcessService.displayedDataSource$,
      this.xlsxProcessService.displayedColumns$,
    ]).pipe(
      takeWhile(([timer]) => timer <= spinningTime),
      tap(
        ([
          timer,
          workbook,
          dataSource,
          displayedDataSource,
          displayedColumns,
        ]) => {
          if (
            !workbook ||
            !dataSource ||
            !displayedDataSource ||
            !displayedColumns
          ) {
            this.loading = true;
          } else if (timer === spinningTime) {
            this.loading = false;
          } else {
            this.loading = true;
          }
        }
      )
    );
  }

  // Private utilities

  private withDataHandling(
    source: Observable<any>,
    action: string,
    name: string
  ) {
    return this.commonPipeHandler(source, action, name).subscribe();
  }

  private withWorkbookHandling(
    source: Observable<any>,
    action: string,
    name: string
  ) {
    this.xlsxProcessService.setIsPreviewing(true);
    this.xlsxProcessService.setIsRenderingJson(false);
    return this.commonPipeHandler(source, action, name).subscribe();
  }

  private commonPipeHandler(
    observable: Observable<any>,
    action: string,
    name: string
  ) {
    return observable.pipe(
      take(1),
      filter((data) => !!data),
      tap((data) => this.postDataToWorker(action, data, name)),
      catchError(() => {
        this.handlePostError(name);
        return EMPTY;
      })
    );
  }

  private postDataToWorker(action: string, data: any, name: string) {
    this.webWorkerService.postMessage('message', {
      action,
      data,
      name,
    });
  }

  private handlePostError(titleName: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        message: `Failed to extract specs from the title: ${titleName}`,
      },
    });
  }
}
